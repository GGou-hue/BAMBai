// S5 probe: monsoon scheduler + time-of-day density matrix (one boot, live setClock)
const { chromium } = require('playwright-core');
(async () => {
  const b = await chromium.launch({ channel: 'msedge', headless: true });
  const p = await b.newPage({ viewport: { width: 1280, height: 720 } });
  const errs = [];
  p.on('pageerror', (e) => errs.push(String(e).slice(0, 160)));
  const t0 = Date.now();
  const log = (s) => console.log('[' + Math.round((Date.now() - t0) / 1000) + 's] ' + s);

  await p.goto('http://localhost:5173/?season=monsoon&hour=15', { waitUntil: 'commit', timeout: 60000 });
  await p.waitForFunction('window.__game !== undefined', null, { timeout: 600000 });
  log('game booted');
  await p.waitForTimeout(12000);

  // 1) monsoon override: rain driven by season, live fetch skipped
  const wx = await p.evaluate(() => {
    const w = window.__game.weather;
    return { rain: +w.rain.toFixed(2), target: +w.targetRain.toFixed(2), wet: +w.wet.toFixed(2), live: w.live, storm: w.storm, hour: +w.hour.toFixed(1) };
  });
  log('weather: ' + JSON.stringify(wx));
  const monsoonOk = wx.rain > 0.3 && wx.live === null;
  log('MONSOON ' + (monsoonOk ? 'PASS' : 'FAIL') + ' — season-driven rain, no live fetch');
  try { await p.screenshot({ path: 'reference/story/shots/s5-monsoon-15h.png', timeout: 15000 }); log('monsoon shot ok'); } catch { }

  // 2) hour matrix: live setClock, measure audio-ctx fill sums + actual crowd
  const rows = [];
  for (const h of [8, 13, 19, 23]) {
    await p.evaluate((hh) => window.__game.weather.setClock(hh), h);
    await p.waitForTimeout(16000);
    const m = await p.evaluate((hh) => {
      const life = window.__life;
      const occ = life.spots ? life.spots.filter((s) => s.occ).length : -1;
      const roam = life.roam ? life.roam.count() : -1;
      return { hour: hh, occ, roam };
    }, h).catch(() => null);
    rows.push(m);
    log('h=' + h + ': ' + JSON.stringify(m));
  }
  // fill sums from the audio module (deterministic profiles)
  const fills = await p.evaluate(async () => {
    const m = await import('/vendor/audio.js');
    const out = {};
    for (const h of [8, 13, 19, 23]) {
      const ctx = m.A(h, 0.6, window.__life.q);
      let sum = 0, n = 0;
      for (const k of Object.keys(m.O)) { const s = m.O[k]; if (s && s.fill) { sum += s.fill(ctx); n++; } }
      out[h] = { sum: +sum.toFixed(1), sites: n };
    }
    return out;
  }).catch((e) => ({ err: e.message.slice(0, 80) }));
  log('fill sums: ' + JSON.stringify(fills));

  const f = fills[8] && fills[23] ? fills : null;
  const matrixOk = f ? f[8].sum > f[23].sum * 1.3 : false;
  log('MATRIX ' + (matrixOk ? 'PASS' : 'FAIL') + ' — morning rush > night lull');
  try { await p.screenshot({ path: 'reference/story/shots/s5-night-23h.png', timeout: 15000 }); log('night shot ok'); } catch { }

  const ok = monsoonOk && matrixOk;
  log('S5 ' + (ok ? 'PASS' : 'FAIL'));
  console.log('errors:', errs.length ? errs.join(' | ') : 'none');
  await b.close();
  process.exit(ok && !errs.length ? 0 : 1);
})().catch((e) => { console.error('FATAL', e.message); process.exit(1); });
