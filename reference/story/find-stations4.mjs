// the radio UI: find where stations are defined — search vendor files for station name arrays
import fs from 'fs';
for (const f of fs.readdirSync('vendor').filter((f) => f.endsWith('.js'))) {
  const s = fs.readFileSync('vendor/' + f, 'utf8');
  // look for arrays of objects with a name-ish and number-ish field (radio dial)
  const m = [...s.matchAll(/\{[^{}]*?name:`([^`]{2,36})`[^{}]*?(\d{2,3}(?:\.\d)?)[^{}]*?\}/g)];
  if (m.length > 3) {
    console.log('==', f, m.length, 'candidate station objects');
    m.slice(0, 14).forEach((x) => console.log('  ', JSON.stringify(x[1]), x[2]));
  }
}
