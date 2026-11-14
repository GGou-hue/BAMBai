// instrument fmKoliBuild specifically
const { chromium } = require('playwright-core');
(async () => {
  const b = await chromium.launch({ channel: 'msedge', headless: true });
  const p = await b.newPage();
  await p.route('**/vendor/landmarks.js*', async (route) => {
    const res = await route.fetch();
    let body = await res.text();
    body = body.replace(
      'function fmKoliBuild({b:e},t){O();',
      'function fmKoliBuild(x,t){var e=x.b;console.log("KOLICTX",t.kind,t.x.toFixed(0),t.z.toFixed(0),"w",t.w,"d",t.d);O();'
    );
    body = body.replace(
      'return {w:3,d:3,h:40,col:FMG};}',
      'console.log("KOLI DONE");return {w:3,d:3,h:40,col:FMG};}'
    );
    await route.fulfill({ response: res, body });
  });
  const logs = [];
  p.on('console', (m) => { if (m.text().startsWith('KOLI')) logs.push(m.text()); });
  p.on('pageerror', (e) => logs.push('PAGEERROR ' + String(e).slice(0, 200)));
  await p.goto('http://localhost:5173/?view=city&hour=9&x=150&z=-400&y=60&yaw=3.6&pitch=-0.15', { waitUntil: 'commit', timeout: 30000 });
  await p.waitForFunction('window.__city !== undefined', null, { timeout: 180000 });
  console.log(logs.join('\n') || 'no KOLI logs');
  await b.close();
})().catch((e) => console.error('FATAL', e.message));
