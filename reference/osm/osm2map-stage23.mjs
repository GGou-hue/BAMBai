// osm2map — stages 2+3: city blocks (polygonized from the road graph), parks,
// Backbay sea polygon, building footprints, trees, zones, shops.
// Emits reference/osm/mumbai/stage23.json
import fs from 'fs';

const S1 = JSON.parse(fs.readFileSync('reference/osm/mumbai/stage1.json', 'utf8'));
const GREEN = JSON.parse(fs.readFileSync('reference/osm/sm-green.json', 'utf8'));
const BLDG = JSON.parse(fs.readFileSync('reference/osm/sm-buildings.json', 'utf8'));
const { LAT0, LON0, scale, bounds } = S1;
const U = 111320 * Math.cos(LAT0 * Math.PI / 180), D = 110540;
const P = (lat, lon) => [+(((lon - LON0) * U) * scale).toFixed(1), +((-(lat - LAT0) * D) * scale).toFixed(1)];

// ---------- geometry helpers ----------
const area2 = poly => { let a = 0; for (let i = 0; i < poly.length; i++) { const [x1, z1] = poly[i], [x2, z2] = poly[(i + 1) % poly.length]; a += x1 * z2 - x2 * z1; } return a / 2; };
const inPoly = (x, z, poly) => { let c = false; for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) { const [xi, zi] = poly[i], [xj, zj] = poly[j]; if ((zi > z) !== (zj > z) && x < (xj - xi) * (z - zi) / (zj - zi) + xi) c = !c; } return c; };
const centroid = poly => { let x = 0, z = 0; for (const p of poly) { x += p[0]; z += p[1]; } return [x / poly.length, z / poly.length]; };
const bboxOf = poly => { let x0 = 1e9, x1 = -1e9, z0 = 1e9, z1 = -1e9; for (const [x, z] of poly) { x0 = Math.min(x0, x); x1 = Math.max(x1, x); z0 = Math.min(z0, z); z1 = Math.max(z1, z); } return [x0, z0, x1, z1]; };
// rough overlap: fraction of face bbox-grid sample points inside poly
const coverFrac = (face, poly) => {
  const [x0, z0, x1, z1] = bboxOf(face); let hit = 0, tot = 0;
  for (let gx = 0; gx <= 4; gx++) for (let gz = 0; gz <= 4; gz++) {
    const x = x0 + (x1 - x0) * gx / 4, z = z0 + (z1 - z0) * gz / 4; tot++;
    if (inPoly(x, z, poly)) hit++;
  }
  return hit / tot;
};

// ---------- green + water polys ----------
const greenWays = [], waterWays = [], coastWays = [];
for (const el of GREEN.elements) {
  if (el.type !== 'way' || !el.tags || !el.geometry) continue;
  const t = el.tags, poly = el.geometry.map(g => P(g.lat, g.lon));
  if (poly.length < 3) { if (t.natural === 'coastline') coastWays.push(poly); continue; }
  if (t.landuse === 'park' || t.landuse === 'recreation_ground' || t.landuse === 'grass' || t.landuse === 'village_green' ||
      t.leisure === 'park' || t.leisure === 'garden' || t.leisure === 'common' || t.leisure === 'pitch' ||
      t.leisure === 'stadium' || t.leisure === 'recreation_ground' || t.leisure === 'playground' || t.leisure === 'golf_course')
    greenWays.push(poly);
  else if (t.natural === 'water' || t.waterway === 'dock') waterWays.push(poly);
  else if (t.natural === 'coastline') coastWays.push(poly);
}
console.log(`green polys: ${greenWays.length}, water: ${waterWays.length}, coastline ways: ${coastWays.length}`);

// ---------- ring sanitation (degenerate rings can hang the lot subdivder) ----------
const dedupe = poly => { const out = []; for (const p of poly) { const q = out[out.length - 1]; if (!q || Math.hypot(q[0] - p[0], q[1] - p[1]) > 0.05) out.push(p); } if (out.length > 2 && Math.hypot(out[0][0] - out[out.length - 1][0], out[0][1] - out[out.length - 1][1]) <= 0.05) out.pop(); return out; };
const isSimple = poly => {
  const n = poly.length;
  if (n > 60) return false; // absurd rings
  const seg = (a, b, c, d) => {
    const d1 = (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]);
    const d2 = (b[0] - a[0]) * (d[1] - a[1]) - (b[1] - a[1]) * (d[0] - a[0]);
    const d3 = (d[0] - c[0]) * (a[1] - c[1]) - (d[1] - c[1]) * (a[0] - c[0]);
    const d4 = (d[0] - c[0]) * (b[1] - c[1]) - (d[1] - c[1]) * (b[0] - c[0]);
    return ((d1 > 0) !== (d2 > 0)) && ((d3 > 0) !== (d4 > 0));
  };
  for (let i = 0; i < n; i++) for (let j = i + 2; j < n; j++) {
    if (i === 0 && j === n - 1) continue;
    if (seg(poly[i], poly[(i + 1) % n], poly[j], poly[(j + 1) % n])) return false;
  }
  return true;
};
const thinness = poly => { const [x0, z0, x1, z1] = bboxOf(poly); const bw = Math.max(0.01, x1 - x0), bh = Math.max(0.01, z1 - z0); return Math.abs(area2(poly)) / (bw * bh); };
const sanitize = (polys, minArea, label) => {
  const out = [];
  let bad = 0;
  for (let p of polys) {
    p = dedupe(p);
    if (p.length < 4 || Math.abs(area2(p)) < minArea || !isSimple(p) || thinness(p) < 0.12) { bad++; continue; }
    if (area2(p) < 0) p = p.slice().reverse(); // enforce CCW
    out.push(p);
  }
  console.log(`${label}: kept ${out.length}, dropped ${bad} degenerate`);
  return out;
};

// ---------- block polygonization from the road graph ----------
const nodes = S1.nodes, edges1 = S1.edges;
// dedupe parallel edges
const seenE = new Set(); const edges = [];
for (const e of edges1) { const k = e[0] < e[1] ? e[0] + '_' + e[1] : e[1] + '_' + e[0]; if (!seenE.has(k)) { seenE.add(k); edges.push(e); } }

// ---------- sea polygon (Backbay + west coast) from OSM coastline ways ----------
// Chain the west-shore coastline ways (they trace the actual water boundary);
// close south along the map edge and north with a short bridge at z=-1400.
const near2 = (p, q) => Math.hypot(p[0] - q[0], p[1] - q[1]) < 7;
const coastChains = [];
{
  const usedC = new Set();
  for (let i = 0; i < coastWays.length; i++) {
    if (usedC.has(i)) continue;
    let chain = [...coastWays[i]]; usedC.add(i);
    let grew = true;
    while (grew) {
      grew = false;
      for (let j = 0; j < coastWays.length; j++) {
        if (usedC.has(j)) continue;
        const w = coastWays[j];
        const head = chain[0], tail = chain[chain.length - 1];
        if (near2(tail, w[0])) { chain = chain.concat(w.slice(1)); usedC.add(j); grew = true; }
        else if (near2(tail, w[w.length - 1])) { chain = chain.concat(w.slice(0, -1).reverse()); usedC.add(j); grew = true; }
        else if (near2(head, w[w.length - 1])) { chain = w.slice(0, -1).concat(chain); usedC.add(j); grew = true; }
        else if (near2(head, w[0])) { chain = w.slice(1).reverse().concat(chain); usedC.add(j); grew = true; }
      }
    }
    coastChains.push(chain);
  }
}
// pick the chain that hugs the west edge (min x < -900)
const westChain = coastChains.filter(c => Math.min(...c.map(p => p[0])) < -900).sort((a, b) => b.length - a.length)[0];
console.log(`coast chains: ${coastChains.map(c => c.length).join(',')}, west chain pts: ${westChain?.length}`);
let seaCore = westChain;
// progressively thin the chain until the closed ring is simple (earcut hangs otherwise)
let sea = null;
for (let step = 1; step <= 8 && !sea; step++) {
  const thin = seaCore.filter((_, i) => i % step === 0);
  const cand = [...thin,
    [thin[thin.length - 1][0], bounds.maxZ + 60],
    [bounds.minX - 60, bounds.maxZ + 60],
    [bounds.minX - 60, -1400],
  ];
  if (isSimple(cand)) sea = cand;
  else console.log(`sea step ${step}: ${cand.length} pts still non-simple, thinning`);
}
if (!sea) {
  const xs = westChain.map(p => p[0]);
  sea = [[Math.min(...xs) - 40, -1400], [Math.min(...xs) - 40, bounds.maxZ + 60], [bounds.minX - 60, bounds.maxZ + 60], [bounds.minX - 60, -1400]];
  console.log('sea fallback: west bbox strip');
}
console.log(`sea poly: ${sea.length} pts, area ${Math.round(Math.abs(area2(sea)))}, simple: ${isSimple(sea)}`);
// ---------- block polygonization from the road graph ----------
const adj = new Map();
edges.forEach((e, i) => {
  const [a, b] = e;
  if (!adj.has(a)) adj.set(a, []); if (!adj.has(b)) adj.set(b, []);
  adj.get(a).push({ to: b, ei: i }); adj.get(b).push({ to: a, ei: i });
});
const angleOf = (from, to) => Math.atan2(nodes[to][1] - nodes[from][1], nodes[to][0] - nodes[from][0]);
for (const [n, list] of adj) list.sort((p, q) => angleOf(n, p.to) - angleOf(n, q.to));
// half-edge face traversal (planar faces via next-edge-in-rotation)
const nextHE = new Map(); // key u->v  =>  v->w  (w = rotation-next of u around v)
for (const [v, list] of adj) {
  const m = list.length;
  for (let i = 0; i < m; i++) {
    const u = list[i].to, w = list[(i + 1) % m].to;
    nextHE.set(u + '>' + v, v + '>' + w);
  }
}
const faces = [];
const visited = new Set();
for (const [he] of nextHE) {
  if (visited.has(he)) continue;
  const face = []; let cur = he, guard = 0;
  let ok = true;
  while (guard++ < 10000) {
    if (visited.has(cur)) { if (cur !== he) ok = false; break; }
    visited.add(cur);
    const [u, v] = cur.split('>').map(Number);
    face.push(u);
    cur = nextHE.get(cur);
    if (cur === undefined) { ok = false; break; }
  }
  if (ok && face.length > 2) faces.push(face);
}
// to polys + filter
const blocks = [], faceDebug = [];
for (const face of faces) {
  const poly = face.map(i => nodes[i]);
  const A = Math.abs(area2(poly));
  const [x0, z0, x1, z1] = bboxOf(poly);
  // drop the outer face & border-touching faces
  const touchesBorder = x0 <= bounds.minX + 2 || x1 >= bounds.maxX - 2 || z0 <= bounds.minZ + 2 || z1 >= bounds.maxZ - 2;
  faceDebug.push({ n: face.length, A: Math.round(A), touchesBorder });
  if (touchesBorder) continue;
  if (A < 250 || A > 60000) continue;
  // drop faces that are mostly park/water
  let covered = 0;
  for (const g of greenWays) if (coverFrac(poly, g) > 0.5) { covered = 1; break; }
  if (!covered) for (const w of waterWays) if (coverFrac(poly, w) > 0.5) { covered = 1; break; }
  if (!covered && inPoly(...centroid(poly), sea) && coverFrac(poly, sea) > 0.2) covered = 1;
  if (covered) continue;
  blocks.push(poly);
}
// (Ge ranks a side only if |dist(mid, centerline) - width/2| < 2.5).
// Miter-with-limit vertex offset: v_i += m * len, m = normalize(n_prev + n_next),
const insetPoly = (poly, dists) => {
  const n = poly.length, out = [];
  const cx = poly.reduce((s, p) => s + p[0], 0) / n, cz = poly.reduce((s, p) => s + p[1], 0) / n;
  const norm = [];
  for (let i = 0; i < n; i++) {
    const a = poly[i], b = poly[(i + 1) % n];
    const dx = b[0] - a[0], dz = b[1] - a[1], L = Math.hypot(dx, dz) || 1;
    let nx = -dz / L, nz = dx / L;
    const mx = (a[0] + b[0]) / 2, mz = (a[1] + b[1]) / 2;
    if ((cx - mx) * nx + (cz - mz) * nz < 0) { nx = -nx; nz = -nz; }
    norm.push([nx, nz]);
  }
  for (let i = 0; i < n; i++) {
    const np = norm[(i - 1 + n) % n], nc = norm[i];
    const dp = dists[(i - 1 + n) % n], dc = dists[i];
    let mx = np[0] + nc[0], mz = np[1] + nc[1];
    const ml = Math.hypot(mx, mz);
    if (ml < 1e-6) { out.push([poly[i][0] + nc[0] * dc, poly[i][1] + nc[1] * dc]); continue; }
    mx /= ml; mz /= ml;
    const dotP = Math.max(0.35, mx * np[0] + mz * np[1]);
    const dotC = Math.max(0.35, mx * nc[0] + mz * nc[1]);
    const len = Math.min(dp / dotP, dc / dotC, 2.5 * Math.max(dp, dc));
    out.push([+(poly[i][0] + mx * len).toFixed(1), +(poly[i][1] + mz * len).toFixed(1)]);
  }
  return out;
};
// map each graph edge (by node pair) to its road width
const edgeWidthOf = new Map();
for (const e of edges) { edgeWidthOf.set(e[0] + '>' + e[1], e[4]); edgeWidthOf.set(e[1] + '>' + e[0], e[4]); }
// inset only the filtered faces
const insetBlocks = blocks.map(poly => {
  // recover the face node ids for width lookup: match by vertex coords
  const dists = poly.map((p, i) => {
    const q = poly[(i + 1) % poly.length];
    // find the graph edge whose endpoints match p,q
    let w = 10;
    for (const e of edges) {
      const a = nodes[e[0]], b = nodes[e[1]];
      if (Math.hypot(a[0]-p[0],a[1]-p[1]) < .3 && Math.hypot(b[0]-q[0],b[1]-q[1]) < .3) { w = e[4]; break; }
      if (Math.hypot(b[0]-p[0],b[1]-p[1]) < .3 && Math.hypot(a[0]-q[0],a[1]-q[1]) < .3) { w = e[4]; break; }
    }
    return w / 2 + 1.2;
  });
  return insetPoly(poly, dists);
});
const cleanBlocks = sanitize(insetBlocks, 120, 'blocks');
const cleanParks = sanitize(greenWays, 300, 'parks');
console.log(`faces: ${faces.length}, blocks kept: ${cleanBlocks.length}`);
const areas = cleanBlocks.map(b => Math.round(Math.abs(area2(b)))).sort((a, b) => a - b);
console.log('block area units² p10/p50/p90:', areas[Math.floor(areas.length * .1)], areas[Math.floor(areas.length * .5)], areas[Math.floor(areas.length * .9)]);

// ---------- footprints from OSM buildings ----------
const bldgNodes = new Map();
for (const el of BLDG.elements) if (el.type === 'node') bldgNodes.set(el.id, [el.lat, el.lon]);
// road proximity grid for rejection
const CELL = 24; const roadGrid = new Map();
const gkey = (x, z) => Math.floor(x / CELL) + ',' + Math.floor(z / CELL);
for (const e of edges) {
  const [a, b] = e; const [x1, z1] = nodes[a], [x2, z2] = nodes[b];
  const n = Math.max(2, Math.ceil(Math.hypot(x2 - x1, z2 - z1) / 8));
  for (let i = 0; i <= n; i++) {
    const x = x1 + (x2 - x1) * i / n, z = z1 + (z2 - z1) * i / n;
    const k = gkey(x, z); if (!roadGrid.has(k)) roadGrid.set(k, []); roadGrid.get(k).push([x, z]);
  }
}
const nearRoad = (x, z, r) => {
  const cx = Math.floor(x / CELL), cz = Math.floor(z / CELL);
  for (let dx = -1; dx <= 1; dx++) for (let dz = -1; dz <= 1; dz++) {
    const list = roadGrid.get((cx + dx) + ',' + (cz + dz)); if (!list) continue;
    for (const [px, pz] of list) if (Math.hypot(px - x, pz - z) < r) return true;
  }
  return false;
};
const KIND_BY_TAG = t => {
  const b = t['building'];
  if (b === 'office' || t['building:use'] === 'office' || t.office) return 'o';
  if (b === 'commercial' || b === 'retail' || t.shop) return 'c';
  if (b === 'house' || b === 'hut' || b === 'bungalow') return 'h';
  if (b === 'apartments' || b === 'residential' || b === 'terrace' || b === 'yes') return 'y';
  if (b === 'church' || b === 'temple' || b === 'mosque' || t.amenity === 'place_of_worship') return 'k';
  if (b === 'industrial' || b === 'warehouse') return 'i';
  if (b === 'hotel') return 'r';
  return 'y';
};
const footprints = [];
let skipped = 0;
for (const el of BLDG.elements) {
  if (el.type !== 'way' || !el.tags?.building || !el.nodes) continue;
  const ring = el.nodes.map(id => bldgNodes.get(id)).filter(Boolean).map(([la, lo]) => P(la, lo));
  if (ring.length < 4) { skipped++; continue; }
  const A = Math.abs(area2(ring));
  if (A < 20) { skipped++; continue; }
  const [cx, cz] = centroid(ring);
  if (nearRoad(cx, cz, 6) && A < 400) { skipped++; continue; } // tiny slivers on streets
  const coords = ring.slice(0, -1).map(([x, z]) => x + ',' + z).join(',');
  footprints.push([KIND_BY_TAG(el.tags), 0, 0, coords]);
}
const fpRings = footprints.map(fp => ({ kind: fp[0], ring: fp[3].split(',').reduce((acc, v, i, arr) => { if (i % 2 === 0) acc.push([+v, +arr[i + 1]]); return acc; }, []) }));
const cleanFps = sanitize(fpRings.map(f => f.ring), 20, 'footprints');
// sanitize drops bad rings; re-pair by filtering fpRings to those whose ring survived
const keptRings = new Set(cleanFps.map(r => r.map(p => p[0] + ',' + p[1]).join(',')));
const cleanFootprints = fpRings.filter(f => keptRings.has(f.ring.map(([x, z]) => x + ',' + z).join(','))).map(f => [f.kind, 0, 0, f.ring.map(([x, z]) => x + ',' + z).join(',')]);
console.log(`footprints: ${cleanFootprints.length} (raw ${footprints.length}, skipped ${skipped})`);

// ---------- trees at parks ----------
const trees = [];
for (const g of greenWays) {
  if (Math.abs(area2(g)) < 800) continue;
  const [cx, cz] = centroid(g);
  trees.push([+cx.toFixed(1), +cz.toFixed(1), '']);
}
console.log(`trees: ${trees.length}`);

// ---------- zones (district style rects) ----------
// packed = Fort/colaba dense core, leafy = Malabar-side, mixed = middle
const zones = [
  [-600, -400, 700, 900],    // Colaba / Fort (packed)
  [-100, 300, 800, 900],     // Marine Lines / Charni (mixed)
  [400, -600, 500, 700],     // eastern docks edge (packed)
];
// ---------- shops along rank-2/3 roads ----------
const shopTypes = 'bakery.bank.bikes.cafe.clinic.clothes.courier.dental.electrical.flowers.food.gifts.grocery.gym.hardware.laundry.meat.mobile.office.optician.pharmacy.print.restaurant.shoes.stationery.tailor.tea.tobattoy'.split('.');
const shops = [];
const shopKey = new Set();
for (const e of edges) {
  const rank = e[2]; if (rank < 2) continue;
  const [a, b] = e; const [x1, z1] = nodes[a], [x2, z2] = nodes[b];
  const len = Math.hypot(x2 - x1, z2 - z1); if (len < 30) continue;
  const ux = (x2 - x1) / len, uz = (z2 - z1) / len, nx = -uz, nz = ux;
  for (let d = 20; d < len - 20; d += 34 + (Math.floor(d * 7919) % 17)) {
    for (const side of [-1, 1]) {
      if ((d + side * 13 + e[0]) % 3 === 0) continue; // thin out
      const x = +(x1 + ux * d + nx * side * 8.5).toFixed(1), z = +(z1 + uz * d + nz * side * 8.5).toFixed(1);
      if (x < bounds.minX + 8 || x > bounds.maxX - 8 || z < bounds.minZ + 8 || z > bounds.maxZ - 8) continue;
      if (nearRoad(x, z, 4)) continue;
      const k = Math.round(x / 6) + ',' + Math.round(z / 6);
      if (shopKey.has(k)) continue; shopKey.add(k);
      if (x < -300 && z < -200 && z > -1500) continue; // skip shops in the sea zone (rough Backbay guard)
      shops.push([x, z, Math.floor((Math.abs(x * 31 + z * 17)) % shopTypes.length)]);
    }
  }
}
console.log(`shops: ${shops.length}`);

fs.writeFileSync('reference/osm/mumbai/stage23.json', JSON.stringify({
  blocks: cleanBlocks, footprints: cleanFootprints, parks: cleanParks, sea, trees, zones, shops, shopTypes,
}));
console.log('wrote stage23.json');
