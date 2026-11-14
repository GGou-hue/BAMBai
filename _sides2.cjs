// Focused side-story runner using the proven trace loop (teleport -> marks[0], skip cutscenes).
const { chromium } = require('playwright-core');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const log = (...a) => console.log(...a);

const WHICH = process.argv[2] ?? 'both';

(async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  const page = await browser.newPage({ viewport: { width: 1366, height: 636 } });
  const errors = [];
  page.on('pageerror', (e) => errors.push('[pageerror] ' + e.message.slice(0, 200)));
  page.on('console', (m) => { if (m.type() === 'error') errors.push('[console] ' + m.text().slice(0, 160)); });

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
    if (b) { b.click(); return 'choice'; }
    const ev = (t) => new KeyboardEvent(t, { code: 'Space', key: ' ', keyCode: 32, which: 32, bubbles: true });
    window.dispatchEvent(ev('keydown')); setTimeout(() => window.dispatchEvent(ev('keyup')), 60);
    return null;
  });
  const st = () => page.evaluate(`(() => {
    const g = window.__game, s = g.story, kit = s?.kit;
    return {
      cur: s?.current?.id ?? null,
      next: s?.save?.next, money: s?.save?.money,
      sides: (s?.save?.side ?? []), best: Object.keys(s?.save?.best ?? {}),
      inCut: !!kit?.inScene, step: kit?.step ?? null,
      obj: document.querySelector('.nu-obj:not([hidden]) p')?.textContent?.slice(0, 70) ?? null,
      marks: (g.markers ?? []).filter((m) => m.kind === 'objective').map((m) => ({ x: +m.x.toFixed(1), z: +m.z.toFixed(1) })),
      offers: (g.markers ?? []).filter((m) => m.kind === 'story').map((m) => ({ x: +m.x.toFixed(1), z: +m.z.toFixed(1), label: m.label })),
      btns: [...document.querySelectorAll('button')].filter((b) => b.offsetParent && b.textContent.trim().length > 3).map((b) => b.textContent.trim().slice(0, 30)),
    };
  })()`);

  const runOne = async (label) => {
    log('=== ' + label);
    let s = await st();
    const offer = s.offers.find((o) => o.label && o.label.toLowerCase().includes(label.toLowerCase()));
    if (!offer) { log('  no offer marker for', label); return; }
    log('  offer at', JSON.stringify(offer));
    for (let i = 0; i < 30; i++) {
      s = await st();
      if (s.cur) break;
      await tp(offer.x, offer.z);
      await sleep(2000);
    }
    log('  started:', s.cur);
    if (!s.cur) return;

    for (let r = 0; r < 260; r++) {
      s = await st();
      if (s.inCut) { await skip(); await sleep(1000); continue; }
      if (!s.cur) break;
      if (s.btns.some((b) => /Retry/i.test(b))) { log('  !! failed'); break; }
      const m = s.marks[0];
      if (m) await tp(m.x, m.z);
      await sleep(1800);
    }
    // drain any closing cutscene / end flow
    for (let k = 0; k < 20; k++) {
      s = await st();
      if (s.inCut) { await skip(); await sleep(1000); continue; }
      if (s.cur) { const m = s.marks[0]; if (m) { await tp(m.x, m.z); await sleep(1800); continue; } }
      break;
    }
    s = await st();
    log('  RESULT:', JSON.stringify({ cur: s.cur, money: s.money, sides: s.sides, best: s.best, obj: s.obj }));
  };

  if (WHICH === 'both' || WHICH === 'tiffin') await runOne('Tiffin');
  if (WHICH === 'both' || WHICH === 'chappal') await runOne('Chappal');

  const fin = await st();
  log('\nFINAL:', JSON.stringify({ next: fin.next, money: fin.money, sides: fin.sides, best: fin.best }));
  log('ERRORS:', errors.length ? errors.slice(0, 8).join('\n') : 'none');
  await browser.close();
})().catch((e) => { console.error('FATAL', e); process.exit(1); });
