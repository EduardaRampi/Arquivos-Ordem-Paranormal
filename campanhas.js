import { auth, db, serverTimestamp } from './firebase-config.js';
import { 
    collection, 
    addDoc, 
    query, 
    where, 
    getDocs,
    doc,        
    updateDoc,
    deleteDoc
} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";
let idCampanhaAberta = null;
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
            mestreNome: user.email, // Ou user.displayName se tiver
            codigo: codigo,
            jogadores: [], 
            criadoEm: serverTimestamp()
        };

        await addDoc(collection(db, "campanhas"), novaCampanha);
        
        alert(`Campanha "${novaCampanha.nome}" criada com sucesso!`);
        
        // Limpa os campos
        nomeInput.value = "";
        if(descInput) descInput.value = "";

        // Lógica para voltar à tela de listagem
        const telaAtual = document.getElementById('Criar-Campanha');
        const telaCampanhas = document.getElementById('Campanhas');

        telaAtual.classList.remove('ativa');
        setTimeout(() => {
            telaAtual.classList.add('oculta');
            telaCampanhas.classList.remove('oculta');
            telaCampanhas.classList.add('ativa');
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
window.abrirPainelMestre = function(id, dados) {
    console.log("Visualizando campanha:", dados.nome);
    idCampanhaAberta = id;

    // 1. Lógica de Troca de Tela (Seguindo seu padrão)
    const todasAsTelas = document.querySelectorAll('.tela');
    todasAsTelas.forEach(tela => {
        tela.classList.add('oculta');
        tela.classList.remove('ativa');
    });

    const telaCampanha = document.getElementById('Visualizar_Campanha');
    if (telaCampanha) {
        telaCampanha.classList.remove('oculta');
        telaCampanha.classList.add('ativa');
    }

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
    if (listaJogadores) {
        listaJogadores.innerHTML = ""; // Limpa antes de carregar
        
        if (dados.jogadores && dados.jogadores.length > 0) {
            // Aqui futuramente chamaremos a função para buscar os dados dos personagens
            listaJogadores.innerHTML = "<p>Carregando agentes conectados...</p>";
        } else {
            listaJogadores.innerHTML = "<p class='vazio'>Nenhum agente entrou ainda.</p>";
        }
    }
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

    // Procure ou crie um container no HTML para as campanhas que você é jogador
    const listaParticipando = document.querySelector('.lista-campanhas-participando');
    if (!listaParticipando) return;

    listaParticipando.innerHTML = '<p>Buscando missões ativas...</p>';

    try {
        // BUSCA: Onde o array "jogadores" contém o ID do usuário
        const q = query(
            collection(db, "campanhas"), 
            where("jogadores", "array-contains", user.uid)
        );

        const querySnapshot = await getDocs(q);
        listaParticipando.innerHTML = ''; 

        if (querySnapshot.empty) {
            listaParticipando.innerHTML = '<p>Você ainda não participa de nenhuma missão.</p>';
            return;
        }

        querySnapshot.forEach((docSnap) => {
            const data = docSnap.data();
            const idDoc = docSnap.id;
            
            const card = document.createElement('div');
            card.className = 'classe-card card-jogador'; 
            card.style.cursor = 'pointer';
            
            card.innerHTML = `
                <h3>${data.nome}</h3>
                <p>Mestre: <strong>${data.mestreNome || 'Desconhecido'}</strong></p>
                <p style="font-size: 0.8em; color: #aaa;">Status: Em missão</p>
            `;

            card.addEventListener('click', () => {
                // Aqui você pode criar uma função 'abrirPainelJogador' no futuro
                alert("Em breve: Ver detalhes da campanha como jogador!");
            });

            listaParticipando.appendChild(card);
        });
    } catch (error) {
        console.error("Erro ao carregar participações:", error);
        listaParticipando.innerHTML = '<p>Erro ao carregar missões.</p>';
    }
}
window.carregarCampanhasParticipando = carregarCampanhasParticipando;