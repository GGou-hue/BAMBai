// Verify the ch2-tail gate-reach contradiction and compute safe numbers.
const fs = require('fs');
const s = fs.readFileSync('vendor/game.js', 'utf8');
const i = s.indexOf('id: `ch2-tail`');
const body = s.slice(i, i + 5200);

const checks = [
  ['follow band min (lose)', /i > (\d+(?:\.\d+)?) \? o \+= u/],
  ['spot radius', /i < (\d+(?:\.\d+)?) && !h/],
  ['reach radius', /sluiceGate`, 2, 60\), `Follow[\s\S]{0,80}?radius: (\d+(?:\.\d+)?)/],
  ['putta-at-gate wait', /K\(`sluiceGate`\)\.z\) < (\d+(?:\.\d+)?), 90\)/],
];
for (const [label, re] of checks) {
  const m = body.match(re);
  console.log(label.padEnd(24), m ? m[1] : 'NOT FOUND');
}
console.log('\n--- the reach line ---');
const rl = body.match(/await e\.reach\(q\(`sluiceGate`[^)]*\)[^)]*\)[^;]*;/);
console.log(rl ? rl[0] : 'not found');
