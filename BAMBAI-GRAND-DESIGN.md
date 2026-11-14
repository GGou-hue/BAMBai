# BAMBAI — Grand Design Bible
## *City of a Thousand Gullies* — the complete open-world plan

**Audience:** the team (design, engineering, audio, art, VO).
**Status:** Design lock candidate. No code written yet — every item here is a requirement or a plan, not an implementation.
**Supersedes:** the "phases" sketch in `MUMBAI-PLAN.md` and the smaller scope in `BAMBAI-STORY.md` (this doc absorbs it; the story bible stays canonical for prose).
**Rendered in:** web (current), later ports.

---

## 1. What we learned from the reference games (and what we steal)

Sources: Steam/TapTap/IGN/Times Now (Mumbai Gullies, 2022–2024), GTA Wiki/GTA Base (Vice City mission structures), GTA V/Sleeping Dogs/Yakuza design patterns.

| Game | What it proves | What we take | What we avoid |
|---|---|---|---|
| **Mumbai Gullies** | A desi open world can exist; players crave autos, locals, monsoon, Marine Drive, gully chaos | The fantasy: *gully → city*; desi-first authenticity; Marine Drive + rain as set pieces; third-person action | Buggy feel, scope that stalls (it's been in dev for years) — we ship phases |
| **GTA Vice City** | 38-mission story arc + asset missions + side missions; 100% as a hook; cheats; radio licensed music; crime-as-career | **Asset loop** (own the cab, the stall, the boat yard, the printing press); **betrayal midpoint**; radio stations with identity; cheat box; 100% checklist | 80s pastiche tone — ours is present-day, raw, humid, local |
| **GTA V** | 3 protagonists, switchable; heists; 100% cult | **3 selectable leads** with interlocking arcs (below); the heist set-piece; "Strangers & Freaks"-style side encounters | 3-actor scope creep — our 3 leads converge by Ch 5 |
| **Sleeping Dogs** | HK gangster cop fantasy; face XP; minigames as texture (mahjong/karaoke) | **Face XP / Street Respect** (crowd cheer); minigames as mission types (cricket net session, cutting chai stall, kola drink delivery) | cop-undercover dishonesty arc — ours is a courier, not a cop |
| **Yakuza** | Substories with full emotional weight; karaoke; cabaret; "100 substories" as value | **Side missions are real stories**, not fetch quests (no "go here, get that") | absurd length per substory — ours ≤ 6 min |
| **Mafia** | Cinematic, period-accurate-feeling cities | The city *is* the character; no caricature; real OSM geometry as the soul | history lesson pacing — ours is brisk |
| **Watch Dogs** | Phone as gameplay surface | Phone apps drive missions, news, the debt ticker, the bonds HUD | tech-bro power fantasy |
| **Saints Row** | Ridiculous fun + character customization | Chargen at new game; hideous-but-charming vehicle variety | cartoon tone — ours stays grounded with moments of comedy |

**The one rule:** every street, sign, word and sound must be *of Mumbai*, not *about Mumbai*.

---

## 2. World — the whole MMR, honestly scoped

Mumbai Metropolitan Region is ~4,355 km² (Mumbai city ~600 km² + Navi Mumbai + Thane + Kalyan-Dombivli). No single build should pretend to simulate that at GTA V fidelity. **We build 5 zone clusters** connected by bridges, rail and sea, each a playable district with its own density, palette, law and story flavor. Total playable ≈ 18–22 km² — Liberty City scale.

### Zone clusters

| Cluster | Geography | The fantasy | Map phase |
|---|---|---|---|
| **A — BAMBAI CORE** (South Mumbai) | Colaba → Navy Nagar → Oval Maidan → Fort → CSMT → Crawford Market → Marine Drive → Backbay → Haji Ali → Worli Sea Face | The gully. Where the story starts. Chawls, deco towers, the court, the peg shop | **Phase P1–P2** (current bbox extends north: 18.905→18.935→18.975) |
| **B — CENTRAL LINE** (Dadar → Sion → Kurla) | Dadar (East/West), Mahalaxmi, Prabhadevi, Lower Parel, Parel, Sewri, Wadala, Matunga, Sion, Kurla(E) | The working city — mills turned malls, the rail spine, the flood-prone east | **Phase P4** |
| **C — WESTERN LINE** (Bandra → Borivali) | Bandra (W/E), Khar, Santacruz, Vile Parle, Andheri (W/E), Juhu, Chakala, Goregaon, Malad, Kandivali, Borivali, Dahisar | The aspiration belt — Bollywood, BKC glass, Juhu beach, the eve of Bandra | **Phase P5** |
| **D — HARBOUR** (Chembur → Navi Mumbai) | Sewri → Wadala → Chembur → Vashi → Nerul → Navi Mumbai CBD Belapur → Kharghar → Panvel → NMIA site | The machine — cranes, containers, Koli docks, CIDCO's planned grid (contrast: South is crooked, Vashi is a ruler) | **Phase P6** |
| **E — THANE–KALYAN** (Thane → Kalyan-Dombivli) | Thane (W/E, Wagle Estate), Kalwa, Mumbra, Kalyan (W/E), Dombivli (W/E), MIDC, Titwala | The overflow — factories, politics, the last train out | **Phase P7** |

**Scale rules:**
- One district ≈ 2 × 1.5 km. ≈ 90–120 km of road per district → ~500 km total. Like GTA IV (3 islands ≈ 6 km²), not GTA V.
- Sea link (Bandra-Worli, Worli-Haji Ali) and the rail spine are **the seams** — traverse them for realism, unlock them by progress.
- Fast-travel by local train unlocks after Chapter 6 (a nod to how Mumbaikars actually commute).
- Every district re-uses the engine's existing systems (traffic, crowds, weather, night, wrecks) with per-zone density/palette tables.

### Per-zone art direction (Three.js)

| Zone | Palette | Signature | Sky/Fog | Crowd |
|---|---|---|---|---|
| A | ochre/white deco + soot + saffron | Marine Drive curve, CST lace, monsoon drums on tin | monsoon haze gold | dense, footpath-kings |
| B | brick red mills + rail grime + chai steam | Sion skyline, Matunga ration shops, flood pools | smog brown | dense industrial |
| C | glass + neon + Juhu sand | BKC towers, Juhu Sunset, Khar Linking Rd | clear violet (DUSK) | weekend-slick |
| D | containers coral + crane amber | Navi Mumbai grid, Koli net mending, NMIA cranes | harbour cyan | shift-clock sparse |
| E | MIDC grey + factory white + festival red | Dombivli MIDC, Kalyan station, Mumbra night | hazy grey | factory-shift pulses |

Tech per zone:
- **Monsoon engine** (already in-build: `flood-water-10` shader, `trench/basin` meshes, `?floods` hook) → lightning strikes (screen flash + thunder SFX), splashes on vehicles, wet road spec (road-wear worker exists), bus-stop shelter glow at night, Ghatkopar-style waterlogging minigames.
- **Skyline panorama** (exists: `SKY-DAY/DUSK/NIGHT-01` cylinder) → 5 zone variants, one per district (Marine Drive deco arc, CST dome, BKC glass spire, NMIA cranes, MIDC stacks) — generated from OSM silhouettes where possible.
- **Landmarks** (exists: `landmarks.js` generator, `SKY-*`, `LMK-*` art) → 12 hero landmarks across MMR; each anchors a chapter beat (see §4).
- **Rail** (new): 3 local lines (Western/Central/Harbour) as moving POIs with horn SFX + station approach jingles; player can board (rooftop/inside-vestibule set piece — the engine's `inside()` supports interiors).
- **Sea Link** (exists: elevated deck/skywalk system) → Bandra-Worli + Worli-Haji Ali cable-stayed pylons + deck; driving over it = endgame chapter 8.

---

## 3. Characters — three selectable leads

At **New Game → Choose your lead** (GTA-style single POV each playthrough, all three share the world and story):

| Lead | Who | Fights with | Drives | Story stake |
|---|---|---|---|---|
| **ARJUN** (20) | Delivery-rider for BAMBAI EXPRESS; small-town boy, invisible by design | wits, bike, knowledge of lanes | Royal Enfield war-bike, sometimes auto | Dad's defamation case; the pegs on the mudflat; family in Dadar PG |
| **MEERA "MEENU"** (26) | BEST ticket inspector turned harbour smuggler; Koliwada heritage | persuasion, nerve, the boat | BEST bus (stolen), kitchen-cruiser | Her family's fishing jetty is inside the Rakshas Group master plan; the docks are her inheritance to lose |
| **KABIR "KB"** (24) | BAMBAI XI vice-captain, dropped after a throw-fix scandal; bookie for the under-world | bat, glare, street cricket | battered hatchback | His sister's liver transplant deposit; the match-fix tape exists *somewhere* — his sister's surgeon was on it |

**Shared cast (all leads experience):**
- **LEELA** (62) — xerox/notary aunty; the Oracle; her shop is the story's heart ("Cold Prints", original Ch 2)
- **KAVYA** (22) — journalist; prints the exposé; the conscience
- **PUTTA** — Rakshas Group's street face; Arjun's childhood friend; Meera's old BEST colleague; KB's former cricket buddy — the tragedy in three acts
- **BAI FIROZ** (70s) — syndicate matriarch; the Harbour warlord; Meera's godmother; the rain that decides
- **CIRCLE SURESH** — the corporator's fixer; money first, love never
- **ROHIT ("Boss")** — garage mechanic; all three's ride smith
- **MOM/DAD/PINKY** (Arjun's family) · **MEENU'S MOTHER** (Koli matriarch, jetty eviction) · **KB'S SISTER RIYA** (the transplant patient) · **DAD** (Arjun's, defamation defendant)
- **TAMRA→RAKSHAS GROUP** — the antagonist corp: glass tower in Fort, "Rakshas" sign in gold, the master plan for the harbour, the court, the papers

**Character switching (GTA V-style):**
- Ch 1–3: each lead lives their own opening chapter (3 different first missions, same world state)
- Ch 4–5: they collide (a bus chase through Dadar both Meera drives and Arjun rides shotgun; KB's fix sees them all)
- Ch 6 onward: **switch any lead at will** via phone (`Switch Lead` app; 3s fade, new lead at their location)
- Heist/shared missions require 2 leads (one plays, AI takes the other — or 2-player co-op, future)
- Each lead has **personal stats** (Street Cred, Bonds, Fear) tracked separately; endings branch off them

**Chargen:** select lead → appearance (skin tone/build/voice/locals) → karma alignment (Quiet / Loud) → radio preset. Save format extends `{v:2, chapters:[], leads:{arjun:{bonds, cred, fear}, meera:{…}, kb:{…}},…}` — auto-migrated from `{v:1}`.

---

## 4. Story — 12 chapters, 3 leads, 4 acts, 4 endings

Kicker: the bomb is already ticking under the prologue ("The Last Bus In") — the **Rakshas master plan** predates Arjun's arrival by five years. Every chapter is "the last calm before the next wall."

### Act I — THE GULLY (Ch 1–3)
**Ch 1 — The Last Bus In** *(existing build; Arjun POV)*
M1 Arrival · M2 First Order (existing) · M3 Wrong Order (existing). Hook: Arjun witnesses the peg-hammering at the Fort tower; unknowing, he photographs the proof.

**Ch 2 — The Lake Files** *(existing build; Arjun POV)*
M4 Meter Plus Half (existing) · M5 Xerox and Notary (existing) · M6 Old Friend — the pipeline heist (existing). Hook: the exposé prints; the city reads it; the Rakshas Group's counter-offensive begins **tonight**.

**Ch 3 — Red Tickets** *(NEW; Meera POV)*
Meera checks tickets on the 476 BEST bus; a passenger with no ticket — a man with a Rakshas ID badge dumping "pegs" into the sea; she steals the bus to follow; end of chapter: she's on the dock at dawn, and her mother's jetty is inside the cordon.
M7 Red Tickets · M8 Peg Man · M9 The Jetty · M10 Harbour Hands (side).

**Ch 4 — The Throw** *(NEW; Kabir POV)*
KB, mid-match, is asked to throw by the bookie; he refuses mid-game; collapses; the BAMBAI XI drops him; the bookie sends Rakshas Group collectors; his sister Riya's transplant fund vanishes.
M11 The Throw · M12 Collapse · M13 Collector · M14 Blood Debt (side).

### Act II — THE GAME (Ch 5–8)
**Ch 5 — Three Strangers** *(convergence; all leads)*
The three meet at Bai Firoz's darshini on the harbour (she needs a courier, a conductor and a cricketer). The ledger says the pegs are for the NMIA approach road; the court case is on; Dad's verdict is in 48 hours.
M15 Three Strangers · M16 The Ledger · M17 Verdict 48h.

**Ch 6 — Harbour War** *(Meera POV; the sea link unlocks)*
Meera vs Rakshas Group on the docks: boat fights, crane jumps, night net-cutting, Meera's mother's jetty saved in a raid. Sea link set-piece: chase the Rakshas peg-truck over Worli–Haji Ali bridge.
M18 Peg Truck · M19 Night Net · M20 Crane · M21 Sea Link Run.

**Ch 7 — Platform Six** *(Kabir POV; rail unlocks)*
KB follows the fix-tape to the train: Platform 6 at CSMT; a rooftop ride; the fixers' den; KB's sister rides along unwittingly; the tape is half burnt; the other half is on the phone of the bookie — who is none other than Circle Suresh.
M22 Platform Six · M23 Rooftop · M24 Half Burnt · M25 Suresh.

**Ch 8 — The Empire** *(all leads; the fall begins)*
All three rise: Arjun opens a delivery dispatch (asset), Meera runs a "legitimate" boat yard (asset), KB opens a cricket coaching academy (asset) — GTA-Vice-City-style empire building; the city loves them; the Rakshas Group can't touch them head-on. Then the trap closes: Dad's verdict reversed; the xerox shop burns; Riya's transplant fund freezes.
M26 Empire 1 (delivery) · M27 Empire 2 (boat yard) · M28 Empire 3 (academy) · M29 The Burn · M30 Freeze.

### Act III — THE FALL (Ch 9–10)
**Ch 9 — The Stay Order** *(emotional nadir)*
Rakshas wins the injunction; checkpoints; the pegs rise; Leela's diary burns; Mom's voice breaks; Putta betrays all three to Bai Firoz's rivals.
M31 Stay Order · M32 Diary · M33 The Leak · M34 Three Funerals? no — *Three Farewells*.

**Ch 10 — The Sting** *(all leads; the heist)*
Bai Firoz authorizes the sting: three leads, three jobs, one night. Meera on the water, KB on the rail, Arjun on the road. The NMIA pier is where the pegs are cast in concrete; the tape is under the Rakshas tower; the court order is on the judge's desk.
M35 The Sting · M36 Concrete · M37 The Tape · M38 Judge's Desk · M39 Putta's Crossing.

### Act IV — THE RECKONING (Ch 11–12)
**Ch 11 — The Funeral** *(Bai Firoz dies)*
The gully walks the funeral procession; the succession; Putta returns as kingmaker; the city holds its breath; all three leads converge on the harbour at dawn.
M40 Funeral · M41 Succession · M42 Three at the Harbour.

**Ch 12 — BAMBAI** *(ending gate)*
Final chapter; the city reprints the truth; the ending branches on all three leads' Bonds/Cred/Fear:
- **ENDING A — "The Paper"** *(Bonds ≥ 8 each)*: all go legit; the tower falls; Riya lives; the press owns nothing but prints everything; final shot: Leela's shop sign *BAMBAI PRINTS*.
- **ENDING B — "The Empire"** *(Cred ≥ 9 each)*: they take the docks; Bai Firoz's darshini renamed; Riya lives; the city bows; final shot: three bikes, meter off, no destination.
- **ENDING C — "The Lake"** *(high Leela/Kavya bonds)*: the pegs are voided; they walk away; Riya lives; the jetty saved; final shot: rain, bus pulls away, one palm raised.
- **SECRET ENDING D — "The Rakshasa"** *(KB turns out Tiefa-style: he takes the fix, becomes the Rakshas Group's new king)*: Riya lives but the city breaks; unlocks only if KB's Fear ≤ 1 and Cred ≥ 9.

### 50 main missions (by lead and chapter) — table of ids
Ch1: `arrival`, `first-order`, `wrong-order` · Ch2: `meter-mele`, `xerox`, `old-friend` · Ch3: `red-tickets`, `peg-man`, `the-jetty`, `harbour-hands` · Ch4: `the-throw`, `collapse`, `collector`, `blood-debt` · Ch5: `three-strangers`, `the-ledger`, `verdict-48h` · Ch6: `peg-truck`, `night-net`, `crane`, `sea-link-run` · Ch7: `platform-six`, `rooftop`, `half-burnt`, `suresh` · Ch8: `empire-1`, `empire-2`, `empire-3`, `the-burn`, `freeze` · Ch9: `stay-order`, `diary`, `the-leak`, `farewells` · Ch10: `the-sting`, `concrete`, `the-tape`, `judges-desk`, `puttas-crossing` · Ch11: `funeral`, `succession`, `three-at-the-harbour` · Ch12: `final-copy`, `vinyl-night`, `ending-fork`.

### 12 side missions (existing 4 slot in; 8 new)
`side-biscuit` *(Colonel Uncle)*, `side-guests`, `side-meter`, `side-potholes` (all exist) + `side-wallart` *(Tag Six — Fort)*, `side-meter-king`, `side-roofrun` *(Rooftops: CSMT→Marine Drive)*, `side-chai-ward` *(Medicine to ward 8)*, `side-monsoon` *(Flood rescue — 5 kids)*, `side-drum` *(Dock Drums heist)*, `side-pg-month` *(Month-end Math)*, `side-500-pav` *(500 pav to the cricket ground)*.

### 12 "Strangers & Freaks" encounters (new random NPC arc system)
Random world encounters: `stray-dog` (feed; later warns of police), `filter-lady` (sells chai; she's a detective), `cricket-kid` (fix a kid's cricket net), `vada-pav-uncle`, `death-photo-boy`, `red-envelope`, `taxi-driver-bhai`, `footpath-sleeper`, `monsoon-mama`, `harbour-granny`, `juhu-sunset-lover`, `church-bell-keeper`.

### 4 collectibles
- **12 "Phantom Diaries"** (black diaries with peg orders; +200 ₹ each, unlock Leela's back room)
- **30 Mumbai Film Stills** (graffiti photo hunt; unlock the credits gallery)
- **9 Cricket Cards** (BAMBAI XI 1987–2026; unlock all retired players)
- **7 Radio Jingles** (rare radio fragments; unlock secret station *Bambai After Dark*)

### 4 activities (not missions, pure world)
- **Street cricket** at every open maidan (overs, crowd cheer, crowd book)
- **Local-train surfing** (wave at CSMT → next week a kid waves back)
- **Chai stall setup** with Leela (supply/demand, tip meter)
- **Auto-rickshaw meter haggling** (existing; now with 6 driver archetypes)

---

## 5. VO & subtitles — the recording plan

### Cast (Bambaiya code-switch; Hindi + Marathi + English)
10 core voices + 14 ambient/crowd. Home-studio recording; no ADR studio needed; each line recorded once, mixed in engine.

| Actor | Lines (est.) | Distribution |
|---|---|---|
| Arjun lead | 78 | all main missions |
| Meera lead | 62 | Ch 3, 5, 6, 8, 10, 11, 12 |
| KB lead | 58 | Ch 4, 5, 7, 8, 10, 11, 12 |
| Leela | 54 | core; her shop is the mission hub |
| Kavya | 46 | press arc; radio confessional |
| Putta | 44 | rival; soft→hard gradient |
| Bai Firoz | 38 | storm scenes only; sparing |
| Circle Suresh | 26 | corruption dialogues; banality of evil |
| Mom | 30 | phone thread; heartbreak |
| Dad | 22 | courtroom; press; final call |
| Crowd/paddy workers | 90+ | ambient; cricket; monsoon; dock |

**Total: ≈ 620 scripted lines + ~130 ambient/crowd + ~90 phone/radio stings ≈ 840 VO clips** (~3× current 249 WAVs).

### Subtitle rules (always-on available, toggle in Esc›Brief)
- Format: `[SPEAKER] line` — speaker-colored (Arjun saffron, Meera sea-green, KB chalk white, Leela ivory, Kavya amber, Putta iron-grey, Bai Firoz violet, Suresh casino-red)
- Timing: per-line duration from VO length; max 2 lines/screen
- Marathi terms kept with gloss on first use: `vaat` (wait), `gammat` (tough), `hawa` (air), `jhoota` (fake)
- No font larger than 34px at 1080p (readable on phone)
- Every `e.say` string == subtitle string == VO script (single source of truth; the engine already enforces one-string-per-line via `e.say`)

### Radio (6 stations, all original Gully-Indie/desi)
`Kempu FM → Bambaiya FM` (fulltime: Bhangra remixes + adverts) · `Gully Indie` · `Hale Gaani` (old film songs) · `Hustle FM` · `Bambai Traffic Radio` · `My Radio` + unlockable **Bambai After Dark** (secret station; unlocked by collecting all 7 radio jingles; night-only; noir jazz + confessional).

### Phone (existing system, extended)
- **Veet** (chat: Mom, Kavya) — story-timed
- **Inbox** — missions briefed, debt ticker alerts, ending vote links
- **News** — *Bambai Mirror* live headlines react to story ("PEG MAN ARRESTED" after Ch 8 M25, etc.)
- **Switch Lead** — new app; 3s fade; GTA-style
- **Debt Ticker** — Mom's loan countdown: ₹2,00,000 → 0 or repossessed

---

## 6. Cheat codes (the engine has a cheat box on ` ` + Esc›Cheats list)

Type in game: backtick/`~` cheat box. GTA-Vice-City-style, but Mumbai-flavoured. All cheats **disable chapter completion stats & 100% this save** (standard GTA rule; the HUD warns).

| Code | Effect |
|---|---|
| `VADAPAV` | Full health + full stamina |
| `CUTTINGCHAI` | Infinite stamina (run all day) |
| `CHAAY` | Full health (shorter) |
| `PAVBHAJI` | Full armor |
| `KAALI-PEELI` | Spawn kaali-peeli taxi |
| `BESTRED` | Spawn BEST red bus |
| `METROGOLD` | Spawn metro train (if zone built; else road-block) |
| `LOCALTRAIN` | Spawn local train rake |
| `MONSOON` | Summon monsoon + thunder |
| `SUNSHINE` | Clear weather |
| `MIDNIGHT` | 24:00, all lights on |
| `DUST` | Dust storm (all zones) |
| `GULLYWAR` | Max wanted + cops spawn |
| `BULLDOZER` | Tanker invincibility |
| `NILAMICOP` | Clear wanted |
| `RAKSHAS` | Spawn Rakshas ID card (talk your way out, once/save) |
| `CRICKETKING` | Spawn cricket bat (KB beats anyone) |
| `WAGH` | Tiger roar + fear aura |
| `DESI-JOKER` | Random absurd event nearby |
| `BIRYANI` | Health + armor + 2 stars clear |
| `FOOTPATH` | Walk through anything (walk-through walls) |
| `DEAD-DROP` | Infinite weapon pickups |
| `JALSA` | Fireworks at your feet (Ganesh immersion) |
| `CHAI-VENDOR` | All chai stalls free for 5 min |
| `PHONEBOMB` | Phone rings on random NPC, distraction |
| `SNAKEHEAD` | Fish in your hand (Koli protection mojo) |
| `NORTHERNSAHEDRA` | helicopter arrival (endgame boss) |
| `PATOY` | police in civies spawn faster (NGOs) |
| `SAKE-PAV` | red-light special; gems fall from sky |
| `LAKHON` | ₹1,00,000 (once per save) |
| `SULU` | all radio stations unlocked |
| `BHEM` | invincible (5 min) |

Binding doc: cheat list in Esc›Cheats section, one per line, with description; `__cheat:CODE` console alias unexposed (Esc panel only).

---

## 7. HUD, UI, world surfaces (extends existing systems)

- **Chapter cards** (exists) — 12 intros (`Cr tag`), 12 outros (chapter-end screen with vote link)
- **Passport stamps** (exists) — one per chapter; the passport is the save icon
- **Word cards** (exists) — legal terms in Dad's case; cricket terms; harbour slang
- **Bonds HUD** (exists) — now per-lead: *Arjun bonds*, *Meera bonds*, *KB bonds* tracked separately; toast on change
- **Debt ticker** (new) — Mom's loan ₹ ticks down in the top-right; blinking red < ₹50,000
- **Fear meter** (new) — how frightened the city / Rakshas Group is of you; unlocks stealth routes
- **Wanted 5-star** (police.js exists) — constable → beat constable → traffic → chowki → commissioner; local-train hop escapes wanted; sea-link chase wanted = 3 stars only
- **Big Map** (exists) — 5 zone clusters; fast-travel by train unlocks after Ch 6; icons: mission, side, strangers, collectibles, homes (Arjun's PG, Meera's jetty, KB's academy)
- **Pause menu** — Esc → Brief / Map / Phone / Stats / Cheats / Options / Quit
- **Photo mode** (C) — hide HUD, free camera, sun flare control, "Postcard" export (share)

---

## 8. 100% completion — the hook

1. Finish all 12 chapters (all 50 main missions)
2. All 12 side missions
3. All 12 Strangers & Freaks encounters
4. Collect all 4 types of collectibles
5. Max Bonds with all 4 core NPCs (Leela, Kavya, Putta, Bai Firoz) on all 3 leads
6. Cricket season: win 3 matches + not fixed 1
7. All 6 radio stations unlocked (+ Bambai After Dark)
8. All 4 endings + secret D

**Reward:** chapter-end screen **BAMBAI ETERNAL** — credits with all VO cast listed; a radio song remix (all Gully Indie artists collaborate); the title card variant with the city in rain + your name.

---

## 9. Phased plan — from this document to release

**Rule:** every phase ships to the `8485` preview. Every phase has acceptance criteria, a timebox, and a fallback that doesn't break the build.

### P0 — Design lock (this doc + `BAMBAI-STORY.md`)
✅ Deliverable: you approve this doc. 2 days.

### P1 — South Mumbai boots + Ch 1–2 live (as today) — **done**
✅ Preview 8485 serves; liveries Mumbai'd; plates MH; BEST red; Auto/taxi kaali-peeli.
**P1.5 (1 wk):** reconcile `map.js` Mumbai migration (bbox 18.905→18.975); purge Koramangala remnants (road list, `koramangala` strings, `_source/map.pretty.js` regenerated); verify boot end-to-end with Ctrl+F5; `_source/` mirror in sync.

### P2 — Mumbai present in the build (2 wks)
Ch 3 "Red Tickets" playable in Mumbai map; Red Tickets POIs (BEST bus stop, Fort tower, harbour cordon); Meera POV chapter card; 1 VO batch (Meera + Bai Firoz); monsoon lightning passes; subtitle column. ✅ Acceptance: full boot on Mumbai, Ch 3 completes, no regressions on Ch 1–2.

### P3 — Central Line zone B (3 wks)
Dadar→Sion→Kurla via OSM extract pipeline (`reference/osm/mumbai/` pattern): Dadar Station, Matunga, Mahalaxmi Racecourse, Worli Sea Face, Lower Parel mills, Sion, Wadala, Chembur approach; Ch 5 "Three Strangers" + Ch 6 "Harbour War" missions; rail corridor Phase A (moving trains, station jingles). ✅ Acceptance: zone B bootable, 4 new missions, sea link Worli-Haji Ali drivable.

### P4 — Western Line zone C (3 wks)
Bandra→Andheri→Borivali extract; BKC glass ward, Juhu beach, Khar Linking Road, Andheri MIDC road; Ch 7 "Platform Six" missions; sea link Bandra-Worli; monsoon waterlogging event. ✅ Acceptance: zone C bootable, 5 new missions, sea link exit unlocked.

### P5 — Harbour zone D (3 wks)
Sewri→Chembur→Vashi→Nerul→CBD Belapur→Kharghar→Panvel; Koli jetty save arc (Ch 6 arc resolution); docks, cranes, NMIA cranes skyline; harbour rail Phase B; NMIA pier set-piece. ✅ Acceptance: zone D bootable, 6 missions incl. all of Ch 6 & 10.

### P6 — Thane–Kalyan zone E (2 wks)
Thane→Kalwa→Mumbra→Kalyan→Dombivli→MIDC→Titwala; factory opening sequence; Ch 8 "The Empire" assets (delivery dispatch, boat yard, academy); the "last train out" set piece; final arc unlocks. ✅ Acceptance: zone E bootable, Ch 8 missions playable, MMR complete on map.

### P7 — The Reckoning (Ch 9–12) (2 wks)
Ch 9 emotional nadir (xerox burn, Dad verdict reversed); Ch 10 the 3-leads sting (all leads converge); Ch 11 funeral; Ch 12 ending gate + 4 endings; save format v2 + migration; **switch lead** app. ✅ Acceptance: all 12 chapters completable; 3 endings; save migration from v1.

### P8 — Strangers, collectibles, 100% (2 wks)
12 Strangers & Freaks; 4 collectible sets (48 items); all bonds maxed; chapter-end card **BAMBAI ETERNAL**; credits with VO cast; radio unlock **Bambai After Dark**. ✅ Acceptance: 100% achievable; credits roll; all radio.

### P9 — Polish, audio, perf (2 wks)
6 radio songs + ads pass; monsoon mix pass; subtitle QA; KTX2 audit (kill `.jpg` stragglers); draw-call budget per zone; `?lowspec` mode; full boot time < 90 s; crash dump telemetry (opt-in). ✅ Acceptance: F12 clean, boot ≤ 90 s on mid hardware.

### P10 — Release & retention (2 wks)
`?chapter=` deep links; chapter-end vote wall updates out-of-band (GitHub-backed); analytics `chapter_started`, `mission_complete`, `ending_chosen`, `100_percent`; press kit; community challenges; **live-ops seed:** monthly "Bambai Streets" side-ops (not coded yet). ✅ Acceptance: launch build + retention loop live.

**Total ≈ 24 weeks solo-ish; with help, 12–14 weeks.** Every phase independently shippable.

---

## 10. Open decisions (need your call — then we lock P0)

1. **Leads**: 3 selectable, or start with Arjun-only and unlock Meera/KB at Ch 4–5 acquisitions? (I recommend 3-at-chargen for agency; unlock-at-acquisition is canon-consistent but denies choice.)
2. **MMR scope commitment**: do you want all 5 zone clusters eventually, or do we stop at Zone A+B (South + Central) as "finished Mumbai" and treat C/D/E as DLC?
3. **Endings**: is the secret "Rakshasa" ending too dark for BAMBai's brand, or exactly right for its honesty?
4. **Radio**: original music only (we commission 6 Gully-Indie tracks), or use existing Indie artist licenses (cheaper, faster, riskier)?
5. **Co-op**: 2-player drop-in co-op for heist missions (M35–M39) — feasible with the web engine (WebRTC), or hotseat only?
6. **Title**: *BAMBAI: City of a Thousand Gullies* — keep? (Brand is already BAMBAI.)

---

*This document supersedes the zone-phase sketch in `MUMBAI-PLAN.md`. `BAMBAI-STORY.md` remains the canonical prose bible. All future story work — new chapters, side missions, VO scripts — forks from here.*
