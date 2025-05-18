// Importar Firebase SDKs
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// Configuración personalizada de tu proyecto Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBKIOXyAtbm2OZqhkrSr3yZEll2LLraLXc",
  authDomain: "bovedanmpp.firebaseapp.com",
  projectId: "bovedanmpp",
  storageBucket: "bovedanmpp.firebasestorage.app",
  messagingSenderId: "444064319814",
  appId: "1:444064319814:web:869308a7b2ce74e1163d47",
  measurementId: "G-8NKKHRFR1K"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Exportar servicios
export const auth = getAuth(app);
export const db = getFirestore(app);
