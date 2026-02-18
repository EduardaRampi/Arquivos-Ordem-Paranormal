// Mantenha suas importações do config
import { auth, db, serverTimestamp } from './firebase-config.js';
import { 
    collection, 
    addDoc, 
    query, 
    where, 
    getDocs,
    doc,        
    updateDoc
} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";

// Variáveis para armazenar as seleções feitas nas abas
let escolhaOrigemId = null;
let escolhaClasseId = null;
let idFichaAberta = null;
let fichaAtualDados = null;
const TRILHAS = {
    combatente: ["Aniquilador", "Guerreiro", "Operações Especiais", "Tropa de Choque", "Comandante de Campo", "Agente Secreto", "Caçador", "Monstruoso"],
    especialista: ["Atirador de Elite", "Infiltrador", "Médico de Campo", "Negociador", "Técnico", "Bibliotecario", "Perseverante", "Muambeiro"],
    ocultista: ["Conduíte", "Flagelador", "Graduado", "Lâmina Paranormal", "Intuitivo", "Exorcista", "Possuido", "Parapsicólogo", "Maledictólogo"]
};
const TODAS_PERICIAS = [
    "Acrobacia", "Adestramento", "Artes", "Atletismo", "Atualidades", "Ciências",
    "Crime", "Diplomacia", "Enganação", "Fortitude", "Furtividade", "Iniciativa",
    "Intimidação", "Intuição", "Investigação", "Luta", "Medicina", "Ocultismo",
    "Percepção", "Pilotagem", "Pontaria", "Profissão", "Reflexos", "Religião",
    "Sobrevivência", "Tática", "Tecnologia", "Vontade"
];
const DADOS_ORIGENS = {
    academico: ["Ciências", "Investigação"],
    agente_de_saude: ["Medicina", "Intuição"],
    amnesico: [], // Escolhe duas perícias depois
    artista: ["Artes", "Enganação"],
    atleta: ["Atletismo", "Acrobacia"],
    chef: ["Fortitude", "Profissão"],
    criminoso: ["Crime", "Furtividade"],
    cultista_arrependido: ["Ocultismo", "Religião"],
    desgarrado: ["Fortitude", "Sobrevivência"],
    engenheiro: ["Profissão", "Tecnologia"],
    executivo: ["Diplomacia", "Profissão"],
    investigador: ["Investigação", "Percepção"],
    lutador: ["Luta", "Reflexos"],
    magnata: ["Diplomacia", "Pilotagem"],
    mercenario: ["Iniciativa", "Intimidação"],
    militar: ["Pontaria", "Tática"],
    operario: ["Fortitude", "Profissão"],
    policial: ["Percepção", "Pontaria"],
    religioso: ["Religião", "Vontade"],
    servidor_publico: ["Intuição", "Vontade"],
    teorico_da_conspiracao: ["Investigação", "Ocultismo"],
    ti: ["Investigação", "Tecnologia"],
    trabalhador_rural: ["Adestramento", "Sobrevivência"],
    trambiqueiro: ["Crime", "Enganação"],
    universitario: ["Atualidades", "Investigação"],
    vitima: ["Reflexos", "Vontade"],
    amigo_dos_animais: ["Adestramento", "Percepção"],
    astronauta: ["Ciências", "Fortitude"],
    chef_do_outro_lado: ["Ocultismo", "Profissão"],
    colegial: ["Atualidades", "Tecnologia"],
    cosplayer: ["Artes", "Vontade"],
    diplomata: ["Atualidades", "Diplomacia"],
    explorador: ["Fortitude", "Sobrevivência"],
    experimento: ["Atletismo", "Fortitude"],
    fanatico_por_criaturas: ["Investigação", "Ocultismo"],
    fotografo: ["Artes", "Percepção"],
    inventor_paranormal: ["Profissão", "Vontade"],
    jovem_mistico: ["Ocultismo", "Religião"],
    legista_do_turno_da_noite: ["Ciências", "Medicina"],
    mateiro: ["Percepção", "Sobrevivência"],
    mergulhador: ["Atletismo", "Fortitude"],
    motorista: ["Pilotagem", "Reflexos"],
    nerd_entusiasta: ["Ciências", "Tecnologia"],
    profetizado: ["Vontade"], // +1 perícia: Luta ou Fuga
    psicologo: ["Intuição", "Profissão"],
    reporter_investigativo: ["Atualidades", "Investigação"],
    body_builder: ["Atletismo", "Fortitude"],
    personal_trainer: ["Atletismo", "Ciências"],
    blaster: ["Ciências", "Profissão"],
    revoltado: ["Furtividade", "Vontade"],
    duble: ["Pilotagem", "Reflexos"],
    gauderio_abutre: ["Luta", "Pilotagem"],
    ginasta: ["Acrobacia", "Reflexos"],
    escritor: ["Artes", "Atualidades"],
    jornalista: ["Atualidades", "Investigação"], 
    cientista_forense: ["Ciências", "Investigação"],
    professor: ["Ciências", "Intuição"],
    ferido_por_ritual: ["Ocultismo"], // +1 perícia: definida pelo elemento do ritual
    transtornado_arrependido: ["Luta", "Ocultismo"]
};

/**
 * 1. GERENCIAMENTO DE SELEÇÃO (ORIGEM E CLASSE)
 * Escuta cliques nos cards gerados dinamicamente para salvar a escolha do usuário.
 */
document.addEventListener('click', (e) => {
    // 1. Verifica se clicou num card ou dentro dele
    const card = e.target.closest('.classe-card');
    if (!card) return;

    // 2. Verifica se o card está dentro de uma lista de seleção (Origem ou Classe)
    // Nota: Adicionei "lista-classes" (plural) pois é provável que seu JSON carregue assim
    const listaPai = card.closest('.lista-origens, .lista-classes, .lista-classe'); 
    if (!listaPai) return;

    // 3. Remove a classe 'selecionado' APENAS dos irmãos nessa lista específica
    listaPai.querySelectorAll('.classe-card').forEach(c => c.classList.remove('selecionado'));
    
    // 4. Adiciona visual de selecionado ao card clicado
    card.classList.add('selecionado');

    // 5. CORREÇÃO IMPORTANTE: Pegar o valor de data-id, não card.id
    const idSelecionado = card.getAttribute('data-id');

    // 6. Armazena na variável correta dependendo da lista pai
    if (listaPai.classList.contains('lista-origens')) {
        escolhaOrigemId = idSelecionado;
        console.log("Origem definida:", escolhaOrigemId);
    } 
    // Verifica tanto singular quanto plural para garantir
    else if (listaPai.classList.contains('lista-classe') || listaPai.classList.contains('lista-classes')) {
        escolhaClasseId = idSelecionado;
        console.log("Classe definida:", escolhaClasseId);
    }
});
/**
 * 2. FUNÇÃO PARA SALVAR PERSONAGEM
 * Captura todos os dados das 4 abas e envia para o Firestore.
 */
const btnFinalizar = document.querySelector('.btn-finalizar');

if (btnFinalizar) {
    btnFinalizar.addEventListener('click', async () => {
        const user = auth.currentUser;
        
        if (!user) {
            alert("Você precisa estar logado para salvar um personagem.");
            return;
        }

        // Validação de seleções obrigatórias
        if (!escolhaOrigemId || !escolhaClasseId) {
            alert("Erro: Você precisa selecionar uma Origem e uma Classe antes de finalizar.");
            return;
        }

        // Coleta de Atributos
        const atributos = {
            FOR: parseInt(document.querySelector('.input.for').value) || 0,
            AGI: parseInt(document.querySelector('.input.agi').value) || 0,
            INT: parseInt(document.querySelector('.input.int').value) || 0,
            VIG: parseInt(document.querySelector('.input.vig').value) || 0,
            PRE: parseInt(document.querySelector('.input.pre').value) || 0
        };

        // Outras informações definidas automaticamente
        const nexInicial = 5; // Ou pegue de um input se você criar um
        const statusComNex = calcularStatus(escolhaClasseId, atributos, nexInicial);
        const periciasIniciais = {};

        // Coleta de Dados da aba Toques Finais
        const nomePersonagem = document.querySelector('input[placeholder="Nome do personagem"]').value;
        const nomeJogador = document.querySelector('input[placeholder="Nome do Jogador"]').value;
        const aparencia = document.querySelector('textarea[placeholder*="Nome, gênero, idade"]').value;
        const historico = document.querySelector('textarea[placeholder*="Infância, relação"]').value;
        const objetivo = document.querySelector('textarea[placeholder*="Por que ele faz parte"]').value;

        if (!nomePersonagem) {
            alert("Dê um nome ao seu personagem!");
            return;
        }

        // Se a origem escolhida estiver no nosso dicionário...
        if (DADOS_ORIGENS[escolhaOrigemId]) {
            DADOS_ORIGENS[escolhaOrigemId].forEach(pericia => {
                // Marcamos que essa perícia tem bônus de +5
                periciasIniciais[pericia] = 5;
            });
        }

        try {
            // Salvando no Firestore
            await addDoc(collection(db, "personagens"), {
                usuarioId: user.uid,
                nome: nomePersonagem,
                jogador: nomeJogador,
                origem: escolhaOrigemId,
                classe: escolhaClasseId,
                atributos: atributos,
                nex: nexInicial,
                pericias: periciasIniciais,
                status: statusComNex,
                detalhes: {
                    aparencia,
                    historico,
                    objetivo
                },
                criadoEm: serverTimestamp()
            });

            alert("Ficha criada com sucesso!");

            // Lógica para voltar à tela de listagem
            const telaAtual = document.getElementById('Personagem');
            const telaFichas = document.getElementById('Fichas');

            telaAtual.classList.remove('ativa');
            setTimeout(() => {
                telaAtual.classList.add('oculta');
                telaFichas.classList.remove('oculta');
                telaFichas.classList.add('ativa');
                carregarPersonagens(); // Atualiza a lista na tela de Fichas
            }, 250);

        } catch (error) {
            console.error("Erro ao salvar no Firebase:", error);
            alert("Erro ao salvar ficha: " + error.message);
        }
    });
}
/**
 * 3. Nex
 */
const PROGRESSAO_CLASSE = {
    combatente: { pv: 4, san: 3, pe: 2 },   // Ganha 4 PV + VIG a cada 5% NEX
    especialista: { pv: 3, san: 4, pe: 3 }, // Ganha 3 PV + VIG a cada 5% NEX
    ocultista: { pv: 2, san: 5, pe: 4 }    // Ganha 2 PV + VIG a cada 5% NEX
};
/**
 * 4. outros atributos
 */
function calcularStatus(classe, atributos, nex = 5) {
    const vig = parseInt(atributos.VIG) || 0;
    const pre = parseInt(atributos.PRE) || 0;
    
    // Nível de aumento (Quantas vezes ele subiu 5% após o 5% inicial)
    // Ex: NEX 5% -> 0 aumentos | NEX 10% -> 1 aumento | NEX 15% -> 2 aumentos
    const aumentos = (nex - 5) / 5;

    let base = { pv: 0, san: 0, pe: 0 };
    let ganho = PROGRESSAO_CLASSE[classe] || { pv: 2, san: 2, pe: 1 };

    // Valores Iniciais (NEX 5%)
    if (classe === 'combatente') {
        base = { pv: 20 + vig, san: 12, pe: 2 + pre };
    } else if (classe === 'especialista') {
        base = { pv: 16 + vig, san: 16, pe: 3 + pre };
    } else if (classe === 'ocultista') {
        base = { pv: 12 + vig, san: 20, pe: 4 + pre };
    }

    // Soma os ganhos por nível
    // Regra: PV ganha (valor da classe + VIG), PE ganha (valor da classe + PRE)
    const pvTotal = base.pv + (aumentos * (ganho.pv + vig));
    const peTotal = base.pe + (aumentos * (ganho.pe + pre));
    const sanTotal = base.san + (aumentos * ganho.san);

    return {
        nex: nex,
        pvMax: pvTotal, pvAtual: pvTotal,
        peMax: peTotal, peAtual: peTotal,
        sanMax: sanTotal, sanAtual: sanTotal
    };
}
/**
 * 5. CARREGAR PERSONAGENS DO USUÁRIO
 * Busca as fichas salvas no Firebase e as exibe na tela "Fichas".
 */
async function carregarPersonagens() {
    const user = auth.currentUser;
    if (!user) return;

    const listaContainer = document.querySelector('.lista-personagens');
    if (!listaContainer) return;

    listaContainer.innerHTML = '<p>Carregando seus agentes...</p>';

    try {
        const q = query(
            collection(db, "personagens"), 
            where("usuarioId", "==", user.uid)
        );

        const querySnapshot = await getDocs(q);
        listaContainer.innerHTML = ''; 

        if (querySnapshot.empty) {
            listaContainer.innerHTML = '<p>Você ainda não possui personagens criados.</p>';
            return;
        }

        querySnapshot.forEach((doc) => {
            const data = doc.data();
            const idDoc = doc.id; // ID único da ficha no Firebase
            
            // Função simples para formatar o ID (ex: "cultista_arrependido" vira "Cultista Arrependido")
            const formatarTexto = (texto) => {
                if(!texto) return "N/A";
                return texto.split('_').map(palavra => 
                    palavra.charAt(0).toUpperCase() + palavra.slice(1)
                ).join(' ');
            };

            const card = document.createElement('div');
            card.className = 'classe-card'; 
            card.style.cursor = 'pointer'; // Indica que é clicável
            
            card.innerHTML = `
                <h3>${data.nome}</h3>
                <p><strong>${formatarTexto(data.classe)}</strong></p>
                <p style="font-size: 0.9em; color: #ccc;">${formatarTexto(data.origem)}</p>
            `;

            // EVENTO DE CLIQUE PARA VER FICHA
            card.addEventListener('click', () => {
                abrirFichaCompleta(idDoc, data);
            });

            listaContainer.appendChild(card);
        });
    } catch (error) {
        console.error("Erro ao carregar personagens:", error);
        listaContainer.innerHTML = '<p>Erro ao carregar personagens.</p>';
    }
}

/**
 * 6. Redireciona para a tela de visualização e preenche os dados completos
 */
function abrirFichaCompleta(id, dados) {
    idFichaAberta = id;
    console.log("Abrindo ficha completa de:", dados.nome);

    // 1. Esconde todas as telas e ativa a de visualização
    const todasAsTelas = document.querySelectorAll('.tela');
    todasAsTelas.forEach(tela => {
        tela.classList.add('oculta');
        tela.classList.remove('ativa');
    });

    const telaFicha = document.getElementById('Visualizar_Ficha');
    if (!telaFicha) {
        console.error("A tela #Visualizar_Ficha não foi encontrada!");
        return;
    }

    telaFicha.classList.remove('oculta');
    telaFicha.classList.add('ativa');

    // --- PREENCHIMENTO DOS DADOS ---

    // Função auxiliar para formatar nomes técnicos (ex: "agente_saude" -> "Agente Saude")
    const formatar = (t) => t ? t.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : "---";

    // A. Cabeçalho e Informações Básicas
    document.getElementById('view-nome').innerText = dados.nome || "Agente Sem Nome";
    document.getElementById('edit-jogador').value = dados.jogador || ""
    
    const campoClasse = document.getElementById('view-classe');
    const campoOrigem = document.getElementById('view-origem');
    const campoNex = document.getElementById('view-nex');

    if (campoClasse) campoClasse.innerText = formatar(dados.classe);
    if (campoOrigem) campoOrigem.innerText = formatar(dados.origem);
    if (campoNex) campoNex.innerText = (dados.nex || 5) + "%";
    // Localize o select do NEX
    const selectNex = document.getElementById('edit-nex');
    if (selectNex) {
        selectNex.value = dados.nex || 5; // Define o valor que veio do banco de dados
    }

    atualizarOpcoesTrilha(dados.classe, dados.nex, dados.trilha)

    // Criar uma variável global ou acessível para os dados da ficha atual
    // Isso ajuda a recalcular sem precisar ler do banco de novo
    window.fichaAtualDados = dados;

    // B. Atributos (FOR, AGI, INT, VIG, PRE)
    if (dados.atributos) {
    document.getElementById('edit-for').value = dados.atributos.FOR || 0;
    document.getElementById('edit-agi').value = dados.atributos.AGI || 0;
    document.getElementById('edit-int').value = dados.atributos.INT || 0;
    document.getElementById('edit-vig').value = dados.atributos.VIG || 0;
    document.getElementById('edit-pre').value = dados.atributos.PRE || 0;
    }

    // C. Status (PV, PE, SAN)
    if (dados.status) {
        atualizarBarraVisual('pv', dados.status.pvAtual, dados.status.pvMax);
        atualizarBarraVisual('pe', dados.status.peAtual, dados.status.peMax);
        atualizarBarraVisual('san', dados.status.sanAtual, dados.status.sanMax);
    } else if (dados.pvMax) { 
        // Caso o banco tenha salvo fora do objeto 'status' em testes anteriores
        atualizarBarraVisual('pv', dados.pvAtual, dados.pvMax);
        atualizarBarraVisual('pe', dados.peAtual, dados.peMax);
        atualizarBarraVisual('san', dados.sanAtual, dados.sanMax);
    }

    // D. LISTAGEM DE TODAS AS PERÍCIAS
    const listaPericiasContainer = document.getElementById('pericias-agente'); 
    if (listaPericiasContainer) {
        listaPericiasContainer.innerHTML = ""; // Limpa a lista atual

        // Criamos uma div ou ul para organizar em colunas no futuro se quiser
        TODAS_PERICIAS.forEach(pericia => {
            // Pega o valor de treino (+5, +10...)
            const valorTreino = (dados.pericias && dados.pericias[pericia]) ? dados.pericias[pericia] : 0;
            
            // Pega o valor de "outros" (se não existir no banco, começa com 0)
            const valorOutros = (dados.outrosBonus && dados.outrosBonus[pericia]) ? dados.outrosBonus[pericia] : 0;

            const div = document.createElement('div');
            div.className = `item-pericia-edit treino-${valorTreino}`;
            div.innerHTML = `
                <span class="nome-pericia">${pericia}</span>
                <select class="select-treino" data-pericia="${pericia}">
                    <option value="0" ${valorTreino == 0 ? 'selected' : ''}>+0</option>
                    <option value="5" ${valorTreino == 5 ? 'selected' : ''}>+5</option>
                    <option value="10" ${valorTreino == 10 ? 'selected' : ''}>+10</option>
                    <option value="15" ${valorTreino == 15 ? 'selected' : ''}>+15</option>
                </select>

                <input type="number" class="input-outros" 
                    data-pericia="${pericia}" 
                    value="${valorOutros}" 
                    placeholder="Outros">
            `;
            listaPericiasContainer.appendChild(div);
        });
    };

    // E. DETALHES (Campos Editáveis)
    const campoHistorico = document.getElementById('edit-historico');
    const campoAparencia = document.getElementById('edit-aparencia');
    const campoObjetivo = document.getElementById('edit-objetivo');

    if (campoHistorico) {
        campoHistorico.value = dados.detalhes?.historico || "";
    }

    if (campoAparencia) {
        campoAparencia.value = dados.detalhes?.aparencia || "";
    }

    if (campoObjetivo) {
        campoObjetivo.value = dados.detalhes?.objetivo || "";
    }
}

document.addEventListener('change', (e) => {
    if (e.target.id === 'edit-nex') {
        const novoNex = parseInt(e.target.value);
        const dados = window.fichaAtualDados;

        if (dados) {
            // Pegamos os atributos atuais da tela para o cálculo ser preciso
            const atributosTela = {
                FOR: parseInt(document.getElementById('edit-for').value) || 0,
                AGI: parseInt(document.getElementById('edit-agi').value) || 0,
                INT: parseInt(document.getElementById('edit-int').value) || 0,
                VIG: parseInt(document.getElementById('edit-vig').value) || 0,
                PRE: parseInt(document.getElementById('edit-pre').value) || 0
            };

            const novosStatus = calcularStatus(dados.classe, atributosTela, novoNex);
            
            // CORREÇÃO: Passar apenas 'pv', 'pe', 'san'
            atualizarBarraVisual('pv', novosStatus.pvMax, novosStatus.pvMax);
            atualizarBarraVisual('pe', novosStatus.peMax, novosStatus.peMax);
            atualizarBarraVisual('san', novosStatus.sanMax, novosStatus.sanMax);
            
            // Atualiza a memória local
            window.fichaAtualDados.atributos = atributosTela;
            window.fichaAtualDados.nex = novoNex;
        }
        atualizarOpcoesTrilha(dados.classe, novoNex, document.getElementById('edit-trilha').value);
    }
});
// Função auxiliar para atualizar a largura e o texto das barras
function atualizarBarraVisual(tipo, atual, max) {
    const barra = document.getElementById(`barra-${tipo}`);
    const areaMorte = document.getElementById(`morte-${tipo}`);
    
    if (barra) {
        const vAtual = parseInt(atual);
        const vMax = parseInt(max);
        const porcentagem = Math.max(0, Math.min((vAtual / vMax) * 100, 100));

        // 1. Sempre atualiza a largura e o texto da barra
        barra.style.width = `${porcentagem}%`;
        barra.innerText = `${vAtual} / ${vMax}`;

        const containerBarra = barra.parentElement;

        // 2. LÓGICA DE EMERGÊNCIA (Apenas para PV e SAN)
        if (tipo === 'pv' || tipo === 'san') {
            if (vAtual <= 0) {
                // Esconde a barra e mostra as bolinhas de morte/enlouquecendo
                if (containerBarra) containerBarra.style.display = 'none';
                areaMorte?.classList.remove('ocuta');
            } else {
                // Volta ao normal
                if (containerBarra) containerBarra.style.display = 'block';
                areaMorte?.classList.add('ocuta');
                
                // Limpa as bolinhas ao recuperar 1 ponto
                areaMorte?.querySelectorAll('.check-morte').forEach(c => c.checked = false);
            }
        } else {
            // Se for PE ou qualquer outro, garante que a barra sempre apareça
            if (containerBarra) containerBarra.style.display = 'block';
        }
    }
}
document.addEventListener('change', async (e) => {
    if (e.target.classList.contains('check-morte')) {
        const tipo = e.target.closest('.status-emergencia').id.split('-')[1]; // 'pv' ou 'san'
        const indice = e.target.getAttribute('data-indice');
        
        console.log(`Marcado teste ${indice} de ${tipo}`);
        
        // Opcional: Salvar no Firebase imediatamente
        // const fichaRef = doc(db, "personagens", idFichaAberta);
        // await updateDoc(fichaRef, { [`testesMorte.${tipo}${indice}`]: e.target.checked });
    }
});
document.querySelectorAll('.input-atrib').forEach(input => {
    input.addEventListener('change', () => {
        // Monitora mudança nos Atributos
        ['edit-for', 'edit-agi', 'edit-int', 'edit-vig', 'edit-pre'].forEach(id => {
            document.getElementById(id)?.addEventListener('change', () => {
                const dados = window.fichaAtualDados;
                if (!dados) return;

                const novosAtribs = {
                    FOR: parseInt(document.getElementById('edit-for').value) || 0,
                    AGI: parseInt(document.getElementById('edit-agi').value) || 0,
                    INT: parseInt(document.getElementById('edit-int').value) || 0,
                    VIG: parseInt(document.getElementById('edit-vig').value) || 0,
                    PRE: parseInt(document.getElementById('edit-pre').value) || 0
                };

                const nex = parseInt(document.getElementById('edit-nex').value) || 5;
                const novoCalculo = calcularStatus(dados.classe, novosAtribs, nex);

                // Função interna para atualizar sem resetar o atual
                const ajustarSemResetar = (tipo) => {
                    const barra = document.getElementById(`barra-${tipo}`);
                    const atual = parseInt(barra.innerText.split('/')[0]) || 0;
                    const maxAntigo = parseInt(barra.innerText.split('/')[1]) || 1;
                    const novoMax = novoCalculo[`${tipo}Max`];
                    
                    // Se o máximo aumentou (ex: de 20 para 24), o atual ganha essa diferença (+4)
                    const diferenca = novoMax - maxAntigo;
                    const novoAtual = Math.max(0, atual + diferenca);

                    atualizarBarraVisual(tipo, novoAtual, novoMax);
                };

                ajustarSemResetar('pv');
                ajustarSemResetar('pe');
                ajustarSemResetar('san');

                window.fichaAtualDados.atributos = novosAtribs;
            });
        });
    });
});
function atualizarOpcoesTrilha(classe, nex, trilhaAtual = "") {
    const selectTrilha = document.getElementById('edit-trilha');
    if (!selectTrilha) return;

    if (nex >= 10) {
        selectTrilha.disabled = false;
        const listaTrilhas = TRILHAS[classe] || [];
        
        // Limpa e preenche o select
        selectTrilha.innerHTML = '<option value="">Escolha uma Trilha</option>';
        listaTrilhas.forEach(trilha => {
            const selected = trilha === trilhaAtual ? 'selected' : '';
            selectTrilha.innerHTML += `<option value="${trilha}" ${selected}>${trilha}</option>`;
        });
    } else {
        selectTrilha.disabled = true;
        selectTrilha.innerHTML = '<option value="">Disponível em 10%</option>';
    }
}
document.addEventListener('change', (e) => {
    if (e.target.classList.contains('select-treino')) {
        const novoValor = e.target.value;
        const divPai = e.target.closest('.item-pericia-edit');
        
        // Remove classes de treino antigas
        divPai.classList.remove('treino-0', 'treino-5', 'treino-10', 'treino-15');
        
        // Adiciona a nova classe
        divPai.classList.add(`treino-${novoValor}`);
    }
});
window.alterarStatus = function(tipo, mod) {
    const barra = document.getElementById(`barra-${tipo}`);
    if (!barra) return;

    const partes = barra.innerText.split('/');
    if (partes.length < 2) return;

    let atual = parseInt(partes[0].trim());
    let max = parseInt(partes[1].trim());

    atual += mod;

    // Travas
    if (atual > max) atual = max;
    if (atual < 0) atual = 0;

    // AQUI ESTÁ O SEGREDO: 
    // Em vez de só mudar o texto, chamamos a função que controla o visual completo
    atualizarBarraVisual(tipo, atual, max);

    // Atualiza a memória local para o botão Salvar
    if (window.fichaAtualDados && window.fichaAtualDados.status) {
        window.fichaAtualDados.status[`${tipo}Atual`] = atual;
        window.fichaAtualDados.status[`${tipo}Max`] = max;
    }
};
const btnSalvar = document.querySelector('.btn-salvar-alteracoes')
if (btnSalvar) {
    btnSalvar.addEventListener('click', async () => {
        if (!idFichaAberta) return;

        try {
            // 1. Referência do documento no Firebase
            const fichaRef = doc(db, "personagens", idFichaAberta);

            // 2. Coleta os dados atuais da tela
            const novoNex = parseInt(document.getElementById('edit-nex').value);
            const novaAparencia = document.getElementById('edit-aparencia').value;
            const novoHistorico = document.getElementById('edit-historico').value;
            const novoObjetivo = document.getElementById('edit-objetivo').value;
            const novoJogador = document.getElementById('edit-jogador').value;
            const novaTrilha = document.getElementById('edit-trilha').value;
            const atributosEditados = {
                FOR: parseInt(document.getElementById('edit-for').value) || 0,
                AGI: parseInt(document.getElementById('edit-agi').value) || 0,
                INT: parseInt(document.getElementById('edit-int').value) || 0,
                VIG: parseInt(document.getElementById('edit-vig').value) || 0,
                PRE: parseInt(document.getElementById('edit-pre').value) || 0
            };
            const periciasAtualizadas = {};
            const outrosBonusAtualizados = {};
            const pegarValoresDaBarra = (id) => {
                const barra = document.getElementById(id);
                if (!barra) return { atual: 0, max: 0 };
                const partes = barra.innerText.split('/');
                return {
                    atual: parseInt(partes[0].trim()) || 0,
                    max: parseInt(partes[1].trim()) || 0
                };
            };
            const dadosPV = pegarValoresDaBarra('barra-pv');
            const dadosPE = pegarValoresDaBarra('barra-pe');
            const dadosSAN = pegarValoresDaBarra('barra-san');
                
            // Aqui recalculamos os status máximos baseados no novo NEX para salvar certinho
            const novosStatus = calcularStatus(
                window.fichaAtualDados.classe, 
                window.fichaAtualDados.atributos, 
                novoNex
            );
            // Varre todos os selects de treino
            document.querySelectorAll('.select-treino').forEach(sel => {
                const nome = sel.getAttribute('data-pericia');
                periciasAtualizadas[nome] = parseInt(sel.value);
            });

            // Varre todos os inputs de outros bônus
            document.querySelectorAll('.input-outros').forEach(inp => {
                const nome = inp.getAttribute('data-pericia');
                outrosBonusAtualizados[nome] = parseInt(inp.value) || 0;
            });

            // 3. Atualiza apenas os campos necessários no Banco de Dados
            await updateDoc(fichaRef, {
                jogador: novoJogador,
                trilha: novaTrilha,
                nex: novoNex,
                pericias: periciasAtualizadas,
                outrosBonus: outrosBonusAtualizados,
                atributos: atributosEditados,
                status: {
                    pvMax: dadosPV.max,
                    pvAtual: dadosPV.atual,
                    peMax: dadosPE.max,
                    peAtual: dadosPE.atual,
                    sanMax: dadosSAN.max,
                    sanAtual: dadosSAN.atual
                },
                detalhes: {
                    aparencia: novaAparencia,
                    historico: novoHistorico,
                    objetivo: novoObjetivo
                }
            });

            alert("Alterações salvas com sucesso!");
            
            // Opcional: Atualiza a memória local para não dar conflito
            window.fichaAtualDados.nex = novoNex;
            window.fichaAtualDados.status = novosStatus;
            window.fichaAtualDados.detalhes = {
                aparencia: novaAparencia,
                historico: novoHistorico,
                objetivo: novoObjetivo
            };
            window.fichaAtualDados.pericias = periciasAtualizadas;
            window.fichaAtualDados.outrosBonus = outrosBonusAtualizados;
            window.fichaAtualDados.atributos = atributosEditados;
            window.fichaAtualDados.jogador = novoJogador;
            window.fichaAtualDados.trilha = novaTrilha;

        } catch (error) {
            console.error("Erro ao salvar:", error);
            alert("Erro ao salvar alterações.");
        }
    });
}

// Expõe a função para o Window para que o auth.js possa chamá-la no login
window.carregarPersonagens = carregarPersonagens;