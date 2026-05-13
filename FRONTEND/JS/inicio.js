// ── Carrusel 3D Categorías ──────────────────────────────────
(function () {
    const cats = [
        {
            num: '01', name: 'Laptops', tag: 'Alto Rendimiento', color: '#00f0c8', href: '/categoria/laptops',
            icon: `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4">
        <rect x="2" y="4" width="20" height="13" rx="2"/>
        <path d="M0 21h24"/>
      </svg>` },

        {
            num: '02', name: 'Mouse', tag: 'Alta Precisión', color: '#bc4fe8', href: '/categoria/mouse',
            icon: `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4">
        <path d="M12 2a5 5 0 0 1 5 5v6a5 5 0 0 1-10 0V7a5 5 0 0 1 5-5z"/>
        <line x1="12" y1="2" x2="12" y2="8"/>
        <path d="M8.5 14.5c.5 1.5 1.9 2.5 3.5 2.5s3-.9 3.5-2.5"/>
      </svg>` },

        {
            num: '03', name: 'Tarjetas Gráficas', tag: 'Visual Power', color: '#ff3cac', href: '/categoria/tarjetas-graficas',
            icon: `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4">
        <rect x="1" y="6" width="22" height="12" rx="2"/>
        <path d="M6 6V4M9 6V4M12 6V4M15 6V4M18 6V4"/>
        <path d="M6 18v2M9 18v2M12 18v2M15 18v2M18 18v2"/>
        <path d="M1 10h3M20 10h3M1 14h3M20 14h3"/>
      </svg>` },

        {
            num: '04', name: 'Teclados', tag: 'Mecánicos & RGB', color: '#0abde3', href: '/categoria/teclados',
            icon: `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4">
        <rect x="1" y="7" width="22" height="11" rx="2"/>
        <circle cx="5" cy="11" r=".6" fill="currentColor"/>
        <circle cx="8" cy="11" r=".6" fill="currentColor"/>
        <circle cx="11" cy="11" r=".6" fill="currentColor"/>
        <circle cx="14" cy="11" r=".6" fill="currentColor"/>
        <circle cx="17" cy="11" r=".6" fill="currentColor"/>
        <circle cx="5" cy="14" r=".6" fill="currentColor"/>
        <circle cx="8" cy="14" r=".6" fill="currentColor"/>
        <circle cx="11" cy="14" r=".6" fill="currentColor"/>
        <circle cx="14" cy="14" r=".6" fill="currentColor"/>
        <rect x="17" y="12.5" width="3" height="3" rx=".5"/>
      </svg>` },

        {
            num: '05', name: 'Audio', tag: 'Audio Inmersivo', color: '#00f0c8', href: '/categoria/audio',
            icon: `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4">
        <path d="M3 17v-5a9 9 0 0 1 18 0v5"/>
        <path d="M21 18a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3z"/>
        <path d="M3 18a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/>
      </svg>` },

        {
            num: '06', name: 'Relojes Inteligentes', tag: 'Smartwatch', color: '#bc4fe8', href: '/categoria/relojes-inteligentes',
            icon: `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4">
        <rect x="6" y="2" width="12" height="20" rx="3"/>
        <path d="M6 7h12M6 17h12"/>
        <circle cx="12" cy="12" r="2"/>
        <path d="M9 2V1M15 2V1M9 22v1M15 22v1"/>
      </svg>` },

        {
            num: '07', name: 'Accesorios', tag: 'Complementos', color: '#ff3cac', href: '/categoria/accesorios',
            icon: `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4">
        <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
        <circle cx="7" cy="7" r="1.5" fill="currentColor" stroke="none"/>
      </svg>` },
    ];

    // ── Desktop 3D ──
// ── Desktop 3D ──
const carousel = document.getElementById('categoriesCarousel');
if (carousel) {
    const n = cats.length;
    const radius = 340;
    let angle = 0;
    let speed = 0.35;
    let targetSpeed = 0.35;
    let hoveredCard = null;

    const cardEls = cats.map(cat => {
        const el = document.createElement('a');
        el.className = 'cat-card';
        el.href = cat.href;
        el.setAttribute('aria-label', `Ver ${cat.name}`);
        el.innerHTML = `
            <span class="cat-card__num">${cat.num}</span>
            <span class="cat-card__icon">${cat.icon}</span>
            <div class="cat-card__line"></div>
            <span class="cat-card__name">${cat.name}</span>
            <span class="cat-card__tag">${cat.tag}</span>
        `;
        carousel.appendChild(el);
        return { el, cat };
    });

    // Hover por tarjeta individual
    cardEls.forEach(({ el }) => {
        el.addEventListener('mouseenter', () => {
            hoveredCard = el;
            targetSpeed = 0;
        });
        el.addEventListener('mouseleave', () => {
            hoveredCard = null;
            targetSpeed = 0.35;
        });
    });

    function tick() {
        // Interpolación suave hacia targetSpeed
        speed += (targetSpeed - speed) * 0.06;
        angle += speed;

        const a = angle * Math.PI / 180;

        cardEls.forEach(({ el, cat }, i) => {
            const theta = a + (i / n) * Math.PI * 2;
            const x = Math.sin(theta) * radius;
            const z = Math.cos(theta) * radius;
            const norm = (z + radius) / (radius * 2);
            const isFront = z > radius * 0.45;
            const isHovered = hoveredCard === el;

            const baseScale = 0.42 + 0.58 * norm;
            const scale = baseScale + (isHovered ? 0.12 : 0);
            const opacity = Math.max(0.07, norm * 0.95);

            el.style.transform = `translateX(${x}px) translateZ(${z}px) scale(${scale})`;
            el.style.zIndex = Math.round(z + radius) + (isHovered ? 100 : 0);
            el.style.opacity = opacity;
            el.style.borderColor = (isFront || isHovered)
                ? cat.color + '88'
                : 'rgba(255,255,255,0.07)';
            el.style.boxShadow = isHovered
                ? `0 0 48px ${cat.color}66, 0 24px 50px rgba(0,0,0,0.8)`
                : isFront
                    ? `0 0 32px ${cat.color}33, 0 20px 40px rgba(0,0,0,0.7)`
                    : '0 8px 20px rgba(0,0,0,0.5)';

            el.classList.toggle('is-front', isFront || isHovered);
            el.querySelector('.cat-card__icon').style.color = (isFront || isHovered)
                ? cat.color
                : 'rgba(255,255,255,0.18)';
        });

        requestAnimationFrame(tick);
    }

    document.addEventListener('visibilitychange', () => {
        targetSpeed = document.hidden ? 0 : 0.35;
    });

    tick();

    // Botones de control
const stepAngle = 360 / n; // saltar de categoría en categoría

document.getElementById('catPrev')?.addEventListener('click', () => {
    targetSpeed = 0;
    // empuja el ángulo hacia atrás suavemente
    const bump = -stepAngle;
    let moved = 0;
    const step = () => {
        if (Math.abs(moved) < Math.abs(bump)) {
            const inc = bump * 0.08;
            angle += inc;
            moved += inc;
            requestAnimationFrame(step);
        } else {
            angle += bump - moved; // corrige residuo
        }
    };
    step();
});

document.getElementById('catNext')?.addEventListener('click', () => {
    targetSpeed = 0;
    const bump = stepAngle;
    let moved = 0;
    const step = () => {
        if (Math.abs(moved) < Math.abs(bump)) {
            const inc = bump * 0.08;
            angle += inc;
            moved += inc;
            requestAnimationFrame(step);
        } else {
            angle += bump - moved;
        }
    };
    step();
});
}

    // ── Móvil grid ──
    const grid = document.getElementById('categoriesMobileGrid');
    if (grid) {
        cats.forEach(cat => {
            const a = document.createElement('a');
            a.className = 'mg-card';
            a.href = cat.href;
            a.setAttribute('aria-label', `Ver ${cat.name}`);
            a.innerHTML = `
        <span class="mg-card__num">${cat.num}</span>
        <span class="mg-card__icon">${cat.icon}</span>
        <span class="mg-card__name">${cat.name}</span>
      `;
            grid.appendChild(a);
        });
    }

})();