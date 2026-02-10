document.addEventListener('DOMContentLoaded', () => {
  const botoesIr = document.querySelectorAll('.btn-navegar');
  const botoesVoltar = document.querySelectorAll('.btn-voltar');
  const containerClasses = document.getElementById('lista-classes');
  const containerOrigens = document.getElementById('lista-origens');
  const containerPoderes = document.getElementById('lista-poderes');
  const containerPoderesOcultista = document.getElementById('lista-poderes-ocultista');
  const containerPoderesEspecialista = document.getElementById('lista-poderes-especialista');
  const containerPoderesCombatente = document.getElementById('lista-poderes-combatente');
  const containerTrilhasOcultista = document.getElementById('lista-trilhas-ocultista');
  const containerTrilhasEspecialista = document.getElementById('lista-trilhas-especialista');
  const containerTrilhasCombatente = document.getElementById('lista-trilhas-combatente');
  const containerPoderesSangue = document.getElementById('lista-poderes-sangue');
  const containerPoderesMorte = document.getElementById('lista-poderes-morte');
  const containerPoderesConhecimento = document.getElementById('lista-poderes-conhecimento');
  const containerPoderesEnergia = document.getElementById('lista-poderes-energia');
  const containerArmas = document.getElementById('lista-armas');
  const containerModificacoesArmas = document.getElementById('lista-modificacoes-armas');
  const containerMunicoes = document.getElementById('lista-municoes');
  const containerModificacoesMunicoes = document.getElementById('lista-modificacoes-municao');
  const containerProtecoes = document.getElementById('lista-protecoes');
  const containerModificacoesProtecoes = document.getElementById('lista-modificacoes-protecoes');
  const containerAcessorios = document.getElementById('lista-acessorios');
  const containerModificacoesAcessorios = document.getElementById('lista-modificacoes-acessorios');
  const containerExplosivos = document.getElementById('lista-explosivos');
  const containerItensOperacionais = document.getElementById('lista-itens-operacionais');
  const containerItensParanormais = document.getElementById('lista-itens-paranormais');
  const containerModificacoesItensParanormais = document.getElementById('lista-modificacoes-itens-paranormais');
  const containerPoderesParanormais = document.getElementById('lista-poderes-paranormais');
  const containerRituais = document.getElementById('lista-rituais');
  const containersMissoes = document.getElementById('lista-missoes');
  const containerMaldiçoesArmas = document.getElementById('lista-maldicoes-armas');
  const containerMaldiçoesProtecoes = document.getElementById('lista-maldicoes-protecoes');
  const containerMaldiçoesAcessorios = document.getElementById('lista-maldicoes-acessorios');
  const containerItensAmaldicoados = document.getElementById('lista-itens-amaldicoados');
  const containerCriaturasRealidade = document.getElementById('lista-criaturas-realidade');
  const containerRegras = document.getElementById('lista-regras');
  const containerCriaturas= document.getElementById('lista-criaturas');

  // Variável para salvar qual era a tela anterior (ajuda no botão voltar)
  let telaAnterior = null;

  // 1. Lógica para NAVEGAR
  botoesIr.forEach(btn => {
    btn.addEventListener('click', () => {
      const idDestino = btn.getAttribute('data-destino');
      const telaDestino = document.getElementById(idDestino);
      const telaAtual = btn.closest('.tela');

      if (!telaDestino || telaDestino === telaAtual) return;
      telaAtual.classList.remove('ativa');
      setTimeout(() => {
        telaAtual.classList.add('oculta');
        telaDestino.classList.remove('oculta');
        telaDestino.offsetHeight; // Força o reflow para garantir que a transição funcione
        telaDestino.classList.add('ativa');
      }, 250); // Tempo para a transição de fade (ajuste conforme necessário)
    });
  });

  // 2. Lógica para VOLTAR
  botoesVoltar.forEach(btn => {
    btn.addEventListener('click', () => {
      const telaAtual = btn.closest('.tela');
    
      let idDestino = "tela-inicial"; // Destino padrão
      
      if (telaAtual.id === "Classes" || telaAtual.id === "Origens" || telaAtual.id === "Trilhas" || telaAtual.id === "Poderes" || telaAtual.id === "Poderes Paranormais") {
        idDestino = "Criação_persona";
      } else if (telaAtual.id === "Poderes ocultista" || telaAtual.id === "Poderes especialista" || telaAtual.id === "Poderes combatente") {
        idDestino = "Poderes";
      } else if (telaAtual.id === "Trilhas ocultista" || telaAtual.id === "Trilhas especialista" || telaAtual.id === "Trilhas combatente") {
        idDestino = "Trilhas";
      } else if (telaAtual.id === "Poderes Sangue" || telaAtual.id === "Poderes Morte" || telaAtual.id === "Poderes Conhecimento" || telaAtual.id === "Poderes Energia") {
        idDestino = "Poderes Paranormais";
      } else if (telaAtual.id === "Armas"  || telaAtual.id === "Proteções" || telaAtual.id === "Acessórios" || telaAtual.id === "Explosivos" || telaAtual.id === "Itens Operacionais" || telaAtual.id === "Itens Paranormais") {
        idDestino = "Equipamentos";
      } else if (telaAtual.id === "Modificações para Armas" || telaAtual.id === "Maldições para Armas" || telaAtual.id === "Munições") {
        idDestino = "Armas";
      } else if (telaAtual.id === "Modificações para Munições") {
        idDestino = "Munições";
      } else if (telaAtual.id === "Modificações para Proteções" || telaAtual.id === "Maldições para Proteções") {
        idDestino = "Proteções";
      } else if (telaAtual.id === "Modificações para Acessórios" || telaAtual.id === "Maldições para Acessórios") {
        idDestino = "Acessórios";
      } else if (telaAtual.id === "Modificações para Itens Paranormais") {
        idDestino = "Itens Paranormais";
      } else if ( telaAtual.id === "Criaturas Realidade" ){
        idDestino = "Criaturas";
      }

      const telaDestino = document.getElementById(idDestino);

      telaAtual.classList.remove('ativa');
      setTimeout(() => {
        telaAtual.classList.add('oculta');
        telaDestino.classList.remove('oculta');
        telaDestino.offsetHeight; // Força o reflow para garantir que a transição funcione
        telaDestino.classList.add('ativa');
      }, 250); // Tempo para a transição de fade (ajuste conforme necessário)
    });
  });

  // 3. Lógica para CARREGAR OS CARDS
  function carregarCards({ arquivo, container, erroMsg, tituloDescricao = "Descrição" }) {
  fetch(arquivo)
    .then(response => {
      if (!response.ok) throw new Error(erroMsg);
      return response.json();
    })
    .then(dados => {
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

        const card = `
          <div class="classe-card">
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

        container.innerHTML += card;
      });
    })
    .catch(error => console.error(error.message));
  }
  carregarCards({
    arquivo: 'classes.json',
    container: containerClasses,
    erroMsg: 'Não foi possível carregar as classes',
    tituloDescricao: 'Resumo'
  });

  carregarCards({
    arquivo: 'Origens.json',
    container: containerOrigens,
    erroMsg: 'Não foi possível carregar as origens'
  });

  carregarCards({
    arquivo: 'Poderes.json',
    container: containerPoderes,
    erroMsg: 'Não foi possível carregar os poderes'
  });

  carregarCards({
    arquivo: 'Poderes ocultista.json',
    container: containerPoderesOcultista,
    erroMsg: 'Não foi possível carregar os poderes de ocultista'
  });

  carregarCards({
    arquivo: 'Poderes especialista.json',
    container: containerPoderesEspecialista,
    erroMsg: 'Não foi possível carregar os poderes de especialista'
  });

  carregarCards({
    arquivo: 'Poderes combatente.json',
    container: containerPoderesCombatente,
    erroMsg: 'Não foi possível carregar os poderes de combatente'
  });

  carregarCards({
    arquivo: 'Trilhas ocultista.json',
    container: containerTrilhasOcultista,
    erroMsg: 'Não foi possível carregar as trilhas de ocultista'
  });

  carregarCards({
    arquivo: 'Trilhas especialista.json',
    container: containerTrilhasEspecialista,
    erroMsg: 'Não foi possível carregar as trilhas de especialista'
  });

  carregarCards({
    arquivo: 'Trilhas combatente.json',
    container: containerTrilhasCombatente,
    erroMsg: 'Não foi possível carregar as trilhas de combatente'
  });

  carregarCards({
    arquivo: 'Poderes Paranormais.json',
    container: containerPoderesParanormais,
    erroMsg: 'Não foi possível carregar os poderes paranormais'
  });

  carregarCards({
    arquivo: 'Poderes sangue.json',
    container: containerPoderesSangue,
    erroMsg: 'Não foi possível carregar os poderes de sangue'
  });

  carregarCards({
    arquivo: 'Poderes morte.json',
    container: containerPoderesMorte,
    erroMsg: 'Não foi possível carregar os poderes de morte'
  });

  carregarCards({
    arquivo: 'Poderes conhecimento.json',
    container: containerPoderesConhecimento,
    erroMsg: 'Não foi possível carregar os poderes de conhecimento'
  });

  carregarCards({
    arquivo: 'Poderes energia.json',
    container: containerPoderesEnergia,
    erroMsg: 'Não foi possível carregar os poderes de energia'
  });

  carregarCards({
    arquivo: 'Armas.json',
    container: containerArmas,
    erroMsg: 'Não foi possível carregar as armas'
  });

  carregarCards({
    arquivo: 'Modificações de Armas.json',
    container: containerModificacoesArmas,
    erroMsg: 'Não foi possível carregar as modificações de armas'
  });

  carregarCards({
    arquivo: 'Munições.json',
    container: containerMunicoes,
    erroMsg: 'Não foi possível carregar as munições'
  });

  carregarCards({
    arquivo: 'Modificações de Munições.json',
    container: containerModificacoesMunicoes,
    erroMsg: 'Não foi possível carregar as modificações de munições'
  });

  carregarCards({
    arquivo: 'Proteções.json',
    container: containerProtecoes,
    erroMsg: 'Não foi possível carregar as proteções'
  });

  carregarCards({
    arquivo: 'Modificações de Proteções.json',
    container: containerModificacoesProtecoes,
    erroMsg: 'Não foi possível carregar as modificações de proteções'
  });

  carregarCards({
    arquivo: 'Acessórios.json',
    container: containerAcessorios,
    erroMsg: 'Não foi possível carregar os acessórios'
  });

  carregarCards({
    arquivo: 'Modificações de Acessórios.json',
    container: containerModificacoesAcessorios,
    erroMsg: 'Não foi possível carregar as modificações de acessórios'
  });

  carregarCards({
    arquivo: 'Explosivos.json',
    container: containerExplosivos,
    erroMsg: 'Não foi possível carregar os explosivos'
  });

  carregarCards({
    arquivo: 'Itens Operacionais.json',
    container: containerItensOperacionais,
    erroMsg: 'Não foi possível carregar os itens operacionais'
  });

  carregarCards({
    arquivo: 'Itens Paranormais.json',
    container: containerItensParanormais,
    erroMsg: 'Não foi possível carregar os itens paranormais'
  });

  carregarCards({
    arquivo: 'Modificações de Itens Paranormais.json',
    container: containerModificacoesItensParanormais,
    erroMsg: 'Não foi possível carregar as modificações de itens paranormais'
  });

  carregarCards({
    arquivo: 'Rituais.json',
    container: containerRituais,
    erroMsg: 'Não foi possível carregar os rituais'
  });

  carregarCards({
    arquivo: 'Missoes.json',
    container: containersMissoes,
    erroMsg: 'Não foi possível carregar as missões'
  });

  carregarCards({
    arquivo: 'Maldições Armas.json',
    container: containerMaldiçoesArmas,
    erroMsg: 'Não foi possível carregar as maldições para armas'
  });

  carregarCards({
    arquivo: 'Maldições Proteção.json',
    container: containerMaldiçoesProtecoes,
    erroMsg: 'Não foi possível carregar as maldições para proteção'
  });

  carregarCards({
    arquivo: 'Maldições Acessórios.json',
    container: containerMaldiçoesAcessorios,
    erroMsg: 'Não foi possível carregar as maldições para acessórios'
  });

  carregarCards({
    arquivo: 'Itens Amaldiçoados.json',
    container: containerItensAmaldicoados,
    erroMsg: 'Não foi possível carregar os itens amaldiçoados'
  });

  carregarCards({
    arquivo: 'Criaturas Realidade.json',
    container: containerCriaturasRealidade,
    erroMsg: 'Não foi possível carregar as criaturas da realidade'
  });

  carregarCards({
    arquivo: 'Criaturas.json',
    container: containerCriaturas,
    erroMsg: 'Não foi possível carregar as criaturas'
  });

  carregarCards({
    arquivo: 'Regras.json',
    container: containerRegras,
    erroMsg: 'Não foi possível carregar as regras'
  });

  // 4. Lógica de Busca Simples
  document.addEventListener('input', (e) => {
  if (e.target.classList.contains('input-busca')) {
    const termo = e.target.value.toLowerCase();
    const idContainer = e.target.getAttribute('data-container');
    const container = document.getElementById(idContainer);
    const cards = container.querySelectorAll('.classe-card');

    cards.forEach(card => {
      const nome = card.querySelector('h2').innerText.toLowerCase();
      const texto = card.innerText.toLowerCase(); // Pega todo o texto do card
      if (nome.includes(termo) || texto.includes(termo)) {
        card.style.display = "block"; // Mostra se bater com a busca
      } else {
        card.style.display = "none";  // Esconde se não bater
      }
    });
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
          const containerLista = telaAtiva.querySelector('[id^="lista-"]');

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
          e.stopPropagation(); // Impede que o menu feche ao clicar numa opção

          const menu = e.target.closest('.menu-filtros-flutuante');
          const telaAtiva = menu.closest('.tela');
          const container = telaAtiva.querySelector('[id^="lista-"]');
          const cards = container.querySelectorAll('.classe-card');
          const valorClicado = e.target.getAttribute('data-valor');

          // A) Se clicou em "Limpar Filtros"
          if (valorClicado === 'limpar') {
              // Remove a classe 'selecionado' de todos
              menu.querySelectorAll('.item-filtro').forEach(el => el.classList.remove('selecionado'));
              // Mostra todos os cards
              cards.forEach(card => card.style.display = 'block');
              return; // Encerra por aqui
          }

          // B) Se clicou em um item normal: Alterna (Liga/Desliga)
          e.target.classList.toggle('selecionado');

          // C) Coleta TODOS os filtros que estão ativos AGORA
          const filtrosAtivos = Array.from(menu.querySelectorAll('.item-filtro.selecionado'))
                                    .map(el => ({ 
                                      valor: el.getAttribute('data-valor'),
                                      categoria: el.getAttribute('data-categoria')
                                    }));

          // D) Aplica a filtragem "E" (Tem que ter TODOS os itens selecionados)
          cards.forEach(card => {
              if (filtrosAtivos.length === 0) {
                  card.style.display = 'block'; // Nenhum filtro? Mostra tudo.
              } else {
                  const textoCard = card.innerText;
                  
                  // MÁGICA DO MULTI-FILTRO: verifica se o card tem TODOS os filtros ativos
                  const atendeTodosFiltros = filtrosAtivos.every(filtro => {
                    const valorEscapado = filtro.valor.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                    const regexRigida = new RegExp(`${filtro.categoria}\\s*:\\s*${valorEscapado}\\b`, 'i');
                    return regexRigida.test(textoCard);
                  });
                  
                  card.style.display = atendeTodosFiltros ? 'block' : 'none';
              }
          });
          
          // NOTA: Removemos a linha que fechava o menu (menu.classList.add('oculta')) 
          // para o usuário poder continuar clicando em mais opções.
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
});