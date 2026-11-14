// Debug the exact state() call the driver makes after Continue.
const { chromium } = require('playwright-core');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
(async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  const page = await browser.newPage({ viewport: { width: 1366, height: 636 } });
  page.on('pageerror', (e) => console.log('[pageerror]', e.message.slice(0, 200)));
  await page.addInitScript(() => {
    try {
      localStorage.setItem('bambai.voice', '0');
      localStorage.setItem('nammauru.save.v1', JSON.stringify({ v: 1, next: 8, money: 500, bonds: {}, side: [], best: {} }));
    } catch {}
  });
  await page.goto('http://localhost:5173/?hour=23', { waitUntil: 'load', timeout: 90000 });
  await page.waitForSelector('.nu-play[data-a=play]', { timeout: 240000 });
  await page.locator('.nu-play[data-a=play]').click();
  await page.waitForFunction(() => !!window.__ready, { timeout: 180000 });
  await sleep(4000);

  // replicate the driver's state() verbatim and surface any error
  const out = await page.evaluate(() => {
    try {
      const g = window.__game, s = g.story;
      const npcSrc = g.npcs;
      const npcL = npcSrc instanceof Map ? [...npcSrc.values()]
        : Array.isArray(npcSrc) ? npcSrc
        : Object.values(npcSrc ?? {});
      const find = (nm) => { for (const p of npcL) if (p && p.name === nm) return { x: p.position.x, z: p.position.z }; return null; };
      return {
        ok: true,
        npcsType: npcSrc instanceof Map ? 'Map' : Array.isArray(npcSrc) ? 'Array' : typeof npcSrc,
        npcCount: npcL.length,
        cur: s?.current?.id ?? null,
        marks: (g.markers ?? []).map((m) => ({ x: +m.x.toFixed(1), z: +m.z.toFixed(1), kind: m.kind, label: m.label ?? null })),
        objHtml: document.querySelector('.nu-obj:not([hidden]) p')?.innerHTML ?? null,
        btns: [...document.querySelectorAll('button')].filter((b) => b.offsetParent && b.textContent.trim().length > 3).map((b) => b.textContent.trim().slice(0, 40)),
      };
    } catch (e) { return { ok: false, err: String(e && e.stack || e).slice(0, 500) }; }
  });
  console.log(JSON.stringify(out, null, 1));
  await browser.close();
})().catch((e) => { console.error('FATAL', e); process.exit(1); });
