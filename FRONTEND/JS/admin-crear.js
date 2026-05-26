(() => {
  'use strict';
  let modoEdicion = false;
  let productoEditando = null;
  let productoOriginal = null;



  /* ── Referencias al DOM ───────────────────────────── */
  const form = document.getElementById('formCrearProducto');
  const inputNombre = document.getElementById('nombre');
  const inputCantidad = document.getElementById('cantidad');
  const inputPrecio = document.getElementById('precio');
  const inputMarca = document.getElementById('marca');
  const selectCat = document.getElementById('categoria');
  const radiosUso = document.querySelectorAll('input[name="uso"]');
  const usoError = document.getElementById('usoError');
  const descTextarea = document.getElementById('descripcion');
  const descContador = document.getElementById('descContador');
  const precioError = document.getElementById('precioError');

  /* Imagen */
  const dropZone = document.getElementById('dropZone');
  const previewContainer = document.getElementById('previewContainer');
  const previewImg = document.getElementById('previewImg');
  const previewNombre = document.getElementById('previewNombre');
  const btnQuitarImagen = document.getElementById('btnQuitarImagen');
  const imagenError = document.getElementById('imagenError');
  const inputImagen = document.getElementById('imagenProducto');
  const inputUrl = document.getElementById('imagenUrl');

  function mostrarToast(mensaje) {
    const toast = document.getElementById('toastProducto');

    toast.textContent = mensaje;
    toast.classList.add('show');

    setTimeout(() => {
      toast.classList.remove('show');
    }, 3000); // desaparece en 3 segundos
  }

  /* ── Contador de caracteres — Descripción ─────────── */
  descTextarea.addEventListener('input', () => {
    descContador.textContent = `${descTextarea.value.length} / 500`;
  });

  /* ── Formateo de precio en tiempo real (COP) ──────── */
  inputPrecio.addEventListener('input', () => {
    // Elimina todo lo que no sea dígito
    const raw = inputPrecio.value.replace(/\D/g, '');
    // Formatea con puntos de miles (estilo COP: 1.500.000)
    inputPrecio.value = raw.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  });

  /* ── Helpers de validación ────────────────────────── */
  function mostrarError(input, mensaje) {
    input.classList.add('is-invalid');
    input.classList.remove('is-valid');
    const fb = input.closest('.col-12, .col-sm-6, .col-lg-3, .col-md-4, .col-md-8, .input-group')
      ?.querySelector('.invalid-feedback');
    if (fb && mensaje) fb.textContent = mensaje;
  }

  function mostrarValido(input) {
    input.classList.remove('is-invalid');
    input.classList.add('is-valid');

  }

  function limpiarFormulario() {
    form.reset();
    inputUrl.value = '';

    inputPrecio.classList.remove('is-invalid', 'is-valid');
    inputPrecio.value = '';
    precioError.textContent = '';
    precioError.style.display = 'none';

    form.classList.remove('was-validated');
    form.querySelectorAll('.is-valid, .is-invalid').forEach(el => {
      el.classList.remove('is-valid', 'is-invalid');
    });
    usoError.style.display = 'none';
    imagenError.style.display = 'none';
    precioError.style.display = 'none';
    previewContainer.classList.add('d-none');
    previewImg.src = '';
    dropZone.classList.remove('border-success', 'border-danger');
    descContador.textContent = '0 / 500';
  }

  /* Validación del precio (acceso especial por el input-group) */

  function validarPrecio(forzar = false) {
    const valor = inputPrecio.value.trim();
    const raw = valor.replace(/\./g, '');

    // Vacío
    if (valor === '') {
      if (forzar) {
        inputPrecio.classList.add('is-invalid');
        inputPrecio.classList.remove('is-valid');

        precioError.textContent = 'El precio es obligatorio.';
        precioError.style.display = 'block';
      } else {
        inputPrecio.classList.remove('is-invalid', 'is-valid');
        precioError.style.display = 'none';
        precioError.textContent = '';
      }
      return false;
    }

    // No numérico
    if (!/^\d+$/.test(raw)) {
      inputPrecio.classList.add('is-invalid');
      inputPrecio.classList.remove('is-valid');

      precioError.textContent = 'Solo se permiten números.';
      precioError.style.display = 'block';
      return false;
    }

    // x <= 0
    if (parseInt(raw) <= 0) {
      inputPrecio.classList.add('is-invalid');
      inputPrecio.classList.remove('is-valid');

      precioError.textContent = 'Debe ser mayor a 0.';
      precioError.style.display = 'block';
      return false;
    }

    //  OK
    inputPrecio.classList.remove('is-invalid');
    inputPrecio.classList.add('is-valid');
    precioError.style.display = 'none';
    precioError.textContent = '';

    return true;
  }

  /* Validación de los radios de Uso */
  function validarUso() {
    const seleccionado = [...radiosUso].some(r => r.checked);
    if (!seleccionado) {
      usoError.style.display = 'block';
      radiosUso.forEach(r => r.classList.add('is-invalid'));
      return false;
    }
    usoError.style.display = 'none';
    radiosUso.forEach(r => {
      r.classList.remove('is-invalid');
      r.classList.add('is-valid');
    });
    return true;
  }






  /* Validación de imagen */
  function validarImagen() {

    const file = inputImagen.files[0];
    const url = inputUrl.value.trim();

    //  NO hay nada
    if (!file && !url) {
      imagenError.textContent = 'Debes subir una imagen o ingresar una URL.';
      imagenError.style.display = 'block';

      dropZone.classList.add('border-danger');
      dropZone.classList.remove('border-success');

      return false;
    }

    // HAY archivo
    if (file) {
      imagenError.style.display = 'none';

      dropZone.classList.remove('border-danger');
      dropZone.classList.add('border-success');

      return true;
    }

    //  HAY URL (validación básica)
    if (url) {
      try {
        new URL(url); // valida formato
      } catch {
        imagenError.textContent = 'La URL no es válida.';
        imagenError.style.display = 'block';
        return false;
      }

      imagenError.style.display = 'none';

      dropZone.classList.remove('border-danger');
      dropZone.classList.add('border-success');

      return true;
    }

    return false;
  }





  function validarNombre() {
    if (inputNombre.value.trim()) {
      mostrarValido(inputNombre);
    } else {
      mostrarError(inputNombre, 'El nombre es obligatorio (máx. 100 caracteres).');
    }
  }

  inputNombre.addEventListener('input', validarNombre);
  inputNombre.addEventListener('blur', validarNombre);



  function validarCantidad() {
    const v = inputCantidad.value;

    if (v === '' || parseInt(v) < 0 || !Number.isInteger(Number(v))) {
      mostrarError(inputCantidad, 'Ingresa una cantidad válida (número entero ≥ 0).');
    } else {
      mostrarValido(inputCantidad);
    }
  }

  inputCantidad.addEventListener('input', validarCantidad);
  inputCantidad.addEventListener('blur', validarCantidad);


  inputPrecio.addEventListener('input', () => {
    const raw = inputPrecio.value.replace(/\D/g, '');

    // Formatear
    inputPrecio.value = raw.replace(/\B(?=(\d{3})+(?!\d))/g, '.');

    // Validar después de formatear
    validarPrecio();
  });


  inputPrecio.addEventListener('blur', validarPrecio);

  function validarMarca() {
    if (inputMarca.value !== "") {
      mostrarValido(inputMarca);
    } else {
      mostrarError(inputMarca, 'Debes seleccionar una marca.');
    }
  }

  inputMarca.addEventListener('change', validarMarca);




  selectCat.addEventListener('change', () => {
    selectCat.value
      ? mostrarValido(selectCat)
      : mostrarError(selectCat, 'Selecciona una categoría.');
  });

  radiosUso.forEach(r => r.addEventListener('change', validarUso));




  function validarDescripcion() {
    if (descTextarea.value.trim()) {
      mostrarValido(descTextarea);
    } else {
      mostrarError(descTextarea, 'La descripción es obligatoria (máx. 500 caracteres).');
    }
  }

  descTextarea.addEventListener('input', validarDescripcion);
  descTextarea.addEventListener('blur', validarDescripcion);

  /* ── Zona de carga de imagen ──────────────────────── */

  // Abrir selector al hacer clic en la zona o presionar Enter/Espacio
  dropZone.addEventListener('click', () => inputImagen.click());
  dropZone.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      inputImagen.click();
    }
  });

  // Drag & Drop visual feedback
  dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('border-primary', 'bg-light');
  });
  dropZone.addEventListener('dragleave', () => {
    dropZone.classList.remove('border-primary', 'bg-light');
  });
  dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('border-primary', 'bg-light');
    const files = e.dataTransfer.files;
    if (files.length) procesarImagen(files[0]);
  });

  // Selección por click
  inputImagen.addEventListener('change', () => {
    if (inputImagen.files.length) {
      inputUrl.value = ''; // LIMPIA URL
      procesarImagen(inputImagen.files[0]);
    }
  });

  function procesarImagen(file) {
    // Validar tipo
    const tiposPermitidos = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!tiposPermitidos.includes(file.type)) {
      imagenError.textContent = 'Solo se permiten archivos JPG o PNG.';
      imagenError.style.display = 'block';
      dropZone.classList.add('border-danger');
      return;
    }

    // Validar tamaño (máx. 5 MB)
    const maxBytes = 5 * 1024 * 1024;
    if (file.size > maxBytes) {
      imagenError.textContent = 'La imagen no puede superar los 5 MB.';
      imagenError.style.display = 'block';
      dropZone.classList.add('border-danger');
      return;
    }

    // Todo OK → mostrar vista previa
    imagenError.style.display = 'none';
    dropZone.classList.remove('border-danger');
    dropZone.classList.add('border-success');

    const reader = new FileReader();
    reader.onload = (e) => {
      previewImg.src = e.target.result;
      previewNombre.textContent = file.name;
      previewContainer.classList.remove('d-none');
    };
    reader.readAsDataURL(file);
  }

  // previo para imagen de url 
  inputUrl.addEventListener('input', () => {
    const url = inputUrl.value.trim();

    if (!url) return;

    // limpiar archivo
    inputImagen.value = '';

    previewImg.src = url;
    previewNombre.textContent = "Imagen desde URL";

    previewContainer.classList.remove('d-none');

    dropZone.classList.remove('border-danger');
    dropZone.classList.add('border-success');

    imagenError.style.display = 'none';
  });

  // Botón quitar imagen
  btnQuitarImagen.addEventListener('click', () => {
    inputImagen.value = '';
    inputUrl.value = '';         // Limpia el input file
    previewImg.src = '';
    previewContainer.classList.add('d-none');
    dropZone.classList.remove('border-success', 'border-danger');
    imagenError.style.display = 'none';
  });

  /* ── Lista temporal de productos (vive en memoria mientras la página esté abierta)
       INTEGRACIÓN FUTURA: este array desaparece. En su lugar se hara un
       fetch GET /api/productos para traer la lista desde la BD.
  ─────────────────────────────────────────────────────────────────────────── */
  const listaProductos = JSON.parse(localStorage.getItem("ListaProductos")) || [];
  console.log("Productos actuales:");
  imprimirLista();

  /* Muestra el estado actual de la lista en consola */
  function imprimirLista() {
    console.groupCollapsed(
      `Lista de productos (${listaProductos.length} en total)`
    );
    listaProductos.forEach((p, i) => {
      console.log(`#${i + 1}`, p);
    });
    console.groupEnd();
  }

  // convertir Imagen A Base64 
  function inputABase64(input) {
    return new Promise((resolve) => {
      try {
        // Validar que exista archivo
        if (!input || !input.files || input.files.length === 0) {
          return resolve("");
        }

        const archivo = input.files[0];
        const reader = new FileReader();

        reader.onload = () => {
          resolve(reader.result || "");
        };

        reader.onerror = () => {
          resolve("");
        };

        reader.readAsDataURL(archivo);

      } catch (error) {
        resolve("");
      }
    });
  }

  /* ── Envío del formulario ─────────────────────────── */
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Dispara la validación nativa de Bootstrap
    form.classList.add('was-validated');

    // Validaciones personalizadas
    const precioOk = validarPrecio(true);
    const usoOk = validarUso();
    const imagenOk = validarImagen();

    // Verifica también los campos nativos de Bootstrap
    const formNativoOk = form.checkValidity();

    if (!formNativoOk || !precioOk || !usoOk || !imagenOk) {
      // Hace scroll al primer campo inválido
      const primerError = form.querySelector('.is-invalid, [style*="display: block"]');
      if (primerError) primerError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    let imagen = null;
    let tipoImagen = null;

    if (inputImagen.files.length > 0) {
      imagen = await inputABase64(inputImagen);
      tipoImagen = "file";
    } else if (inputUrl.value.trim()) {
      imagen = inputUrl.value.trim();
      tipoImagen = "url";
    }

    /*  Formulario válido — construir el objeto producto */
    const nuevoProducto = {
      id: listaProductos.length + 1,          // ID temporal (la BD lo generará)
      nombre: inputNombre.value.trim(),
      cantidad: parseInt(inputCantidad.value),
      precio: parseInt(inputPrecio.value.replace(/\./g, '')),  // sin puntos
      marca: inputMarca.value.trim(),
      categoria: selectCat.value,
      uso: [...radiosUso].find(r => r.checked)?.value,
      descripcion: descTextarea.value.trim(),

      imagenNombre: tipoImagen === "file" ? inputImagen.files[0]?.name : null,
      imagenTamano: tipoImagen === "file" && inputImagen.files[0]
        ? `${(inputImagen.files[0].size / 1024).toFixed(1)} KB`
        : null,
      tipoImagen: tipoImagen,
      imagen: imagen,


      creadoEn: new Date().toLocaleString('es-CO'),

      esBase64: tipoImagen === "file"
    };

    console.log(JSON.stringify(nuevoProducto));
<<<<<<< HEAD
    // Agregar a el objeto a la lista 
    listaProductos.push(nuevoProducto);
 
    localStorage.setItem("ListaProductos",JSON.stringify(listaProductos));
 
   
   
 
=======


    if (modoEdicion) {

      const index = listaProductos.findIndex(p => p.id === productoEditando.id);

      if (index !== -1) {
        listaProductos[index] = {
          ...productoEditando,
          ...nuevoProducto,
          id: productoEditando.id
        };

        localStorage.setItem("ListaProductos", JSON.stringify(listaProductos));

        mostrarToast(`Producto "${nuevoProducto.nombre}" actualizado`);
      }

      modoEdicion = false;
      productoEditando = null;
      productoOriginal = null;

    } else {

      listaProductos.push(nuevoProducto);

      localStorage.setItem("ListaProductos", JSON.stringify(listaProductos));

      mostrarToast(`Producto "${nuevoProducto.nombre}" agregado`);
    }




>>>>>>> 04907a752b5f4bf84cf7b2ac297bf6e0ff9e7639
    // Mostrar en consola
    console.log(
      ' Producto agregado:',
      nuevoProducto
    );
    imprimirLista();

    /*
       CUANDO SE TENGA LA API — se reemplaza las dos líneas de arriba por:
 
      const fd = new FormData();
      Object.entries(nuevoProducto).forEach(([k, v]) => fd.append(k, v));
      fd.append('imagen', inputImagen.files[0]);
 
      fetch('/api/productos', { method: 'POST', body: fd })
        .then(r => r.json())
        .then(data => {
          console.log(' Guardado en BD:', data);
          // aquí puedes actualizar la tabla de productos en pantalla
        })
        .catch(err => console.error('Error al guardar:', err));
    */

    if (!modoEdicion) {
      mostrarToast(`Producto "${nuevoProducto.nombre}" agregado`);
    }
    limpiarFormulario();




  });

  /* ── Botón Cancelar ───────────────────────────────── */
  document.getElementById('btnCancelar').addEventListener('click', () => {
    if (confirm('¿Deseas cancelar? Los datos ingresados se perderán.')) {
      limpiarFormulario();

    }
  });

  // edicion 
  /* ── DETECTAR MODO EDICIÓN DESDE URL ───────────────── */

  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");

  if (id) {
    const producto = listaProductos.find(p => p.id == id);

    if (producto) {
      modoEdicion = true;
      productoEditando = producto;
      productoOriginal = JSON.stringify(producto);

      cargarFormulario(producto);

      document.querySelector("h1").textContent = "Editar producto";

      const btnSubmit = form.querySelector('button[type="submit"]');
      btnSubmit.textContent = "Actualizar";
      btnSubmit.disabled = true;
    }
  }


  function cargarFormulario(p) {
    inputNombre.value = p.nombre;
    inputCantidad.value = p.cantidad;
    inputPrecio.value = p.precio.toLocaleString("es-CO");
    inputMarca.value = p.marca;
    selectCat.value = p.categoria;
    descTextarea.value = p.descripcion;

    // radio uso
    radiosUso.forEach(r => {
      if (r.value === p.uso) r.checked = true;
    });

    // imagen
    if (p.tipoImagen === "url") {
      inputUrl.value = p.imagen;
    }
    if (p.imagen) {
      previewImg.src = p.imagen;
      previewNombre.textContent = p.imagenNombre || "Imagen guardada";
      previewContainer.classList.remove('d-none');

      dropZone.classList.add('border-success');
    }

    descContador.textContent = `${p.descripcion.length} / 500`;
  }

  function obtenerProductoFormulario() {
    return {
      nombre: inputNombre.value.trim(),
      cantidad: parseInt(inputCantidad.value),
      precio: parseInt(inputPrecio.value.replace(/\./g, '')),
      marca: inputMarca.value,
      categoria: selectCat.value,
      uso: [...radiosUso].find(r => r.checked)?.value,
      descripcion: descTextarea.value.trim(),
      imagen: previewImg.src || null
    };
  }

  function detectarCambios() {
    if (!modoEdicion) return;

    const actual = JSON.stringify({
      ...productoEditando,
      ...obtenerProductoFormulario()
    });

    const btnSubmit = form.querySelector('button[type="submit"]');

    if (actual !== productoOriginal) {
      btnSubmit.disabled = false;
    } else {
      btnSubmit.disabled = true;
    }
  }
  form.addEventListener('input', detectarCambios);
  form.addEventListener('change', detectarCambios);

})();