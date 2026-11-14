// Diagnose why the driver's ch2-tail loop stalls right after start (empty objective).
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
  for (let i = 0; i < 20; i++) {
    const s = await page.evaluate(`(() => {
      const g = window.__game, st = g.story, kit = st?.kit;
      return {
        cur: st?.current?.id ?? null,
        inCut: !!kit?.inScene,
        step: kit?.step ?? null,
        stepWhat: kit?.stepWhat ?? null,
        obj: document.querySelector('.nu-obj:not([hidden]) p')?.textContent?.slice(0, 80) ?? null,
        timed: !!(kit && kit.tries),
        markers: (g.markers ?? []).filter((m) => m.kind === 'objective').map((m) => ({ x: +m.x.toFixed(0), z: +m.z.toFixed(0) })),
        btn: [...document.querySelectorAll('button')].filter((b) => b.offsetParent).map((b) => b.textContent.trim().slice(0, 32)),
      };
    })()`);
    console.log(i, JSON.stringify(s));
    await sleep(2500);
  }
  await browser.close();
})().catch((e) => { console.error('FATAL', e); process.exit(1); });
