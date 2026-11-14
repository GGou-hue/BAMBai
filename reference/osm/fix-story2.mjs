// story sweep pass 2: remaining chapter-2 endgame dialogue + misc
import fs from 'fs';
const subs = [
  ['then ride to <b>the lake</b>', 'then ride to <b>the creek</b>'],
  ['"lake files"', '"creek files"'],
  ['Shetty will come for the lake tonight.', 'Shetty will come for the creek tonight.'],
  ['title: `The Lake Stands`', 'title: `The Creek Stands`'],
  ['the final morning: the lake, the trucks, the live stream', 'the final morning: the creek, the trucks, the live stream'],
  ['It is one lake, brothers!', 'It is one creek, brothers!'],
  ['Arjun. The lake. Look at the lake.', 'Arjun. The creek. Look at the creek.'],
  ['Indiranagar has older ghosts than lakes.', 'Kolvada has older ghosts than creeks.'],
  ['The lake stands. The city noticed.', 'The creek stands. The city noticed.'],
  ['Chapter 2 complete. The lake, the lanes', 'Chapter 2 complete. The creek, the lanes'],
  ['A lake, a mafia, a newspaper.', 'A creek, a mafia, a newspaper.'],
  ['The lake needs more people on it.', 'The creek needs more people on it.'],
  ['A lake? A mafia?', 'A creek? A mafia?'],
  ['he is watching the lake news very quietly.', 'he is watching the creek news very quietly.'],
  ['a lecture about lake water.', 'a lecture about sea water.'],
  ['Your ride is now part of the lake ecosystem.', 'Your ride is now part of the creek ecosystem.'],
  ['A festival procession is heading to the lake.', 'A festival procession is heading to the sea.'],
  ['name:`Lake Warrior`', 'name:`Creek Warrior`'],
  ["Don't drink the lake water, buddy.", "Don't drink the creek water, buddy."],
  ['Sit by the lake', 'Sit by the sea'],
  ['SKYCOURT LAKEVIEW', 'SKYCOURT SEAVIEW'],
  ['no fish in this lake, just foam!', 'no fish in this sea, just foam!'],
  ['Out of the lake. Health comes back', 'Out of the water. Health comes back'],
];
for (const base of ['vendor', '_source']) {
  for (const f of ['game.js', 'menus.js', 'city.js']) {
    const p = base + '/' + f;
    if (!fs.existsSync(p)) continue;
    let s = fs.readFileSync(p, 'utf8');
    let n = 0;
    for (const [a, r] of subs) {
      const c = s.split(a).length - 1;
      if (c) { s = s.split(a).join(r); n += c; }
    }
    if (n) { fs.writeFileSync(p, s); console.log(p, 'replacements:', n); }
  }
}
