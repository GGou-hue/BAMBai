const fs = require('fs');
const s = fs.readFileSync('C:/Users/User4/Downloads/BAMBai/vendor/library.js', 'utf8');
const i = s.indexOf('export{');
const exp = s.slice(i, s.indexOf('}', i) + 1);
for (const m of exp.matchAll(/([A-Za-z0-9_$]+)\s+as\s+d\b/g)) console.log('exported as d -> local name:', m[1]);
const i2 = s.indexOf('preload');
console.log('preload occurrences:');
let j = -1;
while ((j = s.indexOf('preload', j + 1)) >= 0 && j < s.length) { console.log('@' + j + ': ' + s.slice(Math.max(0, j - 120), j + 120)); if (j > i) break; }
