// ring shots around the Mother Tower + pixel scan for its red bands (0xC8402C)
const { chromium } = require('playwright-core');
const { execSync } = require('child_process');
(async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  page.on('pageerror', (e) => console.log('PAGEERROR:', String(e).slice(0, 120)));
  const tx = -394, tz = -1069;
  for (let k = 0; k < 8; k++) {
    const yaw = k * Math.PI / 4;
    // stand 130u south of tower (z + 130) looking north-ish; vary yaw around
    const x = tx + Math.sin(yaw) * 130, z = tz + Math.cos(yaw) * 130;
    const url = `http://localhost:5173/?view=city&hour=9&x=${x.toFixed(0)}&z=${z.toFixed(0)}&y=25&yaw=${(yaw + Math.PI).toFixed(2)}&pitch=0.1`;
    await page.goto(url, { waitUntil: 'commit', timeout: 30000 });
    await page.addStyleTag({ content: '#ui,#boot,#hud{display:none!important}' }).catch(() => {});
    await page.waitForFunction('window.__city !== undefined', null, { timeout: 150000 });
    await page.waitForTimeout(2500);
    const f = `reference/story/shots/ring-${k}.png`;
    try { await page.screenshot({ path: f, timeout: 8000 }); } catch { console.log(k, 'shot failed'); continue; }
  }
  await browser.close();
  for (let k = 0; k < 8; k++) {
    try { console.log(execSync(`node reference/story/pixel-verify.mjs reference/story/shots/ring-${k}.png`).toString().split('\n')[0]); } catch (e) { console.log(k, 'scan failed'); }
  }
  process.exit(0);
})().catch((e) => { console.error('FATAL', e.message); process.exit(1); });
