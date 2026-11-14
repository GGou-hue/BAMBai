// find traffic spawn kind selection
const fs = require('fs');
const g = fs.readFileSync('vendor/game.js', 'utf8');
let i = -1, n = 0;
while ((i = g.indexOf('spawnVehicle(', i + 1)) >= 0 && n < 30) {
  const ctx = g.slice(Math.max(0, i - 220), i + 120);
  if (/G\(|kind|mix|pick|weight/i.test(ctx)) {
    console.log('--- @' + i);
    console.log(JSON.stringify(ctx));
    n++;
  }
}
