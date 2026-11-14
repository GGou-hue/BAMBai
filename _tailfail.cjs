// Observe how the tail mission fails: catch the fail reason + dialog DOM.
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

  // start ch2-tail by teleporting to its offer marker
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
  console.log('cur:', await page.evaluate(() => window.__game.story?.current?.id ?? null));

  // stand still in sneak and watch the fail counters
  await page.evaluate(() => { window.__game.player.stance = 'sneak'; });
  for (let i = 0; i < 26; i++) {
    const s = await page.evaluate(() => {
      const g = window.__game, st = g.story;
      const src = g.npcs;
      const L = src instanceof Map ? [...src.values()] : Array.isArray(src) ? src : Object.values(src ?? {});
      let putta = null; for (const p of L) if (p && p.name === 'Pipeline Putta' && !p.disposed) { putta = p; break; }
      const d = putta ? Math.hypot(g.player.position.x - putta.position.x, g.player.position.z - putta.position.z) : null;
      return {
        cur: st?.current?.id ?? null,
        d: d == null ? null : +d.toFixed(1),
        stance: g.player.stance,
        dialogs: [...document.querySelectorAll('.nu-screen, dialog, .nu-confirm')].filter((e) => e.offsetParent).map((e) => (e.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 120)),
        buttons: [...document.querySelectorAll('button')].filter((b) => b.offsetParent).map((b) => b.textContent.trim().slice(0, 34)).slice(0, 6),
      };
    });
    console.log(i, JSON.stringify(s));
    if (s.dialogs.length) break;
    await sleep(1000);
  }
  await browser.close();
})().catch((e) => { console.error('FATAL', e); process.exit(1); });
