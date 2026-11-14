// inspect spawn lists and bus name context in vehicles.js
import fs from 'fs';
const s = fs.readFileSync('vendor/vehicles.js', 'utf8');
const i = s.indexOf('`motorbike`,`policeBike`');
console.log('list1:', JSON.stringify(s.slice(i - 320, i + 320)));
const j = s.indexOf('hatchback:`Chotu');
console.log('ln:', JSON.stringify(s.slice(j - 120, j + 500)));
// how are vehicles spawned: search for a weights table
const k = s.indexOf('weights');
console.log('weights at', k, JSON.stringify(s.slice(k - 100, k + 300)));
