const fs = require('fs');
const s = fs.readFileSync('vendor/map.js', 'utf8');
const marks = ['St=[{kind', 'Ct=[{', 'wt=[{', 'Tt=[[',
  'for(let e of s)e.kind===`flyover`'];
for (const m of marks) console.log(JSON.stringify(m), s.indexOf(m));
const i = s.indexOf('St=[{kind');
console.log('St ctx:', JSON.stringify(s.slice(i - 120, i + 60)));
const j = s.indexOf('Tt=[[');
console.log('Tt ctx:', JSON.stringify(s.slice(j - 80, j + 100)));
const k = s.indexOf('for(let e of s)e.kind===`flyover`');
console.log('fly ctx:', JSON.stringify(s.slice(k - 60, k + 100)));
