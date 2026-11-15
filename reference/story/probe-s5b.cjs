// S5b: in-game monsoon visual — boot, play, screenshot in the rain
const { chromium } = require('playwright-core');
(async () => {
  const b = await chromium.launch({ channel: 'msedge', headless: true });
  const p = await b.newPage({ viewport: { width: 1280, height: 720 } });
  const errs = [];
  p.on('pageerror', (e) => errs.push(String(e).slice(0, 160)));
  await p.goto('http://localhost:5173/?season=monsoon&hour=15', { waitUntil: 'commit', timeout: 60000 });
  await p.waitForFunction('window.__game !== undefined', null, { timeout: 600000 });
  console.log('booted');
  await p.waitForTimeout(10000);
  await p.click('button.nu-play', { timeout: 5000 }).catch(() => {});
  await p.waitForTimeout(18000); // into the world, rain fully eased in
  const wx = await p.evaluate(() => {
    const w = window.__game.weather;
    return { rain: +w.rain.toFixed(2), wet: +w.wet.toFixed(2), streaksVisible: w.streaks.visible };
  });
  console.log('weather: ' + JSON.stringify(wx));
  try { await p.screenshot({ path: 'reference/story/shots/s5-monsoon-ingame.png', timeout: 15000 }); console.log('shot ok'); } catch (e) { console.log('shot fail ' + e.message.slice(0, 60)); }
  console.log('errors:', errs.length ? errs.join(' | ') : 'none');
  await b.close();
})().catch((e) => { console.error('FATAL', e.message); process.exit(1); });
