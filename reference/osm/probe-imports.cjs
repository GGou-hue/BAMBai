const s = require('fs').readFileSync('reference/osm/mumbai/map-mumbai.js', 'utf8');
const re = /from\s*"([^"]+)"/g;
const seen = new Set();
let m;
while ((m = re.exec(s))) seen.add(m[1]);
console.log([...seen].join('\n'));
