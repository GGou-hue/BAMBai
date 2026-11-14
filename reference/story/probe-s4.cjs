// S4 probe: boot as meera, verify offer gating, then PLAY low-tide to completion
const { chromium } = require('playwright-core');
(async () => {
  const b = await chromium.launch({ channel: 'msedge', headless: true });
  const p = await b.newPage({ viewport: { width: 1280, height: 720 } });
  const errs = [];
  p.on('pageerror', (e) => errs.push(String(e).slice(0, 160)));
  const t0 = Date.now();
  const log = (s) => console.log('[' + Math.round((Date.now() - t0) / 1000) + 's] ' + s);

  await p.goto('http://localhost:5173/?who=meera', { waitUntil: 'commit', timeout: 60000 });
  await p.waitForFunction('window.__game !== undefined', null, { timeout: 600000 });
  log('game booted');
  await p.waitForTimeout(15000);
  await p.click('button.nu-play', { timeout: 5000 }).catch(() => {});
  log('clicked play');
  await p.waitForFunction('window.__storyState !== undefined', null, { timeout: 30000 }).catch(() => {});
  await p.waitForTimeout(8000); // arrival auto-mission starts
  // finish the auto 'arrival' mission by teleporting to the PG
  await p.evaluate(() => window.__tp && window.__tp('pg')).catch(() => {});
  for (let i = 0; i < 30; i++) {
    await p.waitForTimeout(2000);
    await p.keyboard.press('Space').catch(() => {});
    await p.mouse.click(640, 600).catch(() => {});
    const cur = await p.evaluate(() => ({ cur: window.__story.current ? 1 : 0, next: window.__story.save.next })).catch(() => null);
    if (cur && !cur.cur && cur.next >= 1) { log('arrival complete, save.next=' + cur.next); break; }
  }

  // 1) offer gating
  const gate = await p.evaluate(() => ({
    who: window.__who,
    next: window.__story.save.next,
    sideOpen: window.__story.sideOpen().map((e) => e.id),
  }));
  log('gate: ' + JSON.stringify(gate));
  const gateOk = gate.sideOpen.includes('low-tide') && !gate.sideOpen.includes('body-at-backbay');
  log('GATE ' + (gateOk ? 'PASS' : 'FAIL') + ' — meera offered low-tide only');

  // 2) run the mission directly (replay path)
  await p.evaluate(() => {
    const m = window.__story.sideOpen().find((e) => e.id === 'low-tide');
    window.__storyState.startMission('low-tide');
    window.__story.run(m); // NOT the replay flag — replayed missions don't record completion
  });
  log('low-tide started');
  await p.waitForTimeout(6000);

  // 3) driver loop: advance dialogue + teleport to objectives + pick choices
  const TP = { 'survey mark': 'surveyPegs', pillar: 'surveyPegs', boatman: 'lakeBund', 'crime scene': 'lakeBund' };
  let shotTaken = false;
  for (let i = 0; i < 90; i++) {
    await p.waitForTimeout(1500);
    // advance dialogue / keep going
    await p.keyboard.press('Space').catch(() => {});
    await p.mouse.click(640, 600).catch(() => {});
    // pick first choice if present
    await p.evaluate(() => {
      const c = document.querySelector('.nu-choice:not(.picked)');
      if (c) { const btn = c.querySelector('button, [data-a], .nu-opt') || c; btn.click(); }
    }).catch(() => {});
    const st = await p.evaluate(() => {
      const g = window.__game, s = window.__storyState;
      const obj = (document.querySelector('.nu-obj, .nu-objective, .nu-hint') || {}).textContent || '';
      const pos = g.playerPos;
      return {
        mission: s?.state?.active,
        done: s ? s.state.done.slice() : [],
        obj: obj.trim().slice(0, 80),
        pos: pos ? { x: +pos.x.toFixed(0), z: +pos.z.toFixed(0) } : null,
        current: g.story.current ? g.story.current.id ?? 'running' : null,
      };
    }).catch(() => null);
    if (!st) continue;
    if (!shotTaken && st.current) {
      try { await p.screenshot({ path: 'reference/story/shots/s4-low-tide-mid.png', timeout: 15000 }); shotTaken = true; log('mid-mission shot ok'); } catch { }
    }
    // teleport toward the objective
    const low = st.obj.toLowerCase();
    for (const [k, v] of Object.entries(TP)) {
      if (low.includes(k)) {
        await p.evaluate((place) => window.__tp && window.__tp(place), v).catch(() => {});
        break;
      }
    }
    if (st.done.includes('low-tide')) { log('MISSION COMPLETE — low-tide in done[]'); break; }
    if (i === 89) log('mission did not complete in time; last obj: ' + st.obj);
  }

  // 4) final verification
  const fin = await p.evaluate(() => {
    const s = window.__storyState;
    return {
      done: s?.state?.done ?? [],
      engineDone: s?.state?.engineDone ?? [],
      evidence: s?.state?.evidence ?? [],
      vars: s?.state?.vars ?? null,
      side: window.__story.save.side,
      chapter: s?.state?.chapter,
      next: s?.next()?.id ?? null,
    };
  }).catch((e) => ({ evalErr: e.message.slice(0, 100) }));
  log('final: ' + JSON.stringify(fin));
  const ok = gateOk && fin.done && fin.done.includes('low-tide');
  log('S4 ' + (ok ? 'PASS' : 'FAIL'));
  console.log('errors:', errs.length ? errs.join(' | ') : 'none');
  await b.close();
  process.exit(ok && !errs.length ? 0 : 1);
})().catch((e) => { console.error('FATAL', e.message); process.exit(1); });
