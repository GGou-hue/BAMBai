// how are generated VO wavs referenced in audio.js?
import fs from 'fs';
const s = fs.readFileSync('vendor/audio.js', 'utf8');
const hits = [...s.matchAll(/[`"']([a-z]+\/[a-z0-9-]+\.wav)[`"']/g)];
hits.slice(0, 6).forEach((h) => console.log('wav ref:', h[1]));
let i = s.indexOf('audio/');
console.log('audio/ @', i, ':', JSON.stringify(s.slice(Math.max(0, i - 150), i + 180)));
// how does the VO system name clips? search 'voLines' or 'vo/'
for (const k of ['vo/', '`vo`', 'voiceover', 'narrator']) {
  const j = s.indexOf(k);
  if (j >= 0) console.log(k, '@', j, ':', JSON.stringify(s.slice(Math.max(0, j - 100), j + 150)));
}
