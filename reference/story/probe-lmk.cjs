// intercept city.js to log landmark loop entries for fmTower kinds
const { chromium } = require('playwright-core');
(async () => {
  const b = await chromium.launch({ channel: 'msedge', headless: true });
  const p = await b.newPage();
  await p.route('**/vendor/city.js*', async (route) => {
    const res = await route.fetch();
    let body = await res.text();
    body = body.replace('a=Gn[e.kind];if(a){', 'a=Gn[e.kind];console.log("LMK",e.kind,JSON.stringify(e.x)+","+JSON.stringify(e.z),!!a,!!(a&&a.build));if(a){');
    await route.fulfill({ response: res, body });
  });
  const logs = [];
  p.on('console', (m) => { if (m.text().startsWith('LMK')) logs.push(m.text()); });
  await p.goto('http://localhost:5173/?view=city&hour=9&x=150&z=-400&y=60&yaw=3.6&pitch=-0.15', { waitUntil: 'commit', timeout: 30000 });
  await p.waitForFunction('window.__city !== undefined', null, { timeout: 180000 });
  const fm = logs.filter((l) => l.includes('fmTower'));
  console.log(fm.join('\n') || 'NO fmTower LMK logs');
  console.log('total LMK:', logs.length, '| sample:', logs.slice(0, 3).join(' ; '));
  await b.close();
})().catch((e) => console.error('FATAL', e.message));
