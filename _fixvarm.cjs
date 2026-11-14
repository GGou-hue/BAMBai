// Fix the upstream 'varm(' typo -> 'm(' in drum-screen.js (both vendor and _source).
const fs = require('fs');
for (const f of ['vendor/drum-screen.js', '_source/drum-screen.js']) {
  let s = fs.readFileSync(f, 'utf8');
  const before = (s.match(/\bvarm\(/g) ?? []).length;
  if (!before) { console.log(f, ': no varm( found'); continue; }
  s = s.replace(/\bvarm\(/g, 'm(');
  fs.writeFileSync(f, s);
  console.log(f, ': replaced', before, 'occurrence(s)');
}
