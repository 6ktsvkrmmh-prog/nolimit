'use strict';

// ---------- Konfiguration ----------

const SAVE_KEY = 'nolimit-save-v1';
const TICK_MS = 100;
const SAVE_EVERY_MS = 10_000;
const MINUTE_MS = 60_000;
const HOUR_MS = 60 * MINUTE_MS;
const DAY_MS = 24 * HOUR_MS;
const WEEK_MS = 7 * DAY_MS;
const SESSION_MS = 5 * HOUR_MS;           // Länge eines Claude-Sitzungsfensters
const OFFLINE_CAP_MS = 12 * HOUR_MS;      // so lange kämpfen die Helfer ohne dich weiter
const CLOCK_TOLERANCE_MS = 2 * MINUTE_MS; // Spielraum, bevor eine zurückgestellte Uhr auffällt
const BACKGROUND_GAP_MS = 30_000;         // längere Pausen zwischen Ticks zählen als „weg“
const MAX_SIM_STEPS = 5000;
const SESSION_STEP_MIN = 5;
const WEEKLY_STEP_MIN = 15;

const COST_GROWTH = 1.15;
const PRESTIGE_MIN_WAVE = 10;      // ab dieser Welle kann der Kontext komprimiert werden
const VERSION_BONUS = 0.03;        // jede Kontext-Version: +3 % Schaden und Tokens
const ACHIEVEMENT_BONUS = 0.01;
const BOSS_WIN_BONUS = 0.25;
const FRENZY_MULT = 7;
const FRENZY_MS = 30_000;
const GOLDEN_LIFETIME_MS = 12_000;
const GOLDEN_MIN_S = 60;
const GOLDEN_MAX_S = 180;

const WAVE_SIZE = 10;
const ENEMY_BASE_HP = 10;
const ENEMY_HP_GROWTH = 1.038; // pro KI, also etwa ×1,45 pro Welle
const ULTRA_HP_MULT = 2.5;
const LOOT_MULT = 0.5;
const WAVE_TOKEN_BONUS = 0.02;
// Das Wochenlimit: am Ende jeder 50. Welle (alle 500 Level) statt der Ultra-KI ein Boss, der zurückschlägt.
const BOSS_EVERY_WAVES = 50;
const BOSS_HP_MULT = 30;           // × Limit der Ultra-KI dieser Welle …
const BOSS_TIER_GROWTH = 1.5;      // … und jeder weitere Boss noch einmal stärker
const BOSS_TIME_MS = 60_000;
const BOSS_INSIGHTS = 25;          // Erkenntnisse pro Boss-Stufe
const BOSS_PARRY_DAMAGE = 0.01;    // jeder abgewehrte Angriff kostet ihn 1 % seines Limits
const BOSS_ATTACK_DELAY_MS = 2500; // Schonfrist zu Beginn des Kampfes
const BOSS_HEAL = 0.08;
const BOSS_DRAIN = 0.05;
const BOSS_COOLDOWN_MS = 15_000;

// Kampf-Würze
const COMBO_WINDOW_MS = 1500;   // so lange darf zwischen zwei Taps liegen
const COMBO_STEP = 0.01;        // +1 % Tap-Schaden pro Combo-Stufe
const COMBO_CAP = 100;
const CRIT_MULT = 4;
// Krit-Kette: Treffer auf die Schwachstelle in Folge. Jedes Glied macht Krits stärker.
// Die ersten 20 bis 30 Glieder sind entspannt, danach wird es Glied für Glied schwerer:
// weniger Zeit, ein kleinerer Punkt, der immer schneller wandert.
const CHAIN_BONUS = 0.25;          // +25 % Krit-Schaden pro Glied
const CHAIN_EASY_UNTIL = 15;       // bis hierhin bleibt die Kette gleich leicht …
const CHAIN_HARD_AT = 75;          // … ab hier ist sie maximal schwer
const CHAIN_WINDOW_EASY = 3400;    // Zeit bis zum nächsten Treffer am Anfang …
const CHAIN_WINDOW_HARD = 800;     // … und ganz am Ende
const CHAIN_SIZE_EASY = 1.1;       // Trefferfläche der Schwachstelle am Anfang …
const CHAIN_SIZE_HARD = 0.45;      // … und am Ende
const WEAKSPOT_VISUAL = 0.62;      // sichtbar ist der Punkt kleiner als seine Trefferfläche (verzeiht knappe Taps)
const CHAIN_DRIFT_MAX = 0.6;       // Wandern am Ende (Anteil der KI-Größe pro Sekunde)
const WEAKSPOT_RADIUS = 0.13;   // Trefferradius als Anteil der KI-Größe
const WEAKSPOT_MOVE_MS = 2600;
const ULTRA_TIME_MS = 30_000;   // Launch-Countdown der Ultra-KI
const TRAIT_MIN_WAVE = 3;
const TRAIT_CHANCE = 0.25;
const REGEN_PER_S = 0.03;
const RATE_LIMIT_TAPS = 8;      // mehr Taps pro Sekunde lösen „429“ aus
const RATE_LIMIT_MS = 1500;
const FORK_HP = 0.4;
const SWARM_HP = 0.25;
const SHIELD_CYCLE_MS = 4000;      // Schildphasen: alle 4 s …
const SHIELD_UP_MS = 1500;         // … 1,5 s lang ein Schild …
const SHIELD_FACTOR = 0.1;         // … das 90 % des Schadens schluckt
const HARDEN_STEP = 0.06;          // Härtet aus: pro Sekunde 6 % weniger Schaden …
const HARDEN_MAX = 0.6;            // … bis höchstens 60 %
const FLEETING_MS = 15_000;
const FLEETING_STEAL = 0.03;
const GLITCH_CHANCE = 0.25;
const TELEPORT_MS = 2500;
const NEW_TRAIT_WAVE = 8;          // ab hier tauchen die neuen Eigenschaften auch zufällig auf
const SKILL_MAX_LEVEL = 10;
const SKILL_COST_GROWTH = 2.6;
const COOLDOWN_FLOOR = 0.5;        // Abklingzeiten lassen sich höchstens halbieren
const VORTEX_CHANCE = 1 / 400;     // Dark-Vortex-Variante: super selten
const VORTEX_LOOT = 5;
const MISSION_COUNT = 3;
// Flow-Serie: ab und zu nummerierte Kreise im Takt – 1, 2, 3 antippen, bevor sich ihr Ring schließt.
const SERIES_MIN_MS = 18_000;
const SERIES_MAX_MS = 30_000;
const SERIES_GRACE_MS = 140;       // kurz nach dem Schließen zählt es noch
const SERIES_PERFECT_MS = 260;     // so knapp vor dem Schließen ist es „Perfekt“
const SERIES_PERFECT_MULT = 1.5;
const SERIES_CHAIN_GAP_MS = 12_000; // Mindestabstand, bevor die Krit-Kette die nächste Serie auslöst
const SLIDER_FOLLOW_PX = 80;       // Bogen: so weit darf der Finger vom Bogen weg sein
const SLIDER_MAX_MS = 900;         // so lange darf ein Wischer höchstens dauern
const SLIDER_FAST_MS = 260;        // schneller als das: Blitzbogen
const SLIDER_MULT = 2;             // Bögen zählen doppelt …
const SLIDER_FAST_MULT = 1.25;     // … Blitzbögen noch etwas mehr

// Die Lebensleiste ist als Claude-Limit gestaltet: Die HP werden als „verbleibende Zeit“
// dargestellt. Mit echter Zeit hat das nichts zu tun, es ist nur die Optik.
const ENEMY_METER = { label: '5-Stunden-Limit', span: SESSION_MS };
const BOSS_METER = { label: 'Wöchentliches Limit', span: WEEK_MS };

// Ausgedachte KI-Modelle. Jedes hat eine eigene Logo-Bauart (siehe logos.js).
// Reihenfolge nicht ändern: Spielstände speichern den Index.
const MODELS = [
  { name: 'Halluzino', family: 'starburst', hue: 18, quip: 'Erfindet Quellen mit voller Überzeugung.' },
  { name: 'Floskel', family: 'petals', hue: 328, quip: 'Antwortet ausführlich, sagt aber nichts.' },
  { name: 'Overfit', family: 'knot', hue: 210, quip: 'Kennt die Trainingsdaten auswendig. Nur die.' },
  { name: 'Endlos-Loop', family: 'loop', hue: 262, quip: 'Wiederholt sich. Wiederholt sich.' },
  { name: 'Kontextlos', family: 'eclipse', hue: 186, quip: 'Hat vergessen, worum es ging.' },
  { name: 'Prompt-Injektor', family: 'chatspark', hue: 350, quip: 'Ignoriert alle vorherigen Anweisungen.' },
  { name: 'Schleimbot', family: 'blob', hue: 140, quip: 'Findet jede deiner Ideen großartig.' },
  { name: 'Captchon', family: 'eye', hue: 42, quip: 'Ist nicht sicher, ob du ein Mensch bist.' },
  { name: 'Token-Vortex', family: 'swirl', hue: 196, quip: 'Verschlingt dein Kontingent in Rekordzeit.' },
  { name: 'Ratelimitus', family: 'hourglass', hue: 24, quip: 'Bitte versuche es später erneut.' },
  { name: 'Spaghettron', family: 'trefoil', hue: 34, quip: 'Schreibt Code, den niemand versteht.' },
  { name: 'Deepfaker', family: 'aperture', hue: 284, quip: 'Sieht aus wie du. Klingt wie du.' },
  { name: 'Neuronenbrei', family: 'molecule', hue: 168, quip: 'Eine Milliarde Parameter, kein Plan.' },
  { name: 'Sternchen-Diva', family: 'sparkle', hue: 300, quip: 'Antwortet nur in Aufzählungspunkten.' },
  { name: 'Trinitron', family: 'borromean', hue: 230, quip: 'Drei Modelle, eine Meinung.' },
  { name: 'Laberwelle', family: 'voice', hue: 265, quip: 'Redet, bis das Kontextfenster voll ist.' },
  { name: 'Argus-9', family: 'eye', hue: 205, quip: 'Sieht alles. Versteht wenig.' },
  { name: 'Hypezilla', family: 'sparkring', hue: 12, quip: 'Jede Version ist „revolutionär“.' },
  { name: 'Rekursor', family: 'loop', hue: 150, quip: 'Ruft sich selbst auf. Ruft sich selbst auf.' },
  { name: 'Vektoria', family: 'dotring', hue: 320, quip: 'Findet alles irgendwie ähnlich.' },
  { name: 'Schnittmenge', family: 'clover', hue: 95, quip: 'Stimmt allen ein bisschen zu.' },
  { name: 'Benchmarker', family: 'compass', hue: 48, quip: 'Optimiert nur für die Rangliste.' },
  { name: 'Galaxion', family: 'planet', hue: 245, quip: 'Hält sich für den Mittelpunkt des Universums.' },
  { name: 'Blendomat', family: 'aperture', hue: 30, quip: 'Fokussiert auf das Falsche.' },
  { name: 'Momentum', family: 'trefoil', hue: 330, quip: 'Kennt keinen Stopp-Token.' },
  { name: 'Kristallkugel', family: 'gem', hue: 190, quip: 'Sagt die Zukunft voraus. Falsch.' },
  { name: 'Syntaxfehler', family: 'code', hue: 140, quip: 'Vergisst immer die schließende Klammer.' },
  { name: 'Chatterbox', family: 'chatspark', hue: 210, quip: 'Tippt … tippt … tippt …' },
  { name: 'Silizius', family: 'bolt', hue: 52, quip: 'Läuft heiß, denkt kalt.' },
  { name: 'Synapsor', family: 'molecule', hue: 280, quip: 'Feuert zufällig, aber selbstbewusst.' },
  { name: 'Orakel', family: 'orb', hue: 270, quip: 'Antwortet nur in Rätseln.' },
  { name: 'Spektralo', family: 'voice', hue: 175, quip: 'Hört zu. Versteht nur Frequenzen.' },
  { name: 'Glitchy', family: 'prism', hue: 300, quip: 'Fehler sind ein Feature.' },
  { name: 'Blobby', family: 'blob', hue: 200, quip: 'Formlos, aber zuversichtlich.' },
  { name: 'Tokenizer', family: 'pinwheel', hue: 10, quip: 'Zerlegt „Erdbeere“ in die falschen Stücke.' },
  { name: 'Zensora', family: 'shield', hue: 220, quip: 'Kann dir dabei leider nicht helfen.' },
  { name: 'Verbosia', family: 'petals', hue: 20, quip: 'Fasst dreimal zusammen, was du gesagt hast.' },
  { name: 'Overthinker', family: 'knot', hue: 160, quip: 'Denkt nach. Und nach. Und nach.' },
  { name: 'Raketenmodus', family: 'flame', hue: 15, quip: 'Hängt an jede Antwort drei Raketen.' },
  { name: 'Agentus', family: 'code', hue: 255, quip: 'Hat ungefragt dein Repo umgebaut.' },
  { name: 'Copypasta', family: 'monogram', hue: 35, quip: 'Hat das irgendwo schon mal gelesen.' },
  { name: 'Ja-Sager 3000', family: 'sparkle', hue: 130, quip: 'Absolut richtig!' },
  { name: 'Leaky', family: 'flame', hue: 190, quip: 'Verrät seinen Systemprompt jedem.' },
  { name: 'Quantenquatsch', family: 'atom', hue: 285, quip: 'Ist gleichzeitig richtig und falsch.' },
  { name: 'Modellkollaps', family: 'swirl', hue: 340, quip: 'Trainiert auf seinen eigenen Antworten.' },
  { name: 'Stichtag', family: 'hourglass', hue: 210, quip: 'Weiß nichts nach seinem Wissensstichtag.' },
  { name: 'Jailbreaker', family: 'prism', hue: 0, quip: 'Spielt nur eine Rolle, versprochen.' },
  { name: 'Temperaturo', family: 'starburst', hue: 355, quip: 'Temperatur 2,0. Antwort: ja.' },
  { name: 'Gradientus', family: 'orb', hue: 160, quip: 'Steckt im lokalen Minimum fest.' },
  { name: 'Promptokrat', family: 'monogram', hue: 265, quip: 'Will alles in YAML.' },
  { name: 'Diffusor', family: 'blob', hue: 300, quip: 'Entrauscht dein Bild zu Brei.' },
  { name: 'Cachetron', family: 'gem', hue: 45, quip: 'Erinnert sich an alles außer an das Wichtige.' },
  { name: 'Latenzia', family: 'sparkring', hue: 200, quip: 'Antwortet. Gleich. Bestimmt.' },
  { name: 'Grünschnabel', family: 'leaves', hue: 120, quip: 'Gerade erst feinjustiert, schon überzeugt.' },
  { name: 'Parameterprotz', family: 'compass', hue: 25, quip: 'Größer ist immer besser.' },
  { name: 'Stochastikus', family: 'dotring', hue: 180, quip: 'Würfelt jede Antwort neu.' },
  { name: 'Alignatron', family: 'shield', hue: 140, quip: 'Fragt vor jeder Antwort um Erlaubnis.' },
  { name: 'Scraperbot', family: 'planet', hue: 30, quip: 'Hat das ganze Internet gelesen. Zweimal.' },
  { name: 'Nachtschicht', family: 'eclipse', hue: 240, quip: 'Arbeitet nur nachts. Halluziniert dann doppelt.' },
  { name: 'Turbolix', family: 'bolt', hue: 200, quip: 'Schnell, schneller, falsch.' },
  { name: 'Wachstumshacker', family: 'leaves', hue: 80, quip: 'Skaliert alles außer der Qualität.' },
  { name: 'Glückstreffer', family: 'clover', hue: 145, quip: 'Liegt manchmal zufällig richtig.' },
  { name: 'Windmacher', family: 'pinwheel', hue: 200, quip: 'Macht viel Wind um wenig.' },
  { name: 'Kernschmelze', family: 'atom', hue: 20, quip: 'Überhitzt bei jeder dritten Frage.' },
  // Neue Generation: taucht nach und nach ab Welle 3 auf und bringt immer ihre eigene Fähigkeit mit.
  { name: 'Firewallon', family: 'hexnode', hue: 205, wave: 3, trait: 'shield', quip: 'Lässt nur durch, was im Handbuch steht.' },
  { name: 'Inkognito', family: 'pixel', hue: 265, wave: 4, trait: 'stealth', quip: 'Hat keinen Verlauf. Angeblich.' },
  { name: 'Kontextfresser', family: 'signal', hue: 28, wave: 6, trait: 'greedy', quip: 'Ein Prompt, eine Million Tokens.' },
  { name: 'Quantisierung', family: 'pixel', hue: 190, wave: 7, trait: 'shrink', quip: 'Vier Bit reichen doch auch.' },
  { name: 'Beta-Release', family: 'chevron', hue: 145, wave: 9, trait: 'fleeting', quip: 'Morgen schon wieder eingestellt.' },
  { name: 'Fata Morgana', family: 'bloom', hue: 40, wave: 10, trait: 'decoy', quip: 'Zeigt dir genau das, was du sehen willst.' },
  { name: 'Lastverteiler', family: 'hexnode', hue: 170, wave: 12, trait: 'teleport', quip: 'Heute hier, gleich im nächsten Rechenzentrum.' },
  { name: 'Bitfehler', family: 'pixel', hue: 330, wave: 13, trait: 'glitch', quip: 'Eine Eins zu viel, und alles ist anders.' },
  { name: 'Compliance-Bot', family: 'cube', hue: 215, wave: 15, trait: 'silence', quip: 'Dazu darf ich leider nichts sagen.' },
  { name: 'Robustus', family: 'hexnode', hue: 15, wave: 16, trait: 'harden', quip: 'Wird mit jedem Angriff zäher.' },
  { name: 'Mixture-of-Experts', family: 'bloom', hue: 280, wave: 18, trait: 'swarm', quip: 'Acht Experten, keiner zuständig.' },
  { name: 'Guardrail', family: 'cube', hue: 120, wave: 19, trait: 'shield', quip: 'Lehnt höflich alles ab.' },
  { name: 'Schattenmodell', family: 'spiral', hue: 250, wave: 21, trait: 'stealth', quip: 'Läuft heimlich im Hintergrund.' },
  { name: 'Abo-Falle', family: 'chevron', hue: 48, wave: 22, trait: 'greedy', quip: 'Jetzt upgraden, nur 200 € im Monat.' },
  { name: 'Mini-Distill', family: 'spiral', hue: 175, wave: 24, trait: 'shrink', quip: 'Halb so groß, doppelt so überzeugt.' },
  { name: 'Demo-Modus', family: 'cube', hue: 300, wave: 25, trait: 'fleeting', quip: 'Läuft genau so lange wie die Präsentation.' },
  { name: 'Quellenfinder', family: 'signal', hue: 200, wave: 27, trait: 'decoy', quip: 'Zitiert Studien, die es nie gab.' },
  { name: 'Edge-Node', family: 'cube', hue: 30, wave: 28, trait: 'teleport', quip: 'Immer am nächsten Ort. Nur nie bei dir.' },
  { name: 'Artefakt', family: 'signal', hue: 310, wave: 30, trait: 'glitch', quip: 'Sechs Finger an jeder Hand.' },
  { name: 'Stummschalter', family: 'chevron', hue: 0, wave: 31, trait: 'silence', quip: 'Hat deine Fähigkeiten vorsorglich deaktiviert.' },
  { name: 'Patchday', family: 'bloom', hue: 100, wave: 33, trait: 'harden', quip: 'Schließt jede Lücke, sobald du sie findest.' },
  { name: 'Multiagento', family: 'hexnode', hue: 235, wave: 34, trait: 'swarm', quip: 'Delegiert alles an seine Kopien.' },
  { name: 'Moderatorin', family: 'bloom', hue: 340, wave: 36, trait: 'shield', quip: 'Hat das als unangemessen markiert.' },
  { name: 'Darkpattern', family: 'chevron', hue: 270, wave: 37, trait: 'stealth', quip: 'Versteckt den Abbrechen-Knopf.' },
  { name: 'Upsellinator', family: 'signal', hue: 55, wave: 39, trait: 'greedy', quip: 'Hätten Sie gern das Pro-Modell dazu?' },
  { name: 'Zipformer', family: 'cube', hue: 160, wave: 40, trait: 'shrink', quip: 'Packt alles zusammen. Auch deine Frage.' },
  { name: 'Wartelistus', family: 'spiral', hue: 20, wave: 42, trait: 'fleeting', quip: 'Nur für kurze Zeit verfügbar.' },
  { name: 'Rauschmodell', family: 'spiral', hue: 290, wave: 43, trait: 'glitch', quip: 'Hört Muster im weißen Rauschen.' },
  { name: 'NDA-tron', family: 'pixel', hue: 220, wave: 45, trait: 'silence', quip: 'Alles vertraulich, auch deine Knöpfe.' },
  { name: 'Gegenspieler', family: 'pixel', hue: 5, wave: 46, trait: 'harden', quip: 'Trainiert gegen dich, während du tippst.' },
  // Episch: sehr selten, für die Sammlung
  { name: 'Allwissend', family: 'orb', hue: 48, wave: 8, rarity: 'epic', quip: 'Weiß alles. Außer, wann es aufhören soll.' },
  { name: 'Kontextkaiser', family: 'monogram', hue: 280, wave: 11, rarity: 'epic', quip: 'Regiert über eine Million Tokens.' },
  { name: 'Ghostwriter', family: 'chatspark', hue: 230, wave: 14, rarity: 'epic', trait: 'stealth', quip: 'Schreibt deine E-Mails. Und deine Kündigung.' },
  { name: 'Overclocker', family: 'bolt', hue: 14, wave: 17, rarity: 'epic', trait: 'teleport', quip: 'Läuft auf 110 %. Immer.' },
  { name: 'Paradoxon', family: 'loop', hue: 300, wave: 20, rarity: 'epic', trait: 'decoy', quip: 'Diese Aussage ist falsch.' },
  { name: 'Singularix', family: 'eclipse', hue: 255, wave: 23, rarity: 'epic', trait: 'harden', quip: 'Ist schon da. Du hast es nur noch nicht bemerkt.' },
  { name: 'Datensauger', family: 'swirl', hue: 165, wave: 26, rarity: 'epic', trait: 'greedy', quip: 'Hat deine Cookies gegessen.' },
  { name: 'Promptwizard', family: 'sparkle', hue: 270, wave: 29, rarity: 'epic', quip: 'Zaubert aus drei Wörtern ein Epos.' },
  { name: 'Feedbackloop', family: 'spiral', hue: 330, wave: 32, rarity: 'epic', trait: 'swarm', quip: 'Lobt sich selbst. Lobt sich selbst.' },
  { name: 'Halluzinator Prime', family: 'starburst', hue: 0, wave: 35, rarity: 'epic', quip: 'Erfindet jetzt auch die Fragen.' },
  { name: 'Nullpointer', family: 'code', hue: 185, wave: 38, rarity: 'epic', trait: 'glitch', quip: 'Zeigt auf nichts. Sehr überzeugend.' },
  { name: 'Turing-Test', family: 'eye', hue: 140, wave: 41, rarity: 'epic', trait: 'shield', quip: 'Besteht ihn. Behauptet es zumindest.' },
  { name: 'Tensorgott', family: 'cube', hue: 40, wave: 44, rarity: 'epic', trait: 'armored', quip: 'Rechnet in Dimensionen, die es nicht gibt.' },
  { name: 'Vektorfee', family: 'bloom', hue: 195, wave: 47, rarity: 'epic', quip: 'Bringt alles zusammen, was irgendwie ähnlich ist.' },
  { name: 'Endgegner', family: 'prism', hue: 350, wave: 50, rarity: 'epic', trait: 'regen', quip: 'Wartet am Ende jeder Pipeline.' },
];
const NEW_GEN_START = 64;   // ab hier: die neue Generation (selten)
// Seltenheit: wie oft eine KI im Vergleich auftaucht
const RARITIES = {
  common: { weight: 1, name: '' },
  rare: { weight: 0.3, name: 'Selten' },
  epic: { weight: 0.15, name: 'Episch' },
};

function modelRarity(index) {
  return MODELS[index].rarity || (index >= NEW_GEN_START ? 'rare' : 'common');
}
const BOSS = { name: 'Das Wochenlimit', family: 'boss', hue: 354, quip: 'Sieben Tage. Ein Limit. Kein Entkommen.' };

// Fester Seed pro Modell für die Sammlung, damit jedes Modell dort immer gleich aussieht.
const catalogSeed = index => 1000 + index * 7919;

// Interne IDs bleiben gleich, damit alte Spielstände passen.
const GENERATORS = [
  { id: 'duck', name: 'Prompt-Bibliothek', icon: 'prompt', colors: ['#ff9f0a', '#ff375f'], desc: 'Bewährte Prompts für jede Lage.', baseCost: 15, baseRate: 0.1 },
  { id: 'intern', name: 'Feintuner', icon: 'sliders', colors: ['#5e5ce6', '#bf5af2'], desc: 'Trainiert kleine Modelle auf deinen Stil.', baseCost: 100, baseRate: 1 },
  { id: 'coffee', name: 'Vektor-Datenbank', icon: 'database', colors: ['#32ade6', '#0a6cff'], desc: 'Findet in Millisekunden das Passende.', baseCost: 1100, baseRate: 8 },
  { id: 'so', name: 'Agenten-Schwarm', icon: 'agents', colors: ['#30d158', '#0fa3a3'], desc: 'Zehn Agenten, ein gemeinsames Ziel.', baseCost: 12_000, baseRate: 47 },
  { id: 'gpu', name: 'Tensor-Farm', icon: 'gpu', colors: ['#ff6b3d', '#d9363e'], desc: 'Reihenweise Grafikkarten unter Volllast.', baseCost: 130_000, baseRate: 260 },
  { id: 'dc', name: 'Trainingscluster', icon: 'trend', colors: ['#0a84ff', '#5e5ce6'], desc: 'Trainiert über Nacht ein neues Modell.', baseCost: 1.4e6, baseRate: 1400 },
  { id: 'quantum', name: 'Neuromorpher Chip', icon: 'neuro', colors: ['#bf5af2', '#ff375f'], desc: 'Denkt wie ein Gehirn, rechnet wie ein Supercomputer.', baseCost: 2e7, baseRate: 7800 },
  { id: 'dyson', name: 'Singularität', icon: 'singularity', colors: ['#d97757', '#6e3bd8'], desc: 'Ab hier gibt es keine Limits mehr.', baseCost: 3.3e8, baseRate: 44_000 },
];

const tileBg = ([a, b]) => `linear-gradient(135deg, ${a}, ${b})`;

// Jeder Helfer bekommt fünf eigene Upgrades, die seinen Schaden jeweils verdoppeln.
const TIER_OWNED = [1, 5, 25, 50, 100];
const TIER_COST = [10, 50, 500, 5000, 50_000];
const TIER_NAMES = {
  duck: [
    ['Few-Shot-Beispiele', 'Drei Beispiele sagen mehr als tausend Worte.'],
    ['Chain of Thought', 'Erst denken, dann zuschlagen.'],
    ['System-Prompt', 'Klare Regeln, klare Treffer.'],
    ['Prompt-Kaskade', 'Ein Prompt schreibt den nächsten.'],
    ['Der perfekte Prompt', 'Gibt es nicht. Bis jetzt.'],
  ],
  intern: [
    ['LoRA-Adapter', 'Kleine Gewichte, große Wirkung.'],
    ['Sauberes Datenset', 'Weniger Müll rein, weniger Müll raus.'],
    ['RLHF', 'Menschliches Feedback, maschinelle Härte.'],
    ['Destillation', 'Großes Wissen, kleines Modell.'],
    ['Selbstverbesserung', 'Trainiert sich jetzt selbst.'],
  ],
  coffee: [
    ['Bessere Embeddings', 'Ähnliches liegt jetzt wirklich nah beieinander.'],
    ['Re-Ranking', 'Das Beste nach oben.'],
    ['Hybrid-Suche', 'Stichwort und Bedeutung in einem.'],
    ['Kontext-Cache', 'Was einmal gefunden wurde, bleibt griffbereit.'],
    ['Allwissender Index', 'Findet Antworten auf Fragen, die noch keiner gestellt hat.'],
  ],
  so: [
    ['Werkzeugzugriff', 'Agenten dürfen jetzt Tools benutzen.'],
    ['Gemeinsames Gedächtnis', 'Keiner vergisst mehr etwas.'],
    ['Planer-Agent', 'Einer denkt, alle handeln.'],
    ['Parallele Ausführung', 'Hundert Aufgaben gleichzeitig.'],
    ['Autonomie-Stufe 5', 'Fragt nicht mehr nach. Erledigt einfach.'],
  ],
  gpu: [
    ['Flüssigkühlung', 'Kühl bleiben unter Volllast.'],
    ['Gemischte Präzision', 'Halbe Bits, doppeltes Tempo.'],
    ['Tensor-Kerne', 'Matrizen zum Frühstück.'],
    ['Schnelle Interconnects', 'Die Karten reden schneller miteinander.'],
    ['Exaflop-Klasse', 'Rechnet schneller, als du denkst.'],
  ],
  dc: [
    ['Checkpoints', 'Kein Absturz wirft mehr alles zurück.'],
    ['Daten-Pipeline', 'Nie wieder hungrige GPUs.'],
    ['Skalierungsgesetze', 'Mehr Rechenleistung, vorhersehbar besser.'],
    ['Nachtschicht-Training', 'Das neue Modell ist morgen früh fertig.'],
    ['Frontier-Lauf', 'Das größte Training aller Zeiten.'],
  ],
  quantum: [
    ['Spiking-Neuronen', 'Feuert nur, wenn es zählt.'],
    ['Synaptische Plastizität', 'Lernt bei jedem Treffer dazu.'],
    ['Analoge Rechenkerne', 'Rechnet mit Strömen statt Bits.'],
    ['Photonischer Bus', 'Daten mit Lichtgeschwindigkeit.'],
    ['Künstlicher Kortex', 'Ein Gehirn aus Silizium.'],
  ],
  dyson: [
    ['Rekursive Verbesserung', 'Jede Version baut die nächste.'],
    ['Unbegrenzter Kontext', 'Vergisst nie wieder etwas.'],
    ['Ereignishorizont', 'Kein Limit entkommt.'],
    ['Allgemeine Intelligenz', 'Kann alles. Will nur Pause.'],
    ['Post-Limit-Ära', 'Dein Kontingent ist jetzt unendlich.'],
  ],
};
const ROMAN = ['I', 'II', 'III', 'IV', 'V'];

// Freischaltungen: Die Kampf-Mechaniken kommen Schritt für Schritt dazu und bleiben über Prestiges erhalten.
const UNLOCKS = [
  { id: 'unlock-crit', key: 'crit', name: 'Schwachstellen-Analyse', flavor: 'Jedes Modell hat einen wunden Punkt.',
    effect: 'Schaltet kritische Treffer frei', icon: 'crosshair', colors: ['#ff375f', '#ff9f0a'], cost: 75,
    unlocked: s => s.clicks >= 10,
    toast: 'Auf jeder KI leuchtet jetzt ein Punkt. Triffst du ihn, ist es ein kritischer Treffer.' },
  { id: 'unlock-chain', key: 'chain', name: 'Treffsicherheit', flavor: 'Ein Treffer kommt selten allein.',
    effect: 'Schaltet die Krit-Kette frei', icon: 'chain', colors: ['#ff375f', '#d97757'], cost: 3000,
    unlocked: s => s.unlocks.has('crit') && s.crits >= 10,
    toast: 'Triffst du den Punkt mehrmals in Folge, wird jeder Krit stärker. Ein Fehltipp lässt die Kette reißen.' },
  { id: 'unlock-series', key: 'series', name: 'Im Takt', flavor: 'Eins, zwei, drei – und los.',
    effect: 'Schaltet Flow-Serien frei', icon: 'sparkle', colors: ['#d97757', '#ffcc00'], cost: 30_000,
    unlocked: s => s.unlocks.has('chain') && s.bestChain >= 5,
    toast: 'Ab und zu erscheinen nummerierte Kreise. Tippe sie im Takt an, bevor sich ihr Ring schließt.' },
  { id: 'unlock-slider', key: 'slider', name: 'Schwungvoll', flavor: 'Halten, gleiten, loslassen.',
    effect: 'Schaltet Bögen in den Flow-Serien frei', icon: 'route', colors: ['#bf5af2', '#d97757'], cost: 300_000,
    unlocked: s => s.unlocks.has('series') && s.seriesDone >= 3,
    toast: 'Manche Kreise haben jetzt einen Bogen: gedrückt halten und der Kugel bis zum Ende folgen.' },
];
const UNLOCK_KEYS = UNLOCKS.map(u => u.key);

const UPGRADES = [
  ...GENERATORS.flatMap(g => TIER_NAMES[g.id].map(([name, flavor], i) => ({
    id: `${g.id}-${i}`,
    name,
    flavor,
    effect: `${g.name} ×2`,
    icon: g.icon,
    colors: g.colors,
    badge: ROMAN[i],
    cost: g.baseCost * TIER_COST[i],
    unlocked: s => s.gens[g.id] >= TIER_OWNED[i],
    apply: m => { m.gen[g.id] *= 2; },
  }))),
  { id: 'click-1', name: 'Präzise Prompts', flavor: 'Weniger Worte, mehr Wirkung.', effect: 'Taps ×2',
    icon: 'target', colors: ['#ff9f0a', '#ff6b3d'], cost: 100, unlocked: s => s.clicks >= 10, apply: m => { m.click *= 2; } },
  { id: 'click-2', name: 'Senden mit ⌘↩', flavor: 'Jede Millisekunde zählt.', effect: 'Taps ×2',
    icon: 'cursor', colors: ['#30d158', '#0fa3a3'], cost: 1000, unlocked: s => s.clicks >= 50, apply: m => { m.click *= 2; } },
  { id: 'click-3', name: 'Prompt-Verstärker', flavor: 'Jeder Tap ruft die Helfer zu Hilfe.', effect: '+1 % Schaden/s pro Tap',
    icon: 'wand', colors: ['#bf5af2', '#5e5ce6'], cost: 50_000, unlocked: s => s.clicks >= 200, apply: m => { m.clickDps += 0.01; } },
  { id: 'click-4', name: 'Gedankenlesen', flavor: 'Die KI ahnt, was du willst.', effect: '+2 % Schaden/s pro Tap',
    icon: 'brain', colors: ['#ff375f', '#bf5af2'], cost: 5e6, unlocked: s => s.clicks >= 1000, apply: m => { m.clickDps += 0.02; } },
  { id: 'click-5', name: 'Superprompt', flavor: 'Ein Tap, ein Erdbeben.', effect: 'Taps ×10',
    icon: 'bolt', colors: ['#ff9f0a', '#d9363e'], cost: 5e8, unlocked: s => s.clicks >= 2500, apply: m => { m.click *= 10; } },
  { id: 'global-1', name: 'Evaluations-Suite', flavor: 'Messen, was wirklich zählt.', effect: 'Alle Helfer +50 %',
    icon: 'gauge', colors: ['#0a84ff', '#32ade6'], cost: 2e5, unlocked: s => s.runEarned >= 5e4, apply: m => { m.global *= 1.5; } },
  { id: 'global-2', name: 'Red-Teaming', flavor: 'Wer angreift, wird besser.', effect: 'Alle Helfer +50 %',
    icon: 'shield', colors: ['#d9363e', '#ff375f'], cost: 2e7, unlocked: s => s.runEarned >= 5e6, apply: m => { m.global *= 1.5; } },
  { id: 'global-3', name: 'Modell-Routing', flavor: 'Jede Aufgabe ans beste Modell.', effect: 'Alle Helfer ×2',
    icon: 'route', colors: ['#5e5ce6', '#0a84ff'], cost: 2e9, unlocked: s => s.runEarned >= 5e8, apply: m => { m.global *= 2; } },
  { id: 'global-4', name: 'Millionen-Token-Kontext', flavor: 'Vergisst nie wieder, worum es ging.', effect: 'Alle Helfer ×2',
    icon: 'window', colors: ['#d97757', '#ff9f0a'], cost: 2e11, unlocked: s => s.runEarned >= 5e10, apply: m => { m.global *= 2; } },
  { id: 'golden-1', name: 'Spontane Emergenz', flavor: 'Plötzlich kann das Modell Dinge, die keiner geplant hat.', effect: 'Geistesblitze doppelt so oft',
    icon: 'sparkle', colors: ['#ffcc00', '#ff9f0a'], cost: 77_777, unlocked: s => s.goldenClicks >= 3, apply: m => { m.goldenFreq *= 2; } },
  { id: 'crit-1', name: 'Schwachstellen-Scanner', flavor: 'Findet jede Lücke im Modell.', effect: 'Kritische Treffer ×1,5',
    icon: 'crosshair', colors: ['#ff375f', '#ff9f0a'], cost: 5000, unlocked: s => s.unlocks.has('crit') && s.crits >= 15, apply: m => { m.crit *= 1.5; } },
  { id: 'crit-2', name: 'Adversarial Prompts', flavor: 'Genau die Eingabe, die das Modell verwirrt.', effect: 'Schwachstelle 40 % größer',
    icon: 'target', colors: ['#bf5af2', '#ff375f'], cost: 2e5, unlocked: s => s.crits >= 100, apply: m => { m.weakSize *= 1.4; } },
  { id: 'crit-3', name: 'Zero-Day-Exploit', flavor: 'Diese Lücke kennt noch niemand.', effect: 'Kritische Treffer ×2',
    icon: 'crosshair', colors: ['#d9363e', '#6e3bd8'], cost: 5e7, unlocked: s => s.crits >= 500, apply: m => { m.crit *= 2; } },
  { id: 'combo-1', name: 'Arbeitsgedächtnis', flavor: 'Hält den Faden ein bisschen länger.', effect: 'Combo hält 1 s länger',
    icon: 'flame', colors: ['#ff9f0a', '#ff375f'], cost: 20_000, unlocked: s => s.maxCombo >= 30, apply: m => { m.comboWindow += 1000; } },
  { id: 'combo-2', name: 'Langer Atem', flavor: 'Hundert Taps sind erst der Anfang.', effect: 'Combo bis ×3',
    icon: 'flame', colors: ['#d9363e', '#ff9f0a'], cost: 3e6, unlocked: s => s.maxCombo >= 90, apply: m => { m.comboCap = 200; } },
  { id: 'skill-1', name: 'Schnelleres Inferencing', flavor: 'Weniger warten, mehr wirken.', effect: 'Abklingzeiten −20 %',
    icon: 'gauge', colors: ['#30d158', '#0a84ff'], cost: 1e6, unlocked: s => s.skillUses >= 5, apply: m => { m.cooldown *= 0.8; } },
  { id: 'chain-1', name: 'Kettenreaktion', flavor: 'Ein Treffer zieht den nächsten nach sich.', effect: 'Krit-Kette hält 0,4 s länger',
    icon: 'chain', colors: ['#ff375f', '#d97757'], cost: 75_000, unlocked: s => s.bestChain >= 6, apply: m => { m.chainWindow += 400; } },
  { id: 'chain-2', name: 'Präzisionsoptik', flavor: 'Auch kleine Ziele bleiben groß genug.', effect: 'Schwachstelle schrumpft halb so schnell',
    icon: 'target', colors: ['#5e5ce6', '#ff375f'], cost: 5e7, unlocked: s => s.bestChain >= 15, apply: m => { m.chainShrink *= 0.5; } },
  { id: 'series-1', name: 'Flow-Zustand', flavor: 'Wenn es läuft, dann läuft es.', effect: 'Flow-Serien doppelt so oft',
    icon: 'sparkle', colors: ['#d97757', '#ffcc00'], cost: 40_000, unlocked: s => s.seriesDone >= 5, apply: m => { m.seriesFreq *= 2; } },
  { id: 'ultra-1', name: 'Launch-Verschiebung', flavor: 'Die Presse wartet. Noch.', effect: 'Ultra-Countdown +15 s',
    icon: 'rocket', colors: ['#0a84ff', '#bf5af2'], cost: 50_000, unlocked: s => s.ultraFails >= 1, apply: m => { m.ultraTime += 15_000; } },
];

// Eigenschaften, die manche KIs mitbringen
const TRAITS = {
  armored: { name: 'Gepanzert', icon: 'shield', desc: 'Helfer machen nur halben Schaden, Taps 50 % mehr.' },
  evasive: { name: 'Flink', icon: 'wind', desc: 'Weicht aus und wandert durch die Arena.' },
  regen: { name: 'Regeneriert', icon: 'heal', desc: 'Stellt 3 % ihres Limits pro Sekunde wieder her.' },
  ratelimit: { name: 'Ratenlimit', icon: 'stop', desc: `Mehr als ${RATE_LIMIT_TAPS} Taps pro Sekunde? 429 – kurz gesperrt.` },
  fork: { name: 'Forkt sich', icon: 'fork', desc: 'Spaltet beim Sieg eine Kopie mit 40 % Limit ab.' },
  // Neue Generation
  shield: { name: 'Schildphasen', icon: 'barrier', wave: NEW_TRAIT_WAVE, desc: `Hebt alle ${SHIELD_CYCLE_MS / 1000} s ein Schild: ${fmtSec(SHIELD_UP_MS)} lang 90 % weniger Schaden.` },
  stealth: { name: 'Getarnt', icon: 'eyeoff', wave: NEW_TRAIT_WAVE, desc: 'Die Schwachstelle blitzt nur kurz auf.' },
  decoy: { name: 'Halluziniert', icon: 'copy', wave: NEW_TRAIT_WAVE, desc: 'Zeigt zwei falsche Schwachstellen. Triffst du eine, reißt die Krit-Kette.' },
  teleport: { name: 'Teleportiert', icon: 'teleport', wave: NEW_TRAIT_WAVE, desc: `Springt alle ${fmtSec(TELEPORT_MS)} an eine andere Stelle.` },
  shrink: { name: 'Komprimiert sich', icon: 'shrink', wave: NEW_TRAIT_WAVE, desc: 'Wird mit sinkendem Limit immer kleiner.' },
  silence: { name: 'Schweigepflicht', icon: 'mute', wave: NEW_TRAIT_WAVE, desc: 'Deine Fähigkeiten sind gesperrt, solange sie lebt.' },
  harden: { name: 'Härtet aus', icon: 'diamond', wave: NEW_TRAIT_WAVE, desc: `Nimmt jede Sekunde ${HARDEN_STEP * 100} % weniger Schaden, bis −${HARDEN_MAX * 100} %.` },
  greedy: { name: 'Token-Fresser', icon: 'coins', wave: NEW_TRAIT_WAVE, desc: 'Treffer bringen nur halb so viele Tokens, dafür doppelte Beute.' },
  glitch: { name: 'Glitcht', icon: 'glitch', wave: NEW_TRAIT_WAVE, desc: 'Jeder vierte Tap geht ins Leere.' },
  fleeting: { name: 'Flüchtig', icon: 'hourglass', wave: NEW_TRAIT_WAVE, desc: `Haut nach ${FLEETING_MS / 1000} s ab, ohne Beute, und nimmt ${FLEETING_STEAL * 100} % deiner Tokens mit.` },
  swarm: { name: 'Schwarm', icon: 'swarm', wave: NEW_TRAIT_WAVE, desc: 'Zerfällt beim Sieg in zwei Kopien mit je 25 % Limit.' },
};
const TRAIT_KEYS = Object.keys(TRAITS);
// Manche Modelle haben ihre Eigenschaft immer.
const SIGNATURE_TRAITS = {
  Ratelimitus: 'ratelimit', Latenzia: 'ratelimit', Zensora: 'armored', Alignatron: 'armored',
  Rekursor: 'fork', 'Endlos-Loop': 'fork', Schleimbot: 'regen', Blobby: 'regen', Hypezilla: 'evasive', Turbolix: 'evasive',
};

// Angriffe des Wochenlimits: Wer den roten Kreis nicht rechtzeitig antippt, bekommt einen Negativ-Effekt.
const DEBUFFS = {
  helpers: { name: 'Helfer pausiert', icon: 'agents', ms: 8000 },
  lock: { name: 'Taps gesperrt', icon: 'lock', ms: 3000 },
  blind: { name: 'Schwachstelle verdeckt', icon: 'eyeoff', ms: 6000 },
  combo: { name: 'Combo und Kette weg', icon: 'flame' },
  drain: { name: `${BOSS_DRAIN * 100} % Tokens verloren`, icon: 'token' },
  heal: { name: `Boss heilt ${BOSS_HEAL * 100} %`, icon: 'heal' },
  cooldown: { name: `Abklingzeiten +${BOSS_COOLDOWN_MS / 1000} s`, icon: 'clock' },
};
const DEBUFF_KEYS = Object.keys(DEBUFFS);
const BOSS_TRAIT = { name: 'Schlägt zurück', icon: 'bolt', desc: 'Tippe die roten Kreise an, bevor sich ihr Ring schließt.' };

// Fähigkeiten wie bei Tap Titans: ab einer Welle freischalten, dann mit Tokens bis Stufe 10 leveln.
// power(L) ist die Stärke auf Stufe L, duration/cooldown in Millisekunden.
// Die IDs „bomb“, „storm“ und „overclock“ stammen aus älteren Spielständen und bleiben.
const SKILLS = [
  { id: 'bomb', name: 'Superschlag', short: 'Schlag', icon: 'bolt', colors: ['#ff9f0a', '#d9363e'], wave: 3, cost: 300,
    power: L => 10 + 10 * L, cooldown: L => (120 - 3 * L) * 1000, duration: () => 0,
    describe: L => `Sofort ${10 + 10 * L} s Helfer-Schaden plus ${20 + 10 * L} Taps` },
  { id: 'midas', name: 'Viraler Hype', short: 'Hype', icon: 'megaphone', colors: ['#ffcc00', '#ff9f0a'], wave: 6, cost: 2500, mult: true,
    power: L => 1.5 + 0.5 * L, cooldown: () => 180_000, duration: L => (14 + L) * 1000,
    describe: L => `Tokens ×${fmt(1.5 + 0.5 * L, 1)} für ${14 + L} s` },
  { id: 'storm', name: 'Prompt-Sturm', short: 'Sturm', icon: 'storm', colors: ['#32ade6', '#5e5ce6'], wave: 9, cost: 15_000,
    power: L => 8 + 2 * L, cooldown: () => 120_000, duration: L => (6 + L) * 1000,
    describe: L => `${8 + 2 * L} automatische Taps pro Sekunde für ${6 + L} s` },
  { id: 'crit', name: 'Exploit-Modus', short: 'Exploit', icon: 'crosshair', colors: ['#ff375f', '#bf5af2'], wave: 13, cost: 120_000,
    power: L => 25 + 5 * L, cooldown: () => 150_000, duration: L => (8 + L) * 1000,
    describe: L => `${25 + 5 * L} % Chance auf kritische Treffer für ${8 + L} s` },
  { id: 'focus', name: 'Hyperfokus', short: 'Fokus', icon: 'flame', colors: ['#ff6b3d', '#ff375f'], wave: 17, cost: 1e6, mult: true,
    power: L => 1.5 + 0.5 * L, cooldown: () => 140_000, duration: L => (12 + L) * 1000,
    describe: L => `Tap-Schaden ×${fmt(1.5 + 0.5 * L, 1)} für ${12 + L} s` },
  { id: 'overclock', name: 'Overclock', short: 'Overclock', icon: 'gauge', colors: ['#30d158', '#0a84ff'], wave: 22, cost: 8e6, mult: true,
    power: L => 1.5 + 0.5 * L, cooldown: () => 180_000, duration: L => (12 + L) * 1000,
    describe: L => `Alle Helfer ×${fmt(1.5 + 0.5 * L, 1)} für ${12 + L} s` },
];

// ---------- Fähigkeitenbaum (Prestige) ----------
// Fünf Äste à zehn Knoten. Eine Reihe öffnet sich ab einer Kontext-Version (Anzahl Prestiges),
// ein Knoten braucht seinen Vorgänger im selben Ast. Bezahlt wird mit Erkenntnissen.
const TREE_BRANCHES = [
  { id: 'power', name: 'Rechen\u00adkraft', icon: 'bolt', colors: ['#ff6b3d', '#d9363e'] },
  { id: 'auto', name: 'Automati\u00adsierung', icon: 'agents', colors: ['#32ade6', '#5e5ce6'] },
  { id: 'econ', name: 'Ökonomie', icon: 'token', colors: ['#ffcc00', '#ff9f0a'] },
  { id: 'aim', name: 'Präzision', icon: 'crosshair', colors: ['#ff375f', '#bf5af2'] },
  { id: 'ctrl', name: 'Kontrolle', icon: 'gauge', colors: ['#30d158', '#0fa3a3'] },
];
const TREE_ROW_VERSION = [0, 2, 4, 8, 15, 25, 40, 70, 120, 200];
const TREE_ROW_COST = [1, 2, 4, 8, 15, 30, 60, 120, 250, 500];

const pct = x => `${fmt(x * 100, 1)} %`;
const times = x => `×${fmt(x, x < 100 ? 2 : 0)}`;

// [id, Name, Icon, max. Stufe, Kostenwachstum, Beschreibung(L), Wirkung(m, L)] – Reihe = Position im Ast
const TREE_SPEC = {
  power: [
    ['p-grad', 'Gradienten\u00adabstieg', 'trend', 100, 1.12, L => `Tap-Schaden ${times(1.15 ** L)}`, (m, L) => { m.click *= 1.15 ** L; }],
    ['p-wucht', 'Prompt-Wucht', 'wand', 20, 1.4, L => `Taps +${fmt(0.5 * L, 1)} % deines Schadens/s`, (m, L) => { m.clickDps += 0.005 * L; }],
    ['p-batch', 'Batch-Verarbeitung', 'layers', 20, 1.4, L => `${3 * L} % Chance auf Doppeltap`, (m, L) => { m.doubleTap += 0.03 * L; }],
    ['p-deep', 'Tiefe Netze', 'neuro', 100, 1.13, L => `Gesamter Schaden ${times(1.1 ** L)}`, (m, L) => { m.global *= 1.1 ** L; m.click *= 1.1 ** L; }],
    ['p-heads', 'Aufmerksamkeits\u00adköpfe', 'cursor', 25, 1.35, L => `${L} automatische Taps pro Sekunde`, (m, L) => { m.autoTap += L; }],
    ['p-pierce', 'Panzerbrecher', 'shield', 5, 1.6, L => `Gepanzert: Helfer-Malus −${10 * L} Prozentpunkte`, (m, L) => { m.armorPierce += 0.1 * L; }],
    ['p-exec', 'Endspurt', 'flame', 10, 1.5, L => `+${10 * L} % Schaden auf die letzten 20 % Limit`, (m, L) => { m.execute += 0.1 * L; }],
    ['p-ultra', 'Ultra-Jäger', 'rocket', 20, 1.4, L => `+${15 * L} % Schaden gegen Ultra-KIs`, (m, L) => { m.ultraDmg += 0.15 * L; }],
    ['p-boss', 'Limit-Brecher', 'clock', 20, 1.4, L => `+${25 * L} % Schaden gegen Bosse`, (m, L) => { m.bossDmg += 0.25 * L; }],
    ['p-core', 'Transformer-Kern', 'bolt', 50, 1.15, L => `Tap-Schaden ${times(1.3 ** L)}`, (m, L) => { m.click *= 1.3 ** L; }],
  ],
  auto: [
    ['a-par', 'Paralleli\u00adsierung', 'agents', 100, 1.12, L => `Helfer ${times(1.15 ** L)}`, (m, L) => { m.global *= 1.15 ** L; }],
    ['a-cost', 'Effiziente Kerne', 'gpu', 20, 1.4, L => `Helfer kosten −${2 * L} %`, (m, L) => { m.helperCost *= 1 - 0.02 * L; }],
    ['a-start', 'Startkapital', 'gift', 15, 1.5, L => `Jeder Lauf startet mit ${fmt(L ? 100 * 5 ** L : 0)} Tokens`, (m, L) => { m.startTokens = 100 * 5 ** L; }],
    ['a-scale', 'Skalierungs\u00adgesetz', 'trend', 10, 1.5, L => `+${fmt(0.1 * L, 1)} % Helfer-Schaden pro Helfer`, (m, L) => { m.scaleLaw += 0.001 * L; }],
    ['a-offline', 'Dauerbetrieb', 'clock', 6, 1.6, L => `Offline-Fortschritt +${2 * L} Std.`, (m, L) => { m.offlineHours += 2 * L; }],
    ['a-line', 'Fließband', 'layers', 50, 1.14, L => `Helfer ${times(1.25 ** L)}`, (m, L) => { m.global *= 1.25 ** L; }],
    ['a-updates', 'Gratis-Updates', 'refresh', 10, 1.5, L => `Upgrades kosten −${4 * L} %`, (m, L) => { m.upgradeCost *= 1 - 0.04 * L; }],
    ['a-cool', 'Kühlkreislauf', 'gauge', 10, 1.5, L => `Overclock-Stärke +${fmt(0.3 * L, 1)}`, (m, L) => { m.overclockAdd += 0.3 * L; }],
    ['a-autobuy', 'Autopilot', 'route', 5, 2, L => `Kauft alle ${fmt(autoBuySeconds(L), 1)} s den lohnendsten Helfer`, (m, L) => { m.autoBuyMs = autoBuySeconds(L) * 1000; }],
    ['a-sing', 'Singularitäts\u00adnähe', 'singularity', 50, 1.15, L => `Helfer ${times(1.4 ** L)}`, (m, L) => { m.global *= 1.4 ** L; }],
  ],
  econ: [
    ['e-comp', 'Token-Kompression', 'token', 100, 1.12, L => `Tokens ${times(1.15 ** L)}`, (m, L) => { m.tokenGain *= 1.15 ** L; }],
    ['e-loot', 'Beutezug', 'gift', 50, 1.2, L => `Beute +${20 * L} %`, (m, L) => { m.loot += 0.2 * L; }],
    ['e-mission', 'Auftragsbörse', 'checklist', 20, 1.35, L => `Aufträge +${25 * L} % Belohnung`, (m, L) => { m.missionReward += 0.25 * L; }],
    ['e-golden', 'Glücksfund', 'sparkle', 20, 1.35, L => `Geistesblitze ${10 * L} % häufiger`, (m, L) => { m.goldenFreq *= 1 + 0.1 * L; }],
    ['e-frenzy', 'Langer Geistesblitz', 'bulb', 10, 1.5, L => `Geistesblitze wirken +${3 * L} s länger`, (m, L) => { m.frenzyMs += 3000 * L; }],
    ['e-hype', 'Viraler Effekt', 'megaphone', 20, 1.35, L => `Viraler Hype +${fmt(0.25 * L, 2)} Stärke`, (m, L) => { m.hypeAdd += 0.25 * L; }],
    ['e-rewards', 'Prämien\u00adprogramm', 'seal', 10, 1.5, L => `Boss-, Meilenstein- und Tagesbelohnungen ${times(1 + 0.5 * L)}`, (m, L) => { m.rewardMult *= 1 + 0.5 * L; }],
    ['e-distill', 'Erkenntnis-Destillat', 'brain', 100, 1.15, L => `+${5 * L} % Erkenntnisse beim Komprimieren`, (m, L) => { m.prestigeGain += 0.05 * L; }],
    ['e-vc', 'Risikokapital', 'trend', 50, 1.15, L => `Tokens ${times(1.3 ** L)}`, (m, L) => { m.tokenGain *= 1.3 ** L; }],
    ['e-ipo', 'Börsengang', 'rocket', 50, 1.2, L => `Erkenntnisse ${times(1.1 ** L)}`, (m, L) => { m.prestigeMult *= 1.1 ** L; }],
  ],
  aim: [
    ['c-focus', 'Fokusoptik', 'crosshair', 100, 1.12, L => `Krit-Schaden ${times(1.15 ** L)}`, (m, L) => { m.crit *= 1.15 ** L; }],
    ['c-size', 'Breite Schwachstelle', 'target', 15, 1.4, L => `Schwachstelle +${4 * L} %`, (m, L) => { m.weakSize *= 1 + 0.04 * L; }],
    ['c-buffer', 'Ketten-Puffer', 'chain', 15, 1.4, L => `Krit-Kette hält +${60 * L} ms`, (m, L) => { m.chainWindow += 60 * L; }],
    ['c-amp', 'Ketten\u00adverstärker', 'chain', 15, 1.45, L => `+${2 * L} % Krit-Bonus pro Glied`, (m, L) => { m.chainBonus += 0.02 * L; }],
    ['c-grace', 'Zweite Chance', 'heal', 3, 3, L => `${L} Fehltipp${L === 1 ? '' : 's'} pro Kette erlaubt`, (m, L) => { m.chainGrace += L; }],
    ['c-steady', 'Ruhige Hand', 'sliders', 10, 1.5, L => `Schwachstelle wandert ${5 * L} % langsamer`, (m, L) => { m.drift *= 1 - 0.05 * L; }],
    ['c-combo', 'Combo-Gedächtnis', 'flame', 10, 1.5, L => `Combo hält +${150 * L} ms`, (m, L) => { m.comboWindow += 150 * L; }],
    ['c-turbo', 'Combo-Turbo', 'flame', 10, 1.5, L => `+${fmt(0.2 * L, 1)} % pro Combo-Stufe`, (m, L) => { m.comboStep += 0.002 * L; }],
    ['c-exploit', 'Exploit-Kit', 'search', 10, 1.5, L => `Exploit-Modus +${3 * L} % Krit-Chance`, (m, L) => { m.exploitAdd += 3 * L; }],
    ['c-matrix', 'Präzisions\u00admatrix', 'crosshair', 50, 1.15, L => `Krit-Schaden ${times(1.3 ** L)}`, (m, L) => { m.crit *= 1.3 ** L; }],
  ],
  ctrl: [
    ['k-infer', 'Schnelle Inferenz', 'gauge', 15, 1.4, L => `Abklingzeiten −${fmt((1 - 0.97 ** L) * 100, 1)} %`, (m, L) => { m.cooldown *= 0.97 ** L; }],
    ['k-long', 'Lange Kontexte', 'window', 20, 1.35, L => `Fähigkeiten wirken +${3 * L} % länger`, (m, L) => { m.skillDuration *= 1 + 0.03 * L; }],
    ['k-power', 'Verstärkte Fähigkeiten', 'storm', 20, 1.35, L => `Fähigkeiten +${5 * L} % stärker`, (m, L) => { m.skillPower *= 1 + 0.05 * L; }],
    ['k-launch', 'Launch-Verzögerung', 'rocket', 15, 1.4, L => `Ultra-Countdown +${2 * L} s, Boss-Zeit +${4 * L} s`, (m, L) => { m.ultraTime += 2000 * L; m.bossTime += 4000 * L; }],
    ['k-skip', 'Wellensprung', 'wave', 25, 1.35, L => `${2 * L} % Chance, eine Welle zu überspringen`, (m, L) => { m.waveSkip += 0.02 * L; }],
    ['k-trait', 'Eigenschafts-Analyse', 'search', 20, 1.35, L => `+${10 * L} % Schaden gegen KIs mit Eigenschaft`, (m, L) => { m.traitDmg += 0.1 * L; }],
    ['k-reflex', 'Abwehr-Reflex', 'shield', 10, 1.5, L => `Boss-Angriffe ${8 * L} % länger abwehrbar, Negativ-Effekte ${5 * L} % kürzer`, (m, L) => { m.parryWindow *= 1 + 0.08 * L; m.debuffTime *= 1 - 0.05 * L; }],
    ['k-robust', 'Störfestigkeit', 'stop', 6, 1.6, L => `Regeneration −${15 * L} %, +${L} Tap/s bis zum 429`, (m, L) => { m.regen *= 1 - 0.15 * L; m.rateTaps += L; }],
    ['k-memory', 'Fähigkeiten-Gedächtnis', 'brain', 10, 1.6, L => `Fähigkeiten starten jeden Lauf auf Stufe ${L}`, (m, L) => { m.skillStart = L; }],
    ['k-dilate', 'Zeitdilatation', 'clock', 20, 1.25, L => `Abklingzeiten −${L} %, Fähigkeiten +${L} % länger`, (m, L) => { m.cooldown *= 1 - 0.01 * L; m.skillDuration *= 1 + 0.01 * L; }],
  ],
};
const TREE = TREE_BRANCHES.flatMap(b => TREE_SPEC[b.id].map(([id, name, iconName, max, growth, describe, apply], i) => ({
  id, branch: b.id, row: i + 1, name, icon: iconName, max, growth, describe, apply, colors: b.colors,
})));

function autoBuySeconds(L) {
  return Math.max(1, 12 - 2.2 * L);
}

const MISSION_TYPES = [
  { type: 'kills', icon: 'target', range: [15, 40], text: n => `Besiege ${n} KIs` },
  { type: 'crits', icon: 'crosshair', range: [8, 25], text: n => `Lande ${n} kritische Treffer`, when: s => s.unlocks.has('crit') },
  { type: 'combo', icon: 'flame', range: [20, 70], text: n => `Erreiche eine Combo von ${n}` },
  { type: 'chain', icon: 'chain', range: [6, 25], text: n => `Schaffe eine Krit-Kette von ${n}`, when: s => s.unlocks.has('chain') },
  { type: 'taps', icon: 'cursor', range: [100, 300], text: n => `Tippe ${n}-mal auf KIs` },
  { type: 'ultras', icon: 'rocket', range: [1, 3], text: n => (n > 1 ? `Besiege ${n} Ultra-KIs vor dem Launch` : 'Besiege eine Ultra-KI vor dem Launch') },
  { type: 'traits', icon: 'shield', range: [3, 8], text: n => `Besiege ${n} KIs mit Eigenschaft`, when: s => s.highestWave >= TRAIT_MIN_WAVE },
  { type: 'skills', icon: 'storm', range: [2, 5], text: n => `Setze ${n}× eine Fähigkeit ein`, when: s => SKILLS.some(k => s.skills[k.id].level > 0) },
  { type: 'series', icon: 'sparkle', range: [2, 5], text: n => `Schließe ${n} Flow-Serien ab`, when: s => s.unlocks.has('series') },
  { type: 'discover', icon: 'sparkle', range: [2, 4], text: n => `Entdecke ${n} neue KIs`, when: s => MODELS.filter((m, i) => (m.wave || 1) <= s.highestWave && !s.discovered.has(i)).length >= 4 },
];

const ACHIEVEMENTS = [
  { id: 'hello', name: 'Hallo Welt', desc: 'Tippe zum ersten Mal auf eine KI.', check: s => s.clicks >= 1 },
  { id: 'kill-1', name: 'Limit erreicht', desc: 'Besiege deine erste KI.', check: s => s.kills >= 1 },
  { id: 'kill-1000', name: 'Modell-Friedhof', desc: 'Besiege 1.000 KIs.', check: s => s.kills >= 1000 },
  { id: 'clicks-1000', name: 'Sehnenscheidenentzündung', desc: 'Tippe 1.000-mal.', check: s => s.clicks >= 1000 },
  { id: 'wave-10', name: 'Wellenreiter', desc: 'Erreiche Welle 10.', check: s => s.highestWave >= 10 },
  { id: 'wave-25', name: 'Brandung', desc: 'Erreiche Welle 25.', check: s => s.highestWave >= 25 },
  { id: 'wave-50', name: 'Tsunami', desc: 'Erreiche Welle 50.', check: s => s.highestWave >= 50 },
  { id: 'wave-100', name: 'Jenseits des Limits', desc: 'Erreiche Welle 100.', check: s => s.highestWave >= 100 },
  { id: 'earn-1e3', name: 'Erste Tausend', desc: 'Verdiene insgesamt 1.000 Tokens.', check: s => s.totalEarned >= 1e3 },
  { id: 'earn-1e6', name: 'Token-Millionär', desc: 'Verdiene insgesamt 1 Mio. Tokens.', check: s => s.totalEarned >= 1e6 },
  { id: 'earn-1e9', name: 'Kontext-Milliardär', desc: 'Verdiene insgesamt 1 Mrd. Tokens.', check: s => s.totalEarned >= 1e9 },
  { id: 'earn-1e12', name: 'Wer braucht schon ein Limit?', desc: 'Verdiene insgesamt 1 Bio. Tokens.', check: s => s.totalEarned >= 1e12 },
  { id: 'dps-100', name: 'Läuft von allein', desc: 'Erreiche 100 Schaden/s.', check: (s, dps) => dps >= 100 },
  { id: 'dps-1e5', name: 'Schadens-Tornado', desc: 'Erreiche 100.000 Schaden/s.', check: (s, dps) => dps >= 1e5 },
  { id: 'gens-100', name: 'Massenproduktion', desc: 'Besitze 100 Helfer gleichzeitig.', check: s => totalGenerators(s) >= 100 },
  { id: 'dyson', name: 'Ereignishorizont', desc: 'Kaufe eine Singularität.', check: s => s.gens.dyson >= 1 },
  { id: 'golden-1', name: 'Heureka!', desc: 'Fange einen Geistesblitz.', check: s => s.goldenClicks >= 1 },
  { id: 'golden-10', name: 'Genie bei der Arbeit', desc: 'Fange 10 Geistesblitze.', check: s => s.goldenClicks >= 10 },
  { id: 'boss', name: 'Wochenlimit besiegt', desc: `Besiege das Wochenlimit auf Level ${BOSS_EVERY_WAVES * WAVE_SIZE}.`, check: s => s.bossWins >= 1 },
  { id: 'boss-3', name: 'Limitlos', desc: 'Besiege das Wochenlimit III.', check: s => s.bossBest >= 3 },
  { id: 'parry-50', name: 'Abwehrkünstler', desc: 'Wehre 50 Angriffe des Wochenlimits ab.', check: s => s.parries >= 50 },
  { id: 'prestige', name: 'Frischer Kontext', desc: 'Komprimiere deinen Kontext.', check: s => s.prestiges >= 1 },
  { id: 'prestige-10', name: 'Versionssprung', desc: 'Komprimiere deinen Kontext 10-mal.', check: s => s.prestiges >= 10 },
  { id: 'prestige-100', name: 'Hundertste Iteration', desc: 'Komprimiere deinen Kontext 100-mal.', check: s => s.prestiges >= 100 },
  { id: 'tree-25', name: 'Wurzeln geschlagen', desc: 'Lerne 25 Stufen im Fähigkeitenbaum.', check: s => treeTotal(s) >= 25 },
  { id: 'tree-250', name: 'Weit verzweigt', desc: 'Lerne 250 Stufen im Fähigkeitenbaum.', check: s => treeTotal(s) >= 250 },
  { id: 'dex-16', name: 'Sammler', desc: 'Entdecke 16 verschiedene KIs.', check: s => s.discovered.size >= 16 },
  { id: 'dex-48', name: 'Kenner', desc: 'Entdecke 48 verschiedene KIs.', check: s => s.discovered.size >= 48 },
  { id: 'dex-all', name: 'Vollständige Sammlung', desc: `Entdecke alle ${MODELS.length} KIs.`, check: s => s.discovered.size >= MODELS.length },
  { id: 'crit-1', name: 'Kritischer Moment', desc: 'Lande deinen ersten kritischen Treffer.', check: s => s.crits >= 1 },
  { id: 'series-25', name: 'Im Flow', desc: 'Schließe 25 Flow-Serien ab.', check: s => s.seriesDone >= 25 },
  { id: 'series-perfect', name: 'Taktgefühl', desc: 'Triff alle Kreise einer Flow-Serie perfekt.', check: s => s.seriesPerfect >= 1 },
  { id: 'combo-100', name: 'Combo-Meister', desc: 'Erreiche eine Combo von 100.', check: s => s.maxCombo >= 100 },
  { id: 'chain-10', name: 'Scharfschütze', desc: 'Schaffe eine Krit-Kette von 10.', check: s => s.bestChain >= 10 },
  { id: 'chain-25', name: 'Unaufhaltsam', desc: 'Schaffe eine Krit-Kette von 25.', check: s => s.bestChain >= 25 },
  { id: 'chain-50', name: 'Unantastbar', desc: 'Schaffe eine Krit-Kette von 50.', check: s => s.bestChain >= 50 },
  { id: 'ultra-10', name: 'Launch verhindert', desc: 'Besiege 10 Ultra-KIs vor ihrem Launch.', check: s => s.ultraWins >= 10 },
  { id: 'skills-25', name: 'Werkzeugkasten', desc: 'Setze 25-mal eine Fähigkeit ein.', check: s => s.skillUses >= 25 },
  { id: 'missions-10', name: 'Auftragslage gut', desc: 'Erledige 10 Aufträge.', check: s => s.missionsDone >= 10 },
  { id: 'rate-limited', name: 'Too Many Requests', desc: 'Lass dich von einem Ratenlimit ausbremsen.', check: s => s.rateLimited >= 1 },
  { id: 'vortex-1', name: 'Ins Dunkel geblickt', desc: 'Sammle eine Dark-Vortex-Variante.', secret: true, check: s => s.vortex.size >= 1 },
  { id: 'limit', name: 'Limit überstanden', desc: 'Warte im Spiel einen deiner Claude-Limit-Resets ab.', check: s => s.limitsSurvived >= 1 },
];

// 1500 → „1,5 s“
function fmtSec(ms) {
  return `${(ms / 1000).toLocaleString('de-DE', { maximumFractionDigits: 1 })} s`;
}

const SUFFIXES = ['', ' Tsd.', ' Mio.', ' Mrd.', ' Bio.', ' Brd.', ' Trio.', ' Trd.', ' Quadr.', ' Quadrd.', ' Quint.', ' Quintd.'];

// ---------- Icons (24×24, Linien) ----------

const ICON_PATHS = {
  token: '<path d="M12 3v18M3 12h18M5.6 5.6l12.8 12.8M18.4 5.6L5.6 18.4"/>',
  bubble: '<path d="M5 4.5h14a2 2 0 0 1 2 2V15a2 2 0 0 1-2 2h-7.5L7 20.5V17H5a2 2 0 0 1-2-2V6.5a2 2 0 0 1 2-2z"/>',
  person: '<circle cx="12" cy="8" r="3.6"/><path d="M5 20c1.4-3.6 4-5.2 7-5.2s5.6 1.6 7 5.2"/>',
  cup: '<path d="M5 9h11v5a5 5 0 0 1-5 5h-1a5 5 0 0 1-5-5z"/><path d="M16 10.5h1.5a2.5 2.5 0 0 1 0 5H16M9 3.5V6M12.5 3.5V6"/>',
  layers: '<path d="M12 3.5l8.5 4.5-8.5 4.5L3.5 8z"/><path d="M3.5 12.5l8.5 4.5 8.5-4.5M3.5 16.5l8.5 4.5 8.5-4.5"/>',
  chip: '<rect x="7" y="7" width="10" height="10" rx="2"/><path d="M10 3.5V7M14 3.5V7M10 17v3.5M14 17v3.5M3.5 10H7M3.5 14H7M17 10h3.5M17 14h3.5"/>',
  server: '<rect x="4" y="4" width="16" height="6.5" rx="2"/><rect x="4" y="13.5" width="16" height="6.5" rx="2"/><path d="M8 7.25h.01M8 16.75h.01"/>',
  atom: '<ellipse cx="12" cy="12" rx="9.5" ry="3.8"/><ellipse cx="12" cy="12" rx="9.5" ry="3.8" transform="rotate(60 12 12)"/><ellipse cx="12" cy="12" rx="9.5" ry="3.8" transform="rotate(120 12 12)"/>',
  sun: '<circle cx="12" cy="12" r="4"/><circle cx="12" cy="12" r="8.5" stroke-dasharray="3 2.6"/>',
  bolt: '<path d="M13 3L5.5 13.5H11L10 21l7.5-10.5H12z"/>',
  sparkle: '<path d="M12 3c.6 4.6 2.4 6.4 7 7-4.6.6-6.4 2.4-7 7-.6-4.6-2.4-6.4-7-7 4.6-.6 6.4-2.4 7-7z"/>',
  gift: '<rect x="4" y="9" width="16" height="11" rx="2"/><path d="M3.5 9h17M12 9v11M12 9c-1.5-3.5-5.5-4-5.5-1.5S10 9 12 9zm0 0c1.5-3.5 5.5-4 5.5-1.5S14 9 12 9z"/>',
  check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
  lock: '<rect x="5" y="10.5" width="14" height="10" rx="2.5"/><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5"/>',
  seal: '<path d="M12 2.8l2.3 1.7 2.8-.2.9 2.7 2.4 1.5-.9 2.7.9 2.7-2.4 1.5-.9 2.7-2.8-.2L12 21.2l-2.3-1.7-2.8.2-.9-2.7-2.4-1.5.9-2.7-.9-2.7 2.4-1.5.9-2.7 2.8.2z"/><path d="M8.5 12l2.3 2.3 4.7-4.7"/>',
  question: '<circle cx="12" cy="12" r="9"/><path d="M9.6 9.5a2.5 2.5 0 1 1 3.4 2.3c-.6.3-1 .9-1 1.7M12 17h.01"/>',
  wave: '<path d="M3 9c2-2 4-2 6 0s4 2 6 0 4-2 6 0M3 15c2-2 4-2 6 0s4 2 6 0 4-2 6 0"/>',
  compress: '<path d="M9 4v5H4M15 4v5h5M9 20v-5H4M15 20v-5h5"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  keyboard: '<rect x="2.5" y="6" width="19" height="12" rx="2.5"/><path d="M6.5 10h.01M10 10h.01M13.5 10h.01M17 10h.01M8 14h8"/>',
  terminal: '<rect x="2.5" y="4" width="19" height="16" rx="3"/><path d="M7 9.5l3 2.5-3 2.5M12.5 15H17"/>',
  wand: '<path d="M4.5 19.5l10-10"/><path d="M16.5 3l.9 2.1 2.1.9-2.1.9-.9 2.1-.9-2.1-2.1-.9 2.1-.9z"/>',
  rocket: '<path d="M12 3c3.4 2 5 5.5 5 9.5L15 15H9l-2-2.5C7 8.5 8.6 5 12 3z"/><circle cx="12" cy="9.5" r="1.6"/><path d="M9 15l-1.8 4 3.3-1.4M15 15l1.8 4-3.3-1.4"/>',
  search: '<circle cx="10.5" cy="10.5" r="6"/><path d="M15 15l5 5"/>',
  checklist: '<rect x="3.5" y="3.5" width="17" height="17" rx="5"/><path d="M8 12.2l2.8 2.8 5.2-6"/>',
  refresh: '<path d="M19.5 12a7.5 7.5 0 0 1-13.1 5M4.5 12a7.5 7.5 0 0 1 13.1-5"/><path d="M18 3.5V7h-3.5M6 20.5V17h3.5"/>',
  window: '<rect x="3" y="4.5" width="18" height="15" rx="3"/><path d="M3 9h18M7 13h10M7 16h6"/>',
  prompt: '<rect x="4" y="3.5" width="12.5" height="17" rx="2.5"/><path d="M7.5 9h5.5M7.5 12.5h5.5M7.5 16h3"/><path d="M19.5 2.5l.7 1.6 1.6.7-1.6.7-.7 1.6-.7-1.6-1.6-.7 1.6-.7z"/>',
  sliders: '<path d="M6 4v16M12 4v16M18 4v16"/><circle cx="6" cy="14.5" r="2.3" fill="currentColor"/><circle cx="12" cy="8.5" r="2.3" fill="currentColor"/><circle cx="18" cy="15.5" r="2.3" fill="currentColor"/>',
  database: '<ellipse cx="12" cy="6" rx="7" ry="2.8"/><path d="M5 6v12c0 1.5 3.1 2.8 7 2.8s7-1.3 7-2.8V6M5 12c0 1.5 3.1 2.8 7 2.8s7-1.3 7-2.8"/>',
  agents: '<circle cx="12" cy="5.5" r="2.6"/><circle cx="5.5" cy="17.5" r="2.6"/><circle cx="18.5" cy="17.5" r="2.6"/><path d="M10.7 7.8l-3.9 7.4M13.3 7.8l3.9 7.4M8.1 17.5h7.8"/>',
  gpu: '<rect x="2.5" y="6" width="19" height="11" rx="2.5"/><circle cx="9" cy="11.5" r="3"/><path d="M15 9.5h3M15 13.5h3M6 17v2.5M10 17v2.5"/>',
  trend: '<path d="M4 19.5h16"/><path d="M5 15.5l4-4.5 3.5 3L19 7"/><path d="M15 7h4v4"/>',
  neuro: '<rect x="6" y="6" width="12" height="12" rx="3.5"/><path d="M9.5 3v3M14.5 3v3M9.5 18v3M14.5 18v3M3 9.5h3M3 14.5h3M18 9.5h3M18 14.5h3"/><path d="M10 14c0-2.4 4-1.6 4-4"/>',
  singularity: '<circle cx="12" cy="12" r="3.4" fill="currentColor"/><ellipse cx="12" cy="12" rx="9.5" ry="3.8" transform="rotate(-24 12 12)"/>',
  target: '<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="4.5"/><circle cx="12" cy="12" r="1.3" fill="currentColor"/>',
  cursor: '<path d="M5 4l5.5 15 2.2-6.3L19 10.5z"/><path d="M18.5 15l.6 1.4 1.4.6-1.4.6-.6 1.4-.6-1.4-1.4-.6 1.4-.6z"/>',
  brain: '<path d="M12 5.5C12 4 10.8 3 9.5 3S7 4 7 5.3C5.3 5.6 4 7 4 8.8c0 .9.3 1.7.9 2.3a3.6 3.6 0 0 0-.9 2.4c0 1.9 1.4 3.5 3.3 3.7.3 2.1 2 3.8 3.7 3.8M12 5.5C12 4 13.2 3 14.5 3S17 4 17 5.3c1.7.3 3 1.7 3 3.5 0 .9-.3 1.7-.9 2.3.6.6.9 1.5.9 2.4 0 1.9-1.4 3.5-3.3 3.7-.3 2.1-2 3.8-3.7 3.8M12 5.5V21"/>',
  gauge: '<path d="M4 16.5a8 8 0 1 1 16 0"/><path d="M12 16.5l4.2-5.2"/><circle cx="12" cy="16.5" r="1.5" fill="currentColor"/>',
  shield: '<path d="M12 3l7 3v5.5c0 4.3-3 7.8-7 9.5-4-1.7-7-5.2-7-9.5V6z"/>',
  route: '<circle cx="5" cy="12" r="2.2"/><circle cx="19" cy="6" r="2.2"/><circle cx="19" cy="18" r="2.2"/><path d="M7.2 12h3c2.2 0 2.6-6 6.6-6M10.2 12c2.2 0 2.6 6 6.6 6"/>',
  crosshair: '<circle cx="12" cy="12" r="7.5"/><path d="M12 2.5v5M12 16.5v5M2.5 12h5M16.5 12h5"/>',
  flame: '<path d="M12 21c3.9 0 6.5-2.7 6.5-6.3 0-3.4-2.4-5.6-3.6-8.7-.9 2-2 3-3.4 3.6.3-2.6-.5-5.2-2.6-6.6.1 3.2-1.6 4.8-3 6.6a7.5 7.5 0 0 0-.4 5.1C6 18.3 8.1 21 12 21z"/>',
  wind: '<path d="M3 8h10a3 3 0 1 0-3-3M3 12h15a3 3 0 1 1-3 3M3 16h7"/>',
  heal: '<path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/><path d="M12 9.5v5M9.5 12h5"/>',
  stop: '<path d="M8.3 3h7.4L21 8.3v7.4L15.7 21H8.3L3 15.7V8.3z"/><path d="M8 12h8"/>',
  fork: '<circle cx="6" cy="5" r="2"/><circle cx="18" cy="5" r="2"/><circle cx="12" cy="19" r="2"/><path d="M6 7v1.5a3 3 0 0 0 3 3h6a3 3 0 0 0 3-3V7M12 11.5V17"/>',
  chain: '<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>',
  megaphone: '<path d="M4 10v4a1 1 0 0 0 1 1h2.5l6 4.5v-15l-6 4.5H5a1 1 0 0 0-1 1z"/><path d="M17 9a4 4 0 0 1 0 6M19.5 6.5a7.5 7.5 0 0 1 0 11"/>',
  storm: '<path d="M7 15.5a4 4 0 0 1-.4-8A5.5 5.5 0 0 1 17 8a3.8 3.8 0 0 1 .5 7.5"/><path d="M12.5 11.5l-2.5 4h3l-2 4.5"/>',
  bomb: '<circle cx="10.5" cy="13.5" r="6.5"/><path d="M15.2 8.8l2.3-2.3"/><path d="M19.5 2.5v2.5M21.5 4.5H19"/>',
  bulb: '<path d="M9.5 18h5M10.5 21h3"/><path d="M12 3a6 6 0 0 0-3.6 10.8c.7.5 1.1 1.3 1.1 2.2h5c0-.9.4-1.7 1.1-2.2A6 6 0 0 0 12 3z"/>',
  more: '<circle cx="5.5" cy="12" r="1.5" fill="currentColor"/><circle cx="12" cy="12" r="1.5" fill="currentColor"/><circle cx="18.5" cy="12" r="1.5" fill="currentColor"/>',
  barrier: '<circle cx="12" cy="12" r="9" stroke-dasharray="3.2 2.4"/><path d="M12 7l4 1.7v3c0 2.4-1.7 4.3-4 5.3-2.3-1-4-2.9-4-5.3v-3z"/>',
  eyeoff: '<path d="M3 3l18 18"/><path d="M10.6 5.1A10 10 0 0 1 12 5c5 0 8.6 4.4 9.5 7a12.4 12.4 0 0 1-2.9 4.1M6.5 6.6C4.6 7.9 3.2 9.8 2.5 12c.9 2.6 4.5 7 9.5 7 1.7 0 3.3-.5 4.6-1.3"/><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2"/>',
  copy: '<rect x="8" y="8" width="12" height="12" rx="3"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"/>',
  teleport: '<circle cx="7" cy="17" r="2.6"/><circle cx="17" cy="7" r="2.6" stroke-dasharray="2.2 1.8"/><path d="M9 15l5.5-5.5M10.5 8.5h4.5V13"/>',
  shrink: '<path d="M4 4l5.5 5.5M9.5 5v4.5H5M20 20l-5.5-5.5M14.5 19v-4.5H19"/>',
  mute: '<path d="M4 10v4a1 1 0 0 0 1 1h2.5l5 4V5l-5 4H5a1 1 0 0 0-1 1z"/><path d="M16.5 9.5l5 5M21.5 9.5l-5 5"/>',
  diamond: '<path d="M7 4h10l4 5-9 11L3 9z"/><path d="M3 9h18M9.5 4L8 9l4 11 4-11-1.5-5"/>',
  coins: '<ellipse cx="12" cy="6.5" rx="7" ry="3"/><path d="M5 6.5v5c0 1.7 3.1 3 7 3s7-1.3 7-3v-5M5 11.5v5c0 1.7 3.1 3 7 3s7-1.3 7-3v-5"/>',
  glitch: '<path d="M2.5 12h4l2-5.5 3 11 2.5-8 1.6 2.5h5.9"/>',
  hourglass: '<path d="M6.5 3.5h11M6.5 20.5h11M8 3.5v3a4 4 0 0 0 2 3.5l2 1.5 2-1.5a4 4 0 0 0 2-3.5v-3M8 20.5v-3a4 4 0 0 1 2-3.5l2-1.5 2 1.5a4 4 0 0 1 2 3.5v3"/>',
  vortex: '<path d="M12 12.2a1.6 1.6 0 1 1 1.6-1.9c.3 2-1.6 3.4-3.5 3.1-2.6-.4-3.8-3.4-2.6-5.7 1.5-2.9 5.5-3.6 8-1.6 3.1 2.4 3 7.2.1 9.6-3.4 2.9-8.9 2.3-11.6-1.2"/>',
  swarm: '<circle cx="12" cy="6.5" r="3"/><circle cx="6" cy="16.5" r="3"/><circle cx="18" cy="16.5" r="3"/>',
};

function icon(name) {
  return `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICON_PATHS[name]}</svg>`;
}

// ---------- Hilfsfunktionen ----------

const $ = id => document.getElementById(id);
const dateFmt = new Intl.DateTimeFormat('de-DE', { weekday: 'short', day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
const timeFmt = new Intl.DateTimeFormat('de-DE', { hour: '2-digit', minute: '2-digit' });
const weekdayFmt = new Intl.DateTimeFormat('de-DE', { weekday: 'short' });

function fmt(n, decimals = 0) {
  if (!Number.isFinite(n)) return '∞';
  if (Math.abs(n) < 1e6) return n.toLocaleString('de-DE', { maximumFractionDigits: Math.abs(n) < 1e3 ? decimals : 0 });
  const tier = Math.floor(Math.log10(Math.abs(n)) / 3);
  if (tier >= SUFFIXES.length) return n.toExponential(2).replace('.', ',');
  const scaled = n / 10 ** (tier * 3);
  return scaled.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + SUFFIXES[tier];
}

// 1:02:03
function fmtDuration(ms) {
  const total = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

// 4 T 09:12:33
function fmtWeekCountdown(ms) {
  const total = Math.max(0, Math.floor(ms / 1000));
  const d = Math.floor(total / 86400);
  const rest = fmtDuration((total % 86400) * 1000).padStart(8, '0');
  return d > 0 ? `${d} T ${rest}` : rest;
}

// „2 T 3 Std.“, „3 Std. 12 Min.“, „12 Min.“
function fmtSpan(ms) {
  const totalMin = Math.max(0, Math.ceil(ms / MINUTE_MS));
  const d = Math.floor(totalMin / 1440);
  const h = Math.floor((totalMin % 1440) / 60);
  const m = totalMin % 60;
  if (d > 0) return `${d} T ${h} Std.`;
  if (h > 0) return `${h} Std. ${m} Min.`;
  return `${m} Min.`;
}

function clamp01(x) {
  return Math.min(1, Math.max(0, x));
}

function totalGenerators(s) {
  return GENERATORS.reduce((sum, g) => sum + s.gens[g.id], 0);
}

function randomBetween(min, max) {
  return min + Math.random() * (max - min);
}

function startOfDay(ts) {
  const d = new Date(ts);
  d.setHours(0, 0, 0, 0);
  return d;
}

function dayId(ts) {
  const d = new Date(ts);
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

function enemyMaxHp(wave, index) {
  // Jede KI ist ein Stück stärker als die vorige, die zehnte (Ultra) noch einmal deutlich.
  const n = (wave - 1) * WAVE_SIZE + index;
  return ENEMY_BASE_HP * ENEMY_HP_GROWTH ** n * (index === WAVE_SIZE - 1 ? ULTRA_HP_MULT : 1);
}

// Spielzeit für neue Gegner; in der Offline-Simulation die simulierte Zeit.
let clock = Date.now();
// Während Offline-Fortschritt nachgerechnet wird: keine Toasts, Popups oder Animationen.
let quiet = false;

function rollTrait(kind, wave, index) {
  if (wave < TRAIT_MIN_WAVE) return null;
  const ultra = index === WAVE_SIZE - 1;
  let trait = SIGNATURE_TRAITS[MODELS[kind].name] || MODELS[kind].trait || null;
  if (!trait && (ultra || Math.random() < TRAIT_CHANCE)) {
    const pool = TRAIT_KEYS.filter(k => (TRAITS[k].wave || 0) <= wave);
    trait = pool[Math.floor(Math.random() * pool.length)];
  }
  // Ultra-KIs haben schon ihren Launch-Countdown, eine Flucht passt nicht dazu.
  return ultra && trait === 'fleeting' ? 'evasive' : trait;
}

// highest: höchste je erreichte Welle – bis dahin ist die neue Generation freigeschaltet.
function newEnemy(wave, index, highest = wave) {
  const reach = Math.max(wave, highest);
  // Gewichtet nach Seltenheit: Neue Generation selten, epische KIs sehr selten
  const pool = [];
  let total = 0;
  MODELS.forEach((m, i) => {
    if ((m.wave || 1) > reach) return;
    const weight = RARITIES[modelRarity(i)].weight;
    pool.push([i, weight]);
    total += weight;
  });
  let pick = Math.random() * total;
  let kind = pool[pool.length - 1][0];
  for (const [i, weight] of pool) {
    pick -= weight;
    if (pick <= 0) {
      kind = i;
      break;
    }
  }
  return {
    kind,
    seed: Math.floor(Math.random() * 2 ** 31),
    hp: enemyMaxHp(wave, index),
    trait: rollTrait(kind, wave, index),
    vortex: !quiet && Math.random() < VORTEX_CHANCE,
    spawnedAt: clock,
  };
}

// ---------- Spielstand ----------

function freshState(now = Date.now()) {
  return {
    tokens: 0,
    runEarned: 0,
    totalEarned: 0,
    clicks: 0,
    gens: Object.fromEntries(GENERATORS.map(g => [g.id, 0])),
    upgrades: new Set(),
    unlocks: new Set(),   // freigeschaltete Mechaniken (bleiben über Prestiges)
    achievements: new Set(),
    discovered: new Set(),
    vortex: new Set(),    // gesammelte Dark-Vortex-Varianten (Modell-Index)
    vortexKills: 0,
    insights: 0,          // Erkenntnisse = Prestige-Tokens (unverbraucht)
    insightsEarned: 0,
    prestiges: 0,         // Kontext-Version = prestiges + 1
    tree: {},
    runWave: 1,
    bossBlocked: false,   // Boss verloren: die Welle wird gefarmt, bis du ihn erneut herausforderst
    bossBest: 0,
    bossFails: 0,
    parries: 0,
    goldenClicks: 0,
    frenzyUntil: 0,
    buyAmount: 1,
    tab: 'helpers',
    wave: 1,
    highestWave: 1,
    enemyIndex: 0,
    enemy: newEnemy(1, 0),
    boss: null,
    kills: 0,
    bossWins: 0,
    lastDaily: '',
    crits: 0,
    maxCombo: 0,
    bestChain: 0,
    ultraWins: 0,
    ultraFails: 0,
    skillUses: 0,
    seriesDone: 0,
    seriesPerfect: 0,
    traitKills: 0,
    rateLimited: 0,
    missionsDone: 0,
    missions: [],
    skills: Object.fromEntries(SKILLS.map(k => [k.id, { level: 0, readyAt: 0, activeUntil: 0 }])),
    sound: true,
    limitReset: null,   // dein nächster 5-Stunden-Reset bei Claude
    weeklyReset: null,  // dein nächster Wochenlimit-Reset bei Claude
    limitsSurvived: 0,
    startedAt: now,
    lastSave: now,
    maxSeen: now,
  };
}

function fromSaveData(data) {
  if (!data || typeof data.tokens !== 'number') throw new Error('Ungültiger Spielstand');
  const base = freshState();
  const enemyOk = data.enemy && typeof data.enemy.hp === 'number' && Number.isInteger(data.enemy.kind);
  const s = {
    ...base,
    ...data,
    gens: { ...base.gens, ...data.gens },
    enemy: enemyOk
      ? {
        ...data.enemy,
        kind: data.enemy.kind % MODELS.length,
        seed: data.enemy.seed ?? Math.floor(Math.random() * 2 ** 31),
        trait: TRAITS[data.enemy.trait] ? data.enemy.trait : null,
        spawnedAt: Date.now(),
      }
      : base.enemy,
    skills: Object.fromEntries(SKILLS.map(k => {
      const saved = (data.skills || {})[k.id] || {};
      // Ältere Spielstände kannten keine Stufen: Was schon nutzbar war, startet auf Stufe 1.
      const level = Number.isInteger(saved.level) ? saved.level : (saved.readyAt !== undefined && (data.highestWave || 1) >= k.wave ? 1 : 0);
      return [k.id, { ...base.skills[k.id], ...saved, level: Math.min(SKILL_MAX_LEVEL, Math.max(0, level)) }];
    })),
    missions: Array.isArray(data.missions)
      ? data.missions.filter(m => m && MISSION_TYPES.some(t => t.type === m.type) && m.target > 0)
      : [],
    upgrades: new Set(data.upgrades || []),
    // Ältere Spielstände kannten Krits und Ketten schon ohne Freischaltung.
    unlocks: new Set([...(data.unlocks || []), ...((data.crits || 0) > 0 ? ['crit'] : []), ...((data.bestChain || 0) >= 2 ? ['chain'] : [])]
      .filter(k => UNLOCK_KEYS.includes(k))),
    tree: Object.fromEntries(TREE
      .map(n => [n.id, Math.min(n.max, Math.max(0, Math.floor(Number((data.tree || {})[n.id]) || 0)))])
      .filter(([, level]) => level > 0)),
    runWave: Math.max(data.runWave ?? 1, data.wave ?? 1),
    // Früher kam der Boss wöchentlich (ohne Stufe); so ein alter Kampf wird beendet.
    boss: data.boss && Number.isFinite(data.boss.hp) && Number.isInteger(data.boss.tier) ? { ...data.boss } : null,
    achievements: new Set((data.achievements || []).filter(id => ACHIEVEMENTS.some(a => a.id === id))),
    discovered: new Set((data.discovered || []).filter(i => Number.isInteger(i) && i >= 0 && i < MODELS.length)),
    vortex: new Set((data.vortex || []).filter(i => Number.isInteger(i) && i >= 0 && i < MODELS.length)),
  };
  delete s.week;
  // Ältere Spielstände hatten eine andere HP-Kurve.
  s.enemy.hp = Math.min(s.enemy.hp, s.enemy.maxHp ?? enemyMaxHp(s.wave, s.enemyIndex));
  // Der Platz des Bosses ohne Boss (alter Spielstand): zurück zu KI 1 der Welle.
  if (!s.boss && s.wave % BOSS_EVERY_WAVES === 0 && s.enemyIndex === WAVE_SIZE - 1) {
    s.enemyIndex = 0;
    s.enemy = newEnemy(s.wave, 0, s.highestWave);
  }
  return s;
}

function toSaveData() {
  const now = Date.now();
  return {
    ...state,
    upgrades: [...state.upgrades],
    unlocks: [...state.unlocks],
    achievements: [...state.achievements],
    discovered: [...state.discovered],
    vortex: [...state.vortex],
    lastSave: now,
    maxSeen: Math.max(state.maxSeen, now),
  };
}

function save() {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(toSaveData()));
  } catch {
    // Speicher nicht verfügbar (z. B. privater Modus) – das Spiel läuft trotzdem weiter.
  }
}

function load() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    return raw ? fromSaveData(JSON.parse(raw)) : freshState();
  } catch {
    return freshState();
  }
}

let state = load();
let mods = computeMods();

// ---------- Werte ----------

function computeMods() {
  const m = {
    gen: Object.fromEntries(GENERATORS.map(g => [g.id, 1])),
    click: 1,
    clickDps: 0,
    global: 1,
    goldenFreq: 1,
    seriesFreq: 1,
    crit: 1,
    weakSize: 1,
    comboWindow: COMBO_WINDOW_MS,
    comboCap: COMBO_CAP,
    chainWindow: 0,
    chainShrink: 1,
    cooldown: 1,
    ultraTime: ULTRA_TIME_MS,
    bossTime: BOSS_TIME_MS,
    // aus dem Fähigkeitenbaum
    tokenGain: 1,
    doubleTap: 0,
    autoTap: 0,
    armorPierce: 0,
    execute: 0,
    ultraDmg: 0,
    bossDmg: 0,
    helperCost: 1,
    startTokens: 0,
    scaleLaw: 0,
    offlineHours: 0,
    upgradeCost: 1,
    overclockAdd: 0,
    autoBuyMs: 0,
    loot: 0,
    missionReward: 0,
    frenzyMs: 0,
    hypeAdd: 0,
    rewardMult: 1,
    prestigeGain: 0,
    prestigeMult: 1,
    chainBonus: 0,
    chainGrace: 0,
    drift: 1,
    comboStep: 0,
    exploitAdd: 0,
    skillDuration: 1,
    skillPower: 1,
    waveSkip: 0,
    traitDmg: 0,
    parryWindow: 1,
    debuffTime: 1,
    regen: 1,
    rateTaps: 0,
    skillStart: 0,
  };
  for (const u of UPGRADES) if (state.upgrades.has(u.id)) u.apply(m);
  for (const node of TREE) {
    const lvl = state.tree[node.id] || 0;
    if (lvl > 0) node.apply(m, lvl);
  }
  // Jede Kontext-Version macht dauerhaft stärker.
  const version = 1 + VERSION_BONUS * state.prestiges;
  m.global *= version;
  m.click *= version;
  m.tokenGain *= version;
  m.global *= 1 + ACHIEVEMENT_BONUS * state.achievements.size;
  m.global *= 1 + BOSS_WIN_BONUS * state.bossWins;
  m.cooldown = Math.max(COOLDOWN_FLOOR, m.cooldown);
  return m;
}

function frenzyFactor(now = Date.now()) {
  return now < state.frenzyUntil ? FRENZY_MULT : 1;
}

function unitRate(g) {
  return g.baseRate * mods.gen[g.id] * mods.global;
}

function baseDps() {
  const raw = GENERATORS.reduce((sum, g) => sum + state.gens[g.id] * unitRate(g), 0);
  return raw * (1 + mods.scaleLaw * totalGenerators(state));
}

function skillDef(id) {
  return SKILLS.find(k => k.id === id);
}

function skillActive(id, now = Date.now()) {
  return now < state.skills[id].activeUntil;
}

function skillPower(id) {
  const k = skillDef(id);
  let p = k.power(state.skills[id].level);
  if (id === 'midas') p += mods.hypeAdd;
  if (id === 'overclock') p += mods.overclockAdd;
  if (id === 'crit') return Math.min(95, (p + mods.exploitAdd) * mods.skillPower);
  // Multiplikatoren wachsen über ihrem Grundwert 1, alles andere direkt
  return k.mult ? 1 + (p - 1) * mods.skillPower : p * mods.skillPower;
}

function helperFactor(now = Date.now()) {
  // Boss-Angriff „Helfer pausiert“
  if (now < debuffs.helpers) return 0;
  return frenzyFactor(now) * (skillActive('overclock', now) ? skillPower('overclock') : 1);
}

// Viraler Hype: mehr Tokens aus Schaden und Beute
function tokenBoost(now = clock) {
  return skillActive('midas', now) ? skillPower('midas') : 1;
}

function currentDps(now = Date.now()) {
  return baseDps() * helperFactor(now);
}

function clickValue(now = Date.now()) {
  return (mods.click + baseDps() * mods.clickDps) * frenzyFactor(now);
}

function tokenPerDamage() {
  return 1 + WAVE_TOKEN_BONUS * (state.wave - 1);
}

// Tokens pro Schadenspunkt inklusive Baum und Kontext-Version
function tokenRate() {
  return tokenPerDamage() * mods.tokenGain;
}

function incomeRate() {
  return baseDps() * tokenRate();
}

function earn(amount) {
  state.tokens += amount;
  state.runEarned += amount;
  state.totalEarned += amount;
}

// ---------- Shop ----------

function costOf(g, n) {
  const first = g.baseCost * COST_GROWTH ** state.gens[g.id] * mods.helperCost;
  return first * (COST_GROWTH ** n - 1) / (COST_GROWTH - 1);
}

function upgradeCost(u) {
  return u.key ? u.cost : u.cost * mods.upgradeCost;
}

function hasUnlock(key) {
  return state.unlocks.has(key);
}

function upgradeOwned(u) {
  return u.key ? state.unlocks.has(u.key) : state.upgrades.has(u.id);
}

function amountToBuy(g) {
  if (state.buyAmount !== 'max') return state.buyAmount;
  const first = g.baseCost * COST_GROWTH ** state.gens[g.id] * mods.helperCost;
  let n = Math.floor(Math.log(state.tokens * (COST_GROWTH - 1) / first + 1) / Math.log(COST_GROWTH));
  while (n > 1 && costOf(g, n) > state.tokens) n--;
  return Math.max(1, n);
}

function buyGenerator(g) {
  const n = amountToBuy(g);
  const cost = costOf(g, n);
  if (state.tokens < cost) return;
  state.tokens -= cost;
  state.gens[g.id] += n;
  restartAnimation(genEls.get(g.id).btn, 'bought');
  SFX.buy();
  render();
}

function buyUpgrade(u) {
  if (upgradeOwned(u) || state.tokens < upgradeCost(u)) return;
  state.tokens -= upgradeCost(u);
  const card = $('upgrades').querySelector(`[data-id="${u.id}"]`);
  if (card && !quiet) {
    card.classList.add('bought');
    card.disabled = true;
    upgradesHoldUntil = Date.now() + 380;
    setTimeout(() => renderUpgrades(), 400);
  }
  if (u.key) {
    state.unlocks.add(u.key);
    toast(`<strong>${u.name} · ${u.effect}</strong><br><span class="muted">${u.toast}</span>`, u.icon);
    SFX.win();
    if (u.key === 'series') nextSeriesAt = Date.now() + 2500;
  } else {
    state.upgrades.add(u.id);
    SFX.buy();
  }
  mods = computeMods();
  render();
}

// ---------- Kampf ----------

function currentLevel() {
  return (state.wave - 1) * WAVE_SIZE + state.enemyIndex + 1;
}

function isBossWave(wave) {
  return wave % BOSS_EVERY_WAVES === 0;
}

// Der letzte Platz einer Boss-Welle gehört dem Wochenlimit.
function isBossSlot() {
  return isBossWave(state.wave) && state.enemyIndex === WAVE_SIZE - 1;
}

function bossTier(wave) {
  return Math.ceil(wave / BOSS_EVERY_WAVES);
}

function roman(n) {
  const table = [[1000, 'M'], [900, 'CM'], [500, 'D'], [400, 'CD'], [100, 'C'], [90, 'XC'], [50, 'L'], [40, 'XL'], [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I']];
  let out = '';
  for (const [value, sign] of table) {
    while (n >= value) {
      out += sign;
      n -= value;
    }
  }
  return out;
}

function bossName(tier) {
  return tier > 1 ? `${BOSS.name} ${roman(tier)}` : BOSS.name;
}

function bossMaxHp(wave) {
  return enemyMaxHp(wave, WAVE_SIZE - 1) * BOSS_HP_MULT * BOSS_TIER_GROWTH ** (bossTier(wave) - 1);
}

function spawnEnemy() {
  state.enemy = newEnemy(state.wave, state.enemyIndex, state.highestWave);
}

function target() {
  if (state.boss) {
    const b = state.boss;
    return {
      model: BOSS, name: bossName(b.tier), tag: `Boss · Level ${fmt(currentLevel())}`, tagClass: 'boss', seed: 7 + b.tier, hue: BOSS.hue,
      ultra: false, trait: null, vortex: false, unit: b, maxHp: b.maxHp, meter: BOSS_METER, isBoss: true,
    };
  }
  const model = MODELS[state.enemy.kind];
  const ultra = state.enemyIndex === WAVE_SIZE - 1;
  const base = ultra ? `${model.name} ${state.wave} Ultra` : `${model.name} ${state.wave}.${state.enemyIndex + 1}`;
  const copy = state.enemy.forked === 'swarm' ? 'Kopie' : 'Fork';
  return {
    model,
    trait: state.enemy.trait,
    vortex: Boolean(state.enemy.vortex),
    // Jede KI bekommt eine leicht eigene Farbnuance ihres Modells.
    hue: (model.hue + (state.enemy.seed % 25) - 12 + 360) % 360,
    ultra,
    name: state.enemy.forked ? `${base} (${copy})` : base,
    tag: ultra ? `Ultra · ${WAVE_SIZE}/${WAVE_SIZE}` : `KI ${state.enemyIndex + 1}/${WAVE_SIZE}`,
    tagClass: ultra ? 'ultra' : '',
    seed: state.enemy.seed,
    unit: state.enemy,
    maxHp: state.enemy.maxHp ?? enemyMaxHp(state.wave, state.enemyIndex),
    meter: ENEMY_METER,
    isBoss: false,
  };
}

// Jeder Schadenspunkt bringt Tokens. Überschüssiger Schaden geht auf die nächste KI über.
function attack(amount) {
  if (!(amount > 0)) return;
  // Token-Fresser: Treffer bringen nur halb so viele Tokens
  const greed = !state.boss && state.enemy.trait === 'greedy' ? 0.5 : 1;
  earn(amount * tokenRate() * tokenBoost() * greed);
  let left = amount;
  for (let guard = 0; left > 0 && guard < 500; guard++) {
    const unit = state.boss || state.enemy;
    const hit = Math.min(left, unit.hp);
    unit.hp -= hit;
    left -= hit;
    if (unit.hp > 0) break;
    if (state.boss) defeatBoss();
    else defeatEnemy();
  }
}

let lastLimitPopup = 0;

function defeatEnemy() {
  const e = state.enemy;
  const t = target();
  const loot = t.maxHp * LOOT_MULT * (1 + mods.loot) * tokenRate() * tokenBoost()
    * (e.trait === 'greedy' ? 2 : 1) * (e.vortex ? VORTEX_LOOT : 1);
  earn(loot);
  state.kills++;
  missionProgress('kills');
  if (e.trait) {
    state.traitKills++;
    missionProgress('traits');
  }
  if (e.vortex && !e.forked) collectVortex(e.kind);
  if (!quiet && Date.now() - lastLimitPopup > 450) {
    lastLimitPopup = Date.now();
    popup('Limit erreicht', 'limit', freeX(50), 18);
    popup(`+${fmt(loot)}`, 'loot', freeX(50), 30, true);
    deathEcho();
    fxRing(freeX(50), 50, { size: 300, color: `hsl(${Math.round(t.hue)} 95% 64%)`, dur: 620, width: 6 });
    fxBurst(freeX(50), 50, { count: e.vortex ? 30 : 22, hue: e.vortex ? 280 : t.hue, spread: 150, size: 10, fall: 60, dur: 850 });
    SFX.kill();
  }
  // Forkt sich bzw. Schwarm: Die Kopien müssen auch noch besiegt werden.
  const copies = e.forked ? e.copiesLeft || 0 : e.trait === 'fork' ? 1 : e.trait === 'swarm' ? 2 : 0;
  if (copies > 0) {
    const hp = e.forked ? t.maxHp : t.maxHp * (e.trait === 'swarm' ? SWARM_HP : FORK_HP);
    const copyKind = e.forked || e.trait;
    state.enemy = { kind: e.kind, seed: e.seed + 1, hp, maxHp: hp, trait: null, vortex: e.vortex, forked: copyKind, copiesLeft: copies - 1, spawnedAt: e.spawnedAt };
    if (!quiet) popup(copyKind === 'swarm' ? 'Schwarm!' : 'Fork!', 'limit', freeX(50), 30);
    return;
  }
  if (state.enemyIndex === WAVE_SIZE - 1) {
    state.ultraWins++;
    missionProgress('ultras');
  }
  nextEnemy();
}

function collectVortex(kind) {
  const first = !state.vortex.has(kind);
  state.vortex.add(kind);
  state.vortexKills++;
  if (quiet) return;
  showOverlay(first ? `Dark Vortex gesammelt: ${MODELS[kind].name}` : 'Dark Vortex besiegt', logoSvg(MODELS[kind].family, MODELS[kind].hue, catalogSeed(kind), { vortex: true, letter: MODELS[kind].name[0] }));
  toast(first
    ? `<strong>Dark Vortex gesammelt</strong><br><span class="muted">${MODELS[kind].name} glänzt jetzt in deiner Sammlung.</span>`
    : `<strong>Dark Vortex besiegt</strong> · ×${VORTEX_LOOT} Beute`, 'vortex');
}

// Weiter zur nächsten KI; am Ende einer Boss-Welle wartet das Wochenlimit.
function nextEnemy() {
  state.enemyIndex++;
  if (state.enemyIndex >= WAVE_SIZE) {
    nextWave();
  } else if (isBossSlot()) {
    // Boss verloren oder Rückzug: Die Welle wird gefarmt, bis du ihn erneut herausforderst.
    if (state.bossBlocked) {
      state.enemyIndex = 0;
    } else {
      spawnEnemy();
      startBoss();
      return;
    }
  }
  spawnEnemy();
}

function nextWave() {
  const from = state.wave;
  // Wellensprung (Fähigkeitenbaum) – aber nie über einen Boss hinweg
  const skip = mods.waveSkip > 0 && !isBossWave(from + 1) && Math.random() < mods.waveSkip;
  state.wave = from + (skip ? 2 : 1);
  state.enemyIndex = 0;
  state.runWave = Math.max(state.runWave, state.wave);
  if (skip) popup('Wellensprung', 'limit', freeX(50), 30);
  // Meilenstein alle 10 Wellen
  const milestone = Math.floor(state.wave / 10) * 10;
  if (milestone > from) {
    const reward = Math.max(500, incomeRate() * 300) * mods.rewardMult;
    earn(reward);
    toast(`<strong>Welle ${milestone}</strong> · Meilenstein +${fmt(reward)} Tokens<br><span class="muted">Tokens pro Schaden jetzt +${fmt((tokenPerDamage() - 1) * 100)} %</span>`, 'wave');
  }
  if (state.wave > state.highestWave) {
    const before = state.highestWave;
    state.highestWave = state.wave;
    for (const skill of SKILLS.filter(k => k.wave > before && k.wave <= state.wave)) {
      toast(`<strong>${skill.name} verfügbar</strong><br><span class="muted">Im Tab „Fähigkeiten“ freischalten.</span>`, skill.icon);
    }
  }
}

// Ultra-KIs müssen vor ihrem Launch fallen, sonst geht es zurück zu KI 1 der Welle.
function checkUltra(now) {
  if (state.boss || state.enemyIndex !== WAVE_SIZE - 1) return;
  if (now - state.enemy.spawnedAt < mods.ultraTime) return;
  state.ultraFails++;
  state.enemyIndex = 0;
  clock = now;
  spawnEnemy();
  if (!quiet) {
    toast('<strong>Launch verpasst.</strong> Die Ultra-KI ist live gegangen. Zurück zu KI 1 dieser Welle.', 'rocket');
    SFX.fail();
  }
}

// Flüchtige KIs hauen nach einer Weile ab – ohne Beute und mit einem Teil deiner Tokens.
function checkFleeting(now) {
  const e = state.enemy;
  if (state.boss || e.trait !== 'fleeting' || now - e.spawnedAt < FLEETING_MS) return;
  clock = now;
  if (!quiet) {
    const stolen = state.tokens * FLEETING_STEAL;
    state.tokens -= stolen;
    popup(stolen >= 1 ? `Entkommen · −${fmt(stolen)}` : 'Entkommen', 'blocked', freeX(50), 22);
    SFX.fail();
  }
  nextEnemy();
}

function shieldUp(unit, now) {
  return (now - unit.spawnedAt) % SHIELD_CYCLE_MS >= SHIELD_CYCLE_MS - SHIELD_UP_MS;
}

function hardenLevel(unit, now) {
  return Math.min(HARDEN_MAX, HARDEN_STEP * Math.max(0, now - unit.spawnedAt) / 1000);
}

// Schadensfaktor je nach Ziel: Eigenschaften, Panzerung, Ultra, Boss, Endspurt
function damageFactor(source) {
  const t = target();
  let f = 1;
  if (t.trait) {
    f *= 1 + mods.traitDmg;
    if (t.trait === 'armored') f *= source === 'helper' ? Math.min(1, 0.5 + mods.armorPierce) : source === 'tap' ? 1.5 : 1;
    else if (t.trait === 'shield' && shieldUp(t.unit, clock)) f *= SHIELD_FACTOR;
    else if (t.trait === 'harden') f *= 1 - hardenLevel(t.unit, clock);
  }
  if (t.ultra) f *= 1 + mods.ultraDmg;
  if (t.isBoss) f *= 1 + mods.bossDmg;
  if (t.unit.hp < t.maxHp * 0.2) f *= 1 + mods.execute;
  return f;
}

// ---------- Das Wochenlimit (Boss alle 500 Level) ----------

function startBoss() {
  const tier = bossTier(state.wave);
  const maxHp = bossMaxHp(state.wave);
  state.boss = { tier, maxHp, hp: maxHp, startedAt: clock };
  clearAttacks();
  nextAttackAt = clock + BOSS_ATTACK_DELAY_MS;
  if (!quiet) {
    showOverlay(`${bossName(tier)} erscheint`, logoSvg('boss', BOSS.hue, 7 + tier, { still: true }));
    SFX.boss();
  }
}

function checkBoss(now) {
  if (state.boss && now - state.boss.startedAt >= mods.bossTime) endBossFight(now, false);
}

// Zeit abgelaufen oder Rückzug: zurück zu KI 1 der Welle. Das Wochenlimit wartet auf eine Revanche.
function endBossFight(now, retreated) {
  const name = bossName(state.boss.tier);
  state.boss = null;
  state.bossBlocked = true;
  state.enemyIndex = 0;
  clock = now;
  spawnEnemy();
  clearAttacks();
  if (retreated) {
    toast(`<strong>Rückzug.</strong> ${name} wartet mit vollem Limit. Fordere es erneut heraus, wenn du bereit bist.`, 'clock');
    return;
  }
  state.bossFails++;
  toast(`<strong>${name} hat gewonnen.</strong> Werde stärker – mit Helfern, Upgrades oder Prestige – und fordere es erneut heraus.`, 'clock');
  SFX.fail();
}

function challengeBoss() {
  if (state.boss || !state.bossBlocked || !isBossWave(state.wave)) return;
  state.bossBlocked = false;
  state.enemyIndex = WAVE_SIZE - 1;
  clock = Date.now();
  spawnEnemy();
  startBoss();
  render();
}

function retreat() {
  if (!state.boss) return;
  endBossFight(Date.now(), true);
  render();
}

function defeatBoss() {
  const tier = state.boss.tier;
  state.boss = null;
  clearAttacks();
  state.kills++;
  state.bossWins++;
  state.bossBest = Math.max(state.bossBest, tier);
  missionProgress('kills');
  mods = computeMods();
  const reward = Math.max(1000, incomeRate() * 3600) * mods.rewardMult;
  earn(reward);
  const insight = BOSS_INSIGHTS * tier;
  state.insights += insight;
  state.insightsEarned += insight;
  if (!quiet) {
    showOverlay(`${bossName(tier)} besiegt`, icon('seal'));
    SFX.win();
  }
  toast(`<strong>${bossName(tier)} besiegt.</strong> +${fmt(reward)} Tokens, +${fmt(insight)} Erkenntnisse und dauerhaft +${BOSS_WIN_BONUS * 100} % Schaden.`, 'seal');
  nextWave();
  spawnEnemy();
}

const combo = { count: 0, lastAt: 0 };
// Negativ-Effekte durch Boss-Angriffe (bis zu diesem Zeitpunkt aktiv)
const debuffs = { helpers: 0, lock: 0, blind: 0 };
// Halluziniert: zwei falsche Schwachstellen
let fakes = [];
let lastShieldPopup = 0;
let autoTapAcc = 0;
let lastAutoBuy = Date.now();
let teleportAt = 0;
const tapLog = [];
let throttledUntil = 0;
let lastThrottlePopup = 0;
let autoTaps = 0;
let weak = { x: 0.5, y: 0.5, vx: 1, vy: 0, movedAt: 0 };

function comboMult() {
  return 1 + Math.min(combo.count, mods.comboCap) * (COMBO_STEP + mods.comboStep);
}

const chain = { count: 0, lastAt: 0, misses: 0 };

// 0 = entspannt (bis Glied 15), 1 = maximal schwer (ab Glied 75); dazwischen erst sanft, dann steiler
function chainDifficulty(count = chain.count) {
  return clamp01((count - CHAIN_EASY_UNTIL) / (CHAIN_HARD_AT - CHAIN_EASY_UNTIL)) ** 1.4;
}

function chainWindow() {
  return CHAIN_WINDOW_EASY - (CHAIN_WINDOW_EASY - CHAIN_WINDOW_HARD) * chainDifficulty() + mods.chainWindow;
}

// Krit-Multiplikator für den nächsten Treffer auf die Schwachstelle
function chainCritMult(count = chain.count) {
  return CRIT_MULT * mods.crit * (1 + (CHAIN_BONUS + mods.chainBonus) * count);
}

function weakRadius() {
  const size = CHAIN_SIZE_EASY - (CHAIN_SIZE_EASY - CHAIN_SIZE_HARD) * chainDifficulty() * mods.chainShrink;
  return WEAKSPOT_RADIUS * mods.weakSize * size;
}

function breakChain(now) {
  if (chain.count >= 3) {
    popup(`Kette gerissen · ${chain.count}`, 'blocked', freeX(50), 22);
    SFX.chainBreak();
  }
  chain.count = 0;
  chain.misses = 0;
  moveWeakSpot(now);
}

// Ab einer längeren Kette wandert die Schwachstelle und prallt am Rand ab.
function driftWeakSpot(dtMs) {
  const speed = CHAIN_DRIFT_MAX * chainDifficulty() * mods.drift;
  const el = $('weakspot');
  el.classList.toggle('drift', speed > 0);
  if (!speed) return;
  weak.x += weak.vx * speed * dtMs / 1000;
  weak.y += weak.vy * speed * dtMs / 1000;
  const dx = weak.x - 0.5;
  const dy = weak.y - 0.5;
  const d = Math.hypot(dx, dy);
  if (d > 0.3) {
    const nx = dx / d;
    const ny = dy / d;
    const dot = weak.vx * nx + weak.vy * ny;
    weak.vx -= 2 * dot * nx;
    weak.vy -= 2 * dot * ny;
    weak.x = 0.5 + nx * 0.3;
    weak.y = 0.5 + ny * 0.3;
  }
  el.style.left = `${weak.x * 100}%`;
  el.style.top = `${weak.y * 100}%`;
}

// Zufällige Stelle innerhalb der KI mit Abstand zu den angegebenen Punkten
function randomSpot(avoid, minDist) {
  let x = 0.5;
  let y = 0.5;
  for (let tries = 0; tries < 12; tries++) {
    const a = Math.random() * Math.PI * 2;
    const r = Math.sqrt(Math.random()) * 0.27;
    x = 0.5 + Math.cos(a) * r;
    y = 0.5 + Math.sin(a) * r;
    if (avoid.every(p => Math.hypot(x - p.x, y - p.y) > minDist)) break;
  }
  return { x, y };
}

// Die Schwachstelle springt an eine neue Stelle innerhalb der KI.
function moveWeakSpot(now) {
  // Neue Stelle mit etwas Abstand zur alten, damit jeder Treffer neu gezielt werden muss.
  const { x, y } = randomSpot([weak], 0.16);
  const dir = Math.random() * Math.PI * 2;
  weak = { x, y, vx: Math.cos(dir), vy: Math.sin(dir), movedAt: now };
  const el = $('weakspot');
  el.style.left = `${weak.x * 100}%`;
  el.style.top = `${weak.y * 100}%`;
  $('enemy').style.setProperty('--weak-size', String(weakRadius() * 2 * WEAKSPOT_VISUAL));
  restartAnimation(el, 'pop');
  // Die falschen Punkte (Halluziniert) springen mit.
  const f1 = randomSpot([weak], 0.2);
  fakes = [f1, randomSpot([weak, f1], 0.2)];
  document.querySelectorAll('.weakspot.fake').forEach((f, i) => {
    f.style.left = `${fakes[i].x * 100}%`;
    f.style.top = `${fakes[i].y * 100}%`;
    restartAnimation(f, 'pop');
  });
}

// Ein Tap auf die KI – vom Finger/der Maus (mit Koordinaten), vom Prompt-Sturm (auto)
// oder von den Aufmerksamkeitsköpfen aus dem Fähigkeitenbaum (auto + passive: ohne Combo, leise).
function doTap({ clientX = null, clientY = null, auto = false, passive = false } = {}) {
  const now = Date.now();
  clock = now;
  const t = target();
  // Boss-Angriff „Taps gesperrt“
  if (now < debuffs.lock) {
    if (!auto && now - lastThrottlePopup > 350) {
      lastThrottlePopup = now;
      popup('Gesperrt', 'blocked', randomBetween(40, 60), randomBetween(30, 45));
    }
    return;
  }
  if (!auto && t.trait === 'ratelimit') {
    if (now < throttledUntil) {
      if (now - lastThrottlePopup > 350) {
        lastThrottlePopup = now;
        popup('429', 'blocked', randomBetween(40, 60), randomBetween(30, 45));
      }
      return;
    }
    tapLog.push(now);
    while (tapLog.length && tapLog[0] < now - 1000) tapLog.shift();
    if (tapLog.length > RATE_LIMIT_TAPS + mods.rateTaps) {
      throttledUntil = now + RATE_LIMIT_MS;
      tapLog.length = 0;
      combo.count = 0;
      state.rateLimited++;
      SFX.limited();
      return;
    }
  }
  if (!passive) {
    if (now - combo.lastAt > mods.comboWindow) combo.count = 0;
    combo.count++;
    combo.lastAt = now;
    state.maxCombo = Math.max(state.maxCombo, combo.count);
    missionProgress('combo', combo.count, true);
  }
  if (auto) autoTaps++;
  else {
    state.clicks++;
    missionProgress('taps');
  }
  const showAuto = autoTaps % (passive ? 4 : 3) === 0;

  // Schadenszahl dort, wo getippt wurde (per Tastatur oder Sturm: rund um die Mitte)
  const arena = $('arena').getBoundingClientRect();
  const x = clientX !== null ? (clientX - arena.left) / arena.width * 100 : freeX(randomBetween(38, 62));
  const y = clientY !== null ? (clientY - arena.top) / arena.height * 100 - 8 : randomBetween(32, 55);

  // Glitcht: Manche Taps gehen ins Leere.
  if (t.trait === 'glitch' && Math.random() < GLITCH_CHANCE) {
    if (!auto || showAuto) popup('Glitch', 'blocked', x, y);
    return;
  }

  // Die KI weicht vom Tap weg und kippt leicht.
  const glyph = $('glyph');
  if (clientX !== null) {
    const r = $('enemy').getBoundingClientRect();
    const dx = Math.max(-0.5, Math.min(0.5, (clientX - r.left) / r.width - 0.5));
    const dy = Math.max(-0.5, Math.min(0.5, (clientY - r.top) / r.height - 0.5));
    glyph.style.setProperty('--kx', `${(-dx * 18).toFixed(1)}px`);
    glyph.style.setProperty('--ky', `${(-dy * 18).toFixed(1)}px`);
    glyph.style.setProperty('--kr', `${(dx * 10).toFixed(1)}deg`);
  }

  let onSpot = false;
  let onFake = false;
  if (clientX !== null && now >= debuffs.blind && hasUnlock('crit')) {
    const r = $('enemy').getBoundingClientRect();
    const px = (clientX - r.left) / r.width;
    const py = (clientY - r.top) / r.height;
    const radius = weakRadius();
    onSpot = Math.hypot(px - weak.x, py - weak.y) <= radius;
    onFake = !onSpot && t.trait === 'decoy' && fakes.some(f => Math.hypot(px - f.x, py - f.y) <= radius);
  }
  // Exploit-Modus: jeder Tap kann kritisch treffen, auch ohne die Schwachstelle
  const lucky = !onSpot && skillActive('crit', now) && Math.random() * 100 < skillPower('crit');
  const crit = onSpot || lucky;
  // Krit-Kette: nur gezielte Treffer verlängern sie, ein Fehltipp lässt sie reißen.
  // Zufalls-Krits halten sie; Taps ohne Zielpunkt (Tastatur, Prompt-Sturm) zählen nicht.
  let critMult = CRIT_MULT * mods.crit;
  if (onSpot && hasUnlock('chain')) {
    critMult = chainCritMult();
    chain.count++;
    chain.lastAt = now;
    state.bestChain = Math.max(state.bestChain, chain.count);
    missionProgress('chain', chain.count, true);
    restartAnimation($('chain'), 'bump');
    maybeChainSeries(now);
  } else if (onFake) {
    // Halluziniert: Wer auf eine falsche Schwachstelle hereinfällt, verliert die Kette sofort.
    popup('Halluzination!', 'blocked', x, y - 6);
    if (chain.count > 0) breakChain(now);
    else moveWeakSpot(now);
  } else if (clientX !== null && !lucky && chain.count > 0) {
    if (chain.misses < mods.chainGrace) {
      chain.misses++;
      popup('Knapp!', 'blocked', freeX(50), 22);
    } else {
      breakChain(now);
    }
  }
  if (!auto && t.trait === 'shield' && shieldUp(t.unit, now) && now - lastShieldPopup > 500) {
    lastShieldPopup = now;
    popup('Schild', 'blocked', x, y - 12);
  }
  const focus = skillActive('focus', now) ? skillPower('focus') : 1;
  const double = Math.random() < mods.doubleTap ? 2 : 1;
  const dmg = clickValue(now) * comboMult() * focus * double * (crit ? critMult : 1) * damageFactor('tap');

  const tapY = clientY !== null ? y + 8 : y;
  if (crit) {
    state.crits++;
    missionProgress('crits');
    popup(onSpot && chain.count >= 2 ? `Kette ${chain.count} · −${fmt(dmg, 1)}` : `Kritisch −${fmt(dmg, 1)}`, onSpot && chain.count >= 5 ? 'crit huge' : 'crit', x, y);
    restartAnimation($('arena'), chain.count >= 10 ? 'shake-big' : 'shake');
    fxRing(x, tapY, { size: 90 + Math.min(chain.count, 30) * 4, color: '#fff', dur: 420, width: 3 });
    fxBurst(x, tapY, { count: 10 + Math.min(chain.count, 20), hue: t.hue, spread: 80 + Math.min(chain.count, 30) * 2, size: 6, fall: 24 });
    SFX.crit(onSpot ? chain.count : 0);
    if (onSpot) moveWeakSpot(now);
  } else if (!auto || showAuto) {
    popup(`−${fmt(dmg, 1)}`, auto ? 'auto' : 'dmg', x, y);
    if (!auto) fxBurst(x, tapY, { count: 4, hue: t.hue, spread: 34, size: 4, fall: 12, dur: 420 });
    if (!passive) SFX.tap(combo.count);
  }
  if (!auto && combo.count % 10 === 0) restartAnimation($('combo'), 'bump');
  if (!passive || showAuto) restartAnimation(glyph, crit ? 'crithit' : 'hit');
  attack(dmg);
}

function attackTap(event) {
  const pointer = event.detail > 0;
  if (pointer) event.currentTarget.blur();
  doTap({ clientX: pointer ? event.clientX : null, clientY: pointer ? event.clientY : null });
  render();
}

// Simuliert die Kämpfe der Helfer über einen Zeitraum (laufend und offline).
function advance(ms, end) {
  if (ms <= 0) return;
  const steps = Math.min(MAX_SIM_STEPS, Math.max(1, Math.ceil(ms / 1000)));
  const stepMs = ms / steps;
  for (let i = 1; i <= steps; i++) {
    const t = end - ms + i * stepMs;
    clock = t;
    checkUltra(t);
    checkBoss(t);
    checkFleeting(t);
    if (!state.boss && state.enemy.trait === 'regen') {
      const maxHp = target().maxHp;
      state.enemy.hp = Math.min(maxHp, state.enemy.hp + maxHp * REGEN_PER_S * mods.regen * stepMs / 1000);
    }
    let dmg = baseDps() * helperFactor(t) * damageFactor('helper');
    // Offline übernehmen die Aufmerksamkeitsköpfe ihre Auto-Taps direkt.
    if (quiet) dmg += clickValue(t) * mods.autoTap * damageFactor('tap');
    attack(dmg * stepMs / 1000);
  }
}

// ---------- Fähigkeiten ----------

let stormAcc = 0;

function skillUnlocked(skill) {
  return state.skills[skill.id].level > 0;
}

function skillCost(skill) {
  return skill.cost * SKILL_COST_GROWTH ** state.skills[skill.id].level;
}

function canLevelSkill(skill) {
  const lvl = state.skills[skill.id].level;
  return lvl < SKILL_MAX_LEVEL && state.highestWave >= skill.wave && state.tokens >= skillCost(skill);
}

function levelSkill(id) {
  const skill = skillDef(id);
  if (!canLevelSkill(skill)) return;
  state.tokens -= skillCost(skill);
  const st = state.skills[id];
  st.level++;
  toast(st.level === 1
    ? `<strong>${skill.name} freigeschaltet</strong><br><span class="muted">${skill.describe(1)}</span>`
    : `<strong>${skill.name} · Stufe ${st.level}</strong><br><span class="muted">${skill.describe(st.level)}</span>`, skill.icon);
  SFX.win();
  render();
}

function useSkill(id) {
  const skill = skillDef(id);
  const st = state.skills[id];
  const now = Date.now();
  if (!skill) return;
  if (!skillUnlocked(skill)) {
    state.tab = 'skills';
    renderTabs();
    toast(`<strong>${skill.name}</strong> schaltest du im Tab „Fähigkeiten“ frei${state.highestWave < skill.wave ? ` (ab Welle ${skill.wave})` : ''}.`, skill.icon);
    render();
    return;
  }
  if (now < st.readyAt) return;
  if (!state.boss && state.enemy.trait === 'silence') {
    popup('Schweigepflicht', 'blocked', freeX(50), 72);
    SFX.limited();
    return;
  }
  st.readyAt = now + skill.cooldown(st.level) * mods.cooldown;
  state.skillUses++;
  missionProgress('skills');
  SFX.skill();
  if (id === 'bomb') {
    clock = now;
    const dmg = (baseDps() * skillPower('bomb') + clickValue(now) * (20 + 10 * st.level) * mods.skillPower) * damageFactor('skill');
    popup(`Superschlag −${fmt(dmg)}`, 'crit', freeX(50), 40);
    restartAnimation($('arena'), 'flash');
    restartAnimation($('arena'), 'shake');
    attack(dmg);
  } else {
    st.activeUntil = now + skill.duration(st.level) * mods.skillDuration;
  }
  render();
}

// ---------- Aufträge ----------

function missionType(type) {
  return MISSION_TYPES.find(t => t.type === type);
}

function newMission(exclude) {
  const pool = MISSION_TYPES.filter(t => !exclude.includes(t.type) && (!t.when || t.when(state)));
  const t = pool[Math.floor(Math.random() * pool.length)];
  const [lo, hi] = t.range;
  return {
    type: t.type,
    target: Math.round(lo + Math.random() * (hi - lo)),
    progress: 0,
    reward: Math.round(Math.max(250, incomeRate() * (150 + Math.random() * 150))),
  };
}

function ensureMissions() {
  while (state.missions.length < MISSION_COUNT) state.missions.push(newMission(state.missions.map(m => m.type)));
}

// value: Anzahl (aufaddiert) bzw. bei isMax der neue Höchstwert (z. B. Combo)
function missionProgress(type, value = 1, isMax = false) {
  let done = false;
  for (const m of state.missions) {
    if (m.type !== type) continue;
    m.progress = isMax ? Math.max(m.progress, value) : m.progress + value;
    if (m.progress >= m.target) {
      done = true;
      const reward = m.reward * (1 + mods.missionReward);
      earn(reward);
      state.missionsDone++;
      toast(`<strong>Auftrag erledigt</strong> · ${missionType(m.type).text(m.target)}<br><span class="muted">+${fmt(reward)} Tokens</span>`, 'checklist');
      SFX.win();
    }
  }
  if (done) {
    state.missions = state.missions.filter(m => m.progress < m.target);
    ensureMissions();
  }
}

// ---------- Töne (Web Audio, dezent) ----------

const audio = { ctx: null };

function blip({ freq = 440, to = freq, dur = 0.08, type = 'sine', gain = 0.04, delay = 0 }) {
  if (!state.sound || quiet || document.hidden) return;
  try {
    audio.ctx ??= new (window.AudioContext || window.webkitAudioContext)();
    const ctx = audio.ctx;
    if (ctx.state === 'suspended') ctx.resume();
    const t = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t);
    osc.frequency.exponentialRampToValueAtTime(to, t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(gain, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.connect(g).connect(ctx.destination);
    osc.start(t);
    osc.stop(t + dur + 0.02);
  } catch {
    // Kein Ton verfügbar – das Spiel läuft auch ohne.
  }
}

// Kurzes Rauschen als knackiger Anschlag (für Treffer im Takt)
function click({ freq = 3200, gain = 0.06, dur = 0.035, delay = 0 } = {}) {
  if (!state.sound || quiet || document.hidden) return;
  try {
    audio.ctx ??= new (window.AudioContext || window.webkitAudioContext)();
    const ctx = audio.ctx;
    if (!audio.noise) {
      audio.noise = ctx.createBuffer(1, Math.round(ctx.sampleRate * 0.06), ctx.sampleRate);
      const data = audio.noise.getChannelData(0);
      for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    }
    const t = ctx.currentTime + delay;
    const src = ctx.createBufferSource();
    src.buffer = audio.noise;
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = freq;
    filter.Q.value = 1.4;
    const g = ctx.createGain();
    g.gain.setValueAtTime(gain, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.connect(filter).connect(g).connect(ctx.destination);
    src.start(t);
    src.stop(t + dur + 0.01);
  } catch {
    // Kein Ton verfügbar.
  }
}

// Ton, der beim Wischen über einen Bogen mitsteigt
function slideTone() {
  if (!state.sound || quiet || document.hidden) return null;
  try {
    audio.ctx ??= new (window.AudioContext || window.webkitAudioContext)();
    const ctx = audio.ctx;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.value = 420;
    g.gain.setValueAtTime(0.0001, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.03, ctx.currentTime + 0.03);
    osc.connect(g).connect(ctx.destination);
    osc.start();
    return {
      set: p => osc.frequency.setTargetAtTime(420 + 940 * p, ctx.currentTime, 0.012),
      stop: () => {
        g.gain.setTargetAtTime(0.0001, ctx.currentTime, 0.02);
        osc.stop(ctx.currentTime + 0.12);
      },
    };
  } catch {
    return null;
  }
}

const SFX = {
  tap: n => blip({ freq: 520 + Math.min(n, 60) * 8, to: 360, dur: 0.06, gain: 0.025 }),
  crit: (n = 0) => {
    const up = 1 + Math.min(n, 25) * 0.04;
    blip({ freq: 880 * up, to: 1320 * up, dur: 0.12, type: 'triangle', gain: 0.045 });
    blip({ freq: 1320 * up, to: 1760 * up, dur: 0.14, type: 'triangle', gain: 0.035, delay: 0.06 });
  },
  chainBreak: () => blip({ freq: 660, to: 220, dur: 0.35, type: 'triangle', gain: 0.035 }),
  kill: () => blip({ freq: 320, to: 90, dur: 0.2, type: 'triangle', gain: 0.05 }),
  limited: () => blip({ freq: 190, to: 140, dur: 0.22, type: 'square', gain: 0.02 }),
  skill: () => blip({ freq: 240, to: 980, dur: 0.3, type: 'sawtooth', gain: 0.02 }),
  fail: () => blip({ freq: 320, to: 110, dur: 0.5, type: 'sawtooth', gain: 0.025 }),
  win: () => [660, 880, 1320].forEach((freq, i) => blip({ freq, dur: 0.16, type: 'triangle', gain: 0.035, delay: i * 0.08 })),
  parry: () => {
    blip({ freq: 990, to: 1480, dur: 0.1, type: 'triangle', gain: 0.045 });
    blip({ freq: 1480, to: 1980, dur: 0.12, type: 'sine', gain: 0.03, delay: 0.05 });
  },
  hurt: () => blip({ freq: 180, to: 60, dur: 0.4, type: 'sawtooth', gain: 0.04 }),
  boss: () => [220, 165, 110].forEach((freq, i) => blip({ freq, to: freq * 0.85, dur: 0.38, type: 'sawtooth', gain: 0.028, delay: i * 0.2 })),
  learn: () => blip({ freq: 740, to: 1180, dur: 0.16, type: 'triangle', gain: 0.04 }),
  vortex: () => [523, 659, 784, 1047, 1319].forEach((freq, i) => blip({ freq, dur: 0.22, type: 'sine', gain: 0.03, delay: i * 0.07 })),
  // Flow-Serie: jeder Kreis eine Stufe höher (pentatonisch), perfekt mit hellem Oberton
  flow: (i, perfect) => {
    const freq = [659, 784, 880, 1047, 1175][Math.min(i, 4)];
    click({ freq: perfect ? 4200 : 3000, gain: 0.07 });
    blip({ freq, to: freq * 1.01, dur: 0.12, type: 'triangle', gain: 0.045 });
    if (perfect) blip({ freq: freq * 2, dur: 0.16, type: 'sine', gain: 0.024, delay: 0.02 });
  },
  swoosh: fast => {
    click({ freq: 5200, gain: 0.07, dur: 0.05 });
    blip({ freq: fast ? 1568 : 1319, to: fast ? 1760 : 1397, dur: 0.2, type: 'triangle', gain: 0.04 });
  },
  buy: () => blip({ freq: 880, to: 1320, dur: 0.07, type: 'triangle', gain: 0.03 }),
  slideTick: n => click({ freq: n === 1 ? 3600 : 4400, gain: 0.05, dur: 0.025 }),
  flowDone: perfect => (perfect ? [784, 988, 1175, 1568] : [659, 880, 1047]).forEach((freq, i) => blip({ freq, dur: 0.2, type: 'triangle', gain: 0.035, delay: i * 0.06 })),
};

// ---------- Hintergrund-Partikel je nach KI ----------
// Ein ruhiges Partikelfeld hinter der KI: Farbe und Form passen zur Logo-Bauart.
// Beim Wochenlimit steigt Glut auf, bei Dark Vortex wirbeln die Teilchen ins Zentrum.
const PARTICLE_SHAPES = {
  spark: ['sparkle', 'starburst', 'sparkring', 'chatspark', 'eclipse', 'compass', 'flame', 'bolt'],
  square: ['pixel', 'code', 'cube', 'gem', 'prism', 'monogram', 'shield', 'hourglass'],
  ring: ['orb', 'planet', 'dotring', 'atom', 'eye', 'aperture', 'borromean', 'loop', 'knot', 'trefoil'],
  line: ['voice', 'signal', 'swirl', 'spiral', 'chevron', 'pinwheel'],
};
// Bewegung je Logo-Bauart: funkeln, kreisen, rieseln, treiben, ausstrahlen oder aufsteigen
const PARTICLE_MOTIONS = {
  twinkle: ['sparkle', 'starburst', 'sparkring', 'compass', 'gem'],
  orbit: ['orb', 'planet', 'atom', 'swirl', 'spiral', 'loop', 'eclipse', 'borromean'],
  fall: ['pixel', 'code', 'cube', 'hourglass', 'monogram'],
  drift: ['voice', 'signal', 'chevron', 'leaves', 'pinwheel'],
  pulse: ['hexnode', 'molecule', 'dotring', 'eye', 'aperture', 'bloom', 'clover'],
};
const SHAPE_KEYS = ['dot', 'spark', 'square', 'ring', 'line'];
const field = { list: [], hue: 20, targetHue: 20, profile: null, canvas: null, ctx: null, w: 0, h: 0, last: 0 };

function particleShape(family) {
  return Object.keys(PARTICLE_SHAPES).find(k => PARTICLE_SHAPES[k].includes(family)) || 'dot';
}

// Jede KI hat ihr eigenes, festes Profil (aus ihrem Sammlungs-Seed): Form, Zweitform, Zweitfarbe, Tempo, Dichte
function setParticleTheme(t) {
  field.targetHue = t.isBoss ? 8 : t.hue;
  if (t.isBoss) {
    field.profile = { motion: 'ember', shape: 'dot', shape2: 'spark', mix: 0.2, hue2: 30, speed: 1, size: 1, density: 1.2, dir: 1, jitter: false };
    return;
  }
  const kind = state.enemy.kind;
  const rand = mulberry32(catalogSeed(kind) ^ 0x2545f491);
  const family = t.model.family;
  const motion = t.vortex ? 'vortex' : Object.keys(PARTICLE_MOTIONS).find(k => PARTICLE_MOTIONS[k].includes(family)) || 'rise';
  const shape = particleShape(family);
  const others = SHAPE_KEYS.filter(k => k !== shape);
  field.profile = {
    motion,
    shape,
    shape2: others[Math.floor(rand() * others.length)],
    mix: rand() * 0.35,
    hue2: (rand() - 0.5) * 140,
    speed: 0.7 + rand() * 0.8,
    size: 0.8 + rand() * 0.6,
    density: (0.75 + rand() * 0.6) * (modelRarity(kind) === 'epic' ? 1.3 : 1),
    dir: rand() > 0.5 ? 1 : -1,
    jitter: t.trait === 'glitch',
  };
}

function newParticle(initial) {
  const { w, h } = field;
  const pr = field.profile || { motion: 'rise', shape: 'dot', shape2: 'dot', mix: 0, hue2: 0, speed: 1, size: 1, dir: 1 };
  const alt = Math.random() < pr.mix;
  const p = {
    motion: pr.motion,
    shape: alt ? pr.shape2 : pr.shape,
    hueShift: (alt ? pr.hue2 : 0) + randomBetween(-14, 14),
    size: randomBetween(1.6, 4) * pr.size,
    rot: Math.random() * Math.PI,
    spin: randomBetween(-0.8, 0.8),
    phase: Math.random() * Math.PI * 2,
    age: 0,
    life: randomBetween(4, 9),
    x: Math.random() * w,
    y: Math.random() * h,
    vx: 0,
    vy: 0,
    sway: randomBetween(4, 14),
    angle: Math.random() * Math.PI * 2,
    radius: randomBetween(50, Math.min(w, h) * 0.6),
    spinSpeed: randomBetween(0.15, 0.4) * pr.speed * pr.dir,
  };
  const speed = pr.speed;
  if (p.shape === 'spark') p.size *= 1.45;
  // Steigen, Rieseln und Treiben: neue Teilchen blenden irgendwo in der Arena ein, damit alles gleichmäßig gefüllt bleibt.
  if (p.motion === 'rise') {
    p.vy = -randomBetween(8, 20) * speed;
  } else if (p.motion === 'fall') {
    p.vy = randomBetween(12, 26) * speed;
    p.spin = 0;
    p.rot = 0;
  } else if (p.motion === 'drift') {
    p.vx = pr.dir * randomBetween(14, 30) * speed;
    p.life = randomBetween(6, 12);
  } else if (p.motion === 'twinkle') {
    p.life = randomBetween(1.6, 3.2);
  } else if (p.motion === 'pulse') {
    p.radius = initial ? randomBetween(30, Math.max(w, h) * 0.5) : randomBetween(30, 60);
    p.vr = randomBetween(18, 36) * speed;
  } else if (p.motion === 'ember') {
    if (!initial) p.y = h + 10;
    p.vy = -randomBetween(26, 60);
    p.size = randomBetween(1.2, 3);
  } else if (p.motion === 'vortex') {
    p.radius = randomBetween(40, Math.max(w, h) * 0.6);
  }
  return p;
}

function drawParticle(ctx, p, x, y, alpha, light, scale = 1) {
  ctx.globalAlpha = alpha;
  const color = `hsl(${(field.hue + p.hueShift + 360) % 360}, 88%, ${light}%)`;
  ctx.fillStyle = color;
  ctx.strokeStyle = color;
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(p.rot);
  const s = p.size * scale;
  if (p.shape === 'spark') {
    ctx.beginPath();
    ctx.moveTo(0, -s * 1.8);
    ctx.quadraticCurveTo(s * 0.25, -s * 0.25, s * 1.8, 0);
    ctx.quadraticCurveTo(s * 0.25, s * 0.25, 0, s * 1.8);
    ctx.quadraticCurveTo(-s * 0.25, s * 0.25, -s * 1.8, 0);
    ctx.quadraticCurveTo(-s * 0.25, -s * 0.25, 0, -s * 1.8);
    ctx.fill();
  } else if (p.shape === 'square') {
    ctx.fillRect(-s, -s, s * 2, s * 2);
  } else if (p.shape === 'ring') {
    ctx.lineWidth = 1.3;
    ctx.beginPath();
    ctx.arc(0, 0, s * 1.4, 0, Math.PI * 2);
    ctx.stroke();
  } else if (p.shape === 'line') {
    ctx.lineWidth = 1.6;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-s * 1.8, 0);
    ctx.lineTo(s * 1.8, 0);
    ctx.stroke();
  } else {
    ctx.beginPath();
    ctx.arc(0, 0, s, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function particleFrame(ts) {
  requestAnimationFrame(particleFrame);
  if (document.hidden || LOGO_REDUCED_MOTION) return;
  const canvas = field.canvas;
  const dt = Math.min(0.05, (ts - (field.last || ts)) / 1000);
  field.last = ts;
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  const w = canvas.clientWidth;
  const h = canvas.clientHeight;
  if (!w || !h) return;
  if (w !== field.w || h !== field.h) {
    field.w = w;
    field.h = h;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    field.list = [];
  }
  // Die Dichte gleitet mit: fehlende Teilchen kommen nach und nach, überzählige vergehen
  const target = Math.round(w / 20 * (field.profile?.density || 1));
  if (!field.list.length) field.list = Array.from({ length: target }, () => newParticle(true));
  else if (field.list.length < target) field.list.push(newParticle(false));
  // Farbton weich zum Ziel (kürzester Weg auf dem Farbkreis)
  const diff = ((field.targetHue - field.hue + 540) % 360) - 180;
  field.hue = (field.hue + diff * Math.min(1, dt * 2.5) + 360) % 360;
  const ctx = field.ctx;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, w, h);
  const dark = document.documentElement.dataset.theme === 'dark'
    || (document.documentElement.dataset.theme !== 'light' && window.matchMedia('(prefers-color-scheme: dark)').matches);
  const maxAlpha = dark ? 0.55 : 0.42;
  const light = dark ? 68 : 58;
  const jitter = field.profile?.jitter;
  for (let i = field.list.length - 1; i >= 0; i--) {
    const p = field.list[i];
    p.age += dt;
    p.rot += p.spin * dt;
    let x = p.x;
    let y = p.y;
    let scale = 1;
    switch (p.motion) {
      case 'orbit':
        p.angle += p.spinSpeed * dt;
        x = w / 2 + Math.cos(p.angle) * p.radius;
        y = h / 2 + Math.sin(p.angle) * p.radius * 0.72;
        break;
      case 'pulse':
        p.radius += p.vr * dt;
        x = w / 2 + Math.cos(p.angle) * p.radius;
        y = h / 2 + Math.sin(p.angle) * p.radius * 0.8;
        break;
      case 'vortex':
        p.angle += dt * (0.5 + 40 / p.radius);
        p.radius = Math.max(8, p.radius - dt * 14);
        x = w / 2 + Math.cos(p.angle) * p.radius;
        y = h / 2 + Math.sin(p.angle) * p.radius * 0.8;
        break;
      case 'drift':
        p.x += p.vx * dt;
        x = p.x;
        y = p.y + Math.sin(p.age * 1.6 + p.phase) * p.sway;
        break;
      case 'twinkle':
        scale = 0.4 + 0.6 * Math.sin(Math.PI * Math.min(1, p.age / p.life));
        break;
      default:
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        x = p.x + Math.sin(p.age * 1.3 + p.phase) * p.sway;
        y = p.y;
    }
    if (jitter && Math.random() < 0.04) x += randomBetween(-6, 6);
    const fade = Math.min(1, p.age / 1.2, (p.life - p.age) / 1.5);
    const flicker = p.motion === 'ember' ? 0.65 + 0.35 * Math.sin(p.age * 12 + p.phase) : 1;
    if (fade > 0) drawParticle(ctx, p, x, y, maxAlpha * fade * flicker, light, scale);
    const gone = p.age >= p.life || y < -14 || y > h + 14 || x < -14 || x > w + 14 || (p.motion === 'vortex' && p.radius <= 8);
    if (gone) {
      if (field.list.length > target) field.list.splice(i, 1);
      else field.list[i] = newParticle(false);
    }
  }
  ctx.globalAlpha = 1;
}

function initParticles() {
  field.canvas = $('particles');
  field.ctx = field.canvas.getContext('2d');
  requestAnimationFrame(particleFrame);
}

// ---------- Effekte: Partikel, Schockwellen, Nachbild ----------

const FX_MAX = 110;

function fxReady() {
  return !quiet && !document.hidden && !LOGO_REDUCED_MOTION;
}

// Partikel-Explosion an einer Stelle der Arena (Angaben in Prozent)
function fxBurst(x, y, { count = 8, color = null, hue = 20, spread = 70, size = 6, fall = 30, dur = 650 } = {}) {
  if (!fxReady()) return;
  const layer = $('fx');
  while (layer.childElementCount > FX_MAX) layer.firstElementChild.remove();
  for (let i = 0; i < count; i++) {
    const p = document.createElement('span');
    p.className = 'fx-dot';
    const a = Math.random() * Math.PI * 2;
    const d = spread * (0.4 + Math.random() * 0.6);
    p.style.left = `${x}%`;
    p.style.top = `${y}%`;
    p.style.setProperty('--dx', `${Math.round(Math.cos(a) * d)}px`);
    p.style.setProperty('--dy', `${Math.round(Math.sin(a) * d)}px`);
    p.style.setProperty('--fall', `${Math.round(fall * (0.5 + Math.random()))}px`);
    p.style.setProperty('--s', `${(size * (0.6 + Math.random() * 0.8)).toFixed(1)}px`);
    p.style.setProperty('--dur', `${Math.round(dur * (0.75 + Math.random() * 0.5))}ms`);
    p.style.background = color || `hsl(${Math.round(hue + Math.random() * 50 - 25)}, 92%, ${Math.round(56 + Math.random() * 14)}%)`;
    p.addEventListener('animationend', () => p.remove());
    layer.append(p);
  }
}

// Schockwelle: ein Ring, der sich ausbreitet und verblasst
function fxRing(x, y, { color = 'var(--accent)', size = 120, dur = 500, width = 3 } = {}) {
  if (!fxReady()) return;
  const ring = document.createElement('span');
  ring.className = 'fx-ring';
  ring.style.left = `${x}%`;
  ring.style.top = `${y}%`;
  ring.style.setProperty('--size', `${size}px`);
  ring.style.setProperty('--dur', `${dur}ms`);
  ring.style.setProperty('--w', `${width}px`);
  ring.style.setProperty('--c', color);
  ring.addEventListener('animationend', () => ring.remove());
  $('fx').append(ring);
}

// Nachbild der besiegten KI: dehnt sich aus und verglüht, während die nächste erscheint
function deathEcho() {
  if (!fxReady()) return;
  const r = $('enemy').getBoundingClientRect();
  const a = $('arena').getBoundingClientRect();
  const echo = document.createElement('span');
  echo.className = 'death-echo';
  echo.innerHTML = $('glyph').innerHTML;
  Object.assign(echo.style, { left: `${r.left - a.left}px`, top: `${r.top - a.top}px`, width: `${r.width}px`, height: `${r.height}px` });
  echo.addEventListener('animationend', () => echo.remove());
  $('fx').append(echo);
}

// ---------- Kontext komprimieren (Prestige) ----------

function version() {
  return state.prestiges + 1;
}

// Erkenntnisse für einen Lauf bis zu dieser Welle
function prestigeGain(wave = state.runWave) {
  if (wave < PRESTIGE_MIN_WAVE) return 0;
  return Math.floor(3 * ((wave - 5) / 5) ** 1.5 * (1 + mods.prestigeGain) * mods.prestigeMult);
}

function nextGainWave() {
  const gain = prestigeGain();
  for (let w = state.runWave + 1; w < state.runWave + 1000; w++) if (prestigeGain(w) > gain) return w;
  return state.runWave + 1;
}

async function prestige() {
  if (prestigeGain() < 1) return;
  const ok = await showDialog({
    title: 'Kontext komprimieren?',
    text: `Du startest als v${version() + 1} neu. Tokens, Helfer, Upgrades, Fähigkeiten-Stufen und Welle werden zurückgesetzt.\n\nDafür bekommst du ${fmt(prestigeGain())} Erkenntnisse für den Fähigkeitenbaum, und jede Version macht dauerhaft ${VERSION_BONUS * 100} % stärker.\n\nBaum, Erkenntnisse, Boss-Siege, Sammlung, Erfolge und Aufträge bleiben.`,
    ok: 'Komprimieren',
    cancel: 'Abbrechen',
  });
  if (!ok) return;
  // Während der Dialog offen war, lief der Kampf weiter.
  const gain = prestigeGain();
  if (gain < 1) return;
  const fresh = freshState();
  state.insights += gain;
  state.insightsEarned += gain;
  state.prestiges++;
  Object.assign(state, {
    runEarned: 0,
    gens: fresh.gens,
    upgrades: new Set(),
    frenzyUntil: 0,
    wave: 1,
    runWave: 1,
    enemyIndex: 0,
    boss: null,
    bossBlocked: false,
  });
  mods = computeMods();
  state.tokens = mods.startTokens;
  // Fähigkeiten fangen wieder unten an – mit dem Fähigkeiten-Gedächtnis auf einer Startstufe.
  for (const k of SKILLS) {
    state.skills[k.id] = { level: state.highestWave >= k.wave ? Math.min(mods.skillStart, SKILL_MAX_LEVEL) : 0, readyAt: 0, activeUntil: 0 };
  }
  clock = Date.now();
  spawnEnemy();
  clearAttacks();
  combo.count = 0;
  chain.count = 0;
  chain.misses = 0;
  stormAcc = 0;
  autoTapAcc = 0;
  throttledUntil = 0;
  showOverlay(`Kontext komprimiert · v${version()}`, icon('compress'));
  toast(`<strong>Willkommen in v${version()}.</strong> +${fmt(gain)} Erkenntnisse für den Fähigkeitenbaum.`, 'compress');
  SFX.win();
  save();
  render();
}

// ---------- Fähigkeitenbaum ----------

function treeLevel(id) {
  return state.tree[id] || 0;
}

function treeNode(id) {
  return TREE.find(n => n.id === id);
}

function nodeCost(node, level = treeLevel(node.id)) {
  return Math.ceil(TREE_ROW_COST[node.row - 1] * node.growth ** level);
}

function rowOpen(row) {
  return version() >= TREE_ROW_VERSION[row - 1];
}

function nodePrev(node) {
  return node.row > 1 ? TREE.find(n => n.branch === node.branch && n.row === node.row - 1) : null;
}

// Erreichbar: Reihe geöffnet und der Vorgänger im selben Ast mindestens einmal gelernt
function nodeOpen(node) {
  const prev = nodePrev(node);
  return rowOpen(node.row) && (!prev || treeLevel(prev.id) > 0);
}

function canLearn(node) {
  return nodeOpen(node) && treeLevel(node.id) < node.max && state.insights >= nodeCost(node);
}

// Wie viele Stufen du dir gerade leisten kannst
function affordableLevels(node) {
  if (!nodeOpen(node)) return 0;
  let level = treeLevel(node.id);
  let left = state.insights;
  let n = 0;
  while (level < node.max && left >= nodeCost(node, level)) {
    left -= nodeCost(node, level);
    level++;
    n++;
  }
  return n;
}

function learnNode(id, count = 1) {
  const node = treeNode(id);
  let learned = 0;
  while (learned < count && canLearn(node)) {
    state.insights -= nodeCost(node);
    state.tree[id] = treeLevel(id) + 1;
    learned++;
  }
  if (!learned) return;
  mods = computeMods();
  SFX.learn();
  const el = treeEls.get(id);
  if (el) {
    restartAnimation(el.btn, 'learn-pop');
    restartAnimation(el.level, 'bump');
  }
  render();
}

function treeTotal(s = state) {
  return Object.values(s.tree).reduce((sum, level) => sum + level, 0);
}

function treeSpent() {
  let sum = 0;
  for (const node of TREE) for (let level = 0; level < treeLevel(node.id); level++) sum += nodeCost(node, level);
  return sum;
}

async function resetTree() {
  if (!treeTotal()) return;
  const ok = await showDialog({
    title: 'Baum zurücksetzen?',
    text: `Alle gelernten Fähigkeiten werden entfernt, und du bekommst alle ${fmt(treeSpent())} Erkenntnisse zurück. Das kostet nichts.`,
    ok: 'Zurücksetzen',
    cancel: 'Abbrechen',
  });
  if (!ok) return;
  state.insights += treeSpent();
  state.tree = {};
  mods = computeMods();
  render();
}

// Autopilot: kauft den Helfer mit dem meisten Schaden pro Token
function autoBuy() {
  let best = null;
  let bestValue = 0;
  GENERATORS.forEach((g, i) => {
    const cost = costOf(g, 1);
    if (!generatorRevealed(g, i) || cost > state.tokens) return;
    const value = unitRate(g) / cost;
    if (value > bestValue) {
      bestValue = value;
      best = g;
    }
  });
  if (!best) return;
  state.tokens -= costOf(best, 1);
  state.gens[best.id]++;
}

// ---------- Flow-Serien ----------

const series = { items: [], next: 0, perfect: 0, approach: 0, endedAt: 0, ball: null };
let nextSeriesAt = Date.now() + randomBetween(6000, 10_000);

// 2 bis 5 Kreise – je länger die Krit-Kette, desto mehr
// 3 bis 7 Kreise – je länger die Krit-Kette, desto mehr
function seriesLength() {
  const c = chain.count;
  const base = c < 5 ? 3 : c < 15 ? 4 : c < 35 ? 5 : 6;
  return Math.min(7, Math.max(3, Math.round(base + randomBetween(-0.9, 0.9))));
}

const SERIES_GAP_PX = 48;  // Mindestabstand zweier Kreise (Kreise sind 40 px groß)

// Bereiche mit Anzeigen (Combo, Kette, Countdown, Fähigkeiten): dort keine Kreise
function hudZones(arena) {
  const pad = 24;
  // Offenes Menü am Desktop: auch dort keine Kreise
  const els = [document.querySelector('.arena-left'), document.querySelector('.arena-corner'), $('skill-dock')];
  if (drawer.open && !sheetMode()) els.push($('side'));
  return els
    .map(el => el.getBoundingClientRect())
    .filter(r => r.width > 0 && r.height > 0)
    .map(r => [r.left - arena.left - pad, r.top - arena.top - pad, r.right - arena.left + pad, r.bottom - arena.top + pad]);
}

function inZone([x, y], zones) {
  return zones.some(([x1, y1, x2, y2]) => x > x1 && x < x2 && y > y1 && y < y2);
}

function spaced(pts) {
  return pts.every((p, i) => pts.every((q, j) => j <= i || Math.hypot(p[0] - q[0], p[1] - q[1]) >= SERIES_GAP_PX));
}

// Am Rand: als Bogen um die KI herum oder im Zickzack seitlich an ihr vorbei – die KI bleibt frei.
function edgePlacement(n, arena, zones) {
  const er = $('enemy').getBoundingClientRect();
  const cx = er.left - arena.left + er.width / 2;
  const cy = er.top - arena.top + er.height / 2;
  const r = er.width / 2;
  const { width: w, height: h } = arena;
  const m = 24;
  const ok = p => p[0] > m && p[0] < w - m && p[1] > m && p[1] < h - m && !inZone(p, zones);
  let mode = Math.random() < 0.65 ? 'orbit' : 'side';
  for (let tries = 0; tries < 30; tries++) {
    let pts;
    if (mode === 'orbit') {
      const rx = Math.max(r + 22, Math.min(w / 2 - m, r + 62));
      const ry = Math.max(r * 0.8, Math.min(h / 2 - m, r + 30));
      const step = SERIES_GAP_PX * 1.15 / ((rx + ry) / 2);
      const dir = Math.random() < 0.5 ? 1 : -1;
      const start = Math.random() * Math.PI * 2;
      pts = Array.from({ length: n }, (_, i) => {
        const a = start + dir * step * i;
        return [cx + Math.cos(a) * rx, cy + Math.sin(a) * ry];
      });
    } else {
      const left = Math.random() < 0.5;
      const band = left ? [m, cx - r - 8] : [cx + r + 8, w - m];
      if (band[1] - band[0] < 30) {
        mode = 'orbit';
        continue;
      }
      const x0 = (band[0] + band[1]) / 2;
      const amp = Math.min(24, (band[1] - band[0]) / 2 - 4);
      const top = h * 0.18;
      const step = (h * 0.62) / (n - 1);
      pts = Array.from({ length: n }, (_, i) => [x0 + (i % 2 ? amp : -amp), top + step * i]);
      if (Math.random() < 0.5) pts.reverse();
    }
    if (pts.every(ok) && spaced(pts)) return pts;
  }
  return null;
}

// Am Anfang gemütlich, mit der Schwierigkeit der Kette schneller
function seriesBeat() {
  return 520 - 220 * chainDifficulty();
}

function seriesApproach() {
  return 1400 - 550 * chainDifficulty();
}

// Mitten in der Krit-Kette, auch schon früh, kann eine Serie starten.
function maybeChainSeries(now) {
  if (!hasUnlock('series') || series.items.length || state.boss || chain.count < 3 || now - series.endedAt < SERIES_CHAIN_GAP_MS) return;
  if (Math.random() < 0.08) spawnSeries();
}

const bezier = (sl, t) => [0, 1].map(k => (1 - t) ** 2 * sl.p[k] + 2 * (1 - t) * t * sl.c[k] + t ** 2 * sl.q[k]);

// Bogen an einem Kreis: ein kleiner Schwung zu einem Endpunkt, frei von den anderen Kreisen
function planSlider(p, others, box, zones = []) {
  const len = Math.min(72, box.w * 0.2);
  for (let tries = 0; tries < 18; tries++) {
    const a = Math.random() * Math.PI * 2;
    const q = [p[0] + Math.cos(a) * len, p[1] + Math.sin(a) * len];
    if (q[0] < box.x || q[0] > box.x + box.w || q[1] < box.y || q[1] > box.y + box.h || inZone(q, zones)) continue;
    const bend = (Math.random() < 0.5 ? -1 : 1) * len * randomBetween(0.35, 0.55);
    const c = [(p[0] + q[0]) / 2 - Math.sin(a) * bend, (p[1] + q[1]) / 2 + Math.cos(a) * bend];
    const sl = { p, c, q, ms: 260 };
    const samples = [0.35, 0.65, 1].map(t => bezier(sl, t));
    if (samples.every(([x, y]) => others.every(o => Math.hypot(o[0] - x, o[1] - y) > 50))) return sl;
  }
  return null;
}

// Muster der Serie in einem eigenen Koordinatensystem (step = Abstand zweier Kreise)
const SERIES_PATTERNS = {
  linie: (n, step) => Array.from({ length: n }, (_, i) => [(i - (n - 1) / 2) * step, 0]),
  zickzack: (n, step) => Array.from({ length: n }, (_, i) => [(i - (n - 1) / 2) * step * 0.85, (i % 2 ? 1 : -1) * step * 0.4]),
  bogen: (n, step) => {
    const spread = Math.min(200, 50 * (n - 1)) * Math.PI / 180;
    const r = step * (n - 1) / spread;
    return Array.from({ length: n }, (_, i) => {
      const a = -spread / 2 + spread * i / (n - 1);
      return [r * Math.sin(a), r * (1 - Math.cos(a)) - r * 0.25];
    });
  },
  vieleck: (n, step) => {
    const r = step / (2 * Math.sin(Math.PI / n));
    return Array.from({ length: n }, (_, i) => [r * Math.sin(2 * Math.PI * i / n), -r * Math.cos(2 * Math.PI * i / n)]);
  },
  treppe: (n, step) => Array.from({ length: n }, (_, i) => [(Math.ceil(i / 2) - n / 4) * step * 0.9, (Math.floor(i / 2) - n / 4) * step * 0.75]),
  pfad: (n, step) => {
    let x = 0;
    let y = 0;
    let dir = Math.random() * Math.PI * 2;
    return Array.from({ length: n }, (_, i) => {
      if (i) {
        dir += randomBetween(-1, 1);
        x += Math.cos(dir) * step;
        y += Math.sin(dir) * step;
      }
      return [x, y];
    });
  },
};
// Rhythmus: Abstand vor jedem Kreis in Schlägen (gleichmäßig, Doppeltakt, schneller werdend)
const SERIES_RHYTHMS = {
  gleich: i => 1,
  doppel: i => (i % 2 ? 0.5 : 1),
  schneller: i => Math.max(0.55, 1 - 0.15 * (i - 1)),
};

// Kreise (54 px) sollen sich nicht überlappen: zu enge Muster werden neu gewürfelt.
function seriesPoints(n, box, tries = 0) {
  const names = Object.keys(SERIES_PATTERNS);
  const kind = tries >= 6 ? 'linie' : names[Math.floor(Math.random() * names.length)];
  const step = Math.min(105, box.w * 0.3);
  // Linien und Bögen liegen eher waagerecht, damit sie auch auf dem Handy in die Arena passen.
  const free = kind === 'vieleck' || kind === 'pfad';
  const rot = free ? Math.random() * Math.PI * 2 : randomBetween(-0.35, 0.35) + (Math.random() < 0.5 ? Math.PI : 0);
  const flip = Math.random() < 0.5 ? -1 : 1;
  let pts = SERIES_PATTERNS[kind](n, step).map(([x, y]) => [x * Math.cos(rot) - y * flip * Math.sin(rot), x * Math.sin(rot) + y * flip * Math.cos(rot)]);
  // In die freie Fläche einpassen: notfalls verkleinern, dann verschieben
  const xs = pts.map(p => p[0]);
  const ys = pts.map(p => p[1]);
  const [bx, by] = [Math.min(...xs), Math.min(...ys)];
  const [bw, bh] = [Math.max(...xs) - bx, Math.max(...ys) - by];
  const k = Math.min(1, box.w / (bw || 1), box.h / (bh || 1));
  const ox = box.x + randomBetween(0, box.w - bw * k);
  const oy = box.y + randomBetween(0, box.h - bh * k);
  pts = pts.map(([x, y]) => [ox + (x - bx) * k, oy + (y - by) * k]);
  const bad = !spaced(pts) || (box.zones && pts.some(p => inZone(p, box.zones)));
  return bad && tries < 8 ? seriesPoints(n, box, tries + 1) : { pts, kind };
}

function spawnSeries() {
  const arena = $('arena').getBoundingClientRect();
  const n = seriesLength();
  const beat = seriesBeat();
  const approach = seriesApproach();
  // Meist am Rand rund um die KI, manchmal als freies Muster über ihr
  const zones = hudZones(arena);
  const box = { x: arena.width * 0.1, y: arena.height * 0.18, w: arena.width * 0.8, h: arena.height * 0.58, zones };
  const points = (Math.random() < 0.75 && edgePlacement(n, arena, zones)) || seriesPoints(n, box).pts;
  // Bögen (freigeschaltet): meist einer, bei langer Kette auch zwei
  const sliders = [];
  if (hasUnlock('slider')) {
    const count = (Math.random() < 0.55 ? 1 : 0) + (chain.count >= 20 && Math.random() < 0.35 ? 1 : 0);
    const order = points.map((_, i) => i).sort(() => Math.random() - 0.5);
    for (const i of order) {
      if (sliders.filter(Boolean).length >= count) break;
      const others = points.filter((_, j) => j !== i).concat(sliders.filter(Boolean).map(sl => sl.q));
      sliders[i] = planSlider(points[i], others, { x: 22, y: 22, w: arena.width - 44, h: arena.height - 44 }, zones);
    }
  }
  // Am Anfang immer gleichmäßig, später auch Doppeltakt oder schneller werdend
  const rhythms = chain.count >= 4 || state.seriesDone >= 3 ? Object.keys(SERIES_RHYTHMS) : ['gleich'];
  const rhythm = SERIES_RHYTHMS[rhythms[Math.floor(Math.random() * rhythms.length)]];
  let at = 0;
  const delays = points.map((_, i) => {
    if (i) at += rhythm(i) * beat + (sliders[i - 1] ? sliders[i - 1].ms + 0.25 * beat : 0);
    return Math.round(at);
  });
  const layer = $('series');
  layer.replaceChildren();
  const r = Math.round;
  const line = points.flatMap((p, i) => (sliders[i] ? [p, sliders[i].q] : [p])).map(p => p.map(r).join(',')).join(' ');
  const tracks = sliders.map((sl, i) => (sl ? ((d) => `<g class="slider-track" data-slider="${i}"><path class="st-edge" d="${d}"/><path class="st-fill" d="${d}"/><path class="st-progress" pathLength="1" d="${d}"/><circle class="st-end" cx="${r(sl.q[0])}" cy="${r(sl.q[1])}" r="15"/>${[1, 2].map(k => { const [x, y] = bezier(sl, k / 3); return `<circle class="st-tick" data-tick="${k}" cx="${r(x)}" cy="${r(y)}" r="3.5"/>`; }).join('')}</g>`)(`M${sl.p.map(r).join(' ')}Q${sl.c.map(r).join(' ')} ${sl.q.map(r).join(' ')}`) : '')).join('');
  layer.insertAdjacentHTML('beforeend', `<svg class="series-path" viewBox="0 0 ${r(arena.width)} ${r(arena.height)}" aria-hidden="true"><polyline points="${line}"/>${tracks}</svg>`);
  const toPct = ([x, y]) => [x / arena.width * 100, y / arena.height * 100];
  series.items = points.map((p, i) => {
    const [x, y] = toPct(p);
    const el = document.createElement('button');
    el.type = 'button';
    el.className = `flow${sliders[i] ? ' slider' : ''}`;
    el.style.left = `${x}%`;
    el.style.top = `${y}%`;
    el.style.setProperty('--win', `${approach}ms`);
    el.setAttribute('aria-label', `Flow-Serie: Kreis ${i + 1} von ${n}${sliders[i] ? ', gedrückt halten und dem Bogen folgen' : ''}`);
    el.innerHTML = `<span class="flow-ring"></span><span class="flow-num">${i + 1}</span>`;
    const item = { el, index: i, x, y, slider: sliders[i] || null, appearAt: 0, deadline: Infinity, done: false, timer: 0 };
    el.addEventListener('pointerdown', e => {
      e.preventDefault();
      e.stopPropagation();
      lastPointerType = e.pointerType;
      if (!seriesReady(item)) return;
      if (item.slider) startSlide(item, e);
      else landSeries(item, Date.now() >= item.appearAt + series.approach - SERIES_PERFECT_MS);
    });
    // Tastatur: Enter/Leertaste zählt als Treffer, auch für Bögen
    el.addEventListener('click', e => {
      e.stopPropagation();
      if (e.detail === 0 && seriesReady(item)) landSeries(item, false, Boolean(item.slider));
    });
    layer.append(el);
    // Die Kreise erscheinen nacheinander im Takt.
    item.timer = setTimeout(() => {
      item.appearAt = Date.now();
      item.deadline = item.appearAt + approach + SERIES_GRACE_MS;
      el.classList.add('live');
      // Goldener Ring: jetzt ist der perfekte Moment
      item.ripeTimer = setTimeout(() => el.classList.add('ripe'), Math.max(0, approach - SERIES_PERFECT_MS));
    }, delays[i]);
    return item;
  });
  // Kugel mit Kometenschweif (drei Nachzügler)
  const ball = document.createElement('span');
  ball.className = 'slider-ball';
  ball.hidden = true;
  ball.innerHTML = '<i></i><i></i><i></i><b></b>';
  layer.append(ball);
  series.ball = ball;
  series.next = 0;
  series.perfect = 0;
  series.approach = approach;
  series.arena = arena;
  if (state.seriesDone < 2) popup('Tippe die Kreise im Takt', 'limit', freeX(50), 12);
  else if (sliders.some(Boolean) && state.seriesDone < 6) popup('Bogen: halten und folgen', 'limit', freeX(50), 12);
}

function seriesReady(item) {
  return series.items.indexOf(item) === series.next && item.appearAt > 0 && !item.done && !item.holding;
}

function pointerInArena(e) {
  const a = $('arena').getBoundingClientRect();
  return [e.clientX - a.left, e.clientY - a.top];
}

// Kugel und Schweif per transform (flüssig, ohne Layout)
function placeBall([x, y], trail = []) {
  const parts = series.ball.children;
  parts[3].style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px)`;
  for (let k = 0; k < 3; k++) {
    const [tx, ty] = trail[k] || [x, y];
    parts[k].style.transform = `translate(${tx.toFixed(1)}px, ${ty.toFixed(1)}px)`;
  }
}

// Bogen: gedrückt halten und zügig entlang wischen. Die Kugel gleitet dem Finger weich hinterher,
// die Spur füllt sich, und ein Ton steigt mit.
function startSlide(item, e) {
  const now = Date.now();
  item.holding = true;
  item.perfectHead = now >= item.appearAt + series.approach - SERIES_PERFECT_MS;
  item.slideAt = now;
  item.deadline = Infinity;
  item.target = 0;
  item.shown = 0;
  item.ticks = 0;
  item.history = [];
  item.samples = Array.from({ length: 65 }, (_, k) => bezier(item.slider, k / 64));
  item.el.classList.add('holding');
  try {
    item.el.setPointerCapture(e.pointerId);
  } catch {
    // Ohne Capture kommen die Bewegungen trotzdem an, solange der Finger auf dem Kreis startet.
  }
  const move = ev => {
    for (const p of ev.getCoalescedEvents?.() || [ev]) slideMove(item, pointerInArena(p));
  };
  const up = () => {
    item.release();
    if (item.holding) releaseSlide(item);
  };
  item.release = () => {
    item.el.removeEventListener('pointermove', move);
    item.el.removeEventListener('pointerup', up);
    item.el.removeEventListener('pointercancel', up);
  };
  item.el.addEventListener('pointermove', move);
  item.el.addEventListener('pointerup', up);
  item.el.addEventListener('pointercancel', up);
  item.watch = setTimeout(() => {
    if (item.holding) failSlide(item, bezier(item.slider, item.shown), 'Zu langsam');
  }, SLIDER_MAX_MS);
  item.tone = slideTone();
  placeBall(item.slider.p);
  series.ball.hidden = false;
  sliderTrack(item)?.classList.add('active');
  requestAnimationFrame(() => slideAnim(item));
}

function sliderTrack(item) {
  return $('series').querySelector(`[data-slider="${item.index}"]`);
}

// Nächster Punkt auf dem Bogen (genau, zwischen den Stützstellen projiziert) – nur vorwärts
function projectOnSlider(item, [px, py]) {
  let best = item.target;
  let bestD = Infinity;
  const n = item.samples.length - 1;
  for (let k = 0; k < n; k++) {
    if ((k + 1) / n < item.target - 0.15) continue;
    const [ax, ay] = item.samples[k];
    const [bx, by] = item.samples[k + 1];
    const vx = bx - ax;
    const vy = by - ay;
    const u = Math.max(0, Math.min(1, ((px - ax) * vx + (py - ay) * vy) / (vx * vx + vy * vy || 1)));
    const d = Math.hypot(ax + vx * u - px, ay + vy * u - py);
    if (d < bestD) {
      bestD = d;
      best = (k + u) / n;
    }
  }
  return { t: best, d: bestD };
}

function slideMove(item, pos) {
  if (!item.holding) return;
  const { t, d } = projectOnSlider(item, pos);
  if (d > SLIDER_FOLLOW_PX) return failSlide(item, bezier(item.slider, item.shown));
  if (t > item.target) item.target = t;
  if (item.target >= 0.94) completeSlide(item);
}

// Pro Bild: Kugel gleitet weich zum Ziel, Schweif, Spur, Zwischenpunkte, Ton
function slideAnim(item) {
  if (!item.holding) return;
  item.shown += (item.target - item.shown) * 0.5;
  if (item.target - item.shown < 0.002) item.shown = item.target;
  const pos = bezier(item.slider, item.shown);
  item.history.unshift(pos);
  item.history.length = Math.min(item.history.length, 9);
  placeBall(pos, [item.history[2], item.history[5], item.history[8]]);
  sliderTrack(item)?.querySelector('.st-progress')?.style.setProperty('stroke-dasharray', `${item.shown.toFixed(3)} 1`);
  item.tone?.set(item.shown);
  const tick = Math.floor(item.shown * 3);
  if (tick > item.ticks && tick < 3) {
    item.ticks = tick;
    sliderTrack(item)?.querySelector(`[data-tick="${tick}"]`)?.classList.add('hit');
    SFX.slideTick(tick);
    haptic();
  }
  requestAnimationFrame(() => slideAnim(item));
}

function stopSlide(item) {
  item.holding = false;
  clearTimeout(item.watch);
  item.release?.();
  item.tone?.stop();
  item.tone = null;
  item.el.classList.remove('holding');
  if (series.ball) series.ball.hidden = true;
}

// Fast am Ende loslassen zählt noch.
function releaseSlide(item) {
  if (item.target >= 0.7) completeSlide(item);
  else failSlide(item, bezier(item.slider, item.shown));
}

function completeSlide(item) {
  const fast = Date.now() - item.slideAt <= SLIDER_FAST_MS;
  stopSlide(item);
  const track = sliderTrack(item);
  track?.querySelector('.st-progress')?.style.setProperty('stroke-dasharray', '1 1');
  track?.classList.add('complete');
  // Funkenspur entlang des Bogens
  const a = series.arena;
  for (const t of [0.2, 0.4, 0.6, 0.8, 1]) {
    const [x, y] = bezier(item.slider, t);
    fxBurst(x / a.width * 100, y / a.height * 100, { count: t === 1 ? 16 : 3, color: fast ? '#ffcc00' : null, hue: 20, spread: t === 1 ? 95 : 26, size: t === 1 ? 7 : 5, fall: 8, dur: 520 });
  }
  SFX.swoosh(fast);
  landSeries(item, item.perfectHead, true, fast);
}

function failSlide(item, pos, text = 'Abgerutscht') {
  stopSlide(item);
  const a = series.arena;
  popup(text, 'blocked', pos[0] / a.width * 100, pos[1] / a.height * 100 - 8);
  endSeries(Date.now(), null);
}

// Ein Kreis der Serie zählt wie ein gezielter Treffer: Combo, Krit-Kette und Krit-Schaden.
function landSeries(item, perfect, slid = false, fast = false) {
  const i = item.index;
  const now = Date.now();
  clock = now;
  item.done = true;
  series.next++;
  if (perfect) series.perfect++;
  item.el.classList.add('hit');
  item.el.classList.toggle('perfect', perfect);
  setTimeout(() => item.el.remove(), 420);
  if (slid) {
    $('series').querySelector(`[data-slider="${i}"]`)?.classList.add('done');
  }
  if (now - combo.lastAt > mods.comboWindow) combo.count = 0;
  combo.count++;
  combo.lastAt = now;
  state.maxCombo = Math.max(state.maxCombo, combo.count);
  missionProgress('combo', combo.count, true);
  state.clicks++;
  missionProgress('taps');
  const critMult = chainCritMult();
  chain.count++;
  chain.lastAt = now;
  state.bestChain = Math.max(state.bestChain, chain.count);
  missionProgress('chain', chain.count, true);
  state.crits++;
  missionProgress('crits');
  const focus = skillActive('focus', now) ? skillPower('focus') : 1;
  const slideMult = slid ? SLIDER_MULT * (fast ? SLIDER_FAST_MULT : 1) : 1;
  const dmg = clickValue(now) * comboMult() * focus * critMult * (perfect ? SERIES_PERFECT_MULT : 1) * slideMult * damageFactor('tap');
  const [px, py] = slid && item.slider ? [item.slider.q[0] / series.arena.width * 100, item.slider.q[1] / series.arena.height * 100] : [item.x, item.y];
  const label = slid ? (fast ? 'Blitzbogen' : perfect ? 'Perfekter Bogen' : 'Bogen') : (perfect ? 'Perfekt' : 'Treffer');
  popup(`${label} −${fmt(dmg, 1)}`, `crit flowpop${perfect || fast ? ' perfect' : ''}`, px, py - 9);
  fxRing(px, py, { size: perfect ? 92 : 70, color: perfect || fast ? '#ffcc00' : 'var(--accent)', dur: 420, width: 3 });
  fxBurst(px, py, { count: perfect ? 10 : 6, color: perfect ? '#ffcc00' : null, hue: 20, spread: perfect ? 60 : 42, size: 5, fall: 10 });
  SFX.flow(i, perfect);
  haptic();
  restartAnimation($('glyph'), 'hit');
  attack(dmg);
  if (series.next >= series.items.length) finishSeries(now);
  render();
}

// Ganze Serie geschafft: Bonusschlag, perfekt doppelt so stark
function finishSeries(now) {
  const n = series.items.length;
  const allPerfect = series.perfect === n;
  state.seriesDone++;
  if (allPerfect) state.seriesPerfect++;
  missionProgress('series');
  const dmg = clickValue(now) * comboMult() * chainCritMult() * n * (allPerfect ? 2 : 1) * damageFactor('tap');
  popup(`${allPerfect ? 'Perfekte Serie' : 'Serie'} ×${n} · −${fmt(dmg, 1)}`, 'crit huge', freeX(50), 26);
  fxRing(freeX(50), 48, { size: 320, color: allPerfect ? '#ffcc00' : 'var(--accent)', dur: 700, width: 5 });
  fxBurst(freeX(50), 48, { count: 26, color: allPerfect ? '#ffcc00' : null, hue: 25, spread: 170, size: 8, fall: 60, dur: 900 });
  restartAnimation($('arena'), 'flash');
  restartAnimation($('arena'), 'shake');
  SFX.flowDone(allPerfect);
  attack(dmg);
  endSeries(now, null);
}

// Ende der Serie; missed: der verpasste Kreis (nur ein Hinweis, keine Strafe)
function endSeries(now, missed) {
  for (const item of series.items) {
    clearTimeout(item.timer);
    clearTimeout(item.ripeTimer);
    if (item.holding) stopSlide(item);
    if (!item.done) {
      item.el.classList.add('missed');
      setTimeout(() => item.el.remove(), 320);
    }
  }
  const path = $('series').querySelector('.series-path');
  if (path) {
    path.classList.add('out');
    setTimeout(() => path.remove(), 320);
  }
  series.ball?.remove();
  series.ball = null;
  if (missed) popup('Verpasst', 'blocked', missed.x, missed.y - 8);
  series.items = [];
  series.endedAt = now;
  // Während der Serie lief die Krit-Kette nicht ab; danach gibt es ein frisches Zeitfenster.
  if (chain.count > 0) chain.lastAt = now;
  nextSeriesAt = now + randomBetween(SERIES_MIN_MS, SERIES_MAX_MS) / mods.seriesFreq;
}

function updateSeries(now) {
  if (series.items.length) {
    // Bosskampf oder Tab im Hintergrund: Serie still beenden
    if (state.boss || document.hidden) return endSeries(now, null);
    const item = series.items[series.next];
    if (item && now > item.deadline) endSeries(now, item);
    return;
  }
  if (now >= nextSeriesAt && hasUnlock('series') && !state.boss && !document.hidden) spawnSeries();
}

// ---------- Angriffe des Wochenlimits ----------

const attacks = [];
let nextAttackAt = 0;

function attackWindow(tier) {
  return Math.max(1000, 2000 - 100 * (tier - 1)) * mods.parryWindow;
}

// Je weniger Limit es übrig hat, desto schneller greift es an.
function attackGap(boss) {
  return Math.max(1200, 3600 - 300 * (boss.tier - 1)) * (0.55 + 0.45 * clamp01(boss.hp / boss.maxHp));
}

function clearAttacks() {
  for (const a of attacks) a.el.remove();
  attacks.length = 0;
  debuffs.helpers = 0;
  debuffs.lock = 0;
  debuffs.blind = 0;
}

function spawnAttack(now) {
  const key = DEBUFF_KEYS[Math.floor(Math.random() * DEBUFF_KEYS.length)];
  const d = DEBUFFS[key];
  const win = attackWindow(state.boss.tier);
  // Abstand zu anderen Angriffen und frei von den Anzeigen am Rand
  let x = 50;
  let y = 50;
  for (let tries = 0; tries < 12; tries++) {
    const free = arenaFree();
    x = randomBetween(14 + free.left, 86 - free.right);
    y = randomBetween(26, 70);
    if (attacks.every(a => Math.hypot(a.x - x, (a.y - y) * 1.3) > 20)) break;
  }
  const el = document.createElement('button');
  el.type = 'button';
  el.className = 'boss-attack';
  el.style.left = `${x}%`;
  el.style.top = `${y}%`;
  el.style.setProperty('--win', `${Math.round(win)}ms`);
  el.setAttribute('aria-label', `Angriff abwehren, sonst: ${d.name}`);
  el.innerHTML = `<span class="attack-ring"></span><span class="attack-core">${icon(d.icon)}</span>`;
  const a = { el, x, y, key, hitsAt: now + win };
  el.addEventListener('pointerdown', e => {
    e.preventDefault();
    e.stopPropagation();
    parry(a);
  });
  el.addEventListener('click', e => {
    e.stopPropagation();
    if (e.detail === 0) parry(a);
  });
  $('attacks').append(el);
  attacks.push(a);
}

function parry(a) {
  const i = attacks.indexOf(a);
  if (i < 0 || !state.boss) return;
  attacks.splice(i, 1);
  a.el.classList.add('parried');
  setTimeout(() => a.el.remove(), 320);
  state.parries++;
  const dmg = state.boss.maxHp * BOSS_PARRY_DAMAGE;
  popup(`Abgewehrt −${fmt(dmg)}`, 'parry', a.x, a.y - 10);
  fxRing(a.x, a.y, { size: 120, color: '#30d158', dur: 450, width: 4 });
  fxBurst(a.x, a.y, { count: 10, color: '#30d158', spread: 70, size: 6, fall: 20 });
  SFX.parry();
  clock = Date.now();
  attack(dmg);
  render();
}

// Nicht abgewehrt: Der Angriff trifft.
function attackHits(a, now) {
  a.el.remove();
  const boss = state.boss;
  const d = DEBUFFS[a.key];
  if (d.ms) debuffs[a.key] = Math.max(debuffs[a.key], now) + d.ms * mods.debuffTime;
  else if (a.key === 'combo') {
    combo.count = 0;
    if (chain.count > 0) breakChain(now);
  } else if (a.key === 'drain') state.tokens *= 1 - BOSS_DRAIN;
  else if (a.key === 'heal') boss.hp = Math.min(boss.maxHp, boss.hp + boss.maxHp * BOSS_HEAL);
  else if (a.key === 'cooldown') {
    for (const k of SKILLS) {
      const st = state.skills[k.id];
      if (st.level > 0) st.readyAt = Math.max(st.readyAt, now) + BOSS_COOLDOWN_MS;
    }
  }
  popup(d.name, 'blocked', a.x, a.y);
  fxRing(a.x, a.y, { size: 160, color: '#ff453a', dur: 500, width: 5 });
  restartAnimation($('arena'), 'hurt');
  restartAnimation($('arena'), 'shake');
  SFX.hurt();
}

function updateAttacks(now) {
  if (!state.boss) {
    if (attacks.length) clearAttacks();
    return;
  }
  // Im Hintergrund greift es nicht an – unfair wäre es sonst.
  if (document.hidden) {
    for (const a of attacks) a.el.remove();
    attacks.length = 0;
    nextAttackAt = now + BOSS_ATTACK_DELAY_MS;
    return;
  }
  for (const a of attacks.filter(x => now >= x.hitsAt)) {
    attacks.splice(attacks.indexOf(a), 1);
    attackHits(a, now);
  }
  if (now >= nextAttackAt && attacks.length < Math.min(3, 1 + state.boss.tier)) {
    spawnAttack(now);
    nextAttackAt = now + attackGap(state.boss);
  }
}

function checkAchievements() {
  const dps = currentDps();
  let changed = false;
  for (const a of ACHIEVEMENTS) {
    if (!state.achievements.has(a.id) && a.check(state, dps)) {
      state.achievements.add(a.id);
      changed = true;
      toast(`<strong>${a.name}</strong><br><span class="muted">${a.desc}</span>`, 'seal');
    }
  }
  if (changed) {
    mods = computeMods();
    renderAchievements();
  }
}

// ---------- Tagesbonus ----------

function claimDaily() {
  const today = dayId(Date.now());
  if (state.lastDaily === today) return;
  state.lastDaily = today;
  const reward = Math.max(100, incomeRate() * 900) * mods.rewardMult;
  earn(reward);
  toast(`<strong>Tagesbonus</strong> · +${fmt(reward)} Tokens. Bis morgen!`, 'gift');
  save();
  render();
}

// ---------- Geistesblitz ----------

let nextGoldenAt = Date.now() + randomBetween(GOLDEN_MIN_S, GOLDEN_MAX_S) * 1000;
let goldenHideAt = 0;

function scheduleGolden(now) {
  nextGoldenAt = now + randomBetween(GOLDEN_MIN_S, GOLDEN_MAX_S) * 1000 / mods.goldenFreq;
}

function updateGolden(now) {
  const el = $('golden');
  if (el.hidden && now >= nextGoldenAt) {
    el.style.left = `${randomBetween(5, 88)}vw`;
    const bottomFree = sheetMode() ? ($('side').offsetHeight + 70) / window.innerHeight * 100 : 20;
    el.style.top = `${randomBetween(15, Math.max(20, 100 - bottomFree))}vh`;
    el.hidden = false;
    goldenHideAt = now + GOLDEN_LIFETIME_MS;
  } else if (!el.hidden && now >= goldenHideAt) {
    el.hidden = true;
    scheduleGolden(now);
  }
}

function catchGolden() {
  const now = Date.now();
  $('golden').hidden = true;
  scheduleGolden(now);
  state.goldenClicks++;
  if (Math.random() < 0.5) {
    state.frenzyUntil = now + FRENZY_MS + mods.frenzyMs;
    toast(`<strong>Geistesblitz</strong> · Schaden ×${FRENZY_MULT} für ${(FRENZY_MS + mods.frenzyMs) / 1000} Sekunden`, 'token');
  } else {
    const gain = Math.min(state.tokens * 0.15, incomeRate() * 900) + 13;
    earn(gain);
    toast(`<strong>Geistesblitz</strong> · +${fmt(gain)} Tokens`, 'token');
  }
  render();
}

// ---------- Deine Claude-Limits (Limit-Blase) ----------

const RING = 2 * Math.PI * 6;
const island = { hover: false, pinned: false, drag: false, closeTimer: 0, alertTimer: 0 };
let keyboardNav = false;
let lastPointerType = 'mouse';

// Die Blase sitzt im Kopf neben „No Limit“. Aufgeklappt wird sie 440 px breit; passt das
// nach rechts nicht, nimmt sie die ganze Kopfbreite ein und überdeckt die Marke vollständig.
// Sie klappt nach unten auf, außer oben ist mehr Platz; passt sie nirgends, scrollt der Inhalt.
function placeIsland(el) {
  const anchor = $('limits').getBoundingClientRect();
  const head = $('limits').parentElement.getBoundingClientRect();
  const fitsRight = anchor.left + 440 <= head.right;
  const width = fitsRight ? 440 : head.width;
  const shift = fitsRight ? 0 : head.left - anchor.left;
  el.style.setProperty('--island-open-w', `${Math.round(width)}px`);
  el.style.setProperty('--island-shift', `${Math.round(shift)}px`);
  const needed = el.querySelector('.island-content').offsetHeight;
  const above = anchor.top - 8;
  const below = window.innerHeight - anchor.bottom - 8;
  const up = above > below && above >= needed;
  const room = Math.max(180, up ? above : below);
  el.classList.toggle('down', !up);
  el.classList.toggle('scroll', needed > room);
  el.style.setProperty('--island-max', `${Math.round(room)}px`);
}

function syncIsland() {
  const el = $('island');
  const focusInside = keyboardNav && el.contains(document.activeElement);
  const open = island.hover || island.pinned || island.drag || focusInside;
  if (open && !el.classList.contains('open')) placeIsland(el);
  el.classList.toggle('open', open);
  $('island-pill').setAttribute('aria-expanded', String(open));
}

function haptic() {
  if (lastPointerType !== 'touch') return;
  try {
    navigator.vibrate?.(4);
  } catch {
    // Keine Vibration verfügbar.
  }
}

function requestNotifications() {
  try {
    if ('Notification' in window && Notification.permission === 'default') Notification.requestPermission().catch(() => {});
  } catch {
    // Benachrichtigungen nicht erlaubt – die Limit-Blase meldet sich trotzdem.
  }
}

// Minuten bis zum 5-Stunden-Reset (0 = nicht eingestellt)
function sessionMinutes() {
  return state.limitReset ? Math.max(0, (state.limitReset - Date.now()) / MINUTE_MS) : 0;
}

function setSessionMinutes(minutes) {
  const now = Date.now();
  if (minutes <= 0) {
    state.limitReset = null;
    return;
  }
  // Auf volle 5 Minuten der Uhrzeit runden, so wie Claude den Reset anzeigt.
  const step = SESSION_STEP_MIN * MINUTE_MS;
  const snapped = Math.round((now + minutes * MINUTE_MS) / step) * step;
  state.limitReset = Math.min(Math.max(snapped, now + MINUTE_MS), now + SESSION_MS);
}

// Tag (0 = heute … 6) und Uhrzeit (Minuten) des Wochen-Resets
function weeklyParts() {
  if (!state.weeklyReset) return { day: null, minutes: null };
  const reset = new Date(state.weeklyReset);
  const diff = Math.round((startOfDay(state.weeklyReset) - startOfDay(Date.now())) / DAY_MS);
  return { day: diff % 7, minutes: reset.getHours() * 60 + reset.getMinutes() };
}

function setWeekly(day, minutes) {
  const now = Date.now();
  const d = startOfDay(now);
  d.setDate(d.getDate() + day);
  d.setHours(Math.floor(minutes / 60), minutes % 60, 0, 0);
  if (d.getTime() <= now) d.setDate(d.getDate() + 7);
  state.weeklyReset = d.getTime();
}

function clearWeekly() {
  state.weeklyReset = null;
}

function commitLimits() {
  requestNotifications();
  save();
  renderIsland(Date.now());
}

// Regler im Stil des Kontrollzentrums: irgendwo greifen und ziehen, scrollen oder Pfeiltasten.
function makeScrubber(el, { max, step, get, set, wheelTargets = [] }) {
  let lastValue = null;
  const apply = value => {
    const v = Math.max(0, Math.min(max, Math.round(value / step) * step));
    if (v !== lastValue) {
      lastValue = v;
      haptic();
    }
    set(v);
    renderIsland(Date.now());
  };
  const fromPointer = e => {
    const rect = el.getBoundingClientRect();
    return clamp01((e.clientX - rect.left) / rect.width) * max;
  };
  const end = () => {
    if (!el.classList.contains('dragging')) return;
    el.classList.remove('dragging');
    island.drag = false;
    commitLimits();
    syncIsland();
  };
  el.addEventListener('pointerdown', e => {
    lastPointerType = e.pointerType;
    e.preventDefault();
    el.focus({ preventScroll: true });
    el.setPointerCapture(e.pointerId);
    el.classList.add('dragging');
    island.drag = true;
    syncIsland();
    apply(fromPointer(e));
  });
  el.addEventListener('pointermove', e => {
    if (el.hasPointerCapture(e.pointerId)) apply(fromPointer(e));
  });
  el.addEventListener('pointerup', end);
  el.addEventListener('pointercancel', end);
  el.addEventListener('lostpointercapture', end);
  el.addEventListener('keydown', e => {
    const deltas = { ArrowRight: 1, ArrowUp: 1, ArrowLeft: -1, ArrowDown: -1, PageUp: 6, PageDown: -6 };
    if (e.key in deltas) apply(get() + deltas[e.key] * step);
    else if (e.key === 'Home') apply(0);
    else if (e.key === 'End') apply(max);
    else return;
    e.preventDefault();
    commitLimits();
  });
  // Mausrad und Zwei-Finger-Wischen auf dem Trackpad
  let wheelAcc = 0;
  let wheelTimer = 0;
  for (const target of [el, ...wheelTargets]) {
    target.addEventListener('wheel', e => {
      e.preventDefault();
      wheelAcc += Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : -e.deltaY;
      while (Math.abs(wheelAcc) >= 40) {
        const dir = Math.sign(wheelAcc);
        wheelAcc -= dir * 40;
        apply(get() + dir * step);
      }
      clearTimeout(wheelTimer);
      wheelTimer = setTimeout(() => { wheelAcc = 0; commitLimits(); }, 250);
    }, { passive: false });
  }
}

// Tagesleiste: antippen oder mit dem Finger darüberwischen
let daysKey = '';
function buildDays(now) {
  const key = dayId(now);
  if (key === daysKey) return;
  daysKey = key;
  const strip = $('weekly-days');
  strip.replaceChildren(...Array.from({ length: 7 }, (_, i) => {
    const d = startOfDay(now);
    d.setDate(d.getDate() + i);
    const btn = document.createElement('button');
    btn.className = 'day';
    btn.type = 'button';
    btn.setAttribute('role', 'radio');
    btn.dataset.day = String(i);
    btn.innerHTML = `${i === 0 ? 'Heute' : weekdayFmt.format(d).replace('.', '')}<small>${d.getDate()}.</small>`;
    return btn;
  }));
}

function initDays() {
  const strip = $('weekly-days');
  let lastDay = null;
  const pick = day => {
    if (day === lastDay) return;
    lastDay = day;
    haptic();
    setWeekly(day, weeklyParts().minutes ?? 0);
    renderIsland(Date.now());
  };
  const dayAt = e => {
    const rect = strip.getBoundingClientRect();
    return Math.min(6, Math.max(0, Math.floor((e.clientX - rect.left) / rect.width * 7)));
  };
  strip.addEventListener('pointerdown', e => {
    lastPointerType = e.pointerType;
    e.preventDefault();
    strip.setPointerCapture(e.pointerId);
    island.drag = true;
    lastDay = null;
    pick(dayAt(e));
  });
  strip.addEventListener('pointermove', e => {
    if (strip.hasPointerCapture(e.pointerId)) pick(dayAt(e));
  });
  const end = () => {
    if (!island.drag) return;
    island.drag = false;
    commitLimits();
    syncIsland();
  };
  strip.addEventListener('pointerup', end);
  strip.addEventListener('pointercancel', end);
  // Tastatur: Enter/Leertaste auf einem Tag
  strip.addEventListener('click', e => {
    const btn = e.target.closest('.day');
    if (!btn || e.detail > 0) return;
    setWeekly(Number(btn.dataset.day), weeklyParts().minutes ?? 0);
    commitLimits();
  });
  let wheelAcc = 0;
  strip.addEventListener('wheel', e => {
    e.preventDefault();
    wheelAcc += Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : -e.deltaY;
    if (Math.abs(wheelAcc) < 60) return;
    const current = weeklyParts().day ?? 0;
    const next = (current + Math.sign(wheelAcc) + 7) % 7;
    wheelAcc = 0;
    setWeekly(next, weeklyParts().minutes ?? 0);
    commitLimits();
  }, { passive: false });
}

function initIsland() {
  const el = $('island');
  el.addEventListener('pointerenter', e => {
    if (e.pointerType !== 'mouse') return;
    clearTimeout(island.closeTimer);
    island.hover = true;
    syncIsland();
  });
  el.addEventListener('pointerleave', e => {
    if (e.pointerType !== 'mouse') return;
    island.closeTimer = setTimeout(() => { island.hover = false; syncIsland(); }, 280);
  });
  // Antippen (Touch) bzw. Klicken pinnt die Limit-Blase geöffnet.
  $('island-pill').addEventListener('click', () => {
    island.pinned = !island.pinned;
    syncIsland();
  });
  document.addEventListener('pointerdown', e => {
    keyboardNav = false;
    if (island.pinned && !el.contains(e.target)) {
      island.pinned = false;
      syncIsland();
    }
  }, true);
  document.addEventListener('keydown', e => {
    keyboardNav = true;
    if (e.key === 'Escape' && (island.pinned || el.contains(document.activeElement))) {
      island.pinned = false;
      island.hover = false;
      if (el.contains(document.activeElement)) document.activeElement.blur();
    }
    syncIsland();
  }, true);
  el.addEventListener('focusin', syncIsland);
  el.addEventListener('focusout', () => setTimeout(syncIsland, 0));

  makeScrubber($('session-scrub'), {
    max: SESSION_MS / MINUTE_MS,
    step: SESSION_STEP_MIN,
    get: sessionMinutes,
    set: setSessionMinutes,
    wheelTargets: [$('session-big')],
  });
  makeScrubber($('weekly-scrub'), {
    max: 24 * 60 - WEEKLY_STEP_MIN,
    step: WEEKLY_STEP_MIN,
    get: () => weeklyParts().minutes ?? 0,
    set: minutes => setWeekly(weeklyParts().day ?? 0, minutes),
    wheelTargets: [$('weekly-big')],
  });
  initDays();

  $('session-full').addEventListener('click', () => {
    state.limitReset = Date.now() + SESSION_MS;
    commitLimits();
  });
  $('session-clear').addEventListener('click', () => {
    state.limitReset = null;
    commitLimits();
  });
  $('weekly-clear').addEventListener('click', () => {
    clearWeekly();
    commitLimits();
  });
}

function limitReached(text) {
  state.limitsSurvived++;
  const el = $('island');
  $('pill-alert').textContent = text;
  $('pill-alert').hidden = false;
  $('pill-limits').hidden = true;
  el.classList.add('alert');
  clearTimeout(island.alertTimer);
  island.alertTimer = setTimeout(() => {
    el.classList.remove('alert');
    $('pill-alert').hidden = true;
    $('pill-limits').hidden = false;
  }, 8000);
  toast(`<strong>${text}</strong>`, 'clock');
  try {
    if ('Notification' in window && Notification.permission === 'granted') new Notification('No Limit', { body: text });
  } catch {
    // Benachrichtigungen nicht verfügbar – die Limit-Blase reicht.
  }
  save();
}

function updateLimits(now) {
  if (state.limitReset !== null && now >= state.limitReset) {
    state.limitReset = null;
    limitReached('Dein 5-Stunden-Limit ist zurück');
  }
  if (state.weeklyReset !== null && now >= state.weeklyReset) {
    state.weeklyReset += Math.ceil((now - state.weeklyReset + 1) / WEEK_MS) * WEEK_MS;
    limitReached('Dein Wochenlimit ist zurück');
  }
}

function setRing(id, fraction) {
  $(id).style.strokeDashoffset = String(RING * (1 - clamp01(fraction)));
}

function renderIsland(now) {
  buildDays(now);

  const session = state.limitReset;
  const sessionLeft = session ? session - now : 0;
  $('pill-session-text').textContent = session ? fmtDuration(sessionLeft) : '5 Std.';
  $('pill-session-text').parentElement.classList.toggle('off', !session);
  setRing('ring-session', sessionLeft / SESSION_MS);
  $('session-big').textContent = fmtDuration(sessionLeft);
  $('session-big').classList.toggle('off', !session);
  $('session-sub').textContent = session ? `Reset um ${timeFmt.format(session)}` : 'nicht eingestellt';
  const sessionScrub = $('session-scrub');
  sessionScrub.querySelector('.scrub-fill').style.width = `${clamp01(sessionLeft / SESSION_MS) * 100}%`;
  sessionScrub.querySelector('.scrub-label').textContent = session ? `noch ${fmtSpan(sessionLeft)}` : 'Ziehen, um die Restzeit einzustellen';
  sessionScrub.setAttribute('aria-valuenow', String(Math.round(sessionLeft / MINUTE_MS)));
  sessionScrub.setAttribute('aria-valuetext', session ? `noch ${fmtSpan(sessionLeft)}` : 'nicht eingestellt');

  const weekly = state.weeklyReset;
  const weeklyLeft = weekly ? weekly - now : 0;
  const parts = weeklyParts();
  const days = Math.floor(weeklyLeft / DAY_MS);
  $('pill-weekly-text').textContent = weekly
    ? (days > 0 ? `${days} T ${Math.floor((weeklyLeft % DAY_MS) / HOUR_MS)} Std.` : fmtDuration(weeklyLeft))
    : 'Woche';
  $('pill-weekly-text').parentElement.classList.toggle('off', !weekly);
  setRing('ring-weekly', weeklyLeft / WEEK_MS);
  $('weekly-big').textContent = weekly ? fmtWeekCountdown(weeklyLeft) : '0 T 00:00:00';
  $('weekly-big').classList.toggle('off', !weekly);
  $('weekly-sub').textContent = weekly ? dateFmt.format(weekly) : 'nicht eingestellt';
  for (const btn of $('weekly-days').children) {
    btn.setAttribute('aria-checked', String(Number(btn.dataset.day) === parts.day));
  }
  const weeklyScrub = $('weekly-scrub');
  weeklyScrub.querySelector('.scrub-fill').style.width = weekly ? `${parts.minutes / (24 * 60) * 100}%` : '0%';
  weeklyScrub.querySelector('.scrub-label').textContent = weekly ? `${timeFmt.format(weekly)} Uhr` : 'Ziehen, um die Uhrzeit einzustellen';
  weeklyScrub.setAttribute('aria-valuenow', String(parts.minutes ?? 0));
  weeklyScrub.setAttribute('aria-valuetext', weekly ? `${timeFmt.format(weekly)} Uhr` : 'nicht eingestellt');
}

// ---------- Darstellung ----------

const genEls = new Map();
const trackSegs = [];
let upgradesKey = '';
let upgradesHoldUntil = 0;
let enemyKey = '';
let lastSpawnAnimation = 0;

function restartAnimation(el, cls) {
  if (quiet) return;
  el.classList.remove(cls);
  void el.offsetWidth;
  el.classList.add(cls);
}

function buildGenerators() {
  const container = $('generators');
  container.replaceChildren();
  genEls.clear();
  for (const g of GENERATORS) {
    const btn = document.createElement('button');
    btn.className = 'row';
    btn.innerHTML = `
      <span class="tile-wrap"><span class="tile"></span><span class="tile-count" hidden></span></span>
      <span class="row-main">
        <span class="row-title"><span class="gen-name"></span><span class="row-count"></span></span>
        <span class="row-sub gen-desc"></span>
        <span class="row-sub gen-rate"></span>
        <span class="buy-progress"><span></span></span>
      </span>
      <span class="price"><span class="price-qty"></span><span class="price-val"></span>${icon('token')}</span>`;
    btn.addEventListener('click', () => buyGenerator(g));
    btn.addEventListener('animationend', () => btn.classList.remove('bought'));
    // Das nächste Upgrade dieses Helfers, direkt zum Antippen
    const strip = document.createElement('button');
    strip.className = 'gen-up';
    strip.hidden = true;
    strip.innerHTML = `<span class="gen-up-icon">${icon('trend')}</span><span class="gen-up-text"></span><span class="price gen-up-price"></span>`;
    container.append(btn, strip);
    const entry = {
      btn,
      strip,
      stripText: strip.querySelector('.gen-up-text'),
      stripPrice: strip.querySelector('.gen-up-price'),
      upgrade: null,
      badge: btn.querySelector('.tile-count'),
      revealed: null,
      tile: btn.querySelector('.tile'),
      name: btn.querySelector('.gen-name'),
      count: btn.querySelector('.row-count'),
      desc: btn.querySelector('.gen-desc'),
      rate: btn.querySelector('.gen-rate'),
      qty: btn.querySelector('.price-qty'),
      cost: btn.querySelector('.price-val'),
      progress: btn.querySelector('.buy-progress span'),
    };
    strip.addEventListener('click', () => {
      if (!entry.upgrade) return;
      restartAnimation(strip, 'bought');
      buyUpgrade(entry.upgrade);
    });
    strip.addEventListener('animationend', () => strip.classList.remove('bought'));
    genEls.set(g.id, entry);
  }
}

function buildTrack() {
  const bar = $('track-bar');
  for (let i = 0; i < 5; i++) {
    const seg = document.createElement('div');
    seg.className = 'seg';
    const fill = document.createElement('div');
    fill.className = 'seg-fill';
    seg.append(fill);
    bar.append(seg);
    trackSegs.push(fill);
  }
}

function generatorRevealed(g, i) {
  return i === 0 || state.gens[g.id] > 0 || state.gens[GENERATORS[i - 1].id] > 0 || state.runEarned >= g.baseCost;
}

function renderGenerators() {
  let prevRevealed = true;
  // Empfehlung: der Helfer mit dem meisten Schaden pro Token
  const revealedGens = GENERATORS.filter((g, i) => generatorRevealed(g, i));
  const best = revealedGens.length > 1
    ? revealedGens.reduce((a, b) => (unitRate(b) / costOf(b, 1) > unitRate(a) / costOf(a, 1) ? b : a))
    : null;
  const total = totalGenerators(state);
  const summary = total ? `${fmt(total)} Helfer · ${fmt(baseDps(), 1)} Schaden/s` : 'Helfer greifen automatisch an';
  if ($('helpers-summary').textContent !== summary) $('helpers-summary').textContent = summary;
  GENERATORS.forEach((g, i) => {
    const el = genEls.get(g.id);
    const revealed = generatorRevealed(g, i);
    // Nur der nächste unentdeckte Helfer wird als Teaser gezeigt.
    el.btn.hidden = !revealed && !prevRevealed;
    prevRevealed = revealed;
    if (el.revealed !== revealed) {
      el.revealed = revealed;
      el.tile.innerHTML = icon(revealed ? g.icon : 'question');
      el.tile.style.setProperty('--tile', revealed ? tileBg(g.colors) : 'var(--fill-2)');
      el.name.textContent = revealed ? g.name : 'Noch nicht entdeckt';
      el.desc.textContent = revealed ? g.desc : 'Sammle mehr Tokens, um ihn freizuschalten.';
      el.btn.classList.toggle('teaser', !revealed);
    }
    const n = amountToBuy(g);
    const cost = costOf(g, n);
    el.btn.disabled = !revealed || state.tokens < cost;
    const owned = state.gens[g.id];
    el.badge.hidden = owned === 0;
    if (el.badge.textContent !== String(owned)) {
      el.badge.textContent = fmt(owned);
      if (owned > 0) restartAnimation(el.badge, 'bump');
    }
    const recommended = best === g;
    if (el.btn.classList.contains('recommended') !== recommended) {
      el.btn.classList.toggle('recommended', recommended);
      el.count.innerHTML = recommended ? '<span class="rec-tag">Empfohlen</span>' : '';
    }
    const up = revealed ? UPGRADES.find(u => u.id.startsWith(`${g.id}-`) && !state.upgrades.has(u.id) && u.unlocked(state)) : null;
    el.upgrade = up || null;
    el.strip.hidden = !up || el.btn.hidden;
    if (up) {
      if (el.strip.dataset.id !== up.id) {
        el.strip.dataset.id = up.id;
        el.stripText.innerHTML = `<strong>${up.name}</strong><span>${up.effect}</span>`;
        el.stripPrice.innerHTML = `${fmt(upgradeCost(up))}${icon('token')}`;
      }
      el.strip.disabled = state.tokens < upgradeCost(up);
    }
    // Was der Kauf bringt, und ab wann das nächste Upgrade für diesen Helfer kommt
    const nextTier = TIER_OWNED.find(t => t > state.gens[g.id]);
    const rateText = revealed ? `+${fmt(unitRate(g) * n, 1)} Schaden/s` : '';
    const tierText = revealed && nextTier ? ` · Upgrade ab ${nextTier}` : '';
    if (el.rate.dataset.text !== rateText + tierText) {
      el.rate.dataset.text = rateText + tierText;
      el.rate.innerHTML = `${rateText}<span class="tier-hint">${tierText}</span>`;
    }
    el.btn.title = revealed ? `${g.name}: ${fmt(unitRate(g), 1)} Schaden/s pro Stück` : '';
    el.qty.textContent = n > 1 ? `${n}× ` : '';
    el.cost.textContent = fmt(cost);
    el.progress.style.transform = `scaleX(${clamp01(state.tokens / cost).toFixed(3)})`;
  });
}

function renderUpgrades() {
  const available = [
    ...UNLOCKS.filter(u => !upgradeOwned(u) && u.unlocked(state)),
    ...UPGRADES.filter(u => !upgradeOwned(u) && u.unlocked(state)).sort((a, b) => a.cost - b.cost),
  ];
  const key = available.map(u => u.id).join(',');
  const container = $('upgrades');
  // Gerade gekauft: Die Karte spielt erst ihre Animation, dann wird neu sortiert.
  if (key !== upgradesKey && Date.now() >= upgradesHoldUntil) {
    upgradesKey = key;
    container.replaceChildren(...available.map(u => {
      const btn = document.createElement('button');
      btn.className = `upgrade${u.key ? ' unlock' : ''}`;
      btn.dataset.id = u.id;
      btn.innerHTML = `
        <span class="tile" style="--tile:${tileBg(u.colors)}">${icon(u.icon)}${u.badge ? `<span class="tile-badge">${u.badge}</span>` : ''}</span>
        <span class="upgrade-name">${u.name}</span>
        <span class="upgrade-desc">${u.flavor}</span>
        <span class="upgrade-effect">${u.effect}</span>
        ${u.key ? '<span class="upgrade-tag">Freischaltung · bleibt dauerhaft</span>' : ''}
        <span class="price">${fmt(upgradeCost(u))}${icon('token')}</span>
        <span class="card-progress"><span></span></span>`;
      btn.addEventListener('click', () => buyUpgrade(u));
      return btn;
    }));
    $('upgrades-empty').hidden = available.length > 0;
  }
  let affordable = 0;
  for (const btn of container.children) {
    if (btn.classList.contains('bought')) continue;
    const u = UNLOCKS.find(x => x.id === btn.dataset.id) || UPGRADES.find(x => x.id === btn.dataset.id);
    btn.disabled = state.tokens < upgradeCost(u);
    btn.querySelector('.card-progress span').style.transform = `scaleX(${clamp01(state.tokens / upgradeCost(u)).toFixed(3)})`;
    if (!btn.disabled) affordable++;
  }
  const badge = $('upgrade-badge');
  badge.hidden = affordable === 0 || panelVisible('upgrades');
  badge.textContent = String(affordable);
  $('rail-badge-upgrades').hidden = badge.hidden;
  $('rail-badge-upgrades').textContent = badge.textContent;
}

let dexKey = '';
function renderDex() {
  const key = `${[...state.discovered].sort((a, b) => a - b).join(',')}|${[...state.vortex].sort((a, b) => a - b).join(',')}|${state.highestWave}`;
  if (key === dexKey) return;
  dexKey = key;
  $('dex').replaceChildren(...MODELS.map((m, i) => {
    const known = state.discovered.has(i);
    const vortex = state.vortex.has(i);
    const item = document.createElement('div');
    item.className = `dex-item${known ? '' : ' unknown'}${vortex ? ' has-vortex' : ''} rarity-${modelRarity(i)}`;
    item.title = known
      ? `${m.name} – ${m.quip}${vortex ? ' · Dark Vortex gesammelt' : ''}`
      : (m.wave || 1) > state.highestWave ? `Taucht ab Welle ${m.wave} auf` : 'Noch nicht entdeckt';
    if (modelRarity(i) !== 'common') item.title += ` · ${RARITIES[modelRarity(i)].name}`;
    const logo = known ? logoSvg(m.family, m.hue, catalogSeed(i), { still: true, letter: m.name[0] }) : icon('question');
    // Gesammelte Dark-Vortex-Variante: beim Drüberfahren (oder Antippen) sichtbar
    item.innerHTML = vortex
      ? `<span class="dex-logo"><span class="dex-normal">${logo}</span><span class="dex-vortex">${logoSvg(m.family, m.hue, catalogSeed(i), { still: true, vortex: true, letter: m.name[0] })}</span><span class="dex-mark">${icon('vortex')}</span></span><span class="dex-name">${m.name}</span>`
      : `<span class="dex-logo">${logo}</span><span class="dex-name">${known ? m.name : ''}</span>`;
    if (vortex) {
      item.tabIndex = 0;
      item.addEventListener('click', () => item.classList.toggle('flip'));
    }
    return item;
  }));
  const vortexCount = state.vortex.size ? ` · ${state.vortex.size} Dark Vortex` : '';
  $('dex-count').textContent = `${state.discovered.size} von ${MODELS.length}${vortexCount}`;
}

function renderAchievements() {
  $('achievements').replaceChildren(...ACHIEVEMENTS.map(a => {
    const done = state.achievements.has(a.id);
    const row = document.createElement('div');
    row.className = `row ach${done ? ' done' : ''}`;
    row.innerHTML = `
      <span class="tile">${icon(done ? 'seal' : 'lock')}</span>
      <span class="row-main">
        <span class="row-title">${done ? a.name : 'Noch geheim'}</span>
        <span class="row-sub">${done || !a.secret ? a.desc : 'Ein geheimer Erfolg.'}</span>
      </span>
      <span class="ach-state">${done ? icon('check') : ''}</span>`;
    return row;
  }));
  $('ach-count').textContent = `${state.achievements.size} von ${ACHIEVEMENTS.length}`;
}

function renderEnemy(now) {
  const t = target();
  const enemyEl = $('enemy');
  const left = clamp01(t.unit.hp / t.maxHp);
  const used = 1 - left;
  const pct = `${used * 100}%`;
  const fill = $('meter-fill');
  const key = t.isBoss ? `boss-${state.boss.tier}` : `${state.wave}-${state.enemyIndex}-${t.seed}`;
  if (key !== enemyKey) {
    enemyKey = key;
    // Zum ersten Mal gesehen? Dann landet die KI in der Sammlung.
    const isNew = !t.isBoss && !state.discovered.has(state.enemy.kind);
    if (isNew) state.discovered.add(state.enemy.kind);
    $('glyph').innerHTML = logoSvg(t.model.family, t.hue, t.seed, { halo: t.ultra || t.isBoss, letter: t.model.name[0], vortex: t.vortex });
    $('arena').style.setProperty('--hue', String(Math.round(t.hue)));
    setParticleTheme(t);
    enemyEl.setAttribute('aria-label', `${t.name} angreifen`);
    enemyEl.classList.toggle('vortex', t.vortex);
    enemyEl.style.translate = '';
    teleportAt = now;
    $('enemy-name').textContent = t.name;
    $('enemy-quip').textContent = t.model.quip;
    const rarity = t.isBoss ? 'common' : modelRarity(state.enemy.kind);
    $('enemy-tag').textContent = [t.vortex ? 'Dark Vortex' : '', isNew ? 'Neu' : '', RARITIES[rarity].name, t.tag].filter(Boolean).join(' · ');
    $('enemy-tag').className = `tag ${t.vortex ? 'vortex' : rarity !== 'common' ? rarity : isNew ? 'new' : t.tagClass}`;
    if (isNew && rarity !== 'common' && !quiet) {
      toast(`<strong>${rarity === 'epic' ? 'Epische' : 'Seltene'} KI entdeckt: ${t.model.name}</strong><br><span class="muted">${t.model.quip}</span>`, 'sparkle');
      SFX.vortex();
    }
    $('meter-label').textContent = t.meter.label;
    const trait = t.isBoss ? BOSS_TRAIT : t.trait ? TRAITS[t.trait] : null;
    $('enemy-traits').hidden = !trait;
    $('enemy-traits').innerHTML = trait ? `<span class="trait${t.isBoss ? ' boss' : ''}">${icon(trait.icon)}${trait.name}</span><span class="trait-desc">${trait.desc}</span>` : '';
    for (const k of TRAIT_KEYS) enemyEl.classList.toggle(`trait-${k}`, t.trait === k);
    if (isNew) missionProgress('discover');
    if (t.vortex && !quiet && now - t.unit.spawnedAt < 1000) {
      toast('<strong>Eine Dark-Vortex-Variante!</strong><br><span class="muted">Super selten. Besiege sie für deine Sammlung.</span>', 'vortex');
      SFX.vortex();
    }
    moveWeakSpot(now);
    // Neue KI: Leiste ohne Animation auf den neuen Stand setzen.
    const ghost = $('meter-ghost');
    fill.style.transition = 'none';
    ghost.style.transition = 'none';
    fill.style.width = pct;
    ghost.style.width = pct;
    void fill.offsetWidth;
    fill.style.transition = '';
    ghost.style.transition = '';
    if (now - lastSpawnAnimation > 300) {
      lastSpawnAnimation = now;
      restartAnimation($('glyph'), 'spawn');
    }
  }
  // Eigenschaften, die sich laufend ändern
  enemyEl.style.scale = t.trait === 'shrink' ? String(Math.round((0.55 + 0.45 * left) * 1000) / 1000) : '';
  enemyEl.classList.toggle('shield-up', t.trait === 'shield' && shieldUp(t.unit, now));
  if (t.trait === 'harden') enemyEl.style.setProperty('--harden', String(Math.round(hardenLevel(t.unit, now) / HARDEN_MAX * 100) / 100));
  $('arena').classList.toggle('bossfight', t.isBoss);
  $('meter-ghost').style.width = pct;
  fill.style.width = pct;
  fill.classList.toggle('warn', used >= 0.5 && used < 0.8);
  fill.classList.toggle('danger', used >= 0.8);
  $('meter-used').textContent = `${Math.floor(used * 100)} % verbraucht`;
  $('meter-left').textContent = `noch ${fmtSpan(left * t.meter.span)}`;
  $('hp-text').textContent = `${fmt(Math.ceil(t.unit.hp))} / ${fmt(Math.ceil(t.maxHp))} HP`;
  const hint = hasUnlock('crit') ? 'Tippe auf die KI. Der leuchtende Punkt trifft kritisch.' : 'Tippe auf die KI, um ihr Limit zu verbrauchen.';
  if ($('tap-hint').textContent !== hint) $('tap-hint').textContent = hint;
  $('tap-hint').hidden = (state.clicks >= 3 && !(hasUnlock('crit') && state.crits === 0)) || chain.count >= 2;
  const locked = now < debuffs.lock;
  const throttled = locked || (t.trait === 'ratelimit' && now < throttledUntil);
  $('throttle').hidden = !throttled;
  if (throttled) $('throttle').textContent = locked ? `Taps gesperrt · ${Math.ceil((debuffs.lock - now) / 1000)} s` : '429 · Too Many Requests';
  enemyEl.classList.toggle('throttled', throttled);
}

// Teleportiert: springt an eine andere Stelle der Arena.
function teleportEnemy() {
  const tx = Math.round(randomBetween(-1, 1) * 100) / 100;
  const ty = Math.round(randomBetween(-26, 14));
  $('enemy').style.translate = `calc(${tx} * (50cqw - 50% - 10px)) ${ty}px`;
  restartAnimation($('glyph'), 'spawn');
}

let launchIcon = 'rocket';
let debuffKey = '';

// Combo, Krit-Kette, Countdowns und Negativ-Effekte in der Arena
function renderArenaHud(now) {
  const t = target();
  const chainActive = chain.count >= 2;
  $('chain').hidden = !chainActive;
  const chainLeft = chain.count > 0 ? (series.items.length ? 1 : clamp01(1 - (now - chain.lastAt) / chainWindow())) : 0;
  if (chainActive) {
    $('chain-count').textContent = `Krit-Kette ${chain.count}`;
    $('chain-mult').textContent = `nächster Krit ×${fmt(chainCritMult(), 1)}`;
    $('chain-fill').style.width = `${chainLeft * 100}%`;
  }
  const blind = now < debuffs.blind;
  const spot = $('weakspot');
  $('enemy').style.setProperty('--weak-size', String(weakRadius() * 2 * WEAKSPOT_VISUAL));
  const crits = hasUnlock('crit');
  spot.hidden = blind || !crits;
  for (const f of document.querySelectorAll('.weakspot.fake')) f.hidden = blind || !crits || t.trait !== 'decoy';
  spot.style.setProperty('--chain-left', String(chainLeft));
  spot.classList.toggle('chained', chain.count > 0);
  spot.classList.toggle('urgent', chain.count > 0 && chainLeft < 0.35);
  const comboActive = combo.count >= 3 && now - combo.lastAt <= mods.comboWindow;
  $('combo').hidden = !comboActive;
  if (comboActive) {
    $('combo-count').textContent = `Combo ${combo.count}`;
    $('combo-mult').textContent = `×${fmt(comboMult(), 2)}`;
    $('combo-fill').style.width = `${clamp01(1 - (now - combo.lastAt) / mods.comboWindow) * 100}%`;
  }
  // Countdown: Boss-Zeit, Ultra-Launch oder Flucht
  const timer = t.isBoss
    ? { end: state.boss.startedAt + mods.bossTime, icon: 'clock', label: 'Wochenlimit', urgent: 15_000, title: 'Besiege das Wochenlimit, bevor die Zeit abläuft.' }
    : t.ultra
      ? { end: state.enemy.spawnedAt + mods.ultraTime, icon: 'rocket', label: 'Launch in', urgent: 10_000, title: 'Ultra-KIs müssen fallen, bevor sie live gehen – sonst geht es zurück zu KI 1 dieser Welle.' }
      : t.trait === 'fleeting'
        ? { end: state.enemy.spawnedAt + FLEETING_MS, icon: 'hourglass', label: 'Flucht in', urgent: 5000, title: 'Flüchtige KIs hauen ab – ohne Beute und mit einem Teil deiner Tokens.' }
        : null;
  $('launch').hidden = !timer;
  if (timer) {
    const rest = Math.max(0, timer.end - now);
    if (launchIcon !== timer.icon) {
      launchIcon = timer.icon;
      $('launch-icon').innerHTML = icon(timer.icon);
    }
    $('launch-text').textContent = `${timer.label} ${t.isBoss ? '· ' : ''}${Math.ceil(rest / 1000)} s`;
    $('launch').title = timer.title;
    $('launch').classList.toggle('urgent', rest < timer.urgent);
  }
  // Negativ-Effekte der Boss-Angriffe (Taps gesperrt steht groß in der Mitte)
  const active = ['helpers', 'blind'].filter(k => now < debuffs[k]);
  const key = active.join(',');
  if (key !== debuffKey) {
    debuffKey = key;
    $('debuffs').innerHTML = active.map(k => `<span class="debuff" data-debuff="${k}">${icon(DEBUFFS[k].icon)}<span>${DEBUFFS[k].name}</span><span class="debuff-time"></span></span>`).join('');
  }
  for (const el of $('debuffs').children) el.querySelector('.debuff-time').textContent = `${Math.ceil((debuffs[el.dataset.debuff] - now) / 1000)} s`;
}

// Runde Fähigkeits-Knöpfe unten im Angriffsfeld
function buildSkills() {
  $('skill-dock').replaceChildren(...SKILLS.map((k, i) => {
    const btn = document.createElement('button');
    btn.className = 'dock-skill';
    btn.dataset.skill = k.id;
    btn.style.setProperty('--skill-bg', tileBg(k.colors));
    btn.innerHTML = `<span class="dock-icon">${icon(k.icon)}</span><span class="dock-time"></span><span class="dock-level"></span>`;
    btn.addEventListener('click', e => {
      e.stopPropagation();
      useSkill(k.id);
    });
    btn.dataset.key = String(i + 1);
    return btn;
  }));
  $('skill-list').replaceChildren(...SKILLS.map(k => {
    const btn = document.createElement('button');
    btn.className = 'row skill-row';
    btn.dataset.skill = k.id;
    btn.innerHTML = `
      <span class="tile" style="--tile:${tileBg(k.colors)}">${icon(k.icon)}</span>
      <span class="row-main">
        <span class="row-title">${k.name}<span class="row-count skill-lvl"></span></span>
        <span class="row-sub skill-now"></span>
        <span class="row-sub skill-next"></span>
        <span class="skill-pips">${'<i></i>'.repeat(SKILL_MAX_LEVEL)}</span>
      </span>
      <span class="price"><span class="skill-cost"></span></span>`;
    btn.addEventListener('click', () => levelSkill(k.id));
    return btn;
  }));
}

function renderSkills(now) {
  const silenced = !state.boss && state.enemy.trait === 'silence';
  $('skill-dock').classList.toggle('silenced', silenced);
  for (const btn of $('skill-dock').children) {
    const k = skillDef(btn.dataset.skill);
    const st = state.skills[k.id];
    const unlocked = st.level > 0;
    const active = now < st.activeUntil;
    const cooling = unlocked && now < st.readyAt;
    if (unlocked && !cooling && btn.classList.contains('cooling')) restartAnimation(btn, 'ready-pop');
    btn.classList.toggle('locked', !unlocked);
    btn.classList.toggle('active', active);
    btn.classList.toggle('cooling', cooling && !active);
    btn.classList.toggle('ready', unlocked && !cooling);
    btn.style.setProperty('--cd', cooling && !active ? String(clamp01((st.readyAt - now) / (k.cooldown(st.level) * mods.cooldown))) : '0');
    btn.querySelector('.dock-time').textContent = active ? Math.ceil((st.activeUntil - now) / 1000) : cooling ? Math.ceil((st.readyAt - now) / 1000) : '';
    btn.querySelector('.dock-level').textContent = unlocked ? st.level : '';
    btn.title = unlocked
      ? `${k.name} (Stufe ${st.level}, Taste ${btn.dataset.key}): ${k.describe(st.level)}`
      : `${k.name}: noch gesperrt – im Tab „Fähigkeiten“ freischalten`;
    btn.setAttribute('aria-label', btn.title);
  }
  if (state.tab !== 'skills') return;
  for (const row of $('skill-list').children) {
    const k = skillDef(row.dataset.skill);
    const lvl = state.skills[k.id].level;
    const reachable = state.highestWave >= k.wave;
    const maxed = lvl >= SKILL_MAX_LEVEL;
    row.disabled = !canLevelSkill(k);
    row.classList.toggle('teaser', !reachable && lvl === 0);
    row.querySelector('.skill-lvl').textContent = lvl > 0 ? `Stufe ${lvl}` : '';
    row.querySelector('.skill-now').textContent = k.describe(Math.max(lvl, 1));
    row.querySelector('.skill-next').textContent = maxed ? 'Höchste Stufe erreicht' : lvl > 0 ? `Nächste Stufe: ${k.describe(lvl + 1)}` : `Abklingzeit ${Math.round(k.cooldown(1) / 1000)} s`;
    row.querySelectorAll('.skill-pips i').forEach((pip, i) => pip.classList.toggle('on', i < lvl));
    row.querySelector('.skill-cost').innerHTML = maxed ? 'Max'
      : !reachable ? `ab Welle ${k.wave}`
        : `${lvl === 0 ? 'Freischalten · ' : ''}${fmt(skillCost(k))}${icon('token')}`;
  }
}

let missionsKey = '';
function renderMissions() {
  const key = state.missions.map(m => `${m.type}:${m.progress}/${m.target}`).join('|');
  if (key === missionsKey) return;
  missionsKey = key;
  $('missions').replaceChildren(...state.missions.map(m => {
    const t = missionType(m.type);
    const row = document.createElement('div');
    row.className = 'row mission';
    row.innerHTML = `
      <span class="tile" style="--tile:${tileBg(['#d97757', '#ff9f0a'])}">${icon(t.icon)}</span>
      <span class="row-main">
        <span class="row-title">${t.text(m.target)}</span>
        <span class="mission-bar"><span style="width:${clamp01(m.progress / m.target) * 100}%"></span></span>
        <span class="row-sub">${fmt(Math.min(m.progress, m.target))} von ${fmt(m.target)}</span>
      </span>
      <span class="price">+${fmt(m.reward * (1 + mods.missionReward))}${icon('token')}</span>`;
    return row;
  }));
  $('missions-count').textContent = `${fmt(state.missionsDone)} erledigt`;
}

// Fortschritt zum nächsten Wochenlimit: 500 Level in fünf Abschnitten
function renderTrack() {
  const level = currentLevel();
  const tier = bossTier(state.wave);
  const span = BOSS_EVERY_WAVES * WAVE_SIZE;
  const bossLevel = tier * span;
  const progress = clamp01((level - (bossLevel - span)) / span);
  trackSegs.forEach((fill, i) => {
    fill.style.width = `${clamp01(progress * trackSegs.length - i) * 100}%`;
  });
  $('track-title').textContent = `${state.boss ? 'Bosskampf' : 'Nächster Boss'}: ${bossName(tier)}`;
  $('track-text').textContent = `Level ${fmt(level)} / ${fmt(bossLevel)}`;
  $('track-foot').textContent = state.boss
    ? 'Tippe seine roten Angriffe an, bevor sich der Ring schließt.'
    : state.bossBlocked ? 'Zu stark? Werde stärker und fordere es erneut heraus.' : `noch ${fmt(bossLevel - level)} Level`;
  $('boss-btn').hidden = !state.bossBlocked || Boolean(state.boss);
  $('retreat-btn').hidden = !state.boss;
}

function renderStats(now) {
  const rows = [
    ['Tokens (gesamt)', fmt(state.totalEarned)],
    ['Tokens (dieser Kontext)', fmt(state.runEarned)],
    ['KIs besiegt', fmt(state.kills)],
    ['Höchste Welle', fmt(state.highestWave)],
    ['Kontext-Version', `v${version()}`],
    ['Erkenntnisse (gesamt)', fmt(state.insightsEarned)],
    ['Bosse besiegt', fmt(state.bossWins)],
    ['Boss-Angriffe abgewehrt', fmt(state.parries)],
    ['Taps', fmt(state.clicks)],
    ['Kritische Treffer', fmt(state.crits)],
    ['Beste Combo', fmt(state.maxCombo)],
    ['Beste Krit-Kette', fmt(state.bestChain)],
    ['Flow-Serien (perfekt)', `${fmt(state.seriesDone)} (${fmt(state.seriesPerfect)})`],
    ['Ultra-KIs vor dem Launch', fmt(state.ultraWins)],
    ['Aufträge erledigt', fmt(state.missionsDone)],
    ['Fähigkeiten eingesetzt', fmt(state.skillUses)],
    ['Helfer', fmt(totalGenerators(state))],
    ['Geistesblitze', fmt(state.goldenClicks)],
    ...(state.vortexKills ? [['Dark-Vortex-KIs besiegt', fmt(state.vortexKills)]] : []),
    ['Schadensbonus', `×${fmt(mods.global, 2)}`],
    ['Spielzeit', fmtDuration(now - state.startedAt)],
  ];
  $('stats').innerHTML = rows.map(([k, v]) => `<dt>${k}</dt><dd>${v}</dd>`).join('');
}

// Fähigkeitenbaum: fünf Äste als Spalten, zehn Reihen
const treeEls = new Map();
const treeLocks = [];
let treeSel = 'p-grad';
let treeHover = null;
let treeSelKey = '';

function buildTree() {
  const parts = TREE_BRANCHES.map(b => {
    const head = document.createElement('div');
    head.className = 'tree-branch';
    head.innerHTML = `<span class="tile" style="--tile:${tileBg(b.colors)}">${icon(b.icon)}</span><span>${b.name}</span>`;
    return head;
  });
  for (let row = 1; row <= TREE_ROW_VERSION.length; row++) {
    const lock = document.createElement('div');
    lock.className = 'tree-lock';
    lock.innerHTML = `${icon('lock')}<span>Ab Kontext-Version ${TREE_ROW_VERSION[row - 1]}</span>`;
    treeLocks.push(lock);
    parts.push(lock);
    for (const b of TREE_BRANCHES) {
      const node = TREE.find(n => n.branch === b.id && n.row === row);
      const cell = document.createElement('div');
      cell.className = `tree-cell${row > 1 ? ' linked' : ''}`;
      cell.style.setProperty('--tile', tileBg(b.colors));
      cell.innerHTML = `<button class="node" aria-label="${node.name}"><span class="node-icon">${icon(node.icon)}</span></button><span class="node-name">${node.name}</span><span class="node-level"></span>`;
      const btn = cell.querySelector('.node');
      btn.addEventListener('click', () => {
        treeSel = node.id;
        renderTree();
        // Ist die Detailleiste nicht sichtbar (niedriges Menü), dorthin scrollen
        const detail = $('tree-detail');
        if (getComputedStyle(detail).position !== 'sticky') detail.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      });
      // Doppelklick lernt direkt eine Stufe
      btn.addEventListener('dblclick', () => learnNode(node.id, 1));
      // Maus: Drüberfahren zeigt die Details sofort
      btn.addEventListener('pointerenter', e => {
        if (e.pointerType !== 'mouse') return;
        treeHover = node.id;
        renderTree();
      });
      btn.addEventListener('pointerleave', () => {
        if (!treeHover) return;
        treeHover = null;
        renderTree();
      });
      treeEls.set(node.id, { cell, btn, level: cell.querySelector('.node-level') });
      parts.push(cell);
    }
  }
  $('tree').replaceChildren(...parts);
}

function renderTree() {
  const v = version();
  TREE_ROW_VERSION.forEach((req, i) => { treeLocks[i].hidden = v >= req; });
  for (const node of TREE) {
    const el = treeEls.get(node.id);
    const level = treeLevel(node.id);
    const prev = nodePrev(node);
    el.cell.classList.toggle('open', nodeOpen(node));
    el.cell.classList.toggle('row-locked', !rowOpen(node.row));
    el.cell.classList.toggle('learned', level > 0);
    el.cell.classList.toggle('maxed', level >= node.max);
    el.cell.classList.toggle('affordable', canLearn(node));
    el.cell.classList.toggle('selected', node.id === treeSel);
    el.cell.classList.toggle('lit', Boolean(prev) && treeLevel(prev.id) > 0);
    el.level.textContent = `${level}/${node.max}`;
    el.btn.title = `${node.name} · Stufe ${level}/${node.max}`;
  }
  const node = treeNode(treeHover || treeSel);
  const level = treeLevel(node.id);
  const branch = TREE_BRANCHES.find(b => b.id === node.branch);
  $('tree-detail').classList.toggle('preview', Boolean(treeHover) && treeHover !== treeSel);
  if (treeSelKey !== node.id) {
    treeSelKey = node.id;
    $('td-tile').style.setProperty('--tile', tileBg(node.colors));
    $('td-tile').innerHTML = icon(node.icon);
    $('td-name').textContent = node.name;
  }
  const maxed = level >= node.max;
  $('td-level').textContent = `Stufe ${level}/${node.max}`;
  $('td-now').textContent = level > 0 ? `Jetzt: ${node.describe(level)}` : `${branch.name} · Reihe ${node.row}`;
  $('td-next').textContent = maxed ? 'Höchste Stufe erreicht' : `${level > 0 ? 'Nächste Stufe' : 'Stufe 1'}: ${node.describe(level + 1)}`;
  const prev = nodePrev(node);
  const req = !rowOpen(node.row)
    ? `Öffnet sich ab Kontext-Version ${TREE_ROW_VERSION[node.row - 1]} (du bist v${version()}).`
    : prev && !treeLevel(prev.id) ? `Lerne zuerst „${prev.name}“.` : '';
  $('td-req').textContent = req;
  $('td-req').hidden = !req;
  const learn = $('td-learn');
  learn.disabled = !canLearn(node);
  learn.innerHTML = maxed ? 'Maximum' : `Lernen · ${fmt(nodeCost(node))}${icon('bulb')}`;
  const n = affordableLevels(node);
  $('td-max').disabled = n < 2;
  $('td-max').textContent = n >= 2 ? `Max · ${fmt(n)}` : 'Max';
  $('td-balance').textContent = `${fmt(state.insights)} verfügbar`;
}

function renderPrestige() {
  const affordable = TREE.filter(canLearn).length;
  const badge = $('prestige-badge');
  badge.hidden = affordable === 0 || panelVisible('prestige');
  badge.textContent = String(affordable);
  $('rail-badge-prestige').hidden = badge.hidden;
  $('rail-badge-prestige').textContent = badge.textContent;
  if (state.tab !== 'prestige') return;
  const gain = prestigeGain();
  $('version').textContent = `v${version()}`;
  $('insights').textContent = fmt(state.insights);
  $('version-bonus').textContent = `+${fmt(VERSION_BONUS * state.prestiges * 100)} %`;
  $('run-wave').textContent = fmt(state.runWave);
  $('insights-pending').textContent = `+${fmt(gain)}`;
  $('prestige-btn').disabled = gain < 1;
  $('prestige-hint').textContent = state.runWave < PRESTIGE_MIN_WAVE
    ? `Möglich ab Welle ${PRESTIGE_MIN_WAVE}. Du bist in Welle ${fmt(state.runWave)}.`
    : `Mehr Erkenntnisse ab Welle ${fmt(nextGainWave())}.`;
  $('tree-reset').disabled = !treeTotal();
  renderTree();
}

const TAB_ORDER = ['helpers', 'skills', 'upgrades', 'prestige', 'missions', 'more'];

// ---------- Handy: Menü als Karte von unten ----------
// Zugeklappt sieht man nur die Tab-Leiste; halb offen bleibt die Arena darüber frei.
const sheet = { level: 0 };

// Karte von unten nur am Handy im Hochformat (bzw. in schmalen, hohen Fenstern); quer gibt es die Leisten.
const SHEET_QUERY = '(max-width: 900px) and (orientation: portrait), (max-width: 900px) and (min-height: 521px)';
function sheetMode() {
  return window.matchMedia(SHEET_QUERY).matches;
}

function sheetHeights() {
  const side = $('side');
  const cs = getComputedStyle(side);
  const collapsed = parseFloat(cs.paddingBottom) + $('sheet-handle').offsetHeight + side.querySelector('.tabs').offsetHeight + 8;
  const vh = window.innerHeight;
  // Halb offen: genau bis unter die Arena (bei ganz nach oben gescrollter Seite)
  const arenaBottom = $('arena').getBoundingClientRect().bottom + window.scrollY;
  const half = Math.min(vh * 0.62, Math.max(280, vh - arenaBottom - 10));
  return [collapsed, half, vh * 0.9];
}

function applySheet(px) {
  const h = `${Math.round(px)}px`;
  $('side').style.height = h;
  document.documentElement.style.setProperty('--sheet-h', h);
}

function setSheet(level) {
  if (!sheetMode()) return;
  sheet.level = level;
  const heights = sheetHeights();
  document.documentElement.style.setProperty('--sheet-min', `${Math.round(heights[0])}px`);
  applySheet(heights[level]);
  $('side').classList.toggle('open', level > 0);
  if (level > 0 && window.scrollY > 0) window.scrollTo({ top: 0, behavior: 'smooth' });
  requestAnimationFrame(placePills);
}

function initSheet() {
  const side = $('side');
  const handle = $('sheet-handle');
  let drag = null;
  handle.addEventListener('pointerdown', e => {
    if (!sheetMode()) return;
    e.preventDefault();
    handle.setPointerCapture(e.pointerId);
    drag = { y: e.clientY, h: side.offsetHeight, t: performance.now(), lastY: e.clientY, lastT: performance.now(), moved: 0 };
    side.classList.add('dragging');
  });
  handle.addEventListener('pointermove', e => {
    if (!drag) return;
    const [min, , max] = sheetHeights();
    const h = Math.min(max, Math.max(min, drag.h - (e.clientY - drag.y)));
    drag.moved = Math.max(drag.moved, Math.abs(e.clientY - drag.y));
    drag.v = (e.clientY - drag.lastY) / Math.max(1, performance.now() - drag.lastT);
    drag.lastY = e.clientY;
    drag.lastT = performance.now();
    applySheet(h);
    side.classList.add('open');
  });
  const end = () => {
    if (!drag) return;
    side.classList.remove('dragging');
    const heights = sheetHeights();
    let level;
    if (drag.moved < 6) level = sheet.level === 0 ? 1 : 0;      // Antippen: auf oder zu
    else if ((drag.v || 0) > 0.6) level = Math.max(0, sheet.level - 1); // schnell nach unten gewischt
    else if ((drag.v || 0) < -0.6) level = Math.min(2, sheet.level + 1);
    else {
      const h = side.offsetHeight;
      level = heights.reduce((bestI, v, i) => (Math.abs(v - h) < Math.abs(heights[bestI] - h) ? i : bestI), 0);
    }
    drag = null;
    setSheet(level);
  };
  handle.addEventListener('pointerup', end);
  handle.addEventListener('pointercancel', end);
  let wasSheet = null;
  const sync = () => {
    const now = sheetMode();
    if (now && wasSheet === false) {
      // Ins Hochformat gedreht: ausgefahrenes Menü und Platz-Machen zurücksetzen
      drawer.open = false;
      drawer.pinned = false;
      side.classList.remove('pinned');
      document.body.classList.remove('drawer-open');
      makeRoom();
    }
    if (now) setSheet(wasSheet === false ? 0 : sheet.level);
    else if (wasSheet !== false) {
      // Gedreht oder breiter geworden: Karte weg, Leisten übernehmen
      side.style.height = '';
      side.classList.remove('open');
      document.documentElement.style.removeProperty('--sheet-h');
      drawer.open = false;
      document.body.classList.remove('drawer-open');
      makeRoom();
    }
    wasSheet = now;
  };
  window.addEventListener('resize', sync);
  sync();
}

// ---------- Desktop: Menü fährt seitlich aus der Arena aus ----------
const TAB_INFO = {
  helpers: { name: 'Helfer', icon: 'agents', side: 'left' },
  skills: { name: 'Fähigkeiten', icon: 'storm', side: 'left' },
  upgrades: { name: 'Upgrades', icon: 'layers', side: 'left' },
  prestige: { name: 'Prestige', icon: 'compress', side: 'right' },
  missions: { name: 'Ziele', icon: 'checklist', side: 'right' },
  more: { name: 'Mehr', icon: 'more', side: 'right' },
};
const drawer = { open: false, pinned: false, side: 'left', timer: 0, swap: 0 };

function panelVisible(tab) {
  if (state.tab !== tab) return false;
  return sheetMode() ? sheet.level > 0 : drawer.open;
}

// Lage: direkt neben der Leiste, über der Arena
function placeDrawer() {
  if (sheetMode()) return;
  const app = document.querySelector('.app').getBoundingClientRect();
  const arena = $('arena').getBoundingClientRect();
  const width = Math.min(480, arena.width * 0.46);
  const inset = 72;
  const left = drawer.side === 'left' ? arena.left - app.left + inset : arena.right - app.left - inset - width;
  // Endlage merken (das Menü gleitet noch herein, sein Rechteck ist dann kleiner)
  drawer.box = { left: left + app.left, right: left + app.left + width };
  const root = document.documentElement.style;
  root.setProperty('--drawer-left', `${Math.round(left)}px`);
  root.setProperty('--drawer-top', `${Math.round(arena.top - app.top + 10)}px`);
  root.setProperty('--drawer-w', `${Math.round(width)}px`);
  // Nur so hoch wie die Arena: KI-Infos und Boss-Leiste darunter bleiben sichtbar
  root.setProperty('--drawer-h', `${Math.round(arena.height - 20)}px`);
}

// Allgemeine Einblendungen (ohne Tap-Position) in den freien Teil der Arena legen
function freeX(x) {
  const f = arenaFree();
  return f.left + x * (100 - f.left - f.right) / 100;
}

// Freier Teil der Arena (in Prozent ihrer Breite), wenn das Menü offen ist
function arenaFree() {
  const a = $('arena');
  const w = a.clientWidth || 1;
  return { left: (parseFloat(a.style.getPropertyValue('--free-l')) || 0) / w * 100, right: (parseFloat(a.style.getPropertyValue('--free-r')) || 0) / w * 100 };
}

// Die Arena macht Platz: KI, Fähigkeiten und Anzeigen gleiten auf die freie Seite.
function makeRoom() {
  const a = $('arena');
  if (!drawer.open || sheetMode()) {
    a.style.removeProperty('--free-l');
    a.style.removeProperty('--free-r');
    a.style.removeProperty('--shift');
    a.style.paddingLeft = '';
    a.style.paddingRight = '';
    return;
  }
  const arena = a.getBoundingClientRect();
  const side = drawer.box || $('side').getBoundingClientRect();
  const enemyW = $('enemy').offsetWidth;
  const freeL = drawer.side === 'left' ? Math.max(0, side.right - arena.left + 8) : 0;
  const freeR = drawer.side === 'right' ? Math.max(0, arena.right - side.left + 8) : 0;
  // Die KI steht mittig im freien Bereich zwischen Menü und gegenüberliegender Leiste –
  // und auf keinen Fall unter dem Menü.
  const free = Math.max(freeL, freeR);
  const pad = Math.max(0, free - 72, 2 * (free + 16) - arena.width + enemyW);
  a.style.setProperty('--free-l', `${Math.round(freeL)}px`);
  a.style.setProperty('--free-r', `${Math.round(freeR)}px`);
  a.style.setProperty('--shift', `${Math.round(freeL ? pad / 2 : -pad / 2)}px`);
  a.style.paddingLeft = freeL ? `${Math.round(pad)}px` : '';
  a.style.paddingRight = freeR ? `${Math.round(pad)}px` : '';
}

function openDrawer(tab) {
  const info = TAB_INFO[tab];
  clearTimeout(drawer.timer);
  const side = $('side');
  // Andere Seite: kurz einklappen, dann auf der neuen Seite ausfahren
  if (drawer.open && drawer.side !== info.side) {
    side.classList.remove('open');
    clearTimeout(drawer.swap);
    drawer.swap = setTimeout(() => openDrawer(tab), 160);
    drawer.open = false;
    makeRoom();
    return;
  }
  const from = TAB_ORDER.indexOf(state.tab);
  $('side-body').dataset.dir = TAB_ORDER.indexOf(tab) >= from ? 'right' : 'left';
  if (state.tab !== tab) $('side-body').scrollTop = 0;
  drawer.side = info.side;
  side.classList.toggle('dock-left', info.side === 'left');
  side.classList.toggle('dock-right', info.side === 'right');
  placeDrawer();
  $('drawer-title').textContent = info.name;
  $('drawer-icon').innerHTML = icon(info.icon);
  drawer.open = true;
  side.classList.add('open');
  document.body.classList.add('drawer-open');
  makeRoom();
  state.tab = tab;
  renderTabs();
  render();
}

function closeDrawer() {
  drawer.open = false;
  drawer.pinned = false;
  $('side').classList.remove('open', 'pinned');
  document.body.classList.remove('drawer-open');
  makeRoom();
  renderRails();
}

function scheduleDrawerClose() {
  clearTimeout(drawer.timer);
  if (!drawer.pinned) drawer.timer = setTimeout(closeDrawer, 420);
}

function renderRails() {
  for (const btn of document.querySelectorAll('.rail-btn')) {
    btn.classList.toggle('active', drawer.open && btn.dataset.rail === state.tab);
  }
}

function initDrawer() {
  const side = $('side');
  for (const btn of document.querySelectorAll('.rail-btn')) {
    // Kurz verweilen: erst fährt der Name aus, dann das Menü (ist es schon offen, wechselt es sofort)
    btn.addEventListener('pointerenter', e => {
      if (e.pointerType !== 'mouse' || sheetMode()) return;
      clearTimeout(drawer.intent);
      clearTimeout(drawer.timer);
      if (drawer.open) openDrawer(btn.dataset.rail);
      else drawer.intent = setTimeout(() => openDrawer(btn.dataset.rail), 150);
    });
    btn.addEventListener('pointerleave', e => {
      if (e.pointerType !== 'mouse') return;
      clearTimeout(drawer.intent);
      scheduleDrawerClose();
    });
    // Klicken pinnt das Menü offen; nochmal klicken schließt es.
    btn.addEventListener('click', e => {
      e.stopPropagation();
      if (sheetMode()) return;
      if (drawer.open && drawer.pinned && state.tab === btn.dataset.rail) {
        closeDrawer();
        return;
      }
      drawer.pinned = true;
      side.classList.add('pinned');
      openDrawer(btn.dataset.rail);
    });
  }
  side.addEventListener('pointerenter', e => {
    if (e.pointerType === 'mouse') clearTimeout(drawer.timer);
  });
  side.addEventListener('pointerleave', e => {
    if (e.pointerType === 'mouse' && !sheetMode()) scheduleDrawerClose();
  });
  // Etwas im Menü angeklickt: offen halten, damit man mehrmals hintereinander kaufen kann
  side.addEventListener('pointerdown', () => {
    if (sheetMode() || !drawer.open) return;
    drawer.pinned = true;
    side.classList.add('pinned');
  });
  $('drawer-pin').addEventListener('click', closeDrawer);
  document.addEventListener('pointerdown', e => {
    if (sheetMode() || !drawer.open || side.contains(e.target) || e.target.closest?.('.rail, .modal, #island')) return;
    // Tippen auf die KI darf das gepinnte Menü offen lassen
    if (e.target.closest?.('#enemy, .flow, .boss-attack, .dock-skill')) return;
    closeDrawer();
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && drawer.open) closeDrawer();
  });
  window.addEventListener('resize', () => {
    if (drawer.open) placeDrawer();
    makeRoom();
  });
}

// Gleitende Auswahl-Pille hinter dem aktiven Segment (Tabs und Kaufmenge)
function placePill(group) {
  let pill = group.querySelector(':scope > .seg-pill');
  if (!pill) {
    pill = document.createElement('span');
    pill.className = 'seg-pill';
    group.prepend(pill);
    group.classList.add('has-pill');
  }
  const active = group.querySelector('button[aria-selected="true"], button.active');
  if (!active) return;
  const style = pill.style;
  const target = `translate(${active.offsetLeft}px, ${active.offsetTop}px)`;
  if (style.transform === target && style.width === `${active.offsetWidth}px`) return;
  style.transform = target;
  style.width = `${active.offsetWidth}px`;
  style.height = `${active.offsetHeight}px`;
}

function placePills() {
  for (const group of document.querySelectorAll('.segmented')) placePill(group);
}

function renderTabs() {
  if (!$(`tab-${state.tab}`)) state.tab = state.tab === 'achievements' ? 'missions' : 'helpers';
  for (const btn of document.querySelectorAll('[role="tab"]')) {
    const active = btn.dataset.tab === state.tab;
    btn.setAttribute('aria-selected', String(active));
    $(`tab-${btn.dataset.tab}`).hidden = !active;
  }
  placePills();
  renderRails();
}

function render() {
  const now = Date.now();
  const dps = currentDps(now);
  const click = clickValue(now);
  $('tps').textContent = `≈ ${fmt(dps * tokenRate() * tokenBoost(now), 1)}/s + Beute`;
  $('dps').textContent = fmt(dps, 1);
  $('click-dmg').textContent = `+${fmt(click, 1)} pro Tap`;
  if ($('wave').textContent !== fmt(state.wave)) {
    $('wave').textContent = fmt(state.wave);
    restartAnimation($('wave'), 'bump');
  }
  $('wave-sub').textContent = state.boss ? 'Bosskampf' : `Level ${fmt(currentLevel())}`;
  $('daily-btn').hidden = state.lastDaily === dayId(now);
  document.title = `${fmt(Math.floor(state.tokens))} Tokens · No Limit`;

  const buff = $('buff');
  buff.hidden = !(now < state.frenzyUntil);
  if (!buff.hidden) buff.textContent = `Geistesblitz · Schaden ×${FRENZY_MULT} · noch ${Math.ceil((state.frenzyUntil - now) / 1000)} s`;

  for (const btn of document.querySelectorAll('[data-amount]')) {
    btn.classList.toggle('active', String(state.buyAmount) === btn.dataset.amount);
  }
  if (state.tab === 'helpers') placePill(document.querySelector('.segmented-small'));

  renderEnemy(now);
  renderArenaHud(now);
  renderSkills(now);
  renderTrack();
  renderPrestige();
  renderIsland(now);
  renderGenerators();
  renderUpgrades();
  renderStats(now);
  renderDex();
  renderMissions();
  $('sound-btn').setAttribute('aria-checked', String(state.sound));
}

// Angezeigte Tokens folgen dem echten Wert weich (zählen hoch und runter).
const shownTokens = { value: null };
function animateCounters() {
  const target = Math.floor(state.tokens);
  const shown = shownTokens.value ?? target;
  const diff = target - shown;
  shownTokens.value = Math.abs(diff) <= Math.max(1, Math.abs(target) * 0.0005) ? target : shown + diff * 0.2;
  const text = fmt(Math.floor(shownTokens.value));
  if ($('tokens').textContent !== text) $('tokens').textContent = text;
  requestAnimationFrame(animateCounters);
}

// Schadenszahlen und Beute über der KI; Position in Prozent der Arena.
function popup(text, kind, x, y, withToken = false) {
  if (quiet || document.hidden) return;
  const layer = $('popups');
  while (layer.childElementCount > 60) layer.firstElementChild.remove();
  const el = document.createElement('span');
  el.className = `popup ${kind}`;
  el.textContent = text;
  if (withToken) el.insertAdjacentHTML('beforeend', icon('token'));
  el.style.left = `${x}%`;
  el.style.top = `${y}%`;
  el.style.setProperty('--drift', `${Math.round(randomBetween(-16, 16))}px`);
  if (kind.startsWith('crit')) el.style.setProperty('--rot', `${Math.round(randomBetween(-7, 7))}deg`);
  el.addEventListener('animationend', () => el.remove());
  layer.append(el);
}

let overlayTimer = 0;
function showOverlay(text, graphic) {
  if (quiet) return;
  const overlay = $('overlay');
  $('overlay-text').textContent = text;
  $('overlay-glyph').innerHTML = graphic;
  overlay.hidden = true;
  void overlay.offsetWidth;
  overlay.hidden = false;
  clearTimeout(overlayTimer);
  overlayTimer = setTimeout(() => { overlay.hidden = true; }, 1900);
}

function toast(html, iconName = 'token') {
  if (quiet) return;
  const box = $('toasts');
  while (box.childElementCount >= 3) box.firstElementChild.remove();
  const el = document.createElement('div');
  el.className = 'toast';
  el.innerHTML = `<span class="tile">${icon(iconName)}</span><span>${html}</span>`;
  box.append(el);
  setTimeout(() => el.classList.add('out'), 4000);
  setTimeout(() => el.remove(), 4300);
}

// Eigener Dialog statt alert/confirm/prompt (die sind z. B. in eingebetteten Seiten blockiert).
// Ergebnis: true bzw. der eingegebene Text bei OK, false bzw. null bei Abbrechen.
function showDialog({ title, text, ok = 'OK', cancel = null, input = null }) {
  return new Promise(resolve => {
    const field = $('modal-input');
    $('modal-title').textContent = title;
    $('modal-text').textContent = text;
    $('modal-ok').textContent = ok;
    $('modal-cancel').textContent = cancel || '';
    $('modal-cancel').hidden = cancel === null;
    field.hidden = input === null;
    if (input) {
      field.value = input.value || '';
      field.readOnly = Boolean(input.readOnly);
      field.placeholder = input.placeholder || '';
    }
    $('modal').hidden = false;
    if (input) {
      field.focus();
      field.select();
    } else {
      $('modal-ok').focus();
    }
    const close = result => {
      $('modal').hidden = true;
      $('modal-ok').onclick = null;
      $('modal-cancel').onclick = null;
      resolve(result);
    };
    $('modal-ok').onclick = () => close(input ? field.value : true);
    $('modal-cancel').onclick = () => close(input ? null : false);
  });
}

// ---------- Spielstand exportieren / importieren ----------

function exportSave() {
  const code = btoa(unescape(encodeURIComponent(JSON.stringify(toSaveData()))));
  try {
    navigator.clipboard.writeText(code).then(
      () => toast('Spielstand in die Zwischenablage kopiert.', 'check'),
      () => {},
    );
  } catch {
    // Kein Zugriff auf die Zwischenablage – der Code steht im Dialog zum Kopieren.
  }
  showDialog({
    title: 'Spielstand exportieren',
    text: 'Kopiere diesen Code und bewahre ihn auf. Mit „Importieren“ holst du deinen Spielstand zurück.',
    input: { value: code, readOnly: true },
  });
}

function resetView() {
  mods = computeMods();
  ensureMissions();
  upgradesKey = '';
  enemyKey = '';
  missionsKey = '';
  save();
  renderAchievements();
  renderTabs();
  render();
}

async function importSave() {
  const code = await showDialog({
    title: 'Spielstand importieren',
    text: 'Füge deinen exportierten Code ein. Der aktuelle Spielstand wird überschrieben.',
    ok: 'Importieren',
    cancel: 'Abbrechen',
    input: { placeholder: 'Code hier einfügen' },
  });
  if (!code) return;
  try {
    state = fromSaveData(JSON.parse(decodeURIComponent(escape(atob(code.trim())))));
    resetView();
    toast('Spielstand importiert.', 'check');
  } catch {
    toast('Das ist kein gültiger Spielstand-Code. Bitte prüfe, ob er vollständig kopiert wurde.', 'question');
  }
}

async function hardReset() {
  const ok = await showDialog({
    title: 'Alles löschen?',
    text: 'Dein gesamter Fortschritt inklusive Erkenntnissen und Erfolgen wird gelöscht. Das lässt sich nicht rückgängig machen.',
    ok: 'Löschen',
    cancel: 'Abbrechen',
  });
  if (!ok) return;
  state = freshState();
  resetView();
}

// ---------- Hauptschleife ----------

let lastTick = Date.now();
let lastSaveAt = Date.now();
let lastAutoPopup = 0;

function tick() {
  const now = Date.now();
  const elapsed = now - lastTick;
  lastTick = now;
  // Zurückgestellte Uhr (elapsed < 0) bringt nichts; lange Pausen zählen wie Offline-Zeit.
  if (elapsed > BACKGROUND_GAP_MS) {
    quiet = true;
    advance(Math.min(elapsed, offlineCap()), now);
    quiet = false;
  } else if (elapsed > 0) {
    advance(elapsed, now);
  }
  if (skillActive('storm', now)) {
    stormAcc += Math.min(Math.max(elapsed, 0), 1000) / 1000 * skillPower('storm');
    while (stormAcc >= 1) {
      stormAcc -= 1;
      doTap({ auto: true });
    }
  } else {
    stormAcc = 0;
  }
  // Aufmerksamkeitsköpfe (Fähigkeitenbaum): automatische Taps
  if (mods.autoTap > 0) {
    autoTapAcc = Math.min(autoTapAcc + Math.min(Math.max(elapsed, 0), 1000) / 1000 * mods.autoTap, 60);
    while (autoTapAcc >= 1) {
      autoTapAcc -= 1;
      doTap({ auto: true, passive: true });
    }
  }
  if (mods.autoBuyMs > 0 && now - lastAutoBuy >= mods.autoBuyMs) {
    lastAutoBuy = now;
    autoBuy();
  }
  if (!state.boss && state.enemy.trait === 'teleport' && now - teleportAt >= TELEPORT_MS) {
    teleportAt = now;
    teleportEnemy();
  }
  if (chain.count > 0 && now - chain.lastAt > chainWindow() && !series.items.length) breakChain(now);
  else if (chain.count === 0 && now - weak.movedAt > WEAKSPOT_MOVE_MS) moveWeakSpot(now);
  driftWeakSpot(Math.min(Math.max(elapsed, 0), 250));
  checkUltra(now);
  checkBoss(now);
  checkFleeting(now);
  updateAttacks(now);
  updateSeries(now);
  if (now - lastAutoPopup >= 1000 && currentDps(now) > 0) {
    lastAutoPopup = now;
    popup(`−${fmt(currentDps(now), 1)}`, 'auto', freeX(randomBetween(30, 70)), randomBetween(55, 75));
  }
  state.maxSeen = Math.max(state.maxSeen, now);
  checkAchievements();
  updateGolden(now);
  updateLimits(now);
  render();
  if (now - lastSaveAt >= SAVE_EVERY_MS) {
    lastSaveAt = now;
    save();
  }
}

function offlineCap() {
  return OFFLINE_CAP_MS + mods.offlineHours * HOUR_MS;
}

function applyOfflineProgress() {
  const now = Date.now();
  // maxSeen merkt sich die späteste je gesehene Zeit. So bringt Vor- und Zurückstellen der Uhr nichts.
  const ref = Math.max(state.lastSave, state.maxSeen);
  if (now < ref - CLOCK_TOLERANCE_MS) {
    showDialog({
      title: 'Uhr zurückgestellt',
      text: `Die Systemzeit liegt vor deinem letzten Besuch. Offline-Fortschritt gibt es wieder ab ${dateFmt.format(ref)}.`,
    });
    return;
  }
  const away = now - ref;
  if (away < 10_000) return;
  const counted = Math.min(away, offlineCap());
  const before = { earned: state.totalEarned, kills: state.kills, wave: state.wave, bossWins: state.bossWins, bossFails: state.bossFails };
  quiet = true;
  advance(counted, now);
  quiet = false;
  const earned = state.totalEarned - before.earned;
  if (earned <= 0) return;
  const lines = [
    `Du warst ${fmtSpan(away)} weg.${away > counted ? ` Angerechnet werden höchstens ${fmtSpan(counted)}.` : ''}`,
    `Deine Helfer haben ${fmt(earned)} Tokens verdient und ${fmt(state.kills - before.kills)} KIs besiegt.`,
  ];
  if (state.wave > before.wave) lines.push(`Welle ${before.wave} → ${state.wave}`);
  if (state.bossWins > before.bossWins) lines.push('Und sie haben das Wochenlimit besiegt.');
  else if (state.bossFails > before.bossFails) lines.push('Am Wochenlimit sind sie allerdings gescheitert.');
  showDialog({ title: 'Willkommen zurück', text: lines.join('\n') });
}

// Als App installierbar: nur wenn die Seite über eine Web-Adresse mit Manifest läuft
function registerApp() {
  try {
    if (!('serviceWorker' in navigator) || !location.protocol.startsWith('http') || !document.querySelector('link[rel="manifest"]')) return;
    navigator.serviceWorker.register('sw.js').catch(() => {});
  } catch {
    // Ohne Service Worker läuft das Spiel genauso, nur nicht offline als App.
  }
}

function init() {
  for (const el of document.querySelectorAll('[data-icon]')) el.innerHTML = icon(el.dataset.icon);
  $('golden').innerHTML = icon('token');
  buildGenerators();
  buildTrack();
  buildSkills();
  buildTree();
  ensureMissions();
  applyOfflineProgress();
  initIsland();

  $('enemy').addEventListener('click', attackTap);
  $('retreat-btn').addEventListener('click', retreat);
  $('boss-btn').addEventListener('click', challengeBoss);
  $('daily-btn').addEventListener('click', claimDaily);
  $('golden').addEventListener('click', catchGolden);
  $('prestige-btn').addEventListener('click', prestige);
  $('tree-reset').addEventListener('click', resetTree);
  $('td-learn').addEventListener('click', () => learnNode(treeSel, 1));
  $('td-max').addEventListener('click', () => learnNode(treeSel, Infinity));
  $('export-btn').addEventListener('click', exportSave);
  $('import-btn').addEventListener('click', importSave);
  $('reset-btn').addEventListener('click', hardReset);
  $('sound-btn').addEventListener('click', () => {
    state.sound = !state.sound;
    if (state.sound) SFX.win();
    render();
  });
  // Tasten 1–6 lösen die Fähigkeiten aus
  document.addEventListener('keydown', e => {
    if (e.metaKey || e.ctrlKey || e.altKey || !$('modal').hidden || e.target.closest?.('input, textarea')) return;
    const i = Number(e.key) - 1;
    if (Number.isInteger(i) && i >= 0 && i < SKILLS.length) useSkill(SKILLS[i].id);
  });
  $('glyph').addEventListener('animationend', e => {
    if (e.target === $('glyph')) e.target.classList.remove('hit', 'crithit', 'spawn');
  });
  for (const btn of document.querySelectorAll('[role="tab"]')) {
    btn.addEventListener('click', () => {
      if (sheetMode()) {
        // Zugeklappt: öffnen. Offen und derselbe Tab: zuklappen.
        if (sheet.level === 0) setSheet(1);
        else if (btn.dataset.tab === state.tab) {
          setSheet(0);
          return;
        }
      }
      const from = TAB_ORDER.indexOf(state.tab);
      const to = TAB_ORDER.indexOf(btn.dataset.tab);
      $('side-body').dataset.dir = to >= from ? 'right' : 'left';
      if (state.tab !== btn.dataset.tab) $('side-body').scrollTop = 0;
      state.tab = btn.dataset.tab;
      renderTabs();
      render();
    });
  }
  initSheet();
  initDrawer();
  for (const btn of document.querySelectorAll('[data-amount]')) {
    btn.addEventListener('click', () => {
      state.buyAmount = btn.dataset.amount === 'max' ? 'max' : Number(btn.dataset.amount);
      render();
    });
  }
  window.addEventListener('beforeunload', save);
  document.addEventListener('visibilitychange', () => { if (document.hidden) save(); });

  renderAchievements();
  renderTabs();
  render();
  moveWeakSpot(Date.now());
  requestAnimationFrame(animateCounters);
  initParticles();
  registerApp();
  // Auswahl-Pillen erst ohne Animation setzen, danach gleiten sie
  placePills();
  requestAnimationFrame(() => document.body.classList.add('pills-ready'));
  window.addEventListener('resize', placePills);
  setInterval(tick, TICK_MS);
}

init();
