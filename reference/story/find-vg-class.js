// the Vg story class: save shape + persist + restore
import fs from 'fs';
const s = fs.readFileSync('vendor/game.js', 'utf8');
const re = /class Vg|Vg=class|function Vg/ ;
const m = re.exec(s);
console.log('Vg def @', m && m.index);
if (m) {
  console.log(JSON.stringify(s.slice(m.index, m.index + 1400)));
}
