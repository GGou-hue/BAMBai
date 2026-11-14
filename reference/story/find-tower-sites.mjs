// find roads near target lat/lon for new anchors (Mother Tower north edge, Koliwada mast near creek)
import fs from 'fs';
const S1 = JSON.parse(fs.readFileSync('reference/osm/mumbai/stage1.json', 'utf8'));
const { LAT0, LON0, scale } = S1;
const U = 111320 * Math.cos(LAT0 * Math.PI / 180);
const toXY = (lat, lon) => [+( (lon - LON0) * U * scale ).toFixed(1), +( (LAT0 - lat) * 110540 * scale ).toFixed(1)];
// map z = (LAT0-lat)*... so north (bigger lat) = negative z? check: bounds minX -919 maxX 874, minZ -2135 maxZ 1398
// test a known anchor: santhe 18.9392,72.8330
console.log('santhe xy:', JSON.stringify(toXY(18.9392, 72.8330)), '(dump places santhe should match)');
const targets = [
  ['mother-tower N edge', 18.9440, 72.8230],
  ['mother-tower N edge B', 18.9430, 72.8250],
  ['koliwada creek', 18.9420, 72.8380],
  ['koliwada creek B', 18.9400, 72.8400],
];
for (const [name, lat, lon] of targets) console.log(name, JSON.stringify(toXY(lat, lon)));
// edges near each target: edge [a,b,c,d,nameIdx,w,f?]
const names = S1.names;
function near(x, z, r = 120) {
  const out = new Map();
  for (const e of S1.edges) {
    const a = S1.nodes[e[0]], b = S1.nodes[e[1]];
    const mx = (a[0] + b[0]) / 2, mz = (a[1] + b[1]) / 2;
    if (Math.hypot(mx - x, mz - z) < r) {
      const nm = names[e[3]] || '(unnamed)';
      out.set(nm, (out.get(nm) || 0) + 1);
    }
  }
  return [...out.entries()].sort((p, q) => q[1] - p[1]).slice(0, 5);
}
for (const [name, lat, lon] of targets) {
  const [x, z] = toXY(lat, lon);
  console.log(name, '->', JSON.stringify(near(x, z)));
}
