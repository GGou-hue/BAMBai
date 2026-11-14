// find the traffic class base mix: search module.js and city.js for kind mix tables
const fs = require('fs');
for (const f of ['vendor/module.js', 'vendor/city.js', 'vendor/npc.js']) {
  const s = fs.readFileSync(f, 'utf8');
  let i = -1;
  while ((i = s.indexOf('mixFor', i + 1)) >= 0) {
    console.log(f, '@' + i, JSON.stringify(s.slice(Math.max(0, i - 200), i + 300)));
  }
}
// fallback: search for a traffic spawn table with bus weight
const s = fs.readFileSync('vendor/module.js', 'utf8');
const re = /`bus`/g;
let m, n = 0;
while ((m = re.exec(s)) && n < 10) {
  console.log('module bus @' + m.index, JSON.stringify(s.slice(Math.max(0, m.index - 150), m.index + 100)));
  n++;
}
