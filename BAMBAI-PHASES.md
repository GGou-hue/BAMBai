# BAMBAI — Production Phases for *The City Keeps Secrets*

Planning document for the four-protagonist campaign in `BAMBai_Four_Protagonists_Complete_Story_and_Production_Bible.md` (1975 lines, your document) on top of the shipped build. **No code written yet.**

**Build today:** 2 chapters live (Creek Files), Ch 3 "Eleven After Eleven" built, real OSM South Mumbai (Kolvada → Fort/CSMT → Crawford Market → Backbay), 5 MMR zones planned (A South, B Central, C Western, D Harbour, E Thane–Kalyan), liveries Mumbai'd, 37 WAVs re-recorded, `toniqueDip` fixed.

---

## 0. What the new bible changes vs what shipped

| Axis | Shipped build | Four-protagonist bible |
|---|---|---|
| Protagonist | One (Arjun) + cameo Meera/KB/Leela/Kavya/Putta | **Four selectable leads**: Aarav (Crime Branch), Arjun (courier), Naina (SI), Meera (harbour) |
| Chapters | 3 (12 missions) | **20 chapters · 48 core missions** (M1–M48) |
| Story | Operation Clean Shore unfolds linearly (Creek Files arc, Darshini/Moti Haar) | Same conspiracy, **four lenses**; Salvi's body opens Ch 1; contamination is the spine |
| Tone | Warm chai-coloured gully noir | Darker: investigation, procedure, institutional rot |
| Endings | 4 (The Paper / The Empire / The Lake After All / Rakshasa) | **4 × 4 character-specific endings** (A The Paper · B The Badge · C The Empire · D The Rakshasa) |
| Infrastructure | Chapter cards, bonds, cricket night, phone | + **Case board, evidence chain, interviews, warrants, CCTV/forensics, police-station interior, forensic lab, 4 prologues, `?lead=` chargen** |
| Side content | 4 shipped (`side-biscuit`…`side-potholes`) + 8 designed = **S0–S11** | Same + **12 detective side cases** (Last Fare… The Last Local) |

**Reconciliation principle:** the shipped Creek Files arc *is* the Arjun route of the new campaign. Nothing gets thrown away; the build gets wrapped in four lenses.

---

## 1. THE PHASES

Every phase ships to the 8485 preview; every phase has acceptance criteria and a rollback that doesn't break the current build.

### P0 — Decisions gate (you, 1 session)
1. **Adopt the four-lead branch?** (The bible itself flags it "a proposed direction… branch until implemented"). If no → continue single-lead Arjun and this whole document shrinks to Ch 4–12 of the Creek Files arc.
2. **Which leads ship in v1?** Recommend **Arjun + Meera** in the slice (they exist partially), **Aarav + Naina** added in P3–P4.
3. **Ending count for v1:** all 4×4 (bible) or 4 shared endings for launch with character-specific epilogues?
4. **Radio tower canon:** Churchgate Akashvani House is the real anchor (verified, below); the transmitter mast(s) are fictionalised. Approve fiction names (below).
5. **Save migration:** v1 → v2 format; Creek Files saves carry over (`next:11 → chapter 4 start, arjun only`).

### P1 — Reconciliation & data model (1–2 wks, no gameplay change)
- Map every shipped mission onto the 20-chapter skeleton (see §2).
- Extend mission schema: `{id, chapter, lead(s): ['arjun'|'meera'|'aarav'|'naina', ...], exclusive: bool, lenses: {arjun:{…}, …}}`.
- Save v2 (`{v:2, lead, chapters[], evidence[], caseBoard{}, bonds{}, endingsSeen[]}`) + v1→v2 migrator.
- Lead-switch save-store (already tracked `leads.arjun` in the bible; new fields).

**Acceptance:** existing build plays identically after migration; `?mission=11` resumes at Ch 4 for Arjun.

### P2 — Vertical slice: "The Body at Backbay" (3–4 wks) — *the bible's Phase 2, made real*
One dense Fort/Backbay district (the shipped map box) +:
- **Character select** at new game (`CHOOSE YOUR STORY`, 4 portrait cards, Leela VO hook) — Arjun fully playable, Aarav/Naina/Meera as selectable *stubs* (prologue + first crime scene only).
- **One complete crime scene** — Backbay tower: perimeter tape, photo-before-touch, evidence objects, **Dr Farah** consult, case-board update.
- **One interview** with branching dialogue (Leela at the xerox — reuses the shipped xerox scene as the tutorial interview).
- **One case-board deduction** (The Meridian Times connection).
- **One short chase** per lead (Fort Run / Delivery Window / The Wrong Train / Black Water) — reuse the existing vehicle/chase code.
- **One mission variant per protagonist** for the same crime scene.

**Success test (from the bible):** four characters feel different within 15 minutes.

### P3 — Aarav route complete (2 wks)
- Voice Aarav + Naina (new GLBs `aarav.glb`, `naina.glb` — currently only `arjun/kavya/meera(saree)` exist).
- Police-station interior (`inside('policeStation')` via existing `inside()` POI system + a new interior landmark).
- Evidence room + interview tree + warrant system (Aadhaar-style call-log unlocks).
- His Ch 1–3 path replacing/parallel to Arjun's (same wound: Sameer Koli witness leak; Salvi's file is his ghost).

### P4 — Naina route complete (1–2 wks)
- Evidence chain-of-custody UI (seal photo → access log → CCTV reconstruction).
- `authorised-access` mission (the overwritten 03:11:42 event from the bible's prologue).
- Parallel evidence chain vs Aarav's institutional chain — shared milestones, different solutions.

### P5 — Meera route complete (1–2 wks)
- Boat handling on the real OSM coastline (already built; `boat` vehicle class + channel navigation + wake model).
- Harbour prologue "Low Tide" + the drum + wrong-manifest.
- Bai Firoz darshini arc; `second gate` / `tide windows` unlocks.

### P6 — Full campaign: 20 chapters (6–8 wks)
All 48 missions across the four leads (shared milestones vary by lens per bible §3 table). Map onto the 5 MMR zones A–E as they unlock:
- A Fort/Kolvada (Ch 1–5, done-ish) · B Central Line Dadar→Sion (Ch 5–7, P4 of old plan) · C Western Bandra→Andheri (Ch 8) · D Harbour/Navi Mumbai Vashi→Belapur (Ch 12–15) · E Thane→Kalyan→Dombivli→MIDC (Ch 12–14) · Panvel (Ch 18).
- Zone D+E need new OSM extracts (pipeline exists: `osm2map-stage*.mjs` + `fetch-osm.ps1`; Overpass works from this sandbox with retries).
- **Acceptance:** every chapter completable on Arjun; spot-check Naina/Aarav/Meera paths; 4 endings reachable.

### P7 — Side content in depth: **S0–S11** (2–3 wks; see §4)
Full write-ups for all 12 side missions (currently 4 shipped + 8 designed, mostly stubs). Each: giver, location, objective, gameplay beats, reward, VO notes, fail state, and **radio-tower tie-ins** where relevant. Plus the 12 detective side cases (bible §13) as an "Aarav's Casebook" activity.

### P8 — Radio towers & the living airwaves (1 wk; see §5)
Akashvani House (Churchgate) as the Zone A anchor; the Moti Haar mast; relay towers in B/C/D/E; **Bambai After Dark** pirate broadcast; radio-discovery activity expanded; `The Signalman` side case; stations react to story state.

### P9 — Polish & VO (2–3 wks)
Cop-radio/whitefield/goon WAVs already re-recorded with SAPI; re-voice with humans for v1.0; subtitle pass; traffic profiles; crime-scene tuning; chase cam; perf budget (<90 s boot); `?lowspec`.

### P10 — Launch (1–2 wks)
Save migration v1→v2 final; `?chapter=`/`?lead=` deep links; chapter-end vote walls; analytics (`chapter_started`, `mission_complete`, `ending_chosen`); press kit.

**Total ≈ 19–24 weeks solo; 12–14 with a small team.** Every phase shippable.

---

## 2. Story reconciliation — where the shipped missions sit in the 20 chapters

| Shipped id | Becomes | Notes |
|---|---|---|
| `arrival` ("Shobha Aunty's PG") | **Ch 1 prologue Arjun route** ("Last Delivery" parallel) — kept as Arjun's exclusive opener; Aarav/Naina get their police prologues instead | Arjun's father Veer is a digger of the Salvi file; Arjun carries the envelope/Salvi connection unknowingly |
| `first-order` (FoodDash) | Ch 1 side warm-up | Teaches driving/timer |
| `wrong-order` (birthday vs biryani) | Ch 1 connective tissue | The "white shirt changed the route" beat |
| `meter-mele` (Meter Plus Half) | **Ch 3** (bible retains "Eleven After Eleven" ids) | Meera's first appearance retained |
| `xerox` (Xerox and Notary) | **Ch 2** "Paper Trails" core — Leela's machine; the copies | Aarav interviews Leela here (lens variant) |
| `old-friend` (Pipeline Putta) | **Ch 2** side-integration | Water/tanker red herrings; creek contamination seed |
| `ee-sala` ("Is Baar Night") | **Ch 5** "The Match Fix" — cricket night, PUNERI MASALA | KB betting network; crowd-reaction radio hook |
| `lake` → `creek` (The Creek Doesn't Lie) | **Ch 6** "The Harbour War" + Ch 1's stakeout seed | Rekon: Retibandar Creek = the contamination site |
| `eleven-tonight`, `press-matter`, `peg-man` (built) | **Ch 3** verbatim | The bible already canonises these ids |
| `side-*` ×4 (shipped) | S0, S3, S4, S8 (see §4) | Renamed canonically below |

**The bible's Ch 1 (Salvi murder) becomes the shared opening** — every lead's prologue feeds it. The shipped Ch 1–3 stay as the **Arjun route**; the other leads get parallel crime scenes on the same Fort tower.

---

## 3. Four-lead implementation sketch (P2–P6)

| System | Build today | Needed |
|---|---|---|
| Lead select | none (Arjun default) | `chk`-style chargen cards + 4 portraits (reuse `UI-*` card art style) |
| Leads | Arjun (+ cast NPCs) | `aarav.glb`, `naina.glb` new; Meera = `saree.glb` placeholder until art |
| Prologues | Arjun implicit | 4 × 8–12 min scripted (Aarav: "Call Time" · Arjun: "Last Delivery" · Naina: "Evidence Room" · Meera: "Low Tide") |
| Evidence | `xerox` mission flag `?pegs` | `evidence[]` store: id, name, lens-visible, case-board link, custody chain |
| Case board | none | Pinned strings on the shop/station wall (canvas art via existing sign generators) + deduction unlocks |
| Interview tree | single `e.choice` | branch-weighted dialogue with `subjectMood`/`trust` |
| Police interior | `inside('pg')` only | `inside('policeStation')`: duty desk, lock-up, evidence room, fan wobble, wireless chatter — mostly re-skin of the PG interior kit |
| Forensics | none | Farah at the tower; evidence photos; `camera` sfx exists; fibre cast etc. |
| Save | `{v:1}` | `{v:2}` with lead + evidence + caseBoard; migrator `Lg()` → `migrateV1()` |
| Lead switch | none | `?lead=` param + Ch 6+ phone app after `three-strangers` |

---

## 4. SIDE MISSIONS S0–S11 — in depth

The 12 side missions. Shipped ids marked ✅; all others authored from the bible §4/§13. Each entry: giver · place · objective · beats · fail · reward · VO/audio notes.

### S0 — "Biscuit Is Missing" ✅ (`side-biscuit`) — GIVER: Colonel Uncle · PLACE: `park` · 12:00–18:00
A retired colonel's biscuit tin is missing from his park bench; three suspects (a dog, a vendor, a schoolboy). Interrogate with 2 dialogue choices; the dog "confesses" via paw prints; tin found in the hedge. **Beats:** tutorial for interrogation; colonel's war stories; reward 150 + Bond: COLONEL +2; fail state = accuse the wrong one (no game-over, just colonel disapproval). VO: Colonel Uncle (already voiced in WAV set).

### S1 — "No Guests After Nine" ✅ (`side-guests`) — GIVER: Shobha Aunty · PLACE: `pg` · 21:00–23:00
Someone keeps sneaking into the PG after curfew. Stakeout from the stairwell: 3 nights, 3 decoys (Nikhil smuggles in rasam, a stray cat, a delivery boy). Identify the real culprit via a phone-screen prop + 2 questions. **Beats:** stealth sightlines; reward 200 + Bond: SHOBHA +2; unlocks Nikhil as raid backup.

### S2 — "Meter Inspection" ✅ (`side-meter`) — GIVER: Auto Ramanna · PLACE: `autoStand` · 09:00–12:00
A RTO inspector is at the stand; Ramanna's meter is "fixed" (honest!). Bluff the inspector with 2 dialogue choices + 1 driving demo (smooth stop). **Beats:** reversing witness intimidation; reward 180 + Bond: RAMANNA +2; unlocks meter-haggle discount at the stand.

### S3 — "Pothole Census" ✅ (`side-potholes`) — GIVER: Gopal Uncle · PLACE: `foodStreet` · daytime
Map 6 potholes on the food street on the PDA; each mapped pothole = a complaint Gopal Uncle mails to the ward office. A rival builder's man tries to block you 3 times — satisfy him with chai or dodge. **Beats:** map pinning mechanic; reward 220 + Bond: GOPAL +2; unlocks pothole as cricket-ground shortcut.

### S4 — "Five Hundred Pav" — GIVER: Leela · PLACE: `xeroxShop` · 07:00–10:00 (chai rush)
Deliver 500 pav-bhajis from the bakery to the xerox-side crowd before the 8:30 office rush; vehicle = bicycle with tray (new `bicycle-tray` variant or `scooter`); 2 routes (coastal fast/through-gully slow); one traffic-block event. **Beats:** route-planning timer; reward 260; Bond: LEELA +1; unlocks free pav with her order.

### S5 — "Chai for the Ward" — GIVER: Hospital ward nurse · PLACE: `hospital` (Rain Tree Hospital) · 17:00–19:00
Deliver chai + a phone message to Ward 8 before the nurse's shift ends; floor choice (lift/stairs), 2 patients to pamper; a Rakshas-adjacent visitor tries to slip a file into a patient's bag — decide whether to intervene (Bond fork: NURSE vs PATIENT). **Beats:** moral fork; reward 180; Bond fork; unlocks ward shortcut.

### S6 — "Tag Six" — GIVER: Kranti (Gully Indie lead) · PLACE: `vanijya` (Bambai Vanijya Sankeerna) · night
Paint 6 graffiti tags across the mall's service corridors without the guards; each tag = 2 min window; use rooftop drop + shutter gap; spotted → bribe 500 or leg it. **Beats:** stealth-platforming; reward 240; unlocks shortcut through the mall; Bond: KRANTI +2.

### S7 — "Month-end Math" — GIVER: Nikhil · PLACE: `pg` · 20:00–24:00
Survive the month: rent ₹9,000 (day 15), Pinky's hostel fee ₹2,000, food, and a loan shark's ₹500 "interest". Earn via 3 delivery jobs + 1 haggle + 1 emergency favour. **Beats:** resource management; failure = Nikhil bails you out (debt grows); reward 300; unlocks PG credit line.

### S8 — "Koli Myths" — GIVER: Grandma Bai (Sivarani? no — the Koli matriarch at the jetty) · PLACE: `lakeBund` (promenade) · tide-dependent
Collect 5 stories from the Koli elder over 5 visits; each story unlocks a harbour shortcut + a boat shade (Koli net cover); last story is a pointed hint about the creek contamination. **Beats:** narrative collection; reward 400 + `lakeBund` shortcut + boat shade; Bond: KOLI +3; required for Ch 6 harbour access.

### S9 — "Bog Ride" — GIVER: Raju (bench racer) · PLACE: `park` · evening
Time-trial the park loop in 3 classes (bicycle / auto / bike); 3 attempts each; best time wins a trophy (UI-BADGE). **Beats:** time-trial racing; reward badge "Bambai Bhairavi"; Bond: RAJU +1; unlocks park shortcut.

### S10 — "The Match Fix" — GIVER: Kabir (bookie) · PLACE: `stadium` (Aata Mantapa Indoor) · match-night
KB's side of the fix: place the marker bet for a client; walk through crowd with the envelope; spot the police inspector watching; escape clean or don't. **Beats:** tension set-piece; reward 350; Bond: KABIR +3; ungates `ee-sala` replay + cricket season 2.

### S11 — "Rooftops" — GIVER: Chhotu (galli kid) · PLACE: `foodStreet` → across rooftops to `xeroxShop` · dusk
Rooftop time-trial: food street → xerox via 4 rooftops; 2 ways per gap; one near-fall; land on Leela's sign. **Beats:** precision platforming; reward 280; Bond: CHHOTU +2; unlocks rooftop fast-travel between the two POIs.

**Every side mission: ≤6 min, replayable from Brief, checkpoint-based. S0–S11 all feed Bonds (so they matter to Ending A/B/C).**

---

## 5. The FM / radio towers — verified facts + in-game use

**Verified (web, Nov 2026):**
- **Akashvani (All India Radio) Broadcasting House / Akashvani House** — H T Parekh Marg, Churchgate, Mumbai 400020; studios + Regional News Unit (news on AIR Mumbai); **FM Rainbow 107.1** is Akashvani's Mumbai FM (Hindi/Marathi/English, Bollywood, news); Vividh Bharati is Akashvani's national service. All India Radio's Mumbai transmitters are co-located in the city but the towers themselves are not in the sources; the studios at Churchgate are the canonical, verifiable site.
- Commercial FM is citywide (Red FM 93.5, Radio Mirchi 98.3, etc.) — no tower landmark is reliably nameable in-game; the bible's rule applies: **fictionalise, keep the recognition**.

**Fictionalised towers (legally safe, recognisable) — to build:**
- **"Akashvani Bhavan"** (Zone A, Churchgate area) — the flagship studio; lobby for the in-game Bambaiya FM flagship show; a mission site (`radio-bhavan`): steal the studio's broadcast log; the "inside" radio POI for the raid arc (ties to *The Meridian Times* corruption plot).
- **"Moti Haar Mast"** (Zone A sea face) — fictional red-and-white lattice mast on the Backbay promenade skyline; the **Bambai After Dark** pirate broadcaster's signal origin; climbable (new `inside('mast')` vertical encounter — the engine's `inside()` system supports it); finale set-piece option for Ch 12 "Vinyl Night".
- **"Sangam Tower"** (Zone C, Bandra) — fictional radio tower in the Bandra skyline; relay for the C-zone races; `The Signalman` side case (bible §13 detective case #7).
- **Relay masts B/D/E** — simple lattice-mast props for skyline silhouettes; not convergable; pure set dressing + one side-ops ping each.

**Story tie-ins (each strengthens the Radio system the game already has):**
1. **`Bambaai After Dark` discovery chain** — collect 7 Radio Jingles → pirate broadcast → the Ch 12 ending vote wall (existing mechanic) gets a radio-clue twist: the DJ "fixes" the ending vote.
2. **`The Signalman` side case** — investigate interference on the mast; the "ghost frequency" turns out to be the Rakshas Group's encrypted peg-order drops (ties S11 to the main plot).
3. **Akashvani Bhavan heist brief** — optional Ch 8 `press-war` variant: steal the studio log instead of burning the press (leaves Arjun clean; changes Ending A outcome).
4. **Radio Reacts to Story** — extend existing `D.canPlay`/`music/` windows: match-night `cricket`, monsoon, `Wanted` chase, `pegs` discovered — all raise/lower station-specific lines (existing hook pattern in `audio.js`).
5. **Akashvani Bhavan as fast-travel anchor** — unlocks after Ch 2; radio as a literal network node (theme: "the city is the network; the tower is its spine").

---

## 6. Risks & decisions for the slice

1. **Effort honesty** — the bible itself warns: four full 48-mission campaigns ≠ what a browser-Three.js build can ship alone. **Vertical slice first**; the full 20 chapters = post-slice expansion, not P2.
2. **The elephant** — the current engine (minified vendor; `?view=city` path is broken per earlier notes) is a single-file commercial build. The four-lead content all wants to live *inside it* — that means either a very careful surgical branch or a parallel rebuild. Decision needed on the tech path.
3. **Meera/Aarav/Naina GLBs don't exist** — `aarav.glb`, `naina.glb`, `meera.glb` (real one, not saree placeholder) must be commissioned/AI-generated.
4. **Zone D/E OSM extracts** — Enfield needed from Overpass (works from this sandbox as demonstrated); ~2 days per zone incl. block tuning.
5. **The four-protagonist bible was written over the Creek Files build** — mission ids in the bible (`eleven-tonight`, `press-matter`, `peg-man`, `is-baar-night`) are the SAME ids the build uses — good, no renames needed. But chapter numbering shifts: shipped Ch 3 = new Ch 3 (same). Ch 1–2 = new Ch 1–2. The extra 17 chapters come after.

---

## 7. Decision questions (need your call before P1)

1. Adopt the four-lead branch for v1? (Default: yes, slice)
2. Ship **Arjun + Aarav** first (both "the case") or **Arjun + Meera** first (both "the streets")?
3. v1 ending count: **full 4×4** or **4 shared endings + character epilogues**?
4. Radio tower names: keep **Akashvani Bhavan** (real anchor) + fictional **Moti Haar Mast** + **Sangam Tower**?
5. S0–S11 order: keep shipped ids (`side-biscuit`…) or renumber canonically (S0=`side-biscuit` … S11="Rooftops")?
6. Zone D+E in v1 or DLC?
7. Who voices Aarav + Naina (SAPI vs human)?
