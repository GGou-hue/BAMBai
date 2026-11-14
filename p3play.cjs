// Phase 3 play-test: boots the full game headlessly, walks the player,
// spawns a vehicle via the game's own cheat system, boards and drives.
// usage: node p3play.cjs
const { chromium } = require('playwright-core');

(async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  page.on('pageerror', (e) => console.log('[pageerror]', e.message.slice(0, 220)));
  page.on('console', (m) => { const t = m.text(); if (/cheat|spawn|error/i.test(t)) console.log('[log]', t.slice(0, 160)); });

  await page.goto('http://localhost:5173/?hour=9&skip', { waitUntil: 'load', timeout: 60000 });
  for (let i = 0; i < 40; i++) {
    await page.waitForTimeout(5000);
    if (await page.evaluate(() => !!window.__ready).catch(() => false)) break;
  }
  console.log('ready:', await page.evaluate(() => !!window.__ready));
  await page.waitForTimeout(4000);
  await page.screenshot({ path: 'shots/p3-spawn.png' });
  console.log('spawn shot saved');

  // game state snapshot
  const state = await page.evaluate(() => {
    const g = window.__game;
    return {
      player: !!g?.player,
      pos: g?.player?.position ? { x: +g.player.position.x.toFixed(1), y: +g.player.position.y.toFixed(1), z: +g.player.position.z.toFixed(1) } : null,
      vehicles: g?.vehicles?.size,
      npcs: g?.npcs?.size,
      money: g?.money,
      paused: g?.paused,
    };
  });
  console.log('state:', JSON.stringify(state));

  // walk forward for ~3 s
  await page.keyboard.down('KeyW');
  await page.waitForTimeout(3000);
  await page.keyboard.up('KeyW');
  await page.waitForTimeout(800);
  await page.screenshot({ path: 'shots/p3-walk.png' });
  const pos2 = await page.evaluate(() => {
    const g = window.__game;
    const p = g?.player?.position;
    return p ? { x: +p.x.toFixed(1), z: +p.z.toFixed(1) } : null;
  });
  console.log('after walk:', JSON.stringify(pos2));

  // spawn an auto via the game's cheat system, then board and drive
  await page.keyboard.type('AUTOWALA', { delay: 60 });
  await page.waitForTimeout(3500);
  await page.screenshot({ path: 'shots/p3-auto.png' });
  const veh = await page.evaluate(() => {
    const g = window.__game;
    return { vehicles: g?.vehicles?.size, kinds: [...(g?.vehicles ?? [])].map((v) => v.model?.kind).slice(0, 6) };
  });
  console.log('after AUTOWALA:', JSON.stringify(veh));

  // board: the game prompts [F] when near — press F
  await page.keyboard.press('KeyF');
  await page.waitForTimeout(1500);
  const ride = await page.evaluate(() => {
    const g = window.__game;
    return { ride: g?.ride?.model?.kind ?? null, speed: g?.ride ? +g.ride.speed.toFixed(1) : null };
  });
  console.log('after F:', JSON.stringify(ride));
  if (ride.ride) {
    await page.keyboard.down('KeyW');
    await page.waitForTimeout(4000);
    await page.keyboard.up('KeyW');
    await page.waitForTimeout(500);
    await page.screenshot({ path: 'shots/p3-drive.png' });
    const d = await page.evaluate(() => {
      const g = window.__game;
      return { speed: +g.ride.speed.toFixed(1), pos: { x: +g.ride.position.x.toFixed(0), z: +g.ride.position.z.toFixed(0) } };
    });
    console.log('after drive:', JSON.stringify(d));
  }
  await browser.close();
  console.log('DONE');
})().catch((e) => { console.error(e); process.exit(1); });
