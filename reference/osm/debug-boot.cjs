// debug boot: print full pageerror stack
const { chromium } = require('playwright-core');
(async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  page.on('console', (m) => { if (m.type() === 'error') console.log('[console.error]', m.text()); });
  page.on('pageerror', (e) => { console.log('[pageerror]', e.message, '\n', e.stack); });
  await page.goto(process.argv[2] || 'http://localhost:5173/', { waitUntil: 'load' });
  await page.waitForTimeout(12000);
  await browser.close();
})();
