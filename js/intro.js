/* intro.js · portada "TOCA PARA JUGAR" + intro cinematografica de D.M.R PING PONG
   Todo se dibuja en un canvas 2D y el sonido se genera con WebAudio (sin archivos).
   Orden: portada -> toque -> escenas 1-4 (~6 s) -> menu. Se ejecuta una sola vez por sesion. */
import { SET } from './state.js';

const BG = '#05091F';
const LOAD = 2800; /* ms que tarda en llenarse la barra de carga antes de entrar al juego */
const K = 1.6; /* factor de duracion: las escenas se estiran para que la intro dure unos 10 s */
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const seg = (t, a, b) => clamp((t - a) / (b - a));
const E = {
  out: (x) => 1 - Math.pow(1 - x, 3), in3: (x) => x * x * x, in2: (x) => x * x,
  io: (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2),
  back: (x) => 1 + 2.4 * Math.pow(x - 1, 3) + 1.4 * Math.pow(x - 1, 2),
};
const RED = ['#ff5470', '#d3173a', '#7c0b20'], BLUE = ['#4d9bff', '#1a63d6', '#0b3076'];

const CSS = `
#intro{position:fixed;inset:0;z-index:60;background:${BG};opacity:0;transition:opacity .3s;overflow:hidden;touch-action:none;user-select:none;-webkit-user-select:none;-webkit-tap-highlight-color:transparent}
#intro.on{opacity:1}#intro.off{opacity:0;transition:opacity .6s ease-in}
#intro canvas{position:absolute;inset:0;width:100%;height:100%;display:block}
#intro button{font-family:inherit;cursor:pointer;border:0;background:none;color:#e6ebf7;padding:0}
#itGo{position:absolute;left:50%;bottom:calc(7% + env(safe-area-inset-bottom,0px));width:min(86vw,420px);height:60px;margin-left:calc(min(86vw,420px)/-2);transition:opacity .35s}
#itGo .tx{position:absolute;left:0;right:0;top:4px;text-align:center;font-size:clamp(13px,3.7vw,17px);font-weight:800;letter-spacing:.42em;text-indent:.42em;white-space:nowrap;
 background:linear-gradient(100deg,#8e9bbd 30%,#ffffff 50%,#8e9bbd 70%) 0 0/250% 100%;-webkit-background-clip:text;background-clip:text;color:transparent;-webkit-text-fill-color:transparent;animation:itShine 2.4s linear infinite,itBreath 1.8s ease-in-out infinite}
#intro.run #itGo{opacity:0;pointer-events:none}
#itSnd{position:absolute;top:calc(14px + env(safe-area-inset-top,0px));right:14px;width:42px;height:42px;border-radius:50%!important;background:rgba(10,16,52,.7)!important;border:1.5px solid rgba(200,208,224,.35)!important;display:flex;align-items:center;justify-content:center;z-index:3}
#itSnd svg{width:22px;height:22px;stroke:#C8D0E0;fill:none;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}
#itSnd .x{display:none}#itSnd.mute .w{display:none}#itSnd.mute .x{display:block}
@keyframes itShine{to{background-position:-150% 0}}@keyframes itBreath{50%{opacity:.62}}`;
/* ---------- raqueta vectorial (cabeza en 0,0, mango hacia +y) ---------- */
function racket(g, x, y, ang, s, c, a = 1) {
  g.save(); g.translate(x, y); g.rotate(ang); g.globalAlpha *= a;
  const hw = s * 0.17, h1 = s * 1.3;
  let gr = g.createLinearGradient(-hw, 0, hw, 0); gr.addColorStop(0, '#6b3f1b'); gr.addColorStop(0.5, '#c98f52'); gr.addColorStop(1, '#6b3f1b');
  g.fillStyle = gr; g.beginPath(); g.moveTo(-hw * 0.8, s * 0.45); g.lineTo(hw * 0.8, s * 0.45); g.lineTo(hw, h1); g.lineTo(-hw, h1); g.closePath(); g.fill();
  g.fillStyle = '#161a2e'; g.fillRect(-hw * 1.02, h1 - s * 0.32, hw * 2.04, s * 0.32);
  g.fillStyle = '#14172a'; g.beginPath(); g.ellipse(0, 0, s * 0.66, s * 0.72, 0, 0, 7); g.fill();
  gr = g.createRadialGradient(-s * 0.2, -s * 0.25, s * 0.05, 0, 0, s * 0.64); gr.addColorStop(0, c[0]); gr.addColorStop(0.6, c[1]); gr.addColorStop(1, c[2]);
  g.fillStyle = gr; g.beginPath(); g.ellipse(0, 0, s * 0.6, s * 0.66, 0, 0, 7); g.fill();
  g.strokeStyle = 'rgba(255,255,255,.16)'; g.lineWidth = s * 0.05; g.beginPath(); g.ellipse(0, 0, s * 0.5, s * 0.56, 0, 3.5, 4.6); g.stroke();
  g.restore();
}

/* ---------- logo PING PONG 3D (sprite) ---------- */
function buildLogo(S) {
  const Hs = Math.ceil(S * 0.66), cv = document.createElement('canvas'); cv.width = Math.ceil(S); cv.height = Hs;
  const g = cv.getContext('2d'), cx = S / 2;
  /* placa con red */
  const ey = S * 0.4, rx = S * 0.4, ry = S * 0.15;
  let gr = g.createRadialGradient(cx, ey, 0, cx, ey, rx); gr.addColorStop(0, '#0e1750'); gr.addColorStop(1, '#050823');
  g.fillStyle = gr; g.beginPath(); g.ellipse(cx, ey, rx, ry, 0, 0, 7); g.fill();
  g.save(); g.beginPath(); g.ellipse(cx, ey, rx - 2, ry - 2, 0, 0, 7); g.clip();
  g.strokeStyle = 'rgba(200,208,224,.16)'; g.lineWidth = 1; const st = Math.max(5, S * 0.014);
  for (let x = cx - rx; x < cx + rx; x += st) { g.beginPath(); g.moveTo(x, ey - ry); g.lineTo(x, ey + ry); g.stroke(); }
  for (let y = ey - ry; y < ey + ry; y += st) { g.beginPath(); g.moveTo(cx - rx, y); g.lineTo(cx + rx, y); g.stroke(); }
  g.fillStyle = 'rgba(255,255,255,.3)'; g.fillRect(cx - rx, ey - ry * 0.55, rx * 2, S * 0.008); g.restore();
  gr = g.createLinearGradient(cx - rx, 0, cx + rx, 0); gr.addColorStop(0, '#FF1744'); gr.addColorStop(0.5, '#8d6fd0'); gr.addColorStop(1, '#1677FF');
  g.strokeStyle = gr; g.lineWidth = S * 0.013; g.beginPath(); g.ellipse(cx, ey, rx, ry, 0, 0, 7); g.stroke();
  g.strokeStyle = 'rgba(200,208,224,.45)'; g.lineWidth = 1.2; g.beginPath(); g.ellipse(cx, ey, rx + S * 0.012, ry + S * 0.012, 0, 0, 7); g.stroke();
  /* texto metalico con extrusion */
  let fs = S * 0.2; const fam = '"Roboto","Arial Black",Impact,system-ui,sans-serif';
  g.font = `900 ${fs}px ${fam}`; fs *= (S * 0.86) / g.measureText('PING PONG').width; g.font = `900 ${fs}px ${fam}`;
  const tw = g.measureText('PING PONG').width;
  g.save(); g.translate(cx, S * 0.27); g.transform(1, 0, -0.2, 1, 0, 0); g.textAlign = 'center'; g.textBaseline = 'middle'; g.lineJoin = 'round';
  const D = Math.round(S * 0.055), mix = (c1, c2, k) => `rgb(${c1.map((v, i) => Math.round(v + (c2[i] - v) * k)).join(',')})`;
  for (let i = D; i >= 1; i--) {
    const k = i / D; gr = g.createLinearGradient(-tw / 2, 0, tw / 2, 0);
    gr.addColorStop(0, mix([150, 24, 52], [28, 6, 16], k)); gr.addColorStop(0.5, mix([86, 74, 150], [12, 12, 32], k)); gr.addColorStop(1, mix([22, 92, 190], [5, 14, 44], k));
    g.fillStyle = gr; g.fillText('PING PONG', i * 0.5, i * 0.95);
  }
  g.strokeStyle = BG; g.lineWidth = S * 0.022; g.strokeText('PING PONG', 0, 0);
  gr = g.createLinearGradient(0, -fs * 0.5, 0, fs * 0.5);
  [[0, '#ffffff'], [0.18, '#eef3ff'], [0.4, '#c9d3e8'], [0.49, '#7f8bab'], [0.53, '#59658a'], [0.58, '#aeb9d3'], [0.8, '#e9eefb'], [1, '#ffffff']].forEach(([o, c]) => gr.addColorStop(o, c));
  g.fillStyle = gr; g.fillText('PING PONG', 0, 0);
  gr = g.createLinearGradient(-tw / 2, 0, tw / 2, 0); gr.addColorStop(0, 'rgba(255,23,68,.55)'); gr.addColorStop(0.32, 'rgba(255,23,68,0)'); gr.addColorStop(0.68, 'rgba(22,119,255,0)'); gr.addColorStop(1, 'rgba(22,119,255,.55)');
  g.fillStyle = gr; g.fillText('PING PONG', 0, 0);
  gr = g.createLinearGradient(-tw / 2, -fs * 0.5, -tw / 2 + tw * 0.45, fs * 0.5);
  gr.addColorStop(0, 'rgba(255,255,255,0)'); gr.addColorStop(0.3, 'rgba(255,255,255,0)'); gr.addColorStop(0.36, 'rgba(255,255,255,.38)'); gr.addColorStop(0.42, 'rgba(255,255,255,0)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = gr; g.fillText('PING PONG', 0, 0);
  g.lineWidth = 1.4; g.strokeStyle = 'rgba(255,255,255,.65)'; g.strokeText('PING PONG', -0.7, -0.9);
  g.strokeStyle = 'rgba(5,9,31,.55)'; g.strokeText('PING PONG', 0.9, 1.0);
  g.restore();
  /* corona (dorado apagado) */
  const cw = S * 0.1, ch = S * 0.085, cy = S * 0.145;
  g.save(); g.translate(cx, cy);
  gr = g.createLinearGradient(0, -ch, 0, ch * 0.3); gr.addColorStop(0, '#f1d27a'); gr.addColorStop(0.55, '#d4a232'); gr.addColorStop(1, '#85590f');
  g.fillStyle = gr; g.strokeStyle = '#4e3208'; g.lineWidth = 1.5; g.beginPath();
  g.moveTo(-cw, ch * 0.3); g.lineTo(-cw, -ch * 0.55); g.lineTo(-cw * 0.5, -ch * 0.1); g.lineTo(0, -ch); g.lineTo(cw * 0.5, -ch * 0.1); g.lineTo(cw, -ch * 0.55); g.lineTo(cw, ch * 0.3); g.closePath(); g.fill(); g.stroke();
  [[-cw * 0.55, '#FF1744'], [0, '#e8eefc'], [cw * 0.55, '#1677FF']].forEach(([x, c]) => { g.fillStyle = c; g.beginPath(); g.arc(x, ch * 0.08, ch * 0.13, 0, 7); g.fill(); });
  g.restore();
  /* raquetas cruzadas bajo el nombre */
  racket(g, cx - S * 0.05, S * 0.405, -0.55, S * 0.062, RED); racket(g, cx + S * 0.05, S * 0.405, 0.55, S * 0.062, BLUE);
  g.fillStyle = '#fff'; g.beginPath(); g.arc(cx, S * 0.43, S * 0.011, 0, 7); g.fill();
  return cv;
}

function buildRefl(src) {
  const c = document.createElement('canvas'); c.width = src.width; c.height = src.height; const x = c.getContext('2d');
  x.translate(0, c.height); x.scale(1, -1); x.drawImage(src, 0, 0); x.setTransform(1, 0, 0, 1, 0, 0); x.globalCompositeOperation = 'destination-out';
  const q = x.createLinearGradient(0, 0, 0, c.height * 0.75); q.addColorStop(0, 'rgba(0,0,0,.3)'); q.addColorStop(1, 'rgba(0,0,0,1)'); x.fillStyle = q; x.fillRect(0, 0, c.width, c.height); return c;
}

/* ---------- sonido original (WebAudio) ---------- */
function mkAudio(muted) {
  const A = window.AudioContext || window.webkitAudioContext, a = new A();
  const out = a.createGain(), comp = a.createDynamicsCompressor(), mus = a.createGain();
  out.gain.value = muted ? 0 : 0.9; comp.threshold.value = -18; comp.ratio.value = 8; mus.gain.value = 0.5;
  out.connect(comp); comp.connect(a.destination); mus.connect(out);
  const nb = a.createBuffer(1, a.sampleRate * 1.5, a.sampleRate), d = nb.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  const t0 = a.currentTime + 0.05;
  const tone = (f, dur, type, v, at = 0, to = 0, dest = out, lp = 0) => {
    const o = a.createOscillator(), g = a.createGain(), s = t0 + at; o.type = type; o.frequency.setValueAtTime(f, s);
    if (to) o.frequency.exponentialRampToValueAtTime(to, s + dur);
    g.gain.setValueAtTime(0.0001, s); g.gain.exponentialRampToValueAtTime(v, s + 0.012); g.gain.exponentialRampToValueAtTime(0.0001, s + dur);
    let n = o; if (lp) { const f2 = a.createBiquadFilter(); f2.type = 'lowpass'; f2.frequency.value = lp; o.connect(f2); n = f2; }
    n.connect(g); g.connect(dest); o.start(s); o.stop(s + dur + 0.05);
  };
  const nz = (dur, v, type, f0, f1, at = 0, pan = 0, att = 0.02) => {
    const s = a.createBufferSource(), f = a.createBiquadFilter(), g = a.createGain(), st = t0 + at; s.buffer = nb; f.type = type; f.Q.value = 1.2;
    f.frequency.setValueAtTime(f0, st); f.frequency.exponentialRampToValueAtTime(f1, st + dur);
    g.gain.setValueAtTime(0.0001, st); g.gain.exponentialRampToValueAtTime(v, st + att); g.gain.exponentialRampToValueAtTime(0.0001, st + dur);
    s.connect(f); f.connect(g);
    if (pan && a.createStereoPanner) { const p = a.createStereoPanner(); p.pan.value = pan; g.connect(p); p.connect(out); } else g.connect(out);
    s.start(st); s.stop(st + dur);
  };
  const pad = (fr, at, dur, v) => fr.forEach((f) => [-6, 6].forEach((c) => {
    const o = a.createOscillator(), l = a.createBiquadFilter(), g = a.createGain(), s = t0 + at; o.type = 'sawtooth'; o.frequency.value = f; o.detune.value = c;
    l.type = 'lowpass'; l.frequency.value = 1000; g.gain.setValueAtTime(0.0001, s); g.gain.linearRampToValueAtTime(v, s + 0.25); g.gain.linearRampToValueAtTime(0.0001, s + dur);
    o.connect(l); l.connect(g); g.connect(mus); o.start(s); o.stop(s + dur + 0.05);
  }));
  const Ks = (x) => x * K; /* los efectos siguen a las escenas */
  /* activacion electronica */
  tone(300, 0.32, 'sine', 0.3, 0, 900); tone(1200, 0.07, 'square', 0.08, 0.02, 0, out, 3000); tone(1800, 0.07, 'square', 0.08, 0.1, 0, out, 3000);
  /* energia ascendente (luces) */
  tone(110, Ks(0.9), 'sawtooth', 0.1, 0.15, 880, out, 2200); nz(Ks(0.9), 0.16, 'bandpass', 300, 4200, 0.15, 0, 0.8);
  /* aire de las raquetas */
  nz(1.0, 0.26, 'bandpass', 500, 2400, Ks(1.0), -0.7, 0.5); nz(1.0, 0.26, 'bandpass', 500, 2400, Ks(1.15), 0.7, 0.5);
  /* choque: golpe de pelota + impacto grave */
  const hit = Ks(1.9);
  tone(1700, 0.07, 'sine', 0.5, hit, 1100); tone(3400, 0.03, 'triangle', 0.18, hit); nz(0.05, 0.4, 'highpass', 3000, 3200, hit);
  tone(120, 1.3, 'sine', 0.9, hit, 35); nz(0.8, 0.5, 'lowpass', 1400, 120, hit); tone(2200, 0.8, 'sine', 0.05, hit + 0.02);
  nz(0.7, 0.2, 'bandpass', 800, 4500, Ks(2.1), 0, 0.2);
  /* aparicion del logo */
  const lg = Ks(2.7);
  tone(55, 2.0, 'sine', 1.0, lg, 38); tone(110, 0.8, 'sawtooth', 0.18, lg, 70, out, 1500);
  [440, 660, 880, 1320].forEach((f, i) => tone(f, 0.4, 'triangle', 0.16, lg + 0.08 + i * 0.12, 0, out, 5000)); nz(1.8, 0.2, 'highpass', 5000, 7000, lg, 0, 0.04);
  /* musica epica electronica: sube con el logo y baja de intensidad al final */
  const m0 = lg + 0.1, ch = [[220, 261.63, 329.63], [174.61, 220, 261.63], [196, 261.63, 329.63], [196, 246.94, 293.66]], rt2 = [110, 87.3, 130.8, 98];
  for (let i = 0; i < 7; i++) pad(ch[i % 4], m0 + i * 1.5, 1.8, 0.05);
  for (let k = 0; k < 40; k++) { const i = Math.floor(k / 6) % 4; tone(rt2[i], 0.22, 'sawtooth', 0.1, m0 + 0.05 + k * 0.25, 0, mus, 320); }
  for (let k = 0; k < 70; k++) { const i = Math.floor(k / 12) % 4, f = [440, 523.25, 659.25, 523.25][i]; tone(f * (k % 2 ? 1.5 : 1), 0.11, 'triangle', 0.032, m0 + 0.7 + k * 0.125, 0, mus, 3000); }
  mus.gain.setValueAtTime(0.5, t0 + Ks(5.3)); mus.gain.linearRampToValueAtTime(0.0001, t0 + Ks(6.5) + 3.1);
  return { a, out, stop() { try { out.gain.cancelScheduledValues(a.currentTime); out.gain.setTargetAtTime(0, a.currentTime, 0.06); setTimeout(() => a.close(), 600); } catch (e) { /* nada */ } },
    mute(m) { out.gain.setTargetAtTime(m ? 0 : 0.9, a.currentTime, 0.03); } };
}

/* ---------- intro ---------- */
export function play() {
  if (window.__dmrIntro) return Promise.resolve();
  window.__dmrIntro = 1;
  return new Promise((done) => {
    if (!document.getElementById('introCss')) { const s = document.createElement('style'); s.id = 'introCss'; s.textContent = CSS; document.head.appendChild(s); }
    let muted = SET.snd === false; try { if (localStorage.getItem('dmr_intro_mute') === '1') muted = true; } catch (e) { /* nada */ }
    const root = document.createElement('div'); root.id = 'intro';
    root.innerHTML = '<canvas></canvas>'
      + '<button id="itGo" aria-label="Toca para jugar"><span class="tx">TOCA PARA JUGAR</span></button>'
      + '<button id="itSnd" aria-label="Sonido"><svg viewBox="0 0 24 24"><path d="M4 9v6h4l5 4V5L8 9z"/><g class="w"><path d="M16 9a4 4 0 0 1 0 6"/><path d="M18.5 6.5a8 8 0 0 1 0 11"/></g><g class="x"><path d="M17 9l5 6M22 9l-5 6"/></g></svg></button>';
    document.body.appendChild(root); requestAnimationFrame(() => { root.classList.add('on'); const r = root.querySelector('#itGo').getBoundingClientRect(); uiY = r.top + 38; });
    const cv = root.querySelector('canvas'), g = cv.getContext('2d'), $ = (i) => root.querySelector(i);
    const snd = $('#itSnd'); snd.classList.toggle('mute', muted);

    let loadStart = 0, W = 0, H = 0, dpr = 1, S = 0, logo = null, refl = null, uiY = 0, eNext = 0, eo = new Array(40).fill(0), raf = 0, ended = false, audio = null, run = false, t0 = 0, last = 0, rs = 0;
    const parts = [], sparks = [], rings = [], trail = [], smoke = [], ev = {}; let flashes = [];
    const rnd = Math.random;
    const mkSmoke = (rgb) => { const c = document.createElement('canvas'); c.width = c.height = 128; const x = c.getContext('2d'), q = x.createRadialGradient(64, 64, 0, 64, 64, 64); q.addColorStop(0, `rgba(${rgb},.55)`); q.addColorStop(1, `rgba(${rgb},0)`); x.fillStyle = q; x.fillRect(0, 0, 128, 128); return c; };
    const smR = mkSmoke('255,23,68'), smB = mkSmoke('22,119,255');
    for (let i = 0; i < 9; i++) smoke.push({ side: i % 2, x: rnd(), y: 0.58 + rnd() * 0.3, sz: 0.45 + rnd() * 0.4, ph: rnd() * 6.3, sp: 0.15 + rnd() * 0.25 });

    const size = () => {
      dpr = Math.min(1.75, devicePixelRatio || 1); W = innerWidth; H = innerHeight; cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
      S = Math.min(W * 0.98, H * 0.95, 700); clearTimeout(rs); rs = setTimeout(() => { logo = buildLogo(S); refl = buildRefl(logo); const r = root.querySelector('#itGo').getBoundingClientRect(); uiY = r.top + 38; }, 0);
      const n = clamp(Math.round(W * H / 9000), 30, 90); parts.length = 0;
      for (let i = 0; i < n; i++) parts.push({ x: rnd() * W, y: rnd() * H, z: 0.3 + rnd() * 0.7, vx: (rnd() - 0.5) * 8, vy: -4 - rnd() * 10, ph: rnd() * 6.3, c: rnd() });
    };
    size(); logo = buildLogo(S); refl = buildRefl(logo); addEventListener('resize', size);

    const emit = (n, x, y, sp, cols, life = 0.7) => { for (let i = 0; i < n; i++) { const a = rnd() * 6.283, s = sp * (0.3 + rnd() * 0.9); sparks.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, l: life * (0.6 + rnd() * 0.6), m: life, c: cols[i % cols.length], w: 1 + rnd() * 1.6 }); } };
    const ring = (x, y, now, dur, r1, c) => rings.push({ x, y, t: now, dur, r1, c });
    const flash = (x, y, now, a, dur = 500) => flashes.push({ x, y, t: now, a, dur });

    /* ---- finalizar ---- */
    const finish = () => {
      if (ended) return; ended = true; removeEventListener('resize', size);
      if (audio) audio.stop(); root.classList.remove('on'); root.classList.add('off'); window.__dmrIntroDone = 1;
      done(); setTimeout(() => { cancelAnimationFrame(raf); root.remove(); }, 700);
    };
    const start = () => {
      if (run || ended) return; run = true; t0 = performance.now(); root.classList.add('run');
      try { audio = mkAudio(muted); audio.a.resume(); } catch (e) { audio = null; }
    };
    /* el audio solo se habilita con 'click'/'touchend' (gestos validos en celular) */
    root.addEventListener('click', (e) => { if (e.target.closest('#itSnd')) return; if (!run) start(); else if (audio && audio.a.state === 'suspended') audio.a.resume(); });
    snd.addEventListener('click', (e) => { e.stopPropagation(); muted = !muted; snd.classList.toggle('mute', muted); try { localStorage.setItem('dmr_intro_mute', muted ? '1' : '0'); } catch (x) { /* nada */ } if (audio) audio.mute(muted); });

    /* ---- poses de raquetas ---- */
    const geo = () => {
      const m = Math.min(W, H), land = W > H * 1.2, R = m * (land ? 0.065 : 0.085), rs2 = m * 0.2, by = H * (land ? 0.6 : 0.52);
      return { m, R, rs: rs2, by, cx: W / 2, ly: H * 0.23 };
    };
    const racketPose = (side, t, G) => { /* side: -1 roja (izq), 1 azul (der) */
      const dI = G.rs * 0.78, dFar = W / 2 + G.rs * 0.2, dHit = G.R + G.rs * 0.6;
      let d = dI, ang = 0.55, a = 1;
      if (t >= 0) {
        if (t < 900) { const k = E.out(seg(t, 0, 900)); d = dI + (dFar - dI) * k; ang = 0.55 + 0.5 * k; }
        else if (t < 1900) { const k = E.in3(seg(t, 900, 1900)); d = dFar + (dHit - dFar) * k; ang = 1.05 - 0.9 * k; }
        else { const k = E.out(seg(t, 1900, 2700)); d = dHit + G.rs * 0.5 * k; ang = 0.15 - 0.25 * k; a = 1 - seg(t, 2300, 2900); }
      }
      return { x: G.cx + side * d, y: G.by + G.rs * 0.25, ang: -side * ang, a };
    };

    /* ---- dibujo ---- */
    const draw = (now) => {
      const dt = Math.min(0.05, (now - (last || now)) / 1000); last = now;
      const rt = run ? now - t0 : -1, t = run ? rt / K : -1, G = geo(), cx = G.cx;
      if (run && t >= 6500 && !loadStart) loadStart = now;
      if (loadStart && now - loadStart >= LOAD + 300) finish();
      const L = run ? 0.35 + 0.65 * E.out(seg(t, 0, 700)) : 0.35 + 0.05 * Math.sin(now / 1100);
      const pm = run ? 1 + 2.2 * E.out(seg(t, 0, 900)) - 1.2 * seg(t, 3000, 5000) : 1;
      /* camara */
      let z = 1, sx = 0, sy = 0;
      if (run) {
        z = 1 + 0.05 * E.io(seg(t, 0, 900)) - 0.05 * E.io(seg(t, 1500, 2200)) + 0.09 * E.out(seg(t, 2650, 3050)) - 0.09 * E.io(seg(t, 3050, 4600));
        const sh = (t >= 1900 ? 6 * Math.exp(-(t - 1900) / 160) : 0) + (t >= 2700 ? 8 * Math.exp(-(t - 2700) / 180) : 0);
        sx = Math.sin(t * 0.09) * sh; sy = Math.cos(t * 0.11) * sh;
      }
      z *= 1 + 0.012 * Math.sin(now / 2800); sx += Math.sin(now / 3300) * 3;
      g.setTransform(dpr, 0, 0, dpr, 0, 0); g.fillStyle = BG; g.fillRect(0, 0, W, H);
      g.setTransform(dpr * z, 0, 0, dpr * z, dpr * (cx * (1 - z) + sx), dpr * (H / 2 * (1 - z) + sy));
      /* luces: rojo a la izquierda, azul a la derecha */
      [[-W * 0.05, '255,23,68'], [W * 1.05, '22,119,255']].forEach(([x, c]) => {
        const q = g.createRadialGradient(x, H * 0.38, 0, x, H * 0.38, H * 0.85); q.addColorStop(0, `rgba(${c},${0.34 * L})`); q.addColorStop(1, `rgba(${c},0)`); g.fillStyle = q; g.fillRect(-W * 0.2, -H * 0.2, W * 1.4, H * 1.4);
      });
      /* haces de luz de los focos */
      [[0.04, 1, '255,23,68'], [0.96, -1, '22,119,255']].forEach(([fx, s2, c]) => {
        const ax = W * fx, yb = H * 0.72, gq = g.createLinearGradient(ax, 0, ax + s2 * W * 0.2, yb); gq.addColorStop(0, `rgba(${c},${0.2 * L})`); gq.addColorStop(1, `rgba(${c},0)`);
        g.fillStyle = gq; g.beginPath(); g.moveTo(ax - s2 * 6, -4); g.lineTo(ax + s2 * 6, -4); g.lineTo(ax + s2 * W * 0.62, yb); g.lineTo(ax + s2 * W * 0.1, yb); g.closePath(); g.fill();
      });
      /* neones de los extremos */
      const fl = run ? seg(t, 150, 700) * (0.75 + 0.25 * Math.sin(t / 60)) : 0.12;
      for (let k = 0; k < 3; k++) {
        [[-1, '#FF1744'], [1, '#1677FF']].forEach(([s, c]) => {
          const x = s < 0 ? W * (0.03 + k * 0.07) : W * (0.97 - k * 0.07), y = H * (0.05 + k * 0.035), l = W * 0.12;
          g.save(); g.globalAlpha = (0.2 + 0.6 * (k === 1 ? fl : fl * 0.8)); g.strokeStyle = c; g.lineWidth = 3.5; g.lineCap = 'round'; g.beginPath();
          g.moveTo(x, y); g.lineTo(x + s * l * Math.cos(0.35), y + l * Math.sin(0.35)); g.stroke(); g.restore();
        });
      }
      /* suelo con reflejos */
      const yF = H * 0.72; let q = g.createLinearGradient(0, yF, 0, H); q.addColorStop(0, '#070c2c'); q.addColorStop(1, '#03051a'); g.fillStyle = q; g.fillRect(-W * 0.2, yF, W * 1.4, H);
      g.save(); g.strokeStyle = 'rgba(200,208,224,.07)'; g.lineWidth = 1;
      for (let i = -6; i <= 6; i++) { g.beginPath(); g.moveTo(cx + i * W * 0.04, yF); g.lineTo(cx + i * W * 0.22, H); g.stroke(); }
      for (let i = 1; i < 6; i++) { const y = yF + (H - yF) * Math.pow(i / 6, 1.8); g.beginPath(); g.moveTo(0, y); g.lineTo(W, y); g.stroke(); }
      g.restore();
      [[W * 0.1, '255,23,68'], [W * 0.9, '22,119,255']].forEach(([x, c]) => { g.save(); g.translate(x, yF + 6); g.scale(1, 0.18); const r = g.createRadialGradient(0, 0, 0, 0, 0, W * 0.5); r.addColorStop(0, `rgba(${c},${0.3 * L})`); r.addColorStop(1, `rgba(${c},0)`); g.fillStyle = r; g.beginPath(); g.arc(0, 0, W * 0.5, 0, 7); g.fill(); g.restore(); });
      g.fillStyle = `rgba(255,255,255,${0.1 * L})`; g.fillRect(cx - 1.5, yF, 3, H - yF);
      /* humo */
      const sm = run ? 0.12 + 0.16 * seg(t, 2700, 4500) : 0.1;
      smoke.forEach((p) => { const x = (p.side ? W * (0.62 + 0.4 * p.x) : W * (-0.1 + 0.4 * p.x)) + Math.sin(now / 3000 * p.sp * 3 + p.ph) * W * 0.04, w = W * p.sz; g.globalAlpha = sm * (0.7 + 0.3 * Math.sin(now / 2000 + p.ph)) * L; g.drawImage(p.side ? smB : smR, x - w / 2, H * p.y - w / 3, w, w * 0.7); });
      g.globalAlpha = 1;
      /* particulas */
      parts.forEach((p) => {
        p.x += p.vx * p.z * dt * pm; p.y += p.vy * p.z * dt * pm; if (p.y < -5) { p.y = H + 5; p.x = rnd() * W; } if (p.x < -5) p.x = W + 5; if (p.x > W + 5) p.x = -5;
        g.globalAlpha = (0.15 + 0.35 * p.z) * (0.6 + 0.4 * Math.sin(p.ph + now / 700)); g.fillStyle = p.c < 0.4 ? '#ff8fa3' : p.c < 0.8 ? '#8fbcff' : '#C8D0E0';
        g.beginPath(); g.arc(p.x, p.y, 0.6 + p.z * 1.4, 0, 7); g.fill();
      });
      g.globalAlpha = 1;

      /* eventos por tiempo */
      if (run) {
        if (t >= 300 && !ev.a) { ev.a = 1; emit(18, W * 0.04, H * 0.08, 140, ['#FF1744', '#ff8fa3']); emit(18, W * 0.96, H * 0.08, 140, ['#1677FF', '#8fbcff']); }
        if (t >= 520 && !ev.b) { ev.b = 1; emit(14, W * 0.04, H * 0.14, 120, ['#FF1744']); emit(14, W * 0.96, H * 0.14, 120, ['#1677FF']); }
        if (t >= 1900 && !ev.c) { ev.c = 1; emit(70, cx, G.by, 380, ['#ffffff', '#FF1744', '#1677FF', '#C8D0E0'], 0.8); ring(cx, G.by, now, 650, G.m * 0.5, '255,255,255'); ring(cx, G.by, now, 800, G.m * 0.75, '255,23,68'); ring(cx, G.by, now + 80, 800, G.m * 0.75, '22,119,255'); flash(cx, G.by, now, 0.8, 450); }
        if (t >= 2700 && !ev.d) { ev.d = 1; const ly = H * 0.44; emit(60, cx, ly, 420, ['#ffffff', '#FF1744', '#1677FF'], 0.9); ring(cx, ly, now, 900, W * 0.6, '255,255,255'); ring(cx, ly, now + 100, 1000, W * 0.8, '200,208,224'); flash(cx, ly, now, 0.9, 700); }
      }
      /* raquetas */
      const showR = !run || t < 2900;
      if (showR) {
        [[-1, RED], [1, BLUE]].forEach(([side, col]) => {
          const tt = run ? t : -1, fade = run ? 1 - 0.0 : 1;
          if (run && t > 900 && t < 1950) for (let k = 3; k >= 1; k--) { const p = racketPose(side, t - k * 22, G); g.save(); g.globalAlpha = 0.1 * (4 - k); racket(g, p.x, p.y, p.ang, G.rs, col); g.restore(); }
          const p = racketPose(side, tt, G); g.save(); g.globalAlpha = fade; racket(g, p.x, p.y + (run ? 0 : Math.sin(now / 1300 + side) * 3), p.ang, G.rs, col, p.a); g.restore();
        });
      }
      /* pelota */
      const bob = run ? (1 - seg(t, 0, 300)) : 1; let bx = cx, by = G.by + Math.sin(now / 900) * 6 * bob, br = G.R, bs = 1, ba = 1, vis = true;
      if (run && t >= 1900) {
        const p = seg(t, 1900, 2650); if (t >= 2650) vis = false; else { const k = E.in2(p); bx = cx + W * 0.2 * k; by = G.by - (G.by + br * 5) * k; br = G.R * (1 - 0.35 * k); bs = t < 1990 ? 0.8 : 1; }
      }
      if (vis) {
        if (!run || t < 1900) { g.fillStyle = 'rgba(0,0,0,.32)'; g.beginPath(); g.ellipse(bx, H * 0.72 + (H - H * 0.72) * 0.16, br * 1.5 * (1 - 0.1 * Math.sin(now / 900)), br * 0.3, 0, 0, 7); g.fill(); }
        if (run && t >= 1900) { trail.push({ x: bx, y: by, r: br }); if (trail.length > 24) trail.shift(); }
        for (let i = 0; i < trail.length; i++) { const p = trail[i], k = i / trail.length; g.globalAlpha = 0.35 * k; g.fillStyle = k > 0.5 ? '#e8eefc' : '#8fa3d8'; g.beginPath(); g.arc(p.x, p.y, p.r * (0.2 + 0.7 * k), 0, 7); g.fill(); }
        g.globalAlpha = 1;
        const hal = g.createRadialGradient(bx, by, br * 0.5, bx, by, br * 2.4); hal.addColorStop(0, `rgba(220,230,255,${0.1 + 0.08 * L})`); hal.addColorStop(1, 'rgba(220,230,255,0)'); g.fillStyle = hal; g.beginPath(); g.arc(bx, by, br * 2.4, 0, 7); g.fill();
        g.save(); g.translate(bx, by); g.scale(1 / bs, bs);
        let b = g.createRadialGradient(-br * 0.35, -br * 0.4, br * 0.1, 0, 0, br); b.addColorStop(0, '#ffffff'); b.addColorStop(0.55, '#e4e9f4'); b.addColorStop(1, '#9ba6c0'); g.fillStyle = b; g.beginPath(); g.arc(0, 0, br, 0, 7); g.fill();
        g.save(); g.rotate(now / 500); g.strokeStyle = 'rgba(110,122,155,.4)'; g.lineWidth = br * 0.06; g.beginPath(); g.ellipse(0, 0, br * 0.9, br * 0.35, 0, 0.2, 2.9); g.stroke(); g.restore();
        b = g.createRadialGradient(-br, 0, 0, -br, 0, br * 1.3); b.addColorStop(0, `rgba(255,23,68,${0.28 * L})`); b.addColorStop(1, 'rgba(255,23,68,0)'); g.fillStyle = b; g.beginPath(); g.arc(0, 0, br, 0, 7); g.fill();
        b = g.createRadialGradient(br, 0, 0, br, 0, br * 1.3); b.addColorStop(0, `rgba(22,119,255,${0.28 * L})`); b.addColorStop(1, 'rgba(22,119,255,0)'); g.fillStyle = b; g.beginPath(); g.arc(0, 0, br, 0, 7); g.fill();
        g.restore();
      }
      /* logo */
      if (logo) {
        const hs = logo.height, idleA = run ? 1 - seg(t, 0, 450) : 1, finA = run ? E.out(seg(t, 2700, 2850)) : 0;
        if (idleA > 0.01) { const sc = 0.88, y = G.ly + Math.sin(now / 1400) * 3; g.globalAlpha = idleA; g.drawImage(logo, cx - S * sc / 2, y - hs * sc / 2, S * sc, hs * sc); g.globalAlpha = 1; }
        if (run && finA > 0.01) {
          const k = seg(t, 2700, 3400), sc = 1.55 - 0.55 * E.back(k), y = H * 0.44 + Math.sin(now / 1500) * 3, w = S * sc, h = hs * sc;
          g.globalAlpha = finA; g.drawImage(logo, cx - w / 2, y - h / 2, w, h);
          const ry = 2 * yF - (y + h / 2); if (refl && ry < H) { g.globalAlpha = finA * 0.5; g.drawImage(refl, cx - w / 2, ry, w, h); g.globalAlpha = finA; }
          const fa = 1 - seg(t, 2700, 3700); if (fa > 0) { const fg = g.createLinearGradient(0, 0, W, 0); fg.addColorStop(0, 'rgba(255,23,68,0)'); fg.addColorStop(0.2, `rgba(255,23,68,${0.7 * fa})`); fg.addColorStop(0.5, `rgba(255,255,255,${0.9 * fa})`); fg.addColorStop(0.8, `rgba(22,119,255,${0.7 * fa})`); fg.addColorStop(1, 'rgba(22,119,255,0)'); g.fillStyle = fg; g.fillRect(0, y - 1.5, W, 3); }
          const sw = t < 4600 ? seg(t, 3700, 4500) : loadStart ? ((now - loadStart) / 1700) % 1 : seg(t, 5200, 5900);
          if (sw > 0 && sw < 1) { /* destello de luz que recorre el metal */
            const tmp = rs2c(logo); const tg = tmp.getContext('2d'); tg.globalCompositeOperation = 'source-atop'; const px = -logo.width * 0.3 + sw * logo.width * 1.6, qq = tg.createLinearGradient(px - 40, 0, px + 40, logo.height * 0.4);
            qq.addColorStop(0, 'rgba(255,255,255,0)'); qq.addColorStop(0.5, 'rgba(255,255,255,.32)'); qq.addColorStop(1, 'rgba(255,255,255,0)'); tg.fillStyle = qq; tg.fillRect(0, 0, logo.width, logo.height); g.drawImage(tmp, cx - w / 2, y - h / 2, w, h);
          }
          g.globalAlpha = 1;
        }
      }
      /* chispas, ondas y destellos */
      for (let i = sparks.length - 1; i >= 0; i--) {
        const s = sparks[i]; s.x += s.vx * dt; s.y += s.vy * dt; const f = Math.pow(0.04, dt); s.vx *= f; s.vy *= f; s.l -= dt; if (s.l <= 0) { sparks.splice(i, 1); continue; }
        g.globalAlpha = s.l / s.m; g.strokeStyle = s.c; g.lineWidth = s.w; g.beginPath(); g.moveTo(s.x, s.y); g.lineTo(s.x - s.vx * 0.04, s.y - s.vy * 0.04); g.stroke();
      }
      for (let i = rings.length - 1; i >= 0; i--) {
        const r = rings[i], k = (now - r.t) / r.dur; if (k < 0) continue; if (k >= 1) { rings.splice(i, 1); continue; }
        g.globalAlpha = 0.5 * (1 - k); g.strokeStyle = `rgb(${r.c})`; g.lineWidth = 2.5 * (1 - k) + 0.5; g.beginPath(); g.arc(r.x, r.y, 8 + E.out(k) * r.r1, 0, 7); g.stroke();
      }
      g.globalAlpha = 1;
      flashes = flashes.filter((f) => now - f.t < f.dur);
      flashes.forEach((f) => { const k = (now - f.t) / f.dur, a = f.a * (1 - k) * (1 - k) * 0.4, r = g.createRadialGradient(f.x, f.y, 0, f.x, f.y, W * 0.7); r.addColorStop(0, `rgba(255,255,255,${a})`); r.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = r; g.fillRect(-W * 0.2, -H * 0.2, W * 1.4, H * 1.4); });
      /* linea electrica fina bajo "TOCA PARA JUGAR" */
      const la = run ? 1 - seg(rt, 0, 450) : 1;
      if (la > 0.01 && uiY) {
        g.setTransform(dpr, 0, 0, dpr, 0, 0); const x0 = W * 0.14, x1 = W * 0.86, n = 36;
        if (now > eNext) { eNext = now + 55; for (let i = 0; i <= n; i++) eo[i] = rnd() - 0.5; }
        const lg = g.createLinearGradient(x0, 0, x1, 0); lg.addColorStop(0, '#FF1744'); lg.addColorStop(0.5, '#e6ebff'); lg.addColorStop(1, '#1677FF');
        [[8, 0.07, 6], [3, 0.3, 9], [1.2, 0.95, 6]].forEach(([lw, al, am]) => {
          g.beginPath(); for (let i = 0; i <= n; i++) { const x = x0 + (x1 - x0) * i / n, yy = uiY + eo[i] * am * Math.sin(Math.PI * i / n); i ? g.lineTo(x, yy) : g.moveTo(x, yy); }
          g.globalAlpha = la * al * (0.8 + 0.2 * Math.sin(now / 90)); g.strokeStyle = lg; g.lineWidth = lw; g.lineJoin = 'round'; g.stroke();
        });
        const px = x0 + ((now / 1100) % 1) * (x1 - x0); g.globalAlpha = la * 0.9; g.fillStyle = '#fff'; g.beginPath(); g.arc(px, uiY, 2.2, 0, 7); g.fill();
        g.fillStyle = '#FF1744'; g.beginPath(); g.arc(x0, uiY, 2.8, 0, 7); g.fill(); g.fillStyle = '#1677FF'; g.beginPath(); g.arc(x1, uiY, 2.8, 0, 7); g.fill(); g.globalAlpha = 1;
        if (!run && rnd() < 0.18) emit(1, x0 + rnd() * (x1 - x0), uiY, 70, [rnd() < 0.5 ? '#ff8fa3' : '#8fbcff'], 0.5);
        if (run && !ev.e) { ev.e = 1; emit(26, W * 0.3, uiY, 160, ['#ff8fa3', '#ffffff']); emit(26, W * 0.7, uiY, 160, ['#8fbcff', '#ffffff']); }
      }
      /* barra de carga: se llena y entonces entra el juego */
      if (loadStart) {
        g.setTransform(dpr, 0, 0, dpr, 0, 0);
        const el = now - loadStart, p = E.io(clamp(el / LOAD)), a = E.out(seg(el, 0, 400)), x0 = W * 0.14, x1 = W * 0.86, y = uiY || H * 0.9, xe = x0 + (x1 - x0) * p;
        g.globalAlpha = a; g.fillStyle = 'rgba(200,208,224,.14)'; g.beginPath(); g.roundRect ? g.roundRect(x0, y - 2, x1 - x0, 4, 2) : g.rect(x0, y - 2, x1 - x0, 4); g.fill();
        const bg = g.createLinearGradient(x0, 0, x1, 0); bg.addColorStop(0, '#FF1744'); bg.addColorStop(0.5, '#e6ebff'); bg.addColorStop(1, '#1677FF');
        g.fillStyle = bg; g.beginPath(); g.roundRect ? g.roundRect(x0, y - 2, Math.max(4, xe - x0), 4, 2) : g.rect(x0, y - 2, Math.max(4, xe - x0), 4); g.fill();
        const hg = g.createRadialGradient(xe, y, 0, xe, y, 12); hg.addColorStop(0, 'rgba(255,255,255,.55)'); hg.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = hg; g.beginPath(); g.arc(xe, y, 12, 0, 7); g.fill();
        g.fillStyle = '#fff'; g.beginPath(); g.arc(xe, y, 2.4, 0, 7); g.fill();
        g.fillStyle = 'rgba(200,208,224,.85)'; g.font = '700 12px "Roboto",system-ui,sans-serif'; g.textAlign = 'center'; g.textBaseline = 'alphabetic'; if ('letterSpacing' in g) g.letterSpacing = '4px';
        g.fillText('CARGANDO  ' + Math.round(p * 100) + '%', W / 2, y - 16); if ('letterSpacing' in g) g.letterSpacing = '0px'; g.globalAlpha = 1;
        if (p >= 1 && !ev.f) { ev.f = 1; emit(30, x1, y, 220, ['#8fbcff', '#ffffff', '#1677FF'], 0.6); flash(x1, y, now, 0.35, 400); }
      }
      /* oscurecer un poco al tocar */
      if (run) { g.setTransform(dpr, 0, 0, dpr, 0, 0); g.fillStyle = `rgba(5,9,31,${0.25 * Math.sin(Math.PI * seg(t, 0, 900))})`; g.fillRect(0, 0, W, H); }
    };
    const rs2c = (src) => { const c = document.createElement('canvas'); c.width = src.width; c.height = src.height; c.getContext('2d').drawImage(src, 0, 0); return c; };
    const frame = (now) => { if (ended) return; raf = requestAnimationFrame(frame); try { draw(now); } catch (e) { if (!frame.w) { frame.w = 1; console.warn('intro', e); } } };
    raf = requestAnimationFrame(frame);
  });
}
