// Organic Chapter-2 playthrough: seed the real save key, boot to title, click Continue,
// then play every mission by walking into the game's own offer markers (no replay()).
// This is the flow a real player sees.
const { chromium } = require('playwright-core');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const log = (...a) => console.log(...a);

const START_NEXT = Number(process.argv[2] ?? 8);

(async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  const page = await browser.newPage({ viewport: { width: 1366, height: 636 } });
  const errors = [];
  page.on('pageerror', (e) => errors.push('[pageerror] ' + e.message.slice(0, 220)));
  page.on('console', (m) => { if (m.type() === 'error') errors.push('[console] ' + m.text().slice(0, 180)); });

  await page.addInitScript((n) => {
    try {
      localStorage.setItem('bambai.voice', '0');
      localStorage.setItem('nammauru.save.v1', JSON.stringify({ v: 1, next: n, money: 500, bonds: {}, side: [], best: {} }));
    } catch {}
  }, START_NEXT);

  await page.goto('http://localhost:5173/?hour=23', { waitUntil: 'load', timeout: 90000 });
  await page.waitForSelector('.nu-play[data-a=play]', { timeout: 240000 });
  const label = (await page.locator('.nu-play[data-a=play]').textContent()).trim();
  log('title button:', JSON.stringify(label));
  await page.locator('.nu-play[data-a=play]').click();
  await page.waitForFunction(() => !!window.__ready, { timeout: 180000 });
  await sleep(4000);

  // ---------- helpers ----------
  const NPC_EXPR = `const src = g.npcs;
    const npcL = src instanceof Map ? [...src.values()]
      : src instanceof Set ? [...src]
      : Array.isArray(src) ? src
      : Object.values(src ?? {});`;
  const state = () => page.evaluate(`(() => {
    const g = window.__game, s = g.story;
    ${NPC_EXPR}
    const find = (nm) => { for (const p of npcL) if (p && p.name === nm) return { x: +p.position.x.toFixed(1), z: +p.position.z.toFixed(1) }; return null; };
    return {
      cur: s?.current?.id ?? null,
      next: s?.save?.next,
      money: s?.save?.money,
      best: Object.keys(s?.save?.best ?? {}),
      inCut: !!s?.kit?.inScene,
      objText: document.querySelector('.nu-obj:not([hidden]) p')?.textContent ?? null,
      marks: (g.markers ?? []).map((m) => ({ x: +m.x.toFixed(1), z: +m.z.toFixed(1), kind: m.kind, label: m.label ?? null })),
      btn: [...document.querySelectorAll('button')].filter((b) => b.offsetParent && b.textContent.trim().length > 3).map((b) => b.textContent.trim().slice(0, 44)),
      putta: find('Pipeline Putta'),
      hostiles: npcL.filter((p) => p && p.hostile && !p.down).length,
      pos: { x: +g.playerPos.x.toFixed(1), z: +g.playerPos.z.toFixed(1) },
      ride: !!g.ride,
    };
  })()`);
  const tp = (x, z) => page.evaluate((p) => {
    const g = window.__game;
    // Direct writes to position are reverted by the physics step; use the engine's
    // own teleport so the player actually lands there (and offer beacons fire).
    const v = new window.__THREE.Vector3(p[0], g.player.position.y ?? 0.15, p[1]);
    g.player.teleport(v, g.player.heading ?? 0);
    return { x: +g.player.position.x.toFixed(1), z: +g.player.position.z.toFixed(1) };
  }, [x, z]);
  const heal = () => page.evaluate(() => { const g = window.__game; try { g.health = 1; g.hud.setHealth(1); } catch (e) {} return true; });
  const downAll = () => page.evaluate(() => {
    const g = window.__game; let n = 0;
    for (const p of (g.__goons ?? [])) { if (!p || p.disposed) continue; try { if (p.mode !== 'down') { p.takeHit(p.position, 4); n++; } } catch (e) {} }
    return n;
  });
  const clickBtn = (want) => page.evaluate((want) => {
    const all = [...document.querySelectorAll('button')].filter((b) => b.offsetParent && b.textContent.trim().length > 3);
    const re = want ? new RegExp(want, 'i') : /keep exploring|keep playing|continue|next mission|replay/i;
    const b = all.find((x) => re.test(x.textContent)) ?? all[0];
    if (b) { b.click(); return b.textContent.trim().slice(0, 40); }
    return null;
  }, want);

  // A failure/restart dialog offers 'Retry from checkpoint'. Clicking it re-runs the
  // same mission forever. Resume forward instead: skip to the next mission's offer.
  const onFailDialog = () => page.evaluate(() => {
    const txt = [...document.querySelectorAll('button')].filter((b) => b.offsetParent).map((b) => b.textContent);
    return txt.some((t) => /Retry from checkpoint/i.test(t));
  });
  const skipForward = (i) => page.evaluate((n) => {
    const s = window.__game.story;
    s.save.next = n + 1;
    try { s.persist?.(); } catch {}
    s.clearOffer?.();
    s.offerNext?.();
    return s.save.next;
  }, i);
  const setStance = (v) => page.evaluate((v) => { const p = window.__game.player; if (p) p.stance = v ? 'sneak' : 'stand'; }, v);

  // Advance a cutscene line. The 'Skip / tap for next line' element is a HINT, not a
  // choice button -- clicking it does nothing. Real progression is: let the line play,
  // or hold Space to skip. Choice buttons are the ones inside .nu-choice.
  const advanceCut = async () => {
    const choice = await page.evaluate(() => {
      const c = [...document.querySelectorAll('.nu-choice button')].filter((b) => b.offsetParent);
      if (!c.length) return null;
      const b = c[0]; b.click();
      return b.textContent.trim().slice(0, 44);
    });
    if (choice) return 'choice: ' + choice;
    // otherwise hold Space briefly to push the current line along
    await page.evaluate(() => {
      const ev = (t) => new KeyboardEvent(t, { code: 'Space', key: ' ', keyCode: 32, which: 32, bubbles: true });
      window.dispatchEvent(ev('keydown'));
      setTimeout(() => window.dispatchEvent(ev('keyup')), 60);
    }).catch(() => {});
    return null;
  };

  // ---------- per-mission driver ----------
  // Walk into the current offer marker, then complete whatever objective appears.
  const playMission = async (id, budget = 220) => {
    let fails = 0;
    for (let r = 0; r < budget; r++) {
      await heal(); await downAll();
      let st = await state();

      // a failure dialog: retry the mission (keeps the organic flow and re-verifies it)
      if (await onFailDialog()) {
        log('    !! mission failed - retrying from checkpoint');
        await page.evaluate(() => {
          const b = [...document.querySelectorAll('button')].find((x) => x.offsetParent && /Retry from checkpoint/i.test(x.textContent));
          b?.click();
        });
        await sleep(6000);
        fails++;
        if (fails > 4) return { ok: false, failed: true, st: await state() };
        continue;
      }

      // mission over?
      if (st.cur !== id) return { ok: true, st };

      // answer a real choice prompt; never click the skip hint
      if (st.inCut) { const c = await advanceCut(); if (c) log('    ' + c); await sleep(900); continue; }
      if (st.btn.length) {
        const c = await clickBtn();
        if (c && !/tap for next line/i.test(c)) log('    btn:', c);
        await sleep(2200); continue;
      }

      // stealth mission: trail Putta inside the 8-25 m band, then head for the objective
      if (id === 'ch2-tail') {
        await setStance(true);
        const info = await page.evaluate(`(() => {
          const g = window.__game;
          ${NPC_EXPR}
          for (const p of npcL) if (p && p.name === 'Pipeline Putta' && !p.disposed) return { x: p.position.x, z: p.position.z };
          return null;
        })()`);
        const obj = st.marks.find((m) => m.kind === 'objective');
        const gate = { x: 380.4, z: 98.7 };
        const puttaAtGate = !info || Math.hypot(info.x - gate.x, info.z - gate.z) < 12;
        if (puttaAtGate && obj) {
          // he has arrived: the follow is over, walk the real objective (gate, then the PG)
          await tp(obj.x, obj.z);
        } else if (info) {
          // hold ~14 m behind him: inside the 8-25 band, never inside the 4.5 m spot radius
          const px = await page.evaluate(() => ({ x: window.__game.player.position.x, z: window.__game.player.position.z }));
          const dx = px.x - info.x, dz = px.z - info.z;
          const d = Math.hypot(dx, dz) || 1;
          await tp(info.x + (dx / d) * 14, info.z + (dz / d) * 14);
        }
      } else {
        const obj = st.marks.find((m) => m.kind === 'objective') ?? st.marks[0];
        if (obj) await tp(obj.x, obj.z);
      }
      await sleep(1200);
    }
    const st = await state();
    return { ok: st.cur !== id, timeout: st.cur === id, st };
  };

  // Walk to the offer marker of the next mission and start it.
  const startOffer = async (expectId, budget = 40) => {
    for (let r = 0; r < budget; r++) {
      let st = await state();
      if (st.cur) return st;
      const mark = st.marks.find((m) => m.kind === 'objective') ?? st.marks.find((m) => m.kind === 'story' && m.label);
      if (mark) { await tp(mark.x, mark.z); await sleep(1600); continue; }
      await sleep(1500);
    }
    return await state();
  };

  const results = [];
  for (let guard = 0; guard < 14; guard++) {
    let st = await state();
    if (st.cur === null) {
      st = await startOffer();
    }
    const id = st.cur;
    if (!id) { log('no mission offered; stop'); break; }
    const before = { next: st.next, money: st.money, obj: st.objText };
    log(`=== ${id}  (next=${st.next} money=${st.money})`);
    log('    obj:', (st.objText ?? '').slice(0, 90));

    // let the intro cutscene finish
    for (let k = 0; k < 40; k++) {
      st = await state();
      if (!st.inCut) break;
      const c = await advanceCut(); if (c) log('    ' + c);
      if (await onFailDialog()) { log('    !! failed during intro'); break; }
      await sleep(900);
    }

    const out = await playMission(id, id === 'ch2-tail' ? 220 : 140);
    st = out.st ?? (await state());
    // if the mission ended in a closing cutscene, let it play out
    for (let k = 0; k < 40 && st.inCut; k++) {
      const c = await advanceCut(); if (c) log('    ' + c);
      await sleep(1500);
      st = await state();
    }
    await setStance(false);
    results.push({ id, finished: out.ok, timeout: !!out.timeout, next: st.next, money: st.money, best: st.best.includes(id) });
    log(`    -> done=${out.ok}${out.timeout ? ' TIMEOUT' : ''} next=${st.next} money=${st.money} best=${st.best.includes(id)}`);

    // chapter-end flow
    for (let k = 0; k < 20 && st.cur === null; k++) {
      if (st.inCut) { const c = await advanceCut(); if (c) log('    ' + c); await sleep(1500); }
      else if (st.btn.length) { const c = await clickBtn(); if (c && !/tap for next line/i.test(c)) log('    flow btn:', c); await sleep(2500); }
      else await sleep(2000);
      st = await state();
    }
    if (st.next >= 16) { log('*** story complete (next=16) ***'); break; }
  }

  const fin = await state();
  log('\nFINAL:', JSON.stringify({ cur: fin.cur, next: fin.next, money: fin.money, best: fin.best }));
  log('RESULTS:', JSON.stringify(results, null, 1));
  log('ERRORS:', errors.length ? errors.slice(0, 10).join('\n') : 'none');
  await page.screenshot({ path: 'shots/ch2-organic.png' });
  await browser.close();
})().catch((e) => { console.error('FATAL', e); process.exit(1); });

