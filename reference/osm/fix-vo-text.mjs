// sweep remaining wrong-city dialogue in npc.js (radio table, whitefield chatter, goon line)
// edits vendor/npc.js AND _source/npc.js identically
import fs from 'fs';

const swaps = [
  // cop radio ($t.radio)
  ['Control to Koramangala units. Suspect on a two-wheeler, delivery bag, heading to Hosur Road.',
   'Control to Kolvada units. Suspect on a two-wheeler, delivery bag, heading to Bandar Road.'],
  ['All units, Eighty Feet Road side, rash driving. Intercept him.',
   'All units, Moti Haar Marg side, rash driving. Intercept him.'],
  ['Control to Koramangala units. Suspect in a car, heading towards Hosur Road. Pursue, over.',
   'Control to Kolvada units. Suspect in a car, heading towards Bandar Road. Pursue, over.'],
  ['All units, an auto-rickshaw doing rash driving, Koramangala. Intercept him.',
   'All units, an auto-rickshaw doing rash driving, Kolvada. Intercept him.'],
  ['Control to Koramangala units. Suspect on foot, running towards the lake. Catch him, over.',
   'Control to Kolvada units. Suspect on foot, running towards the creek. Catch him, over.'],
  ['All units, be alert on Eighty Feet Road. Control out.',
   'All units, be alert on Moti Haar Marg. Control out.'],
  // tech-bro chatter (whitefield pool)
  ["Can we take this offline? I'm stuck on the Marathahalli bridge.",
   "Can we take this offline? I'm stuck on the Sion flyover."],
  ["Let's circle back after the stand-up. My driver is at Hebbal for some reason.",
   "Let's circle back after the stand-up. My driver is at BKC for some reason."],
  // goon shout
  ['The lake is ours!', 'The creek is ours!'],
];

for (const f of ['vendor/npc.js', '_source/npc.js']) {
  let s = fs.readFileSync(f, 'utf8');
  let n = 0;
  for (const [a, b] of swaps) {
    if (!s.includes(a)) { console.log(f, 'MISS:', a.slice(0, 50)); continue; }
    s = s.split(a).join(b); n++;
  }
  fs.writeFileSync(f, s);
  console.log(f, 'applied', n, 'of', swaps.length);
}
