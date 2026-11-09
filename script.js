/* ================= CONFIG ================= */
// Wedding-day start (IST) used by the countdown: Bhat, 4 Dec 2026, 10:15 AM.
const WEDDING_DATE = new Date('2026-12-04T10:15:00+05:30');

/* ================= ENVELOPE ================= */
(function envelope() {
  const screen = document.getElementById('envelope');
  const stage = document.getElementById('envStage');
  const toggle = document.getElementById('o');
  const site = document.getElementById('site');

  function fit() {
    const s = Math.min(window.innerWidth / 390, window.innerHeight / 760);
    stage.style.transform = `scale(${s})`;
  }
  fit();
  window.addEventListener('resize', fit);

  toggle.addEventListener('change', () => {
    if (!toggle.checked) return;
    startMusic(); // opening the envelope is a tap, so browsers allow audio to start
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    setTimeout(() => {
      screen.classList.add('gone');
      document.body.classList.remove('locked');
      document.body.classList.add('opened');
      site.removeAttribute('aria-hidden');
      window.scrollTo(0, 0);
      setTimeout(() => screen.remove(), 900);
    }, reduce ? 200 : 2000);
  });
})();

/* ================= BACKGROUND MUSIC (music/song.mp3) ================= */
function startMusic() {
  const audio = document.getElementById('bgm');
  const btn = document.getElementById('musicBtn');
  if (!audio || !btn || startMusic.done) return;
  startMusic.done = true;
  audio.volume = 0.6;
  const sync = () => {
    const on = !audio.paused;
    btn.classList.toggle('off', !on);
    btn.setAttribute('aria-pressed', String(on));
    btn.setAttribute('aria-label', on ? 'Mute music' : 'Play music');
  };
  audio.addEventListener('play', sync);
  audio.addEventListener('pause', sync);
  btn.addEventListener('click', () => (audio.paused ? audio.play().catch(() => {}) : audio.pause()));
  // Show the button only when the song file exists and can play.
  audio.addEventListener('canplay', () => { btn.hidden = false; sync(); }, { once: true });
  audio.play().catch(() => {});
}

/* ================= PHOTOS (drop files in /images) ================= */
document.querySelectorAll('[data-img]').forEach((el) => {
  const src = el.dataset.img;
  const img = new Image();
  img.onload = () => {
    el.style.backgroundImage = `url("${src}")`;
    el.classList.add('has-img');
    el.setAttribute('role', 'img');
    el.setAttribute('aria-label', el.dataset.alt || el.textContent.trim());
  };
  img.src = src;
});

/* ================= SCRATCH CARDS ================= */
document.querySelectorAll('.scratch').forEach((tile) => {
  const canvas = tile.querySelector('canvas');
  const ctx = canvas.getContext('2d');
  const label = tile.dataset.label;
  let w, h, drawing = false, last = null, checks = 0;

  function paint() {
    const dpr = window.devicePixelRatio || 1;
    w = tile.clientWidth; h = tile.clientHeight;
    canvas.width = w * dpr; canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.globalCompositeOperation = 'source-over';
    // foil stripes
    ctx.fillStyle = '#4A1620';
    ctx.fillRect(0, 0, w, h);
    ctx.save();
    ctx.translate(w / 2, h / 2); ctx.rotate(Math.PI / 4); ctx.translate(-w, -h);
    ctx.fillStyle = '#5C1D29';
    for (let x = 0; x < w * 2; x += 12) ctx.fillRect(x, 0, 6, h * 2);
    ctx.restore();
    // shine
    const g = ctx.createLinearGradient(0, 0, w, h);
    g.addColorStop(0.35, 'rgba(231,207,142,0)');
    g.addColorStop(0.5, 'rgba(231,207,142,.28)');
    g.addColorStop(0.65, 'rgba(231,207,142,0)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
    // text
    ctx.textAlign = 'center';
    ctx.font = '600 11px "Cormorant Garamond", Georgia, serif';
    ctx.fillStyle = '#E7CF8E';
    ctx.letterSpacing = '2.6px';
    ctx.fillText(label, w / 2, h / 2 - 6);
    ctx.fillStyle = '#C9A24B';
    ctx.fillText('SCRATCH', w / 2, h / 2 + 12);
  }

  function pos(e) {
    const r = canvas.getBoundingClientRect();
    return { x: (e.clientX - r.left) * (w / r.width), y: (e.clientY - r.top) * (h / r.height) };
  }
  function scratch(p) {
    ctx.globalCompositeOperation = 'destination-out';
    ctx.lineWidth = 26; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo((last || p).x, (last || p).y);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
    last = p;
    if (++checks % 6 === 0) checkDone();
  }
  function checkDone() {
    const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    let clear = 0, total = 0;
    for (let i = 3; i < data.length; i += 64) { total++; if (data[i] === 0) clear++; }
    if (clear / total > 0.45) tile.classList.add('done');
  }

  canvas.addEventListener('pointerdown', (e) => { drawing = true; last = null; canvas.setPointerCapture(e.pointerId); scratch(pos(e)); });
  canvas.addEventListener('pointermove', (e) => { if (drawing) scratch(pos(e)); });
  ['pointerup', 'pointercancel'].forEach((t) => canvas.addEventListener(t, () => { drawing = false; last = null; checkDone(); }));
  // keyboard: Enter/Space reveals
  canvas.tabIndex = 0;
  canvas.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); tile.classList.add('done'); } });

  (document.fonts ? document.fonts.ready : Promise.resolve()).then(paint);
  paint();
});

/* ================= COUNTDOWN ================= */
(function countdown() {
  const els = {};
  document.querySelectorAll('#countdown [data-u]').forEach((b) => (els[b.dataset.u] = b));
  const pad = (n) => String(n).padStart(2, '0');
  function tick() {
    let diff = Math.max(0, WEDDING_DATE - Date.now());
    const d = Math.floor(diff / 864e5); diff -= d * 864e5;
    const h = Math.floor(diff / 36e5); diff -= h * 36e5;
    const m = Math.floor(diff / 6e4); diff -= m * 6e4;
    const s = Math.floor(diff / 1e3);
    els.d.textContent = pad(d); els.h.textContent = pad(h); els.m.textContent = pad(m); els.s.textContent = pad(s);
    if (WEDDING_DATE - Date.now() <= 0) document.getElementById('countdownDone').hidden = false;
  }
  tick();
  setInterval(tick, 1000);
})();

/* ================= SCROLL REVEAL ================= */
(function reveal() {
  const targets = document.querySelectorAll('.sec > .h2, .ev, .collage, .contact-list, .families');
  if (!('IntersectionObserver' in window)) return;
  targets.forEach((t) => t.classList.add('reveal'));
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
  }, { threshold: 0.15 });
  targets.forEach((t) => io.observe(t));
})();
