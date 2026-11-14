// find the ambient traffic kind mix (weights table)
const fs = require('fs');
const g = fs.readFileSync('vendor/game.js', 'utf8');
// look for a weights-like object with vehicle kinds and numbers
const re = /\{[^{}]*`auto`[^{}]*\}/g;
let m, n = 0;
while ((m = re.exec(g)) && n < 20) {
  const frag = m[0];
  if (/:\s*[\d.]+/.test(frag) && frag.length < 500) {
    console.log('--- @' + m.index);
    console.log(JSON.stringify(g.slice(Math.max(0, m.index - 180), m.index + frag.length + 100)));
    n++;
  }
}
