// Phase 6 boot sweep: boot a structured URL set headlessly, collect page errors.
// Usage: node reference/osm/sweep-urls.cjs [tag]
// Writes reference/osm/sweep-urls-<tag>.log and prints a summary.
const { chromium } = require('playwright-core');
const fs = require('fs');
const root = 'C:/Users/User4/Downloads/BAMBai';
const tag = process.argv[2] || 'run';
const BASE = 'http://localhost:5173';

// vehicle kinds (vendor/vehicles.js cn)
const kinds = ['auto','scooter','delivery','motorbike','policeBike','hatchback','sedan','taxi','suv','police','minitruck','tanker','garbage','bus','schoolbus','ambulance','towtruck','firetruck','decker'];
// city camera spots (from dump-mumbai places + extremes)
const spots = [
  ['spawn', 410, -520], ['darshini', 150, 144], ['xerox', 462, -556], ['broker', 138, -282],
  ['pub', 456, -573], ['mall', 270, -545], ['seafront', -230, -566], ['stadium', 460, -615],
  ['north', 300, 800], ['south', 300, -900], ['east', 700, 0], ['west', -400, 0],
];
const urls = [];
// 1) city views: spots x hours (subset) + quality variants
for (const [name, x, z] of spots) for (const hour of [6, 13, 21]) urls.push({ u: `/?view=city&hour=${hour}&x=${x}&z=${z}&y=90&yaw=0.8&pitch=-0.5`, tag: `city ${name} h${hour}`, wait: '__city', to: 150000 });
urls.push({ u: '/?view=city&hour=9&q=low&x=150&z=144&y=40&yaw=1&pitch=-0.3', tag: 'city q=low', wait: '__city', to: 150000 });
urls.push({ u: '/?view=city&hour=9&q=high&x=150&z=144&y=40&yaw=1&pitch=-0.3', tag: 'city q=high', wait: '__city', to: 150000 });
// 2) vehicle viewers
for (const k of kinds) urls.push({ u: `/view?kind=${k}&hour=9`, tag: `vehicle ${k}`, wait: null, to: 60000 });
// 3) audio bench
urls.push({ u: '/?view=audio&test=1', tag: 'audio bench', wait: null, to: 120000 });
// 4) full game boot (exercises startGame incl. uncommitted session edits)
urls.push({ u: '/', tag: 'FULL GAME', wait: '__game', to: 600000, click: true });

(async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  const log = [];
  let pass = 0, fail = 0;
  for (const item of urls) {
    const page = await browser.newPage({ viewport: { width: 960, height: 540 } });
    const errs = [];
    page.on('pageerror', (e) => errs.push('pageerror: ' + String(e).slice(0, 200)));
    page.on('console', (m) => { if (m.type() === 'error') errs.push('console: ' + m.text().slice(0, 200)); });
    const t0 = Date.now();
    let status = 'ok';
    try {
      await page.goto(BASE + item.u, { waitUntil: 'commit', timeout: 30000 });
      if (item.wait) {
        await page.waitForFunction(`window.${item.wait} !== undefined`, null, { timeout: item.to });
        if (item.click) {
          try { await page.click('button.nu-play', { timeout: 5000 }); } catch {}
        }
        await page.waitForTimeout(item.click ? 15000 : 3000);
      } else {
        await page.waitForTimeout(item.to === 60000 ? 12000 : 20000);
      }
    } catch (e) {
      status = 'TIMEOUT/ERR: ' + String(e).slice(0, 120);
    }
    const dt = ((Date.now() - t0) / 1000).toFixed(0);
    const real = errs.filter((e) => !/favicon|DevTools|Autofill|adservice|sw\/|manifest/i.test(e));
    const ok = status === 'ok' && real.length === 0;
    ok ? pass++ : fail++;
    const line = `${ok ? 'PASS' : 'FAIL'} ${dt}s [${item.tag}] ${item.u}${real.length ? ' :: ' + real.slice(0, 3).join(' | ') : ''}${status !== 'ok' ? ' :: ' + status : ''}`;
    log.push(line);
    console.log(line);
    await page.close();
  }
  await browser.close();
  fs.writeFileSync(`${root}/reference/osm/sweep-urls-${tag}.log`, log.join('\n') + `\n\npass ${pass} / fail ${fail} / total ${urls.length}\n`);
  console.log(`\nSUMMARY: pass ${pass}, fail ${fail}, total ${urls.length} -> sweep-urls-${tag}.log`);
})().catch((e) => { console.error('FATAL', e); process.exit(1); });
