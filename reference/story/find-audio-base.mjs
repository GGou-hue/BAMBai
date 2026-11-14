// how does audio.js load its manifest + what base do fetches resolve against?
import fs from 'fs';
const s = fs.readFileSync('vendor/audio.js', 'utf8');
for (const k of ['manifest.json', 'fetch(', './audio', 'audio/']) {
  let i = -1, n = 0;
  while ((i = s.indexOf(k, i + 1)) >= 0 && n < 4) {
    console.log(k, '@', i, ':', JSON.stringify(s.slice(Math.max(0, i - 90), i + 110)));
    n++;
  }
}
