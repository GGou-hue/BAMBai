// time the boot with a generous timeout
const { chromium } = require('playwright-core');
(async () => {
  const t0 = Date.now();
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  page.on('pageerror', (e) => { console.log('[pageerror]', e.message, '\n', e.stack); });
  await page.goto(process.argv[2] || 'http://localhost:5173/', { waitUntil: 'load' });
  try {
    await page.waitForSelector('#boot.done', { timeout: 240000 });
    console.log('boot done in', ((Date.now() - t0) / 1000).toFixed(1), 's');
    await page.waitForTimeout(3000);
    await page.screenshot({ path: process.argv[3] || 'shots/mum-boot-long.png' });
    console.log('saved', process.argv[3] || 'shots/mum-boot-long.png');
  } catch {
    console.log('boot STILL not done after 240s');
    await page.screenshot({ path: 'shots/mum-boot-stuck.png' });
  }
  await browser.close();
})();
