// screenshot mid-boot to see loading progress
const { chromium } = require('playwright-core');
(async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  page.on('pageerror', (e) => console.log('[pageerror]', e.message, '\n', e.stack));
  page.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warning') console.log('[console]', m.type(), m.text().slice(0, 200)); });
  await page.goto(process.argv[2] || 'http://localhost:5173/', { waitUntil: 'load' });
  for (const t of [20, 45, 90, 150]) {
    await page.waitForTimeout(t === 20 ? 20000 : (t - [20, 45, 90, 150][[20, 45, 90, 150].indexOf(t) - 1]) * 1000);
    await page.screenshot({ path: `shots/mum-progress-${t}s.png` });
    const txt = await page.evaluate(() => document.querySelector('#boot')?.innerText?.slice(0, 200) ?? 'no #boot');
    console.log(t + 's:', JSON.stringify(txt));
  }
  await browser.close();
})();
