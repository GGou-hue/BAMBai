# BAMBAI — Story Bible & Phased Implementation Plan

**Working title:** *BAMBAi: City of a Thousand Gullies*
**Genre:** GTA Vice-City-style open-world crime drama, present-day (2026), ground-level Mumbai.
**Setting:** South Mumbai — Colaba → Navy Nagar → Oval Maidan → Fort → CSMT → Dock → Marine Drive → Haji Ali → the edge of Sion. (Migrates with the map from Koramangala; see `MUMBAI-PLAN.md` §4.)
**Language:** Bambaiya Hindi code-switched with English (Hinglish) — the way the city actually speaks. Subtitles always-on.
**Length:** 12 chapters · 38 main missions · 12 side missions · 3 endings.
**Tone:** warm, funny, heartbreaking. Chai before bullets. Family before empire.

> Status note: Chapters 1–2 exist in-build (Koramangala map). This bible is written
> to be map-agnostic; South Mumbai names are normative, Koramangala names are legacy
> aliases until the map swap ships.

---

## 1. Premise

A twenty-year-old delivery boy steps off the last bus from a small town with a
father he can't call, a debt he didn't sign up for, and a courier bag full of
someone else's secrets. To pay his father's legal fees, he becomes the invisible
man of the gully — and in a city that chews up the invisible, invisibility turns
out to be a superpower.

The enemy: **the Rakshas Group**, a real-estate cartel grabbing the lake bed/harbour
land with fake survey pegs, buying the press, the police and the court.
The weapon against them: **a xerox shop, one brave newspaper and a delivery boy
who knows every lane.**

---

## 2. The world (map-driven story geography)

| Place (Mumbai) | Role in story | Legacy (Koramangala) |
|---|---|---|
| Colaba bus stand / CSMT plaza | Opening, arrivals, the city as character | Bus stop |
| Navy Nagar / Colaba Causeway | Bike/auto maze, the gullies, PG life | 80 Feet Road |
| Oval Maidan | Fixed jobs, kids playing, press interviews | Lake (pre-build) |
| Koliwada (Colaba fishing village) | Boat/harbour runs, Koli elder | — |
| Fort / Horniman Circle | Rakshas Group HQ, corporate towers | Rakshas M3 tech block |
| CSMT + rail yards | The rail war, chases, the underclass | — |
| Marine Drive | Empire moments, sunset drives, the fall | — |
| Haji Ali shrine | Bai Firoz's territory / the funeral | — |
| Xerox shop (Oval/Fort) | Leela aunty's shop — the story's heart | Xerox shop |

Every mission location is one of these; every mission is driveable/ridable.

---

## 3. Cast

### Protagonist
- **ARJUN**, 20 — delivery rider for BAMBAI EXPRESS. Small-town, polite,
  invisible by design. Knows the price of silence because he was raised on it.
  Signature line: *"Meter on karo, uncle. Receipt bhi."* (Meter on, uncle. And the receipt.)

### Family
- **MOM (SAROJA)** — voice on the phone; packs chapathi; ₹40,000 pride.
- **DAD (VEER)** — disgraced journalist; defamation case filed by the Rakshas
  Group after he printed the lake-pegs story. The reason Arjun came to the city.
- **Pinky (sister, 14)** — off-screen; her hostel fees are the clock on the debt.

### The gully
- **LEELA** (62) — runs the xerox/print shop. The Oracle. Nothing passes through
  her shop she doesn't photocopy into existence. Keeps a steel flask of chai and
  a diary nobody reads.
- **KAVYA** (22) — Leela's assistant; aspiring investigative journalist; prints
  the exposé on a Riso duplicator older than both of them.
- **PUTTA** (30s) — the Rakshas Group's street muscle; grew up two lanes over;
  Arjun's childhood friend-turned-enemy. The tragedy is he thinks he's loyal.
- **BAI FIROZ** (70s) — the syndicate matriarch; runs the docks from a darshini
  stall; rains on bad news the way she rains on the monsoon. Vice-City bug of the story.
- **CIRCLE SURESH** — the corporator's man; can be moved by money or by love; mostly money.
- **ROHIT ("Boss")** — garage mechanic; fronts the bikes, the cars, the kaçỗ.

### The opposition
- **RAKSHAS GROUP** — real estate cartel. Front: a glass tower in Fort. Engines:
  fake survey pegs, bought courts, a bought newspaper (*The Meridian Times*,
  whose editor Arjun's dad once worked under).
- **THE MERIDIAN TIMES** — the corrupted rival paper; prints Rakshas's version of events.

---

## 4. Themes
- **The press vs. power** — information as the only weapon the small can hold.
- **Invisibility as survival** — the delivery boy nobody sees is the one everyone fears.
- **Community vs. concrete** — the gully is a village; the tower is an eviction.
- **Family vs. empire** — the same phone call that saves Dad dooms the city.
- **Chai before bullets** — always feed the player tea before sending them into violence.

---

## 5. Morality & economy (fits existing systems)
- **Money**: mission rewards, auto/taxi meter fares, bonds payouts. Debt: ₹2,00,000 (Dad's case + Pinky's fees), ticking countdown in the HUD (`Inbox`).
- **Bonds** (existing `bonds` save field): Karma per character — Leela, Kavya, Putta, Bai Firoz, Mom. Visible in HUD as hearts; low Putta-bond opens a path, high opens another.
- **Street cred**: crowd cheer meter at night (radio bleed, honking), drives cricket match unlocks and walk-in restaurant prices.
- **Endgame currency**: trust. Spendable in the finale.

---

## 6. The 12 chapters (map to `vg` mission array; Ch1–2 exist in-build)

### ACT I — THE GULLY
**Chapter 1 — The Last Bus In** *(playable now; Koramangala map)*
- **M1 `arrival` — "Last Bus In"** — Arjun arrives at the bus stand with a courier
  bag and his father's case file. Learn to ride. Meet the snack cartaunty.
  *Existing opening.*
- **M2 `firstDrop` — "First Drop"** — First delivery into Rakshas's tower in Fort;
  Arjun sees the survey pegs being hammered *inside* the company lobby.
  *New main mission; beat = chapter-hook.*

**Chapter 2 — The Lake Files** *(playable now)*
- **M3 `copier` — "Cold Prints"** — Leela's xerox; three photos of the pegs;
  Leela warns Arjun the paper will come for him.
  *Existing cutscene — promotes to mission.*
- **M4 `lakePegs` — "Pegless"** — pull the survey pegs at night; a near-miss
  with the Rakshas night watchman.
  *Existing "Survey pegs on the lake bed" POI becomes the mission arena.*
- **M5 `kavyaRun` — "One and a Half"** — deliver the prints to Kavya while
  Rakshas's men chase; motorbike escape; the ₹450 note in the taxi meter.
  *Existing chase beat.*
- **M6 `pressDay` — "First Name in the Paper"** — the exposé prints; the city
  reads it over chai; Putta reads it last and loudest.
  *End of existing Chapter 2.*

**Chapter 3 — Eleven Tonight** *(NEW — the first full Mumbai chapter)*
- **M7 `tabStop` — "Meter Plus Half"** — forced taxi negotiation: the fare snowballs
  every second; underpay and the driver calls the goons. *(Existing side-quest promotes to main.)*
- **M8 `elevenTonight` — "Eleven Tonight"** — unknown-number tea-stall rendezvous;
  Arjun meets the "Koli elder" who knows what the pegs are really for — fishing
  rights. Map reveals: the "lake" is the harbour approach.
  *Existing cutscene payoff.*
- **M9 `pressMatter` — "Press Matter"** — Arjun takes Dad's case file to a
  lawyer; the lawyer takes ₹25k and a promise. Dad calls; the case worsens.
  *Family-stakes chapter; Mom phones in during the mission.*

### ACT II — THE GAME
**Chapter 4 — Koli Harbour**
- **M10 `boatRun` — "Harbour Freight"** — one dawn run on a Koli boat: legitimate
  fish on the manifest, something else in the hold. Choice: tip the customs man or not.
- **M11 `netWorth` — "Net Worth"** — the syndicate's first "job interview": pull
  200 kg of nets in 8 minutes; Bai Firoz watches from the darshini stall.
- **M12 `masalaMatch` — "BAMBAI XI vs Mysuru Masala"** — cricket night funds the
  case; fix or refuse the fix; the crowd outcome alters crowd-cheer meter.
  *(Existing BAMBAI XI; Stadium night event exists in engine.)*

**Chapter 5 — The Flat**
- **M13 `houseKey` — "House Key"** — first flat deposit; buy furniture at
  Chor Bazaar; haggle mission.
- **M14 `inlawBluff` — "The Aunties Know"** — Shanti auntie visits unannounced;
  Arjun must keep the crime life invisible while hosting tea. Stealth-lite.

**Chapter 6 — Numbers Man**
- **M15 `numbersMan` — "Numbers Man"** — run numbers for Bai Firoz's syndicate;
  learn the route net; first cut is ₹9,000.
- **M16 `julious` — "The Traitor's Fee"** — a crewman skims; Arjun must decide:
  turn him in, cover for him, or get between. Putta watches. *Moral fork.*
- **M17 `bigBluff` — "The Big Bluff"** — scam the scammer: Rakshas's fixer comes
  to buy the syndicate; Bai Firoz lets Arjun run him.
- **M18 `baiStorm` — "Bai Storm"** — Bai Firoz's monsoon rage at a missed
  shipment; Arjun takes the blame to shield Rohit. **Bond +3 Firoz.**

**Chapter 7 — Platform Six**
- **M19 `platformSix` — "Platform Six"** — the syndicate's heroin run through
  CSMT; Arjun rides the train as lookout; a woman travelling alone notices him.
- **M20 `railYard` — "Rail Yard"** — rival crew hits the yard; running gun/boat
  fight; save the woman or the shipment. *Moral fork; high resonance with Dad's case.*
- **M21 `dockLedger` — "The Dock Ledger"** — steal Rakshas's harbour ledger from
  a customs inspector; drop it to Kavya. **The investigation tightens.**

### ACT III — THE EMPIRE
**Chapter 8 — Marine Drive**
- **M22 `boulevard` — "The Boulevard"** — Bai Firoz sick; Arjun promoted to
  "acting man"; Marine Drive night cruise; the city at last belongs to him. *Power fantasy peak.*
- **M23 `headphone` — "The Headphone Man"** — hit ordered on Arjun by Rakshas's
  boardroom; survive a staged "random" accident at the cricket match. *Existing cricket night becomes combat set-piece.*
- **M24 `pressWar` — "The Meridian"** — Arjun buys or burns *The Meridian Times*;
  Kavya refuses to get bought. **Bond fork: stay journalist or go gangster.**
- **M25 `taxiAndTrunk` — "Taxi & Trunk"** — the last Rakshas peg crew is rolled
  up; Arjun drives the marker-truck; the city tips its hat.

**Chapter 9 — The Stay Order**
- **M26 `stayOrder` — "Stay Order"** — Rakshas wins an injunction; checkpoints
  everywhere; the pegs come back up **on camera**.
- **M27 `xeroxRaid` — "Xerox Raid"** — Leela's shop raided; the diary burns;
  Arjun escapes with a single photocopy in his jacket. *Emotional nadir #1.*
- **M28 `dadLoses` — "Verdict"** — defamation verdict against Dad: ₹12 lakh;
  the flat goes; Mom's voice breaks on the phone. *Emotional nadir #2.*
     *Chapter title card: "The paper lost. The lake is still ours to lose."*

**Chapter 10 — The Sting**
- **M29 `hiddenCam` — "Hidden Cam"** — wire Kavya into the Fort tower; record
  the peg-order signature; 36 hours before the ship.
- **M30 `customsRaid` — "Customs Raid"** — Bai Firoz authorizes the sting:
  customs + the honest cop Circle Suresh; Harbour showdown; Putta corners Arjun on the dock.
  **Putta's last stand: spare him or not. Bond determines ending.**
- **M31 `evidenceBag` — "Evidence Bag"** — deliver the tape to a judge who
  owes Bay Firoz a favour; the stay order is voided; fork in the road appears in the HUD.
- **M32 `theLeak` — "The Leak"** — *The Meridian Times* prints Arjun's version of events;
  the city turns; the Rakshas board flees to Dubai. **Chapter 9's light restored.**

### ACT IV — THE RECKONING
**Chapter 11 — The Funeral**
- **M33 `ashWedding` — "White Khadi"** — Bai Firoz dies peacefully at Marine
  Drive; her funeral walks the whole gully; Arjun carries the lid.
- **M34 `succession` — "The Succession"** — the syndicate votes; Putta returns
  as kingmaker; the city holds its breath. *The GTA moment: everyone wants Arjun now.*
- **M35 `setFire` — "Set Fire to the Diary"** — Arjun burns Leela's original
  diary to stop Putta using it; the gully watches; some understand, some never do.

**Chapter 12 — BAMBAI**
- **M36 `finalCopy` — "Final Copy"** — print one million copies of the lake-peg
  story; every xerox in the city turns at dawn. **The city reprints the truth.**
- **M37 `vinyNight` — "Vinyl Night"** — last song on the radio; the city dances
  in the rain; Arjun rides home with the meter off.
- **M38 `endingFork` — "THE FORK"** — three endings gated by Bonds/Karma:
  - **ENDING A — "The Paper"** *(high bonds, low crime)*: Arjun gives the syndicate
    to the police, Dad's name clears, he opens a printing press with Kavya.
    Final shot: Leela's shop, new sign: *BAMBAI PRINTS.*
  - **ENDING B — "The Empire"** *(high Firoz, high Street Cred)*: Arjun takes the
    docks; the city bows; Bai Firoz's darshini renamed *ARJUN DARSHINI*.
    Final shot: his own bike, meter off, no destination.
  - **ENDING C — "The Lake"** *(high Leela + Kavya bonds)*: Arjun gives the
    evidence to win the lake case, then walks away from everything; the gully
    keeps his photo over the xerox door; next bus leaves without him.
    Final shot: rain on Marine Drive, bus pulls away, he raises one palm.

### 12 side missions (contractable at Leela's counter; all `side:` save-slotted)
- **S1 `wallArt` — "Tag Six"** — graffiti run across Fort; each tag unlocks a shortcut
  (crew tags = free travel intel).
- **S2 `meterKing` — "Meter King"** — win 10 meter haggles in a row; unlocks ₹1 fares.
- **S3 `roofRun` — "Rooftops"** — rooftop time-trial from CSMT to Marine Drive.
- **S4 `snehaBay` — "Chai for the Ward"** — deliver medicine to the hospital ward
  before the nurse's shift ends.
- **S5 `strayDogs` — "Every Dog"** — feed the strays under the flyover; each dog
  you feed warns you of police presence later in the night.
- **S6 `monsoonBoat` — "Rescue in the Rain"** — monsoon flood rescue; saves 5
  stranded kids for a bonus ending beat.
- **S7 `drumDock` — "Dock Drums"** — smuggle a drum kit through the docks for a wedding.
  (The drum-screen event becomes a heist.)
- **S8 `pgLife` — "Month-end Math"** — survive the month: rent, food, Pinky's fee.
  (Resource-management side chapter.)
- **S9 `bakeRun` — "Five Hundred Pav"** — deliver 500 pav-bhajis to the cricket ground
  before the rain starts.
- **S10 `bikeBog` — "Bog Ride"** — the engine's signature jump; unlocks at Ch. 2.
- **S11 `koliTales` — "Koli Myths"** — collect 5 stories from the Koli elder; each unlocks
  a harbour shortcut and a Bonzal shade for the boat.
- **S12 `cricketFix` — "The Match Fix"** — deeper cricket branch; outcome changes
  BAMBAI XI's season and the crowd's respect meter.

**Total: 38 main + 12 side = 50 missions.** Every mission: ≤ 6 minutes,
replayable from Brief, checkpoint-based (existing `onCheckpoint` system).

---

## 7. VO / subtitles / UI plan (fits existing systems)

### Dialogue & VO budget
- Existing: `e.say(speaker, line)` + `e.prefetch(speaker)`; 249 street WAVs;
  `phone` chat system (Mom, Kavya threads); radio; inbox notifications.
- New lines: **≈ 340 main + ≈ 110 side + ≈ 140 flavour = ~590 lines** (vs 249 today).
- Voice direction: Bambaiya Hindi code-switched with English (Hinglish) — the
  way Mumbai actually speaks. Per your standing language rule: **no Kanglish,
  no Kannada, no Madras flavor**; audit every legacy line and re-record the
  few that slip through.
- Speakers (10): Arjun, Mom, Dad, Leela, Kavya, Putta, Bai Firoz, Circle Suresh, Rohit,
  System/Pathan announcements (stations, checkpoints).
- Recording plan: home studio, phone VO, free/cheap tooling; street crowd reuse.

### Subtitle rules
- Always-on by default (existing `.nu-sub`); toggle in Brief (`Esc`).
- Same strings feed VO + subtitle; no sub-only jokes.
- Marathi flavor words (`vaat`, `gammat`) with English gloss in parentheses on first use.

### Three.js / HUD UI surfaces (existing + new)
| Surface | Status | Use |
|---|---|---|
| Chapter cards (`cr-tag`, chapter-end screen) | exists | 12 chapter intros/outros |
| Passport stamp pop-ups | exists | chapter completion stamps |
| Word/reading cards (`wordCards`) | exists | vocabulary moments (legal terms) |
| Bonds HUD (hearts) | exists | Karma per character visible |
| Phone: threads, inbox, notifications, battery | exists | Mom/Kavya/family pressure, missions briefed in-app |
| Radio (within-car only) | exists | 12 stations; music reactive to chapter mood |
| Big map | exists | South Mumbai chapters; mission icons + Koli shortcuts |
| Cricket night / drum-screen | exists | Ch.4 & Ch.10 set pieces |
| **NEW: ₹ Debt Ticker** | new | Mom's loan amount ticks down in HUD; panic meter |
| **NEW: Bond toasts** | new | on every Bond point, a toast ("Leela smiled at you") |
| **NEW: chapter-end vote screen** | exists | keep (retention mechanic) |

---

## 8. Implementation phases (each phase = shippable, verifiable build)

**Phase S1 — Bible → data (2 days)**
Convert this doc into `story.json`: chapters[], missions[] with `{id, chapter, title,
start (POI key), hint, beats[], bondDeltas, voIds}`. Validate against current
`mission` schema (`id/title/start/hint/run`). No game code changes.

**Phase S2 — Chapter 3 "Eleven Tonight" (1.5 weeks)**
Build M7–M9 against current engine: tea-stall POI → mission flow; `press-matter`
beat; Dad-phone cutscene; debt ticker UI. Ship as a free update with a chapter-end
vote screen (existing mechanic) — validates pacing & retention.

**Phase S3 — VO batch 1 (1 week)**
Record 160 lines (Arjun, Mom, Dad, Leela, Kavya); wire to `e.say` + subtitle
fallback; delete/replace 25 legacy Kannada-flavored lines. Audit every line for
Kanglish residue (your standing rule).

**Phase S4 — Act II map build-out (2 weeks, parallel to Mumbai map Path A/B)**
Koli Harbour + Train yards data (map.js structures exist); Ch.4–7 missions;
phone-thread content; cricket-fix side quest.

**Phase S5 — The Reckoning (1.5 weeks)**
Ch.8–12; the Fort tower as a proper interior (`inside()` exists); the raid;
three endings + divergence gates; Leela's diary burn scene.

**Phase S6 — Polish & VO batch 2 (1 week)**
Radio song pass (6 new Gully-Indie-style tracks), monsoon sound pass, subtitle QA,
chapter-end vote screens for all 12 chapters, performance budget (249+ VO assets
are a load concern — lazy-fetch on demand, cache).

**Phase S7 — Release & retention (2 weeks)**
`?chapter=3..12` deep links, chapter-end vote screen updates, analytics events
(`chapter_started`, `mission_complete`, `ending_chosen`), save-compat migration
(`{v:1} → {v:2}` with `chapter` field), press kit (the game *is* the marketing).

---

## 9. Compatibility with existing build
- Chapter 1–2 remain exactly as-is, renamed in credits to *Chapter 1: The Last Bus In* / *Chapter 2: The Lake Files*.
- `zg` opening and `Bg` ending reused.
- Save format extended (`chapter`), migration in `Lg()`-equivalent loader.
- `?mission=` deep-link already works — reused for `?chapter=`.
- No art assets required for S1–S3 beyond VO; Ch.4+ needs 2 new skybox variants (Fort tower corridor — reuse `t13-rakshas` interiors).

## 10. Open decisions (need your call)
1. **Map order**: finish Mumbai map *before* Chapter 3 (story fits geography better) or ship Chapter 3 on the Koramangala map first?
2. **Ending B "The Empire"**: does the developer's tower fall? If yes, who runs the syndicate at the end?
3. **Dad's verdict**: guilty-with-costs (realistic) or exonerated-with-costs (feel-good)?
4. **VO language purity**: strict Bambaiya code-switching everywhere, or keep a few retro-Madras flavor lines for Leela?
5. **Chapter count vs. scope**: 12 chapters is the ask — cut side missions to 8 if timeline slips, keep all 38 main missions?

---

*This document is the canonical story bible. All future story work (new
chapters, side missions, VO scripts, VO casting) forks from this file.*
