// list radio-station-like strings in the build
import fs from 'fs';
const s = fs.readFileSync('vendor/game.js', 'utf8');
const re = /`([^`]{0,44}(?:FM|Radio|Gaan|Raag|Mirchi)[^`]{0,30})`/gi;
const seen = new Set();
let m;
while ((m = re.exec(s))) { const v = m[1]; if (!seen.has(v)) { seen.add(v); console.log(JSON.stringify(v)); } }
// also audio manifest station names
try {
  const mf = JSON.parse(fs.readFileSync('audio/manifest.json', 'utf8'));
  const keys = Object.keys(mf).filter((k) => /radio|station|fm/i.test(k));
  console.log('manifest radio keys:', keys.slice(0, 12));
} catch (e) { console.log('manifest scan skipped:', e.message); }
