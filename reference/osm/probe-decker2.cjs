// boot full game with verbose progress logging
const { chromium } = require('playwright-core');

(async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  page.on('pageerror', (e) => console.log('[pageerror]', e.message.slice(0, 200)));
  page.on('console', (m) => {
    const t = m.text();
    if (m.type() === 'error') console.log('[err]', t.slice(0, 160));
    else if (/boot|progress|art|map|city|BAMBai|loaded|start/i.test(t)) console.log('[log]', t.slice(0, 140));
  });
  console.log('goto...');
  await page.goto('http://localhost:5173/?hour=9', { waitUntil: 'commit', timeout: 60000 });
  console.log('committed, polling for __game...');
  let has = false;
  for (let i = 0; i < 100; i++) {
    await page.waitForTimeout(3000);
    try { has = await page.evaluate(() => !!window.__game); } catch (e) { console.log('eval fail', String(e).slice(0, 80)); has = false; }
    process.stdout.write(has ? 'READY\n' : '.');
    if (has) break;
  }
  console.log('\ngame handle:', has);
  if (has) {
    const info = await page.evaluate(() => {
      const g = window.__game, pp = g.playerPos;
      return { pp: pp ? { x: +pp.x.toFixed(1), z: +pp.z.toFixed(1) } : null, spawn: typeof g.spawnVehicle, menu: !!document.querySelector('.menu,#menu') };
    });
    console.log('info:', JSON.stringify(info));
    await page.screenshot({ path: 'shots/decker-boot.png' });
    console.log('saved boot state shot');
  }
  await browser.close();
})().catch((e) => { console.error('FATAL', String(e).slice(0, 300)); process.exit(1); });
