// Scan the minified map.js var-chain: list top-level NAME= assignments between
// `var n=t(` and `,T=.15` (the raw data chain), tracking bracket depth.
const fs = require('fs');
const s = fs.readFileSync('_source/map.js', 'utf8');
const start = s.indexOf('var n=t(');
const end = s.indexOf(',T=.15');
console.log('chain from', start, 'to', end, 'len', end - start);
let depth = 0, inStr = null;
const hits = [];
for (let i = start; i < end; i++) {
  const c = s[i];
  if (inStr) { if (c === inStr && s[i - 1] !== '\\') inStr = null; continue; }
  if (c === '`' || c === `'` || c === '"') { inStr = c; continue; }
  if (c === '[' || c === '{' || c === '(') { depth++; continue; }
  if (c === ']' || c === '}' || c === ')') { depth--; continue; }
  if (depth === 0 && /[a-zA-Z_$]/.test(c)) {
    // match NAME= at top level
    let j = i; while (j < end && /[a-zA-Z0-9_$]/.test(s[j])) j++;
    if (s[j] === '=') { hits.push([i, s.slice(i, j)]); i = j; }
  }
}
console.log(hits.map(h => h[1] + '@' + h[0]).join('  '));
