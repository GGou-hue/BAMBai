import fs from 'fs';
const a = fs.readFileSync('vendor/audio.js', 'utf8');
const i = a.indexOf('nowPlaying(){');
// walk back to the object's variable name
const seg = a.slice(Math.max(0, i - 2000), i + 100);
const decl = seg.match(/(\w+)=\{[^{}]{0,80}$/);
console.log('controller decl:', decl ? decl[1] : 'unknown');
// find the export mapping for that name
const ex = a.lastIndexOf('export{');
const exl = a.slice(ex, ex + 400);
if (decl) {
  const m = exl.match(new RegExp('\\b' + decl[1] + ' as (\\w+)'));
  console.log('exported as:', m ? m[1] : 'not directly');
}
console.log('export list:', exl.slice(0, 380));
// how does game.js reference it? check bindings again: 'x as ot' — find var x = controller?
const g = fs.readFileSync('vendor/game.js', 'utf8');
// search game.js for .sting( or .say( one-arg audio calls
let j = g.indexOf('.sting(');
console.log('game .sting( @', j, j >= 0 ? JSON.stringify(g.slice(Math.max(0, j - 100), j + 60)).slice(0, 160) : '');
