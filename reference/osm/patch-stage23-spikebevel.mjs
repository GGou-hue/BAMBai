// stage23: bevel only spike vertices in insetPoly (keep full building-line distances),
// remove the failed whole-polygon bevel tier
import fs from 'fs';
const f = 'reference/osm/osm2map-stage23.mjs';
let s = fs.readFileSync(f, 'utf8');

// 1. remove the insetBevel function block and its ladder line
const fnStart = s.indexOf('// beveled vertex offset at the same distances');
const fnEnd = s.indexOf('// map each graph edge (by node pair) to its road width');
if (fnStart < 0 || fnEnd < 0) { console.log('bevel block not found'); process.exit(1); }
s = s.slice(0, fnStart) + s.slice(fnEnd);
s = s.replace("if (!insetOk(out)) { out = insetBevel(poly, 1); tag = 0.5; insetFalls++; }\n  ", '');
s = s.replace('let tierFull = 0, tierB = 0, tier6 = 0, tier35 = 0, tierU = 0;',
  'let tierFull = 0, tier6 = 0, tier35 = 0, tierU = 0;');
s = s.replace('if (tag === 0) tierFull++; else if (tag === 0.5) tierB++; else if (tag === 1) tier6++;',
  'if (tag === 0) tierFull++; else if (tag === 1) tier6++;');
s = s.replace('full=${tierFull} bevel=${tierB} 60%=${tier6}', 'full=${tierFull} 60%=${tier6}');
s = s.replace('let nidMiss = 0;\n', '');
s = s.replace(' { nidMiss++; return', ' return');
s = s.replace("return '?'; }", "return '?';");
s = s.replace('console.log(`nid misses: ${nidMiss}`);\n', '');

// 2. spike-bevel inside insetPoly
const oldLoop = `    const dotP = Math.max(0.35, mx * np[0] + mz * np[1]);
    const dotC = Math.max(0.35, mx * nc[0] + mz * nc[1]);
    const len = Math.min(dp / dotP, dc / dotC, 2.5 * Math.max(dp, dc));
    out.push([+(poly[i][0] + mx * len).toFixed(1), +(poly[i][1] + mz * len).toFixed(1)]);`;
if (!s.includes(oldLoop)) { console.log('insetPoly loop not found'); process.exit(1); }
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
s = s.replace(oldLoop, newLoop);
fs.writeFileSync(f, s);
console.log('patched insetPoly spike-bevel');
