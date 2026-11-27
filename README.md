# ECG Viewer

Browser-Viewer für `.ecg`-Aufnahmen (EKG, ACC, Puls, RR mit Markern, Poincaré) mit Druckansicht.
Reines HTML/JS, kein Server. Alle Daten bleiben im Browser; Node.js wird nur zum Erstellen des Produktions-Builds benötigt.

## Dateien
- `index.html` – Viewer
- `print.html` – Druckansicht (muss im selben Ordner liegen)
- `map.html` – 3D-Karte/Flyover (MapLibre + MapTiler), wird vom Viewer geöffnet; ebenfalls im selben Ordner

## Lokalen Produktions-Build erstellen
Voraussetzung ist eine installierte Node.js-LTS-Version. Im Projektordner die festgelegten Build-Abhängigkeiten installieren:

```powershell
npm.cmd ci
```

Danach den Produktions-Build erstellen:

```powershell
npm.cmd run build
```

Der Build legt `dist/` mit `index.html`, `map.html`, `print.html` sowie den zugehörigen minifizierten und obfuskierten
JavaScript-Dateien an. Die Quelldateien bleiben unverändert. Zum Veröffentlichen den Inhalt von `dist/` in das
öffentliche Pages-Projekt kopieren und dort committen. `dist/` und `node_modules/` werden in diesem Quellprojekt
nicht mitversioniert.

### Build ins öffentliche Pages-Repository kopieren
Das öffentliche Pages-Repository unter `..\ECG-Viewer-Pages` neben diesem Projekt klonen. Anschließend erstellt
der folgende Befehl den Build und kopiert dessen Dateien ins Stammverzeichnis des Pages-Repositories:

```powershell
npm.cmd run sync-pages
```

Der Befehl bricht ab, wenn der Pages-Ordner kein Git-Repository ist oder uncommittete Änderungen enthält. Er pusht
nicht automatisch. Im Pages-Repository die Änderungen prüfen und veröffentlichen:

```powershell
git add index.html index.js map.html map.js print.html print.js
git commit -m "Update Pages build"
git push
```

Obfuscation erschwert das Lesen des Codes, verhindert aber nicht, dass Besucher ihn herunterladen oder untersuchen.

## Auf GitHub Pages veröffentlichen
1. Den Inhalt von `dist/` ins Hauptverzeichnis des Pages-Repositories legen.
2. Settings → Pages → *Deploy from a branch* → `main` / `(root)`.
3. Aufruf: `https://<user>.github.io/<repo>/`
4. Popups für die Seite erlauben (Druckansicht, ausgekoppeltes Poincaré-Fenster).

## Dateien aus Google Drive laden
Die Datei muss auf **„Jeder mit dem Link → Betrachter“** stehen.

Aufruf per Link: `https://<user>.github.io/<repo>/?id=<DATEI-ID>`
(oder in der Seite einen Drive-Freigabelink bzw. die Datei-ID einfügen).

Alles in einem Link, inklusive Key (der Key wird nach dem Lesen sofort aus der Adresszeile entfernt und nur für den
Browser-Tab gemerkt):
`https://wis-77.github.io/ECG-Viewer/?id=<DATEI-ID>&key=<API-KEY>`

Statt der ID geht auch ein kompletter Freigabelink, dann aber URL-codiert:
`…/ECG-Viewer/?drive=https%3A%2F%2Fdrive.google.com%2Ffile%2Fd%2F<DATEI-ID>%2Fview&key=<API-KEY>`

### API-Key einrichten (einmalig)
1. https://console.cloud.google.com → Projekt anlegen.
2. „APIs & Dienste“ → Bibliothek → **Google Drive API** aktivieren.
3. „Anmeldedaten“ → *API-Schlüssel erstellen*.
4. Schlüssel beschränken:
   - **Anwendungsbeschränkung:** Websites (HTTP-Referrer) → `https://<user>.github.io/*`
   - **API-Beschränkung:** nur *Google Drive API*
5. Key in `index.html` bei `const DRIVE_API_KEY = '';` eintragen.
   Alternativ leer lassen: Die Seite fragt den Key beim ersten Drive-Laden einmal ab und speichert ihn nur im
   `localStorage` des Browsers (dann steht er nicht im öffentlichen Repo).

### Lokal testen
`python3 -m http.server 8000` im Ordner starten, `http://localhost:8000/` öffnen und den Referrer
`http://localhost:8000/*` beim Key vorübergehend ergänzen.
Auf `file://` funktioniert das Laden aus Drive wegen der Referrer-Beschränkung nicht.

## Karte (nur bei Aufnahmen mit GPS)
Enthält die Datei GPS-Daten, erscheint in der Toolbar der Button **Karte** (daneben **⚙** für Optionen; Rechtsklick
auf „Karte“ öffnet dieselben Optionen).
- **Mit MapTiler-Key:** öffnet `map.html` mit Route, Markern und – falls ein Cursor gesetzt ist – dem Cursor als Ziel.
- **Ohne Key, ohne Cursor:** kleine Anleitung mit Link zu https://cloud.maptiler.com/maps/ und Eingabefeld für den Key.
- **Ohne Key, mit Cursor:** öffnet die Cursor-Position in OpenStreetMap.
- Optionen (Marker, Strecke, Cursor als Ziel, Strecke ausdünnen, Höhenkorrektur – Standard 48 m wie in der App) werden
  im Browser gespeichert.

### Cursor-Synchronisation Diagramm ⇄ Karte
Solange das Kartenfenster offen ist, sind der Cursor im Diagramm und der blaue Zielpunkt auf der Karte gekoppelt
(abschaltbar im Karten-Dialog: „Cursor mit Karte synchronisieren“).
- **Diagramm:** Klick setzt den Cursor; die Cursorlinie lässt sich greifen (Zeiger wird zum Doppelpfeil) und ziehen;
  `Entf` entfernt ihn. Die Karte zieht mit und schwenkt nach, wenn der Punkt aus dem Bild läuft.
- **Karte:** Klick auf die Strecke setzt den Cursor, der blaue Punkt lässt sich entlang der Strecke ziehen.
  Das Diagramm folgt und scrollt bei Bedarf zum Cursor. Der Flyover-Läufer ist nicht angebunden.

### MapTiler-Key
1. Auf https://cloud.maptiler.com ein (kostenloses) Konto anlegen und einen Key erzeugen.
2. In den Key-Einstellungen die erlaubten HTTP-Ursprünge auf `https://wis-77.github.io` beschränken (sofern angeboten).
3. Key im Karten-Dialog eintragen (nur im Browser/localStorage gespeichert) **oder** in `index.html` bei
   `const MAPTILER_KEY = '';` fest eintragen **oder** per Link übergeben: `…/ECG-Viewer/?id=<DATEI-ID>&mapkey=<KEY>`
   (wird sofort aus der Adresszeile entfernt).

## Hinweise
- Der Key im Quelltext ist öffentlich sichtbar. Mit Referrer- und API-Beschränkung kann er nur Drive-Dateien lesen,
  die ohnehin per Link freigegeben sind; im schlimmsten Fall wird das Kontingent verbraucht.
- Die RR-Zeitausrichtung ist eine Rekonstruktion (kein `RrAligner` der App); RR-Werte selbst sind exakt.
