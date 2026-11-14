// wider search: named roads within 80u of the service-road chain, with min distance
import fs from 'fs';
const d = JSON.parse(fs.readFileSync('reference/osm/mumbai/stage1.json', 'utf8'));
const { nodes, edges, names } = d;
const sr = edges.filter(e => names[e[3]] === 'Harbour Heights service road');
const nodeIds = new Set();
for (const e of sr) { nodeIds.add(e[0]); nodeIds.add(e[1]); }
const pts = [...nodeIds].map(i => nodes[i]);
const segDist = (px, pz, a, b) => {
  const dx = b[0] - a[0], dz = b[1] - a[1], L2 = dx * dx + dz * dz || 1;
  let t = ((px - a[0]) * dx + (pz - a[1]) * dz) / L2; t = Math.max(0, Math.min(1, t));
  return Math.hypot(px - (a[0] + dx * t), pz - (a[1] + dz * t));
};
const counts = {};
for (const e of edges) {
  if (sr.includes(e)) continue;
  const a = nodes[e[0]], b = nodes[e[1]];
  let best = 1e9;
  for (const p of pts) best = Math.min(best, segDist(p[0], p[1], a, b));
  if (best < 80) { const n = names[e[3]] || '(unnamed)'; counts[n] = counts[n] || { n: 0, d: 1e9, w: 0 }; counts[n].n++; counts[n].d = Math.min(counts[n].d, best); counts[n].w = Math.max(counts[n].w, e[4]); }
}
for (const [k, v] of Object.entries(counts)) console.log(k.padEnd(45), 'edges:' + v.n, 'minDist:' + v.d.toFixed(1), 'maxW:' + v.w);
