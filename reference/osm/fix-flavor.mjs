// flavor dialogue: Kannada/Silk Board/Whitefield jokes -> Mumbai equivalents
import fs from 'fs';
const subs = [
  [`Do you speak Kannada? A little? Great, that is all it takes to get anywhere.`, `Do you speak Marathi? A little? Great, that is all it takes to get anywhere.`],
  [`I don't know Kannada yet, but I am learning! A little. Very little.`, `I don't know Marathi yet, but I am learning! A little. Very little.`],
  [`My pitch deck had one Kannada word. Investors went crazy, bro.`, `My pitch deck had one Marathi word. Investors went crazy, bro.`],
  [`My Kannada teacher is the darshini menu board. Idli, vada, kesari bath. I am fluent in breakfast.`, `My Marathi teacher is the Irani menu board. Bun maska, cutting chai, khari. I am fluent in breakfast.`],
  [`Look at that Delhi guy speaking better Kannada than my son. My son just says "had food, bro?"`, `Look at that Delhi guy speaking better Marathi than my son. My son just says "khana kha, bro?"`],
  [`He learned a little Kannada, I learned a little Hindi. Exchange program, buddy.`, `He learned a little Marathi, I learned a little Hindi. Exchange program, buddy.`],
  [`I won't go towards Silk Board, sir. Not even for ten lakhs.`, `I won't go towards Bandar, sir. Not even for ten lakhs.`],
  [`Towards Silk Board? Sir, that is farther than your Delhi.`, `Towards Bandar? Sir, that is farther than your Delhi.`],
  [`No extra for Hindi, discount for Kannada!`, `No extra for Hindi, discount for Marathi!`],
  [`You speak Kannada? A little? Super, twenty rupees off!`, `You speak Marathi? A little? Super, twenty rupees off!`],
  [`Silk Board Kickoff`, `Jam Kickoff`],
  [`Silk Board is not a junction. It is a lifestyle.`, `The traffic here is not a jam. It is a lifestyle.`],
  [`Brother, will you go to Whitefield? How much? Adjust a little, buddy!`, `Brother, will you go to Powai? How much? Adjust a little, buddy!`],
  [`Kannada? Yes yes, I don't know! See, I know Kannada.`, `Marathi? Yes yes, I don't know! See, I know Marathi.`],
  [`Man, my whole youth was spent at Silk Board.`, `Man, my whole youth was spent in the Bandar jam.`],
  [`Thirty years I am in BAMBAI. I know a little Kannada. Just a little.`, `Thirty years I am in BAMBAI. I know a little Marathi. Just a little.`],
  [`"Devanagari Sangam MN", "Noto Sans Kannada", "Tunga", "Nirmala UI", sans-serif`, `"Devanagari Sangam MN", "Noto Sans Devanagari", "Tunga", "Nirmala UI", sans-serif`],
  ['"Noto Sans Kannada"', '"Noto Sans Devanagari"'],
  ['Kannada Sangam MN', 'Devanagari Sangam MN'],
  ['Kohinoor Kannada', 'Kohinoor Devanagari'],
];
for (const base of ['vendor', '_source']) {
  for (const f of ['menus.js', 'npc.js', 'vehicles.js', 'game.js', 'city.js', 'drum-screen.js', 'landmarks.js', 'hud.js', 'index.js']) {
    const p = base + '/' + f;
    if (!fs.existsSync(p)) continue;
    let s = fs.readFileSync(p, 'utf8');
    const b = s.length;
    for (const [a, r] of subs) s = s.split(a).join(r);
    if (s.length !== b) { fs.writeFileSync(p, s); console.log(p, 'edited'); }
  }
}
for (const f of ['menus.js', 'npc.js', 'vehicles.js', 'game.js', 'city.js', 'drum-screen.js', 'landmarks.js', 'hud.js', 'index.js']) {
  const p = 'vendor/' + f;
  if (!fs.existsSync(p)) continue;
  const s = fs.readFileSync(p, 'utf8');
  for (const pat of ['Kannada', 'Silk Board', 'Whitefield', 'darshini']) {
    const hits = [...s.matchAll(new RegExp(pat, 'gi'))].length;
    if (hits) console.log(p, pat, hits);
  }
}
