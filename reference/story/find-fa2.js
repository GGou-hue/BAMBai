// find the DEFINITION of fa (var fa= / function fa)
import fs from 'fs';
const s = fs.readFileSync('vendor/game.js', 'utf8');
const re = /(?:function fa\b|[,;}]fa=|var fa=)/g;
let m;
while ((m = re.exec(s))) console.log('@', m.index, ':', JSON.stringify(s.slice(m.index, m.index + 420)).slice(0, 420));
if (!m) {
  // maybe imported
  const imp = s.match(/import\{[^}]*\bfa as ([\w$]+)/);
  console.log('imported as:', imp && imp[1]);
  const i = s.indexOf('fa,');
  console.log('fa, @', i, JSON.stringify(s.slice(Math.max(0, i - 200), i + 60)));
}
