// probe: any road-ish mesh elevated near the repaired junction (-271,-1086)?
const { chromium } = require('playwright-core');
(async () => {
  const b = await chromium.launch({ channel: 'msedge', headless: true });
  const p = await b.newPage({ viewport: { width: 1280, height: 720 } });
  p.on('pageerror', e => console.log('[pageerror]', e.message));
  await p.goto('http://localhost:5173/?view=city&hour=9&x=-271&z=-1086&y=26&yaw=2.2&pitch=-0.35', { waitUntil: 'domcontentloaded' });
  try { await p.waitForSelector('#boot.done', { timeout: 240000 }); } catch { }
  await p.waitForFunction(() => window.__city, { timeout: 240000 });
  await p.waitForTimeout(4000);
  const res = await p.evaluate(() => {
    const root = window.__city.root;
    const X = -271, Z = -1086, R = 40;
    const found = [];
    root.traverse(o => {
      if (!o.isMesh || !o.geometry || !o.geometry.attributes || !o.geometry.attributes.position) return;
      try { o.geometry.computeBoundingBox(); } catch { return; }
      const bb = o.geometry.boundingBox;
      if (!bb) return;
      // mesh local bbox -> world (assume small transforms; use position)
      const wx = o.position.x, wz = o.position.z, wy = o.position.y;
      // does the mesh's world footprint overlap the junction area?
      const overlap =
        bb.max.x + wx > X - R && bb.min.x + wx < X + R &&
        bb.max.z + wz > Z - R && bb.min.z + wz < Z + R;
      if (!overlap) return;
      found.push({
        name: o.name || '(unnamed)',
        y: +wy.toFixed(2),
        yRange: [+bb.min.y.toFixed(2), +bb.max.y.toFixed(2)],
        x: [+ (bb.min.x + wx).toFixed(0), + (bb.max.x + wx).toFixed(0)],
        z: [+ (bb.min.z + wz).toFixed(0), + (bb.max.z + wz).toFixed(0)],
      });
    });
    // only report meshes with vertical extent or elevation
    const elevated = found.filter(f => f.y > 0.5 || f.yRange[1] > 1.5);
    return { total: found.length, elevated: elevated.slice(0, 20) };
  });
  console.log('meshes overlapping junction area:', res.total);
  console.log('elevated ones:', JSON.stringify(res.elevated, null, 1));
  await b.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
