// osm2map — stage 4: Mumbai authored tail (U anchors, Z landmarks, PLACES) +
// full splice of vendor/map.js into reference/osm/mumbai/map-mumbai.js
// Structure preserved: same variable names, same kinds, Mumbai coordinates.
import fs from 'fs';

const S1 = JSON.parse(fs.readFileSync('reference/osm/mumbai/stage1.json', 'utf8'));
const S23 = JSON.parse(fs.readFileSync('reference/osm/mumbai/stage23.json', 'utf8'));
const src = fs.readFileSync('reference/osm/mumbai/map-koramangala-src.js', 'utf8');

// ---- 0. rename real OSM road names -> fictional Bambai names ----
// User decision: fictional names, real geography/colors/fares. Majors get
// hand-picked evocative names; the rest get an invented pool word + their
// original suffix (Marg/Road/Street/Lane/...). Generic colonial names that
// could be anywhere stay unchanged.
const RENAMES = {
  'Marine Drive': `Moti Haar Marg`,
  'Mumbai Coastal Road': `Darya Coastal Road`,
  'Mumbai Coastal Road - Phase I': `Darya Coastal Road - Phase I`,
  'Chhatrapati Shivaji Maharaj Marg': `Killa Marg`,
  'Chhatrapati Shivaji Maharaj Road': `Killa Road`,
  'Shahid Bhagat Singh Road': `Kolvada Main Road`,
  'Shahid Bhagat Singh Marg': `Azaad Chowk Marg`,
  'Mahatma Gandhi Road': `Bapu Wadi Road`,
  'Dr Dadabhai Naoroji Road': `Ghadi Ghar Road`,
  'Horniman Circle': `Banyan Circle`,
  'Wellington Circus': `Deepmala Circus`,
  'Strand Road': `Ghaat Road`,
  'P D Mello Road': `Bandar Road`,
  "P D' Mello Road": `Bandar Road`,
  "A D'Mello Road": `Bandar Road`,
  'Maharshi Karve Road': `Rangmahal Road`,
  'Jamshedji Tata Road': `Nakhwa Road`,
  'Sir Dorab Tata Road': `Nakhwa Road`,
  'Veer Nariman Road': `Bankers Row`,
  'Backbay Depot Road': `Depot Road`,
  'Marine Lines Flyover': `Sagar Flyover`,
  'J. J. Flyover': `Juna Flyover`,
  'CSMT Bus Station Road': `Station Bus Stand Road`,
  'Apollo Bandar Road/P J Ramchandani Marg (Strand Raod)': `Bandar Head Road`,
  'Narottam Morarjee Marg': `Jahaj Marg`,
  'Shri Haji Niyaz Ahmed Azmi Marg': `Firni Marg`,
  'Boman Behram Road (Mere Weather Road)': `Baman Wadi Road`,
  'Boman Behram Road': `Baman Wadi Road`,
  'B.K. Boman Behram Road': `Baman Wadi Road`,
  'Walchand Hirachand Road (Fort Street)': `Jahaz Wadi Road`,
  'Walchand Hirachand Road': `Jahaz Wadi Road`,
  'Mahakavi Bhushan Road (Lansdowne Road)': `Kavi Wadi Road`,
  'Dr V B Gandhi Road (Forbes Street)': `Vaidya Wadi Road`,
  'N Thackersey Road (Carnegy Road)': `Kavva Road`,
  'Karmaveer Bhaurao Patil Road': `Sena Wadi Road`,
  'Karmaveer Bhaurao Patil Marg (Mayo Road)': `Sena Wadi Road`,
  'Ramjibhai Kamani Road (Nichol Road)': `Kamani Wadi Road`,
  'Navjeevan Wadi (3rd Dhobitalao Lane)': `Naya Wada (3rd Dhobi Gully Lane)`,
  'G Road (MGCM Anuvrat Marg)': `G Road`,
  'Nanabhai Moos Marg (Upper Colaba Road)': `Uparkot Road`,
  'Perin Nariman Street (Bazar Gate Street)': `Perin Bazaar Street`,
  'Sassoon Complex Naval Officers Complex': `Nauka Complex`,
  'Bombay Hospital Avenue': `Dawa Khana Avenue`,
  'Maharashtra Chamber of Commerce Lane': `Vyapari Chamber Lane`,
  'Indian Merchants Chamber Road': `Vyapari Sabha Road`,
  'Bombay Samachar Marg': `Akhbaar Marg`,
  'Mumbai Samachar Marg': `Akhbaar Marg`,
  "Women's Graduate Union Road": `Mahila Vidyalaya Road`,
  'Freedom Fighter Ramnanth Goenka Marg': `Swatantrya Veer Marg`,
  'Justice Devshankar V Vyas Marg': `Nyaya Marg`,
  'Dr Simon C Farnandes Marg': `Doktorn Marg`,
  'David Sassoon Library Marg': `Granthalay Marg`,
};
const KEEP_GENERIC = new Set([
  'D Road', 'Cross Road No 2', 'Road No 3', 'Store Lane', 'Green Street',
  'Garden Road', 'Battery Street', 'Bakery Lane', 'Barrack Road',
  'Cinema Road', 'University Road', 'Police Court Lane', 'Convent Street',
  'Trinity Street', 'Wilson Road', 'Oxford Road', 'Henry Road', 'Walton Road',
  'Stevens Street', 'Rutherfield Street', 'Ash Lane', 'Windy Hall Lane',
  'Mint Road', 'Bank Street Cross Lane', 'MCC Cross Lane', 'G Road',
  'Barack Road', 'Cinema Road;Barack Road',
]);
const POOL = [`Firki`, `Lehar`, `Sagar`, `Moti`, `Badal`, `Chandni`, `Darya`,
  `Bandar`, `Topkhana`, `Chhatri`, `Bageecha`, `Kaman`, `Tabela`, `Aangan`,
  `Jhilmil`, `Sona`, `Rupali`, `Tamanna`, `Kadamb`, `Amaltas`, `Behada`,
  `Karvanda`, `Rambha`, `Menaka`, `Urvashi`, `Champak`, `Mogra`, `Raatrani`,
  `Aboli`, `Genda`, `Jui`, `Shevanti`, `Phulrani`, `Bahar`, `Mausam`, `Hawa`,
  `Toofan`, `Megh`, `Kinar`, `Nauka`, `Majhi`, `Kot`, `Buruj`, `Talab`,
  `Bawdi`, `Owara`, `Morpankh`, `Sarang`, `Motiya`, `Subah`, `Dopahar`,
  `Sandhya`, `Nisha`, `Pawan`, `Kesuda`, `Palash`, `Sonchafa`, `Parijat`,
  `Ketaki`, `Shirish`, `Kanchan`, `Karanj`, `Wadli`, `Gulmohar`, `Mohini`,
  `Chhaya`, `Roshni`, `Kirana`, `Jyoti`, `Deepmala`, `Mangalya`, `Kesar`,
  `Kumkum`, `Halad`, `Aabha`, `Taraka`, `Nagvel`, `Zenda`, `Dhwaj`, `Pataka`];
const ORD = [``, ``, `Second`, `Third`, `Fourth`, `Fifth`, `Sixth`, `New`, `Old`];
const SUFFIX_RE = /( (?:Marg|Road|Street|Lane|Path|Circle|Cross Road|Cross Lane|Flyover|Drive|Circus|Avenue|St|Gully))$/;
const usedNames = new Set(KEEP_GENERIC);
let poolIdx = 0;
const fictionalOne = name => {
  if (!name) return name;
  if (RENAMES[name]) return RENAMES[name];
  if (KEEP_GENERIC.has(name)) return name;
  const base = name.replace(/ \([^)]*\)$/, ``);
  if (RENAMES[base]) return RENAMES[base];
  if (KEEP_GENERIC.has(base)) return name;
  const m = base.match(SUFFIX_RE);
  const suffix = m ? m[1] : ``;
  const stem = m ? base.slice(0, base.length - suffix.length) : base;
  const word = POOL[poolIdx++ % POOL.length];
  const nUse = [...usedNames].filter(u => u === word + suffix || u.startsWith(word + suffix + ` `)).length;
  let out = nUse ? `${ORD[Math.min(nUse + 1, ORD.length - 1)]} ${word}${suffix}`.trim() : word + suffix;
  usedNames.add(out);
  return out;
};
const renameName = name => name.split(`;`).map(fictionalOne).join(`;`);
const before = S1.names.filter(Boolean).length;
S1.names = S1.names.map(renameName);
const uniq = new Set(S1.names.filter(Boolean));
console.log(`renamed ${before} road names -> ${uniq.size} unique fictional names`);
console.log(`sample: ` + S1.names.filter(Boolean).slice(0, 8).join(` | `));

const J = a => JSON.stringify(a);
// ---- 1. the raw-data var chain (n,r,i,a,o,s,c,l,u,d,f,p,m,h,g,_,v,y,b,x,S,C,w) ----
const bboxLatLon = S1.bbox;
const chain =
  `var n=t([${bboxLatLon.S},${bboxLatLon.W},${bboxLatLon.N},${bboxLatLon.E}],.5,null,null),` +
  `r=${J(S1.bounds)},` +
  `i=${J(S1.names.join('.'))}.split(\`.\`),` +
  `a=${J(S1.nodes)},` +
  `o=${J(S1.edges)},` +
  `s=[],` +
  `c=${J(S23.blocks)},` +
  `l=[[-880,-2060],[-860,-2000]],` +
  `u=${J(S23.sea)},` +
  `d=${J(S23.parks)},` +
  `f=${J(S23.footprints)},` +
  `p=${J(S23.zones)},` +
  `m=${S23.footprints.length},` +
  `h=${J(S23.trees)},` +
  `g=[],` +
  `_=[],` +
  `v=[],` +
  `y=[],` +
  `b=[],` +
  `x=${J(S23.shopTypes.join('.'))},` +
  `S=${J(S23.shops)},` +
  `C=[],` +
  `w=[],`;

// ---- 2. Mumbai U anchors (same KEY set as Koramangala U; Mumbai lat/lon) ----
// keys are engine-facing (exported as `p`); labels stay fictional in vt.
const U = {
  mall: { lat: 18.93155, lon: 72.83223, road: `Rajaram Mohan Roy Road`, src: `Horniman Circle gardens block (approx; verify vs OSM)` },
  babusBar: { lat: 18.92506, lon: 72.83245, road: `Shahid Bhagat Singh Road`, src: `Colaba Causeway bar strip (approx)` },
  syrup: { lat: 18.92985, lon: 72.83320, road: `Maharshi Karve Road`, src: `Fort glass office (approx)` },
  bijliSignal: { lat: 18.93960, lon: 72.83530, src: `CSMT junction (approx)` },
  stadium: { lat: 18.93840, lon: 72.83580, src: `Azad Maidan (approx)` },
  arogyaCampus: { lat: 18.94330, lon: 72.83480, road: `St George Road`, src: `St George Hospital (approx)` },
  deepaNivas: { lat: 18.93300, lon: 72.83360, road: `Maharshi Karve Road`, src: `Elphinstone College (approx)` },
  sparkwerk: { lat: 18.93450, lon: 72.83640, road: `P D Mello Road`, src: `Fort east campus (approx)` },
  vanijya: { lat: 18.94030, lon: 72.83510, road: `Mahapalika Marg`, src: `BMC HQ (approx)` },
  tamraHouse: { lat: 18.93100, lon: 72.83830, road: `P D Mello Road`, src: `Fort east office (approx)` },
  santhe: { lat: 18.93920, lon: 72.83300, road: `Crawford Market Road`, src: `Crawford Market (approx)` },
  pustaka: { lat: 18.92600, lon: 72.83120, road: `Karmaveer Bhaurao Patil Road`, src: `Colaba brewhouse (approx)` },
  oho: { lat: 18.92440, lon: 72.82940, road: `2nd Marine Street`, src: `Colaba venue (approx)` },
  karadi: { lat: 18.92330, lon: 72.83060, road: `3rd Marine Street`, src: `Colaba venue (approx)` },
  samaja: { lat: 18.92720, lon: 72.83090, road: `V Thackersay Marg`, src: `Fort venue (approx)` },
  covalent: { lat: 18.93460, lon: 72.83920, road: `P D Mello Road`, src: `Dock venue (approx)` },
  canopy: { lat: 18.91800, lon: 72.83280, road: `Shahid Bhagat Singh Road`, src: `Colaba tower (approx)` },
  settlement: { lat: 18.91150, lon: 72.82650, road: `Shahid Bhagat Singh Road`, src: `Navy Nagar edge (approx)` },
  depot: { lat: 18.94200, lon: 72.84150, road: `P D Mello Road`, src: `Harbour depot (approx)` },
  darshini: { lat: 18.92230, lon: 72.83310, road: `Shahid Bhagat Singh Road`, src: `Colaba Causeway eatery (approx)` },
  pg: { lat: 18.92170, lon: 72.83060, road: `Nanabhai Moos Marg (Upper Colaba Road)`, src: `Colaba PG (approx)` },
  xerox: { lat: 18.92060, lon: 72.83010, road: `Shahid Bhagat Singh Road`, src: `Colaba xerox (approx)` },
  broker: { lat: 18.93020, lon: 72.83260, road: `Rajaram Mohan Roy Road`, src: `Fort broker (approx)` },
  pub: { lat: 18.93320, lon: 72.83220, road: `Rajaram Mohan Roy Road`, src: `Fort pub (approx)` },
  police: { lat: 18.93300, lon: 72.83460, road: `P D Mello Road`, src: `Fort police (approx)` },
  foodStreet: { lat: 18.92260, lon: 72.82920, road: `2nd Marine Street`, src: `Colaba food street (approx)` },
  park: { lat: 18.92190, lon: 72.82960, src: `Colaba garden (approx)` },
  autoStand: { lat: 18.92220, lon: 72.83260, road: `Shahid Bhagat Singh Road`, src: `Colaba auto stand (approx)` },
  busStop: { lat: 18.93430, lon: 72.83330, road: `Maharshi Karve Road`, src: `Fort bus stop (approx)` },
  mallBusStop: { lat: 18.93160, lon: 72.83240, road: `Rajaram Mohan Roy Road`, src: `mall-side stop (approx)` },
  teaStall: { lat: 18.92200, lon: 72.83160, road: `Shahid Bhagat Singh Road`, src: `Colaba tea stall (approx)` },
  checkpoint: { lat: 18.92490, lon: 72.83270, road: `Shahid Bhagat Singh Road`, src: `Causeway checkpoint (approx)` },
  groundNorth: { lat: 18.93700, lon: 72.82740, src: `Oval Maidan (approx)` },
  groundSouth: { lat: 18.93840, lon: 72.83580, src: `Azad Maidan (approx)` },
  kaapiKatte: { lat: 18.92150, lon: 72.83090, src: `Colaba coffee cart (approx)` },
  benneCorner: { lat: 18.92340, lon: 72.82980, src: `Colaba snack corner (approx)` },
  darkStore: { lat: 18.92990, lon: 72.83150, road: `Maharshi Karve Road`, src: `Fort dark store (approx)` },
  moneyCentre: { lat: 18.92970, lon: 72.83330, src: `BSE tower (approx)` },
};
// snap anchors into the nearest block interior (R() probes block sides; an
// anchor outside every block lands on a far block — misplaced landmarks)
const snapAnchor = a => {
  const [x0, z0] = [ (a.lon - LON0) * U_M * scale, -(a.lat - LAT0) * D_M * scale ];
  let best = null, bd = 1e9, bestPoly = null;
  for (const poly of S23.blocks) {
    // inside?
    let c = false;
    for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
      const [xi, zi] = poly[i], [xj, zj] = poly[j];
      if ((zi > z0) !== (zj > z0) && x0 < (xj - xi) * (z0 - zi) / (zj - zi) + xi) c = !c;
    }
    if (c) { best = [x0, z0]; bd = 0; break; }
    for (let i = 0; i < poly.length; i++) {
      const p = poly[i], q = poly[(i + 1) % poly.length];
      const dx = q[0] - p[0], dz = q[1] - p[1], L2 = dx * dx + dz * dz || 1;
      let t = ((x0 - p[0]) * dx + (z0 - p[1]) * dz) / L2; t = Math.max(0, Math.min(1, t));
      const x = p[0] + dx * t, z = p[1] + dz * t, d = Math.hypot(x - x0, z - z0);
      if (d < bd) { bd = d; best = [x, z]; bestPoly = poly; }
    }
  }
  if (best && bd > 0.01) {
    let [x, z] = best;
    // strict acceptance: strictly inside some block AND ≥ 0.6u from its edges
    // (on-edge points flip between ray-casts after the lat/lon roundtrip)
    const wellInside = (px, pz) => {
      for (const poly of S23.blocks) {
        let c = false;
        for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
          const [xi, zi] = poly[i], [xj, zj] = poly[j];
          if ((zi > pz) !== (zj > pz) && px < (xj - xi) * (pz - zi) / (zj - zi) + xi) c = !c;
        }
        if (!c) continue;
        let dmin = 1e9;
        for (let i = 0; i < poly.length; i++) {
          const p = poly[i], q = poly[(i + 1) % poly.length];
          const dx = q[0] - p[0], dz = q[1] - p[1], L2 = dx * dx + dz * dz || 1;
          let t = ((px - p[0]) * dx + (pz - p[1]) * dz) / L2; t = Math.max(0, Math.min(1, t));
          dmin = Math.min(dmin, Math.hypot(p[0] + dx * t - px, p[1] + dz * t - pz));
        }
        if (dmin >= 0.6) return true;
      }
      return false;
    };
    if (!wellInside(x, z)) {
      // nudge into the block along the inward normal of the nearest edge;
      // shrink the step until the point is actually inside (thin slivers!)
      const poly = bestPoly;
      // find that edge again and its inward normal
      let bi = -1, bj = -1, bdd = 1e9;
      poly.forEach((p, i) => { const q = poly[(i + 1) % poly.length]; const dx = q[0] - p[0], dz = q[1] - p[1], L2 = dx * dx + dz * dz || 1; let t = ((x - p[0]) * dx + (z - p[1]) * dz) / L2; t = Math.max(0, Math.min(1, t)); const px = p[0] + dx * t, pz = p[1] + dz * t; const dd = Math.hypot(px - x, pz - z); if (dd < bdd) { bdd = dd; bi = i; } });
      const p = poly[bi], q = poly[(bi + 1) % poly.length];
      const dx = q[0] - p[0], dz = q[1] - p[1], L = Math.hypot(dx, dz) || 1;
      let nx = -dz / L, nz = dx / L;
      const cx = poly.reduce((s, pp) => s + pp[0], 0) / poly.length, cz = poly.reduce((s, pp) => s + pp[1], 0) / poly.length;
      const mx = (p[0] + q[0]) / 2, mz = (p[1] + q[1]) / 2;
      if ((cx - mx) * nx + (cz - mz) * nz < 0) { nx = -nx; nz = -nz; }
      const inside = (px, pz) => { let c = false; for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) { const [xi, zi] = poly[i], [xj, zj] = poly[j]; if ((zi > pz) !== (zj > pz) && px < (xj - xi) * (pz - zi) / (zj - zi) + xi) c = !c; } return c; };
      for (const step of [2.5, 1.2, 0.6, 0.3, 0.15, 0.07]) {
        if (wellInside(x + nx * step, z + nz * step)) { x += nx * step; z += nz * step; break; }
      }
      // still not well inside (thin slivers, boundary flukes): nearest
      // guaranteed-interior point over ALL blocks
      if (!wellInside(x, z)) {
        let cand = null, cd = 1e9;
        for (const poly2 of S23.blocks) {
          const cands = [];
          const cx2 = poly2.reduce((s, pp) => s + pp[0], 0) / poly2.length, cz2 = poly2.reduce((s, pp) => s + pp[1], 0) / poly2.length;
          cands.push([cx2, cz2]);
          poly2.forEach((p, i) => {
            const q = poly2[(i + 1) % poly2.length];
            const mx = (p[0] + q[0]) / 2, mz = (p[1] + q[1]) / 2;
            const dx2 = q[0] - p[0], dz2 = q[1] - p[1], L3 = Math.hypot(dx2, dz2) || 1;
            let nx2 = -dz2 / L3, nz2 = dx2 / L3;
            if ((cx2 - mx) * nx2 + (cz2 - mz) * nz2 < 0) { nx2 = -nx2; nz2 = -nz2; }
            cands.push([mx + nx2 * 1.2, mz + nz2 * 1.2], [mx + nx2 * 0.7, mz + nz2 * 0.7]);
          });
          for (const [px, pz] of cands) {
            if (!wellInside(px, pz)) continue;
            const d = Math.hypot(px - x0, pz - z0);
            if (d < cd) { cd = d; cand = [px, pz]; }
          }
        }
        if (cand) { [x, z] = cand; }
      }
    }
    a.lat = +(LAT0 - z / (D_M * scale)).toFixed(6);
    a.lon = +(LON0 + x / (U_M * scale)).toFixed(6);
    if (bd > 60) a.src += ` — SNAPPED ${Math.round(bd)}u to nearest block`;
  }
  return a;
};

const U_M = 111320 * Math.cos(18.925 * Math.PI / 180), D_M = 110540;
const { LAT0, LON0, scale } = S1;
// v1: strip `road:` from anchors — W(road) ranks all non-matching block sides -1,
// and a name that isn't a block side makes R() find nothing (bi:-1 crash).
for (const k of Object.keys(U)) { U[k] = { ...U[k], src: U[k].src + ` — approx, verify vs OSM` }; snapAnchor(U[k]); delete U[k].road; }

// ---- 3. Z landmarks (same keys/kinds as original; Mumbai anchors) ----
// J(kind, anchor, w, d, setback?, shift?) — the original placement engine.
// pick two real road names that meet at the junction nearest U.bijliSignal
{
  const deg = new Map();
  for (const e of S1.edges) { deg.set(e[0], (deg.get(e[0]) || 0) + 1); deg.set(e[1], (deg.get(e[1]) || 0) + 1); }
  const [ax, az] = [(U.bijliSignal.lon - LON0) * U_M * scale, -(U.bijliSignal.lat - LAT0) * D_M * scale];
  let bj = null, bd = 1e9;
  for (const [id, d] of deg) {
    if (d < 3) continue;
    const [x, z] = S1.nodes[id]; const dd = Math.hypot(x - ax, z - az);
    if (dd < bd) { bd = dd; bj = id; }
  }
  const namesAt = [...new Set(S1.edges.filter(e => e[0] === bj || e[1] === bj).map(e => S1.names[e[3]]).filter(Boolean))];
  console.log(`bijliSignal junction: ${bd.toFixed(0)}u away, names: ${namesAt.join(' | ')}`);
  const [r1, r2] = [namesAt[0] ?? `Maharshi Karve Road`, namesAt[1] ?? namesAt[0] ?? `Maharshi Karve Road`];
  var BIJLI_R1 = r1, BIJLI_R2 = r2;
}
const Z_ENTRIES = [
  [`mall`, `J(\`mall\`,U.mall,80,55,6)`],
  [`arogyaGate`, `J(\`arogyaGate\`,U.arogyaCampus,60,28,5,-58)`],
  [`hospital`, `J(\`hospital\`,U.arogyaCampus,46,30,5,0)`],
  [`canopy`, `J(\`canopy\`,U.canopy,60,52,3,0)`],
  [`settlement`, `J(\`settlement\`,U.settlement,26,16,3.5,0)`],
  [`depot`, `J(\`tankerDepot\`,U.depot,34,26,2,0)`],
  [`darshini`, `J(\`darshini\`,U.darshini,12,10,.5,0)`],
  [`pg`, `J(\`pg\`,U.pg,12,14,.2,0)`],
  [`xerox`, `J(\`xerox\`,U.xerox,6,6,.4,0)`],
  [`broker`, `J(\`broker\`,U.broker,9,13,.3,0)`],
  [`pub`, `J(\`pub\`,U.pub,12,12,.4,0)`],
  [`police`, `J(\`police\`,U.police,8,7,1.5,0)`],
  [`foodStreet`, `J(\`foodStreet\`,U.foodStreet,60,2,.3,0)`],
  [`park`, `J(\`park\`,U.park,30,30,0,0)`],
  [`babusBar`, `lt(\`babusBar\`,U.babusBar,62,24,2,22)`],
  [`syrup`, `J(\`syrup\`,U.syrup,26,22,2,0)`],
  [`stadium`, `J(\`stadium\`,U.stadium,72,60)`],
  [`deepaNivas`, `J(\`deepaNivas\`,U.deepaNivas,80,55)`],
  [`sparkwerk`, `J(\`sparkwerk\`,U.sparkwerk,50,30)`],
  [`vanijya`, `J(\`vanijya\`,U.vanijya,70,40)`],
  [`tamraHouse`, `J(\`tamraHouse\`,U.tamraHouse,28,26)`],
  [`santhe`, `J(\`santhe\`,U.santhe,80,50)`],
  [`moneyCentre`, `J(\`moneyCentre\`,U.moneyCentre,18,14)`],
  [`oho`, `J(\`oho\`,U.oho,20,16)`],
  [`karadi`, `J(\`karadi\`,U.karadi,24,18)`],
  [`pustaka`, `J(\`pustaka\`,U.pustaka,26,22)`],
  [`samaja`, `J(\`samaja\`,U.samaja,26,18)`],
  [`covalent`, `J(\`covalent\`,U.covalent,30,20)`],
  [`bijliWorld`, `J(\`bijliWorld\`,U.bijliSignal,30,24,2,0)`],
];
const Z_TXT = `var Z={` + Z_ENTRIES.map(([k, v]) => `${k}:${v}`).join(`,`) + `};`;

// ---- 4. Mumbai PLACES (vt) — same keys, Mumbai labels ----
const VT_TXT = `vt={
  spawn:Q(Z.pg,\`Outside the Kolvada PG\`,-3),pg:Q(Z.pg,\`The Kolvada PG\`),pgScooter:(()=>{
    let e=R(V,Z.pg.x+Math.sin(Z.pg.ry)*9+5,Z.pg.z+Math.cos(Z.pg.ry)*9,-1.6);
    return{x:+e.x.toFixed(2),z:+e.z.toFixed(2),ry:+L(e.ry+Math.PI/2).toFixed(3),label:\`PG scooter spot\`}
  })(),darshini:Q(Z.darshini,\`Merwani's Irani Darshini\`),canopyTowerC:Q(Z.canopy,\`Canopy Heights, Tower C gate\`),lakeBund:{
    ...X(.05,6.5),label:\`Moti Haar promenade path\`
  },sluiceGate:{
    ...X(.85,2.5),label:\`Retibandar sluice gate\`
  },surveyPegs:{
    ...X(.55,6),label:\`Survey pegs on the mudflats\`
  },drainInlet:{
    ...X(.8,3),label:\`Stormwater outfall inlet\`
  },autoStand:ht(U.autoStand,\`Auto stand\`),xeroxShop:Q(Z.xerox,\`Sai Xerox & Notary\`),brokerOffice:Q(Z.broker,\`BAMBAI Sites & Layouts (land broker)\`),tankerDepot:Q(Z.depot,\`Harbour tanker depot\`),pub:Q(Z.pub,\`Twist Brewing Co.\`),mall:Q(Z.mall,\`Junction Square mall\`),hospital:Q(Z.hospital,\`Rain Tree Hospital\`),arogyaGate:Q(Z.arogyaGate,\`Arogya Nagar Medical College & Hospital\`),policeOutpost:Q(Z.police,\`Police outpost\`),checkpoint:gt(U.checkpoint,\`Night checkpoint, Kolvada Main Road\`),park:{
    x:Z.park.x,z:Z.park.z,ry:Z.park.ry,label:\`Neighbourhood park\`
  },foodStreet:Q(Z.foodStreet,\`Kolvada food street\`,0),busStop:ht(U.busStop,\`Bus stop, Rangmahal Road\`,1.6),mallBusStop:ht(U.mallBusStop,\`Bus stop, Junction Square\`,1.6),teaStall:ht(U.teaStall,\`Tea stall\`,1.4),babusBar:(()=>{
    let e=Z.babusBar,[t,n]=H(U.babusBar);
    return Q(e,\`Babu's Bar\`,+((t-e.x)*Math.cos(e.ry)-(n-e.z)*Math.sin(e.ry)).toFixed(1))
  })(),syrup:Q(Z.syrup,\`Syrup\`),bijliSignal:_t(U.bijliSignal,\`\`),bijliWorld:Q(Z.bijliWorld,\`Bijli World Signal\`),stadium:Q(Z.stadium,\`Aata Mantapa Indoor Stadium\`),deepaNivas:Q(Z.deepaNivas,\`Deepa Nivas College\`),sparkwerk:Q(Z.sparkwerk,\`SparkWerk Campus\`),vanijya:Q(Z.vanijya,\`Bambai Vanijya Sankeerna\`),tamraHouse:Q(Z.tamraHouse,\`Tamra House\`),santhe:Q(Z.santhe,\`Mota Bazaar\`),oho:Q(Z.oho,\`\`),karadi:Q(Z.karadi,\`\`),samaja:Q(Z.samaja,\`\`),covalent:Q(Z.covalent,\`\`),...Object.fromEntries(v.map(e=>[e.kind,Q(Z[e.kind],e.label)]))
},yt=`;

// ---- 5. splice ----
let out = src;
const cut = (startMarker, endMarker, replacement, label) => {
  const a = out.indexOf(startMarker);
  if (a < 0) throw new Error(`start not found: ${label}`);
  const b = out.indexOf(endMarker, a);
  if (b < 0) throw new Error(`end not found: ${label}`);
  out = out.slice(0, a) + replacement + out.slice(b + endMarker.length);
};
// 5a. raw chain
cut(`var n=t([12.9215,77.607`, `,T=.15,`, chain + `T=.15,`, `chain`);
// 5b. U anchors
cut(`var U={`, `},W=e=>`, `var U=${J(U)}\n,W=e=>`, `U`);
// 5c. it (syrup footprint poly)
cut(`var it=[{`, `],at=null;`, `var it=[],at=null;`, `it`);
// 5d. Z landmarks
cut(`var Z={`, `;q=!0;`, Z_TXT + `\nq=!0;`, `Z`);
// 5e. bunks
cut(`var ft=[{`, `];if(z){`, `var ft=[];\nif(z){`, `ft`);
// 5f. moneyCentre side-fix block (Koramangala lat/lon hardcoded)
cut(`{let e=Z.moneyCentre,[t,n]=H({lat:12.93445,lon:77.61232})`, `e.side=r*Math.cos(e.ry)-i*Math.sin(e.ry)>=0?1:-1}`,
  `{let e=Z.moneyCentre,[t,n]=H({lat:18.92970,lon:72.83330});let r=t-e.x,i=n-e.z;e.side=r*Math.cos(e.ry)-i*Math.sin(e.ry)>=0?1:-1}`, `moneyCentreFix`);
// 5g. market-roads block
cut(`{let e=[[12.9212,77.6203]`, `e.market=!0,e.lanes=2)}var U={`, `{let e=[]}var U={`, `market`);
// 5h. vt PLACES (comma-declared)
cut(`vt={spawn`, `},yt=`, VT_TXT, `vt`);
// 5i. districts/medians/glass/pubRuns region (comma-declared; ends at flyover loop)
cut(`St=[{kind`, `;for(let e of s)e.kind===\`flyover\`&&(e.landAt=[240,1032]);`,
  `St=[{kind:\`packed\`,at:[18.9290,72.8330],r:260},{kind:\`packed\`,at:[18.9210,72.8310],r:220},{kind:\`leafy\`,at:[18.9370,72.8280],r:200},{kind:\`packed\`,at:[18.9330,72.8360],r:180},{kind:\`builder\`,at:[18.9420,72.8410],r:160}],` +
  `Ct=[],wt=[],Tt=[];` +
  `for(let e of s)e.kind===\`flyover\`&&(e.landAt=[240,1032]);`, `St..Tt`);
// 5j. Ot assembly literals
cut(`bareStreets:[[12.944,77.608,110]`, `return{x:r,z:i,r:n}})`, `bareStreets:[]`, `bareStreets`);
cut(`treeTruth:[[12.94463,77.60815,\`foot\`]`, `return{x:r,z:i,k:n}})`, `treeTruth:[]`, `treeTruth`);
cut(`parkKit:{gazebos:[[12.93919,77.6198]`, `gyms:[[12.93848,77.61943]].map(([e,t])=>H({lat:e,lon:t}))}`, `parkKit:{gazebos:[],gyms:[]}`, `parkKit`);
cut(`glassRuns:[{a:H({lat:12.9356,lon:77.6114})`, `hw:48}]`, `glassRuns:[]`, `glassRuns`);
cut(`roofAds:[{a:H({lat:12.9396,lon:77.6244})`, `hw:40,bare:.3}]`, `roofAds:[]`, `roofAds`);
// 5k. city id/name
if (out.includes('id:`koramangala`,name:`Koramangala`'))
  out = out.replace('id:`koramangala`,name:`Koramangala`', 'id:`mumbai`,name:`Bambai`');
else console.log('note: Ot id/name literal not found (already renamed?)');
// glass:wt.map(...) — wt is [] now; leave the .map (safe).
// medians:Ct.map(...) — Ct is []; leave.

fs.writeFileSync('reference/osm/mumbai/map-mumbai.js', out);
// wire into the game: vendor/map.js keeps its own ./geo.js import; _source mirror
fs.writeFileSync('vendor/map.js', out);
fs.writeFileSync('_source/map.js', out);
// fix the relative import so the copy resolves from its own directory
const fixed = out.replace(/from\s*"\.\/geo\.js"/, 'from"../../../vendor/geo.js"');
if (fixed !== out) fs.writeFileSync('reference/osm/mumbai/map-mumbai.js', fixed);
console.log('spliced map-mumbai.js:', (out.length / 1e6).toFixed(2), 'MB (src', (src.length / 1e6).toFixed(2), 'MB)');
