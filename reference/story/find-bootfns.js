import fs from 'fs';
const s = fs.readFileSync('vendor/game.js', 'utf8');
// find local definitions of bn, yr, Wr near the boot (they are module-level in game.js)
for (const name of ["bn=", "yr=", "Wr="]) {
  let idx = -1, count = 0;
  while ((idx = s.indexOf(name, idx + 1)) >= 0 && count < 6) {
    console.log(name + " @" + idx + ":", JSON.stringify(s.slice(idx, idx + 130)).slice(0, 130));
    count++;
  }
  console.log("---");
}
