// find how game.js consumes the cast table + player creation
import fs from 'fs';
const s = fs.readFileSync('vendor/game.js', 'utf8');
const i = s.indexOf('from"./cast.js"');
console.log('cast import:', JSON.stringify(s.slice(Math.max(0, i - 300), i + 20)));
// find where the imported cast table var is used with 'arjun'
const m = s.slice(0, i).match(/import\{([^}]+)\}from"\.\/geo\.js";?$/);
// simpler: list import bindings
const imports = [...s.matchAll(/import\{([^}]+)\}from"([^"]+)"/g)];
for (const im of imports) if (im[2].includes('cast')) console.log('bindings:', im[1]);
