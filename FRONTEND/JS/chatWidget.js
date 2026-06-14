// ═══════════════════════════════════════════════════════════════
//  KLYDY CHAT WIDGET — chatWidget.js
//  Inyecta el widget en cualquier página con solo cargar este archivo
// ═══════════════════════════════════════════════════════════════

(function () {
  // ─── RUTA BASE (ajusta si mueves los archivos) ───────────────
  const BASE =
    document.currentScript && document.currentScript.src
      ? document.currentScript.src.replace(/chatWidget\.js.*$/, "")
      : "./";

  // ─── INYECTAR CSS ────────────────────────────────────────────
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = BASE + "../CSS/chat.css";
  document.head.appendChild(link);

  // ─── INYECTAR HTML ───────────────────────────────────────────
  const html = `
    <button class="chat-fab" id="chatFab" aria-label="Abrir asistente Klydy">
      
      <svg class="fab-icon fab-icon--close" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <line x1="18" y1="6" x2="6" y2="18"/>
        <line x1="6" y1="6" x2="18" y2="18"/>
      </svg>
      <span class="chat-fab__badge" id="fabBadge" style="display:none"></span>
    </button>

    <div class="chat-window" id="chatWindow" aria-hidden="true">
      <div class="chat-header">
        <div class="chat-header__avatar"><span>K</span></div>
        <div class="chat-header__info">
          <p class="chat-header__name">Klydy</p>
          <p class="chat-header__status"><span class="status-dot"></span>En línea</p>
        </div>

<div class="chat-header__actions">
  <button class="btn-icon" id="btnClearChat" title="Limpiar conversación">
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <polyline points="3 6 5 6 21 6"/>
      <path d="M19 6l-1 14H6L5 6"/>
      <path d="M10 11v6M14 11v6"/>
      <path d="M9 6V4h6v2"/>
    </svg>
  </button>

  <!--  Botón cerrar -->
  <button class="btn-icon" id="btnCerrarChat" title="Cerrar chat">
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <line x1="18" y1="6" x2="6" y2="18"/>
      <line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  </button>
</div>

      </div>
      <div class="chat-messages" id="chatMessages">
      <!-- Loader para cuando el servidor despierta -->
        <div id="chatLoading" class="text-center" style="display: none; padding: 40px 20px; color: #aaa;">
  <div class="spinner-border text-primary" role="status" style="width: 2.5rem; height: 2.5rem;">
    <span class="visually-hidden">Cargando...</span>
  </div>
  <p style="margin-top: 15px; font-weight: 500; font-size: 15px;">
    El servidor está despertando (Deploy plan free).<br>
    Esto puede tomar hasta 50 segundos.<br>
    <strong>No te vayas</strong> ⏳
  </p>
</div>
      </div>
      <div class="chat-typing" id="chatTyping" style="display:none">
        <div class="typing-bubble"><span></span><span></span><span></span></div>
        <p>Klydy está escribiendo…</p>
      </div>
      <div class="chat-input-area">
        <textarea id="chatInput" class="chat-input" placeholder="Escríbeme algo…" rows="1" maxlength="500"></textarea>
        <button class="btn-send" id="btnSend">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="22" y1="2" x2="11" y2="13"/>
            <polygon points="22 2 15 22 11 13 2 9 22 2"/>
          </svg>
        </button>
      </div>
    </div>
  `;

  const container = document.createElement("div");
  container.innerHTML = html;
  document.body.appendChild(container);

  // ─── CARGAR chat.js DESPUÉS DE INYECTAR EL HTML ──────────────
  const script = document.createElement("script");
  script.src = BASE + "chat.js";
  document.body.appendChild(script);
})();
