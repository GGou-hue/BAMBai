// verify the re-activated toniqueDip renders at (-199,596): screenshot + mesh scan
const { chromium } = require('playwright-core');
(async () => {
  const b = await chromium.launch({ channel: 'msedge', headless: true });
  const p = await b.newPage({ viewport: { width: 1280, height: 720 } });
  p.on('pageerror', e => console.log('[pageerror]', e.message));
  await p.goto('http://localhost:5173/?view=city&hour=9&x=-199&z=596&y=30&yaw=1.2&pitch=-0.5', { waitUntil: 'domcontentloaded' });
  try { await p.waitForSelector('#boot.done', { timeout: 240000 }); } catch { }
  await p.waitForFunction(() => window.__city, { timeout: 240000 });
  await p.waitForTimeout(4000);
  await p.screenshot({ path: 'shots/tonique-dip.png' });
  const res = await p.evaluate(() => {
    const root = window.__city.root;
    const X = -199, Z = 596, R = 30;
    const found = [];
    root.traverse(o => {
      if (!o.isMesh || !o.geometry || !o.geometry.attributes || !o.geometry.attributes.position) return;
      try { o.geometry.computeBoundingBox(); } catch { return; }
      const bb = o.geometry.boundingBox;
      if (!bb) return;
      const wx = o.position.x, wz = o.position.z, wy = o.position.y;
      const overlap =
        bb.max.x + wx > X - R && bb.min.x + wx < X + R &&
        bb.max.z + wz > Z - R && bb.min.z + wz < Z + R;
      if (!overlap) return;
      found.push({
        name: o.name || '(unnamed)',
        y: +wy.toFixed(2),
        yRange: [+bb.min.y.toFixed(2), +bb.max.y.toFixed(2)],
        x: [+(bb.min.x + wx).toFixed(0), +(bb.max.x + wx).toFixed(0)],
        z: [+(bb.min.z + wz).toFixed(0), +(bb.max.z + wz).toFixed(0)],
      });
    });
    return found;
  });
  console.log('meshes overlapping dip area:', res.length);
  for (const f of res) console.log(JSON.stringify(f));
  await b.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
