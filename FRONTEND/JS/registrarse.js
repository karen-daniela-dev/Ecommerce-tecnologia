function mostrarError(mensaje) {
  document.querySelectorAll(".alert").forEach(el => el.remove());
  const errorDiv = document.createElement("div");
  errorDiv.className = "alert alert-danger mt-2";
  errorDiv.textContent = mensaje;
  document.querySelector(".register-card").prepend(errorDiv);
  setTimeout(() => errorDiv.remove(), 3000);
}

function mostrarExito(mensaje) {
  document.querySelectorAll(".alert").forEach(el => el.remove());
  const div = document.createElement("div");
  div.className = "alert alert-success mt-2";
  div.textContent = mensaje;
  document.querySelector(".register-card").prepend(div);
  setTimeout(() => div.remove(), 3000);
}

document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("registerForm");

  form.addEventListener("submit", async function (e) {
    e.preventDefault();

    const nombre         = document.getElementById("nombre").value.trim();
    const identificacion = document.getElementById("identificacion").value.trim();
    const correo         = document.getElementById("correo").value.trim();
    const telefono       = document.getElementById("telefono").value.trim();
    const password       = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;

    // Validaciones
    if (!nombre || !identificacion || !correo || !telefono || !password || !confirmPassword) {
      return mostrarError("Todos los campos son obligatorios");
    }
    if (nombre.length < 3) return mostrarError("El nombre debe tener al menos 3 caracteres");
    if (!/^[0-9]+$/.test(identificacion)) return mostrarError("La identificación solo debe tener números");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) return mostrarError("Correo electrónico inválido");
    if (!/^[0-9]{10}$/.test(telefono)) return mostrarError("El teléfono debe tener 10 dígitos");
    if (password.length < 6) return mostrarError("La contraseña debe tener mínimo 6 caracteres");
    if (password !== confirmPassword) return mostrarError("Las contraseñas no coinciden");

    const btnSubmit = form.querySelector("button[type='submit']");
    btnSubmit.disabled = true;
    btnSubmit.textContent = "Registrando...";

    try {
      const res = await fetch("https://ecommerceklydy.onrender.com/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre,
          cedula:   identificacion,
          email:    correo,
          telefono,
          password
        })
      });

      const data = await res.json();

      if (!res.ok) {
        mostrarError(data.error || "Error al registrarse");
        return;
      }

      mostrarExito("Registro exitoso. Ya puedes iniciar sesión.");
      form.reset();

    } catch (err) {
      console.error(err);
      mostrarError("No se pudo conectar con el servidor.");
    } finally {
      btnSubmit.disabled = false;
      btnSubmit.textContent = "Registrarse";
    }
  });
});

document.getElementById("identificacion").addEventListener("input", function () {
  this.value = this.value.replace(/[^0-9]/g, "");
});
document.getElementById("telefono").addEventListener("input", function () {
  this.value = this.value.replace(/[^0-9]/g, "");
});

function togglePassword(inInput, icono) {
  const input = document.getElementById(inInput);
  if (input.type === "password") {
    input.type = "text";
    icono.classList.replace("bi-eye", "bi-eye-slash");
  } else {
    input.type = "password";
    icono.classList.replace("bi-eye-slash", "bi-eye");
  }
}