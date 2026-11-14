// decode-verify the regenerated WAVs through the browser's decodeAudioData
const { chromium } = require('playwright-core');
(async () => {
  const b = await chromium.launch({ channel: 'msedge', headless: true });
  const p = await b.newPage();
  await p.goto('http://localhost:5173/', { waitUntil: 'domcontentloaded' });
  const files = ['radio-1-1', 'radio-8-1', 'whitefield-2', 'goon-11-1', 'delhi-2', 'tamil-3',
    'ident-kempu-1', 'ident-hale-2', 'ident-silkboard-3', 'rj-kempu-cricket-1',
    'rj-silkboard-orr-1', 'rj-hale-coffee-1', 'ad-sites-1'];
  const res = await p.evaluate(async (files) => {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const out = [];
    for (const f of files) {
      try {
        const r = await fetch(`audio/street/${f}.wav`);
        const buf = await r.arrayBuffer();
        const ab = await ctx.decodeAudioData(buf);
        out.push(`${f}: OK ${ab.duration.toFixed(1)}s ${ab.sampleRate}Hz ch${ab.numberOfChannels}`);
      } catch (e) { out.push(`${f}: FAIL ${e.message}`); }
    }
    return out;
  }, files);
  console.log(res.join('\n'));
  await b.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
