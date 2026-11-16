// capture ALL console messages during boot, appending to a file live (no buffering)
const { chromium } = require('playwright-core');
const fs = require('fs');
const OUT = 'reference/osm/boot-console-s7.log';
fs.writeFileSync(OUT, '');
const t0 = Date.now();
const { chromium: _c } = { chromium: null };
(async () => {
  const b = await chromium.launch({ channel: 'msedge', headless: true });
  const p = await b.newPage({ viewport: { width: 1280, height: 720 } });
  p.on('console', (m) => {
    fs.appendFileSync(OUT, Math.round((Date.now() - t0) / 1000) + 's [' + m.type() + '] ' + m.text().slice(0, 140) + '\n');
  });
  p.on('pageerror', (e) => fs.appendFileSync(OUT, Math.round((Date.now() - t0) / 1000) + 's [PAGEERROR] ' + String(e).slice(0, 200) + '\nSTACK: ' + String(e.stack || '').slice(0, 900).replace(/\n/g, ' | ') + '\n'));
  await p.goto('http://localhost:5173/?story=1', { waitUntil: 'commit', timeout: 60000 });
  fs.appendFileSync(OUT, '0s [nav] committed\n');
  for (let i = 0; i < 120; i++) {
    await p.waitForTimeout(30000);
    fs.appendFileSync(OUT, Math.round((Date.now() - t0) / 1000) + 's [tick] alive\n');
  }
  await b.close();
})().catch((e) => { fs.appendFileSync(OUT, 'FATAL ' + e.message + '\n'); process.exit(1); });
