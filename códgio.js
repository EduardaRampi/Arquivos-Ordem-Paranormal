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

  // Variável para salvar qual era a tela anterior (ajuda no botão voltar)
  let telaAnterior = null;

  // 1. Lógica para NAVEGAR
  botoesIr.forEach(btn => {
    btn.addEventListener('click', () => {
      const idDestino = btn.getAttribute('data-destino');
      const telaDestino = document.getElementById(idDestino);
      const telaAtual = btn.closest('.tela');

      if (telaDestino) {
        // Esconde a tela onde o botão estava
        telaAtual.classList.add('oculta');
        telaAtual.classList.remove('ativa');

        // Mostra a nova tela
        telaDestino.classList.remove('oculta');
        telaDestino.classList.add('ativa');
      }
    });
  });

  // 2. Lógica para VOLTAR
  botoesVoltar.forEach(btn => {
    btn.addEventListener('click', () => {
      const telaAtual = btn.closest('.tela');
    
      let idDestino = "tela-inicial"; // Destino padrão
      
      if (telaAtual.id === "Classes" || telaAtual.id === "Origens" || telaAtual.id === "Trilhas" || telaAtual.id === "Poderes") {
        idDestino = "Criação_persona";
      } else if (telaAtual.id === "Poderes ocultista" || telaAtual.id === "Poderes especialista" || telaAtual.id === "Poderes combatente") {
        idDestino = "Poderes";
      } else if (telaAtual.id === "Trilhas ocultista" || telaAtual.id === "Trilhas especialista" || telaAtual.id === "Trilhas combatente") {
        idDestino = "Trilhas";
      } else if (telaAtual.id === "Poderes Sangue" || telaAtual.id === "Poderes Morte" || telaAtual.id === "Poderes Conhecimento" || telaAtual.id === "Poderes Energia") {
        idDestino = "Poderes Paranormais";
      } else if (telaAtual.id === "Armas" || telaAtual.id === "Munições" || telaAtual.id === "Proteções" || telaAtual.id === "Acessórios" || telaAtual.id === "Explosivos" || telaAtual.id === "Itens Operacionais" || telaAtual.id === "Itens Paranormais") {
        idDestino = "Equipamentos";
      } else if (telaAtual.id === "Modificações de Armas") {
        idDestino = "Armas";
      } else if (telaAtual.id === "Modificações de Munições") {
        idDestino = "Munições";
      } else if (telaAtual.id === "Modificações de Proteções") {
        idDestino = "Proteções";
      } else if (telaAtual.id === "Modificações de Acessórios") {
        idDestino = "Acessórios";
      } else if (telaAtual.id === "Modificações de Itens Paranormais") {
        idDestino = "Itens Paranormais";
      }

      const telaDestino = document.getElementById(idDestino);

      // Esconde a atual e mostra a anterior
      telaAtual.classList.add('oculta');
      telaAtual.classList.remove('ativa');
      telaDestino.classList.remove('oculta');
      telaDestino.classList.add('ativa');
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
        const htmlCirculo = item.htmlCirculo 
          ? `<p><strong>Círculo:</strong> ${item.Circulo}</p>` 
          : '';          
        const htmlElemento = item.htmlElemento 
          ? `<p><strong>Elemento:</strong> ${item.Elemento}</p>` 
          : ''; 

        const card = `
          <div class="classe-card">
            <h2>${item.nome}</h2>
            <p><strong>Origem:</strong> ${item.origem}</p>
            ${htmlCirculo}
            ${htmlElemento}
            <p><strong>${tituloDescricao}:</strong> ${item.descricao}</p>
            ${htmlTag}
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
    arquivo: 'Modificações Armas.json',
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

});