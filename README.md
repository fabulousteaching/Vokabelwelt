# Vokabelwelt

Ein Vokabelspiel für Englisch und Französisch. Vokabeln einfügen, und daraus werden:

1. **Lernkarten** zum Umdrehen, mit Bild. Vorne steht wahlweise das Bild, Bild + Wort, das englische/französische Wort oder das deutsche Wort. Als Stapel („Gewusst“ / „Nochmal“) oder alle Karten auf einmal.
2. **Zuordnen**: Bild ↔ Fremdwort oder Fremdwort ↔ Deutsch. Antippen oder eine Linie ziehen.
3. **Aussprechen**: Wort oder Bild wird gezeigt, das Kind spricht ins Mikrofon. Ist es richtig, geht es weiter. Wenn nicht, kann es sich die richtige Aussprache anhören (auch langsam) und es nochmal versuchen.
4. **Test**: Bild → schreiben, Deutsch → schreiben, Hören → schreiben (Diktat) und Bedeutung wählen. Fast richtige Antworten (Akzent vergessen, Artikel fehlt, ein Tippfehler) zählen einen halben Punkt. Am Ende gibt es eine Auswertung und man kann nur die Fehler wiederholen.

## Vokabeln einfügen

Eine Vokabel pro Zeile. Diese Schreibweisen werden erkannt:

```
apple – Apfel
the dog = der Hund
to swim - schwimmen
la pomme ; der Apfel
house	Haus          (Tabelle aus Word/Excel, mit Tabulator)
```

Ist Deutsch links, erkennt Vokabelwelt das meistens selbst. Sonst hilft der Knopf „Spalten tauschen“. Die Sprache (Englisch/Französisch) wird ebenfalls erkannt.

Besonderheiten beim Prüfen:

- `colo(u)r` → „colour“ und „color“ sind beide richtig.
- `colour / color` → beide Schreibweisen sind richtig.
- Englisch: „the“, „a“ und „to“ müssen nicht mitgeschrieben werden.
- Französisch: Fehlt der Artikel (le/la/l’), gibt es einen halben Punkt und einen Hinweis.
- `sb.`/`sth.` und `qn`/`qc` werden beim Vorlesen als „somebody/something“ bzw. „quelqu’un/quelque chose“ gesprochen.

## Bilder

Für jede Karte wird automatisch ein Bild gesucht. Oben bei „Deine Karten“ wählst du die Bildquelle:

- **Fotos**: Leitbilder aus Wikipedia (frei lizenziert, Quelle steht im Bild-Dialog).
- **KI-Bilder**: werden von einer KI gemalt (Dienst: pollinations.ai, ohne Anmeldung). Das ist experimentell und dauert ein paar Sekunden pro Bild. Ist der Dienst nicht erreichbar, werden Fotos oder Emojis benutzt.
- **Emojis**: ein eingebautes Bildwörterbuch mit über 400 Schulwörtern. Funktioniert auch ohne Internet.

Ein Klick auf eine Karte öffnet den Bild-Dialog. Dort kannst du ein anderes Foto suchen, ein KI-Bild malen lassen, ein Emoji wählen oder ein eigenes Foto hochladen (auch mit der Tablet-Kamera oder per Strg+V).

## Mit der Klasse teilen

„Teilen“ erzeugt einen Link, der die ganze Vokabelportion samt Bildern enthält. Wer ihn öffnet, hat die Portion sofort in seinem Browser. Eigene hochgeladene Fotos passen nicht in den Link; dort werden automatisch Bilder gesucht.

Alles wird nur im Browser gespeichert (localStorage). Es gibt keinen Server und keine Anmeldung.

## Online stellen (GitHub Pages)

1. Im Repository auf **Settings → Pages** gehen.
2. Bei „Build and deployment“ **Deploy from a branch** wählen, Branch **main** (bzw. den Standard-Branch) und Ordner **/ (root)**.
3. Nach ein bis zwei Minuten ist Vokabelwelt unter `https://<benutzername>.github.io/<repository>/` erreichbar.

Man kann `index.html` auch einfach per Doppelklick öffnen. Für Spracherkennung und Teilen-Links ist die Online-Version aber besser.

## Browser

- **Spracherkennung** gibt es in Chrome, Edge und Safari (auch auf iPad/iPhone). Firefox kann das nicht; dort bewerten sich die Kinder selbst (anhören und vergleichen).
- **Vorlesen** funktioniert in allen aktuellen Browsern. Die Stimme und britisches oder amerikanisches Englisch lassen sich in den Einstellungen wählen.

## Aufbau

Reines HTML/CSS/JavaScript ohne Build-Schritt:

| Datei | Inhalt |
| --- | --- |
| `index.html` | Seite |
| `css/styles.css` | Gestaltung |
| `js/picture-data.js` | Bildwörterbuch (Emoji/Farbe ↔ Englisch/Französisch/Deutsch) |
| `js/core.js` | Parser, Antwortprüfung, Speicher, Bildsuche, Vorlesen, Spracherkennung |
| `js/ui.js` | Startseite, Übersicht, Dialoge |
| `js/modes.js` | Lernkarten, Zuordnen, Aussprechen, Test |
| `js/main.js` | Aktionen und Start |
