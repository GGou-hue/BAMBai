const fs = require('fs');
const s = fs.readFileSync('C:/Users/User4/Downloads/BAMBai/vendor/game.js', 'utf8');
const i = s.indexOf('Tx=[{name:`BRO`');
console.log(s.slice(i, i + 4000));
