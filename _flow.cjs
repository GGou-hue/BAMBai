// Inspect the story offer/begin/offerNext flow in vendor/game.js
const fs = require('fs');
const s = fs.readFileSync('vendor/game.js', 'utf8');
function show(label, needle, ctx = 700) {
  const i = s.indexOf(needle);
  console.log('=== ' + label + ' @' + i + ' ===');
  if (i < 0) { console.log('not found\n'); return; }
  console.log(s.slice(Math.max(0, i - 60), i + ctx).replace(/\n/g, ' '));
  console.log();
}
show('begin()', 'begin(){', 900);
show('offerNext', 'offerNext(', 900);
// find the class field declarations for offers
const j = s.indexOf('offers=[]');
console.log('=== offers field @' + j + ' ===\n' + s.slice(j - 200, j + 300).replace(/\n/g, ' '));