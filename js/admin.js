/* admin.js · panel del administrador (solo aparece si tu cuenta está en la colección "admins" de Firestore).
   Este panel está en español a propósito: lo usas solo tú. La seguridad REAL está en firestore.rules. */
import { P } from './state.js';
import { X, docRef } from './net.js';
import { rankOf, rankName } from './ranks.js';
import { avatarHtml, verMark } from './social.js';
import { esc, toast, modal, screen, sfx, confirmBox, fmt } from './util.js';

const log = (a, t) => X.FS.setDoc(docRef('adminLog/' + Date.now() + '_' + P.id), { by: P.id, a, to: t || '', at: Date.now() }).catch(() => {});
const ask = (title, fields, ok) => {
  const m = modal({ title, body: fields.map((f, i) => '<input class="inp" style="margin:4px 0" id="adF' + i + '" placeholder="' + esc(f) + '">').join(''), buttons: [{ t: 'OK', cls: 'green', fn: () => ok(fields.map((f, i) => document.getElementById('adF' + i).value.trim())) }, { t: 'Cancelar', cls: 'ghost' }] });
  return m;
};
/* modal() quita el cuerpo al cerrar; por eso leemos los campos ANTES de cerrar */
const askSafe = (title, fields, ok) => {
  const w = document.createElement('div'); w.className = 'mdl';
  w.innerHTML = '<div class="pnl"><h2>' + esc(title) + '</h2>' + fields.map((f, i) => '<input class="inp" id="adF' + i + '" placeholder="' + esc(f) + '">').join('') + '<div class="sc-f"><button class="b3d green" id="adOk">OK</button><button class="b3d ghost" id="adNo">Cancelar</button></div></div>';
  document.getElementById('modals').appendChild(w);
  w.querySelector('#adNo').onclick = () => w.remove();
  w.querySelector('#adOk').onclick = () => { const v = fields.map((f, i) => w.querySelector('#adF' + i).value.trim()); w.remove(); ok(v); };
};

export async function openAdmin() {
  if (!X.admin) { toast('No eres administrador', 'bad'); return; }
  const sc = screen({ id: 'scAdmin', title: '👑 PANEL ADMIN', wide: true });
  let tab = 'players';
  const bar = document.createElement('div'); bar.className = 'row'; bar.style.cssText = 'gap:6px;overflow-x:auto;flex:none;padding:2px';
  const box = document.createElement('div'); box.className = 'col';
  sc.body.append(bar, box);
  const tabs = [['players', '👥 Jugadores'], ['reports', '🚩 Reportes'], ['news', '📢 Aviso'], ['stats', '📊 Datos']];
  const draw = () => {
    bar.innerHTML = ''; tabs.forEach(([k, n]) => { const b = document.createElement('button'); b.className = 'b3d sm ' + (k === tab ? 'blue' : 'ghost'); b.style.flex = 'none'; b.textContent = n; b.onclick = () => { tab = k; draw(); }; bar.appendChild(b); });
    box.innerHTML = '<div class="muted c">Cargando…</div>'; ({ players, reports, news, stats })[tab](box).catch((e) => { box.innerHTML = '<div class="err">' + esc(e.code || e.message) + '</div>'; });
  };
  draw();
}

async function players(box) {
  const s = await X.FS.getDocs(X.FS.query(X.FS.collection(X.db, 'players'), X.FS.orderBy('rp', 'desc'), X.FS.limit(200)));
  const all = s.docs.map((d) => d.data());
  box.innerHTML = '<input class="inp" id="adQ" placeholder="Buscar nombre o ID"><div class="muted c">' + all.length + ' jugadores (top 200)</div><div class="col" id="adL"></div>';
  const L = box.querySelector('#adL');
  const show = (f) => {
    L.innerHTML = '';
    all.filter((p) => !f || (p.name || '').toLowerCase().includes(f) || p.id === f).slice(0, 60).forEach((p) => {
      const li = document.createElement('div'); li.className = 'li tap';
      li.innerHTML = avatarHtml(p.av) + '<div class="grow"><b>' + esc(p.name) + verMark(p) + (p.hidden ? ' 🙈' : '') + '</b><small>' + esc(rankName(rankOf(p.rp || 0))) + ' · ' + fmt(p.rp || 0) + ' RP · ID ' + esc(p.id) + '</small></div>';
      li.onclick = () => sheet(p); L.appendChild(li);
    });
  };
  show(''); box.querySelector('#adQ').oninput = (e) => show(e.target.value.trim().toLowerCase());
}

function sheet(p) {
  const w = document.createElement('div'); w.className = 'mdl';
  w.innerHTML = '<div class="pnl" style="max-width:420px;max-height:92vh"><h2>' + esc(p.name) + '</h2><div class="muted c">ID ' + esc(p.id) + ' · 🪙 ' + fmt(p.pc || 0) + ' · 💎 ' + fmt(p.gems || 0) + ' · RP ' + fmt(p.rp || 0) + '</div><div class="sc-b col" id="adA"></div><button class="b3d ghost" id="adX">Cerrar</button></div>';
  document.getElementById('modals').appendChild(w); w.querySelector('#adX').onclick = () => w.remove();
  const A = w.querySelector('#adA');
  const btn = (txt, cls, fn) => { const b = document.createElement('button'); b.className = 'b3d sm block ' + cls; b.textContent = txt; b.onclick = fn; A.appendChild(b); };
  const upd = async (data, msg) => { try { await X.FS.updateDoc(docRef('players/' + p.id), data); Object.assign(p, data); log(msg, p.id); toast('✔ ' + msg, 'good'); sfx('coin'); w.remove(); } catch (e) { toast(e.code || e.message, 'bad'); } };
  btn(p.ver === true ? 'Quitar ✓ dorada' : '✓ Verificar (dorada)', 'gold', () => upd({ ver: p.ver !== true }, 'verificado'));
  btn(p.gver === true ? 'Quitar ✓ gris' : '✓ Verificar (gris)', 'ghost', () => upd({ gver: p.gver !== true }, 'verificado gris'));
  btn(p.hidden ? 'Mostrar en ranking' : 'Ocultar del ranking', 'ghost', () => upd({ hidden: !p.hidden }, 'visibilidad'));
  btn('🎁 Regalar monedas / gemas', 'green', () => askSafe('Regalo', ['Monedas', 'Gemas', 'Mensaje'], async ([c, g, m]) => {
    try { await X.FS.setDoc(docRef('inbox/' + Date.now() + '_' + p.id), { toUid: p.uid, to: p.id, title: '🎁 Regalo', text: m || '¡Un regalo del equipo!', pc: Math.max(0, +c || 0), gems: Math.max(0, +g || 0), at: Date.now() }); log('regalo', p.id); toast('Regalo enviado', 'good'); } catch (e) { toast(e.code, 'bad'); }
  }));
  btn('✉️ Enviar mensaje', 'blue', () => askSafe('Mensaje', ['Título', 'Texto'], async ([ti, tx]) => {
    try { await X.FS.setDoc(docRef('inbox/' + Date.now() + '_' + p.id), { toUid: p.uid, to: p.id, title: ti || 'Mensaje', text: tx, at: Date.now() }); log('mensaje', p.id); toast('Enviado', 'good'); } catch (e) { toast(e.code, 'bad'); }
  }));
  btn('✏️ Poner puntos de rango', 'ghost', () => askSafe('Puntos de rango (RP)', ['Número'], ([n]) => upd({ rp: Math.max(0, +n || 0) }, 'rp')));
  btn('⛔ Banear', 'red', () => askSafe('Banear', ['Motivo', 'Horas (vacío = permanente)'], async ([r, h]) => {
    try { await X.FS.setDoc(docRef('bans/' + p.id), { perm: !h, until: h ? Date.now() + h * 3600000 : 0, reason: r || '-', at: Date.now(), by: P.id }); log('ban', p.id); toast('Baneado', 'good'); w.remove(); } catch (e) { toast(e.code, 'bad'); }
  }));
  btn('♻️ Quitar ban', 'green', async () => { try { await X.FS.deleteDoc(docRef('bans/' + p.id)); log('unban', p.id); toast('Ban quitado', 'good'); w.remove(); } catch (e) { toast(e.code, 'bad'); } });
  btn('🗑 Borrar jugador', 'red', () => confirmBox('Borrar jugador', 'Se borra su perfil. No se puede deshacer.', 'BORRAR', async () => {
    try { await X.FS.deleteDoc(docRef('players/' + p.id)); log('borrar', p.id); toast('Borrado', 'good'); w.remove(); } catch (e) { toast(e.code, 'bad'); }
  }));
}

async function reports(box) {
  const s = await X.FS.getDocs(X.FS.query(X.FS.collection(X.db, 'reports'), X.FS.orderBy('at', 'desc'), X.FS.limit(60)));
  box.innerHTML = s.empty ? '<div class="muted c">Sin reportes 🎉</div>' : '';
  s.docs.forEach((d) => {
    const r = d.data(), li = document.createElement('div'); li.className = 'li'; li.style.opacity = r.st === 'new' ? 1 : 0.55;
    li.innerHTML = '<span style="font-size:22px">🚩</span><div class="grow"><b>' + esc(r.tn || r.to) + '</b><small>' + esc(r.r || '') + ' · de ' + esc(r.from) + ' · ' + new Date(r.at || 0).toLocaleString() + '</small></div>';
    const ok = document.createElement('button'); ok.className = 'b3d sm green'; ok.textContent = '✔'; ok.onclick = async () => { await X.FS.updateDoc(d.ref, { st: 'ok' }); li.style.opacity = 0.55; };
    const del = document.createElement('button'); del.className = 'b3d sm red'; del.textContent = '🗑'; del.onclick = async () => { await X.FS.deleteDoc(d.ref); li.remove(); };
    li.append(ok, del); box.appendChild(li);
  });
}

async function news(box) {
  box.innerHTML = '<input class="inp" id="anT" placeholder="Título"><textarea class="inp" id="anX" placeholder="Texto del aviso para todos los jugadores"></textarea><button class="b3d green block" id="anGo">📢 Publicar</button><div id="anL" class="col"></div>';
  const L = box.querySelector('#anL');
  const load = async () => {
    const s = await X.FS.getDocs(X.FS.query(X.FS.collection(X.db, 'announcements'), X.FS.orderBy('at', 'desc'), X.FS.limit(10))); L.innerHTML = '';
    s.docs.forEach((d) => { const a = d.data(), li = document.createElement('div'); li.className = 'li'; li.innerHTML = '<div class="grow"><b>' + esc(a.title) + '</b><small>' + esc(a.text) + '</small></div>'; const x = document.createElement('button'); x.className = 'b3d sm red'; x.textContent = '🗑'; x.onclick = async () => { await X.FS.deleteDoc(d.ref); load(); }; li.appendChild(x); L.appendChild(li); });
  };
  box.querySelector('#anGo').onclick = async () => {
    const ti = box.querySelector('#anT').value.trim(), tx = box.querySelector('#anX').value.trim(); if (!tx) return;
    try { await X.FS.setDoc(docRef('announcements/' + Date.now()), { title: ti || '📢', text: tx, at: Date.now(), by: P.id }); log('aviso', ''); toast('Publicado', 'good'); box.querySelector('#anX').value = ''; load(); } catch (e) { toast(e.code, 'bad'); }
  };
  load();
}

async function stats(box) {
  const c = await X.FS.getCountFromServer(X.FS.collection(X.db, 'players')), r = await X.FS.getCountFromServer(X.FS.query(X.FS.collection(X.db, 'reports'), X.FS.where('st', '==', 'new')));
  const b = await X.FS.getCountFromServer(X.FS.collection(X.db, 'bans'));
  box.innerHTML = '<div class="li"><b class="grow">👥 Jugadores registrados</b><b>' + c.data().count + '</b></div><div class="li"><b class="grow">🚩 Reportes nuevos</b><b>' + r.data().count + '</b></div><div class="li"><b class="grow">⛔ Baneados</b><b>' + b.data().count + '</b></div>';
}
