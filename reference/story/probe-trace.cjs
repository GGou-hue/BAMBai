// intercept main.js to trace line 97 execution
const { chromium } = require('playwright-core');
(async () => {
  const b = await chromium.launch({ channel: 'msedge', headless: true });
  const p = await b.newPage();
  await p.route('**/src/main.js*', async (route) => {
    const res = await route.fetch();
    let body = await res.text();
    body = body.replace(
      'if (window.__who) showPrologue()',
      'console.log("[TRACE] line97 reached, __who=", window.__who, "typeof showPrologue:", typeof showPrologue);if (window.__who) showPrologue()'
    );
    await route.fulfill({ response: res, body });
  });
  p.on('console', (m) => { if (m.text().includes('[TRACE]') || m.text().includes('[story]')) console.log('CON:', m.text().slice(0, 160)); });
  await p.goto('http://localhost:5173/?who=meera', { waitUntil: 'commit', timeout: 30000 });
  await p.waitForFunction('window.__game !== undefined', null, { timeout: 600000 });
  await p.waitForTimeout(6000);
  await b.close();
})().catch((e) => console.error('FATAL', e.message));
