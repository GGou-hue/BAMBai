const fs = require('fs');
const s = fs.readFileSync('vendor/map.js', 'utf8');
// find the chain: var n=t([12.9215...
const a = s.indexOf('var n=t([12.9215');
const seg = s.slice(a, a + 400);
console.log('chain start:', JSON.stringify(seg));
// find `,v=` within the chain region and show what v is
const chainEnd = s.indexOf(',T=.15,', a);
const chain = s.slice(a, chainEnd);
const parts = chain.split(',');
for (let i = 0; i < parts.length; i++) {
  if (/^v=/.test(parts[i])) console.log('v part:', JSON.stringify(parts[i].slice(0, 80)));
  if (/^y=/.test(parts[i])) console.log('y part:', JSON.stringify(parts[i].slice(0, 80)));
}
// find function R definition
const rIdx = s.indexOf('function R(');
console.log('function R( at', rIdx, rIdx > 0 ? JSON.stringify(s.slice(rIdx, rIdx + 300)) : '');
const rIdx2 = s.indexOf('R=(');
console.log('R=( at', rIdx2, rIdx2 > 0 ? JSON.stringify(s.slice(rIdx2 - 60, rIdx2 + 300)) : '');
