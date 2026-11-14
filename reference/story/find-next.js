// where does save.next increment (mission completion)?
import fs from 'fs';
const s = fs.readFileSync('vendor/game.js', 'utf8');
for (const k of ['save.next++', 'save.next+=', 'next++', 'next:']) {
  let i = -1, n = 0;
  while ((i = s.indexOf(k, i + 1)) >= 0 && n < 6) {
    console.log('---', k, '@', i, ':', JSON.stringify(s.slice(Math.max(0, i - 170), i + 140)).slice(0, 310));
    n++;
  }
}
