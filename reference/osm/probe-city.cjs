// Probe reference/city.json: print shape of every top-level key.
const fs = require('fs');
const j = JSON.parse(fs.readFileSync('reference/city.json', 'utf8'));
const desc = (v, d = 0) => {
  if (d > 3) return '…';
  if (Array.isArray(v)) {
    if (v.length === 0) return '[]';
    return `[${v.length}× ${desc(v[0], d + 1)}]`;
  }
  if (v && typeof v === 'object') {
    const keys = Object.keys(v);
    return `{${keys.slice(0, 12).map(k => `${k}:${desc(v[k], d + 1)}`).join(', ')}${keys.length > 12 ? ', …' : ''}}`;
  }
  return JSON.stringify(v);
};
for (const k of Object.keys(j)) {
  const v = j[k];
  const kind = Array.isArray(v) ? `array[${v.length}]` : typeof v;
  console.log(`\n=== ${k} (${kind})`);
  console.log(desc(v).slice(0, 1500));
}
