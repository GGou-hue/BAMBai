// S3 probe: full game boot -> __storyState attaches to the real save
const { chromium } = require('playwright-core');
(async () => {
  const b = await chromium.launch({ channel: 'msedge', headless: true });
  const p = await b.newPage({ viewport: { width: 1280, height: 720 } });
  const errs = [];
  p.on('pageerror', (e) => errs.push(String(e).slice(0, 150)));
  const logs = [];
  p.on('console', (m) => { if (m.text().includes('[storyState]')) logs.push(m.text()); });
  await p.goto('http://localhost:5173/?who=meera', { waitUntil: 'commit', timeout: 30000 });
  await p.waitForFunction('window.__game !== undefined', null, { timeout: 600000 });
  await p.waitForTimeout(15000);
  await p.click('button.nu-play', { timeout: 5000 }).catch(() => {});
  await p.waitForFunction('window.__storyState !== undefined', null, { timeout: 30000 }).catch(() => errs.push('storyState attach timeout'));
  await p.waitForTimeout(3000);
  const info = await p.evaluate(() => {
    const s = window.__storyState;
    if (!s) return { attached: false };
    return {
      attached: true,
      who: s.state.who,
      chapter: s.state.chapter,
      next: s.next()?.id ?? null,
      inSave: !!window.__game.story.save.storyExt,
      saveWho: window.__game.story.save.storyExt?.who ?? null,
      engineHook: typeof s.onEngineMission === 'function',
    };
  });
  console.log(JSON.stringify(info));
  console.log('logs:', logs.join(' | ') || 'none');
  console.log('errors:', errs.length ? errs.join(' | ') : 'none');
  await b.close();
  process.exit(info.attached && !errs.length ? 0 : 1);
})().catch((e) => { console.error('FATAL', e.message); process.exit(1); });
