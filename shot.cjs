// Screenshot harness: loads the game headlessly in Edge, waits for the boot to
// finish, captures PNGs at the requested hours.
// usage: node shot.cjs "out.png hour=9 yaw=2.2 x=120 z=120" ["out2.png ..."]
const { chromium } = require('playwright-core');

(async () => {
  const shots = process.argv.slice(2);
  if (!shots.length) { console.error('no shots given'); process.exit(1); }
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  page.on('console', (m) => { if (m.type() === 'error') console.log('[page error]', m.text()); });
  page.on('pageerror', (e) => console.log('[pageerror]', e.message));
  for (const spec of shots) {
    const [out, ...kv] = spec.split(/\s+/);
    const q = kv.map((s) => s.replace(/^/, '')).join('&');
    const url = `http://localhost:5173/?${q}`;
    await page.goto(url, { waitUntil: 'load' });
    try { await page.waitForSelector('#boot.done', { timeout: 300000 }); }
    catch { console.log('[warn] boot did not finish for', url); }
    await page.waitForTimeout(2500);
    await page.screenshot({ path: out });
    console.log('saved', out, '<-', url);
  }
  await browser.close();
})().catch((e) => { console.error(e); process.exit(1); });
