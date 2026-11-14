// Probe offer state right after Continue with a seeded save at next:8.
const { chromium } = require('playwright-core');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
(async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  const page = await browser.newPage({ viewport: { width: 1366, height: 636 } });
  page.on('pageerror', (e) => console.log('[pageerror]', e.message.slice(0, 200)));
  await page.addInitScript(() => {
    try {
      localStorage.setItem('bambi.voice', '0');
      localStorage.setItem('nammauru.save.v1', JSON.stringify({ v: 1, next: 8, money: 500, bonds: {}, side: [], best: {} }));
    } catch {}
  });
  await page.goto('http://localhost:5173/?hour=23', { waitUntil: 'load', timeout: 90000 });
  await page.waitForSelector('.nu-play[data-a=play]', { timeout: 240000 });
  await page.locator('.nu-play[data-a=play]').click();
  await page.waitForFunction(() => !!window.__ready, { timeout: 180000 });
  await sleep(6000);

  const dump = await page.evaluate(() => {
    const g = window.__game, s = g.story;
    return {
      save: s?.save,
      offersLen: s?.offers?.length,
      offers: (s?.offers ?? []).map((o) => ({ id: o.m?.id, side: o.side, blip: { x: +o.blip.x.toFixed(1), z: +o.blip.z.toFixed(1) }, armed: o.armed })),
      markersLen: g.markers?.length,
      markers: (g.markers ?? []).map((m) => ({ x: +m.x.toFixed(1), z: +m.z.toFixed(1), kind: m.kind, label: m.label ?? null })),
      objHtml: document.querySelector('.nu-obj:not([hidden]) p')?.innerHTML ?? null,
      nextStory: (() => { try { return s.save.next; } catch { return null; } })(),
      storyIds: (() => {
        // chapter-2 presence check via the live story object
        return null;
      })(),
      playerPos: { x: +g.playerPos.x.toFixed(1), z: +g.playerPos.z.toFixed(1) },
      locked: g.locked, ride: !!g.ride,
      hudObjective: document.querySelector('.nu-obj')?.textContent?.slice(0, 120) ?? null,
    };
  });
  console.log(JSON.stringify(dump, null, 1));
  await browser.close();
})().catch((e) => { console.error('FATAL', e); process.exit(1); });
