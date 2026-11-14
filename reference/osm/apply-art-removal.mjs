// remove the 22 unpinned stale (bangalore-content) entries from art/index.json
import fs from 'fs';
const idx = JSON.parse(fs.readFileSync('art/index.json', 'utf8'));
const { remove } = JSON.parse(fs.readFileSync('reference/osm/art-removal-set.json', 'utf8'));
let n = 0;
for (const k of remove) {
  if (idx.items[k]) { delete idx.items[k]; n++; }
  else console.log('WARN: not found', k);
}
// rebuild byCat is runtime-side; index.json is the source of truth
fs.writeFileSync('art/index.json', JSON.stringify(idx, null, 1));
console.log('removed', n, 'entries; items now', Object.keys(idx.items).length);
