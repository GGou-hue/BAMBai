import fs from 'fs';
const s = fs.readFileSync('vendor/game.js', 'utf8');
const i = s.indexOf("c(`city`)");
// search backwards for 'c=' closure definitions within the boot function
const back = s.slice(Math.max(0, i - 12000), i);
const re = /[,;{(]c=(e,t)=>|[,;{(]c=e=>|let c=/g;
let m;
while ((m = re.exec(back))) {
  console.log('@' + (i - 12000 + m.index) + ':', JSON.stringify(back.slice(m.index, m.index + 220)).slice(0, 220));
}
