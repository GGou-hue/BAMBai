// boot full game, spawn deckers in a ring around the player, screenshot
const { chromium } = require('playwright-core');

(async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  page.on('pageerror', (e) => console.log('[pageerror]', e.message.slice(0, 300)));
  page.on('console', (m) => { if (m.type() === 'error') console.log('[err]', m.text().slice(0, 160)); });
  await page.goto('http://localhost:5173/?hour=9', { waitUntil: 'commit', timeout: 60000 });
  let has = false;
  for (let i = 0; i < 200; i++) {
    await page.waitForTimeout(3000);
    try { has = await page.evaluate(() => !!window.__game); } catch { has = false; }
    if (has) break;
  }
  console.log('game handle:', has);
  if (!has) { await browser.close(); process.exit(2); }
  const r = await page.evaluate(() => {
    const g = window.__game, pp = g.playerPos, N = pp.constructor;
    const out = { spawned: [], errors: [] };
    for (let k = 0; k < 8; k++) {
      const a = k * Math.PI / 4;
      try {
        const v = g.spawnVehicle('decker', new N(pp.x + Math.sin(a) * 9, 0.3, pp.z + Math.cos(a) * 9), a + Math.PI / 2, 4242 + k);
        out.spawned.push(v ? 'ok' : 'null');
      } catch (e) { out.errors.push(String(e).slice(0, 200)); }
    }
    // also spawn one regular bus for comparison
    try { g.spawnVehicle('bus', new N(pp.x + 12, 0.3, pp.z + 2), 0, 777); out.spawned.push('bus-ok'); } catch (e) { out.errors.push('bus: ' + String(e).slice(0, 150)); }
    return out;
  });
  console.log('spawn result:', JSON.stringify(r));
  await page.waitForTimeout(3000);
  await page.screenshot({ path: 'shots/decker-test1.png' });
  console.log('saved shots/decker-test1.png');
  await browser.close();
})().catch((e) => { console.error('FATAL', String(e).slice(0, 300)); process.exit(1); });
