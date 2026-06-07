// ═══════════════════════════════════════════════════════════════
//  KLYDY CHAT — chat.js
// ═══════════════════════════════════════════════════════════════

const CHAT_API_URL = 'https://ecommerceklydy.onrender.com/api/chat';
const HISTORY_KEY  = 'klydy_chat_history';
const MAX_HISTORY  = 20; // máximo a guardar en localStorage

// ─── ESTADO ────────────────────────────────────────────────────
let historial = [];           // { role: "user"|"assistant", content: "..." }
let listaProductos = [];      // catálogo cargado desde el backend
let chatAbierto = false;

// ─── ELEMENTOS DOM ─────────────────────────────────────────────
const chatFab      = document.getElementById('chatFab');
const chatWindow   = document.getElementById('chatWindow');
const chatMessages = document.getElementById('chatMessages');
const chatTyping   = document.getElementById('chatTyping');
const chatInput    = document.getElementById('chatInput');
const btnSend      = document.getElementById('btnSend');
const btnClear     = document.getElementById('btnClearChat');

// ═══════════════════════════════════════════════════════════════
//  INICIALIZACIÓN
// ═══════════════════════════════════════════════════════════════

document.addEventListener('DOMContentLoaded', () => {
  cargarHistorial();
  cargarProductos();
  renderizarHistorial();
});

// ─── CARGAR CATÁLOGO ────────────────────────────────────────────
async function cargarProductos() {
  try {
    const res = await fetch('https://ecommerceklydy.onrender.com/productos');
    if (res.ok) {
      listaProductos = await res.json();
    }
  } catch (e) {
    console.warn('No se pudo cargar el catálogo en el chat:', e);
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
  chatAbierto = !chatAbierto;
  chatWindow.classList.toggle('chat-window--open', chatAbierto);
  chatFab.classList.toggle('chat-fab--open', chatAbierto);
  chatWindow.setAttribute('aria-hidden', String(!chatAbierto));

  if (chatAbierto) {
    setTimeout(() => chatInput.focus(), 300);
    scrollAbajo();
  }
});

// ─── CERRAR CON ESC ─────────────────────────────────────────────
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && chatAbierto) {
    chatAbierto = false;
    chatWindow.classList.remove('chat-window--open');
    chatFab.classList.remove('chat-fab--open');
    chatWindow.setAttribute('aria-hidden', 'true');
  }
});

// ─── LIMPIAR CONVERSACIÓN ───────────────────────────────────────
btnClear.addEventListener('click', () => {
  if (confirm('¿Deseas limpiar la conversación?')) {
    limpiarHistorial();
  }
});

// ═══════════════════════════════════════════════════════════════
//  RENDERIZADO DE MENSAJES
// ═══════════════════════════════════════════════════════════════

function renderizarHistorial() {
  chatMessages.innerHTML = '';
  if (historial.length === 0) {
    mostrarBienvenida();
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

// ═══════════════════════════════════════════════════════════════
//  ENVÍO DE MENSAJES
// ═══════════════════════════════════════════════════════════════

btnSend.addEventListener('click', enviarMensaje);

chatInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    enviarMensaje();
  }
});

// Auto-resize del textarea
chatInput.addEventListener('input', () => {
  chatInput.style.height = 'auto';
  chatInput.style.height = Math.min(chatInput.scrollHeight, 120) + 'px';
});

async function enviarMensaje() {
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
  }
}

// ═══════════════════════════════════════════════════════════════
//  PARSEO Y EJECUCIÓN DE [[CART_ADD:...]]
// ═══════════════════════════════════════════════════════════════

function procesarCartAdd(texto) {
  const regex = /\[\[CART_ADD:(\{[^}]+\})\]\]/g;
  let match;

  while ((match = regex.exec(texto)) !== null) {
    try {
      const datos = JSON.parse(match[1]);
      const idProducto = String(datos.id);
      const cantidad   = Number(datos.qty) || 1;

      // Buscar el producto en la lista cargada
      const producto = listaProductos.find(p => String(p.id) === idProducto);

      if (!producto) {
        console.warn(`CART_ADD: producto id=${idProducto} no encontrado en catálogo`);
        continue;
      }

      const imagen = producto.urlImagen || producto.imagen || '';
      const nombre = producto.nombre || '';
      const precio = Number(producto.precio) || 0;

      // ── Opción A: si agregarAlcarrito está disponible en el scope global
      if (typeof agregarAlcarrito === 'function') {
        agregarAlcarrito(imagen, nombre, precio, cantidad);
        mostrarToastChat(`✅ ${nombre} agregado al carrito`);
        continue;
      }

      // ── Opción B: escribir directamente en localStorage (widget en página separada)
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