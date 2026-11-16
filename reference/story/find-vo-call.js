import fs from 'fs';
const s = fs.readFileSync('vendor/game.js', 'utf8');
const im = s.slice(0, 60000).split('import{');
for (let i = 1; i < im.length; i++) {
  const seg = im[i].split('}from"')[0];
  const src = (im[i].split('}from"')[1] || '').slice(0, 22);
  if (src.includes('audio.js')) console.log('audio bindings:', seg);
}
// how does the game call the vo player? search for slug-like call: the player fn is Kr in audio.js, exported as one of the names.
// game.js calls it with a [id, speaker] pair. Search for calls passing arrays with 'anchor' or 'radio' speaker ids:
for (const k of ['trafficRadioAnchor', 'radioAnchor', 'anchor']) {
  let j = s.indexOf(k);
  console.log(k, '@', j, j >= 0 ? JSON.stringify(s.slice(Math.max(0, j - 150), j + 120)).slice(0, 260) : '');
}
