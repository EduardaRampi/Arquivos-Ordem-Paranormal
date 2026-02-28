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
const TRILHAS = {
    combatente: ["Aniquilador", "Guerreiro", "Operações Especiais", "Tropa de Choque", "Comandante de Campo", "Agente Secreto", "Caçador", "Monstruoso"],
    especialista: ["Atirador de Elite", "Infiltrador", "Médico de Campo", "Negociador", "Técnico", "Bibliotecario", "Perseverante", "Muambeiro"],
    ocultista: ["Conduíte", "Flagelador", "Graduado", "Lâmina Paranormal", "Intuitivo", "Exorcista", "Possuido", "Parapsicólogo", "Maledictólogo"], 
    sobrevivente: ["Durão", "Esperto", "Esotérico"]
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
    academico: { pericias: ["Ciências", "Investigação"], poder: "Saber é Poder" }, 
    agente_de_saude: { pericias: ["Intuição", "Medicina"], poder: "Técnica Medicinal" }, 
    amnesico: { pericias: [], poder: "Vislumbres do Passado" }, 
    artista: { pericias: ["Artes", "Enganação"], poder: "Magnum Opus" }, 
    atleta: { pericias: ["Acrobacia", "Atletismo"], poder: "110%" }, 
    chef: { pericias: ["Fortitude", "Profissão"], poder: "Ingrediente Secreto", profissao: "Cozinheiro" }, 
    criminoso: { pericias: ["Crime", "Furtividade"], poder: "O Crime Compensa" }, 
    cultista_arrependido: { pericias: ["Ocultismo", "Religião"], poder: "Traços do Outro Lado" }, 
    desgarrado: { pericias: ["Fortitude", "Sobrevivência"], poder: "Calejado" }, 
    engenheiro: { pericias: ["Profissão", "Tecnologia"], poder: "Ferramenta Favorita", profissao: "Engenheiro" }, 
    executivo: { pericias: ["Diplomacia", "Profissão"], poder: "Processo Otimizado", profissao: "Executivo" }, 
    investigador: { pericias: ["Investigação", "Percepção"], poder: "Faro para Pistas" }, 
    lutador: { pericias: ["Luta", "Reflexos"], poder: "Mão Pesada" }, 
    magnata: { pericias: ["Diplomacia", "Pilotagem"], poder: "Patrocinador da Ordem" }, 
    mercenario: { pericias: ["Iniciativa", "Intimidação"], poder: "Posição de Combate" }, 
    militar: { pericias: ["Pontaria", "Tática"], poder: "Para Bellum" }, 
    operario: { pericias: ["Fortitude", "Profissão"], poder: "Ferramenta de Trabalho", profissao: "Operário" }, 
    policial: { pericias: ["Percepção", "Pontaria"], poder: "Patrulha" }, 
    religioso: { pericias: ["Religião", "Vontade"], poder: "Acalentar" }, 
    servidor_publico: { pericias: ["Intuição", "Vontade"], poder: "Espírito Cívico" }, 
    teorico_da_conspiracao: { pericias: ["Investigação", "Ocultismo"], poder: "Eu Já Sabia" }, 
    ti: { pericias: ["Investigação", "Tecnologia"], poder: "Motor de Busca" }, 
    trabalhador_rural: { pericias: ["Adestramento", "Sobrevivência"], poder: "Desbravador" }, 
    trambiqueiro: { pericias: ["Crime", "Enganação"], poder: "Impostor" }, 
    universitario: { pericias: ["Atualidades", "Investigação"], poder: "Dedicação" }, 
    vitima: { pericias: ["Reflexos", "Vontade"], poder: "Cicatrizes Psicológicas" }, 
    amigo_dos_animais: { pericias: ["Adestramento", "Percepção"], poder: "Companheiro Animal" }, 
    astronauta: { pericias: ["Ciências", "Fortitude"], poder: "Acostumado ao Extremo" }, 
    chef_do_outro_lado: { pericias: ["Ocultismo", "Profissão"], poder: "Fome do Outro Lado", profissao: "Cozinheiro" }, 
    colegial: { pericias: ["Atualidades", "Tecnologia"], poder: "Poder da Amizade" }, 
    cosplayer: { pericias: ["Artes", "Vontade"], poder: "Não é fantasia, é cosplay!" }, 
    diplomata: { pericias: ["Atualidades", "Diplomacia"], poder: "Conexões" }, 
    explorador: { pericias: ["Fortitude", "Sobrevivência"], poder: "Manual do Sobrevivente" }, 
    experimento: { pericias: ["Atletismo", "Fortitude"], poder: "Mutação" }, 
    fanatico_por_criaturas: { pericias: ["Investigação", "Ocultismo"], poder: "Conhecimento Oculto" }, 
    fotografo: { pericias: ["Artes", "Percepção"], poder: "Através da Lente" }, 
    inventor_paranormal: { pericias: ["Profissão", "Vontade"], poder: "Invenção Paranormal", profissao: "Engenheiro" }, 
    jovem_mistico: { pericias: ["Ocultismo", "Religião"], poder: "A Culpa é das Estrelas" }, 
    legista_do_turno_da_noite: { pericias: ["Ciências", "Medicina"], poder: "Luto Habitual" }, 
    mateiro: { pericias: ["Percepção", "Sobrevivência"], poder: "Mapa Celeste" }, 
    mergulhador: { pericias: ["Atletismo", "Fortitude"], poder: "Fôlego de Nadador" }, 
    motorista: { pericias: ["Pilotagem", "Reflexos"], poder: "Mãos no Volante" }, 
    nerd_entusiasta: { pericias: ["Ciências", "Tecnologia"], poder: "O Inteligentão" }, 
    profetizado: { pericias: ["Vontade"], poder: "Luta ou Fuga" }, 
    psicologo: { pericias: ["Intuição", "Profissão"], poder: "Terapia", profissao: "Psicólogo" }, 
    reporter_investigativo: { pericias: ["Atualidades", "Investigação"], poder: "Encontrar a Verdade" },
    body_builder: { pericias: ["Atletismo", "Fortitude"], poder: "Saindo da Jaula" }, 
    personal_trainer: { pericias: ["Atletismo", "Ciências"], poder: "Todo Mundo Pagando 10" }, 
    blaster: { pericias: ["Ciências", "Profissão"], poder: "Explosão Solidária", profissao: "Químico" }, 
    revoltado: { pericias: ["Furtividade", "Vontade"], poder: "Antes Só..." }, 
    duble: { pericias: ["Pilotagem", "Reflexos"], poder: "Destemido" }, 
    gauderio_abutre: { pericias: ["Luta", "Pilotagem"], poder: "Fraternidade Gaudéria" }, 
    ginasta: { pericias: ["Acrobacia", "Reflexos"], poder: "Mobilidade Acrobática" }, 
    escritor: { pericias: ["Artes", "Atualidades"], poder: "Bagagem de Leitura" }, 
    jornalista: { pericias: ["Atualidades", "Investigação"], poder: "Fontes Confiáveis" }, 
    cientista_forense: { pericias: ["Ciências", "Investigação"], poder: "Investigação Científica" }, 
    professor: { pericias: ["Ciências", "Intuição"], poder: "Aula de Campo" }, 
    ferido_por_ritual: { pericias: ["Ocultismo"], poder: "Mácula Ritualística" }, 
    transtornado_arrependido: { pericias: ["Luta", "Ocultismo"], poder: "Sofrimento de Sangue" }
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
        const nexCont = document.getElementById('container-nex');
        const estCont = document.getElementById('container-estagio');

        if (idSelecionado === 'sobrevivente') {
            if (nexCont) nexCont.classList.add('oculta');
            if (estCont) estCont.classList.remove('oculta');
            escolhaClasseId = 'sobrevivente'; // Sobrevivente também define a classe!
        } else {
            if (nexCont) nexCont.classList.remove('oculta');
            if (estCont) estCont.classList.add('oculta');
        }
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

        const proficienciasIniciais = {
            combatente: "Armas simples, armas táticas e proteções leves.",
            especialista: "Armas simples e proteções leves.",
            ocultista: "Armas simples.",
            sobrevivente: "Armas simples."
        };

        // Outras informações definidas automaticamente
        const nexInicial = (escolhaClasseId === 'sobrevivente') ? 1 : 5; 
        const statusComNex = calcularStatus(escolhaClasseId, atributos, nexInicial);
        let periciasIniciais = {};
        let habilidadesIniciais = [];
        let profissaoDefinida = "";

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

        const dadosOrigem = DADOS_ORIGENS[escolhaOrigemId];
        // Se a origem escolhida estiver no nosso dicionário...
        if (dadosOrigem) {
            // 1. Salva as Perícias
            dadosOrigem.pericias.forEach(pericia => {
                periciasIniciais[pericia] = 5;
            });

            // 2. Adiciona a Habilidade de Origem automaticamente
            if (dadosOrigem.poder) {
                const descReal = await buscarDescricaoHabilidade(dadosOrigem.poder);
                habilidadesIniciais.push({
                    nome: dadosOrigem.poder,
                    origem: formatarTextoID(escolhaOrigemId), // Define a origem correta (ex: "Academico")
                    descricao: descReal // Puxa a descrição do JSON
                });
                console.log("Habilidade de origem adicionada:", dadosOrigem.poder);
            }

            // 3. Define a profissão automática
            if (dadosOrigem.profissao) {
                profissaoDefinida = dadosOrigem.profissao;
            }

            // 4. Adiciona a Habilidade de Classe automaticamente
            const alvoClasse = HABILIDADES_INICIAIS_CLASSE[escolhaClasseId];
            if (alvoClasse) {
                // Se for um array (Especialista: Perito e Eclético)
                if (Array.isArray(alvoClasse)) {
                    for (const nomePoder of alvoClasse) {
                        const desc = await buscarDescricaoHabilidade(nomePoder);
                        habilidadesIniciais.push({
                            nome: nomePoder,
                            origem: formatarTextoID(escolhaClasseId),
                            descricao: desc
                        });
                    }
                } 
                // Se for apenas uma string (Combatente ou Sobrevivente)
                else {
                    const desc = await buscarDescricaoHabilidade(alvoClasse);
                    habilidadesIniciais.push({
                        nome: alvoClasse,
                        origem: formatarTextoID(escolhaClasseId),
                        descricao: desc
                    });
                }
            }
        }

        try {
            // Salvando no Firestore
            await addDoc(collection(db, "personagens"), {
                usuarioId: user.uid,
                nome: nomePersonagem,
                jogador: nomeJogador,
                origem: escolhaOrigemId,
                classe: escolhaClasseId,
                profissao: profissaoDefinida,
                defesa: {
                    equip: 0,
                    outros: 0,
                    protecao: "",
                    resistencia: "",
                    proficiencia: proficienciasIniciais[escolhaClasseId]
                },
                atributos: atributos,
                nex: nexInicial,
                pericias: periciasIniciais,
                habilidades: habilidadesIniciais,
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
async function buscarDescricaoHabilidade(nomePoder) {
    try {
        const resposta = await fetch('habilidades.json');
        const dados = await resposta.json();
        
        // Procura em todas as categorias do JSON (Origens, Classe, Geral, etc)
        for (let categoria in dados) {
            const lista = dados[categoria];
            if (Array.isArray(lista)) {
                const encontrou = lista.find(h => h.nome.toLowerCase() === nomePoder.toLowerCase());
                if (encontrou) return encontrou.descricao;
            }
        }
    } catch (e) {
        console.error("Erro ao ler habilidades.json", e);
    }
    return "Descrição não encontrada no arquivo de habilidades.";
}
const formatarTextoID = (t) => t ? t.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : "Origem";
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
const HABILIDADES_INICIAIS_CLASSE = {
    combatente: "Ataque Especial",
    especialista: ["Perito", "Eclético"],
    sobrevivente: "Empenho",
    ocultista: null
};
/* ============================================================
   4. CÁLCULO DE STATUS (PV, PE, SAN, PD) CONFORME NEX E ATRIBUTOS
============================================================ */
function calcularStatus(classe, atributos, nexOuEstagio = 5, ficha = null) {
    const vig = parseInt(atributos.VIG) || 0;
    const pre = parseInt(atributos.PRE) || 0;
    
    let aumentos = 0;
    const isSobrevivente = (classe === 'sobrevivente');

    // Define os aumentos dependendo do sistema
    if (isSobrevivente) {
        aumentos = (parseInt(nexOuEstagio) || 1) - 1; // Estágio 1 = 0 aumentos, Estágio 2 = 1 aumento...
    } else {
        aumentos = (parseInt(nexOuEstagio) - 5) / 5; // 5% = 0 aumentos, 10% = 1 aumento...
    }

    let base = { pv: 0, san: 0, pe: 0, pd: 0 };
    let ganho = isSobrevivente 
        ? { pv: 2, san: 2, pe: 1, pd: 2 } 
        : (PROGRESSAO_CLASSE[classe] || { pv: 2, san: 2, pe: 1, pd: 2 });

    // Valores Iniciais
    if (classe === 'combatente') {
        base = { pv: 20 + vig, san: 12, pe: 2 + pre, pd: 6 + pre };
    } else if (classe === 'especialista') {
        base = { pv: 16 + vig, san: 16, pe: 3 + pre, pd: 8 + pre };
    } else if (classe === 'ocultista') {
        base = { pv: 12 + vig, san: 20, pe: 4 + pre, pd: 10 + pre };
    } else if (isSobrevivente) {
        // Correção aplicada: PE Iniciais 2 + Pre
        base = { pv: 8 + vig, san: 8, pe: 2 + pre, pd: 4 + pre };
    }

    // Soma os ganhos
    let pvTotal = base.pv + (aumentos * (isSobrevivente ? ganho.pv : (ganho.pv + vig)));
    const peTotal = base.pe + (aumentos * (isSobrevivente ? ganho.pe : (ganho.pe + pre)));
    const sanTotal = base.san + (aumentos * ganho.san);
    
    // Sobrevivente não soma PRE aos PDs ganhos por estágio
    const pdTotal = isSobrevivente 
        ? base.pd + (aumentos * ganho.pd)
        : base.pd + (aumentos * (ganho.pd + pre));

    // --- ÁREA DE AUTOMAÇÕES ---
    const habilidades = ficha?.habilidades || window.fichaAtualDados?.habilidades || [];
    const temCalejado = habilidades.some(h => h.nome === "Calejado");

    if (temCalejado && !isSobrevivente) {
        const bonusCalejado = Math.floor(parseInt(nexOuEstagio) / 5);
        pvTotal += bonusCalejado; // Agora funciona porque usamos let lá em cima!
        console.log("🤖 Calejado Ativado! Bónus:", bonusCalejado);
    }

    // Aplicando os bônus no total calculado
    const pvFinal = pvTotal;
    return {
        nex: nexOuEstagio,
        pvMax: pvFinal, pvAtual: pvFinal,
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
    const indexReal = TABELA_PATENTES.findIndex(p => pontos >= p.pontos);
    const patenteReal = TABELA_PATENTES[indexReal];

    if (patenteReal) {
        // Atualiza textos
        document.getElementById('val-patente').innerText = patenteReal.nome;

        // Atualiza os limites na tabela
        document.getElementById('lim-cat1').innerText = patenteReal.limites[0];
        document.getElementById('lim-cat2').innerText = patenteReal.limites[1] > 0 ? patenteReal.limites[1] : "—";
        document.getElementById('lim-cat3').innerText = patenteReal.limites[2] > 0 ? patenteReal.limites[2] : "—";
        document.getElementById('lim-cat4').innerText = patenteReal.limites[3] > 0 ? patenteReal.limites[3] : "—";
        
        // Salva na memória global para uso posterior no inventário
        if (window.fichaAtualDados) {
            window.fichaAtualDados.prestigio = pontos;
            window.fichaAtualDados.patenteNome = patenteReal.nome;
        }

        const inputPDLimite = document.getElementById('edit-pd-limite');
        if (inputPDLimite) {
            inputPDLimite.value = patenteReal.limitePD;
        }

        let creditoExibido = patenteReal.credito;
        const temPatrocinador = window.fichaAtualDados?.habilidades?.some(h => h.nome === "Patrocinador da Ordem");

        if (temPatrocinador) {
            // Pegamos o crédito da PRÓXIMA patente na tabela
            const progressaoCredito = ["Baixo", "Médio", "Alto", "Ilimitado"];
            const degrauAtual = progressaoCredito.indexOf(patenteReal.credito);
            if (degrauAtual !== -1 && degrauAtual < progressaoCredito.length - 1) {
                creditoExibido = progressaoCredito[degrauAtual + 1];
                console.log(`🤖 Patrocinador: Crédito subiu de ${patenteReal.credito} para ${creditoExibido}`);
            }
        }

        // Atualiza apenas o texto do crédito na tela
        document.getElementById('val-credito').innerText = creditoExibido;

        // Salva os dados reais na ficha
        if (window.fichaAtualDados) {
            window.fichaAtualDados.prestigio = pontos;
            window.fichaAtualDados.patenteNome = patenteReal.nome;
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
    document.getElementById('edit-profissão').value = dados.profissao || ""
    document.getElementById('edit-pe-turno').value = dados.peTurno || 1;
    document.getElementById('edit-deslocamento-metros').value = dados.deslocamento?.metros || 9;
    document.getElementById('edit-deslocamento-grid').value = dados.deslocamento?.grid || 6;

    const campoClasse = document.getElementById('view-classe');
    const campoOrigem = document.getElementById('view-origem');
    const campoNex = document.getElementById('view-nex');

    if (campoClasse) campoClasse.innerText = formatar(dados.classe);
    if (campoOrigem) campoOrigem.innerText = formatar(dados.origem);
    if (campoNex) campoNex.innerText = (dados.nex || 5) + "%";
    const isSobrevivente = (dados.classe === 'sobrevivente');
    const valorNivel = parseInt(dados.nex) || (isSobrevivente ? 1 : 5);
    const contNex = document.getElementById('container-nex');
    const contEstagio = document.getElementById('container-estagio');
    const selectNex = document.getElementById('edit-nex');
    const selectEstagio = document.getElementById('edit-estagio');

    if (isSobrevivente) {
        if (contNex) contNex.classList.add('ocuta');
        if (contEstagio) contEstagio.classList.remove('oculta');
        if (selectEstagio) selectEstagio.value = valorNivel;
    } else {
        if (contNex) contNex.classList.remove('ocuta');
        if (contEstagio) contEstagio.classList.add('oculta');
        if (selectNex) selectNex.value = valorNivel;
    }

    // Limite calculado para exibir
    let limiteCalculado;
    if (isSobrevivente) {
        limiteCalculado = valorNivel; // O limite do sobrevivente é igual ao Estágio
    } else {
        limiteCalculado = (valorNivel === 99) ? 20 : Math.floor(valorNivel / 5);
    }
    document.getElementById('edit-pe-turno').value = dados.peTurno || limiteCalculado;

    atualizarOpcoesTrilha(dados.classe, valorNivel, dados.trilha);
    atualizarOpcoesAfinidade(valorNivel, dados.afinidade);

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
            if (campoProficiencias) {
            const PROFICIENCIAS_MAP = {
                combatente: "Armas simples, armas táticas e proteções leves.",
                especialista: "Armas simples e proteções leves.",
                ocultista: "Armas simples.",
                sobrevivente: "Armas simples."
            };
            if (!dados.defesa?.proficiencia || dados.defesa.proficiencia === "") {
                campoProficiencias.value = PROFICIENCIAS_MAP[dados.classe] || "Armas simples.";
            } else {
                campoProficiencias.value = dados.defesa.proficiencia;
            }
        }
        
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

    // J. Inventário / Habilidades
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
    renderizarHabilidadesFicha();
    if (typeof window.renderizarRituaisFicha === 'function') {
        window.renderizarRituaisFicha();
    }

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
============================================================ */
document.addEventListener('change', (e) => {
    // Reage se for tanto NEX quanto ESTÁGIO
    if (e.target.id === 'edit-nex' || e.target.id === 'edit-estagio') {
        const novoValor = parseInt(e.target.value);
        const dados = window.fichaAtualDados;

        if (dados) {
            const atributosTela = {
                FOR: parseInt(document.getElementById('edit-for').value) || 0,
                AGI: parseInt(document.getElementById('edit-agi').value) || 0,
                INT: parseInt(document.getElementById('edit-int').value) || 0,
                VIG: parseInt(document.getElementById('edit-vig').value) || 0,
                PRE: parseInt(document.getElementById('edit-pre').value) || 0
            };

            const novosStatus = calcularStatus(dados.classe, atributosTela, novoValor, window.fichaAtualDados);
            
            atualizarBarraVisual('pv', novosStatus.pvMax, novosStatus.pvMax);
            atualizarBarraVisual('pe', novosStatus.peMax, novosStatus.peMax);
            atualizarBarraVisual('san', novosStatus.sanMax, novosStatus.sanMax);
            atualizarBarraVisual('pd', novosStatus.pdMax, novosStatus.pdMax);
            
            window.fichaAtualDados.atributos = atributosTela;
            window.fichaAtualDados.nex = novoValor;
            
            atualizarOpcoesTrilha(dados.classe, novoValor, document.getElementById('edit-trilha').value);
            atualizarOpcoesAfinidade(novoValor, document.getElementById('edit-afinidade').value);
        
            const campoPeTurno = document.getElementById('edit-pe-turno');
            if (campoPeTurno) {
                if (dados.classe === 'sobrevivente') {
                    campoPeTurno.value = novoValor;
                } else {
                    campoPeTurno.value = (novoValor === 99) ? 20 : Math.floor(novoValor / 5);
                }
            }
        }
    }

    if (e.target.id === 'edit-pre' || e.target.id === 'edit-nex' || e.target.id === 'edit-pe-turno') {
        if (typeof window.atualizarDTRitual === 'function') {
            window.atualizarDTRitual();
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
        const tipo = e.target.closest('.status-emergencia').id.split('-')[1];
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
function atualizarOpcoesTrilha(classe, nexOuEstagio, trilhaAtual = "") {
    const selectTrilha = document.getElementById('edit-trilha');
    if (!selectTrilha) return;

    const isSobrevivente = (classe === 'sobrevivente');
    const valorNivel = parseInt(nexOuEstagio) || (isSobrevivente ? 1 : 5);
    
    // Regra de Ouro: Sobrevivente libera no 2. Outras classes no 10.
    const desbloqueado = isSobrevivente ? (valorNivel >= 2) : (valorNivel >= 10);

    if (desbloqueado) {
        selectTrilha.disabled = false;
        const listaTrilhas = TRILHAS[classe] || [];
        
        selectTrilha.innerHTML = '<option value="">Escolha uma Trilha</option>';
        listaTrilhas.forEach(trilha => {
            const selected = trilha === trilhaAtual ? 'selected' : '';
            selectTrilha.innerHTML += `<option value="${trilha}" ${selected}>${trilha}</option>`;
        });
    } else {
        selectTrilha.disabled = true;
        selectTrilha.innerHTML = `<option value="">Disponível em ${isSobrevivente ? 'Estágio 2' : 'NEX 10%'}</option>`;
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
    const atual = parseFloat(document.getElementById('carga-atual').value) || 0;
    const max = parseFloat(document.getElementById('carga-max').value) || 1;
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
window.abrirModalEquip = abrirModalEquip;
window.fecharModalEquip = fecharModalEquip;
window.renderizarItensModal = renderizarItensModal;
window.adicionarAoInventario = adicionarAoInventario;
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
    let pesoItem = parseFloat(String(item.espaco).replace(',', '.')) || 0;
    let cargaNova = (parseFloat(campoCarga.value) || 0) + pesoItem;
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
window.toggleCardModal = function(elemento) {
    // Busca o pai .card-item-catalogo e alterna a classe aberto
    const card = elemento.closest('.card-item-catalogo');
    if (card) card.classList.toggle('aberto');
};
window.filtrarItensModal = function() {
    console.log("Filtrando itens...");
    renderizarItensModal();
};
function renderizarInventarioFicha() {
    const container = document.getElementById('lista-inventario');
    container.innerHTML = "";

    // Zerar contadores de categoria antes de somar
    let contagem = { 1: 0, 2: 0, 3: 0, 4: 0 };
    let pesoTotal = 0;

    const itens = window.fichaAtualDados.inventario || [];
    const temMaoPesada = window.fichaAtualDados?.habilidades?.some(h => h.nome === "Mão Pesada");
    
    itens.forEach((item, index) => {
        // Soma Categoria e Peso
        const catParaExibir = item.categoriaTotal !== undefined ? item.categoriaTotal : (parseInt(item.categoria) || 0);
        if (catParaExibir > 0 && catParaExibir <= 4) {
            contagem[catParaExibir]++;
        }
        const peso = parseFloat(String(item.espaco).replace(',', '.')) || 0;
        pesoTotal += peso;

        let exibicaoDano = item.dano || "";
        if (exibicaoDano && item.tipo?.includes("Corpo a Corpo") && temMaoPesada) {
            exibicaoDano += " + 2";
        }

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
                ${item.dano ? `<p>⚔️ Dano: ${exibicaoDano} | Crítico: ${item.critico}</p>` : ''}
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
    const campoAtual = document.getElementById('carga-atual');
    if (campoAtual) {
        campoAtual.value = pesoTotal; // Aqui ele vai colocar 0.5, 1.0, etc.
        atualizarBarraCarga();
    } 
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
let draggingIndex = null;
let draggingType = null; // Para saber se estamos arrastando item ou habilidade
window.handleDropGeneric = function(targetIndex, tipo) {
    if (draggingIndex === null || draggingIndex === targetIndex || draggingType !== tipo) return;

    const lista = window.fichaAtualDados[tipo];
    const movido = lista.splice(draggingIndex, 1)[0];
    lista.splice(targetIndex, 0, movido);

    draggingIndex = null;
    draggingType = null;

    if (tipo === 'inventario') renderizarInventarioFicha();
    if (tipo === 'habilidades') renderizarHabilidadesFicha();
    if (tipo === 'rituais') renderizarRituaisFicha();
    
    salvarFicha();
};
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
    
    if (typeof window.executarAutomacao === 'function') {
        melhoriasSelecionadas.forEach(m => {
            window.executarAutomacao(m.nome);
        });
    }
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
document.getElementById('view-nome').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        e.preventDefault(); // Cancela o Enter
        e.target.blur();    // Tira o foco para disparar o onblur e salvar
    }
});
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
   28. Habilidades
============================================================ */
let bancoDeDadosHabilidades = null;
async function carregarBancoHabilidades() {
    if (bancoDeDadosHabilidades) return bancoDeDadosHabilidades; 

    try {
        const resposta = await fetch('Habilidades.json');
        bancoDeDadosHabilidades = await resposta.json();
        console.log("Banco de habilidades carregado com sucesso!");
        return bancoDeDadosHabilidades;
    } catch (erro) {
        console.error("Erro ao carregar o JSON de habilidades:", erro);
    }
}
window.abrirModalHabilidades = function() {
    const modal = document.getElementById('modal-habilidades');
    if (modal) {
        modal.classList.remove('modal-oculto');
        renderizarHabilidadesModal();
    }
};
window.fecharModalHabilidades = function() {
    const modal = document.getElementById('modal-habilidades');
    if (modal) {
        modal.classList.add('modal-oculto');
    }
};
async function renderizarHabilidadesModal() {
    const dados = await carregarBancoHabilidades();
    const container = document.getElementById('lista-habilidades-catalogo');
    
    // MUDANÇA AQUI: Agora buscando os IDs corretos do HTML de Habilidades
    const filtroCat = document.getElementById('filtro-categoria-hab');
    const buscaInput = document.getElementById('busca-hab');

    // Segurança: se não achar os elementos, ele para para não dar erro invisível
    if (!container || !dados || !filtroCat || !buscaInput) return;

    const categoriaSelecionada = filtroCat.value;
    const busca = buscaInput.value.toLowerCase();

    container.innerHTML = "";

    // Itera sobre as chaves do objeto (origem, poder-combatente, etc)
    for (const categoria in dados) {
        if (categoriaSelecionada === "todos" || categoriaSelecionada === categoria) {
            
            dados[categoria].forEach(hab => {
                // Filtro de busca por nome
                if (hab.nome.toLowerCase().includes(busca)) {
                    const card = document.createElement('div');
                    card.className = 'card-item-catalogo';
                    
                    card.innerHTML = `
                        <div class="item-header-modal" onclick="window.toggleCardModal(this)">
                            <strong>${hab.nome}</strong>
                            <span class="setinha">▼</span>
                        </div>
                        <div class="detalhes-item-modal">
                            <p><strong>Tipo:</strong> ${categoria.replace('-', ' ').toUpperCase()}</p>
                            ${hab.trilhas ? `<p><strong>Trilha:</strong> ${hab.trilha}</p>` : ''}
                            ${hab.requisito ? `<p><strong>Requisito:</strong> ${hab.requisito}</p>` : ''}
                            ${hab.origem ? `<p><strong>Origem:</strong> ${hab.origem}</p>` : ''}
                            <p>${hab.descricao || "Sem descrição."}</p>
                            ${hab.afinidade ? `<p><strong>Afinidade:</strong> ${hab.afinidade}</p>` : ''}
                            <button class="btn-adicionar-hab">Aprender</button>
                        </div>
                    `;

                    // Pega o botão específico deste card e adiciona o evento
                    card.querySelector('.btn-adicionar-hab').onclick = () => {
                        window.adicionarHabilidadeAFicha(hab);
                    };

                    container.appendChild(card);
                }
            });
        }
    }
}
window.filtrarHabilidadesModal = function() {
    renderizarHabilidadesModal();
};
window.adicionarHabilidadeAFicha = function(hab) {
    console.log("Função adicionar chamada para:", hab);

    if (!window.fichaAtualDados) {
        console.error("Erro: fichaAtualDados não encontrada!");
        return;
    }

    if (!window.fichaAtualDados.habilidades) {
        window.fichaAtualDados.habilidades = [];
    }

    // Criamos a cópia para a ficha
    const novaHab = { 
        ...hab, 
        idUnico: Date.now() + Math.random().toString(36).substr(2, 9) 
    };
    
    window.fichaAtualDados.habilidades.push(novaHab);

    // Atualiza a tela da ficha
    if (typeof renderizarHabilidadesFicha === "function") {
        renderizarHabilidadesFicha();
    }
    
    // Fecha o modal
    fecharModalHabilidades();

    if (typeof window.executarAutomacao === 'function') {
        window.executarAutomacao(hab.nome);
    }
    if (typeof salvarFicha === 'function') {
        salvarFicha();
    }
};
window.renderizarHabilidadesFicha = function() {
    const container = document.getElementById('lista-habilidades-ficha');
    if (!container) return;
    container.innerHTML = "";

    const habilidades = window.fichaAtualDados.habilidades || [];

    habilidades.forEach((hab, index) => {
        const card = document.createElement('div');
        card.className = 'card-item'; // Usando a mesma classe dos itens de inventário
        card.setAttribute('draggable', 'true');

        // Mesma lógica de Drag and Drop do Inventário
        card.ondragstart = (e) => {
            draggingIndex = index;
            draggingType = 'habilidades';
            card.classList.add('arrastando');
        };
        card.ondragover = (e) => {
            e.preventDefault();
            card.classList.add('drag-over');
        };
        card.ondragleave = () => card.classList.remove('drag-over');
        card.ondrop = (e) => {
            e.preventDefault();
            handleDropGeneric(index, 'habilidades');
        };
        card.ondragend = () => card.classList.remove('arrastando');

        card.innerHTML = `
            <div class="item-principal" onclick="this.parentElement.classList.toggle('aberto')">
                <span><strong>${hab.nome}</strong> ${hab.elemento ? `[${hab.elemento}]` : ''}</span>
                <span class="setinha">▼</span>
            </div>
            <div class="detalhes-item">
                ${hab.origem ? `<p><strong>Origem:</strong> ${hab.origem}</p>` : ''}
                ${hab.trilhas ? `<p><strong>Trilha:</strong> ${hab.trilha}</p>` : ''}
                ${hab.requisito ? `<p><small><strong>Requisito:</strong> ${hab.requisito}</small></p>` : ''}
                ${hab.gatilho ? `<p><small><strong>Gatilho:</strong> ${hab.gatilho}</small></p>` : ''}
                <p>${hab.descricao}</p>
                ${hab.afinidade ? `<p><small><strong>Afinidade:</strong> ${hab.afinidade}</small></p>` : ''}
                <div class="acoes-hab">
                    <button class="btn-remover" onclick="removerHabilidade(${index})">Remover</button>
                    <button class="btn-editar" onclick="abrirEdicaoHabilidade(${index})">✏️ Editar</button>
                </div>
            </div>
        `;
        container.appendChild(card);
    });
}
window.removerHabilidade = function(index) {
    window.fichaAtualDados.habilidades.splice(index, 1);
    renderizarHabilidadesFicha();
    if (typeof salvarFicha === 'function') salvarFicha();
};
/* ============================================================
   29. Editar Habilidade
============================================================ */
let indexHabEditando = null;
window.abrirEdicaoHabilidade = function(index) {
    const hab = window.fichaAtualDados.habilidades[index];
    if (!hab) return;

    indexHabEditando = index;

    // Preenche os campos do modal com os dados atuais
    document.getElementById('edit-hab-nome').value = hab.nome || "";
    document.getElementById('edit-hab-elemento').value = hab.elemento || "";
    document.getElementById('edit-hab-trilha').value = hab.trilha || "";
    document.getElementById('edit-hab-requisitos').value = hab.requisito || ""; // Note se o JSON é 'requisito' ou 'requisitos'
    document.getElementById('edit-hab-origem').value = hab.origem || "";
    document.getElementById('edit-hab-afinidade').value = hab.afinidade || "";
    document.getElementById('edit-hab-desc').value = hab.descricao || "";

    // Abre o modal
    const modal = document.getElementById('modal-editar-hab');
    if (modal) modal.classList.remove('modal-oculto');
};
window.fecharModalEditarHab = function() {
    const modal = document.getElementById('modal-editar-hab');
    if (modal) modal.classList.add('modal-oculto');
    indexHabEditando = null;
};
window.salvarMudancasHab = function() {
    if (indexHabEditando === null) return;

    // Captura os novos valores do modal
    const novosDados = {
        ...window.fichaAtualDados.habilidades[indexHabEditando], // Mantém IDs e outras props
        nome: document.getElementById('edit-hab-nome').value,
        elemento: document.getElementById('edit-hab-elemento').value,
        trilha: document.getElementById('edit-hab-trilha').value,
        requisito: document.getElementById('edit-hab-requisitos').value,
        origem: document.getElementById('edit-hab-origem').value,
        afinidade: document.getElementById('edit-hab-afinidade').value,
        descricao: document.getElementById('edit-hab-desc').value,
        gatilho: document.getElementById('edit-hab-gatilho').value
    };

    // Atualiza o array oficial
    window.fichaAtualDados.habilidades[indexHabEditando] = novosDados;

    // Atualiza a UI e fecha
    renderizarHabilidadesFicha();
    fecharModalEditarHab();

    // Salva no banco (Firebase/LocalStorage)
    if (typeof salvarFicha === 'function') salvarFicha();
};
/* ============================================================
   30. Rituais
============================================================ */
let bancoDeDadosRituais = null;
window.carregarBancoRituais = async function() {
    if (bancoDeDadosRituais) return bancoDeDadosRituais; 
    try {
        const resposta = await fetch('Ritual.json');
        bancoDeDadosRituais = await resposta.json();
        return bancoDeDadosRituais;
    } catch (erro) {
        console.error("Erro ao carregar o JSON de rituais:", erro);
    }
};
window.renderizarRituaisFicha = function() {
    const container = document.getElementById('lista-ritual-ficha');
    if (!container) return;
    container.innerHTML = "";

    const rituais = window.fichaAtualDados?.rituais || [];

    rituais.forEach((ritual, index) => {
        const card = document.createElement('div');
        const caminhoFoto = window.gerarCaminhoImagem(ritual.nome);
        card.className = 'card-item';
        card.setAttribute('draggable', 'true'); 

        // Mesma lógica de Drag and Drop do Inventário
        card.ondragstart = (e) => {
            draggingIndex = index;
            draggingType = 'rituais';
            card.classList.add('arrastando');
        };
        card.ondragover = (e) => {
            e.preventDefault();
            card.classList.add('drag-over');
        };
        card.ondragleave = () => card.classList.remove('drag-over');
        card.ondrop = (e) => {
            e.preventDefault();
            handleDropGeneric(index, 'rituais');
        };
        card.ondragend = () => card.classList.remove('arrastando');
        
        card.innerHTML = `
            <div class="item-principal" onclick="this.parentElement.classList.toggle('aberto')">
                <span><strong>${ritual.nome}</strong></span>
                <span class="setinha">▼</span>
            </div>
            <div class="detalhes-item">
                <img src="${caminhoFoto}" alt="${ritual.nome}" class="img-ritual-miniatura" onerror="this.src='imagens/padrao.png'">
                <p><small><strong>Círculo:</strong> ${ritual.circulo}º | <strong>Elemento:</strong> ${ritual.elemento}</p>
                <p><small><strong>Alcance:</strong> ${ritual.alcance} | <strong>Execução:</strong> ${ritual.execucao}</small></p>
                <p><small><strong>Alvo:</strong> ${ritual.alvo} | <strong>Duração:</strong> ${ritual.duracao}</small></p>
                ${ritual.resistencia ? `<p><strong>Resistencia:</strong> ${ritual.resistencia}</p>` : ''}
                <p>${ritual.descricao || "Sem descrição."}</p>
                ${ritual.discente ? `<p><strong>Discente:</strong> ${ritual.discente}</p>` : ''}
                ${ritual.verdadeiro ? `<p><strong>Verdadeiro:</strong> ${ritual.verdadeiro}</p>` : ''}
                <div class="acoes-hab">
                    <button class="btn-remover" onclick="removerRitual(${index})">Remover</button>
                    <button class="btn-editar" onclick="abrirEdicaoRitual(${index})">✏️ Editar</button>
                </div>
            </div>
        `;
        container.appendChild(card);
    });

    if (typeof window.atualizarDTRitual === 'function') window.atualizarDTRitual();
};
window.renderizarRituaisModal = async function() {
    const dados = await window.carregarBancoRituais();
    const container = document.getElementById('lista-rituais-catalogo');
    const filtroCat = document.getElementById('filtro-categoria-ritual');
    const buscaInput = document.getElementById('busca-ritual');

    if (!container || !dados || !filtroCat || !buscaInput) return;

    const categoriaSelecionada = filtroCat.value;
    const busca = buscaInput.value.toLowerCase();
    container.innerHTML = "";

    for (const circulo in dados) {
        if (categoriaSelecionada === "todos" || categoriaSelecionada === circulo) {
            dados[circulo].forEach(ritual => {
                if (ritual.nome.toLowerCase().includes(busca)) {
                    const card = document.createElement('div');
                    card.className = 'card-item-catalogo';
                    
                    card.innerHTML = `
                        <div class="item-header-modal" onclick="window.toggleCardModal(this)">
                            <strong>${ritual.nome}</strong>
                            <span class="setinha">▼</span>
                        </div>
                        <div class="detalhes-item-modal">
                            <p><strong>Círculo:</strong> ${ritual.circulo}º | <strong>Elemento:</strong> ${ritual.elemento}</p>
                            <p>${ritual.descricao}</p>
                            <button class="btn-adicionar-hab">Aprender Ritual</button>
                        </div>
                    `;

                    card.querySelector('.btn-adicionar-hab').onclick = () => {
                        window.adicionarRitualAFicha(ritual);
                    };

                    container.appendChild(card);
                }
            });
        }
    }
};
window.abrirModalRituais = function() {
    const modal = document.getElementById('modal-rituais');
    if (modal) {
        modal.classList.remove('modal-oculto');
        window.renderizarRituaisModal();
    }
};
window.fecharModalRituais = function() {
    document.getElementById('modal-rituais')?.classList.add('modal-oculto');
};
window.filtrarRitualModal = function() {
    if (typeof window.renderizarRituaisModal === 'function') {
        window.renderizarRituaisModal();
    }
};
window.adicionarRitualAFicha = function(ritual) {
    if (!window.fichaAtualDados) return;
    if (!window.fichaAtualDados.rituais) window.fichaAtualDados.rituais = [];

    window.fichaAtualDados.rituais.push({ ...ritual });
    
    window.renderizarRituaisFicha();
    window.fecharModalRituais();
    if (typeof salvarFicha === 'function') salvarFicha();
};
window.removerRitual = function(index) {
    window.fichaAtualDados.rituais.splice(index, 1);
    window.renderizarRituaisFicha();
    if (typeof salvarFicha === 'function') salvarFicha();
};
window.atualizarDTRitual = function() {
    if (!window.fichaAtualDados) return;

    // Pega o valor do input de Presença diretamente da tela para ser em tempo real
    const presenca = parseInt(document.getElementById('edit-pre')?.value) || 0;
    const limitePE = parseInt(document.getElementById('edit-pe-turno')?.value) || 0;

    const dtFinal = 10 + limitePE + presenca;

    const campoDT = document.getElementById('DT');
    if (campoDT) {
        campoDT.value = dtFinal;
        
        // Salva na memória para não perder ao fechar
        if(!window.fichaAtualDados.status) window.fichaAtualDados.status = {};
        window.fichaAtualDados.status.dtRitual = dtFinal; 
    }
}
window.gerarCaminhoImagem = function(nomeRitual) {
    // Transforma "Chamas do Caos" em "chamas-do-caos"
    const nomeArquivo = nomeRitual
        .toLowerCase()
        .normalize("NFD") // Remove acentos
        .replace(/[\u0300-\u036f]/g, "") 
        .replace(/\s+/g, '-'); // Troca espaço por -

    return `imagens/${nomeArquivo}.png`; 
};
/* ============================================================
   31. Editar Rituais
============================================================ */
let indexRitualEditando = null;
window.abrirEdicaoRitual = function(index) {
    const ritual = window.fichaAtualDados.rituais[index];
    if (!ritual) return;

    indexRitualEditando = index;

    // Preenche os campos do modal com os dados atuais do banco
    document.getElementById('edit-ritual-nome').value = ritual.nome || "";
    document.getElementById('edit-ritual-elemento').value = ritual.elemento || "";
    document.getElementById('edit-ritual-circulo').value = ritual.circulo || "";
    document.getElementById('edit-ritual-execucao').value = ritual.execucao || "";
    document.getElementById('edit-ritual-alcance').value = ritual.alcance || "";
    document.getElementById('edit-ritual-alvo').value = ritual.alvo || "";
    document.getElementById('edit-ritual-duração').value = ritual.duracao || ""; // Lembre do çã no HTML
    document.getElementById('edit-ritual-resistencia').value = ritual.resistencia || "";
    
    // ATENÇÃO: Lembre-se de mudar o ID no HTML para 'edit-ritual-desc' como combinamos!
    document.getElementById('edit-ritual-desc').value = ritual.descricao || ""; 
    
    document.getElementById('edit-ritual-discente').value = ritual.discente || "";
    document.getElementById('edit-ritual-verdadeiro').value = ritual.verdadeiro || "";

    // Abre o modal
    const modal = document.getElementById('modal-editar-rituais');
    if (modal) modal.classList.remove('modal-oculto');
};
window.fecharModalEditarRituais = function() {
    const modal = document.getElementById('modal-editar-rituais');
    if (modal) modal.classList.add('modal-oculto');
    indexRitualEditando = null;
};
window.salvarMudancasRituais = function() {
    if (indexRitualEditando === null) return;

    // Captura os novos valores que o usuário digitou no modal
    const novosDados = {
        ...window.fichaAtualDados.rituais[indexRitualEditando], // Mantém IDs únicos da versão original
        nome: document.getElementById('edit-ritual-nome').value,
        elemento: document.getElementById('edit-ritual-elemento').value,
        circulo: parseInt(document.getElementById('edit-ritual-circulo').value) || 1, // Salva como número
        execucao: document.getElementById('edit-ritual-execucao').value,
        alcance: document.getElementById('edit-ritual-alcance').value,
        alvo: document.getElementById('edit-ritual-alvo').value,
        duracao: document.getElementById('edit-ritual-duração').value,
        resistencia: document.getElementById('edit-ritual-resistencia').value,
        descricao: document.getElementById('edit-ritual-desc').value, // ID novo que alteramos
        discente: document.getElementById('edit-ritual-discente').value,
        verdadeiro: document.getElementById('edit-ritual-verdadeiro').value
    };

    // Atualiza o array oficial de rituais
    window.fichaAtualDados.rituais[indexRitualEditando] = novosDados;

    // Atualiza a visualização na ficha e fecha a janelinha
    if (typeof window.renderizarRituaisFicha === 'function') {
        window.renderizarRituaisFicha();
    }
    window.fecharModalEditarRituais();

    // Salva no banco Firebase
    if (typeof salvarFicha === 'function') salvarFicha();
};
/* ============================================================
   32. Salva
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
            nex: (window.fichaAtualDados?.classe === 'sobrevivente') 
                 ? getNum('edit-estagio', 1) 
                 : getNum('edit-nex', 5),
            jogador: getVal('edit-jogador'),
            profissão: getVal('edit-profissão'),
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
            inventario: window.fichaAtualDados.inventario || [],
            habilidades: window.fichaAtualDados.habilidades || [],
            rituais: window.fichaAtualDados.rituais || []
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
/* ============================================================
   33. Ajuda
============================================================ */
const CONTEUDO_AJUDA = {
    condicoes: {
        titulo: "🤢 Condições e Estados",
        html: `
            <div class="grid-itens">
                <div class="card-ajuda">
                    <h4>Abalado</h4>
                    <p>O personagem sofre –1d20 em testes. Se ficar abalado novamente, em vez disso fica apavorado. Condição de medo.</p>
                </div>

                <div class="card-ajuda">
                    <h4>Agarrado</h4>
                    <p>O personagem fica desprevenido e imóvel, sofre –1d20 em testes de ataque e só pode atacar com armas leves. Um personagem fazendo um ataque à distância contra um alvo envolvido na manobra agarrar tem 50% de chance de acertar o alvo errado. Condição de paralisia.</p>
                </div>

                <div class="card-ajuda">
                    <h4>Alquebrado</h4>
                    <p>O custo em pontos de esforço das habilidades e dos rituais do personagem aumenta em +1. Condição mental.</p>
                </div>

                <div class="card-ajuda">
                    <h4>Apavorado</h4>
                    <p>O personagem sofre –2d20 em testes de perícia e deve fugir da fonte do medo da maneira mais eficiente possível (mas pode parar de fazê-lo assim que a perder de vista ou se afastar mais do que alcance médio). Se não puder, poderá agir, mas não poderá se aproximar voluntariamente da fonte do medo. Condição de medo.</p>
                </div>

                <div class="card-ajuda">
                    <h4>Asfixiado</h4>
                    <p>O personagem não pode respirar. Um personagem asfixiado pode prender a respiração por um número de rodadas igual ao seu Vigor. Depois disso, deve fazer um teste de Fortitude por rodada (DT 5 + 5 por teste anterior). Se falhar, cai inconsciente e perde 1d6 PV por rodada até respirar novamente ou morrer.</p>
                </div>

                <div class="card-ajuda">
                    <h4>Atordoado</h4>
                    <p>O personagem fica desprevenido e não pode fazer ações. Condição mental.</p>
                </div>

                <div class="card-ajuda">
                    <h4>Caído</h4>
                    <p>Deitado no chão. O personagem sofre –2d20 em ataques corpo a corpo e seu deslocamento é reduzido a 1,5m. Além disso, sofre –5 na Defesa contra ataques corpo a corpo, mas recebe +5 na Defesa contra ataques à distância.</p>
                </div>

                <div class="card-ajuda">
                    <h4>Cego</h4>
                    <p>O personagem fica desprevenido e lento, não pode fazer testes de Percepção para observar e sofre –2d20 em testes de perícias baseadas em Agilidade ou Força. Todos os alvos de seus ataques recebem camuflagem total. Você é considerado cego enquanto estiver em uma área de escuridão total, a menos que algo lhe permita perceber no escuro. Condição de sentidos.</p>
                </div>

                <div class="card-ajuda">
                    <h4>Confuso</h4>
                    <p>O personagem comporta-se de modo aleatório. Role 1d6 no início de seus turnos: 1) Movimenta-se em uma direção escolhida por uma rolagem de 1d8; 2-3) Não pode fazer ações e fica balbuciando de forma incoerente; 4-5) Usa a arma que estiver empunhando para atacar o ser mais próximo, ou a si mesmo se estiver sozinho (nesse caso, apenas role o dano); 6) A condição termina e pode agir normalmente. Condição mental.</p>
                </div>

                <div class="card-ajuda">
                    <h4>Debilitado</h4>
                    <p>O personagem sofre –2d20 em testes de Agilidade, Força e Vigor. Se o personagem ficar debilitado novamente, em vez disso fica inconsciente.</p>
                </div>

                <div class="card-ajuda">
                    <h4>Desprevenido</h4>
                    <p>Despreparado para reagir. O personagem sofre –5 na Defesa e –1d20 em Reflexos. Você fica desprevenido contra inimigos que não possa perceber.</p>
                </div>

                <div class="card-ajuda">
                    <h4>Doente</h4>
                    <p>Sob efeito de uma doença.</p>
                </div>

                <div class="card-ajuda">
                    <h4>Em Chamas</h4>
                    <p>O personagem está pegando fogo. No início de seus turnos, sofre 1d6 pontos de dano de fogo. O personagem pode gastar uma ação padrão para apagar o fogo com as mãos. Imersão em água também apaga as chamas.</p>
                </div>

                <div class="card-ajuda">
                    <h4>Enjoado</h4>
                    <p>O personagem só pode realizar uma ação padrão ou de movimento (não ambas) por rodada.</p>
                </div>

                <div class="card-ajuda">
                    <h4>Enlouquecendo</h4>
                    <p>Se iniciar três turnos enlouquecendo na mesma cena (não necessariamente consecutivos), você fica insano — seu personagem se torna um NPC. A condição pode ser encerrada com um teste de Diplomacia (DT 20 +5 por vez que já tiver sido acalmado na cena) ou por qualquer efeito que cure pelo menos 1 de Sanidade.</p>
                </div>

                <div class="card-ajuda">
                    <h4>Enredado</h4>
                    <p>O personagem fica lento, vulnerável e sofre –1d20 em testes de ataque. Condição de paralisia.</p>
                </div>

                <div class="card-ajuda">
                    <h4>Envenenado</h4>
                    <p>Varia de acordo com o veneno. Pode ser outra condição (por exemplo, fraco ou enjoado) ou dano recorrente (por exemplo, 1d12 pontos de dano de veneno por rodada). A descrição do veneno determina a duração dele (caso nada seja dito, a condição dura pela cena). Dano recorrente de condições envenenado sempre se acumula (mesmo se as condições ou fontes que as causam forem iguais).</p>
                </div>

                <div class="card-ajuda">
                    <h4>Esmorecido</h4>
                    <p>O personagem sofre –2d20 em testes de Intelecto e Presença. Condição mental.</p>
                </div>

                <div class="card-ajuda">
                    <h4>Exausto</h4>
                    <p>O personagem fica debilitado, lento e vulnerável. Se ficar exausto novamente, em vez disso fica inconsciente. Condição de fadiga.</p>
                </div>

                <div class="card-ajuda">
                    <h4>Fascinado</h4>
                    <p>Com a atenção presa em alguma coisa. O personagem sofre –2d20 em Percepção e não pode fazer ações, exceto observar aquilo que o fascinou. Qualquer ação hostil contra o personagem anula esta condição. Balançar um ser fascinado para tirá-lo desse estado gasta uma ação padrão. Condição mental.</p>
                </div>

                <div class="card-ajuda">
                    <h4>Fatigado</h4>
                    <p>O personagem fica fraco e vulnerável. Se o personagem ficar fatigado novamente, em vez disso fica exausto. Condição de fadiga.</p>
                </div>

                <div class="card-ajuda">
                    <h4>Fraco</h4>
                    <p>O personagem sofre –1d20 em testes de Agilidade, Força e Vigor. Se ficar fraco novamente, em vez disso fica debilitado.</p>
                </div>

                <div class="card-ajuda">
                    <h4>Frustrado</h4>
                    <p>O personagem sofre –1d20 em testes de Intelecto e Presença. Se ficar frustrado novamente, em vez disso fica esmorecido. Condição mental.</p>
                </div>

                <div class="card-ajuda">
                    <h4>Imóvel</h4>
                    <p>Todas as formas de deslocamento do personagem são reduzidas a 0m. Condição de paralisia.</p>
                </div>

                <div class="card-ajuda">
                    <h4>Inconsciente</h4>
                    <p>O personagem fica indefeso e não pode fazer ações, incluindo reações. Balançar um ser para acordá-lo gasta uma ação padrão.</p>
                </div>

                <div class="card-ajuda">
                    <h4>Indefeso</h4>
                    <p>O personagem é considerado desprevenido, mas sofre –10 na Defesa, falha automaticamente em testes de Reflexos e pode sofrer golpes de misericórdia.</p>
                </div>

                <div class="card-ajuda">
                    <h4>Lento</h4>
                    <p>Todas as formas de deslocamento do personagem são reduzidas à metade (arredonde para baixo para o primeiro incremento de 1,5m) e ele não pode correr ou fazer investidas. Condição de paralisia.</p>
                </div>

                <div class="card-ajuda">
                    <h4>Machucado</h4>
                    <p>O personagem tem metade ou menos de seus pontos de vida totais.</p>
                </div>

                <div class="card-ajuda">
                    <h4>Morrendo</h4>
                    <p>Com 0 pontos de vida. Se iniciar três turnos morrendo na mesma cena (não necessariamente consecutivos), você morre. A condição pode ser encerrada com um teste de Medicina (DT 20 +5 por vez que já tiver sido estabilizado na cena) ou por efeitos específicos.</p>
                </div>

                <div class="card-ajuda">
                    <h4>Ofuscado</h4>
                    <p>O personagem sofre –1d20 em testes de ataque e de Percepção. Condição de sentidos.</p>
                </div>

                <div class="card-ajuda">
                    <h4>Paralisado</h4>
                    <p>O personagem fica imóvel e indefeso e só pode realizar ações puramente mentais. Condição de paralisia.</p>
                </div>

                <div class="card-ajuda">
                    <h4>Pasmo</h4>
                    <p>O personagem não pode fazer ações. Condição mental.</p>
                </div>

                <div class="card-ajuda">
                    <h4>Perturbado</h4>
                    <p>Na primeira vez que isso acontece em uma cena, você recebe um efeito de insanidade (veja a p. 111).</p>
                </div>

                <div class="card-ajuda">
                    <h4>Petrificado</h4>
                    <p>O personagem fica inconsciente e recebe resistência a dano 10.</p>
                </div>

                <div class="card-ajuda">
                    <h4>Sangrando</h4>
                    <p>Com um ferimento aberto. No início de seus turnos, o personagem deve fazer um teste de Vigor (DT 20). Se passar, estabiliza e remove essa condição. Se falhar, perde 1d6 pontos de vida e continua sangrando. Também é possível estabilizar alguém com uma ação completa e um teste de Medicina (DT 20).</p>
                </div>

                <div class="card-ajuda">
                    <h4>Surdo</h4>
                    <p>O personagem não pode fazer testes de Percepção para ouvir e sofre –2d20 em testes de Iniciativa. Além disso, é considerado em condição ruim para lançar rituais. Condição de sentidos.</p>
                </div>

                <div class="card-ajuda">
                    <h4>Surpreendido</h4>
                    <p>Não ciente de seus inimigos. O personagem fica desprevenido e não pode fazer ações.</p>
                </div>

                <div class="card-ajuda">
                    <h4>Vulnerável</h4>
                    <p>O personagem sofre –2 na Defesa.</p>
                </div>
            </div>
        `
    },
    evolucao: {
        titulo: "📈 Progressão de Classe",
        html: `
            <div class="abas-evolucao">
                <button class="aba-btn active" onclick="mostrarTabelaEvolucao('combatente')">Combatente</button>
                <button class="aba-btn" onclick="mostrarTabelaEvolucao('especialista')">Especialista</button>
                <button class="aba-btn" onclick="mostrarTabelaEvolucao('ocultista')">Ocultista</button>
                <button class="aba-btn" onclick="mostrarTabelaEvolucao('sobrevivente')">Sobrevivente</button>
            </div>
            
            <div id="tab-combatente" class="tabela-classe">
                <table class="tabela-ajuda">
                    <tr><th>NEX</th><th>Habilidades</th></tr>
                    <tr><td>5%</td><td>Ataque Especial (2 PE, +5)</td></tr>
                    <tr><td>10%</td><td>Habilidade de trilha</td></tr>
                    <tr><td>15%</td><td>Poder de combatente</td></tr>
                    <tr><td>20%</td><td>Aumento de atributo</td></tr>
                    <tr><td>25%</td><td>Ataque Especial (3 PE, +10)</td></tr>
                    <tr><td>30%</td><td>Poder de combatente</td></tr>
                    <tr><td>35%</td><td>Grau de treinamento</td></tr>
                    <tr><td>40%</td><td>Habilidade de trilha</td></tr>
                    <tr><td>45%</td><td>Poder de combatente</td></tr>
                    <tr><td>50%</td><td>Aumento de atributo, versatilidade</td></tr>
                    <tr><td>55%</td><td>Ataque Especial (4 PE, +15)</td></tr>
                    <tr><td>60%</td><td>Poder de combatente</td></tr>
                    <tr><td>65%</td><td>Habilidade de trilha</td></tr>
                    <tr><td>70%</td><td>Grau de treinamento</td></tr>
                    <tr><td>75%</td><td>Poder de combatente</td></tr>
                    <tr><td>80%</td><td>Aumento de atributo</td></tr>
                    <tr><td>85%</td><td>Ataque Especial (5 PE, +20)</td></tr>
                    <tr><td>90%</td><td>Poder de combatente</td></tr>
                    <tr><td>95%</td><td>Aumento de atributo</td></tr>
                    <tr><td>99%</td><td>Habilidade de trilha</td></tr>
                </table>
            </div>

            <div id="tab-especialista" class="tabela-classe" style="display:none">
                <table class="tabela-ajuda">
                    <tr><th>NEX</th><th>Habilidades</th></tr>
                    <tr><td>5%</td><td>Eclético, Perito (2 PE, +1d6)</td></tr>
                    <tr><td>10%</td><td>Habilidade de trilha</td></tr>
                    <tr><td>15%</td><td>Poder de especialista</td></tr>
                    <tr><td>20%</td><td>Aumento de atributo</td></tr>
                    <tr><td>25%</td><td>Perito (3 PE, +1d8)</td></tr>
                    <tr><td>30%</td><td>Poder de especialista</td></tr>
                    <tr><td>35%</td><td>Grau de treinamento</td></tr>
                    <tr><td>40%</td><td>Engenhosidade (veterano), Habilidade de trilha</td></tr>
                    <tr><td>45%</td><td>Poder de especialista</td></tr>
                    <tr><td>50%</td><td>Aumento de atributo, Versatilidade</td></tr>
                    <tr><td>55%</td><td>Perito (4 PE, +1d10)</td></tr>
                    <tr><td>60%</td><td>Poder de especialista</td></tr>
                    <tr><td>65%</td><td>Habilidade de trilha</td></tr>
                    <tr><td>70%</td><td>Grau de treinamento</td></tr>
                    <tr><td>75%</td><td>Engenhosidade (expert), Poder de especialista</td></tr>
                    <tr><td>80%</td><td>Aumento de atributo</td></tr>
                    <tr><td>85%</td><td>Perito (5 PE, +1d12)</td></tr>
                    <tr><td>90%</td><td>Poder de especialista</td></tr>
                    <tr><td>95%</td><td>Aumento de atributo</td></tr>
                    <tr><td>99%</td><td>Habilidade de trilha</td></tr>
                </table>
                <div class="card-ajuda">
                    <h4>Engenhosidade</h4>
                    <p>Em NEX 40%, quando usa sua habilidade Eclético, você pode gastar 2 PE adicionais para receber os benefícios de ser veterano na perícia. Em NEX 75%, pode gastar 4 PE adicionais para receber os benefícios de ser expert na perícia.</p>
                </div>
            </div>

            <div id="tab-ocultista" class="tabela-classe" style="display:none">
                <table class="tabela-ajuda">
                    <tr><th>NEX</th><th>Habilidades</th></tr>
                    <tr><td>5%</td><td>Escolhido pelo Outro Lado (1º círculo)</td></tr>
                    <tr><td>10%</td><td>Habilidade de trilha</td></tr>
                    <tr><td>15%</td><td>Poder de ocultista</td></tr>
                    <tr><td>20%</td><td>Aumento de atributo</td></tr>
                    <tr><td>25%</td><td>Escolhido pelo Outro Lado (2º círculo)</td></tr>
                    <tr><td>30%</td><td>Poder de ocultista</td></tr>
                    <tr><td>35%</td><td>Grau de treinamento</td></tr>
                    <tr><td>40%</td><td>Habilidade de trilha</td></tr>
                    <tr><td>45%</td><td>Poder de ocultista</td></tr>
                    <tr><td>50%</td><td>Aumento de atributo, Versatilidade</td></tr>
                    <tr><td>55%</td><td>Escolhido pelo Outro Lado (3º círculo)</td></tr>
                    <tr><td>60%</td><td>Poder de ocultista</td></tr>
                    <tr><td>65%</td><td>Habilidade de trilha</td></tr>
                    <tr><td>70%</td><td>Grau de treinamento</td></tr>
                    <tr><td>75%</td><td>Poder de ocultista</td></tr>
                    <tr><td>80%</td><td>Aumento de atributo</td></tr>
                    <tr><td>85%</td><td>Escolhido pelo Outro Lado (4º círculo)</td></tr>
                    <tr><td>90%</td><td>Poder de ocultista</td></tr>
                    <tr><td>95%</td><td>Aumento de atributo</td></tr>
                    <tr><td>99%</td><td>Habilidade de trilha</td></tr>
                </table>
                <div class="card-ajuda">
                    <h4>Escolhido pelo Outro Lado</h4>
                    <p>Você teve uma experiência paranormal e foi marcado pelo Outro Lado, absorvendo o conhecimento e poder necessários para realizar rituais. Você pode lançar rituais de 1º círculo. À medida que aumenta seu NEX, pode lançar rituais de círculos maiores (2º círculo em NEX 25%, 3º círculo em NEX 55% e 4º círculo em NEX 85%). Você começa com três rituais de 1º círculo. Sempre que avança de NEX, aprende um ritual de qualquer círculo que possa lançar. Esses rituais não contam no seu limite de rituais conhecidos.</p>
                </div>
            </div>

            <div id="tab-sobrevivente" class="tabela-classe" style="display:none">
                <table class="tabela-ajuda">
                    <tr><th>Estágio</th><th>Habilidades</th></tr>
                    <tr><td>1</td><td>Empenho</td></tr>
                    <tr><td>2</td><td>Trilha (1º habilidade)</td></tr>
                    <tr><td>3</td><td>Aumento de atributo</td></tr>
                    <tr><td>4</td><td>Trilha (2º habilidade)</td></tr>
                    <tr><td>5</td><td>Cicatrizado</td></tr>
                </table>
            </div>

            <div class="card-ajuda">
                <h4>Habilidade de Trilha</h4>
                <p>Em NEX 10% você escolhe uma das trilhas da sua classe e recebe o primeiro poder da trilha escolhida. Você recebe um novo poder da trilha escolhida em NEX 40%, 65% e 99%.</p>
            </div>
            <div class="card-ajuda">
                <h4>Poder de Classe</h4>
                <p>Em NEX 15%, você recebe um poder de classe à sua escolha. Você recebe um novo poder de classe em NEX 30% e a cada 15% de NEX subsequentes, conforme indicado na tabela.</p>
            </div>
            <div class="card-ajuda">
                <h4>Aumento de Atributo</h4>
                <p>Em NEX 20%, e novamente em NEX 50%, 80% e 95%, aumente um atributo a sua escolha em +1. Você não pode aumentar um atributo além de 5 desta forma.</p>
            </div>
            <div class="card-ajuda">
                <h4>Grau de Treinamento</h4>
                <p>Em NEX 35%, e novamente em NEX 70%, escolha um número de perícias treinadas igual a 2 + Int. Seu grau de treinamento nessas perícias aumenta em um (de treinado para veterano ou de veterano para expert).</p>
            </div>
            <div class="card-ajuda">
                <h4>Versatilidade</h4>
                <p>Em NEX 50%, escolha entre receber um poder de classe ou o primeiro poder de uma trilha que não a sua.</p>
            </div>
        `
    },
    acoes: {
        titulo: "⚔️ Guia de Ações em Combate",
        html: `
            <div class="grid-itens">
                <div class="card-ajuda">
                    <h4>🔴 Ação Padrão (1 por turno)</h4>
                    <ul>
                        <li><strong>Atacar:</strong> Realiza um teste de ataque com sua arma.</li>
                        <li><strong>Lançar Ritual:</strong> Executa um ritual (gasta PE).</li>
                        <li><strong>Usar Habilidade:</strong> Ativa uma habilidade de classe ou origem.</li>
                        <li><strong>Preparar:</strong> Escolhe uma ação para gatilho posterior.</li>
                    </ul>
                </div>
                <div class="card-ajuda">
                    <h4>🔵 Ação de Movimento (1 por turno)</h4>
                    <ul>
                        <li><strong>Deslocar:</strong> Movimenta-se até seu limite de metros.</li>
                        <li><strong>Sacar/Guardar:</strong> Pega ou guarda um item/arma.</li>
                        <li><strong>Levantar-se:</strong> Caso esteja caído.</li>
                        <li><strong>Manipular Item:</strong> Abrir porta, pegar algo do chão.</li>
                    </ul>
                </div>
                <div class="card-ajuda">
                    <h4>🟡 Reações (1 por rodada*)</h4>
                    <p><small>*Você só pode usar reações especiais de defesa, as listas a baixo, uma vez por rodada, porém qualquer outro tipo de reação é ilimitada.</small></p>
                    <ul>
                        <li><strong>Esquiva:</strong> Soma sua Agilidade na Defesa.</li>
                        <li><strong>Bloqueio:</strong> Soma sua Luta/Fortitude na Resistência a Dano.</li>
                        <li><strong>Contra-Ataque:</strong> Se o inimigo errar, você pode atacar.</li>
                    </ul>
                </div>
                <div class="card-ajuda">
                    <h4>⚪ Ações Livres (Ilimitada)</h4>
                    <ul>
                        <li><strong>Falar:</strong> Frases curtas.</li>
                        <li><strong>Soltar Item:</strong> Deixar cair no chão.</li>
                        <li><strong>Gastar PE:</strong> Algumas habilidades são livres.</li>
                    </ul>
                </div>
            </div>
        `
    },
    glossario: {
        titulo: "📖 Glossário de Termos Técnicos",
        html: `
            <div class="ajuda-secao">
                <div class="card-ajuda">
                    <h4>🛡️ Defesa e Resistência</h4>
                    <ul>
                        <li><strong>RD (Resistência a Dano):</strong> Valor subtraído de cada dano que recebes. Ex: RD Sangue 5 reduz 5 de dano de Sangue.</li>
                        <li><strong>Bloqueio:</strong> Uma reação. Se bloqueares, somas a tua perícia (Luta ou Fortitude) à tua RD para aquele ataque.</li>
                        <li><strong>Esquiva:</strong> Uma reação. Somas a tua perícia Reflexos na Defesa contra aquele ataque.</li>
                    </ul>
                </div>
                <div class="card-ajuda">
                    <h4>🎲 Testes e Dados</h4>
                    <ul>
                        <li><strong>DT (Dificuldade de Teste):</strong> O valor que precisas de igualar ou superar no dado. Geralmente é 10 + NEX/5 + Atributo.</li>
                        <li><strong>Margem de Ameaça:</strong> O número no dado para um Crítico. Ex: Margem 19 significa que 19 ou 20 no dado é crítico.</li>
                        <li><strong>Multiplicador de Crítico:</strong> Quantas vezes o dano da arma é multiplicado. Ex: x3 significa triplicar os dados de dano.</li>
                        <li><strong>Penalidade de Carga:</strong> Se excederes o peso máximo, ficas com a condição <i>Sobrecarregado</i> (-2d20 em testes de perícia baseados em AGI e FOR).</li>
                    </ul>
                </div>
                <div class="card-ajuda">
                    <h4>🌀 Paranormal</h4>
                    <ul>
                        <li><strong>Afinidade:</strong> Quando um Ocultista ou Agente se conecta a um Elemento. Garante bónus em rituais e poderes desse elemento.</li>
                        <li><strong>Custo do Paranormal:</strong> Perda de Sanidade ao falhar num teste de resistência contra rituais ou criaturas.</li>
                        <li><strong>PE por Turno:</strong> O limite máximo de Pontos de Esforço que podes gastar numa única ação ou reação.</li>
                    </ul>
                </div>
            </div>
        `
    }
};
window.abrirModalGuia = function(tipo) {
    const modal = document.getElementById('modal-guia-ajuda');
    const titulo = document.getElementById('titulo-guia');
    const corpo = document.getElementById('corpo-guia');
    const dados = CONTEUDO_AJUDA[tipo];

    if (modal && dados) {
        titulo.innerText = dados.titulo;
        corpo.innerHTML = dados.html;
        modal.classList.remove('modal-oculto');

        // Se for evolução, tenta abrir na aba da classe atual do personagem
        if (tipo === 'evolucao' && window.fichaAtualDados) {
            const classeAtual = window.fichaAtualDados.classe; // 'combatente', 'especialista' ou 'ocultista'
            if (classeAtual) {
                mostrarTabelaEvolucao(classeAtual);
            }
        }
    }
};
window.fecharModalGuia = function() {
    document.getElementById('modal-guia-ajuda').classList.add('modal-oculto');
};
window.mostrarTabelaEvolucao = function(classe) {
    // Esconde todas as tabelas
    document.querySelectorAll('.tabela-classe').forEach(div => div.style.display = 'none');
    // Remove a classe 'active' de todos os botões de aba
    document.querySelectorAll('.aba-btn').forEach(btn => btn.classList.remove('active'));
    
    // Mostra a selecionada
    document.getElementById(`tab-${classe}`).style.display = 'block';
    
    // Marca o botão clicado como ativo (para o CSS destacar)
    event.currentTarget.classList.add('active');
};