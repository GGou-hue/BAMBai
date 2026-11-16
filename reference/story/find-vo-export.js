import fs from 'fs';
const s = fs.readFileSync('vendor/audio.js', 'utf8');
const dollar = String.fromCharCode(36) + 'e';
let i = s.indexOf(dollar), n = 0;
while (i >= 0 && n < 8) {
  console.log('@', i, ':', JSON.stringify(s.slice(Math.max(0, i - 50), i + 90)).slice(0, 140));
  n++;
  i = s.indexOf(dollar, i + 1);
}
// find what qr is exported as
const ex = s.lastIndexOf('export{');
const exl = s.slice(ex, ex + 400);
for (const name of ['qr', 'Kr', 'Vr']) {
  const m = exl.match(new RegExp(name + ' as (\\w+)'));
  console.log(name, 'exported as:', m ? m[1] : 'not exported');
}
