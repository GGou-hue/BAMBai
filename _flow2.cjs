// Show the rest of offerNext() - how walking into the blip starts the mission.
const fs = require('fs');
const s = fs.readFileSync('vendor/game.js', 'utf8');
const i = s.indexOf('offerNext(){');
console.log(s.slice(i, i + 1700).replace(/\n/g, ' '));
