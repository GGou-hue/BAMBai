// locate the station list: search whole game.js for frequency-like numbers with names
import fs from 'fs';
const s = fs.readFileSync('vendor/game.js', 'utf8');
// stations likely: [{...name...}] with .freq or 93.5-style numbers
for (const pat of ['stations', 'STATIONS', 'freq', '935', '91.1', '98.3', 'dial']) {
  let i = s.indexOf(pat);
  let n = 0;
  while (i >= 0 && n < 3) {
    console.log(pat, '@', i, ':', JSON.stringify(s.slice(Math.max(0, i - 120), i + 200)).slice(0, 300));
    i = s.indexOf(pat, i + 1); n++;
  }
}
