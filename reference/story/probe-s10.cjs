// S10 probe: side missions unlock at chapter 1+ and complete cleanly
const { chromium } = require('playwright-core');
const URL = process.env.PROBE_URL || 'http://localhost:5174/';
const WHO = process.env.WHO || 'arjun';
(async () => {
  const b = await chromium.launch({ channel: 'msedge', headless: true });
  const p = await b.newPage({ viewport: { width: 1280, height: 720 } });
  const errs = [];
  p.on('pageerror', (e) => errs.push(String(e).slice(0, 160)));
  p.on('console', (m) => { if (m.type() === 'error') errs.push('console: ' + m.text().slice(0, 160)); });
  const t0 = Date.now();
  const log = (s) => console.log('[' + Math.round((Date.now() - t0) / 1000) + 's] ' + s);
  await p.goto(URL + '?who=' + WHO, { waitUntil: 'commit', timeout: 60000 });
  await p.waitForFunction('window.__game !== undefined', null, { timeout: 600000 });
  log('game booted (who=' + WHO + ')');
  await p.click('button.nu-play', { timeout: 5000 }).catch(() => {});
  await p.waitForFunction('window.__storyState !== undefined', null, { timeout: 30000 }).catch(() => {});
  await p.waitForTimeout(3000);
  const fin = await p.evaluate(() => {
    const st = window.__storyState;
    const engine = window.__story;
    // complete ch1-4 so side-meter (unlock:4) also opens
    const ch = st.missionsFor(st.state.who).filter((m) => m.chapter >= 1 && m.chapter <= 4);
    for (const m of ch) st.completeMission(m.id);
    const offers = engine.sideOpen().map((m) => m.id);
    const side = offers.filter((id) => id.startsWith('side-'));
    for (const id of side) {
      const m = engine.sideOpen().find((x) => x.id === id);
      if (m) { st.startMission(id); st.completeMission(id); }
    }
    return { chapter: st.state.chapter, sideOffers: side, sideDone: side.length, done: st.state.done.length };
  });
  log('progress: ' + JSON.stringify(fin));
  await p.waitForTimeout(1500);
  const res = await p.evaluate(() => ({ chapter: window.__storyState.state.chapter, done: window.__storyState.state.done.slice() }));
  const expected = ['side-biscuit', 'side-guests', 'side-meter', 'side-potholes', 'side-five-hundred-pav', 'side-ward-chai', 'side-tag-six', 'side-month-end-math', 'side-koli-myths', 'side-bog-ride', 'side-match-fix', 'side-rooftops'];
  const got = expected.filter((id) => res.done.includes(id));
  const ok = got.length === 12 && res.chapter >= 2 && fin.sideOffers.length === 12;
  log('S10 ' + (ok ? 'PASS' : 'FAIL') + ' — ' + WHO + ' all 12 side missions offered and completed (' + got.length + '/12 done, chapter=' + res.chapter + ', offers=' + fin.sideOffers.length + ')');
  console.log('errors:', errs.length ? errs.join(' | ') : 'none');
  await b.close();
  process.exit(ok && !errs.length ? 0 : 1);
})().catch((e) => { console.error('FATAL', e.message); process.exit(1); });