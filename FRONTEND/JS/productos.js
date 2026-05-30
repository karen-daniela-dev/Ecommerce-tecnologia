const API = 'https://ecommerceklydy.onrender.com/productos';
let listaProductos = [];

async function cargarProductos() {

      const contenedor = document.getElementById("contenedor");
  contenedor.innerHTML = `
    <div style="text-align:center; padding: 40px; color: #aaa;">
      <div style="font-size: 2rem; margin-bottom: 10px;">⏳</div>
      <p style="font-size: 1.1rem; font-weight: 500;">Cargando productos...</p>
      <p style="font-size: 0.85rem; opacity: 0.7;">El servidor está despertando, esto puede tomar hasta 1 minuto.</p>
    </div>
  `;

    
  try {
    const res = await fetch(API);
    if (!res.ok) throw new Error(`Error ${res.status}`);
    const datos = await res.json();

    // Normalizar campos para que sean compatibles con el resto del JS
    listaProductos = datos.map(p => ({
      ...p,
      imagen:    p.urlImagen || '',
      categoria: p.categoria.toLowerCase(),         // "LAPTOPS" → "laptops"
      marca:     p.marca.toLowerCase(),             // "DELL" → "dell"
      uso:       p.uso.toLowerCase(),               // "GAMER" → "gamer"
      cantidad:  p.stock
    }));

    productosFiltros = [...listaProductos];
    mostrarProductos();

  } catch (err) {
    console.error('Error al cargar productos:', err);
    document.getElementById("contenedor").innerHTML =
      `<p class="text-center text-danger">No se pudieron cargar los productos. Intenta más tarde.</p>`;
  }
}






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
// MODAL CONFIRMACIÓN
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

let productosFiltros = JSON.parse(JSON.stringify(listaProductos));
let filtrarCategoria = "inicio";
let filtrarUso = "";

//  precio
// PRECIOS
let precioMin = null;
let precioMax = null;


// FORMATO COP
function formatearCOP(valor) {
    return new Intl.NumberFormat("es-CO", {
        style: "currency",
        currency: "COP",
        minimumFractionDigits: 0
    }).format(valor);
}


// LIMPIAR NÚMERO
function limpiarNumero(texto) {
    return Number(texto.replace(/\D/g, ""));
}


// CONTENEDORES FILTROS
let filtrosPrecio = document.querySelectorAll(".filtrosPrecio");


// RECORRER CADA BLOQUE
filtrosPrecio.forEach(filtro => {

    let inputMin = filtro.querySelector('input[placeholder="Min"]');
    let inputMax = filtro.querySelector('input[placeholder="Max"]');

    let botonFiltrar = filtro.querySelector(".botonFiltrar");
    let botonLimpiar = filtro.querySelector(".limpiarFiltro");


    // VALIDAR EXISTENCIA
    if (!inputMin || !inputMax || !botonFiltrar || !botonLimpiar) {
        return;
    }


    // FORMATO INPUTS
    [inputMin, inputMax].forEach(input => {

        input.addEventListener("input", function () {

            let numero = limpiarNumero(this.value);

            if (numero <= 0) {
                this.value = "";
                return;
            }

            this.value = formatearCOP(numero);

        });

    });


    // FILTRAR
    botonFiltrar.addEventListener("click", function () {

        precioMin = inputMin.value
            ? limpiarNumero(inputMin.value)
            : null;

        precioMax = inputMax.value
            ? limpiarNumero(inputMax.value)
            : null;

        mostrarProductos();

    });


    // LIMPIAR
    botonLimpiar.addEventListener("click", function () {

        inputMin.value = "";
        inputMax.value = "";

        precioMin = null;
        precioMax = null;

        mostrarProductos();

    });

});
//nombres para usos
const nombresUsos = {
    gamer: "Gamer",
    general: "General",
    estudio: "Estudio",
    trabajo: "Trabajo"
};

// card
function crearCards(producto) {
    const columnas = document.createElement("div");
    columnas.className = "colunas";

    columnas.innerHTML = ` 
        <div class="card">
            <div class="imagenes">
                <img src="${producto.imagen}" alt="imagen">
            </div>
            <div class="texto">
                <h5>${producto.nombre}</h5>
                <div class="descripcion">
                    <p>${producto.descripcion}</p>
                </div>
                            
                <div class="linea"></div>
                <div class="precios">
                    <div class="numero">
                       <span>${formatearCOP(producto.precio)}</span> 
                    </div>
                    <div class="masmenos">
                       <button class="decremento">−</button>
                       <span class="numeros">1</span>
                       <button  class="incremento" class="icon">+</button>
                    </div>
                </div>
                <div class="anadir btn-agregar" data-imagen="${producto.imagen}" data-nombre="${producto.nombre}" data-precio="${producto.precio}">
                  <span class="acregar">  🛒 Agregar al carrito</span>
                  <span class="acregar2">  🛒 Agregar</span style="display: none;">
                </div>
            </div>
        </div>
    ` ;


    let incremento = columnas.querySelector(".incremento");
    let decremento = columnas.querySelector(".decremento");
    let numero = columnas.querySelector(".numeros");


    let cantidad = 1;
    let botonAgregar = columnas.querySelector(".btn-agregar");

    incremento.addEventListener("click", () => {
        cantidad++;
        numero.textContent = cantidad;
    });

    decremento.addEventListener("click", () => {
        if (cantidad > 1) {
            cantidad--;
            numero.textContent = cantidad;
        }
    });

    // =========================================
    // AGREGAR CARRITO
    // =========================================

    botonAgregar.addEventListener("click", () => {

        mostrarToast(`${producto.nombre} agregado al carrito`);

    });

    return columnas;
}

// fin de cards


//recore botopnes categorias
let categorias = document.querySelectorAll(".menuCategorias button");
categorias.forEach(function (boton) {

    boton.addEventListener("click", function () {



        const items = document.querySelectorAll('.item');

        // si ya tiene la clase active → quitarla
        if (this.classList.contains('active')) {
            this.classList.remove('active');
            filtrarCategoria = "inicio";
        } else {
            // quitar activo a todos
            items.forEach(i => i.classList.remove('active'));

            // agregar activo al seleccionado
            this.classList.add('active');
            filtrarCategoria = this.getAttribute("data-target");
        };

        mostrarProductos();
    });

})



// recore lista de usos*/ 
let listaUsos = document.querySelectorAll(".filtros li");
listaUsos.forEach(function (boton) {
    boton.addEventListener("click", function () {
        let filtro = this.getAttribute("data-target");

        if (filtro === filtrarUso) {
            filtrarUso = "";
            this.classList.remove("active");

        } else {
            filtrarUso = filtro;
            listaUsos.forEach(lis => lis.classList.remove("active"));
            this.classList.add("active");
            console.log(filtro)
        };
        mostrarProductos();

    })
})


//muetra producto
function mostrarProductos() {

    productosFiltros = listaProductos.filter(function (item) {

        let cumpleCategoria = (filtrarCategoria === "inicio" || item.categoria === filtrarCategoria);

        let cumpleUso = (filtrarUso === "" || item.uso === filtrarUso);

        let cumplePrecioMin = (precioMin === null || item.precio >= precioMin);

        let cumplePrecioMax = (precioMax === null || item.precio <= precioMax);

        let cumpleMarca = (marcasSeleccionadas.length === 0 || marcasSeleccionadas.includes(item.marca.toLowerCase()));

        return cumpleCategoria && cumpleUso && cumplePrecioMin && cumplePrecioMax && cumpleMarca;
    });

    let contenedorP = document.getElementById("contenedor");
    contenedorP.innerHTML = "";

    let carrusel = document.getElementById("carouselExampleIndicators");

    if (filtrarCategoria === "inicio") {
        carrusel.style.display = "block";
    } else {
        carrusel.style.display = "none";
    }

    //controlar título para usos
    let titulo = document.getElementById("titulo-seccion");

    if (filtrarUso === "") {
        titulo.style.display = "none";

    } else {
        carrusel.style.display = "none"; // carrusel
        titulo.style.display = "block"; // titula uso
        titulo.textContent = nombresUsos[filtrarUso] || filtrarUso; // mostar el titulo de pediendo de filtro
        escribirTexto(titulo, nombresUsos[filtrarUso] || filtrarUso);// ingresamos el contenedor y el texto
    }

    productosFiltros.forEach(function (producto) {
        const cards = crearCards(producto);
        contenedorP.appendChild(cards);
    })

};

// escritura de los titulos
let intervaloActual;
function escribirTexto(elemento, texto) {
    elemento.textContent = "";

    if (intervaloActual) {
        clearInterval(intervaloActual);
    }

    let i = 0;

    intervaloActual = setInterval(() => {
        elemento.textContent = texto.substring(0, i + 1) + "|"; // cursor
        i++;

        if (i === texto.length) {
            clearInterval(intervaloActual);


            setTimeout(() => {
                elemento.textContent = texto;
            }, 200); // tienpo del | en vista
        }

    }, 150);//velosidad de escritura
}

let marcasSeleccionadas = [];
const checkboxesMarca = document.querySelectorAll('.marcas input[type="checkbox"]');
const categoriaMenu = document.querySelectorAll('.menuCategorias');

checkboxesMarca.forEach(chec => {
    chec.addEventListener("change", () => {

        marcasSeleccionadas = [];

        checkboxesMarca.forEach(c => {
            if (c.checked) {
                marcasSeleccionadas.push(c.value.toLowerCase());
            }
        });

        mostrarProductos();
    });
});

// BOTÓN LIMPIAR TODOS LOS FILTROS
let botonesLimpiarTodo = document.querySelectorAll(".limpiarF");

botonesLimpiarTodo.forEach(boton => {

    boton.addEventListener("click", function () {

        // reset categorías
        filtrarCategoria = "inicio";

        // reset uso
        filtrarUso = "";

        // reset precios
        precioMin = null;
        precioMax = null;


        // limpiar inputs
        document.querySelectorAll(".pre").forEach(input => {
            input.value = "";
        });

        // reset marcas
        marcasSeleccionadas = [];

        // desmarcar checkboxes
        checkboxesMarca.forEach(chec => {
            chec.checked = false;
        });

        // quitar active categorías
        categorias.forEach(btn => {
            btn.classList.remove("active");

        });

        // quitar active usos
        listaUsos.forEach(li => {
            li.classList.remove("active");
        });

        // CERRAR MENÚ MÓVIL
        categoriaMenu.forEach(menu => {

            if (menu.style.display === "flex") {

                catego.classList.remove("active");
                menu.style.display = "none";
                categoriasMenu2.style.display = "none"

            } else {

                catego.classList.add("active");
                menu.style.display = "block";
                categoriasMenu2.style.display = "flex"
            }

        });

        // mostrar productos
        mostrarProductos();

    });

});





let buscarCatrgoria = document.getElementById("buscarCatrgoria");
let categoriasMenu2 = document.getElementById("categoriasMenu2");
let filtrosMenu = document.querySelector(".filtroMovil");


buscarCatrgoria.addEventListener("click", function () {

    let estado = getComputedStyle(filtrosMenu).display;

    if (estado === "none") {

        filtrosMenu.style.display = "block";


    } else {

        filtrosMenu.style.display = "none";
        categoriasMenu2.style.display = "none"

    }

});


let botonCategorias = document.getElementById("botonCategorias");


botonCategorias.addEventListener("click", function () {

    let estado = window.getComputedStyle(categoriasMenu2).display;

    if (estado === "none") {

        categoriasMenu2.style.display = "flex";
        botonCategorias.classList.add("active");

    } else {

        categoriasMenu2.style.display = "none";
        botonCategorias.classList.remove("active");

    }

});
// =========================================
// LEER PARÁMETROS DE LA URL para INDEX
// =========================================

function obtenerFiltrosDesdeURL() {

    const params = new URLSearchParams(window.location.search);

    const categoria = params.get("categoria");
    const rol = params.get("rol");

    // aplicar categoría si existe
    if (categoria) {
        filtrarCategoria = categoria.toLowerCase();
    }
    // activar botón visual de categoría
    categorias.forEach(btn => {
        if (btn.getAttribute("data-target") === filtrarCategoria) {
            btn.classList.add("active");
        }
    });

    // aplicar uso si existe
    if (rol) {
        filtrarUso = rol.toLowerCase();
    }
    // activar botón visual de uso
    listaUsos.forEach(li => {
        if (li.getAttribute("data-target") === filtrarUso) {
            li.classList.add("active");
        }
    });

}
obtenerFiltrosDesdeURL();
cargarProductos(); // ← esto carga y luego llama mostrarProductos() internamente



