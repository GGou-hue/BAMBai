// verify audio.say() finds + plays a bulletin mp3 (exact textOriginal), no game boot needed
const { chromium } = require('playwright-core');
(async () => {
  const b = await chromium.launch({ channel: 'msedge', headless: true });
  const p = await b.newPage();
  const errs = [];
  p.on('pageerror', (e) => errs.push(String(e).slice(0, 120)));
  await p.goto('http://localhost:5173/?audio=1', { waitUntil: 'commit', timeout: 60000 });
  await p.waitForTimeout(4000); // modules served
  const res = await p.evaluate(async () => {
    try {
      const A = (await import('/vendor/audio.js')).t;
      A.unlock();
      await new Promise((r) => setTimeout(r, 1500));
      const dur = await A.say('bulletin-ch2-01', 'Ek chhota sa news, sun lo aur bhool jao — Retibandar creek mein ek watchman mila.');
      const idx = await (await fetch('./vo/index.json')).json();
      return { dur, idxCount: idx.length, hasCh2: idx.includes('bulletin-ch2-01-87djk3') };
    } catch (e) { return { err: e.message.slice(0, 100) }; }
  });
  console.log(JSON.stringify(res));
  console.log('errors:', errs.length ? errs.join(' | ') : 'none');
  await b.close();
  process.exit(res.dur > 0 ? 0 : 1);
})().catch((e) => { console.error('FATAL', e.message); process.exit(1); });
