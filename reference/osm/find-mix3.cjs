// find the traffic system's base mix table
const fs = require('fs');
const g = fs.readFileSync('vendor/game.js', 'utf8');
// search for 'mixFor' definitions (the original one in the traffic class)
let i = -1;
while ((i = g.indexOf('mixFor', i + 1)) >= 0) {
  console.log('--- @' + i);
  console.log(JSON.stringify(g.slice(Math.max(0, i - 100), i + 260)));
}
