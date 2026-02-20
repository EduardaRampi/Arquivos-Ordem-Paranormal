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
        } else {
            containerNivel.classList.add('oculta');
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
        } else {
            // DESLIGADO: Volta ao padrão
            contSanidade.classList.remove('ocuta');
            contPETURNO.classList.remove('ocuta');
            contPE.classList.remove('ocuta');
            contPD.classList.add('ocuta');
            contPDLIMITE.classList.add('ocuta');
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
function adicionarAoInventario(item) {
    const itemInstanciado = { 
        ...item, 
        idUnico: Date.now() + Math.random().toString(36).substr(2, 9) 
    };

    if (!window.fichaAtualDados) window.fichaAtualDados = {}; // Proteção caso esteja vazio
    if (!window.fichaAtualDados.inventario) {
        window.fichaAtualDados.inventario = [];
    }
    window.fichaAtualDados.inventario.push(itemInstanciado);

    const campoCarga = document.getElementById('carga-atual');
    let cargaNova = (parseInt(campoCarga.value) || 0) + (parseInt(item.espaco) || 0);
    campoCarga.value = cargaNova;

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
                    if (item.categoria) detalhesTecnicos += `<strong>Categoria:</strong> ${item.categoria}`;

                    card.innerHTML = `
                        <div class="item-header-modal">
                            <strong>${item.nome}</strong>
                            <span class="setinha">▼</span>
                        </div>
                        <div class="detalhes-item-modal">
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
                        adicionarAoInventario(item);
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
        if (item.categoria > 0) contagem[item.categoria]++;
        pesoTotal += (parseInt(item.espaco) || 0);

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
        card.innerHTML = `
            <div class="item-principal" onclick="this.parentElement.classList.toggle('aberto')">
                <span><strong>${item.nome}</strong> (${item.espaco} Esp. | Categoria ${item.categoria})</span>
                <span class="setinha">▼</span>
            </div>
            <div class="detalhes-item">
                <p>${item.descricao}</p>
                ${item.dano ? `<p>⚔️ Dano: ${item.dano} | Crítico: ${item.critico}</p>` : ''}
                ${item.defesa ? `<p>🛡️ Defesa: ${item.defesa}</p>` : ''}
                ${item.Elemento ? `<p>🌀 Elemento: ${item.Elemento}</p>` : ''}
                <button class="btn-remover" onclick="removerItem(${index})">Remover</button>
            </div>
        `;
        container.appendChild(card);
    });

    // Atualizar os números na tabela de limites
    document.getElementById('atual-cat1').innerText = contagem[1];
    document.getElementById('atual-cat2').innerText = contagem[2];
    document.getElementById('atual-cat3').innerText = contagem[3];
    document.getElementById('atual-cat4').innerText = contagem[4];

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
   22. Arrastar
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
   23. Salva
============================================================ */
const btnSalvar = document.querySelector('.btn-salvar-alteracoes');
if (btnSalvar) {
    btnSalvar.addEventListener('click', async () => {
        if (!idFichaAberta || !window.fichaAtualDados) {
            alert("Erro: Carregue a ficha antes de salvar.");
            return;
        }

        // Função auxiliar para capturar valor sem quebrar o código
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

            // Coletando dados com a função de segurança
            const dadosParaSalvar = {
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
                prestigio: parseInt(document.getElementById('edit-prestigio').value) || 0,
                inventarioConfig:{
                    cargaAtual: getNum('carga-atual'),
                    cargaMax: getNum('carga-max')
                },
                inventario: window.fichaAtualDados.inventario || []
            };

            // Coleta das barras (PV, PE, SAN)
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
            alert("Alterações salvas com sucesso!");
            
            window.fichaAtualDados = { ...window.fichaAtualDados, ...dadosParaSalvar };

        } catch (error) {
            console.error("Erro completo:", error);
            alert("Erro ao salvar: " + error.message);
        }
    });
}

// Expõe a função para o Window para que o auth.js possa chamá-la no login
window.carregarPersonagens = carregarPersonagens;