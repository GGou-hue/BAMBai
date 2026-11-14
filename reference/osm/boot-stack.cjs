// capture the stuck thread's stack via CDP Debugger.pause
const { chromium } = require('playwright-core');
(async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  page.on('pageerror', (e) => console.log('[pageerror]', e.message));
  const cdp = await page.context().newCDPSession(page);
  let paused = null;
  cdp.on('Debugger.paused', (ev) => { paused = ev.callFrames; });
  await cdp.send('Debugger.enable');
  await page.goto(process.argv[2] || 'http://localhost:5173/', { waitUntil: 'load' });
  // wait for wedge: try screenshots periodically until one times out
  await page.waitForTimeout(45000);
  for (let k = 0; k < 3 && !paused; k++) {
    try { await page.screenshot({ timeout: 8000 }); console.log('still responsive at', (45 + k * 40) + 's'); }
    catch { console.log('wedged — pausing'); await cdp.send('Debugger.pause'); await page.waitForTimeout(1500); break; }
    await page.waitForTimeout(40000);
  }
  if (paused) {
    const f = paused[0];
    const url = (f.location && f.location.url) || '(none)';
    console.log('FRAME', f.functionName || '(anon)', url.split('/').pop() + ':' + f.location.lineNumber + ':' + f.location.columnNumber, 'scriptId', f.location.scriptId);
    try { const src = await cdp.send('Debugger.getScriptSource', { scriptId: f.location.scriptId }); const line = src.scriptSource.split('\n')[f.location.lineNumber]; console.log('CTX:', JSON.stringify(line.slice(Math.max(0, f.location.columnNumber - 250), f.location.columnNumber + 150))); } catch (e) { console.log('no source:', e.message); }
    for (const fr of paused.slice(1, 6)) console.log(' up:', fr.functionName || '(anon)', ((fr.location && fr.location.url) || '(none)').split('/').pop() + ':' + fr.location.lineNumber + ':' + fr.location.columnNumber);
  } else console.log('never wedged / no pause captured');
  await browser.close();
})();
