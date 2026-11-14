// fa: the save serializer (word-boundary search)
import fs from 'fs';
const s = fs.readFileSync('vendor/game.js', 'utf8');
const re = /(?<![A-Za-z0-9_$])fa(?=[=(])/g;
let m, n = 0;
while ((m = re.exec(s)) && n < 8) {
  console.log('@', m.index, ':', JSON.stringify(s.slice(m.index, m.index + 300)).slice(0, 300));
  n++;
}
