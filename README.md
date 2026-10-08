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
- **Schwachstelle & Krit-Kette:** Ein leuchtender Punkt sitzt auf jeder KI – wer ihn trifft, landet einen
  kritischen Treffer. Treffer in Folge bilden eine Krit-Kette: jedes Glied +25 % Krit-Schaden, aber das
  Zeitfenster schrumpft (2,6 s → 0,7 s), der Punkt wird kleiner und wandert immer schneller. Ein Fehltipp
  lässt die Kette reißen. Dazu baut schnelles Tippen eine Combo bis ×2 auf.
- **Fähigkeiten wie bei Tap Titans:** Superschlag, Viraler Hype (Tokens ×N), Prompt-Sturm (Auto-Taps),
  Exploit-Modus (kritische Treffer), Hyperfokus (Tap-Schaden ×N) und Overclock (Helfer ×N). Freischalten
  ab einer Welle, mit Tokens bis Stufe 10 leveln, auslösen über die Kreise im Angriffsfeld oder die Tasten 1–6.
- **64 ausgedachte KIs mit eigenen Logos:** 32 Logo-Bauarten im Stil echter KI-Marken, jede KI mit eigener
  Farbnuance. Manche haben Eigenschaften: gepanzert, flink, regenerierend, mit Ratenlimit („429“) oder sie forken sich.
- **Limit-Leiste als Lebensanzeige:** „5-Stunden-Limit · 37 % verbraucht · noch 3 Std. 9 Min.“ – reine Optik.
- **Wellen & Ultra-Launch:** 10 KIs pro Welle, jede etwas stärker; die zehnte ist eine Ultra-KI, die in
  30 Sekunden fallen muss – sonst geht es zurück zu KI 1 der Welle.
- **Wochenboss:** Jeder Sieg füllt die Wochenleiste. Bei 100 % erscheint „Das Wochenlimit“.
- **Helfer & Upgrades mit KI-Thema:** Prompt-Bibliothek, Feintuner, Vektor-Datenbank, Agenten-Schwarm,
  Tensor-Farm, Trainingscluster, Neuromorpher Chip, Singularität – je fünf Upgrades wie „Chain of Thought“,
  „LoRA-Adapter“ oder „Ereignishorizont“.
- **Ziele:** drei Aufträge mit Belohnung, die KI-Sammlung und 30 Erfolge.
- **Limit-Blase für deine Claude-Limits:** neben „No Limit“, öffnet sich bei Hover (oder Antippen).
  Restzeit des 5-Stunden-Limits und Uhrzeit des Wochen-Resets per Ziehen einstellen, Tage wischen,
  Feinjustieren mit Mausrad oder Trackpad. Beide Countdowns laufen live; ist ein Limit zurück, meldet sie sich.
- **Offline-Fortschritt** bis zu 12 Stunden; eine zurückgestellte Systemuhr wird erkannt.
- Hell- und Dunkelmodus, dezente Töne (abschaltbar), automatisches Speichern, Export/Import

## Dateien

| Datei        | Inhalt                                    |
|--------------|-------------------------------------------|
| `index.html` | Seitenstruktur                            |
| `style.css`  | Design                                    |
| `logos.js`   | Generator für die KI-Logos                |
| `game.js`    | Spiellogik, Balancing (oben in der Datei) |
