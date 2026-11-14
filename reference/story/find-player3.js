// find 'arjun' occurrences in game.js — player model selection
import fs from 'fs';
const s = fs.readFileSync('vendor/game.js', 'utf8');
let i = -1, n = 0;
while ((i = s.indexOf('arjun', i + 1)) >= 0 && n < 15) {
  console.log('@', i, ':', JSON.stringify(s.slice(Math.max(0, i - 120), i + 80)));
  n++;
}
console.log('total:', n);
