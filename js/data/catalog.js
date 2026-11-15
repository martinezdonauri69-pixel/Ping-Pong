/* catalog.js · todo lo que se vende en la tienda.
   Cada artículo: { id, cat, n:(clave de idioma), pc:(precio en monedas) | gm:(precio en gemas), ...apariencia }
   Las 40 paletas 3D se definen en la tabla PADS (nombre, precio, ventaja, efecto y diseño). */
export const CATS = ['pad', 'bl', 'tb', 'fx', 'pw'];

/* ---------------------------------------------------------------- PALETAS
   [id, nombre, nivel(0-4), precio, ventaja('pr'|'ct'|'sp'|''), %, movimiento del efecto, [claro, medio, oscuro], dibujo, extra, colores de partículas]
   pr = precisión (la paleta sigue mejor tu dedo) · ct = control (ángulo de devolución) · sp = velocidad (movimiento)
   lv = nivel de perfil mínimo para comprarla (0 = sin límite) · fl = cómo se mueve el dibujo [horizontal, vertical] · x = piezas 3D que giran alrededor en la tienda
   REGLAS: la ventaja máxima es 5 %, no se suma entre paletas (solo cuenta la equipada) y NINGUNA cambia el tamaño ni el área de golpe. */
const PADS = [
  ['pd_clasica', 'Clásica', 0, 0, '', 0, 'none', ['#a8dcff', '#2f7bff', '#0a2a8a'], 'stripe', '', null],
  ['pd_rayo', 'Rayo Azul', 0, 70, 'ct', 1, 'jitter', ['#d0f4ff', '#19b5ff', '#0a3a9a'], 'lines', '', null],
  ['pd_fuego', 'Fuego Básico', 0, 80, 'sp', 1, 'rise', ['#ffe08a', '#ff5a1f', '#8a1008'], 'waves', '', null],
  ['pd_hielo', 'Hielo', 0, 90, 'pr', 1, 'fall', ['#ecfcff', '#6fd6ff', '#1f6fb8'], 'hex', '', null],
  ['pd_veneno', 'Veneno', 0, 100, 'ct', 1, 'rise', ['#eaffb4', '#3ddc2a', '#145a10'], 'dots', '', null],
  ['pd_neon', 'Neón', 0, 120, '', 0, 'glow', ['#ffd6ff', '#c03cff', '#4a0a8a'], 'lines', 'fxonly', null],
  ['pd_dorado', 'Dorado', 1, 150, 'pr', 2, 'twinkle', ['#fff3b0', '#ffc21a', '#8a5a00'], 'diamonds', '', null],
  ['pd_sombras', 'Sombras', 1, 150, 'ct', 2, 'drift', ['#7a5aaa', '#2a1650', '#07030f'], 'dots', '', ['#b57bff', '#6a3dff']],
  ['pd_cyber', 'Cyber', 1, 180, 'sp', 2, 'jitter', ['#c4f9ff', '#19d3ff', '#0a4a6a'], 'circuit', '', null],
  ['pd_lava', 'Lava', 1, 200, 'pr', 2, 'rise', ['#ffe08a', '#ff6a00', '#4a0a00'], 'waves', '', null],
  ['pd_espacial', 'Espacial', 1, 220, 'ct', 2, 'twinkle', ['#cdd4ff', '#4a5cff', '#150a4a'], 'stars', '', null],
  ['pd_aurora', 'Aurora', 1, 250, 'sp', 2, 'orbit', ['#a8ffd8', '#7a6cff', '#ff6ad8'], 'waves', '', null],
  ['pd_diamante', 'Diamante', 2, 280, 'pr', 3, 'twinkle', ['#ffffff', '#6fd6ff', '#2a7ad8'], 'diamonds', '', null],
  ['pd_infernal', 'Infernal', 2, 300, 'ct', 3, 'rise', ['#ff9a8a', '#e0243a', '#2a0006'], 'checker', '', null],
  ['pd_electrica', 'Eléctrica', 2, 320, 'sp', 3, 'jitter', ['#fff6a0', '#ffd21f', '#8a5a00'], 'lines', '', null],
  ['pd_glacial', 'Glacial Pro', 2, 340, 'pr', 3, 'fall', ['#ffffff', '#9fe8ff', '#2f8ad8'], 'hex', '', null],
  ['pd_fantasma', 'Fantasma', 2, 360, 'ct', 3, 'drift', ['#f2e4ff', '#a07cff', '#3a1a8a'], 'dots', '', null],
  ['pd_quantum', 'Quantum', 2, 380, 'sp', 3, 'orbit', ['#b8c0ff', '#7a3dff', '#1a0a6a'], 'lines', '', null],
  ['pd_cibernetica', 'Cibernética', 3, 400, 'pr', 4, 'jitter', ['#d4f9ff', '#2fa8ff', '#ff3df2'], 'circuit', '', null],
  ['pd_solar', 'Solar', 3, 420, 'sp', 4, 'rise', ['#fff0a0', '#ff9a1a', '#c02a00'], 'rays', '', null],
  ['pd_vortice', 'Vórtice', 3, 440, 'ct', 4, 'orbit', ['#e4b8ff', '#9b3dff', '#2a0a6a'], 'waves', '', null],
  ['pd_nebulosa', 'Nebulosa', 3, 460, 'pr', 4, 'orbit', ['#ffb8f4', '#6a3dff', '#0a1a8a'], 'stars', '', null],
  ['pd_tornado', 'Tornado', 3, 480, 'sp', 4, 'orbit', ['#d4f6ff', '#4dc8ff', '#1a6ab8'], 'waves', '', null],
  ['pd_galaxia', 'Galaxia', 3, 500, 'ct', 4, 'twinkle', ['#ccaaff', '#4a2dd8', '#0a0a3a'], 'stars', '', ['#c8a0ff', '#6a8aff', '#ffffff']],
  ['pd_draconica', 'Dracónica', 4, 600, 'pr', 4, 'rise', ['#ff9a6a', '#c01a2a', '#3a0008'], 'scales', 'fire', ['#ff5a1f', '#ffb000', '#ff2d4f']],
  ['pd_arcangel', 'Arcángel', 4, 650, 'ct', 4, 'twinkle', ['#ffffff', '#bfe8ff', '#ffd9a0'], 'dots', 'light', ['#ffffff', '#fff3b0', '#bfe8ff']],
  ['pd_kasumi', 'Kasumi', 4, 700, 'sp', 4, 'orbit', ['#ffd6f2', '#ff4da6', '#8a0a5a'], 'waves', 'energy', ['#ff4da6', '#ffd0f0', '#ff8ad0']],
  ['pd_demoniaca', 'Demoníaca', 4, 750, 'pr', 4, 'rise', ['#ff6a4a', '#6a0a1a', '#10000a'], 'checker', 'hell', ['#ff2d2d', '#ff7a1a', '#7a00ff']],
  ['pd_legendaria', 'Legendaria Plus', 4, 800, 'ct', 5, 'twinkle', ['#fffbd0', '#ffc21a', '#b05a00'], 'diamonds', 'gold', ['#ffd21f', '#fff6b0', '#ffffff']],
  ['pd_infinita', 'Infinita', 4, 900, 'pr', 5, 'orbit', ['#ff4da6', '#19d3ff', '#ffd21f'], 'waves', 'cosmic', ['#ff4da6', '#19d3ff', '#ffd21f', '#8a5aff']],
  /* ---- 10 paletas NUEVAS (difíciles de conseguir): precio alto + nivel mínimo (lv) + diseño con movimiento (fl = cómo se mueve el dibujo) ---- */
  ['pd_dragondorado', 'Dragón Dorado', 4, 1800, 'pr', 5, 'rise', ['#fff3b0', '#ffc21a', '#5a3a00'], 'dragon', 'dragon', ['#ffd21f', '#ff8a1a', '#fff3b0'], 10, [0.03, 0], [{ k: 'dragon', n: 12, r: 0.4, z: 1.6, ax: 'x', c: '#ffc21a', sp: 1.4 }, { k: 'spark', n: 5, r: 0.9, c: '#ffd24a', s: 0.3 }]],
  ['pd_rayoelec', 'Rayo Eléctrico', 4, 1500, 'ct', 5, 'jitter', ['#e8fbff', '#19b5ff', '#0a1a6a'], 'bolts', 'bolt', ['#ffffff', '#19d3ff', '#7fb0ff'], 8, [0.03, 0], [{ k: 'ring', n: 2, ax: 'x', r: 0.6, s: 0.03, c: ['#19d3ff', '#ffffff'], sp: 3 }, { k: 'spark', n: 6, r: 0.8, c: ['#ffffff', '#19d3ff'], s: 0.35, sp: 2.4 }]],
  ['pd_fuegoinf', 'Fuego Infernal', 4, 1600, 'sp', 5, 'rise', ['#ffe08a', '#ff3a1a', '#2a0000'], 'cracks', 'fire', ['#ff5a1f', '#ffb000', '#ff2d4f'], 12, [0.03, 0], [{ k: 'spark', n: 8, r: 0.7, c: ['#ffb000', '#ff5a1f'], s: 0.4, sp: 1.2 }, { k: 'petal', leaf: 1, n: 6, r: 0.75, s: 0.2, c: ['#ff5a1f', '#ffb000'], sp: 1, em: 0.9 }]],
  ['pd_hielosup', 'Hielo Supremo', 4, 1700, 'pr', 5, 'fall', ['#ffffff', '#7fd8ff', '#1a5ab8'], 'crystals', 'frost', ['#ffffff', '#9fe8ff', '#4dc8ff'], 14, [0.03, 0], [{ k: 'shard', n: 7, r: 0.75, s: 0.1, c: '#e8fbff', sp: 0.6 }, { k: 'spark', n: 5, r: 0.8, c: '#ffffff', s: 0.25 }]],
  ['pd_galaxiacos', 'Galaxia Cósmica', 4, 2200, 'ct', 5, 'orbit', ['#e0c8ff', '#6a3dff', '#0a0a3a'], 'spiral', 'cosmic', ['#c8a0ff', '#6a8aff', '#ffffff', '#ff6ad8'], 20, [0.03, 0], [{ k: 'ring', n: 2, ax: 'x', r: 0.7, s: 0.025, c: ['#c8a0ff', '#ff6ad8'], sp: 1 }, { k: 'spark', n: 7, r: 0.85, c: ['#ffffff', '#b04dff'], s: 0.2, sp: 0.7 }]],
  ['pd_neonpro', 'Neón Pro', 4, 1400, 'sp', 5, 'glow', ['#ffd6ff', '#ff3df2', '#19e6ff'], 'neonloops', 'energy', ['#ff3df2', '#19e6ff', '#ffffff'], 6, [0.03, 0], [{ k: 'ring', n: 3, ax: 'x', r: 0.65, s: 0.035, c: ['#ff3df2', '#19e6ff', '#ffffff'], sp: 2.2 }, { k: 'shard', geo: 'box', n: 6, r: 0.9, s: 0.05, c: '#19e6ff', sp: 0.8 }]],
  ['pd_calavera', 'Calavera Mortal', 4, 2000, 'pr', 5, 'drift', ['#ffd0d0', '#e0243a', '#1a0008'], 'skulls', 'hell', ['#ff2d2d', '#ffffff', '#7a00ff'], 25, [0.03, 0], [{ k: 'spark', n: 7, r: 0.7, c: ['#ff2d2d', '#7a00ff'], s: 0.4, sp: 0.9 }, { k: 'ring', n: 1, ax: 'x', r: 0.6, s: 0.03, c: '#ff2d2d', sp: 1.4 }]],
  ['pd_reyleyenda', 'Rey Leyenda', 4, 3000, 'ct', 5, 'twinkle', ['#fffbd0', '#ffc21a', '#8a5a00'], 'crowns', 'gold', ['#ffd21f', '#fff6b0', '#ffffff'], 40, [0.03, 0], [{ k: 'ring', n: 2, ax: 'x', r: 0.68, s: 0.035, c: '#ffd24a', sp: 1.1 }, { k: 'spark', n: 8, r: 0.85, c: ['#fff3b0', '#ffd24a'], s: 0.3, sp: 1 }]],
  ['pd_tiburon', 'Tiburón Azul', 4, 2400, 'sp', 5, 'fall', ['#d4f6ff', '#19b5ff', '#0a3a8a'], 'shark', 'water', ['#ffffff', '#19d3ff', '#4dc8ff'], 30, [0.03, 0], [{ k: 'ring', n: 2, ax: 'x', r: 0.7, s: 0.03, c: '#7fe0ff', sp: 1.6 }, { k: 'spark', n: 6, r: 0.85, c: '#ffffff', s: 0.25 }]],
  ['pd_demonio', 'Demonio Oscuro', 4, 2800, 'pr', 5, 'rise', ['#ff6a4a', '#e0243a', '#10000a'], 'demon', 'hell', ['#ff2d2d', '#ff7a1a', '#7a00ff'], 35, [0.03, 0], [{ k: 'spark', n: 7, r: 0.75, c: ['#ff2d2d', '#ff7a1a'], s: 0.4, sp: 1 }, { k: 'ring', n: 1, ax: 'x', r: 0.62, s: 0.03, c: '#ff2d2d', sp: 1.2 }]],
];
const mkPad = ([id, name, tier, pc, k, pct, m, c, pat, ex, fc, lv, fl, x]) => ({
  id, cat: 'pad', name, tier, pc, lv: lv || 0, fl: fl || null, x: x || null, st: { pr: k === 'pr' ? pct / 100 : 0, ct: k === 'ct' ? pct / 100 : 0, sp: k === 'sp' ? pct / 100 : 0 },
  m, c, pat, ex, fc: fc || [c[1], c[0]], col: c[1],
});
const PAD_ITEMS = PADS.map(mkPad);
/* paleta del rival cuando no tiene una equipada (bot, 2 jugadores): no se vende */
export const RIVAL_PAD = mkPad(['pd_rival', 'Rival', 0, 0, '', 0, 'none', ['#ffd0d8', '#ff2d4f', '#5a0814'], 'stripe', '', null]);
export const ZERO_ST = { pr: 0, ct: 0, sp: 0 };
/* ventajas de una paleta (si pasas "owned", solo cuenta si de verdad la tienes) */
export function padStats(id, owned) {
  const it = ITEMS.find((x) => x.id === id);
  if (!it || it.cat !== 'pad') return ZERO_ST;
  if (owned && !(it.pc === 0 || owned.includes(id))) return ZERO_ST;
  return it.st;
}

/* ---------------------------------------------------------------- 40 PELOTAS 3D NUEVAS
   [id, nombre, precio, moneda('pc' monedas | 'gm' gemas), v = diseño 3D]
   v (todo opcional):  g forma ('gem' facetas · 'cry' cristal · 'dia' diamante · normal = esfera) · tx dibujo de la superficie · tc colores del dibujo
     bc color base · mt metal (0-1) · rg rugosidad (0-1) · op transparencia (1 = sólida) · cc brillo de barniz (1) · em/ei brillo propio (color/fuerza) · env fuerza de reflejos
     bump relieve · fl [u,v] cómo se mueve el dibujo · spin giro · dst deformación · shell [color, opacidad] capa de cristal · core [color, tamaño, late(1)] núcleo de luz
     orb piezas 3D que giran: {k:'shard'|'ring'|'petal'|'fish'|'electron'|'gear'|'helix'|'dragon'|'spark'|'bubble', n cantidad, r radio, s tamaño, c color(es), sp velocidad}
     au aura · tr estela · lg luz · am partículas ambientales (AMB en balls3d.js) · ht efecto al golpear (HIT en balls3d.js) · pc colores de las partículas
   Para agregar una pelota nueva: copia una línea, cambia el id y los datos. No hay que tocar nada más. */
const BALLS = [
  ['bl_volcan', 'Volcán', 450, 'pc', { tx: 'lava', tc: ['#ff7a1a', '#ff2200', '#fff2b0'], bump: 1, mt: 0.1, rg: 0.8, ei: 1.1, spin: 0.5, fl: [0.01, 0], au: '#ff6a1a', tr: '#ff5a14', lg: '#ff6a2a', am: 'ash', ht: 'lava', pc: ['#ff7a1a', '#4a1a10', '#ffb000'] }],
  ['bl_oceano', 'Océano', 600, 'pc', { tx: 'water', tc: ['#0a63d8', '#19d3ff'], op: 0.55, mt: 0, rg: 0.15, cc: 1, fl: [0.02, 0.006], shell: ['#bfe8ff', 0.2], orb: [{ k: 'bubble', n: 7, c: '#e8fbff' }, { k: 'ring', n: 2, r: 1.2, s: 0.02, c: '#7fe0ff', sp: 1.2 }], au: '#4dc8ff', tr: '#4dc8ff', lg: '#7fe0ff', am: 'bubble', ht: 'splash', pc: ['#7fe0ff', '#ffffff'] }],
  ['bl_tormenta', 'Tormenta', 700, 'pc', { tx: 'storm', tc: ['#c8b8ff'], mt: 0.8, rg: 0.35, ei: 1.1, fl: [0.03, 0], orb: [{ k: 'spark', n: 5, r: 1.25, c: '#d6c8ff', sp: 1.6 }, { k: 'ring', n: 1, r: 1.2, c: '#b7a0ff', sp: 2.4, op: 0.6 }], au: '#8a6aff', tr: '#b7a0ff', lg: '#a890ff', am: 'spark', ht: 'bolt', pc: ['#d6c8ff', '#ffffff'] }],
  ['bl_esmeralda', 'Esmeralda', 900, 'pc', { g: 'gem', tx: 'gem', tc: ['#0a8a3a', '#5dffa0'], op: 0.92, mt: 0.05, rg: 0.05, cc: 1, em: '#19e68c', ei: 0.35, env: 1.6, spin: 0.5, orb: [{ k: 'shard', n: 5, r: 1.45, s: 0.09, c: '#7dffb8' }], au: '#19e68c', tr: '#19e68c', lg: '#7dffb8', am: 'mote', ht: 'shard', pc: ['#7dffb8', '#ffffff'] }],
  ['bl_rubi', 'Rubí', 900, 'pc', { g: 'gem', tx: 'gem', tc: ['#9a0a1e', '#ff5a6e'], op: 0.94, mt: 0.05, rg: 0.04, cc: 1, em: '#ff1f3a', ei: 0.5, env: 1.8, orb: [{ k: 'spark', n: 3, r: 1.3, c: '#ff8a9a', sp: 1.4 }], au: '#ff2d4f', tr: '#ff2d4f', lg: '#ff4a5e', am: 'glint', ht: 'flash', pc: ['#ff2d4f', '#ffffff'] }],
  ['bl_holograma', 'Holograma', 900, 'pc', { tx: 'holo', tc: ['#19d3ff', '#ff3df2'], op: 0.72, mt: 0.1, rg: 0.2, ei: 1.1, fl: [0, 0.08], orb: [{ k: 'ring', n: 1, r: 1.25, s: 0.012, c: '#7fe8ff', sp: 0.8, op: 0.9 }, { k: 'shard', geo: 'box', n: 6, r: 1.5, s: 0.05, c: '#7fe8ff', sp: 0.6 }], au: '#7fe8ff', tr: '#7fe8ff', lg: '#7fe8ff', am: 'digital', ht: 'scan', pc: ['#7fe8ff', '#ff3df2'] }],
  ['bl_reloj', 'Reloj', 800, 'pc', { tx: 'clock', tc: ['#ffc21a', '#19d3ff'], op: 0.3, mt: 0.5, rg: 0.2, ei: 1, cc: 1, spin: 0.45, core: ['#19d3ff', 0.2, 1], orb: [{ k: 'gear', n: 3, c: '#e8c15a' }, { k: 'ring', n: 1, r: 1.2, c: '#ffc21a', sp: 0.6, op: 0.6 }], au: '#ffc21a', tr: '#19d3ff', lg: '#ffd27a', am: 'tick', ht: 'pulse', pc: ['#19d3ff', '#ffc21a'] }],
  ['bl_plasma', 'Plasma', 700, 'pc', { tx: 'swirl', tc: ['#ffffff', '#2fa8ff', '#1a4fff'], op: 0.55, mt: 0, rg: 0.3, em: '#5ac8ff', ei: 1.2, fl: [0.05, 0.02], shell: ['#9fdcff', 0.18], core: ['#ffffff', 0.45, 1], orb: [{ k: 'ring', n: 2, r: 1.2, c: '#7fd8ff', sp: 1.8, op: 0.7 }], au: '#4dc8ff', tr: '#7fd8ff', lg: '#9fe0ff', am: 'spark', ht: 'blast', pc: ['#7fd8ff', '#ffffff'] }],
  ['bl_jade', 'Jade', 600, 'pc', { tx: 'jade', tc: ['#0e8a4a', '#ffd24a'], mt: 0.15, rg: 0.18, cc: 1, ei: 0.8, orb: [{ k: 'spark', n: 4, r: 1.2, c: '#ffd24a', sp: 0.9, s: 0.2 }], au: '#2fe08a', tr: '#2fe08a', lg: '#9affc8', am: 'gold', ht: 'sparkle', pc: ['#ffd24a', '#fff6b0'] }],
  ['bl_aurora', 'Aurora', 50, 'gm', { tx: 'aurora', tc: ['#19ffa0', '#2f8bff', '#b04dff'], mt: 0, rg: 0.2, em: '#9fd0ff', ei: 0.8, fl: [0.03, 0.01], shell: ['#e8f6ff', 0.22], orb: [{ k: 'ring', n: 3, r: 1.25, c: ['#19ffa0', '#2f8bff', '#b04dff'], sp: 1.2, op: 0.6 }, { k: 'spark', n: 5, r: 1.3, c: ['#19ffa0', '#b04dff'], sp: 0.8 }], au: '#7fe8ff', tr: ['#19ffa0', '#2f8bff', '#b04dff'], lg: '#a0e8ff', am: 'mote', ht: 'wave', pc: ['#19ffa0', '#2f8bff', '#b04dff'] }],
  ['bl_luna', 'Luna', 600, 'pc', { tx: 'moon', tc: ['#cfd6e4', '#7d8798'], bump: 1, mt: 0, rg: 0.95, em: '#8fb4ff', ei: 0.05, spin: 0.3, au: '#bcd4ff', tr: '#bcd4ff', lg: '#cfe0ff', am: 'dust', ht: 'dust', pc: ['#cfd6e4', '#8a8f9c'] }],
  ['bl_solar', 'Solar', 600, 'pc', { tx: 'sun', tc: ['#ffd23a', '#ff8a1a'], mt: 0, rg: 0.5, em: '#ff8a1a', ei: 1.3, fl: [0.02, 0.006], orb: [{ k: 'spark', n: 6, r: 1.18, c: ['#ffd24a', '#ff7a1a'], sp: 1.1, s: 0.4 }], au: '#ffb000', tr: '#ffb000', lg: '#ffb04a', am: 'ember', ht: 'flare', pc: ['#ffd24a', '#ff7a1a'] }],
  ['bl_galaxia', 'Galaxia', 800, 'pc', { tx: 'galaxy', tc: ['#7a4dff', '#2fb8ff', '#ff6ad8'], mt: 0, rg: 0.3, em: '#8a7aff', ei: 0.9, fl: [0.04, 0], shell: ['#cdb8ff', 0.16], orb: [{ k: 'ring', n: 2, r: 1.3, s: 0.015, c: ['#cdb8ff', '#2fb8ff'], sp: 1, op: 0.7 }, { k: 'spark', n: 6, r: 1.35, c: '#ffffff', sp: 0.7, s: 0.14 }], au: '#8a6aff', tr: '#b04dff', lg: '#b8a0ff', am: 'star', ht: 'cosmic', pc: ['#cdb8ff', '#2fb8ff', '#ff6ad8'] }],
  ['bl_cristal', 'Cristal', 700, 'pc', { g: 'cry', tx: 'gem', tc: ['#1a5ad8', '#9fe8ff'], op: 0.92, mt: 0.05, rg: 0.04, cc: 1, em: '#4dc8ff', ei: 0.3, env: 1.8, orb: [{ k: 'shard', n: 6, r: 1.5, s: 0.1, c: '#bff3ff' }], au: '#4dc8ff', tr: '#7fe0ff', lg: '#9fe8ff', am: 'glint', ht: 'shard', pc: ['#bff3ff', '#ffffff'] }],
  ['bl_fenix', 'Fénix', 900, 'pc', { tx: 'flames', tc: ['#ffd23a', '#ff7a00', '#ff2a00'], mt: 0.1, rg: 0.5, em: '#ff7a1a', ei: 1.2, fl: [0.03, 0], orb: [{ k: 'petal', leaf: 1, n: 6, r: 1.45, s: 0.22, c: ['#ffb000', '#ff5a1f', '#ffd23a'], sp: 0.9, em: 0.9 }, { k: 'spark', n: 5, r: 1.25, c: '#ffb000', s: 0.3 }], au: '#ffa01a', tr: '#ff7a1a', lg: '#ff9a3a', am: 'ember', ht: 'flare', pc: ['#ffb000', '#ff5a1f', '#ffe08a'] }],
  ['bl_neonelite', 'Neón Élite', 700, 'pc', { tx: 'neon', tc: ['#19ffd0', '#ff3df2'], mt: 0.8, rg: 0.2, em: '#ffffff', ei: 1.2, fl: [0.04, 0], orb: [{ k: 'ring', n: 2, r: 1.22, s: 0.015, c: ['#19ffd0', '#ff3df2'], sp: 1.4 }], au: '#19ffd0', tr: '#19ffd0', lg: '#5affe0', am: 'spark', ht: 'neon', pc: ['#19ffd0', '#ff3df2'] }],
  ['bl_fuegoazul', 'Fuego Azul', 800, 'pc', { tx: 'flames', tc: ['#e8f6ff', '#19b5ff', '#1a4fff', '#04081a'], mt: 0, rg: 0.6, em: '#2fa8ff', ei: 1.2, fl: [0.03, 0], orb: [{ k: 'spark', n: 6, r: 1.25, c: ['#7fe0ff', '#2f8bff'], s: 0.3, sp: 1.1 }], au: '#2f8bff', tr: '#2f8bff', lg: '#4da8ff', am: 'ember', ht: 'flare', pc: ['#7fe0ff', '#2f8bff', '#e8f6ff'] }],
  ['bl_dragonceleste', 'Dragón Celeste', 900, 'pc', { tx: 'scales', tc: ['#2f9bff', '#bfe8ff'], mt: 0.5, rg: 0.3, em: '#19d3ff', ei: 0.3, orb: [{ k: 'dragon', n: 10, r: 1.4, c: '#7fe8ff', sp: 1.1 }], au: '#19d3ff', tr: '#7fe8ff', lg: '#7fd8ff', am: 'mote', ht: 'swirl', pc: ['#7fe8ff', '#ffffff'] }],
  ['bl_leondorado', 'León Dorado', 900, 'pc', { tx: 'lion', tc: ['#ffd24a', '#8a5a00'], bump: 1, mt: 0.9, rg: 0.28, em: '#ffb000', ei: 0.15, spin: 0.45, orb: [{ k: 'ring', n: 1, r: 1.2, s: 0.025, c: '#ffd24a', sp: 0.7 }, { k: 'spark', n: 4, r: 1.3, c: '#fff3b0', s: 0.2 }], au: '#ffc21a', tr: '#ffc21a', lg: '#ffd27a', am: 'gold', ht: 'sparkle', pc: ['#ffd24a', '#fff3b0'] }],
  ['bl_tornado', 'Tornado', 700, 'pc', { tx: 'swirl', tc: ['#e8f6ff', '#7fb0c8', '#3a5a78'], mt: 0, rg: 0.5, fl: [0.07, 0], em: '#bfe0ff', ei: 0.2, orb: [{ k: 'helix', n: 26, c: '#cfe8ff', sp: 5 }], au: '#bfe0ff', tr: '#cfe8ff', lg: '#d4ecff', am: 'wind', ht: 'swirl', pc: ['#ffffff', '#9fc8e0'] }],
  ['bl_naturaleza', 'Naturaleza', 600, 'pc', { tx: 'leaves', tc: ['#1f9a3a', '#9aff5a'], mt: 0, rg: 0.6, em: '#3dff6a', ei: 0.12, orb: [{ k: 'petal', leaf: 1, n: 6, r: 1.4, s: 0.18, c: ['#3dc85a', '#9aff5a', '#2fa84a'], sp: 0.7 }, { k: 'ring', n: 1, r: 1.15, s: 0.03, c: '#8a5a1a', sp: 0.3, op: 0.9 }], au: '#3dff6a', tr: '#3dff6a', lg: '#9affa0', am: 'leaf', ht: 'leaf', pc: ['#9aff5a', '#3dff6a'] }],
  ['bl_marea', 'Marea', 700, 'pc', { tx: 'water', tc: ['#0a4fc0', '#2fd0ff'], op: 0.88, mt: 0, rg: 0.12, cc: 1, fl: [0.03, 0.01], shell: ['#bfe8ff', 0.16], orb: [{ k: 'ring', n: 3, r: 1.25, s: 0.03, c: '#7fe0ff', sp: 1.3, op: 0.7 }], au: '#2fd0ff', tr: '#2fd0ff', lg: '#7fe0ff', am: 'bubble', ht: 'ripple', pc: ['#7fe0ff', '#ffffff'] }],
  ['bl_diamantereal', 'Diamante Real', 900, 'pc', { g: 'dia', tx: 'gem', tc: ['#ffffff', '#9fe8ff'], op: 0.95, mt: 0.1, rg: 0, cc: 1, em: '#bff3ff', ei: 0.2, env: 2.2, spin: 0.8, orb: [{ k: 'spark', n: 7, r: 1.4, c: '#ffffff', s: 0.3, sp: 0.9 }], au: '#bff3ff', tr: '#bff3ff', lg: '#e8fbff', am: 'glint', ht: 'sparkle', pc: ['#ffffff', '#bff3ff'] }],
  ['bl_energia', 'Energía', 800, 'pc', { tx: 'swirl', tc: ['#ff7aff', '#9b3dff', '#3a0a8a'], mt: 0, rg: 0.3, em: '#b04dff', ei: 1.2, fl: [0.05, 0.02], orb: [{ k: 'ring', n: 2, r: 1.22, s: 0.02, c: ['#d08aff', '#7a3dff'], sp: 1.6 }, { k: 'spark', n: 4, r: 1.3, c: '#e8c0ff', s: 0.28 }], au: '#a04dff', tr: '#b04dff', lg: '#c080ff', am: 'spark', ht: 'pulse', pc: ['#d08aff', '#ffffff'] }],
  ['bl_metalsupremo', 'Metal Supremo', 700, 'pc', { tx: 'metal', tc: ['#e8eef8', '#6a7a90', '#2fa8ff'], mt: 1, rg: 0.12, ei: 1.2, env: 1.6, orb: [{ k: 'ring', n: 1, r: 1.2, s: 0.012, c: '#2fa8ff', sp: 1 }], au: '#9fd0ff', tr: '#cfd8e8', lg: '#e8f0ff', am: 'glint', ht: 'metal', pc: ['#ffffff', '#2fa8ff'] }],
  ['bl_cibernetica', 'Cibernética', 800, 'pc', { tx: 'circuit', tc: ['#19d3ff', '#0a2a6a'], mt: 0.6, rg: 0.3, em: '#19d3ff', ei: 0.8, fl: [0.03, 0], shell: ['#19d3ff', 0.12], orb: [{ k: 'shard', geo: 'box', n: 6, r: 1.4, s: 0.06, c: '#19d3ff', sp: 0.9 }], au: '#19d3ff', tr: '#19d3ff', lg: '#4de0ff', am: 'digital', ht: 'chip', pc: ['#19d3ff', '#ffffff'] }],
  ['bl_cerezos', 'Cerezos', 600, 'pc', { tx: 'petals', tc: ['#ff9ac8', '#ffe0ee'], mt: 0, rg: 0.45, em: '#ff7ab8', ei: 0.25, orb: [{ k: 'petal', n: 8, r: 1.4, s: 0.17, c: ['#ffc0dc', '#ffffff', '#ff9ac8'], sp: 0.6 }], au: '#ff7ab8', tr: '#ff9ac8', lg: '#ffb0d4', am: 'petal', ht: 'petals', pc: ['#ffc0dc', '#ffffff'] }],
  ['bl_doradoreal', 'Dorado Real', 900, 'pc', { tx: 'metal', tc: ['#ffe08a', '#c0830a'], mt: 1, rg: 0.14, em: '#ffb000', ei: 0.12, env: 1.7, orb: [{ k: 'ring', n: 2, r: 1.22, s: 0.025, c: '#ffd24a', sp: 0.9, op: 0.85 }, { k: 'spark', n: 6, r: 1.35, c: '#fff3b0', s: 0.26 }], au: '#ffc21a', tr: '#ffc21a', lg: '#ffd27a', am: 'gold', ht: 'royal', pc: ['#ffd24a', '#fff6b0'] }],
  ['bl_estrella', 'Estrella', 700, 'pc', { tx: 'star', tc: ['#2f6bff', '#ffd23a'], op: 0.5, mt: 0.1, rg: 0.2, em: '#ffd23a', ei: 1, shell: ['#9fc0ff', 0.2], core: ['#ffe680', 0.4, 1], orb: [{ k: 'spark', n: 6, r: 1.35, c: '#ffd23a', s: 0.3, sp: 1 }], au: '#ffd23a', tr: '#ffd23a', lg: '#ffe080', am: 'star', ht: 'sparkle', pc: ['#ffd23a', '#ffffff'] }],
  ['bl_iceberg', 'Iceberg', 800, 'pc', { g: 'gem', tx: 'ice', tc: ['#e8fbff', '#7fd0ff'], op: 0.93, mt: 0, rg: 0.08, cc: 1, em: '#bfe8ff', ei: 0.2, env: 1.6, orb: [{ k: 'shard', n: 6, r: 1.45, s: 0.1, c: '#e8fbff', sp: 0.5 }], au: '#bfe8ff', tr: '#bfe8ff', lg: '#d4f4ff', am: 'snow', ht: 'frost', pc: ['#ffffff', '#bfe8ff'] }],
  ['bl_infernal', 'Infernal', 700, 'pc', { tx: 'lava', tc: ['#ff3a00', '#ff2200', '#ffb000', '#4a0c08'], bump: 1, mt: 0.1, rg: 0.7, ei: 1.3, fl: [0.015, 0], orb: [{ k: 'spark', n: 4, r: 1.25, c: '#ff7a1a', s: 0.3, sp: 1.2 }], au: '#ff2a00', tr: '#ff3a00', lg: '#ff4a1a', am: 'smoke', ht: 'inferno', pc: ['#ff3a00', '#ffb000', '#3a1a14'] }],
  ['bl_violeta', 'Violeta Místico', 700, 'pc', { tx: 'runes', tc: ['#c58aff', '#5a1fd8'], mt: 0.1, rg: 0.35, ei: 1.1, fl: [0.02, 0], orb: [{ k: 'ring', n: 2, r: 1.25, s: 0.02, c: ['#c58aff', '#8a4dff'], sp: 1.2 }, { k: 'spark', n: 5, r: 1.3, c: '#e8c0ff', s: 0.25 }], au: '#a04dff', tr: '#b57bff', lg: '#c58aff', am: 'mote', ht: 'magic', pc: ['#c58aff', '#ffffff'] }],
  ['bl_koi', 'Koi', 800, 'pc', { tx: 'water', tc: ['#19b5e6', '#e8fbff'], op: 0.55, mt: 0, rg: 0.1, cc: 1, fl: [0.02, 0.005], shell: ['#e8fbff', 0.14], orb: [{ k: 'fish', n: 3, r: 1.4, s: 0.15, c: ['#ff7a1a', '#ffffff', '#ff4a2a'], sp: 0.9 }, { k: 'bubble', n: 5, c: '#ffffff' }], au: '#4dd0ff', tr: '#7fe0ff', lg: '#9fe8ff', am: 'bubble', ht: 'ripple', pc: ['#ffffff', '#ff9a4a'] }],
  ['bl_galaxydark', 'Galaxy Dark', 900, 'pc', { tx: 'galaxy', tc: ['#5a1fd8', '#2a0a6a', '#b04dff'], mt: 0, rg: 0.3, em: '#7a3dff', ei: 0.9, fl: [-0.03, 0], shell: ['#6a3dff', 0.14], orb: [{ k: 'ring', n: 2, r: 1.3, s: 0.015, c: ['#b04dff', '#5a1fd8'], sp: 1, op: 0.7 }, { k: 'spark', n: 5, r: 1.35, c: '#b04dff', s: 0.22, sp: 0.6 }], au: '#6a2dff', tr: '#8a3dff', lg: '#a070ff', am: 'star', ht: 'cosmic', pc: ['#b04dff', '#ffffff'] }],
  ['bl_espectro', 'Espectro', 700, 'pc', { tx: 'swirl', tc: ['#ff2233', '#ffd400', '#19e68c', '#2a6bff', '#ff3df2'], op: 0.7, mt: 0, rg: 0.15, cc: 1, em: '#ffffff', ei: 0.9, fl: [0.05, 0.03], dst: 0.07, orb: [{ k: 'ring', n: 2, r: 1.22, s: 0.02, c: ['#ff3df2', '#19e6ff'], sp: 1.5 }], au: '#ffffff', tr: ['#ff2233', '#ffd400', '#19e68c', '#2a6bff', '#ff3df2'], lg: '#ffffff', am: 'glint', ht: 'wave', pc: ['#ff2233', '#ffd400', '#19e68c', '#2a6bff', '#ff3df2'] }],
  ['bl_atomica', 'Atómica', 800, 'pc', { tx: 'hex', tc: ['#7fe8ff', '#0a2a5a'], op: 0.25, mt: 0, rg: 0.1, em: '#7fe8ff', ei: 0.8, core: ['#ff6ad8', 0.3, 1], orb: [{ k: 'electron', n: 3, r: 1.3, c: '#7fe8ff', sp: 2.4 }], au: '#7fe8ff', tr: '#7fe8ff', lg: '#a0f0ff', am: 'spark', ht: 'orbit', pc: ['#7fe8ff', '#ff6ad8'] }],
  ['bl_cieloazul', 'Cielo Azul', 700, 'pc', { tx: 'clouds', tc: ['#2f8bff', '#ffffff'], mt: 0, rg: 0.5, fl: [0.015, 0], em: '#9fe0ff', ei: 0.18, orb: [{ k: 'spark', n: 4, r: 1.3, c: '#ffffff', s: 0.3, sp: 0.6 }], au: '#9fe0ff', tr: '#bfe8ff', lg: '#bfe8ff', am: 'mote', ht: 'puff', pc: ['#ffffff', '#bfe8ff'] }],
  ['bl_piedralunar', 'Piedra Lunar', 700, 'pc', { tx: 'moon', tc: ['#8a7f78', '#4a423e'], bump: 1, mt: 0, rg: 0.95, spin: 0.3, orb: [{ k: 'shard', geo: 'rock', n: 7, r: 1.5, s: 0.14, c: '#8a7f78', sp: 0.5 }], au: '#b8a8a0', tr: '#b8a8a0', lg: '#d0c4bc', am: 'dust', ht: 'dust', pc: ['#b8a8a0', '#6a625c'] }],
  ['bl_esmeraldamagica', 'Esmeralda Mágica', 900, 'pc', { g: 'cry', tx: 'gem', tc: ['#0a8a3a', '#5dffa0'], op: 0.92, mt: 0.05, rg: 0.05, cc: 1, em: '#19e68c', ei: 0.35, env: 1.6, orb: [{ k: 'ring', n: 2, r: 1.3, s: 0.03, c: '#ffd24a', sp: 0.8, op: 0.9 }, { k: 'spark', n: 5, r: 1.35, c: '#ffd24a', s: 0.25 }], au: '#ffd24a', tr: '#ffd24a', lg: '#ffe080', am: 'gold', ht: 'magic', pc: ['#ffd24a', '#5dffa0'] }],
  ['bl_futuro', 'Futuro', 50, 'gm', { tx: 'circuit', tc: ['#7fe8ff', '#ff3df2'], op: 0.5, mt: 0.8, rg: 0.2, em: '#7fe8ff', ei: 1, fl: [0.04, 0], shell: ['#7fe8ff', 0.14], core: ['#ffffff', 0.3, 1], orb: [{ k: 'ring', n: 2, r: 1.25, s: 0.012, c: ['#7fe8ff', '#ff3df2'], sp: 1.2, op: 0.9 }, { k: 'shard', geo: 'box', n: 5, r: 1.45, s: 0.05, c: '#ff3df2' }], au: '#7fe8ff', tr: '#7fe8ff', lg: '#a0f0ff', am: 'digital', ht: 'future', pc: ['#7fe8ff', '#ff3df2', '#ffffff'] }],
];
const mkBall = ([id, name, price, cur, v]) => ({ id, cat: 'bl', name, [cur]: price, rar: cur === 'gm' ? 4 : price >= 900 ? 3 : price >= 700 ? 2 : 1, cols: [v.au || '#ffffff', typeof v.tr === 'string' ? v.tr : '#9fc0ff'], st: '', v });
const BALL_ITEMS = BALLS.map(mkBall);

/* ---------------------------------------------------------------- 15 MESAS 3D NUEVAS  [id, nombre, precio, moneda, v]
   v: tx dibujo de la superficie · tc colores · ac color del borde · sl color del cuerpo · sm metal del cuerpo · ug luz de abajo · go fuerza del brillo animado · fl [u,v] movimiento del brillo
      rp 'rainbow' = borde que cambia de color · am partículas del ambiente (AMB en balls3d.js) · pc colores de las partículas
      pr piezas 3D en los bordes: {k:'flame'|'crystal'|'ring'|'bolt'|'leaf', n cantidad, c color, h altura}
   Para agregar una mesa nueva: copia una línea y cambia los datos. */
const TABLES = [
  ['tb_volcanica', 'Volcánica', 1200, 'pc', { tx: 'lava', tc: ['#ff7a1a', '#ff2200', '#fff2b0'], ac: '#ff5a1f', sl: '#120806', ug: '#ff4a10', go: 0.8, fl: [0.01, 0], am: 'ember', pc: ['#ff7a1a', '#ffb000'], pr: [{ k: 'flame', n: 14, c: '#ff6a1a', h: 0.9 }] }],
  ['tb_oceano', 'Océano', 1000, 'pc', { tx: 'water', tc: ['#0a63d8', '#19d3ff'], ac: '#19d3ff', sl: '#06204a', ug: '#19b5ff', go: 0.4, fl: [0.02, 0.006], am: 'bubble', pc: ['#bfe8ff', '#ffffff'], pr: [{ k: 'crystal', n: 10, c: '#7fe0ff', h: 0.45 }] }],
  ['tb_neoncyber', 'Neón Cyber', 1100, 'pc', { tx: 'neon', tc: ['#ff3df2', '#19e6ff'], ac: '#ff3df2', sl: '#0a0618', ug: '#b04dff', go: 0.9, fl: [0.04, 0], am: 'spark', pc: ['#ff3df2', '#19e6ff'], pr: [{ k: 'bolt', n: 3, c: '#19e6ff' }] }],
  ['tb_galaxia', 'Galaxia', 1300, 'pc', { tx: 'galaxy', tc: ['#7a4dff', '#2fb8ff', '#ff6ad8'], ac: '#b04dff', sl: '#0a0630', ug: '#7a4dff', go: 0.8, fl: [0.03, 0], am: 'star', pc: ['#ffffff', '#b8a0ff'], pr: [{ k: 'ring', n: 5, c: '#c58aff' }] }],
  ['tb_hielo', 'Hielo', 1000, 'pc', { tx: 'ice', tc: ['#e8fbff', '#7fd0ff'], ac: '#bfe8ff', sl: '#4a82b8', sm: 0.3, ug: '#9fe8ff', go: 0.3, am: 'snow', pc: ['#ffffff', '#bfe8ff'], pr: [{ k: 'crystal', n: 12, c: '#e8fbff', h: 0.6 }] }],
  ['tb_doradoreal', 'Dorado Real', 1500, 'pc', { tx: 'royal', tc: ['#8a5a00', '#ffe08a'], ac: '#ffc21a', sl: '#4a3200', sm: 1, ug: '#ffc21a', go: 0.5, am: 'gold', pc: ['#ffd24a', '#fff6b0'], pr: [{ k: 'ring', n: 4, c: '#ffd24a' }] }],
  ['tb_tormenta', 'Tormenta', 1100, 'pc', { tx: 'storm', tc: ['#c8b8ff'], ac: '#a890ff', sl: '#12141f', sm: 0.9, ug: '#8a6aff', go: 0.9, am: 'spark', pc: ['#d6c8ff', '#ffffff'], pr: [{ k: 'bolt', n: 5, c: '#d6c8ff' }] }],
  ['tb_bosque', 'Bosque Místico', 1000, 'pc', { tx: 'leaves', tc: ['#1f9a3a', '#9aff5a'], ac: '#3dff6a', sl: '#2a1a0a', ug: '#3dff6a', go: 0.35, am: 'leaf', pc: ['#9aff5a', '#3dff6a'], pr: [{ k: 'leaf', n: 14, c: '#3dc85a' }, { k: 'crystal', n: 4, c: '#9aff5a', h: 0.35 }] }],
  ['tb_cristal', 'Cristal', 1400, 'pc', { tx: 'gem', tc: ['#7fd8ff', '#e8fbff'], ac: '#9fe8ff', sl: '#6aaad8', sm: 0.1, ug: '#7fd8ff', go: 0.3, am: 'glint', pc: ['#ffffff', '#bff3ff'], pr: [{ k: 'crystal', n: 14, c: '#bff3ff', h: 0.5 }] }],
  ['tb_espacial', 'Espacial', 1300, 'pc', { tx: 'space', tc: ['#2f6bff', '#ffc21a'], ac: '#ffc21a', sl: '#0a1240', ug: '#ffc21a', go: 0.7, fl: [0.02, 0], am: 'star', pc: ['#ffffff', '#ffd24a'], pr: [{ k: 'ring', n: 6, c: '#ffc21a' }] }],
  ['tb_fuegoazul', 'Fuego Azul', 1200, 'pc', { tx: 'flames', tc: ['#e8f6ff', '#19b5ff', '#1a4fff', '#04081a'], ac: '#2f8bff', sl: '#06102a', ug: '#2f8bff', go: 0.8, fl: [0.03, 0], am: 'ember', pc: ['#7fe0ff', '#2f8bff'], pr: [{ k: 'flame', n: 14, c: '#2f8bff', h: 0.9 }] }],
  ['tb_aurora', 'Aurora', 50, 'gm', { tx: 'aurora', tc: ['#19ffa0', '#2f8bff', '#b04dff'], ac: '#19ffa0', rp: 'rainbow', sl: '#06182a', ug: '#19ffa0', go: 0.6, fl: [0.03, 0.01], am: 'mote', pc: ['#19ffa0', '#2f8bff', '#b04dff'], pr: [{ k: 'ring', n: 4, c: '#2f8bff' }] }],
  ['tb_cibernetica', 'Cibernética', 1100, 'pc', { tx: 'circuit', tc: ['#19d3ff', '#0a2a6a'], ac: '#19d3ff', sl: '#06101e', sm: 0.9, ug: '#19d3ff', go: 0.8, fl: [0.04, 0], am: 'digital', pc: ['#19d3ff', '#ffffff'], pr: [{ k: 'bolt', n: 3, c: '#19d3ff' }] }],
  ['tb_lunar', 'Lunar', 900, 'pc', { tx: 'moon', tc: ['#cfd6e4', '#7d8798'], ac: '#bcd4ff', sl: '#3a3f4a', ug: '#bcd4ff', go: 0.1, am: 'dust', pc: ['#cfd6e4', '#8a8f9c'], pr: [{ k: 'crystal', n: 8, c: '#9aa4b8', h: 0.3 }] }],
  ['tb_imperio', 'Imperio', 60, 'gm', { tx: 'royal', tc: ['#0a0805', '#ffc21a'], ac: '#ffc21a', sl: '#0a0805', sm: 1, ug: '#ffc21a', go: 0.6, am: 'gold', pc: ['#ffd24a', '#fff6b0'], pr: [{ k: 'ring', n: 5, c: '#ffc21a' }] }],
];
const BALL_ITEMS_T = TABLES.map(([id, name, price, cur, v]) => ({ id, cat: 'tb', name, [cur]: price, cols: [v.sl, v.ac], st: '', acc: v.ac, v }));

/* ---------------------------------------------------------------- 10 EFECTOS ESPECIALES DE GOLPE  [id, nombre, precio, moneda, v]
   v: pc colores de partículas · n cantidad · sp velocidad · up altura · rings [{c color, big tamaño, d retraso, up sube}] · beams {n, c, h} rayos de luz
      rays {n, c} rayos planos · shards {n, c, sz} fragmentos 3D · flash {c, sz} destello · streak {c} cometa · tr colores de la estela de la pelota
   Para agregar un efecto nuevo: copia una línea y cambia los datos. Se reproduce con el mismo reproductor (effects3d.js). */
const FXS = [
  ['fx_impacto', 'Impacto de Energía', 1200, 'pc', { pc: ['#ffb000', '#ff7a1a', '#fff3b0'], n: 22, sp: 2.6, up: 2.4, rings: [{ c: '#ffb000', big: 1.2 }, { c: '#ff7a1a', big: 1.9, d: 0.07 }, { c: '#ffffff', big: 0.7, d: 0.14 }], beams: { n: 8, c: '#ffd24a', h: 0.7 }, flash: { c: '#ffcc66', sz: 1.1 } }],
  ['fx_onda', 'Onda de Choque', 1300, 'pc', { pc: ['#7fd8ff', '#ffffff', '#2f8bff'], n: 18, sp: 3.6, up: 0.5, rings: [{ c: '#19d3ff', big: 1.6 }, { c: '#ffffff', big: 0.9, d: 0.05 }, { c: '#2f8bff', big: 2.2, d: 0.12 }], rays: { n: 12, c: '#7fd8ff' }, flash: { c: '#7fd8ff', sz: 1 } }],
  ['fx_rastro', 'Rastro Luminoso', 1100, 'pc', { pc: ['#ff6ad8', '#b04dff', '#ffffff'], n: 16, sp: 2, up: 1, rings: [{ c: '#b04dff', big: 0.9 }], streak: { c: '#ff6ad8' }, tr: ['#ff6ad8', '#b04dff', '#7a3dff'] }],
  ['fx_chispas', 'Chispas', 800, 'pc', { pc: ['#ffb000', '#ff7a1a', '#fff3b0'], n: 44, sp: 4, up: 2.6, rings: [], flash: { c: '#ffb000', sz: 0.6 } }],
  ['fx_anillo', 'Anillo de Energía', 1200, 'pc', { pc: ['#ff2d2d', '#ff7a1a'], n: 14, sp: 2, up: 1.4, rings: [{ c: '#ff2d2d', big: 1.5 }, { c: '#ff7a1a', big: 1.1, d: 0.06, up: 1 }, { c: '#ff2d2d', big: 0.8, d: 0.14, up: 1 }] }],
  ['fx_cristal', 'Fragmentos de Cristal', 1400, 'pc', { pc: ['#bff3ff', '#ffffff', '#7fd8ff'], n: 14, sp: 2.4, up: 2, rings: [{ c: '#7fd8ff', big: 0.8 }], shards: { n: 12, c: '#9fe8ff', sz: 0.07 }, flash: { c: '#bff3ff', sz: 0.7 } }],
  ['fx_elemental', 'Partículas Elementales', 1500, 'pc', { pc: ['#ff7a1a', '#2fa8ff', '#3dff6a', '#ffffff'], n: 32, sp: 2.6, up: 3, rings: [{ c: '#ff7a1a', big: 0.8 }, { c: '#2fa8ff', big: 1.1, d: 0.07 }, { c: '#3dff6a', big: 1.4, d: 0.14 }] }],
  ['fx_pulso', 'Pulso de Luz', 1300, 'pc', { pc: ['#b04dff', '#e8c0ff', '#ffffff'], n: 16, sp: 2, up: 1.6, rings: [{ c: '#b04dff', big: 1 }, { c: '#e8c0ff', big: 1.6, d: 0.1 }, { c: '#ffffff', big: 2.2, d: 0.2 }], beams: { n: 6, c: '#c58aff', h: 0.9 } }],
  ['fx_cosmica', 'Explosión Cósmica', 40, 'gm', { pc: ['#ffffff', '#7fb0ff', '#b04dff', '#ff6ad8'], n: 40, sp: 3.4, up: 2, rings: [{ c: '#7fb0ff', big: 1.8 }, { c: '#b04dff', big: 1.2, d: 0.08 }], rays: { n: 14, c: '#ffffff' }, flash: { c: '#ffffff', sz: 1.4 } }],
  ['fx_legendario', 'Efecto Legendario', 60, 'gm', { pc: ['#ffd24a', '#fff3b0', '#ffffff'], n: 38, sp: 3, up: 3.4, rings: [{ c: '#ffc21a', big: 1.6 }, { c: '#fff3b0', big: 1, d: 0.08 }], beams: { n: 9, c: '#ffe08a', h: 1 }, flash: { c: '#ffe08a', sz: 1.5 } }],
];
const FX_ITEMS = FXS.map(([id, name, price, cur, v]) => ({ id, cat: 'fx', name, [cur]: price, cols: v.pc, v }));

export const ITEMS = [
  ...PAD_ITEMS,
  /* ---- pelotas: las 12 de siempre (colores + dibujo 2D sobre esfera) y las 40 nuevas 3D ---- */
  { id: 'bl_white', cat: 'bl', n: 'it_bl_white', pc: 0, cols: ['#ffffff', '#9fc0ff'], st: '' },
  { id: 'bl_orange', cat: 'bl', n: 'it_bl_orange', pc: 100, cols: ['#ff8a1a', '#ffd9a0'], st: 'r' },
  { id: 'bl_fire', cat: 'bl', n: 'it_bl_fire', pc: 250, cols: ['#ff3a1a', '#ffd400'], st: 'f' },
  { id: 'bl_ice', cat: 'bl', n: 'it_bl_ice', pc: 250, cols: ['#9fe8ff', '#ffffff'], st: 'i' },
  { id: 'bl_star', cat: 'bl', n: 'it_bl_star', pc: 300, cols: ['#ffd400', '#fff6b0'], st: 'e' },
  { id: 'bl_heart', cat: 'bl', n: 'it_bl_heart', pc: 300, cols: ['#ff4d8d', '#ffd0e0'], st: 'c' },
  { id: 'bl_neon', cat: 'bl', n: 'it_bl_neon', pc: 450, cols: ['#19e6a0', '#00ffd0'], st: 'n' },
  { id: 'bl_planet', cat: 'bl', n: 'it_bl_planet', pc: 600, cols: ['#4d7bff', '#ffd9a0'], st: 'p' },
  { id: 'bl_diamond', cat: 'bl', n: 'it_bl_diamond', pc: 800, cols: ['#bff3ff', '#2fb8ff'], st: 'd' },
  { id: 'bl_sun', cat: 'bl', n: 'it_bl_sun', pc: 900, cols: ['#ffc21a', '#ff7a00'], st: 's' },
  { id: 'bl_rainbow', cat: 'bl', n: 'it_bl_rainbow', gm: 30, cols: ['#ffffff', '#ffffff'], st: 'a' },
  { id: 'bl_void', cat: 'bl', n: 'it_bl_void', gm: 45, cols: ['#5b00ff', '#00e5ff'], st: 'n' },
  ...BALL_ITEMS,                                   /* 40 pelotas 3D nuevas (diseño en la tabla BALLS) */
  /* ---- mesas ---- */
  { id: 'tb_blue', cat: 'tb', n: 'it_tb_blue', pc: 0, cols: ['#0a1a6a', '#2a6bff'], st: 'hex', acc: '#2f7bff' },
  { id: 'tb_green', cat: 'tb', n: 'it_tb_green', pc: 150, cols: ['#04442a', '#19c78a'], st: '', acc: '#19e6a0' },
  { id: 'tb_red', cat: 'tb', n: 'it_tb_red', pc: 200, cols: ['#4a0610', '#e0243a'], st: 'diag', acc: '#ff2d4f' },
  { id: 'tb_violet', cat: 'tb', n: 'it_tb_violet', pc: 250, cols: ['#2a0a5a', '#8b3dff'], st: 'circles', acc: '#b57bff' },
  { id: 'tb_black', cat: 'tb', n: 'it_tb_black', pc: 300, cols: ['#050505', '#2a2a36'], st: 'dots', acc: '#e8f0ff' },
  { id: 'tb_ocean', cat: 'tb', n: 'it_tb_ocean', pc: 400, cols: ['#02305a', '#19b5e6'], st: 'waves', acc: '#19d3ff' },
  { id: 'tb_gold', cat: 'tb', n: 'it_tb_gold', pc: 600, cols: ['#4a3200', '#e8a10c'], st: 'hex', acc: '#ffc21a' },
  { id: 'tb_galaxy', cat: 'tb', n: 'it_tb_galaxy', pc: 750, cols: ['#0a0230', '#6a1fd8'], st: 'stars', acc: '#ff3df2' },
  { id: 'tb_candy', cat: 'tb', n: 'it_tb_candy', gm: 30, cols: ['#ff5aa5', '#ffd0e6'], st: 'dots', acc: '#ff3df2' },
  { id: 'tb_lava', cat: 'tb', n: 'it_tb_lava', gm: 40, cols: ['#2a0000', '#ff4a00'], st: 'waves', acc: '#ffb000' },
  ...BALL_ITEMS_T,                                 /* 15 mesas 3D nuevas (tabla TABLES) */
  /* ---- efectos de golpe ---- */
  { id: 'fx_std', cat: 'fx', n: 'it_fx_std', pc: 0, cols: [] },
  { id: 'fx_gold', cat: 'fx', n: 'it_fx_gold', pc: 200, cols: ['#ffd400', '#fff6b0', '#ffb000'] },
  { id: 'fx_ice', cat: 'fx', n: 'it_fx_ice', pc: 250, cols: ['#9fe8ff', '#ffffff', '#4dc8ff'] },
  { id: 'fx_fire', cat: 'fx', n: 'it_fx_fire', pc: 300, cols: ['#ff3a1a', '#ff9a1a', '#ffd400'] },
  { id: 'fx_toxic', cat: 'fx', n: 'it_fx_toxic', pc: 400, cols: ['#7cff1a', '#19e6a0', '#e8ff9a'] },
  { id: 'fx_royal', cat: 'fx', n: 'it_fx_royal', pc: 600, cols: ['#9b4dff', '#ff3df2', '#ffffff'] },
  { id: 'fx_rainbow', cat: 'fx', n: 'it_fx_rainbow', gm: 25, cols: ['#ff2233', '#ffd400', '#19e68c', '#2a6bff', '#ff3df2'] },
  { id: 'fx_galaxy', cat: 'fx', n: 'it_fx_galaxy', gm: 35, cols: ['#5b00ff', '#00e5ff', '#ffffff', '#ff3df2'] },
  ...FX_ITEMS,                                     /* 10 efectos especiales nuevos (tabla FXS) */
  /* ---- potenciadores (se gastan) ---- */
  { id: 'pw_shield', cat: 'pw', n: 'it_pw_shield', gm: 6, ic: '🛡️', d: 'it_pw_shield_d' },
  { id: 'pw_boost', cat: 'pw', n: 'it_pw_boost', gm: 6, ic: '🚀', d: 'it_pw_boost_d' },
];
export const item = (id) => ITEMS.find((x) => x.id === id);
export const DEFAULT_EQ = { pad: 'pd_clasica', bl: 'bl_white', tb: 'tb_blue', fx: 'fx_std' };

/* resuelve lo equipado a los datos que necesita el renderizador 3D (oppPadId = paleta del rival en línea) */
export function lookFor(eq, owned, oppPadId) {
  const g = (cat) => { const id = eq && eq[cat]; const it = item(id); return it && it.cat === cat && (it.pc === 0 || (owned || []).includes(id)) ? it : item(DEFAULT_EQ[cat]); };
  const p = g('pad'), b = g('bl'), t = g('tb'), f = g('fx');
  const op = item(oppPadId); const oppPad = op && op.cat === 'pad' ? op : RIVAL_PAD;
  return { padCol: p.col, pad: p, oppPad, ball: b, ballCols: b.cols, ballStyle: b.st, table: t, fxItem: f, tableCols: t.cols, tableStyle: t.st, tableAccent: t.acc, fxCols: f.cols };
}

/* paletas viejas (de color): se quitan del inventario y se devuelve lo que costaron */
const OLD_PADS = { pad_red: [0, 0], pad_cyan: [120, 0], pad_green: [120, 0], pad_gold: [300, 0], pad_violet: [300, 0], pad_pink: [350, 0], pad_orange: [350, 0], pad_lime: [500, 0], pad_white: [600, 0], pad_ice: [800, 0], pad_plasma: [0, 25], pad_royal: [0, 40] };
export function migratePads(p) {
  let pc = 0, gm = 0, any = false;
  if (Array.isArray(p.inv)) p.inv = p.inv.filter((id) => { const o = OLD_PADS[id]; if (!o) return true; pc += o[0]; gm += o[1]; any = true; return false; });
  if (p.eq && OLD_PADS[p.eq.pad]) { p.eq.pad = ''; any = true; }
  if (!any) return null;
  p.pc = (p.pc || 0) + pc; p.gems = (p.gems || 0) + gm;
  return { pc, gm };
}
