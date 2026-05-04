(() => {
  'use strict';
 
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
  const inputImagen = document.getElementById('imagenProducto');
  const previewContainer = document.getElementById('previewContainer');
  const previewImg = document.getElementById('previewImg');
  const previewNombre = document.getElementById('previewNombre');
  const previewTamano = document.getElementById('previewTamano');
  const btnQuitarImagen = document.getElementById('btnQuitarImagen');
  const imagenError = document.getElementById('imagenError');
 
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
 
  function limpiarEstado(input) {
    input.classList.remove('is-invalid', 'is-valid');
  }
  function limpiarFormulario() {
    form.reset();
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
  function validarPrecio() {
    const raw = inputPrecio.value.replace(/\./g, '');
    if (!raw) {
      inputPrecio.classList.add('is-invalid');
      inputPrecio.classList.remove('is-valid');
      precioError.textContent = 'El precio es obligatorio.';
      precioError.style.display = 'block';
      return false;
    }
    if (isNaN(raw) || parseInt(raw) <= 0) {
      inputPrecio.classList.add('is-invalid');
      inputPrecio.classList.remove('is-valid');
      precioError.textContent = 'Ingresa un precio válido mayor a 0.';
      precioError.style.display = 'block';
      return false;
    }
    inputPrecio.classList.remove('is-invalid');
    inputPrecio.classList.add('is-valid');
    precioError.style.display = 'none';
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
    if (!inputImagen.files || inputImagen.files.length === 0) {
      imagenError.textContent = 'Debes subir una imagen del producto.';
      imagenError.style.display = 'block';
      dropZone.classList.add('border-danger');
      dropZone.classList.remove('border-success');
      return false;
    }
    imagenError.style.display = 'none';
    dropZone.classList.remove('border-danger');
    dropZone.classList.add('border-success');
    return true;
  }
 
  /* ── Validación en tiempo real (blur) ─────────────── */
  inputNombre.addEventListener('blur', () => {
    inputNombre.value.trim()
      ? mostrarValido(inputNombre)
      : mostrarError(inputNombre, 'El nombre es obligatorio (máx. 100 caracteres).');
  });
 
  inputCantidad.addEventListener('blur', () => {
    const v = inputCantidad.value;
    if (v === '' || parseInt(v) < 0 || !Number.isInteger(Number(v))) {
      mostrarError(inputCantidad, 'Ingresa una cantidad válida (número entero ≥ 0).');
    } else {
      mostrarValido(inputCantidad);
    }
  });
 
  inputPrecio.addEventListener('blur', validarPrecio);
 
  inputMarca.addEventListener('blur', () => {
    inputMarca.value.trim()
      ? mostrarValido(inputMarca)
      : mostrarError(inputMarca, 'La marca es obligatoria (máx. 60 caracteres).');
  });
 
  selectCat.addEventListener('change', () => {
    selectCat.value
      ? mostrarValido(selectCat)
      : mostrarError(selectCat, 'Selecciona una categoría.');
  });
 
  radiosUso.forEach(r => r.addEventListener('change', validarUso));
 
  descTextarea.addEventListener('blur', () => {
  descTextarea.value.trim()
    ? mostrarValido(descTextarea)
    : mostrarError(descTextarea, 'La descripción es obligatoria (máx. 500 caracteres).');
});
 
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
    if (inputImagen.files.length) procesarImagen(inputImagen.files[0]);
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
      previewTamano.textContent = `${(file.size / 1024).toFixed(1)} KB`;
      previewContainer.classList.remove('d-none');
    };
    reader.readAsDataURL(file);
  }
 
  // Botón quitar imagen
  btnQuitarImagen.addEventListener('click', () => {
    inputImagen.value = '';           // Limpia el input file
    previewImg.src = '';
    previewContainer.classList.add('d-none');
    dropZone.classList.remove('border-success', 'border-danger');
    imagenError.style.display = 'none';
  });
 
  /* ── Lista temporal de productos (vive en memoria mientras la página esté abierta)
       INTEGRACIÓN FUTURA: este array desaparece. En su lugar se hara un
       fetch GET /api/productos para traer la lista desde la BD.
  ─────────────────────────────────────────────────────────────────────────── */
  const listaProductos = [];
 
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
    const precioOk = validarPrecio();
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
 
    let imagen = await inputABase64(inputImagen);
 
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
      imagenNombre: inputImagen.files[0]?.name ?? null,
      imagenTamano: inputImagen.files[0]
        ? `${(inputImagen.files[0].size / 1024).toFixed(1)} KB`
        : null,
      creadoEn: new Date().toLocaleString('es-CO'),
      imagen: imagen,
      esBase64: true
    };
 
    console.log(JSON.stringify(nuevoProducto));
    // Agregar a el objeto a la lista 
    listaProductos.push(nuevoProducto);
 
    localStorage.setItem("ListaProductos",JSON.stringify(listaProductos));
 
   
   
 
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
 
    alert(`Producto "${nuevoProducto.nombre}" agregado.`);
 
    limpiarFormulario();
 
 
  });
 
  /* ── Botón Cancelar ───────────────────────────────── */
  document.getElementById('btnCancelar').addEventListener('click', () => {
    if (confirm('¿Deseas cancelar? Los datos ingresados se perderán.')) {
      limpiarFormulario();
     
    }
  });
 
})();