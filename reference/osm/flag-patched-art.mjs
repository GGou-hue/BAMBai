// update index flags for the 18 patched pinned assets
import fs from 'fs';
const idx = JSON.parse(fs.readFileSync('art/index.json', 'utf8'));
const keys = ['SHOP-01','SHOP-01_2','SHOP-02','SHOP-02_2','SHOP-15','SHOP-15_2','SHOP-16','SHOP-16_2','SHOP-22','SHOP-22_2','SHOP-28','SHOP-28_2','SHOP-36','SHOP-36_2','SHOP-39','SHOP-39_2','BLR-BAR-01','HRD-11'];
let n = 0;
for (const k of keys) {
  const it = idx.items[k];
  if (!it) { console.log('MISSING', k); continue; }
  it.kannada = 'devanagari';
  delete it.stale;
  it.patched = 'mumbai-text';
  n++;
}
fs.writeFileSync('art/index.json', JSON.stringify(idx, null, 1));
console.log('updated', n, 'entries');
const left = Object.values(idx.items).filter((i) => i.stale === 'bangalore').length;
console.log('remaining stale:"bangalore":', left);
