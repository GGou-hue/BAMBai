// Which anchor roads are renamed (i.e. would W(road) fail if anchors use pre-rename names)?
import fs from 'fs';
const s = fs.readFileSync('reference/osm/osm2map-stage4.mjs', 'utf8');
// extract RENAMES keys
const rStart = s.indexOf('const RENAMES = {');
const rEnd = s.indexOf('};', rStart);
const ren = s.slice(rStart, rEnd);
const keys = [...ren.matchAll(/'([^']+)':/g)].map((m) => m[1]);
// extract anchor roads
const anchors = [...s.matchAll(/(\w+): \{ lat: [\d.]+, lon: [\d.]+, road: `([^`]+)`/g)];
for (const [, id, road] of anchors) {
  if (keys.includes(road)) console.log('RENAMED road used by anchor', id, ':', road);
}
console.log('total anchors:', anchors.length, 'renames:', keys.length);
// is Marine Lines Flyover / P D Mello Road in names list?
const S1 = JSON.parse(fs.readFileSync('reference/osm/mumbai/stage1.json', 'utf8'));
for (const r of ['Marine Lines Flyover', 'P D Mello Road', "P D' Mello Road"]) console.log(r, '->', S1.names.includes(r));
