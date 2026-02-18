// Importe os módulos do Firebase (v9.22.0)
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";
import { getFirestore, serverTimestamp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";  // Adicione serverTimestamp aqui

console.log("Iniciando Firebase...");  // Log temporário

// Configuração do Firebase
const firebaseConfig = {
    apiKey: "AIzaSyBLkE_OU5XKwff7RmjeE14Ytb1yoG4ecc8",
    authDomain: "rpg-digital-library.firebaseapp.com",
    projectId: "rpg-digital-library",
    storageBucket: "rpg-digital-library.firebasestorage.app",
    messagingSenderId: "73029572280",
    appId: "1:73029572280:web:73afad7b56342967ae064d"
};

// Inicialize o Firebase
const app = initializeApp(firebaseConfig);
console.log("Firebase app inicializado:", app);  // Log temporário

// Inicialize os serviços
const auth = getAuth(app);
const db = getFirestore(app);
console.log("Auth inicializado:", auth);  // Log temporário
console.log("DB inicializado:", db);     // Log temporário

// Exporte para uso em outros módulos
export { auth, db, serverTimestamp };