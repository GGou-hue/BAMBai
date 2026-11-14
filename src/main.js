// Phase 3 boot: the full game — physics, player (Arjun), camera rig, HUD,
// vehicles, traffic, missions — via the vendored engine's own start().
// My shell owns the page: splash, params, and the #ui root the HUD builds into.
// ?view=city still boots the Phase 2 city-only flythrough.

import { Renderer } from '../vendor/render-entry.js';
import { start as startGame, Game } from '../vendor/game-entry.js';
import { s as buildCity, l as preloadCityModels } from '../vendor/city.js';
import { d as preloadLibrary } from '../vendor/library.js';
import { FlyCamera } from './camera.js';
import { initTitleMenu } from './title-menu.js';
import { initBranding, hinglishify, speakify } from './branding.js';

initTitleMenu();
initBranding();

const params = new URLSearchParams(location.search);
// S0 story-data hook: ?story=1 loads the campaign data layer and logs a summary.
if (params.get('story') === '1') {
  import('../vendor/story.js').then(({ default: story }) => {
    window.__story = story;
    console.log(`[story] v${story.version}: ${story.protagonists.length} protagonists, ${story.chapters.length} chapters, ${story.missions.length} missions, ${story.endings.length} endings, ${story.scenes.length} scenes`);
  });
}
// S2 protagonist framework: ?who=aarav|arjun|naina|meera picks the playable
// protagonist (model + spawn via vendor/game.js; prologue overlay here).
const WHO_IDS = ['arjun', 'aarav', 'naina', 'meera'];
const who = params.get('who');
if (who && WHO_IDS.includes(who)) window.__who = who;
// prologue overlay fires after the game boots (not during the loading screen)
const showPrologue = async () => {
  const { default: story } = await import('../vendor/story.js');
  const p = story.protagonistById[window.__who];
  if (!p?.prologue?.openingVO?.hi) return;
  const el = document.createElement('div');
  el.style.cssText = 'position:fixed;left:50%;bottom:12%;transform:translateX(-50%);max-width:70%;background:rgba(12,10,8,.82);color:#f3e9d2;font:15px/1.5 Georgia,serif;padding:14px 22px;border-radius:6px;text-align:center;z-index:99;transition:opacity 1.2s';
  el.innerHTML = `<div style="font-size:11px;letter-spacing:.2em;opacity:.65;text-transform:uppercase">${p.name} — ${p.role}</div><div style="margin-top:6px">“${p.prologue.openingVO.hi}”</div>${p.prologue.openingVO.en ? `<div style="font-size:12px;opacity:.7;margin-top:4px">${p.prologue.openingVO.en}</div>` : ''}`;
  document.body.appendChild(el);
  setTimeout(() => { el.style.opacity = '0'; setTimeout(() => el.remove(), 1400); }, 9000);
  console.log(`[story] playing as ${window.__who} (${p.model} @ ${p.spawnPlace})`);
};
const fill = document.getElementById('boot-fill');
const label = document.getElementById('boot-label');
const progress = (p, text) => {
  if (fill) fill.style.width = `${Math.round(p * 100)}%`;
  if (text && label) label.textContent = text;
};

const canvas = document.getElementById('game');
const quality = params.get('q') || 'high';
let r;
try {
  r = new Renderer(canvas, quality);
} catch (e) {
  label.textContent = 'This needs WebGL2 — try a current Chrome, Edge or Firefox.';
  throw e;
}
r.setHour(Number(params.get('hour') ?? 9));

const bootCity = async () => {
  // --- Phase 2 path: city only, free camera ---
  const { n: initTextureLoaders } = await import('../vendor/gltf.js');
  initTextureLoaders(r.renderer);
  progress(0.05, 'materials…');
  await preloadLibrary((d, t) => progress(0.05 + (d / t) * 0.35, 'materials…'));
  progress(0.4, 'city models…');
  await preloadCityModels(r);
  progress(0.55, 'building BAMBai…');
  const city = await buildCity(r);
  window.__city = city; // debug handle for the test harness
  progress(1, '');
  const fly = new FlyCamera(r.camera, params);
  let last = performance.now();
  r.renderer.setAnimationLoop(() => {
    const now = performance.now();
    const dt = Math.min(0.1, (now - last) / 1000);
    last = now;
    fly.tick(dt);
    city.update(dt, r.camera.position);
    r.render();
  });
  document.getElementById('boot')?.classList.add('done');
};

if (params.get('view') === 'audio') {
  // engine's audio bench: ?view=audio&test=1 runs the offline test of every clip
  const bench = (await import('../vendor/audio-entry.js')).default;
  bench(params, params);
} else if (params.has('view') && params.get('view') === 'city') {
  await bootCity();
} else {
  // --- full game ---
  progress(0.1, '');
  for (const id of ['controls', 'hud', 'hour-wrap']) document.getElementById(id)?.remove(); // debug overlay is city-view only
  await startGame(r, params);
  window.__game = Game.I; // debug handle for the test harness
  if (window.__who) showPrologue().catch((e) => console.log('[story] prologue error:', e?.message || e));
  hinglishify(Game.I); // dialogue speaks Hinglish now
  speakify(Game.I); // and the characters actually speak it
  // the hud may mount after start() resolves — retry until the wraps stick
  const wrapHud = () => {
    hinglishify(Game.I);
    speakify(Game.I);
    if (!Game.I?.hud?.__spk) setTimeout(wrapHud, 1000);
  };
  wrapHud();
  progress(1, '');
  document.getElementById('boot')?.classList.add('done'); // the game may have removed it already
}

