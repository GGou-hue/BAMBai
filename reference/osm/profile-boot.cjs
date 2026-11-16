// profile the boot: sample CPU 30s at t=+5min, dump top self-time functions
const { chromium } = require('playwright-core');
(async () => {
  const b = await chromium.launch({ channel: 'msedge', headless: true });
  const p = await b.newPage({ viewport: { width: 1280, height: 720 } });
  const cdp = await p.context().newCDPSession(p);
  await p.goto('http://localhost:5173/?story=1', { waitUntil: 'commit', timeout: 60000 });
  console.log('loading…');
  await p.waitForTimeout(300000); // let it churn 5 min
  console.log('starting profiler');
  await cdp.send('Profiler.enable');
  await cdp.send('Profiler.setSamplingInterval', { interval: 1000 }); // 1ms
  await cdp.send('Profiler.start');
  await p.waitForTimeout(30000);
  const { profile } = await cdp.send('Profiler.stop');
  // aggregate self time by function
  const nodesById = new Map(profile.nodes.map((n) => [n.id, n]));
  const self = new Map();
  const dt = (profile.timeDeltas || []).reduce((a, b) => a + b, 0) / 1000;
  for (const id of (profile.samples || [])) {
    const n = nodesById.get(id);
    if (!n) continue;
    const f = n.callFrame;
    const key = (f.functionName || '(anon)') + ' @' + (f.url || '').split('/').pop() + ':' + (f.lineNumber + 1);
    self.set(key, (self.get(key) || 0) + 1);
  }
  const total = (profile.samples || []).length;
  console.log('samples:', total, 'wall ms:', Math.round(dt));
  [...self.entries()].sort((a, b) => b[1] - a[1]).slice(0, 15).forEach(([k, v]) => console.log((v / total * 100).toFixed(1) + '%', k));
  await b.close();
})().catch((e) => { console.error('FATAL', e.message); process.exit(1); });
