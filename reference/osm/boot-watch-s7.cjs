// long-window boot watcher: logs #boot text + console errors every 60s for 40 min
const { chromium } = require('playwright-core');
(async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  page.on('pageerror', (e) => console.log('[pageerror]', String(e).slice(0, 200)));
  page.on('console', (m) => { if (m.type() === 'error') console.log('[console-err]', m.text().slice(0, 200)); });
  await page.goto('http://localhost:5173/?story=1', { waitUntil: 'commit', timeout: 60000 });
  const t0 = Date.now();
  for (let i = 0; i < 40; i++) {
    await page.waitForTimeout(60000);
    const txt = await page.evaluate(() => document.querySelector('#boot')?.innerText?.slice(0, 120) ?? 'no #boot').catch(() => 'eval-fail');
    const has = await page.evaluate(() => !!window.__game).catch(() => false);
    console.log(Math.round((Date.now() - t0) / 1000) + 's boot=' + JSON.stringify(txt) + ' game=' + has);
    if (has) break;
  }
  await browser.close();
})().catch((e) => { console.error('FATAL', e.message); process.exit(1); });
