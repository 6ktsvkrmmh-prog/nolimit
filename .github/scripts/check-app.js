// Prüft die veröffentlichte App wie ein Browser: erreichbar, installierbar, offline spielbar.
// Aufruf: node check-app.js <adresse> [chrome-pfad]
const fs = require('fs');
const os = require('os');
const path = require('path');
const { chromium } = require('playwright-core');

const url = process.argv[2];
const executablePath = process.argv[3];

(async () => {
  // Normales Profil statt Inkognito: nur dort bietet Chrome das Installieren an.
  const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'nolimit-'));
  const context = await chromium.launchPersistentContext(profile, { executablePath });
  const page = context.pages()[0] || await context.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  const response = await page.goto(url, { waitUntil: 'load' });
  console.log('Seite:', response.status(), await page.title());
  await page.evaluate(() => Promise.race([navigator.serviceWorker.ready, new Promise(r => setTimeout(r, 15000))]));
  await page.reload({ waitUntil: 'load' });
  const controlled = await page.evaluate(() => Boolean(navigator.serviceWorker.controller));
  console.log('Offline-Speicher aktiv:', controlled);
  const cdp = await context.newCDPSession(page);
  const { installabilityErrors: installErrors } = await cdp.send('Page.getInstallabilityErrors');
  const manifest = await cdp.send('Page.getAppManifest');
  console.log('Manifest:', manifest.url, manifest.errors.length ? manifest.errors : 'ohne Fehler');
  console.log('Installierbar:', installErrors.length ? installErrors : 'ja');
  await context.setOffline(true);
  await page.reload({ waitUntil: 'load' });
  const offline = await page.evaluate(() => typeof state === 'object' && document.querySelectorAll('.rail-btn').length > 0);
  console.log('Startet offline:', offline);
  console.log('Skriptfehler:', errors.length ? errors : 'keine');
  await context.close();
  if (response.status() !== 200 || !controlled || installErrors.length || manifest.errors.length || !offline || errors.length) process.exit(1);
})().catch(e => {
  console.error(e);
  process.exit(1);
});
