// quick check: vehicle viewer with ?kind=decker — builds + no decker.glb 404
const { chromium } = require('playwright-core');
(async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  const errs = [];
  page.on('pageerror', (e) => errs.push('[pageerror] ' + e.message.slice(0, 200)));
  page.on('response', (r) => { if (r.status() === 404) errs.push('[404] ' + r.url().slice(0, 140)); });
  await page.goto('http://localhost:5173/view?kind=decker&hour=9', { waitUntil: 'commit', timeout: 60000 });
  await page.waitForTimeout(20000);
  console.log('errors:', errs.length ? '\n' + errs.join('\n') : 'none');
  try { await page.screenshot({ path: 'shots/decker-view.png', timeout: 8000 }); } catch (e) { console.log('[screenshot skipped]', e.message.slice(0, 80)); }
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
