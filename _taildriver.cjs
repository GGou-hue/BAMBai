// Reproduce the DRIVER's exact tail loop and log distance/progress per round.
const { chromium } = require('playwright-core');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
(async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  const page = await browser.newPage({ viewport: { width: 1366, height: 636 } });
  page.on('pageerror', (e) => console.log('[pageerror]', e.message.slice(0, 200)));
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
  // intro skip (driver style)
  for (let k = 0; k < 60; k++) {
    const inCut = await page.evaluate(() => !!window.__game.story?.kit?.inScene);
    if (!inCut) break;
    await page.evaluate(() => {
      const ev = (t) => new KeyboardEvent(t, { code: 'Space', key: ' ', keyCode: 32, which: 32, bubbles: true });
      window.dispatchEvent(ev('keydown')); setTimeout(() => window.dispatchEvent(ev('keyup')), 60);
    });
    await sleep(900);
  }
  await page.evaluate(() => { window.__game.player.stance = 'sneak'; });

  const gate = { x: 380.4, z: 98.7 };
  for (let r = 0; r < 130; r++) {
    const s = await page.evaluate(`(() => {
      const g = window.__game, st = g.story;
      const src = g.npcs;
      const L = src instanceof Set ? [...src] : src instanceof Map ? [...src.values()] : Object.values(src ?? {});
      let pu = null; for (const p of L) if (p && p.name === 'Pipeline Putta' && !p.disposed) { pu = p; break; }
      const info = pu ? { x: pu.position.x, z: pu.position.z } : null;
      const pl = g.player.position;
      if (info) {
        const dx = pl.x - info.x, dz = pl.z - info.z, d = Math.hypot(dx, dz) || 1;
        g.player.teleport(new window.__THREE.Vector3(info.x + dx / d * 14, pl.y ?? .15, info.z + dz / d * 14), g.player.heading ?? 0);
      }
      return {
        cur: st?.current?.id ?? null,
        pu: info ? { x: +info.x.toFixed(1), z: +info.z.toFixed(1) } : null,
        d: info ? +Math.hypot(pl.x - info.x, pl.z - info.z).toFixed(1) : null,
        toGate: info ? +Math.hypot(info.x - 380.4, info.z - 98.7).toFixed(1) : null,
        btn: [...document.querySelectorAll('button')].filter((b) => b.offsetParent).map((b) => b.textContent.trim().slice(0, 24)),
      };
    })()`);
    if (r % 10 === 0 || !s.cur) console.log(r, 'cur=' + s.cur, 'd=' + s.d, 'toGate=' + s.toGate, 'pu=' + JSON.stringify(s.pu), s.btn.length ? 'BTN:' + JSON.stringify(s.btn) : '');
    if (!s.cur) { console.log('ENDED at round', r, JSON.stringify(s)); break; }
    await sleep(1700);
  }
  const fin = await page.evaluate(() => ({ next: window.__game.story?.save?.next, best: Object.keys(window.__game.story?.save?.best ?? {}) }));
  console.log('FINAL', JSON.stringify(fin));
  await browser.close();
})().catch((e) => { console.error('FATAL', e); process.exit(1); });
