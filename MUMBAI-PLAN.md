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

## 8. Decisions (made 2026 session — supersedes "next action needed")

1. Brand **BAMBai** — KEPT.
2. **Fictional names, real colors/fares** — CONFIRMED (BEST red, kaali-peeli, MH plates, ₹27/₹18).
3. **Path A chosen** — the sandbox network blocker is GONE: Overpass works from here
   (`overpass-api.de`, `overpass.private.coffee`, `overpass.kumi.systems`; all three
   throttle under load — retry with backoff, never assume the endpoint is dead).
   `overpass.osm.ch` answers but serves an EMPTY database — do not use.

## 9. Progress log

- git initialized; baseline commit of the untouched Koramangala build (`66622ae…`,
  amended to exclude node_modules/.pnpm-store via new .gitignore).
- `reference/osm/` — split Overpass queries (q1 highways / q2 green+water+rail /
  q3 POI / q4 buildings) over core bbox **18.905,72.815 → 18.945,72.845**
  (Colaba → CSMT → Mahalaxmi). Full-bbox queries get rejected when servers are busy;
  the split ones pass.
- `reference/osm/fetch-osm.ps1` — background retry loop (rotates endpoints, backoff).
  Run via `Start-Process powershell -ArgumentList '-File','reference\osm\fetch-osm.ps1'
  -RedirectStandardOutput 'reference\osm\fetch-osm.log'`. Log + `sm-*.json` outputs
  land in `reference/osm/`.
- **sm-highways.json fetched: 998 KB of real South Mumbai road ways.**

## 10. map.js data flow (verified this session — extends §3)

- `Ot = {id:'koramangala', name, ...B, PARKING:[...B.PARKING.filter(…)]}` → `var $=Ot`
  (exported as `t` → `Ee` in city.js). Post-spread fixups mutate flyover edge medians.
- `B = Ge({bounds:r, names:et, nodes:a, edges:o, blocks:z?.blocks??c, flyover:l,
  lake:u, parks:d})` — `Ge` is the layout builder; it computes blocks/side data from
  the road graph. `z = ae({dip spec}, a, edges, c)` builds the toniqueDip from a
  named road first.
- RAW authored literals (what a Mumbai generator must emit):
  - `a` — nodes `[[x,z],…]` in game meters (already projected from lat/lon).
  - `o` — edges `[a, b, rank, nameIdx, width, lanes, medianFlag, medianW?, struct?]`.
  - `i` — road-name list (one dot-separated string split on `.`).
  - `et = i.map(e => $e[e] ?? e)` — **`$e` is the real→fictional rename map**
    (e.g. real OSM name → game name). Mumbai version maps Marine Drive etc. to
    fictional names here.
  - `r` bounds, `c` blocks seed, `l` flyover, `u` lake, `d` parks + the spread rest
    (PLACES, landmarks, footprints, shops, medians, skywalks, elevated, drains…).
- Projection helper is the top-of-file `t([S,W,N,E], scale, {lat,lon,R1,R2,sL}, [bbox])`
  — Mumbai needs its own bbox + LAT0/LON0 (~18.92, 72.83) feeding the same `toGame`.

## 11. Next steps

1. Wait for fetcher → q2/q3/q4 JSONs (green/water/rail, POI, buildings).
2. Write `reference/osm/osm2map.cjs`: OSM JSON → raw literals above (nodes/edges/
   names/blocks seed/parks/lake/landmarks/footprints), reusing Ge by importing
   `_source/map.js` in Node is NOT possible (browser globals) — port `Ge` inputs
   instead, or splice generated literals into a copy of map.js.
3. Splice or shim: keep all map.js code, replace only data literals →
   `vendor/map.js` Mumbai build; mirror to `_source/`.
4. Boot check (`node shot.cjs` sweep) before any label/livery work.
