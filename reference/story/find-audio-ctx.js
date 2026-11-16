// audio.js: the Re(hour,rain,q) ctx + We[site].fill(ctx) — verify hour variation
import fs from 'fs';
const s = fs.readFileSync('vendor/audio.js', 'utf8');
// find export A (the ctx fn) — search for 'city:' definitions
let i = s.indexOf('city:');
while (i >= 0 && i < s.length) {
  console.log('city @', i, ':', JSON.stringify(s.slice(Math.max(0, i - 160), i + 160)).slice(0, 300));
  i = s.indexOf('city:', i + 1);
  if (i > 80000) break;
}
// find the exported A function: 'function' with hour params
const j = s.search(/function [A-Za-z_$]+\(e,t,n\)\{[^}]*hour/);
console.log('ctx fn @', j, j >= 0 ? JSON.stringify(s.slice(j, j + 500)).slice(0, 500) : 'n/a');
