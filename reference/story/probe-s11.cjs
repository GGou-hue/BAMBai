// S11 probe: verify req:'koli' gate on ch6 missions (peg-truck / night-net)
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
    // complete ch1-5 -> chapter 6
    const ms = st.missionsFor(st.state.who).filter((m) => m.chapter >= 1 && m.chapter <= 5);
    for (const m of ms) st.completeMission(m.id);
    const engine = window.__game;
    const offersAt6 = engine.story.sideOpen().map((m) => m.id).filter((id) => id === 'peg-truck' || id === 'night-net' || id === 'is-baar-night');
    const bonds0 = (engine.story.save.bonds ?? {}).Koli ?? 0;
    // play side-koli-myths via direct mission run? No — set bond the way the mission does:
    engine.story.bond('Koli', 3); // the five-visit mission calls this x3
    const offersAfter = engine.story.sideOpen().map((m) => m.id).filter((id) => id === 'peg-truck' || id === 'night-net');
    const bonds3 = (engine.story.save.bonds ?? {}).Koli ?? 0;
    return { chapter: st.state.chapter, offersAt6, bonds0, offersAfter, bonds3 };
  });
  log('result: ' + JSON.stringify(fin));
  const gateWorks = !fin.offersAt6.includes('peg-truck') && !fin.offersAt6.includes('night-net') && fin.bonds0 === 0 && fin.offersAfter.length === 2 && fin.bonds3 === 3;
  log('S11 ' + (gateWorks ? 'PASS' : 'FAIL') + ' — ch6 harbour missions gated on Koli bond (off@0, on@3)');
  console.log('errors:', errs.length ? errs.join(' | ') : 'none');
  await b.close();
  process.exit(gateWorks && !errs.length ? 0 : 1);
})().catch((e) => { console.error('FATAL', e.message); process.exit(1); });