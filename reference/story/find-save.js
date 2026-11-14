// find the save system in game.js
import fs from 'fs';
const s = fs.readFileSync('vendor/game.js', 'utf8');
for (const k of ['localStorage', 'story.save', 'save.opened', '`save`', 'saveGame', 'newGame']) {
  let i = -1, n = 0;
  while ((i = s.indexOf(k, i + 1)) >= 0 && n < 4) {
    console.log('---', k, '@', i, ':', JSON.stringify(s.slice(Math.max(0, i - 130), i + 160)).slice(0, 290));
    n++;
  }
}
