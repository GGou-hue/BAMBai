import fs from 'fs';
const s = fs.readFileSync('vendor/city.js', 'utf8');
// Ge is referenced in probe-anchors as the side-ranking; find its definition pattern
for (const pat of ['Ge=', 'Ge =', 'function Ge']) {
  const i = s.indexOf(pat);
  if (i >= 0) { console.log(pat, '@', i, ':', JSON.stringify(s.slice(i, i + 700)).slice(0, 700)); break; }
}
