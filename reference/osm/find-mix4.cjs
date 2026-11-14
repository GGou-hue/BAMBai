// find traffic class mixFor(e){ method
const fs = require('fs');
const g = fs.readFileSync('vendor/game.js', 'utf8');
let i = -1;
while ((i = g.indexOf('mixFor(e)', i + 1)) >= 0) {
  console.log('--- @' + i);
  console.log(JSON.stringify(g.slice(Math.max(0, i - 400), i + 500)));
}
