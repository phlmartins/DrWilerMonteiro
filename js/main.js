/* ============================================
   WILER MONTEIRO – main.js
   ============================================ */

/* ---- Loading Screen ---- */
window.addEventListener('load', () => {
  setTimeout(() => {
    const screen = document.getElementById('loadingScreen');
    if (screen) screen.classList.add('hidden');
  }, 1800);
});

/* ---- Header scroll effect ---- */
const header = document.getElementById('header');
window.addEventListener('scroll', () => {
  header.classList.toggle('scrolled', window.scrollY > 40);
});

/* ---- Menu mobile (hamburger) ---- */
const hamburger = document.getElementById('hamburger');
const nav = document.getElementById('nav');

hamburger.addEventListener('click', () => {
  nav.classList.toggle('open');
  const isOpen = nav.classList.contains('open');
  hamburger.setAttribute('aria-expanded', isOpen);
});

nav.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    nav.classList.remove('open');
    hamburger.setAttribute('aria-expanded', false);
  });
});

/* ---- Particles Canvas ---- */
const canvas = document.getElementById('particlesCanvas');
if (canvas) {
  const ctx = canvas.getContext('2d');
  let particles = [];

  function resizeCanvas() {
    canvas.width  = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
  }
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  class Particle {
    constructor() { this.reset(true); }
    reset(initial = false) {
      this.x    = Math.random() * canvas.width;
      this.y    = initial ? Math.random() * canvas.height : canvas.height + 10;
      this.size = Math.random() * 2.5 + .5;
      this.speedX = (Math.random() - .5) * .4;
      this.speedY = -(Math.random() * .6 + .2);
      this.opacity = Math.random() * .5 + .1;
    }
    update() {
      this.x += this.speedX;
      this.y += this.speedY;
      if (this.y < -10) this.reset();
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(144,202,249,${this.opacity})`;
      ctx.fill();
    }
  }

  for (let i = 0; i < 80; i++) particles.push(new Particle());

  function animateParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => { p.update(); p.draw(); });
    requestAnimationFrame(animateParticles);
  }
  animateParticles();
}

/* ---- Animated Counters ---- */
function animateCounter(el, target, duration = 1800) {
  const isPlus  = el.dataset.original.startsWith('+');
  const isPerc  = el.dataset.original.endsWith('%');
  let start = null;
  function step(ts) {
    if (!start) start = ts;
    const progress = Math.min((ts - start) / duration, 1);
    const ease = 1 - Math.pow(1 - progress, 3);
    const val = Math.round(ease * target);
    el.textContent = (isPlus ? '+' : '') + val + (isPerc ? '%' : '');
    if (progress < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

/* ---- Intersection Observer (animações + contadores) ---- */
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const el = entry.target;

    // Animações de entrada
    el.classList.add('visible');

    // Contadores
    if (el.classList.contains('stat__number')) {
      const original = el.dataset.original || el.textContent;
      el.dataset.original = original;
      const num = parseInt(original.replace(/\D/g, ''));
      if (!isNaN(num)) animateCounter(el, num);
    }

    observer.unobserve(el);
  });
}, { threshold: 0.2 });

// Elementos com animação de entrada
document.querySelectorAll('.sobre__card, .servico-card, .info-item, .stat, .depoimento-card, .equipe__card--principal, .clinica__foto').forEach((el, i) => {
  const dur = el.dataset.transition || '.5s';
  el.style.opacity = '0';
  el.style.transform = 'translateY(24px)';
  el.style.transition = `opacity ${dur} ease ${(i % 4) * 0.08}s, transform ${dur} ease ${(i % 4) * 0.08}s`;
  observer.observe(el);
});

// Contadores das estatísticas
document.querySelectorAll('.stat__number').forEach(el => {
  el.dataset.original = el.textContent;
  observer.observe(el);
});

// Classe visible
document.head.insertAdjacentHTML('beforeend', `<style>.visible{opacity:1!important;transform:none!important}</style>`);

/* ---- Depoimentos Slider ---- */
const track    = document.getElementById('depoimentosTrack');
const dotsWrap = document.getElementById('depDots');
const prevBtn  = document.getElementById('depPrev');
const nextBtn  = document.getElementById('depNext');

if (track) {
  const cards     = track.querySelectorAll('.depoimento-card');
  let current     = 0;
  let perView     = window.innerWidth < 600 ? 1 : window.innerWidth < 900 ? 2 : 3;
  const total     = cards.length;
  const maxIndex  = () => total - perView;

  // Criar dots
  for (let i = 0; i <= maxIndex(); i++) {
    const dot = document.createElement('button');
    dot.className = 'dep-dot' + (i === 0 ? ' active' : '');
    dot.addEventListener('click', () => goTo(i));
    dotsWrap.appendChild(dot);
  }

  function goTo(idx) {
    current = Math.max(0, Math.min(idx, maxIndex()));
    const cardWidth = cards[0].offsetWidth + 24;
    track.style.transform = `translateX(-${current * cardWidth}px)`;
    dotsWrap.querySelectorAll('.dep-dot').forEach((d, i) => d.classList.toggle('active', i === current));
  }

  prevBtn.addEventListener('click', () => goTo(current - 1));
  nextBtn.addEventListener('click', () => goTo(current + 1));

  // Auto-play
  setInterval(() => goTo(current >= maxIndex() ? 0 : current + 1), 5000);

  window.addEventListener('resize', () => {
    perView = window.innerWidth < 600 ? 1 : window.innerWidth < 900 ? 2 : 3;
    goTo(0);
  });
}
