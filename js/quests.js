/* quests.js · misiones diarias, logros y recompensa diaria */
import { t } from './i18n.js';
import { P, save, lvl } from './state.js';
import { $, esc, today, toast, screen, sfx, bus, fmt } from './util.js';
import { rankOf, rankName, TI } from './ranks.js';

/* ---------- misiones del día ---------- */
const POOL = [
  { id: 'play', ev: 'game', goal: 3, pc: 40 }, { id: 'play5', ev: 'game', goal: 5, pc: 70, k: 'play' },
  { id: 'win', ev: 'win', goal: 2, pc: 60 }, { id: 'win3', ev: 'win', goal: 3, pc: 90, k: 'win' },
  { id: 'points', ev: 'point', goal: 25, pc: 50 }, { id: 'points2', ev: 'point', goal: 50, pc: 80, k: 'points' },
  { id: 'orbs', ev: 'orb', goal: 3, pc: 45 }, { id: 'rally', ev: 'rally', goal: 12, pc: 55, max: true },
];
function seed(s) { let h = 0; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0; return () => ((h = (h * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff); }
export function ensureMissions() {
  const d = today();
  if (!P.msn || P.msn.d !== d) {
    const r = seed(d + P.id), pool = POOL.slice(), list = [];
    while (list.length < 3 && pool.length) { const x = pool.splice(Math.floor(r() * pool.length), 1)[0]; if (!list.some((y) => (y.k || y.id) === (x.k || x.id))) list.push(x.id); }
    P.msn = { d, list, p: {}, c: {} }; save();
  }
  return P.msn;
}
export function track(ev, n = 1) {
  const m = ensureMissions();
  m.list.forEach((id) => {
    const q = POOL.find((x) => x.id === id); if (!q || q.ev !== ev || m.c[id]) return;
    m.p[id] = q.max ? Math.max(m.p[id] || 0, n) : Math.min(q.goal, (m.p[id] || 0) + n);
  });
}
export const missionsReady = () => { const m = ensureMissions(); return m.list.some((id) => !m.c[id] && (m.p[id] || 0) >= POOL.find((x) => x.id === id).goal); };

/* ---------- logros ---------- */
const mk = (id, name, p, test, pc, gm = 0) => ({ id, name, p, test, pc, gm });
export const ACH = [
  mk('w1', 'ach_win', { n: 1 }, () => P.w >= 1, 50), mk('w10', 'ach_win', { n: 10 }, () => P.w >= 10, 150), mk('w50', 'ach_win', { n: 50 }, () => P.w >= 50, 400, 3),
  mk('w100', 'ach_win', { n: 100 }, () => P.w >= 100, 800, 8), mk('g25', 'ach_play', { n: 25 }, () => P.games >= 25, 100), mk('g100', 'ach_play', { n: 100 }, () => P.games >= 100, 350, 3),
  mk('s3', 'ach_streak', { n: 3 }, () => P.bestStreak >= 3, 100), mk('s5', 'ach_streak', { n: 5 }, () => P.bestStreak >= 5, 250, 2), mk('s10', 'ach_streak', { n: 10 }, () => P.bestStreak >= 10, 600, 6),
  mk('r1', 'ach_rank', { i: 1 }, () => rankOf(P.rp).t >= 1, 150), mk('r2', 'ach_rank', { i: 2 }, () => rankOf(P.rp).t >= 2, 300, 2), mk('r3', 'ach_rank', { i: 3 }, () => rankOf(P.rp).t >= 3, 500, 4),
  mk('r5', 'ach_rank', { i: 5 }, () => rankOf(P.rp).t >= 5, 900, 8), mk('r7', 'ach_rank', { i: 7 }, () => rankOf(P.rp).t >= 7, 2000, 25),
  mk('l5', 'ach_lvl', { n: 5 }, () => lvl() >= 5, 100), mk('l20', 'ach_lvl', { n: 20 }, () => lvl() >= 20, 400, 3), mk('l50', 'ach_lvl', { n: 50 }, () => lvl() >= 50, 1000, 10),
  mk('b3', 'ach_buy', { n: 3 }, () => (P.inv || []).length >= 3, 100), mk('b10', 'ach_buy', { n: 10 }, () => (P.inv || []).length >= 10, 400, 4),
  mk('sh', 'ach_shut', { n: 1 }, () => P.shut >= 1, 120), mk('hw', 'ach_hard', { n: 5 }, () => P.hardWins >= 5, 300, 3),
];
const achName = (a) => t(a.name, Object.assign({}, a.p, a.p.i != null ? { r: a.p.i >= 7 ? t('rank_7') : t('rank_' + a.p.i) } : {}));
export function checkAch() {
  const got = [];
  ACH.forEach((a) => { if (!P.ach[a.id] && a.test()) { P.ach[a.id] = 1; P.pc += a.pc; P.gems += a.gm; got.push(a); } });
  if (got.length) { save(); sfx('hard'); got.forEach((a, i) => setTimeout(() => toast('🏆 ' + achName(a) + '  +' + a.pc + '🪙' + (a.gm ? ' +' + a.gm + '💎' : ''), 'good'), i * 700)); }
  return got;
}

/* ---------- recompensa diaria ---------- */
const DAILY = [{ pc: 30 }, { pc: 40 }, { pc: 50 }, { pc: 60, gm: 1 }, { pc: 80 }, { pc: 100, gm: 2 }, { pc: 150, gm: 5 }];
export function dailyState() {
  const d = today(), last = P.daily.last;
  if (last === d) return { can: false, idx: ((P.daily.n || 1) - 1) % 7 };
  const y = new Date(); y.setDate(y.getDate() - 1);
  const cont = last === y.toLocaleDateString('en-CA');
  return { can: true, idx: cont ? (P.daily.n || 0) % 7 : 0, reset: !cont };
}
export function openDaily() {
  const sc = screen({ id: 'scDaily', title: t('daily_title') });
  const draw = () => {
    const st = dailyState();
    sc.body.innerHTML = '<div class="muted c">' + esc(t('daily_sub')) + '</div><div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px">' +
      DAILY.map((r, i) => {
        const done = !st.can ? i <= st.idx : i < st.idx, cur = st.can && i === st.idx;
        return '<div class="li" style="flex-direction:column;justify-content:center;gap:2px;padding:8px 4px;' + (i === 6 ? 'grid-column:span 2;' : '') + (cur ? 'border-color:var(--gold);box-shadow:0 0 16px rgba(255,194,26,.6);' : '') + (done ? 'opacity:.5;' : '') + '">' +
          '<span class="tiny">' + esc(t('day_n', { n: i + 1 })) + '</span><b>' + (done ? '✅' : '+' + r.pc + ' 🪙') + '</b>' + (r.gm ? '<small>+' + r.gm + ' 💎</small>' : '') + '</div>';
      }).join('') + '</div>';
    sc.foot.innerHTML = '';
    const b = document.createElement('button'); b.className = 'b3d gold lg block'; b.disabled = !st.can;
    b.textContent = st.can ? t('daily_claim') : t('daily_done'); sc.foot.appendChild(b);
    b.onclick = () => {
      const s2 = dailyState(); if (!s2.can) return; const r = DAILY[s2.idx];
      P.pc += r.pc; P.gems += r.gm || 0; P.daily = { last: today(), n: s2.idx + 1 }; save(); sfx('coin');
      toast('+' + r.pc + ' 🪙' + (r.gm ? ' +' + r.gm + ' 💎' : ''), 'good'); draw();
    };
  };
  draw(); return sc;
}
export const dailyReady = () => dailyState().can;

/* ---------- pantallas ---------- */
export function openMissions() {
  const sc = screen({ id: 'scMsn', title: t('msn_title') });
  const draw = () => {
    const m = ensureMissions();
    sc.body.innerHTML = '<div class="muted c">' + esc(t('msn_sub')) + '</div>';
    m.list.forEach((id) => {
      const q = POOL.find((x) => x.id === id), pr = m.p[id] || 0, ok = pr >= q.goal, cl = !!m.c[id];
      const li = document.createElement('div'); li.className = 'li';
      li.innerHTML = '<div class="grow"><b>' + esc(t('msn_' + (q.k || q.id).replace(/\d/g, ''), { n: q.goal })) + '</b><div class="bar" style="margin-top:6px"><i style="width:' + Math.min(100, pr / q.goal * 100) + '%"></i></div><small>' + pr + ' / ' + q.goal + '</small></div>';
      const b = document.createElement('button'); b.className = 'b3d sm ' + (cl ? 'ghost' : ok ? 'gold' : 'ghost'); b.disabled = cl || !ok;
      b.textContent = cl ? '✅' : '+' + q.pc + ' 🪙';
      b.onclick = () => { m.c[id] = 1; P.pc += q.pc; save(); sfx('coin'); toast('+' + q.pc + ' 🪙', 'good'); draw(); bus.emit('badges'); };
      li.appendChild(b); sc.body.appendChild(li);
    });
    sc.body.insertAdjacentHTML('beforeend', '<div class="muted c">' + esc(t('msn_reset')) + '</div>');
  };
  draw();
}
export function openAch() {
  const sc = screen({ id: 'scAch', title: t('ach_title'), wide: true });
  const n = ACH.filter((a) => P.ach[a.id]).length;
  sc.body.innerHTML = '<div class="muted c">' + esc(t('ach_sub', { a: n, b: ACH.length })) + '</div>';
  ACH.forEach((a) => {
    const ok = !!P.ach[a.id], li = document.createElement('div'); li.className = 'li'; li.style.opacity = ok ? 1 : 0.6;
    li.innerHTML = '<span style="font-size:26px">' + (ok ? '🏆' : '🔒') + '</span><div class="grow"><b>' + esc(achName(a)) + '</b><small>+' + fmt(a.pc) + ' 🪙' + (a.gm ? ' +' + a.gm + ' 💎' : '') + '</small></div>' + (ok ? '<span class="chip ok">✔</span>' : '');
    sc.body.appendChild(li);
  });
}
