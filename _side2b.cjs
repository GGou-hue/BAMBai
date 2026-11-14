// Drive the two Chapter-2 side stories organically from an unlocked save.
const { chromium } = require('playwright-core');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const log = (...a) => console.log(...a);

(async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  const page = await browser.newPage({ viewport: { width: 1366, height: 636 } });
  const errors = [];
  page.on('pageerror', (e) => errors.push('[pageerror] ' + e.message.slice(0, 200)));
  page.on('console', (m) => { if (m.type() === 'error') errors.push('[console] ' + m.text().slice(0, 160)); });

  await page.addInitScript(() => {
    try {
      localStorage.setItem('nammauru.save.v1', JSON.stringify({ v: 1, next: 16, money: 5000, bonds: {}, side: [], best: {} }));
    } catch {}
  });
  await page.goto('http://localhost:5173/?hour=12', { waitUntil: 'load', timeout: 90000 });
  await page.waitForSelector('.nu-play[data-a=play]', { timeout: 240000 });
  log('title:', (await page.locator('.nu-play[data-a=play]').textContent()).trim());
  await page.locator('.nu-play[data-a=play]').click();
  await page.waitForFunction(() => !!window.__ready, { timeout: 180000 });
  await sleep(5000);

  const NPC_EXPR = `const src = g.npcs;
    const npcL = src instanceof Set ? [...src] : src instanceof Map ? [...src.values()]
      : Array.isArray(src) ? src : Object.values(src ?? {});`;
  const state = () => page.evaluate(`(() => {
    const g = window.__game, s = g.story;
    ${NPC_EXPR}
    return {
      cur: s?.current?.id ?? null,
      next: s?.save?.next, money: s?.save?.money,
      best: Object.keys(s?.save?.best ?? {}),
      sides: (s?.save?.side ?? []),
      inCut: !!s?.kit?.inScene,
      objText: document.querySelector('.nu-obj:not([hidden]) p')?.textContent ?? null,
      marks: (g.markers ?? []).map((m) => ({ x: +m.x.toFixed(1), z: +m.z.toFixed(1), kind: m.kind, label: m.label ?? null })),
      btn: [...document.querySelectorAll('button')].filter((b) => b.offsetParent && b.textContent.trim().length > 3).map((b) => b.textContent.trim().slice(0, 40)),
    };
  })()`);
  const tp = (x, z) => page.evaluate((p) => {
    const g = window.__game;
    g.player.teleport(new window.__THREE.Vector3(p[0], g.player.position.y ?? .15, p[1]), g.player.heading ?? 0);
  }, [x, z]);
  const advanceCut = async () => {
    const c = await page.evaluate(() => {
      const b = [...document.querySelectorAll('.nu-choice button')].filter((x) => x.offsetParent)[0];
      if (b) { b.click(); return 'choice: ' + b.textContent.trim().slice(0, 40); }
      return null;
    });
    if (c) return c;
    await page.evaluate(() => {
      const ev = (t) => new KeyboardEvent(t, { code: 'Space', key: ' ', keyCode: 32, which: 32, bubbles: true });
      window.dispatchEvent(ev('keydown')); setTimeout(() => window.dispatchEvent(ev('keyup')), 60);
    }).catch(() => {});
    return null;
  };
  const heal = () => page.evaluate(() => { const g = window.__game; try { g.health = 1; g.hud.setHealth(1); } catch (e) {} });
  const downAll = () => page.evaluate(() => {
    const g = window.__game; let n = 0;
    for (const p of (g.__goons ?? [])) { if (!p || p.disposed) continue; try { if (p.mode !== 'down') { p.takeHit(p.position, 4); n++; } } catch (e) {} }
    return n;
  });
  const failDialog = () => page.evaluate(() => [...document.querySelectorAll('button')].filter((b) => b.offsetParent).some((b) => /Retry from checkpoint/i.test(b.textContent)));

  const playSide = async (wantLabel) => {
    // walk to the side-story offer marker
    for (let i = 0; i < 40; i++) {
      const s = await state();
      if (s.cur) break;
      const m = s.marks.find((x) => x.kind === 'story' && x.label && x.label.includes(wantLabel));
      if (m) await tp(m.x, m.z);
      await sleep(1500);
    }
    let s = await state();
    log('  started:', s.cur);
    if (!s.cur) return { started: false };

    for (let r = 0; r < 170; r++) {
      await heal(); await downAll();
      s = await state();
      if (await failDialog()) { log('  !! failed'); return { started: true, failed: true, s }; }
      if (s.inCut) { const c = await advanceCut(); if (c) log('  ' + c); await sleep(900); continue; }
      if (!s.cur) return { started: true, done: true, s };
      if (false) {
        await page.evaluate(() => {
          const b = [...document.querySelectorAll('button')].filter((x) => x.offsetParent && x.textContent.trim().length > 3)[0];
          if (b && !/tap for next line/i.test(b.textContent)) b.click();
        });
        await sleep(1800); continue;
      }
      const m = s.marks.find((x) => x.kind === 'objective') ?? s.marks[0];
      if (m) await tp(m.x, m.z);
      await sleep(1300);
    }
    const e = await state();
    return { started: true, done: e.cur === null, timeout: true, s: e };
  };

  const results = [];
  for (const label of ['Tiffin Thief', 'Chappal Ledger']) {
    log('=== side:', label);
    const r = await playSide(label);
    const s = r.s ?? (await state());
    results.push({ label, cur: s.cur, next: s.next, money: s.money, sides: s.sides, best: s.best });
    log('  =>', JSON.stringify({ done: r.done, cur: s.cur, money: s.money, sides: s.sides }));
    for (let k = 0; k < 12 && s.cur === null; k++) {
      if (s.inCut) { await advanceCut(); await sleep(1200); }
      else if (false) {
        await page.evaluate(() => {
          const b = [...document.querySelectorAll('button')].filter((x) => x.offsetParent)[0];
          if (b && !/tap for next line/i.test(b.textContent)) b.click();
        });
        await sleep(2200);
      } else await sleep(1800);
      const ns = await state();
      if (ns.cur === s.cur && !ns.btn.length) break;
      s.cur = ns.cur; s.sides = ns.sides;
    }
    await sleep(2000);
  }
  const fin = await state();
  log('\nFINAL:', JSON.stringify({ next: fin.next, money: fin.money, sides: fin.sides, best: fin.best }));
  log('ERRORS:', errors.length ? errors.slice(0, 8).join('\n') : 'none');
  await browser.close();
})().catch((e) => { console.error('FATAL', e); process.exit(1); });
