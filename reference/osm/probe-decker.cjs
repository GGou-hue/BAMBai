// boot full game, poll for __game, spawn decker, screenshot
const { chromium } = require('playwright-core');

(async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  page.on('pageerror', (e) => console.log('[pageerror]', e.message));
  page.on('console', (m) => { if (m.type() === 'error') console.log('[err]', m.text().slice(0, 160)); });
  await page.goto('http://localhost:5173/?hour=9', { waitUntil: 'domcontentloaded', timeout: 120000 });
  // poll for the game handle
  let has = false;
  for (let i = 0; i < 120; i++) {
    await page.waitForTimeout(2000);
    try { has = await page.evaluate(() => !!window.__game); } catch { has = false; }
    if (has) break;
  }
  console.log('game handle:', has);
  if (!has) { await browser.close(); process.exit(2); }
  const info = await page.evaluate(() => {
    const g = window.__game;
    const pp = g.playerPos;
    return { pp: pp ? { x: +pp.x.toFixed(1), z: +pp.z.toFixed(1) } : null, spawn: typeof g.spawnVehicle };
  });
  console.log('info:', JSON.stringify(info));
  if (info.pp && info.spawn === 'function') {
    await page.evaluate(() => {
      const g = window.__game, pp = g.playerPos, N = pp.constructor;
      window.__decker = g.spawnVehicle('decker', new N(pp.x + 5, 0.2, pp.z - 8), 0.5, 4242);
    });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'shots/decker-test1.png' });
    console.log('saved shots/decker-test1.png');
  }
  await browser.close();
})().catch((e) => { console.error(e); process.exit(1); });
