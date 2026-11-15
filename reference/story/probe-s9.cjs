// S7 slice-1 probe: play Ch6 missions (peg-truck + night-net) for a who, verify chapter 7 advance
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
    const hud = window.__game.hud;
    window.__cards = [];
    window.__toasts = [];
    const oc = hud.chapterCard.bind(hud);
    const ot = hud.toast.bind(hud);
    hud.chapterCard = function (a, b, c) { window.__cards.push([a, b, c]); return oc(a, b, c); };
    hud.toast = function (t, ms) { window.__toasts.push(String(t)); return ot(t, ms); };
    const st = window.__storyState;
    // complete ch1-5 to reach chapter 6
    const pre = st.missionsFor(st.state.who).filter((m) => m.chapter >= 1 && m.chapter <= 5);
    pre.sort((a, b) => a.chapter - b.chapter);
    for (const m of pre) st.completeMission(m.id);
    const chAfterPre = st.state.chapter;
    // now play the two Ch6 missions
    const ch6 = st.missionsFor(st.state.who).filter((m) => m.chapter === 6);
    for (const m of ch6) st.completeMission(m.id);
    return {
      who: st.state.who,
      chAfterPre,
      preDone: pre.length,
      ch6Ids: ch6.map((m) => m.id),
      chapter: st.state.chapter,
      doneCount: st.state.done.length,
      evidence: st.state.evidence.map((e) => e.id),
      vars: st.state.vars,
    };
  });
  log('progress: ' + JSON.stringify(fin));
  await p.waitForTimeout(5600);
  const res = await p.evaluate(() => ({
    chapter: window.__storyState.state.chapter,
    cards: window.__cards,
    toasts: window.__toasts,
    offer: (window.__story.sideOpen() || []).map((m) => m.id),
  }));
  log('cards: ' + JSON.stringify(res.cards));
  log('side offers now: ' + JSON.stringify(res.offer));
  try { await p.screenshot({ path: 'reference/story/shots/s9-ch6-' + WHO + '.png', fullPage: true }); } catch { }
  const ch7Card = res.cards.some((c) => c[0] === 'Chapter 7');
  const act2Pill = res.cards.some((c) => /ACT 2/.test(c[2] || ''));
  const ok = fin.chAfterPre === 6 && res.chapter === 7 && ch7Card && act2Pill && fin.ch6Ids.length === 2;
  log('S9 ' + (ok ? 'PASS' : 'FAIL') + ' — ' + WHO + ' ch6 missions complete -> chapter 7 (chAfterPre=' + fin.chAfterPre + ' chapter=' + res.chapter + ' ch7card=' + ch7Card + ' act2pill=' + act2Pill + ' evidence=' + fin.evidence.length + ')');
  console.log('errors:', errs.length ? errs.join(' | ') : 'none');
  await b.close();
  process.exit(ok && !errs.length ? 0 : 1);
})().catch((e) => { console.error('FATAL', e.message); process.exit(1); });
