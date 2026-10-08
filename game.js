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
const ENEMY_HP_GROWTH = 1.45;
const LEADER_HP_MULT = 3;
const LOOT_MULT = 0.5;
const WAVE_TOKEN_BONUS = 0.02;
const WEEKLY_GOAL = 500;
const WEEKLY_STAGES = 5;
const BOSS_HP_MULT = 100;

// Die Lebensleiste ist als Claude-Limit gestaltet: Die HP werden als „verbleibende Zeit“
// dargestellt. Mit echter Zeit hat das nichts zu tun – es ist nur die Optik.
const ENEMY_METER = { label: '5-Stunden-Limit', span: SESSION_MS };
const BOSS_METER = { label: 'Wöchentliches Limit', span: WEEK_MS };

const ENEMIES = [
  { name: 'Halluzinations-Bot', icon: '🤖' },
  { name: 'Kontext-Geist', icon: '👻' },
  { name: 'Off-by-one-Käfer', icon: '🐛' },
  { name: 'Endlosschleife', icon: '🌀' },
  { name: 'Captcha-Krake', icon: '🦑' },
  { name: 'Spaghetti-Spinne', icon: '🕷️' },
  { name: 'Token-Fresser', icon: '👾' },
  { name: 'Merge-Konflikt-Zombie', icon: '🧟' },
  { name: 'Prompt-Injection-Drache', icon: '🐉' },
  { name: 'Rate-Limit-Golem', icon: '🗿' },
];
const BOSS = { name: 'Das Wochenlimit', icon: '👹' };

const GENERATORS = [
  { id: 'duck', name: 'Gummiente', icon: '🦆', desc: 'Hört geduldig zu, während du laut debuggst.', baseCost: 15, baseRate: 0.1 },
  { id: 'intern', name: 'Praktikant', icon: '🧑‍💻', desc: 'Tippt Prompts ab. Meistens richtig.', baseCost: 100, baseRate: 1 },
  { id: 'coffee', name: 'Kaffeemaschine', icon: '☕', desc: 'Wandelt Bohnen in Schaden um.', baseCost: 1100, baseRate: 8 },
  { id: 'so', name: 'Stack-Overflow-Archiv', icon: '📚', desc: '„Marked as duplicate“ – aber wirksam.', baseCost: 12_000, baseRate: 47 },
  { id: 'gpu', name: 'GPU-Cluster', icon: '🖥️', desc: 'Heizt nebenbei das ganze Büro.', baseCost: 130_000, baseRate: 260 },
  { id: 'dc', name: 'Rechenzentrum', icon: '🏭', desc: 'Kühlung inklusive. Meistens.', baseCost: 1.4e6, baseRate: 1400 },
  { id: 'quantum', name: 'Quantencomputer', icon: '⚛️', desc: 'Trifft, bevor du überhaupt angreifst.', baseCost: 2e7, baseRate: 7800 },
  { id: 'dyson', name: 'Dyson-Sphäre', icon: '☀️', desc: 'Die Sonne als Waffe. Endlich kein Limit.', baseCost: 3.3e8, baseRate: 44_000 },
];

// Jeder Helfer bekommt fünf Stufen-Upgrades, die seinen Schaden verdoppeln.
const TIERS = [
  { name: 'Feinschliff', owned: 1, costMult: 10 },
  { name: 'Turbo', owned: 5, costMult: 50 },
  { name: 'Overclocking', owned: 25, costMult: 500 },
  { name: 'Singularität', owned: 50, costMult: 5000 },
  { name: 'Transzendenz', owned: 100, costMult: 50_000 },
];

const UPGRADES = [
  ...GENERATORS.flatMap(g => TIERS.map((t, i) => ({
    id: `${g.id}-${i}`,
    name: `${g.name}: ${t.name}`,
    icon: g.icon,
    desc: `${g.name} macht doppelt so viel Schaden.`,
    cost: g.baseCost * t.costMult,
    unlocked: s => s.gens[g.id] >= t.owned,
    apply: m => { m.gen[g.id] *= 2; },
  }))),
  { id: 'click-1', name: 'Mechanische Tastatur', icon: '⌨️', desc: 'Angriffe machen doppelt so viel Schaden.', cost: 100,
    unlocked: s => s.clicks >= 10, apply: m => { m.click *= 2; } },
  { id: 'click-2', name: 'Vim-Shortcuts', icon: '📝', desc: 'Angriffe ×2. Und du kommst nie wieder raus.', cost: 1000,
    unlocked: s => s.clicks >= 50, apply: m => { m.click *= 2; } },
  { id: 'click-3', name: 'Prompt Engineering', icon: '🧠', desc: 'Jeder Angriff macht zusätzlich 1 % deines Schadens pro Sekunde.', cost: 50_000,
    unlocked: s => s.clicks >= 200, apply: m => { m.clickDps += 0.01; } },
  { id: 'click-4', name: 'Flow-Zustand', icon: '🌊', desc: 'Jeder Angriff macht zusätzlich 2 % deines Schadens pro Sekunde.', cost: 5e6,
    unlocked: s => s.clicks >= 1000, apply: m => { m.clickDps += 0.02; } },
  { id: 'click-5', name: '10x-Entwickler', icon: '🚀', desc: 'Angriffe ×10.', cost: 5e8,
    unlocked: s => s.clicks >= 2500, apply: m => { m.click *= 10; } },
  { id: 'global-1', name: 'Code-Review', icon: '🔍', desc: 'Alle Helfer +50 %.', cost: 2e5,
    unlocked: s => s.runEarned >= 5e4, apply: m => { m.global *= 1.5; } },
  { id: 'global-2', name: 'Unit-Tests', icon: '✅', desc: 'Alle Helfer +50 %.', cost: 2e7,
    unlocked: s => s.runEarned >= 5e6, apply: m => { m.global *= 1.5; } },
  { id: 'global-3', name: 'CI/CD-Pipeline', icon: '🔁', desc: 'Alle Helfer ×2.', cost: 2e9,
    unlocked: s => s.runEarned >= 5e8, apply: m => { m.global *= 2; } },
  { id: 'global-4', name: '1M-Kontextfenster', icon: '🪟', desc: 'Alle Helfer ×2.', cost: 2e11,
    unlocked: s => s.runEarned >= 5e10, apply: m => { m.global *= 2; } },
  { id: 'golden-1', name: 'Gutes Bauchgefühl', icon: '✨', desc: 'Geistesblitze erscheinen doppelt so oft.', cost: 77_777,
    unlocked: s => s.goldenClicks >= 3, apply: m => { m.goldenFreq *= 2; } },
];

const ACHIEVEMENTS = [
  { id: 'hello', icon: '👋', name: 'Hallo Welt', desc: 'Greife zum ersten Mal an.', check: s => s.clicks >= 1 },
  { id: 'kill-1', icon: '⚔️', name: 'Limit erreicht', desc: 'Besiege deinen ersten Gegner.', check: s => s.kills >= 1 },
  { id: 'kill-1000', icon: '🧹', name: 'Kammerjäger', desc: 'Besiege 1.000 Gegner.', check: s => s.kills >= 1000 },
  { id: 'clicks-1000', icon: '🩹', name: 'Sehnenscheidenentzündung', desc: 'Greife 1.000-mal an.', check: s => s.clicks >= 1000 },
  { id: 'wave-10', icon: '🌊', name: 'Wellenreiter', desc: 'Erreiche Welle 10.', check: s => s.highestWave >= 10 },
  { id: 'wave-25', icon: '🏄', name: 'Brandung', desc: 'Erreiche Welle 25.', check: s => s.highestWave >= 25 },
  { id: 'wave-50', icon: '🌋', name: 'Tsunami', desc: 'Erreiche Welle 50.', check: s => s.highestWave >= 50 },
  { id: 'earn-1e3', icon: '🪙', name: 'Erste Tausend', desc: 'Verdiene insgesamt 1.000 Tokens.', check: s => s.totalEarned >= 1e3 },
  { id: 'earn-1e6', icon: '💰', name: 'Token-Millionär', desc: 'Verdiene insgesamt 1 Mio. Tokens.', check: s => s.totalEarned >= 1e6 },
  { id: 'earn-1e9', icon: '🏦', name: 'Kontext-Milliardär', desc: 'Verdiene insgesamt 1 Mrd. Tokens.', check: s => s.totalEarned >= 1e9 },
  { id: 'earn-1e12', icon: '♾️', name: 'Wer braucht schon ein Limit?', desc: 'Verdiene insgesamt 1 Bio. Tokens.', check: s => s.totalEarned >= 1e12 },
  { id: 'dps-100', icon: '⚙️', name: 'Läuft von allein', desc: 'Erreiche 100 Schaden/Sek.', check: (s, dps) => dps >= 100 },
  { id: 'dps-1e5', icon: '🌪️', name: 'Schadens-Tornado', desc: 'Erreiche 100.000 Schaden/Sek.', check: (s, dps) => dps >= 1e5 },
  { id: 'gens-100', icon: '🏗️', name: 'Massenproduktion', desc: 'Besitze 100 Helfer gleichzeitig.', check: s => totalGenerators(s) >= 100 },
  { id: 'dyson', icon: '☀️', name: 'Typ-II-Zivilisation', desc: 'Baue eine Dyson-Sphäre.', check: s => s.gens.dyson >= 1 },
  { id: 'golden-1', icon: '💡', name: 'Heureka!', desc: 'Fange einen Geistesblitz.', check: s => s.goldenClicks >= 1 },
  { id: 'golden-10', icon: '🧪', name: 'Genie bei der Arbeit', desc: 'Fange 10 Geistesblitze.', check: s => s.goldenClicks >= 10 },
  { id: 'boss', icon: '🏆', name: 'Wochenlimit besiegt', desc: 'Besiege den Wochenboss.', check: s => s.bossWins >= 1 },
  { id: 'prestige', icon: '🗜️', name: 'Frischer Kontext', desc: 'Komprimiere deinen Kontext.', check: s => s.prestiges >= 1 },
  { id: 'limit', icon: '⏰', name: 'Limit überstanden', desc: 'Warte im Spiel einen deiner Claude-Limit-Resets ab.', check: s => s.limitsSurvived >= 1 },
];

const TICKER = [
  'Du hast dein Limit erreicht. Zeit, ein paar andere Limits zu erreichen.',
  'Claude macht gerade Pause. Du nicht.',
  'Tipp: Gummienten sind erstaunlich gut gegen Halluzinationen.',
  '„Ich schau nur kurz rein“ – du, vor 40 Minuten.',
  'Fun Fact: Diese Tokens zählen nicht für dein Limit.',
  'Der Praktikant fragt, ob „sudo“ ein Kollege ist.',
  'Achte auf 💡 Geistesblitze – sie tauchen zufällig auf!',
  'Kontext komprimieren lohnt sich ab 1 Mio. Tokens.',
  'Jeder zehnte Gegner ist ein Anführer mit dreimal so viel Limit.',
  'Gerüchten zufolge hat die Dyson-Sphäre kein Rate-Limit.',
  'Trag deine Claude-Limits ein, dann sagt dir das Spiel, wann es weitergeht.',
];

const SUFFIXES = ['', ' Tsd.', ' Mio.', ' Mrd.', ' Bio.', ' Brd.', ' Trio.', ' Trd.', ' Quadr.', ' Quadrd.', ' Quint.', ' Quintd.'];

// ---------- Hilfsfunktionen ----------

const $ = id => document.getElementById(id);
const dateFmt = new Intl.DateTimeFormat('de-DE', { weekday: 'short', day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
const timeFmt = new Intl.DateTimeFormat('de-DE', { hour: '2-digit', minute: '2-digit' });

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

function dayId(ts) {
  const d = new Date(ts);
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

// Beginn der Spielwoche: dein eingetragener Wochenlimit-Reset, sonst Montag 0 Uhr.
function weekStartAt(ts, anchor) {
  if (anchor) return anchor + Math.floor((ts - anchor) / WEEK_MS) * WEEK_MS;
  const d = new Date(ts);
  d.setHours(0, 0, 0, 0);
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
  return ENEMY_BASE_HP * ENEMY_HP_GROWTH ** (wave - 1) * (index === WAVE_SIZE - 1 ? LEADER_HP_MULT : 1);
}

function newEnemy(wave, index) {
  return { kind: Math.floor(Math.random() * ENEMIES.length), hp: enemyMaxHp(wave, index) };
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
  return {
    ...base,
    ...data,
    gens: { ...base.gens, ...data.gens },
    week: { ...base.week, ...data.week },
    enemy: enemyOk ? { ...data.enemy, kind: data.enemy.kind % ENEMIES.length } : base.enemy,
    upgrades: new Set(data.upgrades || []),
    achievements: new Set((data.achievements || []).filter(id => ACHIEVEMENTS.some(a => a.id === id))),
  };
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
    return { ...BOSS, unit: state.boss, maxHp: state.boss.maxHp, meter: BOSS_METER, isBoss: true };
  }
  const kind = ENEMIES[state.enemy.kind];
  const leader = state.enemyIndex === WAVE_SIZE - 1;
  return {
    name: leader ? `Anführer: ${kind.name}` : kind.name,
    icon: kind.icon,
    unit: state.enemy,
    maxHp: enemyMaxHp(state.wave, state.enemyIndex),
    meter: ENEMY_METER,
    isBoss: false,
  };
}

// Jeder Schadenspunkt bringt Tokens. Überschüssiger Schaden geht auf den nächsten Gegner über.
function attack(amount, now) {
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
  const maxHp = enemyMaxHp(state.wave, state.enemyIndex);
  const loot = maxHp * LOOT_MULT * tokenPerDamage();
  earn(loot);
  state.kills++;
  addWeeklyKill();
  if (!quiet && Date.now() - lastLimitPopup > 400) {
    lastLimitPopup = Date.now();
    popup('Limit erreicht!', 'limit', 50, 30);
    popup(`+${fmt(loot)} 🪙`, 'loot', 50, 55);
  }
  state.enemyIndex++;
  if (state.enemyIndex >= WAVE_SIZE) {
    state.enemyIndex = 0;
    state.wave++;
    if (state.wave > state.highestWave) {
      state.highestWave = state.wave;
      if (!quiet && state.wave % 10 === 0) toast(`🌊 <strong>Welle ${state.wave} erreicht!</strong> Tokens jetzt +${fmt((tokenPerDamage() - 1) * 100)} %.`);
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
      if (!quiet) toast(`🎁 <strong>Wochenetappe ${w.claimed}/${WEEKLY_STAGES}</strong> geschafft: +${fmt(reward)} Tokens.`);
    } else if (!quiet) {
      toast('👹 <strong>Das Wochenlimit ist erschienen!</strong> Fordere es heraus, wenn du bereit bist.');
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
  showOverlay('👹 Das Wochenlimit erscheint!', 'boss');
  render();
}

function retreat() {
  state.boss = null;
  toast('Rückzug. Das Wochenlimit wartet – mit vollem Limit.');
  render();
}

function defeatBoss() {
  state.boss = null;
  state.week.bossDefeated = true;
  state.bossWins++;
  mods = computeMods();
  const reward = Math.max(1000, incomeRate() * 3600);
  earn(reward);
  if (!quiet) {
    showOverlay('🏆 Wochenlimit besiegt!', 'win');
    toast(`🏆 <strong>Wochenlimit besiegt!</strong> +${fmt(reward)} Tokens und dauerhaft +${BOSS_WIN_BONUS * 100} % Schaden.`);
  }
}

function checkWeek(now) {
  const id = weekId(now, state.weeklyReset);
  if (state.week.id === id) return;
  if (!quiet && state.week.kills >= WEEKLY_GOAL && !state.week.bossDefeated) {
    toast('👹 Das Wochenlimit ist dir entkommen. Neue Woche, neues Glück!');
  }
  state.week = { id, kills: 0, claimed: 0, bossDefeated: false };
  state.boss = null;
}

function attackClick() {
  const now = Date.now();
  const dmg = clickValue(now);
  state.clicks++;
  popup(`-${fmt(dmg, 1)}`, 'dmg');
  restartAnimation($('enemy-sprite'), 'hit');
  attack(dmg, now);
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
    attack(baseDps() * frenzyFactor(t) * stepMs / 1000, t);
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
    text: `Du verlierst Tokens, Helfer, Upgrades und deine Welle, erhältst aber ${offered} Erkenntnis(se) (+${offered * 10} % Schaden, dauerhaft).`,
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
  showOverlay('🗜️ Kontext komprimiert', 'win');
  toast(`🗜️ <strong>Kontext komprimiert!</strong> +${gain} Erkenntnis(se).`);
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
      toast(`${a.icon} Erfolg: <strong>${a.name}</strong><br><span class="muted">${a.desc}</span>`);
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
  toast(`🎁 <strong>Tagesbonus:</strong> +${fmt(reward)} Tokens. Bis morgen!`);
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
    toast(`💡 <strong>Geistesblitz!</strong> Schaden ×${FRENZY_MULT} für ${FRENZY_MS / 1000} Sekunden.`);
  } else {
    const gain = Math.min(state.tokens * 0.15, incomeRate() * 900) + 13;
    earn(gain);
    toast(`💡 <strong>Geistesblitz!</strong> +${fmt(gain)} Tokens.`);
  }
  render();
}

// ---------- Deine Claude-Limits ----------

function requestNotifications() {
  try {
    if ('Notification' in window && Notification.permission === 'default') Notification.requestPermission().catch(() => {});
  } catch {
    // Benachrichtigungen nicht erlaubt – das Banner reicht.
  }
}

function setSessionReset() {
  const value = $('session-time').value;
  if (!value) {
    $('session-time').focus();
    return;
  }
  const [h, m] = value.split(':').map(Number);
  const reset = new Date();
  reset.setHours(h, m, 0, 0);
  if (reset.getTime() <= Date.now()) reset.setDate(reset.getDate() + 1);
  state.limitReset = reset.getTime();
  requestNotifications();
  save();
  render();
}

function clearSessionReset() {
  state.limitReset = null;
  save();
  render();
}

function setWeeklyReset() {
  const value = $('weekly-datetime').value;
  const now = Date.now();
  let reset = value ? new Date(value).getTime() : NaN;
  if (!Number.isFinite(reset)) {
    $('weekly-datetime').focus();
    return;
  }
  // Liegt das Datum in der Vergangenheit, gilt der nächste Termin im Wochenrhythmus.
  if (reset <= now) reset += Math.ceil((now - reset + 1) / WEEK_MS) * WEEK_MS;
  state.weeklyReset = reset;
  // Die laufende Boss-Woche behält ihren Fortschritt.
  state.week.id = weekId(now, reset);
  requestNotifications();
  save();
  render();
}

function clearWeeklyReset() {
  state.weeklyReset = null;
  state.week.id = weekId(Date.now(), null);
  save();
  render();
}

function limitReached(text) {
  state.limitsSurvived++;
  $('banner-text').textContent = `🎉 ${text}`;
  $('limit-banner').hidden = false;
  try {
    if ('Notification' in window && Notification.permission === 'granted') new Notification('No Limit', { body: text });
  } catch {
    // Benachrichtigungen nicht verfügbar – das Banner reicht.
  }
  save();
}

function updateLimits(now) {
  if (state.limitReset !== null && now >= state.limitReset) {
    state.limitReset = null;
    limitReached('Dein 5-Stunden-Limit ist zurückgesetzt. Zeit, wieder echte Prompts zu schreiben!');
  }
  if (state.weeklyReset !== null && now >= state.weeklyReset) {
    state.weeklyReset += Math.ceil((now - state.weeklyReset + 1) / WEEK_MS) * WEEK_MS;
    limitReached('Dein Wochenlimit ist zurückgesetzt. Eine ganze Woche Claude wartet auf dich!');
  }
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
    btn.className = 'generator';
    btn.innerHTML = `
      <span class="gen-icon"></span>
      <span>
        <span class="gen-name"></span>
        <span class="gen-desc"></span>
        <span class="gen-info"><span class="gen-cost"></span> · <span class="gen-rate"></span></span>
      </span>
      <span class="gen-owned"></span>`;
    btn.addEventListener('click', () => buyGenerator(g));
    container.append(btn);
    genEls.set(g.id, {
      btn,
      icon: btn.querySelector('.gen-icon'),
      name: btn.querySelector('.gen-name'),
      desc: btn.querySelector('.gen-desc'),
      cost: btn.querySelector('.gen-cost'),
      rate: btn.querySelector('.gen-rate'),
      owned: btn.querySelector('.gen-owned'),
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
    weekSegs.push({ seg, fill });
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
    const n = amountToBuy(g);
    const cost = costOf(g, n);
    el.btn.classList.toggle('teaser', !revealed);
    el.btn.disabled = !revealed || state.tokens < cost;
    el.icon.textContent = revealed ? g.icon : '❔';
    el.name.textContent = revealed ? g.name : '???';
    el.desc.textContent = revealed ? g.desc : 'Noch nicht entdeckt.';
    el.cost.textContent = `${n > 1 ? `${n}× für ` : ''}${fmt(cost)} Tokens`;
    el.rate.textContent = `${fmt(unitRate(g), 1)} Schaden/s pro Stück`;
    el.owned.textContent = state.gens[g.id];
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
        <span class="upgrade-name">${u.icon} ${u.name}</span>
        <span class="upgrade-desc">${u.desc}</span>
        <span class="upgrade-cost">${fmt(u.cost)} Tokens</span>`;
      btn.addEventListener('click', () => buyUpgrade(u));
      return btn;
    }));
    $('upgrades-empty').hidden = available.length > 0;
  }
  for (const btn of container.children) {
    const u = UPGRADES.find(x => x.id === btn.dataset.id);
    btn.disabled = state.tokens < u.cost;
  }
}

function renderAchievements() {
  $('achievements').replaceChildren(...ACHIEVEMENTS.map(a => {
    const done = state.achievements.has(a.id);
    const el = document.createElement('div');
    el.className = `ach${done ? '' : ' locked'}`;
    el.textContent = done ? a.icon : '🔒';
    el.title = done ? `${a.name} – ${a.desc}` : `??? – ${a.desc}`;
    return el;
  }));
  $('ach-count').textContent = `${state.achievements.size}/${ACHIEVEMENTS.length}`;
}

function renderEnemy(now) {
  const t = target();
  const used = clamp01(1 - t.unit.hp / t.maxHp);
  const pct = `${used * 100}%`;
  const fill = $('meter-fill');
  const key = t.isBoss ? 'boss' : `${state.wave}-${state.enemyIndex}-${state.enemy.kind}`;
  if (key !== enemyKey) {
    enemyKey = key;
    $('enemy-sprite').textContent = t.icon;
    $('enemy-name').textContent = t.name;
    $('meter-label').textContent = t.meter.label;
    $('arena').classList.toggle('boss', t.isBoss);
    // Neuer Gegner: Leiste ohne Animation auf den neuen Stand setzen.
    fill.style.transition = 'none';
    fill.style.width = pct;
    void fill.offsetWidth;
    fill.style.transition = '';
    if (now - lastSpawnAnimation > 300) {
      lastSpawnAnimation = now;
      restartAnimation($('enemy-sprite'), 'spawn');
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
}

function renderWeek(now) {
  const w = state.week;
  const progress = w.kills / WEEKLY_GOAL;
  weekSegs.forEach(({ seg, fill }, i) => {
    const part = clamp01(progress * WEEKLY_STAGES - i);
    fill.style.width = `${part * 100}%`;
    seg.classList.toggle('done', part >= 1);
  });
  $('week-text').textContent = w.bossDefeated
    ? 'Boss besiegt ✓'
    : `${Math.floor(progress * 100)} % · ${fmt(w.kills)} / ${fmt(WEEKLY_GOAL)} Siege`;
  $('week-reset').textContent = `Neue Woche: ${dateFmt.format(nextWeekAt(now, state.weeklyReset))}`;
  $('boss-btn').hidden = !bossAvailable() || state.boss !== null;
}

function renderLimits(now) {
  const session = state.limitReset;
  $('session-form').hidden = session !== null;
  $('session-active').hidden = session === null;
  $('chip-session').hidden = session === null;
  if (session === null) {
    $('session-status').textContent = 'nicht eingetragen';
    $('session-fill').style.width = '0%';
  } else {
    const left = session - now;
    $('session-status').textContent = `Reset um ${timeFmt.format(session)}`;
    $('session-fill').style.width = `${clamp01(1 - left / SESSION_MS) * 100}%`;
    $('session-countdown').textContent = `Zurücksetzung in ${fmtDuration(left)}`;
    $('chip-session').textContent = `⏱ 5 Std. · ${fmtDuration(left)}`;
  }

  const weekly = state.weeklyReset;
  $('weekly-form').hidden = weekly !== null;
  $('weekly-active').hidden = weekly === null;
  $('chip-weekly').hidden = weekly === null;
  if (weekly === null) {
    $('weekly-status').textContent = 'nicht eingetragen';
    $('weekly-fill').style.width = '0%';
  } else {
    const left = weekly - now;
    $('weekly-status').textContent = dateFmt.format(weekly);
    $('weekly-fill').style.width = `${clamp01(1 - left / WEEK_MS) * 100}%`;
    $('weekly-countdown').textContent = `Zurücksetzung in ${fmtSpan(left)}`;
    $('chip-weekly').textContent = `📅 Woche · ${dateFmt.format(weekly)}`;
  }

  $('chip-setup').hidden = session !== null && weekly !== null;
}

function renderStats(now) {
  const rows = [
    ['Tokens (gesamt)', fmt(state.totalEarned)],
    ['Tokens (dieser Kontext)', fmt(state.runEarned)],
    ['Gegner besiegt', fmt(state.kills)],
    ['Höchste Welle', fmt(state.highestWave)],
    ['Wochenlimits besiegt', fmt(state.bossWins)],
    ['Angriffe', fmt(state.clicks)],
    ['Helfer', fmt(totalGenerators(state))],
    ['Geistesblitze', fmt(state.goldenClicks)],
    ['Schadensbonus', `×${fmt(mods.global, 2)}`],
    ['Spielzeit', fmtDuration(now - state.startedAt)],
  ];
  $('stats').innerHTML = rows.map(([k, v]) => `<dt>${k}</dt><dd>${v}</dd>`).join('');
}

function render() {
  const now = Date.now();
  const dps = currentDps(now);
  const click = clickValue(now);
  $('tokens').textContent = fmt(Math.floor(state.tokens));
  $('tps').textContent = `≈ ${fmt(dps * tokenPerDamage(), 1)} pro Sek. + Beute`;
  $('dps').textContent = fmt(dps, 1);
  $('click-dmg').textContent = `+${fmt(click, 1)} pro Angriff`;
  $('attack-value').textContent = `+${fmt(click, 1)} Schaden`;
  $('wave').textContent = fmt(state.wave);
  $('wave-sub').textContent = state.boss
    ? 'Bosskampf läuft'
    : `Gegner ${state.enemyIndex + 1}/${WAVE_SIZE} · Tokens +${fmt((tokenPerDamage() - 1) * 100)} %`;
  $('daily-btn').hidden = state.lastDaily === dayId(now);
  document.title = `${fmt(Math.floor(state.tokens))} Tokens – No Limit`;

  const buff = $('buff');
  buff.hidden = !(now < state.frenzyUntil);
  if (!buff.hidden) buff.textContent = `💡 Geistesblitz: ×${FRENZY_MULT} – noch ${Math.ceil((state.frenzyUntil - now) / 1000)} s`;

  const pending = pendingInsights();
  $('insights').textContent = fmt(state.insights);
  $('insights-pending').textContent = `+${fmt(pending)}`;
  $('prestige-btn').disabled = pending < 1;
  $('prestige-hint').textContent = `Nächste Erkenntnis bei ${fmt((pending + 1) ** 2 * PRESTIGE_BASE)} Tokens in diesem Kontext.`;

  for (const btn of document.querySelectorAll('.buy-amount .btn')) {
    btn.classList.toggle('active', String(state.buyAmount) === btn.dataset.amount);
  }

  renderEnemy(now);
  renderWeek(now);
  renderLimits(now);
  renderGenerators();
  renderUpgrades();
  renderStats(now);
}

// Schadenszahlen und Beute über dem Gegner; Position in Prozent der Arena.
function popup(text, kind, x = randomBetween(30, 70), y = randomBetween(35, 60)) {
  if (quiet || document.hidden) return;
  const layer = $('popups');
  while (layer.childElementCount > 25) layer.firstElementChild.remove();
  const el = document.createElement('span');
  el.className = `popup ${kind}`;
  el.textContent = text;
  el.style.left = `${x}%`;
  el.style.top = `${y}%`;
  el.addEventListener('animationend', () => el.remove());
  layer.append(el);
}

let overlayTimer = 0;
function showOverlay(text, kind) {
  if (quiet) return;
  const overlay = $('overlay');
  $('overlay-text').textContent = text;
  overlay.hidden = false;
  overlay.className = `overlay ${kind}`;
  restartAnimation($('overlay-text'), 'overlay-text');
  clearTimeout(overlayTimer);
  overlayTimer = setTimeout(() => { overlay.hidden = true; }, 1800);
}

function toast(html) {
  if (quiet) return;
  const el = document.createElement('div');
  el.className = 'toast';
  el.innerHTML = html;
  $('toasts').append(el);
  setTimeout(() => el.remove(), 4500);
}

// Eigener Dialog statt alert/confirm/prompt (die sind z. B. in eingebetteten Seiten blockiert).
// Ergebnis: true bzw. der eingegebene Text bei OK, false bzw. null bei Abbrechen.
function showDialog({ title, text, ok = 'Weiter', cancel = null, input = null }) {
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

let tickerIndex = Math.floor(Math.random() * TICKER.length);
function rotateTicker() {
  tickerIndex = (tickerIndex + 1) % TICKER.length;
  $('ticker').textContent = TICKER[tickerIndex];
}

// ---------- Spielstand exportieren / importieren ----------

function exportSave() {
  const code = btoa(unescape(encodeURIComponent(JSON.stringify(toSaveData()))));
  try {
    navigator.clipboard.writeText(code).then(
      () => toast('📋 Spielstand in die Zwischenablage kopiert.'),
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
  render();
}

async function importSave() {
  const code = await showDialog({
    title: 'Spielstand importieren',
    text: 'Füge deinen exportierten Spielstand-Code ein. Der aktuelle Spielstand wird überschrieben.',
    ok: 'Importieren',
    cancel: 'Abbrechen',
    input: { placeholder: 'Code hier einfügen' },
  });
  if (!code) return;
  try {
    state = fromSaveData(JSON.parse(decodeURIComponent(escape(atob(code.trim())))));
    resetView();
    toast('✅ Spielstand importiert.');
  } catch {
    toast('❌ Das sieht nicht nach einem gültigen Spielstand aus.');
  }
}

async function hardReset() {
  const ok = await showDialog({
    title: 'Alles löschen?',
    text: 'Dein gesamter Fortschritt inklusive Erkenntnissen und Erfolgen wird gelöscht. Das lässt sich nicht rückgängig machen.',
    ok: 'Alles löschen',
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
    popup(`-${fmt(currentDps(now), 1)}`, 'auto');
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
      title: 'Deine Uhr wurde zurückgestellt',
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
    `Deine Helfer haben ${fmt(earned)} Tokens verdient und ${fmt(state.kills - before.kills)} Gegner besiegt.`,
  ];
  if (state.wave > before.wave) lines.push(`Welle ${before.wave} → ${state.wave}`);
  if (state.week.claimed > before.stage) lines.push(`Wochenleiste: Etappe ${Math.min(state.week.claimed, WEEKLY_STAGES)}/${WEEKLY_STAGES} erreicht.`);
  if (state.bossWins > before.bossWins) lines.push('Und sie haben das Wochenlimit besiegt! 🏆');
  showDialog({ title: 'Willkommen zurück!', text: lines.join('\n') });
}

function init() {
  buildGenerators();
  buildWeekBar();
  checkWeek(Date.now());
  applyOfflineProgress();

  $('attack-btn').addEventListener('click', attackClick);
  $('enemy').addEventListener('click', attackClick);
  $('retreat-btn').addEventListener('click', retreat);
  $('boss-btn').addEventListener('click', challengeBoss);
  $('daily-btn').addEventListener('click', claimDaily);
  $('golden').addEventListener('click', catchGolden);
  $('prestige-btn').addEventListener('click', prestige);
  $('session-set').addEventListener('click', setSessionReset);
  $('session-clear').addEventListener('click', clearSessionReset);
  $('weekly-set').addEventListener('click', setWeeklyReset);
  $('weekly-clear').addEventListener('click', clearWeeklyReset);
  $('banner-close').addEventListener('click', () => { $('limit-banner').hidden = true; });
  $('export-btn').addEventListener('click', exportSave);
  $('import-btn').addEventListener('click', importSave);
  $('reset-btn').addEventListener('click', hardReset);
  $('enemy-sprite').addEventListener('animationend', e => e.target.classList.remove('hit', 'spawn'));
  for (const btn of document.querySelectorAll('.buy-amount .btn')) {
    btn.addEventListener('click', () => {
      state.buyAmount = btn.dataset.amount === 'max' ? 'max' : Number(btn.dataset.amount);
      render();
    });
  }
  window.addEventListener('beforeunload', save);
  document.addEventListener('visibilitychange', () => { if (document.hidden) save(); });

  rotateTicker();
  setInterval(rotateTicker, 9000);
  renderAchievements();
  render();
  setInterval(tick, TICK_MS);
}

init();
