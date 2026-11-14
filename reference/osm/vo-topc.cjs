// convert IEEE-float WAVs to 16-bit PCM for SAPI recognition (into reference/osm/vo-tmp/)
const fs = require('fs');
const path = require('path');
const srcDir = 'audio/street';
const dstDir = 'reference/osm/vo-tmp';
fs.mkdirSync(dstDir, { recursive: true });

function chunks(b) {
  const out = []; let i = 12;
  while (i + 8 <= b.length) {
    const id = b.toString('latin1', i, i + 4), sz = b.readUInt32LE(i + 4);
    out.push({ id, off: i + 8, sz }); i += 8 + sz + (sz & 1);
  }
  return out;
}

let conv = 0, skip = 0;
for (const f of fs.readdirSync(srcDir).filter(f => f.endsWith('.wav'))) {
  const dst = path.join(dstDir, f);
  if (fs.existsSync(dst)) { skip++; continue; }
  const b = fs.readFileSync(path.join(srcDir, f));
  const cs = chunks(b);
  const fmt = cs.find(c => c.id === 'fmt ');
  const data = cs.find(c => c.id === 'data');
  const tag = b.readUInt16LE(fmt.off);
  if (tag !== 3) { fs.copyFileSync(path.join(srcDir, f), dst); conv++; continue; } // already PCM
  const rate = b.readUInt32LE(fmt.off + 4), ch = b.readUInt16LE(fmt.off + 10);
  const n = data.sz >> 2;
  const pcm = Buffer.alloc(n * 2);
  for (let i = 0; i < n; i++) {
    let v = b.readFloatLE(data.off + i * 4);
    v = Math.max(-1, Math.min(1, v));
    pcm.writeInt16LE(v < 0 ? v * 32768 : v * 32767, i * 2);
  }
  const hdr = Buffer.alloc(44);
  hdr.write('RIFF', 0); hdr.writeUInt32LE(36 + pcm.length, 4); hdr.write('WAVE', 8);
  hdr.write('fmt ', 12); hdr.writeUInt32LE(16, 16); hdr.writeUInt16LE(1, 20);
  hdr.writeUInt16LE(ch, 22); hdr.writeUInt32LE(rate, 24);
  hdr.writeUInt32LE(rate * ch * 2, 28); hdr.writeUInt16LE(ch * 2, 32);
  hdr.writeUInt16LE(16, 34); hdr.write('data', 36); hdr.writeUInt32LE(pcm.length, 40);
  fs.writeFileSync(dst, Buffer.concat([hdr, pcm]));
  conv++;
}
console.log('converted', conv, 'skipped(existing)', skip);
