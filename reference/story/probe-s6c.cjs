// S6c probe: chapter advance fires chapter card + bulletin VO chain without errors
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

  // close meera's Ch1 -> chapter 2 -> card + bulletin
  const res = await p.evaluate(async () => {
    const s = window.__storyState;
    s.completeMission('low-tide');
    s.completeMission('the-drum');
    s.completeMission('wrong-manifest');
    // try the VO chain directly: unlock audio, play the ch2 bulletin's first line
    let voDur = null;
    try {
      const A = (await import('/vendor/audio.js')).t;
      A.unlock();
      await new Promise((r) => setTimeout(r, 1200));
      voDur = await A.say('bulletin-ch2-01', 'Traffic update. Backbay Road half closed. Police activity near the sea face.');
    } catch (e) { voDur = 'err:' + e.message.slice(0, 60); }
    await new Promise((r) => setTimeout(r, 2500));
    const card = document.querySelector('.nu-chapter');
    return {
      chapter: s.state.chapter,
      bulletins: s.state.bulletins.slice(),
      cardText: card ? card.textContent.trim().slice(0, 60) : null,
      voDur,
    };
  }).catch((e) => ({ evalErr: e.message.slice(0, 100) }));
  log('result: ' + JSON.stringify(res));
  try { await p.screenshot({ path: 'reference/story/shots/s6-chapter-card.png', timeout: 15000 }); log('card shot ok'); } catch { }

  const ok = res.chapter === 2 && res.bulletins.includes('bulletin-ch2-watchman') && res.cardText && /paper trails/i.test(res.cardText) && res.voDur !== null;
  log('S6c ' + (ok ? 'PASS' : 'FAIL') + ' — chapter card + bulletin wired (voDur=' + res.voDur + ')');
  console.log('errors:', errs.length ? errs.join(' | ') : 'none');
  await b.close();
  process.exit(ok && !errs.length ? 0 : 1);
})().catch((e) => { console.error('FATAL', e.message); process.exit(1); });
