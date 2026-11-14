// find the radio station table in game.js
import fs from 'fs';
const s = fs.readFileSync('vendor/game.js', 'utf8');
const i = s.indexOf('tuneRadio');
const seg = s.slice(Math.max(0, i - 4000), i + 200);
const m = [...seg.matchAll(/name:`([^`]+)`/g)];
console.log('station names near tuneRadio:');
m.forEach((x) => console.log(' ', JSON.stringify(x[1])));
// fallback: any backtick string containing digits+MHz-ish or known patterns
const m2 = [...seg.matchAll(/`([^`]{3,40})`/g)].filter((x) => /fm|radio|gaan|indie|dark|hustle/i.test(x[1]));
[...new Set(m2.map((x) => x[1]))].slice(0, 20).forEach((v) => console.log('alt:', JSON.stringify(v)));
