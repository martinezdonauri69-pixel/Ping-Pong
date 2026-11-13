/* game.js · una partida completa: cuenta regresiva, controles, marcador, sonidos, pausa y resultado */
import { t } from './i18n.js';
import { P, SET, save, addXp, lvl } from './state.js';
import { createMatch, ABIL, H } from './engine.js';
import { rankOf, rankDiff, TI } from './ranks.js';
import { track, checkAch } from './quests.js';
import { NET, nsend, cleanup as netCleanup } from './online.js';
import { $, esc, clamp, sfx, vib, modal, bus, sleep } from './util.js';
import { music } from './audio.js';

let stage = null, M = null, G = null;
export const active = () => !!G;
export const init = (st) => { stage = st; };

const LEVEL_OF = { easy: 6, mid: 38, hard: 72 };

/* opts: { mode:'ranked'|'train'|'local'|'online', diff:'easy'|'mid'|'hard', role:'h'|'g', opp:{name}, onEnd(result), names } */
export async function start(opts) {
  if (G) return;
  const mode = opts.mode, online = mode === 'online', guest = online && opts.role === 'g';
  const L = mode === 'ranked' ? rankDiff(P.rp) : mode === 'train' ? LEVEL_OF[opts.diff || 'mid'] : 40;
  /* clasificatoria: primero a 7 puntos o, a los 60 s, gana quien tenga mas */
  M = createMatch({ mode: mode === 'local' ? 'local' : online ? (guest ? 'guest' : 'host') : 'bot', L, win: mode === 'ranked' ? 7 : 11, limit: mode === 'ranked' ? 60 : 0, deuce: mode !== 'ranked' });
  const names = mode === 'local' ? [t('player_n', { n: 1 }), t('player_n', { n: 2 })]
    : online ? (guest ? [opts.opp.name, P.name] : [P.name, opts.opp.name]) : [P.name, mode === 'ranked' ? t('rival') : t('bot_' + (opts.diff || 'mid'))];
  G = { opts, mode, online, guest, names, L, rally: 0, maxRally: 0, orbs: 0, myPts: 0, ptr: {}, snap: null, snapT: 0, sendT: 0, inT: 0, ended: false, paused: false, t0: performance.now(), quit: false };
  const flip = guest;
  stage.setFlip(flip); stage.setMode('game'); stage.resetTrail();
  const sideLeft = flip ? 1 : 0;     /* de quién es el lado izquierdo de la pantalla */
  G.flip = flip;
  buildHud(sideLeft);
  bindInput();
  music('game');
  M.paused = true;
  if (online) { NET.onMsg = onNetMsg; NET.onLost = () => { if (G && !G.ended) finish(true, true); }; }
  await countdown();
  if (!G) return;
  M.paused = false;
}

/* ---------------------------------------------------------------- HUD */
function buildHud(sideLeft) {
  const h = document.createElement('div'); h.id = 'hud';
  const nm = (i) => esc(G.names[i]);
  const li = sideLeft, ri = 1 - sideLeft;
  h.innerHTML = '<div class="hud-top"><button class="b3d ghost ib3d" id="hPause" aria-label="' + esc(t('pause')) + '">❚❚</button>' +
    '<div class="score3d"><span class="nm">' + nm(li) + '</span><span class="n a" id="hs0">0</span><span class="sep">:</span><span class="n b" id="hs1">0</span><span class="nm">' + nm(ri) + '</span></div>' +
    '<div class="tag">' + (G.mode === 'ranked' ? '<span class="qtag">🏆 ' + esc(t('ranked')) + '</span>' : '') + '</div></div>' +
    (G.mode === 'ranked' ? '<div id="hTime" class="gtime">1:00</div>' : '') + '<div id="cdown"></div><div id="fxtxt"></div><div id="hFps" class="fps">-- FPS</div>';
  $('app').appendChild(h); G.hud = h; G.sideLeft = sideLeft;
  $('hPause').onclick = () => { sfx('click'); pause(true); };
}
const setScore = () => {
  const l = G.sideLeft, a = $('hs0'), b = $('hs1'); if (!a) return;
  const set = (el, v) => { if (el.textContent !== String(v)) { el.textContent = v; el.classList.add('pop'); setTimeout(() => el.classList.remove('pop'), 180); } };
  set(a, M.sc[l]); set(b, M.sc[1 - l]);
};
function say(txt, color) { const f = $('fxtxt'); if (!f) return; f.textContent = txt; f.style.color = color || '#fff'; f.classList.remove('pop'); void f.offsetWidth; f.classList.add('pop'); }

async function countdown() {
  const c = $('cdown');
  for (const n of ['3', '2', '1']) { if (!G) return; c.textContent = n; c.className = ''; void c.offsetWidth; c.className = 'go'; sfx('tick'); await sleep(800); }
  if (!G) return; c.textContent = t('go'); c.className = ''; void c.offsetWidth; c.className = 'go'; sfx('go'); await sleep(450); if (c) c.textContent = '';
}

/* ---------------------------------------------------------------- controles (dedo, mouse y teclado) */
let offs = [];
function bindInput() {
  const cv = stage.renderer.domElement;
  const side = (x) => (G.mode === 'local' ? (x < 400 ? 0 : 1) : G.guest ? 1 : 0);
  const set = (id, e) => {
    if (!G || G.paused) return; const p = stage.pick(e.clientX, e.clientY); if (!p) return;
    let s = G.ptr[id]; if (s === undefined) s = G.ptr[id] = side(p[0]);
    const pd = M.P[s]; pd.ty = clamp(p[1], pd.h / 2, H - pd.h / 2);
    if (G.guest) { const now = performance.now(); if (now - G.inT > 16) { G.inT = now; nsend({ t: 'in', y: pd.ty }); } }
  };
  const down = (e) => { e.preventDefault(); try { cv.setPointerCapture(e.pointerId); } catch (er) { /* nada */ } set(e.pointerId, e); };
  const move = (e) => { if (G && (G.ptr[e.pointerId] !== undefined || e.pointerType === 'mouse')) set(e.pointerId, e); };
  const up = (e) => { if (G) delete G.ptr[e.pointerId]; };
  cv.addEventListener('pointerdown', down); cv.addEventListener('pointermove', move); cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', up);
  const kd = (e) => { if (M) M.keys[e.code] = true; if (e.code === 'Escape' || e.code === 'KeyP') pause(!G.paused); if (['ArrowUp', 'ArrowDown'].includes(e.code)) e.preventDefault(); };
  const ku = (e) => { if (M) M.keys[e.code] = false; };
  const vis = () => { if (document.hidden && G && !G.online && !G.ended) pause(true); };
  addEventListener('keydown', kd); addEventListener('keyup', ku); document.addEventListener('visibilitychange', vis);
  offs = [() => { cv.removeEventListener('pointerdown', down); cv.removeEventListener('pointermove', move); cv.removeEventListener('pointerup', up); cv.removeEventListener('pointercancel', up); removeEventListener('keydown', kd); removeEventListener('keyup', ku); document.removeEventListener('visibilitychange', vis); }];
}

/* ---------------------------------------------------------------- pausa */
function pause(on) {
  if (!G || G.ended) return;
  if (!on) { const p = $('pause'); if (p) p.remove(); G.paused = false; if (!G.online) M.paused = false; return; }
  if ($('pause')) return;
  G.paused = true; if (!G.online) M.paused = true;
  const s = document.createElement('div'); s.id = 'pause'; s.className = 'scr dim anim';
  s.innerHTML = '<div class="pnl" style="max-width:340px"><h2>' + esc(t('pause')) + '</h2>' + (G.online ? '<div class="muted c">' + esc(t('online_pause')) + '</div>' : '') +
    '<button class="b3d green lg block" id="pkResume">▶ ' + esc(t('resume')) + '</button><button class="b3d red block" id="pkQuit">🏳 ' + esc(t('quit')) + '</button>' +
    (G.mode === 'ranked' ? rkGuide() : '') + '</div>';
  $('app').appendChild(s);
  $('pkResume').onclick = () => { sfx('click'); pause(false); };
  $('pkQuit').onclick = () => { sfx('click'); s.remove(); G.quit = true; finish(false, false, true); };
}

/* ---------------------------------------------------------------- red */
function onNetMsg(m) {
  if (!G) return;
  if (m.t === 'in' && !G.guest) { const pd = M.P[1]; pd.ty = clamp(+m.y || H / 2, pd.h / 2, H - pd.h / 2); }
  else if (m.t === 's' && G.guest) { G.snap = m.s; }
  else if (m.t === 'end' && G.guest) { M.sc = m.sc || M.sc; setScore(); finish(m.w === 1); }
  else if (m.t === 'bye') { if (!G.ended) finish(true, true); }
}

/* ---------------------------------------------------------------- contador de FPS */
let fpsN = 0, fpsT = 0;
function fpsTick() {
  const n = performance.now(); fpsN++;
  if (!fpsT) fpsT = n;
  if (n - fpsT >= 500) { const e = $('hFps'); if (e) { const f = Math.round(fpsN * 1000 / (n - fpsT)); e.textContent = f + ' FPS'; e.style.color = f >= 50 ? '#7dffb0' : f >= 30 ? '#ffd21f' : '#ff6b6b'; } fpsN = 0; fpsT = n; }
}

/* ---------------------------------------------------------------- bucle: lo llama main.js cada cuadro */
export function frame(dt) {
  if (!G || !M) return;
  fpsTick();
  if (M.limit && !G.ended) { const s = Math.ceil(M.tl); if (s !== G.tlS) { G.tlS = s; const e = $('hTime'); if (e) { e.textContent = Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); e.classList.toggle('low', s <= 10); } if (s <= 5 && s > 0 && !M.paused) sfx('click'); } }
  const online = G.online;
  if (!G.ended && !M.paused) {
    if (G.guest) {
      if (G.snap) { M.applySnap(G.snap, dt); G.snap = null; }
      else if (M.B && M.serveT <= 0) { M.B.x += M.B.vx * dt; M.B.y += M.B.vy * dt; M.B.y = clamp(M.B.y, 9, H - 9); M.P[1].y += (M.P[1].ty - M.P[1].y) * Math.min(1, dt * 18); }
      M.t += dt;
    } else M.update(dt);
    if (online && !G.guest) { G.sendT += dt; if (G.sendT > 0.033) { G.sendT = 0; nsend({ t: 's', s: M.snapshot() }); } }
  }
  /* eventos → sonido, efectos y marcador */
  while (M.ev.length) {
    const e = M.ev.shift(); stage.onEvent(e, G.mode === 'local' || e.w === (G.guest ? 1 : 0));
    if (e.k === 'hit') {
      sfx(e.i ? 'pong' : 'ping');
      if (!G.guest) { G.rally++; G.maxRally = Math.max(G.maxRally, G.rally); }
    }
    else if (e.k === 'wall') sfx('bounce');
    else if (e.k === 'point') {
      sfx('point'); setScore(); if (!G.guest) { if (e.w === 0) G.myPts++; G.rally = 0; }
      if (G.mode === 'local' || e.w === (G.guest ? 1 : 0)) vib(40);
    } else if (e.k === 'ability') {
      say(t('ab_' + e.a), ABIL[e.a].col); sfx(e.a === 'turbo' || e.a === 'fuego' ? 'turbo' : 'whoosh'); if (!G.guest && e.who === 0) G.orbs++;
    } else if (e.k === 'over' && !G.guest) {
      if (G.online) nsend({ t: 'end', w: M.winner === 0 ? 0 : 1, sc: M.sc });
      if (e.time) say(t('time_up'), '#ffd21f');
      finish(M.winner === 0, false, false, M.winner === -1);
    }
  }
  stage.frame(dt, M, { side: G.flip ? 1 : 0 });
}
export const matchRef = () => M;
export const gameInfo = () => (G ? { mode: G.mode, tutorial: !!G.opts.tutorial, paused: G.paused, ended: G.ended } : null);
/* termina una práctica (tutorial) sin darle estadísticas */
export function endPractice() { if (G && !G.ended) finish(true, false, true); }

/* ---------------------------------------------------------------- resultado */
function finish(win, lost, quit, draw) {
  if (!G || G.ended) return; G.ended = true; M.paused = true;
  const opts = G.opts, mode = G.mode;
  if (G.online && !lost && !G.guest && !quit) { /* ya se avisó */ }
  if (G.online && quit) nsend({ t: 'bye' });
  const win2 = quit ? false : win;
  const res = (quit && mode !== 'ranked') || opts.tutorial ? { mode, quit: true, skip: true, win: false, rp0: P.rp, rp1: P.rp, d: 0, pc: 0, xp: 0, lvUp: 0, sc: M.sc.slice() } : settle(mode, win2, quit, !!draw);
  /* quitar controles y HUD */
  setTimeout(() => {
    offs.forEach((f) => f()); offs = [];
    const hud = $('hud'); if (hud) hud.remove(); const p = $('pause'); if (p) p.remove();
    if (G && G.online) netCleanup();
    stage.setFlip(false);
    const cb = opts.onEnd; G = null; M = null;
    if (cb) cb(res);
  }, quit ? 50 : 1500);
  if (!quit) { sfx(win2 ? 'win' : draw ? 'point' : 'lose'); say(win2 ? t('victory') : draw ? t('draw') : t('defeat'), win2 ? '#ffd400' : draw ? '#ffd21f' : '#ff7088'); if (win2) stage.celebrate(['#ffd400', '#ffffff', '#19e6a0']); }
}

/* recompensas, rango, estadísticas y misiones */
/* ---- puntos de rango (RP) de la clasificatoria: todo se escala con el nivel del rango ---- */
const rpBase = () => Math.round((TI[rankOf(P.rp).t].cost || 320) * 0.22);                         /* victoria base */
const lossBonus = (pts, b) => Math.round(b * ({ 4: 0.2, 5: 0.3, 6: 0.4 }[pts] || 0));              /* perder con 4+ puntos */
const quitPenalty = (pts, b) => (pts >= 5 ? 0 : Math.round(b * 1.5 * (5 - pts) / 5));            /* rendirse: baja la multa con cada punto */
function rkGuide() {
  const b = rpBase(), pts = M ? M.sc[G.guest ? 1 : 0] : 0, pen = Math.min(quitPenalty(pts, b), P.rp - rankOf(P.rp).tierLo);
  const row = (ic, k, v, c) => '<div class="rk"><span>' + ic + ' ' + esc(t(k)) + '</span><b class="' + c + '">' + v + '</b></div>';
  return '<div class="rkg">' + row('🏆', 'rk_win', '+' + (b + Math.min(9, P.streak * 3)), 'up') + row('🤝', 'rk_draw', '+' + Math.round(b * 0.4), 'up') +
    row('💪', 'rk_lose4', '+' + lossBonus(4, b) + ' → +' + lossBonus(6, b), 'up') + row('😶', 'rk_lose3', '0', '') + row('🏳', 'rk_quit', pen ? '−' + pen : '0', pen ? 'dn' : '') + '</div>' +
    (pts >= 5 ? '<div class="muted c">' + esc(t('rk_safe')) + '</div>' : '');
}
function settle(mode, win, quit, draw) {
  const r = { mode, win, quit: !!quit, rp0: P.rp, rp1: P.rp, d: 0, pc: 0, xp: 0, lvUp: 0, shield: false, boost: false, streak: P.streak, sc: M ? M.sc.slice() : [0, 0] };
  const pts = M ? M.sc[G.guest ? 1 : 0] : 0;
  if (mode !== 'local') P.games++;
  track('game'); if (G.myPts) track('point', G.myPts); if (G.maxRally) track('rally', G.maxRally); if (G.orbs) track('orb', G.orbs);
  if (mode === 'local') { r.xp = 10; }
  else {
    if (win) {
      P.w++; P.streak++; P.bestStreak = Math.max(P.bestStreak || 0, P.streak); track('win');
      if (M && M.sc[1 - (G.guest ? 1 : 0)] === 0) P.shut++;
      if ((mode === 'train' && G.opts.diff === 'hard') || (mode === 'ranked' && G.L >= 60)) P.hardWins++;
    } else if (!draw) { P.l++; P.streak = 0; }
    r.streak = P.streak;
    r.draw = !!draw;
    r.pc = mode === 'ranked' ? (quit ? 0 : win ? 30 : draw ? 15 : pts >= 4 ? 8 : 4) : mode === 'train' ? (win ? 12 : 3) : (win ? 15 : 5);
    r.xp = mode === 'ranked' ? (quit ? 0 : win ? 60 : draw ? 40 : pts >= 4 ? 25 : 12) : mode === 'train' ? (win ? 20 : 10) : (win ? 40 : 15);
    if (mode === 'ranked') {
      if (!draw) P[win ? 'rw' : 'rl']++;
      const base = rpBase();
      if (win) {
        let d = base + Math.min(9, Math.max(0, P.streak - 1) * 3);
        if (P.boost > 0) { P.boost--; d = Math.round(d * 1.5); r.boost = true; }
        P.rp += d; r.d = d;
      } else if (draw) {                       /* tabla: se premia la lucha si ambos jugaron de verdad */
        const d = pts >= 3 ? Math.round(base * 0.4) : 0; P.rp += d; r.d = d;
      } else if (quit) {                       /* rendirse: multa que baja con cada punto; con 5+ no se pierde nada */
        const lo = rankOf(P.rp).tierLo, np = Math.max(lo, P.rp - quitPenalty(pts, base)); r.d = np - P.rp; P.rp = np;
      } else {                                 /* derrota: con 4+ puntos hay bonificacion, con 3 o menos nada */
        const d = lossBonus(pts, base); P.rp += d; r.d = d;
      }
      r.pts = pts;
      r.rp1 = P.rp;
    }
    P.pc += r.pc;
  }
  r.lvUp = addXp(r.xp);
  checkAch(); save();
  return r;
}
