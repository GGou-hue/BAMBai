// verification contact sheet for the 18 patched pinned assets
import fs from 'fs';
const keys = ['SHOP-01','SHOP-01_2','SHOP-02','SHOP-02_2','SHOP-15','SHOP-15_2','SHOP-16','SHOP-16_2','SHOP-22','SHOP-22_2','SHOP-28','SHOP-28_2','SHOP-36','SHOP-36_2','SHOP-39','SHOP-39_2','BLR-BAR-01','HRD-11'];
const idx = JSON.parse(fs.readFileSync('art/index.json', 'utf8'));
let cells = '';
keys.forEach((k, i) => {
  const it = idx.items[k];
  if (!it) { console.log('MISSING', k); return; }
  cells += `<div style="display:inline-block;margin:4px;text-align:center"><img src="${it.url}" style="width:360px;display:block;border:1px solid #999"><b>${i + 1}: ${k}</b></div>`;
});
fs.writeFileSync('sheet-patched.html', `<body style="background:#222;color:#fff">${cells}</body>`);
console.log('sheet written,', keys.length, 'cells');
