// Phases 4/5/6 evidence pass: vehicles driven, traffic, NPCs/wildlife,
// missions, money cheat, police, weather, saves. One boot, many probes.
const { chromium } = require('playwright-core');

(async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  page.on('pageerror', (e) => console.log('[pageerror]', e.message.slice(0, 160)));
  await page.goto('http://localhost:5173/?hour=17.2&skip&quick', { waitUntil: 'load', timeout: 60000 });
  for (let i = 0; i < 40; i++) {
    await page.waitForTimeout(5000);
    if (await page.evaluate(() => !!window.__ready).catch(() => false)) break;
  }
  await page.waitForTimeout(6000);

  // ---------- Phase 4: vehicles ----------
  const drive = async (kind) => {
    return page.evaluate(async (kind) => {
      const g = window.__game;
      // leave current ride
      if (g.ride) g.exitVehicle();
      await new Promise((r) => setTimeout(r, 800));
      const p = g.player.position;
      const pos = p.clone(); pos.x += 5;
      let v;
      try { v = g.spawnVehicle(kind, pos, 0); } catch (e) { return { kind, error: String(e).slice(0, 60) }; }
      if (!v) return { kind, error: 'spawn returned null' };
      await new Promise((r) => setTimeout(r, 600));
      g.enterVehicle(v);
      await new Promise((r) => setTimeout(r, 800));
      const start = { x: v.position.x, z: v.position.z };
      // hold throttle via the game's own controls
      v.controls = { throttle: 1, brake: 0, steer: 0, handbrake: false };
      await new Promise((r) => setTimeout(r, 3500));
      const dist = Math.hypot(v.position.x - start.x, v.position.z - start.z);
      const out = { kind, rode: g.ride === v, topSpeed: +v.speed.toFixed(1), dist: +dist.toFixed(0), twoWheeler: !!v.model?.spec?.twoWheeler };
      g.exitVehicle();
      return out;
    }, kind);
  };
  for (const k of ['scooter', 'auto', 'bus', 'tanker', 'motorbike', 'hatchback']) {
    console.log('[P4 drive]', JSON.stringify(await drive(k)));
  }
  const traffic = await page.evaluate(() => {
    const g = window.__game;
    const all = [...g.vehicles];
    return {
      total: all.length,
      kinds: [...new Set(all.map((v) => v.model?.kind).filter(Boolean))],
      aiMoving: all.filter((v) => v.speed > 0.5 && g.ride !== v).length,
      trafficDay: g.traffic?.day, crowdDay: g.crowd?.day,
    };
  });
  console.log('[P4 traffic]', JSON.stringify(traffic));
  const jam = await page.evaluate(() => { window.__game.cheats?.run('SILKBOARD'); const g = window.__game; return { trafficDay: g.traffic?.day, crowdDay: g.crowd?.day }; });
  console.log('[P4 SILKBOARD]', JSON.stringify(jam));

  // ---------- Phase 5: living street ----------
  const street = await page.evaluate(() => {
    const g = window.__game;
    const kinds = {};
    for (const n of g.npcs) { const k = n.model?.kind ?? n.kind ?? 'unknown'; kinds[k] = (kinds[k] || 0) + 1; }
    return { npcs: g.npcs.size, kinds };
  });
  console.log('[P5 street]', JSON.stringify(street));
  // crowd density vs hour: check the multiplier knobs exist
  const crowd = await page.evaluate(() => {
    const g = window.__game;
    return { crowdObj: !!g.crowd, weather: !!g.weather, fixedHour: g.weather?.fixedHour ?? null };
  });
  console.log('[P5 crowd knobs]', JSON.stringify(crowd));

  // ---------- Phase 6: game systems ----------
  const systems = await page.evaluate(() => {
    const g = window.__game;
    const before = g.money;
    g.cheats?.run('KASU');
    return {
      mission: g.story?.current?.id ?? null,
      moneyBefore: before, moneyAfterKASU: g.money,
      police: !!g.police, sceneLevel: g.police?.level ?? g.police?.heat ?? null,
      weatherFixed: g.weather?.fixedHour ?? null,
      jobs: !!g.jobs, board: !!g.board, ragdolls: !!g.ragdolls,
      save: !!localStorage.getItem('nammauru.save.v1'),
      acts: Object.keys(g.acts ?? {}),
    };
  });
  console.log('[P6 systems]', JSON.stringify(systems));
  const save = await page.evaluate(() => { window.__game.story?.saveHere?.(); return { saved: !!localStorage.getItem('nammauru.save.v1') }; });
  console.log('[P6 save]', JSON.stringify(save));
  await page.screenshot({ path: 'shots/p456-evidence.png' });
  await browser.close();
  console.log('DONE');
})().catch((e) => { console.error(e); process.exit(1); });
