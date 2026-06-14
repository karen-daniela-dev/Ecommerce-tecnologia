// ═══════════════════════════════════════════════════════════════
//  KLYDY CHAT — chat.js
// ═══════════════════════════════════════════════════════════════

if (window.klydyChatInicializado) {
  console.warn('Chat ya inicializado');
} else {
  window.klydyChatInicializado = true;

  // ─── CONFIGURACIÓN ─────────────────────────────────────────────
  const CHAT_API_URL = 'https://ecommerceklydy.onrender.com/api/chat';
  const HISTORY_KEY = 'klydy_chat_history';
  const MAX_HISTORY = 20;

  // ─── ESTADO ────────────────────────────────────────────────────
  let historial = [];
  let catalogoChat = [];
  let mensajeCargaElemento = null;
  let chatAbierto = false;
  let wasDragged = false;
  let enviando = false;
  let servidorListo = false;
  let despertando = false;

  // ─── ELEMENTOS DOM ─────────────────────────────────────────────
  const chatFab = document.getElementById('chatFab');
  const chatWindow = document.getElementById('chatWindow');
  const chatMessages = document.getElementById('chatMessages');
  const chatTyping = document.getElementById('chatTyping');
  const chatInput = document.getElementById('chatInput');
  const btnSend = document.getElementById('btnSend');

  // ─── FUNCIONES AUXILIARES ──────────────────────────────────────
  function scrollAbajo() {
    setTimeout(() => {
      chatMessages.scrollTop = chatMessages.scrollHeight;
    }, 50);
  }

  function agregarBurbuja(role, texto, animar = true) {
    if (!texto || typeof texto !== 'string') return;

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

  function mostrarBienvenida() {
    // Solo mostrar si no hay mensajes en el chat
    if (chatMessages.children.length === 0) {
      agregarBurbuja('assistant', '¡Hola! Soy Klydy 👋 Tu asistente de Klydy Tech. Cuéntame qué estás buscando y te ayudo a encontrar el producto ideal.');
    }
  }
  function mostrarMensajeConexion() {
    const msg = agregarBurbuja('assistant', 'Conectando con el servidor... ⏳', false);
    return msg;
  }

  // ─── SERVIDOR ──────────────────────────────────────────────────


  async function asegurarServidor() {
    if (servidorListo || despertando) return;

    despertando = true;
    if (btnSend) btnSend.disabled = true;
    chatInput.disabled = true;

    const chatLoading = document.getElementById('chatLoading');

    // Mostrar loader
    if (chatLoading) chatLoading.style.display = 'block';

    try {
      const res = await fetch('https://ecommerceklydy.onrender.com/productos', {
        method: 'GET',
        cache: 'no-cache'
      });

      servidorListo = res.ok;

      if (servidorListo) {
        localStorage.setItem('klydy_server_ready', 'true');
        localStorage.setItem('klydy_server_ready_time', Date.now().toString()); 
      }
    } catch (error) {
      console.error('Error despertando servidor:', error);
    } finally {
      // Ocultar loader
      if (chatLoading) chatLoading.style.display = 'none';

      despertando = false;
      if (btnSend) btnSend.disabled = false;
      chatInput.disabled = false;
      chatInput.focus();
    }
  }

  // ─── CATÁLOGO ──────────────────────────────────────────────────
  async function cargarProductos() {
    if (catalogoChat.length > 0) return;

    try {
      const res = await fetch('https://ecommerceklydy.onrender.com/productos');
      if (res.ok) {
        catalogoChat = await res.json();
        console.log(`Catálogo cargado: ${catalogoChat.length} productos`);
      }
    } catch (e) {
      console.error('Error cargando catálogo:', e);
    }
  }

  // ─── HISTORIAL ─────────────────────────────────────────────────
  function cargarHistorial() {
    try {
      const datos = localStorage.getItem(HISTORY_KEY);
      historial = datos ? JSON.parse(datos) : [];
    } catch {
      historial = [];
    }
  }

  function guardarHistorial() {
    if (historial.length > MAX_HISTORY) {
      historial = historial.slice(-MAX_HISTORY);
    }
    localStorage.setItem(HISTORY_KEY, JSON.stringify(historial));
  }

  function limpiarHistorial() {
    historial = [];
    localStorage.removeItem(HISTORY_KEY);
    chatMessages.innerHTML = '';
    mostrarBienvenida();
  }

  function renderizarHistorial() {
    chatMessages.innerHTML = '';

    if (historial.length === 0) {
      mostrarBienvenida();
      return;
    }

    historial.forEach(msg => agregarBurbuja(msg.role, msg.content, false));
    scrollAbajo();
  }

  // ─── PROCESAR CART_ADD ─────────────────────────────────────────
  function procesarCartAdd(texto) {
    const regex = /\[\[CART_ADD:(\{[^}]+\})\]\]/g;
    let match;

    while ((match = regex.exec(texto)) !== null) {
      try {
        const datos = JSON.parse(match[1]);
        const idProducto = String(datos.id);
        const cantidad = Number(datos.qty) || 1;

        const producto = catalogoChat.find(p => String(p.id) === idProducto);
        if (!producto) {
          console.warn(`Producto id=${idProducto} no encontrado`);
          continue;
        }

        const imagen = producto.urlImagen || producto.imagen || '';
        const nombre = producto.nombre || '';
        const precio = Number(producto.precio) || 0;

        agregarAlCarritoLocalStorage(imagen, nombre, precio, cantidad);
        mostrarToastChat(`${nombre} agregado al carrito`);
      } catch (err) {
        console.error('Error procesando CART_ADD:', err);
      }
    }
  }

  function agregarAlCarritoLocalStorage(imagen, nombre, precio, cantidad) {
    try {
      let carrito = JSON.parse(localStorage.getItem('carrito') || '[]');

      const existente = carrito.find(p => p.nombre === nombre);
      if (existente) {
        existente.cantidad += cantidad;
      } else {
        carrito.push({ imagen, nombre, precio, cantidad });
      }

      localStorage.setItem('carrito', JSON.stringify(carrito));

      window.dispatchEvent(new CustomEvent('carritoActualizado', {
        detail: { imagen, nombre, precio, cantidad }
      }));
    } catch (err) {
      console.error('Error actualizando carrito:', err);
    }
  }

  function mostrarToastChat(mensaje) {
    if (typeof mostrarToast === 'function') return mostrarToast(mensaje);

    let toast = document.getElementById('klydyChatToast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'klydyChatToast';
      toast.style.cssText = `position:fixed;bottom:100px;right:24px;background:#1a1a2e;color:#fff;padding:12px 20px;border-radius:8px;font-size:14px;z-index:99999;opacity:0;transition:opacity 0.3s;`;
      document.body.appendChild(toast);
    }
    toast.textContent = mensaje;
    toast.style.opacity = '1';
    setTimeout(() => toast.style.opacity = '0', 3000);
  }

  // ─── ENVIAR MENSAJE ────────────────────────────────────────────
  async function enviarMensaje() {
    if (enviando || despertando || !chatInput.value.trim()) return;

    enviando = true;
    const texto = chatInput.value.trim();

    agregarBurbuja('user', texto);
    historial.push({ role: 'user', content: texto });
    guardarHistorial();

    chatInput.value = '';
    chatInput.style.height = 'auto';
    if (btnSend) btnSend.disabled = true;

    chatTyping.style.display = 'flex';
    scrollAbajo();

    try {
      const res = await fetch(CHAT_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: historial })
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data = await res.json();
      const reply = data.reply || 'Lo siento, no pude procesar tu mensaje.';

      chatTyping.style.display = 'none';
      procesarCartAdd(reply);
      agregarBurbuja('assistant', reply);
      historial.push({ role: 'assistant', content: reply });
      guardarHistorial();

    } catch (err) {
      chatTyping.style.display = 'none';
      agregarBurbuja('assistant', 'En este momento tengo mucha demanda, intenta de nuevo 😊');
    } finally {
      if (btnSend) btnSend.disabled = false;
      chatInput.focus();
      enviando = false;
    }
  }

  // ─── EVENTOS ───────────────────────────────────────────────────
  document.addEventListener('click', (e) => {
    if (e.target.closest('#btnSend')) enviarMensaje();
    if (e.target.closest('#btnClearChat')) {
      if (confirm('¿Deseas limpiar la conversación?')) limpiarHistorial();
    }
    if (e.target.closest('#btnCerrarChat')) {
      chatAbierto = false;
      chatWindow.classList.remove('chat-window--open');
      chatFab.classList.remove('chat-fab--open');
      chatWindow.setAttribute('aria-hidden', 'true');
    }
  });



  chatFab.addEventListener('click', async () => {
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

      if (chatMessages.children.length === 0) {
        mostrarBienvenida();
      }


      if (!servidorListo && !despertando) {
        await asegurarServidor();
      }
    }
  });



  // Keyboard 
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

  // ─── POSICIONAMIENTO DE VENTANA ───────────────────────────────
  function posicionarVentana(fabRight, fabBottom) {
    const fabSize = chatFab.offsetWidth;
    const winRect = chatWindow.getBoundingClientRect();
    const winH = winRect.height || 480;
    const winW = winRect.width || 360;

    const MARGEN = 8;
    const esMobil = window.innerWidth <= 980;
    if (esMobil) return;

    const safeRight = Math.min(fabRight, window.innerWidth - winW - MARGEN);

    chatWindow.style.right = Math.max(MARGEN, safeRight) + 'px';
    chatWindow.style.left = 'auto';

    const espacioArriba = window.innerHeight - fabBottom - fabSize - MARGEN;

    if (espacioArriba >= winH) {
      chatWindow.style.bottom = (fabBottom + fabSize + MARGEN) + 'px';
      chatWindow.style.top = 'auto';
    } else {
      const topCentrado = Math.max(MARGEN, (window.innerHeight - winH) / 2);
      chatWindow.style.top = topCentrado + 'px';
      chatWindow.style.bottom = 'auto';
    }
  }

  // ─── DRAG & DROP (FAB + VENTANA) ───────────────────────────────
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

      fab.style.right = newRight + 'px';
      fab.style.bottom = newBottom + 'px';

      posicionarVentana(newRight, newBottom);
    });

    fab.addEventListener('pointerup', (e) => {
      clearTimeout(holdTimer);
      fab.style.transition = '';
      fab.style.cursor = '';

      if (isDragging) {
        isDragging = false;
        e.preventDefault();
        e.stopImmediatePropagation();

        fab.style.pointerEvents = 'none';
        setTimeout(() => fab.style.pointerEvents = '', 300);
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

    // Drag de la ventana
    const win = document.getElementById('chatWindow');
    const header = win.querySelector('.chat-header');
    let isDraggingWin = false;
    let winStartX, winStartY, winStartRight, winStartBottom;

    if (header) {
      header.style.cursor = 'grab';

      header.addEventListener('pointerdown', (e) => {
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

        const winRect = win.getBoundingClientRect();
        const winW = winRect.width;
        const winH = winRect.height;

        const maxBottom = window.innerHeight - winH - 8;

        newRight = Math.max(8, Math.min(newRight, window.innerWidth - winW - 8));
        newBottom = Math.max(8, Math.min(newBottom, maxBottom));

        win.style.right = newRight + 'px';
        win.style.bottom = newBottom + 'px';

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
    }
  })();

  // ─── INICIALIZACIÓN ────────────────────────────────────────────
  (async function iniciar() {
    cargarHistorial();
    await cargarProductos();
    renderizarHistorial();
    // Verificar si el flag sigue siendo válido (menos de 10 minutos)
  const serverReadyTime = localStorage.getItem('klydy_server_ready_time');
  if (serverReadyTime) {
    const minutosPasados = (Date.now() - parseInt(serverReadyTime)) / 60000;
    if (minutosPasados < 10) {
      servidorListo = true;
    } else {
      localStorage.removeItem('klydy_server_ready');
      localStorage.removeItem('klydy_server_ready_time');
    }
  }

    
  })();
}