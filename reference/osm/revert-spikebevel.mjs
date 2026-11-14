// revert the spike-bevel experiment: restore original insetPoly vertex loop
import fs from 'fs';
const f = 'reference/osm/osm2map-stage23.mjs';
let s = fs.readFileSync(f, 'utf8');
const newLoop = `    const dotP = Math.max(0.35, mx * np[0] + mz * np[1]);
    const dotC = Math.max(0.35, mx * nc[0] + mz * nc[1]);
    const ideal = Math.min(dp / dotP, dc / dotC);
    const lim = 2.5 * Math.max(dp, dc);
    if (ideal >= lim) {
      // spike vertex: the miter would run past the clamp and self-intersect.
      // bevel just this corner: emit the two edge-offset points (building line kept).
      const q1 = [poly[i][0] + np[0] * dp, poly[i][1] + np[1] * dp];
      const q2 = [poly[i][0] + nc[0] * dc, poly[i][1] + nc[1] * dc];
      const prev = out[out.length - 1];
      if (!prev || Math.hypot(q1[0] - prev[0], q1[1] - prev[1]) > 0.15)
        out.push([+q1[0].toFixed(1), +q1[1].toFixed(1)]);
      out.push([+q2[0].toFixed(1), +q2[1].toFixed(1)]);
    } else {
      out.push([+(poly[i][0] + mx * ideal).toFixed(1), +(poly[i][1] + mz * ideal).toFixed(1)]);
    }`;
const oldLoop = `    const dotP = Math.max(0.35, mx * np[0] + mz * np[1]);
    const dotC = Math.max(0.35, mx * nc[0] + mz * nc[1]);
    const len = Math.min(dp / dotP, dc / dotC, 2.5 * Math.max(dp, dc));
    out.push([+(poly[i][0] + mx * len).toFixed(1), +(poly[i][1] + mz * len).toFixed(1)]);`;
if (!s.includes(newLoop)) { console.log('spike-bevel loop not found (already reverted?)'); process.exit(1); }
s = s.replace(newLoop, oldLoop);
fs.writeFileSync(f, s);
console.log('reverted');
