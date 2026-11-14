// hud.js: locality list B -> South Mumbai fictional wards; Koramangala strings -> Bambai
import fs from 'fs';
const oldLocals = [["Koramangala 1st Block",12.92772,77.63278],["Koramangala 2nd Block",12.92437,77.62424],["Koramangala 3rd Block",12.92829,77.6254],["Koramangala 4th Block",12.93278,77.62941],["Koramangala 5th Block",12.93484,77.61898],["Koramangala 6th Block",12.93903,77.62385],["Koramangala 7th Block",12.93648,77.61348],["Koramangala 8th Block",12.94087,77.61734],["ST Bed Layout",12.93477,77.63243],["Ejipura",12.94524,77.62748],["Adugodi",12.94402,77.60889],["Madiwala",12.92381,77.61763],["Venkatapura",12.92256,77.63447],["Jakkasandra",12.92435,77.6376],["Maistripalya",12.93302,77.62495],["Sadduguntepalya",12.93155,77.60963],["Maruthi Nagara",12.92245,77.61389],["BTM Layout",12.9190004,77.6112906],["Tavarekere",12.9220045,77.6096347],["Silk Board",12.9168164,77.6223685],["Madiwala",12.92295,77.62375]];
const newLocals = [["Kolvada",18.9067,72.8185],["Kolvada Causeway",18.9122,72.8215],["Killa",18.9305,72.8335],["Ghoda Chowk",18.9288,72.8352],["Moti Haar",18.9255,72.8230],["Sunehri Lines",18.9435,72.8260],["Retibandar",18.9430,72.8130],["Bandar Peth",18.9385,72.8400],["Aath Bazaar",18.9350,72.8330],["Bhatia Wadi",18.9410,72.8290],["Naya Bazaar",18.9400,72.8360],["Rangmahal",18.9340,72.8280]];
const lit = JSON.stringify(oldLocals).replace(/"/g, '`');
for (const f of ['vendor/hud.js', '_source/hud.js']) {
  let s = fs.readFileSync(f, 'utf8');
  const i = s.indexOf('B=[[');
  if (i < 0) { console.log(f, 'B=[[ not found'); continue; }
  const j = s.indexOf('].map(([e,t,n])', i);
  const seg = s.slice(i + 2, j + 1);
  console.log(f, 'old seg matches old list:', seg === lit, 'len', seg.length);
  s = s.slice(0, i + 2) + JSON.stringify(newLocals).replace(/"/g, '`') + s.slice(j + 1);
  s = s.split('Time in Koramangala').join('Time in Bambai');
  s = s.split('<h2>Koramangala</h2>').join('<h2>Bambai</h2>');
  fs.writeFileSync(f, s);
  console.log(f, 'Koramangala left:', (s.match(/Koramangala/g) || []).length);
}
