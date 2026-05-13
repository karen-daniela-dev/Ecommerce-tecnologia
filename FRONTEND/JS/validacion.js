function generarCaptcha() {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let captcha = "";
    for (let i = 0; i < 5; i++) {
        captcha += chars[Math.floor(Math.random() * chars.length)];
    }
    document.getElementById("captchaTexto").textContent = captcha;
}

generarCaptcha();

document.getElementById("formRecuperar").addEventListener("submit", function(e){
    e.preventDefault();

    const tipo = document.getElementById("tipoDoc").value;
    const doc = document.getElementById("numeroDoc").value;
    const correo = document.getElementById("correo").value;
    const captcha = document.getElementById("captchaInput").value;
    const captchaReal = document.getElementById("captchaTexto").textContent;
    const mensaje = document.getElementById("mensaaje");

    if (!tipo || !doc || !correo) {
        mensaje.style.color = "var(--neon-pink)"
        mensaje.textContent = "Complete  todos los campos";
        return;
    }

    const regexCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!regexCorreo.test(correo)) {
        mensaje.style.color = "var(--neon-pink)"
        mensaje.textContent = "Correo invalido"
    }

    if (captcha !== captchaReal) {
        mensaje.style.color = "var(--neon-pink)"
        mensaje.textContent = "Captcha incorrecto"
        generarCaptcha();
        return;
    }

    mensaje.style.color = "var(--neon-pink)"
    mensaje.textContent = "Verificacion exitosa";
});

