const inputs = document.querySelectorAll("input");
const formulario = document.getElementById("form");

const mensajeErrorNombre = document.getElementById("errorNombre");
const mensajeErrorEmail = document.getElementById("errorEmail");
const mensajeErrorMensaje = document.getElementById("errorMensaje");
const Mensaje = document.getElementById("inputMensaje");
const campoMensaje = document.getElementById("campoMensaje");
const contador = document.getElementById("contadorCaracteres");

let confirmacionCampos = [false, false, false];

//Validaciones del formulario
const expresionesRegulares = {
	nombre: /^[a-zA-ZÀ-ÿ\s]{1,50}$/, // Letras y espacios, pueden llevar acentos.
	correo: /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/, //Se exige un formato de correo valido
	mensaje: /^[a-zA-ZÀ-ÿ\s]{1,500}$/
}

//Funciones
function validarFormulario(error){
	switch(error.target.name){

		//Validacion nombre
		case "nombre-usuario":
			if(expresionesRegulares.nombre.test(error.target.value)){
				document.getElementById("inputNombre").classList.remove('is-invalid');
				document.getElementById("inputNombre").classList.add('is-valid');

				mensajeErrorNombre.style.display = "none";
				confirmacionCampos[0] = true;
			}
			
			else if(error.target.value == ""){
				document.getElementById("inputNombre").classList.remove('is-valid');
				document.getElementById("inputNombre").classList.add('is-invalid');

				mensajeErrorNombre.style.display = "block";	
			}

			else{
				document.getElementById("inputNombre").classList.remove('is-valid');
				document.getElementById("inputNombre").classList.add('is-invalid');

				mensajeErrorNombre.innerText = "Debes ingresar un nombre con formato valido."
				mensajeErrorNombre.style.display = "block";
			}
			break;
        

		//Validacion correo
		case "email-usuario":
			if(expresionesRegulares.correo.test(error.target.value)){
				document.getElementById("inputEmail").classList.remove('is-invalid');
				document.getElementById("inputEmail").classList.add('is-valid');

				mensajeErrorEmail.style.display = "none";
				confirmacionCampos[1] = true;
			}

			else if(error.target.value == ""){
				document.getElementById("inputEmail").classList.remove('is-valid');
				document.getElementById("inputEmail").classList.add('is-invalid');

				mensajeErrorEmail.style.display = "block";
			}

			else{
				document.getElementById("inputEmail").classList.remove('is-valid');
				document.getElementById("inputEmail").classList.add('is-invalid');

				mensajeErrorEmail.innerText = "Debes ingresar un formato de correo valido."
				mensajeErrorEmail.style.display = "block";
			}
			break;

        
		//Validacion mensaje
		case "mensaje-usuario":
			if(expresionesRegulares.mensaje.test(error.target.value)){
				document.getElementById("inputMensaje").classList.remove('is-invalid');
				document.getElementById("inputMensaje").classList.add('is-valid');

				mensajeErrorMensaje.style.display = "none";
				confirmacionCampos[2] = true;
			}

			else if(error.target.value == ""){
				document.getElementById("inputMensaje").classList.remove('is-valid');
				document.getElementById("inputMensaje").classList.add('is-invalid');

				mensajeErrorMensaje.style.display = "block";
				confirmacionCampos[2] = false;
			}

			else{
				document.getElementById("inputMensaje").classList.remove('is-valid');
				document.getElementById("inputMensaje").classList.add('is-invalid');

				mensajeErrorMensaje.innerText = "El mensaje supera la maxima capacidad permitida (máx. 500 caracteres)."
				mensajeErrorMensaje.style.display = "block";
				confirmacionCampos[2] = false;
			}
			break;
	}
}

function actualizarContador(){
	const numeroDeCaracteres = campoMensaje.value.length;
    contador.innerText = numeroDeCaracteres;
};

formulario.addEventListener("submit", (e) => {
    e.preventDefault();

    const todoValido = confirmacionCampos[0] === true && 
                       confirmacionCampos[1] === true && 
                       confirmacionCampos[2] === true;

    console.log("Estado de validación al intentar enviar:", confirmacionCampos);

    if (todoValido) {
        mostrarToast("¡Mensaje enviado con éxito!", "success");
		setTimeout(() => {
            e.target.submit();
        }, 2000);

    } else {
        mostrarToast("Por favor, corrige los errores en el formulario.", "error");
    }
});

function mostrarToast(mensaje, tipo) {
    const container = document.getElementById('toast-container');
    
    // Crear el elemento del toast
    const toast = document.createElement('div');
    toast.classList.add('custom-toast');
    
    // Configurar icono y clase según el tipo (success o error)
    if (tipo === 'success') {
        toast.classList.add('toast-success');
        toast.innerHTML = `
            <div class="toast-icon">✓</div>
            <span>${mensaje}</span>
            <div class="toast-close" onclick="this.parentElement.remove()">×</div>
        `;
    } else if (tipo === 'error') {
        toast.classList.add('toast-error');
        toast.innerHTML = `
            <div class="toast-icon">×</div>
            <span>${mensaje}</span>
            <div class="toast-close" onclick="this.parentElement.remove()">×</div>
        `;
    }
    
    // Agregar el toast al contenedor de la pantalla
    container.appendChild(toast);
    
    // Programar la desaparición automática en 3 segundos (3000 ms)
    setTimeout(() => {
        toast.classList.add('toast-fade-out');
        toast.addEventListener('animationend', () => {
            toast.remove();
        });
    }, 5000);
}

function actualizarNavbarUsuario() {

  const usuarioActivo = JSON.parse(
    localStorage.getItem("usuarioActivo")
  );

  const contenedor = document.getElementById(
    "contenedorUsuario"
  );

  if (!contenedor) return;

  if (usuarioActivo) {

    contenedor.innerHTML = `
      <div class="d-flex align-items-center gap-2">

        <span class="text-white fw-bold">
          <i class="bi bi-person-check-fill"></i>
          ${usuarioActivo.nombre}
        </span>

        <button
          class="btn btn-outline-danger btn-sm"
          id="btnCerrarSesion">
          Cerrar Sesión
        </button>

        <button
          class="btn klydy-btn-cart d-flex align-items-center"
          type="button"
          data-bs-toggle="offcanvas"
          data-bs-target="#offcanvasCarrito">

          <i class="bi bi-cart3"></i>

          <span
            class="klydy-badge ms-1"
            id="badge-desktop">
          </span>

        </button>

      </div>
    `;

    document
      .getElementById("btnCerrarSesion")
      .addEventListener("click", abrirModalCerrarSesion);
  }
}

function cerrarSesion() {

  localStorage.removeItem("usuarioActivo");

  alert("Sesión cerrada correctamente");

  window.location.href = "../../index.html";
}

document.addEventListener(
  "DOMContentLoaded",
  actualizarNavbarUsuario
);

//Llamados
inputs.forEach((input) => {
	input.addEventListener("keyup", validarFormulario);
	input.addEventListener("blur", validarFormulario);
});

Mensaje.addEventListener("keyup", validarFormulario);
Mensaje.addEventListener("blur", validarFormulario);
campoMensaje.addEventListener("input", actualizarContador);


// ─────────────────────────────────────────────
// CERRAR SESIÓN
// ─────────────────────────────────────────────

function cerrarSesion() {

  localStorage.removeItem("usuarioActivo");

  // CREAR ALERTA VISUAL
  const alerta = document.createElement("div");

  alerta.innerHTML = `
  
    <div 
      class="alert alert-info alert-dismissible fade show shadow-lg"
      role="alert"
      style="
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 9999;
        min-width: 320px;
        border-radius: 14px;
        font-weight: 600;
      ">

      <i class="bi bi-check-circle-fill me-2"></i>
      Sesión cerrada correctamente

    </div>
  `;

  document.body.appendChild(alerta);

  // REDIRECCIONAR
  setTimeout(() => {

    window.location.href = "../../index.html";

  }, 1500);
}

// EJECUTAR AL CARGAR
actualizarNavbarUsuario();

// ─────────────────────────────────────────────
// ABRIR MODAL CERRAR SESIÓN
// ─────────────────────────────────────────────

function abrirModalCerrarSesion() {

  const modal = new bootstrap.Modal(
    document.getElementById("modalCerrarSesion")
  );

  modal.show();
}

// ─────────────────────────────────────────────
// CONFIRMAR CERRAR SESIÓN
// ─────────────────────────────────────────────

document.addEventListener("DOMContentLoaded", () => {

  const btnConfirmar = document.getElementById("confirmarCerrarSesion");

  if (btnConfirmar) {
    btnConfirmar.addEventListener("click", cerrarSesion);
  }

});
