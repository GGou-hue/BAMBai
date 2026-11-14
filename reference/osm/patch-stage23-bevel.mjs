// add bevel-inset fallback (full distance) to stage23's ladder, before the scaled retries
import fs from 'fs';
const f = 'reference/osm/osm2map-stage23.mjs';
let s = fs.readFileSync(f, 'utf8');
if (s.includes('insetBevel')) { console.log('already patched'); process.exit(0); }

const anchor = '// map each graph edge (by node pair) to its road width';
if (!s.includes(anchor)) { console.log('anchor missing'); process.exit(1); }

const bevel = `// beveled vertex offset at the same distances: corners are truncated (chamfered)
// instead of mitered, so concave spikes cannot self-intersect; keeps the block edge
// on the full building line (w/2+1.2) so Ge's side ranking still finds the road
const insetBevel = (poly, scaleF) => {
  const n = poly.length;
  const cx = poly.reduce((sm, p) => sm + p[0], 0) / n, cz = poly.reduce((sm, p) => sm + p[1], 0) / n;
  const segs = [];
  for (let i = 0; i < n; i++) {
    const a = poly[i], b = poly[(i + 1) % n];
    const dx = b[0] - a[0], dz = b[1] - a[1], L = Math.hypot(dx, dz) || 1;
    let nx = -dz / L, nz = dx / L;
    const mx = (a[0] + b[0]) / 2, mz = (a[1] + b[1]) / 2;
    if ((cx - mx) * nx + (cz - mz) * nz < 0) { nx = -nx; nz = -nz; }
    const d = (edgeWidthOf.get(nid(a, b)) / 2 + 1.2) * scaleF;
    segs.push([[a[0] + nx * d, a[1] + nz * d], [b[0] + nx * d, b[1] + nz * d]]);
  }
  const pts = [];
  for (const s of segs) { pts.push(s[0], s[1]); }
  const out = [];
  for (const p of pts) {
    const q = out[out.length - 1];
    if (!q || Math.hypot(p[0] - q[0], p[1] - q[1]) > 0.15) out.push([+p[0].toFixed(1), +p[1].toFixed(1)]);
  }
  if (out.length > 1 && Math.hypot(out[0][0] - out[out.length - 1][0], out[0][1] - out[out.length - 1][1]) < 0.15) out.pop();
  return out;
};
// edge width lookup by endpoint position (faces store coordinates, not node ids)
const posKey = p => p[0].toFixed(1) + ',' + p[1].toFixed(1);
const nodeIdx = new Map();
nodes.forEach((p, i) => nodeIdx.set(posKey(p), i));
function nid(a, b) {
  const ia = nodeIdx.get(posKey(a)), ib = nodeIdx.get(posKey(b));
  if (ia === undefined || ib === undefined) return '?';
  return ia + '>' + ib;
}
`;
s = s.replace(anchor, bevel + anchor);

// wire into the ladder: full miter -> full bevel -> 0.6 -> 0.35 -> uniform
s = s.replace("  let out = insetOnce(poly, 1), tag = 0;",
  "  let out = insetOnce(poly, 1), tag = 0;");
s = s.replace("if (!insetOk(out)) { out = insetOnce(poly, 0.6); tag = 1; insetFalls++; }",
  "if (!insetOk(out)) { out = insetBevel(poly, 1); tag = 0.5; insetFalls++; }\n  if (!insetOk(out)) { out = insetOnce(poly, 0.6); tag = 1; insetFalls++; }");
s = s.replace('let tierFull = 0, tier6 = 0, tier35 = 0, tierU = 0;',
  'let tierFull = 0, tierB = 0, tier6 = 0, tier35 = 0, tierU = 0;');
s = s.replace('if (tag === 0) tierFull++; else if (tag === 1) tier6++;',
  'if (tag === 0) tierFull++; else if (tag === 0.5) tierB++; else if (tag === 1) tier6++;');
s = s.replace('full=${tierFull} 60%=${tier6}', 'full=${tierFull} bevel=${tierB} 60%=${tier6}');
fs.writeFileSync(f, s);
console.log('patched');
