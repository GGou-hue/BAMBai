// End-to-end user path: cold boot -> title screen -> Continue -> in-game.
const { chromium } = require('playwright-core');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const log = (...a) => console.log(...a);

(async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  const page = await browser.newPage({ viewport: { width: 1366, height: 636 } });
  const errors = [];
  page.on('pageerror', (e) => errors.push('[pageerror] ' + e.message.slice(0, 220)));
  page.on('console', (m) => { if (m.type() === 'error') errors.push('[console] ' + m.text().slice(0, 180)); });
  page.on('response', (r) => { if (r.status() >= 400) errors.push('[http ' + r.status() + '] ' + r.url().slice(-80)); });
  await page.addInitScript(() => {
    try { localStorage.setItem('bambai.voice', '0'); } catch {}
  });

  const t0 = Date.now();
  await page.goto('http://localhost:5173/', { waitUntil: 'load', timeout: 90000 });
  log('load event');

  // wait for the title menu (not __ready, which needs a mode choice)
  await page.waitForSelector('.nu-play[data-a=play]', { timeout: 180000 });
  log('title screen visible @' + ((Date.now() - t0) / 1000).toFixed(0) + 's');
  const label = (await page.locator('.nu-play[data-a=play]').textContent()).trim();
  log('play label:', JSON.stringify(label));

  await page.screenshot({ path: 'shots/loadfix-title.png' });
  await page.locator('.nu-play[data-a=play]').click();
  await page.waitForFunction(() => !!window.__ready, { timeout: 120000 });
  log('in game @' + ((Date.now() - t0) / 1000).toFixed(0) + 's');
  await sleep(6000);
  const st = await page.evaluate(() => ({
    ready: !!window.__ready, mission: window.__game?.story?.current?.id ?? null,
    next: window.__game?.story?.save?.next, money: window.__game?.money,
    fps: Math.round(1 / Math.max(window.__game?.lastDt ?? .016, .001)),
  }));
  log('state:', JSON.stringify(st));
  await page.screenshot({ path: 'shots/loadfix-ingame.png' });
  log('ERRORS:', errors.length ? errors.slice(0, 10).join('\n') : 'none');
  await browser.close();
})().catch((e) => { console.error('FATAL', e); process.exit(1); });
