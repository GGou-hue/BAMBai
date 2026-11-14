// find how the full game signals boot completion / menu state
const fs = require('fs');
const s = fs.readFileSync('vendor/game.js', 'utf8');
let i = -1, n = 0;
while ((i = s.indexOf('boot', i + 1)) >= 0 && n < 15) {
  const ctx = s.slice(Math.max(0, i - 60), i + 80);
  if (/classList|getElementById|#boot/.test(ctx)) { console.log('--- @' + i); console.log(JSON.stringify(ctx)); n++; }
}
// menu state: does the game open with a menu?
const j = s.indexOf('menu');
console.log('menu first @', j, JSON.stringify(s.slice(j - 80, j + 120)));
