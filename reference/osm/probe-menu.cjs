// boot full game, dump the menu DOM, click through to the world
const { chromium } = require('playwright-core');

(async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  page.on('pageerror', (e) => console.log('[pageerror]', e.message.slice(0, 200)));
  await page.goto('http://localhost:5173/?hour=9', { waitUntil: 'commit', timeout: 60000 });
  let has = false;
  for (let i = 0; i < 200; i++) {
    await page.waitForTimeout(3000);
    try { has = await page.evaluate(() => !!window.__game); } catch { has = false; }
    if (has) break;
  }
  console.log('game handle:', has);
  if (!has) { await browser.close(); process.exit(2); }
  await page.waitForTimeout(2000);
  const dom = await page.evaluate(() => {
    const els = [...document.querySelectorAll('button, .btn, [class*=menu] *, [class*=title] *, [class*=start] *')];
    return {
      clickable: els.filter(e => e.offsetParent).slice(0, 25).map(e => ({ tag: e.tagName, id: e.id, cls: String(e.className).slice(0, 40), txt: (e.innerText || '').slice(0, 40) })),
      overlayTop: [...document.querySelectorAll('#ui > *')].map(e => ({ id: e.id, cls: String(e.className).slice(0, 50), vis: !!e.offsetParent })),
    };
  });
  console.log(JSON.stringify(dom, null, 1).slice(0, 3000));
  await browser.close();
})().catch((e) => { console.error('FATAL', String(e).slice(0, 300)); process.exit(1); });
