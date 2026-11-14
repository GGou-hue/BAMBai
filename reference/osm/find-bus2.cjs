// check bus kind references in menus/audio/hud
const fs = require('fs');
for (const f of ['vendor/menus.js', 'vendor/audio.js', 'vendor/hud.js']) {
  const s = fs.readFileSync(f, 'utf8');
  let i = -1, n = 0;
  const needle = '`bus`';
  while ((i = s.indexOf(needle, i + 1)) >= 0 && n < 4) {
    console.log(f, '@' + i, JSON.stringify(s.slice(Math.max(0, i - 100), i + 80)));
    n++;
  }
}
