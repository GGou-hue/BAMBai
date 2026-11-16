// S7 boot check: time-to-__game on the extended map + anchor sanity + shot
const { chromium } = require('playwright-core');
(async () => {
  const b = await chromium.launch({ channel: 'msedge', headless: true });
  const p = await b.newPage({ viewport: { width: 1280, height: 720 } });
  const errs = [];
  p.on('pageerror', (e) => errs.push(String(e).slice(0, 160)));
  const t0 = Date.now();
  const log = (s) => console.log('[' + Math.round((Date.now() - t0) / 1000) + 's] ' + s);

  await p.goto('http://localhost:5173/?story=1', { waitUntil: 'commit', timeout: 60000 });
  let booted = false;
  for (let i = 0; i < 400; i++) {
    await p.waitForTimeout(3000);
    try { booted = await p.evaluate(() => !!window.__game); } catch { booted = false; }
    if (booted) break;
  }
  log('game handle: ' + booted + ' (boot took ' + Math.round((Date.now() - t0) / 1000) + 's)');
  if (!booted) { console.log('BOOT FAIL'); await b.close(); process.exit(2); }

  const st = await p.evaluate(() => {
    const g = window.__game;
    const F = g.F || window.F;
    const place = (k) => { try { const v = (g.story && g.story.F) ? g.story.F[k] : null; return v ? { x: +v.x.toFixed(0), z: +v.z.toFixed(0) } : null; } catch { return null; } };
    return {
      playerPos: g.playerPos ? { x: +g.playerPos.x.toFixed(0), z: +g.playerPos.z.toFixed(0) } : null,
      mapVar: typeof window.__mapBounds !== 'undefined' ? window.__mapBounds : null,
      storyAttached: !!window.__story,
    };
  });
  log('state: ' + JSON.stringify(st));
  await p.click('button.nu-play', { timeout: 8000 }).catch(() => {});
  await p.waitForTimeout(12000);
  const pos = await p.evaluate(() => window.__game.playerPos ? { x: +window.__game.playerPos.x.toFixed(0), z: +window.__game.playerPos.z.toFixed(0) } : null).catch(() => null);
  log('player after play: ' + JSON.stringify(pos));
  try { await p.screenshot({ path: 'reference/story/shots/s7-boot.png', timeout: 20000 }); log('shot ok'); } catch { log('shot failed'); }
  console.log('errors:', errs.length ? errs.slice(0, 4).join(' | ') : 'none');
  await b.close();
  process.exit(booted && !errs.length ? 0 : 1);
})().catch((e) => { console.error('FATAL', e.message); process.exit(1); });
