// S5 audit: traffic, pedestrians, weather, quality param — what exists?
import fs from 'fs';
const read = (f) => fs.readFileSync('vendor/' + f, 'utf8');
const g = read('game.js'), c = read('city.js'), v = read('vehicles.js'), a = read('audio.js');
const scan = (name, s, pats) => {
  console.log('=== ' + name);
  for (const p of pats) {
    let n = 0, i = s.indexOf(p);
    while (i >= 0 && n < 3) { console.log('  ' + p + ' @' + i + ': ' + JSON.stringify(s.slice(i, i + 120)).slice(0, 120)); n++; i = s.indexOf(p, i + 1); }
    if (!n) console.log('  ' + p + ' : NOT FOUND');
  }
};
scan('game.js', g, ['traffic', 'Traffic', 'pedestrian', 'rain', 'Rain', 'weather', 'Weather', 'monsoon', 'hour>=', 'rush', 'q=', 'quality']);
scan('city.js', c, ['traffic', 'pedestrian', 'rain', 'weather', 'crowd']);
scan('vehicles.js', v, ['spawn', 'despawn', 'traffic', 'count', 'density']);
scan('audio.js', a, ['ambient', 'traffic', 'horn', 'layer']);
// q param handling
const qi = g.indexOf('`q`');
console.log('q param @', qi, qi >= 0 ? JSON.stringify(g.slice(qi - 120, qi + 200)).slice(0, 320) : '');
