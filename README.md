# ✳ No Limit

Ein Idle-Clicker für die Zeit, in der dein Claude-Limit aufgebraucht ist.
Du tippst ausgedachte KIs wie Halluzino, Overfit oder Ratelimitus weg,
sammelst Tokens, stellst Helfer ein, kämpfst alle 500 Level gegen das Wochenlimit
und komprimierst deinen Kontext für den nächsten, stärkeren Lauf.
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
- **Mechaniken zum Freischalten:** Im Upgrade-Tab kommen nacheinander kritische Treffer, die Krit-Kette,
  Flow-Serien und Bögen dazu. Freischaltungen machen nichts leichter, sie bringen neue Mechaniken und
  bleiben über Prestiges erhalten.
- **Schwachstelle & Krit-Kette:** Ein leuchtender Punkt sitzt auf jeder KI – wer ihn trifft, landet einen
  kritischen Treffer. Treffer in Folge bilden eine Krit-Kette mit +25 % Krit-Schaden pro Glied. Die ersten
  20 bis 30 Glieder sind entspannt (3,4 s Zeit, großer Punkt), danach schrumpft das Zeitfenster bis 0,8 s
  (ab Glied 75), der Punkt wird kleiner und wandert immer schneller. Ein Fehltipp lässt die Kette reißen. Dazu baut schnelles Tippen eine Combo bis ×2 auf.
- **Flow-Serien:** Ab und zu, oft mitten in der Krit-Kette, erscheinen 2 bis 5 nummerierte Kreise nacheinander im
  Takt (je länger die Kette, desto mehr), in wechselnden Mustern (Linie, Bogen, Zickzack, Vieleck, Treppe, freier Pfad) und Rhythmen (gleichmäßig,
  Doppeltakt, schneller werdend). Antippen, bevor sich ihr Ring schließt; genau beim Schließen gibt es „Perfekt“.
  Bögen: gedrückt halten und der Kugel entlang eines kleinen Schwungs folgen (zählen doppelt).
  Jeder Kreis ist ein Kettenglied, die Kette läuft während der Serie nicht ab, und die ganze Serie gibt einen
  Bonusschlag. Am Anfang gemütlich, mit wachsender Kette schneller. Verpassen kostet nichts.
- **Fähigkeiten wie bei Tap Titans:** Superschlag, Viraler Hype (Tokens ×N), Prompt-Sturm (Auto-Taps),
  Exploit-Modus (kritische Treffer), Hyperfokus (Tap-Schaden ×N) und Overclock (Helfer ×N). Freischalten
  ab einer Welle, mit Tokens bis Stufe 10 leveln, auslösen über die Kreise im Angriffsfeld oder die Tasten 1–6.
  Abklingzeiten von 1,5 bis 3 Minuten; Upgrades und Baum verkürzen sie höchstens auf die Hälfte.
- **94 ausgedachte KIs mit eigenen Logos:** 39 Logo-Bauarten im Stil echter KI-Marken, jede KI mit eigener
  Farbnuance. Manche haben Eigenschaften: gepanzert, flink, regenerierend, mit Ratenlimit („429“) oder sie forken sich.
- **Neue Generation:** 30 weitere KIs tauchen nach und nach ab Welle 3 auf, jede mit ihrer festen Fähigkeit:
  Schildphasen, Tarnung, falsche Schwachstellen, Teleport, Schrumpfen, Schweigepflicht (Fähigkeiten gesperrt),
  Aushärten, Token-Fresser, Glitches, Flucht nach 15 s oder Schwarm (zerfällt in zwei Kopien).
- **Dark Vortex:** Ganz selten (1 zu 400) erscheint eine KI als dunkle Vortex-Variante mit fünffacher Beute.
  Besiegte Varianten bekommen in der Sammlung eine Markierung und zeigen sich beim Drüberfahren oder Antippen.
- **Limit-Leiste als Lebensanzeige:** „5-Stunden-Limit · 37 % verbraucht · noch 3 Std. 9 Min.“ – reine Optik.
- **Wellen & Ultra-Launch:** 10 KIs pro Welle, jede etwas stärker; die zehnte ist eine Ultra-KI, die in
  30 Sekunden fallen muss – sonst geht es zurück zu KI 1 der Welle.
- **Das Wochenlimit alle 500 Level:** Am Ende jeder 50. Welle wartet statt der Ultra-KI ein harter Boss mit
  60 Sekunden Zeit, der mit jeder Stufe (II, III, …) stärker wird. Er feuert rote Angriffskreise mit
  schrumpfendem Ring. Abgewehrt kosten sie ihn 1 % Limit, verpasst gibt es einen Negativ-Effekt: Helfer
  pausiert, Taps gesperrt, Schwachstelle verdeckt, Combo weg, Tokens weg, Boss heilt sich oder längere
  Abklingzeiten. Verloren? Dann wird die Welle gefarmt, bis du ihn erneut herausforderst.
- **Prestige mit Fähigkeitenbaum:** Ab Welle 10 den Kontext komprimieren. Tokens, Helfer, Upgrades,
  Fähigkeiten-Stufen und Welle starten neu, dafür gibt es Erkenntnisse und eine neue Kontext-Version
  (jede dauerhaft +3 %). Der Baum hat 5 Äste (Rechenkraft, Automatisierung, Ökonomie, Präzision, Kontrolle)
  mit je 10 Fähigkeiten, insgesamt über 1.400 Stufen. Neue Reihen öffnen sich ab v2, v4, v8 … bis v200.
  Zurücksetzen ist kostenlos.
- **Helfer & Upgrades mit KI-Thema:** Prompt-Bibliothek, Feintuner, Vektor-Datenbank, Agenten-Schwarm,
  Tensor-Farm, Trainingscluster, Neuromorpher Chip, Singularität – je fünf Upgrades wie „Chain of Thought“,
  „LoRA-Adapter“ oder „Ereignishorizont“.
- **Ziele:** drei Aufträge mit Belohnung, die KI-Sammlung und 42 Erfolge.
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
