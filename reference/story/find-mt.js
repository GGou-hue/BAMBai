// Mt in menus.js — the save serializer
import fs from 'fs';
const mod = fs.readFileSync('vendor/menus.js', 'utf8');
const re = /(?:function Mt\b|[,;}])Mt=/g;
let m;
while ((m = re.exec(mod))) console.log('@', m.index, ':', JSON.stringify(mod.slice(m.index, m.index + 500)).slice(0, 500));
if (!m) {
  const imp = mod.match(/import\{[^}]*\bMt as ([\w$]+)/);
  console.log('Mt imported as:', imp && imp[1]);
}
