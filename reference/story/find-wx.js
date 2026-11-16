import fs from 'fs';
const s = fs.readFileSync('vendor/weather.js', 'utf8');
const i = s.indexOf('c.has(`rain`)||');
console.log('@', i, JSON.stringify(s.slice(i, i + 240)));
console.log('mirrors:', fs.readFileSync('vendor/weather.js').equals(fs.readFileSync('_source/weather.js')));
