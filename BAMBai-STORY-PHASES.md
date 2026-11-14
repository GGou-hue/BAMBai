# BAMBai: The City Keeps Secrets — Build Phases

Source: `BAMBai_Four_Protagonists_Complete_Story_and_Production_Bible.md` (user-provided).
Target: the existing Three.js build (`vendor/` engine + `src/` shell + OSM map pipeline).
Convention: phases S0–S11. Each phase ends validated and committed. Sizes: S (<1 wk), M (~1–2 wk), L (2–4 wk), XL (month+). All names fictionalized per house rule; engine keys never renamed.

---

## Canon alignment (what the bible keeps from the current build — verified)

| Bible element | Current build status |
|---|---|
| Rakshas Group / Rakshas House | `rakshasHouse` PLACES anchor exists (renamed `tamraHouse`→`rakshasHouse` this session) |
| Retibandar Creek | lake→creek rename done; creek is on the map |
| Arjun Pawar (delivery rider) | current playable protagonist; his campaign is the embryonic spine |
| Meera "Meenu" Naik | user already added `meera:{model:'saree'}` to cast.js (in-flight) |
| Leela (xerox shop), Kavya (press), Putta, Shobha, colonel, ramanna | all in cast.js |
| Side activities (Biscuit Is Missing, Meter Inspection, The Match Fix, …) | bible §13 lists them as "established" — they are the current side missions |
| Radio stations (Bambaiya FM, Hale Gaani, Bambai Traffic Radio, Gully Indie, Hustle FM, My Radio, Bambai After Dark) | radio system exists; station list matches |
| Kolvada, Mota Bazaar, Moti Haar Marg, Oval Maidan, Fort, CSMT | current map Zone A already covers these (fictionalized) |
| Gubbi (Arjun's hometown, open decision) | bible says "a small town" — Gubbi is compatible; keep pending |

New canon to add: Aarav, Naina (full protagonists), Vikram Salvi, ACP Pradhan, Dr Farah Contractor, Bai Firoz, Shetty, KB, Sameer Koli, Veer Pawar, Meridian Times newsroom, Operation Clean Shore plot machinery, 4 endings + hidden variables.

---

## THE RADIO TOWER NETWORK (user priority — threaded through every phase)

Real Mumbai FM topology, fictionalized:

| Tower (fictional name) | Real referent | Zone | Role |
|---|---|---|---|
| **Varli Prasarayan Tower** ("the Mother Tower") | 300 m red-white Worli Doordarshan lattice tower, 19.007N 72.820E — carries nearly every commercial FM station | north edge of Zone A / Zone B | Master skyline landmark, visible from the whole map; navigation beacon; radio-plot hub |
| **Koliwada Community Mast** (90.0-style college mast) | Chembur college transmitter | Zone D | Low-power community station; harbour-community voice |
| **Bandar West Union Park mast** (90.8-style) | Khar West transmitter | Zone C | Boutique/indie station; money-neighborhood coverage |
| **Kalyan campus mast** (107.8-style) | University campus transmitter | Zone E | Far-suburb station; contamination story leaks here |
| **Malad transmitter site** (MW 1044-style) | AIR high-power MW site | Zone C far north | Night-signal, long-range; "the signal that reaches the whole coast" |

Build thread:
- **S1**: tower meshes (tall lattice mast + aviation lights), placed via stage4 anchors; the Mother Tower enters the skyline panorama (already rebuilt for Mumbai).
- **S1**: radio system extension — chapter-reactive news bulletins (scripted per chapter, TTS via existing `gen-vo.ps1` pipeline), station IDs, DJ segments that reference the player's current chapter/act.
- **Story hooks**: Ch1's "Retibandar. Pegs. Leela." audio clue originates from a tower technician's recording; Ch9 The Burning Press → pirate broadcast from the Koliwada mast when the press is ash; Ch20 Vinyl Night finale broadcasts citywide; tower service rooms as evidence/interior spaces; Naina's CCTV/terminal arcs can intersect the tower's automation room.
- **Open-world**: "Radio station discovery" activity (§13) = visiting mast sites unlocks station lore + traffic-report coverage of the district you're in.

---

## S0 — Canon lock & story-data foundation (M)
- Audit every bible entity against current strings/cast/PLACES (scripted sweep like `find-pinned-art.mjs`); write `reference/story/canon-deltas.md` for every deliberate change.
- Create `story/` data layer: `characters.json` (4 protagonists + NPC matrix), `chapters.json` (20), `missions.json` (48 core IDs from bible §4 + per-protagonist variant table), `dialogue/*.json` (§16.7 line schema: lineId/speaker/textOriginal/textTranslation/voiceAsset/branchCondition/characterVariant), `endings.json` (4 endings + hidden variables §14).
- Engine: data loader + typed accessors; no gameplay change.
- **Validate**: schema checker script; all 48 mission IDs resolve; zero orphan canon strings; `node --check` + mirrors identical.

## S1 — Radio Tower Network + story-reactive radio (M) ← user priority
- Map: 5 tower anchors (table above) via `osm2map-stage4.mjs`; lattice-mast model; aviation lights; Mother Tower added to skyline panorama + `flyover`/landmark layer.
- Radio: bulletin system (per-chapter news copy, en/hinglish, TTS pipeline); DJ segments; station-discovery activity hook.
- Content: Ch1 audio-clue re-recording (technician VO), Act I bulletin scripts.
- **Validate**: towers visible from ≥6 skyline shots; bulletins fire at chapter transitions; anchors probe OK; dump OK.

## S2 — Protagonist framework + character select (L)
- Four protagonist definitions: ability/access matrices (§1 unique gameplay), starting resources, relationship seeds.
- Per-run state: selected character, relationship trust, hidden ending variables (Evidence Integrity, Public Trust, Institutional Loyalty, Personal Compromise).
- Character-select screen (bible §1: four portraits, rain, VO by Leela); four prologue mission stubs ("Call Time", "Last Delivery", "Evidence Room", "Low Tide").
- Map Arjun's existing campaign onto the new `missions.json` spine (his current missions become Act I Arjun-path missions where they fit; deltas documented).
- **Validate**: select each protagonist → correct prologue stub boots; state round-trips; existing Arjun content still plays.

## S3 — Mission framework, evidence & save (L)
- Mission controller driven by `missions.json` (§16.8): objectives, optional objectives, triggers, fail states, checkpoints, consequences.
- Evidence system (§16.6): evidence IDs, inspection text, collection state, chain-of-custody, case-board links; no glow-by-default presentation.
- Case board: confirmed facts / working theory / unverified leads.
- Save system v2 (§16.9): versioned, migration from current format.
- Dialogue pipeline (§16.7) wired to existing subtitle + TTS VO systems.
- **Validate**: one probe mission per feature; save/load round-trip; 0 page errors.

## S4 — Vertical slice: Chapter 1 four ways (L) — bible's own success test
- Spaces: unfinished Backbay tower (crime scene), police station interior (§11 room list), forensic lab interior, market route, one chase (Fort Run).
- 12 Ch1 mission variants (4 protagonists × 3 paths: body-at-backbay/last-delivery/chain-of-custody/low-tide etc.).
- One branching interview; one case-board deduction; one chase with outcome variants.
- **Success test (from bible §18):** four characters feel different within the first 15 minutes. Plus: boot sweep + playthrough sweep extended to Ch1 completion per protagonist.

## S5 — City-life foundation (L)
- Traffic behavior states (§10 list), time-of-day traffic profiles (§10 table), pedestrian routines/state machines (§16.4), monsoon weather, police/emergency response, ambient audio zones, layered traffic audio.
- Performance profiles high/medium/low (§16.10) wired to existing `q` param.
- **Validate**: traffic profile screenshot matrix by hour; FPS budget on low profile; no despawn pops on the sweep camera route.

## S6 — ACT I complete: Chapters 1–5 (XL)
- Missions 1–12 + the four prologues shipped; chapter reveals; Act I cliffhanger.
- Zones: Fort/Backbay/Kolvada/Mota Bazaar/Retibandar in-map; Dadar/Matunga (Ch5) = small map extension north (Mahalaxmi→Dadar, ~19.00) or fictionalized relocation — decision inside the phase.
- Radio: Act I bulletin arc + tower thread (audio clue → Koliwada mast discovery).
- **Validate**: full Act I playthrough sweep per protagonist; all anchors/dump/crossings checks.

## S7 — ACT II: Chapters 6–10 + Zone B map (XL)
- Map: OSM fetch north — Central Line corridor Dadar→Matunga→Sewri/Wadala (bbox to ~19.03–19.05); mill land Lower Parel; rail yards.
- Missions 13–24; world-state changes (Leela's shop burn = persistent scorch state; frozen account UI; case reassignment).
- Radio: Mother Tower bulletins escalate; pirate-broadcast foreshadow.
- **Validate**: new district density checks (reuse inset-tier + crossings validators); Act II sweep.

## S8 — ACT III: Chapters 11–15 + Zones D/E + boats (XL)
- Map: harbour/Navi Mumbai edge (Zone D) + Thane/Kalyan/Dombivli representative districts (Zone E) — compressed per bible §12 (connected playable districts, not 1:1).
- **Boats**: new vehicle class (§16.2) — handling, wake, shallow-water rules; water-route AI; harbour pursuit (Chase D "Black Water").
- Missions 25–36; contamination evidence chain (sample → plant logs → shift records).
- Radio: Kalyan campus mast leaks the contamination story.
- **Validate**: boat handling sweep on creek/harbour; monsoon chase (Chase E); Act III sweep.

## S9 — ACT IV: Chapters 16–20 + four endings (XL)
- Missions 37–48; Ch18 three-routes operation (Chase F — selected protagonist leads, NPC allies run other routes, relationship gates).
- Endings A–D (§14) driven by hidden variables; character-specific ending stings; final "City on Record" sequence.
- Zone C (Western Line) decision: build here OR represent with mission-specific spaces (office interiors + Bandra West mast) — recommend the latter first, full Zone C map as post-1.0.
- **Validate**: ending matrix test (4 protagonists × 4 endings = 16 ending-path checks); Act IV sweep.

## S10 — Side content & living city (L)
- Preserve/adapt the 16 established side activities; add 12 detective side cases (§13 list); open-world activities (street cricket, garage, taxi/delivery jobs, boat work, photography, station discovery, festivals).
- Informant encounters; dynamic traffic incidents; optional witness assistance.
- **Validate**: each side activity bootable via URL harness; no side content breaks story flags.

## S11 — Polish & QA at scale (L)
- VO at scale through `gen-vo.ps1` (new cast: Aarav, Naina, Pradhan, Farah, Firoz, Shetty, KB + DJ/bulletin voices); subtitle QA (Devanagari conjuncts, wrapping, speaker labels, adjustable size/opacity).
- Traffic/forensic/chase tuning passes; performance profiles; save-migration regression; full-map boot sweep (scale `sweep-urls.cjs` to the 5-zone URL set); four-protagonist playthrough sweeps.
- **Validate**: 16 ending paths + 4 prologues + 48 missions green in the sweep; frame-rate budgets on all profiles.

---

## Sequencing decision (needs user)

**Option A — Arjun-spine-first (recommended).** S0–S3 build the framework; S4 slice ships all four Ch1 variants; then S6 completes **Arjun's** Act I–IV path end-to-end first (his existing campaign content is the head start), with the other three protagonists' full campaigns in S12+ phases. Pro: playable, coherent campaign soonest; reuses existing Arjun missions/VO; lowest risk. Con: other three protagonists ship later than the bible's letter.

**Option B — All four simultaneously (bible's letter).** Every act ships all four routes together (S6–S9 as written). Pro: matches the design document exactly; no "two games" feel. Con: first complete campaign arrives ~4× later; existing Arjun content idles while systems catch up.

**Hybrid note:** either way, S2 lands the four-protagonist framework and S4 lands the four-way Ch1 slice — the fork only changes when Acts II–IV get their non-Arjun routes.

## Standing engineering rules (carried from MUMBAI-PLAN)
- Keep `vendor/` + `_source/` mirrors byte-identical; `node --check` before commit.
- Map changes only through the stage pipeline (stage1→23→4) + validators (crossings, anchors, dump).
- Vision-model claims need pixel/geometry verification; long jobs run in background with logs; PowerShell quirks (no inline backticks; UTF-16 redirects).

---

## S0 � DONE (this session)
- Canon audit: `reference/story/canon-audit.mjs` -> `reference/story/canon-deltas.md` (13 found / 31 partial / 15 new). Key finds: Shetty, KB, Veer Pawar already in build; 6 of 7 radio stations exist in vendor/audio.js (only Bambai After Dark is new); genuinely new cast: Bai Firoz, Salvi, Pradhan, Dr Farah; Operation Clean Shore plot machinery new.
- Data layer built: `story/characters.json` (4 protagonists full bible data + 15 NPCs), `story/chapters.json` (20 ch / 4 acts), `story/missions.json` (57 ids = 48 numbered cores + 9 Ch1 parallel-path missions, per-protagonist differences encoded), `story/endings.json` (A-D + hidden variables), `story/radio.json` (7 stations + 5-tower Radio Tower Network with real referents), `story/dialogue/schema.json` + first scene `ch1-the-file.json` (bible �7 fully encoded, 15 lines).
- Engine: `vendor/story.js` (+ identical `_source/` mirror) loads all data; hooked in `src/main.js` under `?story=1` -> `window.__story`. Note: vendor/ is served raw by the vite middleware � no Vite transforms (import.meta.glob unavailable); scene files imported explicitly.
- Validator: `reference/story/check-story.mjs` � OK (4 protagonists, 20 chapters, 57 mission ids/48 core, 4 endings, 7 stations, 5 towers, 1 scene). 12 warnings: bible �3 requires >=3 exclusive missions per protagonist per act; Acts II-IV currently have 0 � shared missions must be differentiated in S7-S9.
- In-engine probe `reference/story/probe-story.cjs`: story handle live, zero page errors.
