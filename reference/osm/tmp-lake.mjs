import fs from 'fs';
const s = fs.readFileSync('vendor/map.js', 'utf8');
// locate LAKE definition and print it
const i = s.indexOf('LAKE');
console.log('first LAKE @', i);
console.log(JSON.stringify(s.slice(i - 200, i + 600)).slice(0, 800));
// count occurrences
console.log('occurrences:', (s.match(/LAKE/g) || []).length);
