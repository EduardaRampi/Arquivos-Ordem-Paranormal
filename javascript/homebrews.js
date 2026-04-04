import { auth, db } from './firebase-config.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";
import { collection, addDoc, getDocs, query, where, doc, updateDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";

onAuthStateChanged(auth, (user) => {
    if (user) {
        if (window.location.pathname.includes("Homebrews.html")) {
            carregarMeusHomebrews(user.uid);
        }
    } else {
        if (window.location.pathname.includes("Homebrew.html")) {
            window.location.href = "../index.html";
        }
    }
});

function gerarCodigoCurto() {
    const caracteres = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let resultado = '';
    for (let i = 0; i < 6; i++) {
        resultado += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
    }
    return resultado;
}

window.abrirModalHomebrew = function(tipo) {
    document.getElementById('homebrew-tipo').value = tipo;
    document.getElementById('titulo-homebrew').innerText = `Criar Novo(a) ${tipo.charAt(0).toUpperCase() + tipo.slice(1)}`;
    
    const containerDinamico = document.getElementById('campos-dinamicos-hb');
    containerDinamico.innerHTML = ""; // Limpa campos anteriores

    // O seu HTML de inputs dinâmicos fica aqui (Mantido idêntico)
    if (tipo === 'itens') {
        containerDinamico.innerHTML = `
            <div class="grid-editar">
                <div class="campo">
                    <label>Imagem</label>
                    <input type="text" id="hb-foto" placeholder="https://link-da-imagem.png">
                </div>

                <div class="campo">
                    <label>Nome</label>
                    <input type="text" id="hb-nome">
                </div>

                <div class="campo">
                    <label>Tipo de Item</label>
                    <div class="filtros">
                        <select id="hb-item-tipo">
                            <option value="armas">Arma</option>
                            <option value="municoes">Munição</option>
                            <option value="protecoes">Proteção</option>
                            <option value="acessorios">Acessório</option>
                            <option value="explosivo">Explosivo</option>
                            <option value="operacionais">Item Operacional</option>
                            <option value="paranormais">Item Paranormal</option>
                            <option value="amaldicoados">Item Amaldiçoado</option>
                        </select>
                    </div>
                </div>

                <div class="campo pequeno">
                    <label>Espaço</label>
                    <input type="number" id="hb-espaco" value="1">
                </div>

                <div class="campo pequeno">
                    <label>Categoria</label>
                    <input type="number" id="hb-cat" value="0">
                </div>

                <div class="campo">
                    <label>Tipo</label>
                    <input type="text" id="hb-tipo" placeholder="Ex: Arma Leve">
                </div>

                <div class="campo">
                    <label>Dano</label>
                    <input type="text" id="hb-dano" placeholder="Ex: 1d10">
                </div>

                <div class="campo">
                    <label>Crítico</label>
                    <input type="text" id="hb-critico" placeholder="Ex: 19/x3">
                </div>

                <div class="campo">
                    <label>Tipo de Dano</label>
                    <input type="text" id="hb-tipoDano" placeholder="Ex: Perfuração">
                </div>

                <div class="campo">
                    <label>Alcance</label>
                    <input type="text" id="hb-alcance" placeholder="Ex: Curto">
                </div>

                <div class="campo">
                    <label>Habilidade</label>
                    <input type="text" id="hb-habilidade" placeholder="Ex: Ágil">
                </div>

                <div class="campo pequeno">
                    <label>Defesa</label>
                    <input type="number" id="hb-defesa" placeholder="3">
                </div>

                <div class="campo campo-longo">
                    <label>Descrição</label>
                    <textarea id="hb-desc" rows="4"></textarea>
                </div>
            </div>
        `;
    } else if (tipo === 'rituais') {
        containerDinamico.innerHTML = `
            <div class="grid-editar">
                    <div class="campo">
                        <label>Nome</label>
                        <input type="text" id="hb-nome">
                    </div>

		            <div class="campo"><label>URL da Imagem (Opcional)</label><input type="text" id="hb-imagem" placeholder="Link da imagem..."></div>

                    <div class="campo">
                        <label>Elemento</label>
                        <input type="text" id="hb-elemento" placeholder="Ex: Sangue">
                    </div>

                    <div class="campo">
                        <label>Circulo</label>
                        <input type="number" id="hb-circulo" placeholder="Ex: 1">
                    </div>

                    <div class="campo">
                        <label>Execução</label>
                        <input type="text" id="hb-execucao" placeholder="Ex: Completa">
                    </div>

                    <div class="campo">
                        <label>Alcance</label>
                        <input type="text" id="hb-alcance" placeholder="Ex: Pessoal">
                    </div>

                    <div class="campo">
                        <label>Alvo</label>
                        <input type="text" id="hb-alvo" placeholder="Ex: Você">
                    </div>

                    <div class="campo">
                        <label>Duração</label>
                        <input type="text" id="hb-duracao" placeholder="Ex: Instantânea">
                    </div>

                    <div class="campo">
                        <label>Resistencia</label>
                        <input type="text" id="hb-resistencia" placeholder="Ex: Vontade parcial">
                    </div>

                    <div class="campo campo-longo">
                        <label>Descrição</label>
                        <textarea id="hb-desc" rows="4"></textarea>
                    </div>

                    <div class="campo campo-longo">
                        <label>Discente</label>
                        <textarea id="hb-discente" rows="4"></textarea>
                    </div>

                    <div class="campo campo-longo">
                        <label>Verdadeiro</label>
                        <textarea id="hb-verdadeiro" rows="4"></textarea>
                    </div>

            </div>
        `;
    } else if (tipo === 'habilidades') {
        containerDinamico.innerHTML = `
            <div class="campo"><label>Nome</label><input type="text" id="hb-nome"></div>
            <div class="campo campo-longo"><label>Descrição</label><textarea id="hb-desc" rows="4"></textarea></div>
        `;
    } else {
        containerDinamico.innerHTML = `
            <div class="campo"><label>Nome da Trilha</label><input type="text" id="hb-nome"></div>
            <div class="campo">
                <label>Classe Destinada</label>
                <div class="filtros">
                    <select id="hb-trilha-classe">
                        <option value="combatente">Combatente</option>
                        <option value="especialista">Especialista</option>
                        <option value="ocultista">Ocultista</option>
                        <option value="sobrevivente">Sobrevivente</option>
                        <option value="geral">Geral</option>
                    </select>
                </div>
            </div>
            <div class="campo"><label>NEX 10%</label><input type="text" id="hb-nex10-nome" placeholder="Nome"><textarea id="hb-nex10" rows="2"></textarea></div>
            <div class="campo"><label>NEX 40%</label><input type="text" id="hb-nex40-nome" placeholder="Nome"><textarea id="hb-nex40" rows="2"></textarea></div>
            <div class="campo"><label>NEX 65%</label><input type="text" id="hb-nex65-nome" placeholder="Nome"><textarea id="hb-nex65" rows="2"></textarea></div>
            <div class="campo"><label>NEX 99%</label><input type="text" id="hb-nex99-nome" placeholder="Nome"><textarea id="hb-nex99" rows="2"></textarea></div>
        `;
    }
    document.getElementById('modal-homebrew').classList.remove('modal-oculto');
};

window.fecharModalHomebrew = function() {
    document.getElementById('modal-homebrew').classList.add('modal-oculto');
};

window.salvarNovoHomebrew = async function() {
    const user = auth.currentUser;
    if (!user) return alert("Erro de autenticação!");

    const tipo = document.getElementById('homebrew-tipo').value;
    const nome = document.getElementById('hb-nome').value;

    if (!nome) return alert("Dê um nome ao seu Homebrew!");

    // Estrutura base para o Firebase
    let dadosConteudo = {};

    // Extrai os dados baseado no tipo
    if (tipo === 'itens') {
        dadosConteudo = {
            foto: document.getElementById('hb-foto').value,
            nome: document.getElementById('hb-nome').value,
            subtipo: document.getElementById('hb-item-tipo').value, // armas, protecoes, etc
            espaco: document.getElementById('hb-espaco').value,
            categoria: document.getElementById('hb-cat').value,
            tipo: document.getElementById('hb-tipo').value, // Ex: "Arma Leve"
            dano: document.getElementById('hb-dano').value,
            critico: document.getElementById('hb-critico').value,
            tipoDano: document.getElementById('hb-tipoDano').value,
            alcance: document.getElementById('hb-alcance').value,
            habilidade: document.getElementById('hb-habilidade').value,
            defesa: document.getElementById('hb-defesa').value,
            descricao: document.getElementById('hb-desc').value
        };
    } else if (tipo === 'rituais') {
        dadosConteudo = {
            imagem: document.getElementById('hb-imagem').value || "../imagens/padrao.png",
            circulo: document.getElementById('hb-circulo').value,
            elemento: document.getElementById('hb-elemento').value,
            execucao: document.getElementById('hb-execucao').value,
            alcance: document.getElementById('hb-alcance').value,
            alvo: document.getElementById('hb-alvo').value,
            resistencia: document.getElementById('hb-resistencia').value,
            duracao: document.getElementById('hb-duracao').value,
            descricao: document.getElementById('hb-desc').value || "",
            discente: document.getElementById('hb-discente').value,
            verdadeiro: document.getElementById('hb-verdadeiro').value
        };
    } else if (tipo === 'habilidades') {
        dadosConteudo = {
            descricao: document.getElementById('hb-desc').value || ""
        };
    } else {
        dadosConteudo = {
            classeAlvo: document.getElementById('hb-trilha-classe').value,
            habilidades: {
                nex10: { nome: document.getElementById('hb-nex10-nome').value, desc: document.getElementById('hb-nex10').value },
                nex40: { nome: document.getElementById('hb-nex40-nome').value, desc: document.getElementById('hb-nex40').value },
                nex65: { nome: document.getElementById('hb-nex65-nome').value, desc: document.getElementById('hb-nex65').value },
                nex99: { nome: document.getElementById('hb-nex99-nome').value, desc: document.getElementById('hb-nex99').value }
            }
        };
    }

    // O Documento Completo a ser salvo
    const documentoHomebrew = {
        autorId: user.uid,
        nome: nome,
        tipo: tipo,
        publico: true,
        codigoCurto: gerarCodigoCurto(),
        dataCriacao: new Date().toISOString(),
        dados: dadosConteudo
    };

    try {
        // Envia para a coleção "homebrews" (Nova coleção!)
        const docRef = await addDoc(collection(db, "homebrews"), documentoHomebrew);
        alert(`Sucesso!`);
        fecharModalHomebrew();
        carregarMeusHomebrews(user.uid); // Recarrega a lista
    } catch (error) {
        console.error("Erro ao salvar Homebrew:", error);
        alert("Erro ao salvar.");
    }
};

window.carregarMeusHomebrews = async function(userId) {
    const listaContainer = document.getElementById('lista-homebrews');
    listaContainer.innerHTML = "<p>Buscando no acervo...</p>";
    window.cacheHomebrews = {};

    try {
        const q = query(collection(db, "homebrews"), where("autorId", "==", userId));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            listaContainer.innerHTML = "<p>Você ainda não criou nenhum Homebrew.</p>";
            return;
        }

        let html = "";
        querySnapshot.forEach((doc) => {
            const hb = doc.data();
            const idDoc = doc.id;
            window.cacheHomebrews[idDoc] = hb;
            html += `
                <div class="card-campanha classe-card">
                    <div class="card-info" onclick="abrirDetalhesHB('${idDoc}')" style="cursor:pointer">
                        <h3>${hb.nome}</h3>
                        <p>Tipo: ${hb.tipo.toUpperCase()}</p>
                        <p>Código: ${hb.codigoCurto || "S/ID"}</p>
                    </div>
                </div>
            `;
        });
        listaContainer.innerHTML = html;

    } catch (error) {
        console.error("Erro ao buscar homebrews:", error);
        listaContainer.innerHTML = "<p>Erro ao carregar o acervo.</p>";
    }
}

window.abrirDetalhesHB = function(id) {
    const hb = window.cacheHomebrews[id];
    if (!hb) return;

    const corpo = document.getElementById('detalhe-corpo');
    const btnSalvar = document.getElementById('btn-salvar-edicao-hb');
    const btnExcluir = document.getElementById('btn-excluir-hb');
    const btnCopiar = document.getElementById('btn-copiar-codigo');

    // 1. Preenche o Título (Editável)
    document.getElementById('detalhe-nome').innerHTML = `
        <input type="text" id="edit-hb-nome" value="${hb.nome}" class="input-inline">
    `;

    // 2. Preenche o Corpo baseado no tipo
    let html = "";
    if (hb.tipo === 'rituais') {
        html = `
            <div class="grid-editar">
                <div class="campo campo-longo"><label>URL da Imagem</label><input type="text" id="edit-hb-foto" value="${hb.dados.imagem || ''}"></div>
                <div class="campo"><label>Círculo</label><input type="number" id="edit-hb-circulo" value="${hb.dados.circulo}"></div>
                <div class="campo"><label>Elemento</label><input type="text" id="edit-hb-elemento" value="${hb.dados.elemento}"></div>
                <div class="campo"><label>Execução</label><input type="text" id="edit-hb-execucao" value="${hb.dados.execucao || ''}"></div>
                <div class="campo"><label>Alcance</label><input type="text" id="edit-hb-alcance" value="${hb.dados.alcance || ''}"></div>
                <div class="campo"><label>Alvo/Área</label><input type="text" id="edit-hb-alvo" value="${hb.dados.alvo || ''}"></div>
                <div class="campo"><label>Duração</label><input type="text" id="edit-hb-duracao" value="${hb.dados.duracao || ''}"></div>
                <div class="campo"><label>Resistencia</label><input type="text" id="edit-hb-resistencia" value="${hb.dados.resistencia || ''}"></div>
                <div class="campo campo-longo"><label>Descrição</label><textarea id="edit-hb-desc" rows="5">${hb.dados.descricao}</textarea></div>
                <div class="campo campo-longo"><label>Discente</label><textarea id="edit-hb-discente" rows="5">${hb.dados.discente}</textarea></div>
                <div class="campo campo-longo"><label>Verdadeiro</label><textarea id="edit-hb-verdadeiro" rows="5">${hb.dados.verdadeiro}</textarea></div>
            </div>
        `;
    } else if (hb.tipo === 'itens') {
        html = `
            <div class="grid-editar">
                <div class="campo campo-longo"><label>URL da Imagem</label><input type="text" id="edit-hb-foto" value="${hb.dados.foto || ''}"></div>
                <div class="campo">
                    <label>Tipo de Item</label>
                    <div class="filtros">
                        <select id="edit-hb-subtipo">
                            <option value="armas" ${hb.dados.subtipo === 'armas' ? 'selected' : ''}>Arma</option>
                            <option value="protecoes" ${hb.dados.subtipo === 'protecoes' ? 'selected' : ''}>Proteção</option>
                            <option value="acessorios" ${hb.dados.subtipo === 'acessorios' ? 'selected' : ''}>Acessório</option>
                            <option value="municoes" ${hb.dados.subtipo === 'municoes' ? 'selected' : ''}>Munição</option>
                            <option value="paranormais" ${hb.dados.subtipo === 'paranormais' ? 'selected' : ''}>Item Paranormal</option>
                        </select>
                    </div>
                </div>
                <div class="campo pequeno"><label>Espaço</label><input type="number" id="edit-hb-espaco" value="${hb.dados.espaco}"></div>
                <div class="campo pequeno"><label>Categoria</label><input type="number" id="edit-hb-cat" value="${hb.dados.categoria}"></div>
                <div class="campo"><label>Dano</label><input type="text" id="edit-hb-dano" value="${hb.dados.dano || ''}"></div>
                <div class="campo"><label>Tipo</label><input type="text" id="edit-hb-tipo" value="${hb.dados.tipo || ''}"></div>
                <div class="campo"><label>Crítico</label><input type="text" id="edit-hb-critico" value="${hb.dados.critico || ''}"></div>
                <div class="campo"><label>Tipo de Dano</label><input type="text" id="edit-hb-tipoDano" value="${hb.dados.tipoDano || ''}"></div>
                <div class="campo"><label>Alcance</label><input type="text" id="edit-hb-alcance" value="${hb.dados.alcance || ''}"></div>
                <div class="campo"><label>Habilidade</label><input type="text" id="edit-hb-habilidade" value="${hb.dados.habilidade || ''}"></div>
                <div class="campo"><label>Defesa</label><input type="number" id="edit-hb-defesa" value="${hb.dados.defesa || 0}"></div>
                <div class="campo campo-longo"><label>Descrição</label><textarea id="edit-hb-desc" rows="5">${hb.dados.descricao}</textarea></div>
            </div>
        `;
    } else if (hb.tipo === 'habilidades') {
        html = `
            <div class="campo campo-longo"><label>Descrição</label><textarea id="edit-hb-desc" rows="8">${hb.dados.descricao}</textarea></div>
        `;
    } else if (hb.tipo === 'trilhas') {
        const h = hb.dados.habilidades;
        html = `
            <div class="campo"><label>NEX 10%</label><input type="text" id="edit-hb-nex10-n" value="${h.nex10.nome}"><textarea id="edit-hb-nex10-d">${h.nex10.desc}</textarea></div>
            <div class="campo"><label>NEX 40%</label><input type="text" id="edit-hb-nex40-n" value="${h.nex40.nome}"><textarea id="edit-hb-nex40-d">${h.nex40.desc}</textarea></div>
            <div class="campo"><label>NEX 65%</label><input type="text" id="edit-hb-nex65-n" value="${h.nex65.nome}"><textarea id="edit-hb-nex65-d">${h.nex65.desc}</textarea></div>
            <div class="campo"><label>NEX 99%</label><input type="text" id="edit-hb-nex99-n" value="${h.nex99.nome}"><textarea id="edit-hb-nex99-d">${h.nex99.desc}</textarea></div>
        `;
    }

    corpo.innerHTML = html;

    // 3. Configura o botão SALVAR
    btnSalvar.onclick = async () => {
        const novoNome = document.getElementById('edit-hb-nome').value;
        let novosDados = {};

        if (hb.tipo === 'rituais') {
            novosDados = {
                imagem: document.getElementById('edit-hb-foto').value,
                circulo: document.getElementById('edit-hb-circulo').value,
                elemento: document.getElementById('edit-hb-elemento').value,
                execucao: document.getElementById('edit-hb-execucao').value,
                alcance: document.getElementById('edit-hb-alcance').value,
                alvo: document.getElementById('edit-hb-alvo').value,
                resistencia: document.getElementById('edit-hb-resistencia').value,
                duracao: document.getElementById('edit-hb-duracao').value,
                descricao: document.getElementById('edit-hb-desc').value,
                discente: document.getElementById('edit-hb-discente').value,
                verdadeiro: document.getElementById('edit-hb-verdadeiro').value
            };
        } else if (hb.tipo === 'itens') {
            novosDados = {
                foto: document.getElementById('edit-hb-foto').value,
                subtipo: document.getElementById('edit-hb-subtipo').value,
                espaco: parseInt(document.getElementById('edit-hb-espaco').value),
                categoria: parseInt(document.getElementById('edit-hb-cat').value),
                dano: document.getElementById('edit-hb-dano').value,
                critico: document.getElementById('edit-hb-critico').value,
                defesa: parseInt(document.getElementById('edit-hb-defesa').value) || 0,
                tipo: document.getElementById('edit-hb-tipo').value, // Ex: "Arma Leve"
                tipoDano: document.getElementById('edit-hb-tipoDano').value,
                alcance: document.getElementById('edit-hb-alcance').value,
                habilidade: document.getElementById('edit-hb-habilidade').value,
                descricao: document.getElementById('edit-hb-desc').value
            };
        } else if (hb.tipo === 'habilidades') {
            novosDados = { descricao: document.getElementById('edit-hb-desc').value };
        } else if (hb.tipo === 'trilhas') {
            novosDados = {
                habilidades: {
                    nex10: { nome: document.getElementById('edit-hb-nex10-n').value, desc: document.getElementById('edit-hb-nex10-d').value },
                    nex40: { nome: document.getElementById('edit-hb-nex40-n').value, desc: document.getElementById('edit-hb-nex40-d').value },
                    nex65: { nome: document.getElementById('edit-hb-nex65-n').value, desc: document.getElementById('edit-hb-nex65-d').value },
                    nex99: { nome: document.getElementById('edit-hb-nex99-n').value, desc: document.getElementById('edit-hb-nex99-d').value }
                }
            };
        }

        try {
            await updateDoc(doc(db, "homebrews", id), { nome: novoNome, dados: novosDados });
            alert("Alterações salvas!");
            fecharModalDetalhes();
            carregarMeusHomebrews(auth.currentUser.uid);
        } catch (e) { alert("Erro ao salvar."); }
    };

    // 4. Configura o botão EXCLUIR
    btnExcluir.onclick = async () => {
        if (confirm("Deseja deletar este homebrew do seu acervo?")) {
            await deleteDoc(doc(db, "homebrews", id));
            fecharModalDetalhes();
            carregarMeusHomebrews(auth.currentUser.uid);
        }
    };

    // 5. Configura o botão COPIAR
    btnCopiar.onclick = () => {
        navigator.clipboard.writeText(hb.codigoCurto);
        alert("Código copiado: " + hb.codigoCurto);
    };

    document.getElementById('modal-detalhes-hb').classList.remove('modal-oculto');
};

window.fecharModalDetalhes = function() {
    document.getElementById('modal-detalhes-hb').classList.add('modal-oculto');
};

window.importarHomebrewPorCodigo = async function() {
    const codigo = document.getElementById('input-codigo-hb').value.trim().toUpperCase();
    const user = auth.currentUser;

    if (!codigo || codigo.length !== 6) {
        alert("Por favor, insira um código válido de 6 dígitos.");
        return;
    }

    if (!user) return alert("Precisas de estar logado para importar.");

    try {
        // 1. Procurar o Homebrew com esse código curto
        const q = query(collection(db, "homebrews"), where("codigoCurto", "==", codigo));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            alert("Nenhum Homebrew encontrado com este código.");
            return;
        }

        // Pegamos o primeiro resultado encontrado
        const docEncontrado = querySnapshot.docs[0];
        const dadosHB = docEncontrado.data();

        // 2. Verificar se o usuário já é o dono (para não importar o que já é dele)
        if (dadosHB.autorId === user.uid) {
            alert("Este Homebrew já foi criado por ti!");
            return;
        }

        // 3. Lógica de Importação: Vamos criar uma cópia para o usuário 
        // ou adicionar o ID dele a uma lista de "favoritos". 
        // Para ser mais simples, vamos criar uma cópia vinculada a ele:
        
        const novaCopia = {
            ...dadosHB,
            autorId: user.uid, // Agora ele também "tem" este item
            importadoDe: docEncontrado.id, // Referência de quem era o original
            dataImportacao: new Date().toISOString()
        };

        await addDoc(collection(db, "homebrews"), novaCopia);

        alert(`Sucesso! "${dadosHB.nome}" foi adicionado ao teu acervo.`);
        document.getElementById('input-codigo-hb').value = ""; // Limpa o campo
        carregarMeusHomebrews(user.uid); // Recarrega a lista para mostrar o novo item

    } catch (error) {
        console.error("Erro ao importar:", error);
        alert("Erro ao tentar importar. Verifica a tua conexão.");
    }
};