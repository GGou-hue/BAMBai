// probe skyline panorama via window.__city.root
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
    const found = [];
    const walk = (o, depth, path) => {
      if (!o || depth > 8) return;
      const m = o.material;
      if (m && m.map && m.map.image) {
        const src = String(m.map.image?.src ?? m.map.image?.constructor?.name ?? '');
        found.push({ path: path.slice(-60), name: o.name, type: o.type, visible: o.visible, pos: o.position ? [+o.position.x.toFixed(0), +o.position.y.toFixed(0), +o.position.z.toFixed(0)] : null, opacity: +m.opacity.toFixed(2), transparent: m.transparent, src: src.slice(-46), w: m.map.image?.width, h: m.map.image?.height });
      }
      for (const ch of o.children ?? []) walk(ch, depth + 1, path + '/' + (ch.name || ch.type));
    };
    walk(c.root, 0, '');
    out.texturedMeshes = found.length;
    out.skyLike = found.filter(f => /sky|Sky/i.test(f.src) || /sky/i.test(f.path));
    out.first10 = found.slice(0, 10);
    return out;
  });
  console.log(JSON.stringify(info, null, 1).slice(0, 4000));
  await browser.close();
})().catch((e) => { console.error(e); process.exit(1); });
