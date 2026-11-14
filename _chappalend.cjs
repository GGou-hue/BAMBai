// Watch side2-chappal through to its end: log the success/fail transition and save.side.
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

  const tp = (x, z) => page.evaluate((p) => {
    const g = window.__game;
    g.player.teleport(new window.__THREE.Vector3(p[0], g.player.position.y ?? .15, p[1]), g.player.heading ?? 0);
  }, [x, z]);
  const skip = () => page.evaluate(() => {
    const b = [...document.querySelectorAll('.nu-choice button')].filter((x) => x.offsetParent)[0];
    if (b) { b.click(); return; }
    const ev = (t) => new KeyboardEvent(t, { code: 'Space', key: ' ', keyCode: 32, which: 32, bubbles: true });
    window.dispatchEvent(ev('keydown')); setTimeout(() => window.dispatchEvent(ev('keyup')), 60);
  });
  const st = () => page.evaluate(`(() => {
    const g = window.__game, s = g.story, kit = s?.kit;
    return { cur: s?.current?.id ?? null, sides: (s?.save?.side ?? []), money: s?.save?.money,
      inCut: !!kit?.inScene, step: kit?.step ?? null, sp: kit?.skipping ?? null,
      obj: document.querySelector('.nu-obj:not([hidden]) p')?.textContent?.slice(0, 60) ?? null,
      marks: (g.markers ?? []).filter((m) => m.kind === 'objective').map((m) => ({ x: +m.x.toFixed(1), z: +m.z.toFixed(1) })),
      btns: [...document.querySelectorAll('button')].filter((b) => b.offsetParent && b.textContent.trim().length > 3).map((b) => b.textContent.trim().slice(0, 28)),
      goons: (g.__goons ?? []).map((p) => ({ down: !!p.down, disp: !!p.disposed })),
    };
  })()`);

  let s = await st();
  const offer = (await page.evaluate(() => (window.__game.markers ?? []).filter((m) => m.kind === 'story').map((m) => ({ x: +m.x.toFixed(1), z: +m.z.toFixed(1), label: m.label })))).find((o) => /Chappal/.test(o.label));
  for (let i = 0; i < 30; i++) { s = await st(); if (s.cur) break; await tp(offer.x, offer.z); await sleep(2000); }
  console.log('started', s.cur);

  let prev = 'init';
  for (let r = 0; r < 200; r++) {
    s = await st();
    const key = `${s.cur}|${s.step}|${s.inCut}|${s.obj}|${s.btns.join(',')}|${s.sides.join(',')}`;
    if (key !== prev) { console.log(r, JSON.stringify({ cur: s.cur, step: s.step, inCut: s.inCut, obj: s.obj, btns: s.btns, sides: s.sides, money: s.money, goons: s.goons })); prev = key; }
    if (s.inCut) { await skip(); await sleep(900); continue; }
    if (!s.cur) { console.log('ENDED at r=' + r, JSON.stringify({ sides: s.sides, money: s.money, btns: s.btns })); break; }
    const m = s.marks[0];
    if (m) await tp(m.x, m.z);
    await sleep(1600);
  }
  await browser.close();
})().catch((e) => { console.error('FATAL', e); process.exit(1); });
