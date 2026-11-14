// Phase 3 on-foot test: ?quick starts on a scooter; F dismounts, then walk/run.
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
  await page.waitForTimeout(5000);
  const hold = async (key, ms) => { await page.keyboard.down(key); await page.waitForTimeout(ms); await page.keyboard.up(key); };

  // dismount
  await hold('KeyF', 250);
  await page.waitForTimeout(2500);
  let s = await page.evaluate(() => {
    const g = window.__game;
    return { ride: g.ride?.model?.kind ?? null, pos: { x: +g.player.position.x.toFixed(1), z: +g.player.position.z.toFixed(1) } };
  });
  console.log('after F (dismount):', JSON.stringify(s));

  if (!s.ride) {
    await hold('KeyW', 3000);
    const after = await page.evaluate(() => {
      const g = window.__game;
      return { pos: { x: +g.player.position.x.toFixed(1), z: +g.player.position.z.toFixed(1) }, pace: g.player.pace };
    });
    const d = Math.hypot(after.pos.x - s.pos.x, after.pos.z - s.pos.z);
    console.log('after 3s W:', JSON.stringify(after), 'walked:', d.toFixed(1), 'm');
    await page.screenshot({ path: 'shots/p3-foot.png' });
    // sprint
    await page.keyboard.down('ShiftLeft');
    await hold('KeyW', 3000);
    await page.keyboard.up('ShiftLeft');
    const sprint = await page.evaluate(() => {
      const g = window.__game;
      return { pos: { x: +g.player.position.x.toFixed(1), z: +g.player.position.z.toFixed(1) } };
    });
    const d2 = Math.hypot(sprint.pos.x - after.pos.x, sprint.pos.z - after.pos.z);
    console.log('after 3s sprint:', JSON.stringify(sprint), 'ran:', d2.toFixed(1), 'm');
  }
  await browser.close();
  console.log('DONE');
})().catch((e) => { console.error(e); process.exit(1); });
