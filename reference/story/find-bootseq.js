import fs from 'fs';
const s = fs.readFileSync('vendor/game.js', 'utf8');
const i = s.indexOf("c(`city`)");
console.log(JSON.stringify(s.slice(i - 1500, i + 900)));
