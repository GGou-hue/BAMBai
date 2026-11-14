// find the TTS path across vendor files
const fs = require('fs');
const files = fs.readdirSync('vendor').filter(f => f.endsWith('.js'));
for (const f of files) {
  const s = fs.readFileSync('vendor/' + f, 'utf8');
  for (const pat of ['speechSynthesis', 'SpeechSynthesisUtterance']) {
    let i = s.indexOf(pat);
    if (i >= 0) console.log(f, pat, '@' + i, JSON.stringify(s.slice(Math.max(0, i - 150), i + 200)));
  }
}
