// Playthrough sweep A: story-logic strings vs Mumbai map.
// Lake fiction -> creek fiction (the map's LAKE is now the Arabian Sea;
// the dying-waterbody plot maps to Mumbai's creek/mudflat reclamation).
// Engine keys (lakeBund, lakeDips, id:`lake`, this.lake, ng.lake) untouched.
import fs from 'fs';
const subs = [
  // proper names first
  ['Hotel Sampige Darshini', `Merwani's Irani Darshini`],
  ['Sampige Kere', 'Retibandar Creek'],
  ['Lake Files', 'Creek Files'],
  ['LAKE FILES', 'CREEK FILES'],
  ["The Lake Doesn't Lie", "The Creek Doesn't Lie"],
  ['Kavya (Lake)', 'Kavya (Creek)'],
  ['Lake Swimmer, Unfortunately', 'Creek Swimmer, Unfortunately'],
  ['Dips in Sampige Kere', 'Dips in Retibandar Creek'], // covered above, keep harmless
  ['Lake bund', 'Creek bund'],
  ['Ee Sala Night', 'Is Baar Night'],
  ['Thaatha Kamba', 'Aajoba Stambh'],
  ['THAATHA KAMBA', 'AAJOBA STAMBH'],
  ['Rakshas House', 'Rakshas Bhuvan'],
  // dialogue lines (game.js)
  ['Why is your location showing a LAKE?', 'Why is your location showing the SEA?'],
  ['Lake address. No flat number, no landmark.', 'Creek address. No flat number, no landmark.'],
  ['Then who ordered biryani to the lake?', 'Then who ordered biryani to the creek?'],
  [`I'm documenting this lake.`, `I'm documenting this creek.`],
  [`The lake can't breathe.`, `The creek can't breathe.`],
  ['Survey pegs. On a lake bed.', 'Survey pegs. On a creek bed.'],
  ['Do you know any lake with a nice sunset? Everything here is either a lake or a parking lot.', 'Do you know any sea face with a nice sunset? Everything here is either the sea or a parking lot.'],
  ['knows everything about the lake.', 'knows everything about the creek.'],
  ['Then what is a lake worth?', 'Then what is a creek worth?'],
  ['Same stamp. Different lake.', 'Same stamp. Different creek.'],
  ['filling the lake edge with debris', 'filling the creek edge with debris'],
  ['The lake is ours, buddy!', 'The creek is ours, buddy!'],
  ['fill in the lake edge', 'fill in the creek edge'],
  ['this lake is worth two thousand', 'this creek is worth two thousand'],
  ['The lake, the pegs, the trucks.', 'The creek, the pegs, the trucks.'],
  ['For a lake that took thirty years to die', 'For a creek that took thirty years to die'],
  ['the lake is not for sale.', 'the creek is not for sale.'],
  ['He is heading for the lake. The lake he is legally', 'He is heading for the creek. The creek he is legally'],
  ['The lake sleeps light.', 'The creek sleeps light.'],
  [`opening the lake's throat`, `opening the creek's throat`],
  ['The man who buys lakes before breakfast.', 'The man who buys creeks before breakfast.'],
  ['So the lake dies on paper tonight', 'So the creek dies on paper tonight'],
  [`the lake boy's camera`, `the creek boy's camera`],
  ['If this card dies, the lake dies quietly.', 'If this card dies, the creek dies quietly.'],
  [`Kavya's lake files.`, `Kavya's creek files.`],
  ['Shetty buys lakes. Tonight the mall sells one.', 'Shetty buys creeks. Tonight the mall sells one.'],
  ['The lake gets a memorial plaque.', 'The creek gets a memorial plaque.'],
  ['A plaque. For a lake.', 'A plaque. For a creek.'],
  ['lecture about lake safety', 'lecture about sea safety'],
  // Kannada fight shouts -> Marathi-ish
  ['[`Camera kodi, madam!`,`Putta anna-ge gotthide!`,`Odi hogbeda!`,`The lake is ours, buddy!`,`Hodi avnanna!`]', '[`Kamera band kar, madam!`,`Putta la mahit ahe!`,`Nigh ikade!`,`The creek is ours, buddy!`,`Tyala pakda!`]'],
  // flood/parking toasts with Bangalore roads
  ['Madiwala underpass is a swimming pool again 🙏 and someone is renting kayaks on 80 Feet Road', 'The Bandar underpass is a swimming pool again 🙏 and someone is renting kayaks on the Moti Haar'],
  ['Bandar Road, 80 Feet Road, Srinivagilu, Ejipura, Madiwala underpass. Expected delay: yes.', 'Bandar Road, Kolvada Main Road, the Killa lanes, Station Bus Stand Road, the Bandar underpass. Expected delay: yes.'],
  ['Finding parking near 80 Feet Road...', 'Finding parking near Rangmahal Road...'],
  // music track names
  ['Wedding music (nadaswaram)', 'Wedding music (shehnai)'],
  ['Karaga night', 'Dahi Handi night'],
  ['Dollu Kunitha', 'Lezim Dhol'],
  ['Hundred Feet Road', 'Bandar Road'],
  ['Lake Song', 'Creek Song'],
  ['Lake Folk', 'Creek Folk'],
  ['Peanut Fair', 'Chowpatty Evening'],
  ['(Ugadi morning)', '(Gudi Padwa morning)'],
  ['Sesame and Sugar (Sankranti)', 'Tilgul (Sankranti)'],
  // city.js code ref: hoardings along the long harbour road
  ['i[e.road]?.name!==`80 Feet Road`', 'i[e.road]?.name!==`Bandar Road`'],
];
const files = ['game.js', 'menus.js', 'hud.js', 'city.js'];
for (const base of ['vendor', '_source']) {
  for (const f of files) {
    const p = base + '/' + f;
    if (!fs.existsSync(p)) { console.log(p, 'MISSING'); continue; }
    let s = fs.readFileSync(p, 'utf8');
    let n = 0;
    for (const [a, r] of subs) {
      const c = s.split(a).length - 1;
      if (c) { s = s.split(a).join(r); n += c; }
    }
    if (n) { fs.writeFileSync(p, s); console.log(p, 'replacements:', n); }
  }
}
// leftovers report (player-facing lake mentions outside engine keys)
for (const f of files) {
  const s = fs.readFileSync('vendor/' + f, 'utf8');
  for (const m of [...s.matchAll(/lake/gi)]) {
    const ctx = s.slice(m.index - 40, m.index + 40).replace(/\n/g, ' ');
    if (/lakeBund|lakeDips|this\.lake|\.lake\b|`lake`|lakeWarned|case`lake`|case `lake`|ng\.lake|id:`lake`|theme:`lake`|Lake Folk|lake\(\)/.test(ctx)) continue;
    console.log('LEFT', f, m.index, JSON.stringify(ctx));
  }
}
