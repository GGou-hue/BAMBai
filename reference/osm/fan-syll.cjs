// syllable-peak analysis of fan chant clips: RMS envelope peak counting
const fs = require('fs');
function analyze(file) {
  const b = fs.readFileSync(file);
  // find data chunk
  let i = 12, dataOff = 0, dataSz = 0;
  while (i + 8 <= b.length) {
    const id = b.toString('latin1', i, i + 4), sz = b.readUInt32LE(i + 4);
    if (id === 'data') { dataOff = i + 8; dataSz = sz; break; }
    i += 8 + sz + (sz & 1);
  }
  const rate = b.readUInt32LE(24), ch = b.readUInt16LE(22), bits = b.readUInt16LE(34);
  const bytesPer = ch * bits / 8;
  const n = Math.floor(dataSz / bytesPer);
  // RMS envelope, 10 ms windows
  const win = Math.floor(rate * 0.01);
  const env = [];
  for (let s = 0; s + win < n; s += win) {
    let sum = 0;
    for (let j = 0; j < win; j++) {
      const v = bits === 16 ? b.readInt16LE(dataOff + (s + j) * bytesPer) : b.readFloatLE(dataOff + (s + j) * 4);
      sum += v * v;
    }
    env.push(Math.sqrt(sum / win));
  }
  const max = Math.max(...env);
  const thr = max * 0.25;
  // peak picking with 90 ms min spacing
  const peaks = [];
  const minGap = Math.floor(rate * 0.09 / (rate * 0.01));
  for (let k = 1; k < env.length - 1; k++) {
    if (env[k] > thr && env[k] >= env[k - 1] && env[k] > env[k + 1]) {
      if (!peaks.length || k - peaks[peaks.length - 1] >= minGap) peaks.push(k);
    }
  }
  // group peaks into calls separated by >200ms gaps
  const groups = [];
  const gapWin = 20; // 200 ms
  let cur = [peaks[0]];
  for (let k = 1; k < peaks.length; k++) {
    if (peaks[k] - peaks[k - 1] > gapWin) { groups.push(cur); cur = []; }
    cur.push(peaks[k]);
  }
  if (cur.length) groups.push(cur);
  console.log(file.split(/[\\/]/).pop(), 'peaks:', peaks.length, 'groups:', groups.map(g => g.length).join(','), `(${(env.length / 100).toFixed(1)}s)`);
}
for (const f of ['fan-2.wav', 'fan-6.wav', 'fan-1.wav', 'fan-3.wav']) {
  try { analyze('audio/street/' + f); } catch (e) { console.log(f, 'ERR', e.message); }
}
