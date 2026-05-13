const lista = JSON.parse(localStorage.getItem("ListaProductos")) || [];

let paginaActual = 1;
const porPagina = 5;

const tabla = document.getElementById("tablaProductos");
const cards = document.getElementById("cardsProductos");
const paginacion = document.getElementById("paginacion");
const buscador = document.getElementById("buscador");

let listaFiltrada = [...lista];

/* FORMATO PRECIO */
function formatearPrecio(num) {
  return "$ " + num.toLocaleString("es-CO");
}

/* RENDER */
function render() {
  tabla.innerHTML = "";
  cards.innerHTML = "";

  const inicio = (paginaActual - 1) * porPagina;
  const fin = inicio + porPagina;
  const datos = listaFiltrada.slice(inicio, fin);

  datos.forEach(p => {

    /* TABLA */
    tabla.innerHTML += `
      <tr>
        <td><img src="${p.imagen}" style="width:60px;height:60px;object-fit:cover;"></td>
        <td>${p.id}</td>
        <td>${p.nombre}</td>
        <td>${p.marca}</td>
        <td>${p.cantidad}</td>
        <td>${formatearPrecio(p.precio)}</td>
        <td>
          <button class="btn btn-sm btn-outline-info" onclick="#">
            <i class="bi bi-eye"></i>
          </button>
          <button class="btn btn-sm btn-outline-danger" onclick="eliminar(${p.id})">
            <i class="bi bi-trash"></i>
          </button>
        </td>
      </tr>
    `;

    /* CARDS */
    cards.innerHTML += `
      <div class="card mb-3 bg-dark text-white">
        <div class="d-flex p-3 gap-3">
          <img src="${p.imagen}" style="width:80px;height:80px;object-fit:cover;">
          <div class="flex-grow-1">
            <h6>${p.nombre}</h6>
            <small>${p.marca}</small><br>
            <strong>${formatearPrecio(p.precio)}</strong>
          </div>
        </div>
        <div class="p-2 d-flex justify-content-end gap-2">
          <button class="btn btn-sm btn-outline-info" onclick="#">
            <i class="bi bi-eye"></i>
          </button>
          <button class="btn btn-sm btn-outline-danger" onclick="eliminar(${p.id})">
            <i class="bi bi-trash"></i>
          </button>
        </div>
      </div>
    `;
  });

  renderPaginacion();
}

/* PAGINACIÓN */
function renderPaginacion() {
  paginacion.innerHTML = "";
  const totalPaginas = Math.ceil(listaFiltrada.length / porPagina);

  for (let i = 1; i <= totalPaginas; i++) {
    paginacion.innerHTML += `
      <li class="page-item ${i === paginaActual ? "active" : ""}">
        <button class="page-link" onclick="cambiarPagina(${i})">${i}</button>
      </li>
    `;
  }
}

function cambiarPagina(p) {
  paginaActual = p;
  render();
}

/* BUSCADOR */
buscador.addEventListener("input", () => {
  const valor = buscador.value.toLowerCase();

  listaFiltrada = lista.filter(p =>
    p.nombre.toLowerCase().includes(valor) ||
    p.marca.toLowerCase().includes(valor) ||
    p.categoria.toLowerCase().includes(valor)
  );

  paginaActual = 1;
  render();
});



/* ELIMINAR */
function eliminar(id) {
  if (!confirm("¿Eliminar producto?")) return;

  const nuevaLista = lista.filter(p => p.id !== id);
  localStorage.setItem("ListaProductos", JSON.stringify(nuevaLista));
  location.reload();
}

/* INIT */
render();