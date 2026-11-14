# BAMBAI — Grand Design Bible
## *City of a Thousand Gullies* — the complete open-world plan

**Working title:** *BAMBAI: City of a Thousand Gullies*
**Genre:** GTA Vice-City-style open-world crime drama, present-day (2026), ground-level Mumbai.
**Canon:** `vendor/game.js` (shipped build) → this doc → `BAMBAI-STORY.md` (prose legacy).
**Status:** Design for expansion. In-build story = Ch 1–2 live, Ch 3 teased. This doc is the
map for everything after.

---

## 0. What shipped so far (measured, not assumed)

| Fact | State |
|---|---|
| City name | **Bambai** (fictional Mumbai) |
| Map | Real South Mumbai, OSM-derived: bbox **18.905–18.945 N, 72.815–72.845 E** (Colaba → Fort/CSMT → Crawford Market → Backbay) |
| Blocks / footprints | 534 blocks / 3,151 building footprints (was 303 / 1,413 — Fort now reads dense) |
| Sea polygon | Real OSM coastline chain (Malabar Hill → Colaba tip; 107 pts simple, 8.06 M u²) |
| Names | 234 real OSM road names → fictional Bambai names (Marine Drive → **Moti Haar Marg**, P.D'Mello → **Bandar Road**, D. N. → **Ghadi Ghar Rd**, 80 Feet Rd → **Rangmahal Road**, NW Wkly → **Moti Haar promenade**, Crawford Santhe → **Mota Bazaar**, Sewri → **Retibandar**, Colaba → **Kolvada**, Thaatha Kamba → **Aajoba Stambh**, Rakshas House → **Rakshas Bhuvan**) |
| Liveries | BEST red bus + **double-decker `decker`** (new vehicle kind; 4.22 m vs bus 3.31 m), auto kaali-peeli, taxi kaali-peeli (black/yellow), **MUMBAI POLICE** (white + blue stripe), plates `MH 01–12`, LED route **401 Bandra/Dadar**, auto fare ₹27/₹18 (MMR minimum) |
| Festivals/radio/fonts | Maharashtra set (Gudi Padwa, Ganesh Chaturthi, Dahi Handi, Ashadhi Ekadashi, Makar Sankranti, Diwali) · radio renamed (Bambaiya FM, Hale Gaani, Bambai Traffic Radio, Gully Indie, Hustle FM, My Radio) · fonts → Devanagari |
| Sky art | 3 panoramas regenerated (chroma-key art-deco curve, domed station, palms; 48px alpha fade; files `SKY-DAY/DUSK/NIGHT-01.png`; day boosted saturation 1.45 to survive 70% fog wash; registered under existing SKY-* keys, zero engine changes) |
| Story | **The Creek Files** (was "The Lake Files"): Retibandar Creek is the dying water body; the Rakshas Group fills it with debris for real estate ("Shetty buys creeks. Tonight the mall sells one.", "The creek sleeps light", "the man who buys creeks before breakfast") |
| VO | Story dialogue = browser TTS (auto-matches subtitles); street chatter/radio = pre-recorded WAVs gated by `D.canPlay`; **~42 certain-stale WAVs identified** (radio-1..10, whitefield-1..4, idents, RJ clips, ad-sites, darshini-1..4, nimsha-1..3); regeneration manifest `reference/osm/vo-lines.json`; Windows SAPI path (`gen-vo.ps1`) |
| Chapters in build | **Ch 1 — "Bambai"** (title card `chapterCard('Chapter 1','Bambai','KORAMANGALA')` — *subtitle still says KORAMANGALA, flagged*) and **Ch 2 — "The Creek Files"** (`The Creek Stands` epilogue). Ch 3 teased ("100 Feet Road / Indiranagar. Coming soon."). Badges: **Creek Warrior** (UI-BADGE-10), **Gully Legend** |

**First action when we "go ahead":** fix the 3 `KORAMANGALA` leftovers (2× `chapterCard(...)` + 1× canvas `KORAMANGALA · Bambai` @ ~560167) and rename the Ch 3 tease (`100 Feet Road` → `Bandar Road` per the same sweep).

---

## 1. Research notes (reference games)

Sources: Steam/TapTap/IGN/Times Now (Mumbai Gullies), GTA Wiki/GTA Base (Vice City), GTA V, Sleeping Dogs, Yakuza, Mafia, Saints Row.

| Game | What it proves | What we take | What we avoid |
|---|---|---|---|
| **Mumbai Gullies** | Desi open world works: autos, locals, Marine Drive, monsoon, gully chaos | *gully → city* fantasy; desi-first authenticity | Endless scope — we ship phases |
| **GTA Vice City** | 38 story + 19 asset + 6 races + 5 phone + 3 stadium + 4 off-road + 3 RC + 1 sparrow + 7 side = **86 missions**, 57 for 100% | Asset-empire loop (own the cab, stall, boat yard, press); betrayal midpoint; radio identity; cheats; 100% checklist | Pastiche |
| **GTA V** | 3 switchable leads; heists; 100% cult | 3 selectable leads (§3) with converging arcs; Ch 8 heist structure | 3-actor scope creep — our leads converge by Ch 5 and switch from Ch 6 |
| **Sleeping Dogs** | Face XP; minigames as texture (paper, karaoke, mahjong) | Face XP = **crowd cheer**; minigames as mission types | Cop-undercover premise |
| **Yakuza** | Substories with full emotional weight | Side missions are real stories, never "go here, fetch that" | Absurd per-substory length — ours ≤ 6 min |
| **Mafia** | The city as the character | Real OSM geometry is the soul; no caricature | History-lesson pacing |
| **Watch Dogs** | Phone as gameplay surface | Phone apps drive missions, the debt ticker, ending votes | Tech-bro power fantasy |

**One rule:** every street, sign, word and sound must be *of Bambai*, not *about Bambai*.

---

## 2. World — the whole MMR, honestly scoped

Mumbai Metropolitan Region is ~4,355 km²; no single build simulates that honestly. **We build 5 zone clusters** (like GTA IV's islands), connected by bridges and rail; each district has its own palette, density, law and story flavor. Total playable ≈ 18–22 km² (Liberty City scale).

| Cluster | Geography | The fantasy | Map status |
|---|---|---|---|
| **A — BAMBAI CORE** (South Mumbai) | Kolvada → Navy Nagar → Oval Maidan → Fort → CSMT → Crawford Market/Mota Bazaar → Moti Haar Marg → Backbay → Haji Ali → Worli | The gully. Chawls, deco towers, the court, the peg shop | **DONE** (v1) — bbox 18.905–18.945 |
| **B — CENTRAL LINE** (Dadar → Sion → Kurla) | Dadar (E/W), Mahalaxmi, Prabhadevi, Lower Parel, Parel, Sewri/Retibandar, Wadala, Matunga, Sion, Kurla(E) | The working city — mills-turned-malls, the flood-prone east | **P4** |
| **C — WESTERN LINE** (Bandra → Borivali) | Bandra (W/E), Khar, Santacruz, Vile Parle, Andheri (W/E), Juhu, Chakala, Goregaon, Malad, Kandivali, Borivali, Dahisar | The aspiration belt — Bollywood, BKC glass, Juhu | **P5** |
| **D — HARBOUR** (Chembur → Navi Mumbai) | Sewri → Wadala → Chembur → Vashi → Nerul → CBD Belapur → Kharghar → Panvel → NMIA site | The machine — cranes, containers, Koli docks, CIDCO grids (contrast: core is crooked, Vashi is a ruler) | **P6** |
| **E — THANE–KALYAN** (Thane → Kalyan–Dombivli) | Thane (W/E, Wagle Estate), Kalwa, Mumbra, Kalyan (W/E), Dombivli (W/E), MIDC, Titwala | The overflow — factories, politics, the last train out | **P7** |

**Scale:** one district ≈ 2 × 1.5 km ≈ 90–120 km of road. Sea link + rail are the seams; Local-train fast-travel unlocks after Ch 6. Per-zone density tables reuse the existing traffic/crowd/night/wreck systems.

**Zone art direction (Three.js):**
| Zone | Palette | Signature | Sky/Fog | Crowd |
|---|---|---|---|---|
| A | ochre/white deco + soot + saffron | Moti Haar curve, CST lace, monsoon on tin | monsoon haze gold | footpath-kings |
| B | brick red mills + rail grime + chai steam | Sion skyline, Matunga ration shops, flood pools | smog brown | industrial shift |
| C | glass + neon + Juhu sand | BKC towers, Juhu sunset, Khar Linking Rd | clear violet DUSK | weekend slick |
| D | containers coral + crane amber | Navi Mumbai grid, Koli nets, NMIA cranes | harbour cyan | shift-clock sparse |
| E | MIDC grey + factory white + festival red | Dombivli MIDC, Kalyan station, Mumbra night | hazy grey | factory pulses |

---

## 3. Characters — three selectable leads + the build's real cast

**At New Game → Choose your lead** (all three share the world and the Creek Files arc; each has a personal opening):

| Lead | Who | Fights with | Drives | Story stake |
|---|---|---|---|---|
| **ARJUN** (20) | BAMBAI EXPRESS delivery rider; small-town, invisible by design | wits, bike, lanes | Royal Enfield war-bike, sometimes auto | Dad's defamation case; the creek pegs; Riya? no — Pinky's hostel fees; Mom & Dad in the PG |
| **MEERA "MEENU"** (26) | BEST ticket inspector turned harbour smuggler; Koliwada heritage | persuasion, nerve, the boat | BEST bus (stolen), kitchen cruiser | Her family's fishing jetty is inside the Rakshas master plan; the docks are her inheritance to lose |
| **KABIR "KB"** (24) | BAMBAI XI vice-captain, dropped after a throw-fix scandal; bookie's enforcer | bat, glare, street cricket | battered hatchback | His sister Riya's transplant fund vanished in the fix; the surgeon was on the tape |

Switching (GTA-style): Ch 1–4 personal openings; **Ch 6 onward, switch any lead via phone** (`Switch Lead` app, 3s fade). Heist/shared missions want 2 leads. Each lead tracks **Bonds / Street Cred / Fear** separately. Chargen: appearance, karma alignment, radio preset. Save format extends `{v:2, leads:{arjun:{…}, meera:{…}, kabir:{…}}, chapters:[…]}` with auto-migration from `{v:1}`.

**The build's real cast (from shipped dialogue — keep these names):**
- **ARJUN** (delivery rider) · **Mom (Saroja), Dad (Veer), Pinky** (sister, 14, off-screen)
- **LEELA** (62) — xerox/notary; the Oracle; keeps a diary nobody reads
- **KAVYA** (22) — Leela's assistant; aspiring journalist; prints the exposé on a Riso duplicator
- **PUTTA** — Rakshas Group's street face; Arjun's childhood friend-turned-enemy; **"Pipeline Putta"** (sells water to the desperate) — the gully's tragedy in one man
- **SHOBHA AUNTY** — PG owner; "no guests after nine"; the rent-clock
- **AUTO RAMANNA** — meter-keeper; the honest-meter myth; inspected
- **GOPAL UNCLE** — pothole-rights activist; 31 complaints filed
- **COLONEL UNCLE** — retired army; worries about everything; biscuit missive
- **CIRCLE SURESH** — the corporator's fixer; money first, love never
- **ROHIT ("Boss")** — garage mechanic; everyone's ride smith
- **BAI FIROZ** (70s) — syndicate matriarch; the Harbour warlord; darshini on the dock
- **SHETTY** — the Rakshas fixer: *"Shetty buys creeks. Tonight the mall sells one."*
- **PUNERI MASALA** — the cricket rival (was Mysuru Masala)
- **THE RAKSHAS GROUP** — real-estate cartel; glass tower **Rakshas Bhuvan** in Fort/Kolvada; fake survey pegs in the creekbed; bought court, bought paper (*The Meridian Times*)

---

## 4. Story — THE CREEK FILES (Ch 1–2 shipped, Ch 3–12 the expansion)

**Logline:** A small-town delivery boy steps off the bus in Bambai with a father he can't call, a debt he didn't sign up for and a courier bag full of someone else's secrets — and becomes the invisible man of the gully, in a city that chews up the invisible. The enemy fills a creek with debris. The weapon is a xerox shop and one brave newspaper.

**Themes:** the press vs. power · invisibility as survival · community vs. concrete · family vs. empire · chai before bullets.

### ACT I — THE GULLY
**Chapter 1 — BAMBAI** *(shipped; title card still says KORAMANGALA — fix)*
- **M1 `arrival` — "Shobha Aunty's PG"** — arrive at the PG; deposit; the rent clock starts; learn to ride.
- **M2 `first-order` — "First Order"** — FoodDash: hot food, cold riders.
- **M3 `wrong-order` — "Wrong Order"** — one chicken biryani, one very confused photographer; Putta appears in the lane.

**Chapter 2 — THE CREEK FILES** *(shipped; ends `The Creek Stands`)*
- **M4 `meter-mele` — "Meter Plus Half"** — the oldest negotiation in Bambai; ₹450 note in the meter; meter Ramanna's honor defended.
- **M5 `xerox` — "Xerox and Notary"** — every file in the ward office passes through one machine; three photos of the pegs; Leela's diary glimpsed.
- **M6 `old-friend` — "Pipeline Putta"** — summer; the city is thirsty; Pipeline Putta sells; the "pegs in the mudflats" POI; survey pegs photographed.
- **M7 `ee-sala` — "Is Baar Night"** — the final; a bet; a very drunk best friend; a curfew; Bambai wins by four wickets (radio cut-in exists).
- **M8 `lake→creek` — "The Creek Doesn't Lie"** — photos of pegs + Slurry tankers; Putta cornered at the dock; **Bond: Nikhil +1**. Badge: **Creek Warrior**.
- *Side: `side-biscuit` "Biscuit Is Missing" (Colonel Uncle) · `side-guests` "No Guests After Nine" (Shobha Aunty) · `side-meter` "The Meter Inspection" (Auto Ramanna) · `side-potholes` "Pothole Census" (Gopal Uncle)*
- **Epilogue: `ch2-dawn` — "The Creek Stands"** — Dawn. Two tankers of slurry. One delivery boy with a t…

**Chapter 3 — ELEVEN AFTER ELEVEN** *(new; first expansion chapter; the Koli elder)*
- **M9 `eleven-tonight` — "Eleven Tonight"** — an unknown number: meet a woman on the creek promenade at 11; she knows what the pegs are for — she's **Meera**, the dock's fix-caller; the harbour approach road.
- **M10 `press-matter` — "The Press Matter"** — the lawyer takes ₹25k and a promise; Dad calls; the case worsens; *The Meridian Times* prints the Rakshas version — the paper that paid Dad to be silent, once.
- **M11 `peg-man` — "The Peg Man"** — spot the peg man on the promenade at dusk; photograph the truck plates; Putta's crew tails Arjun.

### ACT II — THE GAME
**Chapter 4 — KOLI HARBOUR** *(Meera POV unlocks switch)*
- **M12 `boat-run` — "Harbour Freight"** — dawn run on a Koli boat; fish on the manifest, something else in the hold; tip the customs man or don't.
- **M13 `net-worth` — "Net Worth"** — Bai Firoz's "job interview": 200 kg of nets in 8 minutes; she watches from the darshini.
- **M14 `dahi-handi` — "Dahi Handi Night"** — the festival crowd; KB's cricket bookie fix; Bambai XI plays PUNERI MASALA on the same night; the crowd's cheer drives the outcome (radio reacts).

**Chapter 5 — THREE STRANGERS** *(convergence)*
- **M15 `three-strangers`** — at Bai Firoz's darshini: a courier (Arjun), a conductor (Meera), a cricketer (KB). The ledger: the pegs = the NMIA approach road; the court date is set; Dad's verdict is in 48 hours.
- **M16 `verdict-48h`** — all three rally the gully; the press, the court, the crowd — the city holds its breath.

**Chapter 6 — HARBOUR WAR** *(sea link opens; train fast-travel unlocks)*
- **M17 `peg-truck`** — stop the peg-truck on Worli–Haji Ali Sea Link; chase finale; the truck falls into the sea with its driver's shame.
- **M18 `night-net`** — night net-cutting with the Kolis; save the jetty from the Koelling crane crew.
- **M19 `crane`** — the harbour crane set-piece; Meera climbs; the Rakshas foreman's radio crackles "the creek is ours" (the stale `goon-11` line — re-recorded, finally).

**Chapter 7 — PLATFORM SIX** *(CSMT; the rail spine unlocks fully)*
- **M20 `platform-six`** — the fix-tape rides train 6; lookout role; a woman travelling alone notices Arjun; her bag is Rakshas evidence.
- **M21 `rail-yard`** — the rival crew hits the yard; save her or the shipment. Moral fork; **Bond: Kavya +2** if saved.
- **M22 `dock-ledger`** — steal the harbour ledger from the customs inspector; Kavya gets it; the investigation tightens.

### ACT III — THE EMPIRE
**Chapter 8 — MARINE DRIVE / MOTI HAAR MARG** *(arcade of power; GTA V asset loop)*
- **M23 `empire-1`** — Arjun opens a delivery dispatch (asset, drives income + `Switch Lead` app unlock).
- **M24 `empire-2`** — Meera's "legitimate" boat yard (asset, unlocks harbour fast-travel).
- **M25 `empire-3`** — KB's cricket academy (asset, unlocks cricket season 2).
- **M26 `the-burn`** — the Rakshas boardroom orders it: the xerox goes up in flames; Leela's diary burns with it; Arjun escapes with one photocopy in his jacket. *Emotional nadir #1.*
- **M27 `freeze`** — Riya's transplant fund freezes; Mom's voice breaks on the phone; KB takes the fix after all. *Emotional nadir #2; KB Fear ≤ 1 gate.*

**Chapter 9 — THE STAY ORDER** *(the legal wall)*
- **M28 `stay-order`** — the injunction lands; checkpoints; the pegs rise on camera; the court is bought.
- **M29 `the-leak`** — *The Meridian Times* prints Arjun's version (he feeds it); the city turns; the Rakshas board books Dubai flights.
- **M30 `three-farewells`** — Mom goes back to the village; Dad shakes free of the case; Pinky's hostel is safe; the debt is ₹0. *Gag: the meter finally reads what it should.*

### ACT IV — THE RECKONING
**Chapter 10 — THE STING** *(all three leads; the 3-job heist)*
- **M31 `the-sting`** — Meera on the water, KB in the rail matrix, Arjun on the road; one night, three jobs, one pier at NMIA.
- **M32 `concrete`** — the pegs are cast in concrete at the pier; explode the shipment or the proof — choice gates ending.
- **M33 `judges-desk`** — the stay order voided by an incorruptible judge (Bai Firoz's old friend from the harbour).
- **M34 `puttas-crossing`** — Putta's last stand on the dock; **Spare him or not. Bond determines ENDING B vs C.**

**Chapter 11 — THE FUNERAL** *(Bai Firoz dies; succession)*
- **M35 `funeral`** — Bai Firoz dies peacefully on Marine Drive; the gully walks the procession; Arjun carries the lid; KB leads the cricket crowd in a guard of honor (drums).
- **M36 `succession`** — the syndicate votes; Putta returns as kingmaker; the city holds its breath; all three leads converge on the dock at dawn.

**Chapter 12 — BAMBAI** *(the ending gate; 4 endings)*
- **M37 `final-copy`** — print a million copies of the creek story; every xerox in the city turns at dawn. **The city reprints the truth.**
- **M38 `vinyl-night`** — Hale Gaani's last song on the radio; the city dances in the rain; Arjun rides home, meter off.
- **M39 `ending-fork`** — gated by all three leads' Bonds/Cred/Fear:
  - **A — THE PAPER** *(Bonds ≥ 8 each)* — all go legit; the tower falls; Riya lives; Leela's shop sign: *BAMBAI PRINTS*.
  - **B — THE EMPIRE** *(Cred ≥ 9 each)* — they take the docks; Bai Firoz's darshini renamed *ARJUN DARSHINI*; Riya lives; the city bows.
  - **C — THE LAKE AFTER ALL** *(Leela + Kavya bonds max)* — the pegs are voided; they walk away; Riya lives; jetty saved; bus pulls away, one palm raised.
  - **D — THE RAKSHASA** *(KB Fear ≤ 1 + Cred ≥ 9, secret)* — KB takes the fix, takes the tower, takes the city; Riya lives; the city breaks.

### Missions count
- **Main:** 39 (M1–M39)
- **Side (Leela's counter; `side:` save slot):** 4 shipped + 8 new = 12
- **"Strangers & Freaks" (random NPC arcs):** 12 (stray-dog, filter-lady, cricket-kid, vada-pav-uncle, death-photo-boy, red-envelope, taxi-driver-bhai, footpath-sleeper, monsoon-mama, harbour-granny, juhu-sunset-lover, church-bell-keeper)
- **Activities:** street cricket (every maidan), local-train surfing (CSMT → sea link — unlock Ch 6+), chai stall (Leela's; supply/demand), auto-meter haggling (6 driver archetypes)
- **Collectibles (48):** 12 Phantom Diaries (+200 ₹ each; unlock Leela's back room) · 30 Mumbai Film Stills (graffiti photo hunt; unlock credits gallery) · 9 Cricket Cards (BAMBAI XI 1987–2026) · 7 Radio Jingles (unlock secret station *Bambai After Dark*)

---

## 5. VO & subtitles — the real pipeline

**Voice source split (as built):**
- **Story dialogue** → browser TTS (`speakify` on `hud.say`) — subtitles *always* match audio by construction. Direction: Bambaiya code-switch (Hindi + Marathi + English), rate per line.
- **Street chatter / radio / jingles / ads** → pre-recorded WAVs gated by `D.canPlay`; **~42 certain-stale clips** (recorded from pre-rename text) listed in `reference/osm/vo-lines.json`; re-record via Windows SAPI (`gen-vo.ps1`) or a human reader; verify with `verify-vo.ps1`.
- **SFX** → 62 `.wav` (unchanged); **Ambient** → 33 `.mp3` loops (city day/night, birds, construction, crowd, barges…); **Music** → 7 dirs (event, gully, hale, hustle, kempu, score…).

**Cast (10 core + 14 ambient)** — Arjun, Mom, Dad, Leela, Kavya, Putta, Bai Firoz, Circle Suresh, Rohit, Riya + crowd. **Target ≈ 620 scripted lines + ~130 ambient/crowd + ~90 phone/radio stings ≈ 840 clips** (~3.4× the 249 street WAVs). Recording: home studio, phone VO; subtitles format `[SPEAKER] line`, speaker colors (Arjun saffron, Meera sea-green, KB chalk, Leela ivory, Kavya amber, Putta iron-grey, Bai Firoz violet, Suresh casino-red). Marathi glossary on first use.

**Radio (6 + 1 secret):** Bambaiya FM · Hale Gaani · Bambai Traffic Radio · Gully Indie · Hustle FM · My Radio → **Bambai After Dark** (night-only; NOIR jazz + confessional; unlocked via 7 radio jingles).

**Phone apps:** Veet (Mom, Kavya) · Inbox (missions, debt ticker, ending votes) · *Bambai Mirror* (live headlines react to story — "PEG MAN ARRESTED" after Ch 8) · Switch Lead · Debt Ticker.

---

## 6. Cheats (engine cheat box — backquote key; Esc›Cheats list)

Bambaiya slang, GTA-Vice-City-style; cheats void 100% this save (HUD warns). Shipped + proposed:

`VADAPAV` full health+stamina · `CUTTINGCHAI` infinite stamina · `PAVBHAJI` armor · `KAALI-PEELI` spawn kaali-peeli taxi · `BESTRED` spawn BEST red bus · `LOCALTRAIN` spawn local rake · `MONSOON` summon monsoon+thunder · `SUNSHINE` clear weather · `MIDNIGHT` 00:00 lights on · `DUST` dust storm · `GULLYWAR` max wanted + spawn cops · `NILAMICOP` clear wanted · `RAKSHAS` Rakshas ID card — talk your way out, once per save · `CRICKETKING` bat — KB beats anyone · `DESI-JOKER` random absurd event · `WAGH` tiger roar + fear aura · `BIRYANI` health+armor+2 stars off · `FOOTPATH` walk through anything · `DEAD-DROP` infinite weapon pickups · `JALSA` fireworks at feet (Ganesh immersion) · `CHAI-VENDOR` free chai 5 min · `PHONEBOMB` phone rings on random NPC (distraction) · `SNAKEHEAD` Koli protection mojo · `LAKHON` ₹1,00,000 once per save · `SULU` all stations · `BHEM` invincible 5 min.

---

## 7. HUD / UI surfaces (existing + new)

- **Chapter cards** (`cr-tag`, chapter-end vote wall) — used for 12 chapters + Ch complete screens (`Chapter 1 … Bambai`, `Chapter 2 … The Creek Files`).
- **Passport stamps** — one per chapter; save icon.
- **Word cards** (`wordCards`) — legal terms, harbour slang, cricket terms.
- **Bonds HUD** — per character; toast on change ("Leela smiled at you").
- **Badges** — `Creek Warrior` (UI-BADGE-10, finish *The Creek Doesn't Lie*) · `Gully Legend` (walk 3 km in Bambai).
- **Phone** — Veet · Inbox · *Bambai Mirror* · Switch Lead (new) · Debt Ticker (new).
- **Big Map** — 5 zone clusters; fast-travel unlocks Ch 6.
- **Radio** — car-only; 6 stations + Bambai After Dark.
- **Photo mode** (C) — hide HUD, free camera, "Postcard" export.

---

## 8. The 100% hook

1. Finish 12 chapters (39 main) · 2. All 12 side · 3. All 12 Strangers & Freaks · 4. All 48 collectibles · 5. Max Bonds on 4 core NPCs (Leela, Kavya, Putta, Bai Firoz) × 3 leads · 6. Cricket: win 3, fix none · 7. All 7 radio (incl. After Dark) · 8. 4 endings.
Reward: chapter-end card **BAMBAI ETERNAL** — credits roll with VO cast; a radio remix of all Gully-Indie tracks; credits variant with the city in rain + your lead's name.

---

## 9. Visuals — what's done, what's next (Three.js)

**Done (this effort, sessions 1–5):** real OSM Mumbai build (534 blocks / 3,151 footprints) · coastline→sea polygon · Marine Drive curve + deco row (skyline panorama art, chroma-keyed, 48px alpha fade, `SKY-*-01.png`) · BEST double-decker `decker` · monsoon flood meshes + `?floods` hook · wet-road `road-wear.worker` · citizen NPCs · phone UI · chapter cards · cricket night event · drum-screen garba heist · bird flocks · night glass · fog · tree LODs.

**Next — per zone:**
- **A CORE** (finish): deco trim on promenade facades; CST dome silhouette pan; BMC HQ flag; monsoon thunder + lightning flashes; Koli dock props; Aajoba Stambh sign art.
- **B CENTRAL**: mill chimneys (Matunga); flood decals (existing, relocated); Sion skyline; rail overhead wires; Dadar station jingles; crow-heavy skybox.
- **C WESTERN**: BKC glass spires (LOD-tinted); Juhu sunset shader; Linking Road neon; Khar/Bandra density peaks weekends; ads boards (`HRD-*` art, reused).
- **D HARBOUR**: container cranes (procedural tower + trolley); Koli net mounds; NMIA crane skyline; CIDCO grid road palette (wider lanes, more lights); shipyard welding sparks.
- **E THANE–KALYAN**: MIDC factory boxes; chimney stacks; Kalyan station colonnade; Mumbra night (dark, few lights, neon kirana stores); factory-shift crowd pulses.
- **Sea Link** (exists: elevated deck/skywalk engine): cable-stayed pylons + deck; the Ch 6 "Peg Truck" set piece camera preset.
- **Rail** (new system): 3 lines (Western/Central/Harbour); moving POIs; station approach jingles; rooftop/vestibule interiors via `inside()`.

**Art pipeline:** procedural where cheap (decker, cranes, masts, crates); chroma-keyed skylines where hero (SKY-*-01.png); KTX2 atlases for all new textures; no `.jpg` materials (engine loads `.ktx2`).

---

## 10. Phased plan (each phase shippable to the 8485 preview; acceptance criteria each)

**P0 — Design lock** — this doc approved. *(now)*
**P1 — South Mumbai boots (done)** — map swap, liveries, renames, sky art, decker, VO audit.
**P1.5 — Cleanup (2–3 d)** — fix 3 `KORAMANGALA` leftovers; rename Ch 3 tease to `Bandar Road`; purge the last Bangalore strings (`Silk Board`, `Whitefield`, `Madiwala`, `Indiranagar`); `_source/` mirror sync; preview-server boot check. ✅ *Acceptance: boot clean on the 8485 preview, Ch 1–2 fully playable in Bambai.*
**P2 — Chapter 3 "Eleven After Eleven" (2 wks)** — M9–M11; Meera POV card; the Koli-promenade rendezvous; Dad-call cutscene; debt ticker UI. ✅ *Acceptance: Ch 3 completes end-to-end; no regression on Ch 1–2.*
**P3 — VO batch (1 wk)** — re-record ~42 stale WAVs (or TTS re-render); verify by ear + `verify-vo.ps1`; add subtitle always-on toggle. ✅ *Acceptance: zero subtitle/audio desync in any known-stale clip.*
**P4 — Central Line zone B (3 wks)** — Dadar→Sion→Kurla OSM extract via `reference/osm/` pipeline; mills, flood pools, Sion skyline; rail corridor Phase A; Ch 5–7 missions. ✅ *Acceptance: zone B bootable; 7 new missions; rail jingle.*
**P5 — Western Line zone C (3 wks)** — Bandra→Borivali extract; BKC glass; Juhu; Ch 6 Sea-Link set piece; cricket season 2. ✅ *Acceptance: zone C bootable; sea link drivable.*
**P6 — Harbour zone D (3 wks)** — Sewri→Vashi→Belapur→Panvel; Koli arc; docks; NMIA pier; rail Phase B. ✅ *Acceptance: zone D bootable; Ch 6 & 10 complete; 3-job sting playable.*
**P7 — Thane–Kalyan zone E (2 wks)** — Thane→Kalyan→Dombivli→MIDC; factory opening sequence; Ch 8 assets; the last train out. ✅ *Acceptance: zone E bootable; MMR complete.*
**P8 — The Reckoning (2 wks)** — Ch 9–12; xerox-burn scene; share-garage chase; diary burn; 4 endings; save-v2 migration; `Switch Lead`. ✅ *Acceptance: 12 chapters, 4 endings, v1→v2 saves migrate.*
**P9 — Strangers, collectibles, 100% (2 wks)** — 12 Strangers & Freaks; 48 collectibles; bonds; **BAMBAI ETERNAL**; Bambai After Dark. ✅ *Acceptance: 100% achievable; credits roll.*
**P10 — Polish & launch (2 wks)** — 840-clip VO pass; monsoon audio mix; perf budget (<90 s boot; §9 audits); `?chapter=` deep links; `?lowspec`; press kit. ✅ *Acceptance: launch build + retention loop.*

**Total ≈ 21 weeks solo, 11–13 with a small team.** Every phase shippable.

---

## 11. Open decisions (need your call)

1. **3 leads at chargen vs unlock at Ch 5/6?** (I recommend chargen for agency.)
2. **MMR commitment** — all 5 zones eventually, or stop at A+B and call it finished with C/D/E as DLC?
3. **Ending D — The Rakshasa** — dark enough to keep, or cut?
4. **Radio music** — commission 6 original Gully-Indie tracks, or license existing artists (cheaper)?
5. **Full MMR at this fidelity vs a tighter South+Central core?**
6. **Ch 3 tease name** — `Bandar Road` (keeps the sweep's fiction) or `Retibandar`? (I lean Bandar Road.)
7. **The KORAMANGALA leftovers** — fix now or fold into P1.5?

---

*This document is the canonical master plan. `BAMBAI-STORY.md` is the legacy prose bible; `vendor/game.js` is the shipped truth. All future story work — new chapters, side missions, VO scripts, VO casting — forks from here.*
