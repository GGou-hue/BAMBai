// what encloses/triggers the bus intro?
import fs from 'fs';
const s = fs.readFileSync('vendor/game.js', 'utf8');
const i = s.indexOf('Gubbi → Bambai');
// walk back to find the enclosing function name
const seg = s.slice(Math.max(0, i - 3000), i);
const m = [...seg.matchAll(/function ([A-Za-z_$][\w$]*)\(|(?:var|,|;)([A-Za-z_$][\w$]*)=\s*(?:async\s*)?\(/g)];
console.log('last defs before intro:', JSON.stringify(m.slice(-4).map((x) => x[1] || x[2])));
// find where that function is called
const name = m.length ? (m[m.length - 1][1] || m[m.length - 1][2]) : null;
console.log('candidate fn:', name);
if (name) {
  let j = -1, n = 0;
  while ((j = s.indexOf(name, j + 1)) >= 0 && n < 10) {
    console.log('ref @', j, ':', JSON.stringify(s.slice(Math.max(0, j - 100), j + 120)).slice(0, 220));
    n++;
  }
}
