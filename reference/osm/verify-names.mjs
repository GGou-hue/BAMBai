// verify zone road names exist in the spliced map names literal (fixed extract)
import fs from 'fs';
const M = fs.readFileSync('vendor/map.js', 'utf8');
const i = M.indexOf('i=".');
const start = i + 3;
const end = M.indexOf('"', start);
const names = M.slice(start, end).split('.');
const set = new Set(names);
for (const r of ['Juna Flyover', 'Moti Haar Marg', 'Killa Marg', 'Bandar Road', 'Station Bus Stand Road', 'Kolvada Main Road', 'Rangmahal Road', 'Darya Coastal Road', 'Banyan Circle', 'Ghadi Ghar Road'])
  console.log(set.has(r) ? 'OK ' : 'MISS', r);
console.log('total names:', names.length);
