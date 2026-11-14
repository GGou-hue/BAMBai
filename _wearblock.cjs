// Show the full road-wear worker block in vendor/city.js to see the fallback.
const fs = require('fs');
const s = fs.readFileSync('vendor/city.js', 'utf8');
const i = s.indexOf('function Qu(');
console.log(s.slice(i, i + 2400));
