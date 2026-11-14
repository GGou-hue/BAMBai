// find the traffic spawn mix (kind lists) in game.js
const fs = require('fs');
const g = fs.readFileSync('vendor/game.js', 'utf8');
const kinds = ['auto','hatchback','sedan','taxi','suv','minitruck','bus','schoolbus','scooter','motorbike','delivery','police'];
// find array literals containing at least 4 kind names
const re = /[`"]([a-z]+)[`"]([,\s`"]+[a-z]+[`"])+/g;
let m, n = 0;
while ((m = re.exec(g)) && n < 400) {
  const frag = m[0];
  let count = 0;
  for (const k of kinds) {
    const kk = frag.split(k).length - 1;
    count += kk;
  }
  if (count >= 4 && frag.length < 400) {
    console.log('--- @' + m.index);
    console.log(JSON.stringify(g.slice(Math.max(0, m.index - 150), m.index + frag.length + 60)));
    n++;
    if (n > 12) break;
  }
}
