const { chromium } = require('C:/Users/User4/Downloads/BAMBai/node_modules/playwright-core');
(async () => {
  const browser = await chromium.launch({
    channel: 'chrome',
    headless: true,
    args: ['--headless=new', '--disable-gpu', '--no-sandbox'],
  });
  const page = await browser.newPage();
  const bad = [];
  const good = [];
  page.on('console', (m) => {
    const t = m.type(); const s = m.text();
    if (t === 'error' || t === 'warning') bad.push(t + ': ' + s.slice(0, 300)); else good.push(t + ': ' + s.slice(0, 120));
  });
  page.on('requestfailed', (r) => bad.push('REQFAIL: ' + r.url() + ' :: ' + (r.failure() && r.failure().errorText)));
  page.on('requestfinished', () => {});
  page.on('response', (r) => { if (r.status() >= 400) bad.push('HTTP ' + r.status() + ': ' + r.url()); });
  page.on('pageerror', (e) => bad.push('PAGEERROR: ' + (e && e.message)));
  await page.goto('http://127.0.0.1:8485/', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(25000); // watch boot for 25s
  const state = await page.evaluate(() => ({
    fill: (document.getElementById('boot-fill') || {}).style ? document.getElementById('boot-fill').style.width : null,
    label: (document.getElementById('boot-label') || {}).textContent || null,
    bootDone: !!document.getElementById('boot') && document.getElementById('boot').classList.contains('done'),
    uiChildren: document.getElementById('ui') ? document.getElementById('ui').childElementCount : 0,
    game: !!window.__game,
  }));
  console.log('STATE ' + JSON.stringify(state));
  console.log('BAD_COUNT=' + bad.length);
  for (const b of bad.slice(0, 40)) console.log('BAD: ' + b);
  console.log('good messages tail:');
  for (const g of good.slice(-10)) console.log('GOOD: ' + g);
  await browser.close();
  process.exit(0);
})().catch((e) => { console.error('DRIVERFAIL ' + (e && e.message)); process.exit(1); });
