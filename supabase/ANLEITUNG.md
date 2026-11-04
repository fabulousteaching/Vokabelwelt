# Vokabelwelt mit Anmeldung einrichten

Mit einem Konto speichert Vokabelwelt deine Vokabelportionen bei [Supabase](https://supabase.com) (Datenbank und Anmeldung, gratis für kleine Projekte). Du meldest dich mit **Benutzername und Passwort** an und hast deine Portionen auf jedem Gerät.
Solange in `js/config.js` nichts eingetragen ist, läuft Vokabelwelt wie bisher ohne Anmeldung, und alles bleibt nur im Browser.

Die Kinder brauchen kein Konto. Sie bekommen die Portionen weiterhin über den QR-Code.

Die Menünamen in Supabase ändern sich ab und zu leicht. Die Wege unten stimmen sinngemäss.

## So funktioniert die Anmeldung mit Benutzername

Supabase kennt eigentlich nur Anmeldungen mit E-Mail-Adresse. Vokabelwelt bildet deshalb aus dem Benutzernamen eine interne Adresse:
`anna` → `vokabelwelt.anna@smartslots.ch`. An diese Adresse wird **nie** etwas geschickt, sie dient nur als Name für das Konto.
Damit das klappt, muss in Supabase die E-Mail-Bestätigung ausgeschaltet sein (Schritt 4).

Gut zu wissen: Ohne echte E-Mail-Adresse gibt es kein «Passwort vergessen». Wer angemeldet ist, kann das Passwort unter «Konto» ändern. Ist es vergessen, kannst du es in Supabase neu setzen (siehe unten).

## 1. Projekt erstellen (oder das SmartSlots-Projekt nehmen)

**Empfohlen: eigenes Projekt.**

1. Auf supabase.com anmelden und **New project** wählen.
2. Name z. B. `vokabelwelt`. **Region in Europa** wählen (z. B. Frankfurt).
3. Das Datenbank-Passwort gut aufbewahren (Vokabelwelt braucht es nicht).

Gratis sind zwei Projekte möglich, also SmartSlots und Vokabelwelt nebeneinander.

**Alternative: das SmartSlots-Projekt mitbenutzen.** Das geht auch, Vokabelwelt hat eine eigene Tabelle. Dann gelten aber dieselben Einstellungen für beide (Schritt 4 schaltet die E-Mail-Bestätigung auch für SmartSlots aus), und Vokabelwelt-Konten könnten sich auch bei SmartSlots anmelden (sie sehen dort nur leere, eigene Daten).

## 2. Tabelle anlegen

1. Links **SQL Editor** öffnen, **New query**.
2. Den ganzen Inhalt von `supabase/vokabelwelt.sql` einfügen und **Run** klicken.
3. Es erscheint «Success. No rows returned». Mehrmals ausführen schadet nicht.

Das SQL legt die Tabelle `vokabelwelt_sets` an und sorgt dafür, dass jede Person nur ihre eigenen Portionen sieht und ändern kann.

## 3. Adresse der Seite eintragen

**Authentication → URL Configuration**

- **Site URL:** `https://fabulousteaching.github.io/Vokabelwelt/`
- **Redirect URLs:** `https://fabulousteaching.github.io/Vokabelwelt/**` hinzufügen.

(Beim SmartSlots-Projekt die bestehenden Einträge lassen und nur die Vokabelwelt-Adresse bei den Redirect URLs ergänzen.)

## 4. E-Mail-Bestätigung ausschalten (wichtig)

Unter **Authentication → Sign In / Providers → Email**:

- **Confirm email:** ausschalten. Neue Konten sind dann sofort aktiv, und Supabase schickt keine E-Mails an die internen Adressen.
- **Minimum password length:** 8 (Vokabelwelt verlangt das auch).

**Wer darf ein Konto erstellen?** Mit «Neues Konto» kann sich jede Person, die die Seite kennt, ein Konto machen. Wenn du das nicht willst: Erst dein eigenes Konto erstellen, dann unter **Authentication → Sign In / Providers** die Option **Allow new users to sign up** ausschalten. Weitere Konten (z. B. für Kolleginnen und Kollegen) legst du danach unter **Authentication → Users → Add user → Create new user** an: als E-Mail `vokabelwelt.<benutzername>@smartslots.ch`, dazu ein Passwort und **Auto Confirm User** anhaken.

## 5. Schlüssel in Vokabelwelt eintragen

Beim Projekt auf **Connect** klicken (oder **Project Settings → API Keys**) und zwei Werte kopieren:

- die **Project URL** (`https://….supabase.co`)
- den **Publishable key** (`sb_publishable_…`) oder den älteren **anon public** Schlüssel

Beide in `js/config.js` eintragen (bei `supabaseUrl` und `supabaseKey`). Diese beiden Werte dürfen öffentlich sein.
Den **secret** bzw. **service_role** Schlüssel nie eintragen und nie weitergeben.

`loginDomain` bleibt `smartslots.ch`. Nach dem ersten Konto nicht mehr ändern, sonst passen die Benutzernamen nicht mehr zu den Konten.

Nach dem Speichern (Commit) ist die Anmeldung nach ein bis zwei Minuten auf GitHub Pages da: oben rechts **Anmelden** → **Neues Konto**.

## Was beim Anmelden passiert

- Portionen, die schon auf dem Gerät sind, kommen mit ins Konto.
- Jede Änderung (neue Portion, Bilder, Bearbeiten, Löschen) wird ein paar Sekunden später ins Konto gespeichert. Oben rechts zeigt ein Punkt den Stand: grün = gespeichert, gelb = wird gespeichert, rot = Problem (Maus darüber oder antippen für Details).
- Auf einem anderen Gerät anmelden: Die Portionen werden geholt.
- **Abmelden** entfernt die Portionen von diesem Gerät (sie bleiben im Konto). Praktisch auf Schulcomputern, die mehrere Personen benutzen.
- Ohne Internet geht alles weiter wie bisher; gespeichert wird beim nächsten Mal mit Verbindung.

## Passwort vergessen

In Supabase **SQL Editor** öffnen und Folgendes ausführen (Benutzername und neues Passwort anpassen):

```sql
update auth.users
set encrypted_password = extensions.crypt('NeuesPasswort123', extensions.gen_salt('bf'))
where email = 'vokabelwelt.anna@smartslots.ch';
```

Danach mit dem neuen Passwort anmelden und es unter «Konto → Passwort ändern» gleich durch ein eigenes ersetzen.

## Gut zu wissen

- **Pause bei Gratis-Projekten:** Supabase pausiert Gratis-Projekte nach etwa 7 Tagen ohne Nutzung. Die Daten bleiben erhalten. Beim Projekt in Supabase **Restore** klicken, dann geht es nach ein paar Minuten weiter. Während der Pause meldet Vokabelwelt «Keine Verbindung zum Server»; auf dem Gerät gespeicherte Portionen funktionieren trotzdem.
- **Datenschutz:** In den Portionen stehen nur Vokabeln, Bilder-Auswahl und Übungsstand dieses Geräts, keine Namen von Kindern.
- **Eigene Fotos** (hochgeladen oder eingefügt) werden mitgespeichert. Eine Portion darf im Konto höchstens ca. 3 MB gross sein.
