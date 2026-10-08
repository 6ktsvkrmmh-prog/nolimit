# ✳ No Limit

Ein Idle-Clicker für die Zeit, in der dein Claude-Limit aufgebraucht ist.
Du tippst ausgedachte KIs wie Halluzino, Overfit oder Ratelimitus weg,
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

- **Tippen statt Knopf:** Tippe direkt auf die KI. Jeder Schadenspunkt bringt Tokens, jeder Sieg zusätzlich Beute.
- **64 ausgedachte KIs mit eigenen Logos:** 32 Logo-Bauarten im Stil echter KI-Marken (Funkeln,
  Strahlenkranz, Knoten, Unendlichkeitsband, Orb, Blende, Sprechblase, Flamme, Schild, Planet …),
  jede KI mit eigener Farbnuance und Variation. Entdeckte KIs landen in der **Sammlung**.
- **Limit-Leiste als Lebensanzeige:** „5-Stunden-Limit · 37 % verbraucht · noch 3 Std. 9 Min.“.
  Das ist reine Optik, die Zeit steht für die HP.
- **Wellen:** 10 KIs pro Welle, jede etwas stärker als die vorige; die zehnte ist eine Ultra-Version.
- **Wochenboss:** Jeder Sieg füllt die Wochenleiste (5 Etappen mit Belohnungen). Bei 100 % erscheint
  „Das Wochenlimit“. Ein Sieg bringt dauerhaft +25 % Schaden.
- **Limit-Blase für deine Claude-Limits:** Schwarze Blase über dem KI-Namen, öffnet sich bei Hover (oder Antippen).
  Restzeit des 5-Stunden-Limits und Uhrzeit des Wochen-Resets per Ziehen einstellen, Tage wischen,
  Feinjustieren mit Mausrad oder Trackpad. Zugeklappt laufen beide Countdowns weiter; ist ein Limit
  zurück, meldet sich die Blase. Nach dem Wochen-Reset richtet sich auch die Boss-Woche im Spiel.
- **8 Helfer** mit je fünf eigenen Upgrades (z. B. „Pair-Debugging“, „Wasserkühlung“, „Kardaschow-Stufe II“),
  Geistesblitze, Kontext komprimieren (Prestige), 22 Erfolge, Tagesbonus
- **Offline-Fortschritt** bis zu 12 Stunden; eine zurückgestellte Systemuhr wird erkannt.
- Hell- und Dunkelmodus, automatisches Speichern, Export/Import des Spielstands

## Dateien

| Datei        | Inhalt                                    |
|--------------|-------------------------------------------|
| `index.html` | Seitenstruktur                            |
| `style.css`  | Design                                    |
| `logos.js`   | Generator für die KI-Logos                |
| `game.js`    | Spiellogik, Balancing (oben in der Datei) |
