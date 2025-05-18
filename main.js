document.addEventListener("DOMContentLoaded", () => {
// Referencias a elementos del DOM
const registerBtn = document.getElementById("registerBtn");

if (registerBtn) {
registerBtn.addEventListener("click", async () => {
const email = document.getElementById("email")?.value;
const password = document.getElementById("password")?.value;

javascript
Copiar
Editar
  if (!email || !password) {
    alert("Por favor completa todos los campos.");
    return;
  }

  try {
    const { getAuth, createUserWithEmailAndPassword } = window.firebaseAuth;
    const auth = getAuth();

    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    alert("¡Registro exitoso! Bienvenido, " + userCredential.user.email);
    // Aquí podrías redirigir a otra página o mostrar un mensaje
  } catch (error) {
    console.error("Error al registrar:", error);
    alert("Error: " + error.message);
  }
});
