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
 let cantitaProducto = 0;
 let totalPrecio = 0;






 document.addEventListener("click", function(e){
  if(e.target.classList.contains("btn-agregar")){
    
    let boton = e.target;

    let imagen = boton.dataset.imagen;
    let nombre = boton.dataset.nombre;
    let precio = Number(boton.dataset.precio);

    let card = boton.closest(".card");
    let cantidad = Number(card.querySelector(".numeros").textContent);

    agregarAlcarrito(imagen, nombre, precio, cantidad);
  }
});



 function agregarAlcarrito(imagen, nombre, precio, cantidad){
  let lista = document.createElement("li");
  lista.classList.add("producto");

  let eliminarP = document.createElement("button");
    eliminarP.textContent = "x";
    eliminarP.classList.add("botonEliminar");

  lista.innerHTML = `<img src="${imagen}" class="imagenCarrito"> ${nombre} ${cantidad} ${(precio*cantidad).toLocaleString()}`;
  lista.appendChild(eliminarP);

  let listaCarrito = document.getElementById("listaCarrito");
  listaCarrito.appendChild(lista);


  eliminarP.addEventListener("click", function(){
       eliminarProducto(lista, precio, cantidad);
  })

  cantitaProducto += cantidad;
  totalPrecio += precio * cantidad;
  actualizarBadge();
  actualizarPrecio();

  document.getElementById("msgVacio").style.display = "none";
 }


 function eliminarProducto(li, precio, cantidad){
    li.remove();
    
    cantitaProducto -= cantidad;
    totalPrecio -= precio * cantidad;

    actualizarBadge();
    actualizarPrecio();

 }


 function actualizarBadge() {
    document.getElementById('badge-mobile').textContent  = cantitaProducto;
    document.getElementById('badge-desktop').textContent = cantitaProducto;
  }

  function actualizarPrecio(){
     let total = document.getElementById("total");

     total.textContent = "$" + totalPrecio.toLocaleString('es-CO');
  }

  let vaciarCarrito= document.getElementById("btnVaciar");
  vaciarCarrito.addEventListener("click", function(){
    let lista = document.getElementById("listaCarrito");
    lista.querySelectorAll('li').forEach(li => li.remove());
    document.getElementById("msgVacio").style.display = "block";

    cantitaProducto = 0;
    totalPrecio = 0;

    actualizarBadge();
    actualizarPrecio();


  })


  
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