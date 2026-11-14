// find the traffic mix table (base kinds + weights)
const fs = require('fs');
const g = fs.readFileSync('vendor/game.js', 'utf8');
// traffic object: search for 'traffic' class with mixFor definition
let i = g.indexOf('mixFor(e)');
if (i < 0) i = g.indexOf('mixFor=');
console.log('mixFor def @', i);
if (i >= 0) console.log(JSON.stringify(g.slice(Math.max(0, i - 700), i + 200)));
