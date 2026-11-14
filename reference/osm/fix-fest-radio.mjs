// bangalore.js: Karnataka festival set -> Maharashtra set; audio.js radio names
import fs from 'fs';
const oldA = '{id:`dasara`,y:2026,from:[10,11],to:[10,20]},{id:`ayudha`,y:2026,from:[10,19],to:[10,20]},{id:`rajyotsava`,y:0,from:[10,28],to:[11,1]},{id:`diwali`,y:2026,from:[11,5],to:[11,10]}';
const newA = '{id:`gudipadwa`,y:2026,from:[3,19],to:[3,19]},{id:`dahihandi`,y:2026,from:[9,5],to:[9,5]},{id:`ganesh`,y:2026,from:[9,14],to:[9,19]},{id:`visarjan`,y:2026,from:[9,25],to:[9,25]},{id:`maharashtraday`,y:0,from:[5,1],to:[5,1]},{id:`diwali`,y:2026,from:[11,5],to:[11,10]}';
for (const f of ['vendor/bangalore.js', '_source/bangalore.js']) {
  let s = fs.readFileSync(f, 'utf8');
  if (!s.includes(oldA)) { console.log(f, 'festival literal NOT found'); continue; }
  s = s.split(oldA).join(newA);
  fs.writeFileSync(f, s);
  console.log(f, 'festivals swapped');
}
const radioOld = '{name:`Kempu FM`,kn:`KAMP F\u200cM`,art:`UI-RADIO-01`,dir:`kempu`},{name:`Gully Indie`,kn:`GALLI INDI`,art:`UI-RADIO-02`,dir:`gully`},{name:`Hale Haadu`,kn:`OLD SONGS`,art:`UI-RADIO-03`,dir:`hale`},{name:`Hustle FM`,kn:`HOSTEL F\u200cM`,art:`UI-RADIO-04`,dir:`hustle`},{name:`Silk Board Traffic Radio`,kn:`SILK BOARD TRAFFIC RADIO`,art:`UI-RADIO-05`,dir:`silkboard`}';
const radioNew = '{name:`Bambaiya FM`,kn:`BAMF FM`,art:`UI-RADIO-01`,dir:`kempu`},{name:`Gully Indie`,kn:`GALLI INDI`,art:`UI-RADIO-02`,dir:`gully`},{name:`Hale Gaani`,kn:`OLD SONGS`,art:`UI-RADIO-03`,dir:`hale`},{name:`Hustle FM`,kn:`HOSTEL F\u200cM`,art:`UI-RADIO-04`,dir:`hustle`},{name:`Bambai Traffic Radio`,kn:`BAMBAI TRAFFIC RADIO`,art:`UI-RADIO-05`,dir:`silkboard`}';
for (const f of ['vendor/audio.js', '_source/audio.js']) {
  let s = fs.readFileSync(f, 'utf8');
  const i = s.indexOf('{name:`Kempu FM`');
  if (i < 0) { console.log(f, 'radio list NOT found'); continue; }
  const j = s.indexOf('dir:`silkboard`}', i) + 'dir:`silkboard`}'.length;
  const seg = s.slice(i, j);
  s = s.slice(0, i) + radioNew + s.slice(j);
  fs.writeFileSync(f, s);
  console.log(f, 'radio renamed (matched len', seg.length, ')');
}
