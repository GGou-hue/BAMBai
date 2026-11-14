// which module exports fa (p), and what does that p do?
import fs from 'fs';
const s = fs.readFileSync('vendor/game.js', 'utf8');
// find the import statement containing 'p as fa'
const im = [...s.matchAll(/import\{([^}]+)\}from"([^"]+)"/g)].find((x) => /(^|[,{}])p as fa/.test(x[1]));
console.log('source:', im && im[2], '| bindings:', im && im[1].slice(0, 120));
// read that module and find its p export
const mod = fs.readFileSync('vendor/' + im[2].replace('./', ''), 'utf8');
console.log('mod len:', mod.length);
const exp = mod.match(/export\{([^}]+)\}/);
console.log('exports:', exp && exp[1].slice(0, 300));
// find p= definition
const pd = [...mod.matchAll(/(?:function p\b|[,;}]p=|var p=)/g)];
pd.forEach((x) => console.log('p def @', x.index, ':', JSON.stringify(mod.slice(x.index, x.index + 260)).slice(0, 260)));
