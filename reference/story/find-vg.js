// the linear mission table vg: shape + size + ids
import fs from 'fs';
const s = fs.readFileSync('vendor/game.js', 'utf8');
const i = s.indexOf('vg=[');
console.log('vg @', i);
console.log(JSON.stringify(s.slice(i, i + 900)));
// count mission entries: vg entries look like {id:`...`,title:...,
const seg = s.slice(i, i + 200000);
const ids = [...seg.matchAll(/id:`([a-z0-9-]+)`,title:/g)];
console.log('mission count:', ids.length);
console.log('ids:', ids.map((x) => x[1]).join(' | '));
