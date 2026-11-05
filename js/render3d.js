/* render3d.js · TODO el dibujo 3D del juego (Three.js): arena, mesa, red, paletas, pelota, sombras, luces, partículas.
   Una sola escena y un solo canvas (#gl) sirven para el lobby y para la partida. */
import * as THREE from '../vendor/three.module.min.js';
import { W, H, PX0, PX1, ABIL } from './engine.js';
import { clamp, lerp } from './util.js';

const K = 0.01;                                        /* 100 unidades del juego = 1 metro 3D */
const wx = (x) => (x - W / 2) * K, wz = (y) => (y - H / 2) * K;
const col = (c) => new THREE.Color(c);

/* ---------------------------------------------------------------- texturas dibujadas en canvas */
const mkCanvas = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };
const rd = (n) => { const s = Math.sin(n * 127.1) * 43758.5; return s - Math.floor(s); };

function tableTexture(cols, style, accent) {
  const c = mkCanvas(1024, 640), g = c.getContext('2d');
  const gr = g.createLinearGradient(0, 0, 1024, 640); gr.addColorStop(0, cols[0] || '#0a1a6a'); gr.addColorStop(1, cols[1] || '#2a6bff');
  g.fillStyle = gr; g.fillRect(0, 0, 1024, 640);
  g.globalAlpha = 0.18; g.strokeStyle = '#fff'; g.fillStyle = '#fff'; g.lineWidth = 2;
  switch (style) {
    case 'circles': for (let r = 60; r < 700; r += 60) { g.beginPath(); g.arc(512, 320, r, 0, 6.3); g.stroke(); } break;
    case 'diag': for (let i = -640; i < 1024; i += 52) { g.beginPath(); g.moveTo(i, 0); g.lineTo(i + 640, 640); g.stroke(); } break;
    case 'dots': for (let x = 20; x < 1024; x += 40) for (let y = 20; y < 640; y += 40) { g.beginPath(); g.arc(x, y, 3, 0, 6.3); g.fill(); } break;
    case 'stars': for (let i = 0; i < 90; i++) { g.globalAlpha = 0.2 + rd(i) * 0.5; g.fillRect(rd(i + 1) * 1024, rd(i + 2) * 640, 3, 3); } break;
    case 'waves': for (let y = 40; y < 640; y += 56) { g.beginPath(); for (let x = 0; x <= 1024; x += 16) g.lineTo(x, y + Math.sin(x / 70 + y) * 14); g.stroke(); } break;
    case 'hex': { const R = 44, dx = R * 1.732, dy = R * 1.5; for (let r = -1; r < 640 / dy + 1; r++) for (let q = -1; q < 1024 / dx + 1; q++) { const cx = q * dx + (r & 1 ? dx / 2 : 0), cy = r * dy; g.beginPath(); for (let k = 0; k < 6; k++) { const a = Math.PI / 3 * k + Math.PI / 6; g.lineTo(cx + R * Math.cos(a), cy + R * Math.sin(a)); } g.closePath(); g.stroke(); } break; }
    default: for (let x = 0; x <= 1024; x += 64) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, 640); g.stroke(); } for (let y = 0; y <= 640; y += 64) { g.beginPath(); g.moveTo(0, y); g.lineTo(1024, y); g.stroke(); }
  }
  g.globalAlpha = 1;
  const v = g.createRadialGradient(512, 320, 120, 512, 320, 700); v.addColorStop(0, 'rgba(255,255,255,.12)'); v.addColorStop(1, 'rgba(0,0,0,.55)');
  g.fillStyle = v; g.fillRect(0, 0, 1024, 640);
  /* líneas de la mesa */
  g.strokeStyle = 'rgba(255,255,255,.92)'; g.lineWidth = 8; g.strokeRect(10, 10, 1004, 620);
  g.lineWidth = 5; g.setLineDash([26, 20]); g.beginPath(); g.moveTo(512, 18); g.lineTo(512, 622); g.stroke(); g.setLineDash([]);
  g.lineWidth = 4; g.globalAlpha = 0.5; g.beginPath(); g.moveTo(18, 320); g.lineTo(1006, 320); g.stroke(); g.globalAlpha = 1;
  g.strokeStyle = accent; g.lineWidth = 3; g.globalAlpha = 0.7; g.strokeRect(26, 26, 972, 588); g.globalAlpha = 1;
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t;
}

function ballTexture(cols, style) {
  const c = mkCanvas(512, 256), g = c.getContext('2d'), a = cols[0] || '#fff', b = cols[1] || '#9cf';
  g.fillStyle = a; g.fillRect(0, 0, 512, 256);
  const rep = (fn) => { for (let i = 0; i < 4; i++) { g.save(); g.translate(i * 128 + 64, 128); fn(i); g.restore(); } };
  g.fillStyle = b; g.strokeStyle = b; g.lineWidth = 10;
  switch (style) {
    case 'r': for (let y = 20; y < 256; y += 44) g.fillRect(0, y, 512, 18); break;
    case 'f': rep(() => { g.beginPath(); g.moveTo(-30, 90); g.quadraticCurveTo(-10, 0, 0, -80); g.quadraticCurveTo(14, 0, 30, 90); g.fill(); }); break;
    case 'i': rep(() => { for (let k = 0; k < 3; k++) { g.rotate(Math.PI / 3); g.fillRect(-4, -70, 8, 140); } }); break;
    case 'e': rep(() => { g.beginPath(); for (let k = 0; k < 10; k++) { const r = k % 2 ? 22 : 56, an = k * Math.PI / 5 - Math.PI / 2; g.lineTo(Math.cos(an) * r, Math.sin(an) * r); } g.fill(); }); break;
    case 'c': rep(() => { g.beginPath(); g.moveTo(0, 50); g.bezierCurveTo(-90, -10, -40, -70, 0, -22); g.bezierCurveTo(40, -70, 90, -10, 0, 50); g.fill(); }); break;
    case 'n': for (let y = 30; y < 256; y += 50) { g.beginPath(); g.moveTo(0, y); g.lineTo(512, y); g.stroke(); } break;
    case 'p': g.fillRect(0, 100, 512, 22); break;
    case 'd': rep(() => { g.beginPath(); g.moveTo(0, -60); g.lineTo(46, 0); g.lineTo(0, 60); g.lineTo(-46, 0); g.closePath(); g.fill(); }); break;
    case 's': rep(() => { for (let k = 0; k < 12; k++) { g.rotate(Math.PI / 6); g.fillRect(-4, -76, 8, 40); } }); break;
    case 'a': ['#ff2233', '#ffd400', '#19e68c', '#2a6bff', '#ff3df2'].forEach((cc, i) => { g.fillStyle = cc; g.fillRect(0, i * 52, 512, 52); }); break;
    default: g.globalAlpha = 0.25; g.fillRect(0, 118, 512, 20); g.globalAlpha = 1;
  }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = THREE.RepeatWrapping; return t;
}

function glowTexture() {
  const c = mkCanvas(64, 64), g = c.getContext('2d'), gr = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.35, 'rgba(255,255,255,.55)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = gr; g.fillRect(0, 0, 64, 64); return new THREE.CanvasTexture(c);
}
function netTexture() {
  const c = mkCanvas(256, 32), g = c.getContext('2d');
  g.strokeStyle = 'rgba(235,242,255,.85)'; g.lineWidth = 1.5;
  for (let x = 0; x <= 256; x += 8) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, 32); g.stroke(); }
  for (let y = 0; y <= 32; y += 8) { g.beginPath(); g.moveTo(0, y); g.lineTo(256, y); g.stroke(); }
  g.fillStyle = '#fff'; g.fillRect(0, 0, 256, 5);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}
function emojiTexture(ic) {
  const c = mkCanvas(128, 128), g = c.getContext('2d'); g.font = '84px "Segoe UI Emoji","Apple Color Emoji","Noto Color Emoji",sans-serif';
  g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(ic, 64, 70); return new THREE.CanvasTexture(c);
}

/* ---------------------------------------------------------------- escena */
export function createStage(canvas, opts = {}) {
  let hq = opts.hq !== false;
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance', alpha: false });
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.shadowMap.enabled = hq; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  const scene = new THREE.Scene();
  scene.background = col('#04061a'); scene.fog = new THREE.FogExp2(0x04061a, 0.035);
  const cam = new THREE.PerspectiveCamera(40, 1, 0.1, 120);
  const glow = glowTexture();

  /* entorno para reflejos (se dibuja una vez) */
  {
    const pm = new THREE.PMREMGenerator(renderer), es = new THREE.Scene();
    es.add(new THREE.Mesh(new THREE.SphereGeometry(20, 24, 16), new THREE.MeshBasicMaterial({ color: 0x0a1040, side: THREE.BackSide })));
    [[0xff2d4f, -8, 6, 0], [0x2f7bff, 8, 6, 0], [0xffffff, 0, 10, 0], [0x19d3ff, 0, 4, 9]].forEach(([c, x, y, z]) => {
      const m = new THREE.Mesh(new THREE.BoxGeometry(6, 0.6, 6), new THREE.MeshBasicMaterial({ color: c })); m.position.set(x, y, z); m.lookAt(0, 0, 0); es.add(m);
    });
    scene.environment = pm.fromScene(es, 0.04).texture; pm.dispose();
  }

  /* luces */
  const hemi = new THREE.HemisphereLight(0x9fb4ff, 0x10143a, 0.75); scene.add(hemi);
  const key = new THREE.DirectionalLight(0xffffff, 2.1); key.position.set(2.5, 9, 3.5);
  key.castShadow = hq; key.shadow.mapSize.set(1024, 1024); key.shadow.bias = -0.0004; key.shadow.normalBias = 0.02;
  Object.assign(key.shadow.camera, { left: -5.5, right: 5.5, top: 4, bottom: -4, near: 1, far: 22 }); scene.add(key);
  const lA = new THREE.PointLight(0xff2d4f, 7, 6, 1.8), lB = new THREE.PointLight(0x2f7bff, 7, 6, 1.8), lBall = new THREE.PointLight(0xffffff, 6, 4, 1.8);
  lA.position.set(-4, 0.9, 0); lB.position.set(4, 0.9, 0); scene.add(lA, lB, lBall);

  /* ---- arena: suelo, anillos de neón y chispas flotantes ---- */
  const arena = new THREE.Group(); scene.add(arena);
  const floor = new THREE.Mesh(new THREE.CircleGeometry(40, 64), new THREE.MeshStandardMaterial({ color: 0x070a24, roughness: 0.35, metalness: 0.7 }));
  floor.rotation.x = -Math.PI / 2; floor.position.y = -1.3; floor.receiveShadow = false; arena.add(floor);
  const rings = [];
  [[7.6, 0xff2d4f], [9.2, 0x2f7bff], [11, 0x8b3dff]].forEach(([r, c], i) => {
    const m = new THREE.Mesh(new THREE.TorusGeometry(r, 0.05, 8, 96), new THREE.MeshBasicMaterial({ color: c })); m.rotation.x = Math.PI / 2; m.position.y = -1.25 + i * 0.01; arena.add(m); rings.push(m);
  });
  const pillars = [];
  for (let i = 0; i < 10; i++) {
    const a = i / 10 * Math.PI * 2, c = i % 2 ? 0x2f7bff : 0xff2d4f;
    const p = new THREE.Mesh(new THREE.BoxGeometry(0.3, 10 + (i % 3) * 3, 0.3), new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: 0.55 }));
    p.position.set(Math.cos(a) * 26, 3, Math.sin(a) * 26); arena.add(p); pillars.push(p);
  }
  const SPK = 160, spPos = new Float32Array(SPK * 3), spData = [];
  for (let i = 0; i < SPK; i++) { spPos.set([(Math.random() - 0.5) * 30, Math.random() * 9 - 1, (Math.random() - 0.5) * 30], i * 3); spData.push(Math.random() * 6.28); }
  const spGeo = new THREE.BufferGeometry(); spGeo.setAttribute('position', new THREE.BufferAttribute(spPos, 3));
  const sparks = new THREE.Points(spGeo, new THREE.PointsMaterial({ size: 0.09, color: 0x9fc0ff, map: glow, transparent: true, opacity: 0.8, depthWrite: false, blending: THREE.AdditiveBlending }));
  arena.add(sparks);

  /* ---- partícula de impactos ---- */
  const MAXP = 700, pPos = new Float32Array(MAXP * 3), pCol = new Float32Array(MAXP * 3), pV = new Float32Array(MAXP * 3), pL = new Float32Array(MAXP), pC = new Float32Array(MAXP * 3);
  const pGeo = new THREE.BufferGeometry(); pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3)); pGeo.setAttribute('color', new THREE.BufferAttribute(pCol, 3));
  const parts = new THREE.Points(pGeo, new THREE.PointsMaterial({ size: 0.16, vertexColors: true, map: glow, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
  parts.frustumCulled = false; scene.add(parts);
  let pn = 0;
  function burst(x, y, z, cols, n, sp, up = 1) {
    for (let i = 0; i < n && pn < MAXP; i++) {
      const j = pn++, a = Math.random() * 6.283, v = (0.3 + Math.random()) * sp, c = col(cols[i % cols.length]);
      pPos.set([x, z, y], j * 3);                                  /* x, altura, profundidad */
      pV.set([Math.cos(a) * v, Math.random() * v * up, Math.sin(a) * v], j * 3); pL[j] = 0.5 + Math.random() * 0.7; pC.set([c.r, c.g, c.b], j * 3);
    }
  }
  function stepParts(dt) {
    for (let i = 0; i < pn; i++) {
      pL[i] -= dt;
      if (pL[i] <= 0) { const l = --pn; pPos.copyWithin(i * 3, l * 3, l * 3 + 3); pV.copyWithin(i * 3, l * 3, l * 3 + 3); pC.copyWithin(i * 3, l * 3, l * 3 + 3); pL[i] = pL[l]; i--; continue; }
      pV[i * 3 + 1] -= 6 * dt;
      pPos[i * 3] += pV[i * 3] * dt; pPos[i * 3 + 1] = Math.max(0.01, pPos[i * 3 + 1] + pV[i * 3 + 1] * dt); pPos[i * 3 + 2] += pV[i * 3 + 2] * dt;
      if (pPos[i * 3 + 1] <= 0.011) pV[i * 3 + 1] = Math.abs(pV[i * 3 + 1]) * 0.4;
      const k = Math.min(1, pL[i] * 1.6); pCol[i * 3] = pC[i * 3] * k; pCol[i * 3 + 1] = pC[i * 3 + 1] * k; pCol[i * 3 + 2] = pC[i * 3 + 2] * k;
    }
    pGeo.setDrawRange(0, pn); pGeo.attributes.position.needsUpdate = true; pGeo.attributes.color.needsUpdate = true;
  }
  const waves = [];                                                   /* ondas de choque en la mesa */
  function shock(x, y, c, big = 1) {
    const m = new THREE.Mesh(new THREE.RingGeometry(0.1, 0.16, 40), new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: 0.9, side: THREE.DoubleSide, depthWrite: false, blending: THREE.AdditiveBlending }));
    m.rotation.x = -Math.PI / 2; m.position.set(wx(x), 0.03, wz(y)); m.userData = { t: 0, big }; scene.add(m); waves.push(m);
  }

  /* ---------------------------------------------------------------- MESA (partida) */
  const tableG = new THREE.Group(); scene.add(tableG);
  const topMat = new THREE.MeshStandardMaterial({ roughness: 0.5, metalness: 0.1, envMapIntensity: 0.4 });
  const top = new THREE.Mesh(new THREE.PlaneGeometry(8, 5), topMat); top.rotation.x = -Math.PI / 2; top.position.y = 0.002; top.receiveShadow = true; tableG.add(top);
  const slab = new THREE.Mesh(new THREE.BoxGeometry(8.5, 0.34, 5.5), new THREE.MeshStandardMaterial({ color: 0x0b1030, roughness: 0.4, metalness: 0.75 }));
  slab.position.y = -0.18; slab.castShadow = true; slab.receiveShadow = true; tableG.add(slab);
  const rimMat = new THREE.MeshBasicMaterial({ color: 0x2f7bff });
  [[0, -2.78, 8.5, 0.07], [0, 2.78, 8.5, 0.07], [-4.28, 0, 0.07, 5.57], [4.28, 0, 0.07, 5.57]].forEach(([x, z, w, d]) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, 0.05, d), rimMat); m.position.set(x, -0.005, z); tableG.add(m); });
  const legM = new THREE.MeshStandardMaterial({ color: 0x151b48, roughness: 0.4, metalness: 0.8 });
  [[-3.7, -2.3], [3.7, -2.3], [-3.7, 2.3], [3.7, 2.3]].forEach(([x, z]) => { const m = new THREE.Mesh(new THREE.BoxGeometry(0.3, 1.1, 0.3), legM); m.position.set(x, -0.9, z); tableG.add(m); });
  /* red */
  const netMat = new THREE.MeshBasicMaterial({ map: netTexture(), transparent: true, side: THREE.DoubleSide, depthWrite: false, opacity: 0.9 });
  const net = new THREE.Mesh(new THREE.PlaneGeometry(5.3, 0.34), netMat); net.position.set(0, 0.18, 0); net.rotation.y = Math.PI / 2; tableG.add(net);
  const tape = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.035, 5.4), new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.4, emissive: 0x9fb4ff, emissiveIntensity: 0.4 })); tape.position.set(0, 0.35, 0); tape.castShadow = true; tableG.add(tape);
  const postM = new THREE.MeshStandardMaterial({ color: 0xdfe6ff, roughness: 0.25, metalness: 0.9 });
  [-2.68, 2.68].forEach((z) => { const p = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.42, 10), postM); p.position.set(0, 0.2, z); p.castShadow = true; tableG.add(p); });

  /* paletas */
  const padGeo = new THREE.CapsuleGeometry(0.1, 1, 8, 20); padGeo.rotateX(Math.PI / 2);
  const padMats = [0, 1].map(() => new THREE.MeshStandardMaterial({ roughness: 0.22, metalness: 0.6, emissiveIntensity: 0.45, envMapIntensity: 1.2 }));
  const pads = padMats.map((mt) => { const m = new THREE.Mesh(padGeo, mt); m.castShadow = true; m.position.y = 0.13; tableG.add(m); return m; });
  const padGlow = [0, 1].map(() => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: glow, transparent: true, opacity: 0.55, depthWrite: false, blending: THREE.AdditiveBlending })); s.scale.set(1.2, 1.2, 1); s.position.y = 0.1; tableG.add(s); return s; });

  /* pelota + estela + sombra de contacto */
  const ballMat = new THREE.MeshStandardMaterial({ roughness: 0.2, metalness: 0.08, emissiveIntensity: 0.3, envMapIntensity: 1 });
  const ball = new THREE.Mesh(new THREE.SphereGeometry(0.125, 36, 24), ballMat); ball.castShadow = true; tableG.add(ball);
  const ballHalo = new THREE.Sprite(new THREE.SpriteMaterial({ map: glow, transparent: true, opacity: 0.6, depthWrite: false, blending: THREE.AdditiveBlending })); ballHalo.scale.set(0.9, 0.9, 1); tableG.add(ballHalo);
  const blob = new THREE.Mesh(new THREE.CircleGeometry(0.16, 20), new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.4, depthWrite: false })); blob.rotation.x = -Math.PI / 2; blob.position.y = 0.006; tableG.add(blob);
  const TRN = 18, trail = [];
  for (let i = 0; i < TRN; i++) { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: glow, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending })); tableG.add(s); trail.push(s); }
  const trailPts = [];
  /* poder del centro */
  const orbG = new THREE.Group(); tableG.add(orbG);
  const orbRing = new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.035, 10, 40), new THREE.MeshBasicMaterial({ color: 0xffffff })); orbRing.rotation.x = Math.PI / 2; orbG.add(orbRing);
  const orbIcon = new THREE.Sprite(new THREE.SpriteMaterial({ transparent: true, depthWrite: false })); orbIcon.scale.set(0.55, 0.55, 1); orbIcon.position.y = 0.32; orbG.add(orbIcon);
  const orbGlow = new THREE.Sprite(new THREE.SpriteMaterial({ map: glow, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, color: 0xffffff })); orbGlow.scale.set(1.3, 1.3, 1); orbGlow.position.y = 0.2; orbG.add(orbGlow);
  const orbTex = {}; orbG.visible = false; let orbKey = '';

  /* ---------------------------------------------------------------- LOBBY (pelota y paletas flotando) */
  const lobbyG = new THREE.Group(); lobbyG.scale.setScalar(0.62); scene.add(lobbyG);
  const hBall = new THREE.Mesh(new THREE.SphereGeometry(0.85, 48, 32), ballMat); hBall.castShadow = false; lobbyG.add(hBall);
  const hHalo = new THREE.Sprite(new THREE.SpriteMaterial({ map: glow, transparent: true, opacity: 0.5, depthWrite: false, blending: THREE.AdditiveBlending })); hHalo.scale.set(5.2, 5.2, 1); lobbyG.add(hHalo);
  const hPads = [0, 1].map((i) => { const m = new THREE.Mesh(padGeo, padMats[i]); m.scale.set(2.2, 2.2, 2.1); lobbyG.add(m); return m; });
  const hRings = [0, 1, 2].map((i) => { const m = new THREE.Mesh(new THREE.TorusGeometry(1.6 + i * 0.45, 0.022, 8, 80), new THREE.MeshBasicMaterial({ color: [0xff2d4f, 0x2f7bff, 0x19d3ff][i], transparent: true, opacity: 0.85 })); lobbyG.add(m); return m; });
  const hSat = [0, 1].map((i) => { const m = new THREE.Mesh(new THREE.SphereGeometry(0.11, 16, 12), new THREE.MeshBasicMaterial({ color: i ? 0x2f7bff : 0xff2d4f })); lobbyG.add(m); return m; });

  /* ---------------------------------------------------------------- estado */
  const S = { mode: 'lobby', w: 1, h: 1, por: false, shake: 0, kick: 0, px: 0, py: 0, t: 0, side: 0, camT: new THREE.Vector3(), look: {} };
  const ray = new THREE.Raycaster(), plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0), tmp = new THREE.Vector3(), ndc = new THREE.Vector2();

  function setLook(lk = {}) {
    S.look = lk;
    const a = col(lk.padCol || '#ff2d4f'), b = col(lk.oppCol || '#2f7bff');
    padMats[0].color.copy(a); padMats[0].emissive.copy(a); padMats[1].color.copy(b); padMats[1].emissive.copy(b);
    lA.color.copy(a); lB.color.copy(b); padGlow[0].material.color.copy(a); padGlow[1].material.color.copy(b);
    const bc = lk.ballCols || ['#ffffff', '#99ccff'];
    ballMat.map = ballTexture(bc, lk.ballStyle || ''); ballMat.emissive.copy(col(bc[0])); ballMat.needsUpdate = true;
    lBall.color.copy(col(bc[0] === '#ffffff' ? '#cfe0ff' : bc[0])); ballHalo.material.color.copy(col(bc[0])); hHalo.material.color.copy(col(bc[0]));
    trail.forEach((s) => s.material.color.copy(col(bc[0])));
    const tc = lk.tableCols || ['#0a1a6a', '#2a6bff'], acc = lk.tableAccent || '#2f7bff';
    topMat.map = tableTexture(tc, lk.tableStyle || '', acc); topMat.needsUpdate = true; rimMat.color.copy(col(acc));
    S.fx = lk.fxCols && lk.fxCols.length ? lk.fxCols : null;
  }

  function setMode(m) {
    S.mode = m; tableG.visible = m === 'game'; lobbyG.visible = m !== 'game';
    lA.visible = lB.visible = true; lBall.visible = m === 'game';
    if (m === 'game') { key.position.set(2.5, 9, 3.5); }
  }
  function setQuality(v) { hq = v; renderer.shadowMap.enabled = v; key.castShadow = v; blob.visible = !v; resize(); scene.traverse((o) => { if (o.material) o.material.needsUpdate = true; }); }

  function resize() {
    const w = innerWidth, h = innerHeight; S.w = w; S.h = h; S.por = h > w;
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, hq ? 2 : 1.25)); renderer.setSize(w, h, false);
    cam.aspect = w / h; cam.fov = S.por ? 46 : 38; cam.updateProjectionMatrix();
  }

  /* cámara: horizontal = detrás de la banda; vertical = detrás del jugador 1 (la mesa se ve de largo) */
  function placeCam(dt) {
    const asp = S.w / S.h, tanF = Math.tan(cam.fov * Math.PI / 360);
    if (S.mode === 'game') {
      const pitch = S.por ? 63 : 50, ph = pitch * Math.PI / 180;
      let d;
      if (S.por) d = Math.max(3.9 / (tanF * asp), 6.2 / tanF * 0.8);
      else d = Math.max(4.9 / (tanF * asp), 3.35 / tanF);
      d *= S.por ? 0.84 : 1.0;
      const lx = 0, lz = 0;
      const dirx = S.por ? -Math.cos(ph) : 0, dirz = S.por ? 0 : Math.cos(ph);
      const sx = S.shake * (Math.random() - 0.5) * 0.12, sy = S.shake * (Math.random() - 0.5) * 0.12;
      cam.position.set((lx + dirx * d) * (S.flip ? -1 : 1) + sx, Math.sin(ph) * d + sy, (lz + dirz * d) * (S.flip ? -1 : 1));
      cam.up.set(0, 1, 0);
      cam.lookAt(S.por ? 0 : 0, 0, S.por ? 0 : -0.15);
      cam.fov = (S.por ? 46 : 38) + S.kick * 3; cam.updateProjectionMatrix();
      /* corre la escena un poco hacia abajo para dejar espacio al marcador */
      cam.setViewOffset(S.w, S.h, 0, S.por ? -S.h * 0.02 : -S.h * 0.045, S.w, S.h);
    } else {
      cam.clearViewOffset(); cam.up.set(0, 1, 0);
      cam.position.set(S.px * 0.6, 0.6 + S.py * 0.4, S.por ? 8.6 : 7.2); cam.lookAt(0, S.por ? -0.2 : -0.1, 0);
      cam.fov = S.por ? 46 : 38; cam.updateProjectionMatrix();
      cam.setViewOffset(S.w, S.h, 0, S.por ? S.h * 0.2 : S.h * 0.0, S.w, S.h);
    }
  }

  function pick(cx, cy) {
    ndc.set((cx / S.w) * 2 - 1, -(cy / S.h) * 2 + 1); ray.setFromCamera(ndc, cam);
    if (!ray.ray.intersectPlane(plane, tmp)) return null;
    return [clamp(tmp.x * 100 + W / 2, -50, W + 50), clamp(tmp.z * 100 + H / 2, -50, H + 50)];
  }

  function onEvent(e) {
    const fxc = S.fx;
    if (e.k === 'hit') {
      const c = fxc || [e.i ? '#7fb0ff' : '#ff7088', '#ffffff'];
      burst(wx(e.x), wz(e.y), 0.16, c, fxc ? 34 : 18, 2.6 + e.sp / 500); shock(e.x, e.y, col(c[0]), 1);
      S.shake = Math.min(1, S.shake + 0.35 + e.sp / 2500); S.kick = Math.min(1, S.kick + 0.5);
      const p = pads[e.i]; p.userData.sq = 1;
    } else if (e.k === 'wall') { burst(wx(e.x), wz(e.y), 0.12, ['#ffffff', '#9fc0ff'], 6, 1.6); S.shake = Math.min(1, S.shake + 0.05); }
    else if (e.k === 'point') { burst(wx(e.x), wz(e.y), 0.2, e.w ? ['#7fb0ff', '#fff', '#2f7bff'] : ['#ff7088', '#fff', '#ff2d4f'], 70, 4.2, 1.6); shock(e.x, e.y, e.w ? 0x2f7bff : 0xff2d4f, 2); S.shake = 1; }
    else if (e.k === 'ability') { const c = ABIL[e.a].col; burst(0, 0, 0.3, [c, '#fff'], 60, 3.6, 1.4); shock(W / 2, H / 2, col(c), 2.4); S.kick = 1; }
  }

  /* ---------------------------------------------------------------- dibujo por cuadro */
  function frame(dt, m, ctx = {}) {
    S.t += dt; stepParts(dt);
    S.shake = Math.max(0, S.shake - dt * 3.2); S.kick = Math.max(0, S.kick - dt * 3.5);
    /* arena viva */
    rings.forEach((r, i) => { r.rotation.z += dt * (0.1 + i * 0.05) * (i % 2 ? -1 : 1); });
    for (let i = 0; i < SPK; i++) { spPos[i * 3 + 1] += dt * (0.1 + (i % 5) * 0.05); if (spPos[i * 3 + 1] > 8) spPos[i * 3 + 1] = -1; spData[i] += dt; spPos[i * 3] += Math.sin(spData[i]) * dt * 0.1; }
    spGeo.attributes.position.needsUpdate = true;
    pillars.forEach((p, i) => { p.material.opacity = 0.35 + 0.25 * Math.sin(S.t * 1.4 + i); });
    for (let i = waves.length - 1; i >= 0; i--) {
      const w = waves[i], u = w.userData; u.t += dt; const k = u.t / 0.55;
      if (k >= 1) { scene.remove(w); w.geometry.dispose(); w.material.dispose(); waves.splice(i, 1); continue; }
      w.scale.setScalar(1 + k * 6 * u.big); w.material.opacity = 0.9 * (1 - k);
    }

    if (S.mode === 'lobby' || !m) {
      const t = S.t;
      hBall.rotation.y = t * 0.6; hBall.rotation.x = Math.sin(t * 0.4) * 0.3; hBall.position.y = 0.45 + Math.sin(t * 1.3) * 0.12;
      hHalo.position.copy(hBall.position);
      hPads[0].position.set(-1.9, 0.1 + Math.sin(t * 1.1) * 0.1, -0.7); hPads[0].rotation.set(0.2, 0.55 + Math.sin(t * 0.5) * 0.15, -1.1);
      hPads[1].position.set(1.9, 0.1 + Math.cos(t * 1.1) * 0.1, -0.7); hPads[1].rotation.set(0.2, -0.55 - Math.sin(t * 0.5) * 0.15, 1.1);
      hRings.forEach((r, i) => { r.position.copy(hBall.position); r.rotation.set(Math.PI / 2 + Math.sin(t * 0.3 + i) * 0.5, t * (0.5 + i * 0.2) * (i % 2 ? -1 : 1), 0); });
      hSat.forEach((s, i) => { const a = t * (1.4 + i * 0.5) + i * 3; s.position.set(Math.cos(a) * 2.1, hBall.position.y + Math.sin(a * 1.3) * 0.5, Math.sin(a) * 2.1); });
      lA.position.set(-3, 1.2, 1); lB.position.set(3, 1.2, 1); lBall.position.copy(hBall.position);
      key.position.set(2, 5, 5);
    } else {
      const B = m.B, sd = ctx.side || 0;
      pads.forEach((p, i) => {
        const pd = m.P[i], u = p.userData; u.sq = Math.max(0, (u.sq || 0) - dt * 6);
        const len = pd.h / 100 / 1.2;
        p.scale.set(0.75 + u.sq * 0.3, 1.1 - u.sq * 0.15, len);
        p.position.set(wx(i ? PX1 + 7 : PX0 - 7), 0.13, wz(pd.y));
        padGlow[i].position.set(p.position.x, 0.08, p.position.z); padGlow[i].scale.set(0.9 + u.sq * 0.5, pd.h / 100 * 1.4, 1);
        padMats[i].emissiveIntensity = (pd.slow > 0 ? 1.2 : 0.45) + u.sq * 0.9;
        if (pd.slow > 0) padMats[i].emissive.set(0x7fe3ff); else padMats[i].emissive.copy(padMats[i].color);
      });
      lA.position.set(pads[0].position.x + 0.3, 1.1, pads[0].position.z); lB.position.set(pads[1].position.x - 0.3, 1.1, pads[1].position.z);
      if (B) {
        const u = clamp((B.x - PX0) / (PX1 - PX0), 0, 1), hop = (m.serveT > 0 ? 0.04 * Math.sin(S.t * 6) : Math.sin(u * Math.PI) * 0.42) + 0.125;
        ball.position.set(wx(B.x), hop, wz(B.y)); ball.rotation.z -= B.vx * dt * 0.012; ball.rotation.x += B.vy * dt * 0.012;
        ballHalo.position.copy(ball.position); lBall.position.set(ball.position.x, hop + 0.3, ball.position.z);
        const hot = B.hot > 0, ghost = B.gh > 0;
        ballMat.opacity = ghost ? 0.18 : 1; ballMat.transparent = ghost; ballMat.emissiveIntensity = hot ? 1.3 : 0.3;
        ballHalo.material.opacity = ghost ? 0.1 : hot ? 1 : 0.5; ballHalo.scale.setScalar(hot ? 1.5 : 0.9);
        lBall.intensity = hot ? 14 : 6; lBall.color.set(hot ? 0xffb000 : (S.look.ballCols ? S.look.ballCols[0] : 0xcfe0ff));
        blob.position.set(ball.position.x, 0.006, ball.position.z); blob.scale.setScalar(1 + (hop - 0.125) * 1.2); blob.material.opacity = 0.45 - (hop - 0.125) * 0.5;
        trailPts.push(ball.position.clone()); if (trailPts.length > TRN) trailPts.shift();
        trail.forEach((s, i) => {
          const p = trailPts[i]; if (!p || serveHide(m)) { s.visible = false; return; }
          const k = i / TRN; s.visible = true; s.position.copy(p); s.scale.setScalar(0.1 + k * 0.45); s.material.opacity = k * (ghost ? 0.1 : hot ? 0.9 : 0.55);
          if (hot) s.material.color.set(0xffa000); else s.material.color.copy(col((S.look.ballCols || ['#9fc0ff'])[0]));
        });
      }
      if (m.orb) {
        const o = m.orb, a = ABIL[o.k]; orbG.visible = true; orbG.position.set(0, 0.35 + Math.sin(S.t * 3) * 0.06, 0);
        if (orbKey !== o.k) { orbKey = o.k; orbTex[o.k] = orbTex[o.k] || emojiTexture(a.ic); orbIcon.material.map = orbTex[o.k]; orbIcon.material.needsUpdate = true; orbRing.material.color.set(a.col); orbGlow.material.color.set(a.col); }
        orbRing.rotation.z += dt * 2; orbRing.scale.setScalar(1 + 0.12 * Math.sin(S.t * 8)); orbGlow.material.opacity = 0.5 + 0.3 * Math.sin(S.t * 6);
        orbG.scale.setScalar(o.life - o.t < 1 ? Math.max(0.1, o.life - o.t) : Math.min(1, o.t * 4));
      } else { orbG.visible = false; orbKey = ''; }
      key.position.set(2.5, 9, 3.5);
    }
    placeCam(dt);
    renderer.render(scene, cam);
  }
  const serveHide = (m) => m.serveT > 0.85;

  setLook({}); setMode('lobby'); resize();
  addEventListener('resize', resize); addEventListener('orientationchange', () => setTimeout(resize, 200));
  return {
    renderer, scene, cam, setLook, setMode, setQuality, resize, frame, pick, onEvent, burst,
    setPointer(nx, ny) { S.px = lerp(S.px, nx, 0.15); S.py = lerp(S.py, ny, 0.15); },
    resetTrail() { trailPts.length = 0; }, setFlip(v) { S.flip = !!v; }, get portrait() { return S.por; },
    celebrate(cols) { for (let i = 0; i < 6; i++) setTimeout(() => burst((Math.random() - 0.5) * 6, (Math.random() - 0.5) * 3, 1, cols, 40, 4, 1.4), i * 140); },
  };
}
