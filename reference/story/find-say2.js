// find say( definitions (method shorthand in object literals)
import fs from 'fs';
const s = fs.readFileSync('vendor/game.js', 'utf8');
const re = /(?<![A-Za-z0-9_$])say\(/g;
let m, n = 0;
const defs = [];
while ((m = re.exec(s))) {
  const before = s.slice(Math.max(0, m.index - 12), m.index);
  if (/async|\{|\n/.test(before)) {
    if (n < 8) console.log('--- @', m.index, JSON.stringify(before) + JSON.stringify(s.slice(m.index, m.index + 380)).slice(0, 380));
    n++;
  }
}
console.log('candidates:', n);
