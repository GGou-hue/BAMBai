// Locate 'varm' in the vendored bundles and surrounding context.
const fs = require('fs');
const path = require('path');
const files = fs.readdirSync('vendor').filter((f) => f.endsWith('.js'));
for (const f of files) {
  const s = fs.readFileSync(path.join('vendor', f), 'utf8');
  let i = s.indexOf('varm');
  while (i !== -1) {
    const before = s.slice(Math.max(0, i - 160), i);
    const after = s.slice(i, i + 120);
    // skip "varm" that is part of a longer identifier
    const prevCh = s[i - 1] ?? '';
    const nextCh = s[i + 4] ?? '';
    if (!/[\w$]/.test(prevCh) && !/[\w$]/.test(nextCh)) {
      console.log(`--- ${f} @${i}`);
      console.log('BEFORE:', before.replace(/\n/g, ' '));
      console.log('AFTER :', after.replace(/\n/g, ' '));
    }
    i = s.indexOf('varm', i + 1);
  }
}
