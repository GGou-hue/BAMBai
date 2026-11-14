// S2 probe: boot full game with ?who=meera, verify player model + spawn + prologue overlay
const { chromium } = require('playwright-core');
(async () => {
  const b = await chromium.launch({ channel: 'msedge', headless: true });
  const p = await b.newPage({ viewport: { width: 1280, height: 720 } });
  const errs = [];
  p.on('pageerror', (e) => errs.push(String(e).slice(0, 150)));
  const logs = [];
  p.on('console', (m) => { if (m.text().includes('[story]')) logs.push(m.text()); });
  await p.goto('http://localhost:5173/?who=meera', { waitUntil: 'commit', timeout: 30000 });
  await p.waitForFunction('window.__game !== undefined', null, { timeout: 600000 });
  await p.waitForTimeout(15000);
  await p.click('button.nu-play', { timeout: 5000 }).catch(() => {}); // title menu: start() resolves only after play
  await p.waitForTimeout(4000); // overlay lives 9s — check while it's up
  const info = await p.evaluate(() => {
    const g = window.__game;
    const pos = g.player?.position ?? g.player?.rig?.root?.position;
    return {
      who: window.__who,
      playerName: g.player?.name ?? null,
      pos: pos ? { x: +pos.x.toFixed(1), z: +pos.z.toFixed(1) } : null,
      overlayShown: !!document.querySelector('div[style*="bottom:12%"]'),
      overlayText: (document.querySelector('div[style*="bottom:12%"]')?.textContent || '').slice(0, 120),
    };
  });
  console.log(JSON.stringify(info, null, 1));
  for (let a = 0; a < 3; a++) { try { await p.screenshot({ path: 'reference/story/shots/s2-meera-boot.png', timeout: 15000 }); console.log('shot ok'); break; } catch (e) { console.log('shot retry', a); } }
  console.log('story logs:', logs.join(' | ') || 'none');
  console.log('errors:', errs.length ? errs.join(' | ') : 'none');
  await b.close();
  process.exit(errs.length ? 1 : 0);
})().catch((e) => { console.error('FATAL', e.message); process.exit(1); });
