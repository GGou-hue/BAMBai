// story system class: persist() + save shape
import fs from 'fs';
const s = fs.readFileSync('vendor/game.js', 'utf8');
const re = /persist\(\)\{/g;
let m, n = 0;
while ((m = re.exec(s)) && n < 8) {
  console.log('@', m.index, ':', JSON.stringify(s.slice(m.index, m.index + 260)).slice(0, 260));
  n++;
}
