# HeadSpace · Notizbuch

Persönliches Notizbuch für Laptop und Smartphone – als GitHub Page.

- **To-dos**: „Heute“ und „Langfristig“. Erledigtes aus „Heute“ verschwindet über Nacht.
  **Wiederkehrende Aufgaben** (↻): täglich, werktags, an bestimmten Wochentagen, alle 2 Wochen oder monatlich – sie tauchen am Stichtag unter „Heute“ auf.
- **Notizen**: freie Notizblöcke mit Suche, Anpinnen, Farben, Link-Chips, Kopieren/Teilen, **Checklisten** (auch direkt auf der Karte abhakbar) – plus **Spielstand**-Zähler.
- **Frachtraum**: Bilder, Videos und Dateien zwischen Geräten hin- und herschieben (Upload, Drag & Drop, Strg+V), ansehen, teilen/sichern, löschen.
  **Auto-Löschen** nach 1 Tag, 3 Tagen, 1 Woche, 1 Monat oder 3 Monaten; einzelne Dateien lassen sich mit „Behalten“ ausnehmen.
- **Schnellnotiz**: runder Knopf unten rechts oder Taste **N** – als Notiz oder direkt als To-do (jede Zeile eine Aufgabe). Auf Android auch per langem Druck aufs App-Icon.

## So funktioniert der Zugriffsschutz

Die App (dieses Repo) ist öffentlich, die **Daten liegen in einem separaten privaten Repo** (Standard: `notes-data`).
Alles wird **im Browser mit AES-256-GCM verschlüsselt** (Schlüssel per PBKDF2 aus der Passphrase), bevor es zu GitHub geht.
Ohne Token *und* Passphrase kommt niemand an die Inhalte – auch GitHub selbst sieht nur verschlüsselte Bytes.

## Einrichtung (einmalig)

1. Privates Repo **`notes-data`** anlegen (leer reicht).
2. **Fine-grained Token** erstellen: GitHub → Settings → Developer settings → Fine-grained tokens
   - Repository access: *Only select repositories* → `notes-data`
   - Permissions → Repository → **Contents: Read and write**
3. In diesem Repo **GitHub Pages** aktivieren: Settings → Pages → *Deploy from a branch* → `main` / `/ (root)`.
4. Seite öffnen, Token + Passphrase eingeben → beim ersten Mal wird das Notizbuch angelegt.
5. Auf dem Handy: „Zum Home-Bildschirm hinzufügen“. Unter Android erscheint HeadSpace danach auch im **Teilen**-Menü.

## Hinweise

- Dateien bis 50 MB. Gelöschte Dateien bleiben (verschlüsselt) im Git-Verlauf, bis man in den Einstellungen **„Verlauf bereinigen“** ausführt.
- Die Passphrase ist nicht wiederherstellbar.
- Pro Gerät bleibt man angemeldet; „Sperren“ verlangt die Passphrase erneut.

## Dateien im Daten-Repo

| Datei | Inhalt |
|---|---|
| `meta.json` | Salt + Prüfwert (unverschlüsselt, enthält nichts Inhaltliches) |
| `data.enc` | To-dos, Notizen, Medien-Index inkl. Vorschaubildern (verschlüsselt) |
| `files/<id>` | die einzelnen Dateien (verschlüsselt) |
