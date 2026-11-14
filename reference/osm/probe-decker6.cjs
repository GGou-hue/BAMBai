// boot full game, click PLAY, spawn decker in front of the camera, screenshot
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
  await page.click('button.nu-play');
  await page.waitForTimeout(6000);
  const r = await page.evaluate(() => {
    const g = window.__game, cam = g.r.camera;
    const dir = new (cam.position.constructor)();
    cam.getWorldDirection(dir);
    const N = g.playerPos.constructor;
    const px = cam.position.x + dir.x * 12, pz = cam.position.z + dir.z * 12;
    const out = { cam: { x: +cam.position.x.toFixed(0), y: +cam.position.y.toFixed(0), z: +cam.position.z.toFixed(0) }, pp: { x: +g.playerPos.x.toFixed(0), z: +g.playerPos.z.toFixed(0) }, errs: [] };
    try {
      const v = g.spawnVehicle('decker', new N(px, 0.3, pz), Math.atan2(dir.x, dir.z) + Math.PI / 2, 4242);
      window.__dv = v;
      g.spawnVehicle('bus', new N(px + dir.z * 8, 0.3, pz - dir.x * 8), Math.atan2(dir.x, dir.z) + Math.PI / 2, 777);
    } catch (e) { out.errs.push(String(e).slice(0, 200)); }
    return out;
  });
  console.log('result:', JSON.stringify(r));
  await page.waitForTimeout(2500);
  await page.screenshot({ path: 'shots/decker-test3.png' });
  console.log('saved shots/decker-test3.png');
  await browser.close();
})().catch((e) => { console.error('FATAL', String(e).slice(0, 300)); process.exit(1); });
