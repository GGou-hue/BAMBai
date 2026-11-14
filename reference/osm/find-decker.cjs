// find all decker occurrences in vendor/game.js with context
const fs = require('fs');
const s = fs.readFileSync('vendor/game.js', 'utf8');
let i = -1;
while ((i = s.indexOf('decker', i + 1)) >= 0) {
  console.log('--- @' + i);
  console.log(JSON.stringify(s.slice(Math.max(0, i - 110), i + 110)));
}
