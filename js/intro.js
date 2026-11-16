/* intro.js · intro cinematográfica 3D de D.M.R PING PONG (escena propia de Three.js, sin archivos de imagen ni audio).
   Orden: luces rojas/azules se encienden → sube la mesa con neón → la pelota entra con estela de fuego y revienta el logo →
          cae la corona → entran las raquetas y las banderas → "TÓCALE PARA JUGAR" pulsante → al tocar, la cámara se lanza a la mesa y se abre el menú.
   Rendimiento: un solo renderer, partículas y sprites reutilizados (pool), menos humo en gama baja; al terminar se libera todo. */
import * as THREE from '../vendor/three.module.min.js';
import { SET } from './state.js';
import { lang } from './i18n.js';
import EX from './lang/extra.js';
const tapTxt = () => ((EX[lang()] || EX.es || {}).intro_tap) || (EX.en || {}).intro_tap || 'TAP TO PLAY';

const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const seg = (t, a, b) => clamp((t - a) / (b - a));
const lerp = (a, b, k) => a + (b - a) * k;
const E = {
  out: (x) => 1 - Math.pow(1 - x, 3), io: (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2), in2: (x) => x * x,
  back: (x) => 1 + 2.2 * Math.pow(x - 1, 3) + 1.2 * Math.pow(x - 1, 2),
  bounce: (x) => { const n = 7.5625, d = 2.75; if (x < 1 / d) return n * x * x; if (x < 2 / d) return n * (x -= 1.5 / d) * x + 0.75; if (x < 2.5 / d) return n * (x -= 2.25 / d) * x + 0.9375; return n * (x -= 2.625 / d) * x + 0.984375; },
};
const mk = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };
const TEX = (cv, srgb = true) => { const t = new THREE.CanvasTexture(cv); if (srgb) t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t; };
const RED = '#ff2d4f', BLUE = '#2f7bff';

/* línea de tiempo (segundos) */
const TL = { lightR: 0.45, lightB: 0.8, table: 0.7, tableEnd: 2.3, ball: 1.15, impact: 2.75, game: 3.0, crown: 3.25, banner: 3.05, pad: 3.3, prompt: 4.4, ready: 4.6 };

const CSS = `
#intro{position:fixed;inset:0;z-index:60;background:#000;overflow:hidden;touch-action:none;user-select:none;-webkit-user-select:none;-webkit-tap-highlight-color:transparent;opacity:0;transition:opacity .35s}
#intro.on{opacity:1}#intro.off{opacity:0;transition:opacity .55s ease-in}
#intro canvas{position:absolute;inset:0;width:100%;height:100%;display:block}
#intro #itFl{position:absolute;inset:0;background:#fff;opacity:0;pointer-events:none}
#intro #itVg{position:absolute;inset:0;pointer-events:none;background:radial-gradient(ellipse at 50% 46%,rgba(0,0,0,0) 48%,rgba(0,0,0,.55) 100%)}
#intro button{font-family:inherit;cursor:pointer;border:0;background:none;color:#fff;padding:0}
#itGo{position:absolute;left:50%;bottom:calc(9% + env(safe-area-inset-bottom,0px));transform:translateX(-50%);width:min(88vw,480px);padding:0;opacity:0;pointer-events:none;transition:opacity .7s .5s}
#intro.title #itGo{opacity:1;pointer-events:auto}
#itGo svg{display:block;width:100%;height:30px;overflow:visible}
#itGo .base{stroke:url(#itG);stroke-width:1.6;fill:none;filter:drop-shadow(0 0 3px rgba(120,160,255,.9))}
#itGo .bolt{stroke:#e6f0ff;stroke-width:1.5;fill:none;stroke-linejoin:round;stroke-linecap:round;filter:drop-shadow(0 0 3px #6aa8ff) drop-shadow(0 0 7px #ff2d4f);opacity:0}
#itGo .tx{display:block;text-align:center;margin-top:12px;font-weight:800;letter-spacing:.34em;text-indent:.34em;white-space:nowrap;font-size:clamp(13px,3.9vw,19px);color:#fff;
 text-shadow:0 0 8px rgba(130,170,255,.95),0 0 20px rgba(255,45,79,.65);animation:itTx 1.7s ease-in-out infinite}
@keyframes itTx{0%,100%{opacity:.55;transform:scale(1)}50%{opacity:1;transform:scale(1.04)}}
#itSnd{position:absolute;top:calc(14px + env(safe-area-inset-top,0px));right:calc(14px + env(safe-area-inset-right,0px));width:42px;height:42px;border-radius:50%!important;background:rgba(10,16,52,.7)!important;border:1.5px solid rgba(200,208,224,.35)!important;display:grid;place-items:center;z-index:3}
#itSnd svg{width:22px;height:22px;stroke:#C8D0E0;fill:none;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}
#itSnd .x{display:none}#itSnd.mute .w{display:none}#itSnd.mute .x{display:block}
@media (prefers-reduced-motion:reduce){#itGo .tx{animation:none}}`;

/* ---------------------------------------------------------------- texturas dibujadas (canvas) */
function glowTex() { const c = mk(64, 64), g = c.getContext('2d'), q = g.createRadialGradient(32, 32, 0, 32, 32, 32); q.addColorStop(0, 'rgba(255,255,255,1)'); q.addColorStop(0.3, 'rgba(255,255,255,.5)'); q.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = q; g.fillRect(0, 0, 64, 64); return TEX(c, false); }
function smokeTex() {
  const c = mk(128, 128), g = c.getContext('2d');
  for (let i = 0; i < 9; i++) { const x = 30 + Math.random() * 68, y = 30 + Math.random() * 68, r = 22 + Math.random() * 26, q = g.createRadialGradient(x, y, 0, x, y, r); q.addColorStop(0, 'rgba(255,255,255,.5)'); q.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = q; g.fillRect(0, 0, 128, 128); }
  return TEX(c, false);
}
function lineGrad(g, x0, x1, stops) { const q = g.createLinearGradient(x0, 0, x1, 0); stops.forEach(([o, c]) => q.addColorStop(o, c)); return q; }
const FONT = (px) => `italic 900 ${px}px Impact,"Arial Black","Roboto Black","sans-serif-black",sans-serif`;

/* logo "PING PONG": capas separadas (brillo · fondo con relieve · cara cromada) para que se vea profundidad al mover la cámara */
function logoCanvases() {
  const W = 1600, H = 640, cx = W / 2, cy = 330, txt = 'PING PONG', target = 1480, size = 400;
  const setup = (g) => { g.font = FONT(size); g.textAlign = 'center'; g.textBaseline = 'middle'; g.lineJoin = 'round'; g.lineCap = 'round'; const w = g.measureText(txt).width; return target / w; };
  const draw = (g, fn) => { g.save(); const sx = setup(g); g.translate(cx, cy); g.scale(sx, 1); fn(g); g.restore(); };
  /* 1) brillo de color (rojo ↔ azul) */
  const glow = mk(W, H), gg = glow.getContext('2d');
  gg.shadowBlur = 70; gg.shadowColor = '#ff2d4f'; gg.strokeStyle = lineGrad(gg, 100, 1500, [[0, RED], [0.5, '#9b3dff'], [1, BLUE]]); gg.lineWidth = 34;
  draw(gg, (g) => { g.lineWidth = 34 / 1; g.strokeText(txt, 0, 0); g.strokeText(txt, 0, 0); });
  /* 2) fondo: relieve oscuro + contorno */
  const back = mk(W, H), bg = back.getContext('2d');
  draw(bg, (g) => {
    for (let i = 26; i >= 1; i--) { g.fillStyle = `rgb(${10 + (26 - i)},${12 + (26 - i)},${34 + (26 - i) * 2})`; g.strokeStyle = g.fillStyle; g.lineWidth = 30; g.strokeText(txt, i * 0.5, i * 1.1); g.fillText(txt, i * 0.5, i * 1.1); }
    g.strokeStyle = '#04050f'; g.lineWidth = 38; g.strokeText(txt, 0, 0);
    g.strokeStyle = lineGrad(g, -740, 740, [[0, RED], [0.5, '#c9d2ee'], [1, BLUE]]); g.lineWidth = 22; g.strokeText(txt, 0, 0);
    g.strokeStyle = '#0a0d22'; g.lineWidth = 11; g.strokeText(txt, 0, 0);
  });
  /* 3) cara cromada */
  const face = mk(W, H), fg = face.getContext('2d');
  draw(fg, (g) => { g.fillStyle = '#fff'; g.fillText(txt, 0, 0); });
  fg.globalCompositeOperation = 'source-atop';
  let q = fg.createLinearGradient(0, cy - 150, 0, cy + 170);
  [[0, '#ffffff'], [0.3, '#dfe6f4'], [0.46, '#8d99b8'], [0.5, '#232b48'], [0.6, '#5f6d94'], [0.82, '#cdd6ea'], [1, '#ffffff']].forEach(([o, c]) => q.addColorStop(o, c));
  fg.fillStyle = q; fg.fillRect(0, 0, W, H);
  fg.globalAlpha = 0.28; fg.strokeStyle = '#fff'; fg.lineWidth = 3; for (let x = -200; x < W + 200; x += 46) { fg.beginPath(); fg.moveTo(x, 0); fg.lineTo(x + 240, H); fg.stroke(); }
  fg.globalAlpha = 0.5; q = fg.createLinearGradient(0, 0, W, 0); q.addColorStop(0, 'rgba(255,45,79,.6)'); q.addColorStop(0.18, 'rgba(255,45,79,0)'); q.addColorStop(0.82, 'rgba(47,123,255,0)'); q.addColorStop(1, 'rgba(47,123,255,.65)'); fg.fillStyle = q; fg.fillRect(0, 0, W, H);
  fg.globalAlpha = 1; fg.globalCompositeOperation = 'source-over';
  draw(fg, (g) => { g.strokeStyle = 'rgba(255,255,255,.9)'; g.lineWidth = 3; g.strokeText(txt, 0, 0); });
  /* 4) máscara (para el destello) */
  const mask = mk(W, H), mg = mask.getContext('2d'); mg.fillStyle = '#000'; mg.fillRect(0, 0, W, H); draw(mg, (g) => { g.fillStyle = '#fff'; g.fillText(txt, 0, 0); });
  return { glow, back, face, mask, W, H };
}
function gameCanvas() {
  const W = 900, H = 420, c = mk(W, H), g = c.getContext('2d'); g.font = FONT(300); g.textAlign = 'center'; g.textBaseline = 'middle'; g.lineJoin = 'round';
  const sx = 760 / g.measureText('GAME').width; g.translate(W / 2, H / 2); g.scale(sx, 1); g.rotate(-0.06);
  g.shadowColor = '#ff1030'; g.shadowBlur = 40; g.strokeStyle = '#ff1030'; g.lineWidth = 40; g.strokeText('GAME', 0, 0); g.shadowBlur = 0;
  g.strokeStyle = '#08030a'; g.lineWidth = 36; g.strokeText('GAME', 0, 0);
  g.strokeStyle = '#fff'; g.lineWidth = 16; g.strokeText('GAME', 0, 0);
  const q = g.createLinearGradient(0, -130, 0, 130); [[0, '#ff6a7a'], [0.45, '#e0112f'], [1, '#6a0016']].forEach(([o, cc]) => q.addColorStop(o, cc)); g.fillStyle = q; g.fillText('GAME', 0, 0);
  g.globalCompositeOperation = 'source-atop'; g.strokeStyle = 'rgba(255,255,255,.35)'; g.lineWidth = 5; for (let x = -420; x < 420; x += 38) { g.beginPath(); g.moveTo(x, -140); g.lineTo(x + 90, 140); g.stroke(); }
  return c;
}
function crownCanvas() {
  const W = 512, H = 380, c = mk(W, H), g = c.getContext('2d'); g.lineJoin = 'round';
  const pts = [[60, 300], [30, 100], [140, 190], [256, 40], [372, 190], [482, 100], [452, 300]];
  const path = () => { g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.closePath(); };
  g.shadowColor = '#ffb000'; g.shadowBlur = 36; path(); g.fillStyle = '#ffb000'; g.fill(); g.shadowBlur = 0;
  path(); const q = g.createLinearGradient(0, 40, 0, 320); [[0, '#fff3a8'], [0.35, '#ffd21f'], [0.7, '#c98a00'], [1, '#7a4a00']].forEach(([o, cc]) => q.addColorStop(o, cc)); g.fillStyle = q; g.fill(); g.strokeStyle = '#4a2a00'; g.lineWidth = 12; g.stroke();
  const band = g.createLinearGradient(0, 290, 0, 350); band.addColorStop(0, '#ffe36a'); band.addColorStop(1, '#8a5a00'); g.fillStyle = band; g.fillRect(52, 292, 408, 56); g.strokeStyle = '#4a2a00'; g.lineWidth = 10; g.strokeRect(52, 292, 408, 56);
  [[256, 70, '#ff2d4f'], [30, 100, '#2f7bff'], [482, 100, '#19e68c'], [140, 190, '#ffffff'], [372, 190, '#ffffff']].forEach(([x, y, cc]) => { g.fillStyle = cc; g.beginPath(); g.arc(x, y, 18, 0, 7); g.fill(); g.strokeStyle = '#4a2a00'; g.lineWidth = 5; g.stroke(); g.fillStyle = 'rgba(255,255,255,.7)'; g.beginPath(); g.arc(x - 5, y - 6, 5, 0, 7); g.fill(); });
  [[130, 320, '#ff2d4f'], [256, 320, '#2f7bff'], [382, 320, '#ff2d4f']].forEach(([x, y, cc]) => { g.fillStyle = cc; g.beginPath(); g.ellipse(x, y, 20, 14, 0, 0, 7); g.fill(); g.stroke(); });
  return c;
}
function bannerCanvas(col) {
  const W = 256, H = 540, c = mk(W, H), g = c.getContext('2d');
  const bg = g.createLinearGradient(0, 0, 0, H); bg.addColorStop(0, '#10143a'); bg.addColorStop(1, '#04051a');
  g.beginPath(); g.moveTo(8, 0); g.lineTo(W - 8, 0); g.lineTo(W - 8, H - 90); g.lineTo(W / 2, H - 20); g.lineTo(8, H - 90); g.closePath(); g.fillStyle = bg; g.fill();
  g.shadowColor = col; g.shadowBlur = 18; g.strokeStyle = col; g.lineWidth = 7; g.stroke(); g.shadowBlur = 0;
  const cr = crownCanvas(); g.globalAlpha = 0.9; g.drawImage(cr, 58, 150, 140, 104); g.globalAlpha = 0.5; g.fillStyle = col; g.fillRect(40, 300, 176, 6); g.fillRect(70, 322, 116, 4);
  return c;
}
function dmrCanvas() {
  const W = 880, H = 220, c = mk(W, H), g = c.getContext('2d'); g.font = FONT(170); g.textAlign = 'center'; g.textBaseline = 'middle'; g.lineJoin = 'round'; g.translate(W / 2, H / 2 + 6);
  const q = g.createLinearGradient(-330, 0, 330, 0); q.addColorStop(0, RED); q.addColorStop(0.5, '#ffffff'); q.addColorStop(1, BLUE);
  g.shadowColor = '#6aa8ff'; g.shadowBlur = 30; g.strokeStyle = q; g.lineWidth = 16; g.strokeText('D.M.R', 0, 0); g.shadowBlur = 0; g.strokeStyle = '#04050f'; g.lineWidth = 12; g.strokeText('D.M.R', 0, 0); g.fillStyle = q; g.fillText('D.M.R', 0, 0);
  return c;
}
function tableTopCanvas() {
  const W = 1024, H = 640, c = mk(W, H), g = c.getContext('2d'), q = g.createLinearGradient(0, 0, W, H);
  q.addColorStop(0, '#060b30'); q.addColorStop(0.5, '#0c1a66'); q.addColorStop(1, '#060b30'); g.fillStyle = q; g.fillRect(0, 0, W, H);
  g.globalAlpha = 0.07; g.strokeStyle = '#9fb4ff'; g.lineWidth = 3; for (let i = -H; i < W; i += 70) { g.beginPath(); g.moveTo(i, 0); g.lineTo(i + H, H); g.stroke(); } g.globalAlpha = 1;
  const v = g.createRadialGradient(W / 2, H / 2, 80, W / 2, H / 2, 640); v.addColorStop(0, 'rgba(120,150,255,.14)'); v.addColorStop(1, 'rgba(0,0,0,.45)'); g.fillStyle = v; g.fillRect(0, 0, W, H);
  g.strokeStyle = 'rgba(255,255,255,.92)'; g.lineWidth = 9; g.strokeRect(12, 12, W - 24, H - 24); g.lineWidth = 6; g.beginPath(); g.moveTo(W / 2, 16); g.lineTo(W / 2, H - 16); g.stroke(); g.lineWidth = 4; g.globalAlpha = 0.5; g.beginPath(); g.moveTo(16, H / 2); g.lineTo(W - 16, H / 2); g.stroke(); g.globalAlpha = 1;
  g.strokeStyle = lineGrad(g, 0, W, [[0, 'rgba(255,45,79,.85)'], [0.5, 'rgba(255,255,255,.1)'], [1, 'rgba(47,123,255,.85)']]); g.lineWidth = 5; g.strokeRect(34, 34, W - 68, H - 68);
  return c;
}
function netCanvas() { const c = mk(256, 32), g = c.getContext('2d'); g.strokeStyle = 'rgba(235,242,255,.8)'; g.lineWidth = 1.5; for (let x = 0; x <= 256; x += 8) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, 32); g.stroke(); } for (let y = 0; y <= 32; y += 8) { g.beginPath(); g.moveTo(0, y); g.lineTo(256, y); g.stroke(); } g.fillStyle = '#fff'; g.fillRect(0, 0, 256, 5); return c; }
function coneCanvas() { const c = mk(8, 128), g = c.getContext('2d'), q = g.createLinearGradient(0, 0, 0, 128); q.addColorStop(0, 'rgba(255,255,255,.85)'); q.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = q; g.fillRect(0, 0, 8, 128); return c; }
function sweepCanvas() { const c = mk(128, 8), g = c.getContext('2d'), q = g.createLinearGradient(0, 0, 128, 0); q.addColorStop(0, 'rgba(255,255,255,0)'); q.addColorStop(0.5, 'rgba(255,255,255,.95)'); q.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = q; g.fillRect(0, 0, 128, 8); return c; }
function ballCanvas() { const c = mk(256, 128), g = c.getContext('2d'); g.fillStyle = '#fff6e6'; g.fillRect(0, 0, 256, 128); g.fillStyle = 'rgba(255,170,60,.3)'; g.fillRect(0, 58, 256, 12); g.fillStyle = 'rgba(0,0,0,.1)'; for (let i = 0; i < 70; i++) { g.beginPath(); g.arc(Math.random() * 256, Math.random() * 128, 1.6, 0, 7); g.fill(); } return c; }

/* ---------------------------------------------------------------- sonido (WebAudio generado) */
function mkSfx(muted) {
  const A = window.AudioContext || window.webkitAudioContext, a = new A(), out = a.createGain(), comp = a.createDynamicsCompressor();
  out.gain.value = muted ? 0 : 0.9; comp.threshold.value = -16; comp.ratio.value = 8; out.connect(comp); comp.connect(a.destination);
  const nb = a.createBuffer(1, a.sampleRate * 1.6, a.sampleRate), d = nb.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  const tone = (f, dur, type, v, at = 0, to = 0, lp = 0) => {
    const o = a.createOscillator(), g = a.createGain(), s = a.currentTime + at; o.type = type; o.frequency.setValueAtTime(f, s); if (to) o.frequency.exponentialRampToValueAtTime(to, s + dur);
    g.gain.setValueAtTime(0.0001, s); g.gain.exponentialRampToValueAtTime(v, s + 0.012); g.gain.exponentialRampToValueAtTime(0.0001, s + dur);
    let n = o; if (lp) { const f2 = a.createBiquadFilter(); f2.type = 'lowpass'; f2.frequency.value = lp; o.connect(f2); n = f2; } n.connect(g); g.connect(out); o.start(s); o.stop(s + dur + 0.05);
  };
  const nz = (dur, v, type, f0, f1, at = 0, pan = 0, att = 0.02) => {
    const s = a.createBufferSource(), f = a.createBiquadFilter(), g = a.createGain(), st = a.currentTime + at; s.buffer = nb; f.type = type; f.Q.value = 1.2; f.frequency.setValueAtTime(f0, st); f.frequency.exponentialRampToValueAtTime(f1, st + dur);
    g.gain.setValueAtTime(0.0001, st); g.gain.exponentialRampToValueAtTime(v, st + att); g.gain.exponentialRampToValueAtTime(0.0001, st + dur); s.connect(f); f.connect(g);
    if (pan && a.createStereoPanner) { const p = a.createStereoPanner(); p.pan.value = pan; g.connect(p); p.connect(out); } else g.connect(out); s.start(st); s.stop(st + dur);
  };
  const cues = {
    light() { tone(300, 0.3, 'sine', 0.3, 0, 1000); tone(1500, 0.06, 'square', 0.07, 0.02, 0, 3000); nz(0.35, 0.22, 'highpass', 2000, 6000, 0, 0, 0.01); },
    ball() { nz(1.5, 0.3, 'bandpass', 300, 3200, 0, -0.5, 1.0); tone(140, 1.5, 'sawtooth', 0.09, 0, 700, 1500); },
    impact() { tone(1700, 0.07, 'sine', 0.5, 0, 1100); nz(0.05, 0.4, 'highpass', 3000, 3200); tone(120, 1.4, 'sine', 1, 0, 34); nz(0.9, 0.55, 'lowpass', 1600, 110); tone(55, 2, 'sine', 0.9, 0.05, 36); },
    logo() { [440, 660, 880, 1320].forEach((f, i) => tone(f, 0.45, 'triangle', 0.15, i * 0.1, 0, 5000)); nz(1.6, 0.18, 'highpass', 5000, 7500, 0, 0, 0.04); },
    crown() { tone(1568, 0.7, 'sine', 0.14); tone(2093, 0.9, 'sine', 0.1, 0.08); tone(2637, 1, 'sine', 0.07, 0.16); },
    tap() { tone(900, 0.25, 'sawtooth', 0.16, 0, 90, 3000); nz(0.35, 0.3, 'highpass', 1500, 9000, 0, 0, 0.01); tone(60, 0.5, 'sine', 0.5, 0, 38); },
    zap() { nz(0.16, 0.1, 'highpass', 3500, 8000, 0, (Math.random() - 0.5) * 0.8, 0.005); tone(1800 + Math.random() * 800, 0.07, 'square', 0.025, 0, 300, 4000); },
    start() { nz(0.9, 0.4, 'bandpass', 200, 6000, 0, 0, 0.7); tone(70, 1.1, 'sawtooth', 0.14, 0, 480, 1400); tone(50, 1.2, 'sine', 0.9, 0.75, 32); nz(0.7, 0.4, 'lowpass', 2000, 90, 0.75); },
  };
  let humN = null;
  const hum = (on) => {
    if (on && !humN && a.state === 'running') {
      const g = a.createGain(), f = a.createBiquadFilter(), o1 = a.createOscillator(), o2 = a.createOscillator(), l = a.createOscillator(), lg = a.createGain();
      o1.type = 'sawtooth'; o1.frequency.value = 49; o2.type = 'sine'; o2.frequency.value = 98.5; f.type = 'lowpass'; f.frequency.value = 220; l.frequency.value = 0.35; lg.gain.value = 0.02;
      g.gain.setValueAtTime(0.0001, a.currentTime); g.gain.exponentialRampToValueAtTime(0.1, a.currentTime + 1.6); l.connect(lg); lg.connect(g.gain);
      o1.connect(f); o2.connect(f); f.connect(g); g.connect(out); o1.start(); o2.start(); l.start(); humN = { g, stop() { g.gain.cancelScheduledValues(a.currentTime); g.gain.setTargetAtTime(0.0001, a.currentTime, 0.25); setTimeout(() => { try { o1.stop(); o2.stop(); l.stop(); } catch (e) { /* nada */ } }, 1200); } };
    } else if (!on && humN) { humN.stop(); humN = null; }
    return !!humN;
  };
  return { a, hum, cue(n, force) { if (a.state === 'running') cues[n](); else if (force) a.resume().then(() => cues[n]()).catch(() => {}); }, resume() { try { a.resume(); } catch (e) { /* nada */ } }, mute(m) { out.gain.setTargetAtTime(m ? 0 : 0.9, a.currentTime, 0.03); }, close() { try { out.gain.setTargetAtTime(0, a.currentTime, 0.05); setTimeout(() => a.close(), 500); } catch (e) { /* nada */ } } };
}

/* ================================================================ intro */
export function play() {
  if (window.__dmrIntro) return Promise.resolve();
  window.__dmrIntro = 1; window.__dmrIntroActive = 1;
  return new Promise((done) => {
    if (!document.getElementById('introCss')) { const s = document.createElement('style'); s.id = 'introCss'; s.textContent = CSS; document.head.appendChild(s); }
    let muted = SET.snd === false; try { if (localStorage.getItem('dmr_intro_mute') === '1') muted = true; } catch (e) { /* nada */ }
    const root = document.createElement('div'); root.id = 'intro';
    root.innerHTML = '<canvas></canvas><div id="itVg"></div><div id="itFl"></div>'
      + `<button id="itGo" aria-label="${tapTxt()}"><svg viewBox="0 0 400 30" preserveAspectRatio="none"><defs><linearGradient id="itG" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="400" y2="0"><stop offset="0" stop-color="#ff2d4f" stop-opacity="0"/><stop offset=".18" stop-color="#ff2d4f"/><stop offset=".5" stop-color="#dfe8ff"/><stop offset=".82" stop-color="#2f7bff"/><stop offset="1" stop-color="#2f7bff" stop-opacity="0"/></linearGradient></defs><path class="base" d="M0 15H400"/><path class="bolt"/><path class="bolt"/><circle r="3.2" cy="15" fill="#fff" style="filter:drop-shadow(0 0 5px #fff) drop-shadow(0 0 10px #6aa8ff)"><animate attributeName="cx" values="-10;410" dur="1.7s" repeatCount="indefinite"/></circle></svg><span class="tx">${tapTxt()}</span></button>`
      + '<button id="itSnd" aria-label="Sonido"><svg viewBox="0 0 24 24"><path d="M4 9v6h4l5 4V5L8 9z"/><g class="w"><path d="M16 9a4 4 0 0 1 0 6"/><path d="M18.5 6.5a8 8 0 0 1 0 11"/></g><g class="x"><path d="M17 9l5 6M22 9l-5 6"/></g></svg></button>';
    document.body.appendChild(root); requestAnimationFrame(() => root.classList.add('on', 'title'));
    const $ = (i) => root.querySelector(i), snd = $('#itSnd'), fl = $('#itFl'); snd.classList.toggle('mute', muted);
    const lq = (navigator.hardwareConcurrency || 8) <= 4 || (navigator.deviceMemory || 8) <= 3;

    let renderer;
    try { renderer = new THREE.WebGLRenderer({ canvas: $('canvas'), antialias: !lq, alpha: false, powerPreference: 'high-performance' }); }
    catch (e) { console.warn('intro sin WebGL', e); window.__dmrIntroActive = 0; root.remove(); done(); return; }
    renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05; renderer.outputColorSpace = THREE.SRGBColorSpace; renderer.setClearColor(0x02030a, 1);

    const scene = new THREE.Scene(); scene.fog = new THREE.FogExp2(0x02030a, 0.028);
    const cam = new THREE.PerspectiveCamera(40, 1, 0.1, 120);
    const GLOW = glowTex(), SMK = smokeTex(), disposables = [GLOW, SMK];
    const track = (o) => { disposables.push(o); return o; };

    /* entorno para reflejos (focos rojos y azules) */
    { const pm = new THREE.PMREMGenerator(renderer), es = new THREE.Scene();
      es.add(new THREE.Mesh(new THREE.SphereGeometry(20, 20, 12), new THREE.MeshBasicMaterial({ color: 0x03040e, side: THREE.BackSide })));
      [[0xff2d4f, -9, 6, 2], [0x2f7bff, 9, 6, 2], [0xffffff, 0, 10, 4], [0xff5a1f, 0, 1, 9]].forEach(([c, x, y, z]) => { const m = new THREE.Mesh(new THREE.BoxGeometry(7, 0.8, 7), new THREE.MeshBasicMaterial({ color: c })); m.position.set(x, y, z); m.lookAt(0, 2, 0); es.add(m); });
      scene.environment = pm.fromScene(es, 0.04).texture; track(scene.environment); pm.dispose(); }

    /* luces */
    scene.add(new THREE.HemisphereLight(0x405080, 0x05060f, 0.35));
    const lR = new THREE.PointLight(0xff2d4f, 0, 40, 1.6), lB = new THREE.PointLight(0x2f7bff, 0, 40, 1.6), lF = new THREE.PointLight(0xff7a2a, 0, 14, 2);
    lR.position.set(-6.5, 4.5, 3.5); lB.position.set(6.5, 4.5, 3.5); lF.position.set(0, 3.5, 3); scene.add(lR, lB, lF);

    /* suelo brillante + reflejo de la mesa */
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(90, 90), new THREE.MeshStandardMaterial({ color: 0x04050d, roughness: 0.2, metalness: 0.85, transparent: true, opacity: 0.84, envMapIntensity: 1.2 }));
    floor.rotation.x = -Math.PI / 2; scene.add(floor);
    const puddle = (x, c) => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: GLOW, color: c, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0 })); s.scale.set(12, 3.4, 1); s.position.set(x, 0.03, 0.5); scene.add(s); return s; };
    const pdR = puddle(-5.5, RED), pdB = puddle(5.5, BLUE);

    /* mesa */
    const topTex = track(TEX(tableTopCanvas())), netTex = track(TEX(netCanvas()));
    const topMat = new THREE.MeshStandardMaterial({ map: topTex, roughness: 0.12, metalness: 0.35, envMapIntensity: 1.4 });
    const slabMat = new THREE.MeshStandardMaterial({ color: 0x080c24, roughness: 0.25, metalness: 0.9, envMapIntensity: 1.2 });
    const netMat = new THREE.MeshBasicMaterial({ map: netTex, transparent: true, side: THREE.DoubleSide, depthWrite: false, opacity: 0.9 });
    const rimMatR = new THREE.MeshBasicMaterial({ color: RED }), rimMatB = new THREE.MeshBasicMaterial({ color: BLUE });
    const rimSegs = [];
    function buildTable(withRim) {
      const g = new THREE.Group(), top = new THREE.Mesh(new THREE.PlaneGeometry(8, 5), topMat); top.rotation.x = -Math.PI / 2; top.position.y = 0.152; g.add(top);
      const slab = new THREE.Mesh(new THREE.BoxGeometry(8.4, 0.3, 5.4), slabMat); g.add(slab);
      [[-3.6, -2.25], [3.6, -2.25], [-3.6, 2.25], [3.6, 2.25]].forEach(([x, z]) => { const l = new THREE.Mesh(new THREE.BoxGeometry(0.3, 1.5, 0.3), slabMat); l.position.set(x, -0.9, z); g.add(l); });
      const net = new THREE.Mesh(new THREE.PlaneGeometry(5.3, 0.5), netMat); net.position.set(0, 0.42, 0); net.rotation.y = Math.PI / 2; g.add(net);
      const tape = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.04, 5.4), new THREE.MeshBasicMaterial({ color: 0xffffff })); tape.position.set(0, 0.67, 0); g.add(tape);
      [-2.68, 2.68].forEach((z) => { const p = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.6, 10), slabMat); p.position.set(0, 0.45, z); g.add(p); });
      /* neón del borde: las mitades roja/azul "se dibujan" desde el centro */
      if (withRim) {
        [[-1, 2.78], [1, 2.78], [-1, -2.78], [1, -2.78]].forEach(([s, z], i) => { const m = new THREE.Mesh(new THREE.BoxGeometry(4.2, 0.07, 0.08), s < 0 ? rimMatR : rimMatB); m.position.set(s * 2.1, 0.0, z * (i < 2 ? 1 : 1)); m.userData = { s, k: i }; g.add(m); rimSegs.push(m); });
        [[-1], [1]].forEach(([s]) => { const m = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.07, 5.6), s < 0 ? rimMatR : rimMatB); m.position.set(s * 4.22, 0, 0); m.userData = { s, k: 9, side: 1 }; g.add(m); rimSegs.push(m); });
      }
      return g;
    }
    const tableG = new THREE.Group(), table = buildTable(true); tableG.add(table); scene.add(tableG);
    const mirror = new THREE.Group(), mt = buildTable(false); mirror.add(mt); mirror.scale.y = -1; scene.add(mirror);
    /* barrido de luz sobre la mesa */
    const sweepTex = track(TEX(sweepCanvas(), false)); sweepTex.wrapS = sweepTex.wrapT = THREE.ClampToEdgeWrapping; sweepTex.repeat.set(0.3, 1);
    const sweep = new THREE.Mesh(new THREE.PlaneGeometry(8, 5), new THREE.MeshBasicMaterial({ map: sweepTex, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, opacity: 0.7 }));
    sweep.rotation.x = -Math.PI / 2; sweep.position.y = 0.16; table.add(sweep);

    /* estructura de focos + conos de luz */
    const truss = new THREE.Group(); scene.add(truss);
    const metal = new THREE.MeshStandardMaterial({ color: 0x151a30, roughness: 0.4, metalness: 0.9 }); const lamps = [];
    [-1, 1].forEach((s) => {
      const beam = new THREE.Mesh(new THREE.BoxGeometry(5, 0.14, 0.14), metal); beam.position.set(s * 6.4, 7.2, -1.5); beam.rotation.z = s * -0.22; truss.add(beam);
      const beam2 = beam.clone(); beam2.position.y = 6.7; truss.add(beam2);
      for (let i = 0; i < 6; i++) { const m = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.32, 0.22), new THREE.MeshBasicMaterial({ color: s < 0 ? 0xff3a5a : 0x4d8bff })); m.position.set(s * (4.4 + i * 0.5), 7.55 - i * 0.12 * (s < 0 ? -1 : 1) * -1, -1.4); m.position.y = 7.0 + (s < 0 ? -1 : -1) * 0 + (i * 0.1) * (s < 0 ? 1 : 1) - 0.1 * 0; m.userData = { s, i }; truss.add(m); lamps.push(m); const gl = new THREE.Sprite(new THREE.SpriteMaterial({ map: GLOW, color: s < 0 ? 0xff2d4f : 0x2f7bff, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0 })); gl.scale.set(1.4, 1.4, 1); m.add(gl); m.userData.gl = gl; }
    });
    const coneTex = track(TEX(coneCanvas(), false)), cones = [];
    [[-1, -5.3], [-1, -7.1], [1, 5.3], [1, 7.1]].forEach(([s, x], i) => {
      const m = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 1.5, 11, 20, 1, true), new THREE.MeshBasicMaterial({ map: coneTex, color: s < 0 ? 0xff2d4f : 0x2f7bff, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide }));
      m.geometry.translate(0, -5.5, 0); m.position.set(x, 7.2, -1.2); m.userData = { s, i, base: x }; scene.add(m); cones.push(m);
    });

    /* logo en capas */
    const LC = logoCanvases(), LW = 8.1, LH = LW * LC.H / LC.W;
    const lgG = new THREE.Group(); lgG.position.set(0, 3.7, -0.6); scene.add(lgG);
    const plane = (cv, w, h, mat) => { const t = track(TEX(cv)); const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial(Object.assign({ map: t, transparent: true, depthWrite: false }, mat || {}))); return m; };
    const lgGlow = plane(LC.glow, LW, LH, { blending: THREE.AdditiveBlending, opacity: 0.8 }); lgGlow.position.z = -0.3;
    const lgBack = plane(LC.back, LW, LH); lgBack.position.z = -0.14;
    const lgFace = plane(LC.face, LW, LH); lgFace.position.z = 0;
    const maskTex = track(TEX(LC.mask, false));
    const shineMap = track(TEX(sweepCanvas(), false)); shineMap.wrapS = shineMap.wrapT = THREE.ClampToEdgeWrapping; shineMap.repeat.set(0.22, 1);
    const lgShine = new THREE.Mesh(new THREE.PlaneGeometry(LW, LH), new THREE.MeshBasicMaterial({ map: shineMap, alphaMap: maskTex, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, opacity: 0.95 })); lgShine.position.z = 0.03;
    lgG.add(lgGlow, lgBack, lgFace, lgShine); lgG.visible = false;
    const dmrM = plane(dmrCanvas(), 4.4, 1.1); dmrM.position.set(0, 5.75, 0.1); dmrM.visible = false; scene.add(dmrM);
    const gameM = plane(gameCanvas(), 3.6, 1.68); gameM.position.set(1.55, 2.35, 0.25); gameM.visible = false; scene.add(gameM);
    const crownM = plane(crownCanvas(), 2.2, 1.63); crownM.position.set(-0.45, 6.1, 0.15); crownM.visible = false; scene.add(crownM);
    const crownGlow = new THREE.Sprite(new THREE.SpriteMaterial({ map: GLOW, color: 0xffb000, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0 })); crownGlow.scale.set(5, 4, 1); crownGlow.position.copy(crownM.position); scene.add(crownGlow);

    /* banderas con corona (se despliegan y ondean) */
    const banners = [-1, 1].map((s) => {
      const geo = new THREE.PlaneGeometry(1.5, 3.2, 1, 14); geo.translate(0, -1.6, 0);
      const m = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ map: track(TEX(bannerCanvas(s < 0 ? RED : BLUE))), transparent: true, side: THREE.DoubleSide, depthWrite: false }));
      m.position.set(s * 5.5, 6.7, -1.2); m.userData.x0 = 5.5; m.rotation.y = -s * 0.3; m.userData = { s, base: Array.from(geo.attributes.position.array) }; m.visible = false; scene.add(m); return m;
    });

    /* raquetas con aura y rayos */
    const padGeo = new THREE.CapsuleGeometry(0.26, 1.7, 8, 20), pads = [-1, 1].map((s) => {
      const g = new THREE.Group(), c = s < 0 ? RED : BLUE;
      const body = new THREE.Mesh(padGeo, new THREE.MeshStandardMaterial({ color: 0x0b0710, roughness: 0.25, metalness: 0.9, emissive: new THREE.Color(c), emissiveIntensity: 0.22, envMapIntensity: 1.6 })); g.add(body);
      const rim = new THREE.Mesh(padGeo, new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: 0.28, blending: THREE.AdditiveBlending, depthWrite: false })); rim.scale.set(1.16, 1.07, 1.16); g.add(rim);
      const aura = new THREE.Sprite(new THREE.SpriteMaterial({ map: GLOW, color: c, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0.8 })); aura.scale.set(4.6, 4.6, 1); g.add(aura);
      g.position.set(s * 9.5, 2.6, 0.4); g.rotation.z = s * -0.62; g.userData = { s, aura, body, c }; g.visible = false; scene.add(g);
      return g;
    });
    const ARC = 3, arcs = [];
    pads.forEach((p) => { for (let a = 0; a < ARC; a++) { const geo = new THREE.BufferGeometry(), N = 14; geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(N * 3), 3)); const l = new THREE.Line(geo, new THREE.LineBasicMaterial({ color: p.userData.s < 0 ? 0xff8a9a : 0x9fc4ff, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false })); p.add(l); arcs.push({ l, N, next: 0, pad: p }); } });

    /* humo rojo / azul */
    const NS = lq ? 16 : 34, smoke = [];
    for (let i = 0; i < NS; i++) { const s = i % 2 ? 1 : -1, sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: SMK, color: s < 0 ? 0xff2d4f : 0x2f7bff, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0, rotation: Math.random() * 6 })); sp.userData = { s, x: s * (2 + Math.random() * 6), y: 0.3 + Math.random() * 3, z: -2.5 + Math.random() * 4, ph: Math.random() * 6.3, sz: 3 + Math.random() * 3.5, sp: 0.12 + Math.random() * 0.2 }; scene.add(sp); smoke.push(sp); }
    /* chispas y brasas (pool) */
    const MAXP = lq ? 260 : 520, pPos = new Float32Array(MAXP * 3), pCol = new Float32Array(MAXP * 3), pV = new Float32Array(MAXP * 3), pL = new Float32Array(MAXP), pC = new Float32Array(MAXP * 3); let pn = 0;
    const pGeo = new THREE.BufferGeometry(); pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3)); pGeo.setAttribute('color', new THREE.BufferAttribute(pCol, 3));
    const pts = new THREE.Points(pGeo, new THREE.PointsMaterial({ size: 0.16, vertexColors: true, map: GLOW, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending })); pts.frustumCulled = false; scene.add(pts);
    const tmpC = new THREE.Color();
    function spawn(x, y, z, n, cols, sp, life = 1, up = 0.5) {
      for (let i = 0; i < n && pn < MAXP; i++) { const j = pn++, a = Math.random() * 6.283, b = Math.random() * 3.14 - 1.57, v = (0.25 + Math.random()) * sp; tmpC.set(cols[i % cols.length]);
        pPos.set([x, y, z], j * 3); pV.set([Math.cos(a) * Math.cos(b) * v, Math.sin(b) * v + up, Math.sin(a) * Math.cos(b) * v], j * 3); pL[j] = life * (0.5 + Math.random() * 0.7); pC.set([tmpC.r, tmpC.g, tmpC.b], j * 3); }
    }
    function stepParts(dt) {
      for (let i = 0; i < pn; i++) {
        pL[i] -= dt; if (pL[i] <= 0) { const l = --pn; pPos.copyWithin(i * 3, l * 3, l * 3 + 3); pV.copyWithin(i * 3, l * 3, l * 3 + 3); pC.copyWithin(i * 3, l * 3, l * 3 + 3); pL[i] = pL[l]; i--; continue; }
        pV[i * 3 + 1] -= 2.2 * dt; pPos[i * 3] += pV[i * 3] * dt; pPos[i * 3 + 1] += pV[i * 3 + 1] * dt; pPos[i * 3 + 2] += pV[i * 3 + 2] * dt;
        const k = Math.min(1, pL[i] * 1.8); pCol[i * 3] = pC[i * 3] * k; pCol[i * 3 + 1] = pC[i * 3 + 1] * k; pCol[i * 3 + 2] = pC[i * 3 + 2] * k;
      }
      pGeo.setDrawRange(0, pn); pGeo.attributes.position.needsUpdate = true; pGeo.attributes.color.needsUpdate = true;
    }
    /* polvo flotando en la luz */
    const DN = lq ? 60 : 140, dPos = new Float32Array(DN * 3); for (let i = 0; i < DN; i++) dPos.set([(Math.random() - 0.5) * 22, Math.random() * 8, -4 + Math.random() * 10], i * 3);
    const dGeo = new THREE.BufferGeometry(); dGeo.setAttribute('position', new THREE.BufferAttribute(dPos, 3)); const dust = new THREE.Points(dGeo, new THREE.PointsMaterial({ size: 0.05, color: 0x9fb4ff, map: GLOW, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending })); scene.add(dust);
    /* ondas de choque */
    const rings = [];
    for (let i = 0; i < 4; i++) { const m = new THREE.Mesh(new THREE.RingGeometry(0.9, 1, 56), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide })); m.visible = false; m.userData = { t: -1, dur: 0.7, big: 8, col: 0xffffff }; scene.add(m); rings.push(m); }
    const ring = (pos, big, col, dur = 0.7) => { const m = rings.find((r) => !r.visible) || rings[0]; m.userData = { t: 0, dur, big, col }; m.position.copy(pos); m.material.color.set(col); m.visible = true; };

    /* pelota + estela de fuego */
    const ballTex = track(TEX(ballCanvas()));
    const ball = new THREE.Mesh(new THREE.SphereGeometry(0.34, 28, 20), new THREE.MeshStandardMaterial({ map: ballTex, emissive: 0xff7a1a, emissiveIntensity: 0.22, roughness: 0.45, metalness: 0.05 })); ball.visible = false; scene.add(ball);
    const ballHalo = new THREE.Sprite(new THREE.SpriteMaterial({ map: GLOW, color: 0xff6a1a, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0.3 })); ballHalo.scale.set(1.5, 1.5, 1); scene.add(ballHalo);
    const TRN = lq ? 28 : 46, trail = [], hist = []; for (let i = 0; i < TRN; i++) { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: GLOW, color: 0xffa030, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0 })); scene.add(s); trail.push(s); }
    const pathA = new THREE.CatmullRomCurve3([new THREE.Vector3(-12, 0.7, 6), new THREE.Vector3(-7, 1.5, 6.4), new THREE.Vector3(-3, 2.9, 4.6), new THREE.Vector3(-0.6, 3.7, 2.2), new THREE.Vector3(0, 3.75, -0.2)]);
    const pathB = new THREE.CatmullRomCurve3([new THREE.Vector3(0, 3.75, -0.2), new THREE.Vector3(1.1, 5.2, 2.4), new THREE.Vector3(2.4, 5.9, 1.6), new THREE.Vector3(3.3, 5.35, 0.4)]);
    const FC = [new THREE.Color('#fff4c0'), new THREE.Color('#ffb02e'), new THREE.Color('#ff4a12'), new THREE.Color('#7a0a08')], tc = new THREE.Color();

    /* ---------------------------------------------------------------- cámara y tamaño */
    let portraitK = 1;
    const size = () => { const w = innerWidth, h = innerHeight; renderer.setPixelRatio(Math.min(devicePixelRatio || 1, lq ? 1.4 : 2)); renderer.setSize(w, h, false); cam.aspect = w / h; portraitK = clamp(1.78 / (w / h), 1, 2.6); cam.updateProjectionMatrix(); };
    size(); addEventListener('resize', size);
    const ptr = { x: 0, y: 0, tx: 0, ty: 0 }; const onMove = (e) => { ptr.tx = (e.clientX / innerWidth - 0.5) * 2; ptr.ty = (e.clientY / innerHeight - 0.5) * 2; }; addEventListener('pointermove', onMove);

    /* ---------------------------------------------------------------- estado y sonido */
    let T = 0, phase = 'title', titleK = 0, tk = 0, boot = 0, cineT = 0, nextZap = 1.2, viewHW = 8, G = 0, raf = 0, ended = false, sfx = null, last = performance.now(), shake = 0, flash = 0, froze = false;
    const fired = {}; const once = (k, fn) => { if (!fired[k]) { fired[k] = 1; fn(); } };
    try { sfx = mkSfx(muted); } catch (e) { sfx = null; }
    const cue = (n, f) => { if (sfx) sfx.cue(n, f); };
    snd.addEventListener('click', (e) => { e.stopPropagation(); muted = !muted; snd.classList.toggle('mute', muted); try { localStorage.setItem('dmr_intro_mute', muted ? '1' : '0'); } catch (x) { /* nada */ } if (sfx) sfx.mute(muted); });

    const tmp = new THREE.Vector3(), ctr = new THREE.Vector3(0, 3.7, 0), look = new THREE.Vector3();
    function placeCam(dt) {
      const k = portraitK, a = E.io(seg(T, 0, TL.impact)), b = E.io(seg(T, TL.impact, 5.2));
      let px = 0, py = lerp(lerp(0.9, 2.1, a), 2.8, b), pz = lerp(lerp(16, 11.2, a), 10.2, b), fov = lerp(lerp(44, 40, a), 39, b); look.set(0, lerp(lerp(2.0, 2.8, a), 2.8, b), 0);
      pz *= Math.pow(k, 0.9); py *= lerp(1, 1.1, clamp(k - 1)); look.y += (k - 1) * 0.85; fov += (k > 1 ? 3 : 0);
      px += Math.sin(T * 0.35) * 0.35 + ptr.x * 0.5; py += Math.sin(T * 0.5) * 0.08 - ptr.y * 0.2;
      if (phase === 'go') { const u = E.in2(seg(G, 0, 1.0)); pz = lerp(pz, 3.2, u); py = lerp(py, 1.7, u); px *= 1 - u; fov += u * 26; look.y = lerp(look.y, 1.0, u); look.z = lerp(0, -1.2, u); }
      if (tk > 0) { const u = E.io(tk); px = lerp(px, ptr.x * 0.4, u); py = lerp(py, 3.9, u); pz = lerp(pz, 10.6 * Math.pow(k, 0.9), u); fov = lerp(fov, 40 + (k > 1 ? 3 : 0), u); look.y = lerp(look.y, 3.9 + (k - 1) * 0.5, u); }
      shake = Math.max(0, shake - dt * 1.7); const sh = shake * shake;
      cam.position.set(px + (Math.random() - 0.5) * sh * 0.5, py + (Math.random() - 0.5) * sh * 0.5, pz); cam.fov = fov; cam.updateProjectionMatrix(); cam.lookAt(look);
      viewHW = Math.tan(fov * Math.PI / 360) * pz * cam.aspect;
    }

    /* ---------------------------------------------------------------- animación por cuadro */
    function update(dt) {
      const t = T, rise = E.out(seg(t, TL.table, TL.tableEnd));
      /* luces: parpadeo y encendido */
      const fk = (s0) => { const u = t - s0; if (u < 0) return 0; if (u < 0.35) return (Math.sin(u * 70) > 0 ? 1 : 0.15) * Math.min(1, u * 5); return 1; };
      let iR = fk(TL.lightR), iB = fk(TL.lightB); const pulse = 0.9 + 0.1 * Math.sin((t + boot) * 5), boom = Math.max(0, 1 - (t - TL.impact) * 2.2) * (t > TL.impact ? 1 : 0);
      if (t > TL.lightR) once('lr', () => cue('light')); if (t > TL.lightB) once('lb', () => cue('light'));
      iR = Math.max(iR, tk * 0.6); iB = Math.max(iB, tk * 0.6);
      lR.intensity = iR * 60 * pulse + boom * 70; lB.intensity = iB * 60 * pulse + boom * 70; lF.intensity = boom * 120;
      pdR.material.opacity = iR * 0.55; pdB.material.opacity = iB * 0.55;
      lamps.forEach((m) => { const on = m.userData.s < 0 ? iR : iB; m.material.color.setHex(m.userData.s < 0 ? 0xff3a5a : 0x4d8bff).multiplyScalar(0.15 + on * 1.6); m.userData.gl.material.opacity = on * (0.7 + 0.3 * Math.sin(t * 6 + m.userData.i)); });
      cones.forEach((c, i) => { const on = c.userData.s < 0 ? iR : iB; c.material.opacity = on * (0.2 + 0.07 * Math.sin(t * 1.3 + i)); c.rotation.z = Math.sin(t * 0.6 + i * 1.7) * 0.2 + (c.userData.s < 0 ? -0.5 : 0.5) * (1 - seg(t, 0.4, 2.8)) * 0.6; c.rotation.x = Math.sin(t * 0.45 + i) * 0.08; });
      dust.material.opacity = 0.7 * Math.max(seg(t, 0.4, 1.4), tk);
      /* mesa */
      tableG.visible = mirror.visible = t > TL.table; tableG.position.y = mirror.position.y = 0; tableG.position.y = lerp(-1.7, 0.9, rise); mirror.position.y = -tableG.position.y;
      rimSegs.forEach((m) => { const d = seg(t, TL.table + 0.2 + (m.userData.side ? 0.7 : m.userData.k * 0.05), TL.tableEnd + 0.2), e = E.out(d); if (m.userData.side) m.scale.z = Math.max(0.001, e); else { m.scale.x = Math.max(0.001, e); m.position.x = m.userData.s * (4.2 * 0.5 * e); m.position.x = m.userData.s * (0.0 + 2.1 * e); } });
      sweepTex.offset.x = 0.5 - lerp(-0.3, 1.3, seg(t, 1.3, 2.7)) * sweepTex.repeat.x; sweep.material.opacity = seg(t, 1.3, 1.6) * (1 - seg(t, 2.5, 2.7)) * 0.8;
      /* pelota */
      let bx, by, bz, onBall = false;
      if (t >= TL.ball && t < TL.impact) { const u = E.in2(seg(t, TL.ball, TL.impact)) * 0.3 + seg(t, TL.ball, TL.impact) * 0.7; pathA.getPoint(u, tmp); onBall = true; once('ballcue', () => cue('ball')); }
      else if (t >= TL.impact && t < TL.impact + 0.85) { pathB.getPoint(E.out(seg(t, TL.impact, TL.impact + 0.85)), tmp); onBall = true; }
      else if (t >= TL.impact + 0.85) { const w = t * 1.3; tmp.set(3.3 + Math.cos(w) * 0.32, 5.35 + Math.sin(w * 2) * 0.16, 0.4 + Math.sin(w) * 0.35); onBall = true; }
      ball.visible = onBall && !(t >= TL.impact - 0.02 && t < TL.impact + 0.04);
      if (onBall) {
        bx = tmp.x; by = tmp.y; bz = tmp.z; ball.position.set(bx, by, bz); ball.rotation.x += dt * 16; ball.rotation.z += dt * 9; ballHalo.position.copy(ball.position); ballHalo.material.opacity = 0.3 + 0.06 * Math.sin(t * 30); ballHalo.scale.setScalar(1.5 + 0.12 * Math.sin(t * 22));
        hist.unshift([bx, by, bz]); if (hist.length > TRN) hist.pop();
        spawn(bx, by, bz, lq ? 1 : 2, ['#ffcf5a', '#ff7a1a', '#ff3a10'], 0.6, 0.8, 0.9);
      } else { ballHalo.material.opacity = 0; if (hist.length) hist.pop(); }
      trail.forEach((s, i) => {
        const h = hist[i]; if (!h) { s.material.opacity = 0; return; } const k = i / TRN;
        s.position.set(h[0] + (Math.random() - 0.5) * 0.06 * i * 0.1, h[1] + (Math.random() - 0.5) * 0.06 * i * 0.1, h[2]);
        const c = k < 0.18 ? tc.copy(FC[0]).lerp(FC[1], k / 0.18) : k < 0.55 ? tc.copy(FC[1]).lerp(FC[2], (k - 0.18) / 0.37) : tc.copy(FC[2]).lerp(FC[3], (k - 0.55) / 0.45);
        s.material.color.copy(c); s.material.opacity = (1 - k) * 0.55; s.scale.setScalar(lerp(1.0, 0.3, k));
      });
      /* IMPACTO */
      if (t >= TL.impact) once('impact', () => {
        cue('impact'); shake = 1; flash = 1; tmp.set(0, 3.75, 0.2);
        spawn(0, 3.75, 0.3, lq ? 90 : 170, ['#ffffff', '#ffb02e', '#ff4a12', '#ff2d4f', '#2f7bff'], 6.5, 1.3, 1);
        ring(tmp, 6, 0xffffff, 0.6); setTimeout(() => ring(tmp, 4, 0xff5a1f, 0.7), 90); setTimeout(() => ring(tmp, 8, 0x2f7bff, 0.8), 170);
      });
      /* logo, GAME, corona */
      if (t < TL.impact) {
        lgG.visible = dmrM.visible = tk > 0.003;
        if (lgG.visible) { const bb = 1 + 0.012 * Math.sin(boot * 1.6); lgG.scale.setScalar(bb); lgG.rotation.z = 0; lgG.position.y = 3.7 + Math.sin(boot * 1.1) * 0.05; lgFace.material.opacity = lgBack.material.opacity = tk; lgGlow.material.opacity = (0.5 + 0.22 * Math.sin(boot * 2.4)) * tk; dmrM.material.opacity = tk; dmrM.position.y = 5.75 + Math.sin(boot * 1.1 + 1) * 0.04; }
      }
      if (t >= TL.impact) { dmrM.visible = false; lgG.visible = true; const u = seg(t, TL.impact, TL.impact + 0.45), s = lerp(2.6, 1, E.out(u)); lgG.scale.setScalar(s); lgFace.material.opacity = lgBack.material.opacity = clamp(u * 6); lgGlow.material.opacity = 0.55 + 0.25 * Math.sin(t * 3) + boom * 0.6; lgG.position.y = 3.7 + Math.sin(t * 1.1) * 0.05; lgG.rotation.z = (1 - E.out(u)) * 0.08; once('logocue', () => setTimeout(() => cue('logo'), 150)); }
      shineMap.offset.x = 0.5 - lerp(-0.3, 1.3, seg(((phase === 'title' ? boot : t) % 3.6), 0.3, 1.3)) * shineMap.repeat.x; lgShine.material.opacity = t > TL.impact + 0.3 ? 0.95 : (t < TL.impact ? tk * 0.9 : 0);
      if (t >= TL.game) { gameM.visible = true; const u = seg(t, TL.game, TL.game + 0.4); gameM.scale.setScalar(lerp(3, 1, E.back(u))); gameM.material.opacity = clamp(u * 5); gameM.position.y = 2.35 + Math.sin(t * 1.3) * 0.04; once('game', () => { shake = Math.max(shake, 0.6); spawn(1.5, 2.3, 0.5, 60, ['#ff2d4f', '#ffffff', '#ff7a1a'], 4.5, 0.9, 0.8); ring(new THREE.Vector3(1.5, 2.3, 0.5), 5, 0xff2d4f, 0.7); }); }
      if (t >= TL.crown) { crownM.visible = true; const u = seg(t, TL.crown, TL.crown + 0.65); crownM.position.y = lerp(9.5, 6.1, E.bounce(u)); crownM.material.opacity = clamp(u * 6); crownGlow.position.copy(crownM.position); crownGlow.position.z = 0.1; crownGlow.material.opacity = (0.35 + 0.15 * Math.sin(t * 4)) * clamp(u * 3);
        once('crown', () => setTimeout(() => { cue('crown'); spawn(-0.45, 6.1, 0.4, 70, ['#fff6b0', '#ffd21f', '#ffffff'], 4, 1.2, 1.2); ring(new THREE.Vector3(-0.45, 6, 0.3), 4, 0xffd21f, 0.8); shake = Math.max(shake, 0.4); }, 600)); }
      if (t > TL.crown + 0.9 && Math.random() < 0.18) spawn(-0.45 + (Math.random() - 0.5) * 2, 6.3 + Math.random() * 0.5, 0.4, 1, ['#fff6b0', '#ffffff'], 0.3, 1, 0.3);
      const pa = clamp((1.4 - cam.aspect) / 0.7), fitX = lerp(1, clamp(viewHW / 7.6, 0.45, 1), pa);
      truss.scale.x = fitX; cones.forEach((c) => { c.position.x = c.userData.base * fitX; });
      /* banderas */
      banners.forEach((b) => {
        const u = E.out(seg(t, TL.banner + (b.userData.s > 0 ? 0.15 : 0), TL.banner + 0.8)); b.visible = u > 0.001; b.scale.y = Math.max(0.001, u) * lerp(1, 0.78, pa); b.scale.x = lerp(1, 0.78, pa); b.position.x = b.userData.s * lerp(5.5, viewHW * 0.8, pa);
        const p = b.geometry.attributes.position, base = b.userData.base; for (let i = 0; i < p.count; i++) { const y = base[i * 3 + 1]; p.setZ(i, Math.sin(t * 2.2 + y * 1.4 + b.userData.s) * 0.1 * (-y / 3.2)); } p.needsUpdate = true;
      });
      /* raquetas */
      pads.forEach((p) => {
        const s = p.userData.s, u = seg(t, TL.pad + (s > 0 ? 0.12 : 0), TL.pad + 0.75); p.visible = u > 0.001; const tx = lerp(5.25, viewHW * 0.84, pa); p.position.x = s * lerp(tx + 4.3, tx, E.back(u)); p.position.y = lerp(2.6, 1.7, pa) + Math.sin(t * 1.4 + s) * 0.1; p.scale.setScalar(lerp(1, 0.78, pa)); p.rotation.z = s * -0.62 + Math.sin(t * 1.1 + s) * 0.05; p.rotation.y = s * 0.35;
        p.userData.aura.material.opacity = (0.55 + 0.25 * Math.sin(t * 5 + s)) * u; p.userData.body.material.emissiveIntensity = 0.3 + 0.2 * Math.sin(t * 6 + s);
        if (u > 0.9 && Math.random() < 0.5) spawn(p.position.x + (Math.random() - 0.5) * 0.4, p.position.y + (Math.random() - 0.5) * 1.8, p.position.z, 1, [s < 0 ? '#ff4a6a' : '#5a9bff', '#ffffff'], 0.5, 1.1, 0.7);
      });
      arcs.forEach((a) => {
        const on = a.pad.visible; a.l.visible = on; if (!on) return; a.next -= dt; if (a.next > 0) return; a.next = 0.04 + Math.random() * 0.08;
        const pos = a.l.geometry.attributes.position, y0 = (Math.random() - 0.5) * 1.8, ang = Math.random() * 6.28; let x = Math.cos(ang) * 0.3, y = y0, z = Math.sin(ang) * 0.3;
        for (let i = 0; i < a.N; i++) { pos.setXYZ(i, x, y, z); x += Math.cos(ang) * 0.12 + (Math.random() - 0.5) * 0.14; y += (Math.random() - 0.5) * 0.2; z += Math.sin(ang) * 0.12 + (Math.random() - 0.5) * 0.14; }
        pos.needsUpdate = true; a.l.material.opacity = 0.5 + Math.random() * 0.5;
      });
      /* humo */
      const sk = Math.max(seg(t, 0.5, 2.0), tk);
      smoke.forEach((s) => { const d = s.userData, w = t * d.sp + d.ph; s.position.set(d.x + Math.sin(w) * 1.2, d.y + (Math.sin(w * 0.7) + 1) * 0.5, d.z); s.scale.setScalar(d.sz * (1 + 0.12 * Math.sin(w * 1.3))); s.material.rotation += dt * 0.05 * d.s; s.material.opacity = sk * (0.16 + 0.07 * Math.sin(w * 2)) * (d.s < 0 ? iR : iB); });
      stepParts(dt);
      rings.forEach((m) => { if (!m.visible) return; const u = m.userData; u.t += dt; const k = u.t / u.dur; if (k >= 1) { m.visible = false; return; } m.quaternion.copy(cam.quaternion); m.scale.setScalar(0.3 + E.out(k) * u.big); m.material.opacity = (1 - k) * 0.9; });
      /* flash blanco */
      flash = Math.max(0, flash - dt * 3.4); fl.style.opacity = String(Math.min(1, flash * flash));
      if (phase === 'go') { const f = seg(G, 0.78, 1.0); fl.style.opacity = String(Math.max(+fl.style.opacity, f)); }
      /* arranca el brillo del escenario: pantalla negra → luz */
      renderer.toneMappingExposure = 1.05 * seg(boot, 0, 0.9);
    }

    /* ---------------------------------------------------------------- bucle */
    const bolts = Array.from(root.querySelectorAll('#itGo .bolt')); let boltT = 0;
    const zigzag = (el) => { let d = 'M' + (60 + Math.random() * 60) + ' 15', x = 60 + Math.random() * 60; const end = 240 + Math.random() * 100; while (x < end) { x += 8 + Math.random() * 16; d += 'L' + x.toFixed(1) + ' ' + (15 + (Math.random() - 0.5) * 22).toFixed(1); } el.setAttribute('d', d + 'L' + (end + 12) + ' 15'); };
    const frame = (now) => {
      raf = requestAnimationFrame(frame); let dt = Math.min(0.05, (now - last) / 1000 || 0.016); last = now; if (froze) dt = 0;
      boot += dt;
      if (phase === 'title') {
        titleK = Math.min(1, titleK + dt / 1.1); tk = titleK;
        if (sfx && sfx.a.state === 'running' && !muted) sfx.hum(true);
        nextZap -= dt; if (nextZap <= 0) { nextZap = 0.7 + Math.random() * 1.6; bolts.forEach((b) => { zigzag(b); b.style.opacity = '1'; setTimeout(() => { b.style.opacity = '0'; }, 70 + Math.random() * 80); }); cue('zap'); }
      } else tk = Math.max(0, tk - dt / 0.4);
      if (phase === 'go') G += dt; else if (phase === 'cine') { T += dt; cineT += dt; }
      update(dt); placeCam(dt);
      if (phase === 'cine' && T >= TL.ready + 0.9) startGo();
      if (phase === 'go' && G > 1.05) finish();
      renderer.render(scene, cam);
    };
    function startGo() { if (phase === 'go') return; phase = 'go'; G = 0; setTimeout(() => cue('start', 1), 40); }
    /* ---------------------------------------------------------------- tocar: saltar la cinemática o empezar el juego */
    function finish() {
      if (ended) return; ended = true; removeEventListener('resize', size); removeEventListener('pointermove', onMove);
      window.__dmrIntroDone = 1; window.__dmrIntroActive = 0; root.classList.remove('on'); root.classList.add('off'); if (sfx) sfx.close(); done();
      setTimeout(() => {
        cancelAnimationFrame(raf);
        scene.traverse((o) => { if (o.geometry) o.geometry.dispose(); if (o.material) { (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) => m.dispose()); } });
        disposables.forEach((d) => d && d.dispose && d.dispose()); try { renderer.dispose(); renderer.forceContextLoss(); } catch (e) { /* nada */ } root.remove();
      }, 700);
    }
    root.addEventListener('click', (e) => {
      if (e.target.closest('#itSnd') || ended) return;
      if (sfx) sfx.resume();
      if (phase === 'title') { phase = 'cine'; T = 0; cineT = 0; root.classList.remove('title'); if (sfx) { sfx.hum(false); } cue('tap', 1); return; }
      if (phase === 'cine' && cineT > 0.5 && T < TL.ready) { T = TL.ready + 0.55; hist.length = 0; Object.keys(fired).forEach((k) => { fired[k] = 1; }); }
    });
    if (location.hostname === 'localhost') window.__intro = { seek(x) { phase = 'cine'; root.classList.remove('title'); T = x; }, freeze(v) { froze = v; }, get T() { return T; }, shake(v) { shake = v; } };
    raf = requestAnimationFrame(frame);
  });
}
