// Probe: replicate Ge's side-ranking over the generated blocks and test each
// stage4 U anchor for R()-probe viability (nearest rank>=0 side, containing block).
import fs from 'fs';

const S1 = JSON.parse(fs.readFileSync('reference/osm/mumbai/stage1.json', 'utf8'));
const S23 = JSON.parse(fs.readFileSync('reference/osm/mumbai/stage23.json', 'utf8'));
const stage4 = fs.readFileSync('reference/osm/mumbai/map-mumbai.js', 'utf8');
// pull the SNAPPED U literal from the generated module
const ua = stage4.indexOf('var U=');
const ub = stage4.indexOf('\n,W=e=>', ua);
const U = JSON.parse(stage4.slice(ua + 6, ub));

const { LAT0, LON0, scale } = S1;
const U_M = 111320 * Math.cos(LAT0 * Math.PI / 180), D_M = 110540;
const P = (lat, lon) => [(lon - LON0) * U_M * scale, -(lat - LAT0) * D_M * scale];

const Be = (px, pz, a, b) => {
  const dx = b[0] - a[0], dz = b[1] - a[1], L2 = dx * dx + dz * dz || 1;
  let t = ((px - a[0]) * dx + (pz - a[1]) * dz) / L2; t = Math.max(0, Math.min(1, t));
  return [a[0] + dx * t, a[1] + dz * t];
};
const inPoly = (x, z, poly) => { let c = false; for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) { const [xi, zi] = poly[i], [xj, zj] = poly[j]; if ((zi > z) !== (zj > z) && x < (xj - xi) * (z - zi) / (zj - zi) + xi) c = !c; } return c; };

// edges with width like Ge sees them
const edges = S1.edges.map(e => ({ a: e[0], b: e[1], rank: e[2], width: e[4] }));

let bad = 0;
for (const [key, a] of Object.entries(U)) {
  const [x, z] = P(a.lat, a.lon);
  // containing block?
  let bi = -1;
  S23.blocks.forEach((poly, i) => { if (inPoly(x, z, poly)) bi = i; });
  // nearest rank>=0 side (Ge's rule: |dist(mid, centerline) - width/2| < 2.5)
  let best = 1e9, bestInfo = '';
  S23.blocks.forEach((poly, i) => {
    poly.forEach((p, j) => {
      const q = poly[(j + 1) % poly.length];
      const mx = (p[0] + q[0]) / 2, mz = (p[1] + q[1]) / 2;
      // find nearest road edge to this midpoint (Ge scans all edges)
      let c = 1e9, s = -1;
      edges.forEach((e, k) => {
        const [r, t2] = Be(mx, mz, S1.nodes[e.a], S1.nodes[e.b]);
        const d = Math.abs(Math.hypot(r - mx, t2 - mz) - e.width / 2);
        if (d < c) { c = d; s = k; }
      });
      const rank = c < 2.5 ? edges[s].rank : -1;
      if (rank < 0) return;
      const [ux, uz] = Be(x, z, p, q);
      const d = Math.hypot(ux - x, uz - z);
      if (d < best) { best = d; bestInfo = `blk${i} side${j} rank${rank}`; }
    });
  });
  const ok = bi >= 0 && best < 60;
  if (!ok) bad++;
  console.log(`${ok ? 'OK  ' : 'BAD '} ${key}: block ${bi}, nearest ranked side ${best === 1e9 ? 'NONE' : best.toFixed(1) + 'u ' + bestInfo}`);
}
console.log(bad ? `${bad} BAD anchors` : 'all anchors OK');
