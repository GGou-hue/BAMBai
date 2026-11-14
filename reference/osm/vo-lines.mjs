// build vo-lines.json: {file, text, rate} for every WAV to regenerate
// code-backed lines are parsed from vendor/npc.js so TTS matches subtitles exactly
import fs from 'fs';

const s = fs.readFileSync('vendor/npc.js', 'utf8');
const grab = (from, to) => {
  const i = s.indexOf(from);
  if (i < 0) throw new Error('marker not found: ' + from);
  const end = to ? s.indexOf(to, i) : s.length;
  const seg = s.slice(i, end);
  return (seg.match(/`[^`\n]+`/g) || []).map(x => x.slice(1, -1));
};

const clean = t => t.replace(/BAMBAI/g, 'Bambai');

const out = [];
// radio-1..10 = $t.radio lines in order (dispatch: fast)
grab('$t={ouch', '},en={delivery').length; // sanity: table exists
const radio = grab('radio:[', ']}');
radio.forEach((t, i) => out.push({ file: `radio-${i + 1}`, text: clean(t), rate: 2 }));
// whitefield-1..4 = chatter lines in order
const wf = grab('whitefield:{variant', '},fan:');
wf.forEach((t, i) => out.push({ file: `whitefield-${i + 1}`, text: clean(t), rate: -1 }));
// goon-11 = goon line index 10
const goon = grab('goon:[', '],goonhurt');
out.push({ file: 'goon-11', text: clean(goon[10]), rate: -1 });
// delhi-2, delhi-3, tamil-3 (variant pools: file N = line N-1)
const delhi = grab('delhi:{variant', '},tamil:');
const tamil = grab('tamil:{variant', '},telugu:');
out.push({ file: 'delhi-2', text: clean(delhi[1]), rate: -1 });
out.push({ file: 'delhi-3', text: clean(delhi[2]), rate: -1 });
out.push({ file: 'tamil-3', text: clean(tamil[2]), rate: -1 });

// jingles / RJ / ad copy (no code source — authored Bambai fiction)
const J = [
  ['ident-kempu-1', "You're listening to Bambaiya FM! Gaani pe gaani, non-stop!", 1],
  ['ident-kempu-2', "Bambaiya FM! The city's heartbeat, all day, all night!", 1],
  ['ident-kempu-3', 'From Kolvada to Dadar, this is Bambaiya FM!', 1],
  ['ident-kempu-4', 'Bambaiya FM! Full volume, full masti!', 1],
  ['ident-hale-1', 'Hale Gaani! Old songs, golden songs. Only Hale Gaani.', 0],
  ['ident-hale-2', "The songs your nani hummed... Hale Gaani, Bambai's old is gold station.", 0],
  ['ident-hale-3', 'Hale Gaani! Where every song is a classic.', 0],
  ['ident-silkboard-1', 'Bambai Traffic Radio! Jam updates, every ten minutes.', 1],
  ['ident-silkboard-2', "Stuck in the jam? You're with Bambai Traffic Radio.", 1],
  ['ident-silkboard-3', "Bambai Traffic Radio. We know why you're late.", 1],
  ['ident-silkboard-4', 'Bambai Traffic Radio. Horn OK please!', 1],
  ['rj-kempu-whitefield-1', 'Bambaiya FM traffic watch! Rain in Dadar, water on the tracks, and every auto from here to Bandra wants double. Stay dry, keep the radio on!', 0],
  ['rj-kempu-cricket-1', "And that's another six! Bambai wins by four wickets, and the streets are erupting! You heard it first on Bambaiya FM, the home of the champions!", 0],
  ['rj-silkboard-whitefield-1', 'Bambai Traffic Radio. Heavy jam at Sion circle, slow move past the Dadar flyover, and the Eastern Express is a parking lot. Leave now, reach never. Updates every ten minutes.', 0],
  ['rj-silkboard-cricket-1', 'Match day alert! Extra crowds near the sea stadium after six. Avoid the Moti Haar Marg, take the coast road at your own risk. Bambai Traffic Radio, jam by jam.', 0],
  ['rj-silkboard-orr-1', 'Bambai Traffic Radio, highway watch. Accident near the Sion toll, two lanes blocked. Trucks on the harbour line till midnight. Plan ahead, drive safe.', 0],
  ['rj-hale-oldcity-1', 'From the old city lanes, a song for every heartache. Hale Gaani... only the classics.', -1],
  ['rj-hale-coffee-1', 'Slow mornings, strong coffee, older songs. This is Hale Gaani, your companion with the morning chai.', -1],
  ['ad-sites-1', 'Dream homes at Sea Breeze Heights! Two B H K sea facing apartments, walking distance from the promenade. Book your site visit today. Sea Breeze Heights. Living, elevated.', 0],
];
for (const [f, t, r] of J) out.push({ file: f, text: t, rate: r });

fs.writeFileSync('reference/osm/vo-lines.json', JSON.stringify(out, null, 1));
console.log('clips:', out.length);
for (const o of out) if (!o.text || o.text.length < 3) console.log('EMPTY:', o.file);
