document.addEventListener('DOMContentLoaded', () => {
  const botoesIr = document.querySelectorAll('.btn-navegar');
  const botoesVoltar = document.querySelectorAll('.btn-voltar');
  const containerClasses = document.getElementById('lista-classes');
  const containerOrigens = document.getElementById('lista-origens');

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
      
      // Lógica específica: Para onde voltar?
      // Se estivermos em "Classes", voltamos para "Criação_persona"
      // Se estivermos em "Criação_persona", voltamos para "tela-inicial"
      let idDestino = "tela-inicial"; // Destino padrão
      
      if (telaAtual.id === "Classes" || telaAtual.id === "Origens") {
        idDestino = "Criação_persona";
      }
      
      const telaDestino = document.getElementById(idDestino);

      // Esconde a atual e mostra a anterior
      telaAtual.classList.add('oculta');
      telaAtual.classList.remove('ativa');
      telaDestino.classList.remove('oculta');
      telaDestino.classList.add('ativa');
    });
  });

  // 3. Busca o arquivo das Classes
  fetch('classes.json')
    .then(response => {
      if (!response.ok) throw new Error("Não foi possível carregar o JSON");
      return response.json();
    })
    .then(dados => {
      dados.forEach(item => {
        const htmlTag = item.tag ? `<p><strong>Tag:</strong> ${item.tag}</p>` : '';
        const card = `
          <div class="classe-card">
            <h2>${item.nome}</h2>
            <p><strong>Origem:</strong> ${item.origem}</p>
            <p><strong>Resumo:</strong> ${item.descricao}</p>
            ${htmlTag}
          </div>
        `;
        containerClasses.innerHTML += card;
      });
    })
    .catch(error => console.error("Erro:", error));
  
  // 4. Busca o arquivo das Origens
  fetch('Origens.json')
    .then(response => {
      if (!response.ok) throw new Error("Não foi possível carregar as origens");
      return response.json();
    })
    .then(dados => {
      dados.forEach(item => {
        // Mantendo exatamente a mesma estrutura visual (classe-card)
        const htmlTag = item.tag ? `<p><strong>Tag:</strong> ${item.tag}</p>` : '';
        const card = `
          <div class="classe-card">
            <h2>${item.nome}</h2>
            <p><strong>Origem:</strong> ${item.origem}</p>
            <p><strong>Descrição:</strong> ${item.descricao}</p>
            ${htmlTag}
          </div>
        `;
        containerOrigens.innerHTML += card;
      });
    })
    .catch(error => console.error("Erro ao carregar origens:", error));
});