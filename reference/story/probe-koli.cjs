// numeric check: geometry near the Koliwada mast position with topY > 25
const { chromium } = require('playwright-core');
(async () => {
  const b = await chromium.launch({ channel: 'msedge', headless: true });
  const p = await b.newPage();
  await p.goto('http://localhost:5173/?view=city&hour=9&x=150&z=-400&y=60&yaw=3.6&pitch=-0.15', { waitUntil: 'commit', timeout: 30000 });
  await p.waitForFunction('window.__city !== undefined', null, { timeout: 180000 });
  const info = await p.evaluate(() => {
    const c = window.__city;
    c.root.updateMatrixWorld(true);
    const V = c.root.position.constructor;
    const v = new V();
    const hits = [];
    c.root.traverse((o) => {
      if (!o.isMesh || !o.geometry) return;
      const g = o.geometry;
      if (!g.boundingBox) g.computeBoundingBox();
      const bb = g.boundingBox;
      if (!bb) return;
      let minY = 1e9, maxY = -1e9, minWY = 1e9;
      let inXZ = false;
      for (const x of [bb.min.x, bb.max.x]) for (const y of [bb.min.y, bb.max.y]) for (const z of [bb.min.z, bb.max.z]) {
        v.set(x, y, z).applyMatrix4(o.matrixWorld);
        minY = Math.min(minY, v.y); maxY = Math.max(maxY, v.y);
        if (v.x > 405 && v.x < 430 && v.z > -950 && v.z < -920) inXZ = true;
      }
      if (inXZ && maxY > 25) hits.push({ topY: +maxY.toFixed(1), h: +(maxY - minY).toFixed(1) });
    });
    hits.sort((a, b2) => b2.topY - a.topY);
    return { count: hits.length, top: hits.slice(0, 6) };
  });
  console.log(JSON.stringify(info));
  await b.close();
})().catch((e) => console.error('FATAL', e.message));
