// hud.js: Koramangala Transit Hub -> Bambai Transit Hub
import fs from 'fs';
for (const f of ['vendor/hud.js', '_source/hud.js']) {
  let s = fs.readFileSync(f, 'utf8');
  s = s.split('`Koramangala Transit Hub`').join('`Bambai Transit Hub`');
  fs.writeFileSync(f, s);
  console.log(f, 'Koramangala left:', (s.match(/Koramangala/g) || []).length);
}
