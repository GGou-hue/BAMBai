// find mission completion: .next mutations
import fs from 'fs';
const s = fs.readFileSync('vendor/game.js', 'utf8');
const re = /\.next(\+\+|\+=|=)/g;
let m, n = 0;
while ((m = re.exec(s)) && n < 14) {
  console.log('@', m.index, m[0], ':', JSON.stringify(s.slice(Math.max(0, m.index - 120), m.index + 90)).slice(0, 210));
  n++;
}
