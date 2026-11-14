// all `bus` kind-string occurrences in game.js with context
const fs = require('fs');
const g = fs.readFileSync('vendor/game.js', 'utf8');
let i = -1, n = 0;
while ((i = g.indexOf('`bus`', i + 1)) >= 0) {
  console.log('--- @' + i);
  console.log(JSON.stringify(g.slice(Math.max(0, i - 130), i + 90)));
  if (++n > 25) break;
}
