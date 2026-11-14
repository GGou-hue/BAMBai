// inspect: what is on screen, where is the camera, where did the deckers go
const { chromium } = require('playwright-core');

(async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  page.on('pageerror', (e) => console.log('[pageerror]', e.message.slice(0, 200)));
  await page.goto('http://localhost:5173/?hour=9', { waitUntil: 'commit', timeout: 60000 });
  let has = false;
  for (let i = 0; i < 200; i++) {
    await page.waitForTimeout(3000);
    try { has = await page.evaluate(() => !!window.__game); } catch { has = false; }
    if (has) break;
  }
  console.log('game handle:', has);
  if (!has) { await browser.close(); process.exit(2); }
  const info = await page.evaluate(() => {
    const g = window.__game;
    const out = { keys: Object.keys(g) };
    try {
      const r = g.r;
      out.cam = r?.camera ? { x: +r.camera.position.x.toFixed(1), y: +r.camera.position.y.toFixed(1), z: +r.camera.position.z.toFixed(1) } : null;
      out.pp = g.playerPos ? { x: +g.playerPos.x.toFixed(1), z: +g.playerPos.z.toFixed(1) } : null;
      // player object?
      out.playerKeys = g.player ? Object.keys(g.player).slice(0, 20) : null;
      const v = g.spawnVehicle('decker', new (g.playerPos.constructor)(g.playerPos.x + 5, 0.3, g.playerPos.z - 8), 0.5, 4242);
      out.deckerPos = v?.position ? { x: +v.position.x.toFixed(1), y: +v.position.y.toFixed(1), z: +v.position.z.toFixed(1) } : null;
      out.deckerKind = v?.kind;
      window.__dv = v;
    } catch (e) { out.err = String(e).slice(0, 250); }
    return out;
  });
  console.log(JSON.stringify(info, null, 1).slice(0, 2200));
  await page.waitForTimeout(2500);
  const info2 = await page.evaluate(() => {
    const g = window.__game, r = g.r;
    const v = window.__dv;
    return {
      cam: r?.camera ? { x: +r.camera.position.x.toFixed(1), y: +r.camera.position.y.toFixed(1), z: +r.camera.position.z.toFixed(1) } : null,
      decker: v?.position ? { x: +v.position.x.toFixed(1), y: +v.position.y.toFixed(1), z: +v.position.z.toFixed(1) } : null,
      pp: g.playerPos ? { x: +g.playerPos.x.toFixed(1), z: +g.playerPos.z.toFixed(1) } : null,
    };
  });
  console.log('after:', JSON.stringify(info2));
  await page.screenshot({ path: 'shots/decker-test2.png' });
  console.log('saved shots/decker-test2.png');
  await browser.close();
})().catch((e) => { console.error('FATAL', String(e).slice(0, 300)); process.exit(1); });
