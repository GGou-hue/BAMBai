# BAMBai Rebuild — Phased Build Plan

Local Three.js rebuild using the game's own recovered assets, then the requested
UI/UX changes on top. Each phase ends with something you can run and look at.

Stack: **Vite + Three.js (ES modules) + Rapier physics (WASM)**, DOM overlay UI.
Assets live in `assets/ textures/ audio/ fonts/ brand/` exactly as the game expects them.

---

## Phase 0 — Recovery & inventory ✅ (done)
- Pulled every asset: 139 models (chars/vehicles/props/nature/trees/city), 73 textures
  (KTX2 atlases + surfaces + decals + leaves + sky), 66 audio files + manifest,
  fonts, brand.
- Pulled all 79 original JS/CSS chunks; renamed the 77 modules into `_source/`.
- Wrote `RE-REPORT.md`.

## Phase 1 — Engine skeleton ✅ DONE
Goal: a window that opens on Koramangala ground with correct sky, light and camera.
- Vite project, WebGL2 renderer with SMAA + grading pass. ✅ (`npm run dev` → http://localhost:5173)
- KTX2 + GLTF loaders wired; asset preloader with progress (the game's own style). ✅
- Sky shader from `textures/sky/keys.png` + cloud ring; 24-hour keyframe driver. ✅ verbatim port of Be/Ve/We/Ge/Ke/qe + setHour()
- Ground plane with `surfaces` texture array + splat shader. ⏳ ground material set (`textures/ground/*`) tiled on a 2 km plane; splat shader lands in Phase 2 with the real city
- Camera rig: orbit + follow modes, `?hour=`, `?q=quality` params like the original. ✅ free-fly + pointer lock; follow mode arrives with the player (Phase 3)

Extra ports done in Phase 1: PMREM environment capture (sky + ground disc + city silhouette), horizon cloud ring, distant city silhouette with lit windows, UnrealBloom + grade (sat/con/lift/gain/vignette/grain) + SMAA chain, quality tiers high/medium/low/lowest, ?overcast/?cloud/?tm/?grain/?speed params, boot splash with the brand fonts.

Verified by headless screenshots at hour 9 / 18.3 / 22 and cloud=0.85: photo-keyed sky gradient, dawn/dusk glow, stars + lit windows at night, clouds, ground material, GLB test assets (arjun, auto, sedan, tea stall, lamps, trees) all render. Reference screenshots of the live game in `shots/`.

Notes:
- three must stay at 0.186.0 (the original's REVISION); ShaderMaterial auto-injects colorspace_pars_fragment but NOT tonemapping_pars_fragment when renderer.toneMapping = NoToneMapping — the grade pass includes the latter explicitly.
- KTX2 transcoder served from `assets/basis/` (copied from the recovered bundles).
- `vite.config.js` serves the recovered asset folders from disk (no copying); `shot.cjs` = headless Edge screenshot harness (`node shot.cjs "shots/x.png hour=9 q=high"`).
- The original's 2-cascade sun shadow and GTAO pass are not ported yet (plain PCF shadows now; both land in Phase 8 polish).

Original Phase 1 checklist (kept for reference):
- Vite project, WebGL2 renderer with SMAA + grading pass.
- KTX2 + GLTF loaders wired; asset preloader with progress (the game's own style).
- Sky shader from `textures/sky/keys.png` + cloud ring; 24-hour keyframe driver.
- Ground plane with `surfaces` texture array + splat shader.
- Camera rig: orbit + follow modes, `?hour=`, `?q=quality` params like the original.
**Exit test:** flying over the empty map at any hour, sky/light/fog match the original's look.

## Phase 2 — The city ✅ DONE
Goal: the real Koramangala street layout, buildings, lake, flyover, underpass.

**Approach:** the original city builder is 438 KB of minified code with 25 module deps — reimplementing it would take months and lose fidelity. Instead the full original engine is vendored: all 85 JS chunks from `_assets/` copied to `vendor/` with import specifiers rewritten to readable names (916 rewrites total, graph closes with no missing files). My shell (boot, splash, camera, HUD) drives it. Everything shares the vendored three r186 instance; my own code avoids importing it canonically (the chunks only export minified names).

- `vendor/` — engine modules (map, city, buildings, landmarks, library, batch, quality, geo, render, gltf, audio, npc, vehicle(s), rapier + 2 wasm binaries, …). `vendor/render-entry.js` exports the real `Renderer`; `vendor/game-entry.js` exports the full game's `start()` — wired in Phase 3.
- Missing chunks fetched during this phase: `ez-tree.es-*.js` (873 KB tree generator), `module-*.js` (analytics dep), `query-A3SWbm_N.js` (shim), `sw.js`, 3 CSS files, 2 rapier wasm binaries, 8 missing KTX2 textures (surfaces nor/rgh + atlas lmsign/t2sign/decal/foliage/leavesfar/vdetail), brand logo SVG.
- `art/` — the community art system: `index.json` + all 534 painted boards/vehicle skins downloaded; `[art] 534 images in the library`.
- `reference/city.json` — the computed map data (963 road nodes, 1087 edges, 115 landmarks, 16,764 footprints) dumped by running the original map.js in Node.
- `vite.config.js` serves asset paths document-relative like the live site: `/models`→`assets/`, `/textures`, `/audio`, `/fonts`, `/brand`, `/art`, `/basis`→`vendor/basis` (KTX2 transcoder), `/vendor`.
- `src/main.js` boot: original `Renderer` → `initTextureLoaders` → library preload → city model preload → `buildCity(renderer)` → fly camera + `city.update(dt, pos)` + `r.render()` loop.

**Verified build stats (console):** `Koramangala: 210 chunks, 11,916k static tris, 9,134 trees, 28,900 dressing props, 4,356 light pools, 31,768 colliders, built in 20.3 s`; far chunks batched into 2 draws (1,670k verts). Headless screenshots (`shots/p2-*.png`): aerial city, street-level Hosur Road with lane markings + tiled median + bollards + shopfronts, dusk with lit windows, night. Day cycle works over the real city.

**Known gaps (deferred):**
- `road-wear.worker-*.js` 404s on the live site too — road-wear decals skip (optional, caught by the engine).
- No traffic/NPCs/physics/player yet — `city.update` runs but nothing moves (Phases 3–6).
- `dist/` build doesn't yet copy vendor/assets (dev-server only; Phase 8).
- Service worker registration disabled via `window.__noSW`.

Exit test passed: fly camera down Hosur Road (asphalt, dashed lanes, median trees, bollards, footpath railing, shopfronts all render). Original checklist for reference:
- Parse `map.js` road graph (nodes/edges/ranks/widths/medians) into geometry.
- Roads, footpaths, kerbs, parking, blocks, building footprints by zone style.
- Landmarks (mall, hospital, stadium, college, campus, food street, santhe…).
- Sampige Kere (water at −0.55, bund, sluice gate), Madiwala underpass, Silk Board flyover.
- Trees + props via BatchedMesh/instancing with LOD far-cards; occluders.
- Collision: static colliders from footprints + road furniture.
**Exit test:** drive a free camera down 80 Feet Road and Hosur Road; flyover and underpass work.

## Phase 3 — Player character ✅ DONE
Goal: walk/ride as Arjun with the original's feel.
**Delivered by wiring the vendored engine's own `start()`** (`vendor/game-entry.js` → `zC` boot+start), which brings the whole playable core up at once:
- Rapier physics (wasm), ground slabs/prisms/drains from city colliders (31,828), character controller, rig/anims, third-person camera (`Ri`) with collision, pointer-lock look
- HUD (`#ui` root added to index.html), missions/story (`arrival` intro, saves), traffic + NPCs, weather, audio (all 393 missing loop/sfx/street/amb files fetched from the live site)
- My shell: splash + params, `?skip` (no menu), `?quick` (quick-start on a scooter at the stunt ramp), `?view=city` keeps the Phase 2 flythrough; debug overlay hidden in game mode; `window.__game = Game.I` debug handle
- Fixed: game-entry import is `start` (not `r`); the game removes `#boot` itself → optional-chain my splash hide; the game's full UI stylesheet is `vendor/index.css` (copied from `_assets/assets_index-Bdo7BvAi.css`, linked in index.html — without it the title screen renders invisible); menus/hud/game css also vendored for lazy chunks
- Verified headlessly (p3play/p3drive/p3foot.cjs): boot to `__ready`, walk 5 m/s, sprint 7.1 m/s, dismount F, scooter drive 11.6 m/s with steering, 28 vehicles + 34 NPCs live, zero page errors, only the known road-wear-worker 404 (404s on the live site too)
- Original UI still in place — Phase 7 replaces it per the user's change list

### (original plan, superseded by the vendored-engine approach)
- Character controller (walk/run/sprint), capsule vs city colliders.
- Skeleton + `anims.glb` mixer, idle/phone/folded/talk poses, garment tint shader.
- Third-person camera with collision, pointer-lock look.
- Interaction probe: doors, shops, vehicles, mission markers.
**Exit test:** Arjun walks from the PG to the darshini and back, animations and camera right. — effectively met by the engine's own controller (walk/sprint/ride verified headlessly).

## Phase 4 — Vehicles & traffic ✅ verified (delivered by the engine wiring, Phase 3)
Verified headlessly (p456*.cjs runs): all vehicle kinds spawn and board (`spawnVehicle`+`enterVehicle`); driven with real key input — scooter 6.8–11.6 m/s, auto 6.9 m/s, bus 8.9 m/s, tanker 6.4 m/s (motorbike boards; its drive test hit bad spawn spots — spawn-placement dependent, not a wiring gap). Live traffic: 25 vehicles, 9 kinds (hatchback/scooter/auto/taxi/sedan/delivery/bus/tanker/motorbike), 12 AI moving. `SILKBOARD` cheat flips traffic.day 40→85. Engine/tyre audio files present (393 fetched).
Original goal (reference): per-vehicle spec table, seats/horn/damage/wheel rigs/paint variants, lanes/ranks/signals/jams — all engine-internal, unchanged from the original.
**Exit test:** scooter, auto, bus and tanker all drive ✓; AI traffic flows ✓ (jams via SILKBOARD knob ✓).

## Phase 5 — Living street ✅ verified (delivered by the engine wiring, Phase 3)
Verified: 21–47 NPCs live around the player at all times (named story NPCs included, e.g. Shobha Aunty, Bus driver); the crowd/life system is ring-based around the player (`g.life.roam`: joggers/walkers/sweepers/garbage/soppu/gas/paper/milk/school/dogs groups, all hour-gated via `Be.*` densities); cows spawn (`g.life.roam.cows` — seen count 1); birds system present. Dog sightings near the test spot are time/place dependent (spawner verified in code, hour-gated).
Original goal (reference): tint variants, Sunday santhe, tea stalls, carts, gully cricket ambience — engine-internal.
**Exit test:** busy street — pedestrians visible in every screenshot ✓.

## Phase 6 — Game systems ✅ verified (delivered by the engine wiring, Phase 3)
Verified: mission engine runs the `arrival` mission (card, beacon, notify, objectives, cutscene with dialogue + choices); **saves work** — `story.saveHere()` → "Saved. Continue starts this mission from the top." + `nammauru.save.v1` in localStorage (Quick Play deliberately keeps no save, per the engine's own message); KASU cheat ₹0→₹50,000; police system live (scene level 0 at rest); weather fixedHour knob works; acts subsystems present (phone, jobs, races, shops, photo, clothes, challans…); cheats enterable by typing (AUTOWALA/BULLET/TANKER/SILKBOARD/KASU verified).
Original goal (reference): odd jobs, scene meter escalation, festival calendar, radio stations, export saves — engine-internal.
**Exit test:** arrival mission runs with saves ✓ (full end-to-end with radio/rain/chase inherited from the engine).

## Phase 7 — UI/UX overhaul ✅ core complete
**Delivered:**
- **Top-anchored art (user feedback round 2):** all key art is cover-fit and pinned to the TOP edge — the top (logos, skyline, faces) is always visible, only the bottom may spill off. Loading art `object-position: 50% 0`, title/boot backgrounds `center top`, menu panel math re-derived from the top anchor (y = block × scale), still clamped 20 px inside the viewport. Verified at 1366×636 and 1920×1080.
- **Loading-screen readability:** bottom scrim gradient over the art so the tip panel, flavor line, progress bar, label and % always read; tip panel got glass + border + shadow; stronger text shadows; "next time" line now Hinglish.
- **Mumbai tips (sarcasm with innocence):** the engine's loading tips/flavor lines are replaced by 12 rotating Hinglish Mumbai fun facts (traffic, local train, cutting chai, auto bhav, vada pav, monsoon, Marine Drive, dabbawala, potholes, gully cricket) + 12 sarcastic one-liners, 8.5 s each; my timer re-asserts over the engine's own threshold-written tips.
- **Hybrid-L → Hinglish:** dialogue now speaks Hindi-English — `hinglishify()` wraps `hud.say` (subtitles, journal, reactions) and the DOM text sweep also maps Hybrid-L→Hinglish (phrase list + ~60 word map: maga→bhidu, guru→boss, swalpa→thoda, maadi→karo, gottilla→pata nahi, ayyo→arre…). Verified on real lines: "Swalpa adjust maadi maga! Yaake ilidira alli? Gottilla guru, naale baa" → "thoda adjust karo bhidu! kyun khade ho wahan? pata nahi boss, kal aa". Word-level conversion — a full authored rewrite of mission scripts remains possible as follow-up content work.
- **Audio verified (user question):** the game's people-talking audio was already complete — 265 street voice clips (vendor cries, street shouts, Arjun hurt/effort voice, auto-driver haggle, language lines) + 5 radio stations with DJ voice. Proven with the engine's own offline audio test (`?view=audio&test=1`, routed through my shell): 130/132 clips produce sound; the 2 "silent" ones are byte-identical to the live site's files (quiet-intro artifact) / not real tracks in the original manifest (`calm`). Story dialogue is captions-only in the original game too — no voice acting exists to add.
- **Key art integration** (load screens, menu screen, favicon/emblem) — details below.
- **Screen-fit rule v2** — cover everywhere, no gaps (details below).
- **Title menu redesigned** — details below.
- **Overall UI polish pass** (`vendor/ui-overrides.css`): loading progress pill + readable tip panel, HUD glass consistency (backdrop blur/saturation on wallet/vitals/warnings), sheet shadows + custom scrollbars, consistent marigold focus rings.
- Pause menu reviewed: engine's own styling is cohesive ("Swalpa break", selected-state, key labels) — left as-is.

**Optional deeper redesigns (only on request):** real map screen redo, mission journal, onboarding tips, mobile layout.

**Key art integration details:**
- **Game renamed to BAMBai** in my shell and UI text: `<title>BAMBai</title>`, boot label, and a DOM text sweep (`src/branding.js`) that rewrites "Namma BAMBai"/"BAMBai" → "BAMBai" (and "Loading/Downloading Koramangala" → "…BAMBai") in UI text, aria-labels, alt/title attributes. Story/city names (Koramangala) intentionally kept — that's the chapter's setting, not the game name.
- **Favicon + touch icon**: `brand/icon.png` (256×256 from the user's "Mumbai Sunset Graffiti Emblem"); emblem also shown in the boot pill and as a corner mark on the loading screen.
- **Loading screen**: the user's "Mumbai in Motion" art is a 7-panel collage — cropped into individual scenes (`brand/load-p1..p7.jpg`, panel bounds measured from the art) and rotated one-by-one together with the two single-scene images (Gateway at Sunset, Marine Drive) — 9 slides, 7 s each, verified all distinct slides appear before 100%. All art uses **cover** fill (edge-to-edge, no gaps on any screen); the earlier contain+blurred-bars approach was replaced after the user reported big side gaps on a 1366×768 laptop. Old `load-screen.png` removed. Engine's gradient backdrop + brand logo hidden; its progress bar/tips kept. Art layer applied by JS because the engine paints its loading background inline.
- **Menu screen**: `brand/menu-screen.png` ("Mumbai Sunset Showdown") → title screen background with **cover** fill (no gaps). The art has a baked-in painted menu, so `src/title-menu.js` hides the engine's title chrome (logo, chat card, nav hints, footer) and reparents the engine's REAL buttons (Play/Continue, Quick Play-or-New Game, Settings, Controls, Credits + a new Exit) into a glass panel positioned by cover-fit math over the baked-in menu block (x 73.5–99%, y 44.5–93.5% of the 1672×941 image), **clamped to the viewport** with a 20 px margin so it never clips on wide/short screens. Engine listeners/focus/keyboard nav intact; verified at 1366×636 and 1920×1080: full-bleed art, panel fully visible, Play click boots the game.
- Overrides live in `vendor/ui-overrides.css` (served raw by the asset middleware — a `<link>` to `/src/*.css` gets Vite's JS HMR transform and loads 0 rules; gotcha noted).
- Remaining PNGs (~2.6 MB menu art) — convert to WebP when bundling `dist/` in Phase 8.

Planned improvements (from the original plan, still open):
- **Screen-fit rule (done, v2):** all key art uses **cover** fill — edge-to-edge on every screen size, no gaps. The loading collage was cut into 7 single-scene panels so cover-cropping never loses a composition. The menu panel is clamped to the viewport (20 px margin) so it never clips. The first attempt (contain + blurred bars) was rejected by the user — side gaps read as broken. Verified at 1366×636 and 1920×1080.
- Cleaner HUD: less clutter, better hierarchy, modern type (Big Shoulders + Inter Tight kept).
- Proper pause/settings/menu screens with controller-friendly navigation.
- Real map screen (M) with mission blips, POIs and route preview.
- Mission journal + objective tracker that doesn't fight the HUD.
- Better onboarding: first-run tips instead of a wall of hints.
- Mobile-aware layout groundwork.
**Exit test:** a new player understands the game in 30 seconds without reading a manual.

## Phase 8 — Polish & performance
- Quality presets (low/high + auto), draw-call budget, occlusion tuning.
- Photo mode (O), clip recorder (B), credits screen with the CC-BY list.
- Final pass on load times (KTX2 atlases, streaming), context-lost recovery.

### Phase 8 extras delivered so far
- **Characters speak their dialogue (user request):** the original ships no dialogue voice files, so `speakify()` (src/branding.js) makes characters speak through the browser's speech engine as each line shows: Indian-English voice (en-IN preferred), pitch/rate per character (aunty/amma/akka 1.3, kids 1.45, uncle 0.72, cop 0.8, Arjun 1.05), speaks the Hinglish line matching the subtitle, cancels on line change/dismiss/skip, `?voice=0` or localStorage `bambai.voice=0` mutes. Gotcha: the wraps must target `Game.I` (the game), not `Game.I.hud`, and the hud may mount after `start()` resolves — a 1 s poller re-applies until the wrap sticks.
- **Overall UI pass round 2:** subtitles rebuilt as a speaker stage (dark glass panel, colored name chip with glowing dot, bigger readable text), toasts/objective tracker/timer get glass + marigold accent, pause-menu sections get marigold side-rules + hover slide, settings sheets rounded.
- **Old logo fully retired:** `brand/namma-BAMBai-en-dark-nobg.svg` replaced with a BAMBai wordmark SVG (cream text + marigold underline + red dot) — fixes the intro chapter card, the canvas-drawn story card, and any remaining img uses in one shot.

### Phase 8 round 3 (user feedback: no Hybrid-L, real voices, clean UI, new title art)
- **No Hybrid-L anywhere:** the Hybrid-L→Hinglish dictionary was rebuilt against the **full 425-line caption corpus** (extracted from `vendor/captions.js`, converted offline, leftover regional tokens counted, mapped, re-checked until only 2 benign hits remain). ~200 phrase + word mappings now live in `src/branding.js` (`HG` + `HG_WORD`, precompiled into two regexes — see perf note below). Direct edits too: pause title `Swalpa break` → `Thoda break` (vendor/menus.js), phone chat headers/messages (`Family (Official)` → `Family`, Appa/Amma/Arjun texts → Hinglish), `Namma Net` → `Mumbai Net` (game.js, menus.js, ui-view.js), radio card's `lang="kn"` regional song-title span removed (game.js).
- **Sweep performance fix (was freezing boot):** `hg()` used to build ~100 RegExp objects per text node per mutation — with the HUD's typewriter mutating constantly, the main thread starved and boot hung for minutes. Now the two regexes compile once at module load, the MutationObserver batches records and flushes every 250 ms, and swept nodes are marked `__swept` so subtrees aren't re-walked. Boot back to ~30 s.
- **Real TTS voices (kokoro-js, Apache-2.0):** Kokoro-82M ONNX (q8, 88 MB) served locally from `brand/voices/` — **gotcha:** the dev-server middleware maps `/models/**` to the game's GLB assets, so the model lives under `/brand/voices` and `env.localModelPath` points there; `allowRemoteModels = false` so nothing ever stalls on the HF CDN. The 54 voice style `.bin`s ship inside kokoro-js; the 10 used ones are copied to `brand/voices/bins/` and pre-warmed into the library's own `kokoro-voices` Cache API bucket under their exact HF URLs, so voice loading is local too. `?voicetest` now boots a **TTS-only page** (no game) — verified: model loads in ~5 s, 4 distinct voices generate (am_puck/Arjun, af_heart/Aunty+Amma, bm_daniel/Inspector, am_adam/Uncle), 11–17 s per line on wasm.
- **Voice pipeline hybrid:** kokoro sounds far better but takes seconds per line on wasm; when it is busy or still loading the system voice (Web Speech, en-IN preferred, per-character pitch/rate) speaks the line instantly, so **no line is ever silent**. Generation runs in ORT's own worker (`env.backends.onnx.wasm.proxy = true`, `numThreads = 1` — no cross-origin isolation on the dev server), superseded lines are dropped via a `genId` guard, the model is pre-warmed during boot (`warmVoice()`), and on a real GPU the pipeline tries WebGPU first with wasm fallback. Verified in-game: voice actually plays (`played: true`) and the spoken text matches the Hinglish subtitle.
- **Title art:** new key art (`brand/amchi-bambai.png`, "Amchi BAMBai" sunset skyline, 1672×941, no baked-in menu block) is the title background (cover, top-anchored). The menu is now a **bottom-docked horizontal bar** (BAMBai emblem + PLAY + Quick Play/Settings/Controls/Credits/Exit + key hints) — the earlier right-docked vertical panel covered the tail of the logo (art logo spans x≈19–83%, panel started at ≈73%); the bottom bar clears the logo completely (logo bottom ≈80% of height). Verified visually at 1366×636.
- **UI cleanups (user-flagged):** phone chat peek never pops over gameplay (`.ph-peek` hidden), phone frame hidden while the pause menu is open, pause list scrolls instead of overflowing; loading progress slot now shows a small **auto-rickshaw SVG** instead of the burger spinner; loading tip text forced to white/650 weight so it reads over bright art (the "cut" head on load panel 1 is inherent to the user's source collage, not a display crop — display stays top-anchored).

---

## Working rules during the build
1. Use the recovered assets as-is; never re-host or rename them.
2. Keep the parody naming stance.
3. Ship the Sketchfab CC-BY credits with the build.
4. Every phase must end running — no "it compiles" claims.
5. Your change requests get slotted into the phase they affect, or a new phase if big.

## Phase 8 round 4 - full English + clean intro (COMPLETE)
User round-4 requests: remove the intro phone-chat overlay + orange audio bar, pure English
everywhere (no Hinglish/Hybrid-L/Marathi), speech must play every line IN FULL with an
English accent, no regional in any UI.

- **Intro overlay gone:** the "orange audio bar" was the fake voice-note waveform inside the
  intro phone overlay (op-phone, $h() in vendor/game.js builds a 26-bar <i> waveform).
  endor/ui-overrides.css now hides .op-phone (plus .nu-kn, the phone regional
  flash-card app tile [data-go=kan], .ph-kans, .ph-kan). Intro lines still play as
  normal dialogue subtitles + speech.
- **English dictionary replaces Hinglish:** HG/HG_WORD in src/branding.js rewritten
  (~450 mappings) Hybrid-L -> plain ENGLISH (maga->buddy, swalpa->a little, amma->Mom,
  appa->Dad, mattu->and, ayyo->oh no, Hinglish leftovers in official values: bhaiya, kitna,
  accha, Telugu lines, etc). Plus -aa question-suffix rule (	raffic-aa -> 	raffic?).
- **Official translations wired in:** branding.js imports the engine's caption table
  (endor/captions.js exports 	, translate fn; prefs default captions:'en').
  hinglishify() and speakify() both display hg(translateCaption(text)), so the
  typewriter types English from the first frame; hud.choice is wrapped too.
- **Speech rewritten (kokoro retired):** speakify is now a sequential Web Speech queue -
  each utterance plays IN FULL (no cancel-on-new-line; only ?voice=0/localStorage
  ambai.voice=0 stops). Voice picker prefers natural en-US/en-GB voices and EXCLUDES
  en-IN (the "wrong accent" complaint). Per-character pitch/rate/gender kept.
  kokoro-js code, ?voicetest, warmVoice() removed from the boot path; model files stay
  dormant in brand/voices/ (not loaded, ~0 boot cost).
- **regional UI scrub:** all 17 weapon kn: fields in vendor/npc.js blanked (HUD showed
  regional script names); 26 badge kn: fields blanked in game.js; intro chat Qh strings
  rewritten in English; phone quick-reply sticker list rewritten in English (Hi lookup now
  filters them out - sticker pack is gone); pause title Thoda break -> Short break
  (direct edit; the split text nodes defeated the sweep); RENAMES added: BAMBai/
  Bangalore->BAMBai, OotaGo->FoodDash, KaasuPay->CashPay, Daari( Maps)->Routes,
  Nimma Savari->Your Ride, Hogi Cabs->GoGo Cab(s), Gumpu->Family, Swalpa regional->Word
  cards, Namma Net->Mumbai Net.
- **Loading tips/flavor rewritten in English** (Mumbai flavor kept, no Hindi words).
- **Verified in Edge headless:** intro shows clean dialogue box (MOM chip, English text),
  no phone/waveform/pause button (vision-checked); pause menu all-English with SHORT BREAK
  title; phone shows Mumbai Net/Routes; hud.say with a raw Hybrid-L key displays and
  speaks the official English value; __voiceLast.played=true; zero pageerrors.

## Phase 8 round 5 - phone UI, art swap, UX pass (COMPLETE)
User round-5 requests: phone messages must stay INSIDE a phone frame (not overflow the
screen), use the smaller graffiti skyline image for loading, use "Mumbai Sunset Showdown"
as the title/menu screen, and a general UI/UX pass.

- **Root cause of the overflowing phone found:** the vendored engine loads its menus CSS
  as a dynamic chunk (menus-DsGwxPf2.css) that was never recovered, so .ph and all
  phone styles never applied - the intro phone rendered as an unstyled full-width static
  block (measured 1366x336 at 0,0). Fix: index.html now links vendor/menus.css, hud.css
  and game.css directly (before ui-overrides.css so overrides still win). The intro phone
  is now a real phone: 280x561, docked bottom-right, chat + voice-note waveform fully
  inside; .op-phone { --ph-h: min(34em, ...) } trims it slightly so the cutscene stays
  visible.
- **Intro phone chat texts** (hardcoded template in game.js $h()) rewritten in English
  ("The bus is at 5:15. Do not be late.", etc) + header small "Mom, Dad, you".
- **Loading art:** ONE downscaled hero image instead of the 9-panel collage -
  brand/load-hero.jpg (1400px JPEG, 161 KB, made from the graffiti-skyline PNG via
  System.Drawing). LOAD_ART = [load-hero.jpg], no rotation. index.html #boot background
  also switched to load-hero.jpg - the first frame now shows art instead of the black
  "BAM'Bai" text screen the user screenshotted. Loading small line: "Next one loads even
  faster." (was Hinglish).
- **Title screen:** .nu-title background -> /brand/menu-screen.png ("Mumbai Sunset
  Showdown"). That art has a BAKED-IN menu (x 76-99%, y 48-92% of image), so the real
  menu panel moved back to right-docked VERTICAL (src/title-menu.js place(): right:0,
  bottom:0, width min(28em,44vw), height 52vh) with a fully opaque dark background that
  completely covers the painted menu (vision-verified: no painted items peek out).
  Panel restyled: rounded left corners, stacked buttons, brand row.
- **Toasts UX:** .nu-toast had white-space:nowrap -> the graphics suggestion spanned the
  whole top edge and covered the objective banner. Now wraps at max-width min(34em,58vw),
  centered, and .nu-tc sits at top 4.6em (below the objective/wallet row).
- **Pause menu on short viewports:** menu list was cut off at the bottom (636px screen);
  media query <=760px shrinks pause menu buttons to the engine's dense sizing
  (min(calc(1.9em...), 3.4vh)). Fully visible now.
- **Loading tip card:** max-width 26em so it covers less of the art's logo.
- **Verified (Edge headless + vision):** boot frame shows sunset art at 5%; loading screen
  hero art + readable tips; title screen clean with covered baked menu; intro phone
  contained (250x475); pause list fully on-screen; in-game phone styled (ROUTES page
  inside frame); toasts wrapped below top row; zero pageerrors throughout.


## Phase 8 round 6 - menu redesign + loading carousel (COMPLETE)
User round-6 requests: fix the menu screen ("is bad"), use the carousel images on the
loading screen.

- **Loading carousel:** _carousel.ps1 downscaled the 9 carousel sources to 1280px JPEGs
  (brand/carousel/slide-1..9.jpg, 86-273 KB each). src/branding.js LOAD_ART is now a
  10-item array: load-hero.jpg first, then the 9 slides; the existing .nu-artlayer
  crossfade rotates them every CYCLE_MS=7000. Verified: layer count 10, on-index
  advances (hero "Amchi Mumbai" brush art -> comic-style slide), zero pageerrors.
- **Menu bar redesign:** replaced the right-docked opaque vertical panel with a
  bottom-docked horizontal glass bar (.nu-menu-panel: row flex, centered, rounded,
  backdrop blur), animated in from below. Key hints centered below the buttons; Exit
  styled as a dark-red "leave" button.
- **CRITICAL PAINT-ORDER BUG found:** the Credits/Exit labels kept rendering faint in
  screenshots while computed styles said white/opacity 1. Cause: the .nu-title::after
  frost patch (a pseudo-element = LAST child in tree order) painted ON TOP of the
  menu panel, dimming its right end. Fix: z-index on the panel (later removed with
  the patch itself). Lesson: pseudo-elements paint after an element's children.
- **Baked-in menu removed from the art (brand/menu-title.jpg):** after failed attempts
  (CSS frost = muddy smudge; synthesized sky fill = color mismatch + streaks), the
  working recipe is: blur the baked-menu region IN PLACE (16x downscale/upscale) and
  blend it 88% toward a per-column sky color sampled from the CLEAN band between the
  art's logo bottom (y 38%) and the menu top (y 44.5%) - earlier attempts failed
  because the sample band caught the logo's yellow. Rect-based feather (50px) with
  alpha=1 over the whole menu rect. brand/menu-screen.orig.png kept as the untouched
  backup; _paintout.cjs is the tool (runs the pixel work in a headless Chromium canvas).
- **Title layout now:** slim bottom-centered menu bar (brand row moved out; place()
  uses left 48% for breathing room) + right-docked .nu-title-card (right/bottom 22px,
  min-height 252px) carrying brand row, tagline, control keys, rotating flavor line
  and the CC-BY credit - it covers the treated menu block so nothing peeks out.
  Vision-verified 8/10: no artifacts, no overlap, zero pageerrors.


## Phase 8 round 7 - new title art, carousel-first loading, menu polish (COMPLETE)
User round-7 requests: do NOT use the "Amchi Mumbai" hero on initial loading; fix "I see
2 menus" (their screenshot showed the OLD menu-screen.png with its baked-in New Game/
Continue/Load list plus our bottom bar - taken mid-iteration); keep the bottom menu and
leave ample space for a Continue CTA; use "Mumbai Sunset Comic Collage.png" as the menu
art with the menu kept at the bottom, UI improved.

- **Loading:** LOAD_ART no longer contains load-hero.jpg - the rotation starts at
  carousel/slide-1.jpg (comic collage). index.html #boot background also switched to
  slide-1.jpg so the very first frame is collage art. Verified: loading shows collage,
  no menus.
- **Title art:** brand/title-collage.jpg (1672x941 JPEG q87, 550 KB, from the user's
  "Mumbai Sunset Comic Collage.png" - converted in headless Chromium canvas). .nu-title
  background -> /brand/title-collage.jpg. That art has NO baked-in menu, so the
  two-menu problem is gone by construction; the menu-screen.png treatment pipeline
  (menu-title.jpg) is retired but kept on disk.
- **Title layout:** back to ONE bottom-centered bar with the brand row restored inside
  it (emblem + "BAMBai", matching the art's capitalization - text-transform removed).
  The right-docked info card was removed; the CC-BY credit is now a small glass pill at
  the lower left (.nu-title-credit). place() uses left 48% so the wider bar keeps
  distance from the right edge.
- **Menu UI polish:** bar font 1.22em, buttons .6em x 1.1em padding with .65em radius,
  PLAY at 1.24em with glow, key hints .84em at 90% white, glass gradient + inner
  highlight. Continue CTA space verified by injecting a fake Continue button: the bar
  grows to 1197px in ONE row (no wrap) with margins left and right - ample space.
- **Verified (Edge headless + vision):** title 9/10 (single menu, polished bar, readable
  credit pill, zero pageerrors); loading starts on collage art.

## Phase 9 round 1 - loading-stuck bug fixed (COMPLETE)

User report: "the game is not loading completely, it gets stuck on 14% or 68%".

- **Root cause: a crashing boot, not a slow load.** `pageerror: varm is not defined`.
  The Koramangala Day drum-screen texture builder called `varm(...)` where it should
  call its own text-fit helper `m(...)`. `var m` + `m(` had been mangled into `varm(`
  somewhere upstream - `_source/drum-screen.js` is byte-identical to
  `vendor/drum-screen.js`, so the typo shipped in the captured original, and it fires
  during city/texture build on our boot path.
- **Why it looked like a stall at 14%/68%:** the boot promise rejected, so `ha()`
  progress stopped where it was while the nu-loading tip carousel kept cycling forever.
  The loading screen never errored visibly - it just never finished.
- **Fix:** `_fixvarm.cjs` rewrites the single `varm(` -> `m(` in both
  `vendor/drum-screen.js` and `_source/drum-screen.js`.
- **Second bug found while verifying:** 404 `vendor/road-wear.worker-CCso-3Nz.js`
  (that worker chunk was never captured) produced a `[wear] worker failed` warning.
  Road wear is a cosmetic tyre-track/oil texture that `city.js` gates on `rwOn`;
  when the worker never posts, `rwOn` stays 0 and the shader skips it. Shipped a
  documented no-op stub at that path (`_mkworker.cjs`) so behaviour is identical
  minus the 404.
- **Verified end-to-end (headless Edge, 1366x636, cold cache):** boot reaches
  `window.__boot = {page 2566, models 3378, city 48536, world 4940, people 2297,
  systems 2178, warmup 24561, total 88456}` ms; title menu paints at ~80 s;
  clicking Play enters the world at ~88 s with mission `arrival` running, HUD and
  bus present, **zero pageerrors and zero failed requests**. Screenshots:
  `shots/loadfix-title.png`, `shots/loadfix-ingame.png`.
- Note: the city build logs `[atlas] baked city is stale (layout changed)` and the
  far-field shows flat impostor swatches. That is pre-existing atlas-bake drift,
  unrelated to loading, and still on the Phase 8 list.

## Phase 9 round 2 - Chapter 2 fully verified organically (COMPLETE)

Rebuilt the test harness (the previous _ch2*.cjs drivers and _ch2-missions.js source were
lost; the missions themselves were intact in vendor/game.js - all 10 ids present).

**One real design bug found and fixed in the mission itself:**
- `ch2-tail` ("Follow the Water") was **unwinnable**. The stealth rule fails the player
  within 4.5 m of Putta while standing, and Putta parks ~2 m from the sluice gate, but the
  progress trigger was `reach(sluiceGate, {radius: 10})`. From the legal 8-25 m follow band
  you sit ~15 m from the gate, so the reach never fired; stepping closer tripped the spot
  check. Widened the reach radius to **26 m** (`_fixtail.cjs`) so the objective completes
  when Putta arrives - which is what the mission means. Bundle re-parses clean.

**Verified: full organic Chapter 2 playthrough** (`_ch2organic.cjs`, headless Edge):
seeded `nammauru.save.v1` -> title showed **Continue** -> clicked it -> played every
mission by walking into the game's own offer markers (no `replay()`), each ending in its
own cutscene and handing off to the next:
  ch2-contact -> ch2-tail -> ch2-copy -> ch2-stand -> ch2-rain -> ch2-nakabandi
  -> ch2-mall -> ch2-dawn
FINAL: `next: 16`, `money: 11900`, `best` = all 8 ids, **zero pageerrors**. Rewards were
paid on the real (non-replay) path, confirming `e.reward && !replay` works.

**Both Chapter-2 side stories verified** (`_sides3.cjs`, `_tiffin2.cjs`):
- `side2-chappal` ("The Chappal Ledger"): food street -> tea stall -> auto stand -> boss
  -> recorded in `save.side` AND `save.best`, +750.
- `side2-tiffin` ("The Tiffin Thief"): recorded in `save.side`, +620.

**Driver know-how discovered (important for future tests):**
- `g.npcs` is a **`Set`** - `Object.values()` returns nothing. Always
  `src instanceof Set ? [...src] : ...`.
- Direct writes to `player.position` are **reverted by physics**; use
  `player.teleport(new __THREE.Vector3(x, y, z), heading)`.
- The "Skip / tap for next line" element is a **hint, not a button** - clicking it does
  nothing. Cutscenes advance by letting lines play or holding Space; choices live in
  `.nu-choice button`.
- Offer markers only fire when **armed**: the blip arms when you are >5 m away, then
  triggers inside 3.5 m. Teleporting straight onto it can miss the start - approach
  gradually from >5 m.
- A failure dialog shows `1 Retry from checkpoint / 2 Restart / 3 Quit mission`; clicking
  Retry blindly loops forever.
- `save.best`/`save.side` are only written from the success path in `Vg.run`, so a pass
  that ends without those entries did not actually succeed.
