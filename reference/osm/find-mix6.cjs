// find consumers of mixFor and the base table
const fs = require('fs');
const g = fs.readFileSync('vendor/game.js', 'utf8');
const re = /mixFor\s*\(/g;
let m;
while ((m = re.exec(g))) {
  console.log('--- @' + m.index);
  console.log(JSON.stringify(g.slice(Math.max(0, m.index - 260), m.index + 240)));
}
