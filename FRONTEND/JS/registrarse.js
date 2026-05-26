function mostrarError(mensaje) {
    document.querySelectorAll(".alert").forEach(el => el.remove());

    const errorDiv = document.createElement("div");
    errorDiv.className = "alert alert-danger mt-2";
    errorDiv.textContent = mensaje;

    document.querySelector(".register-card").prepend(errorDiv);
    

    setTimeout(() => errorDiv.remove(), 3000);
}

document.addEventListener("DOMContentLoaded", function () {

    const form = document.getElementById("registerForm");

    form.addEventListener("submit", function (e) {
        e.preventDefault();

        let nombre = document.getElementById("nombre").value.trim();
        let identificacion = document.getElementById("identificacion").value.trim();
        let correo = document.getElementById("correo").value.trim();
        let telefono = document.getElementById("telefono").value.trim();
        let password = document.getElementById("password").value;
        let confirmPassword = document.getElementById("confirmPassword").value;

        if (!nombre || !identificacion || !correo || !telefono || !password || !confirmPassword) {
            mostrarError("Todos los campos son obligatorios");
            return;
        }

        if (nombre.length < 3) {
            mostrarError("El nombre debe tener al menos 3 caracteristicas");
            return;
        }

        if (!/^[0-9]+$/.test(identificacion)) {
            mostrarError("La identificacion solo debe tener numeros");
            return;
        }

        let regexCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!regexCorreo.test(correo)) {
            mostrarError("Correo electronico invalido");
            return;
        }

        if (!/^[0-9]{10}$/.test(telefono)) {
            mostrarError("El telefono debe tener 10 digitos");
            return;
        }

        if (password.length < 6) {
            mostrarError("La contraseña debe tener minimo 6 caracteres");
            return;
        }

        if (password !== confirmPassword) {
            mostrarError("La contraseña no coinciden");
            return;
        }

        let usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];
        usuarios.push({
            nombre,
            identificacion,
            correo,
            telefono,
            password,
            confirmPassword
        });

        localStorage.setItem("usuarios", JSON.stringify(usuarios));

        mostrarError("Registro exitoso");
        form.reset();
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
