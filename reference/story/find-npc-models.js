import fs from 'fs';
const s = fs.readFileSync('vendor/game.js', 'utf8');
const re = /e\.npc\(`([a-z0-9-]+)`/g;
let m;
const set = new Set();
while ((m = re.exec(s))) set.add(m[1]);
console.log('npc models used:', [...set].join(', '));
console.log('fmTowerKoliwada in game.js:', s.includes('fmTowerKoliwada'));
// verify the tower place exists in the map F table
const map = fs.readFileSync('vendor/map.js', 'utf8');
console.log('fmTowerKoliwada in map.js:', map.includes('fmTowerKoliwada'));
