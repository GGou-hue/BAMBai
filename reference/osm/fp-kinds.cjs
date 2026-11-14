// Extract footprint kind vocabulary from the original map.js f array.
const fs = require('fs');
const s = fs.readFileSync('_source/map.js', 'utf8');
const fStart = s.indexOf(',f=[[') + 4;
const pAt = s.indexOf(',p=[[');
const fTxt = s.slice(fStart, pAt);
const re = /\[`([a-z_0-9]+)`,-?[0-9.]+,-?[0-9.]+,/g;
const kinds = {}; let m, n = 0;
while ((m = re.exec(fTxt))) { kinds[m[1]] = (kinds[m[1]] || 0) + 1; n++; }
console.log('parsed', n, 'entries; kinds:', JSON.stringify(kinds));
// sample entries per kind
const seen = {};
for (const e of fTxt.slice(0, 4000).match(/\[`[a-z_0-9]+`,-?[0-9.]+,-?[0-9.]+,`[^\`]{0,80}/g) || []) {
  const k = e.match(/\[`([a-z_0-9]+)`/)[1];
  if (!seen[k]) { seen[k] = 1; console.log('sample:', e); }
}
