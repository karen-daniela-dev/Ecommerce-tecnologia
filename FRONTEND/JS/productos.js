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
setInterval(ActualizarProductos, 2000);

 IniciarDatos();

let productosFiltros = JSON.parse(JSON.stringify(listaProductos));
let filtrarCategoria = "inicio"; 
let filtrarUso = "";

// card
function crearCards(producto){
    const columnas = document.createElement("div");
    columnas.className = "col-12 col-sm-12 col-md-12 col-lg-2";

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
                       <span>$ ${producto.precio.toLocaleString()}</span> 
                    </div>
                    <div class="masmenos">
                       <button>−</button>
                       <span>1</span>
                       <button class="icon">+</button>
                    </div>
                </div>
                <div class="anadir">
                    <button>🛒 Agregar al carrito</button>
                </div>
            </div>
        </div>
    ` ;
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
        return(filtrarCategoria === "inicio" || item.categoria === filtrarCategoria) && (filtrarUso === "" || item.uso === filtrarUso);
    });

    let contenedorP = document.getElementById("contenedor");

    contenedorP.innerHTML = "";

    productosFiltros.forEach(function(producto){
        const cards = crearCards(producto);
        contenedorP.appendChild(cards);
    })

}; 

mostrarProductos()

