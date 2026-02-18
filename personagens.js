// Mantenha suas importações do config
import { auth, db, serverTimestamp } from './firebase-config.js';
import { 
    collection, 
    addDoc, 
    query, 
    where, 
    getDocs 
} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";

// Variáveis para armazenar as seleções feitas nas abas
let escolhaOrigemId = null;
let escolhaClasseId = null;
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
    
    // Se você seguiu o HTML sugerido anteriormente:
    const campoClasse = document.getElementById('view-classe');
    const campoOrigem = document.getElementById('view-origem');
    const campoNex = document.getElementById('view-nex');

    if (campoClasse) campoClasse.innerText = formatar(dados.classe);
    if (campoOrigem) campoOrigem.innerText = formatar(dados.origem);
    if (campoNex) campoNex.innerText = (dados.nex || 5) + "%";

    // B. Atributos (FOR, AGI, INT, VIG, PRE)
    if (dados.atributos) {
        // Tenta preencher cada atributo se o ID existir no HTML
        const listaAtrib = ['for', 'agi', 'int', 'vig', 'pre'];
        listaAtrib.forEach(at => {
            const el = document.getElementById(`view-${at}`);
            if (el) el.innerText = dados.atributos[at.toUpperCase()] || 0;
        });
    }

    // C. Status (PV, PE, SAN)
    if (dados.status) {
        const pvs = document.getElementById('view-pv');
        const pes = document.getElementById('view-pe');
        const sans = document.getElementById('view-san');

        function atualizarBarra(idBarra, atual, max) {
        const barra = document.getElementById(idBarra);
            if (barra) {
                barra.style.width = `${(atual / max) * 100}%`;
                barra.innerText = `${atual} / ${max}`;
            }
        }

        if (dados.status) {
            atualizarBarra('barra-pv', dados.status.pvAtual, dados.status.pvMax);
            atualizarBarra('barra-pe', dados.status.peAtual, dados.status.peMax);
            atualizarBarra('barra-san', dados.status.sanAtual, dados.status.sanMax);
        }
    }

    // D. LISTAGEM DE TODAS AS PERÍCIAS
    const listaPericiasContainer = document.getElementById('pericias-agente'); 
    if (listaPericiasContainer) {
        listaPericiasContainer.innerHTML = ""; // Limpa a lista atual

        // Criamos uma div ou ul para organizar em colunas no futuro se quiser
        TODAS_PERICIAS.forEach(pericia => {
            // Verifica se essa perícia específica está no objeto 'pericias' do personagem
            // Se estiver, pega o valor (5), se não, o bônus é 0
            const bonus = (dados.pericias && dados.pericias[pericia]) ? dados.pericias[pericia] : 0;

            const itemPericia = document.createElement('div');
            itemPericia.className = 'item-pericia';
            
            // Damos um estilo diferente (negrito ou cor) para quem é treinado (+5)
            if (bonus > 0 && bonus < 9) {
                itemPericia.style.color = "#165336"; // Verde para perícias treinadas
                itemPericia.style.fontWeight = "bold";
            } else if (bonus > 9 && bonus < 14){
                itemPericia.style.color = "#113CA1"; // Azul para perícias treinadas
                itemPericia.style.fontWeight = "bold";
            } else if (bonus > 14){
                itemPericia.style.color = "#B36B03"; // Amarelo para perícias treinadas
                itemPericia.style.fontWeight = "bold";
            } else {
                itemPericia.style.color = "#ccc"; // Cinza para não treinadas
            }

            itemPericia.innerHTML = `<span>${pericia}</span> <span>+${bonus}</span>`;
            listaPericiasContainer.appendChild(itemPericia);
        });
    };

    // E. DETALHES (Histórico, Aparência e Objetivo)
    // Note que usamos o operador ?. (optional chaining) para evitar erro caso 'detalhes' não exista
    const campoHistorico = document.getElementById('view-historico');
    const campoAparencia = document.getElementById('view-aparencia');
    const campoObjetivo = document.getElementById('view-objetivo');

    if (campoHistorico) {
        campoHistorico.innerText = dados.detalhes?.historico || "Nenhum histórico registrado.";
    }

    if (campoAparencia) {
        campoAparencia.innerText = dados.detalhes?.aparencia || "Nenhuma descrição física disponível.";
    }

    if (campoObjetivo) {
        campoObjetivo.innerText = dados.detalhes?.objetivo || "O agente ainda não definiu seus planos na Ordem.";
    }
}

// Expõe a função para o Window para que o auth.js possa chamá-la no login
window.carregarPersonagens = carregarPersonagens;