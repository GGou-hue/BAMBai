// S4x probe: boot as <who>, verify offer gating, play <mission> to completion
// usage: node probe-s4x.cjs aarav body-at-backbay   (TP map auto-derived)
const { chromium } = require('playwright-core');
const WHO = process.argv[2] || 'meera';
const MID = process.argv[3] || 'low-tide';
const TP = { 'survey mark': 'surveyPegs', pillar: 'surveyPegs', boatman: 'lakeBund', 'crime scene': 'lakeBund', 'counter log': 'xeroxShop', copier: 'xeroxShop' };
(async () => {
  const b = await chromium.launch({ channel: 'msedge', headless: true });
  const p = await b.newPage({ viewport: { width: 1280, height: 720 } });
  const errs = [];
  p.on('pageerror', (e) => errs.push(String(e).slice(0, 160)));
  const t0 = Date.now();
  const log = (s) => console.log('[' + Math.round((Date.now() - t0) / 1000) + 's] ' + s);

  await p.goto('http://localhost:5173/?who=' + WHO, { waitUntil: 'commit', timeout: 60000 });
  await p.waitForFunction('window.__game !== undefined', null, { timeout: 600000 });
  log('game booted as ' + WHO);
  await p.waitForTimeout(15000);
  await p.click('button.nu-play', { timeout: 5000 }).catch(() => {});
  log('clicked play');
  await p.waitForFunction('window.__storyState !== undefined', null, { timeout: 30000 }).catch(() => {});
  await p.waitForTimeout(8000);
  await p.evaluate(() => window.__tp && window.__tp('pg')).catch(() => {});
  for (let i = 0; i < 30; i++) {
    await p.waitForTimeout(2000);
    await p.keyboard.press('Space').catch(() => {});
    await p.mouse.click(640, 600).catch(() => {});
    const cur = await p.evaluate(() => ({ cur: window.__story.current ? 1 : 0, next: window.__story.save.next })).catch(() => null);
    if (cur && !cur.cur && cur.next >= 1) { log('arrival complete, save.next=' + cur.next); break; }
  }

  const gate = await p.evaluate(() => ({
    who: window.__who,
    next: window.__story.save.next,
    sideOpen: window.__story.sideOpen().map((e) => e.id),
  }));
  log('gate: ' + JSON.stringify(gate));
  const others = { meera: 'body-at-backbay', aarav: 'low-tide', naina: 'low-tide' }[WHO];
  const gateOk = gate.sideOpen.includes(MID) && (!others || !gate.sideOpen.includes(others));
  log('GATE ' + (gateOk ? 'PASS' : 'FAIL') + ' — ' + WHO + ' offered ' + MID + ' only');

  await p.evaluate((mid) => {
    const m = window.__story.sideOpen().find((e) => e.id === mid);
    window.__storyState.startMission(mid);
    window.__story.run(m); // normal path — replay flag would skip completion recording
  }, MID);
  log(MID + ' started');
  await p.waitForTimeout(6000);

  let shotTaken = false;
  for (let i = 0; i < 90; i++) {
    await p.waitForTimeout(1500);
    await p.keyboard.press('Space').catch(() => {});
    await p.mouse.click(640, 600).catch(() => {});
    await p.evaluate(() => {
      const c = document.querySelector('.nu-choice:not(.picked)');
      if (c) { const btn = c.querySelector('button, [data-a], .nu-opt') || c; btn.click(); }
    }).catch(() => {});
    const st = await p.evaluate(() => {
      const g = window.__game, s = window.__storyState;
      const obj = (document.querySelector('.nu-obj, .nu-objective, .nu-hint') || {}).textContent || '';
      return {
        done: s ? s.state.done.slice() : [],
        obj: obj.trim().slice(0, 80),
        current: g.story.current ? 'running' : null,
      };
    }).catch(() => null);
    if (!st) continue;
    if (!shotTaken && st.current) {
      try { await p.screenshot({ path: 'reference/story/shots/s4-' + MID + '-mid.png', timeout: 15000 }); shotTaken = true; log('mid-mission shot ok'); } catch { }
    }
    const low = st.obj.toLowerCase();
    for (const [k, v] of Object.entries(TP)) {
      if (low.includes(k)) {
        await p.evaluate((place) => window.__tp && window.__tp(place), v).catch(() => {});
        break;
      }
    }
    if (st.done.includes(MID)) { log('MISSION COMPLETE — ' + MID + ' in done[]'); break; }
    if (i === 89) log('mission did not complete in time; last obj: ' + st.obj);
  }

  const fin = await p.evaluate(() => {
    const s = window.__storyState;
    return {
      done: s?.state?.done ?? [],
      evidence: s?.state?.evidence ?? [],
      vars: s?.state?.vars ?? null,
      side: window.__story.save.side,
      chapter: s?.state?.chapter,
      next: s?.next()?.id ?? null,
    };
  }).catch((e) => ({ evalErr: e.message.slice(0, 100) }));
  log('final: ' + JSON.stringify(fin));
  const ok = gateOk && fin.done && fin.done.includes(MID);
  log('S4x(' + WHO + '/' + MID + ') ' + (ok ? 'PASS' : 'FAIL'));
  console.log('errors:', errs.length ? errs.join(' | ') : 'none');
  await b.close();
  process.exit(ok && !errs.length ? 0 : 1);
})().catch((e) => { console.error('FATAL', e.message); process.exit(1); });
