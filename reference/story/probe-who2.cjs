// debug: all console logs around boot + __who timeline
const { chromium } = require('playwright-core');
(async () => {
  const b = await chromium.launch({ channel: 'msedge', headless: true });
  const p = await b.newPage({ viewport: { width: 1280, height: 720 } });
  p.on('console', (m) => console.log('CON:', m.text().slice(0, 140)));
  p.on('pageerror', (e) => console.log('PAGEERROR:', String(e).slice(0, 140)));
  p.on('framenavigated', (f) => { if (f === p.mainFrame()) console.log('NAVIGATED:', f.url().slice(0, 90)); });
  await p.goto('http://localhost:5173/?who=meera', { waitUntil: 'commit', timeout: 30000 });
  await p.waitForFunction('window.__game !== undefined', null, { timeout: 600000 });
  console.log('WHO at __game:', await p.evaluate(() => window.__who));
  await p.waitForTimeout(9000);
  console.log('WHO +9s:', await p.evaluate(() => window.__who));
  console.log('overlay:', await p.evaluate(() => !!document.querySelector('div[style*="bottom:12%"]')));
  await b.close();
})().catch((e) => console.error('FATAL', e.message));
