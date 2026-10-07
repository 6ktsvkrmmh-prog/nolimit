'use strict';

// ---------- Konfiguration ----------

const SAVE_KEY = 'nolimit-save-v1';
const TICK_MS = 100;
const SAVE_EVERY_MS = 10_000;
const OFFLINE_CAP_S = 12 * 3600;
const COST_GROWTH = 1.15;
const PRESTIGE_BASE = 1e6;
const INSIGHT_BONUS = 0.1;
const ACHIEVEMENT_BONUS = 0.01;
const FRENZY_MULT = 7;
const FRENZY_MS = 30_000;
const GOLDEN_LIFETIME_MS = 12_000;
const GOLDEN_MIN_S = 60;
const GOLDEN_MAX_S = 180;

const GENERATORS = [
  { id: 'duck', name: 'Gummiente', icon: '🦆', desc: 'Hört geduldig zu, während du laut debuggst.', baseCost: 15, baseRate: 0.1 },
  { id: 'intern', name: 'Praktikant', icon: '🧑‍💻', desc: 'Tippt Prompts ab. Meistens richtig.', baseCost: 100, baseRate: 1 },
  { id: 'coffee', name: 'Kaffeemaschine', icon: '☕', desc: 'Wandelt Bohnen in Tokens um.', baseCost: 1100, baseRate: 8 },
  { id: 'so', name: 'Stack-Overflow-Archiv', icon: '📚', desc: '„Marked as duplicate“ – aber produktiv.', baseCost: 12_000, baseRate: 47 },
  { id: 'gpu', name: 'GPU-Cluster', icon: '🖥️', desc: 'Heizt nebenbei das ganze Büro.', baseCost: 130_000, baseRate: 260 },
  { id: 'dc', name: 'Rechenzentrum', icon: '🏭', desc: 'Kühlung inklusive. Meistens.', baseCost: 1.4e6, baseRate: 1400 },
  { id: 'quantum', name: 'Quantencomputer', icon: '⚛️', desc: 'Liefert Tokens, bevor du überhaupt fragst.', baseCost: 2e7, baseRate: 7800 },
  { id: 'dyson', name: 'Dyson-Sphäre', icon: '☀️', desc: 'Die Sonne als Stromquelle. Endlich kein Limit.', baseCost: 3.3e8, baseRate: 44_000 },
];

// Jeder Generator bekommt fünf Stufen-Upgrades, die seine Produktion verdoppeln.
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
    desc: `${g.name} produziert doppelt so viel.`,
    cost: g.baseCost * t.costMult,
    unlocked: s => s.gens[g.id] >= t.owned,
    apply: m => { m.gen[g.id] *= 2; },
  }))),
  { id: 'click-1', name: 'Mechanische Tastatur', icon: '⌨️', desc: 'Prompts bringen doppelt so viel.', cost: 100,
    unlocked: s => s.clicks >= 10, apply: m => { m.click *= 2; } },
  { id: 'click-2', name: 'Vim-Shortcuts', icon: '📝', desc: 'Prompts ×2. Und du kommst nie wieder raus.', cost: 1000,
    unlocked: s => s.clicks >= 50, apply: m => { m.click *= 2; } },
  { id: 'click-3', name: 'Prompt Engineering', icon: '🧠', desc: 'Jeder Prompt bringt zusätzlich 1 % deiner Tokens/Sek.', cost: 50_000,
    unlocked: s => s.clicks >= 200, apply: m => { m.clickTps += 0.01; } },
  { id: 'click-4', name: 'Flow-Zustand', icon: '🌊', desc: 'Jeder Prompt bringt zusätzlich 2 % deiner Tokens/Sek.', cost: 5e6,
    unlocked: s => s.clicks >= 1000, apply: m => { m.clickTps += 0.02; } },
  { id: 'click-5', name: '10x-Entwickler', icon: '🚀', desc: 'Prompts ×10.', cost: 5e8,
    unlocked: s => s.clicks >= 2500, apply: m => { m.click *= 10; } },
  { id: 'global-1', name: 'Code-Review', icon: '🔍', desc: 'Alle Generatoren +50 %.', cost: 2e5,
    unlocked: s => s.runEarned >= 5e4, apply: m => { m.global *= 1.5; } },
  { id: 'global-2', name: 'Unit-Tests', icon: '✅', desc: 'Alle Generatoren +50 %.', cost: 2e7,
    unlocked: s => s.runEarned >= 5e6, apply: m => { m.global *= 1.5; } },
  { id: 'global-3', name: 'CI/CD-Pipeline', icon: '🔁', desc: 'Alle Generatoren ×2.', cost: 2e9,
    unlocked: s => s.runEarned >= 5e8, apply: m => { m.global *= 2; } },
  { id: 'global-4', name: '1M-Kontextfenster', icon: '🪟', desc: 'Alle Generatoren ×2.', cost: 2e11,
    unlocked: s => s.runEarned >= 5e10, apply: m => { m.global *= 2; } },
  { id: 'golden-1', name: 'Gutes Bauchgefühl', icon: '✨', desc: 'Geistesblitze erscheinen doppelt so oft.', cost: 77_777,
    unlocked: s => s.goldenClicks >= 3, apply: m => { m.goldenFreq *= 2; } },
];

const ACHIEVEMENTS = [
  { id: 'hello', icon: '👋', name: 'Hallo Welt', desc: 'Sende deinen ersten Prompt.', check: s => s.clicks >= 1 },
  { id: 'clicks-100', icon: '🖱️', name: 'Fleißarbeit', desc: 'Sende 100 Prompts.', check: s => s.clicks >= 100 },
  { id: 'clicks-1000', icon: '🩹', name: 'Sehnenscheidenentzündung', desc: 'Sende 1.000 Prompts.', check: s => s.clicks >= 1000 },
  { id: 'earn-1e3', icon: '🪙', name: 'Erste Tausend', desc: 'Verdiene insgesamt 1.000 Tokens.', check: s => s.totalEarned >= 1e3 },
  { id: 'earn-1e6', icon: '💰', name: 'Token-Millionär', desc: 'Verdiene insgesamt 1 Mio. Tokens.', check: s => s.totalEarned >= 1e6 },
  { id: 'earn-1e9', icon: '🏦', name: 'Kontext-Milliardär', desc: 'Verdiene insgesamt 1 Mrd. Tokens.', check: s => s.totalEarned >= 1e9 },
  { id: 'earn-1e12', icon: '♾️', name: 'Wer braucht schon ein Limit?', desc: 'Verdiene insgesamt 1 Bio. Tokens.', check: s => s.totalEarned >= 1e12 },
  { id: 'tps-100', icon: '⚙️', name: 'Läuft von allein', desc: 'Erreiche 100 Tokens/Sek.', check: (s, tps) => tps >= 100 },
  { id: 'tps-1e5', icon: '🌪️', name: 'Token-Tornado', desc: 'Erreiche 100.000 Tokens/Sek.', check: (s, tps) => tps >= 1e5 },
  { id: 'gens-100', icon: '🏗️', name: 'Massenproduktion', desc: 'Besitze 100 Generatoren gleichzeitig.', check: s => totalGenerators(s) >= 100 },
  { id: 'dyson', icon: '☀️', name: 'Typ-II-Zivilisation', desc: 'Baue eine Dyson-Sphäre.', check: s => s.gens.dyson >= 1 },
  { id: 'golden-1', icon: '💡', name: 'Heureka!', desc: 'Fange einen Geistesblitz.', check: s => s.goldenClicks >= 1 },
  { id: 'golden-10', icon: '🧪', name: 'Genie bei der Arbeit', desc: 'Fange 10 Geistesblitze.', check: s => s.goldenClicks >= 10 },
  { id: 'prestige', icon: '🗜️', name: 'Frischer Kontext', desc: 'Komprimiere deinen Kontext.', check: s => s.prestiges >= 1 },
  { id: 'limit', icon: '⏰', name: 'Limit überstanden', desc: 'Warte einen Limit-Reset mit dem Timer ab.', check: s => s.limitsSurvived >= 1 },
];

const TICKER = [
  'Du hast dein Limit erreicht. Zeit für Tokens der anderen Art.',
  'Claude macht gerade Pause. Du nicht.',
  'Tipp: Gummienten sind die besten Pair-Programmer.',
  '„Ich schau nur kurz rein“ – du, vor 40 Minuten.',
  'Fun Fact: Diese Tokens zählen nicht für dein Limit.',
  'Der Praktikant fragt, ob „sudo“ ein Kollege ist.',
  'Achte auf 💡 Geistesblitze – sie tauchen zufällig auf!',
  'Kontext komprimieren lohnt sich ab 1 Mio. Tokens.',
  'Irgendwo in der Cloud wird gerade dein Limit zurückgesetzt …',
  'Gerüchten zufolge hat die Dyson-Sphäre kein Rate-Limit.',
];

const SUFFIXES = ['', ' Tsd.', ' Mio.', ' Mrd.', ' Bio.', ' Brd.', ' Trio.', ' Trd.', ' Quadr.', ' Quadrd.', ' Quint.', ' Quintd.'];

// ---------- Hilfsfunktionen ----------

const $ = id => document.getElementById(id);

function fmt(n, decimals = 0) {
  if (!Number.isFinite(n)) return '∞';
  if (Math.abs(n) < 1e6) return n.toLocaleString('de-DE', { maximumFractionDigits: Math.abs(n) < 1e3 ? decimals : 0 });
  const tier = Math.floor(Math.log10(Math.abs(n)) / 3);
  if (tier >= SUFFIXES.length) return n.toExponential(2).replace('.', ',');
  const scaled = n / 10 ** (tier * 3);
  return scaled.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + SUFFIXES[tier];
}

function fmtDuration(ms) {
  const total = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function totalGenerators(s) {
  return GENERATORS.reduce((sum, g) => sum + s.gens[g.id], 0);
}

function randomBetween(min, max) {
  return min + Math.random() * (max - min);
}

// ---------- Spielstand ----------

function freshState() {
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
    limitsSurvived: 0,
    frenzyUntil: 0,
    limitReset: null,
    buyAmount: 1,
    startedAt: Date.now(),
    lastSave: Date.now(),
  };
}

function fromSaveData(data) {
  if (!data || typeof data.tokens !== 'number') throw new Error('Ungültiger Spielstand');
  const base = freshState();
  return {
    ...base,
    ...data,
    gens: { ...base.gens, ...data.gens },
    upgrades: new Set(data.upgrades || []),
    achievements: new Set(data.achievements || []),
  };
}

function toSaveData() {
  return {
    ...state,
    upgrades: [...state.upgrades],
    achievements: [...state.achievements],
    lastSave: Date.now(),
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

// ---------- Spielmechanik ----------

function computeMods() {
  const m = { gen: Object.fromEntries(GENERATORS.map(g => [g.id, 1])), click: 1, clickTps: 0, global: 1, goldenFreq: 1 };
  for (const u of UPGRADES) if (state.upgrades.has(u.id)) u.apply(m);
  m.global *= 1 + INSIGHT_BONUS * state.insights;
  m.global *= 1 + ACHIEVEMENT_BONUS * state.achievements.size;
  return m;
}

function frenzyActive(now = Date.now()) {
  return now < state.frenzyUntil;
}

function unitRate(g) {
  return g.baseRate * mods.gen[g.id] * mods.global;
}

function baseTps() {
  return GENERATORS.reduce((sum, g) => sum + state.gens[g.id] * unitRate(g), 0);
}

function currentTps() {
  return baseTps() * (frenzyActive() ? FRENZY_MULT : 1);
}

function clickValue() {
  return (mods.click + baseTps() * mods.clickTps) * (frenzyActive() ? FRENZY_MULT : 1);
}

function earn(amount) {
  state.tokens += amount;
  state.runEarned += amount;
  state.totalEarned += amount;
}

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

function sendPrompt(event) {
  const value = clickValue();
  earn(value);
  state.clicks++;
  const rect = event.currentTarget.getBoundingClientRect();
  // Tastatur-Klicks haben keine Koordinaten – dann von der Button-Mitte aus.
  const x = event.clientX || rect.left + rect.width / 2;
  const y = event.clientY || rect.top + rect.height / 2;
  spawnFloater(`+${fmt(value, 1)}`, x, y);
  render();
}

function pendingInsights() {
  return Math.floor(Math.sqrt(state.runEarned / PRESTIGE_BASE));
}

async function prestige() {
  const offered = pendingInsights();
  if (offered < 1) return;
  const ok = await showDialog({
    title: 'Kontext komprimieren?',
    text: `Du verlierst Tokens, Generatoren und Upgrades, erhältst aber ${offered} Erkenntnis(se) (+${offered * 10} % Produktion, dauerhaft).`,
    ok: 'Komprimieren',
    cancel: 'Abbrechen',
  });
  if (!ok) return;
  // Während der Dialog offen war, lief die Produktion weiter.
  const gain = pendingInsights();
  const fresh = freshState();
  Object.assign(state, {
    tokens: 0,
    runEarned: 0,
    gens: fresh.gens,
    upgrades: new Set(),
    frenzyUntil: 0,
    insights: state.insights + gain,
    prestiges: state.prestiges + 1,
  });
  mods = computeMods();
  buildGenerators();
  toast(`🗜️ <strong>Kontext komprimiert!</strong> +${gain} Erkenntnis(se).`);
  save();
  render();
}

function checkAchievements() {
  const tps = currentTps();
  let changed = false;
  for (const a of ACHIEVEMENTS) {
    if (!state.achievements.has(a.id) && a.check(state, tps)) {
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
    toast(`💡 <strong>Geistesblitz!</strong> Produktion ×${FRENZY_MULT} für ${FRENZY_MS / 1000} Sekunden.`);
  } else {
    const gain = Math.min(state.tokens * 0.15, baseTps() * 900) + 13;
    earn(gain);
    toast(`💡 <strong>Geistesblitz!</strong> +${fmt(gain)} Tokens.`);
  }
  render();
}

// ---------- Limit-Timer ----------

function startLimitTimer() {
  const value = $('limit-time').value;
  if (!value) {
    $('limit-time').focus();
    return;
  }
  const [h, m] = value.split(':').map(Number);
  const target = new Date();
  target.setHours(h, m, 0, 0);
  if (target.getTime() <= Date.now()) target.setDate(target.getDate() + 1);
  state.limitReset = target.getTime();
  try {
    if ('Notification' in window && Notification.permission === 'default') Notification.requestPermission().catch(() => {});
  } catch {
    // Benachrichtigungen nicht erlaubt – das Banner reicht.
  }
  save();
  renderLimit();
}

function clearLimitTimer() {
  state.limitReset = null;
  save();
  renderLimit();
}

function updateLimit(now) {
  if (state.limitReset && now >= state.limitReset) {
    state.limitReset = null;
    state.limitsSurvived++;
    $('limit-banner').hidden = false;
    try {
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('No Limit', { body: 'Dein Claude-Limit ist zurück! 🎉' });
      }
    } catch {
      // Benachrichtigungen nicht verfügbar – das Banner reicht.
    }
    save();
  }
  renderLimit(now);
}

// ---------- Darstellung ----------

const genEls = new Map();
let upgradesKey = '';

function buildGenerators() {
  const container = $('generators');
  container.replaceChildren();
  genEls.clear();
  for (const g of GENERATORS) {
    const btn = document.createElement('button');
    btn.className = 'generator';
    btn.innerHTML = `
      <span class="gen-icon">${g.icon}</span>
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

function renderGenerators() {
  let prevRevealed = true;
  GENERATORS.forEach((g, i) => {
    const el = genEls.get(g.id);
    const prev = GENERATORS[i - 1];
    const revealed = i === 0 || state.gens[g.id] > 0 || state.gens[prev.id] > 0 || state.runEarned >= g.baseCost;
    // Nur der nächste unentdeckte Generator wird als Teaser gezeigt.
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
    el.rate.textContent = `${fmt(unitRate(g), 1)}/s pro Stück`;
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

function renderStats() {
  const rows = [
    ['Tokens (gesamt)', fmt(state.totalEarned)],
    ['Tokens (dieser Kontext)', fmt(state.runEarned)],
    ['Prompts gesendet', fmt(state.clicks)],
    ['Generatoren', fmt(totalGenerators(state))],
    ['Geistesblitze', fmt(state.goldenClicks)],
    ['Produktionsbonus', `×${fmt(mods.global, 2)}`],
    ['Spielzeit', fmtDuration(Date.now() - state.startedAt)],
  ];
  $('stats').innerHTML = rows.map(([k, v]) => `<dt>${k}</dt><dd>${v}</dd>`).join('');
}

function renderLimit(now = Date.now()) {
  const active = state.limitReset !== null;
  $('limit-time').hidden = active;
  $('limit-set').hidden = active;
  $('limit-clear').hidden = !active;
  $('limit-countdown').hidden = !active;
  $('limit-label').textContent = active ? 'Limit-Reset in' : 'Limit-Reset um';
  if (active) $('limit-countdown').textContent = fmtDuration(state.limitReset - now);
}

function render() {
  const now = Date.now();
  const tps = currentTps();
  $('tokens').textContent = fmt(Math.floor(state.tokens));
  $('tps').textContent = `${fmt(tps, 1)} pro Sekunde`;
  $('click-value').textContent = `+${fmt(clickValue(), 1)}`;
  document.title = `${fmt(Math.floor(state.tokens))} Tokens – No Limit`;

  const buff = $('buff');
  buff.hidden = !frenzyActive(now);
  if (!buff.hidden) buff.textContent = `💡 Geistesblitz: ×${FRENZY_MULT} – noch ${Math.ceil((state.frenzyUntil - now) / 1000)} s`;

  const pending = pendingInsights();
  $('insights').textContent = fmt(state.insights);
  $('insights-pending').textContent = `+${fmt(pending)}`;
  $('prestige-btn').disabled = pending < 1;
  const nextAt = (pending + 1) ** 2 * PRESTIGE_BASE;
  $('prestige-hint').textContent = `Nächste Erkenntnis bei ${fmt(nextAt)} Tokens in diesem Kontext.`;

  for (const btn of document.querySelectorAll('.buy-amount .btn')) {
    btn.classList.toggle('active', String(state.buyAmount) === btn.dataset.amount);
  }

  renderGenerators();
  renderUpgrades();
  renderStats();
}

function spawnFloater(text, x, y) {
  const el = document.createElement('span');
  el.className = 'floater';
  el.textContent = text;
  el.style.left = `${x}px`;
  el.style.top = `${y - 20}px`;
  el.addEventListener('animationend', () => el.remove());
  document.body.append(el);
}

function toast(html) {
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
    mods = computeMods();
    upgradesKey = '';
    save();
    renderAchievements();
    renderLimit();
    render();
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
  mods = computeMods();
  upgradesKey = '';
  save();
  renderAchievements();
  renderLimit();
  render();
}

// ---------- Hauptschleife ----------

let lastTick = Date.now();
let lastSaveAt = Date.now();

function tick() {
  const now = Date.now();
  const dt = Math.min((now - lastTick) / 1000, OFFLINE_CAP_S);
  lastTick = now;
  earn(currentTps() * dt);
  checkAchievements();
  updateGolden(now);
  updateLimit(now);
  render();
  if (now - lastSaveAt >= SAVE_EVERY_MS) {
    lastSaveAt = now;
    save();
  }
}

function applyOfflineProgress() {
  const away = Math.min((Date.now() - state.lastSave) / 1000, OFFLINE_CAP_S);
  const gain = baseTps() * away;
  if (away > 10 && gain > 0) {
    earn(gain);
    showDialog({ title: 'Willkommen zurück!', text: `Während du weg warst (${fmtDuration(away * 1000)}), haben deine Generatoren ${fmt(gain)} Tokens produziert.` });
  }
}

function init() {
  buildGenerators();
  applyOfflineProgress();

  $('prompt-btn').addEventListener('click', sendPrompt);
  $('golden').addEventListener('click', catchGolden);
  $('prestige-btn').addEventListener('click', prestige);
  $('limit-set').addEventListener('click', startLimitTimer);
  $('limit-clear').addEventListener('click', clearLimitTimer);
  $('banner-close').addEventListener('click', () => { $('limit-banner').hidden = true; });
  $('export-btn').addEventListener('click', exportSave);
  $('import-btn').addEventListener('click', importSave);
  $('reset-btn').addEventListener('click', hardReset);
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
  renderLimit();
  render();
  setInterval(tick, TICK_MS);
}

init();
