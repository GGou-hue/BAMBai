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

