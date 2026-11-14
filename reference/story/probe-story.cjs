// S0 probe: boot ?story=1 and verify the story data layer handle
const { chromium } = require('playwright-core');
(async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  const page = await browser.newPage();
  const errs = [];
  page.on('pageerror', (e) => errs.push('pageerror: ' + String(e).slice(0, 150)));
  page.on('console', (m) => { if (m.text().includes('[story]')) console.log('LOG:', m.text()); });
  await page.goto('http://localhost:5173/?story=1&view=city&hour=9&x=150&z=144&y=40&yaw=1&pitch=-0.3', { waitUntil: 'commit', timeout: 30000 });
  let ok = true;
  try { await page.waitForFunction('window.__story !== undefined', null, { timeout: 120000 }); } catch { ok = false; errs.push('story hook timeout'); }
  if (ok) {
    const s = await page.evaluate(() => {
      const st = window.__story;
      return { v: st.version, p: st.protagonists.length, chapters: st.chapters.length, m: st.missions.length, endings: st.endings.length, stations: st.radio.stations.length, towers: st.radio.towers.length, sceneLines: st.sceneById['ch1-the-file']?.lines?.length, arjunAct1: st.missionsByProtagonist('arjun').filter((m) => m.act === 'act1').length };
    });
    console.log('story handle:', JSON.stringify(s));
  }
  console.log('errors:', errs.length ? errs.join(' | ') : 'none');
  await browser.close();
  process.exit(errs.length ? 1 : 0);
})().catch((e) => { console.error('FATAL', e.message); process.exit(1); });
