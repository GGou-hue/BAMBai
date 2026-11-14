// mission system: how save.next drives missions, and the mission table
import fs from 'fs';
const s = fs.readFileSync('vendor/game.js', 'utf8');
let i = -1, n = 0;
while ((i = s.indexOf('save.next', i + 1)) >= 0 && n < 10) {
  console.log('--- @', i, ':', JSON.stringify(s.slice(Math.max(0, i - 150), i + 180)).slice(0, 330));
  n++;
}
