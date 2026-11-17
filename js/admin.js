/* admin.js · panel del administrador (solo aparece si tu cuenta está en la colección "admins" de Firestore).
   Roles: owner (dueño: el documento admins/<uid> sin campo "role"), admin y mod.
   Este panel está en español a propósito: lo usas solo tú. La seguridad REAL está en firestore.rules (el servidor revisa cada acción). */
import { P } from './state.js';
import { X, docRef, getDoc } from './net.js';
import { rankOf, rankName } from './ranks.js';
import { avatarHtml, verMark } from './social.js';
import { esc, toast, modal, screen, sfx, confirmBox, fmt } from './util.js';

/* ---------- roles ---------- */
const role = () => X.role || 'owner';
const isOwner = () => role() === 'owner';
const isAdm = () => role() !== 'mod';
const ROLE_NAME = { owner: 'DUEÑO', admin: 'ADMINISTRADOR', mod: 'MODERADOR' };
export const TYPES = [['info', 'ℹ️', 'Información'], ['mant', '🔧', 'Mantenimiento'], ['upd', '⬆️', 'Actualización'], ['event', '🎉', 'Evento'], ['warn', '⚠️', 'Advertencia']];
const tIco = (k) => (TYPES.find((x) => x[0] === k) || ['', '📢'])[1];

/* ---------- ayudas de Firestore ---------- */
const col = (n) => X.FS.collection(X.db, n);
const qs = (n, ...c) => X.FS.getDocs(X.FS.query(col(n), ...c));
const cnt = async (n, ...c) => { try { return (await X.FS.getCountFromServer(c.length ? X.FS.query(col(n), ...c) : col(n))).data().count; } catch (e) { return '–'; } };
const orderBy = (f, d) => X.FS.orderBy(f, d), limit = (n) => X.FS.limit(n), where = (f, o, v) => X.FS.where(f, o, v);
const log = (a, t, why) => X.FS.setDoc(docRef('adminLog/' + Date.now() + '_' + P.id), { by: P.id, a, to: t || '', at: Date.now(), why: (why || '').slice(0, 200) }).catch(() => {});
const permErr = (e) => toast(e && e.code === 'permission-denied' ? 'Tu rol no tiene permiso para esto' : (e.code || e.message), 'bad');

const ago = (ms) => { const s = Math.max(0, (Date.now() - ms) / 1000); if (s < 60) return 'Hace unos seg'; if (s < 3600) return 'Hace ' + Math.floor(s / 60) + ' min'; if (s < 86400) return 'Hace ' + Math.floor(s / 3600) + ' h'; return 'Hace ' + Math.floor(s / 86400) + ' d'; };
const dt = (ms) => (ms ? new Date(ms).toLocaleString() : '—');
const isBanned = (b) => !!b && (b.perm || (b.until && b.until > Date.now()));

/* ventanita con campos (lee los campos ANTES de cerrar) */
const askSafe = (title, fields, ok) => {
  const w = document.createElement('div'); w.className = 'mdl';
  w.innerHTML = '<div class="pnl"><h2>' + esc(title) + '</h2>' + fields.map((f, i) => '<input class="inp" id="adF' + i + '" placeholder="' + esc(f) + '">').join('') + '<div class="sc-f"><button class="b3d green" id="adOk">OK</button><button class="b3d ghost" id="adNo">Cancelar</button></div></div>';
  document.getElementById('modals').appendChild(w);
  w.querySelector('#adNo').onclick = () => w.remove();
  w.querySelector('#adOk').onclick = () => { const v = fields.map((f, i) => w.querySelector('#adF' + i).value.trim()); w.remove(); ok(v); };
};

/* ============================ ESTRUCTURA ============================ */
export async function openAdmin() {
  if (!X.admin) { toast('No eres administrador', 'bad'); return; }
  const sc = screen({ id: 'scAdmin', title: '👑 PANEL ADMIN', wide: true });
  sc.body.innerHTML =
    '<div class="adm-top"><img src="assets/logo-192.png" alt=""><div class="grow"><div class="t1"><h1>PANEL <em>ADMIN</em></h1><span class="chip adm-role">👑 ' + ROLE_NAME[role()] + '</span></div><small>CONTROL TOTAL DEL JUEGO</small></div><button class="b3d red ib3d" id="admX" aria-label="Cerrar">✕</button></div>' +
    '<div class="adm-wrap"><nav class="adm-side" id="admNav"></nav><main class="adm-main" id="admMain"></main></div>';
  sc.body.querySelector('#admX').onclick = () => { sfx('click'); sc.close(); };
  const nav = sc.body.querySelector('#admNav'), main = sc.body.querySelector('#admMain');
  const menu = [['home', '🏠', 'Inicio', 1], ['players', '👥', 'Jugadores', 1], ['reports', '🚩', 'Reportes', 1], ['news', '📢', 'Avisos', isAdm()], ['settings', '⚙️', 'Ajustes', isOwner()], ['stats', '📊', 'Estadísticas', isAdm()], ['logs', '📜', 'Logs', isAdm()]].filter((m) => m[3]);
  let tab = 'home', token = 0;
  const badge = async () => { const n = await cnt('reports', where('st', '==', 'new')); const b = nav.querySelector('[data-k=reports]'); if (!b) return; const old = b.querySelector('.adm-badge'); if (old) old.remove(); if (+n > 0) b.insertAdjacentHTML('beforeend', '<em class="adm-badge">' + n + '</em>'); };
  const ctx = { go: (k) => { tab = k; draw(); }, badge };
  const draw = () => {
    nav.innerHTML = '';
    menu.forEach(([k, ic, n]) => { const b = document.createElement('button'); b.className = 'adm-nav' + (k === tab ? ' on' : ''); b.dataset.k = k; b.innerHTML = '<i>' + ic + '</i><span>' + n + '</span>'; b.onclick = () => { sfx('click'); tab = k; draw(); }; nav.appendChild(b); });
    badge();
    const my = ++token;
    main.innerHTML = '<div class="muted c">Cargando…</div>'; main.scrollTop = 0;
    ({ home, players, reports, news, settings, stats, logs })[tab](main, ctx).catch((e) => { if (my === token) main.innerHTML = '<div class="err">' + esc(e.code === 'permission-denied' ? 'Tu rol no tiene permiso para ver esto' : (e.code || e.message)) + '</div>'; });
  };
  draw();
}

/* ============================ INICIO ============================ */
async function home(box, ctx) {
  const [np, nr, nb, na] = await Promise.all([cnt('players'), cnt('reports', where('st', '==', 'new')), cnt('bans'), cnt('announcements')]);
  const feed = [];
  const add = async (n, c, fn) => { try { (await qs(n, ...c)).docs.forEach((d) => feed.push(fn(d.data()))); } catch (e) { /* sin permiso: se omite */ } };
  await Promise.all([
    add('players', [orderBy('createdAt', 'desc'), limit(4)], (p) => ({ at: p.createdAt || 0, ic: '👤', c: 'blue', t: 'Nuevo jugador: ' + p.name })),
    add('reports', [orderBy('at', 'desc'), limit(4)], (r) => ({ at: r.at || 0, ic: '🚩', c: 'red', t: 'Reporte: ' + (r.r || '') + ' · ' + (r.tn || r.to) })),
    add('announcements', [orderBy('at', 'desc'), limit(3)], (a) => ({ at: a.at || 0, ic: '⭐', c: 'gold', t: 'Aviso: ' + (a.title || '') })),
    isAdm() ? add('adminLog', [orderBy('at', 'desc'), limit(4)], (l) => ({ at: l.at || 0, ic: '🛠', c: 'green', t: logText(l) })) : 0,
  ]);
  feed.sort((a, b) => b.at - a.at);
  const tiles = [['players', '👥', 'Gestionar Jugadores', 'Ver, editar o banear jugadores', '', 1], ['reports', '🚩', 'Gestionar Reportes', 'Resolver denuncias', 'red', 1], ['news', '📢', 'Enviar Avisos', 'Comunica a tus jugadores', 'green', isAdm()], ['settings', '⚙️', 'Configuración', 'Equipo y permisos', 'violet', isOwner()]].filter((x) => x[5]);
  box.innerHTML =
    '<div class="adm-stats">' +
    '<div class="adm-st"><span class="ic">👥</span><b>' + np + '</b><small>Jugadores</small></div>' +
    '<div class="adm-st red"><span class="ic">🚩</span><b>' + nr + '</b><small>Reportes pend.</small></div>' +
    '<div class="adm-st red"><span class="ic">⛔</span><b>' + nb + '</b><small>Baneados</small></div>' +
    '<div class="adm-st gold"><span class="ic">⭐</span><b>' + na + '</b><small>Avisos</small></div></div>' +
    '<div class="adm-hello"><b>👑 Bienvenido al Panel Admin</b><span class="muted">Gestiona tu juego de la mejor manera</span></div>' +
    '<div class="adm-tiles" id="admT"></div>' +
    '<div class="adm-sec"><span>🕒</span><span class="grow">ACTIVIDAD RECIENTE</span><button class="b3d sm ghost" id="admAll">Ver todo →</button></div><div class="col" id="admF"></div>';
  const T = box.querySelector('#admT');
  tiles.forEach(([k, ic, n, d, c]) => { const el = document.createElement('div'); el.className = 'adm-tile ' + c; el.innerHTML = '<span class="ic">' + ic + '</span><div class="tx"><b>' + n + '</b><small>' + d + '</small><button class="b3d sm ' + (c || 'blue') + ' block">Entrar ›</button></div>'; el.querySelector('button').onclick = () => { sfx('click'); ctx.go(k); }; T.appendChild(el); });
  const F = box.querySelector('#admF');
  F.innerHTML = feed.length ? '' : '<div class="muted c">Todavía no hay actividad</div>';
  feed.slice(0, 4).forEach((f) => { F.insertAdjacentHTML('beforeend', '<div class="adm-act"><span>' + f.ic + '</span><span class="grow">' + esc(f.t) + '</span><time>' + ago(f.at) + '</time><i class="adm-dot ' + f.c + '"></i></div>'); });
  box.querySelector('#admAll').onclick = () => ctx.go(isAdm() ? 'logs' : 'reports');
}

/* ============================ JUGADORES ============================ */
async function players(box, ctx) {
  const [s, bs] = await Promise.all([qs('players', orderBy('rp', 'desc'), limit(200)), qs('bans').catch(() => ({ docs: [] }))]);
  const all = s.docs.map((d) => d.data()), bans = {}; bs.docs.forEach((d) => { bans[d.id] = d.data(); });
  box.innerHTML = '<input class="inp" id="adQ" placeholder="Buscar nombre o ID"><div class="muted c">' + all.length + ' jugadores (top 200 por rango)</div><div class="col" id="adL"></div>';
  const L = box.querySelector('#adL');
  const show = (f) => {
    L.innerHTML = '';
    all.filter((p) => !f || (p.name || '').toLowerCase().includes(f) || String(p.id) === f).slice(0, 60).forEach((p) => {
      const b = isBanned(bans[p.id]), li = document.createElement('div'); li.className = 'li tap';
      li.innerHTML = avatarHtml(p.av) + '<div class="grow"><b>' + esc(p.name) + verMark(p) + (p.hidden ? ' 🙈' : '') + '</b><small>' + esc(rankName(rankOf(p.rp || 0))) + ' · ' + fmt(p.rp || 0) + ' RP · ID ' + esc(p.id) + '</small></div>' + (b ? '<span class="chip" style="border-color:var(--red);color:#ff9aa9">⛔ BANEADO</span>' : '');
      li.onclick = () => sheet(p, bans[p.id], async () => { ctx.go('players'); });
      L.appendChild(li);
    });
  };
  show(''); box.querySelector('#adQ').oninput = (e) => show(e.target.value.trim().toLowerCase());
}

/* ficha del jugador */
function sheet(p, ban, after) {
  const w = document.createElement('div'); w.className = 'mdl';
  const banned = isBanned(ban);
  w.innerHTML = '<div class="pnl adm-ficha"><div class="hd">' + avatarHtml(p.av) + '<div class="grow"><h2>' + esc(p.name) + verMark(p) + '</h2><div class="muted">ID ' + esc(p.id) + '</div></div>' + (banned ? '<span class="chip" style="border-color:var(--red);color:#ff9aa9">⛔ BANEADO</span>' : '<span class="chip">✅ Activo</span>') + '</div>' +
    '<div class="sc-b col"><div class="adm-kv">' +
    '<div><small>Rango</small>' + esc(rankName(rankOf(p.rp || 0))) + ' · ' + fmt(p.rp || 0) + ' RP</div>' +
    '<div><small>Registro</small>' + (p.createdAt ? new Date(p.createdAt).toLocaleDateString() : '—') + '</div>' +
    '<div><small>Monedas / gemas</small>🪙 ' + fmt(p.pc || 0) + ' · 💎 ' + fmt(p.gems || 0) + '</div>' +
    '<div><small>Partidas · victorias · derrotas</small>' + fmt(p.games || 0) + ' · ' + fmt(p.w || 0) + ' · ' + fmt(p.l || 0) + '</div>' +
    (banned ? '<div style="grid-column:1/-1"><small>Baneo</small>' + (ban.perm ? 'Permanente' : 'Hasta ' + dt(ban.until)) + ' · ' + esc(ban.reason || '-') + '</div>' : '') + '</div>' +
    (isAdm() ? '<div class="adm-sec" style="font-size:11px">HISTORIAL ADMINISTRATIVO</div><div class="adm-hist" id="adH"><div class="muted">Cargando…</div></div>' : '') +
    '<div class="adm-acts" id="adA"></div></div><button class="b3d ghost" id="adX">Cerrar</button></div>';
  document.getElementById('modals').appendChild(w); w.querySelector('#adX').onclick = () => w.remove();
  const A = w.querySelector('#adA');
  const btn = (txt, cls, fn) => { const b = document.createElement('button'); b.className = 'b3d sm ' + cls; b.textContent = txt; b.onclick = fn; A.appendChild(b); };
  const done = (msg) => { toast('✔ ' + msg, 'good'); sfx('coin'); w.remove(); if (after) after(); };
  const upd = async (data, msg) => { try { await X.FS.updateDoc(docRef('players/' + p.id), data); Object.assign(p, data); log(msg, p.id); done(msg); } catch (e) { permErr(e); } };
  if (isAdm()) {
    X.FS.getDocs(X.FS.query(col('adminLog'), where('to', '==', p.id), limit(30))).then((s) => {
      const H = w.querySelector('#adH'); if (!H) return; const rows = s.docs.map((d) => d.data()).sort((a, b) => b.at - a.at);
      H.innerHTML = rows.length ? rows.map((l) => '<div class="adm-act"><span class="grow">' + esc(logText(l, true)) + '</span><time>' + new Date(l.at).toLocaleDateString() + '</time></div>').join('') : '<div class="muted">Sin acciones registradas</div>';
    }).catch(() => { const H = w.querySelector('#adH'); if (H) H.innerHTML = '<div class="muted">No se pudo cargar</div>'; });
    btn(p.ver === true ? 'Quitar ✓ dorada' : '✓ Verificar (dorada)', 'gold', () => upd({ ver: p.ver !== true }, 'verificado'));
    btn(p.gver === true ? 'Quitar ✓ gris' : '✓ Verificar (gris)', 'ghost', () => upd({ gver: p.gver !== true }, 'verificado gris'));
  }
  btn(p.hidden ? '👁 Mostrar en ranking' : '🙈 Ocultar del ranking', 'ghost', () => upd({ hidden: !p.hidden }, 'visibilidad'));
  if (isAdm()) {
    btn('🎁 Regalar monedas / gemas', 'green', () => askSafe('Regalo', ['Monedas', 'Gemas', 'Mensaje'], async ([c, g, m]) => {
      try { await X.FS.setDoc(docRef('inbox/' + Date.now() + '_' + p.id), { toUid: p.uid, to: p.id, title: '🎁 Regalo', text: m || '¡Un regalo del equipo!', pc: Math.max(0, +c || 0), gems: Math.max(0, +g || 0), at: Date.now() }); log('regalo', p.id, (+c || 0) + ' monedas, ' + (+g || 0) + ' gemas'); toast('Regalo enviado', 'good'); w.remove(); } catch (e) { permErr(e); }
    }));
    btn('✉️ Enviar mensaje', 'blue', () => askSafe('Mensaje', ['Título', 'Texto'], async ([ti, tx]) => {
      try { await X.FS.setDoc(docRef('inbox/' + Date.now() + '_' + p.id), { toUid: p.uid, to: p.id, title: ti || 'Mensaje', text: tx, at: Date.now() }); log('mensaje', p.id); toast('Enviado', 'good'); w.remove(); } catch (e) { permErr(e); }
    }));
    btn('✏️ Poner puntos de rango', 'ghost', () => askSafe('Puntos de rango (RP)', ['Número'], ([n]) => upd({ rp: Math.max(0, +n || 0) }, 'rp')));
  }
  btn('⛔ Banear', 'red', () => askSafe('Banear a ' + p.name, ['Motivo', isAdm() ? 'Horas (vacío = permanente)' : 'Horas (obligatorio, máx. 720)'], ([r, h]) => {
    const hh = h ? +h : 0;
    if (h && !(hh > 0)) { toast('Horas no válidas', 'bad'); return; }
    if (!isAdm() && !(hh > 0 && hh <= 720)) { toast('Como moderador solo puedes dar baneos temporales (hasta 720 h)', 'bad'); return; }
    confirmBox('Confirmar baneo', 'Vas a banear a <b>' + esc(p.name) + '</b> ' + (hh ? 'por <b>' + hh + ' h</b>' : '<b>de forma permanente</b>') + '.<br>Motivo: ' + esc(r || '-'), 'BANEAR', async () => {
      try { await X.FS.setDoc(docRef('bans/' + p.id), { perm: !hh, until: hh ? Date.now() + hh * 3600000 : 0, reason: (r || '-').slice(0, 200), at: Date.now(), by: P.id }); log('ban', p.id, (r || '-') + (hh ? ' · ' + hh + ' h' : ' · permanente')); done('Baneado'); } catch (e) { permErr(e); }
    });
  }));
  if (isAdm()) {
    btn('♻️ Quitar ban', 'green', () => confirmBox('Quitar ban', 'Se le devuelve el acceso a <b>' + esc(p.name) + '</b>.', 'QUITAR', async () => {
      try { await X.FS.deleteDoc(docRef('bans/' + p.id)); log('unban', p.id); done('Ban quitado'); } catch (e) { permErr(e); }
    }, 'green'));
    btn('🗑 Borrar jugador', 'red', () => confirmBox('Borrar jugador', 'Se borra su perfil. No se puede deshacer.', 'BORRAR', async () => {
      try { await X.FS.deleteDoc(docRef('players/' + p.id)); log('borrar', p.id); done('Borrado'); } catch (e) { permErr(e); }
    }));
  }
}

/* ============================ REPORTES ============================ */
async function reports(box, ctx) {
  const s = await qs('reports', orderBy('at', 'desc'), limit(100));
  const rows = s.docs.map((d) => ({ ref: d.ref, d: d.data() }));
  const SET = { new: ['Pendientes', (r) => r.st === 'new' || !r.st], rev: ['Revisados', (r) => r.st === 'rev'], ok: ['Resueltos', (r) => r.st === 'ok' || r.st === 'no'] };
  let f = 'new';
  const chips = document.createElement('div'); chips.className = 'adm-chips'; const L = document.createElement('div'); L.className = 'col';
  box.innerHTML = ''; box.append(chips, L);
  const mark = async (x, st, txt) => { try { const up = { st, rby: P.id, rat: Date.now() }; await X.FS.updateDoc(x.ref, up); Object.assign(x.d, up); log(txt, x.d.to, x.d.r || ''); sfx('coin'); ctx.badge(); draw(); } catch (e) { permErr(e); } };
  const draw = () => {
    chips.innerHTML = ''; Object.entries(SET).forEach(([k, [n, fn]]) => { const c = rows.filter((x) => fn(x.d)).length, b = document.createElement('button'); b.className = 'b3d sm ' + (k === f ? 'blue' : 'ghost'); b.textContent = n + ' (' + c + ')'; b.onclick = () => { f = k; draw(); }; chips.appendChild(b); });
    const list = rows.filter((x) => SET[f][1](x.d));
    L.innerHTML = list.length ? '' : '<div class="muted c">' + (f === 'new' ? 'Sin reportes pendientes 🎉' : 'Nada por aquí') + '</div>';
    list.forEach((x) => {
      const r = x.d, isNew = r.st === 'new' || !r.st, li = document.createElement('div'); li.className = 'li'; li.style.cssText = 'flex-wrap:wrap;' + (isNew ? 'border-color:var(--red);box-shadow:0 0 14px rgba(255,45,79,.35),0 3px 0 rgba(0,0,0,.35)' : '');
      li.innerHTML = (isNew ? '<i class="adm-new"></i>' : '<span style="font-size:20px">🚩</span>') + '<div class="grow"><b>' + esc(r.tn || r.to) + ' <span class="muted">(ID ' + esc(r.to) + ')</span></b><small>Motivo: ' + esc(r.r || '-') + '</small><small>Denuncia de ' + esc(r.from) + ' · ' + dt(r.at) + '</small>' +
        (r.rat ? '<small style="color:var(--cyan)">' + ({ rev: 'Revisado', ok: 'Resuelto', no: 'Descartado' }[r.st] || '') + ' por ' + esc(r.rby || '?') + ' · ' + dt(r.rat) + '</small>' : '') + '</div>';
      const row = document.createElement('div'); row.className = 'row wrap'; row.style.cssText = 'width:100%;gap:6px';
      const b = (t, c, fn) => { const e = document.createElement('button'); e.className = 'b3d sm ' + c; e.textContent = t; e.onclick = fn; row.appendChild(e); };
      b('👤 Jugador', 'ghost', async () => { try { const p = await getDoc('players/' + r.to); if (!p) { toast('Ese jugador ya no existe', 'bad'); return; } let ban = null; try { ban = await getDoc('bans/' + r.to); } catch (e) { /* */ } sheet(p, ban, null); } catch (e) { permErr(e); } });
      if (isNew) b('👁 Revisado', 'blue', () => mark(x, 'rev', 'reporte revisado'));
      if (r.st !== 'ok' && r.st !== 'no') { b('✔ Resolver', 'green', () => mark(x, 'ok', 'reporte resuelto')); b('✖ Descartar', 'ghost', () => mark(x, 'no', 'reporte descartado')); }
      if (isAdm()) b('🗑', 'red', () => confirmBox('Borrar reporte', 'Se borra para siempre.', 'BORRAR', async () => { try { await X.FS.deleteDoc(x.ref); log('reporte borrado', r.to); rows.splice(rows.indexOf(x), 1); ctx.badge(); draw(); } catch (e) { permErr(e); } }));
      li.appendChild(row); L.appendChild(li);
    });
  };
  draw();
}

/* ============================ AVISOS ============================ */
async function news(box) {
  if (!isAdm()) throw { code: 'permission-denied' };
  box.innerHTML = '<div class="adm-sec"><span>📢</span><span class="grow" id="anH">NUEVO AVISO</span></div>' +
    '<select class="inp" id="anK">' + TYPES.map((x) => '<option value="' + x[0] + '">' + x[1] + ' ' + x[2] + '</option>').join('') + '</select>' +
    '<input class="inp" id="anT" maxlength="80" placeholder="Título"><textarea class="inp" id="anX" maxlength="600" placeholder="Texto del aviso para todos los jugadores"></textarea>' +
    '<div class="row"><button class="b3d green grow" id="anGo">📢 Publicar</button><button class="b3d ghost" id="anNo" style="display:none">Cancelar</button></div>' +
    '<div class="adm-sec"><span>🗂</span><span class="grow">AVISOS ANTERIORES</span></div><div id="anL" class="col"></div>';
  const L = box.querySelector('#anL'), K = box.querySelector('#anK'), T = box.querySelector('#anT'), Xx = box.querySelector('#anX'), Go = box.querySelector('#anGo'), No = box.querySelector('#anNo');
  let editing = null;
  const reset = () => { editing = null; T.value = ''; Xx.value = ''; K.value = 'info'; Go.textContent = '📢 Publicar'; No.style.display = 'none'; box.querySelector('#anH').textContent = 'NUEVO AVISO'; };
  No.onclick = reset;
  const load = async () => {
    const s = await qs('announcements', orderBy('at', 'desc'), limit(20)); L.innerHTML = s.empty ? '<div class="muted c">Sin avisos publicados</div>' : '';
    s.docs.forEach((d) => {
      const a = d.data(), li = document.createElement('div'); li.className = 'li';
      li.innerHTML = '<span style="font-size:22px">' + tIco(a.type) + '</span><div class="grow"><b>' + esc(a.title) + '</b><small>' + esc(a.text) + '</small><small>' + dt(a.at) + '</small></div>';
      const ed = document.createElement('button'); ed.className = 'b3d sm blue'; ed.textContent = '✏️';
      ed.onclick = () => { editing = d; K.value = a.type || 'info'; T.value = a.title || ''; Xx.value = a.text || ''; Go.textContent = '💾 Guardar cambios'; No.style.display = ''; box.querySelector('#anH').textContent = 'EDITAR AVISO'; box.scrollTop = 0; };
      const x = document.createElement('button'); x.className = 'b3d sm red'; x.textContent = '🗑';
      x.onclick = () => confirmBox('Retirar aviso', 'Los jugadores dejarán de verlo.', 'RETIRAR', async () => { try { await X.FS.deleteDoc(d.ref); log('aviso retirado', '', a.title); if (editing && editing.id === d.id) reset(); load(); } catch (e) { permErr(e); } });
      li.append(ed, x); L.appendChild(li);
    });
  };
  Go.onclick = async () => {
    const ti = T.value.trim(), tx = Xx.value.trim(); if (!tx) { toast('Escribe el texto del aviso', 'bad'); return; }
    try {
      if (editing) { await X.FS.updateDoc(editing.ref, { title: ti || '📢', text: tx, type: K.value }); log('aviso editado', '', ti); toast('Aviso actualizado', 'good'); }
      else { await X.FS.setDoc(docRef('announcements/' + Date.now()), { title: ti || '📢', text: tx, type: K.value, at: Date.now(), by: P.id }); log('aviso', '', ti); toast('Publicado', 'good'); }
      sfx('coin'); reset(); load();
    } catch (e) { permErr(e); }
  };
  await load();
}

/* ============================ AJUSTES (equipo y permisos) ============================ */
async function settings(box) {
  if (!isOwner()) throw { code: 'permission-denied' };
  const s = await qs('admins');
  box.innerHTML = '<div class="adm-sec"><span>🛡</span><span class="grow">EQUIPO ADMINISTRATIVO</span></div>' +
    '<div class="muted">Dueño: acceso total. Administrador: jugadores, reportes, avisos, estadísticas y logs. Moderador: ver jugadores, revisar reportes y dar baneos temporales. Los permisos los comprueba el servidor (Firestore), no solo los botones.</div>' +
    '<button class="b3d green block" id="stAdd">➕ Añadir miembro al equipo</button><div class="col" id="stL"></div>';
  const L = box.querySelector('#stL');
  s.docs.forEach((d) => {
    const a = d.data(), r = a.role === 'admin' || a.role === 'mod' ? a.role : 'owner', li = document.createElement('div'); li.className = 'li';
    li.innerHTML = '<span style="font-size:22px">' + (r === 'owner' ? '👑' : r === 'admin' ? '🛠' : '🛡') + '</span><div class="grow"><b>' + esc(a.name || a.id || d.id) + '</b><small>' + ROLE_NAME[r] + (a.id ? ' · ID ' + esc(a.id) : '') + '</small></div>';
    if (r !== 'owner') {
      const sw = document.createElement('button'); sw.className = 'b3d sm blue'; sw.textContent = r === 'admin' ? '→ Moderador' : '→ Admin';
      sw.onclick = async () => { try { await X.FS.updateDoc(d.ref, { role: r === 'admin' ? 'mod' : 'admin' }); log('rol cambiado', a.id || '', r === 'admin' ? 'a moderador' : 'a administrador'); toast('Rol cambiado', 'good'); draw(); } catch (e) { permErr(e); } };
      const rm = document.createElement('button'); rm.className = 'b3d sm red'; rm.textContent = '🗑';
      rm.onclick = () => confirmBox('Quitar del equipo', 'Pierde el acceso al panel.', 'QUITAR', async () => { try { await X.FS.deleteDoc(d.ref); log('rol quitado', a.id || ''); toast('Quitado', 'good'); draw(); } catch (e) { permErr(e); } });
      li.append(sw, rm);
    }
    L.appendChild(li);
  });
  const draw = () => settings(box);
  box.querySelector('#stAdd').onclick = () => askSafe('Añadir al equipo', ['ID del jugador', 'Rol: admin o mod'], async ([id, rl]) => {
    if (!['admin', 'mod'].includes(rl.toLowerCase())) { toast('El rol debe ser admin o mod', 'bad'); return; }
    try {
      const p = await getDoc('players/' + id); if (!p || !p.uid) { toast('No existe un jugador con ese ID', 'bad'); return; }
      confirmBox('Confirmar', 'Dar rol <b>' + (rl.toLowerCase() === 'admin' ? 'ADMINISTRADOR' : 'MODERADOR') + '</b> a <b>' + esc(p.name) + '</b>.', 'DAR ROL', async () => {
        try { await X.FS.setDoc(docRef('admins/' + p.uid), { role: rl.toLowerCase(), id: p.id, name: p.name, by: P.id, at: Date.now() }); log('rol añadido', p.id, rl.toLowerCase()); toast('Añadido', 'good'); draw(); } catch (e) { permErr(e); }
      }, 'green');
    } catch (e) { permErr(e); }
  });
}

/* ============================ ESTADÍSTICAS ============================ */
const days7 = () => Array.from({ length: 7 }, (_, i) => { const d = new Date(); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() - (6 - i)); return d.getTime(); });
const bars = (times, cls) => {
  const ds = days7(), n = ds.map((d) => times.filter((t) => t >= d && t < d + 86400000).length), mx = Math.max(1, ...n);
  return '<div class="adm-bars ' + (cls || '') + '">' + ds.map((d, i) => '<div><b>' + n[i] + '</b><i data-h="' + Math.round((n[i] / mx) * 70) + '"></i>' + new Date(d).toLocaleDateString(undefined, { weekday: 'narrow' }) + '</div>').join('') + '</div>';
};
async function stats(box) {
  if (!isAdm()) throw { code: 'permission-denied' };
  const [np, nr, nb, na, ps, rs, ls] = await Promise.all([cnt('players'), cnt('reports'), cnt('bans'), cnt('announcements'), qs('players', orderBy('rp', 'desc'), limit(500)), qs('reports', orderBy('at', 'desc'), limit(200)), qs('adminLog', orderBy('at', 'desc'), limit(300))]);
  const P_ = ps.docs.map((d) => d.data()), games = P_.reduce((a, p) => a + (p.games || 0), 0);
  box.innerHTML = '<div class="adm-stats">' +
    '<div class="adm-st"><span class="ic">👥</span><b>' + np + '</b><small>Jugadores</small></div>' +
    '<div class="adm-st violet"><span class="ic">🏓</span><b>' + fmt(games) + '</b><small>Partidas jugadas*</small></div>' +
    '<div class="adm-st red"><span class="ic">🚩</span><b>' + nr + '</b><small>Reportes recibidos</small></div>' +
    '<div class="adm-st red"><span class="ic">⛔</span><b>' + nb + '</b><small>Baneados ahora</small></div></div>' +
    '<div class="adm-sec"><span>📈</span><span class="grow">REGISTROS (últimos 7 días)</span></div>' + bars(P_.map((p) => p.createdAt || 0)) +
    '<div class="adm-sec"><span>🚩</span><span class="grow">REPORTES (últimos 7 días)</span></div>' + bars(rs.docs.map((d) => d.data().at || 0), 'r') +
    '<div class="adm-sec"><span>⛔</span><span class="grow">BANEOS REALIZADOS (últimos 7 días)</span></div>' + bars(ls.docs.map((d) => d.data()).filter((l) => l.a === 'ban').map((l) => l.at || 0), 'r') +
    '<div class="muted">*Partidas y registros se calculan con los 500 jugadores de mayor rango. Avisos publicados: ' + na + '.</div>';
  requestAnimationFrame(() => requestAnimationFrame(() => box.querySelectorAll('.adm-bars i').forEach((i) => { i.style.height = i.dataset.h + 'px'; })));
}

/* ============================ LOGS ============================ */
const A_TXT = { ban: 'baneó a', unban: 'quitó el ban a', borrar: 'borró a', verificado: 'cambió la ✓ dorada de', 'verificado gris': 'cambió la ✓ gris de', visibilidad: 'cambió la visibilidad en el ranking de', regalo: 'regaló a', mensaje: 'envió un mensaje a', rp: 'cambió los puntos de rango de', aviso: 'publicó un aviso', 'aviso editado': 'editó un aviso', 'aviso retirado': 'retiró un aviso', 'reporte revisado': 'marcó como revisado un reporte sobre', 'reporte resuelto': 'resolvió un reporte sobre', 'reporte descartado': 'descartó un reporte sobre', 'reporte borrado': 'borró un reporte sobre', 'rol añadido': 'dio un rol a', 'rol cambiado': 'cambió el rol de', 'rol quitado': 'quitó del equipo a' };
const logText = (l, short) => (short ? '' : (l.by || '?') + ' ') + (A_TXT[l.a] || l.a) + (l.to ? ' ' + l.to : '') + (l.why ? ' · ' + l.why : '');
const CAT = { ban: ['Baneos', ['ban', 'unban']], rep: ['Reportes', ['reporte revisado', 'reporte resuelto', 'reporte descartado', 'reporte borrado']], news: ['Avisos', ['aviso', 'aviso editado', 'aviso retirado']], team: ['Equipo', ['rol añadido', 'rol cambiado', 'rol quitado']] };
async function logs(box) {
  if (!isAdm()) throw { code: 'permission-denied' };
  const s = await qs('adminLog', orderBy('at', 'desc'), limit(150)), all = s.docs.map((d) => d.data());
  let f = 'all', q = '';
  box.innerHTML = '<input class="inp" id="lgQ" placeholder="Buscar en el historial"><div class="adm-chips" id="lgC"></div><div class="muted c" id="lgN"></div><div class="col" id="lgL"></div>';
  const C = box.querySelector('#lgC'), L = box.querySelector('#lgL');
  const draw = () => {
    C.innerHTML = ''; [['all', 'Todo'], ...Object.entries(CAT).map(([k, v]) => [k, v[0]])].forEach(([k, n]) => { const b = document.createElement('button'); b.className = 'b3d sm ' + (k === f ? 'blue' : 'ghost'); b.textContent = n; b.onclick = () => { f = k; draw(); }; C.appendChild(b); });
    const list = all.filter((l) => (f === 'all' || (CAT[f] && CAT[f][1].includes(l.a))) && (!q || (logText(l) + ' ' + (l.why || '')).toLowerCase().includes(q)));
    box.querySelector('#lgN').textContent = list.length + ' registros (solo lectura)';
    L.innerHTML = list.length ? '' : '<div class="muted c">Sin registros</div>';
    list.forEach((l) => L.insertAdjacentHTML('beforeend', '<div class="li"><div class="grow"><b>' + esc((l.by || '?') + ' ' + (A_TXT[l.a] || l.a) + (l.to ? ' ' + l.to : '')) + '</b>' + (l.why ? '<small>Motivo: ' + esc(l.why) + '</small>' : '') + '<small>' + dt(l.at) + '</small></div></div>'));
  };
  box.querySelector('#lgQ').oninput = (e) => { q = e.target.value.trim().toLowerCase(); draw(); };
  draw();
}
