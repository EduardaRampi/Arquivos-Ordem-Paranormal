document.addEventListener('DOMContentLoaded', () => {
  const Tempo = 250;
  const listas = {
  classes: '../json/classes.json',
  origens: '../json/Origens.json',
  poderes: '../json/Poderes.json',
  'poderes-ocultista': '../json/Poderes ocultista.json',
  'poderes-especialista': '../json/Poderes especialista.json',
  'poderes-combatente': '../json/Poderes combatente.json',
  'habilidade-sobrevivente': '../json/habilidades sobrevivente.json',
  'trilhas-ocultista': '../json/Trilhas ocultista.json',
  'trilhas-especialista': '../json/Trilhas especialista.json',
  'trilhas-combatente': '../json/Trilhas combatente.json',
  'trilhas-sobrevivente': '../json/Trilhas sobrevivente.json',
  'poderes-paranormais': '../json/Poderes Paranormais.json',
  'poderes-sangue': '../json/Poderes sangue.json',
  'poderes-morte': '../json/Poderes morte.json',
  'poderes-conhecimento': '../json/Poderes conhecimento.json',
  'poderes-energia': '../json/Poderes energia.json',
  'poderes-intencao': '../json/Poderes intencao.json',
  armas: '../json/Armas.json',
  'modificacoes-armas': '../json/Modificações de Armas.json',
  'habilidades-armas': '../json/Habilidades Armas.json',
  municoes: '../json/Munições.json',
  'modificacoes-municoes': '../json/Modificações de Munições.json',
  protecoes: '../json/Proteções.json',
  'modificacoes-protecoes': '../json/Modificações de Proteções.json',
  acessorios: '../json/Acessórios.json',
  'modificacoes-acessorios': '../json/Modificações de Acessórios.json',
  explosivos: '../json/Explosivos.json',
  'itens-operacionais': '../json/Itens Operacionais.json',
  'itens-paranormais': '../json/Itens Paranormais.json',
  'modificacoes-itens-paranormais': '../json/Modificações de Itens Paranormais.json',
  rituais: '../json/Rituais.json',
  missoes: '../json/Missoes.json',
  'maldicoes-armas': '../json/Maldições Armas.json',
  'maldicoes-protecoes': '../json/Maldições Proteção.json',
  'maldicoes-acessorios': '../json/Maldições Acessórios.json',
  'itens-amaldicoados': '../json/Itens Amaldiçoados.json',
  'criaturas-realidade': '../json/Criaturas Realidade.json',
  criaturas: '../json/Criaturas.json',
  regras: '../json/Regras.json',
  aliados: '../json/Aliados.json'
};
const registroBox = document.getElementById("registro-box");
const loginBox = document.getElementById("login-box");
const btnIrLogin = document.getElementById("btn-ir-login");
const btnIrRegistro = document.getElementById("btn-ir-registro");
const steps = document.querySelectorAll('.stepper-container .title');
const sections = {
    'Atributos': document.querySelector('.Atributos'),
    'Origem': document.querySelector('.Origem'),
    'Classe': document.querySelector('.Classe'),
    'Toques Finais': document.querySelector('.Toques_Finais')
};

  // 1. Lógica para NAVEGAR
  if (btnIrLogin) {
    btnIrLogin.addEventListener("click", () => {
      registroBox.classList.add("oculta");
      loginBox.classList.remove("oculta");
    });
  }

  if (btnIrRegistro) {
    btnIrRegistro.addEventListener("click", () => {
      loginBox.classList.add("oculta");
      registroBox.classList.remove("oculta");
    });
  }

  steps.forEach(step => {
    step.addEventListener('click', () => {
        // Remove active de todos os títulos
        steps.forEach(s => s.classList.remove('active'));
        // Adiciona active no clicado
        step.classList.add('active');

        // Oculta todas as seções
        Object.values(sections).forEach(sec => sec.classList.remove('active'));

        // Mostra a seção correspondente
        const nome = step.textContent.trim();
        if (sections[nome]) {
            sections[nome].classList.add('active');
        }

        // Atualiza as linhas do stepper
        document.querySelectorAll('.line').forEach((line, index) => {
            if (index < Array.from(steps).indexOf(step)) {
                line.classList.add('active');
            } else {
                line.classList.remove('active');
            }
        });
    });
  });

  // 2. Lógica para CARREGAR OS CARDS
  function carregarCards({ arquivo, container, erroMsg, tituloDescricao = "Resumo" }) {
  fetch(arquivo)
    .then(response => {
      if (!response.ok) throw new Error(erroMsg);
      return response.json();
    })
    .then(dados => {
      let htmlAcumulado = '';
      const estaNoGerador = container.closest('#Personagem') !== null;
      // É a lista de origens?
      const ehListaOrigem = container.classList.contains('lista-origens')|| 
                           container.classList.contains('lista-classes');
      dados.forEach(item => {
        const htmlTag = item.tag 
          ? `<p><strong>Tag:</strong> ${item.tag}</p>` 
          : '';
        const htmlPreR = item.PreR 
          ? `<p><strong>Pré-requisito:</strong> ${item.PreR}</p>` 
          : '';   
        const htmlCirculo = item.Circulo 
          ? `<p><strong>Círculo:</strong> ${item.Circulo}</p>` 
          : '';          
        const htmlElemento = item.Elemento 
          ? `<p><strong>Elemento:</strong> ${item.Elemento}</p>` 
          : ''; 
        const htmlVd = item.Vd 
          ? `<p><strong>VD:</strong> ${item.Vd}</p>` 
          : ''; 
        const htmlComp = item.Comp
          ? `<p><strong>Complementa:</strong> ${item.Comp}</p>` 
          : ''; 
        const htmlTipo = item.Tipo
          ? `<p><strong>Tipo:</strong> ${item.Tipo}</p>` 
          : ''; 
        const htmlGatilho = item.gatilho
          ? `<p><strong>Gatilho:</strong> ${item.gatilho}</p>` 
          : '';
        const htmlBonus = item.Bônus
          ? `<p><strong>Bônus:</strong> ${item.Bônus}</p>` 
          : '';
        const htmlPoder = item.Poder
          ? `<p><strong>Poder:</strong> ${item.Poder}</p>` 
          : '';

        let botaoDetalhes = '';
        if (estaNoGerador && ehListaOrigem) {
          const sufixoRandom = Math.random().toString(36).substr(2, 5);
          const idUnico = `extra-${item.id}-${sufixoRandom}`;
            botaoDetalhes = `
                <button class="btn-ver-mais" data-target="${idUnico}">
                    Ver Detalhes
                </button>
                <div class="detalhes-extra oculta" id="${idUnico}">
                    <hr>
                    <p>${item.detalhes || "Detalhes não disponíveis."}</p>
                </div>`;
        }

        htmlAcumulado += `
          <div class="classe-card" data-id="${item.id}">
            <h2>${item.nome}</h2>
            <p><strong>Origem:</strong> ${item.origem}</p>
            ${htmlTag}
            ${htmlVd}
            ${htmlTipo}            
            ${htmlCirculo}
            ${htmlElemento}
            ${htmlGatilho}
            <p><strong>${tituloDescricao}:</strong> ${item.descricao}</p>
            ${botaoDetalhes}
            ${htmlBonus}
            ${htmlPoder}
            ${htmlComp}            
            ${htmlPreR}
          </div>
        `;
      });
      container.innerHTML = htmlAcumulado;
    })
    .catch(error => console.error(error.message));
  }
  for (const [key, arquivo] of Object.entries(listas)) {
    const container = document.querySelectorAll(`.lista-${key}`);
    container.forEach(container => {
      carregarCards({ arquivo, container, erroMsg: `Não foi possível carregar ${key}`});
    })
  }

  // 3. Lógica para Busca e Filtros funcionarem juntos
  function aplicarFiltros(container, termoBusca = '', filtrosAtivos = []) {
    const cards = container.querySelectorAll('.classe-card');
    const termo = termoBusca.toLowerCase();

    cards.forEach(card => {
        const textoCard = card.innerText.toLowerCase();

        // Verifica busca
        const atendeBusca = termo === '' || textoCard.includes(termo);

        // Verifica filtros
        const atendeFiltros = filtrosAtivos.every(filtro => {
            const regexValor = new RegExp(`${filtro.categoria}\\s*:\\s*${filtro.valor}`, 'i');
            return regexValor.test(card.innerText);
        });

        // Mostra apenas se atende ambos
        card.style.display = atendeBusca && atendeFiltros ? 'block' : 'none';
    });
}

  // 4. Lógica de Busca Simples
  let timerBusca;
  document.addEventListener('input', (e) => {
    if (e.target.classList.contains('input-busca')) {
      clearTimeout(timerBusca);
      
      const termo = e.target.value.toLowerCase();
      const nomeClasse = e.target.getAttribute('data-container'); // ex: "lista-itens-amaldicoados"
      
      // BUSCA PELA CLASSE (Ponto que estava dando erro)
      const container = document.querySelector(`.${nomeClasse}`); 
      
      timerBusca = setTimeout(() => {
        if (container) {
          const telaAtiva = container.closest('.tela');
          const menu = telaAtiva.querySelector('.menu-filtros-flutuante');
          
          // Captura filtros selecionados se existirem
          const filtrosAtivos = menu ? Array.from(menu.querySelectorAll('.item-filtro.selecionado'))
            .map(el => ({
              valor: el.getAttribute('data-valor'),
              categoria: el.getAttribute('data-categoria')
            })) : [];
          
          aplicarFiltros(container, termo, filtrosAtivos);
        }
      }, Tempo);
    } 
  });
  
  
  // 5. Configuração Sistema Multi-Filtros
  const categoriasParaBuscar = {
      'Elemento': 'Elemento',
      'Círculo': 'Círculo',
      'Origem': 'Origem',
      'Tag': 'Tag',
      'Pré-requisito': 'Pré-requisito',
      'VD': 'VD',
      'Complementa': 'Complementa',
      'Tipo': 'Tipo'
  };

  const botoesFiltro = document.querySelectorAll('.btn-abrir-filtros');

  // 5.1. Ao clicar no botão Filtros
  botoesFiltro.forEach(botao => {
      botao.addEventListener('click', (e) => {
          e.stopPropagation();
          
          const containerPai = botao.closest('.container-botao-filtro');
          const menuDesteBotao = containerPai.querySelector('.menu-filtros-flutuante');
          
          const telaAtiva = botao.closest('.tela');
          const containerLista = telaAtiva.querySelector('[class*="lista-"]');

          if (containerLista && menuDesteBotao) {
              // MUDANÇA 1: Só gera o menu se ele estiver vazio. 
              // Se já tiver itens, a gente mantém (para não perder a seleção).
              if (menuDesteBotao.innerHTML.trim() === '') {
                  gerarMenuDeFiltros(containerLista, menuDesteBotao);
              }
              
              // Abre/Fecha o menu visualmente
              menuDesteBotao.classList.toggle('oculta');
          }
      });
  });

  // 5.2. Função que cria a lista (Executada apenas na 1ª vez)
  function gerarMenuDeFiltros(container, menuElemento) {
      const cards = container.querySelectorAll('.classe-card');
      const dadosEncontrados = {};

      for (let chave in categoriasParaBuscar) {
          dadosEncontrados[chave] = new Set();
      }

      cards.forEach(card => {
          const strongs = card.querySelectorAll('strong');
          strongs.forEach(s => {
              const textoLabel = s.innerText.replace(':', '').trim();
              if (Object.values(categoriasParaBuscar).includes(textoLabel)) {
                  const valor = s.nextSibling.textContent.trim();
                  const categoriaChave = Object.keys(categoriasParaBuscar).find(key => categoriasParaBuscar[key] === textoLabel);
                  if (valor && categoriaChave) {
                      dadosEncontrados[categoriaChave].add(valor);
                  }
              }
          });
      });

      // 5.3. Monta o HTML do Menu
      let htmlMenu = '';
      htmlMenu += `<div class="item-filtro limpar" data-valor="limpar">Limpar Filtros 🗑️</div>`;

      for (let [categoria, valores] of Object.entries(dadosEncontrados)) {
          if (valores.size > 0) {
              htmlMenu += `<div class="titulo-categoria">${categoria}</div>`;
              // Ordena números corretamente (10 vem depois de 2, não de 1)
                const listaOrdenada = Array.from(valores).sort((a, b) => {
                    return isNaN(a) ? a.localeCompare(b) : a - b;
                });
              listaOrdenada.forEach(valor => {
                  htmlMenu += `<div class="item-filtro" data-valor="${valor}" data-categoria="${categoria}">${valor}</div>`;
              });
          }
      }

      if (!htmlMenu.includes('item-filtro" data-valor')) {
          htmlMenu = '<div class="aviso-vazio">Nada para filtrar aqui.</div>';
      }

      menuElemento.innerHTML = htmlMenu;
  }

  // 5.4. Lógica do Clique (AGORA COM MULTI-SELEÇÃO)
  document.addEventListener('click', (e) => {
      if (e.target.classList.contains('item-filtro')) {
          e.stopPropagation();
          const menu = e.target.closest('.menu-filtros-flutuante');
          const telaAtiva = menu.closest('.tela');
          const container = telaAtiva.querySelector('[class*="lista-"]');

          if (e.target.getAttribute('data-valor') === 'limpar') {
              menu.querySelectorAll('.item-filtro').forEach(el => el.classList.remove('selecionado'));
          } else {
              e.target.classList.toggle('selecionado');
          }

          const termoInput = telaAtiva.querySelector('.input-busca').value.toLowerCase();

          const filtrosAtivos = Array.from(menu.querySelectorAll('.item-filtro.selecionado'))
                                    .map(el => ({
                                        valor: el.getAttribute('data-valor'),
                                        categoria: el.getAttribute('data-categoria')
                                    }));

          aplicarFiltros(container, termoInput, filtrosAtivos);
      }
  });


  // 5.5. Fecha menu ao clicar fora
  document.addEventListener('click', (e) => {
      if (!e.target.classList.contains('btn-abrir-filtros') && !e.target.closest('.container-botao-filtro')) {
          document.querySelectorAll('.menu-filtros-flutuante').forEach(menu => {
              menu.classList.add('oculta');
          });
      }
  });

  // 6. Rolagem de dados
  function rolarDado(lados) {
    const display = document.getElementById('valor-dado');
    const tipo = document.getElementById('tipo-dado');
    const container = document.getElementById('resultado-dado');
    const historico = document.getElementById('lista-historico');

    // Inicia animação de "tremer"
    container.classList.add('animar-dado');
    display.style.opacity = "0.5";

    // Simula o tempo de rolagem (500ms)
    setTimeout(() => {
        container.classList.remove('animar-dado');
        
        // Cálculo do dado: 1 até 'lados'
        const resultado = Math.floor(Math.random() * lados) + 1;
        
        // Atualiza a tela
        display.innerText = resultado;
        display.style.opacity = "1";
        tipo.innerText = `d${lados}`;

        // Efeito visual de Crítico (20 no d20) ou Desastre (1 no d20)
        if (lados === 20 && resultado === 20) display.style.color = "#ffdf00";
        else if (lados === 20 && resultado === 1) display.style.color = "#ff0000";
        else display.style.color = "#fff";

        // Adiciona ao histórico
        const item = document.createElement('li');
        item.innerText = `Rolou d${lados}: ${resultado}`;
        historico.prepend(item); // Adiciona no topo da lista

        // Limita o histórico a 5 itens
        if (historico.children.length > 5) {
            historico.removeChild(historico.lastChild);
        }
    }, 500);
  }
  window.rolarDado = rolarDado;
});

//7. ver detalhes origens e classes
// Adicione este ouvinte de eventos ao seu documento
document.addEventListener('click', (e) => {
    // Verifica se o que foi clicado é o nosso botão "Ver Detalhes"
    if (e.target.classList.contains('btn-ver-mais')) {
        
        // MUITO IMPORTANTE: Impede que o clique "suba" para o card
        // Assim o card não é selecionado quando você só quer ler o texto
        e.stopPropagation(); 
        e.preventDefault();

        // Pega o ID que está no atributo data-target do botão
        const targetId = e.target.getAttribute('data-target');
        const painelDetalhes = document.getElementById(targetId);

        if (painelDetalhes) {
            // Alterna a classe 'oculta'
            const estaOculto = painelDetalhes.classList.toggle('oculta');
            
            // Muda o texto do botão para o usuário saber que pode fechar
            e.target.innerText = estaOculto ? 'Ver Detalhes' : 'Fechar';
            
            console.log("Painel alternado:", targetId);
        } else {
            console.error("Não encontrei o painel com ID:", targetId);
        }
    }
});