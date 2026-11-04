/* Vokabelwelt – Aktionen und Start */
'use strict';

function startMode(mode, opts = {}) {
  const set = currentSet();
  if (!set) return;
  if (mode === 'cards') startCards(set, opts);
  if (mode === 'match') startMatch(set, opts.variant || (set.words.some((w) => hasPicture(w, set.lang)) ? 'pic' : 'de'));
  if (mode === 'speak') startSpeak(set, opts.ids);
  if (mode === 'test') startTest(set, opts.ids);
  go(mode);
}

const actions = {
  home: () => { ui.confirmDelete = null; go('home'); },
  'open-set': (el) => openSet(el.dataset.id),
  settings: () => openSettings(),
  'close-modal': () => closeModal(),

  /* Startseite */
  'draft-lang': (el) => {
    ui.draft.lang = el.dataset.lang; ui.draft.langManual = true;
    $('#lang-seg').innerHTML = langSeg(ui.draft.lang, 'draft-lang');
    $('#lang-hint').textContent = '';
    renderPreview();
  },
  'draft-swap': () => { ui.draft.swap = !ui.draft.swap; renderPreview(); },
  'load-example': (el) => {
    const ex = EXAMPLES[+el.dataset.i];
    ui.draft = { text: ex.text, lang: ex.lang, langManual: true, name: ex.name, swap: false };
    render();
    $('#vocab-input')?.focus();
    $('#new-set-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  },
  'delete-set': (el) => { ui.confirmDelete = el.dataset.id; render(); },
  'delete-set-no': () => { ui.confirmDelete = null; render(); },
  'delete-set-yes': (el) => {
    db.sets = db.sets.filter((s) => s.id !== el.dataset.id);
    ui.confirmDelete = null; saveDB(); render(); toast('Gelöscht.');
  },

  /* Portionsübersicht */
  mode: (el) => startMode(el.dataset.mode, { variant: el.dataset.variant }),
  'edit-words': () => openEditDialog(currentSet()),
  'edit-add-row': () => {
    $('#edit-rows').insertAdjacentHTML('beforeend', ui.modal.newRow());
    $('#edit-rows .edit-row:last-child .e-foreign')?.focus();
  },
  'edit-remove-row': (el) => el.closest('.edit-row')?.remove(),
  'edit-lang': (el) => { ui.modal.editLang = el.dataset.lang; $('#edit-lang').innerHTML = langSeg(ui.modal.editLang, 'edit-lang'); },
  share: () => openShare(currentSet()),
  copy: (el) => copyFrom(el.dataset.target),
  'pic-style': (el) => {
    const set = currentSet();
    const style = el.dataset.style;
    set.picStyle = style;
    if (style === 'ai') { net.aiDown = false; net.aiFails = 0; }
    if (style === 'picto') net.arasaacDown = false;
    if (style === 'photo') net.wikiDown = false;
    saveDB();
    $$('.deck-controls .seg-btn').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.style === style)));
    if (picJobs.has(set.id)) { toast('Einen Moment – die Bilder werden noch gesucht.'); return; }
    startPictureFill(set, true);
  },
  'pic-dialog': (el) => {
    const set = currentSet();
    const w = set.words.find((x) => x.id === el.dataset.wid);
    if (w) openPicDialog(set, w);
  },
  'pic-tab': (el) => {
    ui.picTab = el.dataset.tab;
    const set = currentSet();
    const w = set.words.find((x) => x.id === ui.modal?.wid);
    if (w) renderPicTab(set, w);
  },
  'pic-choose': (el) => {
    const set = currentSet();
    const w = set.words.find((x) => x.id === ui.modal?.wid);
    if (!w || el.classList.contains('failed')) return;
    let credit = null;
    try { credit = el.dataset.credit ? JSON.parse(el.dataset.credit) : null; } catch { /* */ }
    choosePic(set, w, { kind: el.dataset.kind, src: el.dataset.src, credit });
  },
  'pic-none': () => {
    const set = currentSet();
    const w = set.words.find((x) => x.id === ui.modal?.wid);
    if (!w) return;
    w.pic = { kind: 'none', src: '', manual: true };
    w.picStatus = 'done';
    saveDB(); refreshPicDialogHead(set, w); refreshDeck(set, w);
  },
  'pic-auto': async () => {
    const set = currentSet();
    const w = set.words.find((x) => x.id === ui.modal?.wid);
    if (!w) return;
    w.pic = null; w.picStatus = 'pending';
    net.wikiDown = false;
    refreshPicDialogHead(set, w); refreshDeck(set, w);
    w.pic = await autoPicture(w, set);
    w.picStatus = 'done';
    saveDB(); refreshPicDialogHead(set, w); refreshDeck(set, w);
  },
  'photo-more': () => ui.modal?.photoMore?.(),
  'draw-one': async (el) => {
    const set = currentSet();
    const w = set.words.find((x) => x.id === ui.modal?.wid);
    if (!w || !claudeSample) return;
    const box = $('#draw-results');
    el.disabled = true;
    box.innerHTML = '<div class="cand loading"><span class="spinner"></span></div>';
    try {
      const src = await claudeDraw(w, set.lang);
      if (!$('#draw-results')) return;
      box.innerHTML = candHTML({ src, title: '' }, 'drawn');
      choosePic(set, w, { kind: 'drawn', src });
    } catch (e) {
      if ($('#draw-results')) box.innerHTML = `<p class="muted">${e?.code === 'rate_limited' ? 'Claude braucht eine kurze Pause. Versuch es gleich noch einmal.' : e?.code === 'not_granted' ? 'Zeichnen wurde nicht erlaubt.' : 'Das hat nicht geklappt. Versuch es noch einmal.'}</p>`;
    }
    el.disabled = false;
  },
  'draw-missing': () => drawMissing(currentSet()),
  'review-pics': () => { ui.reviewCands = {}; go('pics'); },
  'review-pick': (el) => {
    const set = currentSet();
    const w = set.words.find((x) => x.id === el.dataset.wid);
    const c = ui.reviewList?.[w?.id]?.[+el.dataset.i];
    if (!w || !c || el.classList.contains('failed')) return;
    w.pic = { kind: c.kind, src: c.src, credit: c.credit || null, title: c.title || '', manual: true };
    w.picStatus = 'done';
    brokenPics.delete(c.src);
    saveDB();
    renderReviewRow(set, w);
  },
  'review-none': (el) => {
    const set = currentSet();
    const w = set.words.find((x) => x.id === el.dataset.wid);
    if (!w) return;
    w.pic = { kind: 'none', src: '', manual: true };
    w.picStatus = 'done';
    saveDB();
    renderReviewRow(set, w);
  },

  /* Einstellungen */
  'set-speech-level': (el) => {
    db.settings.speechLevel = el.dataset.level; saveDB();
    $$('[data-action="set-speech-level"]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.level === db.settings.speechLevel)));
    const h = $('#speech-level-hint');
    if (h) h.textContent = SPEECH_LEVELS[db.settings.speechLevel].hint;
  },
  'set-accent': (el) => {
    db.settings.accent = el.dataset.accent; saveDB();
    $$('[data-action="set-accent"]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.accent === db.settings.accent)));
  },
  'voice-test': (el) => speak(el.dataset.lang === 'fr' ? 'Bonjour ! La pomme est rouge.' : 'Hello! The apple is red.', el.dataset.lang),
  wipe: (el) => {
    if (!el.dataset.sure) { el.dataset.sure = '1'; el.innerHTML = `${icon('trash')} Wirklich alles löschen? Nochmal tippen`; return; }
    db.sets = []; saveNow(); closeModal(true); go('home'); toast('Alles gelöscht.');
  },

  /* Allgemein */
  say: (el) => speak(el.dataset.text, el.dataset.lang),

  /* Lernkarten */
  flip: (el) => {
    if (el.closest('.flash-grid')) { el.classList.toggle('is-flipped'); sfx.flip(); if (el.classList.contains('is-flipped') && db.settings.autoSpeak) { const set = currentSet(); const w = set.words.find((x) => x.id === el.dataset.wid); if (w) speak(w.foreign, set.lang); } return; }
    flipCurrent();
  },
  'flip-current': () => flipCurrent(),
  'card-known': () => cardAnswer(true),
  'card-again': () => cardAnswer(false),
  'card-front': (el) => { cards.front = el.dataset.front; db.settings.cardFront = cards.front; saveDB(); cards.flipped = false; renderCards(); },
  'card-layout': (el) => { cards.layout = el.dataset.layout; cards.flipped = false; renderCards(); },
  'cards-again': (el) => {
    const hard = [...cards.firstTry].filter(([, ok]) => !ok).map(([id]) => id);
    resetCards(true, el.dataset.which === 'hard' && hard.length ? hard : currentSet().words.map((w) => w.id));
    renderCards();
  },

  /* Zuordnen */
  'match-variant': (el) => { match.ro?.disconnect(); startMatch(currentSet(), el.dataset.variant); renderMatch(); },

  /* Aussprechen */
  listen: () => doListen(),
  'speak-show': (el) => { speakM.show = el.dataset.show; stopListening(true); resetSpeakWord(); renderSpeak(); },
  'speak-hear': (el) => {
    const set = currentSet();
    const w = speakWord(set);
    if (!w) return;
    revealSpeakWord();
    speak(w.foreign, set.lang, { slow: !!el.dataset.slow });
  },
  'speak-reveal': () => {
    const set = currentSet();
    const w = speakWord(set);
    revealSpeakWord();
    speakM.results.set(w.id, 'retry');
    speak(w.foreign, set.lang);
    updateSpeakZone();
  },
  'speak-skip': () => { const set = currentSet(); const w = speakWord(set); if (w && !speakM.results.has(w.id)) speakM.results.set(w.id, 'skip'); nextSpeak(); },
  'speak-next': () => nextSpeak(),
  'speak-fallback': () => {
    stopListening(true);
    speakM.fallback = true;
    speakM.reason = speakM.error && speakM.error !== 'busy' ? speakM.error : 'chosen';
    speakM.state = 'idle';
    updateSpeakZone();
  },
  'mic-test': async (el) => {
    const out = $('#mic-test-out');
    if (!out) return;
    if (!canListen()) { out.textContent = speechBrowserMissing ? 'Dieser Browser (Brave oder Opera) hat keine Spracherkennung. Nimm Chrome, Edge oder Safari.' : micErrorText('not-supported', 'en'); return; }
    const lang = currentSet()?.lang || 'en';
    const bar = $('#mic-test-level');
    const setBar = (lv) => { if (bar) bar.style.setProperty('--lv', lv.toFixed(3)); };
    el.disabled = true;
    const same = meterDuringListen(); // Chrome/Edge: Pegel und Erkennung gleichzeitig
    // 1) Pegel: kommt Ton an?
    out.textContent = 'Mikrofon wird eingeschaltet …';
    let stream = await startMeter(setBar, db.settings.micId).catch(() => null);
    fillMicSelect();
    let peak = null;
    if (stream && !same) {
      out.textContent = `Sag jetzt etwas – der Balken sollte sich bewegen.`;
      await sleep(3000);
      peak = micMeter.peak;
      stopMeter(); setBar(0);
    }
    // 2) Spracherkennung
    out.textContent = `Ich höre zu – sag etwas auf ${LANGS[lang].name}!`;
    try {
      const alts = await listenOnce(lang, {
        track: same && stream && db.settings.micId ? stream.getAudioTracks()[0] : null,
        onStart: () => { out.textContent = `Ich höre zu – sag etwas auf ${LANGS[lang].name}!`; },
        onInterim: (t) => { out.textContent = `Ich höre: „${t}“`; },
      });
      if (same && stream) peak = micMeter.peak;
      out.textContent = alts.length ? `Es klappt! Erkannt: „${alts[0]}“` : `Ich habe nichts erkannt. ${silenceHelp(peak) || 'Sprich lauter oder näher am Mikrofon.'}`;
    } catch (err) {
      if (same && stream) peak = micMeter.peak;
      out.textContent = err === 'no-speech'
        ? `Ich habe nichts erkannt. ${silenceHelp(peak) || 'Sprich lauter oder näher am Mikrofon.'}`
        : `${micErrorText(err, lang)} (Fehlercode: ${err})`;
    }
    stopMeter(); setBar(0);
    el.disabled = false;
  },

  'speak-self': (el) => {
    const set = currentSet();
    const w = speakWord(set);
    if (!w) return;
    if (el.dataset.ok === '1') {
      if (!speakM.results.has(w.id)) speakM.results.set(w.id, 'ok');
      sfx.good(); nextSpeak();
    } else {
      speakM.results.set(w.id, 'retry');
      speak(w.foreign, set.lang, { slow: true });
    }
  },
  'speak-again': (el) => {
    const set = currentSet();
    const hard = speakM.ids.filter((id) => speakM.results.get(id) !== 'ok');
    startSpeak(set, el.dataset.which === 'hard' && hard.length ? hard : null);
    renderSpeak();
  },

  /* Test */
  'test-start': () => {
    const set = currentSet();
    if (![...test.types].some((t) => typeAvailable(set, t))) { toast('Wähle mindestens eine Aufgabenart aus.', 'bad'); return; }
    test.questions = buildTest(set);
    if (!test.questions.length) { toast('Für diesen Test fehlen noch Vokabeln.', 'bad'); return; }
    test.idx = 0; test.points = 0; test.phase = 'q';
    renderTest();
  },
  'test-play': (el) => {
    const set = currentSet();
    const q = test.questions[test.idx];
    const w = set.words.find((x) => x.id === q.wid);
    speak(w.foreign, set.lang, { slow: !!el.dataset.slow });
    $('#t-answer')?.focus();
  },
  'test-choice': (el) => chooseOption(+el.dataset.i),
  'test-next': () => nextQuestion(),
  accent: (el) => insertAccent(el.dataset.ch),
  'test-restart': () => { startTest(currentSet()); renderTest(); },
  'test-retry-wrong': () => {
    const ids = [...new Set(test.questions.filter((q) => q.result !== 'correct').map((q) => q.wid))];
    startTest(currentSet(), ids);
    test.questions = buildTest(currentSet());
    test.idx = 0; test.points = 0; test.phase = 'q';
    renderTest();
  },
  'cards-from-test': () => {
    const ids = [...new Set(test.questions.filter((q) => q.result !== 'correct').map((q) => q.wid))];
    startMode('cards', { ids });
  },
};

document.addEventListener('click', (e) => {
  const el = e.target.closest('[data-action]');
  if (!el || el.disabled) return;
  const fn = actions[el.dataset.action];
  if (!fn) return;
  if (el.tagName === 'A') return;
  if (el.type === 'submit' && el.closest('form')) return; // Formular kümmert sich selbst
  e.preventDefault();
  fn(el, e);
});

// Sonderzeichen-Tasten sollen das Eingabefeld nicht verlassen
document.addEventListener('pointerdown', (e) => {
  if (e.target.closest('.accent-keys .key')) e.preventDefault();
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && ui.modal) { closeModal(); return; }
  if (ui.modal) return;
  const tag = (e.target.tagName || '').toLowerCase();
  const typing = tag === 'input' || tag === 'textarea' || tag === 'select';
  if (ui.view === 'cards' && cards.layout === 'stack' && !cards.finished && !typing) {
    if (e.key === ' ' || e.key === 'Enter') {
      if (e.target.closest('button:not(.flash)') && e.key === 'Enter') return;
      e.preventDefault(); flipCurrent();
    } else if (e.key === 'ArrowRight') { e.preventDefault(); cardAnswer(true); } else if (e.key === 'ArrowLeft') { e.preventDefault(); cardAnswer(false); }
  } else if (ui.view === 'cards' && cards.layout === 'grid' && (e.key === ' ' || e.key === 'Enter') && e.target.classList?.contains('flash')) {
    e.preventDefault(); actions.flip(e.target);
  } else if (ui.view === 'test' && test.phase === 'q' && !typing) {
    const q = test.questions[test.idx];
    if (q?.type === 'choice' && !test.checked && /^[1-4]$/.test(e.key) && +e.key <= q.options.length) { e.preventDefault(); chooseOption(+e.key - 1); }
    else if (test.checked && e.key === 'Enter' && !e.target.closest('button')) { e.preventDefault(); nextQuestion(); }
  } else if (ui.view === 'speak' && !typing && e.key === ' ' && !e.target.closest('button')) {
    e.preventDefault(); doListen();
  }
});

/* ---------------- Start ---------------- */
async function importFromHash() {
  const m = location.hash.match(/^#v=([A-Za-z0-9_-]+)$/);
  if (!m) return false;
  const code = m[1];
  try { history.replaceState(null, '', location.pathname + location.search); } catch { /* */ }
  try {
    const share = await hashString(code);
    const existing = db.sets.find((s) => s.shareId === share);
    if (existing) { openSet(existing.id); toast(`„${existing.name}“ ist schon da.`); return true; }
    const data = await decodeShare(code);
    if (!data.rows.length) throw new Error('leer');
    const set = newSet({ name: data.name, lang: data.lang, rows: data.rows, picStyle: data.picStyle });
    set.shareId = share;
    saveDB();
    openSet(set.id);
    toast(`Neue Vokabelportion „${set.name}“ geladen.`);
    return true;
  } catch {
    toast('Dieser Link ist leider kaputt oder unvollständig.', 'bad');
    return false;
  }
}

async function boot() {
  loadDB();
  renderShell();
  initClaude();
  window.addEventListener('load', initClaude);
  setTimeout(initClaude, 1500);
  if (!(await importFromHash())) render();
  window.addEventListener('hashchange', importFromHash);
}
boot();
