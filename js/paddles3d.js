/* paddles3d.js · las paletas 3D: forma (idéntica a la de la partida), diseño, efectos y el visor de la tienda.
   - makePadGeo()  → la MISMA forma de cápsula que se usa en la partida (no cambia el área de golpe).
   - applyPad()    → pinta una paleta con su diseño metálico y brillante.
   - createPreviewer() → un único visor 3D que dibuja las vistas previas animadas de la tienda (1 sola escena, no 30). */
import * as THREE from '../vendor/three.module.min.js';
import { ORB, LOW, perfGov } from './balls3d.js';

const mkCanvas = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };
const hash = (n) => { const s = Math.sin(n * 127.1) * 43758.5453; return s - Math.floor(s); };

/* forma: palito redondeado (largo en el eje Z del juego) */
export const makePadGeo = () => { const g = new THREE.CapsuleGeometry(0.1, 1, 8, 20); g.rotateX(Math.PI / 2); return g; };


/* ---------------------------------------------------------------- diseños "arte" de las 10 paletas nuevas (como en la imagen: cuerpo oscuro y brillante + dibujo grande)
   La textura es alta (256x416) para que el dibujo NO se estire en la paleta, y el dibujo se repite 4 veces alrededor: se ve desde cualquier lado. */
const AW = 256, AH = 416, AXS = [32, 96, 160, 224];
const glw = (g, c, b) => { g.shadowColor = c; g.shadowBlur = LOW ? 0 : b; };
const ART = {
  dragon(g) { g.lineCap = 'round'; g.lineJoin = 'round';
    glw(g, '#ffb000', 12); g.strokeStyle = '#d98a00'; g.lineWidth = 17; g.beginPath(); for (let y = 50; y <= 390; y += 6) g.lineTo(Math.sin(y / 36) * 15, y); g.stroke();
    g.shadowBlur = 0; g.strokeStyle = '#ffe08a'; g.lineWidth = 6; g.beginPath(); for (let y = 50; y <= 390; y += 6) g.lineTo(Math.sin(y / 36) * 15 - 2, y); g.stroke();
    g.strokeStyle = '#7a4a00'; g.lineWidth = 2; for (let y = 70; y < 380; y += 14) { g.beginPath(); g.moveTo(Math.sin(y / 36) * 15 - 8, y); g.lineTo(Math.sin(y / 36) * 15 + 8, y); g.stroke(); }
    g.fillStyle = '#ffc21a'; glw(g, '#ffb000', 10); g.beginPath(); g.moveTo(-16, 52); g.lineTo(16, 52); g.lineTo(8, 14); g.lineTo(0, 22); g.lineTo(-8, 14); g.closePath(); g.fill(); g.beginPath(); g.moveTo(-14, 30); g.lineTo(-26, 10); g.lineTo(-6, 24); g.moveTo(14, 30); g.lineTo(26, 10); g.lineTo(6, 24); g.fill();
    g.shadowBlur = 0; g.fillStyle = '#300'; g.beginPath(); g.arc(-5, 34, 3, 0, 6.3); g.arc(5, 34, 3, 0, 6.3); g.fill(); },
  bolts(g) { g.lineCap = 'round'; g.lineJoin = 'round';
    [['#19b5ff', 7, 0], ['#e8fbff', 3, 0]].forEach(([c, w], k) => { glw(g, '#19d3ff', 14); g.strokeStyle = c; g.lineWidth = w; for (let i = 0; i < 2; i++) { g.beginPath(); let x = -10 + i * 20; g.moveTo(x, 6); for (let y = 30; y <= 410; y += 28) { x += (hash(i * 13 + y) - 0.5) * 40; x = Math.max(-24, Math.min(24, x)); g.lineTo(x, y); } g.stroke(); } }); g.shadowBlur = 0; },
  cracks(g) { g.lineCap = 'round';
    g.fillStyle = '#ff5a1f'; glw(g, '#ff3a00', 10); for (let i = 0; i < 6; i++) { const x = -22 + i * 9, h = 40 + hash(i) * 70; g.beginPath(); g.moveTo(x - 6, AH); g.quadraticCurveTo(x - 2, AH - h * 0.5, x + 2, AH - h); g.quadraticCurveTo(x + 6, AH - h * 0.4, x + 8, AH); g.fill(); }
    [['#ff3a00', 7], ['#ffe08a', 2.5]].forEach(([c, w]) => { glw(g, '#ff5a1f', 12); g.strokeStyle = c; g.lineWidth = w; for (let i = 0; i < 4; i++) { g.beginPath(); let x = -22 + i * 15, y = 20 + i * 70, a = 1.4; g.moveTo(x, y); for (let k = 0; k < 7; k++) { a += (hash(i * 9 + k) - 0.5) * 1.6; x = Math.max(-26, Math.min(26, x + Math.cos(a) * 16)); y += Math.abs(Math.sin(a)) * 18 + 6; g.lineTo(x, y); } g.stroke(); } }); g.shadowBlur = 0; },
  crystals(g) {
    for (let i = 0; i < 12; i++) { const x = (hash(i) - 0.5) * 40, y = 20 + i * 32, s = 18 + hash(i + 4) * 16; g.fillStyle = i & 1 ? 'rgba(255,255,255,.55)' : 'rgba(140,210,255,.5)'; g.strokeStyle = '#fff'; g.lineWidth = 2; g.beginPath(); g.moveTo(x, y - s); g.lineTo(x + s * 0.6, y); g.lineTo(x, y + s * 0.7); g.lineTo(x - s * 0.6, y); g.closePath(); g.fill(); g.stroke(); }
    g.fillStyle = '#fff'; for (let i = 0; i < 10; i++) { g.globalAlpha = 0.9; g.fillRect((hash(i + 9) - 0.5) * 56, hash(i + 3) * AH, 3, 3); } g.globalAlpha = 1; },
  spiral(g) { for (let arm = 0; arm < 3; arm++) for (let i = 0; i < 60; i++) { const a = i / 60 * 6 + arm * 2.1, r = 3 + i * 0.5; g.fillStyle = ['#c8a0ff', '#ff6ad8', '#6a8aff'][arm]; g.globalAlpha = 0.9; g.beginPath(); g.arc(Math.cos(a) * r, 208 + Math.sin(a) * r * 4.2, 1.6 + hash(i + arm) * 2, 0, 6.3); g.fill(); }
    g.globalAlpha = 1; g.fillStyle = '#fff'; for (let i = 0; i < 24; i++) { g.globalAlpha = 0.4 + hash(i) * 0.6; g.fillRect((hash(i + 2) - 0.5) * 56, hash(i + 5) * AH, 2, 2); } g.globalAlpha = 1;
    glw(g, '#c8a0ff', 10); g.strokeStyle = '#c8a0ff'; g.lineWidth = 3; g.beginPath(); g.ellipse(0, 208, 26, 120, 0, 0, 6.3); g.stroke(); g.shadowBlur = 0; },
  neonloops(g) { g.lineCap = 'round';
    [['#ff3df2', 0], ['#19e6ff', 1]].forEach(([c, k]) => { glw(g, c, 14); g.strokeStyle = c; g.lineWidth = 6; g.beginPath(); for (let y = 10; y <= 406; y += 6) g.lineTo(Math.sin(y / 30 + k * 3.14) * 20, y); g.stroke(); });
    g.shadowBlur = 0; g.fillStyle = '#fff'; for (let i = 0; i < 14; i++) g.fillRect((hash(i) - 0.5) * 50, hash(i + 7) * AH, 5, 5); },
  skulls(g) { [80, 208, 336].forEach((cy) => {
    glw(g, '#ff2d2d', 14); g.fillStyle = '#f4e4e4'; g.beginPath(); g.arc(0, cy, 22, 0, 6.3); g.fill(); g.fillRect(-13, cy + 8, 26, 24); g.shadowBlur = 0;
    g.fillStyle = '#1a0008'; g.beginPath(); g.ellipse(-9, cy - 2, 6.5, 8, 0, 0, 6.3); g.ellipse(9, cy - 2, 6.5, 8, 0, 0, 6.3); g.fill(); g.beginPath(); g.moveTo(0, cy + 6); g.lineTo(-4, cy + 15); g.lineTo(4, cy + 15); g.closePath(); g.fill();
    g.strokeStyle = '#1a0008'; g.lineWidth = 2; for (let k = -2; k <= 2; k++) { g.beginPath(); g.moveTo(k * 5, cy + 20); g.lineTo(k * 5, cy + 31); g.stroke(); } }); },
  crowns(g) {
    g.fillStyle = '#15100a'; for (let y = 120; y < 400; y += 52) { g.beginPath(); g.moveTo(0, y - 18); g.lineTo(14, y); g.lineTo(0, y + 18); g.lineTo(-14, y); g.closePath(); g.fill(); g.strokeStyle = '#fff3b0'; g.lineWidth = 2; g.stroke(); }
    glw(g, '#ffd24a', 10); g.fillStyle = '#15100a'; g.strokeStyle = '#fff3b0'; g.lineWidth = 3; g.beginPath(); g.moveTo(-24, 96); g.lineTo(-24, 40); g.lineTo(-12, 62); g.lineTo(0, 30); g.lineTo(12, 62); g.lineTo(24, 40); g.lineTo(24, 96); g.closePath(); g.fill(); g.stroke(); g.shadowBlur = 0;
    g.fillStyle = '#ff2d4f'; g.beginPath(); g.arc(0, 78, 5, 0, 6.3); g.fill(); },
  shark(g) {
    g.strokeStyle = 'rgba(255,255,255,.6)'; g.lineWidth = 3; for (let y = 20; y < AH; y += 34) { g.beginPath(); for (let x = -30; x <= 30; x += 4) g.lineTo(x, y + Math.sin(x / 7 + y) * 5); g.stroke(); }
    g.fillStyle = '#4a86c8'; g.beginPath(); g.moveTo(-26, 150); g.quadraticCurveTo(0, 90, 26, 150); g.lineTo(26, 240); g.quadraticCurveTo(0, 270, -26, 240); g.closePath(); g.fill();
    g.fillStyle = '#2a5aa0'; g.beginPath(); g.moveTo(-10, 112); g.lineTo(10, 112); g.lineTo(0, 60); g.closePath(); g.fill();
    g.fillStyle = '#0a1a3a'; g.fillRect(-24, 190, 48, 22); g.fillStyle = '#fff'; for (let k = 0; k < 6; k++) { g.beginPath(); g.moveTo(-24 + k * 8, 190); g.lineTo(-20 + k * 8, 202); g.lineTo(-16 + k * 8, 190); g.fill(); g.beginPath(); g.moveTo(-24 + k * 8, 212); g.lineTo(-20 + k * 8, 200); g.lineTo(-16 + k * 8, 212); g.fill(); }
    g.beginPath(); g.arc(-12, 170, 4, 0, 6.3); g.arc(12, 170, 4, 0, 6.3); g.fill(); g.fillStyle = '#000'; g.beginPath(); g.arc(-12, 170, 2, 0, 6.3); g.arc(12, 170, 2, 0, 6.3); g.fill(); },
  demon(g) {
    glw(g, '#ff2d2d', 14); g.fillStyle = '#e0243a'; g.beginPath(); g.moveTo(-22, 150); g.lineTo(-34, 90); g.lineTo(-8, 130); g.closePath(); g.fill(); g.beginPath(); g.moveTo(22, 150); g.lineTo(34, 90); g.lineTo(8, 130); g.closePath(); g.fill();
    g.fillStyle = '#10000a'; g.strokeStyle = '#ff2d2d'; g.lineWidth = 3; g.beginPath(); g.ellipse(0, 200, 26, 52, 0, 0, 6.3); g.fill(); g.stroke(); g.shadowBlur = 0;
    g.fillStyle = '#ffd040'; g.beginPath(); g.ellipse(-11, 184, 8, 3.5, -0.4, 0, 6.3); g.ellipse(11, 184, 8, 3.5, 0.4, 0, 6.3); g.fill();
    g.strokeStyle = '#ff2d2d'; g.lineWidth = 3; g.beginPath(); for (let k = 0; k < 7; k++) g.lineTo(-18 + k * 6, 224 + (k & 1 ? 9 : 0)); g.stroke(); },
};
const ART_BODY = { dragon: ['#1a1204', '#050400'], bolts: ['#06122a', '#020610'], cracks: ['#1c0806', '#070202'], crystals: ['#9fe0ff', '#3f8fd8'], spiral: ['#150a3a', '#050212'], neonloops: ['#0e0716', '#030108'], skulls: ['#1a0a0c', '#060203'], crowns: ['#e0a81a', '#8a5a00'], shark: ['#1a7ad8', '#0a3a8a'], demon: ['#1c0408', '#060102'] };
function artCanvas(it) {
  const c = mkCanvas(AW, AH), g = c.getContext('2d'), b = ART_BODY[it.pat], gr = g.createLinearGradient(0, 0, AW, 0);
  gr.addColorStop(0, b[1]); gr.addColorStop(0.25, b[0]); gr.addColorStop(0.5, b[1]); gr.addColorStop(0.75, b[0]); gr.addColorStop(1, b[1]); g.fillStyle = gr; g.fillRect(0, 0, AW, AH);
  AXS.forEach((cx) => { g.save(); g.translate(cx, 0); g.beginPath(); g.rect(-32, 0, 64, AH); g.clip(); ART[it.pat](g); g.restore(); });
  g.globalAlpha = 0.9; g.fillStyle = it.c[1]; g.fillRect(0, 0, AW, 12); g.fillRect(0, AH - 12, AW, 12); g.globalAlpha = 1;      /* puntas de color */
  return c;
}

/* ---------------------------------------------------------------- diseño (textura dibujada en canvas) */
function padCanvas(it) {
  if (ART[it.pat]) return artCanvas(it);
  const c = mkCanvas(256, 128), g = c.getContext('2d'), [c0, c1, c2] = it.c;
  const gr = g.createLinearGradient(0, 0, 0, 128);
  gr.addColorStop(0, c2); gr.addColorStop(0.18, c1); gr.addColorStop(0.5, c0); gr.addColorStop(0.82, c1); gr.addColorStop(1, c2);
  g.fillStyle = gr; g.fillRect(0, 0, 256, 128);
  g.globalAlpha = 0.34; g.strokeStyle = '#fff'; g.fillStyle = '#fff'; g.lineWidth = 3;
  switch (it.pat) {
    case 'lines': for (let x = -128; x < 256; x += 22) { g.beginPath(); g.moveTo(x, 128); g.lineTo(x + 128, 0); g.stroke(); } break;
    case 'waves': for (let y = 16; y < 128; y += 26) { g.beginPath(); for (let x = 0; x <= 256; x += 8) g.lineTo(x, y + Math.sin(x / 14 + y) * 7); g.stroke(); } break;
    case 'hex': for (let r = 0; r < 5; r++) for (let q = 0; q < 9; q++) { const cx = q * 32 + (r & 1 ? 16 : 0), cy = r * 28; g.beginPath(); for (let k = 0; k < 6; k++) { const a = Math.PI / 3 * k + Math.PI / 6; g.lineTo(cx + 14 * Math.cos(a), cy + 14 * Math.sin(a)); } g.closePath(); g.stroke(); } break;
    case 'dots': for (let x = 8; x < 256; x += 22) for (let y = 8; y < 128; y += 22) { g.beginPath(); g.arc(x, y, 3.2, 0, 6.3); g.fill(); } break;
    case 'diamonds': for (let x = 0; x < 256; x += 32) for (let y = 0; y < 128; y += 32) { g.beginPath(); g.moveTo(x + 16, y); g.lineTo(x + 30, y + 16); g.lineTo(x + 16, y + 32); g.lineTo(x + 2, y + 16); g.closePath(); g.stroke(); } break;
    case 'checker': for (let x = 0; x < 256; x += 24) for (let y = 0; y < 128; y += 24) if (((x + y) / 24) & 1) g.fillRect(x, y, 24, 24); break;
    case 'stars': for (let i = 0; i < 70; i++) { g.globalAlpha = 0.25 + hash(i) * 0.6; g.fillRect(hash(i + 1) * 256, hash(i + 2) * 128, 2.5, 2.5); } break;
    case 'circuit': for (let i = 0; i < 9; i++) { const y = 10 + i * 14; g.beginPath(); g.moveTo(0, y); g.lineTo(60 + hash(i) * 80, y); g.lineTo(80 + hash(i) * 80, y + 10); g.lineTo(256, y + 10); g.stroke(); } break;
    case 'rays': for (let i = 0; i < 16; i++) { g.beginPath(); g.moveTo(i * 16 + 8, 0); g.lineTo(i * 16 + 8, 128); g.stroke(); } break;
    case 'scales': for (let r = 0; r < 8; r++) for (let q = 0; q < 12; q++) { g.beginPath(); g.arc(q * 22 + (r & 1 ? 11 : 0), r * 14, 11, 0, Math.PI); g.stroke(); } break;
    /* ---- diseños de las 10 paletas nuevas (cada uno se dibuja en las dos caras de la paleta: x = 64 y x = 192) ---- */
    case 'dragon': {
      for (let r = 0; r < 10; r++) for (let q = 0; q < 12; q++) { g.beginPath(); g.arc(q * 22 + (r & 1 ? 11 : 0), r * 14, 11, 0, Math.PI); g.stroke(); }
      g.globalAlpha = 0.95; g.strokeStyle = '#fff3b0'; g.fillStyle = '#fff3b0'; g.lineWidth = 11; g.lineCap = 'round';
      [64, 192].forEach((cx) => { g.beginPath(); for (let y = 24; y <= 124; y += 4) g.lineTo(cx + Math.sin(y / 15) * 24, y); g.stroke(); g.beginPath(); g.moveTo(cx - 14, 26); g.lineTo(cx + 14, 26); g.lineTo(cx, 4); g.closePath(); g.fill(); g.fillStyle = '#5a1000'; g.beginPath(); g.arc(cx - 4, 18, 2.4, 0, 6.3); g.fill(); g.fillStyle = '#fff3b0'; });
      break;
    }
    case 'bolts': {
      g.globalAlpha = 0.95; g.lineWidth = 4; g.lineJoin = 'round'; g.shadowColor = '#fff'; g.shadowBlur = 8;
      for (let i = 0; i < 6; i++) { g.beginPath(); let x = 20 + i * 42; g.moveTo(x, 0); for (let y = 12; y <= 128; y += 14) { x += (hash(i * 17 + y) - 0.5) * 28; g.lineTo(x, y); } g.stroke(); }
      g.shadowBlur = 0; break;
    }
    case 'cracks': {
      g.globalAlpha = 0.9; g.strokeStyle = '#fff2b0'; g.lineWidth = 2.5; g.shadowColor = '#ff7a1a'; g.shadowBlur = 10; g.lineCap = 'round';
      for (let i = 0; i < 9; i++) { g.beginPath(); let x = hash(i) * 256, y = hash(i + 5) * 128, a = hash(i + 9) * 6.3; g.moveTo(x, y); for (let k = 0; k < 7; k++) { a += (hash(i * 9 + k) - 0.5) * 1.5; x += Math.cos(a) * 14; y += Math.sin(a) * 14; g.lineTo(x, y); } g.stroke(); }
      g.shadowBlur = 0; break;
    }
    case 'crystals': {
      g.lineWidth = 2; g.globalAlpha = 0.7;
      for (let i = 0; i < 16; i++) { const x = hash(i) * 256, y = hash(i + 3) * 128, s = 14 + hash(i + 7) * 26; g.beginPath(); g.moveTo(x, y - s); g.lineTo(x + s * 0.6, y + s * 0.5); g.lineTo(x - s * 0.6, y + s * 0.5); g.closePath(); g.stroke(); g.globalAlpha = 0.16; g.fill(); g.globalAlpha = 0.7; }
      break;
    }
    case 'spiral': {
      for (let arm = 0; arm < 3; arm++) for (let i = 0; i < 46; i++) { const a = i / 46 * 5 + arm * 2.1, r = 3 + i * 1.15; [64, 192].forEach((cx) => { g.globalAlpha = 0.85; g.beginPath(); g.arc(cx + Math.cos(a) * r * 1.2, 64 + Math.sin(a) * r * 0.9, 1.6 + hash(i + arm) * 2, 0, 6.3); g.fill(); }); }
      for (let i = 0; i < 50; i++) { g.globalAlpha = 0.3 + hash(i) * 0.6; g.fillRect(hash(i + 1) * 256, hash(i + 2) * 128, 2, 2); }
      break;
    }
    case 'neonframe': {
      g.globalAlpha = 1; g.lineWidth = 4; g.shadowBlur = 10;
      g.strokeStyle = it.c[1]; g.shadowColor = it.c[1]; g.strokeRect(12, 12, 232, 104);
      g.strokeStyle = it.c[2]; g.shadowColor = it.c[2]; g.strokeRect(26, 26, 204, 76);
      g.strokeStyle = '#fff'; g.shadowColor = '#fff'; g.lineWidth = 2; for (let x = 0; x < 256; x += 64) { g.beginPath(); g.moveTo(x + 32, 26); g.lineTo(x + 32, 102); g.stroke(); }
      g.shadowBlur = 0; break;
    }
    case 'skulls': {
      g.globalAlpha = 0.92;
      [64, 192].forEach((cx) => {
        g.fillStyle = '#fff'; g.beginPath(); g.arc(cx, 56, 26, 0, 6.3); g.fill(); g.fillRect(cx - 15, 66, 30, 26);
        g.fillStyle = '#1a0008'; g.beginPath(); g.ellipse(cx - 10, 54, 7, 8, 0, 0, 6.3); g.ellipse(cx + 10, 54, 7, 8, 0, 0, 6.3); g.fill();
        g.beginPath(); g.moveTo(cx, 62); g.lineTo(cx - 4, 72); g.lineTo(cx + 4, 72); g.closePath(); g.fill();
        g.strokeStyle = '#1a0008'; g.lineWidth = 2; for (let k = -2; k <= 2; k++) { g.beginPath(); g.moveTo(cx + k * 6, 80); g.lineTo(cx + k * 6, 92); g.stroke(); }
      });
      g.fillStyle = '#fff'; break;
    }
    case 'crowns': {
      g.globalAlpha = 0.95; g.fillStyle = '#fff6b0';
      [64, 192].forEach((cx) => { g.beginPath(); g.moveTo(cx - 28, 86); g.lineTo(cx - 28, 44); g.lineTo(cx - 14, 62); g.lineTo(cx, 36); g.lineTo(cx + 14, 62); g.lineTo(cx + 28, 44); g.lineTo(cx + 28, 86); g.closePath(); g.fill(); [[-28, 40], [0, 32], [28, 40]].forEach(([dx, y]) => { g.beginPath(); g.arc(cx + dx, y, 5, 0, 6.3); g.fill(); }); g.fillStyle = '#8a1a00'; g.beginPath(); g.arc(cx, 72, 5, 0, 6.3); g.fill(); g.fillStyle = '#fff6b0'; });
      break;
    }
    case 'shark': {
      g.globalAlpha = 0.5; for (let y = 16; y < 128; y += 26) { g.beginPath(); for (let x = 0; x <= 256; x += 8) g.lineTo(x, y + Math.sin(x / 14 + y) * 6); g.stroke(); }
      g.globalAlpha = 0.95; g.fillStyle = '#fff';
      for (let x = 0; x < 256; x += 16) { g.beginPath(); g.moveTo(x, 56); g.lineTo(x + 8, 76); g.lineTo(x + 16, 56); g.closePath(); g.fill(); g.beginPath(); g.moveTo(x + 8, 84); g.lineTo(x, 66); g.lineTo(x + 16, 66); g.closePath(); g.fill(); }
      g.fillStyle = '#0a2a5a'; [64, 192].forEach((cx) => { g.beginPath(); g.moveTo(cx - 18, 40); g.lineTo(cx + 18, 40); g.lineTo(cx, 8); g.closePath(); g.fill(); });
      break;
    }
    case 'demon': {
      g.globalAlpha = 0.95;
      [64, 192].forEach((cx) => {
        g.fillStyle = '#ff2d2d'; g.beginPath(); g.moveTo(cx - 28, 40); g.lineTo(cx - 40, 6); g.lineTo(cx - 12, 28); g.closePath(); g.fill(); g.beginPath(); g.moveTo(cx + 28, 40); g.lineTo(cx + 40, 6); g.lineTo(cx + 12, 28); g.closePath(); g.fill();
        g.fillStyle = '#10000a'; g.beginPath(); g.arc(cx, 66, 28, 0, 6.3); g.fill();
        g.fillStyle = '#ffd0a0'; g.beginPath(); g.ellipse(cx - 11, 60, 9, 4, -0.4, 0, 6.3); g.ellipse(cx + 11, 60, 9, 4, 0.4, 0, 6.3); g.fill();
        g.strokeStyle = '#ff2d2d'; g.lineWidth = 3; g.beginPath(); for (let k = 0; k < 6; k++) g.lineTo(cx - 15 + k * 6, 80 + (k & 1 ? 8 : 0)); g.stroke();
      });
      g.fillStyle = '#fff'; break;
    }
    default: break;
  }
  g.globalAlpha = 1;
  /* bandas brillantes (se ven desde cualquier lado) y puntas */
  g.fillStyle = 'rgba(255,255,255,.55)'; [32, 96, 160, 224].forEach((x) => g.fillRect(x - 3, 0, 6, 128));
  g.fillStyle = 'rgba(0,0,0,.35)'; g.fillRect(0, 0, 256, 7); g.fillRect(0, 121, 256, 7);
  g.fillStyle = c0; g.globalAlpha = 0.9; g.fillRect(0, 7, 256, 2); g.fillRect(0, 119, 256, 2); g.globalAlpha = 1;
  return c;
}
export function padTexture(it) { const t = new THREE.CanvasTexture(padCanvas(it)); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = 4; return t; }

/* material metálico y brillante con el diseño de la paleta */
export function applyPad(mat, it) {
  if (mat.map) mat.map.dispose();
  const t = padTexture(it);
  mat.map = t; mat.emissiveMap = t; mat.color.set(0xffffff); mat.emissive.set(0xffffff);
  mat.emissiveIntensity = 0.28; mat.metalness = 0.72; mat.roughness = 0.2; mat.envMapIntensity = 1.15; mat.needsUpdate = true;
}

/* ---------------------------------------------------------------- efectos en partida */
/* al golpear: cuántas partículas (× nivel), rapidez y cuánto suben */
export const PAD_HIT = {
  none: { n: 0, sp: 0, up: 0 }, glow: { n: 8, sp: 2.2, up: 1 }, rise: { n: 14, sp: 2.4, up: 2.2 }, fall: { n: 14, sp: 2.2, up: 0.5 },
  jitter: { n: 16, sp: 4.2, up: 1 }, twinkle: { n: 14, sp: 2.6, up: 1.3 }, orbit: { n: 16, sp: 3, up: 1.1 }, drift: { n: 12, sp: 1.6, up: 0.8 },
};
/* partículas ambientales por segundo según el nivel (básicas casi nada, exclusivas más): son pocas para no bajar los FPS */
export const AMB_RATE = [0, 5, 8, 12, 18];

/* ---------------------------------------------------------------- visor de la tienda */
const glowTex = () => {
  const c = mkCanvas(64, 64), g = c.getContext('2d'), gr = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.35, 'rgba(255,255,255,.55)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = gr; g.fillRect(0, 0, 64, 64); return new THREE.CanvasTexture(c);
};
const VW = 200, VH = 112, NS = 12;

export function createPreviewer(rootEl) {
  const R = new THREE.WebGLRenderer({ antialias: !LOW, alpha: true, powerPreference: 'low-power' });
  R.setPixelRatio(1); R.setSize(VW, VH, false);
  R.toneMapping = THREE.ACESFilmicToneMapping; R.toneMappingExposure = 0.95; R.outputColorSpace = THREE.SRGBColorSpace;
  const scene = new THREE.Scene(), cam = new THREE.PerspectiveCamera(30, VW / VH, 0.1, 50);
  cam.position.set(0, 0.35, 4.7); cam.lookAt(0, 0, 0);
  /* entorno para reflejos metálicos */
  { const pm = new THREE.PMREMGenerator(R), es = new THREE.Scene();
    es.add(new THREE.Mesh(new THREE.SphereGeometry(20, 20, 12), new THREE.MeshBasicMaterial({ color: 0x0a1040, side: THREE.BackSide })));
    [[0xff2d4f, -8, 6, 0], [0x2f7bff, 8, 6, 0], [0xffffff, 0, 10, 0], [0x19d3ff, 0, 4, 9]].forEach(([c, x, y, z]) => { const m = new THREE.Mesh(new THREE.BoxGeometry(6, 0.6, 6), new THREE.MeshBasicMaterial({ color: c })); m.position.set(x, y, z); m.lookAt(0, 0, 0); es.add(m); });
    scene.environment = pm.fromScene(es, 0.04).texture; pm.dispose(); }
  scene.add(new THREE.HemisphereLight(0xbfd0ff, 0x10143a, 0.8));
  const key = new THREE.DirectionalLight(0xffffff, 2.2); key.position.set(2, 4, 3); scene.add(key);
  const pl = new THREE.PointLight(0xffffff, 6, 8, 1.8); pl.position.set(0, 0.8, 1.6); scene.add(pl);
  const glow = glowTex(), geo = makePadGeo(), entries = new Map();
  /* sombra suave bajo la paleta */
  const shadow = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 0.6), new THREE.MeshBasicMaterial({ map: glow, color: 0x000000, transparent: true, opacity: 0.45, depthWrite: false }));
  shadow.position.set(0, -0.62, -0.1); scene.add(shadow);

  function build(it) {
    const tilt = new THREE.Group(), roll = new THREE.Group();
    const mat = new THREE.MeshStandardMaterial(); applyPad(mat, it);
    const mesh = new THREE.Mesh(geo, mat); mesh.scale.set(0.75 * 2.3, 1.1 * 2.3, 0.75 * 2.3); mesh.rotation.y = Math.PI / 2;
    roll.add(mesh); tilt.add(roll);
    const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: glow, color: it.c[1], transparent: true, opacity: 0.35, depthWrite: false, blending: THREE.AdditiveBlending }));
    halo.scale.set(3.2, 1.5, 1); tilt.add(halo);
    const sp = [];
    if (it.m !== 'none' && it.m !== 'glow') for (let k = 0; k < NS; k++) {
      const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: glow, color: it.fc[k % it.fc.length], transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
      tilt.add(s); sp.push(s);
    }
    /* piezas 3D alrededor de la paleta (dragón, anillos, chispas...), por datos: it.x */
    const rg = { own: [], spin: tilt, inner: tilt, group: tilt, cnt: (n, m = 1) => (LOW ? Math.max(m, Math.ceil(n * 0.6)) : n) };
    const xs = (it.x || []).map((o) => (ORB[o.k] ? ORB[o.k](o, rg) : null)).filter(Boolean);
    tilt.visible = false; scene.add(tilt);
    return { tilt, roll, mat, mesh, halo, sp, it, xs, own: rg.own };
  }

  function animate(e, t) {
    const it = e.it, big = it.tier >= 4 ? 1 : 0;
    if (it.fl && e.mat.map) e.mat.map.offset.set((t * it.fl[0]) % 1, (t * it.fl[1]) % 1);      /* el dibujo se mueve */
    e.roll.rotation.x = ART[it.pat] ? Math.sin(t * 0.9) * 0.45 : t * (0.9 + big * 0.6);       /* los diseños de arte se mecen para que siempre se vea el dibujo */
    for (let i = 0; i < e.xs.length; i++) e.xs[i](t, 0.016, {});
    e.tilt.rotation.z = 0.42 + Math.sin(t * 1.1) * 0.06; e.tilt.rotation.y = Math.sin(t * 0.7) * 0.18;
    e.tilt.position.y = Math.sin(t * 1.6) * 0.07;
    e.halo.material.opacity = (it.tier >= 4 ? 0.5 + 0.2 * Math.sin(t * 3) : it.m === 'glow' ? 0.45 + 0.25 * Math.sin(t * 4) : 0.28);
    e.sp.forEach((s, k) => {
      const u = (t * (it.m === 'drift' ? 0.25 : 0.55) + k / NS) % 1, h1 = hash(k + 1), h2 = hash(k + 31), x0 = (h1 * 2 - 1) * 0.95;
      let x = x0, y = 0, z = 0.05, sc = 0.2, o = 0.9;
      switch (it.m) {
        case 'rise': y = 0.08 + u * 0.8; sc = 0.12 + 0.28 * (1 - u); o = 1 - u; break;
        case 'fall': y = 0.7 - u * 0.95; x = x0 + Math.sin(t * 2 + k) * 0.08; sc = 0.1 + 0.07 * Math.sin(t * 6 + k); o = 0.5 + 0.5 * Math.sin(t * 5 + k * 2); break;
        case 'jitter': { const on = Math.sin(t * 23 + k * 7.1) > 0.2; y = (h2 - 0.5) * 0.45 + Math.sin(t * 40 + k) * 0.04; x = x0 + Math.sin(t * 31 + k) * 0.05; sc = on ? 0.3 : 0.05; o = on ? 1 : 0; break; }
        case 'twinkle': y = (h2 - 0.5) * 0.9; z = (hash(k + 71) - 0.5) * 0.3; o = 0.5 + 0.5 * Math.sin(t * 3 + k * 2); sc = 0.08 + 0.26 * o; break;
        case 'orbit': { const a = t * 2.2 + k / NS * 6.283; x = (k / NS * 2 - 1) * 0.95; y = Math.sin(a) * 0.4; z = Math.cos(a) * 0.4; sc = 0.2; o = 0.5 + 0.5 * Math.cos(a); break; }
        case 'drift': y = -0.05 + u * 0.55; x = x0 + Math.sin(t + k) * 0.1; sc = 0.45; o = 0.4 * (1 - u); break;
        default: break;
      }
      s.position.set(x, y, z); s.scale.set(sc, sc, 1); s.material.opacity = Math.max(0, o);
    });
  }

  const gov = perfGov(), cards = []; let cursor = 0, raf = 0, dead = false;
  const io = new IntersectionObserver((es) => es.forEach((en) => { const c = cards.find((q) => q.cv === en.target); if (c) c.vis = en.isIntersecting; }), { root: rootEl || null, rootMargin: '20px' });

  function drawCard(c, t) {
    let e = entries.get(c.it.id); if (!e) { e = build(c.it); entries.set(c.it.id, e); }
    entries.forEach((q) => { q.tilt.visible = q === e; });
    pl.color.set(c.it.c[1]); animate(e, t);
    R.render(scene, cam);
    c.ctx.clearRect(0, 0, c.cv.width, c.cv.height); c.ctx.drawImage(R.domElement, 0, 0, c.cv.width, c.cv.height);
  }
  function loop(ms) {
    if (dead) return;
    if (rootEl && !rootEl.isConnected) { dispose(); return; }       /* la tienda se cerró */
    raf = requestAnimationFrame(loop);
    if (document.hidden) return;
    gov.tick(ms); const t = ms / 1000; let budget = gov.budget(), tries = cards.length;
    while (budget > 0 && tries-- > 0 && cards.length) {
      cursor = (cursor + 1) % cards.length; const c = cards[cursor];
      if (!c.vis || (c.lt && ms - c.lt < gov.gap())) continue;               /* cada tarjeta a su ritmo; más lento si el teléfono va lento */
      drawCard(c, t); c.lt = ms; budget--;
    }
  }
  raf = requestAnimationFrame(loop);

  function dispose() {
    if (dead) return; dead = true; cancelAnimationFrame(raf); io.disconnect(); cards.length = 0;
    entries.forEach((e) => { if (e.mat.map) e.mat.map.dispose(); e.mat.dispose(); e.own.forEach((o) => { try { o.dispose(); } catch (er) { /* nada */ } }); });
    entries.clear(); geo.dispose(); glow.dispose();
    try { R.dispose(); R.forceContextLoss(); } catch (er) { /* nada */ }
  }
  return {
    add(cv, it) { cv.width = VW; cv.height = VH; const c = { cv, it, ctx: cv.getContext('2d'), vis: true, lt: 0 }; cards.push(c); io.observe(cv); },
    clear() { cards.forEach((c) => io.unobserve(c.cv)); cards.length = 0; cursor = 0; },
    dispose,
  };
}
