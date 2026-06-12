// ═══════════════════════════════════════════════════════════════
//  KLYDY CHAT — chat.js
// ═══════════════════════════════════════════════════════════════

window.addEventListener('storage', (e) => {
  if (e.key === 'klydy_server_ready' && e.newValue === 'true') {
    servidorListo = true;
    console.log('Servidor marcado como listo en otra pestaña');
  }
});
if (window.klydyChatInicializado) {
  console.warn('Chat ya inicializado, evitando duplicación');
} else {
  window.klydyChatInicializado = true;
  const CHAT_API_URL = 'https://ecommerceklydy.onrender.com/api/chat';
  const HISTORY_KEY = 'klydy_chat_history';
  const MAX_HISTORY = 20; // máximo a guardar en localStorage

  // ─── ESTADO ────────────────────────────────────────────────────
  let historial = [];           // { role: "user"|"assistant", content: "..." }
  let catalogoChat = [];      // catálogo cargado desde el backend
  let servidorListo = localStorage.getItem('klydy_server_ready') === 'true';
  let mensajeCargaElemento = null;
  let chatAbierto = false;
  let wasDragged = false;
  let enviando = false;

  // ─── ELEMENTOS DOM ─────────────────────────────────────────────
  const chatFab = document.getElementById('chatFab');
  const chatWindow = document.getElementById('chatWindow');
  const chatMessages = document.getElementById('chatMessages');
  const chatTyping = document.getElementById('chatTyping');
  const chatInput = document.getElementById('chatInput');

  function agregarBurbujaTemporal(role, texto) {
    const wrapper = document.createElement('div');
    wrapper.classList.add('msg', role === 'assistant' ? 'msg--bot' : 'msg--user');

    const burbuja = document.createElement('div');
    burbuja.classList.add('msg__burbuja');
    burbuja.textContent = texto;

    wrapper.appendChild(burbuja);
    chatMessages.appendChild(wrapper);
    scrollAbajo();

    return burbuja;
  }

  function actualizarBurbuja(elemento, nuevoTexto) {
    if (elemento) {
      elemento.textContent = nuevoTexto;
    }
  }


  // ─── BOTONES DEL HEADER (delegación) ───────────────────────────
  document.addEventListener('click', (e) => {

    if (e.target.closest('#btnSend')) {
      enviarMensaje();
    }

    if (e.target.closest('#btnClearChat')) {
      if (confirm('¿Deseas limpiar la conversación?')) {
        limpiarHistorial();
      }
    }

    if (e.target.closest('#btnCerrarChat')) {
      chatAbierto = false;
      chatWindow.classList.remove('chat-window--open');
      chatFab.classList.remove('chat-fab--open');
      chatWindow.setAttribute('aria-hidden', 'true');
    }

  });


  // ═══════════════════════════════════════════════════════════════
  //  INICIALIZACIÓN
  // ═══════════════════════════════════════════════════════════════

  //  cambiar a — se ejecuta siempre sin importar cuándo carga el script
  (async function iniciar() {
    cargarHistorial();
    await cargarProductos();
    renderizarHistorial();
  })();

  // ─── CARGAR CATÁLOGO ────────────────────────────────────────────
  async function cargarProductos() {
    try {
      if (typeof catalogoChat !== 'undefined' && catalogoChat.length > 0) {
        console.log('Reutilizando catálogo:', catalogoChat.length);
        return;
      }

      console.log('argando productos desde API...');
      const res = await fetch('https://ecommerceklydy.onrender.com/productos');
      console.log(' Status fetch productos:', res.status);

      if (res.ok) {
        const datos = await res.json();
        catalogoChat = datos;
        console.log('Productos cargados:', catalogoChat.length);
        console.log('Primer producto:', catalogoChat[0]);
      } else {
        console.error(' Error fetch productos:', res.status);
      }
    } catch (e) {
      console.error(' Exception cargando catálogo:', e.message);
    }
  }

  async function despertarServidor() {
    try {
      console.log('⏳ Despertando servidor...');

      const res = await fetch('https://ecommerceklydy.onrender.com/productos');

      if (res.ok) {
        servidorListo = true;
        localStorage.setItem('klydy_server_ready', 'true');
        return true;
      }

    } catch (error) {
      console.error('Error despertando servidor:', error);
      return false;
    }
  }

  // ─── HISTORIAL EN localStorage ──────────────────────────────────
  function cargarHistorial() {
    try {
      const datos = localStorage.getItem(HISTORY_KEY);
      historial = datos ? JSON.parse(datos) : [];
    } catch {
      historial = [];
    }
  }

  function guardarHistorial() {
    // Guardar solo los últimos MAX_HISTORY mensajes
    if (historial.length > MAX_HISTORY) {
      historial = historial.slice(historial.length - MAX_HISTORY);
    }
    localStorage.setItem(HISTORY_KEY, JSON.stringify(historial));
  }

  function limpiarHistorial() {
    historial = [];
    localStorage.removeItem(HISTORY_KEY);
    chatMessages.innerHTML = '';
    mostrarBienvenida();
  }


  // ═══════════════════════════════════════════════════════════════
  //  TOGGLE DEL WIDGET
  // ═══════════════════════════════════════════════════════════════

  chatFab.addEventListener('click', () => {
    //  Si hubo drag, no abrir
    if (wasDragged) {
      wasDragged = false;
      return;
    }
    chatAbierto = !chatAbierto;
    chatWindow.classList.toggle('chat-window--open', chatAbierto);
    chatFab.classList.toggle('chat-fab--open', chatAbierto);
    chatWindow.setAttribute('aria-hidden', String(!chatAbierto));

    if (chatAbierto) {
      const right = parseInt(chatFab.style.right) || 16;
      const bottom = parseInt(chatFab.style.bottom) || 70;
      posicionarVentana(right, bottom);
      setTimeout(() => chatInput.focus(), 300);
      scrollAbajo();

      //  SOLO si no hay historial
      if (!servidorListo && historial.length === 0) {

        // Mostrar mensaje temporal
        mensajeCargaElemento = agregarBurbujaTemporal(
          'assistant',
          'Conectando con Klydy, despertando servidor esto puede tardar 1 minuto...'
        );

        // Despertar backend
        despertarServidor().then((ok) => {
          if (ok) {

            actualizarBurbuja();
          } else {
            actualizarBurbuja(
              mensajeCargaElemento,
              '⚠️ El servidor está tardando más de lo normal. Intenta en unos segundos.'
            );
          }
        });

      }
    }
  });




  // ═══════════════════════════════════════════════════════════════
  //  RENDERIZADO DE MENSAJES
  // ═══════════════════════════════════════════════════════════════

  function renderizarHistorial() {
    chatMessages.innerHTML = '';
    if (historial.length === 0) {

      return;
    }
    historial.forEach(msg => agregarBurbuja(msg.role, msg.content, false));
    scrollAbajo();
  }

  function mostrarBienvenida() {
    agregarBurbuja('assistant',
      '¡Hola! Soy Klydy 👋 Tu asistente de Klydy Tech. Cuéntame qué estás buscando y te ayudo a encontrar el producto ideal.',
      false
    );
  }

  function agregarBurbuja(role, texto, animar = true) {
    // Si el texto es solo un CART_ADD, no mostrar burbuja de texto
    const soloCartAdd = /^\s*(\[\[CART_ADD:[^\]]+\]\]\s*)+$/.test(texto);
    if (soloCartAdd) return;

    // Limpiar [[CART_ADD:...]] del texto visible si viene mezclado
    const textoLimpio = texto.replace(/\[\[CART_ADD:[^\]]+\]\]/g, '').trim();
    if (!textoLimpio) return;

    const wrapper = document.createElement('div');
    wrapper.classList.add('msg', role === 'user' ? 'msg--user' : 'msg--bot');
    if (animar) wrapper.classList.add('msg--entrada');

    const burbuja = document.createElement('div');
    burbuja.classList.add('msg__burbuja');
    burbuja.textContent = textoLimpio;

    wrapper.appendChild(burbuja);
    chatMessages.appendChild(wrapper);
    scrollAbajo();
  }



  function scrollAbajo() {
    setTimeout(() => {
      chatMessages.scrollTop = chatMessages.scrollHeight;
    }, 50);
  }


  document.addEventListener('keydown', (e) => {
    if (e.target.id === 'chatInput' && e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      enviarMensaje();
    }
    if (e.key === 'Escape' && chatAbierto) {
      chatAbierto = false;
      chatWindow.classList.remove('chat-window--open');
      chatFab.classList.remove('chat-fab--open');
      chatWindow.setAttribute('aria-hidden', 'true');
    }
  });



  // Auto-resize del textarea
  document.addEventListener('input', (e) => {
    if (e.target.id === 'chatInput') {
      e.target.style.height = 'auto';
      e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
    }
  });

  async function enviarMensaje() {
    if (enviando) return;
    enviando = true;
    const texto = chatInput.value.trim();
    if (!texto) return;

    // Mostrar mensaje del usuario
    agregarBurbuja('user', texto, true);
    historial.push({ role: 'user', content: texto });
    guardarHistorial();

    // Limpiar input
    chatInput.value = '';
    chatInput.style.height = 'auto';
    btnSend.disabled = true;

    // Mostrar indicador de escritura
    chatTyping.style.display = 'flex';
    scrollAbajo();

    try {
      console.log('📤 Enviando a:', CHAT_API_URL);
      console.log('📦 Body:', JSON.stringify({ messages: historial }));
      const res = await fetch(CHAT_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: historial })
      });

      console.log('📥 Status:', res.status);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data = await res.json();
      console.log('📥 Respuesta:', data);
      const reply = data.reply || 'No obtuve respuesta, intenta de nuevo.';

      // Ocultar indicador
      chatTyping.style.display = 'none';

      // Procesar CART_ADD antes de mostrar
      procesarCartAdd(reply);

      // Mostrar respuesta visible
      agregarBurbuja('assistant', reply, true);
      historial.push({ role: 'assistant', content: reply });
      guardarHistorial();

    } catch (err) {
      chatTyping.style.display = 'none';
      console.error('Error en chat:', err);
      console.error('❌ Tipo:', err.constructor.name);
      console.error('❌ Mensaje:', err.message);
      const fallback = 'En este momento tengo mucha demanda, intenta de nuevo en un momento 😊';
      agregarBurbuja('assistant', fallback, true);
      historial.push({ role: 'assistant', content: fallback });
      guardarHistorial();
    } finally {
      btnSend.disabled = false;
      chatInput.focus();
      enviando = false;
    }
  }

  // ═══════════════════════════════════════════════════════════════
  //  PARSEO Y EJECUCIÓN DE [[CART_ADD:...]]
  // ═══════════════════════════════════════════════════════════════

  function procesarCartAdd(texto) {
    const regex = /\[\[CART_ADD:(\{[^}]+\})\]\]/g;
    let match;
    console.log(' listaProductos.length:', catalogoChat.length);


    while ((match = regex.exec(texto)) !== null) {
      try {
        const datos = JSON.parse(match[1]);
        console.log('CART_ADD datos:', datos);
        const idProducto = String(datos.id);
        const cantidad = Number(datos.qty) || 1;

        // Buscar el producto en la lista cargada
        const producto = catalogoChat.find(p => String(p.id) === idProducto);

        if (!producto) {
          console.warn(`CART_ADD: producto id=${idProducto} no encontrado en catálogo`);
          continue;
        }

        const imagen = producto.urlImagen || producto.imagen || '';
        const nombre = producto.nombre || '';
        const precio = Number(producto.precio) || 0;



        // escribir directamente en localStorage (widget en página separada)
        agregarAlCarritoLocalStorage(imagen, nombre, precio, cantidad);
        mostrarToastChat(`✅ ${nombre} agregado al carrito`);

      } catch (err) {
        console.error('Error parseando CART_ADD:', err, match[1]);
      }
    }
  }

  // ─── ESCRITURA DIRECTA EN localStorage (fallback) ───────────────
  function agregarAlCarritoLocalStorage(imagen, nombre, precio, cantidad) {
    try {
      let carrito = [];
      const datos = localStorage.getItem('carrito');
      if (datos) carrito = JSON.parse(datos);

      const existente = carrito.find(p => p.nombre === nombre);

      if (existente) {
        existente.cantidad += cantidad;
      } else {
        carrito.push({ imagen, nombre, precio, cantidad });
      }

      localStorage.setItem('carrito', JSON.stringify(carrito));
      // Notificar a la página que el carrito cambió
      window.dispatchEvent(new CustomEvent('carritoActualizado', {
        detail: { imagen, nombre, precio, cantidad }
      }));
    } catch (err) {
      console.error('Error escribiendo carrito en localStorage:', err);
    }
  }

  // ═══════════════════════════════════════════════════════════════
  //  TOAST INTERNO DEL CHAT
  // ═══════════════════════════════════════════════════════════════

  function mostrarToastChat(mensaje) {
    // Intentar usar el toast global si existe
    if (typeof mostrarToast === 'function') {
      mostrarToast(mensaje);
      return;
    }

    // Toast propio del chat
    let toast = document.getElementById('klydyChatToast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'klydyChatToast';
      toast.style.cssText = `
      position: fixed;
      bottom: 100px;
      right: 24px;
      background: #1a1a2e;
      color: #fff;
      padding: 10px 18px;
      border-radius: 8px;
      font-size: 13px;
      font-family: inherit;
      z-index: 99999;
      opacity: 0;
      transition: opacity 0.3s ease;
      pointer-events: none;
    `;
      document.body.appendChild(toast);
    }

    toast.textContent = mensaje;
    toast.style.opacity = '1';
    setTimeout(() => { toast.style.opacity = '0'; }, 3000);
  }

  function posicionarVentana(fabRight, fabBottom) {
    const fabSize = chatFab.offsetWidth;
    const winRect = chatWindow.getBoundingClientRect();
    const winH = winRect.height || 480;
    const winW = winRect.width || 360;

    const MARGEN = 8;
    const esMobil = window.innerWidth <= 980;
    if (esMobil) return; // en móvil el CSS lo maneja con top/bottom fijos

    // Espacio disponible arriba y abajo del FAB
    const espacioArriba = window.innerHeight - fabBottom - fabSize - MARGEN;
    const espacioAbajo = window.innerHeight - (window.innerHeight - fabBottom) - fabSize - MARGEN;

    // Right: que no se salga por la izquierda
    const safeRight = Math.min(fabRight, window.innerWidth - winW - MARGEN);

    chatWindow.style.right = Math.max(MARGEN, safeRight) + 'px';
    chatWindow.style.left = 'auto';

    if (espacioArriba >= winH) {
      // Hay espacio arriba → normal
      chatWindow.style.bottom = (fabBottom + fabSize + MARGEN) + 'px';
      chatWindow.style.top = 'auto';
    } else if (espacioAbajo >= winH) {
      // No hay arriba pero hay abajo → abrir hacia abajo
      const fabTopPx = window.innerHeight - fabBottom - fabSize;
      chatWindow.style.top = (fabTopPx + fabSize + MARGEN) + 'px';
      chatWindow.style.bottom = 'auto';
    } else {
      // No cabe ni arriba ni abajo → centrar verticalmente en pantalla
      const topCentrado = Math.max(MARGEN, (window.innerHeight - winH) / 2);
      chatWindow.style.top = topCentrado + 'px';
      chatWindow.style.bottom = 'auto';
    }
  }
  // ═══════════════════════════════════════════════════════════════
  //  DRAG DEL FAB
  // ═══════════════════════════════════════════════════════════════

  (function makeDraggable() {
    const fab = document.getElementById('chatFab');
    let isDragging = false;

    let holdTimer = null;
    let startX, startY, startRight, startBottom;

    fab.addEventListener('pointerdown', (e) => {
      wasDragged = false;
      startX = e.clientX;
      startY = e.clientY;

      const rect = fab.getBoundingClientRect();
      startRight = window.innerWidth - rect.right;
      startBottom = window.innerHeight - rect.bottom;

      // Solo inicia drag después de 200ms presionando
      holdTimer = setTimeout(() => {
        isDragging = true;
        fab.setPointerCapture(e.pointerId);
        fab.style.transition = 'none';
        fab.style.cursor = 'grabbing';
      }, 200);
    });

    fab.addEventListener('pointermove', (e) => {
      if (!isDragging) return;
      wasDragged = true;

      const size = fab.offsetWidth;
      const esMobil = window.innerWidth <= 980;
      const NAV_TOP = esMobil ? 66 : 8;
      const NAV_BOTTOM = esMobil ? 70 : 8;

      let newRight = startRight - (e.clientX - startX);
      let newBottom = startBottom - (e.clientY - startY);

      newRight = Math.max(8, Math.min(newRight, window.innerWidth - size - 8));
      newBottom = Math.max(NAV_BOTTOM + 8, Math.min(newBottom, window.innerHeight - size - NAV_TOP - 8));

      //  Primero mover el FAB
      fab.style.right = newRight + 'px';
      fab.style.bottom = newBottom + 'px';

      // Luego posicionar la ventana relativa al FAB ya actualizado
      posicionarVentana(newRight, newBottom);
    });

    fab.addEventListener('pointerup', (e) => {
      clearTimeout(holdTimer);
      fab.style.transition = '';
      fab.style.cursor = '';

      if (isDragging) {
        // era drag — cancelar el click que viene después
        isDragging = false;
        e.preventDefault();
        e.stopImmediatePropagation();

        // Bloquear el siguiente click por 300ms
        fab.style.pointerEvents = 'none';
        setTimeout(() => {
          fab.style.pointerEvents = '';
        }, 300);
        return;
      }

      isDragging = false;
    });



    fab.addEventListener('pointercancel', () => {
      clearTimeout(holdTimer);
      isDragging = false;
      fab.style.transition = '';
      fab.style.cursor = '';
    });

    // ─── DRAG DE LA VENTANA ──────────────────────────────────────
    const win = document.getElementById('chatWindow');
    const header = win.querySelector('.chat-header');
    let isDraggingWin = false;
    let winStartX, winStartY, winStartRight, winStartBottom;

    header.style.cursor = 'grab';

    header.addEventListener('pointerdown', (e) => {
      if (!e.target.closest('.chat-header')) return;
      if (e.target.closest('.chat-header__actions')) return;
      isDraggingWin = true;
      winStartX = e.clientX;
      winStartY = e.clientY;

      const rect = win.getBoundingClientRect();
      winStartRight = window.innerWidth - rect.right;
      winStartBottom = window.innerHeight - rect.bottom;

      header.setPointerCapture(e.pointerId);
      win.style.transition = 'none';
      header.style.cursor = 'grabbing';
    });

    header.addEventListener('pointermove', (e) => {
      if (!isDraggingWin) return;

      const esMobil = window.innerWidth <= 980;
      if (esMobil) return;

      let newRight = winStartRight - (e.clientX - winStartX);
      let newBottom = winStartBottom - (e.clientY - winStartY);

      //  Usar getBoundingClientRect() en lugar de offsetHeight
      const winRect = win.getBoundingClientRect();
      const winW = winRect.width;
      const winH = winRect.height;

      // El límite superior: newBottom máximo = altura_pantalla - altura_ventana - margen
      const maxBottom = window.innerHeight - winH - 8;

      newRight = Math.max(8, Math.min(newRight, window.innerWidth - winW - 8));
      newBottom = Math.max(8, Math.min(newBottom, maxBottom));

      win.style.right = newRight + 'px';
      win.style.bottom = newBottom + 'px';

      // fab sigue a la ventana
      const fabSize = fab.offsetWidth;
      fab.style.right = newRight + 'px';
      fab.style.bottom = (newBottom - fabSize - 8) + 'px';
    });

    header.addEventListener('pointerup', () => {
      isDraggingWin = false;
      win.style.transition = '';
      header.style.cursor = 'grab';
    });

    header.addEventListener('pointercancel', () => {
      isDraggingWin = false;
      win.style.transition = '';
      header.style.cursor = 'grab';
    });



  })();
}