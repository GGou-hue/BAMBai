// story manager class: find its save/persist/restore
import fs from 'fs';
const s = fs.readFileSync('vendor/game.js', 'utf8');
const i = s.indexOf('qx=');
console.log('qx @', i, ':', JSON.stringify(s.slice(i, i + 80)));
// find the story manager: search 'story=' assignments and class with opened/persist
const re = /story=(new [A-Za-z_$][\w$]+)/g;
let m;
while ((m = re.exec(s))) console.log('story= @', m.index, ':', m[1]);
// find persist near 'opened'
let j = s.indexOf('opened:');
console.log('opened: @', j, ':', JSON.stringify(s.slice(Math.max(0, j - 200), j + 200)).slice(0, 380));
