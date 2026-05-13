

//  ESTILOS DE  SOBRE-NOSOTROS

document.querySelectorAll('.card').forEach(card => {
  const canvas = card.querySelector('canvas.particles');

  if (!canvas) return; //  evita errores

  const ctx = canvas.getContext('2d');
  const color = card.dataset.color || "0,200,255";

  let particles = [];
  let animId = null;
  let active = false;

  function resize() {
    canvas.width  = card.offsetWidth;
    canvas.height = card.offsetHeight;
  }

  resize(); // IMPORTANTE

  function spawn() {
    const x = Math.random() * canvas.width;
    particles.push({
      x, y: canvas.height + 1,
      vx: (Math.random() - 0.1) * 0.8,
      vy: -(Math.random() * 1.4 + 0.6),
      r: Math.random() * 2.0 + 0.8,
      alpha: Math.random() * 0.7 + 0.3,
      life: 1
    });
  }

  function loop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (active && Math.random() < 0.5) spawn();

    particles = particles.filter(p => p.life > 0);

    particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.life -= 0.01;
      p.alpha = p.life * 0.8;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${color},${p.alpha})`;
      ctx.fill();
    });

    if (active || particles.length > 0) {
      animId = requestAnimationFrame(loop);
    } else {
      animId = null;
    }
  }

  card.addEventListener('mouseenter', () => {
    resize();
    active = true;
    if (!animId) loop();
  });

  card.addEventListener('mouseleave', () => {
    active = false;
  });

  card.addEventListener('click', () => {
    for (let i = 0; i < 30; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 3 + 1;

      particles.push({
        x: canvas.width / 2,
        y: canvas.height * 0.4,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 2,
        r: Math.random() * 3 + 1,
        alpha: 1,
        life: 1
      });
    }

    if (!animId) {
      resize();
      loop();
    }
  });
});

function irEnlaces(url){
    window.open(url, "_blank")
}
