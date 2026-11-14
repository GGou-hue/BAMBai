// Find the road-wear worker URL construction in vendor/city.js
const fs = require('fs');
const s = fs.readFileSync('vendor/city.js', 'utf8');
const re = /road-wear|new Worker|workerUrl|\.worker/g;
let m;
while ((m = re.exec(s))) {
  console.log('@' + m.index + ':', s.slice(Math.max(0, m.index - 260), m.index + 260).replace(/\n/g, ' '));
  console.log();
}
