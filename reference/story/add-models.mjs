// add model + spawnPlace to each protagonist in story/characters.json
import fs from 'fs';
const p = 'story/characters.json';
const c = JSON.parse(fs.readFileSync(p, 'utf8'));
const map = {
  aarav: { model: 'nikhil', modelNote: 'stands in for Aarav until a dedicated model exists (S9 art pass); young male cast model', spawnPlace: 'policeOutpost', spawnNote: 'Crime Branch: the police outpost on P D Mello Road' },
  arjun: { model: 'arjun', modelNote: 'canon protagonist model', spawnPlace: 'spawn', spawnNote: 'canon Kolvada PG spawn' },
  naina: { model: 'kavya', modelNote: 'stands in for Naina until a dedicated model exists; young female cast model', spawnPlace: 'xeroxShop', spawnNote: 'the press: xerox/print shop she files stories from' },
  meera: { model: 'saree', modelNote: 'existing saree model = Meera as in cast.js', spawnPlace: 'tankerDepot', spawnNote: 'the harbour: tanker depot where she works' },
};
for (const pr of c.protagonists) Object.assign(pr, map[pr.id]);
fs.writeFileSync(p, JSON.stringify(c, null, 1) + '\n');
console.log('updated:', c.protagonists.map((x) => `${x.id}=${x.model}@${x.spawnPlace}`).join(' | '));
