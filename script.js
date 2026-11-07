/* ================= CONFIG ================= */
// Wedding-day start (IST) used by the countdown: Bhat, 4 Dec 2026, 10:15 AM.
const WEDDING_DATE = new Date('2026-12-04T10:15:00+05:30');
// Google Sheet that stores every RSVP: paste the Apps Script Web app URL (ends in /exec).
// See backend/README.md. Leave empty to fall back to WhatsApp only.
const RSVP_SHEET_URL = '';
// Optional: also open a WhatsApp message to this number (country code + number, digits only,
// e.g. '919887311567'). Leave empty to skip WhatsApp when the Sheet is set up.
const RSVP_WHATSAPP_NUMBER = '';

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

/* ================= PHOTOS (drop files in /images) ================= */
document.querySelectorAll('[data-img]').forEach((el) => {
  const src = el.dataset.img;
  const img = new Image();
  img.onload = () => {
    el.style.backgroundImage = `url("${src}")`;
    el.classList.add('has-img');
    el.setAttribute('role', 'img');
    el.setAttribute('aria-label', el.textContent.trim());
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
  const targets = document.querySelectorAll('.sec > .h2, .ev, .collage, .rsvp .fld, .contact-list, .families');
  if (!('IntersectionObserver' in window)) return;
  targets.forEach((t) => t.classList.add('reveal'));
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
  }, { threshold: 0.15 });
  targets.forEach((t) => io.observe(t));
})();

/* ================= RSVP ================= */
(function rsvp() {
  const form = document.getElementById('rsvpForm');
  const msg = document.getElementById('formMsg');
  const attendWrap = document.getElementById('attendWrap');
  const pickupWrap = document.getElementById('pickupWrap');
  let attending = true;
  let pickup = false;

  form.querySelectorAll('.segs').forEach((group) => {
    const segs = group.querySelectorAll('.seg');
    segs.forEach((b) => b.addEventListener('click', () => {
      segs.forEach((x) => { x.classList.toggle('on', x === b); x.setAttribute('aria-checked', String(x === b)); });
      if (group.dataset.group === 'attend') { attending = b.dataset.v === 'accept'; attendWrap.hidden = !attending; }
      if (group.dataset.group === 'pickup') { pickup = b.dataset.v === 'yes'; pickupWrap.hidden = !pickup; }
    }));
  });

  const submitBtn = form.querySelector('button[type="submit"]');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (submitBtn.disabled) return;
    const f = (n) => form.elements.namedItem(n);
    const val = (n) => f(n).value.trim();
    msg.className = 'form-msg';
    const fail = (input, text) => {
      input.classList.add('err');
      msg.textContent = text;
      msg.classList.add('err');
      input.focus();
    };
    ['name', 'phone', 'guests'].forEach((n) => f(n).classList.remove('err'));
    if (!val('name')) return fail(f('name'), 'Please tell us your name.');
    if (val('phone').replace(/\D/g, '').length < 10) return fail(f('phone'), 'Please enter a valid phone number.');
    const guests = parseInt(val('guests'), 10);
    if (attending && !(guests >= 1 && guests <= 20)) return fail(f('guests'), 'Please enter the number of guests (1–20).');
    const lines = [
      '💌 RSVP · Neha & Deepak',
      `Name: ${val('name')}`,
      `Phone: ${val('phone')}`,
      `Attending: ${attending ? 'Joyfully accept 🎉' : 'Regretfully decline'}`,
      attending && `Guests (incl. me): ${guests}`,
      attending && `Logistics help: ${pickup ? 'Yes, please' : 'No, thanks'}`,
      attending && pickup && val('pickupTime') && `Pick-up time: ${val('pickupTime')}`,
      attending && pickup && val('pickupFrom') && `Pick-up from: ${val('pickupFrom')}`,
      attending && pickup && val('dropAt') && `Drop at: ${val('dropAt')}`,
    ].filter(Boolean);
    const thanks = attending ? 'Thank you! We can’t wait to celebrate with you.' : 'Thank you for letting us know. You’ll be missed!';

    // WhatsApp: always when there's no Sheet, otherwise only if a number is configured.
    // Opened before any await so phones don't treat it as a blocked pop-up.
    if (!RSVP_SHEET_URL || RSVP_WHATSAPP_NUMBER) {
      window.open(`https://wa.me/${RSVP_WHATSAPP_NUMBER}?text=${encodeURIComponent(lines.join('\n'))}`, '_blank', 'noopener');
    }
    if (!RSVP_SHEET_URL) { msg.textContent = thanks; return; }

    const payload = {
      name: val('name'),
      phone: val('phone'),
      attending: attending ? 'Yes' : 'No',
      guests: attending ? guests : 0,
      logistics: attending ? (pickup ? 'Yes' : 'No') : '',
      pickupTime: attending && pickup ? val('pickupTime') : '',
      pickupFrom: attending && pickup ? val('pickupFrom') : '',
      dropAt: attending && pickup ? val('dropAt') : '',
      website: val('website'), // honeypot, empty for real guests
    };
    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending…';
    try {
      // text/plain + no-cors is the standard way to post to Apps Script from a static site.
      await fetch(RSVP_SHEET_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(payload),
        keepalive: true,
      });
      submitBtn.textContent = 'RSVP sent ✓';
      msg.textContent = thanks;
    } catch (err) {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Send RSVP';
      msg.textContent = 'Couldn’t send — please check your internet and try again, or call us.';
      msg.classList.add('err');
    }
  });
})();
