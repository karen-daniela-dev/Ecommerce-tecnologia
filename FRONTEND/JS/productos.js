// importamanos los areglos
import {productos} from "./textoProducto.js";


//convertimos en JSON
let listaProductos = JSON.parse(JSON.stringify(productos));
function IniciarDatos(){

    let datos = localStorage.getItem("ListaProductos");

    if(datos){

        let creadosProductos = JSON.parse(datos);
        listaProductos = [...listaProductos,...creadosProductos];
    }


}

function ActualizarProductos(){

    listaProductos = JSON.parse(JSON.stringify(productos));

    let datos = localStorage.getItem("ListaProductos");

    if(datos){

        let creadosProductos = JSON.parse(datos);
            listaProductos = [...listaProductos,...creadosProductos];
    }

    mostrarProductos();
}



//setInterval(ActualizarProductos, 2000);

IniciarDatos();

let productosFiltros = JSON.parse(JSON.stringify(listaProductos));
let filtrarCategoria = "inicio"; 
let filtrarUso = "";

//  precio
let precioMin = null;
let precioMax = null;

// inputs y botón precio
let inputMax = document.querySelector('.filtrosPrecio input[placeholder="Max"]');
let inputMin = document.querySelector('.filtrosPrecio input[placeholder="Min"]');
let botonFiltrar = document.querySelector('.botonFiltrar');
let botonLimpiar = document.querySelector('.limpiarFiltro');

function formatearCOP(valor){
    return new Intl.NumberFormat("es-CO", {
        style: "currency",
        currency: "COP",
        minimumFractionDigits: 0
    }).format(valor);
}

function limpiarNumero(texto){
    return Number(texto.replace(/\D/g, ""));
}

[inputMin, inputMax].forEach(input => {

    input.addEventListener("input", function(){

        let numero = limpiarNumero(this.value);

        if(numero === 0){
            this.value = "";
            return;
        }

        this.value = formatearCOP(numero);
    });

});

//evento filtro precio
botonFiltrar.addEventListener("click", function(){
    precioMin = inputMin.value ? limpiarNumero(inputMin.value) : null;
    precioMax = inputMax.value ? limpiarNumero(inputMax.value) : null
    mostrarProductos();
});

// EVENTO LIMPIAR
botonLimpiar.addEventListener("click", function(){

    // limpiar inputs
    inputMin.value = "";
    inputMax.value = "";

    // resetear valores
    precioMin = null;
    precioMax = null;

    // actualizar vista
    mostrarProductos();
});

//nombres para usos
const nombresUsos = {
    gamer: "Gamer",
    general: "General",
    estudio: "Estudio",
    trabajo: "Trabajo"
};

// card
function crearCards(producto){   
    const columnas = document.createElement("div");
    columnas.className = "col";
    columnas.style.flex = "0 0 12.5%";
    columnas.style.maxWidth = "12.5%";

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
                  <span>  🛒 Agregar al carrito</span>
                </div>
            </div>
        </div>
    ` ;


    let incremento = columnas.querySelector(".incremento");
    let decremento = columnas.querySelector(".decremento");
    let numero = columnas.querySelector(".numeros");


    let cantidad = 1;

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

    return columnas;
}

// fin de cards


//recore botopnes categorias
let categorias = document.querySelectorAll(".menuCategorias button");
categorias.forEach(function(boton){
    boton.addEventListener("click", function(){
        filtrarCategoria = this.getAttribute("data-target");
        mostrarProductos();
        const items = document.querySelectorAll('.item');

                // si ya tiene la clase active → quitarla
                if (this.classList.contains('active')) {
                    this.classList.remove('active');
                } else {
                    // quitar activo a todos
                    items.forEach(i => i.classList.remove('active'));

                    // agregar activo al seleccionado
                    this.classList.add('active');
                }; 
        });
         
    })



// recore lista de usos*/ 
let listaUsos = document.querySelectorAll(".filtros li");
listaUsos.forEach(function(boton){
    boton.addEventListener("click", function(){
        let filtro = this.getAttribute("data-target");
        
        if(filtro === filtrarUso){
            filtrarUso = "";
            this.classList.remove("active");
            
        }else{
            filtrarUso = filtro;
            listaUsos.forEach(lis => lis.classList.remove("active"));
            this.classList.add("active");
            console.log(filtro)
        };
        mostrarProductos();
    
    })
})


//muetra producto
function mostrarProductos(){

    productosFiltros = listaProductos.filter(function(item){

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

    if(filtrarCategoria === "inicio"){
        carrusel.style.display = "block";
    } else {
        carrusel.style.display = "none";
    }

    //controlar título para usos
    let titulo = document.getElementById("titulo-seccion");

    if(filtrarUso === ""){
        titulo.style.display = "none";
        
    } else {
        carrusel.style.display = "none"; // carrusel
        titulo.style.display = "block"; // titula uso
        titulo.textContent = nombresUsos[filtrarUso] || filtrarUso; // mostar el titulo de pediendo de filtro
        escribirTexto(titulo, nombresUsos[filtrarUso] || filtrarUso);// ingresamos el contenedor y el texto
    }

    productosFiltros.forEach(function(producto){
        const cards = crearCards(producto);
        contenedorP.appendChild(cards);
    })

}; 

// escritura de los titulos
let intervaloActual;
function escribirTexto(elemento, texto){
    elemento.textContent = "";

    if(intervaloActual){
        clearInterval(intervaloActual);
    }

    let i = 0;

    intervaloActual = setInterval(() => {
        elemento.textContent = texto.substring(0, i + 1) + "|"; // cursor
        i++;

        if(i === texto.length){
            clearInterval(intervaloActual);

            
            setTimeout(() => {
                elemento.textContent = texto;
            }, 200); // tienpo del | en vista
        }

    }, 150);//velosidad de escritura
}

let marcasSeleccionadas = [];
const checkboxesMarca = document.querySelectorAll('.marcas input[type="checkbox"]');

checkboxesMarca.forEach(cb => {
  cb.addEventListener("change", () => {

    marcasSeleccionadas = [];

    checkboxesMarca.forEach(c => {
      if (c.checked) {
        marcasSeleccionadas.push(c.value.toLowerCase());
      }
    });

    mostrarProductos(); // 👈 vuelve a renderizar
  });
});

mostrarProductos()

