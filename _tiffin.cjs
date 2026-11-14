// Start side2-tiffin specifically. Its offer shares the PG marker with a Chapter-1
// side, so approach and check which mission actually started; retry if the wrong one.
const { chromium } = require('playwright-core');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
(async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  const page = await browser.newPage({ viewport: { width: 1366, height: 636 } });
  const errors = [];
  page.on('pageerror', (e) => errors.push('[pageerror] ' + e.message.slice(0, 200)));
  await page.addInitScript(() => {
    try { localStorage.setItem('nammauru.save.v1', JSON.stringify({ v: 1, next: 16, money: 5000, bonds: {}, side: ['side-guests'], best: {} })); } catch {}
  });
  await page.goto('http://localhost:5173/?hour=12', { waitUntil: 'load', timeout: 90000 });
  await page.waitForSelector('.nu-play[data-a=play]', { timeout: 240000 });
  await page.locator('.nu-play[data-a=play]').click();
  await page.waitForFunction(() => !!window.__ready, { timeout: 180000 });
  await sleep(5000);

  const st = () => page.evaluate(`(() => {
    const g = window.__game, s = g.story, kit = s?.kit;
    return { cur: s?.current?.id ?? null, sides: (s?.save?.side ?? []), money: s?.save?.money,
      inCut: !!kit?.inScene, step: kit?.step ?? null,
      obj: document.querySelector('.nu-obj:not([hidden]) p')?.textContent?.slice(0, 70) ?? null,
      marks: (g.markers ?? []).filter((m) => m.kind === 'objective').map((m) => ({ x: +m.x.toFixed(1), z: +m.z.toFixed(1) })),
      offers: (g.markers ?? []).filter((m) => m.kind === 'story').map((m) => ({ x: +m.x.toFixed(1), z: +m.z.toFixed(1), label: m.label })),
    };
  })()`);
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

  let s = await st();
  console.log('offers:', JSON.stringify(s.offers.filter((o) => /Tiffin|Guests/i.test(o.label))));
  const off = s.offers.find((o) => /Tiffin/i.test(o.label));
  if (!off) { console.log('no tiffin offer'); await browser.close(); return; }

  // approach and confirm which mission begins
  for (let i = 0; i < 30; i++) {
    s = await st();
    if (s.cur) break;
    await tp(off.x, off.z);
    await sleep(2000);
  }
  console.log('started:', s.cur, s.cur === 'side2-tiffin' ? '(correct)' : '(WRONG mission)');

  for (let r = 0; r < 220; r++) {
    s = await st();
    if (s.inCut) { await skip(); await sleep(900); continue; }
    if (!s.cur) break;
    const m = s.marks[0];
    if (m) await tp(m.x, m.z);
    await page.evaluate(() => {
      const g = window.__game;
      const L = g.npcs instanceof Set ? [...g.npcs] : Object.values(g.npcs ?? {});
      for (const n of L) { if (n && n.hostile && !n.disposed && !n.down) { try { n.takeHit(n.position, 4); } catch (e) {} } }
    });
    if (r % 15 === 0) console.log(r, JSON.stringify({ cur: s.cur, step: s.step, obj: s.obj }));
    await sleep(1600);
  }
  for (let k = 0; k < 15; k++) {
    s = await st();
    if (s.inCut) { await skip(); await sleep(1000); continue; }
    if (s.cur) { const m = s.marks[0]; if (m) { await tp(m.x, m.z); await sleep(1700); continue; } }
    break;
  }
  s = await st();
  console.log('FINAL:', JSON.stringify({ cur: s.cur, sides: s.sides, money: s.money, obj: s.obj }));
  console.log('ERRORS:', errors.length ? errors.slice(0, 6).join('\n') : 'none');
  await browser.close();
})().catch((e) => { console.error('FATAL', e); process.exit(1); });
