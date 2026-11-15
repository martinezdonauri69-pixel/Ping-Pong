/* previews3d.js · visores 3D de la tienda para las MESAS y los EFECTOS (igual que el de las pelotas: UNA escena y UN renderizador,
   solo se dibuja lo que se ve, una tarjeta nueva por cuadro como máximo, y se frena solo si el teléfono va lento). */
import * as THREE from '../vendor/three.module.min.js';
import { Emitter, glow, perfGov, LOW } from './balls3d.js';
import { TableFx, tableTopCanvas } from './tables3d.js';
import { FxPlayer } from './effects3d.js';

/* motor común de los visores: o = { VW, VH, cam:[pos, mira, fov], light(scene), build(it, scene) → {group, update(t, dt, c), tap(c), dispose()}, max } */
function makePreviewer(rootEl, o) {
  const R = new THREE.WebGLRenderer({ antialias: !LOW, alpha: true, powerPreference: 'low-power' });
  R.setPixelRatio(1); R.setSize(o.VW, o.VH, false); R.toneMapping = THREE.ACESFilmicToneMapping; R.toneMappingExposure = 0.95; R.outputColorSpace = THREE.SRGBColorSpace;
  const scene = new THREE.Scene(), cam = new THREE.PerspectiveCamera(o.cam[2], o.VW / o.VH, 0.1, 80); cam.position.set(...o.cam[0]); cam.lookAt(...o.cam[1]);
  { const pm = new THREE.PMREMGenerator(R), es = new THREE.Scene();
    es.add(new THREE.Mesh(new THREE.SphereGeometry(20, 16, 10), new THREE.MeshBasicMaterial({ color: 0x0a1040, side: THREE.BackSide })));
    [[0xff2d4f, -8, 6, 0], [0x2f7bff, 8, 6, 0], [0xffffff, 0, 10, 0], [0x19d3ff, 0, 4, 9]].forEach(([c, x, y, z]) => { const m = new THREE.Mesh(new THREE.BoxGeometry(6, 0.6, 6), new THREE.MeshBasicMaterial({ color: c })); m.position.set(x, y, z); m.lookAt(0, 0, 0); es.add(m); });
    scene.environment = pm.fromScene(es, 0.04).texture; pm.dispose(); }
  scene.add(new THREE.HemisphereLight(0xbfd0ff, 0x10143a, 1.0));
  const key = new THREE.DirectionalLight(0xffffff, 2.0); key.position.set(2, 6, 4); scene.add(key);
  const shared = o.shared ? o.shared(scene) : null;
  const gov = perfGov(), ents = new Map(), cards = []; let cursor = 0, raf = 0, dead = false;
  const MAXR = LOW ? Math.max(4, o.max - 4) : o.max;
  const ensure = (it) => {
    let e = ents.get(it.id); if (e) { e.last = performance.now(); return e; }
    if (ents.size >= MAXR) { let old = null; ents.forEach((q) => { const vis = cards.some((c) => c.it.id === q.id && c.vis); if (!vis && (!old || q.last < old.last)) old = q; }); if (old) { scene.remove(old.group); old.dispose(); ents.delete(old.id); } }
    e = o.build(it, scene, shared); e.id = it.id; e.group.visible = false; scene.add(e.group); ents.set(it.id, e); e.last = performance.now(); return e;
  };
  const io = new IntersectionObserver((es) => es.forEach((en) => { const c = cards.find((q) => q.cv === en.target); if (c) c.vis = en.isIntersecting; }), { root: rootEl || null, rootMargin: '20px' });
  function drawCard(c, e, t, dt) {
    ents.forEach((q) => { q.group.visible = q === e; });
    e.update(t, dt, c); R.render(scene, cam);
    c.ctx.clearRect(0, 0, c.cv.width, c.cv.height); c.ctx.drawImage(R.domElement, 0, 0, c.cv.width, c.cv.height);
  }
  function loop(ms) {
    if (dead) return; if (rootEl && !rootEl.isConnected) { dispose(); return; }
    raf = requestAnimationFrame(loop); if (document.hidden) return;
    gov.tick(ms); const t = ms / 1000; let budget = gov.budget(), built = 0, tries = cards.length;
    while (budget > 0 && tries-- > 0 && cards.length) {
      cursor = (cursor + 1) % cards.length; const c = cards[cursor]; if (!c.vis) continue;
      if (c.lt && ms - c.lt < gov.gap()) continue;
      let e = ents.get(c.it.id); if (!e) { if (built) continue; e = ensure(c.it); built = 1; }
      drawCard(c, e, t, Math.min(0.1, (ms - (c.lt || ms - 33)) / 1000)); c.lt = ms; budget--;
    }
  }
  raf = requestAnimationFrame(loop);
  function dispose() { if (dead) return; dead = true; cancelAnimationFrame(raf); io.disconnect(); cards.length = 0; ents.forEach((e) => e.dispose()); ents.clear(); if (shared && shared.dispose) shared.dispose(); try { R.dispose(); R.forceContextLoss(); } catch (e) { /* nada */ } }
  return {
    add(cv, it) { cv.width = o.VW; cv.height = o.VH; const c = { cv, it, ctx: cv.getContext('2d'), vis: true, lt: 0 }; cards.push(c); io.observe(cv); cv.addEventListener('click', () => { const e = ents.get(it.id); if (e && e.tap) e.tap(); }); },
    clear() { cards.forEach((c) => io.unobserve(c.cv)); cards.length = 0; cursor = 0; },
    dispose,
  };
}

const emitAt = (em) => (x, z, y, cols, sp, up) => { const n = em.n; em.emit(1, cols, sp * 0.5, up * 0.5, 0); if (em.n > n) em.pos.set([x, y, z], (em.n - 1) * 3); };

/* ---------------------------------------------------------------- mesas */
export function createTablePreviewer(rootEl) {
  return makePreviewer(rootEl, {
    VW: 176, VH: 120, cam: [[0, 6.9, 8.6], [0, -0.3, 0], 35], max: LOW ? 8 : 12,
    build(it) {
      const g = new THREE.Group(), own = [];
      const topMat = new THREE.MeshStandardMaterial({ roughness: 0.5, metalness: 0.1, envMapIntensity: 0.4 }), slabMat = new THREE.MeshStandardMaterial({ color: 0x0b1030, roughness: 0.4, metalness: 0.75 }), legMat = new THREE.MeshStandardMaterial({ color: 0x151b48, roughness: 0.4, metalness: 0.8 }), rimMat = new THREE.MeshBasicMaterial({ color: 0x2f7bff });
      const tg = new THREE.PlaneGeometry(8, 5), sg = new THREE.BoxGeometry(8.5, 0.34, 5.5), lg = new THREE.BoxGeometry(0.3, 1.1, 0.3), r1 = new THREE.BoxGeometry(8.5, 0.05, 0.07), r2 = new THREE.BoxGeometry(0.07, 0.05, 5.57);
      own.push(topMat, slabMat, legMat, rimMat, tg, sg, lg, r1, r2);
      const top = new THREE.Mesh(tg, topMat); top.rotation.x = -Math.PI / 2; top.position.y = 0.002; g.add(top);
      const slab = new THREE.Mesh(sg, slabMat); slab.position.y = -0.18; g.add(slab);
      [[0, -2.78, r1], [0, 2.78, r1], [-4.28, 0, r2], [4.28, 0, r2]].forEach(([x, z, geo]) => { const m = new THREE.Mesh(geo, rimMat); m.position.set(x, -0.005, z); g.add(m); });
      [[-3.7, -2.3], [3.7, -2.3], [-3.7, 2.3], [3.7, 2.3]].forEach(([x, z]) => { const m = new THREE.Mesh(lg, legMat); m.position.set(x, -0.9, z); g.add(m); });
      const em = new Emitter(LOW ? 30 : 60, 0.2); g.add(em.obj);
      const fx = new TableFx({ group: g, topMat, rimMat, slabMat, legMat, def: { slab: 0x0b1030, leg: 0x151b48, rim: 0x2f7bff } }, emitAt(em), true); fx.set(it);
      const pl = new THREE.PointLight(it.v.ug || it.v.ac, 10, 16, 1.6); pl.position.set(0, 2.5, 1.5); g.add(pl);
      return {
        group: g,
        update(t, dt) { g.rotation.y = Math.sin(t * 0.5) * 0.28; fx.update(t, dt); em.step(dt); },
        tap() { for (let i = 0; i < 14; i++) { const a = Math.random() * 6.28; emitAt(em)(Math.cos(a) * 3.6, Math.sin(a) * 2.2, 0.1, fx.cols, 1.6, 3); } },
        dispose() { fx.dispose(); em.geo.dispose(); em.mat.dispose(); own.forEach((o) => o.dispose()); },
      };
    },
  });
}

/* ---------------------------------------------------------------- efectos especiales: la mesa oscura y el efecto repitiéndose */
export function createFxPreviewer(rootEl) {
  return makePreviewer(rootEl, {
    VW: 160, VH: 120, cam: [[0, 3.7, 4.5], [0, 0, 0], 38], max: LOW ? 6 : 8,
    shared(scene) {
      const tex = tableTopCanvas({ tx: 'hex', tc: ['#2f7bff', '#0a1a6a'], ac: '#2f7bff' }, 512, 320), mat = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.5, metalness: 0.1, envMapIntensity: 0.4 }), geo = new THREE.PlaneGeometry(8, 5);
      const m = new THREE.Mesh(geo, mat); m.rotation.x = -Math.PI / 2; scene.add(m);
      return { dispose() { tex.dispose(); mat.dispose(); geo.dispose(); } };
    },
    build(it) {
      const g = new THREE.Group(), em = new Emitter(LOW ? 60 : 110, 0.14); g.add(em.obj);
      const pl = new THREE.PointLight(it.v.pc[0], 6, 8, 1.6); pl.position.set(0, 1.2, 0.5); g.add(pl);
      const player = new FxPlayer(g, emitAt(em), true); let next = 0.2, tt = 0;
      const play = () => { player.play(it.v, 0, 0, { sc: 0.9, dir: 1 }); pl.intensity = 14; };
      return {
        group: g,
        update(t, dt) { tt += dt; if (tt >= next) { next = tt + 1.8; play(); } pl.intensity = Math.max(5, pl.intensity - dt * 30); player.update(dt); em.step(dt); },
        tap() { play(); next = tt + 1.8; },
        dispose() { player.dispose(); em.geo.dispose(); em.mat.dispose(); },
      };
    },
  });
}
