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



  /* ── Mapeos hacia los enums del back ──────────────────── */
  const mapCategoria = {
    laptops: 'LAPTOPS',
    smartwatches: 'SMARTWATCHES',
    mouses: 'MOUSES',
    audio: 'AUDIO',
    teclados: 'TECLADOS',
    tarjetas: 'TARJETAS_GRAFICAS',
    accesorios: 'ACCESORIOS'
  };

  const mapMarca = {
    Samsung: 'SAMSUNG',
    Acer: 'ACER',
    Apple: 'APPLE',
    Asus: 'ASUS',
    Dell: 'DELL',
    HP: 'HP',
    Lenovo: 'LENOVO',
    MSI: 'MSI',
    Otras: 'OTRAS'
  };

  const mapUso = {
    trabajo: 'TRABAJO',
    estudio: 'ESTUDIO',
    gamer: 'GAMER',
    general: 'GENERAL'
  };

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

  form.classList.add('was-validated');

  const precioOk  = validarPrecio(true);
  const usoOk     = validarUso();
  const imagenOk  = validarImagen();
  const formNativoOk = form.checkValidity();

  if (!formNativoOk || !precioOk || !usoOk || !imagenOk) {
    const primerError = form.querySelector('.is-invalid, [style*="display: block"]');
    if (primerError) primerError.scrollIntoView({ behavior: 'smooth', block: 'center' });
    return;
  }

  const btnSubmit = form.querySelector('button[type="submit"]');
  btnSubmit.disabled = true;
  btnSubmit.textContent = 'Guardando...';

  const urlImagen = inputUrl.value.trim();
  const usoSeleccionado = [...radiosUso].find(r => r.checked)?.value;

  const payload = {
    nombre:     inputNombre.value.trim(),
    stock:      parseInt(inputCantidad.value),
    precio:     parseInt(inputPrecio.value.replace(/\./g, '')),
    marca:      mapMarca[inputMarca.value],
    categoria:  mapCategoria[selectCat.value],
    uso:        mapUso[usoSeleccionado],
    descripcion: descTextarea.value.trim(),
    urlImagen:  urlImagen || null
  };

  try {
    const res = await fetch('https://ecommerceklydy.onrender.com/productos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const error = await res.json().catch(() => null);
      console.error('Error del servidor:', error);
      mostrarToast(`Error al crear el producto (${res.status})`);
      return;
    }

    const productoCreado = await res.json();
    console.log('Producto creado en BD:', productoCreado);
    mostrarToast(`Producto "${productoCreado.nombre}" creado`);
    limpiarFormulario();

  } catch (err) {
    console.error('Error de red:', err);
    mostrarToast('No se pudo conectar con el servidor. Intenta de nuevo.');
  } finally {
    btnSubmit.disabled = false;
    btnSubmit.textContent = modoEdicion ? 'Actualizar' : 'Crear';
  }
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