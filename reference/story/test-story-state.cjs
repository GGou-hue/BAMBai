// S3 unit test (in-page): story-state machine against a fake game handle
const { chromium } = require('playwright-core');
(async () => {
  const b = await chromium.launch({ channel: 'msedge', headless: true });
  const p = await b.newPage();
  p.on('pageerror', (e) => console.log('PAGEERROR:', String(e).slice(0, 150)));
  await p.goto('http://localhost:5173/?story=1', { waitUntil: 'commit', timeout: 30000 });
  await p.waitForFunction('window.__story !== undefined', null, { timeout: 60000 });
  const result = await p.evaluate(async () => {
    const { default: storyState } = await import('/vendor/story-state.js');
    const log = [];
    const fail = (m) => { throw new Error('FAIL: ' + m); };
    const saved = {};
    const game = {
      story: { save: {}, persist() { saved.snap = JSON.parse(JSON.stringify(game.story.save.storyExt)); } },
      hud: { toast: (t) => { saved.toast = t; } },
    };
    storyState.attach(game, 'meera');
    const st = storyState.state;
    if (st.who !== 'meera' || st.chapter !== 1) fail('fresh state wrong');
    const nx = storyState.next();
    if (!nx || !nx.paths.includes('meera')) fail('next() not a meera mission');
    log.push('next for meera: ' + nx.id + ' (ch' + nx.chapter + ')');
    let r = storyState.onEngineMission('arrival');
    if (r.mapped) fail('arrival should be unmapped');
    if (!st.engineDone.includes('arrival')) fail('engineDone missing arrival');
    r = storyState.onEngineMission('press-matter');
    if (!r.mapped) fail('press-matter should map');
    if (!st.done.includes('press-matter')) fail('press-matter not done');
    storyState.addEvidence('cctv-clip', 'Overwritten CCTV clip', 'body-at-backbay');
    if (st.vars.evidence !== 5) fail('evidence var should be 5');
    storyState.bump('trust', 30);
    storyState.bump('trust', 200);
    if (st.vars.trust !== 100) fail('trust cap broken');
    if (storyState.addEvidence('cctv-clip', 'dup', null) !== false) fail('duplicate evidence accepted');
    const e = storyState.ending();
    log.push('ending calc: ' + JSON.stringify(e));
    if (e.id !== 'the-paper') fail('ending should be the-paper (trust=100 highest), got ' + e.id);
    storyState.bump('compromise', 12);
    if (game.story.save.storyExt?.vars?.compromise !== 12) fail('save.storyExt not updated');
    if (!saved.snap) fail('persist not called');
    const ch1 = storyState.chapterMissions(1);
    log.push('meera ch1: ' + ch1.map((m) => m.id).join(' | '));
    for (const m of ch1) if (!st.done.includes(m.id)) storyState.completeMission(m.id);
    if (st.chapter !== 2) fail('chapter should advance to 2, got ' + st.chapter);
    if (!saved.toast) fail('bulletin toast not fired');
    log.push('toast: ' + saved.toast);
    const game2 = { story: { save: { storyExt: JSON.parse(JSON.stringify(game.story.save.storyExt)) }, persist() { } } };
    storyState.attach(game2, undefined);
    if (storyState.state.chapter !== 2 || storyState.state.who !== 'meera') fail('restore lost state');
    return { ok: true, log };
  });
  console.log(result.log.join('\n'));
  console.log(result.ok ? 'OK: story-state unit tests pass (in-page)' : 'FAILED');
  await b.close();
  process.exit(result.ok ? 0 : 1);
})().catch((e) => { console.error('FATAL', e.message); process.exit(1); });
