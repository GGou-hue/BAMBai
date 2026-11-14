// where is the cast table (er) used in game.js? word-boundary search
import fs from 'fs';
const s = fs.readFileSync('vendor/game.js', 'utf8');
const re = /(?<![A-Za-z0-9_$])er(?=[.\[])/g;
let m, n = 0;
while ((m = re.exec(s)) && n < 25) {
  console.log('@', m.index, ':', JSON.stringify(s.slice(m.index, m.index + 70)));
  n++;
}
console.log('total:', n);
