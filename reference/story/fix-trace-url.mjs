import fs from 'fs';
for (const p of ['vendor/game.js', '_source/game.js', 'vendor/vehicle.js', '_source/vehicle.js']) {
  let s = fs.readFileSync(p, 'utf8');
  const before = (s.match(/localhost:8124/g) || []).length;
  s = s.split('localhost:8124').join('127.0.0.1:8124');
  fs.writeFileSync(p, s);
  console.log(p, before, '->', (fs.readFileSync(p, 'utf8').match(/127\.0\.0\.1:8124/g) || []).length);
}
