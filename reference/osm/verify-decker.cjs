// verify decker edits landed in vendor/game.js
const fs = require('fs');
const s = fs.readFileSync('vendor/game.js', 'utf8');
console.log('AC map decker:', s.includes('police:`suv`,bus:`bus`,decker:`bus`,schoolbus:`bus`'));
console.log('mixFor decker:', s.includes('e>7&&e<9.2&&r(`decker`,2)'));
let i = s.indexOf('cityParked.forEach');
console.log('parked c:', JSON.stringify(s.slice(i + 100, i + 330)));
let j = s.indexOf('vehicleNear(e.x,e.z');
console.log('vehicleNear:', JSON.stringify(s.slice(j - 60, j + 220)));
let k = s.indexOf('a=e===`tanker`||e===`bus`');
console.log('mission sizing:', JSON.stringify(s.slice(k - 40, k + 90)));
