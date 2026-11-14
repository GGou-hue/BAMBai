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
  residential: 2, unclassified: 2, living_street: 2,
  // pedestrian ways are NOT roads here: they slice superblock faces into slivers
  // (Koramangala keeps footpaths in WALKS, not ROADS) — exclude.
  pedestrian: -1, service: 3, track: -1, footway: -1, path: -1, steps: -1, cycleway: -1,
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
  // nodeKey must be rebuilt: it still maps to pre-compaction indices
  nodeKey.clear();
  nodes.forEach((p, i) => nodeKey.set(p[0] + ',' + p[1], i));
  console.log(`node merge: ${before.n}->${nodes.length} nodes, ${before.e}->${edges.length} edges`);
}

{
  const CELL3 = 32;
  const grid3 = new Map();
  const ekey3 = (x, z) => Math.floor(x / CELL3) + ',' + Math.floor(z / CELL3);
  edges.forEach(e => {
    const [x1, z1] = nodes[e[0]], [x2, z2] = nodes[e[1]];
    const n = Math.max(1, Math.ceil(Math.max(Math.abs(x2 - x1), Math.abs(z2 - z1)) / CELL3));
    for (let i = 0; i <= n; i++) {
      const k = ekey3(x1 + (x2 - x1) * i / n, z1 + (z2 - z1) * i / n);
      if (!grid3.has(k)) grid3.set(k, []);
      if (!grid3.get(k).includes(e)) grid3.get(k).push(e);
    }
  });
  const cuts3 = new Map();   // edge -> [{t, pt}]
  const epSnap = new Map();  // endpoint node idx -> pt (merge endpoint into split node)
  let snapped3 = 0;
  for (const [ni, npos] of nodes.entries()) {
    const cx = Math.floor(npos[0] / CELL3), cz = Math.floor(npos[1] / CELL3);
    const seen = new Set();
    for (let dx = -1; dx <= 1; dx++) for (let dz = -1; dz <= 1; dz++) {
      const list = grid3.get((cx + dx) + ',' + (cz + dz)); if (!list) continue;
      for (const e of list) {
        if (e[0] === ni || e[1] === ni) continue;
        const ek = e[0] + '_' + e[1];
        if (seen.has(ek)) continue; seen.add(ek);
        const [x1, z1] = nodes[e[0]], [x2, z2] = nodes[e[1]];
        const dx2 = x2 - x1, dz2 = z2 - z1, L22 = dx2 * dx2 + dz2 * dz2 || 1;
        let t = ((npos[0] - x1) * dx2 + (npos[1] - z1) * dz2) / L22;
        if (t < 0.03 || t > 0.97) continue;
        const px = x1 + dx2 * t, pz = z1 + dz2 * t;
        if (Math.hypot(px - npos[0], pz - npos[1]) > 2.2) continue;
        if (!cuts3.has(ek)) cuts3.set(ek, []);
        cuts3.get(ek).push({ t, pt: [px, pz] });
        if (!epSnap.has(ni)) epSnap.set(ni, [px, pz]);
        snapped3++;
      }
    }
  }
  if (cuts3.size) {
    const edges3 = [];
    const nodeFor = p => {
      const kk = p[0].toFixed(1) + ',' + p[1].toFixed(1);
      if (nodeKey.has(kk)) return nodeKey.get(kk);
      const idx = nodes.length; nodes.push([+p[0].toFixed(1), +p[1].toFixed(1)]); nodeKey.set(kk, idx);
      return idx;
    };
    for (const e of edges) {
      const cs = cuts3.get(e[0] + '_' + e[1]);
      if (!cs) { edges3.push(e); continue; }
      cs.sort((p, q) => p.t - q.t);
      const pts = [];
      for (const c of cs) {
        const prev = pts[pts.length - 1];
        if (prev && Math.hypot(prev[0] - c.pt[0], prev[1] - c.pt[1]) < 3) continue;
        pts.push(c.pt);
      }
      let fromIdx = e[0];
      for (const p of [...pts, [nodes[e[1]][0], nodes[e[1]][1]]]) {
        const idx = nodeFor(p);
        if (idx !== fromIdx && Math.hypot(nodes[idx][0] - nodes[fromIdx][0], nodes[idx][1] - nodes[fromIdx][1]) >= 4)
          edges3.push([fromIdx, idx, e[2], e[3], e[4], e[5], e[6]]);
        fromIdx = idx;
      }
    }
    // merge snapped endpoint nodes into their split nodes
    if (epSnap.size) {
      const remap = new Map();
      for (const [ni, pt] of epSnap) remap.set(ni, nodeFor(pt));
      for (const e of edges3) { if (remap.has(e[0])) e[0] = remap.get(e[0]); if (remap.has(e[1])) e[1] = remap.get(e[1]); }
    }
    // drop collapsed/duplicate edges
    const seenE = new Set(); const edges4 = [];
    for (const e of edges3) {
      if (e[0] === e[1]) continue;
      const k = e[0] < e[1] ? e[0] + '_' + e[1] : e[1] + '_' + e[0];
      if (seenE.has(k)) continue; seenE.add(k);
      edges4.push(e);
    }
    edges.length = 0; edges.push(...edges4);
    console.log(`T-junction snap: ${snapped3} endpoints snapped, ${cuts3.size} edges split`);
  }
}

// --- planarize step 2: split edges at proper crossings ---
{
  const CELL2 = 48;
  const egrid = new Map();
  const segCellSets = edges.map((e, ei) => {
    const [x1, z1] = nodes[e[0]], [x2, z2] = nodes[e[1]];
    const n = Math.max(1, Math.ceil(Math.max(Math.abs(x2 - x1), Math.abs(z2 - z1)) / CELL2));
    const cells = [];
    for (let i = 0; i <= n; i++) {
      const k = Math.floor((x1 + (x2 - x1) * i / n) / CELL2) + ',' + Math.floor((z1 + (z2 - z1) * i / n) / CELL2);
      if (!cells.includes(k)) cells.push(k);
    }
    for (const k of cells) { if (!egrid.has(k)) egrid.set(k, []); egrid.get(k).push(ei); }
    return cells;
  });
  const segInt = (p1, p2, p3, p4) => {
    const d1x = p2[0] - p1[0], d1z = p2[1] - p1[1], d2x = p4[0] - p3[0], d2z = p4[1] - p3[1];
    const den = d1x * d2z - d1z * d2x;
    if (Math.abs(den) < 1e-9) return null;
    const t = ((p3[0] - p1[0]) * d2z - (p3[1] - p1[1]) * d2x) / den;
    const u = ((p3[0] - p1[0]) * d1z - (p3[1] - p1[1]) * d1x) / den;
    if (t < 0.02 || t > 0.98 || u < 0.02 || u > 0.98) return null; // endpoints handled by merge
    return [p1[0] + t * d1x, p1[1] + t * d1z];
  };
  const cuts = edges.map(() => []); // per-edge list of {t, pt}
  const tested = new Set();
  for (const [k, list] of egrid) {
    for (let ii = 0; ii < list.length; ii++) for (let jj = ii + 1; jj < list.length; jj++) {
      const i = list[ii], j = list[jj];
      if (i === j) continue;
      const pk = i < j ? i + '_' + j : j + '_' + i;
      if (tested.has(pk)) continue; tested.add(pk);
      const ei = edges[i], ej = edges[j];
      if (ei[0] === ej[0] || ei[0] === ej[1] || ei[1] === ej[0] || ei[1] === ej[1]) continue; // share a node
      const p = segInt(nodes[ei[0]], nodes[ei[1]], nodes[ej[0]], nodes[ej[1]]);
      if (!p) continue;
      const L1 = Math.hypot(nodes[ei[1]][0] - nodes[ei[0]][0], nodes[ei[1]][1] - nodes[ei[0]][1]) || 1;
      const L2 = Math.hypot(nodes[ej[1]][0] - nodes[ej[0]][0], nodes[ej[1]][1] - nodes[ej[0]][1]) || 1;
      const t1 = ((p[0] - nodes[ei[0]][0]) * (nodes[ei[1]][0] - nodes[ei[0]][0]) + (p[1] - nodes[ei[0]][1]) * (nodes[ei[1]][1] - nodes[ei[0]][1])) / (L1 * L1);
      const t2 = ((p[0] - nodes[ej[0]][0]) * (nodes[ej[1]][0] - nodes[ej[0]][0]) + (p[1] - nodes[ej[0]][1]) * (nodes[ej[1]][1] - nodes[ej[0]][1])) / (L2 * L2);
      cuts[i].push({ t: t1, pt: p }); cuts[j].push({ t: t2, pt: p });
    }
  }
  let splits = 0;
  const edges3 = [];
  for (let ei = 0; ei < edges.length; ei++) {
    const e = edges[ei];
    if (!cuts[ei].length) { edges3.push(e); continue; }
    const [a, b] = e;
    const A = nodes[a], B = nodes[b];
    cuts[ei].sort((p, q) => p.t - q.t);
    // dedupe cuts closer than 3 u along the edge
    const pts = [];
    for (const c of cuts[ei]) {
      const prev = pts[pts.length - 1];
      if (prev && Math.hypot(prev[0] - c.pt[0], prev[1] - c.pt[1]) < 3) continue;
      pts.push(c.pt);
    }
    let from = A;
    for (const p of [...pts, B]) {
      if (Math.hypot(p[0] - from[0], p[1] - from[1]) < 4) { continue; }
      let idx;
      if (p === B || (p[0] === B[0] && p[1] === B[1])) idx = b;
      else {
        const k = p[0].toFixed(1) + ',' + p[1].toFixed(1);
        if (nodeKey.has(k)) idx = nodeKey.get(k);
        else { idx = nodes.length; nodes.push([+p[0].toFixed(1), +p[1].toFixed(1)]); nodeKey.set(k, idx); }
      }
      edges3.push([from === A ? a : idxOf(from), idx, e[2], e[3], e[4], e[5], e[6]]);
      from = p; splits++;
    }
  }
  // helper to map an already-pushed point back to its node idx
  function idxOf(p) { const k = p[0].toFixed(1) + ',' + p[1].toFixed(1); return nodeKey.get(k); }
  edges.length = 0; edges.push(...edges3);
  console.log(`planarize: ${splits} edge splits at crossings`);
}

// --- planarize step 3: resolve endpoint-adjacent defects left by step 2 ---
// (near-duplicate nodes created by splits/snaps never went through the early merge;
//  endpoints lying on another edge's interior were excluded from step 2 by design)
for (let iter3 = 0; iter3 < 2; iter3++) {
  const nodeKey3 = new Map();
  nodes.forEach((p, i) => nodeKey3.set(p[0].toFixed(1) + ',' + p[1].toFixed(1), i));
  let merged3 = 0, snapped3 = 0;
  // (1) union near-duplicate nodes (<= 2.0 u apart), average positions
  {
    const R2 = 2.0, parent = nodes.map((_, i) => i);
    const find = i => { while (parent[i] !== i) { parent[i] = parent[parent[i]]; i = parent[i]; } return i; };
    const g = new Map();
    nodes.forEach((p, i) => {
      const cx = Math.floor(p[0] / R2), cz = Math.floor(p[1] / R2);
      for (let dx = -1; dx <= 1; dx++) for (let dz = -1; dz <= 1; dz++) {
        const k = (cx + dx) + ',' + (cz + dz);
        if (!g.has(k)) g.set(k, []);
        g.get(k).push(i);
      }
    });
    const done = new Set();
    for (const list of g.values()) {
      for (let ii = 0; ii < list.length; ii++) for (let jj = ii + 1; jj < list.length; jj++) {
        const i = find(list[ii]), j = find(list[jj]);
        if (i === j) continue;
        const pk = i < j ? i + '_' + j : j + '_' + i;
        if (done.has(pk)) continue; done.add(pk);
        if (Math.hypot(nodes[i][0] - nodes[j][0], nodes[i][1] - nodes[j][1]) > R2) continue;
        parent[j] = i; merged3++;
      }
    }
    const groups = new Map();
    for (let i = 0; i < nodes.length; i++) {
      const r = find(i);
      if (r === i) continue;
      if (!groups.has(r)) groups.set(r, []);
      groups.get(r).push(i);
    }
    const newPos = nodes.map(p => p.slice());
    for (const [r, list] of groups) {
      let sx = nodes[r][0], sz = nodes[r][1];
      for (const i of list) { sx += nodes[i][0]; sz += nodes[i][1]; }
      newPos[r] = [+(sx / (list.length + 1)).toFixed(1), +(sz / (list.length + 1)).toFixed(1)];
    }
    nodes.length = 0; nodes.push(...newPos);
    const seenE = new Set(); const edges5 = [];
    for (const e of edges) {
      e[0] = find(e[0]); e[1] = find(e[1]);
      if (e[0] === e[1]) continue;
      const k = e[0] < e[1] ? e[0] + '_' + e[1] : e[1] + '_' + e[0];
      if (seenE.has(k)) continue; seenE.add(k);
      edges5.push(e);
    }
    edges.length = 0; edges.push(...edges5);
  }
  // (2) snap endpoints onto edge interiors (<= 2.2 u) and split the target edge
  {
    const CELL3 = 48;
    const grid = new Map();
    edges.forEach((e, ei) => {
      const [x1, z1] = nodes[e[0]], [x2, z2] = nodes[e[1]];
      const n = Math.max(1, Math.ceil(Math.max(Math.abs(x2 - x1), Math.abs(z2 - z1)) / CELL3));
      for (let i = 0; i <= n; i++) {
        const k = Math.floor((x1 + (x2 - x1) * i / n) / CELL3) + ',' + Math.floor((z1 + (z2 - z1) * i / n) / CELL3);
        if (!grid.has(k)) grid.set(k, []);
        if (!grid.get(k).includes(ei)) grid.get(k).push(ei);
      }
    });
    const cuts = new Map(); const moved = new Map();
    for (let ni = 0; ni < nodes.length; ni++) {
      const [nx, nz] = nodes[ni];
      const cx = Math.floor(nx / CELL3), cz = Math.floor(nz / CELL3);
      const seen = new Set();
      for (let dx = -1; dx <= 1; dx++) for (let dz = -1; dz <= 1; dz++) {
        const list = grid.get((cx + dx) + ',' + (cz + dz)); if (!list) continue;
        for (const ei of list) {
          const e = edges[ei];
          if (e[0] === ni || e[1] === ni) continue;
          const ek = e[0] + '_' + e[1];
          if (seen.has(ek)) continue; seen.add(ek);
          const [x1, z1] = nodes[e[0]], [x2, z2] = nodes[e[1]];
          const dx2 = x2 - x1, dz2 = z2 - z1, L22 = dx2 * dx2 + dz2 * dz2 || 1;
          const t = ((nx - x1) * dx2 + (nz - z1) * dz2) / L22;
          if (t < 0.03 || t > 0.97) continue;
          const px = x1 + dx2 * t, pz = z1 + dz2 * t;
          if (Math.hypot(px - nx, pz - nz) > 2.2) continue;
          if (!cuts.has(ek)) cuts.set(ek, []);
          cuts.get(ek).push({ t, pt: [px, pz] });
          moved.set(ni, [+px.toFixed(1), +pz.toFixed(1)]);
          snapped3++;
        }
      }
    }
    if (cuts.size) {
      const nodeFor = p => {
        const k = p[0].toFixed(1) + ',' + p[1].toFixed(1);
        if (nodeKey3.has(k)) return nodeKey3.get(k);
        const idx = nodes.length; nodes.push([+p[0].toFixed(1), +p[1].toFixed(1)]); nodeKey3.set(k, idx);
        return idx;
      };
      const out = [];
      for (const e of edges) {
        const cs = cuts.get(e[0] + '_' + e[1]);
        if (!cs) { out.push(e); continue; }
        cs.sort((p, q) => p.t - q.t);
        let from = e[0];
        for (const c of cs) {
          const idx = nodeFor(c.pt);
          if (idx !== from) out.push([from, idx, e[2], e[3], e[4], e[5], e[6]]);
          from = idx;
        }
        if (from !== e[1]) out.push([from, e[1], e[2], e[3], e[4], e[5], e[6]]);
      }
      for (const [ni, pt] of moved) { nodes[ni][0] = pt[0]; nodes[ni][1] = pt[1]; }
      edges.length = 0; edges.push(...out);
    }
  }
  // (3) re-run the crossing splitter (interior x interior, same tolerances as step 2)
  {
    const CELL2 = 48;
    const egrid = new Map();
    edges.forEach((e, ei) => {
      const [x1, z1] = nodes[e[0]], [x2, z2] = nodes[e[1]];
      const n = Math.max(1, Math.ceil(Math.max(Math.abs(x2 - x1), Math.abs(z2 - z1)) / CELL2));
      for (let i = 0; i <= n; i++) {
        const k = Math.floor((x1 + (x2 - x1) * i / n) / CELL2) + ',' + Math.floor((z1 + (z2 - z1) * i / n) / CELL2);
        if (!egrid.has(k)) egrid.set(k, []);
        if (!egrid.get(k).includes(ei)) egrid.get(k).push(ei);
      }
    });
    const segInt = (p1, p2, p3, p4) => {
      const d1x = p2[0] - p1[0], d1z = p2[1] - p1[1], d2x = p4[0] - p3[0], d2z = p4[1] - p3[1];
      const den = d1x * d2z - d1z * d2x;
      if (Math.abs(den) < 1e-9) return null;
      const t = ((p3[0] - p1[0]) * d2z - (p3[1] - p1[1]) * d2x) / den;
      const u = ((p3[0] - p1[0]) * d1z - (p3[1] - p1[1]) * d1x) / den;
      if (t < 0.02 || t > 0.98 || u < 0.02 || u > 0.98) return null;
      return [p1[0] + t * d1x, p1[1] + t * d1z, t, u];
    };
    const cuts = edges.map(() => []);
    const tested = new Set();
    for (const list of egrid.values()) {
      for (let ii = 0; ii < list.length; ii++) for (let jj = ii + 1; jj < list.length; jj++) {
        const i = list[ii], j = list[jj];
        const pk = i < j ? i + '_' + j : j + '_' + i;
        if (tested.has(pk)) continue; tested.add(pk);
        const ei = edges[i], ej = edges[j];
        if (ei[0] === ej[0] || ei[0] === ej[1] || ei[1] === ej[0] || ei[1] === ej[1]) continue;
        const p = segInt(nodes[ei[0]], nodes[ei[1]], nodes[ej[0]], nodes[ej[1]]);
        if (!p) continue;
        const L1 = Math.hypot(nodes[ei[1]][0] - nodes[ei[0]][0], nodes[ei[1]][1] - nodes[ei[0]][1]) || 1;
        const L2 = Math.hypot(nodes[ej[1]][0] - nodes[ej[0]][0], nodes[ej[1]][1] - nodes[ej[0]][1]) || 1;
        const t1 = ((p[0] - nodes[ei[0]][0]) * (nodes[ei[1]][0] - nodes[ei[0]][0]) + (p[1] - nodes[ei[0]][1]) * (nodes[ei[1]][1] - nodes[ei[0]][1])) / (L1 * L1);
        const t2 = ((p[0] - nodes[ej[0]][0]) * (nodes[ej[1]][0] - nodes[ej[0]][0]) + (p[1] - nodes[ej[0]][1]) * (nodes[ej[1]][1] - nodes[ej[0]][1])) / (L2 * L2);
        cuts[i].push({ t: t1, pt: [p[0], p[1]] }); cuts[j].push({ t: t2, pt: [p[0], p[1]] });
      }
    }
    let sp = 0;
    const out = [];
    for (let ei = 0; ei < edges.length; ei++) {
      const e = edges[ei];
      if (!cuts[ei].length) { out.push(e); continue; }
      cuts[ei].sort((p, q) => p.t - q.t);
      let from = e[0];
      for (const c of cuts[ei]) {
        const k = c.pt[0].toFixed(1) + ',' + c.pt[1].toFixed(1);
        let idx = nodeKey3.get(k);
        if (idx === undefined) { idx = nodes.length; nodes.push([+c.pt[0].toFixed(1), +c.pt[1].toFixed(1)]); nodeKey3.set(k, idx); }
        if (idx !== from) { out.push([from, idx, e[2], e[3], e[4], e[5], e[6]]); from = idx; sp++; }
      }
      if (from !== e[1]) out.push([from, e[1], e[2], e[3], e[4], e[5], e[6]]);
    }
    edges.length = 0; edges.push(...out);
    console.log(`planarize-3: merged ${merged3} near-dup nodes, snapped ${snapped3} endpoints, ${sp} re-splits`);
  }
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
