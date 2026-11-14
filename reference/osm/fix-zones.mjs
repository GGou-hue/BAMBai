// game.js: traffic/flood jam zones km[] were Koramangala-specific (labels, road
// names, coords). Replace with South Mumbai equivalents on the new map.
// Coords from the stage1 projection: x=(lon-72.830)*52650, z=-(lat-18.925)*55270.
import fs from 'fs';
const oldKm = '[{id:`underpass`,label:`the Madiwala underpass`,struct:`madiwalaUnderpass`,lag:1.15},{id:`flyover`,label:`the road under the Mahayogi Vemana flyover`,roads:[`Mahayogi Vemana Road`],c:[100,320],R:80,maxD:.75},{id:`80ft`,label:`80 Feet Road`,roads:[`80 Feet Road`],c:[465,-185],R:110,maxD:.85},{id:`srinivagilu`,label:`Srinivagilu Main Road`,roads:[`Srinivagilu Main Road`],c:[290,-445],R:105,maxD:.8},{id:`ejipura`,label:`Ejipura Main Road`,roads:[`Ejipura Main Road`],c:[640,-490],R:110,maxD:.9},{id:`silkboard`,label:`Silk Board junction`,roads:[`Outer Ring Road`],c:[215,925],R:95,maxD:.75}]';
const newKm = '[{id:`underpass`,label:`the Bandar underpass`,struct:`madiwalaUnderpass`,lag:1.15},{id:`flyover`,label:`the road under the Juna Flyover`,roads:[`Juna Flyover`],c:[211,-1050],R:80,maxD:.75},{id:`motihaar`,label:`Moti Haar Marg`,roads:[`Moti Haar Marg`],c:[-369,-28],R:110,maxD:.85},{id:`killamarket`,label:`Aath Bazaar lanes`,roads:[`Killa Marg`],c:[184,-304],R:105,maxD:.8},{id:`bandar`,label:`Bandar Road`,roads:[`Bandar Road`],c:[527,-747],R:110,maxD:.9},{id:`station`,label:`Station Bus Stand Road`,roads:[`Station Bus Stand Road`],c:[280,-800],R:95,maxD:.75}]';
for (const f of ['vendor/game.js', '_source/game.js']) {
  let s = fs.readFileSync(f, 'utf8');
  if (!s.includes(oldKm)) { console.log(f, 'km literal NOT found'); continue; }
  s = s.split(oldKm).join(newKm);
  fs.writeFileSync(f, s);
  console.log(f, 'km zones swapped');
}
