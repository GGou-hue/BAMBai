// dump the NPC shout table and chatter table for the audit
const fs = require('fs');
const s = fs.readFileSync('vendor/npc.js', 'utf8');
// find the shout lines table: the cop lines ended with ]},en={delivery:[0,6]...
const i = s.indexOf('en={delivery:[0,6]');
console.log('--- table before en= (shout lines) ---');
console.log(JSON.stringify(s.slice(Math.max(0, i - 3200), i)));
console.log('--- chatter table ln={...} ---');
const j = s.indexOf('var ln={delhi:');
console.log(JSON.stringify(s.slice(j, j + 7000)));
