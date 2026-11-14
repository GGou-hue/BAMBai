// chain connectivity: which chain nodes touch N Sawant Road edges; chain shape
import fs from 'fs';
const d = JSON.parse(fs.readFileSync('reference/osm/mumbai/stage1.json', 'utf8'));
const { nodes, edges, names } = d;
const sr = edges.filter(e => names[e[3]] === 'Harbour Heights service road');
const ns = edges.filter(e => names[e[3]] === 'N Sawant Road');
const chainNodes = new Set();
for (const e of sr) { chainNodes.add(e[0]); chainNodes.add(e[1]); }
for (const e of ns) {
  const touch = [];
  if (chainNodes.has(e[0])) touch.push(e[0]);
  if (chainNodes.has(e[1])) touch.push(e[1]);
  if (touch.length) console.log('N Sawant edge', e[0], '-', e[1], 'touches chain node(s)', touch.join(','));
}
// chain edge list with widths
for (const e of sr) console.log('sr edge', e[0], '->', e[1], 'w=' + e[4]);
// endpoints: degree within chain
const deg = {};
for (const e of sr) { deg[e[0]] = (deg[e[0]] || 0) + 1; deg[e[1]] = (deg[e[1]] || 0) + 1; }
console.log('chain endpoints (deg 1):', Object.entries(deg).filter(([, v]) => v === 1).map(([k]) => k).join(','));
// what else touches each endpoint (all edges)
for (const i of Object.entries(deg).filter(([, v]) => v === 1).map(([k]) => +k)) {
  const others = edges.filter(e => (e[0] === i || e[1] === i) && !sr.includes(e)).map(e => names[e[3]] || '(unnamed)');
  console.log('endpoint', i, 'other edges:', JSON.stringify(others));
}
