// world-space scan: find geometry taller than 40u anywhere, report world position
const { chromium } = require('playwright-core');
(async () => {
  const b = await chromium.launch({ channel: 'msedge', headless: true });
  const p = await b.newPage();
  await p.goto('http://localhost:5173/?view=city&hour=9&x=150&z=-400&y=60&yaw=3.6&pitch=-0.15', { waitUntil: 'commit', timeout: 30000 });
  await p.waitForFunction('window.__city !== undefined', null, { timeout: 180000 });
  const info = await p.evaluate(() => {
    const c = window.__city;
    c.root.updateMatrixWorld(true);
    const out = [];
    const V = c.root.position.constructor; // Vector3
    const v = new V();
    c.root.traverse((o) => {
      if (!o.isMesh || !o.geometry) return;
      const g = o.geometry;
      if (!g.boundingBox) g.computeBoundingBox();
      const bb = g.boundingBox;
      if (!bb) return;
      // world corners
      let minY = 1e9, maxY = -1e9, wx = 0, wz = 0, n = 0;
      for (const x of [bb.min.x, bb.max.x]) for (const y of [bb.min.y, bb.max.y]) for (const z of [bb.min.z, bb.max.z]) {
        v.set(x, y, z).applyMatrix4(o.matrixWorld);
        minY = Math.min(minY, v.y); maxY = Math.max(maxY, v.y);
        wx += v.x; wz += v.z; n++;
      }
      const h = maxY - minY;
      if (h < 40) return;
      out.push({ h: +h.toFixed(0), x: +(wx / n).toFixed(0), z: +(wz / n).toFixed(0), topY: +maxY.toFixed(0) });
    });
    out.sort((a, b2) => b2.h - a.h);
    return { tallCount: out.length, top: out.slice(0, 10) };
  });
  console.log(JSON.stringify(info));
  await b.close();
})().catch((e) => console.error('FATAL', e.message));
