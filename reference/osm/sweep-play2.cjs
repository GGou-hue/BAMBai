// headless playthrough sweep v2: capture chapter card DURING intro, wait for mission, then drive
const { chromium } = require('playwright-core');

(async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  const errs = [];
  page.on('pageerror', (e) => errs.push('[pageerror] ' + e.message.slice(0, 220)));
  page.on('console', (m) => { if (m.type() === 'error') errs.push('[console] ' + m.text().slice(0, 220)); });
  page.on('requestfailed', (r) => errs.push('[reqfail] ' + r.url().slice(0, 140)));
  page.on('response', (r) => { if (r.status() === 404) errs.push('[404] ' + r.url().slice(0, 140)); });
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

  // poll the DOM during the intro: chapter card + mission banner + subs
  let chapter = null, mstart = null, firstSubs = null, objective = null;
  for (let i = 0; i < 90; i++) {
    await page.waitForTimeout(2000);
    const s = await page.evaluate(() => {
      const txt = (sel) => { const el = document.querySelector(sel); return el ? el.textContent.trim().slice(0, 160) : null; };
      const g = window.__game;
      return {
        chapter: txt('.nu-chapter'), mstart: txt('.nu-mstart'), subs: txt('.nu-subs'),
        objective: txt('.nu-obj, .nu-objective'), hint: txt('.nu-hint'),
        money: g.money, pp: { x: +g.playerPos.x.toFixed(0), z: +g.playerPos.z.toFixed(0) },
      };
    }).catch(() => null);
    if (!s) continue;
    if (!chapter && s.chapter) { chapter = s.chapter; log('CHAPTER CARD: ' + chapter); }
    if (!mstart && s.mstart) { mstart = s.mstart; log('MISSION BANNER: ' + mstart); }
    if (!firstSubs && s.subs) firstSubs = s.subs;
    if (!objective && (s.objective || s.hint)) { objective = s.objective || s.hint; log('OBJECTIVE: ' + objective); }
    if (chapter && mstart) break;
    if (i > 30 && mstart) break;
  }
  log('first subs: ' + firstSubs);
  log('CHECK ' + (chapter ? (/kolvada/i.test(chapter) ? 'PASS' : 'FAIL') : '??') + ' — chapter card mentions KOLVADA' + (chapter ? ' ("' + chapter + '")' : ' (never captured)'));
  log('CHECK ' + (chapter ? (!/koramangala/i.test(chapter) ? 'PASS' : 'FAIL') : '??') + ' — chapter card has no KORAMANGALA');
  log('CHECK ' + (mstart ? 'PASS' : 'FAIL') + ' — mission banner appeared');

  // gameplay state + sustained drive
  const st = await page.evaluate(() => {
    const g = window.__game;
    return { pp: { x: +g.playerPos.x.toFixed(0), z: +g.playerPos.z.toFixed(0) }, money: g.money };
  });
  log('pre-drive state: ' + JSON.stringify(st));
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
  log('CHECK ' + (dist > 40 ? 'PASS' : 'FAIL') + ' — car actually moved (>40 u)');

  await page.screenshot({ path: 'shots/sweep-drive2.png' });
  log('errors during session: ' + (errs.length ? '\n' + errs.join('\n') : 'none'));
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
