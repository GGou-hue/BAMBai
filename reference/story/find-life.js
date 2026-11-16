// find the life-density fn used by the crowd system
import fs from 'fs';
const s = fs.readFileSync('vendor/game.js', 'utf8');
const i = s.indexOf('this.group.name=`life`');
console.log('life @', i);
console.log(JSON.stringify(s.slice(i - 400, i + 300)));
// Re is imported; find its export in city-view.js / npc.js / hud.js
for (const f of ['city-view.js', 'npc.js', 'npc-2.js', 'hud.js', 'day.js']) {
  const t = fs.readFileSync('vendor/' + f, 'utf8');
  const j = t.search(/function Re\(|Re\s*=\s*\(|var Re|let Re|const Re/);
  if (j >= 0) console.log('Re FOUND in', f, '@', j, JSON.stringify(t.slice(j, j + 600)).slice(0, 600));
}
