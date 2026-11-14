// which stale art keys are pinned by key in engine code?
import fs from 'fs';
const idx = JSON.parse(fs.readFileSync('art/index.json', 'utf8'));
const stale = Object.keys(idx.items).filter(k => idx.items[k].stale === 'bangalore');
const files = fs.readdirSync('vendor').filter(f => f.endsWith('.js')).map(f => 'vendor/' + f)
  .concat(fs.readdirSync('src').filter(f => f.endsWith('.js')).map(f => 'src/' + f));
const hits = {};
for (const f of files) {
  const s = fs.readFileSync(f, 'utf8');
  for (const k of stale) if (s.includes(k)) (hits[k] = hits[k] || []).push(f);
}
for (const [k, v] of Object.entries(hits)) console.log(k, '->', v.join(','));
console.log('pinned stale keys:', Object.keys(hits).length, 'of', stale.length);
