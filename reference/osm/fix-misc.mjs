// index.js + game.js leftovers: Silk Board refs, Kannada font stack, Koramangala blurb
import fs from 'fs';
const jobs = [
  ['vendor/index.js', '_source/index.js'],
  ['vendor/game.js', '_source/game.js'],
  ['vendor/city.js', '_source/city.js'],
  ['vendor/drum-screen.js', '_source/drum-screen.js'],
  ['vendor/landmarks.js', '_source/landmarks.js'],
  ['vendor/audio.js', '_source/audio.js'],
  ['vendor/audio-entry.js', '_source/audio-entry.js'],
  ['vendor/arena.js', '_source/arena.js'],
];
for (const [vf, sf] of jobs) {
  for (const f of [vf, sf]) {
    if (!fs.existsSync(f)) { console.log(f, 'MISSING'); continue; }
    let s = fs.readFileSync(f, 'utf8');
    const b = s.length;
    s = s.split('a playable Koramangala').join('a playable Bambai');
    s = s.split('A playable Koramangala').join('A playable Bambai');
    s = s.split('set in Koramangala').join('set in Bambai');
    s = s.split('Silk Board Traffic Radio').join('Bambai Traffic Radio');
    s = s.split('Silk Board Flyover').join('Juna Flyover');
    // Kannada font stack -> Devanagari
    s = s.split('"Kohinoor Kannada","Noto Sans Kannada","Tunga","Nirmala UI","Kannada Sangam MN"').join('"Kohinoor Devanagari","Noto Sans Devanagari","Nirmala UI","Mangal","Kokila"');
    s = s.split('Kohinoor Kannada').join('Kohinoor Devanagari');
    if (s.length !== b) { fs.writeFileSync(f, s); console.log(f, 'edited', b - s.length); }
  }
}
// report leftovers
for (const [vf] of jobs) {
  const s = fs.readFileSync(vf, 'utf8');
  for (const pat of ['Koramangala', 'Silk Board', 'Kannada']) {
    const hits = [...s.matchAll(new RegExp(pat, 'g'))].length;
    if (hits) console.log(vf, pat, hits);
  }
}
