// FIX ch2-tail: the gate reach radius (10 m) contradicted the stealth spot rule.
// Putta parks ~2 m from the sluice gate, and the player is spotted within 4.5 m of
// him while standing -- so from the legal 8-25 m follow band the player could never
// satisfy reach(gate, radius 10) without tripping the spot check. Widen the reach
// radius to 26 m (the whole legal band) so the objective completes as soon as Putta
// reaches the gate, which is what the mission means ("follow him there").
const fs = require('fs');
const FILE = 'vendor/game.js';
let s = fs.readFileSync(FILE, 'utf8');

const before = 'await e.reach(q(`sluiceGate`, 2, 60), `Follow <b>Putta</b> toward the sluice gate`, { radius: 10 })';
const after = 'await e.reach(q(`sluiceGate`, 2, 60), `Follow <b>Putta</b> toward the sluice gate`, { radius: 26 })';

if (!s.includes(before)) {
  console.log('pattern not found -- aborting (bundle may already be patched)');
  process.exit(1);
}
const hits = s.split(before).length - 1;
console.log('occurrences:', hits);
s = s.split(before).join(after);
fs.writeFileSync(FILE, s);
console.log('patched ch2-tail reach radius 10 -> 26');
