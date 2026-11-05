/* online.js · partidas en línea entre dos teléfonos (WebRTC; Firebase solo sirve para "presentarlos") */
import { t } from './i18n.js';
import { P, acct } from './state.js';
import { X, init, docRef } from './net.js';
import { esc, toast, modal, sfx, vib, bus } from './util.js';

export const NET = { busy: false, on: false, role: '', opp: null, pc: null, dc: null, rid: null, lastRx: 0, onStart: null, onMsg: null, onLost: null, unsub: [], to: 0 };
let waitBox = null;

const showWait = (title, txt, onCancel) => {
  closeWait();
  waitBox = modal({ title, body: '<div class="muted">' + esc(txt) + '</div><div class="pulse" style="font-size:34px;margin-top:8px">🌐</div>', buttons: [{ t: t('cancel'), cls: 'ghost', fn: () => { cleanup(); if (onCancel) onCancel(); } }] });
};
const closeWait = () => { if (waitBox) { waitBox.el.remove(); waitBox = null; } };

export function cleanup() {
  clearTimeout(NET.to);
  NET.unsub.forEach((f) => { try { f(); } catch (e) { /* nada */ } }); NET.unsub = [];
  try { if (NET.dc) NET.dc.close(); } catch (e) { /* nada */ }
  try { if (NET.pc) NET.pc.close(); } catch (e) { /* nada */ }
  if (X.ready && NET.rid && NET.role === 'h') X.FS.deleteDoc(docRef('rooms/' + NET.rid)).catch(() => {});
  Object.assign(NET, { busy: false, on: false, role: '', opp: null, pc: null, dc: null, rid: null });
  closeWait();
}
function fail(msg) { const was = NET.on; cleanup(); if (!was) { toast(msg || t('online_fail'), 'bad'); sfx('deny'); } else if (NET.onLost) NET.onLost(); }

export const nsend = (o) => { try { if (NET.dc && NET.dc.readyState === 'open') NET.dc.send(JSON.stringify(o)); } catch (e) { /* nada */ } };

function pcNew() {
  const pc = new RTCPeerConnection({ iceServers: [{ urls: 'stun:stun.l.google.com:19302' }, { urls: 'stun:stun1.l.google.com:19302' }] });
  pc.onconnectionstatechange = () => { if (pc.connectionState === 'failed') { if (NET.on) { cleanup(); if (NET.onLost) NET.onLost(); } else fail(t('online_fail')); } };
  return pc;
}
const waitIce = (pc) => new Promise((res) => { if (pc.iceGatheringState === 'complete') return res(); const f = () => { if (pc.iceGatheringState === 'complete') { pc.removeEventListener('icegatheringstatechange', f); res(); } }; pc.addEventListener('icegatheringstatechange', f); setTimeout(res, 3500); });
function bindDc(dc) {
  NET.dc = dc;
  dc.onopen = () => { NET.lastRx = Date.now(); nsend({ t: 'hi', name: P.name }); };
  dc.onmessage = (e) => { let m; try { m = JSON.parse(e.data); } catch (er) { return; } NET.lastRx = Date.now(); msg(m); };
  dc.onclose = () => { if (NET.on) { cleanup(); if (NET.onLost) NET.onLost(); } };
}
function msg(m) {
  if (m.t === 'hi' && NET.role === 'h' && !NET.on) { NET.opp.name = String(m.name || NET.opp.name).slice(0, 16); nsend({ t: 'go', name: P.name }); begin(); }
  else if (m.t === 'go' && NET.role === 'g' && !NET.on) { NET.opp.name = String(m.name || NET.opp.name).slice(0, 16); begin(); }
  else if (NET.on && NET.onMsg) NET.onMsg(m);
}
function begin() { if (NET.on) return; NET.on = true; clearTimeout(NET.to); closeWait(); sfx('point'); if (NET.onStart) NET.onStart(NET.role, NET.opp); }

async function hostStart(rid, opp, ms) {
  if (!window.RTCPeerConnection) { fail(t('online_nosup')); return false; }
  NET.role = 'h'; NET.rid = rid; NET.opp = opp; NET.busy = true;
  try {
    const pc = NET.pc = pcNew(); bindDc(pc.createDataChannel('g'));
    await pc.setLocalDescription(await pc.createOffer()); await waitIce(pc);
    await X.FS.setDoc(docRef('rooms/' + rid), { host: P.id, hostName: P.name, guest: opp.id, offer: pc.localDescription.sdp, t: Date.now() });
    let got = 0;
    NET.unsub.push(X.FS.onSnapshot(docRef('rooms/' + rid), (s) => { const d = s.data(); if (d && d.answer && !got) { got = 1; pc.setRemoteDescription({ type: 'answer', sdp: d.answer }).catch((e) => fail(e.message)); } }, () => {}));
    NET.to = setTimeout(() => { if (!NET.on) fail(t('online_fail')); }, ms);
    return true;
  } catch (e) { fail(t('err_perm')); return false; }
}
async function guestJoin(rid, opp, ms) {
  if (!window.RTCPeerConnection) { fail(t('online_nosup')); return false; }
  NET.role = 'g'; NET.rid = rid; NET.opp = opp; NET.busy = true;
  NET.to = setTimeout(() => { if (!NET.on) fail(t('online_fail')); }, ms);
  try {
    const s = await X.FS.getDoc(docRef('rooms/' + rid)), d = s.data();
    if (!d || !d.offer || Date.now() - d.t > 120000 || d.guest !== P.id) { fail(t('invite_expired')); return false; }
    const pc = NET.pc = pcNew(); pc.ondatachannel = (e) => bindDc(e.channel);
    await pc.setRemoteDescription({ type: 'offer', sdp: d.offer });
    await pc.setLocalDescription(await pc.createAnswer()); await waitIce(pc);
    await X.FS.updateDoc(docRef('rooms/' + rid), { answer: pc.localDescription.sdp });
    NET.rid = null; return true;
  } catch (e) { fail(t('online_fail')); return false; }
}

/* invitar a un amigo */
export async function invite(p) {
  if (acct.guest) { toast(t('need_account'), 'bad'); return; }
  if (NET.busy) { toast(t('busy'), 'bad'); return; }
  await init(); if (!X.ready) { toast(t('err_net'), 'bad'); return; }
  const iid = P.id + '_' + p.id, rid = iid + '_' + Date.now().toString(36);
  showWait('📨 ' + t('invite'), t('waiting_for', { n: p.name }), () => X.FS.deleteDoc(docRef('invites/' + iid)).catch(() => {}));
  if (!(await hostStart(rid, { id: p.id, name: p.name }, 70000))) return;
  try {
    await X.FS.setDoc(docRef('invites/' + iid), { from: P.id, name: P.name, to: p.id, t: Date.now(), room: rid, st: 'p' });
    NET.unsub.push(X.FS.onSnapshot(docRef('invites/' + iid), (s) => { const d = s.data(); if (d && d.st === 'no' && NET.busy && !NET.on) fail(t('invite_no', { n: p.name })); }, () => {}));
  } catch (e) { fail(t('err_perm')); }
}

/* recibir invitaciones (se llama una vez al entrar con cuenta) */
let invUnsub = null, invFor = null, seen = '';
export function watchInvites(getMode) {
  const want = !acct.guest && X.ready ? P.id : null;
  if (want === invFor) return; if (invUnsub) { invUnsub(); invUnsub = null; } invFor = want; if (!want) return;
  invUnsub = X.FS.onSnapshot(X.FS.query(X.FS.collection(X.db, 'invites'), X.FS.where('to', '==', want)), (snap) => {
    snap.docChanges().forEach((ch) => {
      if (ch.type === 'removed') return; const d = ch.doc.data();
      if (d.st !== 'p' || !d.room || Date.now() - d.t > 120000 || NET.busy || getMode() !== 'lobby') return;
      const key = ch.doc.id + d.t; if (seen === key) return; seen = key; sfx('point'); vib(250);
      const join = async () => { showWait('🌐 ' + t('connecting'), t('joining', { n: d.name })); await guestJoin(d.room, { id: d.from, name: d.name }, 25000); };
      if (d.auto) join();
      else modal({ title: '🎮 ' + t('invite'), body: t('invite_q', { n: esc(d.name) }), buttons: [{ t: '✔ ' + t('accept'), cls: 'green', fn: join }, { t: '✖ ' + t('reject'), cls: 'ghost', fn: () => X.FS.updateDoc(ch.doc.ref, { st: 'no' }).catch(() => {}) }] });
    });
  }, () => {});
}
bus.on('auth', () => { invFor = null; if (invUnsub) { invUnsub(); invUnsub = null; } });

/* buscar rival al azar (hasta 3 minutos) */
export async function quickMatch() {
  if (acct.guest) { toast(t('need_account'), 'bad'); return; }
  if (NET.busy) { toast(t('busy'), 'bad'); return; }
  await init(); if (!X.ready) { toast(t('err_net'), 'bad'); return; }
  NET.busy = true; let left = 180, timer = 0; const qd = docRef('queue/' + P.id);
  const stop = () => { clearInterval(timer); X.FS.deleteDoc(qd).catch(() => {}); };
  showWait('🔎 ' + t('searching'), t('search_sub'), () => { stop(); NET.busy = false; });
  timer = setInterval(async () => {
    left--; if (!waitBox) { stop(); return; }
    if (left <= 0) { stop(); closeWait(); NET.busy = false; modal({ title: t('no_players'), body: t('no_players_d') }); return; }
    if (left % 3 !== 0) return;
    try {
      await X.FS.setDoc(qd, { id: P.id, name: P.name, t: Date.now() });
      const s = await X.FS.getDocs(X.FS.query(X.FS.collection(X.db, 'queue'), X.FS.where('t', '>', Date.now() - 12000)));
      let o = null; s.forEach((d) => { if (d.id !== P.id && !o) o = d.data(); });
      if (o && P.id < o.id) {                       /* el de ID menor crea la sala y manda la invitación automática */
        stop(); clearInterval(timer); closeWait(); NET.busy = false;
        const iid = P.id + '_' + o.id, rid = iid + '_' + Date.now().toString(36);
        showWait('🌐 ' + t('connecting'), o.name, () => {});
        if (await hostStart(rid, { id: o.id, name: o.name }, 40000)) await X.FS.setDoc(docRef('invites/' + iid), { from: P.id, name: P.name, to: o.id, t: Date.now(), room: rid, st: 'p', auto: true }).catch(() => fail(t('err_perm')));
      }
    } catch (e) { /* se reintenta */ }
  }, 1000);
}
