# BAMBai → Mumbai ("Bambai") migration — research & phase plan

Research only. **No code was written or changed.** All findings below are verified
against the local build (`vendor/*.js`, `art/`, `audio/`, `brand/`, `assets/`) and
external sources (web fetches, Nov 2026).

## 0. Big picture

The project is already **half-Mumbai in identity, half-Bangalore in content**:

- Brand is already Mumbai-flavored: `brand/amchi-bambai.png`, `brand/amchi-graffiti-skyline.png`
  ("Amchi Bambai" = Marathi "our Mumbai"), cricket team `BAMBAI XI`, signs
  `BAMBAI SITES & LAYOUTS`, `BAMBAI BAKERY`, `BAMBAI MOBILES`, `BAMBAI ELECTRICALS`,
  `BAMBAI TRANSIT` (bus side), share text "BAMBai, a playable Koramangala".
- But the world is Koramangala, Bengaluru: map coordinates (12.9x N, 77.6x E),
  locality names, festivals, Kannada font stacks, Kannada UI cards (`UI-KAN-*`),
  auto livery green/yellow, bus livery blue, `KA` plates, `BLR-*`/`BAN-*` art keys,
  `UI-LOGO-BHOOMI` ("Bhoomi" = Kannada for land), radio in Kannada flavor.

So the migration is **"make the world match the brand"**, not a re-skin from zero.

## 1. Verified Mumbai facts (external sources)

| Topic | Fact | Source |
|---|---|---|
| BEST bus | **Red** ("Lal Dabba"); a white/yellow rebrand was rejected by ~90% of commuters; new double-deckers are red | localpress.co.in, Times of India |
| Auto-rickshaw | **Black + yellow** | Justdial/TradeIndia listings, ubiquitous |
| Taxi | **Kaali-peeli**: black body, yellow roof (Premier Padmini era ended 2023; new cars keep colors) | EveryRang, Economic Times, Jagran Josh |
| Police | Maharashtra Police vehicles: **white with blue stripe / "POLICE"** | mahapolice.gov.in gallery |
| Auto fare (MMR, Sept 2026 revision) | min **₹27** first 1.5 km, then **₹18/km** (older tariff card: ₹23 / ₹15.33) | Lokmat Times, India TV |
| Taxi fare | min **₹33** first 1.5 km | Lokmat Times |
| Festivals | Gudi Padwa (Marathi New Year), Ganesh Chaturthi + Visarjan (Anant Chaturdashi), Dahi Handi, Ashadhi Ekadashi (Pandharpur Wari), Diwali, Maharashtra Day (May 1) | grahchaal.com, panditjionway.com |
| Local trains | iconic suburban rail (Western/Central/Harbour); heritage maroon coaches, modern rakes blue/white | Mumbai Mirror, Wikipedia |

## 2. Bangalore content found in the build (change targets)

**Vehicles** (`vendor/vehicles.js`)
- `un.auto.paints` = `[[0x1f8a46,0xf0b520]×2,[0x1e7f42,0x22803f]]` → Karnataka green/yellow auto.
- `un.bus.paints` = `[[0x1f4dbb,0x3cc4ee]]` → blue city bus; name `BAMBAI Transit City Bus`.
- `un.taxi.paints` = `[[0xeeebe2]]` → off-white; name `Saheb Sedan · GoGo Cabs`.
- `un.police.paints` = `[[0xf1efe9]]` → near-white.
- Bus route LED decal: `route:{lines:['201','KORAMANGALA','KORAMANGALA','SILK BOARD','SILK BOARD'],…led:!0}`.
- Number plates are **procedural** from a code list `G` (`Ee={…plate${t}…}` `plateY`, `plate2` via `e.slice(0,5)`/`slice(6)`) — swap list to `MH` format.
- Display names `ln={auto:'Gaja Three-Wheeler', bus:'BAMBai Transit City Bus', taxi:'Saheb Sedan · GoGo Cabs', police:'Patrol Interceptor', …}`.

**Map / layout** (`vendor/map.js`, 1.27 MB)
- Real Koramangala geometry: lat/lon 12.92–12.94 N, 77.61–77.63 E; 40 named
  landmarks (Sampige Club, GMP School ×3, Arogya Nagar Grounds, Shri Eshwara Temple,
  Church of the Good Shepherd, Roshni Masjid, Santosha Sagara Chaats, Filter Wave
  Coffee, Koramangala Transit Hub, Ooru Police Station, Shankar Talkies, Thaatha Kamba,
  …); road names (80 Feet Road, Srinivagilu Main Rd, Mahayogi Vemana Rd, Inner Ring Rd,
  Silk Board Flyover, 20th/29th Main Rd…); bus stops, colleges, lakes (HSR/Kudlu/Varthur),
  parks, skywalks, flyovers, elevated, `LAKE.poly`.

**HUD / telemetry** (`vendor/hud.js`)
- Locality labels: Koramangala 1st–8th Block, ST Bed Layout, Ejipura, Adugodi,
  Madiwala, Venkatapura, BTM Layout, Tavarekere, Silk Board… + mission coords.
- Stats cards: "Time in Koramangala", "Auto fares haggled", "Cows honked at",
  "Koramangala's Most Wanted (Briefly)", "Certified Koramangala Local",
  "Mete…" (metered), mission names "Meter Plus Half", "Ee Sala Night" (Kannada "this year").
- Mission VO strings: "Aunty, nodi." (Kannada "come"), "Kavya", "Leela", "Arjun",
  "Survey forty-seven", tanker/plate plot lines.

**Menus / tips** (`vendor/menus.js`)
- Title "MY KORAMANGALA"; tips list; auto-hail phrases
  (`'Auto, coming? Koramangala inside only.'`, `'Auto! Meter on, please.'`,
  `okMeter:['Meter? Excellent! Let's go, come.','Wow, meter. I'll tell my grandchildren about…']`,
  haggling lines); "minutes in Koramangala".

**City build / art** (`vendor/city.js`, `vendor/buildings.js`)
- Signboards: IYENGAR, KANAKA SILKS, GMP School, GUBBI OPTICALS vs Bambai ones
  (BAMBAI SITES, CHAAT STREET, …). "RATE CARD · RATE" Xerox sign (₹1 …).
- Scoreboard: `BAMBAI XI v MYSURU MASALA` (city.js) — rival is Mysuru.
- Skyline panorama = `SKY-DAY-01 / SKY-DUSK-01 / SKY-NIGHT-01` (art keys) drawn as a
  cylinder; `textures/skyline/` does **not** exist (art-driven).
- Fonts: `Ni="Kohinoor Kannada","Noto Sans Kannada","Tunga","Nirmala UI","Kannada Sangam MN"` → Devanagari stack.

**Calendar** (`vendor/bangalore.js`, 996 B)
- Festivals: `dasara` (Oct 10–20 2026), `ayudha` (Oct 19–20), `rajyotsava`
  (Oct 28–Nov 1, yearly = Karnataka state day), `diwali` (Nov 5–10 2026); `?floods` hook.

**Audio**
- Radio: Kempu FM, Gully Indie, Hale Haadu, Hustle FM, **Silk Board Traffic Radio**,
  My Radio (`vendor/audio.js`; art `UI-RADIO-01..06`; key `nammauru-myradio`).
- 249 street VO WAVs (`audio/street/`), 33 amb, 33 loop, 7 music dirs
  (event, gully, hale, hustle, kempu, score…), 62 sfx. VO language status: see the
  standing "249 street WAVs unverifiable" decision (still open).

**Art keys that scream Bangalore** (`art/index.json`, 534 items)
- `BLR-BUS`, `BLR-BAR/FLEX/FX/POS/SIGN`, `BAN-BDAY/EVT/POL/V` (BAN/BLR = Bengaluru),
  `UI-KAN` ×24 (Kannada UI cards), `UI-LOGO-BHOOMI`, `GND-RANGOLI` ×6,
  `BAN-*` posters, `LMK-DET/WIN`, `HRD-01..32` hoardings, `POST-*`, `SHOP-01..53`,
  `MUR-*` murals, `GRAF-*`, `AUTO-Q-01..14` (auto queue), `VEH-AUTO/BUS/CAR/…`,
  `WALL-AD`, `TEX-*`, `INT-*`, `SKY-DAY/DUSK/NIGHT`, `UI-LOAD-*`, `UI-LOGO-SKY`.

## 3. Phase plan (research → scope, cheapest first)

**Phase 0 — Decide scope (you)**
- Full Mumbai world vs light reskin (keep grid, rename only)?
- Keep brand "BAMBai"? (Recommended — it *is* Mumbai slang; brand assets already match.)
- Real names (BEST, kaali-peeli, Siddhivinayak) vs fictional (BAMBAI TRANSIT, Saheb Sedan)? Current code is fictional-with-real-geometry; recommend staying fictional for names, real for colors/fares.

**Phase 1 — Liveries & identity (code-only, no new assets)**
- Auto → black+yellow; bus → BEST red (keep double-decker idea); taxi → kaali-peeli
  (black body, yellow roof); police → white + blue stripe + "MUMBAI POLICE";
  plates list `G` → `MH 01/02/03 …`; route LED `KORAMANGALA/SILK BOARD` → Mumbai routes
  (e.g. `493 COLABA`, `201 DADAR`); vehicle display names; menus auto-hail lines
  ("Meter chalao bhai", "Put the meter on" stays fine); stats "Auto fares haggled" stays.
- Files: `vehicles.js` (paints, `ln`, `route`, `G`), `menus.js` (phrases), `hud.js` (labels).

**Phase 2 — Map & labels (data swap)**
- Keep street-grid engine; replace `map.js` data OR rename every label/road/stop/
  destination + re-pin coords to Mumbai wards (Colaba, Fort, Marine Lines, Malabar Hill,
  Nariman Point, Worli, Lower Parel, Dadar, Sion, Bandra, Andheri, Juhu, Borivali,
  Powai, Chembur, Kurla, Thane…). Mumbai landmark analogues for the 40 labels
  (Sampige Club→Gymkhana, Shankar Talkies→talkies cinema, Transit Hub→BEST depot/
  Shivaji Nagar stand, Eshwara Temple→Siddhivinayak, Good Shepherd→Mount Mary,
  Filter Wave Coffee→Irani cafe/Leopold, Santosha Sagara Chaats→Juhu beach chaat,
  Bun Mane Burger→Bademiya, Madira Mandi→Mandai market…).
- `game.js` chapter titles ("Chapter 1 Koramangala" ×4), drum-screen "KORAMANGALA DAY"
  → "BAMBAI DAY", share text, weather toasts ("Madiwala underpass…" → "Mithi river…"),
  `city.js` destinations (Indiranagar/HSR/MG Road/Whitefield/Malleshwaram/Jayanagar/
  Electronic City → Bandra/Andheri/Powai/Thane/Dadar/Colaba/Borivali/Vashi) + rival
  `MYSURU MASALA` → Mumbai rival.

**Phase 3 — Calendar, weather, fonts**
- `bangalore.js` festivals → Maharashtra set (Gudi Padwa, Ganesh Chaturthi+Visarjan,
  Dahi Handi, Ashadhi Ekadashi, Diwali, Maharashtra Day May 1); keep `?floods`
  (Mumbai monsoon waterlogging is iconic); weigh heavy-rain weight in `weather.js`;
  Kannada font stack → Devanagari; `UI-KAN-*` (24 cards) → Devanagari/Mumbai cards;
  `GND-RANGOLI` → Mumbai street art (GRAF/MUR already exist).

**Phase 4 — Audio & VO**
- Radio: rename stations (keep "Gully Indie" — it fits Mumbai hip-hop; "Kempu FM"→
  "Bambaiya FM", "Hale Haadu"→"Hale Gaani", "Silk Board Traffic Radio"→"Bambai Traffic Radio",
  art `UI-RADIO-01..06`); `nammauru-*` analytics keys → `bambai-*`.
- Street VO (249 WAVs): the open decision — delete / supply genuine Bambaiya Hindi /
  triage. Same class as the earlier Kanglish removal.
- Ambient: add local-train horn, rain+monsoon, vada-pav stall, cutting chai, dabbawala
  crate clatter to `audio/loop|sfx` (optional).

**Phase 5 — New content (bigger)**
- Skyline panorama art (`SKY-DAY/DUSK/NIGHT`) → Mumbai silhouette (Marine Drive curve,
  CST dome, Bandra-Worli Sea Link, palms, chawls, cranes); `brand/` set
  (amchi-bambai.png is already Mumbai!; load-*.jpg, carousel, UI-LOGO-SKY, UI-LOAD-*);
  NPC wardrobe/names (character.js `ramanna/broker/chirag/kabir/gopal`, `ped_lungi`,
  `ped_saree`…) → Mumbai set (dabbawala with tiffin crates, Koli fisherfolk, Pathan
  tailor, Bollywood tourist, aunty in nauvari saree); food props (vada pav, misal,
  bhel, cutting chai, pav bhaji); auto-rickshaw art `AUTO-Q-*` keep (they're generic).
- Optional: local train as moving landmark/traffic layer; sea coastline for Marine Drive
  (map has `LAKE.poly` — could become the Arabian Sea); double-decker BEST bus variant;
  ferry.

**Phase 6 — QA & brand**
- Update `brand/` hero + loading screens; verify every renamed label renders in
  Devanagari; re-run the boot verification (preview server + 95-URL sweep) after each phase;
  keep `_source/` mirror in sync for any `vendor/` edit.

## 4. Risks / open questions

- Auto-meter **fare constant location not yet pinned** (the `p={from:19,…}` in audio.js is
  cricket, not fare). Pin during Phase 1.
- `art/index.json` key semantics for `BLR-*`/`BAN-*`/`UI-KAN` need one visual check
  (which are billboards vs UI) before deletion/regen.
- VO: 249 street WAVs still unverified as English (standing decision).
- Map swap is the only phase that can break the boot (data-driven geometry) — verify
  with the preview-server URL sweep after each edit.
- No large asset copies / no synthesized textures without your approval (standing rule).
