# ✳ No Limit

Ein kleines Idle-Game für die Zeit, in der dein Claude-Limit aufgebraucht ist.
Sammle Tokens, stell Gummienten und Praktikanten ein, bau Rechenzentren – bis
dein Limit wieder zurückgesetzt ist.

## Spielen

Kein Build, keine Abhängigkeiten: einfach `index.html` im Browser öffnen.

Oder lokal per Server:

```sh
python3 -m http.server 8000
# dann http://localhost:8000 öffnen
```

Online spielen über GitHub Pages: *Settings → Pages → Deploy from a branch*,
Branch und Ordner `/ (root)` auswählen.

## Features

- **Prompt senden** – klicken bringt Tokens
- **8 Generatoren** von der Gummiente bis zur Dyson-Sphäre, Kauf ×1 / ×10 / Max
- **Upgrades** für Generatoren, Klicks und die gesamte Produktion
- **💡 Geistesblitze** tauchen zufällig auf: Produktion ×7 oder ein Batzen Tokens
- **Kontext komprimieren** (Prestige): Neustart gegen dauerhafte Erkenntnisse (+10 % je Erkenntnis)
- **15 Erfolge**, jeder gibt +1 % Produktion
- **Limit-Timer**: Trag ein, wann dein Claude-Limit zurückgesetzt wird – das Spiel
  zählt runter und meldet sich (auch per Browser-Benachrichtigung), wenn es so weit ist
- **Offline-Fortschritt** (bis zu 12 Stunden), automatisches Speichern im Browser,
  Export/Import des Spielstands

## Dateien

| Datei        | Inhalt                                   |
|--------------|------------------------------------------|
| `index.html` | Seitenstruktur                           |
| `style.css`  | Design                                   |
| `game.js`    | Spiellogik, Balancing (oben in der Datei) |
