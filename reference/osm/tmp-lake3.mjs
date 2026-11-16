import fs from 'fs';
const s = fs.readFileSync('vendor/map.js', 'utf8');
// find where Y is assembled: Ye(ut(u,1.25),V) — find ut/u/V definitions
const i = s.indexOf('var Y=Ye(ut(u,1.25),V)');
console.log(JSON.stringify(s.slice(i - 1500, i + 80)));
