// S7 slice-3 probe: play Ch1-8 missions, verify chapter 9 advance + ACT 2 cards
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
    const oc = hud.chapterCard.bind(hud);
    hud.chapterCard = function (a, b, c) { window.__cards.push([a, b, c]); return oc(a, b, c); };
    const st = window.__storyState;
    const ms = st.missionsFor(st.state.who).filter((m) => m.chapter >= 1 && m.chapter <= 8);
    ms.sort((a, b) => a.chapter - b.chapter);
    for (const m of ms) st.completeMission(m.id);
    return { done: st.state.done.length, chapter: st.state.chapter, ch8Ids: ms.filter((m) => m.chapter === 8).map((m) => m.id) };
  });
  log('progress: ' + JSON.stringify(fin));
  await p.waitForTimeout(5600);
  const res = await p.evaluate(() => ({
    chapter: window.__storyState.state.chapter,
    cards: window.__cards,
  }));
  log('cards: ' + JSON.stringify(res.cards));
  try { await p.screenshot({ path: 'reference/story/shots/s9c-ch8-' + WHO + '.png', fullPage: true }); } catch { }
  const ch9Card = res.cards.some((c) => c[0] === 'Chapter 9');
  const ch8Card = res.cards.some((c) => c[0] === 'Chapter 8');
  const act2 = res.cards.filter((c) => /ACT 2/.test(c[2] || '')).length;
  const ok = fin.chapter === 9 && res.chapter === 9 && ch8Card && ch9Card && act2 >= 3 && fin.ch8Ids.length === 2;
  log('S9C ' + (ok ? 'PASS' : 'FAIL') + ' — ' + WHO + ' ch1-8 done -> chapter 9 (ch8card=' + ch8Card + ' ch9card=' + ch9Card + ' act2cards=' + act2 + ' ch8missions=' + fin.ch8Ids.length + ')');
  console.log('errors:', errs.length ? errs.join(' | ') : 'none');
  await b.close();
  process.exit(ok && !errs.length ? 0 : 1);
})().catch((e) => { console.error('FATAL', e.message); process.exit(1); });
