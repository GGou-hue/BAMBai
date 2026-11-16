import fs from 'fs';
const s = fs.readFileSync('vendor/map.js', 'utf8');
const i = s.indexOf('PLACES={');
const seg = s.slice(i, i + 4000);
const keys = [...seg.matchAll(/([a-zA-Z0-9_]+):\{x:/g)].map((x) => x[1]);
console.log('PLACES keys:', keys.join(', '));
