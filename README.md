# Vokabelwelt

Ein Vokabelspiel für Englisch und Französisch. Vokabeln einfügen, und daraus werden:

1. **Lernkarten** zum Umdrehen, mit Bild. Vorne steht wahlweise das Bild, Bild + Wort, das englische/französische Wort oder das deutsche Wort. Als Stapel („Gewusst“ / „Nochmal“) oder alle Karten auf einmal.
2. **Zuordnen**: Bild ↔ Fremdwort oder Fremdwort ↔ Deutsch. Antippen oder eine Linie ziehen.
3. **Aussprechen**: Wort oder Bild wird gezeigt, das Kind spricht ins Mikrofon. Ist es richtig, geht es weiter. Wenn nicht, kann es sich die richtige Aussprache anhören (auch langsam) und es nochmal versuchen. Wie streng bewertet wird, stellst du in den Einstellungen ein: **Mittel** (Standard – das Wort muss stimmen, „Brad“ oder „bird“ statt „bread“ ist falsch; bei langen Wörtern ist ein kleiner Unterschied ok), **Streng** (nur genau das Wort, und der Browser muss sich sicher sein) oder **Locker** (ähnlich klingende Wörter zählen auch).
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

- **Piktogramme** (Standard): einfache, einheitlich gezeichnete Bilder von [ARASAAC](https://arasaac.org). Sie sind dafür gemacht, eindeutig zu sein, und es gibt sie auch für Verben („schwimmen“), Gefühle („glücklich“) und Eigenschaften. Gesucht wird mit dem deutschen **und** dem fremdsprachigen Wort. Passt ein Piktogramm zu beiden, wird es bevorzugt – bei „bat – Fledermaus“ also das Tier und nicht der Schläger.
- **Fotos**: Leitbilder aus Wikipedia. Nur für Nomen; bei Verben und Adjektiven zeigen Fotos oft etwas anderes. Im Bild-Dialog wird zusätzlich in [Openverse](https://openverse.org) gesucht (über 800 Millionen frei lizenzierte Fotos und Zeichnungen).
- **Cliparts**: farbige Zeichnungen aus offenen Sammlungen (Microsoft Fluent Emoji, Google Noto Emoji, OpenMoji, Twemoji u. a., über [Iconify](https://iconify.design)).
- **Emojis**: ein eingebautes Bildwörterbuch mit rund 400 Schulwörtern. Funktioniert auch ohne Internet.

Grundsatz: lieber kein Bild als ein missverständliches.

### Bilder prüfen (empfohlen vor dem Teilen)

„Bilder prüfen“ zeigt alle Wörter untereinander, daneben mehrere Bildvorschläge (Piktogramme, Emoji, Foto). Ein Tipp auf ein Bild übernimmt es. Lässt sich ein Wort nicht gut zeigen (z. B. „usually“, „at the weekend“), wähle **Kein Bild**: Das Wort kommt dann nur bei „Englisch ↔ Deutsch“ dran, nicht beim Bilder-Zuordnen. Die Auswahl wird im Teilen-Link mitgegeben, die Kinder sehen also genau deine Bilder.

Tipps für eindeutige Bilder:

- Schreib die deutsche Übersetzung so eindeutig wie möglich, nur **eine** Bedeutung pro Zeile („bat – Fledermaus“, nicht „bat – Fledermaus, Schläger“). Die Bildsuche richtet sich nach dem deutschen Wort.
- Nomen mit Artikel schreiben („der Hund“), dann erkennt Vokabelwelt, dass es ein Nomen ist.
- Für alles andere: Karte antippen → „Mehr …“ → eigenes Suchwort, Emoji oder eigenes Foto.

Ein Klick auf eine Karte öffnet den Bild-Dialog mit allen Quellen. Unter „Eigenes Bild“ gibt es außerdem Knöpfe für **Google Bilder** und **Pixabay**: Bild dort kopieren (Rechtsklick → „Bild kopieren“, am iPhone lange drücken → „Kopieren“) und im Feld einfügen. Eigene Fotos lassen sich auch hochladen oder mit der Tablet-Kamera aufnehmen.

Piktogramme: Sergio Palao, ARASAAC (https://arasaac.org), Eigentum der Regierung von Aragón, Lizenz CC BY-NC-SA. Die Nutzung ist für nicht-kommerzielle Zwecke wie den Unterricht erlaubt.

## Mit der Klasse teilen

„Teilen“ erzeugt einen Link, der die ganze Vokabelportion samt Bildern enthält. Wer ihn öffnet, hat die Portion sofort in seinem Browser. Eigene hochgeladene Fotos passen nicht in den Link; dort werden automatisch Bilder gesucht.

Alles wird nur im Browser gespeichert (localStorage). Es gibt keinen Server und keine Anmeldung.

## Online stellen (GitHub Pages)

1. Im Repository auf **Settings → Pages** gehen.
2. Bei „Build and deployment“ **Deploy from a branch** wählen, den Branch mit Vokabelwelt (z. B. `claude/vokabelwelt-app`) und Ordner **/ (root)**.
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
