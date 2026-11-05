/* util.js · utilidades pequeñas que usan todos los módulos */
import { t } from './i18n.js';

export const $ = (id) => document.getElementById(id);
export const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
export const lerp = (a, b, k) => a + (b - a) * k;
export const rand = (a, b) => a + Math.random() * (b - a);
export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
export const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
export const fmt = (n) => (Math.round(+n || 0)).toLocaleString(document.documentElement.lang || 'es');
export const today = () => new Date().toLocaleDateString('en-CA');
export const genId = () => {
  try { const a = new Uint32Array(1); crypto.getRandomValues(a); return String(10000000 + (a[0] % 90000000)); }
  catch (e) { return String(10000000 + Math.floor(Math.random() * 90000000)); }
};

/* almacenamiento local a prueba de fallos */
export const ls = {
  get(k, d) { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* sin espacio / modo privado */ } },
  del(k) { try { localStorage.removeItem(k); } catch (e) { /* nada */ } },
};

/* bus de eventos: bus.on('lang', fn) · bus.emit('lang') */
const subs = {};
export const bus = {
  on(ev, fn) { (subs[ev] = subs[ev] || []).push(fn); return () => { subs[ev] = (subs[ev] || []).filter((f) => f !== fn); }; },
  emit(ev, data) { (subs[ev] || []).slice().forEach((f) => { try { f(data); } catch (e) { console.error(ev, e); } }); },
};

/* avisos */
export function toast(msg, kind = '') {
  const box = $('toasts'); if (!box) return;
  const d = document.createElement('div');
  d.className = 'toast ' + kind; d.textContent = msg; box.appendChild(d);
  while (box.children.length > 3) box.firstChild.remove();
  setTimeout(() => d.remove(), 2600);
}

/* ventana emergente: modal({title, body(html), icon, buttons:[{t,cls,fn}]}) */
export function modal({ title = '', body = '', icon = '', buttons = [{ t: t('ok') }], onclose } = {}) {
  const w = document.createElement('div');
  w.className = 'mdl';
  w.innerHTML = '<div class="pnl">' + (icon ? '<div class="big">' + icon + '</div>' : '') + (title ? '<h2>' + esc(title) + '</h2>' : '') +
    '<div class="md-b" style="font-size:14px;line-height:1.45">' + body + '</div><div class="sc-f md-f" style="margin-top:6px"></div></div>';
  const f = w.querySelector('.md-f');
  const close = () => { w.remove(); if (onclose) onclose(); };
  buttons.forEach((b) => {
    const x = document.createElement('button');
    x.className = 'b3d ' + (b.cls || '');
    x.textContent = b.t;
    x.onclick = () => { close(); if (b.fn) b.fn(); };
    f.appendChild(x);
  });
  $('modals').appendChild(w);
  return { close, el: w };
}

/* confirmación rápida */
export function confirmBox(title, body, yes, onYes, cls = 'red') {
  modal({ title, body, buttons: [{ t: yes, cls, fn: onYes }, { t: t('cancel'), cls: 'ghost' }] });
}

/* pantalla (overlay) con cabecera: screen({id,title,wide}) → {el, body, foot, close} */
export function screen({ id, title, wide = false, onclose, noClose = false }) {
  const old = $(id); if (old) old.remove();
  const s = document.createElement('div');
  s.id = id; s.className = 'scr dim anim';
  s.innerHTML = '<div class="pnl' + (wide ? ' wide' : '') + '"><div class="sc-h"><h2>' + esc(title) + '</h2>' +
    (noClose ? '' : '<button class="b3d ghost ib3d sc-x" aria-label="' + esc(t('close')) + '">✕</button>') +
    '</div><div class="sc-b"></div><div class="sc-f"></div></div>';
  $('app').appendChild(s);
  const close = () => { s.remove(); if (onclose) onclose(); };
  const x = s.querySelector('.sc-x'); if (x) x.onclick = () => { sfx('click'); close(); };
  return { el: s, body: s.querySelector('.sc-b'), foot: s.querySelector('.sc-f'), close, h2: s.querySelector('h2') };
}

/* el sonido se inyecta desde audio.js para no crear dependencias circulares */
let _sfx = () => {};
export const setSfx = (f) => { _sfx = f; };
export const sfx = (n, a) => _sfx(n, a);

/* vibración */
export function vib(ms) { try { if (navigator.vibrate) navigator.vibrate(ms); } catch (e) { /* nada */ } }

/* contador animado de números */
export function countUp(el, from, to, ms = 900, pre = '') {
  const t0 = performance.now();
  const step = (n) => {
    const k = clamp((n - t0) / ms, 0, 1), e = 1 - Math.pow(1 - k, 3);
    el.textContent = pre + Math.round(from + (to - from) * e);
    if (k < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

/* inclinación 3D de tarjetas con el dedo / mouse */
export function tilt(el, max = 10) {
  el.addEventListener('pointermove', (e) => {
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5, py = (e.clientY - r.top) / r.height - 0.5;
    el.style.transform = 'perspective(600px) rotateY(' + px * max + 'deg) rotateX(' + -py * max + 'deg)';
  });
  const off = () => { el.style.transform = ''; };
  el.addEventListener('pointerleave', off); el.addEventListener('pointerup', off);
}
