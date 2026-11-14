// who calls ig( — the intro/new-game function
import fs from 'fs';
const s = fs.readFileSync('vendor/game.js', 'utf8');
const re = /(?<![A-Za-z0-9_$])ig\(/g;
let m, n = 0;
while ((m = re.exec(s)) && n < 12) {
  console.log('@', m.index, ':', JSON.stringify(s.slice(Math.max(0, m.index - 130), m.index + 60)).slice(0, 200));
  n++;
}
