document.addEventListener('DOMContentLoaded', () => {
  const botoesIr = document.querySelectorAll('.btn-navegar');
  const botoesVoltar = document.querySelectorAll('.btn-voltar');
  const Tempo = 250;
  const listas = {
  classes: 'classes.json',
  origens: 'Origens.json',
  poderes: 'Poderes.json',
  'poderes-ocultista': 'Poderes ocultista.json',
  'poderes-especialista': 'Poderes especialista.json',
  'poderes-combatente': 'Poderes combatente.json',
  'trilhas-ocultista': 'Trilhas ocultista.json',
  'trilhas-especialista': 'Trilhas especialista.json',
  'trilhas-combatente': 'Trilhas combatente.json',
  'poderes-paranormais': 'Poderes Paranormais.json',
  'poderes-sangue': 'Poderes sangue.json',
  'poderes-morte': 'Poderes morte.json',
  'poderes-conhecimento': 'Poderes conhecimento.json',
  'poderes-energia': 'Poderes energia.json',
  armas: 'Armas.json',
  'modificacoes-armas': 'Modificações de Armas.json',
  municoes: 'Munições.json',
  'modificacoes-municoes': 'Modificações de Munições.json',
  protecoes: 'Proteções.json',
  'modificacoes-protecoes': 'Modificações de Proteções.json',
  acessorios: 'Acessórios.json',
  'modificacoes-acessorios': 'Modificações de Acessórios.json',
  explosivos: 'Explosivos.json',
  'itens-operacionais': 'Itens Operacionais.json',
  'itens-paranormais': 'Itens Paranormais.json',
  'modificacoes-itens-paranormais': 'Modificações de Itens Paranormais.json',
  rituais: 'Rituais.json',
  missoes: 'Missoes.json',
  'maldicoes-armas': 'Maldições Armas.json',
  'maldicoes-protecoes': 'Maldições Proteção.json',
  'maldicoes-acessorios': 'Maldições Acessórios.json',
  'itens-amaldicoados': 'Itens Amaldiçoados.json',
  'criaturas-realidade': 'Criaturas Realidade.json',
  criaturas: 'Criaturas.json',
  regras: 'Regras.json'
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

  // Variável para salvar qual era a tela anterior (ajuda no botão voltar)
  let telaAnterior = null;

  // 1. Lógica para NAVEGAR
  botoesIr.forEach(btn => {
    btn.addEventListener('click', () => {
      const idDestino = btn.getAttribute('data-destino');
      const telaDestino = document.getElementById(idDestino);
      const telaAtual = btn.closest('.tela' ) || document.querySelector('.tela.ativa');
      const checkboxMenu = document.getElementById('close-menu');
      if (checkboxMenu) checkboxMenu.checked = false;

      if (!telaDestino || telaDestino === telaAtual) return;
      if (idDestino === "Perfil") {
        carregarDadosPerfil();
      }
      telaAtual.classList.remove('ativa');
      setTimeout(() => {
        telaAtual.classList.add('oculta');
        telaDestino.classList.remove('oculta');
        telaDestino.offsetHeight; // Força o reflow para garantir que a transição funcione
        telaDestino.classList.add('ativa');
      }, Tempo); // Tempo para a transição de fade (ajuste conforme necessário)
    });
  });

  btnIrLogin.addEventListener("click", () => {
    registroBox.classList.add("oculta");
    loginBox.classList.remove("oculta");
  });

  btnIrRegistro.addEventListener("click", () => {
    loginBox.classList.add("oculta");
    registroBox.classList.remove("oculta");
  });

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


  // 2. Lógica para VOLTAR
  botoesVoltar.forEach(btn => {
    btn.addEventListener('click', () => {
      const telaAtual = btn.closest('.tela');
      
      const rotasVoltar = {
        // Tela Atual: Tela de Destino
        "Criação_persona": "Arquivos",
        "Equipamentos": "Arquivos",        
        "Criaturas": "Arquivos",
        "Rituais": "Arquivos",
        "Itens Amaldiçoados": "Arquivos",
        "Regras": "Arquivos",
        "Missões": "Arquivos",

        "Fichas": "Fichas_Campanhas",
        "Campanhas": "Fichas_Campanhas",

        "Personagem": "Fichas",
        "Visualizar_Ficha":"Fichas",

        "Classes": "Criação_persona",
        "Origens": "Criação_persona",
        "Trilhas": "Criação_persona",
        "Poderes": "Criação_persona",
        "Poderes Paranormais": "Criação_persona",
        
        "Poderes ocultista": "Poderes",
        "Poderes especialista": "Poderes",
        "Poderes combatente": "Poderes",
        
        "Trilhas ocultista": "Trilhas",
        "Trilhas especialista": "Trilhas",
        "Trilhas combatente": "Trilhas",
        
        "Poderes Sangue": "Poderes Paranormais",
        "Poderes Morte": "Poderes Paranormais",
        "Poderes Conhecimento": "Poderes Paranormais",
        "Poderes Energia": "Poderes Paranormais",
        
        "Armas": "Equipamentos",
        "Proteções": "Equipamentos",
        "Acessórios": "Equipamentos",
        "Explosivos": "Equipamentos",
        "Itens Operacionais": "Equipamentos",
        "Itens Paranormais": "Equipamentos",
        
        "Modificações para Armas": "Armas",
        "Maldições para Armas": "Armas",
        "Munições": "Armas",
        
        "Modificações para Munições": "Munições",
        
        "Modificações para Proteções": "Proteções",
        "Maldições para Proteções": "Proteções",
        
        "Modificações para Acessórios": "Acessórios",
        "Maldições para Acessórios": "Acessórios",
        
        "Modificações para Itens Paranormais": "Itens Paranormais",
        
        "Criaturas Realidade": "Criaturas"
      };
      const idDestino = rotasVoltar[telaAtual.id] || "tela-inicial";
      const telaDestino = document.getElementById(idDestino);
      if (!telaDestino) return;

      telaAtual.classList.remove('ativa');
      setTimeout(() => {
        telaAtual.classList.add('oculta');
        telaDestino.classList.remove('oculta');
        telaDestino.offsetHeight; // Força o reflow para garantir que a transição funcione
        telaDestino.classList.add('ativa');
      }, Tempo); // Tempo para a transição de fade (ajuste conforme necessário)
    });
  });

  // 3. Lógica para CARREGAR OS CARDS
  function carregarCards({ arquivo, container, erroMsg, tituloDescricao = "Resumo" }) {
  fetch(arquivo)
    .then(response => {
      if (!response.ok) throw new Error(erroMsg);
      return response.json();
    })
    .then(dados => {
      let htmlAcumulado = '';
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

        htmlAcumulado += `
          <div class="classe-card" data-id="${item.id}">
            <h2>${item.nome}</h2>
            <p><strong>Origem:</strong> ${item.origem}</p>
            ${htmlVd}
            ${htmlTipo}            
            ${htmlCirculo}
            ${htmlElemento}
            <p><strong>${tituloDescricao}:</strong> ${item.descricao}</p>
            ${htmlTag}
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
      carregarCards({ arquivo, container, erroMsg: `Não foi possível carregar ${key}` });
    })
  }

  // 4. Lógica para Busca e Filtros funcionarem juntos
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

  // 5. Lógica de Busca Simples
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
  
  
  // 6. Configuração Sistema Multi-Filtros
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

  // 6.1. Ao clicar no botão Filtros
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

  // 6.2. Função que cria a lista (Executada apenas na 1ª vez)
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

      // 6.3. Monta o HTML do Menu
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

  // 6.4. Lógica do Clique (AGORA COM MULTI-SELEÇÃO)
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


  // 6.5. Fecha menu ao clicar fora
  document.addEventListener('click', (e) => {
      if (!e.target.classList.contains('btn-abrir-filtros') && !e.target.closest('.container-botao-filtro')) {
          document.querySelectorAll('.menu-filtros-flutuante').forEach(menu => {
              menu.classList.add('oculta');
          });
      }
  });

  // 7. Rolagem de dados
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