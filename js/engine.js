/* engine.js · reglas y física del juego (no dibuja nada). Mesa de 800 × 500 unidades. */
import { clamp } from './util.js';

export const W = 800, H = 500;
export const PX0 = 38, PX1 = 762, BR = 9;      /* cara de cada paleta y radio de la pelota */
export const ABIL = {
  turbo: { ic: '⚡', col: '#ffd400' }, fuego: { ic: '🔥', col: '#ff5a1f' }, hielo: { ic: '🧊', col: '#7fe3ff' },
  curva: { ic: '🌀', col: '#c06bff' }, gigante: { ic: '📏', col: '#4dff9a' }, encoger: { ic: '🔻', col: '#ff4d6d' }, fantasma: { ic: '👻', col: '#e8e8ff' },
};
const AK = Object.keys(ABIL);

/* ---- velocidad y dificultad según el rango (L = 1..100) ---- */
export function speedFor(L) {
  /* pelota mas lenta en los rangos bajos y cada vez mas rapida al subir */
  if (L <= 1) return { base: 300, boost: 1.1 };
  if (L <= 20) return { base: 320 + ((L - 2) / 18) * 110, boost: 1.12 + ((L - 2) / 18) * 0.08 };
  const k = (L - 20) / 80; return { base: 430 + k * 130, boost: 1.2 + k * 0.15 };
}
/* probabilidad de ganar una partida a 11 dado que ganas cada punto con probabilidad p */
function matchWin(p) {
  const q = 1 - p, tie = (p * p) / (p * p + q * q), M = {};
  const f = (a, b) => {
    if (a >= 11 && a - b >= 2) return 1; if (b >= 11 && b - a >= 2) return 0;
    if (a >= 10 && b >= 10) { const d = a - b; return d === 0 ? tie : d > 0 ? p + q * tie : p * tie; }
    const k = a * 20 + b; if (M[k] !== undefined) return M[k]; return (M[k] = p * f(a + 1, b) + q * f(a, b + 1));
  };
  return f(0, 0);
}
/* probabilidad de que el bot gane la partida: baja en Bronce/Plata y sube poco a poco hasta Leyenda */
const PBT = [[1, 5, .06, .12], [6, 10, .13, .20], [11, 20, .21, .32], [21, 30, .33, .43], [31, 40, .44, .53], [41, 50, .54, .62], [51, 60, .63, .71], [61, 70, .72, .79], [71, 80, .80, .86], [81, 90, .87, .92], [91, 100, .93, .97]];
const pbOf = (L) => { const r = PBT.find((q) => L >= q[0] && L <= q[1]) || PBT[PBT.length - 1]; return r[2] + (r[3] - r[2]) * (L - r[0]) / (r[1] - r[0]); };
/* calidad del bot (0 = torpe, 1 = casi perfecto): se busca para que tengas la probabilidad de ganar de la tabla */
export function botQuality(L) {
  /* sube de forma gradual: casi torpe en Bronce I y muy bueno solo en los rangos mas altos */
  return clamp(0.92 * Math.pow((L - 1) / 99, 1.2), 0, 1);
}

const mkPaddle = () => ({ y: H / 2, ty: H / 2, h: 90, slow: 0, big: 0, small: 0 });

/* opts: { mode:'bot'|'local'|'host', L:1..100, win:11 } */
export function createMatch(opts) {
  const m = {
    mode: opts.mode, L: opts.L || 1, win: opts.win || 11, limit: opts.limit || 0, tl: opts.limit || 0, deuce: opts.deuce !== false,
    sp: speedFor(opts.mode === 'local' || opts.mode === 'host' ? 40 : opts.L || 1),
    Q: opts.mode === 'bot' ? botQuality(opts.L || 1) : 0,
    P: [mkPaddle(), mkPaddle()], B: null, sc: [0, 0], orb: null, orbT: 4,
    over: false, winner: -1, serveT: 0, ev: [], t: 0, paused: false, aiErr: 0, hits: 0,
  };
  const keys = {};
  m.keys = keys;
  /* error de punteria del bot: grande si es principiante, casi nulo si es de alto rango */
  const aiE = (lk) => (Math.random() - 0.5) * 2 * (lk ? 8 + (1 - m.Q) * 45 : 80 + (1 - m.Q) * 60);

  m.serve = (d) => {
    const lk = Math.random() < m.Q;
    m.B = { x: W / 2, y: H / 2, vx: 0, vy: 0, sp: m.sp.base, d, last: d > 0 ? 0 : 1, lock: lk, wob: 0, gh: 0, hot: 0, hit: 0 };
    m.aiErr = aiE(lk);
    m.serveT = 1; m.orb = null; m.orbT = 3 + Math.random() * 2; m.ev.push({ k: 'serve', d });
  };

  const hit = (i) => {
    const p = m.P[i], B = m.B, s = i ? -1 : 1, rel = clamp((B.y - p.y) / (p.h / 2), -1, 1), a = rel * 0.85;
    B.sp = Math.min(B.sp * 1.04 + 6, 1000); B.vx = Math.cos(a) * B.sp * s; B.vy = Math.sin(a) * B.sp;
    B.x = i ? PX1 - BR : PX0 + BR; B.last = i; m.hits++;
    m.ev.push({ k: 'hit', i, x: B.x, y: B.y, sp: B.sp });
    if (i === 0) m.aiErr = aiE(B.lock);
  };

  const ability = (k) => {
    const B = m.B, me = B.last, op = 1 - me, mg = Math.hypot(B.vx, B.vy) || 1;
    if (k === 'turbo' || k === 'fuego') {
      const ns = k === 'turbo' ? Math.min(B.sp * m.sp.boost, 1100) : Math.min(B.sp * 1.35, 1150);
      B.vx *= ns / mg; B.vy *= ns / mg; B.sp = ns; B.hot = k === 'turbo' ? 2 : 3;
    } else if (k === 'hielo') m.P[op].slow = 3.5;
    else if (k === 'curva') B.wob = 2.5;
    else if (k === 'gigante') { m.P[me].big = 7; m.P[me].small = 0; }
    else if (k === 'encoger') { m.P[op].small = 7; m.P[op].big = 0; }
    else if (k === 'fantasma') B.gh = 2;
    m.ev.push({ k: 'ability', a: k, who: me });
  };

  const point = (w) => {
    m.sc[w]++; m.ev.push({ k: 'point', w, x: m.B.x, y: m.B.y });
    const a = m.sc[0], c = m.sc[1];
    if ((a >= m.win || c >= m.win) && (!m.deuce || Math.abs(a - c) >= 2)) { m.over = true; m.winner = a > c ? 0 : 1; m.ev.push({ k: 'over', w: m.winner }); return; }
    m.serve(w ? -1 : 1);
  };

  m.update = (dt) => {
    if (m.over || m.paused) return;
    m.t += dt;
    if (m.limit) {   /* reloj: al acabarse gana quien tenga mas puntos; si hay igualdad es empate (winner -1) */
      m.tl = Math.max(0, m.tl - dt);
      if (m.tl <= 0) { const a = m.sc[0], c = m.sc[1]; m.over = true; m.winner = a > c ? 0 : c > a ? 1 : -1; m.ev.push({ k: 'over', w: m.winner, time: true }); return; }
    }
    const { P, B } = m;
    P.forEach((p, i) => {
      p.slow = Math.max(0, p.slow - dt); p.big = Math.max(0, p.big - dt); p.small = Math.max(0, p.small - dt);
      p.h += ((p.big > 0 ? 135 : p.small > 0 ? 55 : 90) - p.h) * Math.min(1, dt * 8);
      const sl = p.slow > 0;
      if (i === 1 && m.mode === 'bot') {                          /* el bot */
        let tg = H / 2; const lk = B.lock, sp = (lk ? 650 + m.Q * 350 : 200 + m.Q * 130) * (sl ? 0.4 : 1);
        if (B.vx > 0) {
          if (lk) { let y = B.y + B.vy * (PX1 - B.x) / B.vx; const per = 2 * (H - BR * 2), mm = (((y - BR) % per) + per) % per; y = BR + (mm <= H - BR * 2 ? mm : per - mm); tg = y + m.aiErr; }
          else tg = B.y + m.aiErr;
        }
        p.y += clamp(tg - p.y, -sp * dt, sp * dt);
      } else if (m.mode !== 'host' || i === 0) {                   /* teclado (en línea el invitado manda su paleta por red) */
        const up = i === 0 ? (keys.KeyW || (m.mode === 'bot' && keys.ArrowUp)) : keys.ArrowUp;
        const dn = i === 0 ? (keys.KeyS || (m.mode === 'bot' && keys.ArrowDown)) : keys.ArrowDown;
        const v = 520 * dt * (sl ? 0.4 : 1);
        if (up) p.ty -= v; if (dn) p.ty += v;
        p.ty = clamp(p.ty, p.h / 2, H - p.h / 2); p.y += (p.ty - p.y) * Math.min(1, dt * 18 * (sl ? 0.3 : 1));
      } else { p.ty = clamp(p.ty, p.h / 2, H - p.h / 2); p.y += (p.ty - p.y) * Math.min(1, dt * 18 * (sl ? 0.3 : 1)); }
      p.y = clamp(p.y, p.h / 2, H - p.h / 2);
    });
    if (m.serveT > 0) {
      m.serveT -= dt;
      if (m.serveT <= 0) { const a = (Math.random() - 0.5) * 0.7; B.vx = Math.cos(a) * B.sp * B.d; B.vy = Math.sin(a) * B.sp; }
      return;
    }
    B.hot = Math.max(0, B.hot - dt); B.gh = Math.max(0, B.gh - dt);
    if (B.wob > 0) { B.wob -= dt; const a = Math.sin((2.5 - B.wob) * 12) * dt * 4, ca = Math.cos(a), sa = Math.sin(a); const vx = B.vx * ca - B.vy * sa, vy = B.vx * sa + B.vy * ca; B.vx = vx; B.vy = vy; }
    /* poderes en el centro */
    if (!m.orb) { m.orbT -= dt; if (m.orbT <= 0) m.orb = { t: 0, life: 6, k: AK[Math.floor(Math.random() * AK.length)] }; }
    else { m.orb.t += dt; if (m.orb.t > m.orb.life) { m.orb = null; m.orbT = 3 + Math.random() * 3; } }
    for (let k = 0; k < 3; k++) {
      B.x += B.vx * dt / 3; B.y += B.vy * dt / 3;
      if (B.y < BR) { B.y = BR; B.vy = Math.abs(B.vy); m.ev.push({ k: 'wall', x: B.x, y: B.y }); }
      else if (B.y > H - BR) { B.y = H - BR; B.vy = -Math.abs(B.vy); m.ev.push({ k: 'wall', x: B.x, y: B.y }); }
      if (m.orb && Math.hypot(B.x - W / 2, B.y - H / 2) < BR + 24) { const kk = m.orb.k; m.orb = null; m.orbT = 4 + Math.random() * 3; ability(kk); }
      if (B.vx < 0 && B.x - BR <= PX0 - 1 && B.x > 20 && Math.abs(B.y - P[0].y) < P[0].h / 2 + BR) { hit(0); break; }
      if (B.vx > 0 && B.x + BR >= PX1 + 1 && B.x < 780 && Math.abs(B.y - P[1].y) < P[1].h / 2 + BR) { hit(1); break; }
    }
    if (B.x < -20) point(1); else if (B.x > W + 20) point(0);
  };

  /* ---- en línea: el anfitrión manda una foto del estado y el invitado la copia ---- */
  const r1 = (v) => Math.round(v * 10) / 10;
  m.snapshot = () => ({
    b: [r1(m.B.x), r1(m.B.y), r1(m.B.vx), r1(m.B.vy)], h: m.B.hot > 0 ? 1 : 0, g: m.B.gh > 0 ? 1 : 0, w: m.B.wob > 0 ? 1 : 0, l: m.B.last,
    p: [r1(m.P[0].y), r1(m.P[1].y), r1(m.P[0].h), r1(m.P[1].h), m.P[0].slow > 0 ? 1 : 0, m.P[1].slow > 0 ? 1 : 0],
    sc: m.sc.slice(), o: m.orb ? [m.orb.k, r1(m.orb.t)] : 0, s: m.serveT > 0 ? 1 : 0,
  });
  m.applySnap = (s, dt) => {
    const B = m.B || (m.serve(1), m.B), ox = B.vx, oy = B.vy;
    B.x = s.b[0]; B.y = s.b[1]; B.vx = s.b[2]; B.vy = s.b[3]; B.hot = s.h; B.gh = s.g; B.last = s.l;
    if (ox && B.vx && Math.sign(ox) !== Math.sign(B.vx)) m.ev.push({ k: 'hit', i: B.vx > 0 ? 0 : 1, x: B.x, y: B.y, sp: Math.hypot(B.vx, B.vy) });
    else if (oy && B.vy && Math.sign(oy) !== Math.sign(B.vy)) m.ev.push({ k: 'wall', x: B.x, y: B.y });
    m.P[0].y = s.p[0]; m.P[0].h = s.p[2]; m.P[1].h = s.p[3]; m.P[0].slow = s.p[4]; m.P[1].slow = s.p[5];
    const p1 = m.P[1]; p1.y += (p1.ty - p1.y) * Math.min(1, (dt || 0.016) * 18);
    if (s.sc[0] !== m.sc[0] || s.sc[1] !== m.sc[1]) { const w = s.sc[0] !== m.sc[0] ? 0 : 1; m.sc = s.sc.slice(); m.ev.push({ k: 'point', w, x: B.x, y: B.y }); }
    m.orb = s.o ? { k: s.o[0], t: s.o[1], life: 6 } : null; m.serveT = s.s;
  };
  m.serve(Math.random() < 0.5 ? 1 : -1);
  return m;
}
