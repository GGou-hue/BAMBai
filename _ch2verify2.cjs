// Loose verification of Chapter 2 mission ids and their surrounding structure.
const fs = require('fs');
const s = fs.readFileSync('vendor/game.js', 'utf8');
const ids = ['ch2-contact', 'ch2-tail', 'ch2-copy', 'ch2-stand', 'ch2-rain',
  'ch2-nakabandi', 'ch2-mall', 'ch2-dawn', 'side2-tiffin', 'side2-chappal'];
let ok = 0;
for (const id of ids) {
  const n = s.split(id).length - 1;
  console.log((n ? 'ok  ' : 'MISS') + '  ' + id + (n ? '  x' + n : ''));
  if (n) ok++;
}
console.log('\n' + ok + '/' + ids.length + ' present');
// show a real snippet so we can see the actual quote style
const i = s.indexOf('ch2-contact');
console.log('\ncontext:', s.slice(Math.max(0, i - 120), i + 260).replace(/\n/g, ' '));
