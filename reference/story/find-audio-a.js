import fs from 'fs';
const s = fs.readFileSync('vendor/audio.js', 'utf8');
// export statement
const ex = s.lastIndexOf('export{');
console.log('exports:', JSON.stringify(s.slice(ex, ex + 200)));
// find A: 'function A(' or 'A=' — it's likely the audio ctx used as Re(hour,rain,q)
for (const pat of ['function A(', 'A=function', ',A=', 'var A=', 'let A=', 'const A=']) {
  const i = s.indexOf(pat);
  if (i >= 0) { console.log(pat, '@', i, ':', JSON.stringify(s.slice(i, i + 300)).slice(0, 300)); break; }
}
