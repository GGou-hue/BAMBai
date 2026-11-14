// Find raw data variable definitions in the pretty-printed map.js
const fs = require('fs');
const lines = fs.readFileSync('_source/map.pretty.js', 'utf8').split('\n');
const names = ['s', 'b', 'y', 'v', 'S', 'x', 'c', 'f', 'p', 'm', 'h', 'g', 'l', 'u', 'd', 'C', 'w', '_', 'a', 'o', 'i', 'r', 'n', 'et', 'z', 'U', 'it', 'ft', 'St', 'Ct', 'wt', 'Tt', 'Y'];
const out = [];
for (let i = 0; i < lines.length; i++) {
  const l = lines[i];
  for (const nm of names) {
    const re = new RegExp('(?:^|[\\s,;])(' + nm.replace(/\$/g, '\\$') + ')\\s*=\\s*(\\[|\\{)');
    const m = l.match(re);
    if (m) {
      out.push(`${i + 1}: ${nm}=${m[2]} ${l.slice(0, 120).replace(/\s+/g, ' ')}`);
      break;
    }
  }
}
console.log(out.slice(0, 80).join('\n'));
