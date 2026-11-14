// Phase 3 drive test: ?quick starts the player seated on a scooter at the
// stunt ramp. Drive with W, steer with A/D, measure speed and distance.
const { chromium } = require('playwright-core');

(async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  page.on('pageerror', (e) => console.log('[pageerror]', e.message.slice(0, 200)));
  await page.goto('http://localhost:5173/?hour=17.2&skip&quick', { waitUntil: 'load', timeout: 60000 });
  for (let i = 0; i < 40; i++) {
    await page.waitForTimeout(5000);
    if (await page.evaluate(() => !!window.__ready).catch(() => false)) break;
  }
  await page.waitForTimeout(6000);
  const s = await page.evaluate(() => {
    const g = window.__game;
    return { ride: g.ride?.model?.kind ?? null, locked: g.locked, pos: { x: +g.playerPos.x.toFixed(0), z: +g.playerPos.z.toFixed(0) } };
  });
  console.log('start:', JSON.stringify(s));
  await page.screenshot({ path: 'shots/p3-scooter.png' });

  if (s.ride) {
    const hold = async (key, ms) => { await page.keyboard.down(key); await page.waitForTimeout(ms); await page.keyboard.up(key); };
    await hold('KeyW', 6000);
    const mid = await page.evaluate(() => { const g = window.__game; return { speed: +g.ride.speed.toFixed(1), pos: { x: +g.playerPos.x.toFixed(0), z: +g.playerPos.z.toFixed(0) } }; });
    console.log('after 6s W:', JSON.stringify(mid));
    await page.screenshot({ path: 'shots/p3-driving1.png' });
    await hold('KeyA', 1500);
    await hold('KeyW', 4000);
    const end = await page.evaluate(() => { const g = window.__game; return { speed: +g.ride.speed.toFixed(1), pos: { x: +g.playerPos.x.toFixed(0), z: +g.playerPos.z.toFixed(0) } }; });
    console.log('after steer+4s W:', JSON.stringify(end));
    const dist = Math.hypot(end.pos.x - s.pos.x, end.pos.z - s.pos.z);
    console.log('total distance driven:', dist.toFixed(0), 'm');
    await page.screenshot({ path: 'shots/p3-driving2.png' });
  }
  await browser.close();
  console.log('DONE');
})().catch((e) => { console.error(e); process.exit(1); });
