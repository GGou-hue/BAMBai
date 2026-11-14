// find where street VO files are referenced (text/labels in code)
const fs = require('fs');
const files = ['vendor/audio.js', 'vendor/game.js', 'vendor/life.js', 'vendor/npc.js', 'src/audio.js', 'vendor/audio-mix.js', 'vendor/audio-entry.js'];
for (const f of files) {
  let s;
  try { s = fs.readFileSync(f, 'utf8'); } catch { continue; }
  for (const pat of ['street-shout', 'vendor-', 'whitefield', 'delhi-', 'ident-kempu', 'ident-silkboard', 'ident-hale', 'ident-gully', 'ident-hustle', 'pairs-', 'rj-kempu', 'rj-silkboard', 'ad-cricket', 'ad-sites', 'ad-rainbow', 'ad-xerox', 'radio-1']) {
    let i = s.indexOf(pat);
    if (i >= 0) console.log(f, pat, '@' + i, JSON.stringify(s.slice(Math.max(0, i - 100), i + 120)));
  }
}
