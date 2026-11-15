/* effects3d.js · los 10 efectos especiales de golpe.  UN solo reproductor (FxPlayer) para todos; cada efecto es solo un objeto de datos "v":
   { pc: colores de partículas, n: cantidad, sp: velocidad, up: altura,
     rings: [{c, big, d, up}]  anillos de onda (d = retraso en s, up = el anillo sube),
     beams: {n, c, h}          rayos de luz verticales · rays: {n, c} rayos planos sobre la mesa
     shards: {n, c, sz}        fragmentos 3D que vuelan · flash: {c, sz} destello · streak: {c} cometa que sale disparado · tr: colores de la estela de la pelota }
   Todo sale de "pools" (se reutilizan siempre las mismas piezas, no se crea nada nuevo al golpear). */
import * as THREE from '../vendor/three.module.min.js';
import { glow, mkC, LOW } from './balls3d.js';

const TAU = Math.PI * 2;
let BEAM = null, RAY = null;
const beamTex = () => BEAM || (BEAM = (() => {
  const c = mkC(32, 128), g = c.getContext('2d'), gr = g.createLinearGradient(0, 128, 0, 0);
  gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.5, 'rgba(255,255,255,.55)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr;
  g.beginPath(); g.moveTo(10, 128); g.lineTo(16, 0); g.lineTo(22, 128); g.closePath(); g.fill(); return new THREE.CanvasTexture(c);
})());
const rayTex = () => RAY || (RAY = (() => {
  const c = mkC(128, 16), g = c.getContext('2d'), gr = g.createLinearGradient(0, 0, 128, 0);
  gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.beginPath(); g.moveTo(0, 5); g.lineTo(128, 8); g.lineTo(0, 11); g.closePath(); g.fill(); return new THREE.CanvasTexture(c);
})());

export class FxPlayer {
  /* burst(x, z, altura, colores, cantidad, velocidad, subida): partículas finas (las del juego o las de la tienda) */
  constructor(parent, burst, lite = false) {
    this.burst = burst; this.g = new THREE.Group(); parent.add(this.g); this.q = []; this.own = [];
    const ADD = { transparent: true, depthWrite: false, blending: THREE.AdditiveBlending };
    this.rings = Array.from({ length: lite ? 5 : LOW ? 6 : 9 }, () => { const m = new THREE.Mesh(new THREE.RingGeometry(0.1, 0.16, 40), new THREE.MeshBasicMaterial({ ...ADD, color: '#fff', side: THREE.DoubleSide })); m.rotation.x = -Math.PI / 2; m.visible = false; this.g.add(m); this.own.push(m.geometry, m.material); return { m, on: 0 }; });
    this.beams = Array.from({ length: lite || LOW ? 8 : 12 }, () => { const m = new THREE.SpriteMaterial({ ...ADD, map: beamTex(), color: '#fff' }), s = new THREE.Sprite(m); s.visible = false; this.g.add(s); this.own.push(m); return { s, on: 0 }; });
    this.rays = Array.from({ length: lite || LOW ? 8 : 14 }, () => { const m = new THREE.MeshBasicMaterial({ ...ADD, map: rayTex(), color: '#fff', side: THREE.DoubleSide }), s = new THREE.Mesh(new THREE.PlaneGeometry(1, 0.09), m); s.rotation.x = -Math.PI / 2; s.visible = false; this.g.add(s); this.own.push(m, s.geometry); return { s, on: 0 }; });
    const sg = new THREE.OctahedronGeometry(1, 0); this.own.push(sg);
    this.shards = Array.from({ length: lite || LOW ? 8 : 14 }, () => { const m = new THREE.MeshBasicMaterial({ ...ADD, color: '#fff' }), s = new THREE.Mesh(sg, m); s.visible = false; this.g.add(s); this.own.push(m); return { s, on: 0, v: new THREE.Vector3() }; });
    const fm = new THREE.SpriteMaterial({ ...ADD, map: glow(), color: '#fff' }); this.flash = new THREE.Sprite(fm); this.flash.visible = false; this.g.add(this.flash); this.own.push(fm); this.fo = 0;
    this.streaks = [0, 1].map(() => { const m = new THREE.SpriteMaterial({ ...ADD, map: glow(), color: '#fff' }), s = new THREE.Sprite(m); s.visible = false; this.g.add(s); this.own.push(m); return { s, on: 0, dir: 1 }; });
  }
  free(arr) { return arr.find((x) => !x.on); }
  /* reproduce un efecto en (x, z). o.sc = tamaño (la tienda lo agranda) · o.dir = hacia dónde sale el cometa */
  play(f, x, z, o = {}) {
    const sc = o.sc || 1, cols = f.pc, lo = LOW ? 0.6 : 1;
    this.burst(x, z, 0.12, cols, Math.round(f.n * lo), f.sp * 0.5 * sc, f.up * 0.6);
    (f.rings || []).forEach((r) => this.q.push({ t: r.d || 0, run: () => { const q = this.free(this.rings); if (!q) return; q.on = 1; q.t = 0; q.big = r.big * sc; q.up = r.up ? 1 : 0; q.m.material.color.set(r.c); q.m.position.set(x, 0.03, z); q.m.visible = true; } }));
    if (f.beams) { for (let i = 0; i < Math.round(f.beams.n * lo); i++) { const q = this.free(this.beams); if (!q) break; const a = i / f.beams.n * TAU, r = (0.1 + Math.random() * 0.35) * sc; q.on = 1; q.t = 0; q.h = f.beams.h * sc * (0.6 + Math.random() * 0.6); q.s.material.color.set(f.beams.c); q.s.position.set(x + Math.cos(a) * r, 0.03, z + Math.sin(a) * r); q.s.scale.set(0.09 * sc, 0.01, 1); q.s.center.set(0.5, 0); q.s.visible = true; } }
    if (f.rays) { for (let i = 0; i < Math.round(f.rays.n * lo); i++) { const q = this.free(this.rays); if (!q) break; q.on = 1; q.t = 0; q.a = i / f.rays.n * TAU; q.sc = sc; q.s.material.color.set(f.rays.c); q.s.rotation.z = -q.a; q.s.position.set(x, 0.035, z); q.cx = x; q.cz = z; q.s.visible = true; } }
    if (f.shards) { for (let i = 0; i < Math.round(f.shards.n * lo); i++) { const q = this.free(this.shards); if (!q) break; const a = Math.random() * TAU, v = (1 + Math.random() * 1.6) * sc; q.on = 1; q.t = 0; q.v.set(Math.cos(a) * v, (1.6 + Math.random() * 1.8) * sc, Math.sin(a) * v); q.s.material.color.set(f.shards.c); q.s.scale.setScalar(f.shards.sz * sc * (0.6 + Math.random() * 0.8)); q.s.position.set(x, 0.1, z); q.s.visible = true; } }
    if (f.flash) { this.fo = 1; this.flash.material.color.set(f.flash.c); this.fs = f.flash.sz * sc; this.flash.position.set(x, 0.12, z); this.flash.visible = true; }
    if (f.streak) { const q = this.free(this.streaks); if (q) { q.on = 1; q.t = 0; q.dir = o.dir || 1; q.sc = sc; q.x = x; q.z = z; q.s.material.color.set(f.streak.c); q.s.position.set(x, 0.14, z); q.s.visible = true; } }
  }
  update(dt) {
    for (let i = this.q.length - 1; i >= 0; i--) { const e = this.q[i]; e.t -= dt; if (e.t <= 0) { this.q.splice(i, 1); e.run(); } }
    this.rings.forEach((q) => { if (!q.on) return; q.t += dt; const k = q.t / 0.55; if (k >= 1) { q.on = 0; q.m.visible = false; return; } q.m.scale.setScalar(0.5 + k * 4 * q.big); q.m.material.opacity = 0.95 * (1 - k); if (q.up) q.m.position.y = 0.03 + k * 0.7 * q.big; });
    this.beams.forEach((q) => { if (!q.on) return; q.t += dt; const k = q.t / 0.5; if (k >= 1) { q.on = 0; q.s.visible = false; return; } q.s.scale.y = q.h * Math.sin(Math.min(1, k * 2.2) * Math.PI / 2); q.s.material.opacity = 1 - k * k; });
    this.rays.forEach((q) => { if (!q.on) return; q.t += dt; const k = q.t / 0.45; if (k >= 1) { q.on = 0; q.s.visible = false; return; } const len = (0.4 + k * 2.2) * q.sc; q.s.scale.set(len, 1, 1); const d = (0.2 + k * 1.3) * q.sc; q.s.position.set(q.cx + Math.cos(q.a) * d, 0.035, q.cz + Math.sin(q.a) * d); q.s.material.opacity = 1 - k; });
    this.shards.forEach((q) => { if (!q.on) return; q.t += dt; if (q.t > 0.8) { q.on = 0; q.s.visible = false; return; } q.v.y -= 7 * dt; q.s.position.addScaledVector(q.v, dt); if (q.s.position.y < 0.03) { q.s.position.y = 0.03; q.v.y *= -0.35; } q.s.rotation.x += dt * 8; q.s.rotation.y += dt * 6; q.s.material.opacity = 1 - q.t / 0.8; });
    if (this.fo > 0) { this.fo = Math.max(0, this.fo - dt * 4); this.flash.scale.setScalar(this.fs * (1.6 - this.fo * 0.8)); this.flash.material.opacity = this.fo; if (!this.fo) this.flash.visible = false; }
    this.streaks.forEach((q) => { if (!q.on) return; q.t += dt; const k = q.t / 0.55; if (k >= 1) { q.on = 0; q.s.visible = false; return; } q.s.position.x = q.x + q.dir * k * 3.2 * q.sc; q.s.scale.set((1.8 - k) * 0.9 * q.sc, 0.2 * q.sc, 1); q.s.material.opacity = 1 - k; });
  }
  dispose() { this.own.forEach((o) => { try { o.dispose(); } catch (e) { /* nada */ } }); this.g.parent && this.g.parent.remove(this.g); }
}
