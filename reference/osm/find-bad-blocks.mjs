// find blocks whose earcut triangulation hangs or produces garbage
import fs from 'fs';

const S23 = JSON.parse(fs.readFileSync('reference/osm/mumbai/stage23.json', 'utf8'));
console.log('blocks:', S23.blocks.length);

// replicate vehicle.js ne(): ensure CCW outer, triangulateShape
// use THREE.ShapeUtils from the vendored three build
const three = await import('../../vendor/three-core.js');
const SU = three.oa; const V2 = three.no; // oa=ShapeUtils, no=Vector2 (vehicle.js import map)
console.log('ShapeUtils?', !!SU, !!(SU && SU.triangulateShape));

const isClockWise = (pts) => {
  let a = 0;
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) a += (pts[j][0] - pts[i][0]) * (pts[j][1] + pts[i][1]);
  return a > 0;
};
const area2 = (p) => { let a = 0; for (let i = 0, j = p.length - 1; i < p.length; j = i++) a += (p[j][0] - p[i][0]) * (p[i][1] + p[j][1]); return a; };

let slow = [];
const t0 = Date.now();
for (let bi = 0; bi < S23.blocks.length; bi++) {
  const pts = S23.blocks[bi].pts ?? S23.blocks[bi];
  if (!pts || pts.length < 3) continue;
  const ring = pts.map(([x, z]) => new V2(x, z));
  if (isClockWise(pts)) ring.reverse();
  const t = Date.now();
  let tris;
  try { tris = SU.triangulateShape(ring, []); } catch (e) { slow.push([bi, 'THROW ' + e.message, Date.now() - t]); continue; }
  const ms = Date.now() - t;
  if (ms > 50) slow.push([bi, ms + 'ms tris=' + tris.length + ' pts=' + pts.length, ms]);
}
console.log('done in', Date.now() - t0, 'ms; slow/bad:', slow.length);
slow.slice(0, 10).forEach((s) => console.log(JSON.stringify(s)));
