// shoot one html file to png
const { chromium } = require('playwright-core');
const root = 'C:/Users/User4/Downloads/BAMBai';
const src = process.argv[2] || 'reference/osm/sheet-patched.html';
const out = process.argv[3] || 'reference/osm/sheets/sheet-patched.png';
(async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  const page = await browser.newPage({ viewport: { width: 2100, height: 1400 } });
  await page.goto('file:///' + root + '/' + src, { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: root + '/' + out, fullPage: true, timeout: 20000 });
  console.log('shot', out);
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
