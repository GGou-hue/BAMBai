// Surgical patcher v2 for the 10 pinned Bangalore-content art assets (+ 8 night pairs).
// v2: fills use vision-reported panel hexes (day) / band-median sampling (night),
//     wider boxes to cover outlines+shadows (no ghosting), band sampling excludes
//     box interior and borders, night text dimmed 0.7.
import fs from 'fs';
import sharp from 'sharp';

const F = (name) => `art/${name}`;

// regions: box=[left%,top%,w%,h%], fill=panel hex (day), text opts
const SPEC = {
  'shop-signs/SHOP-01.webp': { regions: [
    { box: [20, 5, 60, 33], fill: '#f4cc24', text: { t: 'मरवानी ईरानी दर्शनी', dev: 1, color: '#7a1f1f', size: .6 } },
    { box: [17, 41, 66, 26], fill: '#f4cc24', text: { t: "MERWANI'S IRANI DARSHINI", color: '#0b5a44', size: .66 } },
    { box: [37, 81, 32, 15], fill: '#07533e', text: { t: '022-0000 0000', color: '#f2e8cb', size: .6 } },
  ]},
  'shop-signs/SHOP-02.webp': { regions: [
    { box: [17, 5, 67, 40], fill: '#b71917', text: { t: 'सागर गोमंतक खानावळ', dev: 1, color: '#f7e9c0', size: .58 } },
    { box: [17, 43, 67, 26], fill: '#b71917', text: { t: 'SAGAR GOMANTAK KHANAVAL', color: '#f7e9c0', size: .6 } },
    { box: [40, 80, 24, 13], fill: '#b71917', text: { t: '022-0000 0000', color: '#f7e9c0', size: .6 } },
  ]},
  'shop-signs/SHOP-15.webp': { regions: [
    { box: [17, 2, 67, 40], fill: '#f4c430', text: { t: 'चंदन मिठाई मंदिर', dev: 1, color: '#7a1f1f', size: .58 } },
    { box: [19, 38, 63, 28], fill: '#f4c430', text: { t: 'CHANDAN MITHAI MANDIR', color: '#14523a', size: .62 } },
    { box: [39, 84, 28, 13], fill: '#6b1220', text: { t: '022-0000 0000', color: '#f2e8cb', size: .6 } },
  ]},
  'shop-signs/SHOP-16.webp': { regions: [
    { box: [21, 2, 52, 56], fill: '#ffc629', text: { t: 'फ़ज़लानी बिरयानी', dev: 1, color: '#6f1020', size: .52 } },
    { box: [23, 59, 56, 24], fill: '#6f1020', text: { t: 'FAZLANI BIRYANI HOUSE', color: '#f7e9c0', size: .6 } },
    { box: [37, 90, 32, 10], fill: '#005443', text: { t: '022-0000 0000', color: '#f2e8cb', size: .56 } },
  ]},
  'shop-signs/SHOP-22.webp': { regions: [
    { box: [25, 6, 51, 35], fill: '#8c1023', text: { t: 'पैठनी सिल्क हाऊस', dev: 1, color: '#f0c24b', size: .58 } },
    { box: [22, 43, 59, 30], fill: '#8c1023', text: { t: 'PAITHANI SILK HOUSE', color: '#f5efd8', size: .6, font: 'Georgia' } },
    { box: [39, 82, 28, 14], fill: '#f5bd4c', text: { t: '022-0000 0000', color: '#8c1023', size: .6 } },
  ]},
  'shop-signs/SHOP-28.webp': { regions: [
    { box: [13, 3, 74, 30], fill: '#006967', text: { t: 'बंबई साइट्स अॅन्ड लेआउट्स', dev: 1, color: '#f5c51a', size: .54 } },
    { box: [16, 34, 68, 22], fill: '#006967', text: { t: 'BAMBAI SITES &amp; LAYOUTS', color: '#f5f1d9', size: .64 } },
    { box: [40, 80, 27, 15], fill: '#f4e9c5', text: { t: '022-0000 0000', color: '#006967', size: .6 } },
  ]},
  'shop-signs/SHOP-36.webp': { regions: [
    { box: [17, 9, 68, 32], fill: '#00645d', text: { t: 'हार्बर अर्बन को-ऑप बँक', dev: 1, color: '#f5c51a', size: .56 } },
    { box: [17, 47, 67, 23], fill: '#00645d', text: { t: 'HARBOUR URBAN CO-OP BANK', color: '#f5f1d9', size: .62 } },
    { box: [38, 80, 30, 14], fill: '#f2e8cb', text: { t: '022-0000 0000', color: '#00645d', size: .6 } },
  ]},
  'shop-signs/SHOP-39.webp': { regions: [
    { box: [16, 5, 68, 45], fill: '#f2c21b', text: { t: 'मोगरा फ्लॉवर मार्ट', dev: 1, color: '#8c1f1f', size: .52 } },
    { box: [19, 49, 63, 32], fill: '#f2c21b', text: { t: 'MOGRA FLOWER MART', color: '#14523a', size: .6 } },
    { box: [31, 85, 38, 15], fill: '#075b4c', text: { t: '022-0000 0000', color: '#f2e8cb', size: .58 } },
  ]},
  'banners/BLR-BAR-01.webp': { regions: [
    { box: [24, 29, 21, 34], fill: '#e6deca', text: { t: 'Bambai|Metro', color: '#1765a5', size: .32, font: 'Arial' } },
    { box: [49, 54.5, 52, 12], fill: '#e6deca', text: { t: 'काम सुरू आहे. अडचणीबद्दल आम्ही खेद व्यक्त करतो.', dev: 1, color: '#1765a5', size: .7 } },
  ]},
  'hoardings/HRD-11.webp': { regions: [
    { box: [55, 12, 40, 18], fill: '#064b55', text: { t: 'बंबई', dev: 1, color: '#f5efda', size: .64 } },
    { box: [59, 26, 34, 18], fill: '#064b55', text: { t: 'देख रही है.', dev: 1, color: '#f5c94f', size: .64 } },
    { box: [51, 46, 48, 13], fill: '#fff0c6', text: { t: 'Bambai is watching.', color: '#064b55', size: .62 } },
  ]},
};

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
// spec text uses raw '&' — esc() handles XML escaping
const RAW = (s) => s.replace(/&amp;/g, '&');

async function bandColor(raw, W, H, box, ch = 3) {
  // median of bands above+below the box (and thin left/right bands), excluding box±2
  const [l, t, w, h] = box.map((v) => Math.round(v));
  const samples = [];
  const grab = (x, y) => { const i = (y * W + x) * ch; samples.push([raw[i], raw[i + 1], raw[i + 2]]); };
  for (let x = Math.max(0, l - 8); x < Math.min(W, l + w + 8); x += 2) {
    for (let y = Math.max(0, t - 26); y < Math.max(0, t - 2); y += 2) grab(x, y);
    for (let y = Math.min(H - 1, t + h + 2); y < Math.min(H, t + h + 26); y += 2) grab(x, y);
  }
  for (let y = Math.max(0, t - 8); y < Math.min(H, t + h + 8); y += 2) {
    for (let x = Math.max(0, l - 26); x < Math.max(0, l - 2); x += 2) grab(x, y);
    for (let x = Math.min(W - 1, l + w + 2); x < Math.min(W, l + w + 26); x += 2) grab(x, y);
  }
  if (!samples.length) return null;
  const med = (k) => { const a = samples.map((s) => s[k]).sort((p, q) => p - q); return a[a.length >> 1]; };
  return [med(0), med(1), med(2)];
}

const dim = ([r, g, b], f) => `rgb(${Math.round(r * f)},${Math.round(g * f)},${Math.round(b * f)})`;
const hex2rgb = (h) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];

// inpaint: replace only text/outline pixels inside the box (vertical interpolation), keep panel texture
function inpaintBox(raw, W, H, box, ch) {
  const [l, t, w, h] = box.map((v) => Math.round(v));
  // panel color: median of band, refined to pixels close to it
  const band = [];
  const grab = (x, y) => { const i = (y * W + x) * ch; band.push([raw[i], raw[i + 1], raw[i + 2]]); };
  for (let x = Math.max(0, l - 8); x < Math.min(W, l + w + 8); x += 2) {
    for (let y = Math.max(0, t - 26); y < Math.max(0, t - 2); y += 2) grab(x, y);
    for (let y = Math.min(H - 1, t + h + 2); y < Math.min(H, t + h + 26); y += 2) grab(x, y);
  }
  const med = (arr, k) => { const a = arr.map((s) => s[k]).sort((p, q) => p - q); return a[a.length >> 1]; };
  let pc = [med(band, 0), med(band, 1), med(band, 2)];
  const near = band.filter((s) => Math.hypot(s[0] - pc[0], s[1] - pc[1], s[2] - pc[2]) < 60);
  if (near.length > band.length * .2) pc = [med(near, 0), med(near, 1), med(near, 2)];
  // mask: box pixels far from panel color
  const x0 = Math.max(0, l - 6), x1 = Math.min(W, l + w + 6);
  const y0 = Math.max(0, t - 6), y1 = Math.min(H, t + h + 6);
  const mask = new Uint8Array(W * H);
  for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) {
    const i = (y * W + x) * ch;
    if (Math.hypot(raw[i] - pc[0], raw[i + 1] - pc[1], raw[i + 2] - pc[2]) > 60) mask[y * W + x] = 1;
  }
  // dilate 2px
  const dil = new Uint8Array(mask);
  for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) {
    if (mask[y * W + x]) continue;
    for (let dy = -2; dy <= 2 && !dil[y * W + x]; dy++) for (let dx = -2; dx <= 2; dx++) {
      const yy = y + dy, xx = x + dx;
      if (yy >= 0 && yy < H && xx >= 0 && xx < W && mask[yy * W + xx]) { dil[y * W + x] = 1; break; }
    }
  }
  // per-column vertical interpolation across masked runs
  const out = Buffer.from(raw);
  for (let x = x0; x < x1; x++) {
    let y = y0;
    while (y < y1) {
      if (!dil[y * W + x]) { y++; continue; }
      let y2 = y; while (y2 < y1 && dil[y2 * W + x]) y2++;
      const ia = y - 1 >= 0 ? (y - 1) * W + x : -1;
      const ib = y2 < H ? y2 * W + x : -1;
      for (let yy = y; yy < y2; yy++) {
        const f = (yy - y + 1) / (y2 - y + 1);
        const i = (yy * W + x) * ch;
        for (let c = 0; c < 3; c++) {
          const va = ia >= 0 ? raw[ia * ch + c] : (ib >= 0 ? raw[ib * ch + c] : pc[c]);
          const vb = ib >= 0 ? raw[ib * ch + c] : va;
          out[i + c] = Math.round(va * (1 - f) + vb * f);
        }
      }
      y = y2;
    }
  }
  return out;
}

function textSvg(box, W, H, o, fill, textColor, withRect = true) {
  const [l, t, w, h] = box;
  const lines = String(o.t).split('|');
  const n = lines.length;
  let fs = h * (o.size || .62) * (n > 1 ? .85 : 1);
  const font = o.font || (o.dev ? 'Nirmala UI' : 'Arial Black');
  const weight = o.font === 'Arial' ? 700 : 900;
  const est = Math.max(...lines.map((s) => s.length * fs * (o.dev ? .6 : .68)));
  if (est > w * .96) fs = fs * (w * .96) / est;
  const parts = [];
  if (withRect) parts.push(`<rect x="${(l - 4).toFixed(1)}" y="${(t - 4).toFixed(1)}" width="${(w + 8).toFixed(1)}" height="${(h + 8).toFixed(1)}" fill="${fill}"/>`);
  lines.forEach((s, i) => {
    const cy = t + h * ((i + .5) / n);
    const base = cy + fs * .35;
    parts.push(`<text x="${(l + w / 2).toFixed(1)}" y="${base.toFixed(1)}" text-anchor="middle" font-family="${font}" font-weight="${weight}" font-size="${fs.toFixed(1)}" fill="${textColor}">${esc(s)}</text>`);
  });
  return `<rect x="${(l - 4).toFixed(1)}" y="${(t - 4).toFixed(1)}" width="${(w + 8).toFixed(1)}" height="${(h + 8).toFixed(1)}" fill="${fill}"/>` + parts.join('');
}

let done = 0, failed = [];
const dayBands = {};
const ORIG = (k) => `reference/osm/art-orig/${k}.webp`;
const NIGHT_KEYS = ['SHOP-01','SHOP-02','SHOP-15','SHOP-16','SHOP-22','SHOP-28','SHOP-36','SHOP-39'];
// night/_2 files are RANDOM VARIETY variants in the engine (not time-of-day):
// the hand-weathered _2 art is a repaint that defeats pixel transfer, so the
// clean patched day art is reused as the variant (small variety loss, no artifacts).
async function makeNight(key) {
  fs.copyFileSync(F(`shop-signs/${key}.webp`), F(`shop-signs/${key}_2.webp`));
}
for (const [file, spec] of Object.entries(SPEC)) {
  { // day pass only; night pairs derived after
    const variant = '';
    const url = F(file.replace('.webp', `${variant}.webp`));
    if (!fs.existsSync(url)) { if (!variant) failed.push(url); continue; }
    const buf = fs.readFileSync(url);
    const img = sharp(buf);
    const { data, info } = await img.raw().toBuffer({ resolveWithObject: true });
    const W = info.width, H = info.height;
    const ch = info.channels;
    const isNight = variant === '_2';
    const frags = [];
    let work = null;
    for (const r of spec.regions) {
      r.text.t = RAW(r.text.t);
      const box = [r.box[0] / 100 * W, r.box[1] / 100 * H, r.box[2] / 100 * W, r.box[3] / 100 * H].map(Math.round);
      let fill, tc;
      let withRect = true;
      if (isNight) {
        work = inpaintBox(work || data, W, H, box, ch);
        withRect = false;
        const nb = await bandColor(data, W, H, box, ch);
        const db = dayBands[file]?.[spec.regions.indexOf(r)];
        const f = db ? Math.min(1, Math.max(.45, (nb[0] + nb[1] + nb[2]) / (db[0] + db[1] + db[2]))) : .75;
        tc = dim(hex2rgb(r.text.color), f);
      } else {
        const db = await bandColor(data, W, H, box, ch);
        (dayBands[file] ??= [])[spec.regions.indexOf(r)] = db;
        fill = r.fill;
        tc = r.text.color;
      }
      frags.push(textSvg(box, W, H, r.text, fill, tc, withRect));
    }
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">${frags.join('')}</svg>`;
    const baseImg = work ? sharp(work, { raw: { width: W, height: H, channels: ch } }) : sharp(buf);
    await baseImg.composite([{ input: Buffer.from(svg), top: 0, left: 0 }]).webp({ quality: 90 }).toFile(url + '.tmp');
    fs.copyFileSync(url + '.tmp', url);
    try { fs.unlinkSync(url + '.tmp'); } catch {}
    done++;
    console.log('patched', url);
  }
}
for (const k of NIGHT_KEYS) { await makeNight(k); done++; console.log('night derived', k + '_2'); }
console.log(`done: ${done} patched, failed: ${failed.length ? failed.join(',') : 'none'}`);
