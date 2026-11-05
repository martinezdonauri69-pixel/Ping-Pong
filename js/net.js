/* net.js · Firebase: cuentas, guardado en la nube y ranking. Si no hay internet el juego sigue funcionando en modo local. */
import { FB_CFG, FB_VER, MAIL_DOMAIN } from './config.js';
import { P, acct, loadLocal, applyRemote, cloudDoc, save } from './state.js';
import { bus, ls, genId } from './util.js';
import { t } from './i18n.js';

export const X = { ready: false, db: null, auth: null, FS: null, FA: null, admin: false, failed: false };
let initP = null;

export function init() {
  if (initP) return initP;
  initP = (async () => {
    try {
      const V = 'https://www.gstatic.com/firebasejs/' + FB_VER + '/';
      const [A, FA, FS] = await Promise.all([import(V + 'firebase-app.js'), import(V + 'firebase-auth.js'), import(V + 'firebase-firestore.js')]);
      const app = A.initializeApp(FB_CFG);
      X.auth = FA.getAuth(app); X.db = FS.getFirestore(app); X.FA = FA; X.FS = FS; X.ready = true;
    } catch (e) { X.failed = true; console.warn('Firebase no disponible (modo local)', e && e.message); }
    return X.ready;
  })();
  return initP;
}
const D = (path) => { const p = path.split('/'); return X.FS.doc(X.db, ...p); };
export const docRef = D;
export async function getDoc(path) { const s = await X.FS.getDoc(D(path)); return s.exists() ? s.data() : null; }

const sha = async (s) => { const b = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s)); return [...new Uint8Array(b)].map((x) => x.toString(16).padStart(2, '0')).join(''); };
const NAME_RE = /^[A-Za-z0-9_]{3,16}$/;
const mapErr = (e) => {
  const c = (e && e.code) || '';
  if (/email-already|name_taken/.test(c + (e.message || ''))) return t('err_name_taken');
  if (/wrong-password|invalid-credential|user-not-found|invalid-login/.test(c)) return t('err_bad_login');
  if (/weak-password/.test(c)) return t('err_pass_short');
  if (/network|unavailable/.test(c)) return t('err_net');
  if (/too-many/.test(c)) return t('err_many');
  if (/permission/.test(c)) return t('err_perm');
  return (e && e.message) || t('err_unknown');
};

async function afterAuth(user) {
  acct.uid = user.uid; acct.guest = false;
  const link = await getDoc('byUid/' + user.uid);
  if (!link) throw new Error(t('err_no_profile'));
  const ban = await getDoc('bans/' + link.id).catch(() => null);
  if (ban && (ban.perm || (ban.until && ban.until > Date.now()))) {
    await X.FA.signOut(X.auth); acct.uid = null; acct.guest = true;
    const e = new Error(ban.perm ? t('banned_perm', { r: ban.reason || '-' }) : t('banned_temp', { d: new Date(ban.until).toLocaleString(), r: ban.reason || '-' })); e.ban = true; throw e;
  }
  const d = await getDoc('players/' + link.id);
  loadLocal(link.id);
  if (d) applyRemote(d);
  P.id = link.id;
  X.admin = !!(await getDoc('admins/' + user.uid).catch(() => null));
  ls.set('dmr2_acct', link.id); save(); bus.emit('auth');
}

export async function login(name, pass) {
  if (!(await init())) throw new Error(t('err_net'));
  try {
    const cr = await X.FA.signInWithEmailAndPassword(X.auth, name.toLowerCase() + MAIL_DOMAIN, pass);
    await afterAuth(cr.user);
  } catch (e) { if (e.ban) throw e; throw new Error(mapErr(e)); }
}

export async function register(name, pass, email) {
  if (!NAME_RE.test(name)) throw new Error(t('err_name_fmt'));
  if (pass.length < 6) throw new Error(t('err_pass_short'));
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) throw new Error(t('err_email'));
  if (ls.get('dmr_dev', null)) throw new Error(t('err_device'));
  if (!(await init())) throw new Error(t('err_net'));
  const low = name.toLowerCase(), ek = await sha(email.trim().toLowerCase());
  let user = null;
  try {
    if (await getDoc('emails/' + ek)) throw new Error(t('err_email_used'));
    user = (await X.FA.createUserWithEmailAndPassword(X.auth, low + MAIL_DOMAIN, pass)).user;
    if (await getDoc('names/' + low)) { const e = new Error('name_taken'); e.code = 'name_taken'; throw e; }
    const id = P.id && /^\d{8}$/.test(P.id) ? P.id : genId();
    P.id = id; P.name = name.toUpperCase().slice(0, 16); P.nameSet = true;
    const b = X.FS.writeBatch(X.db);
    b.set(D('names/' + low), { uid: user.uid, id });
    b.set(D('emails/' + ek), { uid: user.uid });
    b.set(D('byUid/' + user.uid), { id, ek });
    acct.uid = user.uid; acct.guest = false;
    b.set(D('players/' + id), Object.assign(cloudDoc(), { createdAt: Date.now() }));
    await b.commit();
    ls.set('dmr_dev', 1); ls.set('dmr2_acct', id); save(); bus.emit('auth');
  } catch (e) {
    acct.uid = null; acct.guest = true;
    if (user) { try { await X.FA.deleteUser(user); } catch (e2) { /* nada */ } }
    throw new Error(e.message && !e.code ? e.message : mapErr(e));
  }
}

export async function logout() {
  try { if (X.auth) await X.FA.signOut(X.auth); } catch (e) { /* nada */ }
  acct.uid = null; acct.guest = true; X.admin = false; ls.del('dmr2_acct');
  loadLocal(null); bus.emit('auth');
}

/* guardado en la nube (con espera para no gastar escrituras) */
let busy = false, again = false;
export async function push() {
  if (acct.guest || !X.ready || !acct.uid) return;
  if (busy) { again = true; return; }
  busy = true;
  try { await X.FS.setDoc(D('players/' + P.id), cloudDoc(), { merge: true }); }
  catch (e) { console.warn('no se pudo guardar en la nube', e.code || e.message); }
  busy = false; if (again) { again = false; push(); }
}
bus.on('cloud', push);

/* al abrir el juego: recuperar la sesión si ya había entrado */
export async function restore() {
  const id = ls.get('dmr2_acct', null);
  loadLocal(id);
  if (!id) return;
  if (!(await init())) { acct.guest = false; return; }
  await new Promise((res) => {
    const off = X.FA.onAuthStateChanged(X.auth, async (u) => {
      off();
      if (u) { try { await afterAuth(u); } catch (e) { loadLocal(null); acct.guest = true; bus.emit('banmsg', e.message); } }
      else { acct.guest = true; loadLocal(null); ls.del('dmr2_acct'); }
      res();
    });
    setTimeout(res, 6000);
  });
}

/* ranking (los 50 mejores por puntos de rango) */
export async function topPlayers(n = 50) {
  if (!(await init())) throw new Error(t('err_net'));
  const q = X.FS.query(X.FS.collection(X.db, 'players'), X.FS.orderBy('rp', 'desc'), X.FS.limit(n));
  const s = await X.FS.getDocs(q);
  return s.docs.map((d) => d.data()).filter((p) => !p.hidden && !p.gx);
}
export async function findPlayer(id) { return init().then((ok) => (ok ? getDoc('players/' + id) : null)); }
