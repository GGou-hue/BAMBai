// Show drum-screen.js texture-label helper functions and check for other stray identifiers.
const fs = require('fs');
const s = fs.readFileSync('vendor/drum-screen.js', 'utf8');
const i = s.indexOf('varm(');
console.log('=== context (900 chars) ===');
console.log(s.slice(Math.max(0, i - 900), i + 400));
console.log('\n=== helper defs ===');
for (const name of ['function b(', 'function m(', 'b=', 'm=']) {
  let j = s.indexOf(name);
  while (j !== -1 && j < i) {
    console.log(name + ' @' + j + ': ' + s.slice(j, j + 220).replace(/\n/g, ' '));
    j = s.indexOf(name, j + 1);
  }
}
console.log('\n=== all call sites of b( and m( with 4+ args ===');
for (const re of [/\bb\(e,[^;]{0,90}\)/g, /\bm\(e,[^;]{0,90}\)/g]) {
  let m;
  while ((m = re.exec(s))) console.log(m[0].slice(0, 110));
}
