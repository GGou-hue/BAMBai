// S9 probe: play Ch1-20 missions, verify chapter 21 advance + ending calculator
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
    const ms = st.missionsFor(st.state.who).filter((m) => m.chapter >= 1 && m.chapter <= 20);
    ms.sort((a, b) => a.chapter - b.chapter);
    for (const m of ms) st.completeMission(m.id);
    const ending = st.ending();
    return { done: st.state.done.length, chapter: st.state.chapter, ending, ch20Ids: ms.filter((m) => m.chapter === 20).map((m) => m.id) };
  });
  log('progress: ' + JSON.stringify(fin));
  await p.waitForTimeout(5600);
  const res = await p.evaluate(() => ({
    chapter: window.__storyState.state.chapter,
    cards: window.__cards,
  }));
  log('cards: ' + JSON.stringify(res.cards));
  try { await p.screenshot({ path: 'reference/story/shots/s9f-ch20-' + WHO + '.png', fullPage: true }); } catch { }
  const ch20Card = res.cards.some((c) => c[0] === 'Chapter 20');
  const ch16Card = res.cards.some((c) => c[0] === 'Chapter 16');
  const act4 = res.cards.some((c) => /ACT 4/.test(c[2] || ''));
  const endingCard = res.cards.some((c) => ['The Paper', 'The Badge', 'The Empire', 'The Rakshasa'].includes(c[0]));
  const ok = fin.chapter === 21 && res.chapter === 21 && ch16Card && ch20Card && act4 && fin.ch20Ids.length === 3 && !!fin.ending;
  log('S9F ' + (ok ? 'PASS' : 'FAIL') + ' — ' + WHO + ' ch1-20 done -> chapter 21 (ch16card=' + ch16Card + ' ch20card=' + ch20Card + ' act4=' + act4 + ' ch20missions=' + fin.ch20Ids.length + ' ending=' + fin.ending.id +  + ')');
  console.log('errors:', errs.length ? errs.join(' | ') : 'none');
  await b.close();
  process.exit(ok && !errs.length ? 0 : 1);
})().catch((e) => { console.error('FATAL', e.message); process.exit(1); });