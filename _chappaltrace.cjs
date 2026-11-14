// Trace side2-chappal: is it in cutscene, what objective, where are the markers?
const { chromium } = require('playwright-core');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
(async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  const page = await browser.newPage({ viewport: { width: 1366, height: 636 } });
  page.on('pageerror', (e) => console.log('[pageerror]', e.message.slice(0, 200)));
  await page.addInitScript(() => {
    try { localStorage.setItem('nammauru.save.v1', JSON.stringify({ v: 1, next: 16, money: 5000, bonds: {}, side: [], best: {} })); } catch {}
  });
  await page.goto('http://localhost:5173/?hour=19', { waitUntil: 'load', timeout: 90000 });
  await page.waitForSelector('.nu-play[data-a=play]', { timeout: 240000 });
  await page.locator('.nu-play[data-a=play]').click();
  await page.waitForFunction(() => !!window.__ready, { timeout: 180000 });
  await sleep(5000);

  const marks = await page.evaluate(() => (window.__game.markers ?? []).map((m) => ({ kind: m.kind, label: m.label ?? null, x: +m.x.toFixed(1), z: +m.z.toFixed(1) })));
  console.log('offer markers:', JSON.stringify(marks.filter((m) => m.kind === 'story')));

  // go to the chappal offer
  const ch = marks.find((m) => m.label && /Chappal/i.test(m.label));
  if (!ch) { console.log('no chappal offer'); await browser.close(); return; }
  await page.evaluate((p) => {
    const g = window.__game;
    g.player.teleport(new window.__THREE.Vector3(p.x, g.player.position.y ?? .15, p.z), g.player.heading ?? 0);
  }, ch);
  await sleep(4000);

  for (let i = 0; i < 40; i++) {
    const s = await page.evaluate(`(() => {
      const g = window.__game, st = g.story, kit = st?.kit;
      return {
        cur: st?.current?.id ?? null,
        inCut: !!kit?.inScene,
        step: kit?.step ?? null,
        obj: document.querySelector('.nu-obj:not([hidden]) p')?.textContent?.slice(0, 80) ?? null,
        marks: (g.markers ?? []).filter((m) => m.kind === 'objective').map((m) => ({ x: +m.x.toFixed(1), z: +m.z.toFixed(1) })),
        btn: [...document.querySelectorAll('button')].filter((b) => b.offsetParent && b.textContent.trim().length > 3).map((b) => b.textContent.trim().slice(0, 34)),
        ppos: { x: +g.player.position.x.toFixed(1), z: +g.player.position.z.toFixed(1) },
      };
    })()`);
    console.log(i, JSON.stringify(s));
    if (s.inCut) {
      await page.evaluate(() => {
        const ev = (t) => new KeyboardEvent(t, { code: 'Space', key: ' ', keyCode: 32, which: 32, bubbles: true });
        window.dispatchEvent(ev('keydown')); setTimeout(() => window.dispatchEvent(ev('keyup')), 60);
      });
      await sleep(1000); continue;
    }
    if (!s.cur) { console.log('MISSION ENDED'); break; }
    const m = s.marks[0];
    if (m) {
      await page.evaluate((p) => {
        const g = window.__game;
        g.player.teleport(new window.__THREE.Vector3(p.x, g.player.position.y ?? .15, p.z), g.player.heading ?? 0);
      }, m);
    }
    await sleep(2000);
  }
  await browser.close();
})().catch((e) => { console.error('FATAL', e); process.exit(1); });
