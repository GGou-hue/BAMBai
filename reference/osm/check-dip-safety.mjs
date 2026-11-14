// static safety: is the re-activated dip near spawns / mission anchors / key PLACES?
import fs from 'fs';
const dump = JSON.parse(fs.readFileSync('reference/osm/mumbai/dump-mumbai.json', 'utf8'));
const dip = { x: -199, z: 596, r: 45 }; // trench area (chain bbox + margin)
const near = (x, z) => Math.hypot(x - dip.x, z - dip.z) < dip.r + 20;
console.log('PLACES near the dip:');
const entries = Object.entries(dump.places || {});
for (const [k, p] of entries) {
  if (typeof p?.x === 'number' && near(p.x, p.z)) console.log(' ', k, JSON.stringify(p).slice(0, 120));
}
console.log('total places:', entries.length);
// mission anchors: probe-anchors.mjs knows them; read its source for the anchor list
const pa = fs.readFileSync('reference/osm/probe-anchors.mjs', 'utf8');
const m = pa.match(/anchors\s*=\s*(\[[\s\S]*?\]);/);
if (m) {
  let anchors;
  try { anchors = JSON.parse(m[1].replace(/`/g, '"')); } catch { anchors = null; }
  if (anchors) {
    console.log('anchors near the dip:');
    for (const a of anchors) {
      const ax = a.x ?? a[0], az = a.z ?? a[1];
      if (near(ax, az)) console.log(' ', JSON.stringify(a).slice(0, 120));
    }
  } else console.log('(anchors not plain JSON in probe-anchors.mjs — check manually)');
}
// player spawn: search dump/other files for spawn coords
console.log('dump keys:', Object.keys(dump).join(','));
