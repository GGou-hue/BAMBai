// find the intro (bus / Gubbi) sequence in game.js
import fs from 'fs';
const s = fs.readFileSync('vendor/game.js', 'utf8');
for (const k of ['Gubbi', 'First bus', 'nu-play', 'nu-intro', 'intro']) {
  let i = -1, n = 0;
  while ((i = s.indexOf(k, i + 1)) >= 0 && n < 4) {
    console.log('---', k, '@', i, ':', JSON.stringify(s.slice(Math.max(0, i - 150), i + 150)).slice(0, 300));
    n++;
  }
}
