// head-on shots: camera due south of each tower, yaw=0
const { chromium } = require('playwright-core');
(async () => {
  const b = await chromium.launch({ channel: 'msedge', headless: true });
  const p = await b.newPage({ viewport: { width: 1280, height: 720 } });
  p.on('pageerror', (e) => console.log('PAGEERROR:', String(e).slice(0, 120)));
  const shots = [
    { f: 'reference/story/shots/s1-mother-front.png', x: -399.6, z: -1065.6 + 130, yaw: 0, pitch: 0.45, y: 3 },
    { f: 'reference/story/shots/s1-koli-front.png', x: 417.5, z: -935 + 90, yaw: 0, pitch: 0.35, y: 3 },
  ];
  for (const s of shots) {
    await p.goto(`http://localhost:5173/?view=city&hour=9&x=${s.x}&z=${s.z}&y=${s.y}&yaw=${s.yaw}&pitch=${s.pitch}`, { waitUntil: 'commit', timeout: 30000 });
    await p.addStyleTag({ content: '#ui,#boot,#hud{display:none!important}' }).catch(() => {});
    await p.waitForFunction('window.__city !== undefined', null, { timeout: 180000 });
    await p.waitForTimeout(2500);
    let ok = false;
    for (let a = 0; a < 3 && !ok; a++) {
      try { await p.screenshot({ path: s.f, timeout: 15000 }); ok = true; console.log('shot ok:', s.f); } catch (e) { console.log('shot retry', a, s.f); await p.waitForTimeout(2000); }
    }
  }
  await b.close();
})().catch((e) => console.error('FATAL', e.message));
