document.addEventListener('DOMContentLoaded', function () {
  // Espera a que el HTML esté completamente cargado antes de ejecutar
  // cualquier cosa, evita errores de elementos no encontrados

  // ── BARRA INFERIOR MÓVIL ─────────────────────────────────────────
  // Resalta el botón que el usuario presionó en la barra inferior
  // quitando el estado activo de todos y aplicándolo solo al presionado
  function setActive(el) {
    document.querySelectorAll('.bottom-nav-item').forEach(b => b.classList.remove('active'));
    el.classList.add('active');
  }

  // ── BADGE DEL CARRITO ────────────────────────────────────────────
  // Actualiza el número del carrito en ambos lugares:
  // el badge de la barra inferior móvil y el del navbar desktop
  function actualizarBadge(cantidad) {
    document.getElementById('badge-mobile').textContent  = cantidad;
    document.getElementById('badge-desktop').textContent = cantidad;
  }

  // ── ÍCONO DEL BOTÓN MENÚ ─────────────────────────────────────────
  // Selecciona el menú desplegable y el botón de menú de la barra inferior
  const navbarCollapse = document.getElementById('navbarKlydy');
  const btnMenu = document.querySelector('.btn-menu');

  // Cuando el menú se ABRE: cambia el ícono de cuadrícula a una X
  // y marca el botón como activo
  navbarCollapse.addEventListener('show.bs.collapse', () => {
    btnMenu.querySelector('i').className = 'bi bi-x-lg';
    btnMenu.classList.add('active');
  });

  // Cuando el menú se CIERRA: restaura el ícono de cuadrícula
  // y quita el estado activo del botón
  navbarCollapse.addEventListener('hide.bs.collapse', () => {
    btnMenu.querySelector('i').className = 'bi bi-grid-3x3-gap';
    btnMenu.classList.remove('active');
  });

  // ── CERRAR MENÚ AL HACER CLICK AFUERA ───────────────────────────
  // Escucha clicks en cualquier parte de la página
  document.addEventListener('click', function(e) {
    const navbar = document.getElementById('navbarKlydy');
    const toggler = document.querySelector('.navbar-toggler');

    // Solo actúa si el menú está abierto Y el click fue fuera
    // del menú desplegado Y fuera del botón hamburguesa
    if (navbar.classList.contains('show') &&
        !navbar.contains(e.target) &&
        !toggler.contains(e.target)) {
      bootstrap.Collapse.getInstance(navbar)?.hide();
    }
  });

  // ── CERRAR MODAL/OFFCANVAS ANTES DE ABRIR OTRO ──────────────────
  // Busca todos los botones que abren modales u offcanvas
  document.querySelectorAll('[data-bs-toggle="modal"], [data-bs-toggle="offcanvas"]')
    .forEach(btn => {
      btn.addEventListener('click', () => {

        // Si hay un modal abierto, lo cierra antes de abrir el nuevo
        const modalAbierto = document.querySelector('.modal.show');
        if (modalAbierto) {
          bootstrap.Modal.getInstance(modalAbierto)?.hide();
        }

        // Si hay un offcanvas abierto, lo cierra antes de abrir el nuevo
        const offcanvasAbierto = document.querySelector('.offcanvas.show');
        if (offcanvasAbierto) {
          bootstrap.Offcanvas.getInstance(offcanvasAbierto)?.hide();
        }

      });
    });

  // ── EXPONER FUNCIONES AL HTML ────────────────────────────────────
  // Como setActive y actualizarBadge se llaman desde atributos onclick
  // en el HTML, necesitan estar disponibles globalmente en window,
  // de lo contrario el HTML no las encontraría dentro del DOMContentLoaded
  window.setActive = setActive;
  window.actualizarBadge = actualizarBadge;

});

// ─────────────────────────────────────────────
// LOGIN
// ─────────────────────────────────────────────

const btnLogin = document.getElementById("btnLogin");

btnLogin.addEventListener("click", iniciarSesion);

function iniciarSesion() {

  const correo = document.getElementById("correoLogin").value.trim();

  const password = document.getElementById("passwordLogin").value.trim();

  const mensaje = document.getElementById("mensajeLogin");

  // VALIDAR CAMPOS VACÍOS
  if (correo === "" || password === "") {

    mensaje.innerHTML = `
      <div class="alert alert-danger">
        Todos los campos son obligatorios
      </div>
    `;

    return;
  }

  // OBTENER USUARIOS
  const usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];

  // BUSCAR USUARIO
  const usuarioEncontrado = usuarios.find(usuario =>
    usuario.correo === correo &&
    usuario.password === password
  );

  // LOGIN EXITOSO
  if (usuarioEncontrado) {

    localStorage.setItem(
      "usuarioActivo",
      JSON.stringify(usuarioEncontrado)
    );

    mensaje.innerHTML = `
      <div class="alert alert-success">
        Inicio de sesión exitoso
      </div>
    `;

    //REDIRECCION

    setTimeout(() => {

      window.location.href = "productos.html";

    }, 1000);

    // LOGIN INCORRECTO

  } else {

    mensaje.innerHTML = `
      <div class="alert alert-danger">
        Usuario o contraseña inválidos
      </div>
    `;
  }
}


// ─────────────────────────────────────────────
// CAMBIAR NAVBAR
// ─────────────────────────────────────────────

function actualizarNavbarUsuario() {

  const usuarioActivo = JSON.parse(
    localStorage.getItem("usuarioActivo")
  );

  const contenedorDesktop = document.querySelector(
    ".d-none.d-lg-flex.align-items-center.gap-2"
  );

  if (usuarioActivo && contenedorDesktop) {

    contenedorDesktop.innerHTML = `

      <div class="d-flex align-items-center gap-2">

        <!-- NOMBRE USUARIO -->
        <span class="text-white fw-bold">
          <i class="bi bi-person-check-fill"></i>
          ${usuarioActivo.nombre}
        </span>

        <!-- BOTÓN CERRAR SESIÓN -->
        <button
          class="btn btn-outline-danger btn-sm"
          id="btnCerrarSesion">

          Cerrar Sesión
        </button>

        <!-- CARRITO -->
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

    // EVENTO CERRAR SESIÓN
    document
      .getElementById("btnCerrarSesion")
      .addEventListener("click", abrirModalCerrarSesion);
  }
}

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

    window.location.href = "index.html";

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

document
  .getElementById("confirmarCerrarSesion")
  .addEventListener("click", cerrarSesion);

// ─────────────────────────────────────────────
// CERRAR SESIÓN
// ─────────────────────────────────────────────

function cerrarSesion() {

  localStorage.removeItem("usuarioActivo");

  window.location.href = "index.html";
}