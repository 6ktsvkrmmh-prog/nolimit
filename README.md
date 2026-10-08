# ✳ No Limit

Ein Idle-Clicker für die Zeit, in der dein Claude-Limit aufgebraucht ist.
Du kämpfst gegen KI-Gegner wie den Halluzinations-Bot oder den Rate-Limit-Golem,
sammelst Tokens, stellst Helfer ein und forderst jede Woche das Wochenlimit heraus.
So lange, bis dein echtes Limit wieder frei ist.

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

- **Kämpfen:** „Angreifen“ oder auf den Gegner tippen macht Schaden. Jeder Schadenspunkt bringt
  Tokens, jeder Sieg zusätzlich Beute.
- **Limit-Leiste als Lebensanzeige:** Jeder Gegner hat ein „5-Stunden-Limit“, das dein Schaden
  verbraucht („37 % verbraucht · noch 3 Std. 9 Min.“). Das ist reine Optik, die Zeit steht für die HP.
- **Wellen:** 10 Gegner pro Welle, der zehnte ist ein Anführer mit dreifachen HP.
  Jede Welle bringt +2 % Tokens.
- **Wochenboss:** Jeder Sieg füllt die Wochenleiste (5 Etappen mit Belohnungen). Bei 100 % erscheint
  „Das Wochenlimit“. Ein Sieg bringt dauerhaft +25 % Schaden.
- **8 Helfer** von der Gummiente bis zur Dyson-Sphäre, Kauf ×1 / ×10 / Max
- **Upgrades** für Helfer, Angriffe und den gesamten Schaden
- **💡 Geistesblitze** tauchen zufällig auf: Schaden ×7 oder ein Batzen Tokens
- **Kontext komprimieren** (Prestige): Neustart gegen dauerhafte Erkenntnisse (+10 % je Erkenntnis)
- **20 Erfolge** (je +1 % Schaden) und ein **Tagesbonus**
- **Deine Claude-Limits:** Trag die Uhrzeit deines 5-Stunden-Resets und Tag, Datum und Uhrzeit deines
  Wochenlimit-Resets ein. Beide zählen live herunter, und das Spiel meldet sich, wenn es so weit ist.
  Nach dem Wochenlimit richtet sich auch die Boss-Woche im Spiel (sonst Montag 0 Uhr).
- **Offline-Fortschritt** (bis zu 12 Stunden). Eine zurückgestellte Systemuhr wird erkannt und
  bringt keinen Offline-Fortschritt.
- Automatisches Speichern im Browser, Export/Import des Spielstands

## Dateien

| Datei        | Inhalt                                    |
|--------------|-------------------------------------------|
| `index.html` | Seitenstruktur                            |
| `style.css`  | Design                                    |
| `game.js`    | Spiellogik, Balancing (oben in der Datei) |
