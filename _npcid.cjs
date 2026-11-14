// Enumerate live NPCs during ch2-tail to find Putta's real identity.
const { chromium } = require('playwright-core');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
(async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  const page = await browser.newPage({ viewport: { width: 1366, height: 636 } });
  await page.addInitScript(() => {
    try { localStorage.setItem('nammauru.save.v1', JSON.stringify({ v: 1, next: 9, money: 1000, bonds: {}, side: [], best: {} })); } catch {}
  });
  await page.goto('http://localhost:5173/?hour=23', { waitUntil: 'load', timeout: 90000 });
  await page.waitForSelector('.nu-play[data-a=play]', { timeout: 240000 });
  await page.locator('.nu-play[data-a=play]').click();
  await page.waitForFunction(() => !!window.__ready, { timeout: 180000 });
  await sleep(5000);
  for (let i = 0; i < 20; i++) {
    const cur = await page.evaluate(() => window.__game.story?.current?.id ?? null);
    if (cur) break;
    await page.evaluate(() => {
      const g = window.__game;
      const m = (g.markers ?? []).find((x) => x.kind === 'objective' || (x.kind === 'story' && x.label));
      if (m) g.player.teleport(new window.__THREE.Vector3(m.x, g.player.position.y ?? .15, m.z), g.player.heading ?? 0);
    });
    await sleep(1800);
  }
  await sleep(6000);
  const dump = await page.evaluate(() => {
    const g = window.__game;
    const src = g.npcs;
    const L = src instanceof Map ? [...src.values()] : Array.isArray(src) ? src : Object.values(src ?? {});
    const p = g.player.position;
    return {
      type: src instanceof Map ? 'Map' : Array.isArray(src) ? 'Array' : typeof src,
      count: L.length,
      npcs: L.filter((n) => n && !n.disposed).map((n) => ({
        name: n.name ?? null, label: n.label ?? null, rig: n.rig?.name ?? null,
        d: +Math.hypot(n.position.x - p.x, n.position.z - p.z).toFixed(1),
        marker: !!n.marker, hostile: !!n.hostile,
      })).sort((a, b) => a.d - b.d).slice(0, 12),
      markers: (g.markers ?? []).map((m) => ({ kind: m.kind, label: m.label ?? null, x: +m.x.toFixed(1), z: +m.z.toFixed(1) })),
    };
  });
  console.log(JSON.stringify(dump, null, 1));
  await browser.close();
})().catch((e) => { console.error('FATAL', e); process.exit(1); });
