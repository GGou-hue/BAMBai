import fs from 'fs';
const s = fs.readFileSync('vendor/game.js', 'utf8');
function mod(idx) {
  const start = s.lastIndexOf('import{', idx);
  const q = s.indexOf('"', start + 7);
  return s.slice(q + 1, s.indexOf('"', q + 1));
}
function binding(local) {
  const re = new RegExp('([a-zA-Z_$][a-zA-Z0-9_$]*) as ' + local + '[,}]');
  const m = re.exec(s);
  if (!m) return 'none';
  return m[1] + ' from ' + mod(m.index);
}
for (const l of ['bn', 'yr', 'Wr', 'Kr', 'ln', 'Ur']) console.log(l, '<=', binding(l));
