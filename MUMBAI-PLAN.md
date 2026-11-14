# BAMBai → Mumbai (South Mumbai first) — implementation plan

Research is done; this doc is the Phase-0 → Phase-1 bridge. **No game code has been
modified.** Only `MUMBAI-RESEARCH.md` and this file were added.

## 1. Phase-0 decisions — status

| Decision | Status |
|---|---|
| Full Mumbai world vs light reskin | **Full swap**, starting with South Mumbai (user directive) |
| Keep brand "BAMBai" | **Assumed YES** (brand already Mumbai-flavored: `brand/amchi-bambai.png`, `amchi-graffiti-skyline.png`). *Confirm.* |
| Real names vs fictional | Recommendation stands: **fictional names, real colors/fares** (BEST red, kaali-peeli black/yellow, MH plates, ₹27/₹18 auto fare). *Confirm.* |

## 2. How the map is wired (verified)

- `vendor/map.js` (1.44 MB) builds one layout object `Ot`, exports as `$` / `t as Ee`.
- `vendor/city.js` imports `t as Ee from "./map.js"`; `async function Sd(e, t=Ee)` = the
  city builder. `game.js` boot calls `Kr(this.r)` (= city.js `Sd`) with **no layout arg**
  → the default `Ee` is used. So the entire city is `map.js`'s `$`.
- `_source/` mirrors `vendor/`; any `vendor/map.js` change must be mirrored + ESM-validated.

## 3. map.js schema (reverse-engineered, exact)

The Koramangala layout is **hand-authored FROM OpenStreetMap** — every block cites
`OSM way <id>` in `src:`, and `bareStreets`/`treeTruth` are `[lat,lon,…]` anchors.

Top-level object `$`:
- `ROADS` — `{ nodes:[{x,z}], edges:[{a,b,width,medianW?,lanes?,phantom?}] }` + a list of
  `{id,kind:'flyover',height,rampTo,edges:[idx…]}` structures.
- `BOUNDS` — `{minX,maxX,minZ,maxZ}` (game meters).
- `blocks` / `PLACES` — array of block objects:
  `{id,name,type,style,palette:[hex,hex],x,z,ry,w,d, walls:[[x,z,x,z,…]], skip:[[]],
  gates:[[x,z,r,doorIdx]], drives:[[x1,z1,x2,z2,…]], bldgs:[[x,z,ry,w,d,h,skin]],
  res:[[x,z,w,d]], keep:[], src:'…OSM way NNN…'}`
- `WALKS` — `{nodes,edges}` pedestrian graph.
- `PARKING` — array; `POTHOLES`, `ROADWORKS`, `BREAKERS` — arrays (BREAKERS built by
  `Xe(s, ROADWORKS)`); `dips:[{plan}]`.
- `LAKE:{poly:[[x,z]…], waterY:-.55}`; `parks`; `groundParks:[xt(groundNorth),xt(groundSouth)]`
  where `groundNorth/South = {lat,lon,src:'…'}`.
- `flyover`, `skywalks`, `elevated:{decks,stations}`, `structures`.
- `shops:[[x,z,name]…]`; `medians:[{style,road,a:H({lat,lon}),b:H({lat,lon})}]`.
- `bareStreets:[[lat,lon,r]…].map(([lat,lon,r])=>({x,z,r}))`; `treeTruth:[[lat,lon,'foot'…]…]`.
- `landmarks`; `footprints:{list,zones,all,heroN,trees,lanes}`.
- Projection helper at top: `toGame([lat,lon]) → [x,z]`, `bounds`, `half`, `LAT0/LON0`,
  `local()` — built from a bbox `[S,W,N,E]` via `H({lat,lon})`.

## 4. The blocker: no live OSM from this sandbox

- `overpass-api.de` / `kumi.systems` — both fail: PowerShell `Invoke-WebRequest` →
  "underlying connection closed"; `curl.exe` → `SEC_E_NO_CREDENTIALS`; `web_fetch` →
  30 s timeout on even a count query. **I cannot pull OSM data for you.**

Two paths (pick one):

**Path A — you run the pull locally (recommended, true OSM):**
1. Run the Overpass query below for the South Mumbai bbox and save `south-mumbai.json`.
2. Hand me the JSON; I write the transformer that emits `map.js`-schema records
   (blocks from building footprints, ROADS from `highway` ways, `bareStreets`/`treeTruth`
   from `leaf`/`tree` points, `LAKE.poly` from water polygons, `PARKING` from
   `amenity=parking`, `structures` from `building=…` + `railway`, `shops` from
   `shop=*`, `landmarks` from `tourism`/`historic`).
3. I emit `vendor/map-mumbai.js`, wire `?city=mumbai`, mirror to `_source/`, verify boot.

**Path B — I hand-author a minimal South Mumbai core now** (approximate lat/lon from
geographic knowledge, `src:` fields marked `approx — verify vs OSM`), sized ~1 km²:
Colaba → Marine Drive → Nariman Point → Fort → Navy Nagar/Cuffe Parade + Oval Maidan +
CSMT triangle. You boot it, see Mumbai, and later replace with Path A data. No new assets
needed; pure data.

## 5. South Mumbai OSM recipe (for Path A)

Bbox: **`18.90,72.81,18.96,72.85`** (Colaba → CSMT → Mahalaxmi → Worli Sea Face).

```
[out:json][timeout:180];
(
  way(18.90,72.81,18.96,72.85)["highway"~"primary|secondary|tertiary|residential|trunk|motorway"];
  way(18.90,72.81,18.96,72.85)["building"];
  way(18.90,72.81,18.96,72.85)["landuse"~"park|grass|recreation_ground"];
 way(18.90,72.81,18.96,72.85)["natural"~"water|coastline"];
  way(18.90,72.81,18.96,72.85)["railway"~"rail|light_rail|tram"];
  way(18.90,72.81,18.96,72.85)["amenity"~"parking|bus_station|fuel"];
  way(18.90,72.81,18.96,72.85)["shop"];
  way(18.90,72.81,18.96,72.85)["tourism"~".|historic"~".|leisure"];
  way(18.90,72.81,18.96,72.85)["man_made"~"tower|minaret"];
);
out body; >; out skel qt;
```

Run with: `curl -X POST --data-urlencode "data@query.overpassql" https://overpass-api.de/api/interpreter -o south-mumbai.json`
(or any Overpass front-end, e.g. https://overpass-turbo.eu — paste, Export → raw JSON).

## 6. Hand-authored core sketch (Path B reference)

Anchors (approx lat/lon, verify before shipping):
- Marine Drive curve: 18.9235,72.8200 → 18.9300,72.8280 → 18.9360,72.8300
- Gateway of India: 18.9220,72.8347; Taj Mahal Palace: 18.9225,72.8340
- CSMT: 18.9397,72.8354; Horniman Circle: 18.9340,72.8320
- Oval Maidan: 18.9370,72.8270; Fort: 18.9330,72.8320
- Nariman Point: 18.9280,72.8250; Navy Nagar: 18.9130,72.8180; Cuffe Parade: 18.9080,72.8180
- Colaba Causeway: 18.9160,72.8260; Sassoon Docks: 18.9050,72.8300
- Haji Ali: 18.9170,72.8140; Worli Sea Face: 18.9200,72.8100

Roads (rename map.js `ROADS` edges): Marine Drive (N.S.C. Bose Rd), Shahid Bhagat Singh
Marg (Colaba Causeway), M.G. Road, Princess St, Kalbadevi Rd, Bhuleshwar Rd, Veer Nariman
Rd, Madame Cama Rd, Maharshi Karve Rd, P.D'Mello Rd, Senapati Bapat Marg.

Landmarks (map.js `landmarks`, fictional-name style): Gateway Arch, Taj Dome, CST clock,
Oval Maidan, Horniman Fountain, Kala Ghoda, Leopold Cafe, Bademiya, BSE facade, Mantralaya,
Vidhan Bhavan, RBI tower, Sassoon Docks, Haji Ali dargah, Marine Drive curve.

## 7. Risks

- Hand-authored coords are approximate → must be validated against the game's
  `toGame` projection + a boot check; no boot = no progress.
- Schema is dense (`walls/gates/drives/bldgs/res/keep/skip`) — a wrong array shape
  crashes `Sd()` silently at 68% (same class as the 14% bug).
- Koramangala data must remain recoverable (`_source/` mirror + git) before any swap.

## 8. Next action needed from you

1. Confirm: keep brand **BAMBai**? (yes/no)
2. Confirm: **fictional names, real colors/fares**? (yes/no)
3. Pick **Path A** (you run Overpass → hand me JSON) or **Path B** (I hand-author a
   minimal core now, approx coords).
