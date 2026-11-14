// build vo-lines2.json: 5 clips flagged by keyword spotting
import fs from 'fs';

const s = fs.readFileSync('vendor/npc.js', 'utf8');
const grab = (from, to) => {
  const i = s.indexOf(from);
  const end = to ? s.indexOf(to, i) : s.length;
  return (s.slice(i, end).match(/`[^`\n]+`/g) || []).map(x => x.slice(1, -1));
};
const delhi = grab('delhi:{variant', '},tamil:');
const fan = grab('fan:{variant', '},honkback:');

const out = [
  { file: 'delhi-1', text: delhi[0], rate: -1 },                    // "Brother, will you go to Powai?..."
  { file: 'fan-2', text: 'Bambai! Bambai! Bambai!', rate: 0 },
  { file: 'fan-6', text: 'Sixer! Sixer! Bambai!', rate: 0 },
  { file: 'rj-gully-weather-1', text: 'Gully Indie weather watch! Monsoon arriving early this year. Carry the umbrella, expect waterlogged lanes by evening, and the sea breeze keeps it sticky. Stay dry out there, Bambai!', rate: 0 },
  { file: 'rj-hustle-north-1', text: 'Hustle FM, the north update! New food hall opening near the highway, rents up another ten percent, and every third auto on the road is a delivery partner now. Grind on, Bambai!', rate: 0 },
];
fs.writeFileSync('reference/osm/vo-lines2.json', JSON.stringify(out, null, 1));
console.log('clips:', out.length);
for (const o of out) console.log(o.file, '|', o.text.slice(0, 70));
