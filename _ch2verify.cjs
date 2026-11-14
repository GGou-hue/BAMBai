// Verify all Chapter 2 missions are present and well-formed in the vendored bundle.
const fs = require('fs');
const s = fs.readFileSync('vendor/game.js', 'utf8');
const ids = ['ch2-contact', 'ch2-tail', 'ch2-copy', 'ch2-stand', 'ch2-rain',
  'ch2-nakabandi', 'ch2-mall', 'ch2-dawn', 'side2-tiffin', 'side2-chappal'];
let ok = 0;
for (const id of ids) {
  const n = s.split('id:`' + id + '`').length - 1;
  console.log((n ? 'ok  ' : 'MISS') + '  ' + id + (n > 1 ? '  (x' + n + ')' : ''));
  if (n) ok++;
}
console.log('\n' + ok + '/' + ids.length + ' mission ids present');
// chapter-2 wiring checks
for (const [label, pat] of [
  ['Chapters 1 & 2 label', 'Chapters 1 & 2'],
  ['Chapter 3 teaser', '100 Feet Road'],
  ['Shetty villain', 'Shetty'],
  ['un-ended save migration', 'ended=!1'],
]) console.log((s.includes(pat) ? 'ok  ' : 'MISS') + '  ' + label);
