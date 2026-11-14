// find the Harbour Heights service road chain, its parallel main road, and cross roads
import fs from 'fs';
const d = JSON.parse(fs.readFileSync('reference/osm/mumbai/stage1.json', 'utf8'));
const { nodes, edges, names } = d;
const sr = edges.filter(e => names[e[3]] === 'Harbour Heights service road');
console.log('service road edges:', sr.length);
const nodeIds = new Set();
for (const e of sr) { nodeIds.add(e[0]); nodeIds.add(e[1]); }
// edges touching those nodes (other than the service road itself)
const near = edges.filter(e => !sr.includes(e) && (nodeIds.has(e[0]) || nodeIds.has(e[1])));
const nearNames = {};
for (const e of near) { const n = names[e[3]] || '(unnamed)'; nearNames[n] = (nearNames[n] || 0) + 1; }
console.log('touching roads:', JSON.stringify(nearNames, null, 1));
// node coords of the chain
const pts = [...nodeIds].map(i => nodes[i]);
const xs = pts.map(p => p[0]), zs = pts.map(p => p[1]);
console.log('chain bbox x:', Math.min(...xs).toFixed(0), '..', Math.max(...xs).toFixed(0),
  ' z:', Math.min(...zs).toFixed(0), '..', Math.max(...zs).toFixed(0));
// lat/lon of chain midpoint (LAT0/LON0 given)
const { LAT0, LON0, scale } = d;
const cx = xs.reduce((a, b) => a + b) / xs.length, cz = zs.reduce((a, b) => a + b) / zs.length;
console.log('mid lat/lon ~', (LAT0 + cz / (111320 * scale)).toFixed(5), (LON0 + cx / (111320 * scale * Math.cos(LAT0 * Math.PI / 180))).toFixed(5));
