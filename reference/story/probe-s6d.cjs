// S6d probe: chapter-cascade — pre-complete ch1-3, PLAY harbour-freight, expect chapter 5
const { chromium } = require('playwright-core');
const MID = 'harbour-freight';
const TP = { ledger: 'tankerDepot', drum: 'tankerDepot', boatman: 'lakeBund', 'freight': 'tankerDepot' };
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
  await p.waitForFunction('window.__storyState !== undefined', null, { timeout: 30000 }).catch(() => {});
  await p.waitForTimeout(8000);
  await p.evaluate(() => window.__tp && window.__tp('pg')).catch(() => {});
  for (let i = 0; i < 30; i++) {
    await p.waitForTimeout(2000);
    await p.keyboard.press('Space').catch(() => {});
    await p.mouse.click(640, 600).catch(() => {});
    const cur = await p.evaluate(() => ({ cur: window.__story.current ? 1 : 0 })).catch(() => null);
    if (cur && !cur.cur) break;
  }

  // pre-complete ch1-ch3 so harbour-freight's completion cascades ch4 -> ch5
  const pre = await p.evaluate(() => {
    const s = window.__storyState;
    for (const id of ['low-tide', 'the-drum', 'wrong-manifest', 'the-copy', 'notice-period', 'eleven-tonight', 'press-matter', 'peg-man', 'bai-firoz']) s.completeMission(id);
    s.persist();
    return { chapter: s.state.chapter, done: s.state.done.length };
  });
  log('pre-complete: chapter=' + pre.chapter + ' done=' + pre.done);

  await p.evaluate((mid) => {
    const m = window.__story.sideOpen().find((e) => e.id === mid);
    window.__storyState.startMission(mid);
    window.__story.run(m);
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
      const s = window.__storyState;
      const obj = (document.querySelector('.nu-obj, .nu-objective, .nu-hint') || {}).textContent || '';
      return { done: s ? s.state.done.slice() : [], obj: obj.trim().slice(0, 80), current: window.__story.current ? 'running' : null };
    }).catch(() => null);
    if (!st) continue;
    if (!shotTaken && st.current) {
      try { await p.screenshot({ path: 'reference/story/shots/s6-harbour-freight-mid.png', timeout: 15000 }); shotTaken = true; log('mid-mission shot ok'); } catch { }
    }
    const low = st.obj.toLowerCase();
    for (const [k, v] of Object.entries(TP)) {
      if (low.includes(k)) { await p.evaluate((place) => window.__tp && window.__tp(place), v).catch(() => {}); break; }
    }
    if (st.done.includes(MID)) { log('MISSION COMPLETE — ' + MID); break; }
    if (i === 89) log('did not complete; last obj: ' + st.obj);
  }

  const fin = await p.evaluate(() => {
    const s = window.__storyState;
    return {
      chapter: s.state.chapter,
      bulletins: s.state.bulletins.slice(),
      done: s.state.done.length,
      evidence: s.state.evidence.map((e) => e.id),
      next: s.next()?.id ?? null,
      persisted: !!window.__story.save.storyExt,
    };
  }).catch((e) => ({ evalErr: e.message.slice(0, 100) }));
  log('final: ' + JSON.stringify(fin));
  const ok = fin.chapter === 5 && fin.bulletins.length >= 4 && fin.evidence.includes('freight-ledger');
  log('S6d ' + (ok ? 'PASS' : 'FAIL') + ' — harbour-freight completed, cascade to ch' + fin.chapter);
  console.log('errors:', errs.length ? errs.join(' | ') : 'none');
  await b.close();
  process.exit(ok && !errs.length ? 0 : 1);
})().catch((e) => { console.error('FATAL', e.message); process.exit(1); });
