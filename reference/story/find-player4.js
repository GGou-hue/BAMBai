// player creation context in game.js
import fs from 'fs';
const s = fs.readFileSync('vendor/game.js', 'utf8');
const i = s.indexOf('this.player=new $n');
console.log(JSON.stringify(s.slice(i - 700, i + 700)));
