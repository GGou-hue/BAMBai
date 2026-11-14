// Trace ch2-tail: player-Putta distance, Putta movement, objective, fail counters.
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
  // skip the intro cutscene
  for (let k = 0; k < 30; k++) {
    const inCut = await page.evaluate(() => !!window.__game.story?.kit?.inScene);
    if (!inCut) break;
    await page.evaluate(() => {
      const ev = (t) => new KeyboardEvent(t, { code: 'Space', key: ' ', keyCode: 32, which: 32, bubbles: true });
      window.dispatchEvent(ev('keydown')); setTimeout(() => window.dispatchEvent(ev('keyup')), 60);
    });
    await sleep(1200);
  }
  await page.evaluate(() => { window.__game.player.stance = 'sneak'; });

  let lastPutta = null;
  for (let i = 0; i < 60; i++) {
    const s = await page.evaluate(`(() => {
      const g = window.__game, st = g.story;
      const src = g.npcs;
      const L = src instanceof Set ? [...src] : src instanceof Map ? [...src.values()] : Object.values(src ?? {});
      let pu = null; for (const p of L) if (p && p.name === 'Pipeline Putta' && !p.disposed) { pu = p; break; }
      const m = (g.markers ?? []).find((x) => x.kind === 'objective');
      return {
        cur: st?.current?.id ?? null,
        pd: pu ? { x: +pu.position.x.toFixed(1), z: +pu.position.z.toFixed(1) } : null,
        d: pu ? +Math.hypot(g.player.position.x - pu.position.x, g.player.position.z - pu.position.z).toFixed(1) : null,
        obj: document.querySelector('.nu-obj:not([hidden]) p')?.textContent?.slice(0, 70) ?? null,
        mark: m ? { x: +m.x.toFixed(1), z: +m.z.toFixed(1) } : null,
        btn: [...document.querySelectorAll('button')].filter((b) => b.offsetParent).map((b) => b.textContent.trim().slice(0, 26)),
      };
    })()`);
    const moved = lastPutta && s.pd ? Math.hypot(s.pd.x - lastPutta.x, s.pd.z - lastPutta.z).toFixed(1) : '?';
    console.log(i, 'd=' + s.d, 'putta=' + JSON.stringify(s.pd), 'moved=' + moved, 'mark=' + JSON.stringify(s.mark), 'cur=' + s.cur);
    lastPutta = s.pd;
    if (!s.cur) { console.log('buttons:', JSON.stringify(s.btn)); break; }
    if (s.btn.some((b) => /Retry/i.test(b))) break;
    // follow: hold 12 m behind his heading toward the gate
    if (s.pd) {
      await page.evaluate((p) => {
        const g = window.__game;
        const pl = g.player.position;
        const dx = pl.x - p.x, dz = pl.z - p.z, d = Math.hypot(dx, dz) || 1;
        const tx = p.x + (dx / d) * 12, tz = p.z + (dz / d) * 12;
        g.player.teleport(new window.__THREE.Vector3(tx, pl.y ?? .15, tz), g.player.heading ?? 0);
      }, s.pd);
    }
    await sleep(2000);
  }
  await browser.close();
})().catch((e) => { console.error('FATAL', e); process.exit(1); });
