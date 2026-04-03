import { auth, db, serverTimestamp } from './firebase-config.js';
import { 
    collection, 
    addDoc, 
    query, 
    where, 
    getDocs,
    getDoc,
    doc,        
    updateDoc,
    deleteDoc
} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";
let idCampanhaAberta = null;
let idFicha = null
function gerarCodigoCampanha() {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
}
async function criarCampanha() {
    const user = auth.currentUser;
    if (!user) {
        alert("Você precisa estar logado!");
        return;
    }

    const nomeInput = document.getElementById('nome-campanha');
    const descInput = document.getElementById('desc-campanha');

    if (!nomeInput || !nomeInput.value.trim()) {
        alert("A campanha precisa de um nome!");
        return;
    }

    try {
        const codigo = gerarCodigoCampanha();
        const novaCampanha = {
            nome: nomeInput.value.trim(),
            descricao: descInput ? descInput.value.trim() : "",
            mestreId: user.uid,
            mestreNome: user.displayName,
            codigo: codigo,
            jogadores: [], 
            criadoEm: serverTimestamp()
        };

        await addDoc(collection(db, "campanhas"), novaCampanha);
        
        alert(`Campanha "${novaCampanha.nome}" criada com sucesso!`);
        
        // Limpa os campos
        nomeInput.value = "";
        if(descInput) descInput.value = "";

        setTimeout(() => {
            window.location.href = "Campanhas.html";
            carregarCampanhas(); 
        }, 250);
        
    } catch (error) {
        console.error("Erro ao criar campanha:", error);
        alert("Erro ao criar: " + error.message);
    }
}
document.addEventListener('DOMContentLoaded', () => {
    const btn = document.getElementById('btn-confirmar-campanha');
    if (btn) {
        btn.onclick = criarCampanha; 
    }
});
const btnDireto = document.getElementById('btn-confirmar-campanha');
if (btnDireto) {
    btnDireto.onclick = criarCampanha;
}
window.criarCampanha = criarCampanha;
async function carregarCampanhas() {
    const user = auth.currentUser;
    if (!user) return;

    const listaContainer = document.querySelector('.lista-campanhas');
    if (!listaContainer) return;

    // 1. Mensagem de carregamento
    listaContainer.innerHTML = '<p>Buscando suas jornadas no Outro Lado...</p>';

    try {
        // 2. Busca campanhas onde o usuário logado é o Mestre
        const q = query(
            collection(db, "campanhas"), 
            where("mestreId", "==", user.uid)
        );

        const querySnapshot = await getDocs(q);
        listaContainer.innerHTML = ''; 

        // 3. Verificação de lista vazia
        if (querySnapshot.empty) {
            listaContainer.innerHTML = '<p>Você ainda não mestreia nenhuma campanha.</p>';
            return;
        }

        // 4. Renderização dos cards
        querySnapshot.forEach((docSnap) => {
            const data = docSnap.data();
            const idDoc = docSnap.id;
            
            const card = document.createElement('div');
            card.className = 'classe-card'; // Usa a mesma classe CSS dos personagens para manter o padrão
            card.style.cursor = 'pointer';
            
            // Exibe Nome, Código de Convite e Quantidade de Jogadores
            card.innerHTML = `
                <h3>${data.nome}</h3>
                <p>Código: <strong style="color: #ff4444;">${data.codigo}</strong></p>
                <p style="font-size: 0.9em; color: #ccc;">
                    ${data.jogadores ? data.jogadores.length : 0} Jogadores conectados
                </p>
            `;

            // EVENTO DE CLIQUE PARA GERENCIAR A CAMPANHA
            card.addEventListener('click', () => {
                // Aqui chamaremos a função para abrir o painel do mestre
                if (typeof window.abrirPainelMestre === 'function') {
                    window.abrirPainelMestre(idDoc, data);
                } else {
                    alert(`Gerenciar Campanha: ${data.nome}\nCódigo: ${data.codigo}`);
                }
            });

            listaContainer.appendChild(card);
        });
    } catch (error) {
        console.error("Erro ao carregar campanhas:", error);
        listaContainer.innerHTML = '<p>Erro ao carregar campanhas. Verifique sua conexão.</p>';
    }
}
window.carregarCampanhas = carregarCampanhas;
window.abrirPainelMestre = async function(id, dados) {
    if (!window.location.pathname.includes("Visualizar-campanha.html")) {
        console.log("Redirecionando para visualização...");
        localStorage.setItem('idCampanhaSelecionada', id);
        // Opcional: Salvar os dados temporariamente para carregar instantaneamente
        localStorage.setItem('dadosFichaTemporarios', JSON.stringify(dados));
        window.location.href = "Visualizar-campanha.html";
        return; // Para a execução aqui para não dar erro de "elemento não encontrado"
    }
    console.log("Visualizando campanha:", dados.nome);
    idCampanhaAberta = id;

    // 2. Preenchimento dos Campos (A lógica que você queria)
    document.getElementById('view-campanha-nome').innerText = dados.nome || "Missão Sem Nome";
    document.getElementById('view-campanha-desc').innerText = dados.descricao || "Sem descrição disponível.";
    document.getElementById('view-campanha-codigo').innerText = dados.codigo || "------";

    // 3. Configurar o botão de excluir para esta campanha específica
    const btnExcluir = document.getElementById('btn-excluir-campanha-real');
    if (btnExcluir) {
        btnExcluir.onclick = () => deletarCampanha(id);
    }

    // 4. Limpar e carregar a lista de jogadores/personagens
    const listaJogadores = document.getElementById('lista-jogadores-campanha');
    if (!listaJogadores) return;

    listaJogadores.innerHTML = "<p class='loading'>Sincronizando com o Outro Lado...</p>";

    if (dados.jogadores && dados.jogadores.length > 0) {
        let cardsHTML = "";

        for (const jogador of dados.jogadores) {
            try {
                const pSnap = await getDoc(doc(db, "personagens", jogador.personagemId));
                
                if (pSnap.exists()) {
                    const p = pSnap.data();
                    const atributos = p.atributos || {};
                    const status = p.status || {};
                    const deslocamento = p.deslocamento || {};
                    const defesa = p.defesa || {};

                    window.dadosJogadoresTemp = window.dadosJogadoresTemp || {};
                    window.dadosJogadoresTemp[jogador.personagemId] = p; ;

                    const usaPD = p.regras?.semSanidade === true;
                    let barrasHTML = "";
                    if (usaPD) {
                        // Layout para Sobrevivente (Apenas Vida e PD)
                        barrasHTML = `
                            <div class="barra-container">
                                <span>VIDA:</span>
                                <small> ${status.pvAtual ?? 0} / ${status.pvMax ?? 0}</small>
                                <div class="barra-bg"><div class="barra-fill" id="barra-pv" style="width: ${(status.pvAtual/status.pvMax)*100}%"></div></div>
                            </div>
                            <div class="barra-container">
                                <span>DETERMINAÇÃO: </span>
                                <small>${status.pdAtual ?? 0} / ${status.pdMax ?? 0}</small>
                                <div class="barra-bg"><div class="barra-fill" id="barra-pd" style="width: ${(status.pdAtual/status.pdMax)*100}%"></div></div>
                            </div>
                        `;
                    } else {
                        // Layout Normal (Vida, Sanidade, PE)
                        barrasHTML = `
                            <div class="barra-container">
                                <span>VIDA:</span>
                                <small> ${status.pvAtual ?? 0} / ${status.pvMax ?? 0}</small>
                                <div class="barra-bg"><div class="barra-fill" id="barra-pv" style="width: ${(status.pvAtual/status.pvMax)*100}%"></div></div>
                            </div>
                            <div class="barra-container">
                                <span>SANIDADE:</span>
                                <small>${status.sanAtual ?? 0} / ${status.sanMax ?? 0}</small>
                                <div class="barra-bg"><div class="barra-fill" id="barra-san" style="width: ${(status.sanAtual/status.sanMax)*100}%"></div></div>
                            </div>
                            <div class="barra-container">
                                <span>ESFORÇO:</span>
                                <small>${status.peAtual ?? 0} / ${status.peMax ?? 0}</small>
                                <div class="barra-bg"><div class="barra-fill" id="barra-pe" style="width: ${(status.peAtual/status.peMax)*100}%"></div></div>
                            </div>
                        `;
                    }

                    // Montando o Card com todos os dados que você pediu
                    cardsHTML += `
                        <div class="card-agente-mestre">
                            <div class="card-header">
                                ${p.foto ? `<img src="${p.foto}" class="foto-agente">` : ""}
                                <div class="info-principal">
                                    <h4>${p.nome || "Agente Sem Nome"}</h4>
                                    <p>${p.classe || "Classe"} ${p.trilha ? '- ' + p.trilha : ''}</p>
                                    <span>${p.origem || "Origem"} | NEX: ${p.nex || 0}%</span>
                                </div>
                            </div>

                            <div class="stats-grid">
                                <div class="stat"><b>AGI</b> <span>${atributos.AGI || 0}</span></div>
                                <div class="stat"><b>FOR</b> <span>${atributos.FOR || 0}</span></div>
                                <div class="stat"><b>INT</b> <span>${atributos.INT || 0}</span></div>
                                <div class="stat"><b>PRE</b> <span>${atributos.PRE || 0}</span></div>
                                <div class="stat"><b>VIG</b> <span>${atributos.VIG || 0}</span></div>
                            </div>

                            <div class="barras-vitais">
                                ${barrasHTML}
                            </div>

                            <div class="detalhes-combate">
                                <span><b>PE/TURNO:</b> ${p.peTurno || 1}</span>
                                <span><b>DESL:</b> ${deslocamento.metros || 9}m / ${deslocamento.grid || 6}q</span>
                                <span><b>DEFESA:</b> ${defesa.total || 10}</span>
                                <span><b>ESQUIVA:</b> ${defesa.esquiva || 10}</span>
                            </div>

                            <button class="btn-abrir-ficha" onclick="window.abrirFichaPeloMestre('${jogador.personagemId}')">
                                📄 Abrir Ficha
                            </button>
                        </div>
                    `;
                }
            } catch (err) {
                console.error("Erro ao carregar agente:", err);
            }
        }
        listaJogadores.innerHTML = cardsHTML;
    } else {
        listaJogadores.innerHTML = "<p>Nenhum agente na área.</p>";
    }
};
window.abrirFichaPeloMestre = function(id) {
    // 1. Recupera os dados que salvamos temporariamente
    const dados = window.dadosJogadoresTemp ? window.dadosJogadoresTemp[id] : null;

    if (!dados) {
        console.error("Dados da ficha não encontrados no cache temporal.");
        alert("Erro ao recuperar dados do agente.");
        return;
    }

    // 2. Define o ID global para o sistema de salvamento
    idFicha = id; 
    window.idFichaAberta = id; 

    // 3. Chama a função que você expôs no Passo 1
    if (typeof window.abrirFichaCompleta === 'function') {
        window.abrirFichaCompleta(id, dados);
    } else {
        console.error("A função abrirFichaCompleta ainda não está acessível no window.");
        alert("Erro: O sistema de fichas ainda não foi carregado totalmente.");
    }

    // 4. Troca para a tela da Ficha (ajuste o ID 'Tela-Ficha' para o seu real)
    // Salva o ID do personagem no localStorage (o mesmo que a ficha usa)
    localStorage.setItem('idFichaSelecionada', personagemId);
    // Redireciona para a página de visualização de ficha
    window.location.href = "Visualizar_ficha.html";
};
const btnExcluir = document.querySelector('.btn-excluir-campanha');
if (btnExcluir) {
    btnExcluir.addEventListener('click', async () => {
        // 1. Verificação de segurança
        if (!idCampanhaAberta) {
            alert("Erro: Nenhuma campanha selecionada para exclusão.");
            return;
        }

        const confirmacao = confirm("⚠️ TEM CERTEZA? Isso excluirá a campanha permanentemente e não pode ser desfeito!");

        if (confirmacao) {
            try {
                // 2. Referência do documento no Firebase
                const campanhaRef = doc(db, "campanhas", idCampanhaAberta);

                // 3. Deleta o documento
                await deleteDoc(campanhaRef);

                alert("Campanha eliminada dos registros.");

                // 4. Volta para a tela de seleção de personagens
                voltarParaLista();

            } catch (error) {
                console.error("Erro ao excluir campanha:", error);
                alert("Erro ao excluir: " + error.message);
            }
        }
    });
}
function voltarParaLista() {
    // Esconde a tela de visualização
    document.getElementById('Visualizar_Campanha').classList.add('oculta');
    document.getElementById('Visualizar_Campanha').classList.remove('ativa');

    // Mostra a tela de seleção/lista (ajuste o ID conforme seu HTML)
    const telaLista = document.getElementById('Campanhas')
    if (telaLista) {
        telaLista.classList.remove('oculta');
        telaLista.classList.add('ativa');
    }
    if (typeof carregarCampanhas === 'function') {
        carregarCampanhas();
    }
}
window.entrarNaCampanha = async function() {
    const user = auth.currentUser;
    const codigoInput = document.getElementById('codigo-entrada');
    const codigo = codigoInput.value.trim().toUpperCase();

    if (!user) return alert("Faz login para entrar numa campanha!");
    if (codigo.length !== 6) return alert("O código deve ter 6 caracteres.");

    try {
        // 1. Procura a campanha com este código
        const q = query(collection(db, "campanhas"), where("codigo", "==", codigo));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            return alert("Nenhuma campanha encontrada com este código.");
        }

        const docCampanha = querySnapshot.docs[0];
        const dadosCampanha = docCampanha.data();

        // 2. Verifica se o utilizador já está na campanha
        if (dadosCampanha.jogadores.includes(user.uid)) {
            return alert("Já estás nesta campanha!");
        }

        // 3. Adiciona o utilizador à lista de jogadores
        const novosJogadores = [...dadosCampanha.jogadores, user.uid];
        await updateDoc(doc(db, "campanhas", docCampanha.id), {
            jogadores: novosJogadores
        });

        alert(`Entraste na campanha: ${dadosCampanha.nome}!`);
        codigoInput.value = "";
        
        // Opcional: Redirecionar para uma tela de "Minhas Campanhas como Jogador"
        carregarCampanhasParticipando(); 

    } catch (error) {
        console.error("Erro ao entrar na campanha:", error);
        alert("Erro ao entrar: " + error.message);
    }
};
async function carregarCampanhasParticipando() {
    const user = auth.currentUser;
    if (!user) return;

    const listaParticipando = document.querySelector('.lista-campanhas-participando');
    if (!listaParticipando) return;

    listaParticipando.innerHTML = '<p>Buscando missões...</p>';

    try {
        // Buscamos todas as campanhas (ou você pode limitar a busca se tiver muitas)
        const q = query(collection(db, "campanhas"));
        const querySnapshot = await getDocs(q);
        
        listaParticipando.innerHTML = ''; 

        let encontrouAlguma = false;

        querySnapshot.forEach((docSnap) => {
            const data = docSnap.data();
            
            // VERIFICAÇÃO: O usuário está na lista de objetos de jogadores?
            const euEstouNela = data.jogadores?.some(j => j.usuarioId === user.uid);

            if (euEstouNela) {
                encontrouAlguma = true;
                const card = document.createElement('div');
                card.className = 'classe-card card-jogador'; 
                
                card.innerHTML = `
                    <h3>${data.nome}</h3>
                    <p>Mestre: <strong>${data.mestreNome || 'Agente Veterano'}</strong></p>
                    <button class="btn-sair" onclick="sairDaCampanha('${docSnap.id}')" style="margin-top:10px; background:#441111; color:white; border:none; padding:5px; cursor:pointer;">Sair da Missão</button>
                `;
                listaParticipando.appendChild(card);
            }
        });

        if (!encontrouAlguma) {
            listaParticipando.innerHTML = '<p>Você ainda não participa de nenhuma missão.</p>';
        }
    } catch (error) {
        console.error("Erro ao carregar participações:", error);
    }
}
window.carregarCampanhasParticipando = carregarCampanhasParticipando;
let campanhaEncontradaID = null;
window.verificarCodigo = async function() {
    const codigoInput = document.getElementById('codigo-entrada');
    const codigo = codigoInput.value.trim().toUpperCase();
    
    if (codigo.length !== 6) {
        alert("O código deve ter exatamente 6 caracteres.");
        return;
    }

    try {
        // Busca no Firestore a campanha com o código digitado
        const q = query(collection(db, "campanhas"), where("codigo", "==", codigo));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            alert("Nenhuma missão encontrada com este código. Verifique e tente novamente.");
            return;
        }

        // Armazena o ID do documento encontrado
        campanhaEncontradaID = querySnapshot.docs[0].id;
        
        // Carrega os personagens do usuário para o Select
        const temPersonagem = await preencherSelectPersonagens();
        
        if (!temPersonagem) {
            alert("Você não possui agentes criados. Crie um personagem antes de entrar em uma missão!");
            return;
        }

        // Troca as telas: Esconde a parte do código e mostra a do personagem
        document.getElementById('etapa-codigo').classList.add('oculta');
        document.getElementById('etapa-personagem').classList.remove('oculta');

    } catch (error) {
        console.error("Erro ao verificar código:", error);
        alert("Erro na conexão com o Outro Lado.");
    }
};
async function preencherSelectPersonagens() {
    const user = auth.currentUser;
    const select = document.getElementById('select-personagem-entrada');
    if (!user || !select) return false;
    console.log("Buscando personagens para o UID:", user.uid);

    try {
        const q = query(collection(db, "personagens"), where("usuarioId", "==", user.uid));
        const snap = await getDocs(q);
        
        if (snap.empty) return false;

        select.innerHTML = ''; // Limpa opções anteriores
        snap.forEach(doc => {
            const p = doc.data();
            const option = document.createElement('option');
            option.value = doc.id;
            option.innerText = `${p.nome} (${p.classe || 'Inexperiente'})`;
            select.appendChild(option);
        });
        
        return true;
    } catch (e) {
        console.error("Erro ao carregar agentes:", e);
        return false;
    }
}
window.entrarNaCampanha = async function() {
    const user = auth.currentUser;
    const select = document.getElementById('select-personagem-entrada');
    const personagemId = select.value;

    // 1. Verificações básicas
    if (!user) return alert("Você precisa estar logado!");
    if (!campanhaEncontradaID) return alert("Erro: ID da campanha não encontrado. Verifique o código novamente.");
    if (!personagemId) return alert("Selecione um agente para a missão!");

    try {
        // 2. Pegar os dados ATUAIS da campanha diretamente pelo ID
        const { getDoc } = await import("https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js");
        const campanhaRef = doc(db, "campanhas", campanhaEncontradaID);
        const docSnap = await getDoc(campanhaRef);

        if (!docSnap.exists()) {
            alert("Erro: A campanha não existe mais.");
            return;
        }

        const dadosCampanha = docSnap.data();

        // 3. Verificar se o jogador já está lá (evitar duplicatas)
        const listaJogadores = dadosCampanha.jogadores || [];
        const jaEsta = listaJogadores.find(j => j.usuarioId === user.uid);
        
        if (jaEsta) {
            alert("Você já faz parte desta missão!");
            cancelarEntrada();
            return;
        }

        // 4. Criar o novo objeto do jogador
        const novoParticipante = {
            usuarioId: user.uid,
            nomeUsuario: user.displayName || user.email,
            personagemId: personagemId
        };

        // 5. Atualizar o array no Firebase
        const novaLista = [...listaJogadores, novoParticipante];

        await updateDoc(campanhaRef, {
            jogadores: novaLista
        });

        alert(`Sucesso! Você entrou na missão: ${dadosCampanha.nome}`);
        
        // Limpar interface e atualizar listas
        cancelarEntrada();
        if (typeof carregarCampanhasParticipando === 'function') {
            carregarCampanhasParticipando();
        }

    } catch (error) {
        console.error("Erro ao entrar na missão:", error);
        alert("Erro ao salvar entrada: " + error.message);
    }
};
window.cancelarEntrada = function() {
    campanhaEncontradaID = null;
    document.getElementById('codigo-entrada').value = "";
    document.getElementById('etapa-codigo').classList.remove('oculta');
    document.getElementById('etapa-personagem').classList.add('oculta');
};
window.sairDaCampanha = async function(idCampanha) {
    const user = auth.currentUser;
    if (!user) return;

    // Confirmação para evitar cliques acidentais
    if (!confirm("Tem certeza que deseja abandonar esta missão? Seu personagem será desconectado dela.")) {
        return;
    }

    try {
        const campanhaRef = doc(db, "campanhas", idCampanha);
        const docSnap = await getDoc(campanhaRef);

        if (docSnap.exists()) {
            const dados = docSnap.data();
            const listaJogadores = dados.jogadores || [];

            // Filtra a lista: mantém apenas quem NÃO tem o seu UID
            const novaLista = listaJogadores.filter(j => j.usuarioId !== user.uid);

            // Atualiza o Firebase com a nova lista reduzida
            await updateDoc(campanhaRef, {
                jogadores: novaLista
            });

            alert("Você saiu da missão com sucesso.");
            
            // Atualiza a interface (chama a função que carrega as campanhas que você participa)
            if (typeof carregarCampanhasParticipando === 'function') {
                carregarCampanhasParticipando();
            }
        }
    } catch (error) {
        console.error("Erro ao sair da campanha:", error);
        alert("Erro ao processar saída: " + error.message);
    }
};