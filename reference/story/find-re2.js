import fs from 'fs';
const s = fs.readFileSync('vendor/game.js', 'utf8');
const im = s.slice(0, 60000);
const parts = im.split('import{');
for (let i = 1; i < parts.length; i++) {
  const seg = parts[i].split('}from"')[0];
  const src = parts[i].split('}from"')[1]?.slice(0, 30);
  if (/\bRe\b/.test(seg)) console.log('Re imported from', src, '| bindings:', seg.slice(0, 200));
}
