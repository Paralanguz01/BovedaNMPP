import { auth, db } from './firebase-config.js';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// Pantallas
const screens = {
  login: document.getElementById('login-screen'),
  vault: document.getElementById('vault-screen'),
  countdown: document.getElementById('countdown-screen'),
  questions: document.getElementById('questions-screen')
};

// Navegación
function showScreen(name) {
  Object.values(screens).forEach(s => s.classList.remove('active'));
  screens[name].classList.add('active');
}

// Mostrar/Ocultar contraseña
const passwordInput = document.getElementById('password');
const togglePassword = document.getElementById('toggle-password');
togglePassword.addEventListener('click', () => {
  const type = passwordInput.type === "password" ? "text" : "password";
  passwordInput.type = type;
  togglePassword.textContent = type === "text" ? "🙈" : "👁️";
});

// Validar contraseña
function isValidPassword(pw) {
  const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/;
  return regex.test(pw);
}

// Registro
document.getElementById('register-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = e.target.email.value;
  const password = e.target.password.value;
  if (!isValidPassword(password)) {
    alert('La contraseña debe tener al menos una mayúscula, una minúscula y un número.');
    return;
  }
  try {
    const userCred = await createUserWithEmailAndPassword(auth, email, password);
    await setDoc(doc(db, "users", userCred.user.uid), {
      createdAt: serverTimestamp(),
      delayMinutes: 60,
      questions: [
        { q: "¿Por qué decidiste guardar esto aquí?", a: "" },
        { q: "¿Qué puedes hacer ahora en vez de abrir la bóveda?", a: "" }
      ],
      reminders: {
        title: "Recuerda tu objetivo",
        content: "Tú elegiste guardar estos datos para protegerte de impulsos. Haz una pausa, respira, y considera hacer otra cosa primero."
      },
      vaultData: "Aquí están tus datos protegidos."
    });
    alert("Registrado con éxito. Inicia sesión.");
  } catch (err) {
    alert("Error al registrar: " + err.message);
  }
});

// Login
document.getElementById('login-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = e.target.email.value;
  const password = e.target.password.value;
  try {
    await signInWithEmailAndPassword(auth, email, password);
  } catch (err) {
    alert("Login fallido: " + err.message);
  }
});

// Autenticación
onAuthStateChanged(auth, async (user) => {
  if (user) {
    const docRef = doc(db, "users", user.uid);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) return;

    const userData = docSnap.data();
    const lastAccess = userData.lastAccess?.toDate?.() ?? null;
    const delayMs = (userData.delayMinutes ?? 60) * 60 * 1000;

    const now = new Date();
    const canAccess = !lastAccess || now - lastAccess > delayMs;

    if (canAccess) {
      showScreen('questions');
      loadQuestions(userData.questions || []);
    } else {
      startCountdownScreen(now - lastAccess, delayMs);
    }
  } else {
    showScreen('login');
  }
});

// Cargar preguntas
function loadQuestions(questions) {
  const container = document.getElementById('questions-container');
  container.innerHTML = '';
  questions.forEach((item, idx) => {
    const input = document.createElement('input');
    input.placeholder = item.q;
    input.dataset.index = idx;
    container.appendChild(input);
  });
}

// Enviar respuestas
document.getElementById('questions-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const inputs = [...e.target.querySelectorAll('input')];
  const correct = inputs.every(i => i.value.length > 0);
  if (!correct) {
    alert("Responde todas las preguntas.");
    return;
  }
  const uid = auth.currentUser.uid;
  await updateDoc(doc(db, "users", uid), {
    lastAccess: serverTimestamp()
  });
  showVault();
});

// Mostrar bóveda
function showVault() {
  document.getElementById('vault-data').textContent = "📦 Tus datos secretos están aquí.";
  showScreen('vault');
}

// Cerrar bóveda
document.getElementById('close-vault').addEventListener('click', () => {
  showScreen('login');
  auth.signOut();
});

// Countdown
function startCountdownScreen(timePassed, delayMs) {
  showScreen('countdown');
  const countdownEl = document.getElementById('countdown');
  let msLeft = delayMs - timePassed;

  const interval = setInterval(() => {
    if (msLeft <= 0) {
      clearInterval(interval);
      showScreen('questions');
      return;
    }
    const h = Math.floor(msLeft / 3600000);
    const m = Math.floor((msLeft % 3600000) / 60000);
    const s = Math.floor((msLeft % 60000) / 1000);
    countdownEl.textContent = `${h}h ${m}m ${s}s`;
    msLeft -= 1000;
  }, 1000);
}
