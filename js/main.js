/* main.js · arranque del juego: seguridad → idioma → sesión → escena 3D → lobby */
import './security.js';
import { initLang, t, setLang } from './i18n.js';
import { P, SET, applyLook, acct } from './state.js';
import { bus, $, modal, toast, setSfx } from './util.js';
import { sfx, unlock, applyVol, music } from './audio.js';
import { restore, X } from './net.js';
import { createStage } from './render3d.js';
import { lookFor } from './data/catalog.js';
import * as Game from './game.js';
import * as Lobby from './lobby.js';
import * as Tuto from './tutorial.js';
import { NET, watchInvites } from './online.js';

setSfx(sfx);
const err = (m) => { const e = $('err'); if (e) { e.textContent = String(m).slice(0, 160); e.style.display = 'block'; setTimeout(() => { e.style.display = 'none'; }, 5000); } };
addEventListener('error', (e) => console.warn('error', e.message));
addEventListener('unhandledrejection', (e) => console.warn('promesa', e.reason && e.reason.message));

let stage = null, last = 0, lastPlay = null;

function look() { if (stage) stage.setLook(lookFor(P.eq, P.inv)); }

function play(opts) {
  if (Game.active()) return;
  lastPlay = opts;
  Lobby.show(false); music('game');
  const o = Object.assign({}, opts, { onEnd: (res) => ended(res, opts) });
  Game.start(o);
  if (opts.tutorial) Tuto.gameGuide();
}
function ended(res, opts) {
  stage.setMode('lobby'); look(); music('menu');
  if (Tuto.isRunning()) { Lobby.show(true); Lobby.render(); Tuto.afterPractice(Lobby.targets()); return; }
  const again = opts.mode === 'online' || opts.mode === 'ranked' || opts.mode === 'train' || opts.mode === 'local' ? (opts.mode === 'online' ? null : () => play(opts)) : null;
  Lobby.showResult(res, again);
  Lobby.render();
}
function startTutorial() {
  if (Tuto.isRunning() || Game.active()) return;
  Lobby.show(true);
  Tuto.start({ targets: Lobby.targets(), play: () => play({ mode: 'train', diff: 'easy', tutorial: true }), onEnd: () => { Lobby.show(true); Lobby.render(); } });
}

async function boot() {
  applyLook(); await initLang();
  const spl = $('splash'); if (spl) { spl.innerHTML = ''; spl.id = 'splash0'; spl.className = 'scr'; spl.style.cssText = 'background:radial-gradient(ellipse at 50% 42%,#0d1a58 0,#04061a 72%);z-index:30'; }
  const cv = $('gl');
  try { stage = createStage(cv, { hq: SET.hq }); } catch (e) { console.warn('WebGL', e); err(t('err_webgl')); }
  if (stage) { Game.init(stage); stage.setLook(lookFor(P.eq, P.inv)); }
  Lobby.bindMain({ play, mode: () => (Game.active() ? 'game' : 'lobby') });
  Lobby.build();
  /* intro obligatoria: arranca sola. El sonido se activa con el primer toque (regla del navegador). */
  const noIntro = new URLSearchParams(location.search).has('autostart');
  const introP = noIntro ? Promise.resolve() : import('./intro.js').then((I) => Promise.race([I.play(), new Promise((r) => setTimeout(r, 8000))])).catch((e) => console.warn('intro', e));
  ['pointerdown', 'touchstart', 'keydown'].forEach((ev) => addEventListener(ev, () => { unlock(); applyVol(); }, { once: true, passive: true, capture: true }));
  const rs = restore().catch(() => {});
  /* bucle */
  const loop = (ts) => {
    requestAnimationFrame(loop);
    const dt = Math.min(0.05, (ts - last) / 1000 || 0.016); last = ts;
    if (!stage) return;
    if (Game.active()) Game.frame(dt); else stage.frame(dt, null, {});
  };
  requestAnimationFrame(loop);
  addEventListener('resize', () => stage && stage.resize());
  addEventListener('orientationchange', () => setTimeout(() => stage && stage.resize(), 250));
  addEventListener('pointermove', (e) => { if (stage && !Game.active()) stage.setPointer((e.clientX / innerWidth - 0.5) * 2, (e.clientY / innerHeight - 0.5) * 2); });
  bus.on('look', look); bus.on('profile', look);
  bus.on('quality', () => stage && stage.setQuality(SET.hq));
  bus.on('celebrate', (c) => stage && stage.celebrate(c));
  bus.on('tutorial', startTutorial);
  bus.on('banmsg', (m) => modal({ title: '⛔', body: String(m || ''), buttons: [{ t: t('ok') }] }));
  NET.onStart = (role, opp) => { if (Game.active()) return; play({ mode: 'online', role, opp }); };
  /* pantalla de inicio: un toque (necesario para que el teléfono deje sonar el audio) */
  await Promise.race([rs, new Promise((r) => setTimeout(r, 3500))]);
  
  const enter = async () => {
    await introP;
    document.querySelectorAll('#intro').forEach((n) => n.remove());
    unlock(); applyVol(); music('menu'); if (spl) spl.remove();
    Lobby.show(true); Lobby.render();
    watchInvites(() => (Game.active() ? 'game' : 'lobby')); bus.on('auth', () => setTimeout(() => watchInvites(() => (Game.active() ? 'game' : 'lobby')), 300));
    if (!P.tuto) setTimeout(startTutorial, 700);
  };
  enter();
  window.__dmr = { stage, play, Game, Lobby, Tuto, P };   /* solo para pruebas locales */
  if (location.hostname !== 'localhost' && location.hostname !== '127.0.0.1') delete window.__dmr;
}
boot().catch((e) => { console.error(e); err('Error: ' + (e && e.message)); });
