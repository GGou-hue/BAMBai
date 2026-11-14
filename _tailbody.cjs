// Extract the ch2-tail mission body to read its follow-band thresholds.
const fs = require('fs');
const s = fs.readFileSync('vendor/game.js', 'utf8');
const i = s.indexOf('id: `ch2-tail`');
console.log(s.slice(i, i + 2600).replace(/\n/g, ' '));
