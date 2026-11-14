// record the visual audit results in art/index.json (items is an OBJECT map — mutate in place)
import fs from 'fs';
const idx = JSON.parse(fs.readFileSync('art/index.json', 'utf8'));
const sheets = JSON.parse(fs.readFileSync('reference/osm/sheet-keys.json', 'utf8'));
const cellKey = [];
for (const sh of sheets) for (const k of sh.keys) cellKey.push(k);

const BANGALORE_HINTS = [
  11,
  21, 22, 23, 24,
  27, 28, 33, 34, 37, 38, 39, 40, 41, 42,
  52, 54, 67, 68, 70, 71,
  79, 80, 81, 82, 107, 108, 109, 110,
  121, 122, 133, 134, 149, 150, 155, 156,
  183, 186, 191,
];
const stale = new Set(BANGALORE_HINTS.map(n => cellKey[n - 1]).filter(Boolean));
let nYes = 0, nStale = 0;
for (const [k, v] of Object.entries(idx.items)) {
  if (v.kannada === 'unreviewed') { v.kannada = 'yes'; nYes++; }
  if (stale.has(k) && !v.stale) { v.stale = 'bangalore'; nStale++; }
}
fs.writeFileSync('art/index.json', JSON.stringify(idx, null, 1));
console.log('updated: kannada=yes on', nYes, '| stale=bangalore on', nStale, '| unmapped stale cells:', [...stale].filter(k => !idx.items[k]).length);
