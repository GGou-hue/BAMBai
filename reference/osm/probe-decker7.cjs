// boot, PLAY, wait for camera to settle, spawn decker+bus ahead, measure bboxes, screenshot
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
  await page.waitForTimeout(12000);
  const r = await page.evaluate(() => {
    const g = window.__game, cam = g.r.camera;
    const dir = new (cam.position.constructor)();
    cam.getWorldDirection(dir);
    const N = g.playerPos.constructor;
    const px = cam.position.x + dir.x * 9, pz = cam.position.z + dir.z * 9;
    const out = { cam: { x: +cam.position.x.toFixed(0), y: +cam.position.y.toFixed(1), z: +cam.position.z.toFixed(0) }, pp: { x: +g.playerPos.x.toFixed(0), z: +g.playerPos.z.toFixed(0) }, errs: [] };
    try {
      window.__dv = g.spawnVehicle('decker', new N(px, 0.3, pz), Math.atan2(dir.x, dir.z), 4242);
      window.__bv = g.spawnVehicle('bus', new N(px + dir.z * 6, 0.3, pz - dir.x * 6), Math.atan2(dir.x, dir.z), 777);
      // measure via three Box3 if reachable from the vehicle root
      const measure = (v) => {
        if (!v) return null;
        const V3 = cam.position.constructor;
        const root = v.root ?? v.model?.root ?? v;
        let min = [1e9, 1e9, 1e9], max = [-1e9, -1e9, -1e9];
        root.updateWorldMatrix(true, true);
        root.traverse((o) => {
          if (o.isMesh && o.geometry) {
            o.geometry.computeBoundingBox();
            const bb = o.geometry.boundingBox;
            const arr = [[bb.min.x, bb.min.y, bb.min.z], [bb.max.x, bb.max.y, bb.max.z]];
            for (const p of arr) {
              const w = o.localToWorld(new V3(p[0], p[1], p[2]));
              min = [Math.min(min[0], w.x), Math.min(min[1], w.y), Math.min(min[2], w.z)];
              max = [Math.max(max[0], w.x), Math.max(max[1], w.y), Math.max(max[2], w.z)];
            }
          }
        });
        return { h: +(max[1] - min[1]).toFixed(2), yMin: +min[1].toFixed(2), yMax: +max[1].toFixed(2) };
      };
      out.decker = measure(window.__dv);
      out.bus = measure(window.__bv);
    } catch (e) { out.errs.push(String(e).slice(0, 250)); }
    return out;
  });
  console.log('result:', JSON.stringify(r));
  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'shots/decker-test4.png' });
  console.log('saved shots/decker-test4.png');
  await browser.close();
})().catch((e) => { console.error('FATAL', String(e).slice(0, 300)); process.exit(1); });
