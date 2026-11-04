/* Vokabelwelt – Konto: Portionen im eigenen Konto speichern (Supabase)
 *
 * Anmeldung mit Benutzername und Passwort. Supabase kennt nur E-Mail-Adressen; deshalb wird aus dem
 * Benutzernamen intern eine Adresse gebildet: „anna“ → vokabelwelt.anna@<loginDomain>. An diese Adresse
 * wird nie etwas geschickt (in Supabase muss dafür „Confirm email“ ausgeschaltet sein).
 * Tabelle und Zugriffsregeln: supabase/vokabelwelt.sql, Einrichtung: supabase/ANLEITUNG.md.
 * Ohne Eintrag in js/config.js läuft Vokabelwelt wie bisher, nur im Browser.
 */
'use strict';

const CLOUD_CFG = { supabaseUrl: '', supabaseKey: '', loginDomain: 'smartslots.ch', ...(window.VOKABELWELT_CONFIG || {}) };
const SB_URL = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.117.2/dist/umd/supabase.js';
const SB_SRI = 'sha384-Rj26LVGvoeRVR6+mwQmFfcR3QOBEwT+ZmuCWpuiqeTzJpCs0ER4ITAWGb4Hiy3Ok';
const CLOUD_TABLE = 'vokabelwelt_sets';
const CLOUD_STATE_KEY = 'vokabelwelt.cloud';
const AUTH_KEY = 'vokabelwelt-auth'; // eigener Speicherplatz, damit sich andere Seiten auf github.io nicht vermischen

const cloud = {
  client: null, loading: null, uid: '', user: '', status: 'off', error: '', lastSync: 0,
  busy: false, again: false, synced: {}, deleted: [], sent: {},
};
/* Kurzer Fingerabdruck einer Portion: Hat sie sich seit dem letzten Hochladen geändert? */
function setHash(set) {
  const str = JSON.stringify(set);
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 0x01000193); }
  return (h >>> 0).toString(36) + str.length.toString(36);
}
const isDirty = (s) => cloud.sent[s.id] !== setHash(s);
const cloudUrl = () => String(CLOUD_CFG.supabaseUrl || '').trim().replace(/\/+$/, '');
const cloudConfigured = () => /^https:\/\/[^/\s]+$/.test(cloudUrl()) && !!String(CLOUD_CFG.supabaseKey || '').trim();

/* ---------- Benutzername ↔ interne Adresse ---------- */
const USER_RE = /^[a-z0-9]+(?:[._-][a-z0-9]+)*$/;
const normUser = (u) => String(u || '').trim().toLowerCase();
const userProblem = (u) => (u.length < 3 ? 'Der Benutzername braucht mindestens 3 Zeichen.'
  : u.length > 30 ? 'Der Benutzername darf höchstens 30 Zeichen haben.'
    : !USER_RE.test(u) ? 'Im Benutzernamen gehen nur Buchstaben a–z (ohne Umlaute), Ziffern sowie Punkt, Minus oder Unterstrich zwischen zwei Zeichen.' : '');
const userEmail = (u) => `vokabelwelt.${u}@${CLOUD_CFG.loginDomain}`;
const emailUser = (email) => (String(email || '').match(/^vokabelwelt\.(.+)@/) || [])[1] || String(email || '').split('@')[0];

/* ---------- Zustand merken (welche Portionen schon im Konto sind) ---------- */
function loadCloudState() {
  try {
    const d = JSON.parse(localStorage.getItem(CLOUD_STATE_KEY) || '{}');
    cloud.synced = d.synced && typeof d.synced === 'object' ? d.synced : {};
    cloud.deleted = Array.isArray(d.deleted) ? d.deleted.filter((x) => typeof x === 'string') : [];
    cloud.sent = d.sent && typeof d.sent === 'object' ? d.sent : {};
    cloud.stateUid = typeof d.uid === 'string' ? d.uid : '';
  } catch { /* */ }
}
function saveCloudState() {
  try { localStorage.setItem(CLOUD_STATE_KEY, JSON.stringify({ uid: cloud.uid, synced: cloud.synced, deleted: cloud.deleted, sent: cloud.sent })); } catch { /* */ }
}

/* ---------- Supabase laden ---------- */
function loadSupabase() {
  if (window.supabase?.createClient) return Promise.resolve(window.supabase);
  if (cloud.loading) return cloud.loading;
  cloud.loading = new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = SB_URL; s.integrity = SB_SRI; s.crossOrigin = 'anonymous';
    s.onload = () => (window.supabase?.createClient ? resolve(window.supabase) : reject(new Error('load')));
    s.onerror = () => { cloud.loading = null; s.remove(); reject(new Error('load')); };
    document.head.appendChild(s);
  });
  return cloud.loading;
}
async function cloudClient() {
  if (cloud.client) return cloud.client;
  const sb = await loadSupabase();
  cloud.client = sb.createClient(cloudUrl(), String(CLOUD_CFG.supabaseKey).trim(), {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: false, storageKey: AUTH_KEY },
  });
  cloud.client.auth.onAuthStateChange((ev) => {
    // Supabase rät, hier nicht direkt auf Supabase zu warten
    if (ev === 'SIGNED_OUT' && cloud.uid) setTimeout(() => { forgetCloudUser(); toast('Du wurdest abgemeldet.'); }, 0);
  });
  return cloud.client;
}

function setCloudUser(user) {
  if (cloud.stateUid && cloud.stateUid !== user.id) { cloud.synced = {}; cloud.deleted = []; cloud.sent = {}; }
  cloud.uid = user.id;
  cloud.stateUid = user.id;
  cloud.user = user.user_metadata?.username || emailUser(user.email);
  saveCloudState();
}
function forgetCloudUser() {
  cloud.uid = ''; cloud.user = ''; cloud.status = 'off'; cloud.error = '';
  cloud.sent = {}; cloud.synced = {}; cloud.deleted = [];
  saveCloudState();
  renderAccountSlot();
}

/* ---------- Beim Start: noch angemeldet? ---------- */
async function cloudInit() {
  if (!cloudConfigured()) return;
  loadCloudState();
  let stored = false;
  try { stored = !!localStorage.getItem(AUTH_KEY); } catch { /* */ }
  if (!stored) return; // nie angemeldet: Supabase gar nicht erst laden
  try {
    const c = await cloudClient();
    const { data } = await c.auth.getSession();
    if (data?.session?.user) {
      setCloudUser(data.session.user);
      renderAccountSlot();
      await cloudSync();
    }
  } catch (e) {
    cloud.status = 'error'; cloud.error = cloudErrorText(e);
  }
  renderAccountSlot();
}

/* ---------- Anmelden, Konto erstellen, Abmelden ---------- */
async function cloudLogin(username, password, create) {
  const c = await cloudClient();
  const email = userEmail(username);
  const res = create
    ? await c.auth.signUp({ email, password, options: { data: { username } } })
    : await c.auth.signInWithPassword({ email, password });
  if (res.error) throw res.error;
  if (!res.data?.session?.user) {
    // Supabase hat ein Konto ohne Anmeldearten zurückgegeben (Name vergeben) oder verlangt eine E-Mail-Bestätigung
    if (create && res.data?.user && Array.isArray(res.data.user.identities) && !res.data.user.identities.length) throw Object.assign(new Error('exists'), { code: 'user_already_exists' });
    throw Object.assign(new Error('confirm'), { code: 'confirm_email' });
  }
  setCloudUser(res.data.session.user);
  renderAccountSlot();
  await cloudSync();
}

async function cloudLogout() {
  // Was noch nicht hochgeladen ist, bleibt auf dem Gerät
  const keep = (s) => !cloud.synced[s.id] || isDirty(s);
  const before = db.sets.length;
  db.sets = db.sets.filter(keep);
  const removed = before - db.sets.length;
  forgetCloudUser(); // zuerst, damit die Abmelde-Meldung von Supabase nicht doppelt erscheint
  saveNow();
  try { await cloud.client?.auth.signOut({ scope: 'local' }); } catch { /* */ }
  return removed;
}

async function cloudChangePassword(password) {
  const c = await cloudClient();
  const { error } = await c.auth.updateUser({ password });
  if (error) throw error;
}

/* ---------- Abgleichen ---------- */
function cleanRemoteSet(d, id) {
  if (!d || typeof d !== 'object' || !Array.isArray(d.words)) return null;
  const words = d.words.filter((w) => w && typeof w.foreign === 'string').map((w) => ({
    ...w, id: String(w.id || uid()), german: String(w.german || ''),
    picStatus: w.picStatus === 'pending' ? 'stale' : (w.picStatus || 'stale'),
  }));
  return {
    ...d, id, lang: 'en', name: String(d.name || 'Vokabeln').slice(0, 200), words,
    picStyle: ['picto', 'clipart', 'emoji'].includes(d.picStyle) ? d.picStyle : 'picto',
    progress: d.progress && typeof d.progress === 'object' ? d.progress : {},
    updated: Number(d.updated) || 0,
  };
}

async function cloudSync() {
  if (!cloud.uid) return;
  if (cloud.busy) { cloud.again = true; return; }
  cloud.busy = true; cloud.status = 'syncing'; renderAccountSlot();
  try {
    const c = await cloudClient();
    // 1) Löschungen, die noch nicht angekommen sind
    if (cloud.deleted.length) {
      const { error } = await c.from(CLOUD_TABLE).delete().in('set_id', cloud.deleted);
      if (error) throw error;
      cloud.deleted = [];
    }
    // 2) Holen
    const { data, error } = await c.from(CLOUD_TABLE).select('set_id,data');
    if (error) throw error;
    const remote = new Map((data || []).map((r) => [r.set_id, r]));
    let changed = false;
    for (const [id, r] of remote) {
      const rs = cleanRemoteSet(r.data, id);
      if (!rs) continue;
      const i = db.sets.findIndex((s) => s.id === id);
      if (i < 0) { db.sets.push(rs); changed = true; } else if (rs.updated > (db.sets[i].updated || 0)) { db.sets[i] = rs; changed = true; } else continue;
      cloud.sent[id] = setHash(rs);
    }
    // 3) Schon einmal hochgeladen, aber nicht mehr im Konto → auf einem anderen Gerät gelöscht
    const gone = db.sets.filter((s) => cloud.synced[s.id] && !remote.has(s.id));
    if (gone.length) { db.sets = db.sets.filter((s) => !gone.includes(s)); changed = true; }
    // 4) Neue oder geänderte Portionen von diesem Gerät hochladen
    const ups = db.sets.filter((s) => {
      const r = remote.get(s.id);
      return !r || (s.updated || 0) > (Number(r.data?.updated) || 0) || (cloud.sent[s.id] && isDirty(s));
    });
    ups.forEach((s) => { if (remote.has(s.id) && (s.updated || 0) <= (Number(remote.get(s.id).data?.updated) || 0)) { s.updated = Date.now(); changed = true; } });
    if (ups.length) await cloudUpload(ups);
    db.sets.forEach((s) => { cloud.synced[s.id] = 1; if (!cloud.sent[s.id]) cloud.sent[s.id] = setHash(s); });
    Object.keys(cloud.synced).forEach((id) => { if (!getSet(id)) delete cloud.synced[id]; });
    Object.keys(cloud.sent).forEach((id) => { if (!getSet(id)) delete cloud.sent[id]; });
    saveCloudState();
    if (changed) {
      db.sets.sort((a, b) => (b.updated || b.created || 0) - (a.updated || a.created || 0));
      saveNow();
      if (ui.view === 'home') render();
    }
    cloud.status = 'ok'; cloud.error = ''; cloud.lastSync = Date.now();
  } catch (e) {
    cloud.status = 'error'; cloud.error = cloudErrorText(e);
    if (e?.status === 401 || e?.code === 'PGRST301') forgetCloudUser();
  } finally {
    cloud.busy = false;
    renderAccountSlot();
  }
  if (cloud.again) { cloud.again = false; cloudSync(); }
}

async function cloudUpload(sets) {
  const c = await cloudClient();
  const rows = sets.map((s) => ({ user_id: cloud.uid, set_id: s.id, name: String(s.name || '').slice(0, 200), data: s }));
  const { error } = await c.from(CLOUD_TABLE).upsert(rows, { onConflict: 'user_id,set_id' });
  if (error) throw error;
  sets.forEach((s) => { cloud.sent[s.id] = setHash(s); cloud.synced[s.id] = 1; });
  saveCloudState();
}

/* Nach jedem Speichern: geänderte Portionen kurz danach hochladen */
const cloudPushSoon = debounce(async () => {
  if (!cloud.uid) return;
  if (cloud.busy) { cloud.again = true; return; }
  const changed = db.sets.filter(isDirty);
  if (!changed.length) return;
  changed.forEach((s) => { if (cloud.sent[s.id]) s.updated = Date.now(); });
  try { localStorage.setItem(STORE_KEY, JSON.stringify(db)); } catch { /* */ }
  cloud.busy = true; cloud.status = 'syncing'; renderAccountSlot();
  try {
    await cloudUpload(changed);
    cloud.status = 'ok'; cloud.error = ''; cloud.lastSync = Date.now();
  } catch (e) {
    cloud.status = 'error'; cloud.error = cloudErrorText(e);
  } finally {
    cloud.busy = false;
    renderAccountSlot();
  }
  if (cloud.again) { cloud.again = false; cloudSync(); }
}, 2500);
function onDbSaved() { if (cloud.uid) cloudPushSoon(); }

async function cloudDeleteSet(id) {
  if (!cloud.uid || !cloud.synced[id]) return;
  delete cloud.synced[id];
  delete cloud.sent[id];
  cloud.deleted.push(id);
  saveCloudState();
  try {
    const c = await cloudClient();
    const { error } = await c.from(CLOUD_TABLE).delete().eq('set_id', id);
    if (error) throw error;
    cloud.deleted = cloud.deleted.filter((x) => x !== id);
    saveCloudState();
  } catch (e) {
    cloud.status = 'error'; cloud.error = cloudErrorText(e); renderAccountSlot();
  }
}

window.addEventListener('online', () => { if (cloud.uid && cloud.status === 'error') cloudSync(); });
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible' && cloud.uid && Date.now() - cloud.lastSync > 60000) cloudSync();
});

/* ---------- Fehlermeldungen ---------- */
function cloudErrorText(e) {
  const code = String(e?.code || ''), msg = String(e?.message || e || '');
  if (code === 'confirm_email') return 'Das Konto ist angelegt, aber Supabase verlangt noch eine E-Mail-Bestätigung. In Supabase unter Authentication → Sign In / Providers → Email die Option „Confirm email“ ausschalten (siehe supabase/ANLEITUNG.md).';
  if (code === 'invalid_credentials' || /invalid login credentials/i.test(msg)) return 'Benutzername oder Passwort stimmt nicht.';
  if (code === 'user_already_exists' || /already (registered|exists)/i.test(msg)) return 'Diesen Benutzernamen gibt es schon. Wähle einen anderen – oder melde dich mit deinem Passwort an.';
  if (code === 'weak_password' || /password.*(least|short|weak|characters)/i.test(msg)) return 'Das Passwort ist zu schwach. Nimm mindestens 8 Zeichen, am besten mit Buchstaben und Ziffern.';
  if (code === 'same_password') return 'Das ist schon dein Passwort.';
  if (code === 'signup_disabled' || /signups? not allowed/i.test(msg)) return 'Neue Konten sind gerade ausgeschaltet. Frag die Person, die Vokabelwelt eingerichtet hat.';
  if (code === 'email_address_invalid' || code === 'validation_failed' || /email.*invalid|invalid.*email/i.test(msg)) return 'Dieser Benutzername geht leider nicht. Nimm nur a–z, Ziffern, Punkt, Minus oder Unterstrich.';
  if (code === 'over_request_rate_limit' || code === 'over_email_send_rate_limit' || e?.status === 429) return 'Zu viele Versuche. Warte einen Moment und versuch es nochmal.';
  if (code === '42P01' || code === 'PGRST205' || /relation .* does not exist|could not find the table/i.test(msg)) return 'In Supabase fehlt die Tabelle: Bitte supabase/vokabelwelt.sql im SQL Editor ausführen.';
  if (code === '42501' || /permission denied|row-level security/i.test(msg)) return 'Keine Berechtigung: Bitte supabase/vokabelwelt.sql in Supabase nochmals ganz ausführen.';
  if (msg === 'load') return 'Die Anmeldung konnte nicht geladen werden. Bist du online?';
  if (e instanceof TypeError || /failed to fetch|network|load failed/i.test(msg)) return 'Keine Verbindung zum Server. Bist du online? (Gratis-Projekte bei Supabase pausieren nach einer Woche ohne Nutzung.)';
  return msg || 'Unbekannter Fehler.';
}

/* ---------- Oberfläche ---------- */
function accountButtonHTML() {
  if (cloud.user) {
    const st = cloud.status === 'syncing' ? 'syncing' : cloud.status === 'error' ? 'error' : 'ok';
    const label = st === 'syncing' ? 'wird gespeichert' : st === 'error' ? 'Problem beim Speichern' : 'gespeichert';
    return `<button class="account-btn in" data-action="account" title="Konto: ${esc(cloud.user)} (${label})" aria-label="Konto ${esc(cloud.user)}, ${label}">
      ${icon('user')}<span class="account-name">${esc(cloud.user)}</span><i class="sync-dot ${st}" aria-hidden="true"></i></button>`;
  }
  return `<button class="account-btn" data-action="login" title="Anmelden, um deine Portionen im Konto zu speichern">${icon('user')}<span>Anmelden</span></button>`;
}
function renderAccountSlot() {
  const slot = document.getElementById('account-slot');
  if (slot) slot.innerHTML = accountButtonHTML();
  const note = document.getElementById('lib-note');
  if (note) note.outerHTML = libraryNote();
  const st = document.getElementById('acct-status');
  if (st) st.innerHTML = accountStatusText();
}
function libraryNote() {
  if (!cloud.user) return '';
  return `<p class="lib-note ${cloud.status === 'error' ? 'bad' : ''}" id="lib-note">${icon(cloud.status === 'error' ? 'x' : 'check')} ${cloud.status === 'error' ? esc(cloud.error) : `In deinem Konto <strong>${esc(cloud.user)}</strong> gespeichert.`}</p>`;
}
function accountStatusText() {
  if (cloud.status === 'syncing') return '<span class="spinner"></span> Wird abgeglichen …';
  if (cloud.status === 'error') return `<span class="warn-text">${esc(cloud.error)}</span>`;
  if (cloud.lastSync) return `Alles gespeichert (${new Date(cloud.lastSync).toLocaleTimeString('de-CH', { hour: '2-digit', minute: '2-digit' })}).`;
  return '';
}

function openLogin(mode = 'login') {
  if (!cloudConfigured()) {
    openModal(`
      <header class="modal-head"><h2>Anmelden</h2><button type="button" class="icon-btn" data-action="close-modal" aria-label="Schließen">${icon('x')}</button></header>
      <p>Mit einem Konto speicherst du deine Vokabelportionen online und hast sie auf jedem Gerät.</p>
      <p class="muted">Der Login ist noch nicht eingerichtet. Wie das geht, steht im Repository in <code>supabase/ANLEITUNG.md</code>: ein Projekt bei Supabase anlegen, die Tabelle erstellen und Adresse und Schlüssel in <code>js/config.js</code> eintragen.</p>
      <footer class="modal-foot"><button type="button" class="btn primary" data-action="close-modal">OK</button></footer>`, { label: 'Anmelden' });
    return;
  }
  const create = mode === 'create';
  openModal(`
    <header class="modal-head"><h2>${create ? 'Konto erstellen' : 'Anmelden'}</h2><button type="button" class="icon-btn" data-action="close-modal" aria-label="Schließen">${icon('x')}</button></header>
    <div class="seg auth-seg" role="group" aria-label="Anmelden oder Konto erstellen">
      <button type="button" class="seg-btn" data-action="login" data-mode="login" aria-pressed="${!create}">Anmelden</button>
      <button type="button" class="seg-btn" data-action="login" data-mode="create" aria-pressed="${create}">Neues Konto</button>
    </div>
    <form class="auth-form" id="auth-form" autocomplete="on" novalidate>
      <label class="field" for="auth-user"><span class="label">Benutzername</span>
        <input id="auth-user" name="username" type="text" autocomplete="username" autocapitalize="none" autocorrect="off" spellcheck="false" maxlength="30" required autofocus placeholder="z. B. frau.muster"></label>
      <label class="field" for="auth-pass"><span class="label">Passwort</span>
        <input id="auth-pass" name="password" type="password" autocomplete="${create ? 'new-password' : 'current-password'}" minlength="8" required></label>
      ${create ? `<label class="field" for="auth-pass2"><span class="label">Passwort wiederholen</span>
        <input id="auth-pass2" type="password" autocomplete="new-password" minlength="8" required></label>
        <p class="muted small">Mindestens 8 Zeichen. Gut merken: Ohne E-Mail-Adresse gibt es kein „Passwort vergessen“.</p>` : ''}
      <p class="form-error" id="auth-error" role="alert"></p>
      <button class="btn primary big" type="submit" id="auth-submit">${create ? 'Konto erstellen' : 'Anmelden'}</button>
    </form>
    <p class="muted small">Deine Portionen werden dann in deinem Konto gespeichert und sind auf jedem Gerät da, auf dem du dich anmeldest. Portionen, die schon auf diesem Gerät sind, kommen mit ins Konto.</p>`, { label: create ? 'Konto erstellen' : 'Anmelden', cls: 'auth-modal' });
  const form = $('#auth-form');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const err = $('#auth-error'), btn = $('#auth-submit');
    const u = normUser($('#auth-user').value), pw = $('#auth-pass').value;
    const problem = userProblem(u) || (pw.length < 8 ? 'Das Passwort braucht mindestens 8 Zeichen.' : '')
      || (create && pw !== $('#auth-pass2').value ? 'Die beiden Passwörter sind nicht gleich.' : '');
    if (problem) { err.textContent = problem; return; }
    err.textContent = '';
    btn.disabled = true;
    btn.innerHTML = `<span class="spinner"></span> ${create ? 'Konto wird erstellt …' : 'Anmelden …'}`;
    try {
      await cloudLogin(u, pw, create);
      closeModal(true);
      toast(create ? `Willkommen, ${u}! Dein Konto ist bereit.` : `Angemeldet als ${u}.`);
      render();
    } catch (ex) {
      if (!$('#auth-error')) return;
      err.textContent = cloudErrorText(ex);
      btn.disabled = false;
      btn.textContent = create ? 'Konto erstellen' : 'Anmelden';
    }
  });
}

function openAccount() {
  openModal(`
    <header class="modal-head"><h2>Dein Konto</h2><button type="button" class="icon-btn" data-action="close-modal" aria-label="Schließen">${icon('x')}</button></header>
    <div class="account-card">
      <span class="account-avatar" aria-hidden="true">${esc(cloud.user.charAt(0).toUpperCase())}</span>
      <div><strong>${esc(cloud.user)}</strong><p class="small" id="acct-status">${accountStatusText()}</p></div>
    </div>
    <p class="muted small">Deine Portionen werden automatisch in deinem Konto gespeichert. Beim Abmelden werden sie von diesem Gerät entfernt – sie bleiben in deinem Konto und sind beim nächsten Anmelden wieder da.</p>
    <div class="row">
      <button type="button" class="btn secondary" data-action="cloud-sync">${icon('flip')} Jetzt abgleichen</button>
      <button type="button" class="btn ghost" data-action="logout">Abmelden</button>
    </div>
    <details class="pw-change"><summary>Passwort ändern</summary>
      <form id="pw-form" class="auth-form" novalidate>
        <input type="text" name="username" autocomplete="username" value="${esc(cloud.user)}" hidden>
        <label class="field" for="pw-new"><span class="label">Neues Passwort</span><input id="pw-new" type="password" autocomplete="new-password" minlength="8"></label>
        <p class="form-error" id="pw-error" role="alert"></p>
        <button type="submit" class="btn small primary">Speichern</button>
      </form>
    </details>`, { label: 'Konto' });
  $('#pw-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const pw = $('#pw-new').value, err = $('#pw-error');
    if (pw.length < 8) { err.textContent = 'Das Passwort braucht mindestens 8 Zeichen.'; return; }
    try { await cloudChangePassword(pw); err.textContent = ''; $('#pw-new').value = ''; toast('Passwort geändert.'); } catch (ex) { err.textContent = cloudErrorText(ex); }
  });
}
