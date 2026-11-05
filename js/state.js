/* state.js · ajustes del teléfono y perfil del jugador (se guardan en el teléfono y, si hay cuenta, también en la nube) */
import { ls, bus, genId, clamp } from './util.js';

/* ---------- Ajustes del dispositivo ---------- */
export const SET = Object.assign({ snd: true, mus: 55, sfx: 80, br: 100, vib: true, hq: true, theme: 0 }, ls.get('dmr2_set', {}));
export const saveSet = () => ls.set('dmr2_set', SET);
export const THEMES = [
  { k: 'th_0', a: '#ff2d4f', b: '#2f7bff' }, { k: 'th_1', a: '#19e6a0', b: '#19d3ff' },
  { k: 'th_2', a: '#ff3df2', b: '#8b3dff' }, { k: 'th_3', a: '#ffc21a', b: '#ff5a1f' },
];
export function applyLook() {
  const th = THEMES[SET.theme] || THEMES[0], r = document.documentElement.style;
  r.setProperty('--a', th.a); r.setProperty('--b', th.b);
  document.body.style.filter = SET.br === 100 ? '' : 'brightness(' + SET.br / 100 + ')';
}

/* ---------- Perfil ---------- */
export const XP_PER_LV = 500;
const DEF = () => ({
  id: '', name: 'PLAYER', nameSet: false, xp: 0, av: 0, photo: '', card: 0, stars: 0,
  pc: 0, gems: 0, rp: 0, streak: 0, bestStreak: 0, w: 0, l: 0, rw: 0, rl: 0, games: 0, shut: 0, hardWins: 0,
  inv: [], eq: { pad: '', bl: '', tb: '', fx: '' }, ach: {}, msn: null, daily: { last: '', n: 0 },
  shield: 0, boost: 0, tuto: false, pcDay: { d: '', n: 0 }, ver: false,
});
export const P = DEF();
export const acct = { uid: null, guest: true };   /* lo llena net.js */

const key = () => 'dmr2_p_' + (acct.guest ? 'guest' : P.id || 'x');
export function loadLocal(id) {
  const k = 'dmr2_p_' + (id || 'guest');
  const d = ls.get(k, null);
  Object.keys(P).forEach((x) => delete P[x]);
  Object.assign(P, DEF(), d || {});
  P.eq = Object.assign({ pad: '', bl: '', tb: '', fx: '' }, P.eq || {});
  if (!P.id) P.id = genId();
  bus.emit('profile');
}
export function applyRemote(d) {
  const dd = DEF();
  const m = { id: d.id, name: d.name, nameSet: !!d.nameSet, xp: d.xp, av: d.av, card: d.card, stars: d.stars, pc: d.pc, gems: d.gems, rp: d.rp,
    streak: d.streak, w: d.w, l: d.l, inv: d.inv, eq: d.eq, ach: d.ach, msn: d.msn, daily: d.daily, shield: d.shield, boost: d.boost,
    rw: d.rw, rl: d.rl, games: d.games, bestStreak: d.bestStreak, shut: d.shut, hardWins: d.hardWins, ver: d.ver === true };
  Object.keys(m).forEach((k) => { if (m[k] !== undefined && m[k] !== null) P[k] = m[k]; else if (P[k] === undefined) P[k] = dd[k]; });
  P.eq = Object.assign({ pad: '', bl: '', tb: '', fx: '' }, P.eq || {});
  if (!Array.isArray(P.inv)) P.inv = [];
  ls.set(key(), P);
  bus.emit('profile');
}
let st = 0;
export function save() {
  ls.set(key(), P);
  clearTimeout(st); st = setTimeout(() => bus.emit('cloud'), 700);
  bus.emit('profile');
}

/* nivel de perfil (lo único que queda de "niveles"): sube con XP */
export const lvl = () => clamp(Math.floor((P.xp || 0) / XP_PER_LV) + 1, 1, 100);
export const lvProg = () => (lvl() >= 100 ? 1 : ((P.xp || 0) % XP_PER_LV) / XP_PER_LV);
export function addXp(n) {
  const a = lvl(); P.xp = Math.max(0, (P.xp || 0) + n);
  return lvl() > a ? lvl() : 0;
}
export const effAv = () => (P.av || 0);

/* lo que se sube a la nube (solo campos que las reglas permiten escribir al dueño) */
export function cloudDoc() {
  return {
    uid: acct.uid, id: P.id, name: P.name, nameSet: !!P.nameSet, av: P.av || 0, card: P.card || 0, level: lvl(), xp: P.xp || 0,
    stars: P.stars || 0, w: P.w || 0, l: P.l || 0, rp: P.rp || 0, pc: P.pc || 0, gems: P.gems || 0, streak: P.streak || 0, bestStreak: P.bestStreak || 0,
    rw: P.rw || 0, rl: P.rl || 0, games: P.games || 0, shut: P.shut || 0, hardWins: P.hardWins || 0,
    inv: P.inv || [], eq: P.eq || {}, ach: P.ach || {}, msn: P.msn || null, daily: P.daily || {}, shield: P.shield || 0, boost: P.boost || 0,
  };
}
