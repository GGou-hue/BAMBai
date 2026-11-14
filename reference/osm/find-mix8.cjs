// search all vendor js for mixFor and bus-in-mix
const fs = require('fs');
const files = fs.readdirSync('vendor').filter(f => f.endsWith('.js'));
for (const f of files) {
  const s = fs.readFileSync('vendor/' + f, 'utf8');
  let i = s.indexOf('mixFor');
  if (i >= 0) console.log('mixFor in', f, '@' + i);
}
