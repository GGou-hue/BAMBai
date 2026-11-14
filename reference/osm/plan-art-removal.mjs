// removal set: unpinned stale entries, keeping day/night pairs coherent
import fs from 'fs';
const idx = JSON.parse(fs.readFileSync('art/index.json', 'utf8'));
const stale = Object.keys(idx.items).filter(k => idx.items[k].stale === 'bangalore');
// pinned keys (from find-pinned-art run)
const pinned = new Set(['BLR-BAR-01', 'SHOP-01', 'SHOP-02', 'SHOP-15', 'SHOP-16', 'SHOP-22', 'SHOP-28', 'SHOP-36', 'SHOP-39', 'HRD-11']);
// pair partner: KEY_2 <-> KEY (strip/add _2)
const partner = k => k.endsWith('_2') ? k.slice(0, -2) : k + '_2';
const remove = [], keepPinned = [], keepPair = [];
for (const k of stale) {
  if (pinned.has(k)) { keepPinned.push(k); continue; }
  if (pinned.has(partner(k))) { keepPair.push(k); continue; } // night variant of a pinned day sign
  remove.push(k);
}
console.log('remove (' + remove.length + '):', remove.join(', '));
console.log('keep-pinned (' + keepPinned.length + '):', keepPinned.join(', '));
console.log('keep-pair-of-pinned (' + keepPair.length + '):', keepPair.join(', '));
fs.writeFileSync('reference/osm/art-removal-set.json', JSON.stringify({ remove, keepPinned, keepPair }, null, 1));
