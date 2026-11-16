import fs from 'fs';
const s = fs.readFileSync('vendor/game.js', 'utf8');
// Re used as Re(hour,rain,q) — find its call sites and any '=>' definition
const re = /Re\(/g;
let m, n = 0;
while ((m = re.exec(s)) && n < 6) {
  const before = s.slice(Math.max(0, m.index - 60), m.index);
  console.log('@', m.index, JSON.stringify(before) + ' >>> ' + JSON.stringify(s.slice(m.index, m.index + 150)).slice(0, 200));
  n++;
}
// definition candidates: 'Re=' preceded by non-identifier
const d = s.search(/[,;{]Re=/);
console.log('def @', d, d >= 0 ? JSON.stringify(s.slice(d, d + 700)).slice(0, 700) : 'none in game.js');
