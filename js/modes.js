/* Vokabelwelt – Übungsarten: Lernkarten, Zuordnen, Aussprechen, Test */
'use strict';

const wordsById = (set, ids) => ids.map((id) => set.words.find((w) => w.id === id)).filter(Boolean);
const sayBtn = (text, lang, label = 'Anhören', extra = '') => (canSpeak() && text
  ? `<button type="button" class="say ${extra}" data-action="say" data-text="${esc(text)}" data-lang="${lang}" aria-label="${esc(label)}" title="${esc(label)}">${icon('speaker')}</button>` : '');
const progressBar = (frac, label) => `<div class="progress" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${Math.round(frac * 100)}" aria-label="${esc(label)}"><div class="progress-fill" style="width:${(frac * 100).toFixed(1)}%"></div></div>`;

function saveProgress(set, key, value) {
  set.progress = set.progress || {};
  set.progress[key] = value;
  set.updated = Date.now();
  saveDB();
}

/* =========================================================
   1 · LERNKARTEN
   ========================================================= */
const cards = { ids: [], queue: [], flipped: false, front: 'picword', layout: 'stack', firstTry: new Map(), total: 0, known: 0, finished: false };

function startCards(set, opts = {}) {
  const anyPic = set.words.some((w) => hasPicture(w, set.lang));
  cards.front = db.settings.cardFront || (anyPic ? 'picword' : 'foreign');
  if (!anyPic && (cards.front === 'pic' || cards.front === 'picword')) cards.front = 'foreign';
  cards.layout = opts.layout || 'stack';
  cards.ids = opts.ids || set.words.map((w) => w.id);
  resetCards(true);
}
function resetCards(mix = true, ids) {
  if (ids) cards.ids = ids;
  cards.queue = mix ? shuffle(cards.ids) : cards.ids.slice();
  cards.flipped = false;
  cards.firstTry = new Map();
  cards.total = cards.queue.length;
  cards.known = 0;
  cards.finished = false;
}

function cardFaces(set, w, front) {
  const L = LANGS[set.lang].name;
  const pic = hasPicture(w, set.lang);
  const f = (front === 'pic' || front === 'picword') && !pic ? 'foreign' : front;
  const foreignBlock = (big) => `<p class="cw-foreign ${big ? 'xl' : ''}" lang="${set.lang}">${esc(w.foreign)}</p>`;
  let frontHTML;
  if (f === 'pic') frontHTML = `<p class="face-label">Wie heißt das auf ${L}?</p>${picHTML(w, set.lang, 'card-pic')}`;
  else if (f === 'picword') frontHTML = `<p class="face-label">${L}</p>${picHTML(w, set.lang, 'card-pic')}<div class="cw-line">${foreignBlock(false)}${sayBtn(w.foreign, set.lang)}</div>`;
  else if (f === 'foreign') frontHTML = `<p class="face-label">${L}</p><div class="cw-line">${foreignBlock(true)}${sayBtn(w.foreign, set.lang)}</div>`;
  else frontHTML = `<p class="face-label">Deutsch</p><p class="cw-german xl" lang="de">${esc(w.german || '–')}</p>`;

  const backHTML = `<p class="face-label">Lösung</p>
    ${pic && f !== 'pic' && f !== 'picword' ? picHTML(w, set.lang, 'card-pic small') : ''}
    <div class="cw-line">${foreignBlock(f === 'german' || f === 'pic')}${sayBtn(w.foreign, set.lang)}</div>
    <p class="cw-german ${f === 'german' || f === 'pic' ? '' : 'xl'}" lang="de">${esc(w.german || '')}</p>`;
  return { frontHTML, backHTML };
}

function flashHTML(set, w, { flipped = false, mini = false } = {}) {
  const { frontHTML, backHTML } = cardFaces(set, w, cards.front);
  return `<div class="flash ${mini ? 'mini' : ''} ${flipped ? 'is-flipped' : ''}" data-action="flip" data-wid="${w.id}" role="button" tabindex="0" aria-label="Karte umdrehen">
    <div class="flash-inner">
      <div class="face front">${frontHTML}</div>
      <div class="face back">${backHTML}</div>
    </div>
  </div>`;
}

function renderCards() {
  const set = currentSet();
  const v = $('#view');
  const L = LANGS[set.lang].name;
  const anyPic = set.words.some((w) => hasPicture(w, set.lang));
  const fronts = [['pic', 'Bild'], ['picword', 'Bild + Wort'], ['foreign', L], ['german', 'Deutsch']]
    .filter(([k]) => anyPic || (k !== 'pic' && k !== 'picword'));
  const bar = `
    <div class="mode-bar">
      <h1 class="mode-title">Lernkarten</h1>
      <div class="mode-controls">
        <div class="ctrl"><span class="label-inline">Vorne:</span>
          <div class="seg small" role="group" aria-label="Was vorne auf der Karte steht">
            ${fronts.map(([k, t]) => `<button class="seg-btn" data-action="card-front" data-front="${k}" aria-pressed="${cards.front === k}">${t}</button>`).join('')}
          </div>
        </div>
        <div class="seg small" role="group" aria-label="Ansicht">
          <button class="seg-btn" data-action="card-layout" data-layout="stack" aria-pressed="${cards.layout === 'stack'}">${icon('stack')}<span>Stapel</span></button>
          <button class="seg-btn" data-action="card-layout" data-layout="grid" aria-pressed="${cards.layout === 'grid'}">${icon('grid')}<span>Alle Karten</span></button>
        </div>
      </div>
    </div>`;

  if (cards.layout === 'grid') {
    v.innerHTML = `<section class="mode cards-mode">${bar}
      <p class="mode-hint">Tippe eine Karte an, um sie umzudrehen.</p>
      <div class="flash-grid">${wordsById(set, cards.ids).map((w) => flashHTML(set, w, { mini: true })).join('')}</div>
    </section>`;
    return;
  }

  if (cards.finished) {
    const pct = cards.total ? cards.known / cards.total : 0;
    const hard = [...cards.firstTry].filter(([, ok]) => !ok).map(([id]) => id);
    v.innerHTML = `<section class="mode cards-mode">${bar}
      <div class="result">
        ${stars(pct >= 0.9 ? 3 : pct >= 0.6 ? 2 : 1)}
        <h2>Alle Karten geschafft!</h2>
        <p class="result-line">${cards.known} von ${cards.total} Karten wusstest du gleich beim ersten Mal.</p>
        <div class="row center">
          ${hard.length ? `<button class="btn primary" data-action="cards-again" data-which="hard">${icon('flip')} Die ${hard.length} schwierigen nochmal</button>` : ''}
          <button class="btn ${hard.length ? 'secondary' : 'primary'}" data-action="cards-again" data-which="all">${icon('shuffle')} Alle nochmal</button>
          <button class="btn secondary" data-action="mode" data-mode="match" data-variant="${anyPic ? 'pic' : 'de'}">Weiter: Zuordnen ${icon('right')}</button>
        </div>
      </div>
    </section>`;
    return;
  }

  const w = set.words.find((x) => x.id === cards.queue[0]);
  if (!w) { cards.finished = true; renderCards(); return; }
  const done = cards.total - cards.queue.length;
  const again = [...cards.firstTry.values()].filter((ok) => !ok).length;
  v.innerHTML = `<section class="mode cards-mode">${bar}
    ${progressBar(done / cards.total, 'Fortschritt')}
    <p class="progress-label"><span>Noch ${cards.queue.length} ${cards.queue.length === 1 ? 'Karte' : 'Karten'}</span><span class="tally"><b class="ok">${icon('check')} ${cards.known}</b><b class="again">${icon('flip')} ${again}</b></span></p>
    <div class="stage">${flashHTML(set, w, { flipped: cards.flipped })}</div>
    <div class="card-actions" id="card-actions">${cardActions()}</div>
    <p class="mode-hint keys">Leertaste: umdrehen · <kbd>←</kbd> nochmal · <kbd>→</kbd> gewusst</p>
  </section>`;
}

function cardActions() {
  if (!cards.flipped) return `<button class="btn primary big" data-action="flip-current">${icon('flip')} Umdrehen</button>`;
  return `<button class="btn again big" data-action="card-again">${icon('flip')} Nochmal</button>
    <button class="btn ok big" data-action="card-known">${icon('check')} Gewusst</button>`;
}

function flipCurrent() {
  const set = currentSet();
  const el = $('.stage .flash');
  if (!el) return;
  cards.flipped = !cards.flipped;
  el.classList.toggle('is-flipped', cards.flipped);
  sfx.flip();
  $('#card-actions').innerHTML = cardActions();
  if (cards.flipped && db.settings.autoSpeak) {
    const w = set.words.find((x) => x.id === cards.queue[0]);
    if (w) speak(w.foreign, set.lang);
  }
}

function cardAnswer(known) {
  const set = currentSet();
  if (!cards.flipped) { flipCurrent(); return; }
  const id = cards.queue.shift();
  if (!cards.firstTry.has(id)) {
    cards.firstTry.set(id, known);
    if (known) cards.known++;
  }
  if (!known) cards.queue.splice(Math.min(cards.queue.length, 3 + Math.floor(Math.random() * 3)), 0, id);
  cards.flipped = false;
  stopSpeaking();
  if (!cards.queue.length) {
    cards.finished = true;
    const prev = set.progress?.cards;
    if (cards.total === set.words.length || !prev) saveProgress(set, 'cards', { known: cards.known, total: cards.total, date: Date.now() });
    sfx.win();
    if (cards.known / cards.total >= 0.8) confetti();
  } else (known ? sfx.good : sfx.flip)();
  renderCards();
}

/* =========================================================
   2 · ZUORDNEN
   ========================================================= */
const match = { variant: 'pic', rounds: [], round: 0, selected: null, done: [], mistakes: 0, total: 0, drag: null, ro: null, finished: false, colors: 0 };
const PAIR_COLORS = 6;

function startMatch(set, variant) {
  match.variant = variant;
  const seen = new Set();
  let pool = set.words.filter((w) => {
    if (!w.foreign) return false;
    if (variant === 'pic' && !hasPicture(w, set.lang)) return false;
    if (variant === 'de' && !w.german) return false;
    // Doppelte Bilder/Wörter wären nicht eindeutig zuzuordnen
    const keys = ['f:' + normAnswer(w.foreign), variant === 'pic' ? 'p:' + effectivePic(w, set.lang).src : 'd:' + normAnswer(w.german)];
    if (keys.some((k) => seen.has(k))) return false;
    keys.forEach((k) => seen.add(k));
    return true;
  });
  pool = shuffle(pool);
  const perRound = variant === 'pic' ? 5 : 6; // Bilder größer zeigen → weniger pro Runde
  const nR = Math.max(1, Math.ceil(pool.length / perRound));
  const size = Math.ceil(pool.length / nR);
  match.rounds = [];
  for (let i = 0; i < pool.length; i += size) match.rounds.push(pool.slice(i, i + size).map((w) => w.id));
  match.round = 0; match.mistakes = 0; match.total = pool.length; match.finished = false; match.colors = 0;
  match.selected = null; match.done = []; match.drag = null;
}

function renderMatch() {
  const set = currentSet();
  const v = $('#view');
  const L = LANGS[set.lang].name;
  match.ro?.disconnect();
  const bar = `
    <div class="mode-bar">
      <h1 class="mode-title">Zuordnen</h1>
      <div class="mode-controls">
        <div class="seg small" role="group" aria-label="Was verbunden wird">
          <button class="seg-btn" data-action="match-variant" data-variant="pic" aria-pressed="${match.variant === 'pic'}">${icon('image')}<span>Bild ↔ ${L}</span></button>
          <button class="seg-btn" data-action="match-variant" data-variant="de" aria-pressed="${match.variant === 'de'}"><span>${L} ↔ Deutsch</span></button>
        </div>
      </div>
    </div>`;

  if (match.total < 2) {
    v.innerHTML = `<section class="mode match-mode">${bar}
      <div class="result"><h2>Dafür brauchst du mindestens zwei Karten${match.variant === 'pic' ? ' mit Bild' : ' mit deutscher Übersetzung'}.</h2>
      <p class="result-line">${match.variant === 'pic' ? 'Gib den Karten in der Übersicht ein Bild – oder spiele die andere Variante.' : 'Ergänze die deutschen Wörter unter „Bearbeiten“.'}</p>
      <div class="row center"><button class="btn primary" data-action="match-variant" data-variant="${match.variant === 'pic' ? 'de' : 'pic'}">Andere Variante</button>
      <button class="btn secondary" data-action="open-set" data-id="${set.id}">Zur Übersicht</button></div></div></section>`;
    return;
  }

  if (match.finished) {
    const ratio = match.mistakes / match.total;
    const st = match.mistakes === 0 ? 3 : ratio <= 0.35 ? 2 : 1;
    v.innerHTML = `<section class="mode match-mode">${bar}
      <div class="result">
        ${stars(st)}
        <h2>${st === 3 ? 'Perfekt! Alles ohne Fehler verbunden.' : st === 2 ? 'Super gemacht!' : 'Geschafft! Übung macht den Meister.'}</h2>
        <p class="result-line">${match.total} Paare, ${match.mistakes} ${match.mistakes === 1 ? 'Fehler' : 'Fehler'}.</p>
        <div class="row center">
          <button class="btn primary" data-action="match-variant" data-variant="${match.variant}">${icon('shuffle')} Nochmal</button>
          <button class="btn secondary" data-action="match-variant" data-variant="${match.variant === 'pic' ? 'de' : 'pic'}">${match.variant === 'pic' ? `${L} ↔ Deutsch` : `Bild ↔ ${L}`}</button>
          <button class="btn secondary" data-action="mode" data-mode="speak">Weiter: Aussprechen ${icon('right')}</button>
        </div>
      </div></section>`;
    return;
  }

  const ids = match.rounds[match.round];
  const words = wordsById(set, ids);
  const left = shuffle(words), right = shuffle(words);
  const leftItem = (w) => (match.variant === 'pic'
    ? `<button class="m-item m-pic" data-side="L" data-id="${w.id}" aria-label="Bild ${esc(w.german || '')}">${picHTML(w, set.lang, 'm-picimg')}</button>`
    : `<button class="m-item m-word" data-side="L" data-id="${w.id}" lang="${set.lang}"><span>${esc(w.foreign)}</span></button>`);
  const rightItem = (w) => (match.variant === 'pic'
    ? `<button class="m-item m-word" data-side="R" data-id="${w.id}" lang="${set.lang}"><span>${esc(w.foreign)}</span></button>`
    : `<button class="m-item m-word de" data-side="R" data-id="${w.id}" lang="de"><span>${esc(w.german)}</span></button>`);

  v.innerHTML = `<section class="mode match-mode">${bar}
    ${progressBar(match.round / match.rounds.length, 'Runden')}
    <p class="progress-label"><span>Runde ${match.round + 1} von ${match.rounds.length}</span><span class="tally"><b class="bad">${icon('x')} ${match.mistakes} Fehler</b></span></p>
    <div class="match-board ${match.variant === 'pic' ? 'is-pic' : 'is-words'}" id="m-board">
      <svg class="m-lines" id="m-lines" aria-hidden="true"></svg>
      <div class="m-col left">${left.map(leftItem).join('')}</div>
      <div class="m-col right">${right.map(rightItem).join('')}</div>
    </div>
    <p class="mode-hint">Tippe links etwas an und dann rechts das Passende – oder zieh eine Linie.</p>
  </section>`;
  match.done = []; match.selected = null;
  bindMatchBoard();
}

function bindMatchBoard() {
  const board = $('#m-board');
  if (!board) return;
  board.addEventListener('pointerdown', (e) => {
    const it = e.target.closest('.m-item');
    if (!it || it.classList.contains('done') || e.button > 0) return;
    e.preventDefault();
    match.drag = { from: it, x0: e.clientX, y0: e.clientY, x: e.clientX, y: e.clientY, moved: false, id: e.pointerId };
    it.classList.add('pressed');
  });
  const move = (e) => {
    const d = match.drag;
    if (!d || e.pointerId !== d.id) return;
    d.x = e.clientX; d.y = e.clientY;
    if (!d.moved && Math.hypot(d.x - d.x0, d.y - d.y0) > 10) d.moved = true;
    if (d.moved) {
      $$('.m-item.hover', board).forEach((x) => x.classList.remove('hover'));
      const t = document.elementFromPoint(d.x, d.y)?.closest('.m-item');
      if (t && t !== d.from && t.dataset.side !== d.from.dataset.side && !t.classList.contains('done')) t.classList.add('hover');
      drawLines();
    }
  };
  const up = (e) => {
    const d = match.drag;
    if (!d || e.pointerId !== d.id) return;
    match.drag = null;
    d.from.classList.remove('pressed');
    $$('.m-item.hover', board).forEach((x) => x.classList.remove('hover'));
    if (d.moved) {
      const t = document.elementFromPoint(e.clientX, e.clientY)?.closest('.m-item');
      if (t && t.dataset.side !== d.from.dataset.side && !t.classList.contains('done')) attemptPair(d.from, t);
      drawLines();
    } else tapItem(d.from);
  };
  window.addEventListener('pointermove', move);
  window.addEventListener('pointerup', up);
  window.addEventListener('pointercancel', up);
  board.addEventListener('click', (e) => {
    const it = e.target.closest('.m-item');
    if (it && e.detail === 0 && !it.classList.contains('done')) tapItem(it); // Tastatur
  });
  match.ro = new ResizeObserver(() => drawLines());
  match.ro.observe(board);
  const cleanup = () => {
    window.removeEventListener('pointermove', move);
    window.removeEventListener('pointerup', up);
    window.removeEventListener('pointercancel', up);
  };
  const prevDisconnect = match.ro.disconnect.bind(match.ro);
  match.ro.disconnect = () => { cleanup(); prevDisconnect(); };
}

function tapItem(it) {
  const sel = match.selected;
  if (!sel) { select(it); return; }
  if (sel === it) { select(null); return; }
  if (sel.dataset.side === it.dataset.side) { select(it); return; }
  attemptPair(sel, it);
}
function select(it) {
  match.selected?.classList.remove('selected');
  match.selected = it;
  it?.classList.add('selected');
}

function attemptPair(a, b) {
  const set = currentSet();
  const L = a.dataset.side === 'L' ? a : b, R = a.dataset.side === 'L' ? b : a;
  select(null);
  if (L.dataset.id === R.dataset.id) {
    const color = (match.colors++ % PAIR_COLORS) + 1;
    [L, R].forEach((x) => { x.classList.add('done', `c${color}`); x.disabled = true; });
    match.done.push({ id: L.dataset.id, color });
    drawLines();
    sfx.good();
    const w = set.words.find((x) => x.id === L.dataset.id);
    if (w && db.settings.autoSpeak) speak(w.foreign, set.lang);
    if (match.done.length === match.rounds[match.round].length) {
      setTimeout(() => {
        if (ui.view !== 'match') return;
        match.round++;
        if (match.round >= match.rounds.length) finishMatch(set);
        else renderMatch();
      }, 900);
    }
  } else {
    match.mistakes++;
    sfx.bad();
    [L, R].forEach((x) => { x.classList.remove('wrong'); void x.offsetWidth; x.classList.add('wrong'); });
    setTimeout(() => [L, R].forEach((x) => x.classList.remove('wrong')), 600);
    const t = $('.match-mode .tally .bad');
    if (t) t.innerHTML = `${icon('x')} ${match.mistakes} Fehler`;
  }
}

function finishMatch(set) {
  match.finished = true;
  const st = match.mistakes === 0 ? 3 : match.mistakes / match.total <= 0.35 ? 2 : 1;
  const prev = set.progress?.match || {};
  saveProgress(set, 'match', { ...prev, [match.variant]: Math.max(prev[match.variant] || 0, st) });
  sfx.win();
  if (st >= 2) confetti();
  renderMatch();
}

function drawLines() {
  const board = $('#m-board'), svg = $('#m-lines');
  if (!board || !svg) return;
  const br = board.getBoundingClientRect();
  svg.setAttribute('viewBox', `0 0 ${br.width} ${br.height}`);
  const anchor = (el, side) => {
    const r = el.getBoundingClientRect();
    return { x: (side === 'L' ? r.right : r.left) - br.left, y: r.top + r.height / 2 - br.top };
  };
  const curve = (p, q) => {
    const dx = Math.max(24, Math.abs(q.x - p.x) * 0.45) * (q.x >= p.x ? 1 : -1);
    return `M${p.x.toFixed(1)} ${p.y.toFixed(1)} C ${(p.x + dx).toFixed(1)} ${p.y.toFixed(1)}, ${(q.x - dx).toFixed(1)} ${q.y.toFixed(1)}, ${q.x.toFixed(1)} ${q.y.toFixed(1)}`;
  };
  let html = '';
  for (const pr of match.done) {
    const a = $(`.m-item[data-side="L"][data-id="${pr.id}"]`, board), b = $(`.m-item[data-side="R"][data-id="${pr.id}"]`, board);
    if (!a || !b) continue;
    const p = anchor(a, 'L'), q = anchor(b, 'R');
    html += `<path class="m-line c${pr.color}" d="${curve(p, q)}"/><circle class="m-dot c${pr.color}" cx="${p.x}" cy="${p.y}" r="6"/><circle class="m-dot c${pr.color}" cx="${q.x}" cy="${q.y}" r="6"/>`;
  }
  const d = match.drag;
  if (d && d.moved) {
    const p = anchor(d.from, d.from.dataset.side);
    const q = { x: d.x - br.left, y: d.y - br.top };
    html += `<path class="m-line drag" d="${curve(p, q)}"/><circle class="m-dot drag" cx="${p.x}" cy="${p.y}" r="6"/>`;
  }
  svg.innerHTML = html;
}

/* =========================================================
   3 · AUSSPRECHEN
   ========================================================= */
const speakM = { ids: [], idx: 0, show: 'word', state: 'idle', heard: '', revealed: false, attempts: 0, results: new Map(), fallback: false, reason: '', timer: null, finished: false };

function startSpeak(set, ids) {
  speakM.ids = shuffle(ids || set.words.filter((w) => w.foreign).map((w) => w.id));
  speakM.idx = 0;
  speakM.results = new Map();
  speakM.finished = false;
  speakM.fallback = !canListen();
  speakM.reason = canListen() ? '' : (speechBrowserMissing ? 'browser' : 'unsupported');
  speakM.error = '';
  if (speakM.show === 'pic' && !set.words.some((w) => hasPicture(w, set.lang))) speakM.show = 'word';
  resetSpeakWord();
}
function resetSpeakWord() {
  speakM.state = 'idle'; speakM.heard = ''; speakM.revealed = false; speakM.attempts = 0;
  clearTimeout(speakM.timer);
}
const speakWord = (set) => set.words.find((w) => w.id === speakM.ids[speakM.idx]);

function renderSpeak() {
  const set = currentSet();
  const v = $('#view');
  const anyPic = set.words.some((w) => hasPicture(w, set.lang));
  const bar = `
    <div class="mode-bar">
      <h1 class="mode-title">Aussprechen</h1>
      <div class="mode-controls">
        <div class="ctrl"><span class="label-inline">Zeige:</span>
          <div class="seg small" role="group" aria-label="Was angezeigt wird">
            <button class="seg-btn" data-action="speak-show" data-show="word" aria-pressed="${speakM.show === 'word'}">Wort</button>
            ${anyPic ? `<button class="seg-btn" data-action="speak-show" data-show="pic" aria-pressed="${speakM.show === 'pic'}">${icon('image')}<span>Bild</span></button>` : ''}
          </div>
        </div>
      </div>
    </div>`;

  if (speakM.finished) {
    const total = speakM.ids.length;
    const ok = [...speakM.results.values()].filter((r) => r === 'ok').length;
    const hard = speakM.ids.filter((id) => speakM.results.get(id) !== 'ok');
    v.innerHTML = `<section class="mode speak-mode">${bar}
      <div class="result">
        ${stars(ok / total >= 0.9 ? 3 : ok / total >= 0.6 ? 2 : 1)}
        <h2>${ok === total ? 'Wow, alles beim ersten Versuch!' : 'Gut gesprochen!'}</h2>
        <p class="result-line">${ok} von ${total} Wörtern gleich beim ersten Versuch richtig.</p>
        ${hard.length ? `<ul class="word-chips">${wordsById(set, hard).map((w) => `<li><span lang="${set.lang}">${esc(w.foreign)}</span>${sayBtn(w.foreign, set.lang)}</li>`).join('')}</ul>` : ''}
        <div class="row center">
          ${hard.length ? `<button class="btn primary" data-action="speak-again" data-which="hard">${icon('mic')} Diese ${hard.length} nochmal</button>` : ''}
          <button class="btn ${hard.length ? 'secondary' : 'primary'}" data-action="speak-again" data-which="all">${icon('shuffle')} Alle nochmal</button>
          <button class="btn secondary" data-action="mode" data-mode="test">Weiter: Test ${icon('right')}</button>
        </div>
      </div></section>`;
    return;
  }

  const w = speakWord(set);
  if (!w) { speakM.finished = true; renderSpeak(); return; }
  const showPic = speakM.show === 'pic' && hasPicture(w, set.lang);
  const total = speakM.ids.length;
  v.innerHTML = `<section class="mode speak-mode">${bar}
    ${progressBar(speakM.idx / total, 'Fortschritt')}
    <p class="progress-label"><span>Wort ${speakM.idx + 1} von ${total}</span><span class="tally"><b class="ok">${icon('check')} ${[...speakM.results.values()].filter((r) => r === 'ok').length}</b></span></p>
    <div class="speak-card">
      ${showPic ? picHTML(w, set.lang, 'card-pic') : ''}
      <p class="cw-foreign xl ${showPic && !speakM.revealed ? 'hidden-word' : ''}" lang="${set.lang}" id="speak-word">${showPic && !speakM.revealed ? '? ? ?' : esc(w.foreign)}</p>
      ${!showPic && w.german ? `<p class="cw-german" lang="de">${esc(w.german)}</p>` : ''}
    </div>
    <div class="speak-zone" id="speak-zone" aria-live="polite">${speakZone(set, w)}</div>
  </section>`;
}

function speakZone(set, w) {
  const s = speakM.state;
  const listenBtns = `<button class="btn ghost" data-action="speak-hear">${icon('speaker')} Richtige Aussprache</button>
    <button class="btn ghost" data-action="speak-hear" data-slow="1">${icon('snail')} Langsam</button>`;
  if (speakM.fallback) {
    const why = speakM.reason === 'unsupported'
      ? esc(micErrorText('not-supported', set.lang))
      : speakM.reason === 'browser' ? 'Dieser Browser (Brave oder Opera) hat keine Spracherkennung. Mit Chrome, Edge oder Safari klappt es.'
        : speakM.reason === 'chosen' ? 'Du übst ohne Mikrofon.'
          : esc(micErrorText(speakM.reason, set.lang));
    return `<p class="note">${why} So kannst du trotzdem üben: Sprich das Wort laut, hör es dir dann an und vergleiche.</p>
      <div class="row center">${listenBtns}</div>
      <div class="row center">
        <button class="btn again" data-action="speak-self" data-ok="0">${icon('flip')} Nochmal üben</button>
        <button class="btn ok" data-action="speak-self" data-ok="1">${icon('check')} Hab ich richtig gesagt</button>
      </div>`;
  }
  if (s === 'starting' || s === 'listening') {
    return `<button class="mic ${s === 'listening' ? 'listening' : 'starting'}" data-action="listen" aria-label="Aufnahme beenden">${icon('mic')}</button>
      <p class="mic-label">${s === 'listening' ? 'Ich höre zu … sprich jetzt!' : 'Mikrofon wird eingeschaltet …'}</p>
      ${speakM.meter ? '<div class="mic-level" id="mic-level" aria-hidden="true"><span></span></div>' : ''}
      <p class="heard-live" id="heard-live" aria-live="polite">${speakM.live ? `„${esc(speakM.live)}“` : ''}</p>`;
  }
  if (s === 'error') {
    return `<div class="banner bad">${icon('mic')}<div><strong>Das Mikrofon hat nicht geklappt.</strong> ${esc(micErrorText(speakM.error, set.lang))}
        <span class="err-code">Fehlercode: ${esc(speakM.error)}</span></div></div>
      <div class="row center">
        <button class="btn primary" data-action="listen">${icon('mic')} Nochmal versuchen</button>
        <button class="btn ghost" data-action="speak-fallback">Ohne Mikrofon üben</button>
      </div>`;
  }
  if (s === 'ok') {
    return `<div class="banner good">${icon('check')}<div><strong>Richtig!</strong>${speakM.heard ? ` Ich habe „${esc(speakM.heard)}“ verstanden.` : ''}${confTag(speakM.conf)}</div></div>
      <div class="row center"><button class="btn primary" data-action="speak-next">Weiter ${icon('right')}</button></div>`;
  }
  if (s === 'bad') {
    const help = speakM.heard ? '' : (silenceHelp(speakM.peak) || 'Wenn das öfter passiert: Einstellungen (oben rechts) → „Mikrofon testen“.');
    const detail = !speakM.heard ? ' Tippe auf das Mikrofon und sprich gleich danach laut und deutlich.'
      : speakM.note === 'unsure' ? ` Ich habe „${esc(speakM.heard)}“ verstanden, aber nicht deutlich genug. Hör es dir an und sprich es noch einmal ganz genau so.`
        : speakM.note === 'article' ? ` Ich habe „${esc(speakM.heard)}“ verstanden. Achte auf den Artikel: „${esc(w.foreign)}“.`
          : ` Ich habe „${esc(speakM.heard)}“ verstanden. Richtig ist „${esc(w.foreign)}“.`;
    return `<div class="banner bad">${icon('x')}<div><strong>${speakM.heard ? 'Noch nicht ganz.' : 'Ich habe nichts gehört.'}</strong>
        ${detail}${speakM.heard ? confTag(speakM.conf, speakM.need) : ''}
        ${help ? `<span class="help-line">${esc(help)}</span>` : ''}</div></div>
      <div class="row center">${listenBtns}</div>
      <div class="row center">
        <button class="btn primary" data-action="listen">${icon('mic')} Nochmal sprechen</button>
        <button class="btn ghost" data-action="speak-skip">Überspringen ${icon('right')}</button>
      </div>`;
  }
  const showPic = speakM.show === 'pic';
  return `<button class="mic" data-action="listen" aria-label="Mikrofon an – jetzt sprechen">${icon('mic')}</button>
    <p class="mic-label">Tippen und das Wort sagen</p>
    <div class="row center">
      ${showPic && !speakM.revealed ? `<button class="btn ghost" data-action="speak-reveal">${icon('eye')} Ich weiß es nicht</button>` : ''}
      ${!showPic || speakM.revealed ? `<button class="btn ghost" data-action="speak-hear">${icon('speaker')} Vorher anhören</button>` : ''}
      <button class="btn ghost" data-action="speak-skip">Überspringen ${icon('right')}</button>
    </div>`;
}

/** Kleine Anzeige, wie sicher der Browser war (hilft beim Einstellen der Mindest-Sicherheit) */
function confTag(conf, need = 0) {
  if (!(conf > 0)) return '';
  return `<span class="conf-tag">Sicherheit ${Math.round(conf * 100)} %${need ? ` · nötig ${Math.round(need * 100)} %` : ''}</span>`;
}

function updateSpeakZone() {
  const set = currentSet();
  const w = speakWord(set);
  const z = $('#speak-zone');
  if (z && w) z.innerHTML = speakZone(set, w);
}
function revealSpeakWord() {
  const set = currentSet();
  const w = speakWord(set);
  speakM.revealed = true;
  const el = $('#speak-word');
  if (el && w) { el.textContent = w.foreign; el.classList.remove('hidden-word'); }
}

async function doListen() {
  const set = currentSet();
  const w = speakWord(set);
  if (!w) return;
  if (speakM.state === 'listening' || speakM.state === 'starting') { stopListening(); return; }
  stopSpeaking();
  clearTimeout(speakM.timer);
  speakM.state = 'starting';
  speakM.live = '';
  speakM.peak = null;
  speakM.meter = false;
  updateSpeakZone();
  let track = null;
  if (meterDuringListen()) {
    const stream = await Promise.race([
      startMeter((lv) => { const b = $('#mic-level'); if (b) b.style.setProperty('--lv', lv.toFixed(3)); }, db.settings.micId).catch(() => null),
      sleep(2500).then(() => null),
    ]);
    if (stream && micMeter.stream === stream) {
      speakM.meter = true;
      if (db.settings.micId) track = stream.getAudioTracks()[0] || null;
      updateSpeakZone();
    }
  }
  try {
    const alts = await listenOnce(set.lang, {
      track,
      onStart: () => {
        if (speakM.state !== 'starting' || speakWord(set) !== w) return;
        speakM.state = 'listening';
        updateSpeakZone();
      },
      onInterim: (t) => {
        speakM.live = t;
        if (speakM.state === 'starting') { speakM.state = 'listening'; updateSpeakZone(); }
        const el = $('#heard-live');
        if (el) el.textContent = `„${t}“`;
      },
    });
    if (speakM.meter) speakM.peak = micMeter.peak;
    stopMeter();
    if (ui.view !== 'speak' || speakWord(set) !== w) return;
    speakM.attempts++;
    if (!alts.length) speakM.silentTries = (speakM.silentTries || 0) + 1; else speakM.silentTries = 0;
    const res = speechMatch(alts, w, set.lang);
    speakM.heard = res.heard || (db.settings.speechLevel === 'loose' ? alts[0] : '') || '';
    speakM.note = res.note || '';
    speakM.conf = res.conf || 0;
    speakM.need = res.need || 0;
    if (res.ok) {
      speakM.state = 'ok';
      if (!speakM.results.has(w.id)) speakM.results.set(w.id, speakM.attempts === 1 && !speakM.revealed ? 'ok' : 'retry');
      sfx.good();
      revealSpeakWord();
      speakM.timer = setTimeout(() => { if (ui.view === 'speak' && speakM.state === 'ok') nextSpeak(); }, 1800);
    } else {
      speakM.state = 'bad';
      sfx.bad();
    }
  } catch (err) {
    if (speakM.meter) speakM.peak = micMeter.peak;
    stopMeter();
    if (ui.view !== 'speak' || speakWord(set) !== w) return;
    if (err === 'no-speech') {
      speakM.attempts++; speakM.heard = ''; speakM.state = 'bad';
      speakM.silentTries = (speakM.silentTries || 0) + 1;
    } else if (err === 'aborted') {
      speakM.state = 'idle';
    } else {
      speakM.state = 'error';
      speakM.error = String(err);
      sfx.bad();
    }
  }
  updateSpeakZone();
}

function nextSpeak() {
  clearTimeout(speakM.timer);
  stopListening(true);
  speakM.idx++;
  resetSpeakWord();
  if (speakM.idx >= speakM.ids.length) {
    speakM.finished = true;
    const set = currentSet();
    const ok = [...speakM.results.values()].filter((r) => r === 'ok').length;
    if (speakM.ids.length === set.words.length || !set.progress?.speak) saveProgress(set, 'speak', { correct: ok, total: speakM.ids.length, date: Date.now() });
    sfx.win();
    if (ok / speakM.ids.length >= 0.8) confetti();
  }
  renderSpeak();
}

/* =========================================================
   4 · TEST
   ========================================================= */
const TEST_TYPES = {
  pic: { label: 'Bild → schreiben', icon: 'image' },
  de: { label: 'Deutsch → schreiben', icon: 'pencil2' },
  listen: { label: 'Hören → schreiben', icon: 'speaker' },
  choice: { label: 'Bedeutung wählen', icon: 'check' },
};
const test = { phase: 'setup', types: new Set(['pic', 'de', 'listen', 'choice']), onlyIds: null, questions: [], idx: 0, checked: false, points: 0 };

function startTest(set, ids = null) {
  test.phase = 'setup';
  test.onlyIds = ids;
  test.questions = [];
}

function typeAvailable(set, type) {
  if (type === 'pic') return set.words.some((w) => hasPicture(w, set.lang));
  if (type === 'listen') return canSpeak();
  if (type === 'choice') return new Set(set.words.map((w) => w.german).filter(Boolean)).size >= 3;
  if (type === 'de') return set.words.some((w) => w.german);
  return true;
}

function buildTest(set) {
  const pool = shuffle(set.words.filter((w) => w.foreign && (!test.onlyIds || test.onlyIds.includes(w.id))));
  const types = [...test.types].filter((t) => typeAvailable(set, t));
  const germans = [...new Set(set.words.map((w) => w.german).filter(Boolean))];
  const feasible = (t, w) => (t === 'pic' ? hasPicture(w, set.lang)
    : t === 'de' ? !!w.german
      : t === 'listen' ? canSpeak()
        : t === 'choice' ? !!w.german && germans.length >= 3 : false);
  let k = Math.floor(Math.random() * Math.max(1, types.length));
  const qs = [];
  for (const w of pool) {
    let type = null;
    for (let i = 0; i < types.length; i++) {
      const t = types[(k + i) % types.length];
      if (feasible(t, w)) { type = t; k = k + i + 1; break; }
    }
    if (!type) type = ['de', 'pic', 'listen', 'choice'].find((t) => feasible(t, w));
    if (!type) continue;
    const q = { wid: w.id, type, answer: '', result: null };
    if (type === 'choice') {
      const others = shuffle(germans.filter((g) => normAnswer(g) !== normAnswer(w.german))).slice(0, 3);
      q.options = shuffle([w.german, ...others]);
    }
    qs.push(q);
  }
  return qs;
}

function renderTest() {
  const set = currentSet();
  const v = $('#view');
  const L = LANGS[set.lang].name;

  if (test.phase === 'setup') {
    const n = test.onlyIds ? test.onlyIds.length : set.words.filter((w) => w.foreign).length;
    v.innerHTML = `<section class="mode test-mode">
      <div class="mode-bar"><h1 class="mode-title">Test</h1></div>
      <div class="test-card setup">
        <h2>Zeig, was du kannst!</h2>
        <p class="lead">${n} ${n === 1 ? 'Frage' : 'Fragen'}${test.onlyIds ? ' (nur deine Fehler)' : ''}. Meistens schreibst du das ${LANGS[set.lang].adj} Wort.</p>
        <fieldset class="types">
          <legend class="label">Welche Aufgaben?</legend>
          ${Object.entries(TEST_TYPES).map(([k, t]) => {
            const avail = typeAvailable(set, k);
            return `<label class="type-chip ${avail ? '' : 'disabled'}"><input type="checkbox" data-type="${k}" ${test.types.has(k) && avail ? 'checked' : ''} ${avail ? '' : 'disabled'}>
              <span>${icon(t.icon)} ${t.label}</span></label>`;
          }).join('')}
        </fieldset>
        <button class="btn primary big" data-action="test-start">Test starten ${icon('right')}</button>
      </div>
    </section>`;
    $$('.types input', v).forEach((cb) => cb.addEventListener('change', () => {
      if (cb.checked) test.types.add(cb.dataset.type); else test.types.delete(cb.dataset.type);
    }));
    return;
  }

  if (test.phase === 'done') { renderTestResult(set); return; }

  const q = test.questions[test.idx];
  const w = set.words.find((x) => x.id === q.wid);
  const total = test.questions.length;
  const instr = {
    pic: `Wie heißt das auf ${L}? Schreib das Wort.`,
    de: `Schreib das ${LANGS[set.lang].adj} Wort.`,
    listen: 'Hör genau hin und schreib das Wort.',
    choice: 'Was bedeutet das auf Deutsch?',
  }[q.type];
  let prompt = '';
  if (q.type === 'pic') prompt = picHTML(w, set.lang, 'card-pic');
  else if (q.type === 'de') prompt = `<p class="cw-german xl" lang="de">${esc(w.german)}</p>`;
  else if (q.type === 'listen') prompt = `<div class="listen-prompt"><button class="btn primary round" data-action="test-play" aria-label="Wort anhören">${icon('speaker', 'big')}</button>
      <button class="btn ghost small" data-action="test-play" data-slow="1">${icon('snail')} Langsam</button></div>`;
  else prompt = `<div class="cw-line"><p class="cw-foreign xl" lang="${set.lang}">${esc(w.foreign)}</p>${sayBtn(w.foreign, set.lang)}</div>`;

  const accents = set.lang === 'fr' ? ['é', 'è', 'ê', 'ë', 'à', 'â', 'ç', 'î', 'ï', 'ô', 'û', 'ù', 'œ', '’'] : [];
  const answerArea = q.type === 'choice'
    ? `<div class="choices">${q.options.map((o, i) => `<button class="choice" data-action="test-choice" data-i="${i}" lang="de"><kbd>${i + 1}</kbd><span>${esc(o)}</span></button>`).join('')}</div>`
    : `<form class="answer-form" id="t-form" autocomplete="off">
        <input id="t-answer" type="text" lang="${set.lang}" autocomplete="off" autocorrect="off" autocapitalize="none" spellcheck="false" placeholder="Dein Wort …" aria-label="Deine Antwort">
        <button class="btn primary" type="submit" id="t-submit">Prüfen</button>
      </form>
      ${accents.length ? `<div class="accent-keys" aria-label="Sonderzeichen">${accents.map((c) => `<button type="button" class="key" data-action="accent" data-ch="${c}">${c}</button>`).join('')}</div>` : ''}`;

  v.innerHTML = `<section class="mode test-mode">
    <div class="mode-bar"><h1 class="mode-title">Test</h1></div>
    ${progressBar(test.idx / total, 'Fortschritt')}
    <p class="progress-label"><span>Frage ${test.idx + 1} von ${total}</span><span class="tally"><b class="ok">${fmtPoints(test.points)} ${test.points === 1 ? 'Punkt' : 'Punkte'}</b></span></p>
    <div class="test-card">
      <p class="q-kind">${icon(TEST_TYPES[q.type].icon)} ${instr}</p>
      <div class="q-prompt">${prompt}</div>
      ${answerArea}
      <div id="t-feedback" class="feedback" aria-live="polite"></div>
    </div>
  </section>`;
  test.checked = false;
  const form = $('#t-form');
  if (form) {
    form.addEventListener('submit', (e) => { e.preventDefault(); test.checked ? nextQuestion() : checkTyped(); });
    setTimeout(() => $('#t-answer')?.focus(), 60);
  }
  if (q.type === 'listen') setTimeout(() => speak(w.foreign, set.lang), 250);
}

const fmtPoints = (p) => String(p).replace('.', ',');

function feedbackHTML(set, w, status, note) {
  const sol = `<span class="solution"><strong lang="${set.lang}">${esc(w.foreign)}</strong>${sayBtn(w.foreign, set.lang)}</span>`;
  if (status === 'correct') return `<div class="banner good">${icon('check')}<div><strong>Richtig!</strong> ${sol}</div></div>`;
  if (status === 'almost') return `<div class="banner almost">${icon('pencil2')}<div><strong>${esc(note || 'Fast richtig!')}</strong> Richtig ist: ${sol}</div></div>`;
  return `<div class="banner bad">${icon('x')}<div><strong>Leider falsch.</strong> Richtig ist: ${sol}${w.german ? ` <span class="muted">(${esc(w.german)})</span>` : ''}</div></div>`;
}

function checkTyped() {
  const set = currentSet();
  const q = test.questions[test.idx];
  const w = set.words.find((x) => x.id === q.wid);
  const input = $('#t-answer');
  if (!input.value.trim()) { input.focus(); input.classList.add('nudge'); setTimeout(() => input.classList.remove('nudge'), 400); return; }
  const r = checkAnswer(input.value, w, set.lang);
  q.answer = input.value.trim();
  q.result = r.status;
  test.points += r.status === 'correct' ? 1 : r.status === 'almost' ? 0.5 : 0;
  test.checked = true;
  input.readOnly = true;
  input.classList.add(r.status);
  $('#t-submit').innerHTML = `Weiter ${icon('right')}`;
  $$('.accent-keys .key').forEach((k) => { k.disabled = true; });
  $('#t-feedback').innerHTML = feedbackHTML(set, w, r.status, r.note);
  (r.status === 'correct' ? sfx.good : r.status === 'almost' ? sfx.almost : sfx.bad)();
  updateTally();
  $('#t-submit').focus();
}

function chooseOption(i) {
  if (test.checked) return;
  const set = currentSet();
  const q = test.questions[test.idx];
  const w = set.words.find((x) => x.id === q.wid);
  const picked = q.options[i];
  const ok = normAnswer(picked) === normAnswer(w.german);
  q.answer = picked; q.result = ok ? 'correct' : 'wrong';
  test.points += ok ? 1 : 0;
  test.checked = true;
  $$('.choice').forEach((b, j) => {
    b.disabled = true;
    if (normAnswer(q.options[j]) === normAnswer(w.german)) b.classList.add('correct');
    else if (j === i) b.classList.add('wrong');
  });
  $('#t-feedback').innerHTML = (ok
    ? `<div class="banner good">${icon('check')}<div><strong>Richtig!</strong> ${esc(w.foreign)} = ${esc(w.german)}</div></div>`
    : `<div class="banner bad">${icon('x')}<div><strong>Leider falsch.</strong> ${esc(w.foreign)} heißt „${esc(w.german)}“.</div></div>`)
    + `<div class="row center"><button class="btn primary" data-action="test-next" id="t-next">Weiter ${icon('right')}</button></div>`;
  (ok ? sfx.good : sfx.bad)();
  updateTally();
  $('#t-next').focus();
}

function updateTally() {
  const t = $('.test-mode .tally .ok');
  if (t) t.textContent = `${fmtPoints(test.points)} ${test.points === 1 ? 'Punkt' : 'Punkte'}`;
}

function nextQuestion() {
  stopSpeaking();
  test.idx++;
  if (test.idx >= test.questions.length) {
    test.phase = 'done';
    const set = currentSet();
    const pct = Math.round((test.points / test.questions.length) * 100);
    const prev = set.progress?.test || {};
    if (!test.onlyIds) saveProgress(set, 'test', { best: Math.max(prev.best ?? 0, pct), last: pct, date: Date.now() });
    sfx.win();
    if (pct >= 80) confetti();
  }
  renderTest();
}

function renderTestResult(set) {
  const v = $('#view');
  const total = test.questions.length;
  const pct = Math.round((test.points / total) * 100);
  const msg = pct >= 95 ? 'Hervorragend!' : pct >= 80 ? 'Sehr gut!' : pct >= 60 ? 'Gut gemacht!' : pct >= 40 ? 'Weiter üben – du schaffst das!' : 'Schau dir die Karten noch einmal an und probier es dann wieder.';
  const wrongIds = test.questions.filter((q) => q.result !== 'correct').map((q) => q.wid);
  const C = 2 * Math.PI * 52;
  const statusIcon = { correct: icon('check'), almost: icon('pencil2'), wrong: icon('x') };
  const promptOf = (q, w) => (q.type === 'pic' ? picHTML(w, set.lang, 'mini') : q.type === 'listen' ? `<span class="tag">${icon('speaker')} gehört</span>` : q.type === 'choice' ? `<span lang="${set.lang}">${esc(w.foreign)}</span>` : `<span lang="de">${esc(w.german)}</span>`);
  v.innerHTML = `<section class="mode test-mode">
    <div class="mode-bar"><h1 class="mode-title">Test</h1></div>
    <div class="test-result">
      <div class="score-ring" role="img" aria-label="${pct} Prozent">
        <svg viewBox="0 0 120 120" aria-hidden="true"><circle cx="60" cy="60" r="52" class="ring-bg"/><circle cx="60" cy="60" r="52" class="ring-fg ${pct >= 80 ? 'good' : pct >= 50 ? 'mid' : 'low'}" stroke-dasharray="${(C * pct / 100).toFixed(1)} ${C.toFixed(1)}"/></svg>
        <span class="score-num">${pct}<small>%</small></span>
      </div>
      <h2>${msg}</h2>
      <p class="result-line">${fmtPoints(test.points)} von ${total} Punkten. Fast richtige Antworten zählen einen halben Punkt.</p>
      <div class="row center">
        ${wrongIds.length ? `<button class="btn primary" data-action="test-retry-wrong">${icon('pencil2')} Nur die Fehler nochmal</button>
          <button class="btn secondary" data-action="cards-from-test">${icon('stack')} Fehler als Lernkarten</button>` : ''}
        <button class="btn ${wrongIds.length ? 'ghost' : 'primary'}" data-action="test-restart">${icon('shuffle')} Neuer Test</button>
      </div>
      <ol class="review">
        ${test.questions.map((q) => {
          const w = set.words.find((x) => x.id === q.wid);
          if (!w) return '';
          return `<li class="rv ${q.result}">
            <span class="rv-status" aria-label="${q.result === 'correct' ? 'richtig' : q.result === 'almost' ? 'fast richtig' : 'falsch'}">${statusIcon[q.result] || ''}</span>
            <span class="rv-prompt">${promptOf(q, w)}</span>
            <span class="rv-answer">${q.result === 'correct' ? '' : `<s>${esc(q.answer) || '–'}</s>`} <strong lang="${q.type === 'choice' ? 'de' : set.lang}">${esc(q.type === 'choice' ? w.german : w.foreign)}</strong></span>
          </li>`;
        }).join('')}
      </ol>
    </div>
  </section>`;
}

function insertAccent(ch) {
  const inp = $('#t-answer');
  if (!inp || inp.readOnly) return;
  const s = inp.selectionStart ?? inp.value.length, e = inp.selectionEnd ?? inp.value.length;
  inp.setRangeText(ch, s, e, 'end');
  inp.focus();
}
