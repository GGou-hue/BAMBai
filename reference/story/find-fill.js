import fs from 'fs';
const s = fs.readFileSync('vendor/audio.js', 'utf8');
// find fill( definitions — the site density profiles
const re = /fill[:=(]\s*\(?[a-z]\)?\s*=>/g;
let m, n = 0;
while ((m = re.exec(s)) && n < 10) {
  console.log('@', m.index, ':', JSON.stringify(s.slice(m.index, m.index + 260)).slice(0, 260));
  n++;
}
console.log('total fill defs:', n);
