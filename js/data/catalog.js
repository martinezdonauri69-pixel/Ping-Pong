/* catalog.js · todo lo que se vende en la tienda.
   Cada artículo: { id, cat, n:(clave de idioma), pc:(precio en monedas) | gm:(precio en gemas), ...apariencia } */
export const CATS = ['pad', 'bl', 'tb', 'fx', 'pw'];

export const ITEMS = [
  /* ---- paletas (color) ---- */
  { id: 'pad_red', cat: 'pad', n: 'it_pad_red', pc: 0, col: '#ff2d4f' },
  { id: 'pad_cyan', cat: 'pad', n: 'it_pad_cyan', pc: 120, col: '#19d3ff' },
  { id: 'pad_green', cat: 'pad', n: 'it_pad_green', pc: 120, col: '#19e6a0' },
  { id: 'pad_gold', cat: 'pad', n: 'it_pad_gold', pc: 300, col: '#ffc21a' },
  { id: 'pad_violet', cat: 'pad', n: 'it_pad_violet', pc: 300, col: '#9b4dff' },
  { id: 'pad_pink', cat: 'pad', n: 'it_pad_pink', pc: 350, col: '#ff3df2' },
  { id: 'pad_orange', cat: 'pad', n: 'it_pad_orange', pc: 350, col: '#ff7a1a' },
  { id: 'pad_lime', cat: 'pad', n: 'it_pad_lime', pc: 500, col: '#b6ff1a' },
  { id: 'pad_white', cat: 'pad', n: 'it_pad_white', pc: 600, col: '#e8f0ff' },
  { id: 'pad_ice', cat: 'pad', n: 'it_pad_ice', pc: 800, col: '#9fe8ff' },
  { id: 'pad_plasma', cat: 'pad', n: 'it_pad_plasma', gm: 25, col: '#ff00aa' },
  { id: 'pad_royal', cat: 'pad', n: 'it_pad_royal', gm: 40, col: '#ffe14d' },
  /* ---- pelotas (colores + dibujo) ---- */
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
  /* ---- efectos de golpe ---- */
  { id: 'fx_std', cat: 'fx', n: 'it_fx_std', pc: 0, cols: [] },
  { id: 'fx_gold', cat: 'fx', n: 'it_fx_gold', pc: 200, cols: ['#ffd400', '#fff6b0', '#ffb000'] },
  { id: 'fx_ice', cat: 'fx', n: 'it_fx_ice', pc: 250, cols: ['#9fe8ff', '#ffffff', '#4dc8ff'] },
  { id: 'fx_fire', cat: 'fx', n: 'it_fx_fire', pc: 300, cols: ['#ff3a1a', '#ff9a1a', '#ffd400'] },
  { id: 'fx_toxic', cat: 'fx', n: 'it_fx_toxic', pc: 400, cols: ['#7cff1a', '#19e6a0', '#e8ff9a'] },
  { id: 'fx_royal', cat: 'fx', n: 'it_fx_royal', pc: 600, cols: ['#9b4dff', '#ff3df2', '#ffffff'] },
  { id: 'fx_rainbow', cat: 'fx', n: 'it_fx_rainbow', gm: 25, cols: ['#ff2233', '#ffd400', '#19e68c', '#2a6bff', '#ff3df2'] },
  { id: 'fx_galaxy', cat: 'fx', n: 'it_fx_galaxy', gm: 35, cols: ['#5b00ff', '#00e5ff', '#ffffff', '#ff3df2'] },
  /* ---- potenciadores (se gastan) ---- */
  { id: 'pw_shield', cat: 'pw', n: 'it_pw_shield', gm: 6, ic: '🛡️', d: 'it_pw_shield_d' },
  { id: 'pw_boost', cat: 'pw', n: 'it_pw_boost', gm: 6, ic: '🚀', d: 'it_pw_boost_d' },
];
export const item = (id) => ITEMS.find((x) => x.id === id);
export const DEFAULT_EQ = { pad: 'pad_red', bl: 'bl_white', tb: 'tb_blue', fx: 'fx_std' };

/* resuelve lo equipado a los datos que necesita el renderizador 3D */
export function lookFor(eq, owned) {
  const g = (cat) => { const id = eq && eq[cat]; const it = item(id); return it && (it.pc === 0 || (owned || []).includes(id)) ? it : item(DEFAULT_EQ[cat]); };
  const p = g('pad'), b = g('bl'), t = g('tb'), f = g('fx');
  return { padCol: p.col, ballCols: b.cols, ballStyle: b.st, tableCols: t.cols, tableStyle: t.st, tableAccent: t.acc, fxCols: f.cols };
}
