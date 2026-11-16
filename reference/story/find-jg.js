// jg side-mission table: shape + a complete small example
import fs from 'fs';
const s = fs.readFileSync('vendor/game.js', 'utf8');
const i = s.indexOf('jg=[');
console.log('jg @', i);
// find the first complete entry: from jg=[ to the second `run(` ... print 2500 chars
console.log(JSON.stringify(s.slice(i, i + 2600)));
