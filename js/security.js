/* security.js · protecciones del lado del navegador.
   IMPORTANTE: esto solo "tapa" lo básico (menú, atajos, copia). La seguridad REAL
   de tus datos está en firestore.rules (ver LEEME.md). */

/* 1) El juego solo corre en tu página (si alguien copia el código a otro dominio, se apaga) */
const OK_HOSTS = ['martinezdonauri69-pixel.github.io', 'localhost', '127.0.0.1'];
if (!OK_HOSTS.includes(location.hostname)) {
  document.documentElement.innerHTML = '';
  throw new Error('host');
}

/* 2) No se puede meter el juego dentro de otra página (anti-clickjacking) */
try { if (window.top !== window.self) window.top.location = window.self.location; } catch (e) { document.documentElement.innerHTML = ''; }

const inField = (e) => e.target && e.target.closest && e.target.closest('input,textarea');

/* 3) Clic derecho = clic izquierdo, y NUNCA sale el menú del navegador */
document.addEventListener('contextmenu', (e) => { if (!inField(e)) e.preventDefault(); }, true);
let rd = null;
addEventListener('pointerdown', (e) => {
  if (e.pointerType === 'mouse' && e.button === 2) rd = e.target;
}, true);
addEventListener('pointerup', (e) => {
  if (e.pointerType !== 'mouse' || e.button !== 2) return;
  const tg = rd; rd = null;
  if (!tg || tg !== e.target || inField(e)) return;
  if (tg.tagName === 'CANVAS') return; /* el juego ya trata cualquier botón como toque */
  const b = tg.closest && tg.closest('button,a,[data-act],.tap,.tile,.li');
  if (b) { e.preventDefault(); b.click(); }
}, true);
/* auxclick (botón del medio / derecho) tampoco hace nada raro */
document.addEventListener('auxclick', (e) => { if (!inField(e)) e.preventDefault(); }, true);

/* 4) Sin atajos de inspección / guardar / ver código */
document.addEventListener('keydown', (e) => {
  const k = (e.key || '').toLowerCase(), c = e.ctrlKey || e.metaKey;
  if (k === 'f12' || (c && ['u', 's', 'p'].includes(k)) || (c && e.shiftKey && ['i', 'j', 'c', 'k'].includes(k)) || (e.metaKey && e.altKey && ['i', 'u', 'j', 'c'].includes(k))) {
    e.preventDefault(); e.stopPropagation(); return false;
  }
}, true);

/* 5) Sin arrastrar, seleccionar ni copiar fuera de los campos de texto */
['dragstart', 'selectstart', 'copy', 'cut'].forEach((ev) =>
  document.addEventListener(ev, (e) => { if (!inField(e)) e.preventDefault(); }, true));

/* 6) Sin zoom con gestos / doble toque */
['gesturestart', 'gesturechange', 'gestureend'].forEach((ev) => document.addEventListener(ev, (e) => e.preventDefault()));
document.addEventListener('wheel', (e) => { if (e.ctrlKey) e.preventDefault(); }, { passive: false });
