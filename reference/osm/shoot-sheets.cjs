// screenshot the 8 contact sheets via file://
const { chromium } = require('playwright-core');
const path = require('path');
const root = 'C:/Users/User4/Downloads/BAMBai';
(async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  const page = await browser.newPage({ viewport: { width: 2100, height: 1400 } });
  for (let s = 1; s <= 8; s++) {
    await page.goto('file:///' + root + '/sheet-k-' + s + '.html', { waitUntil: 'networkidle', timeout: 60000 });
    await page.waitForTimeout(1500);
    await page.screenshot({ path: root + '/reference/osm/sheets/sheet-k-' + s + '.png', fullPage: true, timeout: 20000 });
    console.log('sheet ' + s + ' done');
  }
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
