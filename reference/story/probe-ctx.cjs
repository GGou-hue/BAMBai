// intercept landmarks.js to instrument fmMotherBuild ctx
const { chromium } = require('playwright-core');
(async () => {
  const b = await chromium.launch({ channel: 'msedge', headless: true });
  const p = await b.newPage();
  await p.route('**/vendor/landmarks.js*', async (route) => {
    const res = await route.fetch();
    let body = await res.text();
    body = body.replace(
      'function fmMotherBuild({b:e},t){O();',
      'function fmMotherBuild(x,t){var e=x.b;console.log("FMCTX keys:",Object.keys(x).join(","),"b type:",typeof e,"box:",e&&typeof e.box,"cyl:",e&&typeof e.cyl,"at:",e&&typeof e.at,"t keys:",t?Object.keys(t).join(","):"null");O();'
    );
    await route.fulfill({ response: res, body });
  });
  const logs = [];
  p.on('console', (m) => { if (m.text().startsWith('FMCTX')) logs.push(m.text()); });
  p.on('pageerror', (e) => logs.push('PAGEERROR ' + String(e).slice(0, 200)));
  await p.goto('http://localhost:5173/?view=city&hour=9&x=150&z=-400&y=60&yaw=3.6&pitch=-0.15', { waitUntil: 'commit', timeout: 30000 });
  await p.waitForFunction('window.__city !== undefined', null, { timeout: 180000 });
  console.log(logs.join('\n') || 'no FMCTX logs');
  await b.close();
})().catch((e) => console.error('FATAL', e.message));
