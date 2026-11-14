// diff pre-sweep vs current dialogue strings (git show via node, no PS redirect)
const fs = require('fs');
const { execSync } = require('child_process');
const grab = s => s.match(/`[^`\n]{8,240}`/g) || [];
const isDialogue = x =>
  /[a-z] [a-z]/i.test(x) && !/[${}=()<>;#\\/[\]]/.test(x) && x.length > 18;
const out = [];
for (const f of ['npc', 'audio']) {
  const pre = execSync(`git show d77cce2~1:vendor/${f}.js`, { maxBuffer: 1e8 }).toString('utf8');
  const cur = fs.readFileSync(`vendor/${f}.js`, 'utf8');
  const B = new Set(grab(cur));
  const gone = grab(pre).filter(isDialogue).filter(x => !B.has(x));
  out.push(`=== ${f}.js: ${gone.length} dialogue strings changed by sweep`);
  for (const g of gone) out.push(g);
}
fs.writeFileSync('reference/osm/vo-diff.txt', out.join('\n'));
console.log('written', out.length, 'lines');
