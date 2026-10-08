// Startet das Spiel in WebKit (dieselbe Technik wie die Mac-App) und spielt kurz an.
// Aufruf: node webkit-smoke.js <adresse>
const { webkit } = require('playwright');

const url = process.argv[2];

(async () => {
  const browser = await webkit.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 860 } });
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.goto(url, { waitUntil: 'load' });
  await page.waitForTimeout(1000);
  const before = await page.evaluate(() => state.tokens);
  const enemy = await page.locator('#enemy').boundingBox();
  for (let i = 0; i < 20; i++) await page.mouse.click(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2);
  await page.waitForTimeout(500);
  const after = await page.evaluate(() => state.tokens);
  console.log('Tokens nach 20 Klicks:', before, '→', after);
  await page.evaluate(() => save());
  await page.reload({ waitUntil: 'load' });
  await page.waitForTimeout(500);
  const restored = await page.evaluate(() => state.tokens);
  console.log('Nach Neustart gespeichert:', restored);
  console.log('Skriptfehler:', errors.length ? errors : 'keine');
  await browser.close();
  if (!(after > before) || !(restored >= after * 0.9) || errors.length) process.exit(1);
})().catch(e => {
  console.error(e);
  process.exit(1);
});
