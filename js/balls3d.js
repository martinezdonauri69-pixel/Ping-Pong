/* balls3d.js · las 40 pelotas 3D nuevas.  UN solo sistema para todas (no hay 40 sistemas):
   - BallRig        → construye cualquier pelota a partir de sus DATOS (el objeto "v" de cada pelota en catalog.js).
   - PT (pintores)  → dibujan las texturas (lava, agua, circuitos, runas...) en un canvas pequeño, una sola vez.
   - FX / HIT / AMB → efectos de partículas y de golpe, también por datos.
   - createBallPreviewer() → UN solo visor 3D para la tienda (no 40 escenas). Solo dibuja lo que se ve.
   Para agregar una pelota nueva: solo añade una línea en BALLS (js/data/catalog.js). No hay que tocar este archivo. */
import * as THREE from '../vendor/three.module.min.js';

const TAU = Math.PI * 2, W = 512, H = 256;
let FXQ = true;                                   /* brillos en las texturas: se apagan en las vistas previas de la tienda */
/* teléfono de gama baja: menos partículas, menos piezas orbitando, texturas más chicas */
export const LOW = (() => { try { return (navigator.hardwareConcurrency || 8) <= 4 || (navigator.deviceMemory || 4) <= 2; } catch (e) { return false; } })();

export const mkC = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };
const ra = (i, k = 0) => { const s = Math.sin((i + 1) * 127.1 + k * 311.7) * 43758.5453; return s - Math.floor(s); };
let GLOW = null;
export const glow = () => GLOW || (GLOW = (() => {
  const c = mkC(64, 64), g = c.getContext('2d'), gr = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.35, 'rgba(255,255,255,.55)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = gr; g.fillRect(0, 0, 64, 64); return new THREE.CanvasTexture(c);
})());

/* ---------------------------------------------------------------- ayudas de dibujo (todo en coordenadas de 512x256) */
const vg = (g, stops) => { const gr = g.createLinearGradient(0, 0, 0, H); stops.forEach((c, i) => gr.addColorStop(i / (stops.length - 1), c)); g.fillStyle = gr; g.fillRect(0, 0, W, H); };
const black = (g) => { g.fillStyle = '#000'; g.fillRect(0, 0, W, H); };
const wr = (g, fn) => { [-W, 0, W].forEach((dx) => { g.save(); g.translate(dx, 0); fn(); g.restore(); }); };   /* repite a los lados: la textura no tiene costura */
function blobs(g, col, n, r0, r1, a, seed) {
  g.fillStyle = col;
  for (let i = 0; i < n; i++) { g.globalAlpha = a * (0.4 + 0.6 * ra(i, seed + 3)); const x = ra(i, seed) * W, y = ra(i, seed + 1) * H, r = r0 + ra(i, seed + 2) * (r1 - r0); wr(g, () => { g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill(); }); }
  g.globalAlpha = 1;
}
function crack(g, seed, n, col, lw, glw) {
  g.strokeStyle = col; g.lineCap = 'round'; g.shadowColor = col; g.shadowBlur = FXQ ? glw || 0 : 0;
  for (let i = 0; i < n; i++) {
    const x = ra(i, seed) * W, y = ra(i, seed + 1) * H, a = ra(i, seed + 2) * TAU, w = lw * (0.6 + ra(i, seed + 9));
    wr(g, () => { g.lineWidth = w; g.beginPath(); let px = x, py = y, pa = a; g.moveTo(px, py); for (let k = 0; k < 9; k++) { pa += (ra(i * 9 + k, seed + 4) - 0.5) * 1.4; px += Math.cos(pa) * 22; py += Math.sin(pa) * 22; g.lineTo(px, py); } g.stroke(); });
  }
  g.shadowBlur = FXQ ? 0 : 0;
}
function swirl(g, cols, seed, bg) {
  vg(g, bg || ['#050818', '#0a1230', '#050818']);
  for (let i = 0; i < 40; i++) {
    g.strokeStyle = cols[i % cols.length]; g.globalAlpha = 0.25 + ra(i, seed) * 0.4; g.lineWidth = 5 + ra(i, seed + 1) * 12; g.lineCap = 'round';
    const y0 = ra(i, seed + 2) * H, am = 14 + ra(i, seed + 3) * 40, fr = 0.01 + ra(i, seed + 4) * 0.02, ph = ra(i, seed + 5) * TAU;
    g.beginPath(); for (let x = 0; x <= W; x += 8) g.lineTo(x, y0 + Math.sin(x * fr + ph) * am); g.stroke();
  }
  g.globalAlpha = 1; blobs(g, cols[0], 22, 6, 26, 0.5, seed + 7);
}
function runes(g, col, seed, glowOnly) {
  g.strokeStyle = col; g.lineWidth = 3; g.lineCap = 'round'; g.shadowColor = col; g.shadowBlur = FXQ ? (glowOnly ? 10 : 6) : 0;
  for (let r = 0; r < 4; r++) for (let q = 0; q < 8; q++) {
    const ox = q * 64 + 12, oy = r * 64 + 8, n = 3 + ((ra(r * 8 + q, seed) * 3) | 0);
    g.beginPath(); let px = ox + ra(r * 8 + q, seed + 1) * 40, py = oy + ra(r * 8 + q, seed + 2) * 48; g.moveTo(px, py);
    for (let k = 0; k < n; k++) { px = ox + ra(r * 8 + q + k * 31, seed + 3) * 40; py = oy + ra(r * 8 + q + k * 17, seed + 4) * 48; g.lineTo(px, py); }
    g.stroke();
  }
  g.shadowBlur = FXQ ? 0 : 0;
}
function circuit(g, col, seed, bg) {
  g.fillStyle = bg; g.fillRect(0, 0, W, H); g.strokeStyle = col; g.fillStyle = col; g.lineWidth = 3; g.lineJoin = 'round';
  for (let i = 0; i < 30; i++) {
    let x = ((ra(i, seed) * 32) | 0) * 16, y = ((ra(i, seed + 1) * 16) | 0) * 16;
    wr(g, () => { g.beginPath(); g.moveTo(x, y); let px = x, py = y; for (let k = 0; k < 3; k++) { if ((k + i) & 1) px += (ra(i * 5 + k, seed + 2) * 6 | 0) * 16 + 16; else py += (ra(i * 5 + k, seed + 3) * 5 | 0) * 16 + 16; g.lineTo(px, py); } g.stroke(); g.beginPath(); g.arc(px, py, 5, 0, TAU); g.fill(); });
  }
  for (let i = 0; i < 5; i++) { const x = ra(i, seed + 9) * W, y = ra(i, seed + 8) * H; wr(g, () => { g.strokeRect(x, y, 30, 20); }); }
}

/* ---------------------------------------------------------------- pintores: m = textura de color, e = textura de brillo (opcional) */
const PT = {
  lava: {
    m(g, c) { const k = c[3] || '#0b0504'; vg(g, [k, '#1c0b08', k]); blobs(g, '#2e1812', 70, 8, 30, 0.5, 1); crack(g, 5, 16, '#5a1006', 5, 0); },
    e(g, c) { black(g); crack(g, 5, 16, c[0], 4, 12); crack(g, 5, 16, c[2] || '#fff2b0', 1.4, 0); },
  },
  water: {
    m(g, c) {
      vg(g, [c[1], c[0], '#031b4a']);
      g.strokeStyle = '#fff'; g.lineWidth = 3; for (let y = 14; y < H; y += 28) { g.globalAlpha = 0.18 + (y % 3) * 0.04; g.beginPath(); for (let x = 0; x <= W; x += 8) g.lineTo(x, y + Math.sin(x / 41 + y) * 8); g.stroke(); }
      g.globalAlpha = 1; blobs(g, '#fff', 40, 3, 14, 0.15, 11);
    },
  },
  storm: {
    m(g) { vg(g, ['#1a1d2e', '#3a3f58', '#171a2a']); blobs(g, '#555b78', 60, 10, 45, 0.35, 2); blobs(g, '#0e1020', 40, 10, 40, 0.4, 3); },
    e(g, c) { black(g); crack(g, 8, 7, c[0], 3, 14); crack(g, 8, 7, '#fff', 1.2, 0); },
  },
  gem: {
    m(g, c) { vg(g, [c[1], c[0], c[0], c[1]]); g.strokeStyle = '#fff'; g.lineWidth = 6; for (let i = 0; i < 14; i++) { g.globalAlpha = 0.1 + ra(i) * 0.22; const x = ra(i, 3) * W; g.beginPath(); g.moveTo(x, 0); g.lineTo(x + 70, H); g.stroke(); } g.globalAlpha = 1; },
  },
  holo: {
    m(g) { vg(g, ['#06122a', '#0a2a4a', '#06122a']); g.strokeStyle = '#7fe8ff'; g.globalAlpha = 0.45; g.lineWidth = 1.5; for (let y = 0; y < H; y += 14) { g.beginPath(); g.moveTo(0, y); g.lineTo(W, y); g.stroke(); } for (let x = 0; x < W; x += 32) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, H); g.stroke(); } g.globalAlpha = 1; },
    e(g, c) { black(g); const gr = g.createLinearGradient(0, 0, W, 0); gr.addColorStop(0, c[0]); gr.addColorStop(0.5, c[1]); gr.addColorStop(1, c[0]); g.strokeStyle = gr; g.lineWidth = 2; for (let y = 0; y < H; y += 14) { g.beginPath(); g.moveTo(0, y); g.lineTo(W, y); g.stroke(); } for (let x = 0; x < W; x += 32) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, H); g.stroke(); } },
  },
  clock: {
    m(g) { vg(g, ['#0e1228', '#1b2244', '#0e1228']); },
    e(g, c) {
      black(g); g.lineCap = 'round';
      [128, 384].forEach((cx) => { for (let k = 0; k < 12; k++) { const a = k / 12 * TAU, r0 = k % 3 ? 74 : 62; g.strokeStyle = k % 3 ? c[1] : c[0]; g.lineWidth = k % 3 ? 3 : 6; g.beginPath(); g.moveTo(cx + Math.cos(a) * r0, 128 + Math.sin(a) * r0); g.lineTo(cx + Math.cos(a) * 88, 128 + Math.sin(a) * 88); g.stroke(); } g.beginPath(); g.arc(cx, 128, 96, 0, TAU); g.lineWidth = 2; g.strokeStyle = c[1]; g.stroke(); });
    },
  },
  swirl: { m(g, c) { swirl(g, c, 21); } },
  jade: {
    m(g, c) { vg(g, ['#0b4a2a', c[0], '#0b4a2a']); blobs(g, '#35d27e', 40, 20, 70, 0.22, 4); g.globalAlpha = 0.5; crack(g, 12, 9, '#b8ffd8', 1.5, 0); g.globalAlpha = 1; },
    e(g, c) { black(g); g.strokeStyle = c[1]; g.lineWidth = 3; g.shadowColor = c[1]; g.shadowBlur = FXQ ? 8 : 0; [128, 384].forEach((cx) => { g.beginPath(); g.arc(cx, 128, 52, 0, TAU); g.stroke(); g.strokeRect(cx - 34, 94, 68, 68); g.beginPath(); g.moveTo(cx, 62); g.lineTo(cx + 40, 128); g.lineTo(cx, 194); g.lineTo(cx - 40, 128); g.closePath(); g.stroke(); }); g.shadowBlur = FXQ ? 0 : 0; },
  },
  aurora: {
    m(g, c) {
      vg(g, ['#041a2a', '#06283a', '#041a2a']);
      for (let b = 0; b < 5; b++) { const base = 40 + b * 34; g.fillStyle = c[b % c.length]; g.globalAlpha = 0.5; g.beginPath(); g.moveTo(0, base + 60); for (let x = 0; x <= W; x += 8) g.lineTo(x, base + Math.sin(x / 40 + b * 1.7) * 18); g.lineTo(W, base + 60); g.closePath(); g.fill(); }
      g.globalAlpha = 1; blobs(g, '#fff', 30, 1, 3, 0.7, 14);
    },
  },
  moon: {
    m(g, c) {
      vg(g, [c[0], c[1], c[0]]); blobs(g, c[1], 80, 3, 10, 0.25, 4);
      for (let i = 0; i < 26; i++) { const x = ra(i, 1) * W, y = 20 + ra(i, 2) * (H - 40), r = 8 + ra(i, 3) * 30; wr(g, () => { g.fillStyle = c[1]; g.globalAlpha = 0.55; g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill(); g.strokeStyle = '#fff'; g.globalAlpha = 0.35; g.lineWidth = 3; g.beginPath(); g.arc(x - 2, y - 2, r, 0.8, 3.9); g.stroke(); }); }
      g.globalAlpha = 1;
    },
  },
  sun: { m(g, c) { vg(g, [c[1], c[0], c[1]]); blobs(g, '#ff5a00', 70, 10, 40, 0.5, 5); blobs(g, '#fff0a0', 60, 8, 26, 0.4, 6); } },
  galaxy: {
    m(g, c) {
      vg(g, ['#05030f', '#0a0630', '#05030f']); blobs(g, c[0], 10, 30, 90, 0.2, 31); blobs(g, c[1], 8, 30, 80, 0.2, 32); blobs(g, c[2], 6, 20, 60, 0.2, 33);
      for (let arm = 0; arm < 3; arm++) for (let i = 0; i < 90; i++) { const a = i / 90 * TAU * 1.4 + arm * 2.1, r = i * 1.6; g.fillStyle = c[arm % 3]; g.globalAlpha = 0.5; const x = 128 + Math.cos(a) * r * 1.2, y = 128 + Math.sin(a) * r * 0.5; wr(g, () => { g.beginPath(); g.arc(x, y, 2 + ra(i, arm) * 3, 0, TAU); g.fill(); }); }
      g.globalAlpha = 1; g.fillStyle = '#fff'; for (let i = 0; i < 130; i++) { g.globalAlpha = 0.3 + ra(i, 40) * 0.7; g.fillRect(ra(i, 41) * W, ra(i, 42) * H, 2, 2); } g.globalAlpha = 1;
    },
  },
  ice: {
    m(g, c) { vg(g, [c[0], c[1], c[0]]); blobs(g, '#fff', 50, 6, 24, 0.3, 7); g.globalAlpha = 0.7; crack(g, 15, 12, '#fff', 1.6, 0); g.globalAlpha = 1; g.fillStyle = '#fff'; for (let i = 0; i < 200; i++) { g.globalAlpha = 0.2 + ra(i, 50) * 0.5; g.fillRect(ra(i, 51) * W, ra(i, 52) * H, 2, 2); } g.globalAlpha = 1; },
  },
  flames: {
    m(g, c) {
      const bg = c[3] || '#120404'; vg(g, [bg, bg, bg]);
      for (let i = 0; i < 28; i++) {
        const x = ra(i, 61) * W, h = 70 + ra(i, 62) * 90, dx = (ra(i, 63) - 0.5) * 24, up = i & 1; g.fillStyle = c[i % 3]; g.globalAlpha = 0.85;
        wr(g, () => { g.save(); if (up) { g.translate(0, H); g.scale(1, -1); } g.beginPath(); g.moveTo(x - 20, H); g.quadraticCurveTo(x - 12, H - h * 0.5, x + dx, H - h); g.quadraticCurveTo(x + 16, H - h * 0.4, x + 20, H); g.fill(); g.restore(); });
      }
      g.globalAlpha = 1;
    },
  },
  neon: {
    m(g, c) {
      g.fillStyle = '#050510'; g.fillRect(0, 0, W, H); g.lineWidth = 5; g.lineCap = 'round'; g.lineJoin = 'round';
      for (let k = 0; k < 6; k++) { g.strokeStyle = c[k & 1]; g.shadowColor = c[k & 1]; g.shadowBlur = FXQ ? 12 : 0; const y = 22 + k * 40, kx = 60 + ra(k, 71) * 300; g.beginPath(); g.moveTo(0, y); g.lineTo(kx, y); g.lineTo(kx + 26, y + 20); g.lineTo(W, y + 20); g.stroke(); }
      g.shadowBlur = FXQ ? 0 : 0;
    },
  },
  circuit: { m(g, c) { circuit(g, c[0], 81, '#04102a'); } },
  runes: { m(g, c) { vg(g, ['#120626', '#220a46', '#120626']); runes(g, c[0], 91, false); }, e(g, c) { black(g); runes(g, c[0], 91, true); } },
  clouds: {
    m(g, c) { vg(g, [c[0], '#8fd0ff', c[0]]); for (let i = 0; i < 16; i++) { const x = ra(i, 101) * W, y = 30 + ra(i, 102) * 190; wr(g, () => { g.fillStyle = c[1]; g.globalAlpha = 0.55; for (let k = 0; k < 5; k++) { g.beginPath(); g.arc(x + k * 20 - 40, y + Math.sin(k * 1.7) * 8, 20 + ra(i + k, 103) * 16, 0, TAU); g.fill(); } }); } g.globalAlpha = 1; },
  },
  metal: {
    m(g, c) {
      vg(g, [c[1], c[0], c[1], c[0], c[1]]); g.strokeStyle = '#fff'; g.lineWidth = 1;
      for (let i = 0; i < 120; i++) { g.globalAlpha = 0.05 + ra(i, 111) * 0.1; const y = ra(i, 112) * H; g.beginPath(); g.moveTo(0, y); g.lineTo(W, y); g.stroke(); }
      if (!c[2]) { g.globalAlpha = 0.45; g.lineWidth = 2; for (let x = 0; x < W; x += 32) { g.beginPath(); g.moveTo(x + 16, 108); g.lineTo(x + 30, 128); g.lineTo(x + 16, 148); g.lineTo(x + 2, 128); g.closePath(); g.stroke(); } g.fillStyle = '#5a3a00'; g.fillRect(0, 100, W, 5); g.fillRect(0, 151, W, 5); }
      g.globalAlpha = 1;
    },
    ok: (c) => !!c[2],
    e(g, c) { black(g); g.strokeStyle = c[2]; g.shadowColor = c[2]; g.shadowBlur = FXQ ? 10 : 0; g.lineWidth = 3; for (let k = 0; k < 7; k++) { const y = 18 + k * 36, x = ra(k, 113) * 300; g.beginPath(); g.moveTo(x, y); g.lineTo(x + 90 + ra(k, 114) * 80, y); g.stroke(); } g.shadowBlur = FXQ ? 0 : 0; },
  },
  lion: {
    m(g, c) {
      vg(g, [c[0], c[0], c[1]]); blobs(g, '#fff', 20, 10, 40, 0.1, 121);
      [128, 384].forEach((cx) => {
        g.fillStyle = c[1]; for (let k = 0; k < 28; k++) { const a = k / 28 * TAU; g.beginPath(); g.moveTo(cx + Math.cos(a - 0.12) * 52, 128 + Math.sin(a - 0.12) * 52); g.lineTo(cx + Math.cos(a) * 88, 128 + Math.sin(a) * 88); g.lineTo(cx + Math.cos(a + 0.12) * 52, 128 + Math.sin(a + 0.12) * 52); g.fill(); }
        g.fillStyle = c[0]; g.beginPath(); g.arc(cx, 128, 50, 0, TAU); g.fill();
        g.fillStyle = c[1]; [[-34, -40], [34, -40]].forEach(([dx, dy]) => { g.beginPath(); g.arc(cx + dx, 128 + dy, 11, 0, TAU); g.fill(); });
        g.beginPath(); g.ellipse(cx - 17, 120, 7, 5, 0, 0, TAU); g.ellipse(cx + 17, 120, 7, 5, 0, 0, TAU); g.fill();
        g.beginPath(); g.moveTo(cx - 9, 134); g.lineTo(cx + 9, 134); g.lineTo(cx, 148); g.closePath(); g.fill();
        g.strokeStyle = c[1]; g.lineWidth = 3; g.beginPath(); g.moveTo(cx, 148); g.lineTo(cx, 156); g.moveTo(cx - 18, 160); g.quadraticCurveTo(cx, 152, cx + 18, 160); g.stroke();
      });
    },
  },
  scales: {
    m(g, c) { vg(g, ['#061a4a', c[0], '#061a4a']); g.strokeStyle = c[1]; g.lineWidth = 2; for (let r = 0; r < 20; r++) for (let q = 0; q < 24; q++) { g.globalAlpha = 0.4 + ra(r * 24 + q, 131) * 0.3; g.beginPath(); g.arc(q * 22 + (r & 1 ? 11 : 0), r * 13, 11, 0, Math.PI); g.stroke(); } g.globalAlpha = 1; },
  },
  leaves: {
    m(g, c) {
      vg(g, ['#0e5a1e', c[0], '#0e5a1e']);
      for (let i = 0; i < 44; i++) { const x = ra(i, 141) * W, y = ra(i, 142) * H, a = ra(i, 143) * TAU, s = 0.6 + ra(i, 144) * 0.8; wr(g, () => { g.save(); g.translate(x, y); g.rotate(a); g.scale(s, s); g.fillStyle = i & 1 ? c[1] : '#2fd05a'; g.beginPath(); g.moveTo(0, -26); g.quadraticCurveTo(20, 0, 0, 26); g.quadraticCurveTo(-20, 0, 0, -26); g.fill(); g.strokeStyle = '#0a4a18'; g.lineWidth = 2; g.beginPath(); g.moveTo(0, -24); g.lineTo(0, 24); g.stroke(); g.restore(); }); }
    },
  },
  petals: {
    m(g, c) {
      vg(g, [c[0], c[1], c[0]]); blobs(g, '#fff', 30, 10, 40, 0.18, 151);
      for (let i = 0; i < 16; i++) { const x = ra(i, 152) * W, y = ra(i, 153) * H, s = 0.7 + ra(i, 154) * 0.7; wr(g, () => { g.save(); g.translate(x, y); g.scale(s, s); g.fillStyle = '#fff'; g.globalAlpha = 0.85; for (let k = 0; k < 5; k++) { g.rotate(TAU / 5); g.beginPath(); g.ellipse(0, -12, 7, 12, 0, 0, TAU); g.fill(); } g.fillStyle = '#ff5aa0'; g.globalAlpha = 1; g.beginPath(); g.arc(0, 0, 3.5, 0, TAU); g.fill(); g.restore(); }); }
    },
  },
  star: {
    m(g, c) {
      vg(g, ['#0a1e6a', c[0], '#0a1e6a']); blobs(g, '#fff', 40, 1, 3, 0.6, 161);
      [128, 384].forEach((cx) => { g.fillStyle = c[1]; g.shadowColor = c[1]; g.shadowBlur = FXQ ? 20 : 0; g.beginPath(); for (let k = 0; k < 10; k++) { const r = k & 1 ? 32 : 78, a = k * Math.PI / 5 - Math.PI / 2; g.lineTo(cx + Math.cos(a) * r, 128 + Math.sin(a) * r); } g.closePath(); g.fill(); g.shadowBlur = FXQ ? 0 : 0; });
    },
    e(g, c) { black(g); [128, 384].forEach((cx) => { g.fillStyle = c[1]; g.beginPath(); for (let k = 0; k < 10; k++) { const r = k & 1 ? 32 : 78, a = k * Math.PI / 5 - Math.PI / 2; g.lineTo(cx + Math.cos(a) * r, 128 + Math.sin(a) * r); } g.closePath(); g.fill(); }); },
  },
  royal: {
    m(g, c) {
      vg(g, [c[0], c[0], c[0]]); g.strokeStyle = c[1]; g.fillStyle = c[1]; g.lineWidth = 2;
      for (let x = 0; x <= W; x += 48) for (let y = 0; y <= H; y += 48) { g.globalAlpha = 0.5; g.beginPath(); g.moveTo(x, y - 20); g.lineTo(x + 20, y); g.lineTo(x, y + 20); g.lineTo(x - 20, y); g.closePath(); g.stroke(); g.globalAlpha = 0.25; g.beginPath(); g.arc(x + 24, y + 24, 6, 0, TAU); g.fill(); }
      g.globalAlpha = 0.8; g.lineWidth = 4; g.beginPath(); g.arc(256, 128, 70, 0, TAU); g.stroke(); g.lineWidth = 2; g.beginPath(); g.arc(256, 128, 54, 0, TAU); g.stroke(); g.globalAlpha = 1;
    },
  },
  space: {
    m(g, c) {
      vg(g, ['#02030f', '#0a1240', '#02030f']); blobs(g, c[0], 8, 30, 90, 0.18, 171); blobs(g, '#fff', 90, 1, 2.4, 0.8, 172);
      g.strokeStyle = c[1]; g.lineWidth = 3; g.globalAlpha = 0.8; g.beginPath(); g.ellipse(256, 128, 220, 70, 0.2, 0, TAU); g.stroke(); g.lineWidth = 2; g.beginPath(); g.ellipse(256, 128, 160, 48, 0.2, 0, TAU); g.stroke(); g.globalAlpha = 1;
      const gr = g.createRadialGradient(390, 90, 2, 390, 90, 24); gr.addColorStop(0, '#fff3b0'); gr.addColorStop(1, c[1]); g.fillStyle = gr; g.beginPath(); g.arc(390, 90, 22, 0, TAU); g.fill();
    },
  },
  hex: {
    m(g, c) {
      vg(g, ['#041428', '#082a50', '#041428']); g.strokeStyle = c[0]; g.lineWidth = 2; g.globalAlpha = 0.7;
      for (let r = -1; r < 9; r++) for (let q = -1; q < 17; q++) { const cx = q * 32 + (r & 1 ? 16 : 0), cy = r * 28; g.beginPath(); for (let k = 0; k < 6; k++) { const a = Math.PI / 3 * k + Math.PI / 6; g.lineTo(cx + 15 * Math.cos(a), cy + 15 * Math.sin(a)); } g.closePath(); g.stroke(); }
      g.globalAlpha = 1;
    },
  },
};

/* dibuja las texturas de una pelota: s = escala (1 = 512x256, 0.5 = 256x128) */
function paint(v, s) {
  FXQ = s >= 1;
  const p = PT[v.tx] || PT.swirl, c = v.tc || ['#fff', '#9cf', '#36f'], out = {};
  const run = (fn) => { const cv = mkC(W * s, H * s), g = cv.getContext('2d'); g.scale(s, s); fn(g, c); const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = 2; return t; };
  out.map = run(p.m); if (p.e && (!p.ok || p.ok(c))) out.em = run(p.e);
  return out;
}

/* dibuja un pintor (lava, agua, circuitos...) en un canvas del tamaño que se pida: lo usan las mesas. pass: 'm' color · 'e' brillo (si el pintor lo tiene) */
export function paintCanvas(tx, tc, w, h, pass = 'm') {
  FXQ = w >= 512; const p = PT[tx] || PT.swirl, fn = pass === 'e' && p.e && (!p.ok || p.ok(tc)) ? p.e : p.m, cv = mkC(w, h), g = cv.getContext('2d'); g.scale(w / W, h / H); fn(g, tc); return cv;
}
export const hasEm = (tx, tc) => { const p = PT[tx]; return !!(p && p.e && (!p.ok || p.ok(tc))); };

/* ---------------------------------------------------------------- efectos por datos */
/* partículas ambientales: [por segundo, velocidad, cuánto suben] */
export const AMB = {
  ash: [8, 0.5, 1.6], bubble: [7, 0.35, 2.2], spark: [9, 1.8, 0.6], glint: [8, 0.6, 1], digital: [9, 0.5, 1.4], dust: [8, 0.4, 0.8], ember: [9, 0.7, 2],
  mote: [7, 0.4, 1.3], petal: [6, 0.35, 0.4], snow: [8, 0.3, 0.2], leaf: [6, 0.5, 0.5], star: [8, 0.8, 1.2], gold: [8, 0.5, 1.4], wind: [10, 1.2, 0.3], tick: [6, 0.6, 0.8], smoke: [7, 0.4, 1.8],
};
/* efecto al golpear: n partículas, velocidad, altura, colores extra, anillos [{c: color (null = el de la pelota), big, d: retraso en s}] */
export const HIT = {
  lava: { n: 22, sp: 2.4, up: 2.6, c: ['#ffb000', '#2a0a04'], ring: [{ c: '#ff4a10', big: 1.2 }] },
  inferno: { n: 26, sp: 2.8, up: 2.2, c: ['#ffb000', '#ff2200', '#ffe08a'], ring: [{ c: '#ff2200', big: 1.4 }, { c: '#ffb000', big: 0.8, d: 0.08 }] },
  splash: { n: 26, sp: 1.9, up: 3.4, c: ['#ffffff', '#bfe8ff'], ring: [{ c: null, big: 1.3 }] },
  bolt: { n: 24, sp: 4.2, up: 0.4, c: ['#ffffff', '#d6c8ff'], ring: [{ c: '#ffffff', big: 0.9 }, { c: null, big: 1.4, d: 0.05 }] },
  shard: { n: 20, sp: 3.4, up: 1.8, c: ['#ffffff'], ring: [{ c: null, big: 0.8 }] },
  flash: { n: 12, sp: 2.2, up: 1.2, c: ['#ffffff'], ring: [{ c: '#ffffff', big: 1.6 }, { c: null, big: 1, d: 0.06 }] },
  glitch: { n: 18, sp: 2.4, up: 0.3, c: ['#19ffd0', '#ff3df2', '#ffffff'], ring: [{ c: '#19ffd0', big: 1.1 }, { c: '#ff3df2', big: 1.1, d: 0.07 }, { c: '#ffffff', big: 0.7, d: 0.14 }] },
  pulse: { n: 8, sp: 1.6, up: 0.8, c: [], ring: [{ c: null, big: 0.8 }, { c: null, big: 1.3, d: 0.1 }, { c: null, big: 1.8, d: 0.2 }] },
  blast: { n: 34, sp: 4.4, up: 1.6, c: ['#ffffff'], ring: [{ c: null, big: 1.8 }] },
  wave: { n: 24, sp: 2.6, up: 1.4, c: ['#19ffa0', '#2f8bff', '#b04dff'], ring: [{ c: '#19ffa0', big: 1.2 }, { c: '#b04dff', big: 1.7, d: 0.1 }] },
  dust: { n: 24, sp: 1.2, up: 0.9, c: ['#cfd6e4', '#8a8f9c'], ring: [] },
  flare: { n: 24, sp: 3.2, up: 2, c: ['#ffe08a', '#ffffff'], ring: [{ c: null, big: 1.5 }] },
  cosmic: { n: 28, sp: 2.4, up: 1.6, c: ['#ffffff', '#b04dff', '#2fb8ff'], ring: [{ c: null, big: 1.4 }, { c: '#ffffff', big: 0.7, d: 0.1 }] },
  swirl: { n: 24, sp: 3.4, up: 0.5, c: ['#ffffff'], ring: [{ c: null, big: 1.3 }, { c: null, big: 1.9, d: 0.08 }] },
  petals: { n: 22, sp: 1.2, up: 1.4, c: ['#ffffff', '#ffc0dc'], ring: [{ c: '#ff9ac8', big: 1 }] },
  frost: { n: 22, sp: 1.8, up: 1.2, c: ['#ffffff', '#bfe8ff'], ring: [{ c: '#bfe8ff', big: 1.2 }] },
  sparkle: { n: 30, sp: 2.2, up: 2.4, c: ['#ffffff'], ring: [{ c: null, big: 1 }] },
  royal: { n: 30, sp: 2.4, up: 2.6, c: ['#ffffff', '#fff3b0'], ring: [{ c: '#ffc21a', big: 1.5 }, { c: '#ffffff', big: 0.9, d: 0.1 }] },
  magic: { n: 22, sp: 2.2, up: 1.8, c: ['#ffffff'], ring: [{ c: null, big: 1.2 }, { c: null, big: 1.7, d: 0.12 }] },
  metal: { n: 24, sp: 3.8, up: 1.2, c: ['#ffffff', '#cfd8e8'], ring: [{ c: '#cfd8e8', big: 1.3 }] },
  leaf: { n: 20, sp: 1.6, up: 1.8, c: ['#9aff5a', '#2fd05a'], ring: [{ c: '#3dff6a', big: 1 }] },
  orbit: { n: 22, sp: 2.8, up: 1, c: ['#7fe8ff', '#ff6ad8'], ring: [{ c: '#7fe8ff', big: 1.2 }, { c: '#ff6ad8', big: 1.6, d: 0.1 }] },
  neon: { n: 20, sp: 3.4, up: 0.3, c: ['#19ffd0', '#ff3df2'], ring: [{ c: '#19ffd0', big: 1.3 }, { c: '#ff3df2', big: 1.3, d: 0.06 }] },
  scan: { n: 16, sp: 1.6, up: 0.2, c: ['#7fe8ff', '#ff3df2'], ring: [{ c: '#7fe8ff', big: 1.8 }] },
  chip: { n: 20, sp: 2.6, up: 0.5, c: ['#19d3ff', '#ffffff'], ring: [{ c: null, big: 1.2 }, { c: '#ffffff', big: 0.7, d: 0.08 }] },
  future: { n: 24, sp: 3, up: 1, c: ['#7fe8ff', '#ff3df2', '#ffffff'], ring: [{ c: null, big: 1.4 }, { c: '#ff3df2', big: 0.8, d: 0.1 }] },
  ripple: { n: 12, sp: 1.4, up: 1.2, c: ['#ffffff', '#7fe0ff'], ring: [{ c: null, big: 1 }, { c: null, big: 1.5, d: 0.12 }, { c: null, big: 2, d: 0.24 }] },
  puff: { n: 18, sp: 1.4, up: 1, c: ['#ffffff', '#cfe8ff'], ring: [{ c: '#ffffff', big: 1.1 }] },
};
/* partículas ya listas para usar: { amb: {rate, sp, up, cols}, hit: {n, sp, up, cols, ring} } */
const fxCache = new Map();
export function skinFx(it) {
  let f = fxCache.get(it.id); if (f) return f;
  const v = it.v, base = v.pc || [v.au || '#fff', typeof v.tr === 'string' ? v.tr : '#fff'], a = AMB[v.am] || AMB.mote, h = HIT[v.ht] || HIT.flash;
  f = { amb: { rate: a[0] * (LOW ? 0.45 : 1), sp: a[1], up: a[2], cols: base }, hit: { n: Math.round(h.n * (LOW ? 0.6 : 1)), sp: h.sp, up: h.up, cols: h.c.concat(base), ring: h.ring.map((r) => ({ c: r.c || base[0], big: r.big, d: r.d || 0 })) } };
  fxCache.set(it.id, f); return f;
}

/* ---------------------------------------------------------------- partículas propias de una pelota (solo se usan en la tienda; en la partida se usa el sistema de partículas de render3d) */
export class Emitter {
  constructor(max, size = 0.2) {
    this.max = max; this.n = 0; this.pos = new Float32Array(max * 3); this.col = new Float32Array(max * 3); this.vel = new Float32Array(max * 3); this.life = new Float32Array(max); this.c0 = new Float32Array(max * 3);
    this.geo = new THREE.BufferGeometry(); this.geo.setAttribute('position', new THREE.BufferAttribute(this.pos, 3)); this.geo.setAttribute('color', new THREE.BufferAttribute(this.col, 3));
    this.mat = new THREE.PointsMaterial({ size, map: glow(), vertexColors: true, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending });
    this.obj = new THREE.Points(this.geo, this.mat); this.obj.frustumCulled = false;
  }
  emit(n, cols, sp, up, r = 1) {
    for (let i = 0; i < n && this.n < this.max; i++) {
      const j = this.n++, a = Math.random() * TAU, b = Math.acos(2 * Math.random() - 1), v = (0.4 + Math.random()) * sp, c = new THREE.Color(cols[i % cols.length]);
      this.pos.set([Math.sin(b) * Math.cos(a) * r, Math.cos(b) * r, Math.sin(b) * Math.sin(a) * r], j * 3);
      this.vel.set([Math.sin(b) * Math.cos(a) * v, Math.cos(b) * v * 0.6 + Math.random() * up * 0.5, Math.sin(b) * Math.sin(a) * v], j * 3);
      this.life[j] = 0.7 + Math.random() * 0.8; this.c0.set([c.r, c.g, c.b], j * 3);
    }
  }
  step(dt) {
    for (let i = 0; i < this.n; i++) {
      this.life[i] -= dt;
      if (this.life[i] <= 0) { const l = --this.n; ['pos', 'vel', 'c0'].forEach((k) => this[k].copyWithin(i * 3, l * 3, l * 3 + 3)); this.life[i] = this.life[l]; i--; continue; }
      for (let k = 0; k < 3; k++) this.pos[i * 3 + k] += this.vel[i * 3 + k] * dt;
      const f = Math.min(1, this.life[i] * 1.5); for (let k = 0; k < 3; k++) this.col[i * 3 + k] = this.c0[i * 3 + k] * f;
    }
    this.geo.setDrawRange(0, this.n); this.geo.attributes.position.needsUpdate = true; this.geo.attributes.color.needsUpdate = true;
  }
}

/* ---------------------------------------------------------------- piezas que orbitan o van dentro (todas por datos: { k, n, r, s, c, sp, ... }) */
const gearMesh = (r, col, own) => {
  const gr = new THREE.Group(), m = new THREE.MeshStandardMaterial({ color: col, metalness: 0.9, roughness: 0.3, emissive: col, emissiveIntensity: 0.25 });
  const ring = new THREE.TorusGeometry(r, r * 0.16, 6, 20), tooth = new THREE.BoxGeometry(r * 0.28, r * 0.34, r * 0.3), hub = new THREE.CylinderGeometry(r * 0.22, r * 0.22, r * 0.3, 8);
  own.push(m, ring, tooth, hub);
  gr.add(new THREE.Mesh(ring, m)); const h = new THREE.Mesh(hub, m); h.rotation.x = Math.PI / 2; gr.add(h);
  for (let k = 0; k < 8; k++) { const a = k / 8 * TAU, t = new THREE.Mesh(tooth, m); t.position.set(Math.cos(a) * (r + r * 0.12), Math.sin(a) * (r + r * 0.12), 0); t.rotation.z = a - Math.PI / 2; gr.add(t); }
  return gr;
};

export const ORB = {
  shard(o, rig) {
    const geo = o.geo === 'box' ? new THREE.BoxGeometry(1, 1, 1) : o.geo === 'rock' ? new THREE.DodecahedronGeometry(1, 0) : new THREE.OctahedronGeometry(1, 0);
    const mat = new THREE.MeshStandardMaterial({ color: o.c, emissive: o.geo === 'rock' ? 0x000000 : o.c, emissiveIntensity: 0.7, metalness: 0.3, roughness: 0.35, flatShading: true });
    rig.own.push(geo, mat); const pv = new THREE.Group(); pv.rotation.set(o.tx || 0.5, 0, o.tz || 0.3); rig.spin.add(pv);
    const items = []; for (let i = 0; i < rig.cnt(o.n || 4); i++) { const m = new THREE.Mesh(geo, mat); m.scale.setScalar((o.s || 0.1) * (0.6 + ra(i, 5) * 0.8)); pv.add(m); items.push(m); }
    return (t) => items.forEach((m, i) => { const a = t * (o.sp || 0.8) + i / items.length * TAU, r = (o.r || 1.4) + Math.sin(a * 2 + i) * 0.12; m.position.set(Math.cos(a) * r, Math.sin(a * 2 + i) * 0.25, Math.sin(a) * r); m.rotation.x = t * 1.2 + i; m.rotation.y = t * 0.9; });
  },
  ring(o, rig) {
    const n = rig.cnt(o.n || 1), fs = [];
    for (let i = 0; i < n; i++) {
      const geo = new THREE.TorusGeometry(o.r || 1.3, o.s || 0.02, 8, 72), mat = new THREE.MeshBasicMaterial({ color: Array.isArray(o.c) ? o.c[i % o.c.length] : o.c, transparent: true, opacity: o.op || 0.8, blending: THREE.AdditiveBlending, depthWrite: false });
      rig.own.push(geo, mat); const m = new THREE.Mesh(geo, mat);
      if (o.ax === 'x') { const w = new THREE.Group(); w.rotation.y = Math.PI / 2; w.position.x = (i - (n - 1) / 2) * 0.55; w.add(m); rig.spin.add(w); }      /* anillo alrededor de una paleta */
      else { m.rotation.x = Math.PI / 2 + i * 0.9; m.rotation.y = i * 0.7; rig.spin.add(m); }
      fs.push(m);
    }
    return (t) => fs.forEach((m, i) => { m.rotation.z = t * (o.sp || 1) * (i & 1 ? -1 : 1); m.scale.setScalar(1 + 0.05 * Math.sin(t * 3 + i)); });
  },
  petal(o, rig) {
    const geo = new THREE.PlaneGeometry(o.leaf ? 0.5 : 0.7, o.leaf ? 1 : 0.95), cols = Array.isArray(o.c) ? o.c : [o.c], mats = cols.map((c) => new THREE.MeshStandardMaterial({ color: c, emissive: c, emissiveIntensity: o.em ?? 0.25, side: THREE.DoubleSide, roughness: 0.6 }));
    rig.own.push(geo, ...mats); const items = [];
    for (let i = 0; i < rig.cnt(o.n || 6); i++) { const m = new THREE.Mesh(geo, mats[i % mats.length]); m.scale.setScalar(o.s || 0.16); rig.spin.add(m); items.push(m); }
    return (t) => items.forEach((m, i) => { const a = t * (o.sp || 0.7) + i / items.length * TAU, r = (o.r || 1.4) + Math.sin(t * 1.3 + i) * 0.12; m.position.set(Math.cos(a) * r, Math.sin(a * 1.7 + i) * 0.5, Math.sin(a) * r); m.rotation.set(t * 1.5 + i, a, t * 1.1); });
  },
  fish(o, rig) {
    const body = new THREE.ConeGeometry(0.4, 1.5, 8), tail = new THREE.ConeGeometry(0.35, 0.6, 3); body.rotateX(Math.PI / 2); tail.rotateX(-Math.PI / 2); tail.scale(1, 0.2, 1);
    const cols = Array.isArray(o.c) ? o.c : [o.c], mats = cols.map((c) => new THREE.MeshStandardMaterial({ color: c, emissive: c, emissiveIntensity: 0.25, roughness: 0.4 }));
    rig.own.push(body, tail, ...mats); const pv = new THREE.Group(); pv.rotation.set(0.4, 0, 0.2); rig.spin.add(pv); const items = [];
    for (let i = 0; i < rig.cnt(o.n || 3); i++) { const g = new THREE.Group(), b = new THREE.Mesh(body, mats[i % mats.length]), tl = new THREE.Mesh(tail, mats[(i + 1) % mats.length]); tl.position.z = -1; g.add(b, tl); g.scale.setScalar(o.s || 0.14); g.userData.tl = tl; pv.add(g); items.push(g); }
    const P = (t, i) => { const a = t * (o.sp || 0.9) + i / items.length * TAU; return [Math.cos(a) * (o.r || 1.35), Math.sin(a * 2 + i) * 0.3, Math.sin(a) * (o.r || 1.35)]; };
    return (t) => items.forEach((g, i) => { const p = P(t, i), q = P(t + 0.05, i); g.position.set(p[0], p[1], p[2]); g.lookAt(pv.localToWorld(new THREE.Vector3(q[0], q[1], q[2]))); g.userData.tl.rotation.y = Math.sin(t * 9 + i) * 0.6; });
  },
  electron(o, rig) {
    const ringG = new THREE.TorusGeometry(o.r || 1.3, 0.012, 6, 64), ringM = new THREE.MeshBasicMaterial({ color: o.c, transparent: true, opacity: 0.55 }), eg = new THREE.SphereGeometry(0.075, 10, 8), em = new THREE.MeshBasicMaterial({ color: '#fff' });
    rig.own.push(ringG, ringM, eg, em); const items = [];
    for (let i = 0; i < rig.cnt(o.n || 3); i++) { const pv = new THREE.Group(); pv.rotation.set(i * 1.05, i * 0.6, 0); pv.add(new THREE.Mesh(ringG, ringM)); const e = new THREE.Mesh(eg, em); pv.add(e); rig.spin.add(pv); items.push(e); }
    return (t) => items.forEach((e, i) => { const a = t * (o.sp || 2.4) * (1 + i * 0.25) + i * 2; e.position.set(Math.cos(a) * (o.r || 1.3), Math.sin(a) * (o.r || 1.3), 0); });
  },
  gear(o, rig) {
    const set = [[-0.28, 0.08, 0, 0.42, 1], [0.3, 0.2, 0.05, 0.3, -1.4], [0.02, -0.42, 0.1, 0.27, 1.5]].slice(0, rig.cnt(o.n || 3, 2)), gs = [];
    set.forEach(([x, y, z, r, sp]) => { const g = gearMesh(r, o.c, rig.own); g.position.set(x, y, z); rig.inner.add(g); gs.push([g, sp]); });
    return (t) => gs.forEach(([g, sp]) => { g.rotation.z = t * sp; });
  },
  helix(o, rig) {
    const n = rig.cnt(o.n || 24), pos = new Float32Array(n * 3), geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const mat = new THREE.PointsMaterial({ size: 0.2, map: glow(), color: o.c, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }); rig.own.push(geo, mat);
    const p = new THREE.Points(geo, mat); p.frustumCulled = false; rig.group.add(p);
    return (t) => { for (let i = 0; i < n; i++) { const h = i / n, a = h * TAU * 3 + t * (o.sp || 4), r = 0.55 + h * 0.95; pos[i * 3] = Math.cos(a) * r; pos[i * 3 + 1] = (h - 0.5) * 2.7; pos[i * 3 + 2] = Math.sin(a) * r; } geo.attributes.position.needsUpdate = true; };
  },
  dragon(o, rig) {
    const seg = rig.cnt(o.n || 9, 6), sg = new THREE.SphereGeometry(1, 10, 8), hg = new THREE.ConeGeometry(0.55, 1.5, 8), wg = new THREE.ConeGeometry(0.5, 1.6, 3); hg.rotateX(Math.PI / 2); wg.rotateX(Math.PI / 2); wg.scale(1, 0.15, 1);
    const mat = new THREE.MeshStandardMaterial({ color: o.c, emissive: o.c, emissiveIntensity: 0.9, roughness: 0.3, metalness: 0.2 }); rig.own.push(sg, hg, wg, mat);
    const pv = new THREE.Group(); pv.rotation.set(o.ax === 'x' ? 0 : 0.5, 0, o.ax === 'x' ? Math.PI / 2 : 0.35); pv.scale.setScalar(o.z || 1); rig.spin.add(pv); const items = [];
    for (let i = 0; i < seg; i++) { const m = new THREE.Mesh(i ? sg : hg, mat); m.scale.setScalar(i ? 0.12 - i * 0.009 : 0.15); pv.add(m); items.push(m); }
    const wings = [-1, 1].map((sd) => { const w = new THREE.Mesh(wg, mat); w.scale.setScalar(0.12); items[0].add(w); w.userData.sd = sd; return w; });
    const P = (t, i) => { const a = t * (o.sp || 1.1) - i * 0.17; return [Math.cos(a) * (o.r || 1.4), Math.sin(a * 1.4) * 0.5, Math.sin(a) * (o.r || 1.4)]; };
    return (t) => { items.forEach((m, i) => { const p = P(t, i); m.position.set(p[0], p[1], p[2]); }); const q = P(t + 0.06, 0); items[0].lookAt(pv.localToWorld(new THREE.Vector3(q[0], q[1], q[2]))); wings.forEach((w) => { w.position.set(w.userData.sd * 0.5, 0.2, -0.4); w.rotation.z = w.userData.sd * (0.5 + Math.sin(t * 8) * 0.5); }); };
  },
  spark(o, rig) {
    const items = [], cols = Array.isArray(o.c) ? o.c : [o.c];
    for (let i = 0; i < rig.cnt(o.n || 5); i++) { const m = new THREE.SpriteMaterial({ map: glow(), color: cols[i % cols.length], transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }); rig.own.push(m); const s = new THREE.Sprite(m); rig.spin.add(s); items.push(s); }
    return (t) => items.forEach((s, i) => { const a = t * (o.sp || 1) + i / items.length * TAU, r = (o.r || 1.3) + Math.sin(a * 2 + i) * 0.1, k = 0.5 + 0.5 * Math.sin(t * 3 + i * 2); s.position.set(Math.cos(a) * r, Math.sin(a * 1.6 + i) * 0.55, Math.sin(a) * r); s.scale.setScalar((o.s || 0.28) * (0.5 + k)); s.material.opacity = 0.35 + 0.65 * k; });
  },
  bubble(o, rig) {
    const geo = new THREE.SphereGeometry(1, 10, 8), mat = new THREE.MeshPhysicalMaterial({ color: o.c, transparent: true, opacity: 0.4, roughness: 0.05, clearcoat: 1, depthWrite: false }); rig.own.push(geo, mat); const items = [];
    for (let i = 0; i < rig.cnt(o.n || 6); i++) { const m = new THREE.Mesh(geo, mat); rig.inner.add(m); items.push(m); }
    return (t) => items.forEach((m, i) => { const u = (t * 0.22 + i / items.length) % 1, y = -0.8 + u * 1.6, r = Math.sqrt(Math.max(0.05, 0.9 - y * y)) * 0.65; m.position.set(Math.cos(i * 2.3 + t) * r, y, Math.sin(i * 2.3 + t) * r); m.scale.setScalar(0.04 + ra(i, 3) * 0.06); });
  },
};

/* ---------------------------------------------------------------- BallRig: una pelota 3D completa (núcleo + capas + piezas + aura) */
export class BallRig {
  constructor(opts = {}) {
    this.opt = opts; this.group = new THREE.Group(); this.spin = new THREE.Group(); this.group.add(this.spin); this.inner = new THREE.Group(); this.spin.add(this.inner);
    this.own = []; this.upd = []; this.fades = []; this.id = ''; this.pk = 0; this.t = 0; this.fade = 1; this.em = null; this.acc = 0;
  }
  cnt(n, min = 1) { return LOW || this.opt.lo ? Math.max(min, Math.ceil(n * 0.6)) : n; }
  set(it) {
    if (this.id === it.id) return; this.clear(); this.id = it.id; this.item = it; const v = it.v, s = this.opt.lo || LOW ? 0.5 : 1;
    const tex = paint(v, s); this.tex = tex; this.own.push(tex.map); if (tex.em) this.own.push(tex.em);
    const glass = v.op !== undefined && v.op < 1;
    const geo = v.g === 'gem' ? new THREE.IcosahedronGeometry(1, 1) : v.g === 'dia' ? new THREE.IcosahedronGeometry(1, 0) : v.g === 'cry' ? new THREE.DodecahedronGeometry(1, 0) : new THREE.SphereGeometry(1, LOW || this.opt.lo ? 24 : 40, LOW || this.opt.lo ? 16 : 28);
    const light = this.opt.lo || LOW;                                   /* material estándar (más liviano) en la tienda y en gama baja */
    const mp = {
      color: v.bc || 0xffffff, map: tex.map, metalness: v.mt ?? 0.2, roughness: v.rg ?? 0.4, emissive: tex.em ? 0xffffff : (v.em || 0x000000), emissiveMap: tex.em || (v.em ? tex.map : null), emissiveIntensity: v.ei ?? 0,
      transparent: glass, opacity: v.op ?? 1, envMapIntensity: v.env ?? 1, flatShading: !!v.g, depthWrite: !(glass && v.op < 0.6), side: glass && v.op < 0.6 ? THREE.DoubleSide : THREE.FrontSide,
      bumpMap: v.bump && !light ? tex.map : null, bumpScale: v.bump && !light ? 3 : 0,
    };
    if (!light) { mp.clearcoat = v.cc ? 1 : 0; mp.clearcoatRoughness = 0.08; }
    const mat = light ? new THREE.MeshStandardMaterial(mp) : new THREE.MeshPhysicalMaterial(mp);
    this.own.push(geo, mat); this.core = new THREE.Mesh(geo, mat); this.core.castShadow = !!this.opt.shadow; this.spin.add(this.core); this.mat = mat; this.fades.push([mat, v.op ?? 1]);
    if (v.shell) { const sg = new THREE.SphereGeometry(1.07, light ? 18 : 28, light ? 12 : 18), sm = new THREE.MeshStandardMaterial({ color: v.shell[0], transparent: true, opacity: v.shell[1], roughness: 0.05, metalness: 0, envMapIntensity: 2.2, depthWrite: false }); this.own.push(sg, sm); this.spin.add(new THREE.Mesh(sg, sm)); this.fades.push([sm, v.shell[1]]); }
    if (v.core) { const cg = new THREE.SphereGeometry(1, 16, 12), cm = new THREE.MeshBasicMaterial({ color: v.core[0], transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending, depthWrite: false }); this.own.push(cg, cm); this.coreM = new THREE.Mesh(cg, cm); this.coreM.scale.setScalar(v.core[1]); this.inner.add(this.coreM); this.fades.push([cm, 0.9]); }
    (v.orb || []).forEach((o) => { const f = ORB[o.k]; if (f) this.upd.push(f(o, this)); });
    /* aura suave */
    const am = new THREE.SpriteMaterial({ map: glow(), color: v.au || '#fff', transparent: true, opacity: 0.3, depthWrite: false, blending: THREE.AdditiveBlending }); this.own.push(am);
    this.aura = new THREE.Sprite(am); this.aura.scale.setScalar(3.4); this.group.add(this.aura); this.fades.push([am, 0.3]);
    if (this.opt.emitter) { this.em = new Emitter(70); this.group.add(this.em.obj); }
    this.group.userData.id = it.id;
  }
  poke() { this.pk = 1; }
  setFade(f) { if (f === this.fade) return; this.fade = f; this.fades.forEach(([m, o]) => { m.opacity = o * f; if (f < 1) m.transparent = true; else if (m !== this.mat || !(this.item.v.op < 1)) m.transparent = m.blending === THREE.AdditiveBlending || o < 1; }); }
  /* st: { sp: 0..1 (cuánto se mueve), hot, dt } */
  update(t, dt, st = {}) {
    if (!this.id) return; const v = this.item.v;
    this.pk = Math.max(0, this.pk - dt * 1.3); const pk = this.pk;
    this.spin.rotation.y += dt * (v.spin ?? 0.6) * (1 + pk * 9);
    if (v.fl) { const m = this.tex; [m.map, m.em].forEach((tx) => { if (tx) { tx.offset.x = (tx.offset.x + dt * v.fl[0]) % 1; tx.offset.y = (tx.offset.y + dt * v.fl[1]) % 1; } }); if (this.mat.bumpMap) { /* el relieve comparte la textura de color */ } }
    if (v.dst) { const k = v.dst; this.core.scale.set(1 + Math.sin(t * 3.1) * k, 1 + Math.sin(t * 4.3 + 1) * k, 1 + Math.sin(t * 2.7 + 2) * k); }
    const sp = st.sp || 0, ei = (v.ei ?? 0);
    this.mat.emissiveIntensity = ei * (1 + sp * 0.5 + pk * 1.2) + (st.hot ? 0.5 : 0) + pk * 0.15;
    this.aura.material.opacity = (0.22 + 0.1 * Math.sin(t * 2.2) + sp * 0.12 + pk * 0.35) * this.fade;
    if (this.coreM) { const c = v.core; this.coreM.scale.setScalar(c[1] * (1 + (c[2] ? 0.18 * Math.sin(t * 4) : 0) + pk * 0.25)); }
    for (let i = 0; i < this.upd.length; i++) this.upd[i](t, dt, st);
    if (this.em) { const a = AMB[v.am] || AMB.mote; this.acc += dt * a[0] * (LOW ? 0.5 : 1) * (this.opt.rate ?? 1); while (this.acc >= 1) { this.acc -= 1; this.em.emit(1, skinFx(this.item).amb.cols, a[1] * 0.5, a[2] * 0.6, 1.1); } this.em.step(dt); }
  }
  /* estallido propio (en la tienda): usa los mismos datos de efecto que la partida */
  burst() { if (!this.em) return; const h = skinFx(this.item).hit; this.em.emit(Math.min(40, h.n), h.cols, h.sp * 0.7, h.up * 0.7, 1); this.pk = 1; }
  clear() {
    this.own.forEach((o) => { try { o.dispose(); } catch (e) { /* nada */ } }); this.own.length = 0; this.upd.length = 0; this.fades.length = 0; this.id = ''; this.fade = 1;
    const keep = [this.spin, this.em && this.em.obj].filter(Boolean);
    this.group.children.slice().forEach((c) => { if (!keep.includes(c)) this.group.remove(c); });
    this.spin.children.slice().forEach((c) => { if (c !== this.inner) this.spin.remove(c); }); this.inner.clear(); this.core = null; this.coreM = null; this.aura = null;
    if (this.em) { this.group.remove(this.em.obj); this.em.geo.dispose(); this.em.mat.dispose(); this.em = null; }
  }
  dispose() { this.clear(); }
}

/* ---------------------------------------------------------------- gobernador de rendimiento
   Mide cuánto tarda cada cuadro. Si el teléfono va lento, la tienda baja sola cuántas tarjetas anima por cuadro (y cada cuánto);
   si va bien, vuelve a subir despacio. Así en un teléfono potente se ve fluido y en uno modesto no se traba. */
export function perfGov() {
  let last = 0, ema = 16.7, lvl = LOW ? 1 : 0, good = 0;
  return {
    tick(ms) {
      if (last) { ema = ema * 0.9 + Math.min(100, ms - last) * 0.1; if (ema > 26 && lvl < 2) { lvl++; ema = 20; good = 0; } else if (ema < 18 && lvl > 0) { if (++good > 240) { lvl--; good = 0; } } else good = 0; }
      last = ms;
    },
    get lvl() { return lvl; }, budget() { return [3, 2, 1][lvl]; }, gap() { return [30, 60, 110][lvl]; },
  };
}

/* ---------------------------------------------------------------- visor 3D de la tienda: UNA escena, UN renderizador, dibuja solo las tarjetas visibles */
const VW = 160, VH = 136;
export function createBallPreviewer(rootEl) {
  const R = new THREE.WebGLRenderer({ antialias: !LOW, alpha: true, powerPreference: 'low-power' });
  R.setPixelRatio(1); R.setSize(VW, VH, false); R.toneMapping = THREE.ACESFilmicToneMapping; R.toneMappingExposure = 0.95; R.outputColorSpace = THREE.SRGBColorSpace;
  const scene = new THREE.Scene(), cam = new THREE.PerspectiveCamera(32, VW / VH, 0.1, 60); cam.position.set(0, 0.25, 6.2); cam.lookAt(0, 0, 0);
  { const pm = new THREE.PMREMGenerator(R), es = new THREE.Scene();
    es.add(new THREE.Mesh(new THREE.SphereGeometry(20, 16, 10), new THREE.MeshBasicMaterial({ color: 0x0a1040, side: THREE.BackSide })));
    [[0xff2d4f, -8, 6, 0], [0x2f7bff, 8, 6, 0], [0xffffff, 0, 10, 0], [0x19d3ff, 0, 4, 9], [0xffffff, 6, -2, 8]].forEach(([c, x, y, z]) => { const m = new THREE.Mesh(new THREE.BoxGeometry(6, 0.6, 6), new THREE.MeshBasicMaterial({ color: c })); m.position.set(x, y, z); m.lookAt(0, 0, 0); es.add(m); });
    scene.environment = pm.fromScene(es, 0.04).texture; pm.dispose(); }
  scene.add(new THREE.HemisphereLight(0xbfd0ff, 0x10143a, 0.9));
  const key = new THREE.DirectionalLight(0xffffff, 2.2); key.position.set(2, 4, 3); scene.add(key);
  const pl = new THREE.PointLight(0xffffff, 8, 10, 1.8); pl.position.set(0, 0.8, 2.4); scene.add(pl);
  const shadow = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 0.5), new THREE.MeshBasicMaterial({ map: glow(), color: 0x000000, transparent: true, opacity: 0.5, depthWrite: false })); shadow.rotation.x = -Math.PI / 2; shadow.position.y = -1.45; scene.add(shadow);

  const gov = perfGov(), rigs = new Map(), cards = []; let cursor = 0, raf = 0, dead = false;
  const MAXR = LOW ? 10 : 16;                                              /* nunca se descarta una pelota que se está viendo */
  /* arma la pelota de una tarjeta (pesado: se hace como mucho UNA por cuadro para que no se trabe) */
  function ensure(it) {
    let r = rigs.get(it.id); if (r) { r.last = performance.now(); return r; }
    if (rigs.size >= MAXR) {
      let old = null; rigs.forEach((q) => { const vis = cards.some((c) => c.it.id === q.item.id && c.vis); if (!vis && (!old || q.last < old.last)) old = q; });
      if (old) { scene.remove(old.group); old.dispose(); rigs.delete(old.item.id); }
    }
    r = new BallRig({ lo: true, emitter: !LOW }); r.set(it); r.group.visible = false; scene.add(r.group); rigs.set(it.id, r); r.last = performance.now(); return r;
  }
  const io = new IntersectionObserver((es) => es.forEach((en) => { const c = cards.find((q) => q.cv === en.target); if (c) c.vis = en.isIntersecting; }), { root: rootEl || null, rootMargin: '20px' });

  function drawCard(c, r, t, dt) {
    rigs.forEach((q) => { q.group.visible = q === r; });
    c.pk = Math.max(0, c.pk - dt / 1.3);                                     /* toque: zoom + giro rápido + brillo, y vuelve solo */
    const z = c.pk > 0 ? 1 + Math.sin(Math.min(1, c.pk) * Math.PI) * 0.28 : 1;
    r.group.scale.setScalar(z); r.group.position.y = Math.sin(t * 1.5) * 0.06;
    pl.color.set(c.it.v.lg || c.it.v.au || '#fff'); pl.intensity = 8 + c.pk * 8;
    r.update(t, dt, { sp: 0.25 + c.pk });
    R.render(scene, cam);
    c.ctx.clearRect(0, 0, c.cv.width, c.cv.height); c.ctx.drawImage(R.domElement, 0, 0, c.cv.width, c.cv.height);
  }
  function loop(ms) {
    if (dead) return;
    if (rootEl && !rootEl.isConnected) { dispose(); return; }
    raf = requestAnimationFrame(loop); if (document.hidden) return;
    gov.tick(ms); const t = ms / 1000; let budget = gov.budget(), built = 0, tries = cards.length;
    while (budget > 0 && tries-- > 0 && cards.length) {
      cursor = (cursor + 1) % cards.length; const c = cards[cursor]; if (!c.vis) continue;
      if (c.lt && ms - c.lt < gov.gap() && c.pk <= 0) continue;              /* cada tarjeta se redibuja a su ritmo (menos veces si el teléfono va lento) */
      let r = rigs.get(c.it.id);
      if (!r) { if (built) continue; r = ensure(c.it); built = 1; }          /* una pelota nueva por cuadro como máximo */
      drawCard(c, r, t, Math.min(0.1, (ms - (c.lt || ms - 33)) / 1000)); c.lt = ms; budget--;
    }
  }
  raf = requestAnimationFrame(loop);

  function dispose() {
    if (dead) return; dead = true; cancelAnimationFrame(raf); io.disconnect(); cards.length = 0;
    rigs.forEach((r) => r.dispose()); rigs.clear();
    try { R.dispose(); R.forceContextLoss(); } catch (e) { /* nada */ }
  }
  return {
    add(cv, it) {
      cv.width = VW; cv.height = VH; const c = { cv, it, ctx: cv.getContext('2d'), vis: true, pk: 0, lt: 0 }; cards.push(c); io.observe(cv);
      cv.addEventListener('click', () => { c.pk = 1; const r = rigs.get(it.id); if (r) r.burst(); });          /* al tocar la pelota */
    },
    clear() { cards.forEach((c) => io.unobserve(c.cv)); cards.length = 0; cursor = 0; },
    dispose,
  };
}
