// pixel-verify: count pixels close to the Mother Tower red (0xC8402C) and cream (0xF5F5F5-ish 16119285) in a shot
import sharp from 'sharp';
const file = process.argv[2];
const img = sharp(file);
const { data, info } = await img.raw().toBuffer({ resolveWithObject: true });
const ch = info.channels;
const targetR = [0xc8, 0x40, 0x2c], targetW = [0xf5, 0xf1, 0xd0];
let reds = 0, creams = 0;
const redPts = [], creamPts = [];
for (let i = 0; i < data.length; i += ch) {
  const r = data[i], g = data[i + 1], b = data[i + 2];
  if (Math.abs(r - targetR[0]) < 28 && Math.abs(g - targetR[1]) < 28 && Math.abs(b - targetR[2]) < 28) { reds++; if (redPts.length < 5) redPts.push([i / ch % info.width, Math.floor(i / ch / info.width)]); }
  if (Math.abs(r - targetW[0]) < 20 && Math.abs(g - targetW[1]) < 20 && Math.abs(b - targetW[2]) < 20) { creams++; if (creamPts.length < 5) creamPts.push([i / ch % info.width, Math.floor(i / ch / info.width)]); }
}
console.log(`${file}: ${info.width}x${info.height} ch=${ch} redPx=${reds} creamPx=${creams}`);
console.log('red sample pts:', JSON.stringify(redPts));
