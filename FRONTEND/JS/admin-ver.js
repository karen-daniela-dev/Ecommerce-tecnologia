const API = 'https://ecommerceklydy.onrender.com/productos';

let lista = [];
let listaFiltrada = [];
let paginaActual = 1;
const porPagina = 5;

const tabla = document.getElementById("tablaProductos");
const cards = document.getElementById("cardsProductos");
const paginacion = document.getElementById("paginacion");
const buscador = document.getElementById("buscador");

/* ── Formato precio ───────────────────────────────── */
function formatearPrecio(num) {
  return "$ " + num.toLocaleString("es-CO");
}

/* ── Cargar productos desde la API ───────────────── */
async function cargarProductos() {
  try {
    const res = await fetch(API);
    if (!res.ok) throw new Error(`Error ${res.status}`);
    lista = await res.json();
    listaFiltrada = [...lista];
    render();
  } catch (err) {
    console.error('Error al cargar productos:', err);
    tabla.innerHTML = `<tr><td colspan="7" class="text-center text-danger">No se pudo cargar los productos.</td></tr>`;
  }
}

/* ── Render tabla y cards ─────────────────────────── */
function render() {
  tabla.innerHTML = "";
  cards.innerHTML = "";

  const inicio = (paginaActual - 1) * porPagina;
  const datos = listaFiltrada.slice(inicio, inicio + porPagina);

  if (datos.length === 0) {
    tabla.innerHTML = `<tr><td colspan="7" class="text-center text-muted">Sin productos.</td></tr>`;
    cards.innerHTML = `<p class="text-center text-muted">Sin productos.</p>`;
    renderPaginacion();
    return;
  }

  datos.forEach(p => {

    /* TABLA */
    tabla.innerHTML += `
      <tr>
        <td><img src="${p.urlImagen || ''}" style="width:60px;height:60px;object-fit:cover;" onerror="this.src='../IMG/no-image.png'"></td>
        <td>${p.id}</td>
        <td>${p.nombre}</td>
        <td>${p.marca}</td>
        <td>${p.stock}</td>
        <td>${formatearPrecio(p.precio)}</td>
        <td>
          <button class="btn btn-sm btn-outline-info" onclick="irAEditar(${p.id})">
            <i class="bi bi-pencil"></i>
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
          <img src="${p.urlImagen || ''}" style="width:80px;height:80px;object-fit:cover;" onerror="this.src='../IMG/no-image.png'">
          <div class="flex-grow-1">
            <h6>${p.nombre}</h6>
            <small>${p.marca}</small><br>
            <strong>${formatearPrecio(p.precio)}</strong>
          </div>
        </div>
        <div class="p-2 d-flex justify-content-end gap-2">
          <button class="btn btn-sm btn-outline-info" onclick="irAEditar(${p.id})">
            <i class="bi bi-pencil"></i>
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

/* ── Paginación ───────────────────────────────────── */
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

/* ── Buscador ─────────────────────────────────────── */
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

/* ── Eliminar ─────────────────────────────────────── */
async function eliminar(id) {
  if (!confirm("¿Eliminar producto?")) return;

  try {
    const res = await fetch(`${API}/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error(`Error ${res.status}`);
    await cargarProductos(); // recarga la lista desde la API
  } catch (err) {
    console.error('Error al eliminar:', err);
    alert('No se pudo eliminar el producto. Intenta de nuevo.');
  }
}

/* ── Editar ───────────────────────────────────────── */
function irAEditar(id) {
  window.location.href = `admin-crear.html?id=${id}`;
}

/* ── Init ─────────────────────────────────────────── */
cargarProductos();