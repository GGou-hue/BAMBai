// S6 slice-8 probe: Act I cliffhanger fires on Ch5 -> 6 advance (headless msedge)
const { chromium } = require('playwright-core');
const URL = process.env.PROBE_URL || 'http://localhost:5174/';
const WHO = 'meera';
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

  // instrument the HUD so we can assert on real card/toast calls, not fade timing
  const fin = await p.evaluate(() => {
    const hud = window.__game.hud;
    window.__cards = [];
    window.__toasts = [];
    const oc = hud.chapterCard.bind(hud);
    const ot = hud.toast.bind(hud);
    hud.chapterCard = function (a, b, c) { window.__cards.push([a, b, c]); return oc(a, b, c); };
    hud.toast = function (t, ms) { window.__toasts.push(String(t)); return ot(t, ms); };
    const st = window.__storyState;
    const missions = window.__storyState.missionsFor('meera').filter((m) => m.chapter >= 1 && m.chapter <= 5);
    missions.sort((a, b) => a.chapter - b.chapter);
    for (const m of missions) st.completeMission(m.id);
    return { done: st.state.done.slice(), chapter: st.state.chapter, bulletins: st.state.bulletins.slice(), who: st.state.who };
  });
  log('missions completed: ' + fin.done.length + ' -> chapter ' + fin.chapter);
  await p.waitForTimeout(5600); // Act I card (4.2s) + queued Ch6 card (queued at 4.7s)
  const res = await p.evaluate(() => ({
    chapter: window.__storyState.state.chapter,
    doneCount: window.__storyState.state.done.length,
    bulletins: window.__storyState.state.bulletins.slice(),
    vars: window.__storyState.state.vars,
    cards: window.__cards,
    toasts: window.__toasts,
  }));
  log('cards: ' + JSON.stringify(res.cards));
  log('toasts: ' + JSON.stringify(res.toasts));
  log('bulletins: ' + JSON.stringify(res.bulletins));
  try { await p.screenshot({ path: 'reference/story/shots/s8-act1-cliffhanger.png', fullPage: true }); } catch { }
  const endCard = res.cards.some((c) => c[0] === 'End of Act I' && c[1] === 'The First Body' && /much larger discovery/.test(c[2] || ''));
  const ch6Card = res.cards.some((c) => c[0] === 'Chapter 6');
  const act1Toast = res.toasts.some((t) => /Act I complete/.test(t));
  const ok = res.chapter === 6 && endCard && ch6Card && act1Toast && res.bulletins.length > 0;
  log('S8 ' + (ok ? 'PASS' : 'FAIL') + ' — Act I cliffhanger (chapter=' + res.chapter + ' endCard=' + endCard + ' ch6=' + ch6Card + ' toast=' + act1Toast + ' bulletins=' + res.bulletins.length + ')');
  console.log('errors:', errs.length ? errs.join(' | ') : 'none');
  await b.close();
  process.exit(ok && !errs.length ? 0 : 1);
})().catch((e) => { console.error('FATAL', e.message); process.exit(1); });
