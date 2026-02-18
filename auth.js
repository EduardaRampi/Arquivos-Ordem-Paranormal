// Importe auth do seu arquivo de configuração
import { auth } from './firebase-config.js';

// IMPORTANTE: Importe as funções específicas do SDK v9
import { 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    onAuthStateChanged 
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
// FORMA CORRETA V9
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