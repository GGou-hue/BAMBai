// font stacks + dialogue leftovers across vendor + _source
import fs from 'fs';
const files = ['game.js', 'city.js', 'drum-screen.js', 'landmarks.js', 'hud.js', 'menus.js', 'buildings.js', 'character.js', 'vehicles.js', 'police.js', 'npc.js', 'audio.js', 'index.js'];
const subs = [
  ['"Noto Sans Kannada", "Kannada Sangam MN", "Kannada MN", "Tunga", sans-serif', '"Noto Sans Devanagari", "Mangal", "Nirmala UI", "Kokila", sans-serif'],
  ['"Noto Sans Kannada", "Tunga", "Nirmala UI", "Kannada Sangam MN", sans-serif', '"Noto Sans Devanagari", "Tunga", "Nirmala UI", "Mangal", sans-serif'],
  ['"Noto Sans Kannada", "Kohinoor Devanagari", sans-serif', '"Noto Sans Devanagari", "Kohinoor Devanagari", sans-serif'],
  ['"Noto Sans Kannada", "Inter Tight", sans-serif', '"Noto Sans Devanagari", "Inter Tight", sans-serif'],
  ['"Inter Tight", "Noto Sans Kannada", sans-serif', '"Inter Tight", "Noto Sans Devanagari", sans-serif'],
  ['"Baloo Tamma 2", "Noto Sans Kannada", sans-serif', '"Baloo 2", "Noto Sans Devanagari", sans-serif'],
  ['Kohinoor Kannada', 'Kohinoor Devanagari'],
  ['Kannada Sangam MN', 'Devanagari Sangam MN'],
];
for (const base of ['vendor', '_source']) {
  for (const f of files) {
    const p = base + '/' + f;
    if (!fs.existsSync(p)) continue;
    let s = fs.readFileSync(p, 'utf8');
    const b = s.length;
    for (const [a, r] of subs) s = s.split(a).join(r);
    s = s.split(`I don't know Kannada`).join(`I don't know Marathi`);
    s = s.split(`Dont know Kannada`).join(`Dont know Marathi`);
    s = s.split(`Kannada cards`).join(`Marathi cards`);
    s = s.split(`Silk Board Survivor`).join(`Traffic Survivor`);
    s = s.split(`Silk Board! Maximum jam`).join(`Maximum jam!`);
    s = s.split('Silk Board, 80 Feet Road, Srinivagilu, Ejipura, Madiwala underpass. Expected deluge by six.').join('Bandar Road, Kolvada Main Road, the Moti Haar face, Killa lanes. Expected deluge by six.');
    s = s.split('Roads under water`,`Silk Board').join('Roads under water`,`Bandar Road');
    if (s.length !== b) { fs.writeFileSync(p, s); console.log(p, 'edited'); }
  }
}
// report leftovers
for (const base of ['vendor']) {
  for (const f of files) {
    const p = base + '/' + f;
    if (!fs.existsSync(p)) continue;
    const s = fs.readFileSync(p, 'utf8');
    for (const pat of ['Kannada', 'Silk Board']) {
      const hits = [...s.matchAll(new RegExp(pat, 'g'))].length;
      if (hits) console.log(p, pat, hits);
    }
  }
}
