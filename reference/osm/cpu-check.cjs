// launch boot, then sample the renderer process CPU twice to classify busy vs deadlock
const { chromium } = require('playwright-core');
const { execSync } = require('child_process');
(async () => {
  const b = await chromium.launch({ channel: 'msedge', headless: true });
  const p = await b.newPage({ viewport: { width: 1280, height: 720 } });
  await p.goto('http://localhost:5173/?story=1', { waitUntil: 'commit', timeout: 60000 });
  const sample = () => {
    const out = execSync(
      'powershell -NoProfile -Command "$t=Get-Date; $ps=Get-Process msedge -ErrorAction SilentlyContinue | Where-Object {$_.StartTime -gt (Get-Date).AddMinutes(-3)}; $ps | ForEach-Object { $_.CPU } | Measure-Object -Sum | Select-Object -ExpandProperty Sum"',
      { encoding: 'utf8' });
    return out.trim();
  };
  const c1 = sample();
  await p.waitForTimeout(15000);
  const c2 = sample();
  await p.waitForTimeout(15000);
  const c3 = sample();
  console.log('cumulative CPU s of young msedge procs:', c1, '->', c2, '->', c3);
  console.log('delta1:', (c2 - c1).toFixed(1), 'delta2:', (c3 - c2).toFixed(1), '(over 15s windows; ~15 = one core pegged)');
  await b.close();
})().catch((e) => { console.error('FATAL', e.message); process.exit(1); });
