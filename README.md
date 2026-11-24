# ECG Viewer

Browser-Viewer für `.ecg`-Aufnahmen (EKG, ACC, Puls, RR mit Markern, Poincaré) mit Druckansicht.
Reines HTML/JS, kein Build, kein Server. Alle Daten bleiben im Browser.

## Dateien
- `index.html` – Viewer
- `print.html` – Druckansicht (muss im selben Ordner liegen)

## Auf GitHub Pages veröffentlichen
1. Repo anlegen, beide Dateien ins Hauptverzeichnis legen.
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

## Hinweise
- Der Key im Quelltext ist öffentlich sichtbar. Mit Referrer- und API-Beschränkung kann er nur Drive-Dateien lesen,
  die ohnehin per Link freigegeben sind; im schlimmsten Fall wird das Kontingent verbraucht.
- Die RR-Zeitausrichtung ist eine Rekonstruktion (kein `RrAligner` der App); RR-Werte selbst sind exakt.
