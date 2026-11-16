import fs from 'fs';
const s = fs.readFileSync('vendor/audio.js', 'utf8');
const re = /qr\(/g;
let m, n = 0;
while ((m = re.exec(s)) && n < 8) {
  console.log('@', m.index, ':', JSON.stringify(s.slice(Math.max(0, m.index - 120), m.index + 120)).slice(0, 240));
  n++;
}
