/* tables3d.js · las 15 mesas 3D nuevas.  UN solo sistema (TableFx) para todas: se configuran por datos (el objeto "v" de cada mesa en catalog.js).
   Cada mesa tiene: dibujo en la superficie · capa de brillo animada · luz de borde que late · luz de abajo · piezas 3D en los bordes
   (llamas, cristales, anillos, rayos, hojas) · partículas ambientales. TableFx se usa igual en la partida y en la tienda. */
import * as THREE from '../vendor/three.module.min.js';
import { paintCanvas, hasEm, AMB, glow, mkC, LOW } from './balls3d.js';

const TAU = Math.PI * 2;
const hash = (n) => { const s = Math.sin(n * 127.1) * 43758.5453; return s - Math.floor(s); };

let FLAME = null;
const flameTex = () => FLAME || (FLAME = (() => {
  const c = mkC(64, 128), g = c.getContext('2d'), gr = g.createRadialGradient(32, 92, 2, 32, 82, 62);
  gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.4, 'rgba(255,255,255,.6)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = gr; g.beginPath(); g.moveTo(10, 128); g.quadraticCurveTo(14, 70, 32, 4); g.quadraticCurveTo(50, 70, 54, 128); g.closePath(); g.fill();
  g.globalCompositeOperation = 'source-in'; g.fillStyle = gr; g.fillRect(0, 0, 64, 128);
  return new THREE.CanvasTexture(c);
})());

/* superficie de la mesa: el dibujo de la mesa + las líneas de juego de siempre (borde, red, línea central) */
export function tableTopCanvas(v, w = 1024, h = 640) {
  const c = mkC(w, h), g = c.getContext('2d'), k = w / 1024;
  g.drawImage(paintCanvas(v.tx, v.tc, Math.max(256, w / 2), Math.max(128, h / 2.5)), 0, 0, w, h);
  const vg = g.createRadialGradient(w / 2, h / 2, 120 * k, w / 2, h / 2, 700 * k); vg.addColorStop(0, 'rgba(255,255,255,.08)'); vg.addColorStop(1, 'rgba(0,0,0,.45)'); g.fillStyle = vg; g.fillRect(0, 0, w, h);
  g.strokeStyle = 'rgba(255,255,255,.92)'; g.lineWidth = 8 * k; g.strokeRect(10 * k, 10 * k, w - 20 * k, h - 20 * k);
  g.lineWidth = 5 * k; g.setLineDash([26 * k, 20 * k]); g.beginPath(); g.moveTo(w / 2, 18 * k); g.lineTo(w / 2, h - 18 * k); g.stroke(); g.setLineDash([]);
  g.lineWidth = 4 * k; g.globalAlpha = 0.5; g.beginPath(); g.moveTo(18 * k, h / 2); g.lineTo(w - 18 * k, h / 2); g.stroke(); g.globalAlpha = 1;
  g.strokeStyle = v.ac; g.lineWidth = 3 * k; g.globalAlpha = 0.7; g.strokeRect(26 * k, 26 * k, w - 52 * k, h - 52 * k); g.globalAlpha = 1;
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 2; return t;
}

/* punto sobre el contorno de la mesa (un poco por fuera) */
const HX = 4.4, HZ = 2.9;
function peri(u, out = 0) {
  const per = 4 * (HX + HZ), d = (((u % 1) + 1) % 1) * per;
  if (d < 2 * HX) return [-HX - out + d - 0, -HZ - out];          /* borde de atrás (izq → der) */
  if (d < 2 * HX + 2 * HZ) return [HX + out, -HZ + (d - 2 * HX)];
  if (d < 4 * HX + 2 * HZ) return [HX - (d - 2 * HX - 2 * HZ), HZ + out];
  return [-HX - out, HZ - (d - 4 * HX - 2 * HZ)];
}

/* piezas 3D de los bordes. Cada una devuelve su función de animación. */
const PROPS = {
  flame(o, fx) {
    const n = fx.cnt(o.n || 12), its = [];
    for (let i = 0; i < n; i++) { const m = new THREE.SpriteMaterial({ map: flameTex(), color: o.c, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }); fx.own.push(m); const s = new THREE.Sprite(m); const [x, z] = peri(i / n, 0.05); s.position.set(x, 0.2, z); fx.group.add(s); its.push(s); }
    return (t) => its.forEach((s, i) => { const f = 0.7 + 0.3 * Math.sin(t * 7 + i * 2.3) + 0.15 * Math.sin(t * 13 + i); const h = (o.h || 0.8) * f; s.scale.set(0.42, h, 1); s.position.y = h * 0.45; s.material.opacity = 0.55 + 0.35 * Math.sin(t * 9 + i); });
  },
  crystal(o, fx) {
    const g = new THREE.OctahedronGeometry(1, 0), m = new THREE.MeshStandardMaterial({ color: o.c, emissive: o.c, emissiveIntensity: 0.6, roughness: 0.2, metalness: 0.2, flatShading: true, transparent: true, opacity: 0.92 }); fx.own.push(g, m);
    const n = fx.cnt(o.n || 10), its = [];
    for (let i = 0; i < n; i++) { const c = new THREE.Mesh(g, m), [x, z] = peri(i / n + hash(i) * 0.03, 0.1 + hash(i + 3) * 0.15), h = (o.h || 0.45) * (0.5 + hash(i + 7)); c.scale.set(0.09 + hash(i + 1) * 0.07, h, 0.09 + hash(i + 5) * 0.07); c.position.set(x, h * 0.6, z); c.rotation.set((hash(i + 9) - 0.5) * 0.4, hash(i) * TAU, (hash(i + 11) - 0.5) * 0.4); fx.group.add(c); its.push(c); }
    return (t) => { m.emissiveIntensity = 0.5 + 0.3 * Math.sin(t * 2.2); };
  },
  ring(o, fx) {
    const g = new THREE.TorusGeometry(1, o.s || 0.025, 8, 96), m = new THREE.MeshBasicMaterial({ color: o.c, transparent: true, opacity: 0.8, blending: THREE.AdditiveBlending, depthWrite: false }); fx.own.push(g, m);
    const r = new THREE.Mesh(g, m); r.rotation.x = Math.PI / 2; r.scale.set(HX + 0.5, HZ + 0.5, 1); r.position.y = 0.03; fx.group.add(r);
    const n = fx.cnt(o.n || 4), its = [];
    for (let i = 0; i < n; i++) { const sm = new THREE.SpriteMaterial({ map: glow(), color: o.c, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }); fx.own.push(sm); const s = new THREE.Sprite(sm); s.scale.setScalar(0.55); fx.group.add(s); its.push(s); }
    return (t) => { m.opacity = 0.55 + 0.25 * Math.sin(t * 2); its.forEach((s, i) => { const a = t * 0.6 + i / its.length * TAU; s.position.set(Math.cos(a) * (HX + 0.5), 0.08, Math.sin(a) * (HZ + 0.5)); }); };
  },
  bolt(o, fx) {
    const n = fx.cnt(o.n || 4), SEG = 7, pos = new Float32Array(n * SEG * 6), geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const m = new THREE.LineBasicMaterial({ color: o.c, transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending, depthWrite: false }); fx.own.push(geo, m);
    const l = new THREE.LineSegments(geo, m); l.frustumCulled = false; fx.group.add(l); let acc = 99;
    return (t, dt) => {
      acc += dt; if (acc < 0.09) return; acc = 0;
      for (let a = 0; a < n; a++) {
        const on = Math.random() < 0.7, [x0, z0] = peri(Math.random(), 0.1); let px = x0, py = 0.02, pz = z0; const tx = x0 * 0.85 + (Math.random() - 0.5) * 1.4, tz = z0 * 0.85 + (Math.random() - 0.5) * 1.4, ty = 0.5 + Math.random() * 0.6;
        for (let k = 0; k < SEG; k++) { const u = (k + 1) / SEG, nx = x0 + (tx - x0) * u + (Math.random() - 0.5) * 0.35, ny = 0.02 + (ty - 0.02) * u, nz = z0 + (tz - z0) * u + (Math.random() - 0.5) * 0.35, j = (a * SEG + k) * 6; pos.set(on ? [px, py, pz, nx, ny, nz] : [0, -9, 0, 0, -9, 0], j); px = nx; py = ny; pz = nz; }
      }
      geo.attributes.position.needsUpdate = true;
    };
  },
  leaf(o, fx) {
    const g = new THREE.PlaneGeometry(0.5, 0.9), m = new THREE.MeshStandardMaterial({ color: o.c, emissive: o.c, emissiveIntensity: 0.3, side: THREE.DoubleSide, roughness: 0.6 }); fx.own.push(g, m);
    const n = fx.cnt(o.n || 12), its = [];
    for (let i = 0; i < n; i++) { const l = new THREE.Mesh(g, m), [x, z] = peri(i / n, 0.1); l.scale.setScalar(0.35 + hash(i) * 0.3); l.position.set(x, 0.18, z); l.userData.ph = hash(i + 4) * TAU; fx.group.add(l); its.push(l); }
    return (t) => its.forEach((l, i) => { l.rotation.set(0.5 + Math.sin(t * 1.4 + l.userData.ph) * 0.3, i * 1.7, Math.sin(t * 1.1 + i) * 0.25); });
  },
};

/* ---------------------------------------------------------------- TableFx: aplica una mesa 3D (v) a las piezas de la mesa
   refs = { group, topMat, rimMat, slabMat, legMat, def: {slab, leg, rim} colores de siempre }
   emit(x, z, y, cols, vel, up) = partículas ambientales (en la partida usa las partículas finas del juego) */
export class TableFx {
  constructor(refs, emit, lo) { this.r = refs; this.emit = emit; this.lo = !!(lo || LOW); this.group = new THREE.Group(); refs.group.add(this.group); this.own = []; this.upd = []; this.id = ''; this.acc = 0; this.t = 0; }
  cnt(n) { return this.lo ? Math.max(3, Math.ceil(n * 0.6)) : n; }
  get active() { return !!this.id; }
  set(it) {
    const id = it ? it.id : ''; if (id === this.id) return;
    this.clear(); this.id = id; const r = this.r;
    if (!it) { r.slabMat.color.set(r.def.slab); r.slabMat.metalness = 0.75; r.legMat.color.set(r.def.leg); r.rimMat.color.set(r.def.rim); return; }
    const v = it.v; this.item = it;
    if (r.topMat.map) r.topMat.map.dispose();
    r.topMat.map = tableTopCanvas(v, this.lo ? 512 : 1024, this.lo ? 320 : 640); r.topMat.needsUpdate = true;
    r.slabMat.color.set(v.sl || r.def.slab); r.slabMat.metalness = v.sm ?? 0.75; r.legMat.color.set(v.sl || r.def.leg); r.rimMat.color.set(v.ac);
    /* capa de brillo animada encima (lava que se mueve, aurora, circuitos...) */
    const sz = this.lo ? [256, 128] : [512, 256], cv = paintCanvas(v.tx, v.tc, sz[0], sz[1], hasEm(v.tx, v.tc) ? 'e' : 'm');
    this.glowTex = new THREE.CanvasTexture(cv); this.glowTex.wrapS = this.glowTex.wrapT = THREE.RepeatWrapping; this.glowTex.colorSpace = THREE.SRGBColorSpace;
    const gm = new THREE.MeshBasicMaterial({ map: this.glowTex, transparent: true, opacity: v.go ?? 0.5, blending: THREE.AdditiveBlending, depthWrite: false }), gg = new THREE.PlaneGeometry(7.9, 4.9);
    this.own.push(this.glowTex, gm, gg); const ov = new THREE.Mesh(gg, gm); ov.rotation.x = -Math.PI / 2; ov.position.y = 0.007; this.group.add(ov); this.ov = gm;
    /* luz de abajo */
    const um = new THREE.SpriteMaterial({ map: glow(), color: v.ug || v.ac, transparent: true, opacity: 0.4, depthWrite: false, blending: THREE.AdditiveBlending }); this.own.push(um);
    this.ug = new THREE.Sprite(um); this.ug.scale.set(12, 8, 1); this.ug.position.y = -0.45; this.group.add(this.ug);
    (v.pr || []).forEach((o) => { const f = PROPS[o.k]; if (f) this.upd.push(f(o, this)); });
    this.rb = new THREE.Color(v.ac); this.amb = AMB[v.am] || AMB.mote; this.cols = v.pc || [v.ac];
  }
  update(t, dt) {
    if (!this.id) return; const v = this.item.v; this.t = t;
    if (v.fl && this.glowTex) { this.glowTex.offset.x = (this.glowTex.offset.x + dt * v.fl[0]) % 1; this.glowTex.offset.y = (this.glowTex.offset.y + dt * v.fl[1]) % 1; }
    if (this.ov) this.ov.opacity = (v.go ?? 0.5) * (0.85 + 0.15 * Math.sin(t * 2.3));
    if (this.ug) this.ug.material.opacity = 0.32 + 0.12 * Math.sin(t * 1.8);
    if (v.rp === 'rainbow') this.r.rimMat.color.setHSL((t * 0.12) % 1, 0.9, 0.55);                 /* borde que cambia de color */
    else { const k = 0.7 + 0.3 * Math.sin(t * 2.4); this.r.rimMat.color.setRGB(this.rb.r * k, this.rb.g * k, this.rb.b * k); }
    for (let i = 0; i < this.upd.length; i++) this.upd[i](t, dt);
    if (this.emit) {                                                                              /* partículas ambientales: pocas */
      this.acc += dt * this.amb[0] * 1.6 * (this.lo ? 0.5 : 1);
      while (this.acc >= 1) { this.acc -= 1; const [x, z] = peri(Math.random(), -0.2 - Math.random() * 0.4); this.emit(x, z, 0.05, [this.cols[(Math.random() * this.cols.length) | 0]], this.amb[1], this.amb[2]); }
    }
  }
  clear() {
    this.own.forEach((o) => { try { o.dispose(); } catch (e) { /* nada */ } }); this.own.length = 0; this.upd.length = 0; this.group.clear(); this.id = ''; this.ov = null; this.ug = null; this.glowTex = null;
  }
  dispose() { this.clear(); this.r.group.remove(this.group); }
}
