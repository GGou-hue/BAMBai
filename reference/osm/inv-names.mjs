// inventory of renamable strings in the spliced Mumbai map
import fs from 'fs';
const M = fs.readFileSync('reference/osm/mumbai/map-mumbai.js', 'utf8');
// names raw literal: a long backtick string of dot-separated road names
const dotRe = /`([^`]{200,})`/g;
let m, best = null;
while ((m = dotRe.exec(M))) if (m[1].split('.').length > (best?.[1].split('.').length || 0)) best = m;
const names = best[1].split('.');
console.log('road names:', names.length);
console.log(names.join(' | '));
// landmarks / places / districts raw literals
for (const key of ['landmarks', 'PLACES', 'districts']) {
  const i = M.indexOf(key);
  console.log('\n=== ' + key + ' at', i);
  console.log(M.slice(i, i + 700).replace(/\n/g, ' '));
}
