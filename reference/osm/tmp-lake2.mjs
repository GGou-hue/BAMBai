import fs from 'fs';
const s = fs.readFileSync('vendor/map.js', 'utf8');
// find definition of Y (LAKE poly). Search backwards from LAKE usage for 'Y=' candidates near coastline code
for (const pat of ['var Y=', ',Y=', 'let Y=']) {
  let i = s.indexOf(pat);
  while (i >= 0 && i < 1390869) {
    console.log(pat, '@', i, ':', JSON.stringify(s.slice(i, i + 200)).slice(0, 200));
    i = s.indexOf(pat, i + 1);
    if (i > 1300000) break;
  }
}
