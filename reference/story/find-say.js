// how does e.say / dialogue advance work?
import fs from 'fs';
const s = fs.readFileSync('vendor/game.js', 'utf8');
let i = s.indexOf('nu-subs');
let n = 0;
while (i >= 0 && n < 5) {
  console.log('--- @', i, ':', JSON.stringify(s.slice(Math.max(0, i - 200), i + 260)).slice(0, 460));
  n++;
  i = s.indexOf('nu-subs', i + 1);
}
