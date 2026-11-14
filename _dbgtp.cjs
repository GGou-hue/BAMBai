// Check player teleport API and whether direct position writes stick.
const { chromium } = require('playwright-core');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
(async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  const page = await browser.newPage({ viewport: { width: 1366, height: 636 } });
  await page.addInitScript(() => {
    try { localStorage.setItem('nammauru.save.v1', JSON.stringify({ v: 1, next: 8, money: 500, bonds: {}, side: [], best: {} })); } catch {}
  });
  await page.goto('http://localhost:5173/?hour=23', { waitUntil: 'load', timeout: 90000 });
  await page.waitForSelector('.nu-play[data-a=play]', { timeout: 240000 });
  await page.locator('.nu-play[data-a=play]').click();
  await page.waitForFunction(() => !!window.__ready, { timeout: 180000 });
  await sleep(4000);

  const api = await page.evaluate(() => {
    const g = window.__game, p = g.player;
    return {
      playerKeys: Object.getOwnPropertyNames(Object.getPrototypeOf(p)).filter((k) => /tele|pos|place/i.test(k)),
      hasTeleport: typeof p.teleport,
      hasWalkerTeleport: typeof p.walker?.teleport,
      posNow: { x: +p.position.x.toFixed(1), z: +p.position.z.toFixed(1) },
    };
  });
  console.log('API:', JSON.stringify(api));

  // try direct write then observe drift
  const target = { x: 113.8, z: 349.6 };
  await page.evaluate((t) => { window.__game.player.position.x = t.x; window.__game.player.position.z = t.z; }, target);
  await sleep(400);
  const afterDirect = await page.evaluate(() => ({ x: +window.__game.player.position.x.toFixed(1), z: +window.__game.player.position.z.toFixed(1) }));
  console.log('after direct write +0.4s:', JSON.stringify(afterDirect));
  await sleep(2500);
  const afterSettle = await page.evaluate(() => ({ x: +window.__game.player.position.x.toFixed(1), z: +window.__game.player.position.z.toFixed(1), cur: window.__game.story?.current?.id ?? null }));
  console.log('after +3s:', JSON.stringify(afterSettle));

  // now try engine teleport
  await page.evaluate((t) => { window.__game.player.teleport(new window.__THREE.Vector3(t.x, .15, t.z), 0); }, target);
  await sleep(2500);
  const afterTp = await page.evaluate(() => ({ x: +window.__game.player.position.x.toFixed(1), z: +window.__game.player.position.z.toFixed(1), cur: window.__game.story?.current?.id ?? null }));
  console.log('after teleport():', JSON.stringify(afterTp));
  await browser.close();
})().catch((e) => { console.error('FATAL', e); process.exit(1); });
