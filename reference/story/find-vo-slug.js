import fs from 'fs';
const g = fs.readFileSync('vendor/game.js', 'utf8');
for (const k of ['.audio=', 'audio:new', 'this.audio']) {
  const i = g.indexOf(k);
  console.log(k, '@', i, i >= 0 ? JSON.stringify(g.slice(Math.max(0, i - 80), i + 120)).slice(0, 200) : '');
}
// the slug fn f(e,t)= u(e)+'-'+d(t.t...) — get d's input exactly
const a = fs.readFileSync('vendor/audio.js', 'utf8');
const fi = a.indexOf('var f=(e,t)=>');
console.log('slug fn:', JSON.stringify(a.slice(fi, fi + 120)));
// gen-clue.mjs pipeline
console.log('--- gen-clue.mjs:');
console.log(fs.readFileSync('reference/story/gen-clue.mjs', 'utf8').slice(0, 1500));
