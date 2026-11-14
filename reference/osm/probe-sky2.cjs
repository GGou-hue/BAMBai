// probe camera + fog + skyline world position
const { chromium } = require('playwright-core');

(async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  page.on('pageerror', (e) => console.log('[pageerror]', e.message));
  await page.goto('http://localhost:5173/?view=city&hour=9&x=200&z=-500&y=60&yaw=200&pitch=-25', { waitUntil: 'load' });
  await page.waitForSelector('#boot.done', { timeout: 300000 });
  await page.waitForTimeout(2500);
  const info = await page.evaluate(() => {
    const c = window.__city;
    const out = {};
    // find camera: traverse root's parent chain? use THREE from the mesh
    let cam = null, fog = null;
    const walk = (o) => { if (o.isScene) { fog = o.fog; cam = o.children.find(k => k.isCamera) ?? null; } };
    // root's parent should be the scene
    let p = c.root;
    while (p.parent) p = p.parent;
    walk(p);
    out.fog = fog ? { type: fog.isFog ? 'Fog' : 'FogExp2', near: fog.near, far: fog.far, density: fog.density, color: '#' + fog.color.getHexString() } : null;
    if (cam) { out.cam = { pos: [+cam.position.x.toFixed(0), +cam.position.y.toFixed(0), +cam.position.z.toFixed(0)], fov: cam.fov }; }
    // skyline group world pos + geometry bounds
    const find = (o, name) => { if (o.name === name) return o; for (const k of o.children ?? []) { const r = find(k, name); if (r) return r; } return null; };
    const sk = find(c.root, 'skyline panorama');
    if (sk) {
      sk.updateWorldMatrix(true, true);
      out.skyPos = [+sk.position.x.toFixed(0), +sk.position.y.toFixed(0), +sk.position.z.toFixed(0)];
      const m0 = sk.children.find(k => k.visible);
      if (m0) {
        m0.geometry.computeBoundingSphere();
        const bs = m0.geometry.boundingSphere;
        out.skyGeo = { r: +bs.radius.toFixed(0), center: bs.center };
        // world position of a point at the top of the cylinder
        const wp = m0.localToWorld(new (Object.getPrototypeOf(m0.position).constructor)(0, 64, 0));
        out.skyTopWorld = [+wp.x.toFixed(0), +wp.y.toFixed(0), +wp.z.toFixed(0)];
      }
    }
    return out;
  });
  console.log(JSON.stringify(info, null, 1));
  await browser.close();
})().catch((e) => { console.error(e); process.exit(1); });
