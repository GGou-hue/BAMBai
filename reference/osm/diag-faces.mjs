// diagnose: how many faces are simple before/after inset; sample failures
import fs from 'fs';
const S1 = JSON.parse(fs.readFileSync('reference/osm/mumbai/stage1.json', 'utf8'));
const nodes = S1.nodes, edges1 = S1.edges;
const seenE = new Set(); const edges = [];
for (const e of edges1) { const k = e[0] < e[1] ? e[0] + '_' + e[1] : e[1] + '_' + e[0]; if (!seenE.has(k)) { seenE.add(k); edges.push(e); } }
const adj = new Map();
edges.forEach((e, i) => { const [a, b] = e; if (!adj.has(a)) adj.set(a, []); if (!adj.has(b)) adj.set(b, []); adj.get(a).push({ to: b, ei: i }); adj.get(b).push({ to: a, ei: i }); });
const angleOf = (f, t) => Math.atan2(nodes[t][1] - nodes[f][1], nodes[t][0] - nodes[f][0]);
for (const [n, list] of adj) list.sort((p, q) => angleOf(n, p.to) - angleOf(n, q.to));
const nextHE = new Map();
for (const [v, list] of adj) { const m = list.length; for (let i = 0; i < m; i++) nextHE.set(list[i].to + '>' + v, v + '>' + list[(i + 1) % m].to); }
const faces = []; const visited = new Set();
for (const [he] of nextHE) {
  if (visited.has(he)) continue;
  const face = []; let cur = he, guard = 0, ok = true;
  while (guard++ < 20000) {
    if (visited.has(cur)) { if (cur !== he) ok = false; break; }
    visited.add(cur); const [u, v] = cur.split('>').map(Number); face.push(u); cur = nextHE.get(cur);
    if (cur === undefined) { ok = false; break; }
  }
  if (ok && face.length > 2) faces.push(face);
}
const area2 = poly => { let a = 0; for (let i = 0; i < poly.length; i++) { const [x1, z1] = poly[i], [x2, z2] = poly[(i + 1) % poly.length]; a += x1 * z2 - x2 * z1; } return a / 2; };
const isSimple = poly => { const n = poly.length; const seg = (a, b, c, d) => { const d1 = (b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0]); const d2 = (b[0]-a[0])*(d[1]-a[1])-(b[1]-a[1])*(d[0]-a[0]); const d3 = (d[0]-c[0])*(a[1]-c[1])-(d[1]-c[1])*(a[0]-c[0]); const d4 = (d[0]-c[0])*(b[1]-c[1])-(d[1]-c[1])*(b[0]-c[0]); return ((d1>0)!==(d2>0))&&((d3>0)!==(d4>0)); }; for (let i=0;i<n;i++) for (let j=i+2;j<n;j++){ if(i===0&&j===n-1)continue; if(seg(poly[i],poly[(i+1)%n],poly[j],poly[(j+1)%n])) return false; } return true; };
const B = S1.bounds;
let simple = 0, nonsimple = 0, big = 0, border = 0;
const sizes = [];
for (const f of faces) {
  const poly = f.map(i => nodes[i]);
  const A = Math.abs(area2(poly));
  const x0 = Math.min(...poly.map(p => p[0])), x1 = Math.max(...poly.map(p => p[0]));
  const z0 = Math.min(...poly.map(p => p[1])), z1 = Math.max(...poly.map(p => p[1]));
  if (x0 <= B.minX + 2 || x1 >= B.maxX - 2 || z0 <= B.minZ + 2 || z1 >= B.maxZ - 2) { border++; continue; }
  if (A < 250 || A > 60000) { big++; continue; }
  sizes.push({ n: f.length, A: Math.round(A), simple: isSimple(poly) });
  isSimple(poly) ? simple++ : nonsimple++;
}
console.log('faces', faces.length, 'border', border, 'sizefail', big, 'simple', simple, 'nonsimple', nonsimple);
const ns = sizes.filter(s => !s.simple).sort((a, b) => b.n - a.n);
console.log('nonsimple vertex counts:', ns.slice(0, 15).map(s => s.n + '/' + s.A).join(' '));
console.log('simple vertex counts:', sizes.filter(s => s.simple).slice(0, 10).map(s => s.n + '/' + s.A).join(' '));
