// find true X-crossings in the final spliced map (edges crossing without sharing a node)
import fs from 'fs';
import * as M from '../../reference/osm/mumbai/map-mumbai.js';

const built = M.t;
const nodes = built.ROADS.nodes, edges = built.ROADS.edges;
console.log('nodes', nodes.length, 'edges', edges.length);

const segInt = (p1, p2, p3, p4) => {
  const d1x = p2[0] - p1[0], d1z = p2[1] - p1[1], d2x = p4[0] - p3[0], d2z = p4[1] - p3[1];
  const den = d1x * d2z - d1z * d2x;
  if (Math.abs(den) < 1e-9) return null;
  const t = ((p3[0] - p1[0]) * d2z - (p3[1] - p1[1]) * d2x) / den;
  const u = ((p3[0] - p1[0]) * d1z - (p3[1] - p1[1]) * d1x) / den;
  return [t, u, p1[0] + t * d1x, p1[1] + t * d1z];
};

// grid over edges
const CELL = 48;
const grid = new Map();
edges.forEach((e, ei) => {
  const x1 = nodes[e.a].x, z1 = nodes[e.a].z, x2 = nodes[e.b].x, z2 = nodes[e.b].z;
  const n = Math.max(1, Math.ceil(Math.max(Math.abs(x2 - x1), Math.abs(z2 - z1)) / CELL));
  for (let i = 0; i <= n; i++) {
    const k = Math.floor((x1 + (x2 - x1) * i / n) / CELL) + ',' + Math.floor((z1 + (z2 - z1) * i / n) / CELL);
    if (!grid.has(k)) grid.set(k, []);
    if (!grid.get(k).includes(ei)) grid.get(k).push(ei);
  }
});

const found = [];
const tested = new Set();
for (const list of grid.values()) {
  for (let ii = 0; ii < list.length; ii++) for (let jj = ii + 1; jj < list.length; jj++) {
    const i = list[ii], j = list[jj];
    const pk = i < j ? i + '_' + j : j + '_' + i;
    if (tested.has(pk)) continue; tested.add(pk);
    const ei = edges[i], ej = edges[j];
    if (ei.a === ej.a || ei.a === ej.b || ei.b === ej.a || ei.b === ej.b) continue;
    const p = segInt([nodes[ei.a].x,nodes[ei.a].z],[nodes[ei.b].x,nodes[ei.b].z],[nodes[ej.a].x,nodes[ej.a].z],[nodes[ej.b].x,nodes[ej.b].z]);
    if (!p) continue;
    if (p[0] <= 0 || p[0] >= 1 || p[1] <= 0 || p[1] >= 1) continue;
    found.push({ i, j, x: +p[2].toFixed(1), z: +p[3].toFixed(3), t: +p[0].toFixed(3), u: +p[1].toFixed(3), ni: ei.name, nj: ej.name });
  }
}
console.log('true X-crossings:', found.length);
for (const f of found) console.log(JSON.stringify(f));
