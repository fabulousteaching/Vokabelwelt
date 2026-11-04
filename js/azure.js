/* Vokabelwelt – genaue Aussprache-Prüfung mit Microsoft Azure („Pronunciation Assessment“), optional.
 * Azure vergleicht das Gesprochene Laut für Laut mit dem erwarteten Wort und vergibt 0–100 Punkte.
 * Dafür braucht man einen eigenen Azure-Schlüssel (kostenloser Tarif F0). Ohne Schlüssel nutzt die App
 * weiterhin die Spracherkennung des Browsers.
 */
'use strict';

const AZURE_SDK_URL = 'https://cdn.jsdelivr.net/npm/microsoft-cognitiveservices-speech-sdk@1.52.0/distrib/browser/microsoft.cognitiveservices.speech.sdk.bundle-min.js';
const AZURE_REGIONS = [
  ['germanywestcentral', 'Germany West Central (Frankfurt)'],
  ['westeurope', 'West Europe (Niederlande)'],
  ['northeurope', 'North Europe (Irland)'],
  ['switzerlandnorth', 'Switzerland North (Zürich)'],
  ['francecentral', 'France Central (Paris)'],
  ['swedencentral', 'Sweden Central'],
  ['uksouth', 'UK South (London)'],
  ['eastus', 'East US'],
  ['westus2', 'West US 2'],
];
const azureState = { rec: null };

const azureCfg = () => db.settings.azure || {};
const azureReady = () => { const a = azureCfg(); return !!(a.on && a.key && a.region); };

let azureSdkPromise = null;
function loadAzureSdk() {
  if (window.SpeechSDK) return Promise.resolve(window.SpeechSDK);
  if (azureSdkPromise) return azureSdkPromise;
  azureSdkPromise = new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = AZURE_SDK_URL;
    s.async = true;
    s.onload = () => (window.SpeechSDK ? resolve(window.SpeechSDK) : reject('azure-sdk'));
    s.onerror = () => { azureSdkPromise = null; reject('azure-sdk'); };
    document.head.appendChild(s);
  });
  return azureSdkPromise;
}

/** Was gesagt werden soll. Englisch ohne „the/a/to“ (muss man nicht sagen), Französisch mit Artikel. */
function azureReference(word, lang) {
  const first = answerVariants(word.foreign)[0] || word.foreign;
  const t = ttsText(first, lang).replace(/\s*,\s*/g, ', ');
  return lang === 'en' ? stripArticle(t, 'en') : t;
}

function azureErrorFromCancel(SDK, result) {
  let c = null;
  try { c = SDK.CancellationDetails.fromResult(result); } catch { /* */ }
  const code = c ? Number(c.ErrorCode) : -1;
  const details = String(c?.errorDetails || '');
  if (/permission|notallowed|denied/i.test(details)) return 'not-allowed';
  if (/notfound|no microphone|audio source/i.test(details)) return 'audio-capture';
  if (code === 1 || code === 8 || /401|403|authentication|subscription|key/i.test(details)) return 'azure-auth';
  if (code === 3 || /429|quota|too many/i.test(details)) return 'azure-quota';
  if (code === 4 || code === 5 || /1006|websocket|connection|network|timeout/i.test(details)) return 'azure-network';
  return 'azure-error';
}

/**
 * Hört einmal zu und bewertet die Aussprache von word.
 * Liefert { text, ref, accuracy, completeness, pron, words: [{ word, acc, error, phonemes: [{ p, acc }] }] }
 */
async function azureAssess(word, lang, { onStart, timeoutMs = 15000 } = {}) {
  const a = azureCfg();
  if (!a.key || !a.region) throw 'azure-auth';
  let SDK;
  try { SDK = await loadAzureSdk(); } catch { throw 'azure-sdk'; }
  const ref = azureReference(word, lang);
  return new Promise((resolve, reject) => {
    let rec, settled = false, timer = null;
    const finish = (fn) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      if (azureState.rec === rec) azureState.rec = null;
      try { rec?.close(); } catch { /* */ }
      fn();
    };
    try {
      const speechConfig = SDK.SpeechConfig.fromSubscription(a.key.trim(), a.region);
      speechConfig.speechRecognitionLanguage = langCode(lang);
      const audio = db.settings.micId ? SDK.AudioConfig.fromMicrophoneInput(db.settings.micId) : SDK.AudioConfig.fromDefaultMicrophoneInput();
      const pa = new SDK.PronunciationAssessmentConfig(ref, SDK.PronunciationAssessmentGradingSystem.HundredMark, SDK.PronunciationAssessmentGranularity.Phoneme, true);
      rec = new SDK.SpeechRecognizer(speechConfig, audio);
      pa.applyTo(rec);
      azureState.rec = rec;
      rec.sessionStarted = () => onStart?.();
      timer = setTimeout(() => finish(() => reject('no-speech')), timeoutMs);
      rec.recognizeOnceAsync((result) => {
        if (result.reason === SDK.ResultReason.RecognizedSpeech) {
          let r = null;
          try { r = SDK.PronunciationAssessmentResult.fromResult(result); } catch { /* */ }
          if (!r) { finish(() => reject('azure-error')); return; }
          const d = r.detailResult || {};
          const words = (d.Words || []).map((x) => ({
            word: x.Word,
            acc: x.PronunciationAssessment?.AccuracyScore ?? null,
            error: x.PronunciationAssessment?.ErrorType || 'None',
            phonemes: (x.Phonemes || []).map((ph) => ({ p: ph.Phoneme, acc: ph.PronunciationAssessment?.AccuracyScore ?? null })),
          }));
          finish(() => resolve({ text: result.text || '', ref, accuracy: r.accuracyScore, completeness: r.completenessScore, pron: r.pronunciationScore, words }));
        } else if (result.reason === SDK.ResultReason.NoMatch) {
          finish(() => reject('no-speech'));
        } else if (result.reason === SDK.ResultReason.Canceled) {
          finish(() => reject(azureErrorFromCancel(SDK, result)));
        } else {
          finish(() => reject('azure-error'));
        }
      }, (err) => {
        const e = String(err || '');
        finish(() => reject(/permission|notallowed|denied/i.test(e) ? 'not-allowed' : /1006|websocket|network/i.test(e) ? 'azure-network' : 'azure-error'));
      });
    } catch (e) {
      finish(() => reject(/permission|notallowed/i.test(String(e)) ? 'not-allowed' : 'azure-error'));
    }
  });
}

function stopAzure() {
  const r = azureState.rec;
  azureState.rec = null;
  try { r?.close(); } catch { /* */ }
}

/** Bewertung: genug Punkte UND alle Wörter gesagt */
function azureVerdict(res) {
  const min = azureCfg().minScore ?? 70;
  const acc = Math.round(res.accuracy ?? 0);
  const comp = Math.round(res.completeness ?? 0);
  const said = res.words.filter((w) => w.error !== 'Insertion');
  const missing = said.filter((w) => w.error === 'Omission').map((w) => w.word);
  const weak = said.filter((w) => w.error !== 'Omission' && w.acc != null && w.acc < min).map((w) => w.word);
  return { ok: acc >= min && comp >= 80 && !missing.length, acc, comp, min, missing, weak };
}

/** Laute mit Punkten, schwache hervorgehoben (für Lehrkräfte) */
function azurePhonemesHTML(res, min) {
  const parts = res.words.filter((w) => w.error !== 'Insertion' && w.phonemes.length).map((w) =>
    w.phonemes.map((ph) => `<span class="ph ${ph.acc != null && ph.acc < Math.min(min, 60) ? 'weak' : ''}">${esc(ph.p || '?')}<small>${ph.acc == null ? '' : Math.round(ph.acc)}</small></span>`).join(''));
  return parts.length ? `<span class="phonemes" title="Laute und Punkte">${parts.join('<span class="ph-gap"></span>')}</span>` : '';
}

function azureErrorText(code) {
  switch (code) {
    case 'azure-auth': return 'Microsoft hat den Schlüssel abgelehnt. Stimmen Schlüssel und Region? (Einstellungen → Genaue Aussprache-Prüfung)';
    case 'azure-quota': return 'Das kostenlose Kontingent bei Microsoft ist aufgebraucht oder es kamen zu viele Anfragen auf einmal. Später noch einmal versuchen.';
    case 'azure-network': return 'Keine Verbindung zu Microsoft. Bist du online? In manchen Schulnetzen ist der Dienst gesperrt.';
    case 'azure-sdk': return 'Das Azure-Programm konnte nicht geladen werden. Bist du online?';
    default: return 'Bei der Aussprache-Prüfung mit Microsoft ist ein Fehler passiert.';
  }
}
