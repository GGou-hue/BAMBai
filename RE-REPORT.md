# BAMBai — Reverse-Engineering Report
**Target:** https://BAMBai.com/play/ — *BAMBai, Chapter 1: Koramangala*
**Goal:** rebuild as a local Three.js game using the game's own assets, then apply requested UI/UX changes.

---

## 1. What the game is

An open-world, third-person 3D browser game set in a condensed, stylised Koramangala
(BAMBai). You play **Arjun**, a new delivery rider. Real street layout from OpenStreetMap,
live BAMBai time + weather, Hybrid-L voice lines, 18 drivable vehicles, 12 missions,
odd jobs, police "Scene" meter, 5 radio stations, photo mode and clip recorder.

Everything runs in one browser tab. No account, no install. Progress in `localStorage`
(`nammauru.save.v1`).

---

## 2. Tech stack (confirmed from the shipped bundles)

| Layer | Technology |
|---|---|
| Build | Vite (ES modules, hashed chunks, `__vite__mapDeps` preload map) |
| 3D | **Three.js** — split as `three.core` (377 KB) + `three.module` (365 KB), plus addons: `BufferGeometryUtils`, `Pass`, `SMAAPass` |
| Renderer | Fully custom `Renderer` class (`render.js`): SMAA post pass, custom sky shader (gradient keys + cloud ring + sun/moon scatter), planar reflections, occlusion camera, screen-space grading (saturation/contrast/lift/gain/vignette/bloom per hour) |
| Physics | **Rapier** (WASM, SIMD-detected: `rapier-BjCOQHbJ.js` / non-SIMD fallback), kinematic bodies for peds, dynamic for vehicles |
| Characters | Skinned GLB + shared `anims.glb` animation library, runtime garment tinting shader (recolors top/bottom per NPC) |
| Textures | KTX2 (Basis) atlases + JPG fallbacks, custom texture-array material with per-tile tint/rough/metal/grime/wear uniforms |
| Audio | WebAudio graph, 269 sound groups, WebM/Opus music with MP3/OGG fallbacks, engine loops, ducking, offline-render check |
| UI | Hand-rolled DOM over the canvas (`#ui`), CSS custom properties, three fonts (Big Shoulders Display, Inter Tight, Baloo Tamma 2) |
| Telemetry | `analytics.js` — anonymous counters (`play_pressed`, `mission_started`, …), no accounts |

**Verified build facts**
- `Renderer` requires WebGL2; quality presets `low|high` (localStorage `quality`), auto-downgrade on old machines.
- Gate screens for: phones (touch), no-WebGL2, no-WASM, context-lost recovery.
- Fetch wrapper retries asset GETs at 600/1500/3000 ms and verifies content-length (short-body retry).

---

## 3. The city (map.js, 1.4 MB of data — the heart of the game)

- **Geo origin:** `LAT0 12.9345, LON0 77.6113` (Koramangala), scale `0.5` (the map is squeezed),
  radial compression falloff `R1 250 → R2 500` (0.65→0.5) so the neighbourhood fits a game.
- **Bounds (game units = metres):** `x −793.9…793.9`, `z −700.1…1059.4` ≈ 1.6 × 1.8 km.
- **Road graph:** ~1123 edge tuples, ~963+ named real roads (Hosur Road, ORR, Sarjapur Road,
  80 Feet Road, Silk Board Flyover, …), ranks, widths, medians, lanes.
- **Structures:** Madiwala **underpass** (trench, depth 5.5) and **Silk Board flyover**
  (height 7.2, rampTo 852.1) — both are real geometry, not props.
- **Lake:** Sampige Kere with water plane at `y −0.55`, bund path, sluice gate, survey pegs, drain inlet.
- **Blocks/footprints:** building footprints with zone styles (`packed`, `leafy`, `road`, `metro`…),
  parks, parking lots, footpath network with breaks.
- **PLACES (named POIs):** Shobha Aunty's PG, Hotel Sampige Darshini, Canopy Heights Tower C,
  auto stand, Sri Sai Xerox & Notary, Nimma Sites & Layouts (broker), Pipeline Putta's tanker depot,
  Twist Brewing Co., Junction Square mall, Rain Tree Hospital, Arogya Nagar Medical College,
  police outpost, night checkpoint, neighbourhood park, 5th Block food street, bus stops,
  tea stall, Thaatha Kamba, Babu's Bar, Syrup, Bijli World Signal, Aata Mantapa Indoor Stadium,
  Deepa Nivas College, SparkWerk Campus, Koramangala Vanijya Sankeerna, Tamra House,
  Madivala Santhe, money centre, and more.

---

## 4. Assets recovered (all downloaded, ~180 MB)

| Folder | Contents |
|---|---|
| `assets/chars/` | 25 GLBs — arjun, kavya, nikhil, mani, leela, shobha, colonel, putta, goon, goon2, police, office_m/f, student_m/f, driver, mechanic, techie, young_f, lungi_b/c, saree, **anims.glb** (animation library), **dog**, **cow** |
| `assets/vehicles/` | 18 GLBs — auto, scooter, delivery, motorbike, policeBike, hatchback, sedan, taxi, suv, police, minitruck, tanker, garbage, bus, schoolbus, ambulance, towtruck, firetruck |
| `assets/props/` | 86 GLBs — tea stall, coffee cart, street lamps, traffic signal, bus shelter, benches, carts, barricades, cones, water tanks, dish/aerials, clotheslines, substation, … |
| `assets/nature/` | grass, flower_white/blue/yellow, rock1–3 |
| `assets/trees/` | **trees.glb** (5.4 MB multi-tree library: raintree, gulmohar, ashoka, palm, bush, jacaranda, frangipani, banana…) + **nature.glb** (5.1 MB) |
| `assets/city/` | trees.glb (city tree set) |
| `textures/atlas/` | city, lmsign, t2sign, decal, foliage, leavesfar, vdetail (KTX2, baked atlases) |
| `textures/surfaces/` | col/nor/rgh (9.3 + 6.7 + 1.2 MB KTX2) |
| `textures/<material>/` | 15 materials × color/normal/rough KTX2 (asphalt3, bark, brick, concrete, corrugated, dirt, fabric, grass, ground, metal, plaster, plaster3, rock, tiles, wood) |
| `textures/leaves1|2|4/` | color + opacity JPGs |
| `textures/decal_patches|potholes|leak/` | color + opacity JPGs |
| `textures/sky/` | keys.png (day-cycle gradient keys), clouds.webp, ring.webp |
| `audio/` | manifest.json (269 sound groups, 7 stations) + 66 WebM/Opus files — music: gully, hale, hustle, kempu, silkboard, score, event |
| `fonts/` | 9 WOFF2 (Big Shoulders Display, Inter Tight, Baloo Tamma 2) + fonts.css |
| `brand/` | logo SVG, landing screenshots, favicon |
| `_assets/` | the original 79 minified JS/CSS chunks (exact originals) |
| `_source/` | the same 77 modules, renamed to readable names |

> Note: 24 "missing" character GLBs 404 on the server — they are **runtime tint variants**
> of the base models (e.g. `ped_office_m → office_m`), so the base set above is complete.
> `art-textures/*.webp` are only fetched in `?bake` (atlas-baking) mode — not needed to play.

---

## 5. Gameplay systems (reverse-engineered)

### Vehicles (18, all drivable)
Per-vehicle physics spec — e.g.:
- auto: mass 420, top 17 m/s, accel .4, grip .6
- scooter: 115 kg, 22 m/s, two-wheeler
- motorbike: 140 kg, 36 m/s
- sedan/taxi: 1100 kg, 40–42
- suv 1750, police 1850 (46), bus 11000 (24), tanker 9000, firetruck 12000, ambulance 3200…
- Paint variants per model, seats, wheel rigs, `vdetail.ktx2` detail atlas, clearcoat paint shader.

### Characters
- 25 base skeletons + shared `anims.glb`; retargeted mixer; idle poses (relaxed/phone/folded/talk/yes).
- Garment shader recolors top/bottom per NPC from palette (uTop/uBot uniforms).
- Ped variants (`ped_office_m`, `ped_saree`, `ped_delivery`…) = base + tint + height.

### Police / "Scene" meter (the wanted system)
Levels: **Whistle → Challan → Nakabandi → Breaking News → Full Scene**.
Chases, checkpoints (`policeOutpost`, night `checkpoint`), the escape-route cheat clears it.

### Missions (12 = 8 story + 4 side)
Story ids found: `arrival` (Shobha Aunty's PG), `xerox` (Xerox and Notary),
`lake` (The Lake Doesn't Lie), plus `opening` and `ending` (The end of Chapter 1).
Side ids: `terrace`, `onebhk`, `cart`, `juice`, `parking`, `loop`, `sprint`.
Mission runtime: start card → hint → objectives (`reach`, `cutscene`, `say`, `choice`,
`place`, `shot`, `two`) → reward → best-time save → inbox messages → next offer with route line.
Dialogue is fully scripted Hybrid-L with choices that change bond + money.

### Odd jobs (press T in the right vehicle)
Ambulance → paramedic, fire engine → firefighter, police → vigilante, taxi → cab runs.
Every level pays more. Healing: first-aid kit or filter coffee.

### Weather & time
- 24-hour cycle with hand-authored keyframes (zenith/horizon/glow/ground/sun colors, exposure,
  fog density, lamp intensity, cloud lit/shade, saturation/contrast/lift/gain/vignette/bloom).
- Live BAMBai weather (`weather.js`): rain surge (+25% delivery pay), storms, `floods` mode
  (a flood-trigger cheat) that floods the low roads.
- Festival calendar (Dasara, Ayudha, Rajyotsava, Diwali) with event processions + music.

### Radio
5 stations + score: gully (8 tracks), hale (12), hustle (11), kempu (13), silkboard (7),
score (explore/night/chase/tense/title), event bands (baraat, nadaswaram, ganesha, karaga…).

### Cheats (typed as English phrases)
A set of typed English cheat phrases (see the cheats definitions in `vendor/*.js` for the exact words; cheat names in this report intentionally omit the legacy Hybrid-L spellings).

### Modes
Photo mode (**O**, freezes the street), clip recorder (**B**, last 15 s → video),
controller support, remappable keys, save-file export.

---

## 6. Rendering architecture worth copying

1. **Texture-array material** — one material for nearly all static geometry; per-instance
   tile index + tint + rough/metal/grime/wear/bump. Atlases baked offline (`bake-atlases.mjs`),
   shipped as KTX2 with hash-verified manifest.
2. **BatchedMesh + instancing** for props/trees; **occluders** module + batch culling for draw-call control.
3. **Tree LOD** — near: real geometry; far: baked billboard "cards" rendered from 8 views into an atlas.
4. **Custom sky** — gradient from `keys.png`, cloud ring from `clouds.webp`, sun/moon scatter,
   env-cube PMREM for reflections, all driven by the hour keyframes.
5. **Ground** — `surfaces` texture array + splat shader (dust, leaf litter, trampling, road strips).
6. **Post** — SMAA + grading (per-hour color science).

---

## 7. Risk / legal notes

- All 3D models are CC-BY (Sketchfab) per the in-game credits; textures/code are the dev's own.
- Names/brands in-game are parodies; we keep that stance.
- We are rebuilding **with the game's own assets for a private/local project** — the credit
  list (`menus.js`) must ship with our build.
