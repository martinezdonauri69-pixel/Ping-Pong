/* i18n.js · idiomas del juego.
   - t('clave', {n: 5})  → texto en el idioma activo (si falta, usa español).
   - En el HTML: data-i="clave"  (texto) · data-i-ph="clave" (placeholder) · data-i-ti="clave" (title).
   - Al cambiar de idioma se vuelve a pintar TODO el juego (evento 'lang'). */
import { ls, bus } from './util.js';

export const LANGS = [
  ['es', 'Español', '🇪🇸'], ['en', 'English', '🇬🇧'], ['pt', 'Português', '🇧🇷'], ['fr', 'Français', '🇫🇷'],
  ['de', 'Deutsch', '🇩🇪'], ['it', 'Italiano', '🇮🇹'], ['ru', 'Русский', '🇷🇺'], ['ar', 'العربية', '🇸🇦'],
  ['zh', '中文', '🇨🇳'], ['ja', '日本語', '🇯🇵'], ['ko', '한국어', '🇰🇷'], ['hi', 'हिन्दी', '🇮🇳'],
];
const RTL = ['ar'];
const dicts = {};
let cur = 'es';

async function load(code) {
  if (dicts[code]) return dicts[code];
  try { dicts[code] = (await import('./lang/' + code + '.js')).default; }
  catch (e) { console.warn('idioma no disponible:', code); dicts[code] = {}; }
  return dicts[code];
}

export const lang = () => cur;

export function t(key, p) {
  let s = (dicts[cur] && dicts[cur][key]) ?? (dicts.es && dicts.es[key]) ?? key;
  if (p) s = s.replace(/\{(\w+)\}/g, (m, k) => (p[k] ?? m));
  return s;
}

/* traduce todos los elementos con data-i dentro de root */
export function applyDom(root = document) {
  root.querySelectorAll('[data-i]').forEach((e) => { e.textContent = t(e.dataset.i); });
  root.querySelectorAll('[data-i-ph]').forEach((e) => { e.placeholder = t(e.dataset.iPh); });
  root.querySelectorAll('[data-i-ti]').forEach((e) => { e.title = t(e.dataset.iTi); e.setAttribute('aria-label', e.title); });
}

export async function setLang(code, silent) {
  if (!LANGS.some((l) => l[0] === code)) code = 'es';
  await load('es'); await load(code);
  cur = code;
  document.documentElement.lang = code;
  document.documentElement.dir = RTL.includes(code) ? 'rtl' : 'ltr';
  ls.set('dmr2_lang', code);
  applyDom();
  if (!silent) bus.emit('lang', code);
}

export async function initLang() {
  let c = ls.get('dmr2_lang', null);
  if (!c) { c = (navigator.language || 'es').slice(0, 2).toLowerCase(); }
  await setLang(c, true);
}
