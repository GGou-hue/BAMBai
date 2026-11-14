// find where vehicle kinds are chosen for traffic
import fs from 'fs';
const s = fs.readFileSync('vendor/vehicles.js', 'utf8');
const hits = [...s.matchAll(/bus/g)].map(m => m.index);
console.log('bus hits:', hits.length);
for (const h of hits) {
  const ctx = s.slice(Math.max(0, h - 100), h + 30);
  if (/[\`\"][\`a-z,:\-]+$/.test(ctx)) console.log(JSON.stringify(ctx.slice(-130)));
}
