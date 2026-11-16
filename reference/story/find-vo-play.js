// how is the ./vo/ system triggered? find the play function
import fs from 'fs';
const s = fs.readFileSync('vendor/audio.js', 'utf8');
const i = s.indexOf('vo/index.json');
console.log('vo fetch @', i);
console.log(JSON.stringify(s.slice(Math.max(0, i - 400), i + 400)));
// who calls it? find the exported fn name near there
