// Importe auth do seu arquivo de configuração
import { auth } from './firebase-config.js';
import { updateProfile } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";
// IMPORTANTE: Importe as funções específicas do SDK v9
import { 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    onAuthStateChanged,
    sendPasswordResetEmail,
    deleteUser
} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";

// Função de registro
const registroForm = document.getElementById('registro-form');
if (registroForm) {
    registroForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const senha = document.getElementById('senha').value;

        // FORMA CORRETA V9: a função recebe 'auth' como primeiro parâmetro
        createUserWithEmailAndPassword(auth, email, senha)
            .then((userCredential) => {
                console.log("Usuário registrado:", userCredential.user);
                alert("Registrado com sucesso! Faça login.");
            })
            .catch((error) => {
                console.error("Erro no registro:", error);
                alert("Erro: " + error.message);
            });
    });
}

// Função de login
const loginForm = document.getElementById('login-form');
if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('email-login').value;
        const senha = document.getElementById('senha-login').value;

        // FORMA CORRETA V9
        signInWithEmailAndPassword(auth, email, senha)
            .then((userCredential) => {
                console.log("Logado:", userCredential.user);
                alert("Logado com sucesso!");
                mostrarSecaoPersonagens();
            })
            .catch((error) => {
                console.error("Erro no login:", error);
                alert("Erro: " + error.message);
            });
    });
}

// Verifique estado de login
onAuthStateChanged(auth, async (user) => {
    if (user) {
        // Verifica se os elementos existem antes de tentar acessar o estilo
        const authSection = document.getElementById('auth-section');
        const charSection = document.getElementById('personagem-section');
        const campSection = document.getElementById('campanhas-section');
        
        if(authSection) authSection.style.display = 'none';
        if(charSection) charSection.style.display = 'block';
        if(campSection) campSection.style.display = 'block';
        
        // Verifique se a função existe antes de chamar
        if (typeof carregarPersonagens === 'function') {
            carregarPersonagens(); 
        }
        if (typeof carregarCampanhas === 'function') {
            carregarCampanhas(); 
            carregarCampanhasParticipando();
        }

        if (!user.displayName) {
            const nomeAleatorio = "Agente_" + Math.floor(Math.random() * 9000 + 1000);
            await updateProfile(user, { displayName: nomeAleatorio });
            // Recarrega para aplicar a mudança
            window.location.reload(); 
        }
        // Atualiza o texto na interface onde antes aparecia o email
        const nomeExibicao = document.getElementById('user-name-display');
        if (nomeExibicao) {
            nomeExibicao.innerText = user.displayName || "Agente";
        }
        carregarDadosPerfil()
    } else {
        const authSection = document.getElementById('auth-section');
        const charSection = document.getElementById('personagem-section');
        const campSection = document.getElementById('campanhas-section');

        if(authSection) authSection.style.display = 'block';
        if(charSection) charSection.style.display = 'none';
        if(campSection) campSection.style.display = 'none';
    }
});

// Função para carregar dados do perfil
function carregarDadosPerfil() {
    // No V9, pegamos o usuário atual de dentro do objeto auth
    const user = auth.currentUser;
    const inputNome = document.getElementById('edit-display-name');

    if (user && inputNome) {
        const emailElem = document.getElementById('perfil-email');
        const idElem = document.getElementById('perfil-id');

        if(emailElem) emailElem.innerText = user.email;
        if(idElem) idElem.innerText = user.uid;
        inputNome.value = user.displayName || "";
    }

}
// Torna global para que o codigo.js consiga chamar
window.carregarDadosPerfil = carregarDadosPerfil;

// Redefinir Senha 
const btnRedefinir = document.getElementById('btn-redefinir-senha');
if (btnRedefinir) {
    btnRedefinir.addEventListener('click', () => {
        const user = auth.currentUser;
        if (user) {
            sendPasswordResetEmail(auth, user.email)
                .then(() => alert("E-mail de redefinição enviado para: " + user.email))
                .catch(erro => console.error("Erro ao enviar e-mail:", erro));
        } else {
            alert("Você precisa estar logado para redefinir a senha.");
        }
    });
}

// Excluir Conta 
const btnExcluir = document.getElementById('btn-excluir-conta');
if (btnExcluir) {
    btnExcluir.addEventListener('click', () => {
        const user = auth.currentUser;
        const confirmacao = confirm("AVISO: Isso apagará sua conta e todas as suas fichas permanentemente. Deseja continuar?");

        if (user && confirmacao) {
            deleteUser(user)
                .then(() => {
                    alert("Conta excluída com sucesso.");
                    window.location.reload();
                })
                .catch(erro => {
                    console.error("Erro ao excluir:", erro);
                    if (erro.code === 'auth/requires-recent-login') {
                        alert("Por segurança, você precisa fazer login novamente antes de excluir a conta.");
                    } else {
                        alert("Erro ao excluir: " + erro.message);
                    }
                });
        }
    });
}

window.toggleSenha = function(idInput, icone) {
    const input = document.getElementById(idInput);
    
    if (input.type === 'password') {
        input.type = 'text';
        icone.innerText = '🔒'; // Muda o ícone para indicar "esconder"
    } else {
        input.type = 'password';
        icone.innerText = '👁️'; // Muda o ícone para indicar "mostrar"
    }
}

window.salvarNovoNome = async function() {
    const user = auth.currentUser;
    const novoNome = document.getElementById('edit-display-name').value.trim();

    if (user && novoNome) {
        try {
            await updateProfile(user, { displayName: novoNome });
            alert("Codinome atualizado, Agente!");
            
            // Atualiza na tela na hora
            if(document.getElementById('user-name-display')) {
                document.getElementById('user-name-display').innerText = novoNome;
            }
        } catch (error) {
            console.error("Erro ao atualizar nome:", error);
        }
    }
};