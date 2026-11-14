// headless playthrough sweep: boot -> play -> chapter card -> first mission -> drive
const { chromium } = require('playwright-core');

(async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  const errs = [];
  page.on('pageerror', (e) => errs.push('[pageerror] ' + e.message.slice(0, 220)));
  page.on('console', (m) => { if (m.type() === 'error') errs.push('[console] ' + m.text().slice(0, 220)); });
  const t0 = Date.now();
  const log = (s) => console.log('[' + Math.round((Date.now() - t0) / 1000) + 's] ' + s);

  await page.goto('http://localhost:5173/?hour=9', { waitUntil: 'commit', timeout: 60000 });
  let has = false;
  for (let i = 0; i < 220; i++) {
    await page.waitForTimeout(3000);
    try { has = await page.evaluate(() => !!window.__game); } catch { has = false; }
    if (has) break;
  }
  log('game handle: ' + has);
  if (!has) { await browser.close(); console.log('SWEEP FAIL: no __game'); process.exit(2); }

  await page.click('button.nu-play');
  log('clicked play');
  await page.waitForTimeout(14000);

  // capture chapter card + mission banner + game state
  const st = await page.evaluate(() => {
    const g = window.__game;
    const txt = (sel) => { const el = document.querySelector(sel); return el ? el.textContent.trim().slice(0, 160) : null; };
    return {
      playerPos: { x: +g.playerPos.x.toFixed(0), z: +g.playerPos.z.toFixed(0) },
      money: g.money,
      chapter: txt('.nu-chapter'),
      mstart: txt('.nu-mstart'),
      subs: txt('.nu-subs'),
      objective: (() => { const el = document.querySelector('.nu-obj, .nu-objective'); return el ? el.textContent.trim().slice(0, 160) : null; })(),
      hint: (() => { const el = document.querySelector('.nu-hint'); return el ? el.textContent.trim().slice(0, 160) : null; })(),
      markers: (g.markers || []).map(m => ({ x: +m.x.toFixed(0), z: +m.z.toFixed(0), kind: m.kind })).slice(0, 5),
    };
  });
  log('state: ' + JSON.stringify(st));

  // checks
  const checks = [];
  checks.push(['chapter card mentions KOLVADA', st.chapter ? /kolvada/i.test(st.chapter) : null]);
  checks.push(['chapter card has no KORAMANGALA', st.chapter ? !/koramangala/i.test(st.chapter) : null]);
  checks.push(['mission banner appeared', !!st.mstart]);
  checks.push(['player spawned', Number.isFinite(st.playerPos.x)]);
  for (const [name, ok] of checks) log('CHECK ' + (ok === null ? '?? ' : ok ? 'PASS' : 'FAIL') + ' — ' + name);

  // sustained drive: hold W with occasional steering, sample position + errors
  await page.keyboard.down('KeyW');
  const samples = [];
  for (let i = 0; i < 8; i++) {
    await page.waitForTimeout(4000);
    if (i === 2) { await page.keyboard.down('KeyA'); await page.waitForTimeout(700); await page.keyboard.up('KeyA'); }
    if (i === 5) { await page.keyboard.down('KeyD'); await page.waitForTimeout(700); await page.keyboard.up('KeyD'); }
    const s = await page.evaluate(() => {
      const g = window.__game;
      return { p: { x: +g.playerPos.x.toFixed(1), z: +g.playerPos.z.toFixed(1) }, money: g.money };
    });
    samples.push(s);
    log('drive sample ' + i + ': ' + JSON.stringify(s.p));
  }
  await page.keyboard.up('KeyW');
  const dist = Math.hypot(samples[7].p.x - samples[0].p.x, samples[7].p.z - samples[0].p.z);
  log('distance driven over 32s: ' + dist.toFixed(0) + ' u');
  log('CHECK ' + (dist > 40 ? 'PASS' : 'FAIL') + ' — car actually moved (>' + '40 u)');

  await page.screenshot({ path: 'shots/sweep-drive.png' });
  log('errors during session: ' + (errs.length ? '\n' + errs.join('\n') : 'none'));
  log('SWEEP ' + (errs.length === 0 ? 'DONE (no errors)' : 'DONE (with errors)'));
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
