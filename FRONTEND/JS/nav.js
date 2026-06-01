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
  // =========================================
  // TOAST
  // =========================================

  function mostrarToast(mensaje) {

    let toast = document.getElementById("toast");

    toast.textContent = mensaje;

    toast.classList.add("active");

    setTimeout(() => {
      toast.classList.remove("active");
    }, 3000);

  }


  // =========================================
  // MODAL CONFIRMACION
  // =========================================

  function mostrarConfirmacion(mensaje, callback) {

    let modal = document.getElementById("modalConfirmacion");

    let mensajeModal = document.getElementById("mensajeModal");

    let aceptar = document.getElementById("aceptarModal");

    let cancelar = document.getElementById("cancelarModal");

    mensajeModal.textContent = mensaje;

    modal.style.display = "flex";

    aceptar.onclick = () => {

      modal.style.display = "none";

      callback(true);

    };

    cancelar.onclick = () => {

      modal.style.display = "none";

      callback(false);

    };

  }


  //cotadores 
  let cantitaProducto = 0;
  let totalPrecio = 0;



  // guardar en localStorage
  function guardarCarrito() {
    let listaCarrito = document.querySelectorAll("#listaCarrito li");

    let carrito = [];

    listaCarrito.forEach(item => {
      carrito.push({
        imagen: item.querySelector("img").src,
        nombre: item.dataset.nombre,
        precio: Number(item.dataset.precio),
        cantidad: Number(item.querySelector(".cantidades").textContent)
      });
    });

    localStorage.setItem("carrito", JSON.stringify(carrito));
  }


  // contadores (cargar carrito guardado)
let datos = localStorage.getItem("carrito");

if (datos) {
  let carrito = JSON.parse(datos);
  cantitaProducto = 0;
  totalPrecio = 0;

  carrito.forEach(prodc => {
    agregarAlcarrito(prodc.imagen, prodc.nombre, prodc.precio, prodc.cantidad);
  });
}


  // escha el click de la targeta para agrecar a lista
  document.addEventListener("click", function (boton) {

    let evento = boton.target.closest(".btn-agregar");

    if (evento) {

      let imagen = evento.dataset.imagen;
      let nombre = evento.dataset.nombre;
      let precio = Number(evento.dataset.precio);

      let card = evento.closest(".card");
      let numero = card.querySelector(".numeros");
      let cantidad = Number(numero.textContent);

      agregarAlcarrito(imagen, nombre, precio, cantidad);

      numero.textContent = 1;
    }
  });


  // lista para carrito
  function agregarAlcarrito(imagen, nombre, precio, cantidad) {

    let listaCarrito = document.getElementById("listaCarrito");

    let productoExistente = listaCarrito.querySelector(`li[data-nombre="${nombre}"]`);

    // si el producto ya esiste actializa para que se agrege la cantidad y no se repita la li
    if (productoExistente) {

      let numero = productoExistente.querySelector(".cantidades");
      let precioSpan = productoExistente.querySelector(".precio-item");

      let cantidadActual = Number(numero.textContent);
      let nuevaCantidad = cantidadActual + cantidad;

      numero.textContent = nuevaCantidad;

      let precioUnitario = Number(productoExistente.dataset.precio);
      let nuevoPrecioTotal = precioUnitario * nuevaCantidad;
      precioSpan.textContent = nuevoPrecioTotal.toLocaleString();


      cantitaProducto += cantidad;
      totalPrecio += precioUnitario * cantidad;

      actualizarBadge();
      actualizarPrecio();
      guardarCarrito();

      // al agregar mas cantidad se pone al inicio
      /*listaCarrito.prepend(productoExistente);*/

      return;
    }


    // si no esiste esa li con ese nombre la añade a la lista
    let lista = document.createElement("li");
    lista.classList.add("producto");

    lista.dataset.precio = precio;
    lista.dataset.nombre = nombre;

    //boton eliminar
    let eliminarP = document.createElement("button");
    eliminarP.textContent = "x";
    eliminarP.classList.add("botonEliminar");

    // crea la lista
    lista.innerHTML = `
    <img src="${imagen}" class="imagenCarrito"> 
    <span class="nombre-item">${nombre}</span>
    <span class="precio-item">${(precio * cantidad).toLocaleString()}</span>

    <div class="cajonNumero">
      <button class="decremento">−</button> 
      <span class="cantidades">${cantidad}</span> 
      <button class="incremento">+</button>
    </div>
    `;

    // agregar boton eliminar a la lista
    lista.appendChild(eliminarP);

    // agregar toda la li creada al contenedor de html 
    listaCarrito.appendChild(lista);

    // evento de boton eliminar el producto
    eliminarP.addEventListener("click", function () {

      mostrarConfirmacion(
        `¿Deseas eliminar ${nombre} del carrito?`,

        function (confirmado) {

          if (confirmado) {

            eliminarProducto(lista);

            mostrarToast(`${nombre} eliminado del carrito`);

          }

        }

      );

    });
    cantitaProducto += cantidad;
    totalPrecio += precio * cantidad;
    actualizarBadge();
    actualizarPrecio();
    guardarCarrito();

    // la agrega la creada al inicio
    listaCarrito.prepend(lista);
    document.getElementById("msgVacio").style.display = "none";
  }





  // evento del decremento y decremento de la li
  document.addEventListener("click", function (clic) {

    // si solo hace click en el boton decremento li
    if (clic.target.classList.contains("decremento")) {

      // busca li
      let contenedor = clic.target.closest("li");

      // si no la encuentra se detiene
      if (!contenedor) return;

      let numero = contenedor.querySelector(".cantidades");

      let precioSpan = contenedor.querySelector(".precio-item");

      let precio = Number(contenedor.dataset.precio);

      let cantidad = Number(numero.textContent);

      // si es mayor a 1 puede decrementar
      if (cantidad > 1) {

        cantidad--;

        numero.textContent = cantidad;

        precioSpan.textContent = (precio * cantidad).toLocaleString();

        cantitaProducto--;

        totalPrecio -= precio;

        actualizarBadge();

        actualizarPrecio();

        guardarCarrito();

      }

    }



    // evento del incremento y decremento de la li
    // si dedecta en click en incremento
    // evento del incremento
    if (clic.target.classList.contains("incremento")) {

      let contenedor = clic.target.closest("li");

      if (!contenedor) return;

      let numero = contenedor.querySelector(".cantidades");

      let precioSpan = contenedor.querySelector(".precio-item");

      let precio = Number(contenedor.dataset.precio);

      let cantidad = Number(numero.textContent);

      cantidad++;

      numero.textContent = cantidad;

      precioSpan.textContent = (precio * cantidad).toLocaleString();

      cantitaProducto++;

      totalPrecio += precio;

      actualizarBadge();

      actualizarPrecio();

      guardarCarrito();

    }

  });


  // elimina el producto unitario
  function eliminarProducto(li) {

    let numero = li.querySelector(".cantidades");
    let cantidad = Number(numero.textContent);

    let precio = Number(li.dataset.precio);

    cantitaProducto -= cantidad;
    totalPrecio -= precio * cantidad;

    li.remove();

    actualizarBadge();
    actualizarPrecio();
    guardarCarrito();

    if (cantitaProducto === 0) {
      document.getElementById("msgVacio").style.display = "block";
    }
  }

  // vaciar carrito completo
  let vaciarCarrito = document.getElementById("btnVaciar");

  vaciarCarrito.addEventListener("click", function () {

    mostrarConfirmacion(

      "¿Deseas vaciar todo el carrito?",

      function (confirmado) {

        if (confirmado) {

          let lista = document.getElementById("listaCarrito");

          lista.querySelectorAll('li').forEach(li => li.remove());

          document.getElementById("msgVacio").style.display = "block";

          cantitaProducto = 0;
          totalPrecio = 0;

          actualizarBadge();
          actualizarPrecio();
          guardarCarrito();

          mostrarToast("Carrito vaciado");

        }

      }

    );

  });

  //actualizar total de produtos carrito
<<<<<<< HEAD
 function actualizarBadge() {

    const badgeMobile = document.getElementById('badge-mobile');
    const badgeDesktop = document.getElementById('badge-desktop');

    if (cantitaProducto === 0) {
        badgeMobile.style.display = 'none';
        badgeDesktop.style.display = 'none';
    } else {
        badgeMobile.style.display = 'flex'; // o block
        badgeDesktop.style.display = 'flex'; // o block

        badgeMobile.textContent = cantitaProducto;
        badgeDesktop.textContent = cantitaProducto;
    }
}
=======
  function actualizarBadge() {
    document.getElementById('badge-mobile').textContent = cantitaProducto;
    document.getElementById('badge-desktop').textContent = cantitaProducto;
  }
>>>>>>> 13e9502f6326acbef9e28ae8a8e36f0b4ea4cbe8

  // actualizar precio total del carrito
  function actualizarPrecio() {
    let total = document.getElementById("total");
    total.textContent = "$" + totalPrecio.toLocaleString('es-CO');
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
  document.addEventListener('click', function (e) {
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

const API_AUTH = "https://ecommerceklydy.onrender.com/auth";

// ─────────────────────────────────────────────
// HELPERS DE SESIÓN
// ─────────────────────────────────────────────
function guardarSesion(data) {
  localStorage.setItem("token", data.token);
  localStorage.setItem("rol", data.rol);
  localStorage.setItem("nombre", data.nombre);
  localStorage.setItem("email", data.email);
}

function cerrarSesionLocal() {
  localStorage.removeItem("token");
  localStorage.removeItem("rol");
  localStorage.removeItem("nombre");
  localStorage.removeItem("email");
}

function obtenerSesion() {
  const token = localStorage.getItem("token");
  if (!token) return null;
  return {
    token,
    rol: localStorage.getItem("rol"),
    nombre: localStorage.getItem("nombre"),
    email: localStorage.getItem("email")
  };
}

// ─────────────────────────────────────────────
// LOGIN
// ─────────────────────────────────────────────
const btnLogin = document.getElementById("btnLogin");
if (btnLogin) {
  btnLogin.addEventListener("click", iniciarSesion);
}

async function iniciarSesion() {
  const correo = document.getElementById("correoLogin").value.trim();
  const password = document.getElementById("passwordLogin").value.trim();
  const mensaje = document.getElementById("mensajeLogin");

  if (!correo || !password) {
    mensaje.innerHTML = `<div class="alert alert-danger">Todos los campos son obligatorios</div>`;
    return;
  }

  btnLogin.disabled = true;
  btnLogin.textContent = "Entrando...";

  try {
    const res = await fetch(`${API_AUTH}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: correo, password })
    });

    const data = await res.json();

    if (!res.ok) {
      mensaje.innerHTML = `<div class="alert alert-danger">${data.error || "Credenciales incorrectas"}</div>`;
      return;
    }

    guardarSesion(data);
    actualizarNavbarUsuario();





    // Redirigir según rol

    const base = window.location.origin + "/Ecommerse-tecnologia-";
    if (data.rol === "ADMIN") {
      window.location.href = base + "/FRONTEND/HTML/admin-ver.html";
    } else {
      window.location.href = base + "/FRONTEND/HTML/productos.html";
    }

  } catch (err) {
    console.error(err);
    mensaje.innerHTML = `<div class="alert alert-danger">No se pudo conectar con el servidor.</div>`;
  } finally {
    btnLogin.disabled = false;
    btnLogin.textContent = "ENTRAR";
  }
}

// ─────────────────────────────────────────────
// NAVBAR SEGÚN SESIÓN
// ─────────────────────────────────────────────
function actualizarNavbarUsuario() {
  const sesion = obtenerSesion();
  const contenedorDesktop = document.querySelector(".d-none.d-lg-flex.align-items-center.gap-2");
  const linkAdmin = document.getElementById("linkAdmin");

  if (linkAdmin) {
    linkAdmin.style.display = (sesion && sesion.rol === "ADMIN") ? "block" : "none";
  }

  if (!contenedorDesktop) return;

  if (sesion) {
    contenedorDesktop.innerHTML = `
      <div class="d-flex align-items-center gap-2">
        <span class="text-white fw-bold">
          <i class="bi bi-person-check-fill"></i> ${sesion.nombre}
        </span>
        <button class="btn btn-outline-danger btn-sm" id="btnCerrarSesion">
          Cerrar Sesión
        </button>
        <button class="btn klydy-btn-cart d-flex align-items-center" type="button"
          data-bs-toggle="offcanvas" data-bs-target="#offcanvasCarrito">
          <i class="bi bi-cart3"></i>
          <span class="klydy-badge ms-1" id="badge-desktop"></span>
        </button>
      </div>
    `;
    document.getElementById("btnCerrarSesion")?.addEventListener("click", abrirModalCerrarSesion);
  } else {
    contenedorDesktop.innerHTML = `
      <form class="d-flex align-items-center gap-2">
        <button class="btn klydy-btn-login" type="button"
          data-bs-toggle="modal" data-bs-target="#modalLogin">
          <i class="bi bi-person"></i> Mi Cuenta
        </button>
        <button class="btn klydy-btn-cart d-flex align-items-center" type="button"
          data-bs-toggle="offcanvas" data-bs-target="#offcanvasCarrito">
          <i class="bi bi-cart3"></i>
          <span class="klydy-badge ms-1" id="badge-desktop"></span>
        </button>
      </form>
    `;
  }

  // ← NUEVO: restaurar badge después de redibujar el navbar
  const carritoGuardado = JSON.parse(localStorage.getItem("carrito")) || [];
  const totalItems = carritoGuardado.reduce((acc, p) => acc + p.cantidad, 0);
  const badgeDesktop = document.getElementById("badge-desktop");
  if (badgeDesktop) badgeDesktop.textContent = totalItems || '';
}

// ─────────────────────────────────────────────
// CERRAR SESIÓN
// ─────────────────────────────────────────────
function cerrarSesion() {
  cerrarSesionLocal();
  const base = window.location.origin + "/Ecommerse-tecnologia-";
  window.location.href = base + "/index.html";
}

function abrirModalCerrarSesion() {
  const modal = new bootstrap.Modal(document.getElementById("modalCerrarSesion"));
  modal.show();
}

document.addEventListener("DOMContentLoaded", () => {
  const btnConfirmar = document.getElementById("confirmarCerrarSesion");
  if (btnConfirmar) btnConfirmar.addEventListener("click", cerrarSesion);

  actualizarNavbarUsuario();
});

