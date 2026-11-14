// build contact-sheet HTML files for the kannada:unreviewed art assets
import fs from 'fs';
const idx = JSON.parse(fs.readFileSync('art/index.json', 'utf8'));
const items = Array.isArray(idx.items) ? idx.items : Object.entries(idx.items).map(([k, v]) => ({ key: k, ...v }));
const un = items.filter(i => i.kannada === 'unreviewed');
console.log('unreviewed:', un.length);
const PER = 24;
const sheets = [];
for (let s = 0; s * PER < un.length; s++) {
  const chunk = un.slice(s * PER, (s + 1) * PER);
  const cells = chunk.map((i, j) => {
    const n = s * PER + j + 1;
    return `<div class="cell"><img src="${i.url}"><span class="lab">#${n} ${i.key}</span></div>`;
  }).join('\n');
  const html = `<!doctype html><meta charset="utf8"><style>
body{margin:0;background:#222;font:11px monospace;color:#fff}
.grid{display:grid;grid-template-columns:repeat(4,1fr);gap:6px;padding:6px}
.cell{background:#555;position:relative;height:210px;overflow:hidden}
.cell img{width:100%;height:180px;object-fit:contain;background:#888;display:block}
.lab{position:absolute;bottom:0;left:0;right:0;background:#000c;padding:2px 4px;font-size:13px}
</style><div class="grid">${cells}</div>`;
  fs.writeFileSync(`sheet-k-${s + 1}.html`, html);
  sheets.push({ sheet: s + 1, keys: chunk.map(i => i.key) });
}
fs.writeFileSync('reference/osm/sheet-keys.json', JSON.stringify(sheets, null, 1));
console.log('sheets:', sheets.length);
