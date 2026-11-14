// Show the rest of ch2-tail after the follow: the gate reach + ending cutscene.
const fs = require('fs');
const s = fs.readFileSync('vendor/game.js', 'utf8');
const i = s.indexOf('id: `ch2-tail`');
const body = s.slice(i, i + 5200);
// print from the reach onward
const j = body.indexOf('await e.reach');
console.log(body.slice(j - 200, j + 2600).replace(/\n/g, ' '));
