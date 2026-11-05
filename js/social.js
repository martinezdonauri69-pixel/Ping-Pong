/* social.js · ranking mundial, perfiles de otros jugadores, amigos, reportes y buzón */
import { t } from './i18n.js';
import { P, acct, save, lvl } from './state.js';
import { AVS, CARDS } from './data/avatars.js';
import { X, init, topPlayers, getDoc, docRef } from './net.js';
import { rankOf, rankName, badge } from './ranks.js';
import { esc, toast, modal, screen, sfx, fmt, bus } from './util.js';

export const avatarHtml = (av, cls = '') => '<span class="avatar ' + cls + '" style="background-image:url(&quot;' + (AVS[av || 0] || AVS[0]) + '&quot;)"></span>';
export const verMark = (p) => (p.ver === true ? '<i class="vf" title="✓">✓</i>' : p.gver === true ? '<i class="vf g">✓</i>' : '');
const needAcct = () => { if (acct.guest) { toast(t('need_account'), 'bad'); sfx('deny'); bus.emit('openAuth'); return true; } return false; };

/* ---------- ranking ---------- */
export async function openRanking() {
  const sc = screen({ id: 'scRank', title: t('rank_board'), wide: true });
  sc.body.innerHTML = '<div class="muted c">' + esc(t('loading')) + '</div>';
  try {
    const list = await topPlayers(50);
    sc.body.innerHTML = '';
    if (!list.length) { sc.body.innerHTML = '<div class="muted c">' + esc(t('empty')) + '</div>'; return; }
    list.forEach((p, i) => {
      const r = rankOf(p.rp || 0), me = p.id === P.id, li = document.createElement('div');
      li.className = 'li tap' + (me ? ' me' : '');
      li.innerHTML = '<b style="width:30px;text-align:center;font-size:16px">' + (i < 3 ? ['🥇', '🥈', '🥉'][i] : i + 1) + '</b>' + avatarHtml(p.av) +
        '<div class="grow"><b>' + esc(p.name || '?') + verMark(p) + '</b><small>' + esc(rankName(r)) + ' · ' + fmt(p.rp || 0) + ' RP · ' + esc(t('lv')) + ' ' + (p.level || 1) + '</small></div>' + badge(r.t, r.d, 40, true);
      li.onclick = () => { sfx('click'); openPlayer(p); };
      sc.body.appendChild(li);
    });
  } catch (e) { sc.body.innerHTML = '<div class="err">' + esc(e.message || t('err_net')) + '</div>'; }
}

/* ---------- perfil de otro jugador ---------- */
export async function openPlayer(p) {
  const r = rankOf(p.rp || 0), me = p.id === P.id;
  const sc = screen({ id: 'scPlayer', title: t('profile') });
  const card = CARDS[p.card || 0] || CARDS[0];
  sc.body.innerHTML = '<div class="col c" style="align-items:center"><div style="width:100%;height:56px;border-radius:14px;background:url(&quot;' + card.u + '&quot;) center/cover;opacity:.9"></div>' +
    '<div style="margin-top:-34px">' + avatarHtml(p.av, 'lg') + '</div><h3 style="font-size:20px;color:#fff;margin:2px 0">' + esc(p.name) + verMark(p) + '</h3>' +
    '<div class="muted">ID ' + esc(p.id) + ' · ' + esc(t('lv')) + ' ' + (p.level || 1) + '</div>' + badge(r.t, r.d, 90) + '<b>' + esc(rankName(r)) + '</b>' +
    '<div class="row wrap" style="justify-content:center"><span class="chip">🏆 ' + (p.w || 0) + '</span><span class="chip">💔 ' + (p.l || 0) + '</span><span class="chip">⭐ <span id="stN">…</span></span></div></div>';
  if (X.ready) { try { const c = await X.FS.getCountFromServer(X.FS.query(X.FS.collection(X.db, 'stars'), X.FS.where('to', '==', p.id))); const e = sc.el.querySelector('#stN'); if (e) e.textContent = c.data().count; } catch (e) { const el = sc.el.querySelector('#stN'); if (el) el.textContent = p.stars || 0; } }
  if (me) return;
  const act = (cls, txt, fn) => { const b = document.createElement('button'); b.className = 'b3d sm ' + cls; b.textContent = txt; b.onclick = fn; sc.foot.appendChild(b); };
  act('gold', '⭐ ' + t('give_star'), async () => {
    if (needAcct()) return;
    try { await X.FS.setDoc(docRef('stars/' + P.id + '_' + p.id), { from: P.id, to: p.id, at: Date.now() }); toast('⭐', 'good'); sfx('coin'); } catch (e) { toast(t('err_perm'), 'bad'); }
  });
  act('blue', '➕ ' + t('add_friend'), async () => {
    if (needAcct()) return;
    try { await X.FS.setDoc(docRef('reqs/' + P.id + '_' + p.id), { from: P.id, to: p.id, fn: P.name, st: 'p', at: Date.now() }); toast(t('req_sent'), 'good'); } catch (e) { toast(t('err_perm'), 'bad'); }
  });
  act('red', '🚩 ' + t('report'), () => {
    if (needAcct()) return;
    const reasons = ['rep_cheat', 'rep_abuse', 'rep_name', 'rep_other'];
    modal({ title: t('report'), body: '<div class="col">' + reasons.map((k, i) => '<button class="b3d ghost block" data-r="' + k + '">' + esc(t(k)) + '</button>').join('') + '</div>', buttons: [{ t: t('cancel'), cls: 'ghost' }] });
    document.querySelectorAll('#modals [data-r]').forEach((b) => { b.onclick = async () => {
      document.querySelector('#modals .mdl').remove();
      try { await X.FS.setDoc(docRef('reports/' + P.id + '_' + p.id + '_' + Date.now()), { from: P.id, to: p.id, tn: p.name, r: b.dataset.r, st: 'new', at: Date.now() }); toast(t('rep_sent'), 'good'); } catch (e) { toast(t('err_perm'), 'bad'); }
    }; });
  });
}

/* ---------- amigos ---------- */
export async function openFriends(onChallenge) {
  if (needAcct()) return;
  const sc = screen({ id: 'scFr', title: t('friends'), wide: true });
  sc.body.innerHTML = '<div class="muted c">' + esc(t('loading')) + '</div>';
  await init();
  const row = document.createElement('div'); row.className = 'row';
  row.innerHTML = '<input class="inp" id="frId" inputmode="numeric" maxlength="8" placeholder="' + esc(t('friend_id')) + '"><button class="b3d blue" id="frGo">➕</button>';
  const draw = async () => {
    sc.body.innerHTML = ''; sc.body.appendChild(row);
    try {
      const q = (f, v) => X.FS.getDocs(X.FS.query(X.FS.collection(X.db, 'reqs'), X.FS.where(f, '==', v)));
      const [inn, out] = await Promise.all([q('to', P.id), q('from', P.id)]);
      const incoming = inn.docs.filter((d) => d.data().st === 'p'), friends = [];
      inn.docs.forEach((d) => { if (d.data().st === 'ok') friends.push(d.data().from); });
      out.docs.forEach((d) => { if (d.data().st === 'ok') friends.push(d.data().to); });
      if (incoming.length) {
        sc.body.insertAdjacentHTML('beforeend', '<h3>' + esc(t('requests')) + '</h3>');
        incoming.forEach((d) => {
          const r = d.data(), li = document.createElement('div'); li.className = 'li';
          li.innerHTML = '<div class="grow"><b>' + esc(r.fn || r.from) + '</b><small>ID ' + esc(r.from) + '</small></div>';
          const ok = document.createElement('button'); ok.className = 'b3d sm green'; ok.textContent = '✔';
          const no = document.createElement('button'); no.className = 'b3d sm red'; no.textContent = '✕';
          ok.onclick = async () => { await X.FS.updateDoc(d.ref, { st: 'ok' }); sfx('coin'); draw(); };
          no.onclick = async () => { await X.FS.deleteDoc(d.ref); draw(); };
          li.append(ok, no); sc.body.appendChild(li);
        });
      }
      sc.body.insertAdjacentHTML('beforeend', '<h3>' + esc(t('friends')) + ' (' + friends.length + ')</h3>');
      if (!friends.length) sc.body.insertAdjacentHTML('beforeend', '<div class="muted c">' + esc(t('no_friends')) + '</div>');
      for (const id of [...new Set(friends)]) {
        const p = await getDoc('players/' + id).catch(() => null); if (!p) continue;
        const r = rankOf(p.rp || 0), li = document.createElement('div'); li.className = 'li';
        li.innerHTML = avatarHtml(p.av) + '<div class="grow"><b>' + esc(p.name) + verMark(p) + '</b><small>' + esc(rankName(r)) + '</small></div>';
        const v = document.createElement('button'); v.className = 'b3d sm ghost'; v.textContent = '👤'; v.onclick = () => openPlayer(p);
        const c = document.createElement('button'); c.className = 'b3d sm red'; c.textContent = '⚔️'; c.onclick = () => { sc.close(); onChallenge && onChallenge(p); };
        li.append(v, c); sc.body.appendChild(li);
      }
    } catch (e) { sc.body.insertAdjacentHTML('beforeend', '<div class="err">' + esc(t('err_perm')) + '</div>'); }
    sc.body.prepend(row);
    row.querySelector('#frGo').onclick = async () => {
      const id = row.querySelector('#frId').value.trim();
      if (!/^\d{8}$/.test(id) || id === P.id) { toast(t('err_id'), 'bad'); return; }
      const p = await getDoc('players/' + id).catch(() => null);
      if (!p) { toast(t('not_found'), 'bad'); return; }
      try { await X.FS.setDoc(docRef('reqs/' + P.id + '_' + id), { from: P.id, to: id, fn: P.name, st: 'p', at: Date.now() }); toast(t('req_sent'), 'good'); } catch (e) { toast(t('err_perm'), 'bad'); }
    };
  };
  draw();
}

/* ---------- buzón: avisos del admin, regalos y mensajes ---------- */
export async function inboxCount() {
  if (acct.guest || !X.ready) return 0;
  try { const s = await X.FS.getDocs(X.FS.query(X.FS.collection(X.db, 'inbox'), X.FS.where('toUid', '==', acct.uid))); return s.docs.filter((d) => !d.data().read && !d.data().claimed).length; } catch (e) { return 0; }
}
export async function openInbox() {
  if (needAcct()) return;
  const sc = screen({ id: 'scInbox', title: t('inbox') });
  sc.body.innerHTML = '<div class="muted c">' + esc(t('loading')) + '</div>'; await init();
  try {
    const s = await X.FS.getDocs(X.FS.query(X.FS.collection(X.db, 'inbox'), X.FS.where('toUid', '==', acct.uid)));
    const ann = await X.FS.getDocs(X.FS.query(X.FS.collection(X.db, 'announcements'), X.FS.orderBy('at', 'desc'), X.FS.limit(5))).catch(() => ({ docs: [] }));
    sc.body.innerHTML = '';
    ann.docs.forEach((d) => { const a = d.data(); sc.body.insertAdjacentHTML('beforeend', '<div class="li"><span style="font-size:24px">📢</span><div class="grow"><b>' + esc(a.title || t('announce')) + '</b><small>' + esc(a.text || '') + '</small></div></div>'); });
    const docs = s.docs.sort((a, b) => (b.data().at || 0) - (a.data().at || 0));
    if (!docs.length && !ann.docs.length) sc.body.innerHTML = '<div class="muted c">' + esc(t('empty')) + '</div>';
    docs.forEach((d) => {
      const m = d.data(), li = document.createElement('div'); li.className = 'li';
      li.innerHTML = '<span style="font-size:24px">' + (m.pc || m.gems ? '🎁' : '✉️') + '</span><div class="grow"><b>' + esc(m.title || t('msg')) + '</b><small>' + esc(m.text || '') + '</small></div>';
      if ((m.pc || m.gems) && !m.claimed) {
        const b = document.createElement('button'); b.className = 'b3d sm gold'; b.textContent = '+' + (m.pc || 0) + '🪙 ' + (m.gems ? '+' + m.gems + '💎' : '');
        b.onclick = async () => { try { await X.FS.updateDoc(d.ref, { claimed: true, read: true }); P.pc += m.pc || 0; P.gems += m.gems || 0; save(); sfx('coin'); b.remove(); } catch (e) { toast(t('err_perm'), 'bad'); } };
        li.appendChild(b);
      } else if (!m.read) X.FS.updateDoc(d.ref, { read: true }).catch(() => {});
      sc.body.appendChild(li);
    });
  } catch (e) { sc.body.innerHTML = '<div class="err">' + esc(t('err_perm')) + '</div>'; }
}
