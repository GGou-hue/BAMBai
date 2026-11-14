// find traffic mix table: search for the base kind list used by traffic
const fs = require('fs');
const g = fs.readFileSync('vendor/game.js', 'utf8');
// the traffic module may live in another vendor file
for (const f of ['vendor/game.js','vendor/city.js','vendor/traffic.js','vendor/npc.js','vendor/world.js']) {
  let s;
  try { s = fs.readFileSync(f, 'utf8'); } catch { continue; }
  let i = -1;
  while ((i = s.indexOf('mixFor', i + 1)) >= 0) {
    console.log(f, '@' + i);
  }
}
// also: search for a plain kinds array with weights like {auto:3,hatchback:3,...}
const re = /auto[:\s]*[\d.]+[,}]|hatchback[:\s]*[\d.]+/g;
let m, n = 0;
while ((m = re.exec(g)) && n < 15) {
  console.log('w?', m.index, JSON.stringify(g.slice(Math.max(0, m.index - 120), m.index + 120)));
  n++;
}
