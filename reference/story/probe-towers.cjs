// S1 probe: verify fm towers registered + render, screenshot both
const { chromium } = require('playwright-core');
(async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  const errs = [];
  page.on('pageerror', (e) => errs.push(String(e).slice(0, 120)));
  // view from spawn toward the Mother Tower (north-west, x -369 z -1050)
  await page.goto('http://localhost:5173/?view=city&hour=9&x=150&z=-400&y=60&yaw=3.6&pitch=-0.15', { waitUntil: 'commit', timeout: 30000 });
  await page.waitForFunction('window.__city !== undefined', null, { timeout: 150000 });
  const info = await page.evaluate(() => {
    const c = window.__city;
    const Z = c.map?.PLACES ? c.map : c.map; // debug handle shape may vary
    const landmarks = (c.map?.landmarks || []).filter((l) => /^fmTower/.test(l.kind));
    return { landmarks: landmarks.map((l) => ({ kind: l.kind, x: l.x, z: l.z, w: l.w, d: l.d })), keys: Object.keys(c).slice(0, 12) };
  });
  console.log('fmTower landmarks:', JSON.stringify(info.landmarks));
  try {
    await page.screenshot({ path: 'reference/story/shots/s1-mother-from-spawn.png', timeout: 8000 });
    console.log('shot 1 ok');
  } catch (e) { console.log('shot 1 failed:', String(e).slice(0, 80)); }
  // close-up of the Mother Tower
  await page.goto('http://localhost:5173/?view=city&hour=9&x=-300&z=-950&y=18&yaw=4.2&pitch=0.12', { waitUntil: 'commit', timeout: 30000 });
  await page.waitForFunction('window.__city !== undefined', null, { timeout: 150000 });
  await page.addStyleTag({ content: '#ui,#boot,#hud{display:none!important}' });
  try {
    await page.screenshot({ path: 'reference/story/shots/s1-mother-closeup.png', timeout: 8000 });
    console.log('shot 2 ok');
  } catch (e) { console.log('shot 2 failed:', String(e).slice(0, 80)); }
  // Koliwada mast close-up
  await page.goto('http://localhost:5173/?view=city&hour=9&x=380&z=-880&y=14&yaw=0.6&pitch=0.1', { waitUntil: 'commit', timeout: 30000 });
  await page.waitForFunction('window.__city !== undefined', null, { timeout: 150000 });
  await page.addStyleTag({ content: '#ui,#boot,#hud{display:none!important}' });
  try {
    await page.screenshot({ path: 'reference/story/shots/s1-koliwada-closeup.png', timeout: 8000 });
    console.log('shot 3 ok');
  } catch (e) { console.log('shot 3 failed:', String(e).slice(0, 80)); }
  console.log('errors:', errs.length ? errs.join(' | ') : 'none');
  await browser.close();
  process.exit(errs.length ? 1 : 0);
})().catch((e) => { console.error('FATAL', e.message); process.exit(1); });
