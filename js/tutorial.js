/* tutorial.js · tutorial guiado: oscurece todo menos el botón que toca usar, lo hace brillar y lo señala con un dedito.
   Mientras dura cada paso NO se puede tocar ninguna otra parte de la pantalla. */
import { t } from './i18n.js';
import { P, save } from './state.js';
import { $, esc, sfx, toast } from './util.js';
import { matchRef, gameInfo, endPractice } from './game.js';

let root = null, raf = 0, cur = null, poll = 0, ctxG = null, running = false;
export const isRunning = () => running;

function ensure() {
  if (root) return root;
  root = document.createElement('div'); root.id = 'tuto';
  root.innerHTML = '<i class="tb" data-s="t"></i><i class="tb" data-s="b"></i><i class="tb" data-s="l"></i><i class="tb" data-s="r"></i><i class="tring"></i><span class="tfinger">👆</span><div class="tbub"></div>';
  $('app').appendChild(root); layout(); return root;
}
const q = (s) => root.querySelector(s);

/* coloca el agujero, el aro, el dedito y la burbuja según la posición actual del botón */
function layout() {
  raf = requestAnimationFrame(layout);
  if (!root || !cur) return;
  const W = innerWidth, H = innerHeight, bub = q('.tbub'), fing = q('.tfinger'), ring = q('.tring');
  if (!cur.el) {                                      /* paso sin botón: todo oscuro y burbuja al centro */
    ['t', 'b', 'l', 'r'].forEach((k) => { const e = q('[data-s=' + k + ']'); Object.assign(e.style, { left: 0, top: 0, width: k === 't' || k === 'b' ? '100%' : 0, height: k === 't' ? '100%' : 0 }); });
    ring.style.display = 'none'; fing.style.display = 'none'; bub.style.top = Math.max(20, H / 2 - 90) + 'px'; bub.style.bottom = ''; return;
  }
  const el = typeof cur.el === 'function' ? cur.el() : cur.el; if (!el) return;
  const r = el.getBoundingClientRect(), pad = 8, x0 = Math.max(0, r.left - pad), y0 = Math.max(0, r.top - pad), x1 = Math.min(W, r.right + pad), y1 = Math.min(H, r.bottom + pad);
  const set = (k, l, tp, w, h) => { const e = q('[data-s=' + k + ']'); e.style.left = l + 'px'; e.style.top = tp + 'px'; e.style.width = Math.max(0, w) + 'px'; e.style.height = Math.max(0, h) + 'px'; };
  set('t', 0, 0, W, y0); set('b', 0, y1, W, H - y1); set('l', 0, y0, x0, y1 - y0); set('r', x1, y0, W - x1, y1 - y0);
  Object.assign(ring.style, { display: 'block', left: x0 + 'px', top: y0 + 'px', width: x1 - x0 + 'px', height: y1 - y0 + 'px' });
  const below = (y0 + y1) / 2 < H * 0.55;               /* botón arriba → dedo y burbuja abajo; botón abajo → al revés */
  fing.style.display = 'block'; fing.textContent = below ? '👆' : '👇'; fing.className = 'tfinger' + (below ? '' : ' dn');
  fing.style.left = (x0 + x1) / 2 - 23 + 'px'; fing.style.top = below ? y1 + 2 + 'px' : y0 - 52 + 'px';
  if (below) { bub.style.top = Math.min(H - 150, y1 + 56) + 'px'; bub.style.bottom = ''; }
  else { bub.style.bottom = Math.min(H - 150, H - y0 + 56) + 'px'; bub.style.top = ''; }
}

function say(title, text, btns) {
  const b = q('.tbub'); b.innerHTML = '<b>' + esc(title) + '</b><p>' + esc(text) + '</p><div class="row"></div>';
  const row = b.querySelector('.row');
  (btns || []).forEach(([label, cls, fn]) => { const x = document.createElement('button'); x.className = 'b3d sm ' + cls; x.textContent = label; x.onclick = () => { sfx('click'); fn(); }; row.appendChild(x); });
}
const skipBtn = () => [t('tu_skip'), 'ghost', () => end(true)];

/* ---------- pasos del lobby ---------- */
export function start(c) {
  /* c = { play(): empieza la práctica, targets: { coins, rank, play, shop }, onEnd } */
  if (running) return; running = true; ctxG = c; ensure(); root.classList.remove('game'); steps(0);
}
function steps(i) {
  const T = ctxG.targets, S = [
    { el: null, title: t('tu_welcome_t'), text: t('tu_welcome'), next: true },
    { el: T.coins, title: t('tu_coins_t'), text: t('tu_coins'), next: true },
    { el: T.rank, title: t('tu_rank_t'), text: t('tu_rank'), next: true },
    { el: T.play, title: t('tu_play_t'), text: t('tu_play'), tap: true },
  ];
  if (i >= S.length) return;
  const s = S[i]; cur = s; root.classList.remove('game');
  const go = () => steps(i + 1);
  if (s.next) say(s.title, s.text, [[t('tu_next'), 'gold', go], skipBtn()]);
  else say(s.title, s.text, [skipBtn()]);
  if (s.tap) {
    const el = typeof s.el === 'function' ? s.el() : s.el;
    const h = () => { el.removeEventListener('click', h, true); cur = null; setTimeout(() => { hideAll(); ctxG.play(); }, 0); };
    el.addEventListener('click', h, true);
  }
}
function hideAll() { if (!root) return; cur = null; ['t', 'b', 'l', 'r'].forEach((k) => { q('[data-s=' + k + ']').style.cssText = 'width:0;height:0'; }); q('.tring').style.display = 'none'; q('.tfinger').style.display = 'none'; q('.tbub').innerHTML = ''; }

/* ---------- pasos dentro de la partida de práctica (no bloquean el toque; solo guían) ---------- */
export function gameGuide() {
  if (!running) return; ensure(); root.classList.add('game'); hideAll();
  const bub = q('.tbub'); bub.style.top = 'auto'; bub.style.bottom = 'calc(env(safe-area-inset-bottom,0px) + 14px)';
  const swipe = document.createElement('span'); swipe.className = 'tswipe'; swipe.textContent = '👆'; root.appendChild(swipe);
  const fn = () => { const m = matchRef(); return m; };
  let phase = 0, startTy = null, t0 = performance.now(), phT = performance.now();
  const setPhase = (n, title, text) => { phase = n; phT = performance.now(); say(title, text, [skipBtn()]); bub.style.top = 'auto'; };
  setPhase(1, t('tu_move_t'), t('tu_move'));
  poll = setInterval(() => {
    const m = fn(), gi = gameInfo(); if (!m || !gi || !gi.tutorial) { clearInterval(poll); swipe.remove(); return; }
    if (gi.paused || m.paused) return;
    if (startTy === null) startTy = m.P[0].ty;
    const moved = Math.abs(m.P[0].ty - startTy) > 70;
    if (phase === 1 && moved) { swipe.remove(); setPhase(2, t('tu_hit_t'), t('tu_hit')); }
    else if (phase === 2 && (m.hits > 0 || performance.now() - phT > 20000)) { setPhase(3, t('tu_orb_t'), t('tu_orb')); }
    else if (phase === 3 && (m.sc[0] + m.sc[1] >= 2 || performance.now() - phT > 25000)) { setPhase(4, t('tu_win_t'), t('tu_win')); }
    else if (phase === 4 && (m.sc[0] + m.sc[1] >= 3 || performance.now() - phT > 14000)) { clearInterval(poll); finishPractice(); }
  }, 150);
}
function finishPractice() {
  say(t('tu_done_t'), t('tu_done'), []);
  setTimeout(() => { endPractice(); }, 1800);
}
/* al volver al lobby después de la práctica: último paso, la tienda */
export function afterPractice(targets) {
  if (!running) return; ensure(); root.classList.remove('game'); const sw = root.querySelector('.tswipe'); if (sw) sw.remove();
  P.pc += 50; save(); sfx('coin');
  cur = { el: targets.shop };
  say(t('tu_shop_t'), t('tu_shop'), [skipBtn()]);
  const el = targets.shop, h = () => { el.removeEventListener('click', h, true); setTimeout(() => end(false), 0); };
  el.addEventListener('click', h, true);
  toast('+50 🪙', 'good');
}
export function end(skipped) {
  running = false; clearInterval(poll); cancelAnimationFrame(raf); raf = 0; cur = null;
  if (root) { root.remove(); root = null; }
  P.tuto = true; save();
  if (ctxG && ctxG.onEnd) ctxG.onEnd(skipped);
  if (gameInfo() && gameInfo().tutorial) endPractice();
}
