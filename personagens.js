// Mantenha suas importações do config
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
const AFINIDADE = [
    "Energia", "Sangue", "Morte", "Conhecimento"
];
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

/* ============================================================
   1. GERENCIAMENTO DE SELEÇÃO DE ORIGEM E CLASSE
   - Marca a escolha do usuário e garante que apenas um card esteja selecionado
============================================================ */
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
/* ============================================================
   2. FUNÇÃO PARA SALVAR NOVO PERSONAGEM
   - Coleta atributos, dados de abas e envia para Firestore
============================================================ */
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
/* ============================================================
   3. PROGRESSÃO DE CLASSE E TABELA DE PATENTES
============================================================ */
const PROGRESSAO_CLASSE = {
    combatente: { pv: 4, san: 3, pe: 2, pd: 3 },   
    especialista: { pv: 3, san: 4, pe: 3, pd: 4 }, 
    ocultista: { pv: 2, san: 5, pe: 4, pd: 5 },
    sobrevivente: { pv: 2, san: 2, pe: 1, pd: 2 } 
};
const TABELA_PATENTES = [
    { pontos: 200, nome: "Agente de Elite", credito: "Ilimitado", limites: [3, 3, 3, 2], limitePD: 15, recuperacao: 5 },
    { pontos: 100, nome: "Oficial de Operações", credito: "Alto", limites: [3, 3, 2, 1], limitePD: 10, recuperacao: 4 },
    { pontos: 50, nome: "Agente Especial", credito: "Médio", limites: [3, 2, 1, 0], limitePD: 6, recuperacao: 3 },
    { pontos: 20, nome: "Operador", credito: "Médio", limites: [3, 1, 0, 0], limitePD: 3, recuperacao: 2 },
    { pontos: 0, nome: "Recruta", credito: "Baixo", limites: [2, 0, 0, 0], limitePD: 1, recuperacao: 1 }
];
/* ============================================================
   4. CÁLCULO DE STATUS (PV, PE, SAN, PD) CONFORME NEX E ATRIBUTOS
============================================================ */
function calcularStatus(classe, atributos, nex = 5) {
    const vig = parseInt(atributos.VIG) || 0;
    const pre = parseInt(atributos.PRE) || 0;
    
    // Nível de aumento (Quantas vezes ele subiu 5% após o 5% inicial)
    // Ex: NEX 5% -> 0 aumentos | NEX 10% -> 1 aumento | NEX 15% -> 2 aumentos
    const aumentos = (nex - 5) / 5;

    let base = { pv: 0, san: 0, pe: 0, pd: 0 };
    let ganho = PROGRESSAO_CLASSE[classe] || { pv: 2, san: 2, pe: 1, pd: 2 };

    // Valores Iniciais (NEX 5%)
    if (classe === 'combatente') {
        base = { pv: 20 + vig, san: 12, pe: 2 + pre, pd: 6 + pre };
    } else if (classe === 'especialista') {
        base = { pv: 16 + vig, san: 16, pe: 3 + pre, pd: 8 + pre };
    } else if (classe === 'ocultista') {
        base = { pv: 12 + vig, san: 20, pe: 4 + pre, pd: 10 + pre };
    } else if (classe === 'sobrevivente') {
        base = { pv: 8 + vig, san: 8, pe: 1 + pre, pd: 4 + pre };
    }

    let pdtotal;
    if (classe === 'sobrevivente') {
        pdtotal = base.pd + (aumentos * ganho.pd); 
    } else {
        pdtotal = base.pd + (aumentos * (ganho.pd + pre));
    }
    
    // Soma os ganhos por nível
    // Regra: PV ganha (valor da classe + VIG), PE ganha (valor da classe + PRE)
    const pvTotal = base.pv + (aumentos * (ganho.pv + vig));
    const peTotal = base.pe + (aumentos * (ganho.pe + pre));
    const sanTotal = base.san + (aumentos * ganho.san);
    const pdTotal = pdtotal

    return {
        nex: nex,
        pvMax: pvTotal, pvAtual: pvTotal,
        peMax: peTotal, peAtual: peTotal,
        sanMax: sanTotal, sanAtual: sanTotal,
        pdMax: pdTotal, pdAtual: pdTotal
    };
}
/* ============================================================
   5. CARREGAR PERSONAGENS DO USUÁRIO (TELA FICHAS)
============================================================ */
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
/* ============================================================
   6. FUNÇÕES DE PATENTE
============================================================ */
function atualizarPatente() {
    const campoPrestigio = document.getElementById('edit-prestigio');
    if (!campoPrestigio) return;

    const pontos = parseInt(campoPrestigio.value) || 0;
    
    // Encontra a patente mais alta que o jogador alcançou
    const patenteAtual = TABELA_PATENTES.find(p => pontos >= p.pontos);

    if (patenteAtual) {
        // Atualiza textos
        document.getElementById('val-patente').innerText = patenteAtual.nome;
        document.getElementById('val-credito').innerText = patenteAtual.credito;

        // Atualiza os limites na tabela
        document.getElementById('lim-cat1').innerText = patenteAtual.limites[0];
        document.getElementById('lim-cat2').innerText = patenteAtual.limites[1] > 0 ? patenteAtual.limites[1] : "—";
        document.getElementById('lim-cat3').innerText = patenteAtual.limites[2] > 0 ? patenteAtual.limites[2] : "—";
        document.getElementById('lim-cat4').innerText = patenteAtual.limites[3] > 0 ? patenteAtual.limites[3] : "—";
        
        // Salva na memória global para uso posterior no inventário
        if (window.fichaAtualDados) {
            window.fichaAtualDados.prestigio = pontos;
            window.fichaAtualDados.patenteNome = patenteAtual.nome;
        }

        const inputPDLimite = document.getElementById('edit-pd-limite');
        if (inputPDLimite) {
            inputPDLimite.value = patenteAtual.limitePD;
        }
    }
}
window.atualizarPatente = atualizarPatente;
/* ============================================================
   7. FUNÇÕES DE VISUALIZAÇÃO
============================================================ */
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
    document.getElementById('edit-pe-turno').value = dados.peTurno || 1;
    document.getElementById('edit-deslocamento-metros').value = dados.deslocamento?.metros || 9;
    document.getElementById('edit-deslocamento-grid').value = dados.deslocamento?.grid || 6;

    const campoClasse = document.getElementById('view-classe');
    const campoOrigem = document.getElementById('view-origem');
    const campoNex = document.getElementById('view-nex');
    const nexAtual = parseInt(dados.nex) || 5;
    let limiteCalculado;
    if (nexAtual === 99) {
        limiteCalculado = 20;
    } else {
        limiteCalculado = Math.floor(nexAtual / 5);
    }
    document.getElementById('edit-pe-turno').value = dados.peTurno || limiteCalculado;

    if (campoClasse) campoClasse.innerText = formatar(dados.classe);
    if (campoOrigem) campoOrigem.innerText = formatar(dados.origem);
    if (campoNex) campoNex.innerText = (dados.nex || 5) + "%";
    // Localize o select do NEX
    const selectNex = document.getElementById('edit-nex');
    if (selectNex) {
        selectNex.value = dados.nex || 5; // Define o valor que veio do banco de dados
    }

    atualizarOpcoesTrilha(dados.classe, dados.nex, dados.trilha)
    atualizarOpcoesAfinidade(dados.nex, dados.afinidade)

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

    // C. Status (PV, PE, SAN, PD)
    if (dados.status) {
        atualizarBarraVisual('pv', dados.status.pvAtual, dados.status.pvMax);
        atualizarBarraVisual('pe', dados.status.peAtual, dados.status.peMax);
        atualizarBarraVisual('san', dados.status.sanAtual, dados.status.sanMax);
        atualizarBarraVisual('pd', dados.status.pdAtual, dados.status.pdMax);

    } else if (dados.pvMax) { 
        // Caso o banco tenha salvo fora do objeto 'status' em testes anteriores
        atualizarBarraVisual('pv', dados.pvAtual, dados.pvMax);
        atualizarBarraVisual('pe', dados.peAtual, dados.peMax);
        atualizarBarraVisual('san', dados.sanAtual, dados.sanMax);
        atualizarBarraVisual('pd', dados.status.pdAtual, dados.status.pdMax);
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
    const campoNotas = document.getElementById('edit-nota');
    const campoPersonalidade = document.getElementById('edit-personalidade');

    if (campoHistorico) {
        campoHistorico.value = dados.detalhes?.historico || "";
    }
    if (campoAparencia) {
        campoAparencia.value = dados.detalhes?.aparencia || "";
    }
    if (campoObjetivo) {
        campoObjetivo.value = dados.detalhes?.objetivo || "";
    }
    if (campoNotas) {
        campoNotas.value = dados.detalhes?.nota || "";
    }
    if (campoPersonalidade) {
        campoPersonalidade.value = dados.detalhes?.personalidade || "";
    }
    //F. DEFESA
    if (dados.defesa) {
        document.getElementById('def-equip').value = dados.defesa.equip || 0;
        document.getElementById('def-outros').value = dados.defesa.outros || 0;
        const campoProtecao = document.getElementById('protecao');
        const campoResistencias = document.getElementById('resistencias');
        const campoProficiencias = document.getElementById('proficiencias');

        if (campoProtecao) campoProtecao.value = dados.defesa.protecao || "";
        if (campoResistencias) campoResistencias.value = dados.defesa.resistencia || "";
        if (campoProficiencias) campoProficiencias.value = dados.defesa.proficiencia || "Armas Simples e proteções leves";
        
        // Chama o cálculo para atualizar o número 10 + AGI...
        calcularDefesaEReacoes();
    }
    // G. RECALCULAR DEFESA VISUAL
    setTimeout(() => {
        calcularDefesaEReacoes();
    }, 90);
    // H. Carregar estado das regras
    if (dados.regras) {
        const optSan = document.getElementById('opt-sem-sanidade');
        const optNex = document.getElementById('opt-nex-exp');
        
        if (optSan) {
            optSan.checked = dados.regras.semSanidade;
            toggleRegra('sanidade'); // Isso vai esconder SAN/PE e mostrar PD automaticamente
        }
        if (optNex) {
            optNex.checked = dados.regras.nexExp;
            toggleRegra('nex-exp');
        }
    }
    // I. Patentes
    if (document.getElementById('edit-prestigio')) {
        document.getElementById('edit-prestigio').value = dados.prestigio || 0;
        atualizarPatente(); // Chama a função para preencher os nomes e limites
    }

    // J. Inventário
    if (dados.inventarioConfig) {
        document.getElementById('carga-atual').value = dados.inventarioConfig.cargaAtual || 0;
        document.getElementById('carga-max').value = dados.inventarioConfig.cargaMax || 5;
        atualizarBarraCarga();
    } else {
        // Se for ficha nova, calcula a base pela Força
        calcularCargaBase();
    }
    window.fichaAtualDados = dados;
    if (!window.fichaAtualDados.inventario) window.fichaAtualDados.inventario = [];
    renderizarInventarioFicha();

    // K. Foto
    if (dados.fotoUrl) {
        document.getElementById('foto-personagem').src = dados.fotoUrl;
    } else {
        document.getElementById('foto-personagem').src = "https://placehold.co/400";
    }
}
/* ============================================================
   8. REGRAS ADICIONAIS
============================================================ */
function toggleRegra(regra) {
    if (regra === 'nex-exp') {
        const isChecked = document.getElementById('opt-nex-exp').checked;
        const statusText = document.getElementById('status-nex-exp');
        const containerNivel = document.getElementById('container-nivel');

        statusText.innerText = isChecked ? "LIGADO" : "DESLIGADO";
        
        // Se ligado, mostra o campo de Nível (não remove o NEX, apenas adiciona o Nível)
        if (isChecked) {
            containerNivel.classList.remove('oculta');
            if (typeof salvarFicha === 'function') salvarFicha();

        } else {
            containerNivel.classList.add('oculta');
            if (typeof salvarFicha === 'function') salvarFicha();
        }
    } 
    
    else if (regra === 'sanidade') {
        const isChecked = document.getElementById('opt-sem-sanidade').checked;
        const statusText = document.getElementById('status-sanidade');
        
        const contSanidade = document.getElementById('container-sanidade');
        const contPE = document.getElementById('container-pe');
        const contPD = document.getElementById('container-pd');
        const contPETURNO = document.getElementById('campo-pe-turno');
        const contPDLIMITE = document.getElementById('campo-pd-limite');

        statusText.innerText = isChecked ? "LIGADO" : "DESLIGADO";

        if (isChecked) {
            // LIGADO: Esconde Sanidade e PE, Mostra Determinação
            contSanidade.classList.add('ocuta');
            contPE.classList.add('ocuta');
            contPETURNO.classList.add('ocuta');
            contPD.classList.remove('ocuta');
            contPDLIMITE.classList.remove('ocuta');
            if (typeof salvarFicha === 'function') salvarFicha();
        } else {
            // DESLIGADO: Volta ao padrão
            contSanidade.classList.remove('ocuta');
            contPETURNO.classList.remove('ocuta');
            contPE.classList.remove('ocuta');
            contPD.classList.add('ocuta');
            contPDLIMITE.classList.add('ocuta');
            if (typeof salvarFicha === 'function') salvarFicha();
        }
    }
}
window.toggleRegra = toggleRegra;
/* ============================================================
   9. ESCUTADORES DE EVENTOS GERAIS
   - change para atributos, NEX
============================================================ */
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
            
            // CORREÇÃO: Passar apenas 'pv', 'pe', 'san', 'pd'
            atualizarBarraVisual('pv', novosStatus.pvMax, novosStatus.pvMax);
            atualizarBarraVisual('pe', novosStatus.peMax, novosStatus.peMax);
            atualizarBarraVisual('san', novosStatus.sanMax, novosStatus.sanMax);
            atualizarBarraVisual('pd', novosStatus.pdMax, novosStatus.pdMax);
            
            // Atualiza a memória local
            window.fichaAtualDados.atributos = atributosTela;
            window.fichaAtualDados.nex = novoNex;
        }
        atualizarOpcoesTrilha(dados.classe, novoNex, document.getElementById('edit-trilha').value);
        atualizarOpcoesAfinidade(novoNex, document.getElementById('edit-afinidade').value);
    
        // Lógica Automática: Limite de PE = NEX
        const campoPeTurno = document.getElementById('edit-pe-turno');
        if (campoPeTurno) {
            // Caso especial: 99% NEX é igual a 20 PE
            if (novoNex === 99) {
                campoPeTurno.value = 20;
            } else {
                // Para todos os outros, segue a conta normal
                campoPeTurno.value = Math.floor(novoNex / 5);
            }
        }
    }
});
/* ============================================================
   10. Função auxiliar para atualizar a largura e o texto das barras
============================================================ */ 
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
        if (tipo === 'pv' || tipo === 'san' || tipo == 'pd') {
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
/* ============================================================
   11. Morte
============================================================ */
document.addEventListener('change', async (e) => {
    if (e.target.classList.contains('check-morte')) {
        const tipo = e.target.closest('.status-emergencia').id.split('-')[1]; // 'pv' ou 'san'
        const indice = e.target.getAttribute('data-indice');
        
        console.log(`Marcado teste ${indice} de ${tipo}`);
    }
});
/* ============================================================
   12. Mudou atributos
============================================================ */
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
                ajustarSemResetar('pd');

                window.fichaAtualDados.atributos = novosAtribs;
            });
            document.getElementById('edit-for')?.addEventListener('change', () => {
                calcularCargaBase();
            });
        });
    });
});
/* ============================================================
   13. Trilha e Afinidade
============================================================ */
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
        selectTrilha.innerHTML = '<option value="">Disponível em  NEX 10%</option>';
    }
}
function atualizarOpcoesAfinidade(nex, afinidadeAtual = "") {
    const selectAfinidade = document.getElementById('edit-afinidade');
    if (!selectAfinidade) return;

    if (nex >= 50) {
        selectAfinidade.disabled = false;
        const listaAfinidade = AFINIDADE || [];
        
        // Limpa e preenche o select
        selectAfinidade.innerHTML = '<option value="">Escolha uma Afinidade</option>';
        listaAfinidade.forEach(afinidade => {
            const selected = afinidade === afinidadeAtual ? 'selected' : '';
            selectAfinidade.innerHTML += `<option value="${afinidade}" ${selected}>${afinidade}</option>`;
        });
    } else {
        selectAfinidade.disabled = true;
        selectAfinidade.innerHTML = '<option value="">Disponível em NEX 50%</option>';
    }
}
/* ============================================================
   14. Pericias
============================================================ */
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
/* ============================================================
   15. Barras
============================================================ */
window.alterarStatus = function(tipo, mod) {
    const barra = document.getElementById(`barra-${tipo}`);
    if (!barra) return;

    const partes = barra.innerText.split('/');
    if (partes.length < 2) return;

    let atual = parseInt(partes[0].trim());
    let max = parseInt(partes[1].trim());

    atual += mod;
    console.log(`Alterando ${tipo} em ${mod} pontos.`);
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
/* ============================================================
   16. Defesa
============================================================ */
function calcularDefesaEReacoes() {
    // 1. Pegar valores base para Defesa
    const agi = parseInt(document.getElementById('edit-agi').value) || 0;
    const equip = parseInt(document.getElementById('def-equip').value) || 0;
    const outrosDef = parseInt(document.getElementById('def-outros').value) || 0;
    const defesaTotal = 10 + agi + equip + outrosDef;

    // 2. Pegar bónus das perícias (Treino + Outros)
    const pegarBonusPericia = (nome) => {
        const selTreino = document.querySelector(`.select-treino[data-pericia="${nome}"]`);
        const inpOutros = document.querySelector(`.input-outros[data-pericia="${nome}"]`);
        
        const treino = selTreino ? parseInt(selTreino.value) : 0;
        const outros = inpOutros ? parseInt(inpOutros.value) : 0;
        
        // Em Ordem, se for Agilidade, soma o bónus do atributo também no teste total
        // Mas para Esquiva/Bloqueio usamos apenas o bónus de perícia + Defesa
        return treino + outros;
    };

    const bonusReflexos = pegarBonusPericia('Reflexos');
    const bonusLuta = pegarBonusPericia('Luta');

    // 3. Cálculos de Ordem Paranormal
    const esquivaTotal = defesaTotal + bonusReflexos;
    const bloqueioTotal = bonusLuta; // Bloqueio dá RD igual ao bónus de Luta

    // 4. Atualizar o ecrã
    document.getElementById('valor-defesa').innerText = defesaTotal;
    document.getElementById('valor-esquiva').innerText = esquivaTotal;
    document.getElementById('valor-bloqueio').innerText = `+${bloqueioTotal} RD`;
    
    // Atualiza a fórmula visual
    const txtAgi = document.getElementById('txt-agi');
    if (txtAgi) txtAgi.innerText = agi;
}
/* ============================================================
   17. Escutadores para quando mudar algo
============================================================ */
document.addEventListener('change', (e) => {
    // Se mudar atributo, bónus de defesa ou valores de perícia, recalcula tudo
    const classesParaRecalcular = ['input-def', 'select-treino', 'input-outros', 'input-atrib'];
    const idsParaRecalcular = ['edit-agi', 'def-equip', 'def-outros'];

    if (idsParaRecalcular.includes(e.target.id) || 
        classesParaRecalcular.some(cls => e.target.classList.contains(cls))) {
        calcularDefesaEReacoes();
    }
});
const inputMetros = document.getElementById('edit-deslocamento-metros');
const inputGrid = document.getElementById('edit-deslocamento-grid');
/* ============================================================
   18. Mudo metros, calcula quadrados
============================================================ */
inputMetros.addEventListener('input', () => {
    const metros = parseFloat(inputMetros.value) || 0;
    inputGrid.value = Math.floor(metros / 1.5);
});
/* ============================================================
   19. Mudo quadrados, calcula metros
============================================================ */
inputGrid.addEventListener('input', () => {
    const quadrados = parseFloat(inputGrid.value) || 0;
    inputMetros.value = quadrados * 1.5;
});
/* ============================================================
   20. Carga
============================================================ */
function calcularCargaBase() {
    const forca = parseInt(document.getElementById('edit-for').value) || 0;
    const campoCargaMax = document.getElementById('carga-max');
    
    let cargaCalculada;
    if (forca <= 0) {
        cargaCalculada = 2;
    } else {
        cargaCalculada = forca * 5;
    }

    // Só atualiza automaticamente se o valor atual for menor ou igual ao cálculo 
    // (para não resetar bônus manuais que o player colocou)
    campoCargaMax.value = cargaCalculada;
    atualizarBarraCarga();
}
// Função visual para a barrinha de carga
function atualizarBarraCarga() {
    const atual = parseInt(document.getElementById('carga-atual').value) || 0;
    const max = parseInt(document.getElementById('carga-max').value) || 1;
    const barra = document.getElementById('barra-carga-interna');
    const aviso = document.getElementById('aviso-carga');

    let porcentagem = (atual / max) * 100;
    if (porcentagem > 100) porcentagem = 100;

    if (barra) {
        barra.style.width = `${porcentagem}%`;
        // Muda a cor se estiver pesado
        barra.style.backgroundColor = atual > max ? "#ff4444" : "#44ff44";
    }

    if (aviso) {
        aviso.style.display = atual > max ? "block" : "none";
    }
}
window.atualizarBarraCarga = atualizarBarraCarga;
/* ============================================================
   21. Inventario
============================================================ */
let bancoDeDadosItens = null;
async function carregarBancoItens() {
    if (bancoDeDadosItens) return bancoDeDadosItens; // Já carregou antes

    try {
        const resposta = await fetch('equipamentos.json');
        bancoDeDadosItens = await resposta.json();
        console.log("Banco de itens carregado com sucesso!");
        return bancoDeDadosItens;
    } catch (erro) {
        console.error("Erro ao carregar o JSON de itens:", erro);
    }
}
// Funções de controle do Modal
function abrirModalEquip() {
    const modal = document.getElementById('modal-equipamentos');
    if (modal) {
        modal.classList.remove('modal-oculto');
        renderizarItensModal();
    }
}
function fecharModalEquip() {
    const modal = document.getElementById('modal-equipamentos');
    if (modal) {
        modal.classList.add('modal-oculto');
    }
}
// Expõe globalmente para o HTML achar
window.abrirModalEquip = abrirModalEquip;
window.fecharModalEquip = fecharModalEquip;
window.renderizarItensModal = renderizarItensModal;
window.adicionarAoInventario = adicionarAoInventario;
// Na sua função adicionarAoInventario, a linha 33 estava com o nome errado:
// Altere a assinatura da função para receber a categoria
function adicionarAoInventario(item, categoriaOrigem) {
    let origem = categoriaOrigem;
    if (!origem) {
        const tipo = (item.tipo || "").toLowerCase();
        if (tipo.includes("arma")) origem = "armas";
        else if (item.defesa) origem = "protecoes";
        else if (tipo.includes("muni") || tipo.includes("bala")) origem = "municoes";
        else if (tipo.includes("paranormal") || tipo.includes("maldi")) origem = "paranormais";
        else origem = "acessorios";
    }
    const itemInstanciado = { 
        ...item, 
        origemEquipamento: origem,
        idUnico: Date.now() + Math.random().toString(36).substr(2, 9),
        melhorias: []
    };

    if (!window.fichaAtualDados) window.fichaAtualDados = {}; 
    if (!window.fichaAtualDados.inventario) window.fichaAtualDados.inventario = [];
    
    window.fichaAtualDados.inventario.push(itemInstanciado);

    const campoCarga = document.getElementById('carga-atual');
    let cargaNova = (parseInt(campoCarga.value) || 0) + (parseInt(item.espaco) || 0);
    if(campoCarga) campoCarga.value = cargaNova;

    atualizarBarraCarga();
    sincronizarDefesaComInventario();
    renderizarInventarioFicha(); 
    fecharModalEquip();
}
async function renderizarItensModal() {
    const dados = await carregarBancoItens();
    const container = document.getElementById('lista-itens-catalogo');
    const filtroCat = document.getElementById('filtro-categoria');
    const buscaInput = document.getElementById('busca-item');

    if (!container || !dados) return;

    const categoriaSelecionada = filtroCat.value;
    const busca = buscaInput.value.toLowerCase();

    container.innerHTML = "";

    for (const categoria in dados) {
        if (categoriaSelecionada === "todos" || categoriaSelecionada === categoria) {
            
            dados[categoria].forEach(item => {
                if (item.nome.toLowerCase().includes(busca)) {
                    const card = document.createElement('div');
                    card.className = 'card-item-catalogo';
                    
                    // Lógica de detalhes técnicos
                    let detalhesTecnicos = "";
                    if (item.dano) detalhesTecnicos += `<strong>Dano:</strong> ${item.dano} | `;
                    if (item.defesa) detalhesTecnicos += `<strong>Defesa:</strong> ${item.defesa} | `;
                    if (item.espaco) detalhesTecnicos += `<strong>Peso:</strong> ${item.espaco} | `;
                    if (item.categoria != null) detalhesTecnicos += `<strong>Categoria:</strong> ${item.categoria}`;

                    card.innerHTML = `
                        <div class="item-header-modal">
                            <strong>${item.nome}</strong>
                            <span class="setinha">▼</span>
                        </div>
                        <div class="detalhes-item-modal">
                            <p>${item.tipo || ""}</p>
                            <p>${item.descricao || "Sem descrição."}</p>
                            <p><small>${detalhesTecnicos}</small></p>
                            <button class="btn-adicionar">Adicionar</button>
                        </div>
                    `;

                    // Evento da Flechinha (Abre/Fecha)
                    card.querySelector('.item-header-modal').onclick = (e) => {
                        e.stopPropagation();
                        card.classList.toggle('aberto');
                    };

                    // Evento do Botão Adicionar
                    card.querySelector('.btn-adicionar').onclick = () => {
                        adicionarAoInventario(item, categoria);
                    };

                    container.appendChild(card);
                }
            });
        }
    }
}
// Função simples para abrir/fechar o card no modal
window.toggleCardModal = function(elemento) {
    // Busca o pai .card-item-catalogo e alterna a classe aberto
    const card = elemento.closest('.card-item-catalogo');
    if (card) card.classList.toggle('aberto');
};
// Função de Filtro (Certifique-se que o HTML chama exatamente este nome)
window.filtrarItensModal = function() {
    console.log("Filtrando itens...");
    renderizarItensModal();
};
let draggingIndex = null;
function renderizarInventarioFicha() {
    const container = document.getElementById('lista-inventario');
    container.innerHTML = "";

    // Zerar contadores de categoria antes de somar
    let contagem = { 1: 0, 2: 0, 3: 0, 4: 0 };
    let pesoTotal = 0;

    const itens = window.fichaAtualDados.inventario || [];

    itens.forEach((item, index) => {
        // Soma Categoria e Peso
        const catParaExibir = item.categoriaTotal !== undefined ? item.categoriaTotal : (parseInt(item.categoria) || 0);
        if (catParaExibir > 0 && catParaExibir <= 4) {
            contagem[catParaExibir]++;
        }
        pesoTotal += (parseInt(item.espaco) || 0);

        let htmlMelhorias = "";
        if (item.melhorias && item.melhorias.length > 0) {
            htmlMelhorias = `<div class="container-melhorias-lista">`;
            item.melhorias.forEach(mod => {
                htmlMelhorias += `
                    <div class="melhoria-item-ficha">
                        <strong>Melhoria: ${mod.nome.toUpperCase()}</strong>
                        <p>${mod.descricao || "Sem descrição."}</p>
                    </div>`;
            });
            htmlMelhorias += `</div>`;
        }

        // Criar o Card
        const card = document.createElement('div');
        card.className = 'card-item';
        card.setAttribute('draggable', 'true'); // Permite arrastar
        card.setAttribute('data-index', index); // Salva a posição original
        // Eventos de Drag and Drop
        card.ondragstart = (e) => draggingIndex = index;
        card.ondragover = (e) => e.preventDefault();
        card.ondrop = (e) => handleDrop(index);
        card.addEventListener('dragstart', (e) => {
            draggingIndex = index;
            card.classList.add('arrastando');
            e.dataTransfer.effectAllowed = 'move';
        });
        // Quando termina de arrastar
        card.addEventListener('dragend', () => {
            card.classList.remove('arrastando');
            document.querySelectorAll('.card-item').forEach(c => c.classList.remove('drag-over'));
        });
        // Quando o item arrastado passa por cima deste card
        card.addEventListener('dragover', (e) => {
            e.preventDefault(); // Necessário para permitir o drop
            card.classList.add('drag-over');
        });
        // Quando o item sai de cima deste card
        card.addEventListener('dragleave', () => {
            card.classList.remove('drag-over');
        });
        // Quando solta o item aqui
        card.addEventListener('drop', (e) => {
            e.preventDefault();
            handleDrop(index);
        });
        if (item.melhorias && item.melhorias.length > 0) card.classList.add('item-melhorado');
        card.innerHTML = `
            <div class="item-principal" onclick="this.parentElement.classList.toggle('aberto')">
                <span><strong>${item.nome}</strong> (${item.espaco} Esp. | Categoria ${catParaExibir})</span>
                <span class="setinha">▼</span>
            </div>
            <div class="detalhes-item">
                ${item.tipo ? `<p>${item.tipo}</p>` : ''}
                <p>${item.descricao || ""}</p>
                ${item.dano ? `<p>⚔️ Dano: ${item.dano} | Crítico: ${item.critico}</p>` : ''}
                ${item.tipoDano ? `<p>⚔️ Tipo de Dano: ${item.tipoDano} | Alcance: ${item.alcance}</p>` : ''}
                ${item.defesa ? `<p>🛡️ Defesa: ${item.defesa}</p>` : ''}
                ${item.Elemento ? `<p>🌀 Elemento: ${item.Elemento}</p>` : ''}
                ${item.habilidade ? `<p>🌀 Habilidade: ${item.habilidade}</p>` : ''}
                ${htmlMelhorias}
                <button class="btn-remover" onclick="removerItem(${index})">Remover</button>
                <button class="btn-melhorar" onclick="abrirModalMelhorias(${index})"> ⚙️ Melhorar </button>
                <button class="btn-editar" onclick="abrirEdicaoItem(${index})">✏️ Editar</button>
            </div>
        `;
        container.appendChild(card);
    });

    // Atualizar os números na tabela de limites
    for (let i = 1; i <= 4; i++) {
        const elemento = document.getElementById(`atual-cat${i}`);
        if (elemento) elemento.innerText = contagem[i];
    }
    // Atualizar o peso atual no input
    document.getElementById('carga-atual').value = pesoTotal;
    atualizarBarraCarga();
}
window.removerItem = function(index) {
    if (!window.fichaAtualDados.inventario) return;
    
    // Remove do array
    window.fichaAtualDados.inventario.splice(index, 1);
    
    // Atualiza a tela
    renderizarInventarioFicha();
    sincronizarDefesaComInventario();
    
    // Opcional: Salva no Firebase
    if (typeof salvarFicha === 'function') salvarFicha();
};
function sincronizarDefesaComInventario() {
    const itens = window.fichaAtualDados?.inventario || [];
    let bonusTotalDefesa = 0;
    let nomesProtecoes = [];

    // Filtramos o que é proteção (itens que possuem o atributo defesa)
    itens.forEach(item => {
        if (item.defesa && item.defesa > 0) {
            bonusTotalDefesa += parseInt(item.defesa);
            nomesProtecoes.push(`${item.nome} (${item.defesa})`);
        }
    });

    // Atualiza o campo "Equipamentos" na Defesa
    const campoDefEquip = document.getElementById('def-equip');
    if (campoDefEquip) campoDefEquip.value = bonusTotalDefesa;

    // Atualiza a lista de texto "Proteção"
    const campoProtecaoTexto = document.getElementById('protecao');
    if (campoProtecaoTexto) campoProtecaoTexto.value = nomesProtecoes.join(", ");

    // Recalcula o total (10 + AGI + Equipamentos...)
    if (typeof calcularDefesaEReacoes === "function") {
        calcularDefesaEReacoes();
    }
}
/* ============================================================
   22. editar item
============================================================ */
let itemIndexSendoEditado = null;
window.abrirEdicaoItem = function(index) {
    itemIndexSendoEditado = index;
    const item = window.fichaAtualDados.inventario[index];

    let defesaLimpa = 0;
    if (item.defesa) {
        // Remove o "+" se existir e converte para número
        defesaLimpa = parseInt(String(item.defesa).replace('+', '')) || 0;
    }

    // Preenche todos os campos com o que já existe (ou vazio)
    document.getElementById('edit-item-nome').value = item.nome || "";
    document.getElementById('edit-item-espaco').value = item.espaco || 0;
    document.getElementById('edit-item-categoria').value = item.categoria || 0;
    document.getElementById('edit-item-tipo').value = item.tipo || "";
    document.getElementById('edit-item-dano').value = item.dano || "";
    document.getElementById('edit-item-critico').value = item.critico || "";
    document.getElementById('edit-item-tipoDano').value = item.tipoDano || "";
    document.getElementById('edit-item-alcance').value = item.alcance || "";
    document.getElementById('edit-item-defesa').value = defesaLimpa || 0;
    document.getElementById('edit-item-desc').value = item.descricao || "";
    document.getElementById('edit-item-habilidade').value = item.habilidade || "";

    document.getElementById('modal-editar-item').classList.remove('modal-oculto');

    const campoNomes = document.getElementById('edit-item-melhorias-nome');
    const campoDescs = document.getElementById('edit-item-melhorias');

    if (item.melhorias && item.melhorias.length > 0) {
        // Junta os nomes separados por vírgula
        campoNomes.value = item.melhorias.map(m => m.nome).join(", ");
        
        // Junta as descrições em linhas diferentes
        campoDescs.value = item.melhorias.map(m => `${m.nome}: ${m.descricao}`).join("\n");
    } else {
        campoNomes.value = "";
        campoDescs.value = "";
    }

};
window.salvarMudancasItem = function() {
    if (itemIndexSendoEditado === null) return;

    const item = window.fichaAtualDados.inventario[itemIndexSendoEditado];

    // Atualiza o objeto com os novos valores dos inputs
    item.nome = document.getElementById('edit-item-nome').value;
    item.espaco = parseInt(document.getElementById('edit-item-espaco').value) || 0;
    item.categoria = parseInt(document.getElementById('edit-item-categoria').value) || 0;
    item.tipo = document.getElementById('edit-item-tipo').value;
    item.dano = document.getElementById('edit-item-dano').value;
    item.critico = document.getElementById('edit-item-critico').value;
    item.tipoDano = document.getElementById('edit-item-tipoDano').value;
    item.alcance = document.getElementById('edit-item-alcance').value;
    item.defesa = parseInt(document.getElementById('edit-item-defesa').value) || 0;
    item.descricao = document.getElementById('edit-item-desc').value;
    item.habilidade = document.getElementById('edit-item-habilidade').value;
    const textoNomes = document.getElementById('edit-item-melhorias-nome').value;
    const textoDescs = document.getElementById('edit-item-melhorias').value;

    // Criamos listas a partir do que foi digitado
    const listaNomes = textoNomes.split(',').map(n => n.trim()).filter(n => n !== "");
    // Divide as descrições por linha
    const listaDescs = textoDescs.split('\n').map(d => d.trim()).filter(d => d !== "");

    // Reconstruímos o array de melhorias
    // Nota: isso manterá os nomes e descrições novos que você digitou
    item.melhorias = listaNomes.map((nome, i) => {
        // Tenta pegar a descrição correspondente à linha, ou usa uma padrão
        let descLimpa = listaDescs[i] || "";
        // Se a descrição começar com "Nome: ", removemos para não duplicar
        descLimpa = descLimpa.replace(new RegExp(`^${nome}:?\\s*`, 'i'), '');

        return {
            nome: nome,
            descricao: descLimpa,
            categoriaMod: item.melhorias && item.melhorias[i] ? item.melhorias[i].categoriaMod : 0
        };
    });

    // Se o item tem defesa, precisamos sincronizar a defesa total da ficha
    if (item.defesa > 0) sincronizarDefesaComInventario();

    fecharModalEditar();
    renderizarInventarioFicha(); // Re-gera os cards com os novos dados
    salvarFicha(); // Envia para o Firebase
};
window.fecharModalEditar = function() {
    document.getElementById('modal-editar-item').classList.add('modal-oculto');
    itemIndexSendoEditado = null;
};
/* ============================================================
   23. Arrastar
============================================================ */
function handleDrop(targetIndex) {
    if (draggingIndex === null || draggingIndex === targetIndex) return;

    const inventario = window.fichaAtualDados.inventario;
    
    // Pega o item que estava sendo arrastado
    const itemMovido = inventario.splice(draggingIndex, 1)[0];
    
    // Insere ele na nova posição
    inventario.splice(targetIndex, 0, itemMovido);

    draggingIndex = null;
    
    // Redesenha a lista na ordem nova
    renderizarInventarioFicha();
}
/* ============================================================
   24. Maldições e Modificações
============================================================ */
let dadosMelhoriasCache = null;
let itemSendoMelhoradoIndex = null;
let melhoriasSelecionadas = [];
async function carregarMelhorias() {
    try {
        const response = await fetch('melhorias.json'); // Caminho do seu arquivo
        const dados = await response.json();
        return dados;
    } catch (erro) {
        console.error("Erro ao carregar o arquivo melhorias.json:", erro);
        return { maldicoes: [], modificacoes: [] };
    }
}
function renderizarMelhoriasFiltradas() {
    const busca = document.getElementById('busca-melhoria').value.toLowerCase();
    const listaMod = document.getElementById('lista-modificacoes');
    const listaMal = document.getElementById('lista-maldicoes');

    listaMod.innerHTML = "";
    listaMal.innerHTML = "";

    // Função interna para criar o card estilo catálogo
    const criarCardMelhoria = (m) => {
        const jaPossui = melhoriasSelecionadas.some(jaTem => jaTem.id === m.id);
        const card = document.createElement('div');
        card.className = `card-item-catalogo ${jaPossui ? 'selecionado' : ''}`;
        
        card.innerHTML = `
            <div class="item-header-modal" onclick="this.parentElement.classList.toggle('aberto')">
                <div class="check-e-nome">
                    <input type="checkbox" ${jaPossui ? 'checked' : ''} 
                        onclick="event.stopPropagation();" 
                        onchange="toggleMelhoria('${m.id}', '${m.nome}', ${m.categoriaMod}, '${m.elemento || 'Nenhum'}', this)">
                    <strong>${m.nome}</strong>
                </div>
                <span class="setinha">▼</span>
            </div>
            <div class="detalhes-item-modal">
                <p><strong>Categoria:</strong> +${m.categoriaMod}</p>
                ${m.elemento ? `<p><strong>Elemento:</strong> ${m.elemento}</p>` : ''}
                <p>${m.descricao || "Sem descrição disponível."}</p>
            </div>
        `;
        return card;
    };

    // Renderizar Modificações
    dadosMelhoriasCache.modificacoes.forEach(mod => {
        if (mod.nome.toLowerCase().includes(busca)) {
            listaMod.appendChild(criarCardMelhoria(mod));
        }
    });

    // Renderizar Maldições
    dadosMelhoriasCache.maldicoes.forEach(mal => {
        if (mal.nome.toLowerCase().includes(busca)) {
            listaMal.appendChild(criarCardMelhoria(mal));
        }
    });

    atualizarPreviewCategoria();
}
window.filtrarMelhorias = function() {
    renderizarMelhoriasFiltradas();
};
// 2. Filtra as melhorias baseadas no tipo do item
async function obterMelhoriasDisponiveis(tipoBusca) {
    const dados = await carregarMelhorias();
    
    console.log("--- DEBUG MELHORIAS ---");
    console.log("O que o sistema pediu:", tipoBusca);
    console.log("O que tem no JSON (Maldicoes):", dados.maldicoes);

    const maldicoesFiltradas = (dados.maldicoes || []).filter(m => {
        console.log(`Comparando: ${m.tipo} === ${tipoBusca}`);
        return m.tipo === tipoBusca;
    });

    const modificacoesFiltradas = (dados.modificacoes || []).filter(m => m.tipo === tipoBusca);

    console.log("Resultado do filtro:", maldicoesFiltradas.length, "itens encontrados.");
    console.log("-----------------------");

    return { 
        maldicoes: maldicoesFiltradas, 
        modificacoes: modificacoesFiltradas 
    };
}
async function abrirModalMelhorias(index) {
    itemSendoMelhoradoIndex = index;
    const item = window.fichaAtualDados.inventario[index];
    
    const dePara = {
        "armas": "armas",
        "acessorios": "acessorios",
        "protecoes": "protecoes",
        "municoes": "municoes",
        "paranormais": "paranormais"
    };

    let tipoParaBusca = dePara[item.origemEquipamento] || "acessorios";
    
    // Carrega e armazena no cache para a busca em tempo real funcionar
    dadosMelhoriasCache = await obterMelhoriasDisponiveis(tipoParaBusca);
    melhoriasSelecionadas = item.melhorias ? [...item.melhorias] : [];

    document.getElementById('titulo-melhoria-item').innerText = `Melhorar: ${item.nome}`;
    document.getElementById('modal-melhorias').classList.remove('modal-oculto');
    
    renderizarMelhoriasFiltradas();
}
function toggleMelhoria(id, nome, categoriaMod, elemento, checkbox) {
    if (checkbox.checked) {
        // Vamos buscar a descrição direto do cache (memória) ao invés do HTML
        let descricao = "Sem descrição disponível.";
        
        // Procura a melhoria na lista de modificações
        let melhoriaEncontrada = dadosMelhoriasCache.modificacoes.find(m => m.id === id);
        
        // Se não achou nas modificações, procura nas maldições
        if (!melhoriaEncontrada) {
            melhoriaEncontrada = dadosMelhoriasCache.maldicoes.find(m => m.id === id);
        }
        
        // Se achou, pega a descrição verdadeira dela
        if (melhoriaEncontrada && melhoriaEncontrada.descricao) {
            descricao = melhoriaEncontrada.descricao;
        }

        melhoriasSelecionadas.push({ 
            id: id, 
            nome: nome, 
            categoriaMod: categoriaMod, 
            elemento: elemento,
            descricao: descricao // Descrição puxada com segurança!
        });

        // Adiciona a bordinha vermelha (opcional visual)
        const card = checkbox.closest('.card-item-catalogo');
        if (card) card.classList.add('selecionado');

    } else {
        // Remove da lista se desmarcar
        melhoriasSelecionadas = melhoriasSelecionadas.filter(m => m.id !== id);
        
        const card = checkbox.closest('.card-item-catalogo');
        if (card) card.classList.remove('selecionado');
    }
    
    // Atualiza o cálculo matemático lá embaixo no modal
    atualizarPreviewCategoria();
}
function atualizarPreviewCategoria() {
    const item = window.fichaAtualDados.inventario[itemSendoMelhoradoIndex];
    const base = parseInt(item.categoria) || 0;
    const adicional = melhoriasSelecionadas.reduce((acc, curr) => acc + curr.categoriaMod, 0);
    document.getElementById('categoria-preview').innerText = base + adicional;
}
function salvarMelhoriasItem() {
    const item = window.fichaAtualDados.inventario[itemSendoMelhoradoIndex];
    
    // Salva o array completo de melhorias selecionadas
    item.melhorias = [...melhoriasSelecionadas];
    
    // Calcula a Categoria Total (Base + Melhorias)
    const categoriaBase = parseInt(item.categoria) || 0;
    const adicional = melhoriasSelecionadas.reduce((acc, curr) => acc + curr.categoriaMod, 0);
    item.categoriaTotal = categoriaBase + adicional;
    
    // Criamos uma string formatada para exibir no card
    item.textoMelhorias = melhoriasSelecionadas.map(m => m.nome).join(", ");

    fecharModalMelhorias();
    renderizarInventarioFicha(); // Re-renderiza para mostrar as mudanças
    
    // Opcional: Salvar no banco de dados
    if (typeof salvarFicha === 'function') salvarFicha();
}
function fecharModalMelhorias() {
    const modal = document.getElementById('modal-melhorias');
    
    if (modal) {
        // 1. Adiciona a classe que esconde o modal (CSS: .modal-oculto { display: none; })
        modal.classList.add('modal-oculto');
        
        // 2. Reseta as variáveis de controle para o próximo item
        itemSendoMelhoradoIndex = null;
        melhoriasSelecionadas = [];
        
        // 3. Opcional: Limpa o campo de busca para não abrir filtrado na próxima vez
        const campoBusca = document.getElementById('busca-melhoria');
        if (campoBusca) campoBusca.value = "";
        
        console.log("Modal de melhorias fechado e variáveis resetadas.");
    } else {
        console.error("Erro: Elemento 'modal-melhorias' não encontrado no HTML.");
    }
}
window.abrirModalMelhorias = abrirModalMelhorias;
window.toggleMelhoria = toggleMelhoria;
window.salvarMelhoriasItem = salvarMelhoriasItem;
window.fecharModalMelhorias = fecharModalMelhorias;
/* ============================================================
   25. Pulo de linha
============================================================ */
// Impede que o usuário pule linha no nome do personagem
document.getElementById('view-nome').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        e.preventDefault(); // Cancela o Enter
        e.target.blur();    // Tira o foco para disparar o onblur e salvar
    }
});
// Adicione isso junto aos seus Event Listeners
document.querySelectorAll('[id^="barra-"]').forEach(barra => {
    barra.addEventListener('keydown', (e) => {
        // Se apertar Enter, salva e sai da edição
        if (e.key === 'Enter') {
            e.preventDefault();
            barra.blur();
        }
    });
});
/* ============================================================
   26. Foto
============================================================ */
window.abrirModalFoto = function() {
    const urlAtual = document.getElementById('foto-personagem').src;
    document.getElementById('input-url-foto').value = urlAtual.includes('placeholder') ? "" : urlAtual;
    document.getElementById('modal-foto').classList.remove('modal-oculto');
};
window.fecharModalFoto = function() {
    document.getElementById('modal-foto').classList.add('modal-oculto');
};
window.salvarFoto = function() {
    const novaUrl = document.getElementById('input-url-foto').value;
    
    if (novaUrl) {
        // 1. Atualiza visualmente na hora
        document.getElementById('foto-personagem').src = novaUrl;
        
        // 2. Salva no objeto da ficha
        if (!window.fichaAtualDados) window.fichaAtualDados = {};
        window.fichaAtualDados.fotoUrl = novaUrl;
        
        // 3. Envia para o Firebase
        salvarFicha();
        fecharModalFoto();
    }
};
/* ============================================================
   27. Excluir Ficha
============================================================ */
// Localize o botão no seu código
const btnExcluir = document.querySelector('.btn-excluir-ficha');
if (btnExcluir) {
    btnExcluir.addEventListener('click', async () => {
        // 1. Verificação de segurança
        if (!idFichaAberta) {
            alert("Erro: Nenhuma ficha selecionada para exclusão.");
            return;
        }

        const confirmacao = confirm("⚠️ TEM CERTEZA? Isso excluirá o personagem permanentemente e não pode ser desfeito!");

        if (confirmacao) {
            try {
                // 2. Referência do documento no Firebase
                const fichaRef = doc(db, "personagens", idFichaAberta);

                // 3. Deleta o documento
                await deleteDoc(fichaRef);

                alert("Personagem eliminado dos registros.");

                // 4. Volta para a tela de seleção de personagens
                voltarParaLista();

            } catch (error) {
                console.error("Erro ao excluir ficha:", error);
                alert("Erro ao excluir: " + error.message);
            }
        }
    });
}
// Função auxiliar para resetar a tela após a exclusão
function voltarParaLista() {
    // Esconde a tela de visualização
    document.getElementById('Visualizar_Ficha').classList.add('oculta');
    document.getElementById('Visualizar_Ficha').classList.remove('ativa');

    // Mostra a tela de seleção/lista (ajuste o ID conforme seu HTML)
    const telaLista = document.getElementById('Fichas')
    if (telaLista) {
        telaLista.classList.remove('oculta');
        telaLista.classList.add('ativa');
    }

    // Limpa os dados da memória
    idFichaAberta = null;
    window.fichaAtualDados = null;

    // Recarrega a lista de cards para não mostrar a ficha que acabou de ser deletada
    if (typeof carregarPersonagens === 'function') {
        carregarPersonagens();
    }
}
/* ============================================================
   28. Salva
============================================================ */
async function salvarFicha() {
    if (!idFichaAberta || !window.fichaAtualDados) {
        console.warn("Tentativa de salvar sem ficha aberta.");
        return;
    }

    // Funções auxiliares internas (mantidas do seu original)
    const getVal = (id, padrao = "") => {
        const el = document.getElementById(id);
        if (!el) {
            console.warn(`Atenção: Elemento com ID '${id}' não encontrado no HTML.`);
            return padrao;
        }
        return el.value;
    };

    // Função para capturar números com segurança
    const getNum = (id, padrao = 0) => {
        const val = getVal(id, padrao);
        return parseInt(val) || padrao;
    };

    try {
        const fichaRef = doc(db, "personagens", idFichaAberta);

        // Coletando dados (Aqui incluímos o NOME que vem do innerText do h1)
        const dadosParaSalvar = {
            nome: document.getElementById('view-nome').innerText,
            fotoUrl: document.getElementById('foto-personagem').src,
            nex: getNum('edit-nex', 5),
            jogador: getVal('edit-jogador'),
            trilha: getVal('edit-trilha'),
            afinidade: getVal('edit-afinidade'),
            peTurno: getNum('edit-pe-turno', 1),
            pdLimite: getNum('edit-pd-limite', 1),
            deslocamento: {
                metros: parseFloat(getVal('edit-deslocamento-metros', 9)) || 9,
                grid: getNum('edit-deslocamento-grid', 6)
            },
            atributos: {
                FOR: getNum('edit-for'),
                AGI: getNum('edit-agi'),
                INT: getNum('edit-int'),
                VIG: getNum('edit-vig'),
                PRE: getNum('edit-pre')
            },
            detalhes: {
                aparencia: getVal('edit-aparencia'),
                historico: getVal('edit-historico'),
                objetivo: getVal('edit-objetivo'),
                nota: getVal('edit-nota'),
                personalidade: getVal('edit-personalidade')
            },
            defesa: {
                equip: getNum('def-equip'),
                outros: getNum('def-outros'),
                bloqueio: getVal('bloqueio'),
                esquiva: getVal('esquiva'),
                protecao: getVal('protecao'),
                resistencia: getVal('resistencias'),
                proficiencia: getVal('proficiencias')
            },
            prestigio: parseInt(getVal('edit-prestigio')) || 0,
            inventarioConfig:{
                cargaAtual: getNum('carga-atual'),
                cargaMax: getNum('carga-max')
            },
            inventario: window.fichaAtualDados.inventario || []
        };

        // Coleta das barras (PV, PE, SAN, PD)
        const pegarStatusBarra = (id) => {
            const barra = document.getElementById(id);
            if (!barra) return { atual: 0, max: 0 };
            const partes = barra.innerText.split('/');
            return {
                atual: parseInt(partes[0]) || 0,
                max: parseInt(partes[1]) || 0
            };
        };

        dadosParaSalvar.status = {
            pvMax: pegarStatusBarra('barra-pv').max,
            pvAtual: pegarStatusBarra('barra-pv').atual,
            peMax: pegarStatusBarra('barra-pe').max,
            peAtual: pegarStatusBarra('barra-pe').atual,
            sanMax: pegarStatusBarra('barra-san').max,
            sanAtual: pegarStatusBarra('barra-san').atual,
            pdMax: pegarStatusBarra('barra-pd').max,
            pdAtual: pegarStatusBarra('barra-pd').atual,
        };

        // Perícias
        const pericias = {};
        const outrosBonus = {};
        document.querySelectorAll('.select-treino').forEach(sel => {
            pericias[sel.getAttribute('data-pericia')] = parseInt(sel.value) || 0;
        });
        document.querySelectorAll('.input-outros').forEach(inp => {
            outrosBonus[inp.getAttribute('data-pericia')] = parseInt(inp.value) || 0;
        });

        dadosParaSalvar.pericias = pericias;
        dadosParaSalvar.outrosBonus = outrosBonus;

        //Regras
        dadosParaSalvar.regras = {
            semSanidade: document.getElementById('opt-sem-sanidade').checked,
            nexExp: document.getElementById('opt-nex-exp').checked
        },

        // Executa o update
        await updateDoc(fichaRef, dadosParaSalvar);
        console.log("Ficha sincronizada com Firebase!");
        
        window.fichaAtualDados = { ...window.fichaAtualDados, ...dadosParaSalvar };

    } catch (error) {
        console.error("Erro ao salvar:", error);
        alert("Erro ao salvar: " + error.message);
    }
}
const btnSalvar = document.querySelector('.btn-salvar-alteracoes');
if (btnSalvar) {
    btnSalvar.addEventListener('click', () => {
        salvarFicha();
        alert("Alterações salvas!");
    });
}
window.salvarCampoSimples = function(campo, valor) {
    if (!window.fichaAtualDados) return;

    // Atualiza o valor na memória local primeiro
    window.fichaAtualDados[campo] = valor.trim();
    
    // Chama a função de salvamento que acabamos de criar
    salvarFicha();
};
window.salvarStatusBarra = function(tipo, textoCompleto) {
    if (!window.fichaAtualDados) return;

    // 1. Divide o texto pela barra "/"
    const partes = textoCompleto.split('/');
    
    // 2. Limpa os valores e transforma em números
    const atual = parseInt(partes[0]) || 0;
    const max = partes[1] ? parseInt(partes[1]) : atual; // Se não digitar o max, assume que é igual ao atual

    // 3. Atualiza o objeto na memória (seguindo a estrutura do seu Firebase)
    if (!window.fichaAtualDados.status) window.fichaAtualDados.status = {};
    
    // Mapeia os nomes das propriedades conforme seu código de salvamento
    window.fichaAtualDados.status[`${tipo}Atual`] = atual;
    window.fichaAtualDados.status[`${tipo}Max`] = max;

    console.log(`📊 Status ${tipo.toUpperCase()} atualizado: ${atual}/${max}`);

    // 4. Dispara o salvamento automático
    salvarFicha();
};
// Tornamos a função global para que o 'onblur' do HTML consiga achar ela
window.salvarFicha = salvarFicha;
// Expõe a função para o Window para que o auth.js possa chamá-la no login
window.carregarPersonagens = carregarPersonagens;