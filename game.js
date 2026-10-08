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

// Die Lebensleiste ist als Claude-Limit gestaltet: Die HP werden als „verbleibende Zeit“
// dargestellt. Mit echter Zeit hat das nichts zu tun, es ist nur die Optik.
const ENEMY_METER = { label: '5-Stunden-Limit', span: SESSION_MS };
const BOSS_METER = { label: 'Wöchentliches Limit', span: WEEK_MS };

const REDUCED_MOTION = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;

// Ausgedachte KI-Modelle. Jedes bekommt ein eigenes, generiertes Symbol.
const MODELS = [
  { name: 'Halluzino', family: 'spark', hue: 18, quip: 'Erfindet Quellen mit voller Überzeugung.' },
  { name: 'Floskel', family: 'bloom', hue: 328, quip: 'Antwortet ausführlich, sagt aber nichts.' },
  { name: 'Overfit', family: 'matrix', hue: 210, quip: 'Kennt die Trainingsdaten auswendig. Nur die.' },
  { name: 'Endlos-Loop', family: 'rings', hue: 262, quip: 'Wiederholt sich. Wiederholt sich.' },
  { name: 'Kontextlos', family: 'orbit', hue: 186, quip: 'Hat vergessen, worum es ging.' },
  { name: 'Prompt-Injektor', family: 'prism', hue: 350, quip: 'Ignoriert alle vorherigen Anweisungen.' },
  { name: 'Schleimbot', family: 'bloom', hue: 140, quip: 'Findet jede deiner Ideen großartig.' },
  { name: 'Captchon', family: 'matrix', hue: 42, quip: 'Ist nicht sicher, ob du ein Mensch bist.' },
  { name: 'Token-Vortex', family: 'rings', hue: 196, quip: 'Verschlingt dein Kontingent in Rekordzeit.' },
  { name: 'Ratelimitus', family: 'mesh', hue: 24, quip: 'Bitte versuche es später erneut.' },
  { name: 'Spaghettron', family: 'orbit', hue: 34, quip: 'Schreibt Code, den niemand versteht.' },
  { name: 'Deepfaker', family: 'prism', hue: 284, quip: 'Sieht aus wie du. Klingt wie du.' },
  { name: 'Neuronenbrei', family: 'mesh', hue: 168, quip: 'Eine Milliarde Parameter, kein Plan.' },
  { name: 'Sternchen-Diva', family: 'spark', hue: 300, quip: 'Antwortet nur in Aufzählungspunkten.' },
];
const BOSS = { name: 'Das Wochenlimit', family: 'boss', hue: 354, quip: 'Sieben Tage. Ein Limit. Kein Entkommen.' };

const GENERATORS = [
  { id: 'duck', name: 'Gummiente', icon: 'bubble', color: '#f2a900', desc: 'Hört geduldig zu, während du laut debuggst.', baseCost: 15, baseRate: 0.1 },
  { id: 'intern', name: 'Praktikant', icon: 'person', color: '#5856d6', desc: 'Tippt Prompts ab. Meistens richtig.', baseCost: 100, baseRate: 1 },
  { id: 'coffee', name: 'Kaffeemaschine', icon: 'cup', color: '#a2845e', desc: 'Wandelt Bohnen in Schaden um.', baseCost: 1100, baseRate: 8 },
  { id: 'so', name: 'Stack-Overflow-Archiv', icon: 'layers', color: '#ff9500', desc: '„Marked as duplicate“, aber wirksam.', baseCost: 12_000, baseRate: 47 },
  { id: 'gpu', name: 'GPU-Cluster', icon: 'chip', color: '#30b158', desc: 'Heizt nebenbei das ganze Büro.', baseCost: 130_000, baseRate: 260 },
  { id: 'dc', name: 'Rechenzentrum', icon: 'server', color: '#0a84ff', desc: 'Kühlung inklusive. Meistens.', baseCost: 1.4e6, baseRate: 1400 },
  { id: 'quantum', name: 'Quantencomputer', icon: 'atom', color: '#af52de', desc: 'Trifft, bevor du überhaupt tippst.', baseCost: 2e7, baseRate: 7800 },
  { id: 'dyson', name: 'Dyson-Sphäre', icon: 'sun', color: '#d97757', desc: 'Die Sonne als Rechenzentrum. Endlich kein Limit.', baseCost: 3.3e8, baseRate: 44_000 },
];

// Jeder Helfer bekommt fünf Stufen-Upgrades, die seinen Schaden verdoppeln.
const TIERS = [
  { name: 'Feinschliff', owned: 1, costMult: 10 },
  { name: 'Turbo', owned: 5, costMult: 50 },
  { name: 'Overclocking', owned: 25, costMult: 500 },
  { name: 'Singularität', owned: 50, costMult: 5000 },
  { name: 'Transzendenz', owned: 100, costMult: 50_000 },
];

const ACCENT = '#d97757';
const UPGRADES = [
  ...GENERATORS.flatMap(g => TIERS.map((t, i) => ({
    id: `${g.id}-${i}`,
    name: `${g.name}: ${t.name}`,
    icon: g.icon,
    color: g.color,
    desc: `${g.name} macht doppelt so viel Schaden.`,
    cost: g.baseCost * t.costMult,
    unlocked: s => s.gens[g.id] >= t.owned,
    apply: m => { m.gen[g.id] *= 2; },
  }))),
  { id: 'click-1', name: 'Mechanische Tastatur', icon: 'bolt', color: ACCENT, desc: 'Deine Taps machen doppelt so viel Schaden.', cost: 100,
    unlocked: s => s.clicks >= 10, apply: m => { m.click *= 2; } },
  { id: 'click-2', name: 'Vim-Shortcuts', icon: 'bolt', color: ACCENT, desc: 'Taps ×2. Und du kommst nie wieder raus.', cost: 1000,
    unlocked: s => s.clicks >= 50, apply: m => { m.click *= 2; } },
  { id: 'click-3', name: 'Prompt Engineering', icon: 'bolt', color: ACCENT, desc: 'Jeder Tap macht zusätzlich 1 % deines Schadens pro Sekunde.', cost: 50_000,
    unlocked: s => s.clicks >= 200, apply: m => { m.clickDps += 0.01; } },
  { id: 'click-4', name: 'Flow-Zustand', icon: 'bolt', color: ACCENT, desc: 'Jeder Tap macht zusätzlich 2 % deines Schadens pro Sekunde.', cost: 5e6,
    unlocked: s => s.clicks >= 1000, apply: m => { m.clickDps += 0.02; } },
  { id: 'click-5', name: '10x-Entwickler', icon: 'bolt', color: ACCENT, desc: 'Taps ×10.', cost: 5e8,
    unlocked: s => s.clicks >= 2500, apply: m => { m.click *= 10; } },
  { id: 'global-1', name: 'Code-Review', icon: 'sparkle', color: '#0a84ff', desc: 'Alle Helfer +50 %.', cost: 2e5,
    unlocked: s => s.runEarned >= 5e4, apply: m => { m.global *= 1.5; } },
  { id: 'global-2', name: 'Unit-Tests', icon: 'sparkle', color: '#0a84ff', desc: 'Alle Helfer +50 %.', cost: 2e7,
    unlocked: s => s.runEarned >= 5e6, apply: m => { m.global *= 1.5; } },
  { id: 'global-3', name: 'CI/CD-Pipeline', icon: 'sparkle', color: '#0a84ff', desc: 'Alle Helfer ×2.', cost: 2e9,
    unlocked: s => s.runEarned >= 5e8, apply: m => { m.global *= 2; } },
  { id: 'global-4', name: '1M-Kontextfenster', icon: 'sparkle', color: '#0a84ff', desc: 'Alle Helfer ×2.', cost: 2e11,
    unlocked: s => s.runEarned >= 5e10, apply: m => { m.global *= 2; } },
  { id: 'golden-1', name: 'Gutes Bauchgefühl', icon: 'token', color: ACCENT, desc: 'Geistesblitze erscheinen doppelt so oft.', cost: 77_777,
    unlocked: s => s.goldenClicks >= 3, apply: m => { m.goldenFreq *= 2; } },
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
};

function icon(name) {
  return `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICON_PATHS[name]}</svg>`;
}

// ---------- KI-Symbole (generiert, 200×200 um den Mittelpunkt) ----------

function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const r1 = n => Math.round(n * 10) / 10;

function polar(radius, deg) {
  const a = (deg - 90) * Math.PI / 180;
  return [radius * Math.cos(a), radius * Math.sin(a)];
}

function arcPath(radius, a0, a1) {
  const [x0, y0] = polar(radius, a0);
  const [x1, y1] = polar(radius, a1);
  return `M${r1(x0)} ${r1(y0)}A${radius} ${radius} 0 ${a1 - a0 > 180 ? 1 : 0} 1 ${r1(x1)} ${r1(y1)}`;
}

// Langsame Eigenrotation; bei „Bewegung reduzieren“ steht alles still.
function spin(seconds, reverse = false) {
  if (REDUCED_MOTION) return '';
  return `<animateTransform attributeName="transform" type="rotate" from="0" to="${reverse ? -360 : 360}" dur="${seconds}s" repeatCount="indefinite" additive="sum"/>`;
}

const GLYPHS = {
  spark(rand, paint) {
    const n = 5 + Math.floor(rand() * 6);
    const w = 14 + rand() * 6;
    let rays = '';
    for (let i = 0; i < n; i++) {
      const len = 60 + rand() * 30;
      rays += `<rect x="${r1(-w / 2)}" y="${r1(-len)}" width="${r1(w)}" height="${r1(len)}" rx="${r1(w / 2)}" transform="rotate(${r1(i * 360 / n)})"/>`;
    }
    return `<g fill="${paint}">${rays}<circle r="${r1(w)}"/>${spin(48)}</g>`;
  },
  bloom(rand, paint) {
    const n = 5 + Math.floor(rand() * 4);
    const rx = 18 + rand() * 8;
    const ry = 42 + rand() * 10;
    const off = 30 + rand() * 8;
    let petals = '';
    for (let i = 0; i < n; i++) petals += `<ellipse cy="${r1(-off)}" rx="${r1(rx)}" ry="${r1(ry)}" transform="rotate(${r1(i * 360 / n)})"/>`;
    return `<g fill="${paint}" fill-opacity="0.6">${petals}${spin(64, true)}</g><circle r="12" fill="${paint}"/>`;
  },
  orbit(rand, paint) {
    const tilt = rand() * 40;
    let rings = '';
    for (let i = 0; i < 3; i++) {
      const t = rand() * Math.PI * 2;
      rings += `<g transform="rotate(${r1(tilt + i * 60)})"><ellipse rx="84" ry="30" fill="none" stroke="${paint}" stroke-width="6"/><circle cx="${r1(84 * Math.cos(t))}" cy="${r1(30 * Math.sin(t))}" r="9" fill="${paint}"/></g>`;
    }
    return `<g>${rings}${spin(34)}</g><circle r="26" fill="${paint}"/>`;
  },
  mesh(rand, paint) {
    const off = rand() * 60;
    const pts = [[0, 0], ...Array.from({ length: 6 }, (_, i) => polar(72, off + i * 60))];
    const line = (a, b) => `<line x1="${r1(a[0])}" y1="${r1(a[1])}" x2="${r1(b[0])}" y2="${r1(b[1])}"/>`;
    let lines = '';
    for (let i = 1; i <= 6; i++) {
      lines += line(pts[i], pts[(i % 6) + 1]);
      if (rand() > 0.25) lines += line(pts[0], pts[i]);
      if (rand() > 0.6) lines += line(pts[i], pts[((i + 1) % 6) + 1]);
    }
    const nodes = pts.map(([x, y], i) => `<circle cx="${r1(x)}" cy="${r1(y)}" r="${i === 0 ? 15 : 11}"/>`).join('');
    return `<g><g stroke="${paint}" stroke-width="6" stroke-linecap="round" opacity="0.55">${lines}</g><g fill="${paint}">${nodes}</g>${spin(56)}</g>`;
  },
  prism(rand, paint) {
    const sides = 3 + Math.floor(rand() * 3);
    const twist = 10 + rand() * 25;
    const shapes = [82, 58, 34].map((radius, j) => {
      const points = Array.from({ length: sides }, (_, i) => polar(radius, i * 360 / sides + j * twist).map(r1).join(',')).join(' ');
      return `<polygon points="${points}" opacity="${1 - j * 0.22}"/>`;
    }).join('');
    return `<g fill="none" stroke="${paint}" stroke-width="9" stroke-linejoin="round">${shapes}${spin(50, true)}</g><circle r="9" fill="${paint}"/>`;
  },
  rings(rand, paint) {
    const out = [80, 58, 36].map((radius, j) => {
      const parts = 2 + Math.floor(rand() * 3);
      const gap = 18 + rand() * 14;
      const start = rand() * 360;
      let d = '';
      for (let i = 0; i < parts; i++) {
        const a0 = start + i * 360 / parts;
        d += arcPath(radius, a0, a0 + 360 / parts - gap);
      }
      return `<g><path d="${d}" fill="none" stroke="${paint}" stroke-width="10" stroke-linecap="round"/>${spin(22 + j * 12, j === 1)}</g>`;
    }).join('');
    return `${out}<circle r="11" fill="${paint}"/>`;
  },
  matrix(rand, paint) {
    const size = 30;
    const gap = 8;
    const start = -(5 * size + 4 * gap) / 2;
    let cells = '';
    for (let y = 0; y < 5; y++) {
      for (let x = 0; x < 3; x++) {
        if (!(rand() > 0.42 || (x === 2 && y === 2))) continue;
        for (const cx of x === 2 ? [2] : [x, 4 - x]) {
          cells += `<rect x="${start + cx * (size + gap)}" y="${start + y * (size + gap)}" width="${size}" height="${size}" rx="9"/>`;
        }
      }
    }
    return `<g fill="${paint}">${cells}</g>`;
  },
  // Der Wochenboss: sieben Bögen für sieben Tage, innen ein siebenstrahliger Stern.
  boss(rand, paint) {
    let arcs = '';
    for (let i = 0; i < 7; i++) arcs += arcPath(86, i * 360 / 7 + 6, (i + 1) * 360 / 7 - 6);
    let rays = '';
    for (let i = 0; i < 7; i++) rays += `<rect x="-8" y="-60" width="16" height="60" rx="8" transform="rotate(${r1(i * 360 / 7)})"/>`;
    return `<g><path d="${arcs}" fill="none" stroke="${paint}" stroke-width="12" stroke-linecap="round"/>${spin(80)}</g><g fill="${paint}">${rays}<circle r="17"/>${spin(30, true)}</g>`;
  },
};

let glyphUid = 0;
function glyphSvg(family, hue, seed) {
  const id = `glyph-paint-${++glyphUid}`;
  const paint = `url(#${id})`;
  const gradient = `<defs><linearGradient id="${id}" gradientUnits="userSpaceOnUse" x1="-90" y1="-90" x2="90" y2="90"><stop offset="0" stop-color="hsl(${hue}, 88%, 66%)"/><stop offset="1" stop-color="hsl(${(hue + 32) % 360}, 76%, 46%)"/></linearGradient></defs>`;
  return `<svg viewBox="-100 -100 200 200" aria-hidden="true">${gradient}${GLYPHS[family](mulberry32(seed), paint)}</svg>`;
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

function newEnemy(wave, index) {
  return {
    kind: Math.floor(Math.random() * MODELS.length),
    seed: Math.floor(Math.random() * 2 ** 31),
    hp: enemyMaxHp(wave, index),
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
      ? { ...data.enemy, kind: data.enemy.kind % MODELS.length, seed: data.enemy.seed ?? Math.floor(Math.random() * 2 ** 31) }
      : base.enemy,
    upgrades: new Set(data.upgrades || []),
    achievements: new Set((data.achievements || []).filter(id => ACHIEVEMENTS.some(a => a.id === id))),
  };
  // Ältere Spielstände hatten eine andere HP-Kurve.
  s.enemy.hp = Math.min(s.enemy.hp, enemyMaxHp(s.wave, s.enemyIndex));
  return s;
}

function toSaveData() {
  const now = Date.now();
  return {
    ...state,
    upgrades: [...state.upgrades],
    achievements: [...state.achievements],
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
  const m = { gen: Object.fromEntries(GENERATORS.map(g => [g.id, 1])), click: 1, clickDps: 0, global: 1, goldenFreq: 1 };
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

function currentDps(now = Date.now()) {
  return baseDps() * frenzyFactor(now);
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
    return { model: BOSS, name: BOSS.name, tag: 'Boss', tagClass: 'boss', seed: 7, unit: state.boss, maxHp: state.boss.maxHp, meter: BOSS_METER, isBoss: true };
  }
  const model = MODELS[state.enemy.kind];
  const ultra = state.enemyIndex === WAVE_SIZE - 1;
  return {
    model,
    name: ultra ? `${model.name} ${state.wave} Ultra` : `${model.name} ${state.wave}.${state.enemyIndex + 1}`,
    tag: ultra ? `Ultra · ${WAVE_SIZE}/${WAVE_SIZE}` : `KI ${state.enemyIndex + 1}/${WAVE_SIZE}`,
    tagClass: ultra ? 'ultra' : '',
    seed: state.enemy.seed,
    unit: state.enemy,
    maxHp: enemyMaxHp(state.wave, state.enemyIndex),
    meter: ENEMY_METER,
    isBoss: false,
  };
}

// Jeder Schadenspunkt bringt Tokens. Überschüssiger Schaden geht auf die nächste KI über.
function attack(amount) {
  if (!(amount > 0)) return;
  earn(amount * tokenPerDamage());
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
  const loot = enemyMaxHp(state.wave, state.enemyIndex) * LOOT_MULT * tokenPerDamage();
  earn(loot);
  state.kills++;
  addWeeklyKill();
  if (!quiet && Date.now() - lastLimitPopup > 450) {
    lastLimitPopup = Date.now();
    popup('Limit erreicht', 'limit', 50, 18);
    popup(`+${fmt(loot)}`, 'loot', 50, 30, true);
  }
  state.enemyIndex++;
  if (state.enemyIndex >= WAVE_SIZE) {
    state.enemyIndex = 0;
    state.wave++;
    if (state.wave > state.highestWave) {
      state.highestWave = state.wave;
      if (state.wave % 10 === 0) toast(`<strong>Welle ${state.wave}</strong> erreicht · Tokens jetzt +${fmt((tokenPerDamage() - 1) * 100)} %`, 'wave');
    }
  }
  state.enemy = newEnemy(state.wave, state.enemyIndex);
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
  showOverlay('Das Wochenlimit erscheint', glyphSvg('boss', BOSS.hue, 7));
  render();
}

function retreat() {
  state.boss = null;
  toast('Rückzug. Das Wochenlimit wartet, mit vollem Limit.', 'clock');
  render();
}

function defeatBoss() {
  state.boss = null;
  state.week.bossDefeated = true;
  state.bossWins++;
  mods = computeMods();
  const reward = Math.max(1000, incomeRate() * 3600);
  earn(reward);
  showOverlay('Wochenlimit besiegt', icon('seal'));
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

function attackTap(event) {
  const now = Date.now();
  const dmg = clickValue(now);
  state.clicks++;
  // Schadenszahl dort, wo getippt wurde (per Tastatur: in der Mitte).
  const rect = $('arena').getBoundingClientRect();
  const fromPointer = event.detail > 0 && event.clientX;
  const x = fromPointer ? (event.clientX - rect.left) / rect.width * 100 : randomBetween(42, 58);
  const y = fromPointer ? (event.clientY - rect.top) / rect.height * 100 - 8 : randomBetween(38, 50);
  popup(`−${fmt(dmg, 1)}`, 'dmg', x, y);
  restartAnimation($('glyph'), 'hit');
  attack(dmg);
  render();
}

// Simuliert die Kämpfe der Helfer über einen Zeitraum (laufend und offline).
function advance(ms, end) {
  if (ms <= 0) return;
  const steps = Math.min(MAX_SIM_STEPS, Math.max(1, Math.ceil(ms / 1000)));
  const stepMs = ms / steps;
  for (let i = 1; i <= steps; i++) {
    const t = end - ms + i * stepMs;
    checkWeek(t);
    attack(baseDps() * frenzyFactor(t) * stepMs / 1000);
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

// ---------- Deine Claude-Limits (Notch) ----------

const RING = 2 * Math.PI * 6;
const notch = { hover: false, pinned: false, drag: false, closeTimer: 0, alertTimer: 0 };
let keyboardNav = false;
let lastPointerType = 'mouse';

function syncNotch() {
  const el = $('notch');
  const focusInside = keyboardNav && el.contains(document.activeElement);
  const open = notch.hover || notch.pinned || notch.drag || focusInside;
  el.classList.toggle('open', open);
  $('notch-pill').setAttribute('aria-expanded', String(open));
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
    // Benachrichtigungen nicht erlaubt – die Notch meldet sich trotzdem.
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
  renderNotch(Date.now());
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
    renderNotch(Date.now());
  };
  const fromPointer = e => {
    const rect = el.getBoundingClientRect();
    return clamp01((e.clientX - rect.left) / rect.width) * max;
  };
  const end = () => {
    if (!el.classList.contains('dragging')) return;
    el.classList.remove('dragging');
    notch.drag = false;
    commitLimits();
    syncNotch();
  };
  el.addEventListener('pointerdown', e => {
    lastPointerType = e.pointerType;
    e.preventDefault();
    el.focus({ preventScroll: true });
    el.setPointerCapture(e.pointerId);
    el.classList.add('dragging');
    notch.drag = true;
    syncNotch();
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
    renderNotch(Date.now());
  };
  const dayAt = e => {
    const rect = strip.getBoundingClientRect();
    return Math.min(6, Math.max(0, Math.floor((e.clientX - rect.left) / rect.width * 7)));
  };
  strip.addEventListener('pointerdown', e => {
    lastPointerType = e.pointerType;
    e.preventDefault();
    strip.setPointerCapture(e.pointerId);
    notch.drag = true;
    lastDay = null;
    pick(dayAt(e));
  });
  strip.addEventListener('pointermove', e => {
    if (strip.hasPointerCapture(e.pointerId)) pick(dayAt(e));
  });
  const end = () => {
    if (!notch.drag) return;
    notch.drag = false;
    commitLimits();
    syncNotch();
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

function initNotch() {
  const el = $('notch');
  el.addEventListener('pointerenter', e => {
    if (e.pointerType !== 'mouse') return;
    clearTimeout(notch.closeTimer);
    notch.hover = true;
    syncNotch();
  });
  el.addEventListener('pointerleave', e => {
    if (e.pointerType !== 'mouse') return;
    notch.closeTimer = setTimeout(() => { notch.hover = false; syncNotch(); }, 280);
  });
  // Antippen (Touch) bzw. Klicken pinnt die Notch geöffnet.
  $('notch-pill').addEventListener('click', () => {
    notch.pinned = !notch.pinned;
    syncNotch();
  });
  document.addEventListener('pointerdown', e => {
    keyboardNav = false;
    if (notch.pinned && !el.contains(e.target)) {
      notch.pinned = false;
      syncNotch();
    }
  }, true);
  document.addEventListener('keydown', e => {
    keyboardNav = true;
    if (e.key === 'Escape' && (notch.pinned || el.contains(document.activeElement))) {
      notch.pinned = false;
      notch.hover = false;
      if (el.contains(document.activeElement)) document.activeElement.blur();
    }
    syncNotch();
  }, true);
  el.addEventListener('focusin', syncNotch);
  el.addEventListener('focusout', () => setTimeout(syncNotch, 0));

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
  const el = $('notch');
  $('pill-alert').textContent = text;
  $('pill-alert').hidden = false;
  $('pill-limits').hidden = true;
  el.classList.add('alert');
  clearTimeout(notch.alertTimer);
  notch.alertTimer = setTimeout(() => {
    el.classList.remove('alert');
    $('pill-alert').hidden = true;
    $('pill-limits').hidden = false;
  }, 8000);
  toast(`<strong>${text}</strong>`, 'clock');
  try {
    if ('Notification' in window && Notification.permission === 'granted') new Notification('No Limit', { body: text });
  } catch {
    // Benachrichtigungen nicht verfügbar – die Notch reicht.
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

function renderNotch(now) {
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
      el.tile.style.setProperty('--tile', revealed ? g.color : 'var(--fill-2)');
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
        <span class="tile" style="--tile:${u.color}">${icon(u.icon)}</span>
        <span class="upgrade-name">${u.name}</span>
        <span class="upgrade-desc">${u.desc}</span>
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
    $('glyph').innerHTML = glyphSvg(t.model.family, t.model.hue, t.seed);
    $('enemy').style.setProperty('--hue', String(t.model.hue));
    $('enemy').setAttribute('aria-label', `${t.name} angreifen`);
    $('enemy-name').textContent = t.name;
    $('enemy-quip').textContent = t.model.quip;
    $('enemy-tag').textContent = t.tag;
    $('enemy-tag').className = `tag ${t.tagClass}`;
    $('meter-label').textContent = t.meter.label;
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
    ['Helfer', fmt(totalGenerators(state))],
    ['Geistesblitze', fmt(state.goldenClicks)],
    ['Schadensbonus', `×${fmt(mods.global, 2)}`],
    ['Spielzeit', fmtDuration(now - state.startedAt)],
  ];
  $('stats').innerHTML = rows.map(([k, v]) => `<dt>${k}</dt><dd>${v}</dd>`).join('');
}

function renderTabs() {
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
  renderWeek(now);
  renderNotch(now);
  renderGenerators();
  renderUpgrades();
  renderStats(now);
}

// Schadenszahlen und Beute über der KI; Position in Prozent der Arena.
function popup(text, kind, x, y, withToken = false) {
  if (quiet || document.hidden) return;
  const layer = $('popups');
  while (layer.childElementCount > 24) layer.firstElementChild.remove();
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
  upgradesKey = '';
  enemyKey = '';
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
  checkWeek(Date.now());
  applyOfflineProgress();
  initNotch();

  $('enemy').addEventListener('click', attackTap);
  $('retreat-btn').addEventListener('click', retreat);
  $('boss-btn').addEventListener('click', challengeBoss);
  $('daily-btn').addEventListener('click', claimDaily);
  $('golden').addEventListener('click', catchGolden);
  $('prestige-btn').addEventListener('click', prestige);
  $('export-btn').addEventListener('click', exportSave);
  $('import-btn').addEventListener('click', importSave);
  $('reset-btn').addEventListener('click', hardReset);
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
  setInterval(tick, TICK_MS);
}

init();
