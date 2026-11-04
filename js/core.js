/* Vokabelwelt – Kern: Hilfsfunktionen, Sprache, Parser, Speicher, Bilder, Audio, Spracherkennung */
'use strict';

/* ---------------- Hilfsfunktionen ---------------- */
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const uid = () => Math.random().toString(36).slice(2, 9) + Date.now().toString(36).slice(-4);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const shuffle = (arr) => {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};
const debounce = (fn, ms) => {
  let t;
  return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); };
};
const stripAccents = (s) => String(s).normalize('NFD').replace(/[̀-ͯ]/g, '')
  .replace(/œ/g, 'oe').replace(/Œ/g, 'OE').replace(/æ/g, 'ae').replace(/ß/g, 'ss');

function lev(a, b) {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const cur = [i];
    for (let j = 1; j <= b.length; j++) {
      cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    }
    prev = cur;
  }
  return prev[b.length];
}
const similarity = (a, b) => (!a && !b ? 1 : 1 - lev(a, b) / Math.max(a.length, b.length));

const isFramed = (() => { try { return window.top !== window.self; } catch { return true; } })();

/* ---------------- Sprachen ---------------- */
const LANGS = {
  en: { name: 'Englisch', short: 'EN', adj: 'englische' },
  fr: { name: 'Französisch', short: 'FR', adj: 'französische' },
};
const langCode = (lang) => (lang === 'fr' ? 'fr-FR' : (db.settings.accent === 'us' ? 'en-US' : 'en-GB'));

const ARTICLE_RE = {
  en: /^(?:the|a|an|to)\s+/i,
  fr: /^(?:(?:le|la|les|un|une|des|du|de la|se)\s+|(?:l|s|d)['’]\s*|de l['’]\s*)/i,
  de: /^(?:der|die|das|den|dem|des|ein|eine|einen|einem|einer|sich)\s+/i,
};

/** Text ohne Klammerinhalt, ohne führenden Artikel, erstes Alternativwort */
function stripParens(s) {
  return String(s).replace(/\([^)]*\)/g, ' ').replace(/\[[^\]]*\]/g, ' ').replace(/\s+/g, ' ').trim();
}
function stripArticle(s, lang) {
  const re = ARTICLE_RE[lang];
  if (!re) return s;
  let out = s, prev;
  do { prev = out; out = out.replace(re, ''); } while (out !== prev && out.length);
  return out.trim() || s.trim();
}
function core(text, lang) {
  let s = stripParens(text || '');
  s = s.split(/\s*[\/;]\s*/)[0];
  s = s.replace(/[.!?…]+$/, '').trim();
  return stripArticle(s, lang);
}
/** Mögliche Schlüssel für das Bildwörterbuch */
function lookupKeys(text, lang) {
  if (!text) return [];
  const keys = new Set();
  const c = core(text, lang);
  if (c) keys.add(c);
  stripParens(text).split(/\s*[\/;,]\s*|\s+[–—-]\s+/).forEach((part) => {
    const k = stripArticle(part.replace(/[.!?…]+$/, '').trim(), lang);
    if (k) keys.add(k);
  });
  return [...keys];
}

/** Alle als richtig geltenden Schreibweisen: colo(u)r → colour + color, a / b → a, b */
function answerVariants(text) {
  const out = new Set();
  String(text).split(/\s*[\/;]\s*/).forEach((alt) => {
    const t = alt.trim();
    if (!t) return;
    const without = t.replace(/\s*\([^)]*\)\s*/g, (m) => (/^\s/.test(m) && /\s$/.test(m) ? ' ' : '')).replace(/\s+/g, ' ').trim();
    const withContent = t.replace(/[()[\]]/g, '').replace(/\s+/g, ' ').trim();
    [without, withContent].forEach((v) => v && out.add(v));
  });
  if (!out.size) out.add(String(text).trim());
  return [...out];
}

function normAnswer(s) {
  return String(s).normalize('NFC').replace(/[’‘`´]/g, "'")
    .replace(/\s+[–—-]\s+/g, ', ').replace(/\s*,\s*/g, ', ')
    .replace(/\s+/g, ' ').trim().replace(/[.!?]+$/, '').trim().toLowerCase();
}

/** Ohne Satzzeichen: „go – went – gone“ = „go went gone“, „sb.“ = „sb“ */
const looseAnswer = (s) => normAnswer(s).replace(/[.,;:!?]/g, ' ').replace(/\s+/g, ' ').trim();

/** Bewertet eine geschriebene Antwort: correct | almost | wrong */
function checkAnswer(input, word, lang) {
  const inp = looseAnswer(input);
  const variants = answerVariants(word.foreign);
  const display = word.foreign;
  if (!inp) return { status: 'wrong', note: 'Keine Antwort.' };
  for (const v of variants) if (looseAnswer(v) === inp) return { status: 'correct' };

  for (const v of variants) {
    const t = looseAnswer(v);
    if (stripAccents(t) === stripAccents(inp)) return { status: 'almost', note: 'Fast! Achte auf die Akzente.' };
  }
  for (const v of variants) {
    const t = looseAnswer(v);
    const tc = stripArticle(t, lang), ic = stripArticle(inp, lang);
    if (tc === ic || stripAccents(tc) === stripAccents(ic)) {
      if (lang === 'en') {
        return tc === ic ? { status: 'correct' } : { status: 'almost', note: 'Fast! Achte auf die Schreibweise.' };
      }
      const tHas = tc !== t, iHas = ic !== inp;
      if (tHas && !iHas) return { status: 'almost', note: `Fast! Denk an den Artikel: „${display}“.` };
      if (tHas && iHas) return { status: 'almost', note: 'Fast! Achte auf den Artikel.' };
      if (tc !== ic) return { status: 'almost', note: 'Fast! Achte auf die Akzente.' };
      return { status: 'correct' };
    }
  }
  for (const v of variants) {
    const tc = stripAccents(stripArticle(looseAnswer(v), lang));
    const ic = stripAccents(stripArticle(inp, lang));
    const d = lev(tc, ic);
    if ((tc.length >= 4 && d === 1) || (tc.length >= 9 && d === 2)) {
      return { status: 'almost', note: 'Fast! Ein kleiner Rechtschreibfehler.' };
    }
  }
  return { status: 'wrong' };
}

/* ---------- Aussprache: Vergleich mit dem erkannten Text ---------- */
const HOMOPHONES = {
  en: [['two', 'too', 'to'], ['four', 'for'], ['eight', 'ate'], ['one', 'won'], ['right', 'write'], ['sea', 'see'],
    ['sun', 'son'], ['flower', 'flour'], ['pear', 'pair'], ['here', 'hear'], ['no', 'know'], ['bee', 'be'],
    ['blue', 'blew'], ['night', 'knight'], ['meat', 'meet'], ['tail', 'tale'], ['week', 'weak'], ['wood', 'would'],
    ['hour', 'our'], ['deer', 'dear'], ['bear', 'bare'], ['eye', 'i'], ['red', 'read'], ['whole', 'hole'],
    ['road', 'rode'], ['mail', 'male'], ['plane', 'plain'], ['sale', 'sail'], ['their', 'there'], ['new', 'knew'],
    ['bread', 'bred'], ['horse', 'hoarse'], ['nose', 'knows'], ['weather', 'whether'], ['witch', 'which'], ['where', 'wear'],
    ['rain', 'reign'], ['piece', 'peace'], ['flu', 'flew'], ['hair', 'hare'], ['buy', 'by', 'bye'], ['wait', 'weight'],
    ['way', 'weigh'], ['knot', 'not'], ['berry', 'bury'], ['heel', 'heal'], ['paws', 'pause'], ['toe', 'tow'],
    ['break', 'brake'], ['board', 'bored'], ['made', 'maid'], ['tide', 'tied'], ['steel', 'steal'], ['fair', 'fare'],
    ['cereal', 'serial'], ['dear', 'deer'], ['night', 'nite'], ['tea', 'tee'], ['jeans', 'genes'], ['ok', 'okay']],
  fr: [['vert', 'verre', 'vers', 'ver'], ['mer', 'mere', 'maire'], ['cent', 'sans', 'sang'], ['pain', 'pin'],
    ['cou', 'coup', 'cout'], ['sel', 'selle'], ['foie', 'fois', 'foi'], ['mai', 'mais', 'mes'], ['ou', 'où'],
    ['eau', 'haut', 'oh'], ['vingt', 'vin', 'vain'], ['cinq', 'saint', 'sein'], ['deux', 'de'], ['sept', 'cette', 'set'],
    ['huit', 'wee'], ['un', 'hein'], ['dix', 'dis'], ['six', 'sis'], ['nez', 'ne'], ['lait', 'les', 'laid'],
    ['chaine', 'chene'], ['conte', 'compte', 'comte'], ['faim', 'fin'], ['pere', 'paire', 'perd']],
};
const homophoneMap = {};
for (const lang of Object.keys(HOMOPHONES)) {
  homophoneMap[lang] = new Map();
  for (const group of HOMOPHONES[lang]) for (const w of group) homophoneMap[lang].set(stripAccents(w), stripAccents(group[0]));
}

function normSpeech(s, lang, keepArticle = false) {
  let t = String(s || '').toLowerCase().normalize('NFC').replace(/[’‘`´]/g, "'");
  t = stripParens(t);
  t = t.replace(/\b(\d{1,2})\b/g, (m, n) => (window.NUMBER_WORDS[lang] || [])[+n] || m);
  t = t.replace(/[.,!?;:«»"“”„()…]/g, ' ').replace(/\s+[–—-]\s+/g, ' ').replace(/\s+/g, ' ').trim();
  if (!keepArticle) t = stripArticle(t, lang);
  t = stripAccents(t).replace(/-/g, ' ').replace(/'/g, ' ').replace(/\s+/g, ' ').trim();
  const hm = homophoneMap[lang];
  if (hm) t = t.split(' ').map((w) => hm.get(w) || w).join(' ');
  return t;
}

/* Wie streng die Aussprache bewertet wird:
   strict – nur der erste (wahrscheinlichste) erkannte Text zählt, und er muss genau das Wort sein.
            Meldet der Browser, dass er unsicher war, zählt es auch nicht.
   medium – wie streng, aber bei langen Wörtern darf ein Buchstabe abweichen (z. B. Plural-s).
   loose  – ähnlich klingende Wörter und alle Vorschläge des Browsers zählen (frühere Einstellung). */
const SPEECH_LEVELS = {
  strict: { label: 'Streng', hint: 'Nur genau das Wort zählt, und der Browser muss sich sicher sein. Wird oft abgelehnt.' },
  medium: { label: 'Mittel', hint: 'Empfohlen: Das Wort muss stimmen („Brad“ statt „bread“ ist falsch). Bei langen Wörtern ist ein kleiner Unterschied ok.' },
  loose: { label: 'Locker', hint: 'Ähnlich klingende Wörter zählen auch.' },
};
const STRICT_MIN_CONFIDENCE = 0.5;

const frArticle = (normWithArticle) => (normWithArticle.match(/^(de la|de l|le|la|les|l|un|une|des|du)\s/) || [])[1] || '';

/** Vergleicht das Erkannte mit dem Zielwort. alternatives.best = { t, conf, final } (von listenOnce) */
function speechMatch(alternatives, word, lang, level = db.settings.speechLevel || 'medium') {
  const variants = answerVariants(word.foreign);
  const targets = variants.map((v) => normSpeech(v, lang)).filter(Boolean);
  const best = alternatives.best || { t: alternatives[0] || '', conf: 0, final: false };

  if (level === 'loose') {
    let res = { ok: false, score: 0, heard: alternatives[0] || '' };
    for (const alt of alternatives) {
      const h = normSpeech(alt, lang);
      if (!h) continue;
      for (const t of targets) {
        if (h === t || (` ${h} `).includes(` ${t} `)) return { ok: true, score: 1, heard: alt };
        const hw = h.split(' '), n = t.split(' ').length;
        let sc = similarity(h, t);
        for (let i = 0; i + n <= hw.length; i++) sc = Math.max(sc, similarity(hw.slice(i, i + n).join(' '), t));
        const need = t.length <= 3 ? 1 : t.length <= 5 ? 0.8 : 0.75;
        if (sc >= need) return { ok: true, score: sc, heard: alt };
        if (sc > res.score) res = { ok: false, score: sc, heard: alt };
      }
    }
    return res;
  }

  // streng / mittel: nur der wahrscheinlichste Text zählt
  const heard = best.t || '';
  const h = normSpeech(heard, lang);
  if (!h) return { ok: false, score: 0, heard: '' };
  const squash = (x) => x.replace(/ /g, '');
  const contains = (t) => (` ${h} `).includes(` ${t} `) && h.split(' ').length <= t.split(' ').length + 2;
  // „Mittel“: Plural-Endung ist ok; nur bei langen Wörtern (ab 8 Buchstaben) darf ein Buchstabe abweichen.
  // So bleibt „butter“ ≠ „better“ und „bread“ ≠ „Brad“.
  const near = (t) => {
    const a = squash(h), b = squash(t);
    return a === b + 's' || a === b + 'es' || (b.length >= 8 && lev(a, b) <= 1);
  };
  const ok = targets.some((t) => h === t || squash(h) === squash(t)
    || (level === 'medium' && (contains(t) || near(t))));
  const score = Math.max(0, ...targets.map((t) => similarity(h, t)));
  if (!ok) return { ok: false, score, heard };

  // Französisch: Wird ein Artikel gesagt, muss es der richtige sein (le ≠ la).
  if (lang === 'fr') {
    const hArt = frArticle(normSpeech(heard, lang, true));
    const tArts = variants.map((v) => frArticle(normSpeech(v, lang, true))).filter(Boolean);
    if (hArt && tArts.length && !tArts.includes(hArt)) return { ok: false, score, heard, note: 'article' };
  }
  // Streng: Der Browser war sich selbst nicht sicher → nicht zählen.
  if (level === 'strict' && best.final && best.conf > 0 && best.conf < STRICT_MIN_CONFIDENCE) {
    return { ok: false, score, heard, note: 'unsure' };
  }
  return { ok: true, score: 1, heard };
}

/** Text, der vorgelesen wird (Abkürzungen ausgeschrieben) */
function ttsText(text, lang) {
  let s = stripParens(text);
  if (lang === 'en') {
    s = s.replace(/\bsb\.?'s\b/gi, "somebody's").replace(/\bsb\b\.?/gi, 'somebody')
      .replace(/\bsth\b\.?/gi, 'something').replace(/\bsw\b\.?/gi, 'somewhere');
  } else if (lang === 'fr') {
    s = s.replace(/\bqqn\b\.?|\bqn\b\.?/gi, "quelqu'un").replace(/\bqqch\b\.?|\bqch\b\.?|\bqc\b\.?/gi, 'quelque chose');
  }
  return s.replace(/\s*\/\s*/g, ', ').replace(/\s+[–—-]\s+/g, ', ').replace(/\s+/g, ' ').trim();
}

/* ---------------- Parser für eingefügte Vokabeln ---------------- */
const SEPARATORS = [' = ', '=', ' -> ', '->', ' → ', '→', ' : ', ' | ', '|', ';'];
const DASH_SEPARATORS = [' – ', ' — ', ' - ', ' ‒ '];

function splitLine(line) {
  if (line.includes('\t')) {
    const cols = line.split('\t').map((s) => s.trim()).filter(Boolean);
    if (cols.length >= 2) return [cols[0], cols[1]];
    if (cols.length === 1) return [cols[0], ''];
  }
  for (const sep of SEPARATORS) {
    const i = line.indexOf(sep);
    if (i > 0 && i < line.length - sep.length) return [line.slice(0, i), line.slice(i + sep.length)];
  }
  for (const sep of DASH_SEPARATORS) {
    const i = line.lastIndexOf(sep);
    if (i > 0) return [line.slice(0, i), line.slice(i + sep.length)];
  }
  const cols = line.split(/\s{2,}/);
  if (cols.length >= 2) return [cols[0], cols.slice(1).join(' ')];
  if (line.includes(':')) {
    const i = line.indexOf(':');
    if (i > 0) return [line.slice(0, i), line.slice(i + 1)];
  }
  const commas = line.split(',');
  if (commas.length === 2) return commas;
  return [line, ''];
}

const DE_HINT = /\b(der|die|das|ein|eine|sich|und|nicht|mit|von|zu)\b|[äöüß]/i;
const EN_HINT = /\b(the|a|an|to|of|and|is|sb|sth)\b|\b\w+(ing|tion|ous|ly)\b|'s\b/i;
const FR_HINT = /\b(le|la|les|un|une|des|du|et|est|qn|qc)\b|\bl['’]|[éèêàçùûôîœ]/i;

function langScore(text) {
  return { de: (text.match(new RegExp(DE_HINT, 'gi')) || []).length,
    en: (text.match(new RegExp(EN_HINT, 'gi')) || []).length,
    fr: (text.match(new RegExp(FR_HINT, 'gi')) || []).length };
}

/** Liefert { rows: [{foreign, german}], swapped, lang } */
function parseVocab(text, opts = {}) {
  const raw = String(text || '').split(/\r?\n/)
    .map((l) => l.replace(/^\s*(?:\d+\s*[.)]|[-•*·▪●◦–])\s+/, '').trim())
    .filter((l) => l && !/^[-–—_=\s]+$/.test(l));
  let rows = raw.map((l) => splitLine(l).map((s) => s.trim().replace(/^["„“]|["“”]$/g, '')));
  rows = rows.filter((r) => r[0] || r[1]);

  // Welche Spalte ist Deutsch?
  let col0 = { de: 0, en: 0, fr: 0 }, col1 = { de: 0, en: 0, fr: 0 };
  for (const [a, b] of rows) {
    const sa = langScore(a), sb = langScore(b || '');
    for (const k of ['de', 'en', 'fr']) { col0[k] += sa[k]; col1[k] += sb[k]; }
    const capA = /^[A-ZÄÖÜ]/.test(stripArticle(a, 'de')), capB = /^[A-ZÄÖÜ]/.test(stripArticle(b || '', 'de'));
    if (capB && !capA) col1.de += 0.3;
    if (capA && !capB && b) col0.de += 0.3;
  }
  let germanFirst = col0.de > col1.de && (col1.en + col1.fr) >= (col0.en + col0.fr);
  if (opts.swap) germanFirst = !germanFirst;
  const foreignScore = germanFirst ? col1 : col0;
  const detected = foreignScore.fr > foreignScore.en ? 'fr' : (foreignScore.en > 0 ? 'en' : null);

  return {
    rows: rows.map(([a, b]) => (germanFirst ? { foreign: b || '', german: a } : { foreign: a, german: b || '' }))
      .filter((r) => r.foreign || r.german),
    germanFirst,
    detected,
  };
}

/* ---------------- Speicher ---------------- */
const STORE_KEY = 'vokabelwelt.v1';
const DEFAULT_SETTINGS = { sound: true, autoSpeak: true, accent: 'gb', voice: { en: '', fr: '' }, rate: 0.9, micId: '', speechLevel: 'medium' };
let db = { sets: [], settings: structuredClone(DEFAULT_SETTINGS) };

function loadDB() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return;
    const d = JSON.parse(raw);
    db = { ...db, ...d, settings: { ...structuredClone(DEFAULT_SETTINGS), ...(d.settings || {}) } };
    if (!db.settings.speechLevelChosen) db.settings.speechLevel = 'medium';
    db.sets = (db.sets || []).filter((s) => s && Array.isArray(s.words));
    db.sets.forEach((s) => {
      s.words.forEach((w) => {
        if (w.picStatus === 'pending') w.picStatus = 'stale';
        if (w.pic && w.pic.kind === 'ai') { w.pic = null; w.picStatus = 'stale'; } // KI-Bilder gibt es nicht mehr
      });
      if (s.picStyle === 'ai') s.picStyle = 'picto';
      // Ältere Portionen: Fotos waren Standard. Jetzt sind Piktogramme Standard (eindeutiger).
      if (!s.picVersion) {
        s.picVersion = 2;
        if (s.picStyle === 'photo' || !s.picStyle) {
          s.picStyle = 'picto';
          s.words.forEach((w) => { if (!(w.pic && w.pic.manual)) w.picStatus = 'stale'; });
        }
      }
    });
  } catch { /* Speicher nicht verfügbar */ }
}
let saveWarned = false;
function saveNow() {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(db));
    return true;
  } catch {
    if (!saveWarned) {
      saveWarned = true;
      toast('Speichern hat nicht geklappt. Vielleicht ist der Speicher voll – lösche alte Portionen oder eigene Fotos.', 'bad');
    }
    return false;
  }
}
const saveDB = debounce(saveNow, 250);
const getSet = (id) => db.sets.find((s) => s.id === id);

function newSet({ name, lang, rows, picStyle = 'picto' }) {
  const set = {
    id: uid(), name, lang, picStyle, picVersion: 2, created: Date.now(), updated: Date.now(),
    words: rows.map((r) => ({ id: uid(), foreign: r.foreign, german: r.german, pic: r.pic || null, picStatus: r.pic ? 'done' : 'stale' })),
    progress: {},
  };
  db.sets.unshift(set);
  saveDB();
  return set;
}

/* ---------------- Bilder ---------------- */
const PICTURES = (() => {
  const entries = [];
  const maps = { en: new Map(), fr: new Map(), de: new Map(), deExact: new Map() };
  for (const line of window.PICTURE_DATA.split('\n')) {
    const parts = line.split('|');
    if (parts.length < 4) continue;
    const [pic, en, fr, de] = parts.map((p) => p.trim());
    const entry = { pic, en: en.split(','), fr: fr.split(','), de: de.split(',') };
    entries.push(entry);
    const add = (map, key) => { key = key.trim(); if (key && !map.has(key)) map.set(key, entry); };
    entry.en.forEach((k) => { add(maps.en, k.toLowerCase()); add(maps.en, stripArticle(k.toLowerCase(), 'en')); });
    entry.fr.forEach((k) => { add(maps.fr, k.toLowerCase()); add(maps.fr, stripAccents(k.toLowerCase())); add(maps.fr, stripArticle(k.toLowerCase(), 'fr')); });
    entry.de.forEach((k) => { add(maps.deExact, k.trim()); add(maps.de, k.toLowerCase()); });
  }
  return { entries, maps };
})();

const entryToPic = (entry) => (entry.pic.startsWith('#')
  ? { kind: 'color', src: entry.pic }
  : { kind: 'emoji', src: entry.pic });

function numberPic(keys, lang) {
  const NW = window.NUMBER_WORDS;
  for (const k of keys) {
    const low = k.toLowerCase();
    if (/^\d{1,4}$/.test(low)) return { kind: 'number', src: low };
    for (const l of [lang, 'de']) {
      const idx = (NW[l] || []).indexOf(low);
      if (idx >= 0) return { kind: 'number', src: String(idx) };
      if (NW.tens[l] && NW.tens[l][low]) return { kind: 'number', src: String(NW.tens[l][low]) };
    }
  }
  return null;
}

/** Bild aus dem eingebauten Wörterbuch (Emoji, Farbe, Zahl) – sofort und offline */
function localPicture(word, lang) {
  const deKeys = lookupKeys(word.german, 'de');
  const foKeys = lookupKeys(word.foreign, lang);
  const num = numberPic([...foKeys, ...deKeys], lang);
  if (num) return num;
  const { maps } = PICTURES;
  for (const k of deKeys) if (maps.deExact.has(k)) return entryToPic(maps.deExact.get(k));
  for (const k of deKeys) if (maps.de.has(k.toLowerCase())) return entryToPic(maps.de.get(k.toLowerCase()));
  const fm = maps[lang];
  if (fm) {
    for (const k of foKeys) {
      const low = k.toLowerCase();
      if (fm.has(low)) return entryToPic(fm.get(low));
      if (fm.has(stripAccents(low))) return entryToPic(fm.get(stripAccents(low)));
    }
  }
  return null;
}

function searchPictureEntries(query, limit = 60) {
  const q = stripAccents(query.trim().toLowerCase());
  if (!q) return PICTURES.entries.filter((e) => !e.pic.startsWith('#')).slice(0, limit);
  const hits = [];
  for (const e of PICTURES.entries) {
    const all = [...e.en, ...e.fr, ...e.de].map((k) => stripAccents(k.toLowerCase()));
    const score = all.some((k) => k === q) ? 3 : all.some((k) => k.startsWith(q)) ? 2 : all.some((k) => k.includes(q)) ? 1 : 0;
    if (score) hits.push([score, e]);
  }
  return hits.sort((a, b) => b[0] - a[0]).slice(0, limit).map((h) => h[1]);
}

/** Ist das Wort vermutlich ein Nomen? (Deutsch groß geschrieben oder mit Artikel) */
function isNounish(word, lang) {
  const de = stripParens(word.german || '');
  if (de) {
    if (/^(der|die|das|ein|eine)\s/i.test(de)) return true;
    return /^[A-ZÄÖÜ]/.test(stripArticle(de, 'de'));
  }
  const fo = stripParens(word.foreign || '');
  if (lang === 'en') return /^(the|a|an)\s/i.test(fo);
  if (lang === 'fr') return /^(le|la|les|un|une|des)\s|^l['’]/i.test(fo);
  return true;
}

/* --- Wikipedia / Wikimedia (CORS mit origin=*) --- */
const net = { wikiDown: false, arasaacDown: false, arasaacBase: 0, clipartDown: false, openverseDown: false, openverseBusy: false };
const wikiCache = new Map();
const BAD_IMAGE = /(map|karte|locator|location|flag|flagge|logo|wappen|coat[_ ]of[_ ]arms|blason|diagram|signature|unterschrift|icon|symbol|disambig|commons-logo|question_book|ambox)/i;

async function fetchJSON(url, timeout = 9000) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeout);
  try {
    const r = await fetch(url, { signal: ctrl.signal });
    if (!r.ok) throw new Error('HTTP ' + r.status);
    return await r.json();
  } finally { clearTimeout(timer); }
}

async function wikiApi(lang, params) {
  if (net.wikiDown) return null;
  const host = lang === 'commons' ? 'commons.wikimedia.org' : `${lang}.wikipedia.org`;
  const qs = new URLSearchParams({ action: 'query', format: 'json', formatversion: '2', origin: '*', ...params });
  const url = `https://${host}/w/api.php?${qs}`;
  if (wikiCache.has(url)) return wikiCache.get(url);
  const p = fetchJSON(url).catch((e) => {
    if (e instanceof TypeError || e.name === 'AbortError') net.wikiDown = true;
    wikiCache.delete(url);
    return null;
  });
  wikiCache.set(url, p);
  return p;
}

const fileUrl = (lang, name) => `https://${lang}.wikipedia.org/wiki/File:${encodeURIComponent(name)}`;

/** Leitbild eines Wikipedia-Artikels (+ englischer Titel über Sprachlinks) */
async function wikiPage(lang, title) {
  if (!title) return null;
  const r = await wikiApi(lang, {
    titles: title, redirects: '1', prop: 'pageimages|pageprops|langlinks',
    piprop: 'thumbnail|name', pithumbsize: '640', ppprop: 'disambiguation', lllang: 'en',
  });
  const page = r?.query?.pages?.[0];
  if (!page || page.missing || page.invalid) return null;
  const disamb = page.pageprops && 'disambiguation' in page.pageprops;
  const en = page.langlinks?.[0]?.title || (lang === 'en' ? page.title : null);
  const thumb = page.thumbnail?.source;
  const ok = thumb && !disamb && !BAD_IMAGE.test(page.pageimage || '');
  return {
    title: page.title, disamb, en,
    thumb: ok ? thumb : null,
    credit: ok ? { text: `Wikipedia: ${page.title}`, url: fileUrl(lang, page.pageimage) } : null,
  };
}

async function wikiSearch(lang, query, limit = 8) {
  const r = await wikiApi(lang, {
    generator: 'search', gsrsearch: query, gsrlimit: String(limit), gsrnamespace: '0',
    prop: 'pageimages|pageprops', piprop: 'thumbnail|name', pithumbsize: '480', ppprop: 'disambiguation',
  });
  const pages = (r?.query?.pages || []).slice().sort((a, b) => (a.index || 0) - (b.index || 0));
  return pages
    .filter((p) => p.thumbnail?.source && !BAD_IMAGE.test(p.pageimage || '') && !(p.pageprops && 'disambiguation' in p.pageprops))
    .map((p) => ({ src: p.thumbnail.source, title: p.title, credit: { text: `Wikipedia: ${p.title}`, url: fileUrl(lang, p.pageimage) } }));
}

async function commonsSearch(query, limit = 18) {
  const r = await wikiApi('commons', {
    generator: 'search', gsrsearch: `${query} filetype:bitmap`, gsrlimit: String(limit), gsrnamespace: '6',
    prop: 'imageinfo', iiprop: 'url', iiurlwidth: '480',
  });
  const pages = (r?.query?.pages || []).slice().sort((a, b) => (a.index || 0) - (b.index || 0));
  return pages
    .filter((p) => p.imageinfo?.[0]?.thumburl && !BAD_IMAGE.test(p.title))
    .map((p) => ({ src: p.imageinfo[0].thumburl, title: p.title.replace(/^File:|\.\w+$/g, ''),
      credit: { text: 'Wikimedia Commons', url: p.imageinfo[0].descriptionurl } }));
}

async function photoPicture(word, lang) {
  const de = core(word.german, 'de'), fo = core(word.foreign, lang);
  const tries = [];
  if (de) tries.push(['de', de]);
  if (fo) tries.push([lang, fo]);
  for (const [wl, t] of tries) {
    const p = await wikiPage(wl, t);
    if (p?.thumb) return { kind: 'photo', src: p.thumb, credit: p.credit };
    if (net.wikiDown) return null;
  }
  for (const [wl, t] of tries) {
    const list = await wikiSearch(wl, t, 4);
    if (list.length) return { kind: 'photo', src: list[0].src, credit: list[0].credit };
    if (net.wikiDown) return null;
  }
  return null;
}

/** Englischer Begriff (für Clipart- und Openverse-Suche, die vor allem englisch beschriftet sind) */
async function englishTerm(word, lang) {
  const fo = core(word.foreign, lang);
  if (lang === 'en') return fo;
  const de = core(word.german, 'de');
  for (const [l, t] of [[lang, fo], ['de', de]]) {
    if (!t) continue;
    const p = await wikiPage(l, t);
    if (p?.en && !p.disamb) return p.en.replace(/\s*\([^)]*\)$/, '').toLowerCase();
  }
  return de ? `${de} (${fo})` : fo;
}

/* --- ARASAAC-Piktogramme: eindeutige, einheitlich gezeichnete Bilder (auch für Verben und Gefühle) ---
   Piktogramme: Sergio Palao, ARASAAC (https://arasaac.org), Eigentum der Regierung von Aragón, Lizenz CC BY-NC-SA. */
const ARASAAC_BASES = ['https://api.arasaac.org/v1/pictograms', 'https://api.arasaac.org/api/pictograms'];
const ARASAAC_CREDIT = { text: 'Piktogramm: Sergio Palao, ARASAAC (CC BY-NC-SA)', url: 'https://arasaac.org' };
const arasaacImg = (id, size = 500) => `https://static.arasaac.org/pictograms/${id}/${id}_${size}.png`;
const arasaacCache = new Map();

/** mode: 'bestsearch' (Stichwort passt genau) oder 'search' (ähnliche Stichwörter) */
function arasaacQuery(locale, text, mode = 'bestsearch') {
  text = String(text || '').trim();
  if (!text || net.arasaacDown) return Promise.resolve([]);
  const key = `${locale}|${mode}|${text.toLowerCase()}`;
  if (arasaacCache.has(key)) return arasaacCache.get(key);
  const p = (async () => {
    for (let i = net.arasaacBase; i < ARASAAC_BASES.length; i++) {
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), 9000);
      try {
        const r = await fetch(`${ARASAAC_BASES[i]}/${locale}/${mode}/${encodeURIComponent(text)}`, { signal: ctrl.signal });
        net.arasaacBase = i;
        if (!r.ok) return []; // nichts gefunden
        const data = await r.json();
        return (Array.isArray(data) ? data : []).filter((x) => x && x._id && !x.sex && !x.violence);
      } catch { /* nächste Adresse versuchen */ } finally { clearTimeout(timer); }
    }
    net.arasaacDown = true;
    arasaacCache.delete(key);
    return [];
  })();
  arasaacCache.set(key, p);
  return p;
}

const toPicto = (x) => ({ kind: 'picto', src: arasaacImg(x._id), title: x.keywords?.[0]?.keyword || '', credit: ARASAAC_CREDIT });

/** Piktogramme für ein Wort. Treffer, die zum deutschen UND zum fremdsprachigen Wort passen,
 *  kommen zuerst – so wird z. B. bei „bat – Fledermaus“ das Tier gewählt und nicht der Schläger. */
async function pictoCandidates(word, lang, limit = 8) {
  const de = core(word.german, 'de'), fo = core(word.foreign, lang);
  const variants = (t) => [...new Set([t, stripAccents(t)])].filter(Boolean);
  const gather = async (mode) => {
    const [deL, foL] = await Promise.all([
      Promise.all(variants(de).map((t) => arasaacQuery('de', t, mode))).then((a) => a.flat()),
      Promise.all(variants(fo).map((t) => arasaacQuery(lang, t, mode))).then((a) => a.flat()),
    ]);
    const foIds = new Set(foL.map((x) => x._id));
    return [...deL.filter((x) => foIds.has(x._id)), ...deL, ...foL];
  };
  let list = await gather('bestsearch');
  if (list.length < limit && !net.arasaacDown) list = list.concat(await gather('search'));
  const seen = new Set();
  return list.filter((x) => (seen.has(x._id) ? false : seen.add(x._id))).slice(0, limit).map(toPicto);
}

/** Freie Suche im Bild-Dialog */
async function pictoSearch(query, lang) {
  const [a, b, c] = await Promise.all([arasaacQuery('de', query, 'search'), arasaacQuery(lang, query, 'search'), arasaacQuery('en', query, 'search')]);
  const seen = new Set();
  return [...a, ...b, ...c].filter((x) => (seen.has(x._id) ? false : seen.add(x._id))).slice(0, 24).map(toPicto);
}

/* --- Cliparts: farbige, offene Emoji- und Clipart-Sammlungen über Iconify (ohne Anmeldung) --- */
const CLIPART_SETS = {
  'fluent-emoji': 'Microsoft Fluent Emoji (MIT)',
  'fluent-emoji-flat': 'Microsoft Fluent Emoji (MIT)',
  noto: 'Google Noto Emoji (Apache 2.0)',
  twemoji: 'Twemoji (CC BY 4.0)',
  openmoji: 'OpenMoji (CC BY-SA 4.0)',
  'flat-color-icons': 'Flat Color Icons (MIT)',
  'streamline-emojis': 'Streamline Emojis (CC BY 4.0)',
  fxemoji: 'Firefox OS Emoji (CC BY 4.0)',
  emojione: 'EmojiOne (CC BY 4.0)',
};
const clipartCache = new Map();

async function clipartSearch(query, limit = 24) {
  query = String(query || '').trim().toLowerCase();
  if (!query || net.clipartDown) return [];
  const key = `${query}|${limit}`;
  if (clipartCache.has(key)) return clipartCache.get(key);
  const order = Object.keys(CLIPART_SETS);
  const p = (async () => {
    const qs = new URLSearchParams({ query, limit: '96', prefixes: order.join(',') });
    try {
      const data = await fetchJSON(`https://api.iconify.design/search?${qs}`);
      const names = (data?.icons || []).map(String).filter((n) => order.includes(n.split(':')[0]));
      // Relevanz behalten, aber die schönsten Sammlungen leicht bevorzugen
      const ranked = names.map((n, i) => [i + order.indexOf(n.split(':')[0]) * 2, n]).sort((a, b) => a[0] - b[0]).map((x) => x[1]);
      return ranked.slice(0, limit).map((n) => {
        const [prefix, name] = n.split(':');
        return { kind: 'clipart', src: `https://api.iconify.design/${prefix}/${name}.svg`, title: name.replace(/-/g, ' '),
          credit: { text: `Clipart: ${CLIPART_SETS[prefix]}`, url: `https://icon-sets.iconify.design/${prefix}/${name}/` } };
      });
    } catch (e) {
      if (e instanceof TypeError || e.name === 'AbortError') net.clipartDown = true;
      clipartCache.delete(key);
      return [];
    }
  })();
  clipartCache.set(key, p);
  return p;
}

async function clipartCandidates(word, lang, limit = 6) {
  const term = await englishTerm(word, lang);
  let list = await clipartSearch(term, limit);
  if (!list.length && term.includes(' ')) list = await clipartSearch(term.split(' ').pop(), limit);
  return list;
}

/* --- Openverse: über 800 Millionen frei lizenzierte Fotos und Zeichnungen (ohne Anmeldung) --- */
async function openverseSearch(query, category = '') {
  query = String(query || '').trim();
  if (!query || net.openverseDown) return [];
  net.openverseBusy = false;
  const qs = new URLSearchParams({ q: query, page_size: '20', mature: 'false' });
  if (category) qs.set('category', category);
  try {
    const data = await fetchJSON(`https://api.openverse.org/v1/images/?${qs}`, 12000);
    return (data?.results || []).filter((r) => r && (r.thumbnail || r.url)).map((r) => ({
      kind: 'photo', src: r.thumbnail || r.url, title: r.title || '',
      credit: { text: `${r.creator || 'Openverse'} (${String(r.license || '').toUpperCase()} ${r.license_version || ''})`.replace(/\s+\)/, ')'), url: r.foreign_landing_url || 'https://openverse.org' },
    }));
  } catch (e) {
    if (e instanceof TypeError || e.name === 'AbortError') net.openverseDown = true;
    else if (/429/.test(String(e.message))) net.openverseBusy = true;
    return [];
  }
}

function loadImage(src, timeout = 30000) {
  return new Promise((resolve) => {
    const img = new Image();
    const timer = setTimeout(() => { img.src = ''; resolve(false); }, timeout);
    img.onload = () => { clearTimeout(timer); resolve(img.naturalWidth > 0); };
    img.onerror = () => { clearTimeout(timer); resolve(false); };
    img.src = src;
  });
}

/* --- automatische Bildwahl --- */
/* Grundsatz: lieber kein Bild als ein missverständliches. Fotos nur für Nomen –
   bei Verben und Adjektiven zeigen Wikipedia-Fotos oft etwas anderes. */
async function autoPicture(word, set) {
  const local = localPicture(word, set.lang);
  if (local && (local.kind === 'color' || local.kind === 'number')) return local;
  const noun = isNounish(word, set.lang);
  const picto = async () => (await pictoCandidates(word, set.lang, 1))[0] || null;
  const photo = async () => (noun ? photoPicture(word, set.lang) : null);
  const style = set.picStyle || 'picto';
  if (style === 'emoji') return local || (await picto()) || (await photo());
  if (style === 'photo') return (await photo()) || (await picto()) || local;
  if (style === 'clipart') {
    const c = (await clipartCandidates(word, set.lang, 1))[0];
    if (c) return c;
  }
  return (await picto()) || local || (await photo());
}

const picJobs = new Map(); // setId -> {done, total}
async function fillPictures(set, { force = false, onProgress } = {}) {
  const todo = set.words.filter((w) => !(w.pic && w.pic.manual) && (force || !w.pic || w.picStatus !== 'done'));
  if (!todo.length) return;
  const job = { done: 0, total: todo.length };
  picJobs.set(set.id, job);
  todo.forEach((w) => { w.picStatus = 'pending'; });
  onProgress?.();
  let i = 0;
  const worker = async () => {
    while (i < todo.length) {
      const w = todo[i++];
      try {
        const pic = await autoPicture(w, set);
        if (!(w.pic && w.pic.manual)) w.pic = pic || null;
      } catch { /* weiter mit dem nächsten Wort */ }
      w.picStatus = 'done';
      job.done++;
      saveDB();
      onProgress?.(w);
    }
  };
  await Promise.all(Array.from({ length: 4 }, worker));
  picJobs.delete(set.id);
  onProgress?.();
}

/* Bilder, die im Browser nicht geladen werden konnten → Ersatzbild */
const brokenPics = new Set();
function effectivePic(word, lang) {
  const p = word.pic;
  if (p && p.kind === 'none') return null;
  if (p && !(p.src && brokenPics.has(p.src))) return p;
  return localPicture(word, lang);
}
const hasPicture = (word, lang) => !!effectivePic(word, lang);

function picHTML(word, lang, cls = '') {
  if (word.picStatus === 'pending' && !(word.pic && word.pic.manual)) {
    return `<span class="pic pic-loading ${cls}" aria-label="Bild wird gesucht"></span>`;
  }
  const p = effectivePic(word, lang);
  if (!p) {
    const letter = esc((core(word.foreign, lang) || '?').charAt(0).toUpperCase());
    return `<span class="pic pic-none ${cls}" aria-hidden="true"><span>${letter}</span></span>`;
  }
  if (p.kind === 'emoji') return `<span class="pic pic-emoji ${cls}" role="img" aria-label="${esc(word.german || word.foreign)}"><span>${esc(p.src)}</span></span>`;
  if (p.kind === 'color') return `<span class="pic pic-color ${cls}" role="img" aria-label="${esc(word.german || word.foreign)}"><span style="--swatch:${esc(p.src)}"></span></span>`;
  if (p.kind === 'number') return `<span class="pic pic-number ${cls}" role="img" aria-label="${esc(p.src)}"><span>${esc(p.src)}</span></span>`;
  return `<span class="pic pic-img${p.kind === 'picto' || p.kind === 'clipart' ? ' pic-picto' : ''} ${cls}"><img src="${esc(p.src)}" alt="${esc(word.german || word.foreign)}" data-wid="${esc(word.id)}" draggable="false" decoding="async"></span>`;
}

document.addEventListener('error', (e) => {
  const img = e.target;
  if (!(img instanceof HTMLImageElement) || !img.dataset.wid) return;
  brokenPics.add(img.getAttribute('src'));
  const holder = img.closest('.pic');
  let set = null, word = null;
  for (const s of db.sets) {
    const w = s.words.find((x) => x.id === img.dataset.wid);
    if (w) { set = s; word = w; break; }
  }
  if (holder && word) {
    const cls = [...holder.classList].filter((c) => !c.startsWith('pic-') && c !== 'pic').join(' ');
    holder.outerHTML = picHTML(word, set.lang, cls);
  }
}, true);

function fileToDataURL(file, max = 520) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const s = Math.min(1, max / Math.max(img.width, img.height));
      const c = document.createElement('canvas');
      c.width = Math.round(img.width * s); c.height = Math.round(img.height * s);
      const ctx = c.getContext('2d');
      ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, c.width, c.height);
      ctx.drawImage(img, 0, 0, c.width, c.height);
      URL.revokeObjectURL(url);
      resolve(c.toDataURL('image/jpeg', 0.82));
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Bild nicht lesbar')); };
    img.src = url;
  });
}

/* ---------------- Audio: Vorlesen + Klänge ---------------- */
const tts = { voices: [] };
function refreshVoices() {
  if (!('speechSynthesis' in window)) return;
  tts.voices = speechSynthesis.getVoices();
}
if ('speechSynthesis' in window) {
  refreshVoices();
  speechSynthesis.addEventListener?.('voiceschanged', refreshVoices);
}
const canSpeak = () => 'speechSynthesis' in window;

function voicesFor(lang) {
  const want = langCode(lang).toLowerCase();
  const base = want.slice(0, 2);
  return tts.voices.filter((v) => v.lang.toLowerCase().replace('_', '-').startsWith(base))
    .sort((a, b) => voiceRank(b, want) - voiceRank(a, want));
}
function voiceRank(v, want) {
  let r = 0;
  const l = v.lang.toLowerCase().replace('_', '-');
  if (l === want) r += 10;
  if (/natural|neural|premium|enhanced|google/i.test(v.name)) r += 5;
  if (/samantha|daniel|serena|kate|amélie|amelie|thomas|audrey|marie/i.test(v.name)) r += 3;
  if (v.localService) r += 1;
  return r;
}
function pickVoice(lang) {
  const chosen = db.settings.voice?.[lang];
  if (chosen) {
    const v = tts.voices.find((x) => x.name === chosen);
    if (v) return v;
  }
  return voicesFor(lang)[0] || null;
}
function speak(text, lang, { slow = false, onend } = {}) {
  if (!canSpeak() || !text) { onend?.(); return; }
  try {
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(lang === 'de' ? stripParens(text) : ttsText(text, lang));
    u.lang = lang === 'de' ? 'de-DE' : langCode(lang);
    const v = lang === 'de' ? null : pickVoice(lang);
    if (v) u.voice = v;
    u.rate = slow ? 0.55 : (db.settings.rate || 0.9);
    u.onend = () => onend?.();
    u.onerror = () => onend?.();
    speechSynthesis.speak(u);
  } catch { onend?.(); }
}
const stopSpeaking = () => { try { canSpeak() && speechSynthesis.cancel(); } catch { /* */ } };

let audioCtx;
function tone(freqs, dur = 0.12, type = 'sine', gain = 0.12) {
  if (!db.settings.sound) return;
  try {
    audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
    const t0 = audioCtx.currentTime + 0.01;
    freqs.forEach((f, i) => {
      const o = audioCtx.createOscillator(), g = audioCtx.createGain();
      o.type = type; o.frequency.value = f;
      const st = t0 + i * dur * 0.85;
      g.gain.setValueAtTime(0.0001, st);
      g.gain.exponentialRampToValueAtTime(gain, st + 0.015);
      g.gain.exponentialRampToValueAtTime(0.0001, st + dur);
      o.connect(g).connect(audioCtx.destination);
      o.start(st); o.stop(st + dur + 0.03);
    });
  } catch { /* kein Audio */ }
}
const sfx = {
  good: () => tone([660, 990], 0.13, 'triangle', 0.14),
  bad: () => tone([196, 165], 0.16, 'square', 0.045),
  flip: () => tone([540], 0.05, 'sine', 0.05),
  almost: () => tone([523, 587], 0.12, 'triangle', 0.1),
  win: () => tone([523, 659, 784, 1047], 0.15, 'triangle', 0.14),
};

/* ---------------- Spracherkennung ---------------- */
const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
const listening = { rec: null };
const isAppleMobile = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
// Chrome, Firefox & Co. auf iPhone/iPad nutzen Apples Technik; Spracherkennung klappt dort zuverlässig nur in Safari.
const isIOSOtherBrowser = isAppleMobile && /CriOS|FxiOS|EdgiOS|OPiOS|GSA\//i.test(navigator.userAgent);
const bestBrowsers = () => (isAppleMobile ? 'Safari' : 'Chrome, Edge oder Safari');
// Diese Browser haben die Schnittstelle, aber keinen Erkennungsdienst dahinter (Fehler „network“).
const speechBrowserMissing = !!navigator.brave || /OPR\/|Opera/i.test(navigator.userAgent);
const canListen = () => !!SpeechRec && !speechBrowserMissing;

/**
 * Hört einmal zu. Liefert alle erkannten Varianten (auch Zwischenergebnisse – Safari meldet
 * manchmal kein Endergebnis). Hört spätestens nach timeoutMs auf.
 */
function listenOnce(lang, { onStart, onInterim, timeoutMs = 8000, track = null } = {}) {
  return new Promise((resolve, reject) => {
    let rec, timer = null, settled = false;
    let alts = [];
    let best = null; // wahrscheinlichster Text: { t, conf, final }
    const finish = (val, err) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      if (listening.rec === rec) listening.rec = null;
      if (val) val.best = best;
      if (err) reject(err); else resolve(val);
    };
    try { rec = new SpeechRec(); } catch { reject('not-supported'); return; }
    listening.rec = rec;
    rec.lang = langCode(lang);
    rec.interimResults = true;
    rec.continuous = false;
    rec.maxAlternatives = 5;
    rec.onaudiostart = () => onStart?.();
    rec.onresult = (e) => {
      const found = [];
      const firsts = [];
      let isFinal = false, conf = 1;
      for (let r = 0; r < e.results.length; r++) {
        const res = e.results[r];
        if (res.isFinal) isFinal = true;
        for (let i = 0; i < res.length; i++) {
          const t = (res[i] && res[i].transcript || '').trim();
          if (t) found.push(t);
          if (i === 0 && t) { firsts.push(t); conf = Math.min(conf, Number(res[i].confidence) || 0); }
        }
      }
      if (firsts.length > 1) found.unshift(firsts.join(' '));
      if (!found.length) return;
      if (firsts.length) best = { t: firsts.join(' '), conf: isFinal ? conf : 0, final: isFinal };
      alts = [...new Set([...found, ...alts])];
      onInterim?.(found[0]);
      if (isFinal) { try { rec.stop(); } catch { /* */ } finish(alts); }
    };
    rec.onerror = (e) => {
      const code = e.error || 'error';
      if (alts.length && (code === 'no-speech' || code === 'aborted')) finish(alts);
      else finish(null, code);
    };
    rec.onend = () => finish(alts);
    timer = setTimeout(() => {
      try { rec.stop(); } catch { /* */ }
      setTimeout(() => finish(alts), 1500);
    }, timeoutMs);
    // Neuere Chrome-Versionen können ein bestimmtes Mikrofon nutzen (start(track)); ältere ignorieren das Argument.
    try { if (track) rec.start(track); else rec.start(); } catch { try { rec.start(); } catch { finish(null, 'busy'); } }
  });
}
function stopListening(abort = false) {
  const r = listening.rec;
  if (!r) return;
  try { abort ? r.abort() : r.stop(); } catch { /* */ }
}

/* ---------- Pegelanzeige: Kommt überhaupt Ton vom Mikrofon an? ---------- */
const isSafari = /^((?!chrome|chromium|android|crios|fxios|edg).)*safari/i.test(navigator.userAgent);
const micMeter = { stream: null, ctx: null, raf: 0, peak: 0, level: 0 };
/** Pegel während des Sprechens nur in Chromium-Browsern (Safari würde ein zweites Mal fragen). */
const meterDuringListen = () => !!navigator.mediaDevices?.getUserMedia && !isSafari && !isAppleMobile;

async function startMeter(onLevel, deviceId = '') {
  stopMeter();
  if (!navigator.mediaDevices?.getUserMedia) return null;
  const constraints = { audio: deviceId ? { deviceId: { exact: deviceId } } : true };
  let stream;
  try { stream = await navigator.mediaDevices.getUserMedia(constraints); } catch (e) {
    if (deviceId) { try { stream = await navigator.mediaDevices.getUserMedia({ audio: true }); } catch { return null; } } else return null;
  }
  const AC = window.AudioContext || window.webkitAudioContext;
  const ctx = new AC();
  try { await ctx.resume(); } catch { /* */ }
  const an = ctx.createAnalyser();
  an.fftSize = 1024;
  ctx.createMediaStreamSource(stream).connect(an);
  const buf = new Uint8Array(an.fftSize);
  Object.assign(micMeter, { stream, ctx, peak: 0, level: 0 });
  const tick = () => {
    if (micMeter.stream !== stream) return;
    an.getByteTimeDomainData(buf);
    let sum = 0;
    for (let i = 0; i < buf.length; i++) { const x = (buf[i] - 128) / 128; sum += x * x; }
    const level = Math.min(1, Math.sqrt(sum / buf.length) * 7);
    micMeter.level = level;
    micMeter.peak = Math.max(micMeter.peak, level);
    onLevel?.(level);
    micMeter.raf = requestAnimationFrame(tick);
  };
  tick();
  return stream;
}
function stopMeter() {
  cancelAnimationFrame(micMeter.raf);
  micMeter.stream?.getTracks().forEach((t) => t.stop());
  try { micMeter.ctx?.close(); } catch { /* */ }
  micMeter.stream = null; micMeter.ctx = null;
}
const MIC_SOUND_PEAK = 0.12; // darüber: es kommt Stimme an

async function listMics() {
  try {
    const all = await navigator.mediaDevices.enumerateDevices();
    return all.filter((d) => d.kind === 'audioinput');
  } catch { return []; }
}

/** Was tun, wenn nichts erkannt wurde? Hängt davon ab, ob Ton ankam. */
function silenceHelp(peak) {
  if (peak == null) return '';
  const win = /Windows/i.test(navigator.userAgent), mac = /Macintosh/i.test(navigator.userAgent) && !isAppleMobile;
  if (peak < MIC_SOUND_PEAK) {
    return 'Dein Browser bekommt keinen Ton vom Mikrofon. Ist das richtige Mikrofon gewählt (Einstellungen → Mikrofon testen)? Ist es stummgeschaltet?'
      + (win ? ' Unter Windows: Einstellungen → Datenschutz und Sicherheit → Mikrofon → „Desktop-Apps Zugriff erlauben“ einschalten.' : '')
      + (mac ? ' Am Mac: Systemeinstellungen → Datenschutz & Sicherheit → Mikrofon → deinen Browser einschalten.' : '');
  }
  return `Das Mikrofon hört dich, aber die Spracherkennung liefert keinen Text. Sie braucht Internet und ist in manchen Schulnetzen gesperrt. Probiere ein anderes Netz oder einen anderen Browser (${bestBrowsers()}).`;
}

/** Verständliche Erklärung zu den Fehlercodes der Spracherkennung */
function micErrorText(code, lang) {
  switch (code) {
    case 'not-allowed':
      return isAppleMobile
        ? 'Das Mikrofon ist blockiert. Tippe in der Adresszeile auf „aA“ → Website-Einstellungen → Mikrofon: Erlauben, und lade die Seite neu.'
        : 'Das Mikrofon ist blockiert. Klicke links in der Adresszeile auf das Symbol neben der Adresse, erlaube das Mikrofon und lade die Seite neu.';
    case 'service-not-allowed':
      return isAppleMobile
        ? 'Auf iPad und iPhone muss unter Einstellungen → Allgemein → Tastatur die Diktierfunktion eingeschaltet sein. Danach die Seite neu laden.'
        : `Dieser Browser erlaubt hier keine Spracherkennung. Nimm ${bestBrowsers()}.`;
    case 'network':
      return `Der Spracherkennungsdienst des Browsers ist nicht erreichbar. Er braucht Internet und ist in manchen Schulnetzen gesperrt. ${isAppleMobile ? 'Auf iPhone und iPad klappt es am besten in Safari.' : 'Brave, Opera und Vivaldi haben keinen solchen Dienst – nimm Chrome, Edge oder Safari.'}`;
    case 'audio-capture':
      return 'Es wurde kein Mikrofon gefunden. Ist eins angeschlossen und in den Einstellungen des Geräts für den Browser erlaubt?';
    case 'language-not-supported':
      return `Dieser Browser kann ${LANGS[lang]?.name || 'diese Sprache'} nicht erkennen. Nimm ${bestBrowsers()}.`;
    case 'busy':
      return 'Das Mikrofon war noch belegt. Versuch es gleich noch einmal.';
    case 'not-supported':
      return isIOSOtherBrowser ? 'Auf iPhone und iPad klappt die Spracherkennung nur in Safari. Öffne Vokabelwelt bitte in Safari.' : `Dieser Browser kann keine Sprache erkennen. Nimm ${bestBrowsers()}.`;
    default:
      return isIOSOtherBrowser ? 'Auf iPhone und iPad klappt die Spracherkennung am zuverlässigsten in Safari. Öffne Vokabelwelt bitte in Safari.' : `Versuch es noch einmal. Wenn es weiter nicht klappt, nimm ${bestBrowsers()}.`;
  }
}

/* ---------------- Teilen per Link ---------------- */
function b64urlEncode(bytes) {
  let bin = '';
  for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
function b64urlDecode(str) {
  const bin = atob(str.replace(/-/g, '+').replace(/_/g, '/'));
  return Uint8Array.from(bin, (c) => c.charCodeAt(0));
}
async function encodeShare(set) {
  const data = {
    v: 1, n: set.name, l: set.lang, s: set.picStyle,
    w: set.words.map((w) => {
      const row = [w.foreign, w.german];
      const p = w.pic;
      if (p && p.kind === 'none') row.push('none', '-');
      else if (p && p.kind !== 'upload' && p.kind !== 'drawn' && !String(p.src).startsWith('data:')) row.push(p.kind, p.src);
      return row;
    }),
  };
  const bytes = new TextEncoder().encode(JSON.stringify(data));
  if ('CompressionStream' in window) {
    try {
      const stream = new Blob([bytes]).stream().pipeThrough(new CompressionStream('deflate-raw'));
      const buf = new Uint8Array(await new Response(stream).arrayBuffer());
      return 'z' + b64urlEncode(buf);
    } catch { /* unkomprimiert weiter */ }
  }
  return 'j' + b64urlEncode(bytes);
}
async function decodeShare(code) {
  const kind = code[0], bytes = b64urlDecode(code.slice(1));
  let json;
  if (kind === 'z') {
    const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream('deflate-raw'));
    json = await new Response(stream).text();
  } else json = new TextDecoder().decode(bytes);
  const d = JSON.parse(json);
  return {
    name: String(d.n || 'Vokabeln'), lang: d.l === 'fr' ? 'fr' : 'en', picStyle: ['picto', 'clipart', 'photo', 'emoji'].includes(d.s) ? d.s : 'picto',
    rows: (d.w || []).map((r) => ({
      foreign: String(r[0] || ''), german: String(r[1] || ''),
      pic: r[2] === 'ai' ? null
        : r[2] === 'none' ? { kind: 'none', src: '', manual: true }
        : r[2] && r[3] ? { kind: String(r[2]), src: String(r[3]), manual: true } : null,
    })),
  };
}
async function hashString(s) {
  try {
    const buf = await crypto.subtle.digest('SHA-1', new TextEncoder().encode(s));
    return [...new Uint8Array(buf)].slice(0, 8).map((b) => b.toString(16).padStart(2, '0')).join('');
  } catch { return String(s.length) + s.slice(-12); }
}
