// Catch the exception that ends side2-chappal without recording success.
const { chromium } = require('playwright-core');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
(async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  const page = await browser.newPage({ viewport: { width: 1366, height: 636 } });
  page.on('pageerror', (e) => console.log('[pageerror]', e.message.slice(0, 300)));
  page.on('console', (m) => { if (m.type() === 'error' || /mission|fail|abort/i.test(m.text())) console.log('[console.' + m.type() + ']', m.text().slice(0, 260)); });
  await page.addInitScript(() => {
    try { localStorage.setItem('nammauru.save.v1', JSON.stringify({ v: 1, next: 16, money: 5000, bonds: {}, side: [], best: {} })); } catch {}
    // capture mission errors thrown inside the story run
    window.__missionErrs = [];
    const oe = console.error;
    console.error = (...a) => { try { window.__missionErrs.push(a.map(String).join(' ').slice(0, 300)); } catch {} oe.apply(console, a); };
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
    const L = g.npcs instanceof Set ? [...g.npcs] : Object.values(g.npcs ?? {});
    const boss = L.filter((n) => n && n.hostile && !n.disposed).map((n) => ({ name: n.name ?? null, down: !!n.down, hp: n.health ?? null }));
    return { cur: s?.current?.id ?? null, sides: (s?.save?.side ?? []), money: s?.save?.money,
      inCut: !!kit?.inScene, step: kit?.step ?? null,
      obj: document.querySelector('.nu-obj:not([hidden]) p')?.textContent?.slice(0, 60) ?? null,
      marks: (g.markers ?? []).filter((m) => m.kind === 'objective').map((m) => ({ x: +m.x.toFixed(1), z: +m.z.toFixed(1) })),
      hostiles: boss, ppos: { x: +g.player.position.x.toFixed(1), z: +g.player.position.z.toFixed(1) },
    };
  })()`);

  let s = await st();
  const offer = (await page.evaluate(() => (window.__game.markers ?? []).filter((m) => m.kind === 'story').map((m) => ({ x: +m.x.toFixed(1), z: +m.z.toFixed(1), label: m.label })))).find((o) => /Chappal/.test(o.label));
  for (let i = 0; i < 30; i++) { s = await st(); if (s.cur) break; await tp(offer.x, offer.z); await sleep(2000); }
  console.log('started', s.cur);

  for (let r = 0; r < 120; r++) {
    s = await st();
    if (r % 3 === 0 || !s.cur) console.log(r, JSON.stringify({ cur: s.cur, step: s.step, obj: s.obj, hostiles: s.hostiles, sides: s.sides, pos: s.ppos }));
    if (s.inCut) { await skip(); await sleep(900); continue; }
    if (!s.cur) break;
    const m = s.marks[0];
    if (m) await tp(m.x, m.z);
    // fight the boss if present
    await page.evaluate(() => {
      const g = window.__game;
      const L = g.npcs instanceof Set ? [...g.npcs] : Object.values(g.npcs ?? {});
      for (const n of L) { if (n && n.hostile && !n.disposed && !n.down) { try { n.takeHit(n.position, 4); } catch (e) {} } }
    });
    await sleep(1600);
  }
  const errs = await page.evaluate(() => window.__missionErrs ?? []);
  console.log('\nMISSION ERRORS:', errs.length ? errs.join('\n') : 'none');
  const f = await st();
  console.log('FINAL:', JSON.stringify({ cur: f.cur, sides: f.sides, money: f.money }));
  await browser.close();
})().catch((e) => { console.error('FATAL', e); process.exit(1); });
