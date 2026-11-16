import fs from 'fs';
const s = fs.readFileSync('vendor/game.js', 'utf8');
// find ha definition (loading progress fn) and c definition (phase marker)
for (const pat of ['ha=', 'ha =']) {
  let i = -1;
  while ((i = s.indexOf(pat, i + 1)) >= 0) {
    const ctx = s.slice(i, i + 160);
    if (/ha=\(/.test(ctx)) { console.log('ha @' + i + ':', JSON.stringify(ctx).slice(0, 160)); }
  }
}
// c is likely a closure; find "c=e=>" patterns
let i = -1, n = 0;
while ((i = s.indexOf('c=e=>', i + 1)) >= 0 && n < 8) { console.log('c= @' + i + ':', JSON.stringify(s.slice(i, i + 150)).slice(0, 150)); n++; }
