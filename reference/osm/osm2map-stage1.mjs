// osm2map — stage 1: OSM South Mumbai → map.js raw literals (roads core).
// Emits reference/osm/mumbai/stage1.json with {proj, bounds, names, nodes, edges}.
// Projection math mirrors map.js's t(): linear (no warp), scale .5 → 1 unit ≈ 2 m.
import fs from 'fs';

const BBOX = { S: 18.905, W: 72.815, N: 18.945, E: 72.845 };
const SCALE = 0.5;
const LAT0 = (BBOX.S + BBOX.N) / 2, LON0 = (BBOX.W + BBOX.E) / 2;
const U = 111320 * Math.cos(LAT0 * Math.PI / 180), D = 110540;
const toGame = (lat, lon) => [
  +(((lon - LON0) * U) * SCALE).toFixed(1),
  +((-(lat - LAT0) * D) * SCALE).toFixed(1),
];

const hw = JSON.parse(fs.readFileSync('reference/osm/sm-highways.json', 'utf8'));
const nodesById = new Map();
for (const el of hw.elements) if (el.type === 'node') nodesById.set(el.id, [el.lat, el.lon]);

// --- rank/width tables (mirroring Koramangala data conventions) ---
// rank 0: arterials (17 u wide, 4 lanes, median) | rank 1: mains (18 or 11)
// rank 2: locals (10 u) | rank 3: lanes/services (7.5 u, 2 lanes, no median)
const HW_CLASS = {
  motorway: 0, motorway_link: 0, trunk: 0, trunk_link: 0, primary: 0, primary_link: 0,
  secondary: 1, secondary_link: 1, tertiary: 1, tertiary_link: 1,
  residential: 2, unclassified: 2, living_street: 2, pedestrian: 3,
  service: 3, track: -1, footway: -1, path: -1, steps: -1, cycleway: -1,
};
const SPEC = [
  { width: 17, lanes: 4, median: 1 },   // rank 0
  { width: 18, lanes: 4, median: 1 },   // rank 1 major
  { width: 10, lanes: 2, median: 0 },   // rank 2
  { width: 7.5, lanes: 2, median: 0 },  // rank 3
];
const specFor = (rank, hw) => {
  if (rank === 1 && (hw === 'secondary' || hw === 'secondary_link' || hw === 'tertiary_link'))
    return { width: 11, lanes: 2, median: 0 };
  return SPEC[rank];
};

// --- collect drivable ways ---
const ways = [];
for (const el of hw.elements) {
  if (el.type !== 'way' || !el.tags?.highway) continue;
  const cls = HW_CLASS[el.tags.highway];
  if (cls === undefined || cls < 0) continue;
  const nds = el.nodes.filter(id => nodesById.has(id));
  if (nds.length < 2) continue;
  ways.push({ id: el.id, name: el.tags.name || '', hw: el.tags.highway, rank: cls, nds, oneway: el.tags.oneway === 'yes' });
}

// --- junction detection: OSM node used by 2+ ways ---
const useCount = new Map();
for (const w of ways) for (const id of w.nds) useCount.set(id, (useCount.get(id) || 0) + 1);

// --- build node index (junctions + endpoints first, then per-way interior) ---
const nodeKey = new Map(); // "x,z" rounded → idx
const nodes = [];
const getNode = (lat, lon) => {
  const [x, z] = toGame(lat, lon);
  const k = x + ',' + z;
  if (nodeKey.has(k)) return nodeKey.get(k);
  const idx = nodes.length;
  nodes.push([x, z]);
  nodeKey.set(k, idx);
  return idx;
};
const isJunction = id => (useCount.get(id) || 0) > 1;

// --- split each way into edges at junctions; merge consecutive collinear pts ---
const edges = [];
const nameIdx = new Map(); const names = [];
const nameId = n => {
  if (!nameIdx.has(n)) { nameIdx.set(n, names.length); names.push(n); }
  return nameIdx.get(n);
};
nameId(''); // index 0 = unnamed (original has an empty entry)

let edgeId = 0;
for (const w of ways) {
  const spec = specFor(w.rank, w.hw);
  // split points: junctions + way ends
  const cuts = [0];
  for (let i = 1; i < w.nds.length - 1; i++) if (isJunction(w.nds[i])) cuts.push(i);
  cuts.push(w.nds.length - 1);
  for (let c = 0; c < cuts.length - 1; c++) {
    const seg = w.nds.slice(cuts[c], cuts[c + 1] + 1);
    if (seg.length < 2) continue;
    // simplify: drop intermediate nodes that are neither junctions nor direction changes
    const pts = seg.map(id => nodesById.get(id));
    const keep = [0];
    for (let i = 1; i < pts.length - 1; i++) {
      const [x0, z0] = toGame(...pts[i - 1]), [x1, z1] = toGame(...pts[i]), [x2, z2] = toGame(...pts[i + 1]);
      const cross = Math.abs((x1 - x0) * (z2 - z1) - (z1 - z0) * (x2 - x1));
      const len1 = Math.hypot(x1 - x0, z1 - z0), len2 = Math.hypot(x2 - x1, z2 - z1);
      if (len1 > 18 || cross / (len1 * len2 || 1) > 0.08) keep.push(i);
    }
    keep.push(pts.length - 1);
    const idxs = keep.map(i => getNode(...pts[i]));
    for (let i = 0; i < idxs.length - 1; i++) {
      const a = idxs[i], b = idxs[i + 1];
      if (a === b) continue;
      const len = Math.hypot(nodes[a][0] - nodes[b][0], nodes[a][1] - nodes[b][1]);
      if (len < 4) continue; // absorb micro-segments
      edges.push([a, b, w.rank, nameId(w.name), spec.width, spec.lanes, spec.median]);
      edgeId++;
    }
  }
}

// --- merge near-duplicate nodes (OSM ways crossing without a shared node) ---
// union-find over pairs within 4 u (8 m) so the road graph connects and faces close.
{
  const parent = nodes.map((_, i) => i);
  const find = i => { while (parent[i] !== i) { parent[i] = parent[parent[i]]; i = parent[i]; } return i; };
  const CELL = 4, grid = new Map();
  for (let i = 0; i < nodes.length; i++) {
    const k = Math.floor(nodes[i][0] / CELL) + ',' + Math.floor(nodes[i][1] / CELL);
    if (!grid.has(k)) grid.set(k, []); grid.get(k).push(i);
  }
  for (let i = 0; i < nodes.length; i++) {
    const cx = Math.floor(nodes[i][0] / CELL), cz = Math.floor(nodes[i][1] / CELL);
    for (let dx = -1; dx <= 1; dx++) for (let dz = -1; dz <= 1; dz++) {
      const list = grid.get((cx + dx) + ',' + (cz + dz)); if (!list) continue;
      for (const j of list) {
        if (j <= i) continue;
        if (Math.hypot(nodes[i][0] - nodes[j][0], nodes[i][1] - nodes[j][1]) < 4) {
          const pi = find(i), pj = find(j);
          if (pi !== pj) parent[Math.max(pi, pj)] = Math.min(pi, pj);
        }
      }
    }
  }
  const remap = new Map(); const nodes2 = []; const old2new = new Array(nodes.length);
  for (let i = 0; i < nodes.length; i++) {
    const r = find(i);
    if (!remap.has(r)) { remap.set(r, nodes2.length); nodes2.push(nodes[r]); }
    old2new[i] = remap.get(r);
  }
  const eseen = new Set(); const edges2 = [];
  for (const e of edges) {
    const a = old2new[e[0]], b = old2new[e[1]];
    if (a === b) continue;
    const k = a < b ? a + '_' + b : b + '_' + a;
    if (eseen.has(k)) continue; eseen.add(k);
    edges2.push([a, b, e[2], e[3], e[4], e[5], e[6]]);
  }
  const before = { n: nodes.length, e: edges.length };
  nodes.length = 0; nodes.push(...nodes2);
  edges.length = 0; edges.push(...edges2);
  console.log(`node merge: ${before.n}->${nodes.length} nodes, ${before.e}->${edges.length} edges`);
}

// --- bounds: from actual node extent (Overpass ways may poke outside the query bbox) ---
let minX = 1e9, maxX = -1e9, minZ = 1e9, maxZ = -1e9;
for (const [x, z] of nodes) {
  if (x < minX) minX = x; if (x > maxX) maxX = x;
  if (z < minZ) minZ = z; if (z > maxZ) maxZ = z;
}
minX = +minX.toFixed(1) - 1; maxX = +maxX.toFixed(1) + 1;
minZ = +minZ.toFixed(1) - 1; maxZ = +maxZ.toFixed(1) + 1;
const bounds = { minX, maxX, minZ, maxZ };

const out = {
  bbox: BBOX, LAT0, LON0, scale: SCALE,
  bounds,
  names,
  nodes,
  edges,
};
fs.mkdirSync('reference/osm/mumbai', { recursive: true });
fs.writeFileSync('reference/osm/mumbai/stage1.json', JSON.stringify(out));
console.log(`ways: ${ways.length}, nodes: ${nodes.length}, edges: ${edges.length}, names: ${names.length}`);
console.log('bounds:', JSON.stringify(bounds));
const rankHist = {};
for (const e of edges) rankHist[e[2]] = (rankHist[e[2]] || 0) + 1;
console.log('rank histogram:', JSON.stringify(rankHist));
const named = names.filter(Boolean).length;
console.log(`named roads: ${named}/${names.length}`);
