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
const PRESTIGE_BASE = 1e6;
const INSIGHT_BONUS = 0.1;
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
const WEEKLY_GOAL = 500;
const WEEKLY_STAGES = 5;
const BOSS_HP_MULT = 100;

// Kampf-Würze
const COMBO_WINDOW_MS = 1500;   // so lange darf zwischen zwei Taps liegen
const COMBO_STEP = 0.01;        // +1 % Tap-Schaden pro Combo-Stufe
const COMBO_CAP = 100;
const CRIT_MULT = 4;
const WEAKSPOT_RADIUS = 0.13;   // Trefferradius als Anteil der KI-Größe
const WEAKSPOT_MOVE_MS = 2600;
const ULTRA_TIME_MS = 30_000;   // Launch-Countdown der Ultra-KI
const TRAIT_MIN_WAVE = 3;
const TRAIT_CHANCE = 0.25;
const REGEN_PER_S = 0.03;
const RATE_LIMIT_TAPS = 8;      // mehr Taps pro Sekunde lösen „429“ aus
const RATE_LIMIT_MS = 1500;
const FORK_HP = 0.4;
const SKILL_MAX_LEVEL = 10;
const SKILL_COST_GROWTH = 2.6;
const MISSION_COUNT = 3;

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
];
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
    icon: 'crosshair', colors: ['#ff375f', '#ff9f0a'], cost: 5000, unlocked: s => s.crits >= 15, apply: m => { m.crit *= 1.5; } },
  { id: 'crit-2', name: 'Adversarial Prompts', flavor: 'Genau die Eingabe, die das Modell verwirrt.', effect: 'Schwachstelle 40 % größer',
    icon: 'target', colors: ['#bf5af2', '#ff375f'], cost: 2e5, unlocked: s => s.crits >= 100, apply: m => { m.weakSize *= 1.4; } },
  { id: 'crit-3', name: 'Zero-Day-Exploit', flavor: 'Diese Lücke kennt noch niemand.', effect: 'Kritische Treffer ×2',
    icon: 'crosshair', colors: ['#d9363e', '#6e3bd8'], cost: 5e7, unlocked: s => s.crits >= 500, apply: m => { m.crit *= 2; } },
  { id: 'combo-1', name: 'Arbeitsgedächtnis', flavor: 'Hält den Faden ein bisschen länger.', effect: 'Combo hält 1 s länger',
    icon: 'flame', colors: ['#ff9f0a', '#ff375f'], cost: 20_000, unlocked: s => s.maxCombo >= 30, apply: m => { m.comboWindow += 1000; } },
  { id: 'combo-2', name: 'Langer Atem', flavor: 'Hundert Taps sind erst der Anfang.', effect: 'Combo bis ×3',
    icon: 'flame', colors: ['#d9363e', '#ff9f0a'], cost: 3e6, unlocked: s => s.maxCombo >= 90, apply: m => { m.comboCap = 200; } },
  { id: 'skill-1', name: 'Schnelleres Inferencing', flavor: 'Weniger warten, mehr wirken.', effect: 'Abklingzeiten −30 %',
    icon: 'gauge', colors: ['#30d158', '#0a84ff'], cost: 1e6, unlocked: s => s.skillUses >= 5, apply: m => { m.cooldown *= 0.7; } },
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
};
const TRAIT_KEYS = Object.keys(TRAITS);
// Manche Modelle haben ihre Eigenschaft immer.
const SIGNATURE_TRAITS = {
  Ratelimitus: 'ratelimit', Latenzia: 'ratelimit', Zensora: 'armored', Alignatron: 'armored',
  Rekursor: 'fork', 'Endlos-Loop': 'fork', Schleimbot: 'regen', Blobby: 'regen', Hypezilla: 'evasive', Turbolix: 'evasive',
};

// Fähigkeiten wie bei Tap Titans: ab einer Welle freischalten, dann mit Tokens bis Stufe 10 leveln.
// power(L) ist die Stärke auf Stufe L, duration/cooldown in Millisekunden.
// Die IDs „bomb“, „storm“ und „overclock“ stammen aus älteren Spielständen und bleiben.
const SKILLS = [
  { id: 'bomb', name: 'Superschlag', short: 'Schlag', icon: 'bolt', colors: ['#ff9f0a', '#d9363e'], wave: 3, cost: 300,
    power: L => 10 + 10 * L, cooldown: L => Math.max(40, 62 - 2 * L) * 1000, duration: () => 0,
    describe: L => `Sofort ${10 + 10 * L} s Helfer-Schaden plus ${20 + 10 * L} Taps` },
  { id: 'midas', name: 'Viraler Hype', short: 'Hype', icon: 'megaphone', colors: ['#ffcc00', '#ff9f0a'], wave: 6, cost: 2500,
    power: L => 1.5 + 0.5 * L, cooldown: () => 90_000, duration: L => (14 + L) * 1000,
    describe: L => `Tokens ×${fmt(1.5 + 0.5 * L, 1)} für ${14 + L} s` },
  { id: 'storm', name: 'Prompt-Sturm', short: 'Sturm', icon: 'storm', colors: ['#32ade6', '#5e5ce6'], wave: 9, cost: 15_000,
    power: L => 8 + 2 * L, cooldown: () => 60_000, duration: L => (6 + L) * 1000,
    describe: L => `${8 + 2 * L} automatische Taps pro Sekunde für ${6 + L} s` },
  { id: 'crit', name: 'Exploit-Modus', short: 'Exploit', icon: 'crosshair', colors: ['#ff375f', '#bf5af2'], wave: 13, cost: 120_000,
    power: L => 25 + 5 * L, cooldown: () => 75_000, duration: L => (8 + L) * 1000,
    describe: L => `${25 + 5 * L} % Chance auf kritische Treffer für ${8 + L} s` },
  { id: 'focus', name: 'Hyperfokus', short: 'Fokus', icon: 'flame', colors: ['#ff6b3d', '#ff375f'], wave: 17, cost: 1e6,
    power: L => 1.5 + 0.5 * L, cooldown: () => 70_000, duration: L => (12 + L) * 1000,
    describe: L => `Tap-Schaden ×${fmt(1.5 + 0.5 * L, 1)} für ${12 + L} s` },
  { id: 'overclock', name: 'Overclock', short: 'Overclock', icon: 'gauge', colors: ['#30d158', '#0a84ff'], wave: 22, cost: 8e6,
    power: L => 1.5 + 0.5 * L, cooldown: () => 100_000, duration: L => (12 + L) * 1000,
    describe: L => `Alle Helfer ×${fmt(1.5 + 0.5 * L, 1)} für ${12 + L} s` },
];

const MISSION_TYPES = [
  { type: 'kills', icon: 'target', range: [15, 40], text: n => `Besiege ${n} KIs` },
  { type: 'crits', icon: 'crosshair', range: [8, 25], text: n => `Lande ${n} kritische Treffer` },
  { type: 'combo', icon: 'flame', range: [20, 70], text: n => `Erreiche eine Combo von ${n}` },
  { type: 'taps', icon: 'cursor', range: [100, 300], text: n => `Tippe ${n}-mal auf KIs` },
  { type: 'ultras', icon: 'rocket', range: [1, 3], text: n => (n > 1 ? `Besiege ${n} Ultra-KIs vor dem Launch` : 'Besiege eine Ultra-KI vor dem Launch') },
  { type: 'traits', icon: 'shield', range: [3, 8], text: n => `Besiege ${n} KIs mit Eigenschaft`, when: s => s.highestWave >= TRAIT_MIN_WAVE },
  { type: 'skills', icon: 'storm', range: [2, 5], text: n => `Setze ${n}× eine Fähigkeit ein`, when: s => SKILLS.some(k => s.skills[k.id].level > 0) },
  { type: 'discover', icon: 'sparkle', range: [2, 4], text: n => `Entdecke ${n} neue KIs`, when: s => s.discovered.size < MODELS.length - 4 },
];

const ACHIEVEMENTS = [
  { id: 'hello', name: 'Hallo Welt', desc: 'Tippe zum ersten Mal auf eine KI.', check: s => s.clicks >= 1 },
  { id: 'kill-1', name: 'Limit erreicht', desc: 'Besiege deine erste KI.', check: s => s.kills >= 1 },
  { id: 'kill-1000', name: 'Modell-Friedhof', desc: 'Besiege 1.000 KIs.', check: s => s.kills >= 1000 },
  { id: 'clicks-1000', name: 'Sehnenscheidenentzündung', desc: 'Tippe 1.000-mal.', check: s => s.clicks >= 1000 },
  { id: 'wave-10', name: 'Wellenreiter', desc: 'Erreiche Welle 10.', check: s => s.highestWave >= 10 },
  { id: 'wave-25', name: 'Brandung', desc: 'Erreiche Welle 25.', check: s => s.highestWave >= 25 },
  { id: 'wave-50', name: 'Tsunami', desc: 'Erreiche Welle 50.', check: s => s.highestWave >= 50 },
  { id: 'earn-1e3', name: 'Erste Tausend', desc: 'Verdiene insgesamt 1.000 Tokens.', check: s => s.totalEarned >= 1e3 },
  { id: 'earn-1e6', name: 'Token-Millionär', desc: 'Verdiene insgesamt 1 Mio. Tokens.', check: s => s.totalEarned >= 1e6 },
  { id: 'earn-1e9', name: 'Kontext-Milliardär', desc: 'Verdiene insgesamt 1 Mrd. Tokens.', check: s => s.totalEarned >= 1e9 },
  { id: 'earn-1e12', name: 'Wer braucht schon ein Limit?', desc: 'Verdiene insgesamt 1 Bio. Tokens.', check: s => s.totalEarned >= 1e12 },
  { id: 'dps-100', name: 'Läuft von allein', desc: 'Erreiche 100 Schaden/s.', check: (s, dps) => dps >= 100 },
  { id: 'dps-1e5', name: 'Schadens-Tornado', desc: 'Erreiche 100.000 Schaden/s.', check: (s, dps) => dps >= 1e5 },
  { id: 'gens-100', name: 'Massenproduktion', desc: 'Besitze 100 Helfer gleichzeitig.', check: s => totalGenerators(s) >= 100 },
  { id: 'dyson', name: 'Typ-II-Zivilisation', desc: 'Baue eine Dyson-Sphäre.', check: s => s.gens.dyson >= 1 },
  { id: 'golden-1', name: 'Heureka!', desc: 'Fange einen Geistesblitz.', check: s => s.goldenClicks >= 1 },
  { id: 'golden-10', name: 'Genie bei der Arbeit', desc: 'Fange 10 Geistesblitze.', check: s => s.goldenClicks >= 10 },
  { id: 'boss', name: 'Wochenlimit besiegt', desc: 'Besiege den Wochenboss.', check: s => s.bossWins >= 1 },
  { id: 'prestige', name: 'Frischer Kontext', desc: 'Komprimiere deinen Kontext.', check: s => s.prestiges >= 1 },
  { id: 'dex-16', name: 'Sammler', desc: 'Entdecke 16 verschiedene KIs.', check: s => s.discovered.size >= 16 },
  { id: 'dex-all', name: 'Vollständige Sammlung', desc: `Entdecke alle ${MODELS.length} KIs.`, check: s => s.discovered.size >= MODELS.length },
  { id: 'crit-1', name: 'Kritischer Moment', desc: 'Lande deinen ersten kritischen Treffer.', check: s => s.crits >= 1 },
  { id: 'combo-100', name: 'Combo-Meister', desc: 'Erreiche eine Combo von 100.', check: s => s.maxCombo >= 100 },
  { id: 'ultra-10', name: 'Launch verhindert', desc: 'Besiege 10 Ultra-KIs vor ihrem Launch.', check: s => s.ultraWins >= 10 },
  { id: 'skills-25', name: 'Werkzeugkasten', desc: 'Setze 25-mal eine Fähigkeit ein.', check: s => s.skillUses >= 25 },
  { id: 'missions-10', name: 'Auftragslage gut', desc: 'Erledige 10 Aufträge.', check: s => s.missionsDone >= 10 },
  { id: 'rate-limited', name: 'Too Many Requests', desc: 'Lass dich von einem Ratenlimit ausbremsen.', check: s => s.rateLimited >= 1 },
  { id: 'limit', name: 'Limit überstanden', desc: 'Warte im Spiel einen deiner Claude-Limit-Resets ab.', check: s => s.limitsSurvived >= 1 },
];

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
  megaphone: '<path d="M4 10v4a1 1 0 0 0 1 1h2.5l6 4.5v-15l-6 4.5H5a1 1 0 0 0-1 1z"/><path d="M17 9a4 4 0 0 1 0 6M19.5 6.5a7.5 7.5 0 0 1 0 11"/>',
  storm: '<path d="M7 15.5a4 4 0 0 1-.4-8A5.5 5.5 0 0 1 17 8a3.8 3.8 0 0 1 .5 7.5"/><path d="M12.5 11.5l-2.5 4h3l-2 4.5"/>',
  bomb: '<circle cx="10.5" cy="13.5" r="6.5"/><path d="M15.2 8.8l2.3-2.3"/><path d="M19.5 2.5v2.5M21.5 4.5H19"/>',
  bulb: '<path d="M9.5 18h5M10.5 21h3"/><path d="M12 3a6 6 0 0 0-3.6 10.8c.7.5 1.1 1.3 1.1 2.2h5c0-.9.4-1.7 1.1-2.2A6 6 0 0 0 12 3z"/>',
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

// Beginn der Spielwoche: dein eingestellter Wochenlimit-Reset, sonst Montag 0 Uhr.
function weekStartAt(ts, anchor) {
  if (anchor) return anchor + Math.floor((ts - anchor) / WEEK_MS) * WEEK_MS;
  const d = startOfDay(ts);
  d.setDate(d.getDate() - (d.getDay() + 6) % 7);
  return d.getTime();
}

function nextWeekAt(ts, anchor) {
  const start = weekStartAt(ts, anchor);
  if (anchor) return start + WEEK_MS;
  const d = new Date(start);
  d.setDate(d.getDate() + 7);
  return d.getTime();
}

function weekId(ts, anchor) {
  return String(weekStartAt(ts, anchor));
}

function enemyMaxHp(wave, index) {
  // Jede KI ist ein Stück stärker als die vorige, die zehnte (Ultra) noch einmal deutlich.
  const n = (wave - 1) * WAVE_SIZE + index;
  return ENEMY_BASE_HP * ENEMY_HP_GROWTH ** n * (index === WAVE_SIZE - 1 ? ULTRA_HP_MULT : 1);
}

// Spielzeit für neue Gegner; in der Offline-Simulation die simulierte Zeit.
let clock = Date.now();

function rollTrait(kind, wave, index) {
  if (wave < TRAIT_MIN_WAVE) return null;
  const signature = SIGNATURE_TRAITS[MODELS[kind].name];
  if (signature) return signature;
  if (index === WAVE_SIZE - 1 || Math.random() < TRAIT_CHANCE) return TRAIT_KEYS[Math.floor(Math.random() * TRAIT_KEYS.length)];
  return null;
}

function newEnemy(wave, index) {
  const kind = Math.floor(Math.random() * MODELS.length);
  return {
    kind,
    seed: Math.floor(Math.random() * 2 ** 31),
    hp: enemyMaxHp(wave, index),
    trait: rollTrait(kind, wave, index),
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
    achievements: new Set(),
    discovered: new Set(),
    insights: 0,
    prestiges: 0,
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
    week: { id: weekId(now, null), kills: 0, claimed: 0, bossDefeated: false },
    lastDaily: '',
    crits: 0,
    maxCombo: 0,
    ultraWins: 0,
    ultraFails: 0,
    skillUses: 0,
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
    week: { ...base.week, ...data.week },
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
    achievements: new Set((data.achievements || []).filter(id => ACHIEVEMENTS.some(a => a.id === id))),
    discovered: new Set((data.discovered || []).filter(i => Number.isInteger(i) && i >= 0 && i < MODELS.length)),
  };
  // Ältere Spielstände hatten eine andere HP-Kurve.
  s.enemy.hp = Math.min(s.enemy.hp, s.enemy.maxHp ?? enemyMaxHp(s.wave, s.enemyIndex));
  return s;
}

function toSaveData() {
  const now = Date.now();
  return {
    ...state,
    upgrades: [...state.upgrades],
    achievements: [...state.achievements],
    discovered: [...state.discovered],
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
// Während Offline-Fortschritt nachgerechnet wird: keine Toasts, Popups oder Animationen.
let quiet = false;

// ---------- Werte ----------

function computeMods() {
  const m = {
    gen: Object.fromEntries(GENERATORS.map(g => [g.id, 1])),
    click: 1,
    clickDps: 0,
    global: 1,
    goldenFreq: 1,
    crit: 1,
    weakSize: 1,
    comboWindow: COMBO_WINDOW_MS,
    comboCap: COMBO_CAP,
    cooldown: 1,
    ultraTime: ULTRA_TIME_MS,
  };
  for (const u of UPGRADES) if (state.upgrades.has(u.id)) u.apply(m);
  m.global *= 1 + INSIGHT_BONUS * state.insights;
  m.global *= 1 + ACHIEVEMENT_BONUS * state.achievements.size;
  m.global *= 1 + BOSS_WIN_BONUS * state.bossWins;
  return m;
}

function frenzyFactor(now = Date.now()) {
  return now < state.frenzyUntil ? FRENZY_MULT : 1;
}

function unitRate(g) {
  return g.baseRate * mods.gen[g.id] * mods.global;
}

function baseDps() {
  return GENERATORS.reduce((sum, g) => sum + state.gens[g.id] * unitRate(g), 0);
}

function skillDef(id) {
  return SKILLS.find(k => k.id === id);
}

function skillActive(id, now = Date.now()) {
  return now < state.skills[id].activeUntil;
}

function skillPower(id) {
  return skillDef(id).power(state.skills[id].level);
}

function helperFactor(now = Date.now()) {
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

function incomeRate() {
  return baseDps() * tokenPerDamage();
}

function earn(amount) {
  state.tokens += amount;
  state.runEarned += amount;
  state.totalEarned += amount;
}

// ---------- Shop ----------

function costOf(g, n) {
  const first = g.baseCost * COST_GROWTH ** state.gens[g.id];
  return first * (COST_GROWTH ** n - 1) / (COST_GROWTH - 1);
}

function amountToBuy(g) {
  if (state.buyAmount !== 'max') return state.buyAmount;
  const first = g.baseCost * COST_GROWTH ** state.gens[g.id];
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
  render();
}

function buyUpgrade(u) {
  if (state.upgrades.has(u.id) || state.tokens < u.cost) return;
  state.tokens -= u.cost;
  state.upgrades.add(u.id);
  mods = computeMods();
  render();
}

// ---------- Kampf ----------

function target() {
  if (state.boss) {
    return { model: BOSS, name: BOSS.name, tag: 'Boss', tagClass: 'boss', seed: 7, hue: BOSS.hue, ultra: false, trait: null, unit: state.boss, maxHp: state.boss.maxHp, meter: BOSS_METER, isBoss: true };
  }
  const model = MODELS[state.enemy.kind];
  const ultra = state.enemyIndex === WAVE_SIZE - 1;
  const base = ultra ? `${model.name} ${state.wave} Ultra` : `${model.name} ${state.wave}.${state.enemyIndex + 1}`;
  return {
    model,
    trait: state.enemy.trait,
    // Jede KI bekommt eine leicht eigene Farbnuance ihres Modells.
    hue: (model.hue + (state.enemy.seed % 25) - 12 + 360) % 360,
    ultra,
    name: state.enemy.forked ? `${base} (Fork)` : base,
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
  earn(amount * tokenPerDamage() * tokenBoost());
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
  const loot = t.maxHp * LOOT_MULT * tokenPerDamage() * tokenBoost();
  earn(loot);
  state.kills++;
  addWeeklyKill();
  missionProgress('kills');
  if (e.trait) {
    state.traitKills++;
    missionProgress('traits');
  }
  if (!quiet && Date.now() - lastLimitPopup > 450) {
    lastLimitPopup = Date.now();
    popup('Limit erreicht', 'limit', 50, 18);
    popup(`+${fmt(loot)}`, 'loot', 50, 30, true);
    shatter(t.hue);
    SFX.kill();
  }
  // Forkt sich: Die Kopie muss auch noch besiegt werden.
  if (e.trait === 'fork' && !e.forked) {
    const hp = t.maxHp * FORK_HP;
    state.enemy = { kind: e.kind, seed: e.seed + 1, hp, maxHp: hp, trait: null, forked: true, spawnedAt: e.spawnedAt };
    if (!quiet) popup('Fork!', 'limit', 50, 30);
    return;
  }
  if (state.enemyIndex === WAVE_SIZE - 1) {
    state.ultraWins++;
    missionProgress('ultras');
  }
  state.enemyIndex++;
  if (state.enemyIndex >= WAVE_SIZE) {
    state.enemyIndex = 0;
    state.wave++;
    if (state.wave > state.highestWave) {
      state.highestWave = state.wave;
      const skill = SKILLS.find(k => k.wave === state.wave);
      if (skill) toast(`<strong>${skill.name} verfügbar</strong><br><span class="muted">Im Tab „Fähigkeiten“ freischalten.</span>`, skill.icon);
      else if (state.wave % 10 === 0) toast(`<strong>Welle ${state.wave}</strong> erreicht · Tokens jetzt +${fmt((tokenPerDamage() - 1) * 100)} %`, 'wave');
    }
  }
  state.enemy = newEnemy(state.wave, state.enemyIndex);
}

// Ultra-KIs müssen vor ihrem Launch fallen, sonst geht es zurück zu KI 1 der Welle.
function checkUltra(now) {
  if (state.boss || state.enemyIndex !== WAVE_SIZE - 1) return;
  if (now - state.enemy.spawnedAt < mods.ultraTime) return;
  state.ultraFails++;
  state.enemyIndex = 0;
  clock = now;
  state.enemy = newEnemy(state.wave, 0);
  if (!quiet) {
    toast('<strong>Launch verpasst.</strong> Die Ultra-KI ist live gegangen. Zurück zu KI 1 dieser Welle.', 'rocket');
    SFX.fail();
  }
}

// Gepanzerte KIs: Helfer halber Schaden, Taps 50 % mehr
function traitFactor(source) {
  if (state.boss || state.enemy.trait !== 'armored') return 1;
  return source === 'helper' ? 0.5 : source === 'tap' ? 1.5 : 1;
}

function addWeeklyKill() {
  const w = state.week;
  if (w.kills >= WEEKLY_GOAL) return;
  w.kills++;
  const stage = Math.floor(w.kills / (WEEKLY_GOAL / WEEKLY_STAGES));
  while (w.claimed < stage) {
    w.claimed++;
    if (w.claimed < WEEKLY_STAGES) {
      const reward = Math.max(100, incomeRate() * 600);
      earn(reward);
      toast(`<strong>Wochenetappe ${w.claimed}/${WEEKLY_STAGES}</strong> · +${fmt(reward)} Tokens`, 'gift');
    } else {
      toast('<strong>Das Wochenlimit ist erschienen.</strong> Fordere es heraus, wenn du bereit bist.', 'clock');
    }
  }
}

function bossAvailable() {
  return state.week.kills >= WEEKLY_GOAL && !state.week.bossDefeated;
}

function challengeBoss() {
  if (state.boss || !bossAvailable()) return;
  const maxHp = enemyMaxHp(state.wave, 0) * BOSS_HP_MULT;
  state.boss = { maxHp, hp: maxHp };
  showOverlay('Das Wochenlimit erscheint', logoSvg('boss', BOSS.hue, 7));
  render();
}

function retreat() {
  state.boss = null;
  state.enemy.spawnedAt = Date.now();
  toast('Rückzug. Das Wochenlimit wartet, mit vollem Limit.', 'clock');
  render();
}

function defeatBoss() {
  state.boss = null;
  state.enemy.spawnedAt = clock;
  state.week.bossDefeated = true;
  state.bossWins++;
  mods = computeMods();
  const reward = Math.max(1000, incomeRate() * 3600);
  earn(reward);
  showOverlay('Wochenlimit besiegt', icon('seal'));
  SFX.win();
  toast(`<strong>Wochenlimit besiegt.</strong> +${fmt(reward)} Tokens und dauerhaft +${BOSS_WIN_BONUS * 100} % Schaden.`, 'seal');
}

function checkWeek(now) {
  const id = weekId(now, state.weeklyReset);
  if (state.week.id === id) return;
  if (state.week.kills >= WEEKLY_GOAL && !state.week.bossDefeated) {
    toast('Das Wochenlimit ist dir entkommen. Neue Woche, neues Glück.', 'clock');
  }
  state.week = { id, kills: 0, claimed: 0, bossDefeated: false };
  state.boss = null;
}

const combo = { count: 0, lastAt: 0 };
const tapLog = [];
let throttledUntil = 0;
let lastThrottlePopup = 0;
let autoTaps = 0;
let weak = { x: 0.5, y: 0.5, movedAt: 0 };

function comboMult() {
  return 1 + Math.min(combo.count, mods.comboCap) * COMBO_STEP;
}

function weakRadius() {
  return WEAKSPOT_RADIUS * mods.weakSize;
}

// Die Schwachstelle springt an eine neue Stelle innerhalb der KI.
function moveWeakSpot(now) {
  const a = Math.random() * Math.PI * 2;
  const r = Math.sqrt(Math.random()) * 0.26;
  weak = { x: 0.5 + Math.cos(a) * r, y: 0.5 + Math.sin(a) * r, movedAt: now };
  const el = $('weakspot');
  el.style.left = `${weak.x * 100}%`;
  el.style.top = `${weak.y * 100}%`;
  el.style.setProperty('--weak-size', String(weakRadius() * 2 * 0.8));
  restartAnimation(el, 'pop');
}

// Ein Tap auf die KI – vom Finger/der Maus (mit Koordinaten) oder vom Prompt-Sturm (auto).
function doTap({ clientX = null, clientY = null, auto = false } = {}) {
  const now = Date.now();
  clock = now;
  const t = target();
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
    if (tapLog.length > RATE_LIMIT_TAPS) {
      throttledUntil = now + RATE_LIMIT_MS;
      tapLog.length = 0;
      combo.count = 0;
      state.rateLimited++;
      SFX.limited();
      return;
    }
  }
  if (now - combo.lastAt > mods.comboWindow) combo.count = 0;
  combo.count++;
  combo.lastAt = now;
  state.maxCombo = Math.max(state.maxCombo, combo.count);
  missionProgress('combo', combo.count, true);
  if (auto) autoTaps++;
  else {
    state.clicks++;
    missionProgress('taps');
  }

  let crit = false;
  if (clientX !== null) {
    const r = $('enemy').getBoundingClientRect();
    crit = Math.hypot((clientX - r.left) / r.width - weak.x, (clientY - r.top) / r.height - weak.y) <= weakRadius();
  }
  // Exploit-Modus: jeder Tap kann kritisch treffen, auch ohne die Schwachstelle
  if (!crit && skillActive('crit', now)) crit = Math.random() * 100 < skillPower('crit');
  const focus = skillActive('focus', now) ? skillPower('focus') : 1;
  const dmg = clickValue(now) * comboMult() * focus * (crit ? CRIT_MULT * mods.crit : 1) * traitFactor('tap');

  // Schadenszahl dort, wo getippt wurde (per Tastatur oder Sturm: rund um die Mitte)
  const arena = $('arena').getBoundingClientRect();
  const x = clientX !== null ? (clientX - arena.left) / arena.width * 100 : randomBetween(38, 62);
  const y = clientY !== null ? (clientY - arena.top) / arena.height * 100 - 8 : randomBetween(32, 55);
  if (crit) {
    state.crits++;
    missionProgress('crits');
    popup(`Kritisch −${fmt(dmg, 1)}`, 'crit', x, y);
    restartAnimation($('arena'), 'shake');
    SFX.crit();
    moveWeakSpot(now);
  } else if (!auto || autoTaps % 3 === 0) {
    popup(`−${fmt(dmg, 1)}`, auto ? 'auto' : 'dmg', x, y);
    SFX.tap(combo.count);
  }
  restartAnimation($('glyph'), 'hit');
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
    checkWeek(t);
    checkUltra(t);
    if (!state.boss && state.enemy.trait === 'regen') {
      const maxHp = target().maxHp;
      state.enemy.hp = Math.min(maxHp, state.enemy.hp + maxHp * REGEN_PER_S * stepMs / 1000);
    }
    attack(baseDps() * helperFactor(t) * traitFactor('helper') * stepMs / 1000);
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
  st.readyAt = now + skill.cooldown(st.level) * mods.cooldown;
  state.skillUses++;
  missionProgress('skills');
  SFX.skill();
  if (id === 'bomb') {
    clock = now;
    const dmg = (baseDps() * skill.power(st.level) + clickValue(now) * (20 + 10 * st.level)) * traitFactor('skill');
    popup(`Superschlag −${fmt(dmg)}`, 'crit', 50, 40);
    restartAnimation($('arena'), 'flash');
    restartAnimation($('arena'), 'shake');
    attack(dmg);
  } else {
    st.activeUntil = now + skill.duration(st.level);
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
      earn(m.reward);
      state.missionsDone++;
      toast(`<strong>Auftrag erledigt</strong> · ${missionType(m.type).text(m.target)}<br><span class="muted">+${fmt(m.reward)} Tokens</span>`, 'checklist');
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

const SFX = {
  tap: n => blip({ freq: 520 + Math.min(n, 60) * 8, to: 360, dur: 0.06, gain: 0.025 }),
  crit: () => {
    blip({ freq: 880, to: 1320, dur: 0.12, type: 'triangle', gain: 0.045 });
    blip({ freq: 1320, to: 1760, dur: 0.14, type: 'triangle', gain: 0.035, delay: 0.06 });
  },
  kill: () => blip({ freq: 320, to: 90, dur: 0.2, type: 'triangle', gain: 0.05 }),
  limited: () => blip({ freq: 190, to: 140, dur: 0.22, type: 'square', gain: 0.02 }),
  skill: () => blip({ freq: 240, to: 980, dur: 0.3, type: 'sawtooth', gain: 0.02 }),
  fail: () => blip({ freq: 320, to: 110, dur: 0.5, type: 'sawtooth', gain: 0.025 }),
  win: () => [660, 880, 1320].forEach((freq, i) => blip({ freq, dur: 0.16, type: 'triangle', gain: 0.035, delay: i * 0.08 })),
};

// Splitter, wenn eine KI fällt
function shatter(hue) {
  if (quiet || document.hidden || LOGO_REDUCED_MOTION) return;
  const layer = $('popups');
  for (let i = 0; i < 12; i++) {
    const shard = document.createElement('span');
    shard.className = 'shard';
    const a = Math.random() * Math.PI * 2;
    const d = 60 + Math.random() * 90;
    shard.style.setProperty('--dx', `${Math.round(Math.cos(a) * d)}px`);
    shard.style.setProperty('--dy', `${Math.round(Math.sin(a) * d)}px`);
    shard.style.background = `hsl(${Math.round(hue + Math.random() * 40 - 20)}, 85%, 60%)`;
    shard.addEventListener('animationend', () => shard.remove());
    layer.append(shard);
  }
}

// ---------- Neustart (Prestige) ----------

function pendingInsights() {
  return Math.floor(Math.sqrt(state.runEarned / PRESTIGE_BASE));
}

async function prestige() {
  const offered = pendingInsights();
  if (offered < 1) return;
  const ok = await showDialog({
    title: 'Kontext komprimieren?',
    text: `Tokens, Helfer, Upgrades und Welle werden zurückgesetzt. Du erhältst ${offered} Erkenntnis(se), also dauerhaft +${offered * 10} % Schaden.`,
    ok: 'Komprimieren',
    cancel: 'Abbrechen',
  });
  if (!ok) return;
  // Während der Dialog offen war, lief der Kampf weiter.
  const gain = pendingInsights();
  const fresh = freshState();
  Object.assign(state, {
    tokens: 0,
    runEarned: 0,
    gens: fresh.gens,
    upgrades: new Set(),
    frenzyUntil: 0,
    wave: 1,
    enemyIndex: 0,
    enemy: newEnemy(1, 0),
    boss: null,
    insights: state.insights + gain,
    prestiges: state.prestiges + 1,
  });
  mods = computeMods();
  showOverlay('Kontext komprimiert', icon('compress'));
  toast(`<strong>Kontext komprimiert.</strong> +${gain} Erkenntnis(se)`, 'compress');
  save();
  render();
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
  const reward = Math.max(100, incomeRate() * 900);
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
    el.style.top = `${randomBetween(15, 80)}vh`;
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
    state.frenzyUntil = now + FRENZY_MS;
    toast(`<strong>Geistesblitz</strong> · Schaden ×${FRENZY_MULT} für ${FRENZY_MS / 1000} Sekunden`, 'token');
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
  // Die laufende Boss-Woche behält ihren Fortschritt.
  state.week.id = weekId(now, state.weeklyReset);
}

function clearWeekly() {
  state.weeklyReset = null;
  state.week.id = weekId(Date.now(), null);
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
const weekSegs = [];
let upgradesKey = '';
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
      <span class="tile"></span>
      <span class="row-main">
        <span class="row-title"><span class="gen-name"></span><span class="row-count"></span></span>
        <span class="row-sub gen-desc"></span>
        <span class="row-sub gen-rate"></span>
      </span>
      <span class="price"><span class="price-qty"></span><span class="price-val"></span>${icon('token')}</span>`;
    btn.addEventListener('click', () => buyGenerator(g));
    container.append(btn);
    genEls.set(g.id, {
      btn,
      revealed: null,
      tile: btn.querySelector('.tile'),
      name: btn.querySelector('.gen-name'),
      count: btn.querySelector('.row-count'),
      desc: btn.querySelector('.gen-desc'),
      rate: btn.querySelector('.gen-rate'),
      qty: btn.querySelector('.price-qty'),
      cost: btn.querySelector('.price-val'),
    });
  }
}

function buildWeekBar() {
  const bar = $('week-bar');
  for (let i = 0; i < WEEKLY_STAGES; i++) {
    const seg = document.createElement('div');
    seg.className = 'seg';
    seg.title = i < WEEKLY_STAGES - 1 ? `Etappe ${i + 1}: Belohnung` : 'Der Wochenboss erscheint';
    const fill = document.createElement('div');
    fill.className = 'seg-fill';
    seg.append(fill);
    bar.append(seg);
    weekSegs.push(fill);
  }
}

function renderGenerators() {
  let prevRevealed = true;
  GENERATORS.forEach((g, i) => {
    const el = genEls.get(g.id);
    const prev = GENERATORS[i - 1];
    const revealed = i === 0 || state.gens[g.id] > 0 || state.gens[prev.id] > 0 || state.runEarned >= g.baseCost;
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
    el.count.textContent = state.gens[g.id] > 0 ? `×${state.gens[g.id]}` : '';
    el.rate.textContent = `${fmt(unitRate(g), 1)} Schaden/s pro Stück`;
    el.qty.textContent = n > 1 ? `${n}× ` : '';
    el.cost.textContent = fmt(cost);
  });
}

function renderUpgrades() {
  const available = UPGRADES
    .filter(u => !state.upgrades.has(u.id) && u.unlocked(state))
    .sort((a, b) => a.cost - b.cost);
  const key = available.map(u => u.id).join(',');
  const container = $('upgrades');
  if (key !== upgradesKey) {
    upgradesKey = key;
    container.replaceChildren(...available.map(u => {
      const btn = document.createElement('button');
      btn.className = 'upgrade';
      btn.dataset.id = u.id;
      btn.innerHTML = `
        <span class="tile" style="--tile:${tileBg(u.colors)}">${icon(u.icon)}${u.badge ? `<span class="tile-badge">${u.badge}</span>` : ''}</span>
        <span class="upgrade-name">${u.name}</span>
        <span class="upgrade-desc">${u.flavor}</span>
        <span class="upgrade-effect">${u.effect}</span>
        <span class="price">${fmt(u.cost)}${icon('token')}</span>`;
      btn.addEventListener('click', () => buyUpgrade(u));
      return btn;
    }));
    $('upgrades-empty').hidden = available.length > 0;
  }
  let affordable = 0;
  for (const btn of container.children) {
    const u = UPGRADES.find(x => x.id === btn.dataset.id);
    btn.disabled = state.tokens < u.cost;
    if (!btn.disabled) affordable++;
  }
  const badge = $('upgrade-badge');
  badge.hidden = affordable === 0 || state.tab === 'upgrades';
  badge.textContent = String(affordable);
}

let dexKey = '';
function renderDex() {
  const key = [...state.discovered].sort((a, b) => a - b).join(',');
  if (key === dexKey) return;
  dexKey = key;
  $('dex').replaceChildren(...MODELS.map((m, i) => {
    const known = state.discovered.has(i);
    const item = document.createElement('div');
    item.className = `dex-item${known ? '' : ' unknown'}`;
    item.title = known ? `${m.name} – ${m.quip}` : 'Noch nicht entdeckt';
    item.innerHTML = `
      <span class="dex-logo">${known ? logoSvg(m.family, m.hue, catalogSeed(i), { still: true, letter: m.name[0] }) : icon('question')}</span>
      <span class="dex-name">${known ? m.name : ''}</span>`;
    return item;
  }));
  $('dex-count').textContent = `${state.discovered.size} von ${MODELS.length}`;
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
        <span class="row-sub">${a.desc}</span>
      </span>
      <span class="ach-state">${done ? icon('check') : ''}</span>`;
    return row;
  }));
  $('ach-count').textContent = `${state.achievements.size} von ${ACHIEVEMENTS.length}`;
}

function renderEnemy(now) {
  const t = target();
  const used = clamp01(1 - t.unit.hp / t.maxHp);
  const pct = `${used * 100}%`;
  const fill = $('meter-fill');
  const key = t.isBoss ? 'boss' : `${state.wave}-${state.enemyIndex}-${t.seed}`;
  if (key !== enemyKey) {
    enemyKey = key;
    // Zum ersten Mal gesehen? Dann landet die KI in der Sammlung.
    const isNew = !t.isBoss && !state.discovered.has(state.enemy.kind);
    if (isNew) state.discovered.add(state.enemy.kind);
    $('glyph').innerHTML = logoSvg(t.model.family, t.hue, t.seed, { halo: t.ultra, letter: t.model.name[0] });
    $('enemy').style.setProperty('--hue', String(Math.round(t.hue)));
    $('enemy').setAttribute('aria-label', `${t.name} angreifen`);
    $('enemy-name').textContent = t.name;
    $('enemy-quip').textContent = t.model.quip;
    $('enemy-tag').textContent = isNew ? `Neu · ${t.tag}` : t.tag;
    $('enemy-tag').className = `tag ${isNew ? 'new' : t.tagClass}`;
    $('meter-label').textContent = t.meter.label;
    const trait = t.trait ? TRAITS[t.trait] : null;
    $('enemy-traits').hidden = !trait;
    $('enemy-traits').innerHTML = trait ? `<span class="trait">${icon(trait.icon)}${trait.name}</span><span class="trait-desc">${trait.desc}</span>` : '';
    for (const k of TRAIT_KEYS) $('enemy').classList.toggle(`trait-${k}`, t.trait === k);
    if (isNew) missionProgress('discover');
    moveWeakSpot(now);
    // Neue KI: Leiste ohne Animation auf den neuen Stand setzen.
    fill.style.transition = 'none';
    fill.style.width = pct;
    void fill.offsetWidth;
    fill.style.transition = '';
    if (now - lastSpawnAnimation > 300) {
      lastSpawnAnimation = now;
      restartAnimation($('glyph'), 'spawn');
    }
  }
  $('meter-ghost').style.width = pct;
  fill.style.width = pct;
  fill.classList.toggle('warn', used >= 0.5 && used < 0.8);
  fill.classList.toggle('danger', used >= 0.8);
  $('meter-used').textContent = `${Math.floor(used * 100)} % verbraucht`;
  $('meter-left').textContent = `noch ${fmtSpan((1 - used) * t.meter.span)}`;
  $('hp-text').textContent = `${fmt(Math.ceil(t.unit.hp))} / ${fmt(t.maxHp)} HP`;
  $('retreat-btn').hidden = !t.isBoss;
  $('tap-hint').hidden = state.clicks >= 3;
  const throttled = t.trait === 'ratelimit' && now < throttledUntil;
  $('throttle').hidden = !throttled;
  $('enemy').classList.toggle('throttled', throttled);
}

// Combo-Anzeige und Launch-Countdown in der Arena
function renderArenaHud(now) {
  const comboActive = combo.count >= 3 && now - combo.lastAt <= mods.comboWindow;
  $('combo').hidden = !comboActive;
  if (comboActive) {
    $('combo-count').textContent = `Combo ${combo.count}`;
    $('combo-mult').textContent = `×${fmt(comboMult(), 2)}`;
    $('combo-fill').style.width = `${clamp01(1 - (now - combo.lastAt) / mods.comboWindow) * 100}%`;
  }
  const t = target();
  $('launch').hidden = !t.ultra;
  if (t.ultra) {
    const left = Math.max(0, state.enemy.spawnedAt + mods.ultraTime - now);
    $('launch-text').textContent = `Launch in ${Math.ceil(left / 1000)} s`;
    $('launch').classList.toggle('urgent', left < 10_000);
  }
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
  for (const btn of $('skill-dock').children) {
    const k = skillDef(btn.dataset.skill);
    const st = state.skills[k.id];
    const unlocked = st.level > 0;
    const active = now < st.activeUntil;
    const cooling = unlocked && now < st.readyAt;
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
      <span class="price">+${fmt(m.reward)}${icon('token')}</span>`;
    return row;
  }));
  $('missions-count').textContent = `${fmt(state.missionsDone)} erledigt`;
}

function renderWeek(now) {
  const w = state.week;
  const progress = w.kills / WEEKLY_GOAL;
  weekSegs.forEach((fill, i) => {
    fill.style.width = `${clamp01(progress * WEEKLY_STAGES - i) * 100}%`;
  });
  $('week-text').textContent = w.bossDefeated
    ? 'besiegt'
    : `${Math.floor(progress * 100)} % · ${fmt(w.kills)} / ${fmt(WEEKLY_GOAL)} Siege`;
  $('week-reset').textContent = `Neue Woche ${dateFmt.format(nextWeekAt(now, state.weeklyReset))}`;
  $('boss-btn').hidden = !bossAvailable() || state.boss !== null;
}

function renderStats(now) {
  const rows = [
    ['Tokens (gesamt)', fmt(state.totalEarned)],
    ['Tokens (dieser Kontext)', fmt(state.runEarned)],
    ['KIs besiegt', fmt(state.kills)],
    ['Höchste Welle', fmt(state.highestWave)],
    ['Wochenlimits besiegt', fmt(state.bossWins)],
    ['Taps', fmt(state.clicks)],
    ['Kritische Treffer', fmt(state.crits)],
    ['Beste Combo', fmt(state.maxCombo)],
    ['Ultra-KIs vor dem Launch', fmt(state.ultraWins)],
    ['Aufträge erledigt', fmt(state.missionsDone)],
    ['Fähigkeiten eingesetzt', fmt(state.skillUses)],
    ['Helfer', fmt(totalGenerators(state))],
    ['Geistesblitze', fmt(state.goldenClicks)],
    ['Schadensbonus', `×${fmt(mods.global, 2)}`],
    ['Spielzeit', fmtDuration(now - state.startedAt)],
  ];
  $('stats').innerHTML = rows.map(([k, v]) => `<dt>${k}</dt><dd>${v}</dd>`).join('');
}

function renderTabs() {
  if (!$(`tab-${state.tab}`)) state.tab = state.tab === 'achievements' ? 'missions' : 'helpers';
  for (const btn of document.querySelectorAll('[role="tab"]')) {
    const active = btn.dataset.tab === state.tab;
    btn.setAttribute('aria-selected', String(active));
    $(`tab-${btn.dataset.tab}`).hidden = !active;
  }
}

function render() {
  const now = Date.now();
  const dps = currentDps(now);
  const click = clickValue(now);
  $('tokens').textContent = fmt(Math.floor(state.tokens));
  $('tps').textContent = `≈ ${fmt(dps * tokenPerDamage(), 1)}/s + Beute`;
  $('dps').textContent = fmt(dps, 1);
  $('click-dmg').textContent = `+${fmt(click, 1)} pro Tap`;
  $('wave').textContent = fmt(state.wave);
  $('wave-sub').textContent = state.boss ? 'Bosskampf' : `+${fmt((tokenPerDamage() - 1) * 100)} % Tokens`;
  $('daily-btn').hidden = state.lastDaily === dayId(now);
  document.title = `${fmt(Math.floor(state.tokens))} Tokens · No Limit`;

  const buff = $('buff');
  buff.hidden = !(now < state.frenzyUntil);
  if (!buff.hidden) buff.textContent = `Geistesblitz · Schaden ×${FRENZY_MULT} · noch ${Math.ceil((state.frenzyUntil - now) / 1000)} s`;

  const pending = pendingInsights();
  $('insights').textContent = fmt(state.insights);
  $('insights-pending').textContent = `+${fmt(pending)}`;
  $('prestige-btn').disabled = pending < 1;
  $('prestige-hint').textContent = `Nächste Erkenntnis bei ${fmt((pending + 1) ** 2 * PRESTIGE_BASE)} Tokens in diesem Kontext.`;

  for (const btn of document.querySelectorAll('[data-amount]')) {
    btn.classList.toggle('active', String(state.buyAmount) === btn.dataset.amount);
  }

  renderEnemy(now);
  renderArenaHud(now);
  renderSkills(now);
  renderWeek(now);
  renderIsland(now);
  renderGenerators();
  renderUpgrades();
  renderStats(now);
  renderDex();
  renderMissions();
  $('sound-btn').setAttribute('aria-checked', String(state.sound));
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
    advance(Math.min(elapsed, OFFLINE_CAP_MS), now);
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
  if (now - weak.movedAt > WEAKSPOT_MOVE_MS) moveWeakSpot(now);
  checkUltra(now);
  if (now - lastAutoPopup >= 1000 && baseDps() > 0) {
    lastAutoPopup = now;
    popup(`−${fmt(currentDps(now), 1)}`, 'auto', randomBetween(30, 70), randomBetween(55, 75));
  }
  state.maxSeen = Math.max(state.maxSeen, now);
  checkWeek(now);
  checkAchievements();
  updateGolden(now);
  updateLimits(now);
  render();
  if (now - lastSaveAt >= SAVE_EVERY_MS) {
    lastSaveAt = now;
    save();
  }
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
  const counted = Math.min(away, OFFLINE_CAP_MS);
  const before = { earned: state.totalEarned, kills: state.kills, wave: state.wave, stage: state.week.claimed, bossWins: state.bossWins };
  quiet = true;
  advance(counted, now);
  quiet = false;
  const earned = state.totalEarned - before.earned;
  if (earned <= 0) return;
  const lines = [
    `Du warst ${fmtSpan(away)} weg.${away > counted ? ' Angerechnet werden höchstens 12 Stunden.' : ''}`,
    `Deine Helfer haben ${fmt(earned)} Tokens verdient und ${fmt(state.kills - before.kills)} KIs besiegt.`,
  ];
  if (state.wave > before.wave) lines.push(`Welle ${before.wave} → ${state.wave}`);
  if (state.week.claimed > before.stage) lines.push(`Wochenleiste: Etappe ${Math.min(state.week.claimed, WEEKLY_STAGES)} von ${WEEKLY_STAGES}`);
  if (state.bossWins > before.bossWins) lines.push('Und sie haben das Wochenlimit besiegt.');
  showDialog({ title: 'Willkommen zurück', text: lines.join('\n') });
}

function init() {
  for (const el of document.querySelectorAll('[data-icon]')) el.innerHTML = icon(el.dataset.icon);
  $('golden').innerHTML = icon('token');
  buildGenerators();
  buildWeekBar();
  buildSkills();
  checkWeek(Date.now());
  ensureMissions();
  applyOfflineProgress();
  initIsland();

  $('enemy').addEventListener('click', attackTap);
  $('retreat-btn').addEventListener('click', retreat);
  $('boss-btn').addEventListener('click', challengeBoss);
  $('daily-btn').addEventListener('click', claimDaily);
  $('golden').addEventListener('click', catchGolden);
  $('prestige-btn').addEventListener('click', prestige);
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
    if (e.target === $('glyph')) e.target.classList.remove('hit', 'spawn');
  });
  for (const btn of document.querySelectorAll('[role="tab"]')) {
    btn.addEventListener('click', () => {
      state.tab = btn.dataset.tab;
      renderTabs();
      render();
    });
  }
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
  setInterval(tick, TICK_MS);
}

init();
