// Boot-diagnostic: log every progress step, console message, pageerror and stall.
const { chromium } = require('playwright-core');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
(async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  const page = await browser.newPage({ viewport: { width: 1366, height: 636 } });
  const events = [];
  page.on('pageerror', (e) => events.push('[pageerror] ' + e.message.slice(0, 300)));
  page.on('console', (m) => events.push('[' + m.type() + '] ' + m.text().slice(0, 300)));
  page.on('requestfailed', (r) => events.push('[reqfail] ' + r.url().slice(-90) + ' :: ' + (r.failure()?.errorText ?? '')));
  page.on('response', (r) => { if (r.status() >= 400) events.push('[http ' + r.status() + '] ' + r.url().slice(-100)); });

  const t0 = Date.now();
  await page.goto('http://localhost:5173/', { waitUntil: 'load', timeout: 60000 });
  events.push('load event @' + ((Date.now() - t0) / 1000).toFixed(1) + 's');

  const prog = () => page.evaluate(() => {
    const bar = document.querySelector('#boot .boot-bar i, #boot progress, #boot .bar, .nu-loading-bar, .nu-load-progress');
    const txt = document.querySelector('#boot')?.textContent?.replace(/\s+/g, ' ').trim().slice(0, 160) ?? null;
    const nu = document.querySelector('.nu-loading')?.textContent?.replace(/\s+/g, ' ').trim().slice(0, 160) ?? null;
    return {
      bootVisible: !!document.querySelector('#boot') && getComputedStyle(document.querySelector('#boot')).display !== 'none',
      barWidth: bar ? getComputedStyle(bar).width : null,
      barTransform: bar ? getComputedStyle(bar).transform : null,
      bootText: txt, nuText: nu,
      ready: !!window.__ready, game: !!window.__game, boot: window.__boot ?? null,
    };
  });

  let last = '';
  let stallAt = null;
  for (let i = 0; i < 200; i++) {
    const p = await prog().catch((e) => ({ err: String(e).slice(0, 80) }));
    const key = JSON.stringify(p);
    if (key !== last) { console.log(((Date.now() - t0) / 1000).toFixed(1) + 's', key); last = key; }
    if (p.ready) { console.log('READY at', ((Date.now() - t0) / 1000).toFixed(1) + 's'); break; }
    if (!stallAt) stallAt = Date.now();
    await sleep(1000);
    if (Date.now() - stallAt > 120000) { console.log('!! NO PROGRESS FOR 45s'); break; }
  }
  await page.screenshot({ path: 'shots/boot-stall.png' });
  console.log('\n=== EVENTS ===');
  for (const e of events.slice(-80)) console.log(e);
  await browser.close();
})().catch((e) => { console.error('FATAL', e); process.exit(1); });
