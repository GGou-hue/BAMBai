import fs from 'fs';
const p = 'vendor/vehicle.js';
let s = fs.readFileSync(p, 'utf8');
let n = 0;
for (let i = 1; i <= 7; i++) {
  const needle = 'console.info(`[physics] step' + i;
  const repl = 'globalThis.__bootTrace?.("physics step' + i + '"),console.info(`[physics] step' + i;
  if (s.includes(needle)) { s = s.split(needle).join(repl); n++; }
}
fs.writeFileSync(p, s);
console.log('patched', n);
