// Importe auth do seu arquivo de configuração
import { auth } from './firebase-config.js';

// IMPORTANTE: Importe as funções específicas do SDK v9
import { 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    onAuthStateChanged,
    sendPasswordResetEmail,
    deleteUser
} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";

// Função de registro
document.getElementById('registro-form').addEventListener('submit', (e) => {
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

// Função de login
document.getElementById('login-form').addEventListener('submit', (e) => {
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

// Verifique estado de login
onAuthStateChanged(auth, (user) => {
    if (user) {
        // Verifica se os elementos existem antes de tentar acessar o estilo
        const authSection = document.getElementById('auth-section');
        const charSection = document.getElementById('personagem-section');
        
        if(authSection) authSection.style.display = 'none';
        if(charSection) charSection.style.display = 'block';
        
        // Verifique se a função existe antes de chamar
        if (typeof carregarPersonagens === 'function') {
            carregarPersonagens(); 
        }
    } else {
        const authSection = document.getElementById('auth-section');
        const charSection = document.getElementById('personagem-section');

        if(authSection) authSection.style.display = 'block';
        if(charSection) charSection.style.display = 'none';
    }
});

function mostrarSecaoPersonagens() {
    // Função auxiliar
}

// Função para carregar dados do perfil
function carregarDadosPerfil() {
    // No V9, pegamos o usuário atual de dentro do objeto auth
    const user = auth.currentUser;

    if (user) {
        const emailElem = document.getElementById('perfil-email');
        const idElem = document.getElementById('perfil-id');

        if(emailElem) emailElem.innerText = user.email;
        if(idElem) idElem.innerText = user.uid;
    }
}
// Torna global para que o codigo.js consiga chamar
window.carregarDadosPerfil = carregarDadosPerfil;

// Redefinir Senha CORRIGIDO
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

// Excluir Conta CORRIGIDO
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