/* lobby.js · pantalla principal, perfil, cuenta, ajustes, idiomas, rangos y animación de resultado */
import { t, LANGS, lang, setLang } from './i18n.js';
import { P, SET, THEMES, acct, saveSet, applyLook, save, lvl, lvProg, XP_PER_LV } from './state.js';
import { AVS, AVL, CARDS } from './data/avatars.js';
import { rankOf, rankName, rankProg, badge, TI, LEGEND_AT } from './ranks.js';
import { $, esc, fmt, toast, modal, screen, sfx, bus, countUp, confirmBox, ls, tilt } from './util.js';
import { unlock, applyVol, music } from './audio.js';
import { X, login, register, logout } from './net.js';
import { openShop } from './shop.js';
import { openMissions, openAch, openDaily, missionsReady, dailyReady } from './quests.js';
import { openRanking, openFriends, openInbox, inboxCount, avatarHtml, verMark } from './social.js';
import { openAdmin } from './admin.js';
import { invite, quickMatch } from './online.js';
import * as Tuto from './tutorial.js';

let H = null;               /* manejadores que da main.js: { play(opts), mode() } */
export const bindMain = (h) => { H = h; };

/* ---------------------------------------------------------------- construcción */
export function build() {
  const l = document.createElement('div'); l.id = 'lobby'; l.className = 'scr'; l.hidden = true;
  l.innerHTML = `
  <div class="hdr">
    <button class="prof" id="lbProf"><span id="lbAv"></span><span class="pt"><span class="nm" id="lbNm"></span><small id="lbLv"></small><div class="bar"><i id="lbXp"></i></div></span><span class="rkm" id="lbRank" role="button" tabindex="0"><span id="lbBadge"></span><b id="lbRname"></b></span></button>
    <span class="cur" id="lbCoins"><i class="coin3d">$</i><b id="lbPc">0</b></span>
    <span class="cur gm" id="lbGems"><i class="gem3d"></i><b id="lbGm">0</b></span>
    <button class="b3d ghost ib3d" id="lbInbox" style="position:relative" data-i-ti="inbox">✉️<i class="dot" id="dInbox"></i></button>
    <button class="b3d ghost ib3d" id="lbSet" data-i-ti="settings">⚙️</button>
  </div>
  <div class="side" id="lbSide"></div>
  <div class="hero"><div class="mono"><span>D</span><i>.</i><span>M</span><i>.</i><span>R</span></div><div class="ppt">PING PONG</div></div>
  <button class="b3d green lg block playbtn" id="lbPlay"><span id="lbPlayT">▶</span><small id="lbPlayS"></small></button>
  <div class="modes"><div class="mlabel"><i></i><span id="lbModes"></span><i></i></div><div class="tiles" id="lbTiles"></div></div>
  <div class="navbar" id="lbNav"></div>
  <button class="b3d ghost sm langbtn" id="lbLang"></button>`;
  $('app').appendChild(l);
  $('lbProf').onclick = () => { sfx('click'); openProfile(); };
  $('lbInbox').onclick = () => { sfx('click'); openInbox(); };
  $('lbSet').onclick = () => { sfx('click'); openSettings(); };
  $('lbRank').onclick = (e) => { e.stopPropagation(); sfx('click'); openRankInfo(); };
  $('lbPlay').onclick = () => { if (Tuto.isRunning()) return; sfx('click'); H.play({ mode: 'ranked' }); };
  $('lbLang').onclick = () => { sfx('click'); openLang(); };
  bus.on('lang', render); bus.on('profile', render); bus.on('auth', () => { render(); badges(); }); bus.on('badges', badges);
  render(); badges();
}

const TILES = [
  ['train', '🎯', 'tl_train', '#19d3ff', () => trainMenu()],
  ['local', '👥', 'tl_local', '#ff7a1a', () => H.play({ mode: 'local' })],
  ['online', '🌐', 'tl_online', '#8b3dff', () => onlineMenu()],
  ['shop', '🛒', 'tl_shop', '#ffc21a', () => openShop()],
  ['msn', '📋', 'tl_missions', '#19e6a0', () => openMissions()],
  ['daily', '🎁', 'tl_daily', '#ff3df2', () => openDaily()],
  ['rank', '🌍', 'tl_ranking', '#2f7bff', () => openRanking()],
  ['fr', '🤝', 'tl_friends', '#ff4d6d', () => openFriends((p) => invite(p))],
  ['ach', '🏆', 'tl_ach', '#e8c200', () => openAch()],
];
/* posicion de cada boton en el lobby: modos (centro), laterales (derecha) y barra inferior */
const GROUP = { train: 'modes', local: 'modes', online: 'modes', msn: 'side', daily: 'side', shop: 'nav', rank: 'nav', fr: 'nav', ach: 'nav', adm: 'nav' };
const MODES_LBL = { es: 'MODOS DE JUEGO', en: 'GAME MODES' };
export const targets = () => ({ coins: $('lbCoins'), rank: $('lbRank'), play: $('lbPlay'), shop: document.querySelector('[data-tile=shop]') });

export function render() {
  const l = $('lbPlay'); if (!l) return;
  const r = rankOf(P.rp), tr = TI[r.t];
  $('lbAv').innerHTML = avatarHtml(P.av);
  $('lbNm').innerHTML = esc(P.name) + verMark(P);
  $('lbLv').textContent = t('lv') + ' ' + lvl();
  $('lbXp').style.width = Math.round(lvProg() * 100) + '%';
  $('lbPc').textContent = fmt(P.pc); $('lbGm').textContent = fmt(P.gems);
  $('lbBadge').innerHTML = badge(r.t, r.d, 30);
  $('lbRname').textContent = rankName(r);
  $('lbRank').style.setProperty('--rc', tr.gl);
  $('lbRank').title = r.hi == null ? fmt(P.rp) + ' RP · MAX' : fmt(P.rp) + ' / ' + fmt(r.hi) + ' RP';
  $('lbModes').textContent = MODES_LBL[lang()] || MODES_LBL.en;
  $('lbPlayT').textContent = '▶ ' + t('play');
  $('lbPlayS').textContent = t('play_sub');
  $('lbLang').textContent = (LANGS.find((x) => x[0] === lang()) || LANGS[0])[2] + ' ' + (LANGS.find((x) => x[0] === lang()) || LANGS[0])[1];
  document.querySelectorAll('#lobby [data-i]').forEach((e) => { e.textContent = t(e.dataset.i); });
  document.querySelectorAll('#lobby [data-i-ti]').forEach((e) => { e.title = t(e.dataset.iTi); });
  const list = TILES.slice(); if (X.admin) list.push(['adm', '👑', 'tl_admin', '#ffd21f', () => openAdmin()]);
  const slots = { modes: $('lbTiles'), side: $('lbSide'), nav: $('lbNav') }; Object.values(slots).forEach((e) => { e.innerHTML = ''; });
  list.forEach(([k, ic, tk, c, fn]) => {
    const zone = GROUP[k] || 'modes', b = document.createElement('button'); b.dataset.tile = k; b.style.setProperty('--tc', c);
    b.className = zone === 'nav' ? 'nv' : zone === 'side' ? 'tile sd' : 'tile';
    b.innerHTML = '<span class="ic">' + ic + '</span><b>' + esc(t(tk)) + '</b>' + (zone === 'side' ? '<em>›</em>' : '') + (k === 'msn' || k === 'daily' ? '<i class="dot" id="d_' + k + '"></i>' : '');
    b.onclick = () => { sfx('click'); fn(); }; slots[zone].appendChild(b);
  });
  $('lbNav').hidden = !$('lbNav').children.length;
  badges();
}
export async function badges() {
  const set = (id, on) => { const e = $(id); if (e) e.classList.toggle('on', !!on); };
  set('d_msn', missionsReady()); set('d_daily', dailyReady());
  set('dInbox', (await inboxCount()) > 0);
}
export const show = (on) => { const l = $('lobby'); if (l) { l.hidden = !on; if (on) { l.classList.remove('anim'); void l.offsetWidth; l.classList.add('anim'); } } };

/* ---------------------------------------------------------------- menús pequeños */
function trainMenu() {
  const m = modal({ title: t('tl_train'), body: '<div class="muted">' + esc(t('train_sub')) + '</div>', buttons: [
    { t: '🟢 ' + t('bot_easy'), cls: 'green', fn: () => H.play({ mode: 'train', diff: 'easy' }) },
    { t: '🟡 ' + t('bot_mid'), cls: 'gold', fn: () => H.play({ mode: 'train', diff: 'mid' }) },
    { t: '🔴 ' + t('bot_hard'), cls: 'red', fn: () => H.play({ mode: 'train', diff: 'hard' }) },
    { t: t('cancel'), cls: 'ghost' }] });
  m.el.querySelector('.sc-f').style.flexDirection = 'column';
}
function onlineMenu() {
  const m = modal({ title: '🌐 ' + t('tl_online'), body: '<div class="muted">' + esc(t('online_sub')) + '</div>', buttons: [
    { t: '🔎 ' + t('quick_match'), cls: 'violet', fn: () => quickMatch() },
    { t: '🤝 ' + t('invite_friend'), cls: 'blue', fn: () => openFriends((p) => invite(p)) },
    { t: t('cancel'), cls: 'ghost' }] });
  m.el.querySelector('.sc-f').style.flexDirection = 'column';
}

/* ---------------------------------------------------------------- idioma */
export function openLang(after) {
  const sc = screen({ id: 'scLang', title: '🌐 ' + t('language') });
  const g = document.createElement('div'); g.style.cssText = 'display:grid;grid-template-columns:repeat(2,1fr);gap:8px';
  LANGS.forEach(([c, n, f]) => {
    const b = document.createElement('button'); b.className = 'b3d ' + (c === lang() ? 'green' : 'ghost'); b.textContent = f + ' ' + n;
    b.onclick = async () => { sfx('click'); await setLang(c); sc.close(); if (after) after(); }; g.appendChild(b);
  });
  sc.body.appendChild(g);
}

/* ---------------------------------------------------------------- ajustes */
export function openSettings() {
  const sc = screen({ id: 'scSet', title: '⚙️ ' + t('settings') });
  const sw = (k, label, fn) => { const r = document.createElement('div'); r.className = 'li'; r.innerHTML = '<b class="grow">' + esc(label) + '</b><span class="sw' + (SET[k] ? ' on' : '') + '"></span>'; r.onclick = () => { SET[k] = !SET[k]; r.querySelector('.sw').classList.toggle('on', SET[k]); saveSet(); sfx('click'); if (fn) fn(); }; sc.body.appendChild(r); };
  const sl = (k, label, fn) => { const r = document.createElement('div'); r.className = 'li'; r.innerHTML = '<b style="min-width:92px">' + esc(label) + '</b><input type="range" min="0" max="100" value="' + SET[k] + '">'; r.querySelector('input').oninput = (e) => { SET[k] = +e.target.value; saveSet(); fn && fn(); }; sc.body.appendChild(r); };
  const lb = document.createElement('button'); lb.className = 'b3d blue block'; lb.textContent = '🌐 ' + t('language') + ': ' + (LANGS.find((x) => x[0] === lang()) || LANGS[0])[1]; lb.onclick = () => openLang(() => { sc.close(); openSettings(); }); sc.body.appendChild(lb);
  sw('snd', '🔊 ' + t('sound'), applyVol);
  sl('mus', '🎵 ' + t('music'), applyVol); sl('sfx', '🔔 ' + t('sfx'), applyVol);
  sl('br', '☀️ ' + t('brightness'), applyLook);
  sw('vib', '📳 ' + t('vibration'));
  sw('hq', '✨ ' + t('hq'), () => bus.emit('quality'));
  const th = document.createElement('div'); th.className = 'li'; th.innerHTML = '<b class="grow">🎨 ' + esc(t('theme')) + '</b>';
  THEMES.forEach((x, i) => { const b = document.createElement('button'); b.className = 'b3d sm ib3d'; b.style.cssText = '--c1:' + x.a + ';--c2:' + x.b + ';width:36px;height:36px;min-height:36px;' + (SET.theme === i ? 'outline:3px solid #fff' : ''); b.onclick = () => { SET.theme = i; saveSet(); applyLook(); sc.close(); openSettings(); }; th.appendChild(b); });
  sc.body.appendChild(th);
  const tb = document.createElement('button'); tb.className = 'b3d gold block'; tb.textContent = '📖 ' + t('replay_tuto'); tb.onclick = () => { sc.close(); bus.emit('tutorial'); }; sc.body.appendChild(tb);
  sc.body.insertAdjacentHTML('beforeend', '<div class="muted c">D.M.R PING PONG · v2.0</div>');
}

/* ---------------------------------------------------------------- información de rangos */
export function openRankInfo() {
  const sc = screen({ id: 'scRI', title: '🏅 ' + t('ranks') });
  const me = rankOf(P.rp);
  sc.body.innerHTML = '<div class="muted c">' + esc(t('rank_how')) + '</div>';
  TI.forEach((x, i) => {
    const li = document.createElement('div'); li.className = 'li' + (me.t === i ? ' me' : '');
    const from = i < 7 ? TI.slice(0, i).reduce((a, y) => a + y.cost * 4, 0) : LEGEND_AT;
    li.innerHTML = badge(i, i < 7 ? 0 : -1, 54, true) + '<div class="grow"><b>' + esc(i === 7 ? t('rank_7') : t('rank_' + i)) + '</b><small>' + fmt(from) + '+ RP' + (i < 7 ? ' · ' + x.cost + ' RP / ' + t('division') : '') + '</small></div>' + (me.t === i ? '<span class="chip">' + esc(rankName(me)) + '</span>' : '');
    sc.body.appendChild(li);
  });
}

/* ---------------------------------------------------------------- perfil y cuenta */
export function openProfile() {
  const sc = screen({ id: 'scProf', title: t('profile'), wide: true });
  const r = rankOf(P.rp), card = CARDS[P.card] || CARDS[0];
  const head = document.createElement('div'); head.className = 'col c'; head.style.alignItems = 'center';
  head.innerHTML = '<div style="width:100%;height:64px;border-radius:14px;background:url(&quot;' + card.u + '&quot;) center/cover"></div><div style="margin-top:-38px">' + avatarHtml(P.av, 'lg') + '</div>' +
    '<h3 style="font-size:22px;color:#fff;margin:0">' + esc(P.name) + verMark(P) + '</h3><div class="muted">ID ' + esc(P.id) + (acct.guest ? ' · ' + esc(t('guest')) : '') + '</div>' +
    '<div style="width:100%"><div class="row" style="justify-content:space-between"><b>' + esc(t('lv')) + ' ' + lvl() + '</b><span class="tiny">' + fmt(P.xp % XP_PER_LV) + ' / ' + XP_PER_LV + ' XP</span></div><div class="bar"><i style="width:' + Math.round(lvProg() * 100) + '%"></i></div></div>' +
    '<div class="row wrap" style="justify-content:center"><span class="chip">🏆 ' + P.w + '</span><span class="chip">💔 ' + P.l + '</span><span class="chip">🔥 ' + P.streak + '</span><span class="chip">' + esc(rankName(r)) + '</span></div>';
  sc.body.appendChild(head);
  const sec = (title) => { const h = document.createElement('h3'); h.textContent = title; sc.body.appendChild(h); };
  sec(t('avatar'));
  const ag = document.createElement('div'); ag.style.cssText = 'display:grid;grid-template-columns:repeat(auto-fill,minmax(58px,1fr));gap:8px'; sc.body.appendChild(ag);
  AVS.forEach((u, i) => {
    const ok = lvl() >= AVL[i], b = document.createElement('button'); b.className = 'avatar'; b.style.cssText = 'width:100%;height:auto;aspect-ratio:1;background-image:url("' + u + '");' + (P.av === i ? 'border-color:var(--green);box-shadow:0 0 14px var(--green);' : '') + (ok ? '' : 'filter:grayscale(1) brightness(.5)');
    if (!ok) b.innerHTML = '<span style="font-size:12px;font-weight:900;text-shadow:0 1px 3px #000">🔒' + AVL[i] + '</span>';
    b.onclick = () => { if (!ok) { sfx('deny'); toast(t('unlock_lv', { n: AVL[i] }), 'bad'); return; } P.av = i; save(); sfx('click'); sc.close(); openProfile(); }; ag.appendChild(b);
  });
  sec(t('card'));
  const cg = document.createElement('div'); cg.style.cssText = 'display:grid;grid-template-columns:repeat(2,1fr);gap:8px'; sc.body.appendChild(cg);
  CARDS.forEach((c, i) => {
    const ok = lvl() >= c.l, b = document.createElement('button'); b.style.cssText = 'height:48px;border-radius:12px;background:url("' + c.u + '") center/cover;border:2.5px solid ' + (P.card === i ? 'var(--green)' : 'rgba(150,180,255,.4)') + ';color:#fff;font-weight:900;font-size:11px;text-shadow:0 1px 3px #000;' + (ok ? '' : 'filter:grayscale(1) brightness(.5)');
    b.textContent = (ok ? '' : '🔒' + c.l + ' ') + t('card_' + i); b.onclick = () => { if (!ok) { sfx('deny'); toast(t('unlock_lv', { n: c.l }), 'bad'); return; } P.card = i; save(); sfx('click'); sc.close(); openProfile(); }; cg.appendChild(b);
  });
  sec(t('account'));
  if (acct.guest) {
    sc.body.insertAdjacentHTML('beforeend', '<div class="muted">' + esc(t('guest_warn')) + '</div>');
    const a = document.createElement('button'); a.className = 'b3d gold block'; a.textContent = '🔐 ' + t('login') + ' / ' + t('register'); a.onclick = () => openAuth(); sc.body.appendChild(a);
  } else {
    const o = document.createElement('button'); o.className = 'b3d red block'; o.textContent = '🚪 ' + t('logout'); o.onclick = () => confirmBox(t('logout'), t('logout_q'), t('logout'), async () => { await logout(); sc.close(); toast(t('logged_out')); }); sc.body.appendChild(o);
  }
}

export function openAuth(tab = 'login') {
  const sc = screen({ id: 'scAuth', title: '🔐 ' + t('account') });
  const draw = () => {
    const reg = tab === 'register';
    sc.body.innerHTML = '<div class="row"><button class="b3d sm block ' + (reg ? 'ghost' : 'blue') + '" id="tL">' + esc(t('login')) + '</button><button class="b3d sm block ' + (reg ? 'blue' : 'ghost') + '" id="tR">' + esc(t('register')) + '</button></div>' +
      '<input class="inp" id="aU" autocomplete="username" maxlength="16" data-i-ph="username" placeholder="' + esc(t('username')) + '">' +
      '<input class="inp" id="aP" type="password" autocomplete="' + (reg ? 'new-password' : 'current-password') + '" placeholder="' + esc(t('password')) + '">' +
      (reg ? '<input class="inp" id="aE" type="email" autocomplete="email" placeholder="' + esc(t('email')) + '"><div class="muted">' + esc(t('reg_note')) + '</div>' : '') +
      '<div class="err" id="aErr"></div><button class="b3d green lg block" id="aGo">' + esc(reg ? t('register') : t('login')) + '</button>';
    $('tL').onclick = () => { tab = 'login'; draw(); }; $('tR').onclick = () => { tab = 'register'; draw(); };
    $('aGo').onclick = async () => {
      const b = $('aGo'), u = $('aU').value.trim(), p = $('aP').value; b.disabled = true; $('aErr').textContent = '';
      try { if (reg) await register(u, p, $('aE').value.trim()); else await login(u, p); sfx('win'); sc.close(); toast('✔ ' + t('welcome_n', { n: P.name }), 'good'); const pr = $('scProf'); if (pr) { pr.remove(); } }
      catch (e) { $('aErr').textContent = e.message || t('err_unknown'); sfx('deny'); b.disabled = false; }
    };
  };
  draw();
}
bus.on('openAuth', () => openAuth());

/* ---------------------------------------------------------------- animación de resultado (¡la de la victoria!) */
const confetti = (host, cols, n = 46) => {
  const px = document.createElement('div'); px.className = 'px';
  for (let i = 0; i < n; i++) { const s = document.createElement('s'), a = Math.random() * 6.283, d = 90 + Math.random() * 230; s.style.cssText = '--c:' + cols[i % cols.length] + ';--dx:' + Math.cos(a) * d + 'px;--dy:' + (Math.sin(a) * d - 40) + 'px;--dl:' + (0.4 + Math.random() * 0.5) + 's'; px.appendChild(s); }
  host.appendChild(px);
};
export function showResult(res, again) {
  if (!res || res.skip) { show(true); return; }
  show(true);
  const ranked = res.mode === 'ranked', r0 = rankOf(res.rp0), r1 = rankOf(res.rp1), up = ranked && res.win && r1.i > r0.i, dn = ranked && !res.win && r1.i < r0.i, tierUp = up && r1.t > r0.t;
  const o = document.createElement('div'); o.id = 'result'; o.className = 'scr dim';
  const shown = ranked ? r0 : r1, gc = TI[(up ? r1 : r0).t].gl; o.style.setProperty('--gc', gc);
  const title = res.quit ? t('quit_done') : res.draw ? t('draw') : res.win ? t('victory') : t('defeat');
  o.innerHTML = (res.win && !res.quit ? '<div class="crown" style="position:relative;top:0;font-size:46px;animation:crown 1.2s .3s both">👑</div>' : '') +
    '<div class="stage"><i class="ring"></i><i class="ring r2"></i><i class="ring r3"></i><span id="rsB">' + (ranked ? badge(shown.t, shown.d, 190) : '<span style="font-size:120px">' + (res.win ? '🏆' : res.draw ? '🤝' : '💪') + '</span>') + '</span></div>' +
    '<h2 style="color:' + (res.win && !res.quit ? 'var(--gold)' : '#ff9aa8') + '">' + esc(title) + '</h2><div class="muted" style="font-size:15px">' + res.sc[0] + ' : ' + res.sc[1] + '</div>' +
    (ranked ? '<div class="pts ' + (res.d >= 0 ? 'up' : 'dn') + '" id="rsP">' + (res.d > 0 ? '+' : '') + '0 RP</div><div class="bar"><i id="rsBar"></i></div><div class="tiny" id="rsN">' + esc(rankName(r0)) + '</div>' : '') +
    '<div class="rew">' + (res.pc ? '<span class="cur"><i class="coin3d">$</i>+' + res.pc + '</span>' : '') + (res.xp ? '<span class="chip">+' + res.xp + ' XP</span>' : '') + (res.shield ? '<span class="chip">🛡️ ' + esc(t('shield_used')) + '</span>' : '') + (res.boost ? '<span class="chip">🚀 ×1.5</span>' : '') + (res.lvUp ? '<span class="chip" style="color:var(--gold)">⬆ ' + esc(t('lv')) + ' ' + res.lvUp + '</span>' : '') + '</div>' +
    '<div class="btns"><button class="b3d blue lg" id="rsOk">' + esc(t('continue')) + '</button>' + (again ? '<button class="b3d green lg" id="rsAg">▶ ' + esc(t('play_again')) + '</button>' : '') + '</div>';
  $('app').appendChild(o);
  const done = (fn) => () => { sfx('click'); o.remove(); fn && fn(); };
  $('rsOk').onclick = done(); if (again) $('rsAg').onclick = done(again);
  sfx(res.win ? 'win' : res.draw ? 'point' : 'lose'); if (res.win && !res.quit) confetti(o.querySelector('.stage'), ['#ffd400', '#fff', '#19e6a0', gc]);
  if (!ranked) return;
  /* puntos y barra */
  setTimeout(() => {
    countUp($('rsP'), 0, Math.abs(res.d), 900, res.d > 0 ? '+' : res.d < 0 ? '−' : ''); $('rsP').insertAdjacentText('beforeend', ''); const p = $('rsP'); const fin = () => { p.textContent = (res.d > 0 ? '+' : res.d < 0 ? '−' : '') + Math.abs(res.d) + ' RP'; }; setTimeout(fin, 950);
    const bar = $('rsBar'); bar.style.transition = 'none'; bar.style.width = Math.round(rankProg(res.rp0) * 100) + '%'; void bar.offsetWidth; bar.style.transition = '';
    if (r1.i === r0.i) bar.style.width = Math.round(rankProg(res.rp1) * 100) + '%';
    else { bar.style.width = up ? '100%' : '0%'; }
  }, 600);
  if (up || dn) setTimeout(() => {
    const stage = o.querySelector('.stage'), sb = $('rsB'); sb.firstChild.classList.add('obadge'); sfx(tierUp ? 'fanfare' : 'rank');
    setTimeout(() => {
      sb.innerHTML = badge(r1.t, r1.d, 190); sb.firstChild.classList.add('nbadge'); $('rsN').textContent = rankName(r1); $('rsN').style.cssText = 'font-size:16px;color:' + gc + ';font-weight:900';
      const bar = $('rsBar'); bar.style.transition = 'none'; bar.style.width = up ? '0%' : '100%'; void bar.offsetWidth; bar.style.transition = ''; bar.style.width = Math.round(rankProg(res.rp1) * 100) + '%';
      if (up) { confetti(stage, [gc, '#fff', '#ffd400', '#ff3df2'], 70); const h = o.querySelector('h2'); h.textContent = (tierUp ? '🔥 ' : '⬆ ') + t('rank_up') + ' · ' + rankName(r1); h.style.color = gc; bus.emit('celebrate', [gc, '#ffffff']); }
      else { o.classList.add('shake'); const h = o.querySelector('h2'); h.textContent = '⬇ ' + rankName(r1); }
    }, 650);
  }, 1700);
}
