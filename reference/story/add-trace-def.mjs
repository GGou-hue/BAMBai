import fs from 'fs';
const p = 'vendor/game.js';
let s = fs.readFileSync(p, 'utf8');
const anchor = 'const __vite__mapDeps=';
const lineEnd = s.indexOf('=>i.map(i=>d[i]);');
if (lineEnd < 0) throw new Error('anchor not found');
const insertAt = lineEnd + '=>i.map(i=>d[i]);'.length;
const def = ';globalThis.__bootTrace=globalThis.__bootTrace||(m=>{try{fetch("http://127.0.0.1:8124/log?m="+encodeURIComponent(m),{mode:"no-cors"}).catch(()=>{})}catch(e){}})';
if (!s.includes('__bootTrace=globalThis.__bootTrace||')) {
  s = s.slice(0, insertAt) + def + s.slice(insertAt);
}
fs.writeFileSync(p, s);
console.log('calls in game.js:', (s.match(/__bootTrace\?\./g) || []).length, 'def:', s.includes('__bootTrace=globalThis.__bootTrace||'));
fs.copyFileSync(p, '_source/game.js');
console.log('mirrors:', fs.readFileSync(p).equals(fs.readFileSync('_source/game.js')));
