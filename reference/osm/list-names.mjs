// list all road names from stage1 for the rename table
import fs from 'fs';
const S1 = JSON.parse(fs.readFileSync('reference/osm/mumbai/stage1.json', 'utf8'));
const names = S1.names;
console.log('count', names.length);
names.forEach((n, i) => console.log(i, n));
