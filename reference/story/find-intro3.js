// locate the enclosing async scene fn of the bus intro more carefully
import fs from 'fs';
const s = fs.readFileSync('vendor/game.js', 'utf8');
const i = s.indexOf('Gubbi → Bambai');
// scan backwards for 'async' markers
let j = i;
const marks = [];
for (let k = 0; k < 40; k++) {
  const a = s.lastIndexOf('async', j - 1);
  if (a < 0) break;
  marks.push(a);
  j = a;
}
for (const a of marks.slice(0, 6)) {
  console.log('@', a, ':', JSON.stringify(s.slice(a, a + 120)));
}
