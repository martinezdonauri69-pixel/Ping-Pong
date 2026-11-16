/* lobby3d.js · fondo 3D del lobby: mesa con neón rojo/azul, red con postes, pelota única que rebota de lado a lado sin parar,
   paletas con destellos, luces, humo y reflejos. Escena propia (un solo renderer), se detiene cuando el lobby no se ve
   (partida, tienda, pestaña oculta) y mantiene el logo cromado "D.M.R PING PONG" dentro del .hero.
   API: show(true|false) → true si pudo dibujar el 3D (si no, el lobby sigue con su logo y fondo de siempre). */
import * as THREE from '../vendor/three.module.min.js';

const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const lerp = (a, b, k) => a + (b - a) * k;
const mk = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };
const TEX = (c, srgb = true) => { const t = new THREE.CanvasTexture(c); if (srgb) t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t; };
const RED = '#ff2d4f', BLUE = '#2f7bff', TY = 1.05;          /* TY = altura de la superficie de la mesa */
const FONT = (px) => `italic 900 ${px}px Impact,"Arial Black","Roboto Black","sans-serif-black",sans-serif`;

let S = null, failed = false, on = false, raf = 0;

/* ---------------------------------------------------------------- logo cromado (se pinta una vez dentro del .hero) */
function drawLogo(cv) {
  const g = cv.getContext('2d'), W = cv.width;
  const txt = (t, px, cy, tw, fn) => { g.save(); g.font = FONT(px); g.textAlign = 'center'; g.textBaseline = 'middle'; g.lineJoin = 'round'; const sx = tw / g.measureText(t).width; g.translate(W / 2, cy); g.scale(sx, 1); fn(); g.restore(); };
  txt('D.M.R', 420, 235, 1250, () => {
    g.shadowColor = '#6aa8ff'; g.shadowBlur = 60; const gr = g.createLinearGradient(-620, 0, 620, 0); gr.addColorStop(0, RED); gr.addColorStop(0.5, '#cfd9ff'); gr.addColorStop(1, BLUE);
    g.strokeStyle = gr; g.lineWidth = 40; g.strokeText('D.M.R', 0, 0); g.shadowBlur = 0;
    for (let i = 22; i >= 1; i--) { g.fillStyle = `rgb(${10 + (22 - i)},${12 + (22 - i)},${34 + (22 - i) * 2})`; g.strokeStyle = g.fillStyle; g.lineWidth = 26; g.strokeText('D.M.R', i * 0.5, i * 1.1); g.fillText('D.M.R', i * 0.5, i * 1.1); }
    g.strokeStyle = '#04050f'; g.lineWidth = 30; g.strokeText('D.M.R', 0, 0); g.strokeStyle = gr; g.lineWidth = 14; g.strokeText('D.M.R', 0, 0);
    const f = g.createLinearGradient(0, -170, 0, 200); [[0, '#fff'], [0.3, '#e6ecf8'], [0.46, '#b4bfdc'], [0.5, '#46527a'], [0.6, '#8794bc'], [0.82, '#dbe3f3'], [1, '#fff']].forEach(([o, c]) => f.addColorStop(o, c));
    g.fillStyle = f; g.fillText('D.M.R', 0, 0); g.strokeStyle = 'rgba(255,255,255,.85)'; g.lineWidth = 2.5; g.strokeText('D.M.R', 0, 0);
  });
  g.font = '800 74px "Segoe UI",Roboto,sans-serif'; g.fillStyle = '#fff'; g.shadowColor = '#6aa8ff'; g.shadowBlur = 24; g.textBaseline = 'middle'; g.textAlign = 'left';
  const sp = 'P I N G   P O N G'; g.fillText(sp, W / 2 - g.measureText(sp).width / 2, 520);
  g.shadowBlur = 0; const ln = g.createLinearGradient(160, 0, W - 160, 0); ln.addColorStop(0, 'rgba(255,45,79,0)'); ln.addColorStop(0.15, RED); ln.addColorStop(0.5, '#dfe8ff'); ln.addColorStop(0.85, BLUE); ln.addColorStop(1, 'rgba(47,123,255,0)');
  g.fillStyle = ln; g.fillRect(160, 586, W - 320, 4);
}

/* ---------------------------------------------------------------- texturas */
const glowTex = () => { const c = mk(64, 64), g = c.getContext('2d'), q = g.createRadialGradient(32, 32, 0, 32, 32, 32); q.addColorStop(0, '#fff'); q.addColorStop(0.3, 'rgba(255,255,255,.5)'); q.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = q; g.fillRect(0, 0, 64, 64); return new THREE.CanvasTexture(c); };
const starTex = () => { const c = mk(128, 128), g = c.getContext('2d'), q = g.createRadialGradient(64, 64, 0, 64, 64, 64); q.addColorStop(0, '#fff'); q.addColorStop(0.12, 'rgba(255,255,255,.7)'); q.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = q; g.fillRect(0, 0, 128, 128);
  g.fillStyle = '#fff'; g.beginPath(); g.moveTo(64, 0); g.quadraticCurveTo(68, 60, 128, 64); g.quadraticCurveTo(68, 68, 64, 128); g.quadraticCurveTo(60, 68, 0, 64); g.quadraticCurveTo(60, 60, 64, 0); g.fill(); return new THREE.CanvasTexture(c); };
const smokeTex = () => { const c = mk(128, 128), g = c.getContext('2d'); for (let i = 0; i < 9; i++) { const x = 30 + Math.random() * 68, y = 30 + Math.random() * 68, r = 22 + Math.random() * 26, q = g.createRadialGradient(x, y, 0, x, y, r); q.addColorStop(0, 'rgba(255,255,255,.5)'); q.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = q; g.fillRect(0, 0, 128, 128); } return new THREE.CanvasTexture(c); };
function tableTop() {
  const W = 1024, H = 640, c = mk(W, H), g = c.getContext('2d');
  g.fillStyle = '#05071c'; g.fillRect(0, 0, W, H);
  let q = g.createLinearGradient(0, 0, W / 2, 0); q.addColorStop(0, 'rgba(255,45,79,.5)'); q.addColorStop(0.35, 'rgba(255,45,79,.12)'); q.addColorStop(1, 'rgba(255,45,79,.02)'); g.fillStyle = q; g.fillRect(0, 0, W / 2, H);
  q = g.createLinearGradient(W, 0, W / 2, 0); q.addColorStop(0, 'rgba(47,123,255,.55)'); q.addColorStop(0.35, 'rgba(47,123,255,.14)'); q.addColorStop(1, 'rgba(47,123,255,.02)'); g.fillStyle = q; g.fillRect(W / 2, 0, W / 2, H);
  g.globalAlpha = 0.06; g.strokeStyle = '#b4c6ff'; g.lineWidth = 2; for (let x = 0; x <= W; x += 64) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, H); g.stroke(); } for (let y = 0; y <= H; y += 64) { g.beginPath(); g.moveTo(0, y); g.lineTo(W, y); g.stroke(); } g.globalAlpha = 1;
  g.strokeStyle = 'rgba(255,255,255,.9)'; g.lineWidth = 8; g.strokeRect(14, 14, W - 28, H - 28); g.lineWidth = 6; g.beginPath(); g.moveTo(W / 2, 16); g.lineTo(W / 2, H - 16); g.stroke();
  g.lineWidth = 3; g.globalAlpha = 0.45; g.beginPath(); g.moveTo(16, H / 2); g.lineTo(W - 16, H / 2); g.stroke(); g.globalAlpha = 1;
  return c;
}
function floorTex() { const c = mk(256, 256), g = c.getContext('2d'); g.fillStyle = '#04050d'; g.fillRect(0, 0, 256, 256); g.strokeStyle = 'rgba(120,150,255,.22)'; g.lineWidth = 2; g.strokeRect(1, 1, 254, 254); g.strokeStyle = 'rgba(120,150,255,.07)'; g.lineWidth = 1; g.beginPath(); g.moveTo(0, 128); g.lineTo(256, 128); g.moveTo(128, 0); g.lineTo(128, 256); g.stroke(); const t = TEX(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(22, 22); return t; }
function netTex() { const c = mk(256, 40), g = c.getContext('2d'); g.strokeStyle = 'rgba(235,242,255,.85)'; g.lineWidth = 1.6; for (let x = 0; x <= 256; x += 8) { g.beginPath(); g.moveTo(x, 6); g.lineTo(x, 40); g.stroke(); } for (let y = 6; y <= 40; y += 8) { g.beginPath(); g.moveTo(0, y); g.lineTo(256, y); g.stroke(); } g.fillStyle = '#fff'; g.fillRect(0, 0, 256, 7); return TEX(c); }
function padTex(kind) {
  const c = mk(256, 512), g = c.getContext('2d'), gold = kind === 'gold', base = gold ? ['#3a2200', '#120a00'] : ['#240a4a', '#0a0220'];
  let q = g.createLinearGradient(0, 0, 256, 0); q.addColorStop(0, base[1]); q.addColorStop(0.5, base[0]); q.addColorStop(1, base[1]); g.fillStyle = q; g.fillRect(0, 0, 256, 512);
  const L = gold ? '#ffd25a' : '#c98bff', L2 = gold ? '#fff3c4' : '#f0dcff'; g.lineJoin = 'round'; g.lineCap = 'round';
  if (gold) { for (let y = -20; y < 540; y += 44) { g.strokeStyle = L; g.lineWidth = 7; g.shadowColor = L; g.shadowBlur = 14; g.beginPath(); g.moveTo(10, y); g.lineTo(128, y + 34); g.lineTo(246, y); g.stroke(); g.strokeStyle = L2; g.lineWidth = 2.5; g.shadowBlur = 0; g.beginPath(); g.moveTo(10, y); g.lineTo(128, y + 34); g.lineTo(246, y); g.stroke(); } g.strokeStyle = L2; g.lineWidth = 3; g.beginPath(); g.moveTo(128, 0); g.lineTo(128, 512); g.stroke(); }
  else { for (let k = 0; k < 5; k++) { let x = 30 + k * 48, y = 0; g.strokeStyle = L; g.lineWidth = 6; g.shadowColor = L; g.shadowBlur = 16; g.beginPath(); g.moveTo(x, y); while (y < 512) { y += 28 + Math.random() * 24; x += (Math.random() - 0.5) * 46; g.lineTo(x, y); } g.stroke(); g.strokeStyle = L2; g.lineWidth = 2; g.shadowBlur = 0; g.stroke(); } }
  g.shadowBlur = 0; [0, 1].forEach((i) => { g.fillStyle = L; g.fillRect(0, i ? 500 : 0, 256, 12); });
  return TEX(c);
}
function ballTex() {
  const c = mk(512, 256), g = c.getContext('2d'); let q = g.createLinearGradient(0, 0, 0, 256); q.addColorStop(0, '#0a0714'); q.addColorStop(0.5, '#1c1233'); q.addColorStop(1, '#07050f'); g.fillStyle = q; g.fillRect(0, 0, 512, 256);
  g.strokeStyle = 'rgba(255,210,90,.35)'; g.lineWidth = 2; for (let i = 0; i < 14; i++) { g.beginPath(); g.moveTo(i * 40, 0); g.lineTo(i * 40 + 60, 256); g.stroke(); }
  g.shadowColor = '#ffb02e'; g.shadowBlur = 18; [[96, '#ffd25a', 9], [160, '#ffd25a', 5], [128, '#fff3c4', 13]].forEach(([y, col, w]) => { g.strokeStyle = col; g.lineWidth = w; g.beginPath(); g.moveTo(0, y); g.lineTo(512, y); g.stroke(); });
  for (let i = 0; i < 4; i++) { const x = 64 + i * 128; g.fillStyle = '#ffd25a'; g.shadowBlur = 24; g.beginPath(); g.moveTo(x - 26, 150); g.lineTo(x - 34, 92); g.lineTo(x - 14, 112); g.lineTo(x, 80); g.lineTo(x + 14, 112); g.lineTo(x + 34, 92); g.lineTo(x + 26, 150); g.closePath(); g.fill(); g.fillStyle = '#fff7d6'; g.beginPath(); g.arc(x, 128, 6, 0, 7); g.fill(); }
  g.shadowBlur = 0; g.fillStyle = '#fff'; for (let i = 0; i < 120; i++) { g.globalAlpha = Math.random() * 0.8; g.beginPath(); g.arc(Math.random() * 512, Math.random() * 256, Math.random() * 1.5 + 0.3, 0, 7); g.fill(); } g.globalAlpha = 1;
  return TEX(c);
}

/* ---------------------------------------------------------------- escena */
function build() {
  const lq = (navigator.hardwareConcurrency || 8) <= 4 || (navigator.deviceMemory || 8) <= 3;
  const cv = document.createElement('canvas'); cv.id = 'lb3d'; cv.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;z-index:1;display:block;pointer-events:none';
  const app = document.getElementById('app'); document.body.insertBefore(cv, app || null);
  const r = new THREE.WebGLRenderer({ canvas: cv, antialias: !lq, alpha: false, powerPreference: 'high-performance' });
  r.toneMapping = THREE.ACESFilmicToneMapping; r.outputColorSpace = THREE.SRGBColorSpace; r.setClearColor(0x02030a, 1);
  const sc = new THREE.Scene(); sc.fog = new THREE.FogExp2(0x02030a, 0.03);
  const cam = new THREE.PerspectiveCamera(38, 1, 0.1, 160);
  const GLOW = glowTex(), STAR = starTex(), SMK = smokeTex();
  const spr = (map, col, x, y, z, s, o) => { const m = new THREE.Sprite(new THREE.SpriteMaterial({ map, color: col, transparent: true, opacity: o, blending: THREE.AdditiveBlending, depthWrite: false })); m.position.set(x, y, z); m.scale.set(s, s, 1); sc.add(m); return m; };

  { const pm = new THREE.PMREMGenerator(r), es = new THREE.Scene();
    es.add(new THREE.Mesh(new THREE.SphereGeometry(20, 20, 12), new THREE.MeshBasicMaterial({ color: 0x03040e, side: THREE.BackSide })));
    [[0xff2d4f, -9, 5, 2], [0x2f7bff, 9, 5, 2], [0xffffff, 0, 10, 4]].forEach(([c, x, y, z]) => { const m = new THREE.Mesh(new THREE.BoxGeometry(7, 0.8, 7), new THREE.MeshBasicMaterial({ color: c })); m.position.set(x, y, z); m.lookAt(0, 2, 0); es.add(m); });
    sc.environment = pm.fromScene(es, 0.04).texture; pm.dispose(); }
  const lR = new THREE.PointLight(0xff2d4f, 90, 40, 1.6), lB = new THREE.PointLight(0x2f7bff, 90, 40, 1.6), lF = new THREE.PointLight(0xffc060, 0, 12, 2);
  lR.position.set(-6, 4.5, 3.5); lB.position.set(6, 4.5, 3.5); lF.position.set(0, 3, 2); sc.add(lR, lB, lF, new THREE.HemisphereLight(0x405080, 0x05060f, 0.45));

  /* suelo con baldosas + charcos de luz */
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(90, 90), new THREE.MeshStandardMaterial({ map: floorTex(), roughness: 0.18, metalness: 0.85, transparent: true, opacity: 0.86, envMapIntensity: 1.2 }));
  floor.rotation.x = -Math.PI / 2; sc.add(floor);
  spr(GLOW, 0xff2d4f, -4.2, 0.04, 0.6, 1, 0.5).scale.set(11, 3.4, 1); spr(GLOW, 0x2f7bff, 4.2, 0.04, 0.6, 1, 0.5).scale.set(11, 3.4, 1);

  /* mesa */
  const topT = TEX(tableTop()), topMat = new THREE.MeshStandardMaterial({ map: topT, emissive: 0xffffff, emissiveMap: topT, emissiveIntensity: 1.6, roughness: 0.1, metalness: 0.35, envMapIntensity: 1.5 });
  const slab = new THREE.MeshStandardMaterial({ color: 0x080c24, roughness: 0.25, metalness: 0.9, envMapIntensity: 1.2 });
  const chrome = new THREE.MeshStandardMaterial({ color: 0xcfd8f0, roughness: 0.15, metalness: 1, envMapIntensity: 1.6 });
  const netM = new THREE.MeshBasicMaterial({ map: netTex(), transparent: true, side: THREE.DoubleSide, depthWrite: false, opacity: 0.92 });
  const rimR = new THREE.MeshBasicMaterial({ color: RED }), rimB = new THREE.MeshBasicMaterial({ color: BLUE }), rimW = new THREE.MeshBasicMaterial({ color: 0xffffff });
  function buildTable() {
    const g = new THREE.Group(), top = new THREE.Mesh(new THREE.PlaneGeometry(8.4, 5.2), topMat); top.rotation.x = -Math.PI / 2; top.position.y = 0.152; g.add(top);
    g.add(new THREE.Mesh(new THREE.BoxGeometry(8.7, 0.3, 5.5), slab));
    [[-3.9, -2.3], [3.9, -2.3], [-3.9, 2.3], [3.9, 2.3]].forEach(([x, z]) => { const l = new THREE.Mesh(new THREE.BoxGeometry(0.32, 1.0, 0.32), slab); l.position.set(x, -0.65, z); g.add(l); });
    const bar = (w, d, x, z, m) => { const b = new THREE.Mesh(new THREE.BoxGeometry(w, 0.1, d), m); b.position.set(x, 0.0, z); g.add(b); };
    [-1, 1].forEach((s) => { const m = s < 0 ? rimR : rimB; bar(4.35, 0.1, s * 2.175, 2.75, m); bar(4.35, 0.1, s * 2.175, -2.75, m); bar(0.1, 5.6, s * 4.35, 0, m); });
    bar(0.1, 5.6, 0, 0, rimW);
    const net = new THREE.Mesh(new THREE.PlaneGeometry(5.5, 0.8), netM); net.position.set(0, 0.62, 0); net.rotation.y = Math.PI / 2; g.add(net);
    [-2.78, 2.78].forEach((z) => { const p = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.07, 0.86, 14), chrome); p.position.set(0, 0.62, z); g.add(p); const c = new THREE.Mesh(new THREE.SphereGeometry(0.09, 12, 10), chrome); c.position.set(0, 1.07, z); g.add(c); });
    return g;
  }
  const table = buildTable(); table.position.y = 0.9; sc.add(table);
  if (!lq) { const mi = buildTable(); mi.scale.y = -1; mi.position.y = -0.9; sc.add(mi); }

  /* conos de luz y humo */
  const cc = mk(8, 128), cg = cc.getContext('2d'), cq = cg.createLinearGradient(0, 0, 0, 128); cq.addColorStop(0, 'rgba(255,255,255,.85)'); cq.addColorStop(1, 'rgba(255,255,255,0)'); cg.fillStyle = cq; cg.fillRect(0, 0, 8, 128); const coneT = new THREE.CanvasTexture(cc);
  const cones = [[-5.4, 0xff2d4f, 0.45], [5.4, 0x2f7bff, -0.45], [-7.6, 0xff2d4f, 0.2], [7.6, 0x2f7bff, -0.2]].map(([x, c, rz]) => {
    const m = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 1.5, 12, 20, 1, true), new THREE.MeshBasicMaterial({ map: coneT, color: c, transparent: true, opacity: 0.22, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide }));
    m.geometry.translate(0, -6, 0); m.position.set(x, 10, -1.5); m.rotation.z = rz; m.userData = { rz, ph: Math.random() * 6 }; sc.add(m); return m; });
  const smoke = []; for (let i = 0; i < (lq ? 6 : 14); i++) { const s = i % 2 ? 1 : -1, m = new THREE.Sprite(new THREE.SpriteMaterial({ map: SMK, color: s < 0 ? 0xff2d4f : 0x2f7bff, transparent: true, opacity: 0.13, blending: THREE.AdditiveBlending, depthWrite: false, rotation: Math.random() * 6 })); m.userData = { s, x: s * (1 + Math.random() * 5.5), y: 0.6 + Math.random() * 2.6, z: -2.5 + Math.random() * 3, ph: Math.random() * 6.3, sz: 4 + Math.random() * 3 }; sc.add(m); smoke.push(m); }
  const DN = lq ? 40 : 110, dp = new Float32Array(DN * 3); for (let i = 0; i < DN; i++) dp.set([(Math.random() - 0.5) * 22, Math.random() * 9, -4 + Math.random() * 10], i * 3);
  const dg = new THREE.BufferGeometry(); dg.setAttribute('position', new THREE.BufferAttribute(dp, 3)); sc.add(new THREE.Points(dg, new THREE.PointsMaterial({ size: 0.05, color: 0x9fb4ff, map: GLOW, transparent: true, opacity: 0.7, depthWrite: false, blending: THREE.AdditiveBlending })));

  /* paletas como en la partida: barra fina, lisa y brillante, acostada sobre la mesa (roja a la izquierda, azul a la derecha) */
  const padG = new THREE.CapsuleGeometry(0.115, 1.55, 8, 24), pads = [[-1, 0xff5a78, 0xffd0d8], [1, 0x7ab4ff, 0xe4f0ff]].map(([s, col, hi]) => {
    const g = new THREE.Group(), body = new THREE.Mesh(padG, new THREE.MeshStandardMaterial({ color: col, emissive: col, emissiveIntensity: 0.95, roughness: 0.2, metalness: 0.25, envMapIntensity: 1.3 }));
    body.rotation.x = Math.PI / 2; body.scale.set(1, 1, 0.8); g.add(body);
    const shine = new THREE.Mesh(padG, new THREE.MeshBasicMaterial({ color: hi, transparent: true, opacity: 0.55 })); shine.rotation.x = Math.PI / 2; shine.scale.set(0.35, 0.9, 0.35); shine.position.y = 0.045; g.add(shine);
    const glow = new THREE.Mesh(padG, new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.38, blending: THREE.AdditiveBlending, depthWrite: false })); glow.rotation.x = Math.PI / 2; glow.scale.set(2.4, 1.06, 1.5); g.add(glow);
    const aura = new THREE.Sprite(new THREE.SpriteMaterial({ map: GLOW, color: col, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0.6 })); aura.scale.set(3.0, 1.7, 1); aura.position.y = 0.06; g.add(aura);
    g.userData = { s, col, aura, stars: [], hit: 0 }; g.position.set(s * 3.75, TY + 0.08, 0); sc.add(g); return g;
  });

  /* pelota única (no está en la tienda) + estela + estrellas que giran */
  const bt = ballTex(), ball = new THREE.Mesh(new THREE.SphereGeometry(0.2, 40, 28), new THREE.MeshStandardMaterial({ map: bt, roughness: 0.2, metalness: 0.55, envMapIntensity: 1.5, emissive: 0xffffff, emissiveMap: bt, emissiveIntensity: 0.28 })); sc.add(ball);
  const halo = spr(GLOW, 0xffb02e, 0, 0, 0, 0.8, 0.1), orbit = [0, 1.2, 2.5, 3.8, 5].map((a) => { const m = spr(STAR, 0xffe39a, 0, 0, 0, 0.11, 0.85); m.userData = { a, rr: 0.3 + Math.random() * 0.15 }; return m; });
  const TRN = lq ? 22 : 36, trail = [], hist = []; for (let i = 0; i < TRN; i++) trail.push(spr(GLOW, 0xffb02e, 0, -9, 0, 1, 0));
  const WARM = [new THREE.Color('#ffe0e6'), new THREE.Color('#ff6a80'), new THREE.Color('#ff2d4f'), new THREE.Color('#4a0814')], COOL = [new THREE.Color('#e0f0ff'), new THREE.Color('#6aa8ff'), new THREE.Color('#2f7bff'), new THREE.Color('#0a1a5a')], tc = new THREE.Color();

  /* chispas al golpear (pool) */
  const MAXP = lq ? 90 : 200, pPos = new Float32Array(MAXP * 3), pCol = new Float32Array(MAXP * 3), pV = new Float32Array(MAXP * 3), pL = new Float32Array(MAXP), pC = new Float32Array(MAXP * 3); let pn = 0;
  const pG = new THREE.BufferGeometry(); pG.setAttribute('position', new THREE.BufferAttribute(pPos, 3)); pG.setAttribute('color', new THREE.BufferAttribute(pCol, 3));
  const pts = new THREE.Points(pG, new THREE.PointsMaterial({ size: 0.14, vertexColors: true, map: GLOW, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending })); pts.frustumCulled = false; sc.add(pts);
  const spawn = (x, y, z, n, cols, sp) => { for (let i = 0; i < n && pn < MAXP; i++) { const j = pn++, a = Math.random() * 6.283, b = Math.random() * 3.14 - 1.57, v = (0.3 + Math.random()) * sp; tc.set(cols[i % cols.length]);
    pPos.set([x, y, z], j * 3); pV.set([Math.cos(a) * Math.cos(b) * v, Math.sin(b) * v + 0.6, Math.sin(a) * Math.cos(b) * v], j * 3); pL[j] = 0.5 + Math.random() * 0.6; pC.set([tc.r, tc.g, tc.b], j * 3); } };
  const rings = [0, 1, 2].map(() => { const m = new THREE.Mesh(new THREE.RingGeometry(0.9, 1, 48), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide })); m.visible = false; m.userData = { t: 0, dur: 0.5, big: 2 }; sc.add(m); return m; });
  const ring = (x, y, z, big, col, flat) => { const m = rings.find((q) => !q.visible) || rings[0]; m.userData = { t: 0, dur: 0.55, big, flat }; m.position.set(x, y, z); m.material.color.set(col); m.visible = true; m.rotation.set(flat ? -Math.PI / 2 : 0, 0, 0); };

  /* ---------------- partido infinito: paleta oro → bota en el lado violeta → paleta violeta → bota en el lado oro → … */
  const PX = [-3.55, 3.55], BR = 0.2, BY = TY + BR;
  const LEG = [{ dur: 0.85, h: 1.9 }, { dur: 0.48, h: 0.75 }];
  let cyc = 0, legT = 0, side = 0, tAll = 0, flash = 0;                /* side: quién golpeó (0 oro/izq, 1 violeta/der) */
  const a0 = new THREE.Vector3(PX[0], BY, 0), b0 = new THREE.Vector3(), bpos = new THREE.Vector3();
  const nextEnd = () => { const dir = side ? -1 : 1; if (cyc === 0) b0.set(dir * 1.15, BY, (Math.random() - 0.5) * 2.2); else b0.set(PX[1 - side], BY, (Math.random() - 0.5) * 1.6); };
  nextEnd();

  function hit(sd) {
    const p = pads[sd]; p.userData.hit = 1; flash = 1; bpos.x = PX[sd];
    const warm = sd === 0, cols = warm ? ['#ffe0e6', '#ff6a80', '#ff2d4f'] : ['#e0f0ff', '#6aa8ff', '#2f7bff'];
    spawn(bpos.x, bpos.y, bpos.z, lq ? 18 : 34, cols, 3.2); ring(bpos.x, bpos.y, bpos.z + 0.2, 0.6, warm ? 0xff4a6a : 0x6aa8ff, false);
    lF.color.set(warm ? 0xff4a6a : 0x6aa8ff); lF.position.set(bpos.x, bpos.y + 0.6, 2.5);
  }
  function bounce() { spawn(bpos.x, TY + 0.05, bpos.z, lq ? 8 : 16, ['#ffffff', '#cfe0ff'], 1.5); ring(bpos.x, TY + 0.03, bpos.z, 0.7, 0xffffff, true); }

  /* ---------------- tamaño y cámara */
  let vw = 0, vh = 0, camD = 24; const tanH = Math.tan(38 * Math.PI / 360);
  const resize = () => {
    const w = innerWidth, h = innerHeight; if (w === vw && h === vh) return; vw = w; vh = h; r.setPixelRatio(Math.min(devicePixelRatio || 1, lq ? 1.3 : 2)); r.setSize(w, h, false);
    cam.aspect = w / h; cam.updateProjectionMatrix();
    camD = Math.max(13, 5.1 / (tanH * Math.min(cam.aspect, 1.6)));           /* siempre cabe el ancho de la mesa */
    const el = 0.42, az = 0.52, cy = lerp(1.6, 1.2, clamp(1.6 - cam.aspect));  /* vista de lado en ángulo: se ve la malla */
    cam.position.set(Math.sin(az) * Math.cos(el) * camD, cy + Math.sin(el) * camD, Math.cos(az) * Math.cos(el) * camD); cam.lookAt(0, cy, 0);
    cam.setViewOffset(w, h, 0, h * (cam.aspect < 1 ? 0.085 : 0.0), w, h);   /* ajusta dónde queda la mesa entre el logo y el botón */
  };

  let last = 0;
  const upd = (dt) => {
    tAll += dt; legT += dt;
    /* rebote: dos tramos por golpe */
    const L = LEG[cyc], u = clamp(legT / L.dur);
    if (legT >= L.dur) {
      legT -= L.dur; a0.copy(b0); bpos.copy(b0);
      if (cyc === 0) { cyc = 1; bounce(); } else { hit(1 - side); cyc = 0; side = 1 - side; }
      nextEnd();
    }
    const u2 = clamp(legT / LEG[cyc].dur);
    bpos.lerpVectors(a0, b0, u2); bpos.y += LEG[cyc].h * 4 * u2 * (1 - u2);
    ball.position.copy(bpos); ball.rotation.z += dt * 9 * (side ? 1 : -1); ball.rotation.x += dt * 4; halo.position.copy(bpos); halo.material.opacity = 0.1 + 0.03 * Math.sin(tAll * 20);
    orbit.forEach((m) => { const d = m.userData; d.a += dt * 2.4; m.position.set(bpos.x + Math.cos(d.a) * d.rr * 1.3, bpos.y + Math.sin(d.a) * d.rr * 0.6, bpos.z + Math.sin(d.a * 0.7) * 0.4 + 0.3); m.material.opacity = 0.55 + 0.4 * Math.sin(tAll * 7 + d.a * 3); });
    hist.unshift(bpos.clone()); if (hist.length > TRN) hist.pop();
    const pal = side === 0 ? (cyc === 0 ? WARM : WARM) : COOL;
    trail.forEach((s, i) => { const h = hist[i]; if (!h) { s.material.opacity = 0; return; } const k = i / TRN; s.position.copy(h);
      const c = k < 0.2 ? tc.copy(pal[0]).lerp(pal[1], k / 0.2) : k < 0.55 ? tc.copy(pal[1]).lerp(pal[2], (k - 0.2) / 0.35) : tc.copy(pal[2]).lerp(pal[3], (k - 0.55) / 0.45);
      s.material.color.copy(c); s.material.opacity = (1 - k) * 0.4; s.scale.setScalar(lerp(0.4, 0.12, k)); });
    /* paletas: flotan, se lanzan al golpear, destellos titilan */
    pads.forEach((p) => { const d = p.userData, s = d.s; d.hit = Math.max(0, d.hit - dt * 3.2);
      const follow = clamp(bpos.z, -1.5, 1.5); p.position.z += (follow - p.position.z) * Math.min(1, dt * 7);
      p.position.x = s * (3.78 - Math.pow(d.hit, 2) * 0.32); p.position.y = TY + 0.08 + d.hit * 0.03; p.rotation.y = (follow - p.position.z) * 0.5 + s * d.hit * 0.12;
      d.aura.material.opacity = 0.34 + 0.1 * Math.sin(tAll * 4 + s) + d.hit * 0.45;
      d.stars.forEach((m) => { const q = m.userData, tw = 0.5 + 0.5 * Math.sin(tAll * q.sp + q.ph); m.position.set(q.x, q.y + Math.sin(tAll * 0.8 + q.ph) * 0.1, q.z); m.scale.setScalar(q.sz * (0.5 + tw * 0.8 + d.hit * 0.5)); m.material.opacity = 0.2 + tw * 0.75; }); });
    /* luces, conos, humo */
    flash = Math.max(0, flash - dt * 4); lF.intensity = flash * 55; const pulse = 0.92 + 0.08 * Math.sin(tAll * 2.2); lR.intensity = 90 * pulse; lB.intensity = 90 * (2 - pulse);
    cones.forEach((c) => { c.material.opacity = 0.2 + 0.06 * Math.sin(tAll * 1.2 + c.userData.ph); c.rotation.z = c.userData.rz + Math.sin(tAll * 0.5 + c.userData.ph) * 0.06; });
    smoke.forEach((m) => { const d = m.userData, w = tAll * 0.16 + d.ph; m.position.set(d.x + Math.sin(w) * 1.1, d.y + (Math.sin(w * 0.7) + 1) * 0.4, d.z); m.scale.setScalar(d.sz * (1 + 0.1 * Math.sin(w * 1.3))); m.material.rotation += dt * 0.04 * d.s; });
    /* chispas */
    for (let i = 0; i < pn; i++) {
      pL[i] -= dt; if (pL[i] <= 0) { const l = --pn; pPos.copyWithin(i * 3, l * 3, l * 3 + 3); pV.copyWithin(i * 3, l * 3, l * 3 + 3); pC.copyWithin(i * 3, l * 3, l * 3 + 3); pL[i] = pL[l]; i--; continue; }
      pV[i * 3 + 1] -= 3.2 * dt; pPos[i * 3] += pV[i * 3] * dt; pPos[i * 3 + 1] += pV[i * 3 + 1] * dt; pPos[i * 3 + 2] += pV[i * 3 + 2] * dt;
      const k = Math.min(1, pL[i] * 2); pCol[i * 3] = pC[i * 3] * k; pCol[i * 3 + 1] = pC[i * 3 + 1] * k; pCol[i * 3 + 2] = pC[i * 3 + 2] * k;
    }
    pG.setDrawRange(0, pn); pG.attributes.position.needsUpdate = true; pG.attributes.color.needsUpdate = true;
    rings.forEach((m) => { if (!m.visible) return; const u = m.userData; u.t += dt; const k = u.t / u.dur; if (k >= 1) { m.visible = false; return; } if (!u.flat) m.quaternion.copy(cam.quaternion); m.scale.setScalar(0.25 + (1 - Math.pow(1 - k, 3)) * u.big); m.material.opacity = (1 - k) * 0.75; });
  };
  const frame = (now) => {
    raf = requestAnimationFrame(frame);
    if (document.hidden || document.getElementById('scShop') || document.getElementById('hud')) { last = now; return; }
    const ms = lq ? 33 : 0; if (ms && now - last < ms) return;
    const dt = Math.min(0.05, (now - last) / 1000 || 0.016); last = now; resize(); upd(dt); r.render(sc, cam);
  };
  addEventListener('resize', () => { vw = 0; }); addEventListener('orientationchange', () => setTimeout(() => { vw = 0; }, 250));
  resize(); upd(0.016);
  return { cv, start() { if (!raf) { last = performance.now(); raf = requestAnimationFrame(frame); } }, stop() { cancelAnimationFrame(raf); raf = 0; } };
}

/* ---------------------------------------------------------------- API */
export function show(v) {
  const lobby = document.getElementById('lobby');
  if (!v) { on = false; if (S) { S.stop(); S.cv.style.display = 'none'; } if (lobby) lobby.classList.remove('l3'); return false; }
  if (failed) return false;
  if (!S) { try { S = build(); } catch (e) { console.warn('lobby 3D no disponible', e); failed = true; return false; } }
  on = true; S.cv.style.display = 'block'; S.start();
  if (lobby) {
    lobby.classList.add('l3');
    const hero = lobby.querySelector('.hero');
    if (hero && !hero.querySelector('.lg3')) { const c = mk(1600, 640); c.className = 'lg3'; drawLogo(c); hero.insertBefore(c, hero.firstChild); }
  }
  return true;
}
export const active = () => on && !!S;
