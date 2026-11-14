// vertex-level check: does the road surface mesh dip below -0.8 near the toniqueDip?
const { chromium } = require('playwright-core');
(async () => {
  const b = await chromium.launch({ channel: 'msedge', headless: true });
  const p = await b.newPage({ viewport: { width: 1280, height: 720 } });
  await p.goto('http://localhost:5173/?view=city&hour=9&x=-199&z=596&y=30&yaw=1.2&pitch=-0.5', { waitUntil: 'domcontentloaded' });
  try { await p.waitForSelector('#boot.done', { timeout: 240000 }); } catch { }
  await p.waitForFunction(() => window.__city, { timeout: 240000 });
  await p.waitForTimeout(3000);
  const res = await p.evaluate(() => {
    const root = window.__city.root;
    const X = -199, Z = 596, R = 45;
    const out = [];
    root.traverse(o => {
      if (!o.isMesh || !o.geometry || !o.geometry.attributes || !o.geometry.attributes.position) return;
      const name = o.name || '(unnamed)';
      if (!/surface/i.test(name)) return;
      const pos = o.geometry.attributes.position;
      if (!pos || !pos.count || !pos.array) return;
      const wx = o.position.x, wz = o.position.z, wy = o.position.y;
      let below = 0, min_y = 1e9;
      for (let i = 0; i < pos.count; i++) {
        const vx = pos.getX(i) + wx, vz = pos.getZ(i) + wz, vy = pos.getY(i) + wy;
        if (Math.abs(vx - X) < R && Math.abs(vz - Z) < R) {
          if (vy < min_y) min_y = vy;
          if (vy < -0.8) below++;
        }
      }
      if (below > 0) out.push({ name, below, min_y: +min_y.toFixed(2) });
    });
    return out;
  });
  console.log('surface meshes with vertices below -0.8 near dip:', JSON.stringify(res));
  await b.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
