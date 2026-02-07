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
      
      if (telaAtual.id === "Classes" || telaAtual.id === "Origens" || telaAtual.id === "Trilhas" || telaAtual.id === "Poderes") {
        idDestino = "Criação_persona";
      }

      if (telaAtual.id === "Poderes ocultista" || telaAtual.id === "Poderes especialista" || telaAtual.id === "Poderes combatente") {
        idDestino = "Poderes";
      }
      
      if (telaAtual.id === "Trilhas ocultista" || telaAtual.id === "Trilhas especialista" || telaAtual.id === "Trilhas combatente") {
        idDestino = "Trilhas";
      }

      if (telaAtual.id === "Poderes Sangue" || telaAtual.id === "Poderes Morte" || telaAtual.id === "Poderes Conhecimento" || telaAtual.id === "Poderes Energia") {
        idDestino = "Poderes Paranormais";
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

    // 5. Busca o arquivo dos Poderes
    fetch('Poderes.json')
    .then(response => {
      if (!response.ok) throw new Error("Não foi possível carregar os poderes");  
      return response.json();
    })
    .then(dados => {
      dados.forEach(item => {
        const htmlTag = item.tag ? `<p><strong>Tag:</strong> ${item.tag}</p>` : '';
        const card = `
          <div class="classe-card">
            <h2>${item.nome}</h2>
            <p><strong>Origem:</strong> ${item.origem}</p>
            <p><strong>Descrição:</strong> ${item.descricao}</p>
            ${htmlTag}
          </div>
        `;
        containerPoderes.innerHTML += card;
      });
    })
    .catch(error => console.error("Erro ao carregar poderes:", error));

    // 6. Busca o arquivo dos Poderes de Ocultista
    fetch('Poderes ocultista.json')
    .then(response => {
      if (!response.ok) throw new Error("Não foi possível carregar os poderes de ocultista");  
      return response.json();
    })
    .then(dados => {
      dados.forEach(item => {
        const htmlTag = item.tag ? `<p><strong>Tag:</strong> ${item.tag}</p>` : '';
        const card = `
          <div class="classe-card">
            <h2>${item.nome}</h2>
            <p><strong>Origem:</strong> ${item.origem}</p>
            <p><strong>Descrição:</strong> ${item.descricao}</p>
            ${htmlTag}
          </div>
        `;
        containerPoderesOcultista.innerHTML += card;
      });
    })
    .catch(error => console.error("Erro ao carregar poderes de ocultista:", error));

    // 7. Busca o arquivo dos Poderes de Especialista
    fetch('Poderes especialista.json')
    .then(response => {
      if (!response.ok) throw new Error("Não foi possível carregar os poderes de especialista");  
      return response.json();
    })
    .then(dados => {
      dados.forEach(item => {
        const htmlTag = item.tag ? `<p><strong>Tag:</strong> ${item.tag}</p>` : '';
        const card = `
          <div class="classe-card">
            <h2>${item.nome}</h2>
            <p><strong>Origem:</strong> ${item.origem}</p>
            <p><strong>Descrição:</strong> ${item.descricao}</p>
            ${htmlTag}
          </div>
        `;
        containerPoderesEspecialista.innerHTML += card;
      });
    })
    .catch(error => console.error("Erro ao carregar poderes de especialista:", error));

    // 8. Busca o arquivo dos Poderes de Combatente
    fetch('Poderes combatente.json')
    .then(response => {
      if (!response.ok) throw new Error("Não foi possível carregar os poderes de combatente");  
      return response.json();
    })
    .then(dados => {
      dados.forEach(item => {
        const htmlTag = item.tag ? `<p><strong>Tag:</strong> ${item.tag}</p>` : '';
        const card = `
          <div class="classe-card">
            <h2>${item.nome}</h2>
            <p><strong>Origem:</strong> ${item.origem}</p>
            <p><strong>Descrição:</strong> ${item.descricao}</p>
            ${htmlTag}
          </div>
        `;
        containerPoderesCombatente.innerHTML += card;
      });
    })
    .catch(error => console.error("Erro ao carregar poderes de combatente:", error));

    // 9. Busca o arquivo das Trilhas de Ocultista
    fetch('Trilhas ocultista.json')
    .then(response => {
      if (!response.ok) throw new Error("Não foi possível carregar as trilhas de ocultista");  
      return response.json();
    })
    .then(dados => {
      dados.forEach(item => {
        const htmlTag = item.tag ? `<p><strong>Tag:</strong> ${item.tag}</p>` : '';
        const card = `
          <div class="classe-card">
            <h2>${item.nome}</h2>
            <p><strong>Origem:</strong> ${item.origem}</p>
            <p><strong>Descrição:</strong> ${item.descricao}</p>
            ${htmlTag}
          </div>
        `;
        containerTrilhasOcultista.innerHTML += card;
      });
    })
    .catch(error => console.error("Erro ao carregar trilhas de ocultista:", error));

    // 10. Busca o arquivo das Trilhas de Especialista
    fetch('Trilhas especialista.json')
    .then(response => {
      if (!response.ok) throw new Error("Não foi possível carregar as trilhas de especialista");  
      return response.json();
    })
    .then(dados => {
      dados.forEach(item => {
        const htmlTag = item.tag ? `<p><strong>Tag:</strong> ${item.tag}</p>` : '';
        const card = `
          <div class="classe-card">
            <h2>${item.nome}</h2>
            <p><strong>Origem:</strong> ${item.origem}</p>
            <p><strong>Descrição:</strong> ${item.descricao}</p>
            ${htmlTag}
          </div>
        `;
        containerTrilhasEspecialista.innerHTML += card;
      });
    })
    .catch(error => console.error("Erro ao carregar trilhas de especialista:", error));

    // 11. Busca o arquivo das Trilhas de Combatente
    fetch('Trilhas combatente.json')
    .then(response => {
      if (!response.ok) throw new Error("Não foi possível carregar as trilhas de combatente");  
      return response.json();
    })
    .then(dados => {
      dados.forEach(item => {
        const htmlTag = item.tag ? `<p><strong>Tag:</strong> ${item.tag}</p>` : '';
        const card = `
          <div class="classe-card">
            <h2>${item.nome}</h2>
            <p><strong>Origem:</strong> ${item.origem}</p>
            <p><strong>Descrição:</strong> ${item.descricao}</p>
            ${htmlTag}
          </div>
        `;
        containerTrilhasCombatente.innerHTML += card;
      });
    })
    .catch(error => console.error("Erro ao carregar trilhas de combatente:", error));

    // 12. Busca o arquivo dos Poderes de Sangue
    fetch('Poderes sangue.json')
    .then(response => {
      if (!response.ok) throw new Error("Não foi possível carregar os poderes de sangue");  
      return response.json();
    })
    .then(dados => {
      dados.forEach(item => {
        const htmlTag = item.tag ? `<p><strong>Tag:</strong> ${item.tag}</p>` : '';
        const card = `
          <div class="classe-card">
            <h2>${item.nome}</h2>
            <p><strong>Origem:</strong> ${item.origem}</p>
            <p><strong>Descrição:</strong> ${item.descricao}</p>
            ${htmlTag}
          </div>
        `;
        containerPoderesSangue.innerHTML += card;
      });
    })
    .catch(error => console.error("Erro ao carregar poderes de sangue:", error));

    // 13. Busca o arquivo dos Poderes de Morte
    fetch('Poderes morte.json')
    .then(response => {
      if (!response.ok) throw new Error("Não foi possível carregar os poderes de morte");  
      return response.json();
    })
    .then(dados => {
      dados.forEach(item => {
        const htmlTag = item.tag ? `<p><strong>Tag:</strong> ${item.tag}</p>` : '';
        const card = `
          <div class="classe-card">
            <h2>${item.nome}</h2>
            <p><strong>Origem:</strong> ${item.origem}</p>
            <p><strong>Descrição:</strong> ${item.descricao}</p>
            ${htmlTag}
          </div>
        `;
        containerPoderesMorte.innerHTML += card;
      });
    })
    .catch(error => console.error("Erro ao carregar poderes de morte:", error));

    // 14. Busca o arquivo dos Poderes de Conhecimento
    fetch('Poderes conhecimento.json')
    .then(response => {
      if (!response.ok) throw new Error("Não foi possível carregar os poderes de conhecimento");  
      return response.json();
    })
    .then(dados => {
      dados.forEach(item => {
        const htmlTag = item.tag ? `<p><strong>Tag:</strong> ${item.tag}</p>` : '';
        const card = `
          <div class="classe-card">
            <h2>${item.nome}</h2>
            <p><strong>Origem:</strong> ${item.origem}</p>
            <p><strong>Descrição:</strong> ${item.descricao}</p>
            ${htmlTag}
          </div>
        `;
        containerPoderesConhecimento.innerHTML += card;
      });
    })
    .catch(error => console.error("Erro ao carregar poderes de conhecimento:", error));

    // 15. Busca o arquivo dos Poderes de Energia
    fetch('Poderes energia.json')
    .then(response => {
      if (!response.ok) throw new Error("Não foi possível carregar os poderes de energia");  
      return response.json();
    })
    .then(dados => {
      dados.forEach(item => {
        const htmlTag = item.tag ? `<p><strong>Tag:</strong> ${item.tag}</p>` : '';
        const card = `
          <div class="classe-card">
            <h2>${item.nome}</h2>
            <p><strong>Origem:</strong> ${item.origem}</p>
            <p><strong>Descrição:</strong> ${item.descricao}</p>
            ${htmlTag}
          </div>
        `;
        containerPoderesEnergia.innerHTML += card;
      });
    })
    .catch(error => console.error("Erro ao carregar poderes de energia:", error));

});