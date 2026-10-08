// Startet das Spiel in WebKit (dieselbe Technik wie die Mac-App) und spielt kurz an.
// Aufruf: node webkit-smoke.js <adresse>  (z. B. file:///…/index.html, wie die App: ohne Server und Offline-Speicher)
const { webkit } = require('playwright');

const url = process.argv[2];

(async () => {
  const browser = await webkit.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 860 } });
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('console', m => m.type() === 'error' && console.log('Konsole:', m.text()));
  page.on('requestfailed', r => console.log('Nicht geladen:', r.url(), r.failure()?.errorText));
  await page.goto(url, { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => typeof state === 'object' && document.querySelector('#enemy'), null, { timeout: 15000 });
  await page.waitForTimeout(1000);
  const before = await page.evaluate(() => state.tokens);
  const enemy = await page.locator('#enemy').boundingBox();
  for (let i = 0; i < 20; i++) await page.mouse.click(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2);
  await page.waitForTimeout(500);
  const after = await page.evaluate(() => state.tokens);
  console.log('Tokens nach 20 Klicks:', before, '→', after);
  await page.evaluate(() => save());
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => typeof state === 'object', null, { timeout: 15000 });
  const restored = await page.evaluate(() => state.tokens);
  console.log('Nach Neustart gespeichert:', restored);
  console.log('Skriptfehler:', errors.length ? errors : 'keine');
  await browser.close();
  if (!(after > before) || !(restored >= after * 0.9) || errors.length) process.exit(1);
})().catch(e => {
  console.error(e);
  process.exit(1);
});
