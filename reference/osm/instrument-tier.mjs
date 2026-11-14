// instrument stage23's inset ladder with per-tier outcome counts (temporary)
import fs from 'fs';
const f = 'reference/osm/osm2map-stage23.mjs';
let s = fs.readFileSync(f, 'utf8');
if (s.includes('tier35')) { console.log('already instrumented'); process.exit(0); }

const a = 'const insetBlocks = [];';
if (!s.includes(a)) { console.log('anchor missing'); process.exit(1); }
s = s.replace(a, 'const insetBlocks = []; let tierFull = 0, tier6 = 0, tier35 = 0, tierU = 0;');

s = s.replace('  let out = insetOnce(poly, 1);',
  '  let out = insetOnce(poly, 1), tag = 0;');
s = s.replace("if (!insetOk(out)) { out = insetOnce(poly, 0.6); insetFalls++; }",
  "if (!insetOk(out)) { out = insetOnce(poly, 0.6); tag = 1; insetFalls++; }");
s = s.replace("if (!insetOk(out)) { out = insetOnce(poly, 0.35); insetFalls++; }",
  "if (!insetOk(out)) { out = insetOnce(poly, 0.35); tag = 2; insetFalls++; }");
s = s.replace("if (!insetOk(out)) { out = uniformShrink(poly, 0.82); insetFalls++; }",
  "if (!insetOk(out)) { out = uniformShrink(poly, 0.82); tag = 3; insetFalls++; }");
s = s.replace('  if (insetOk(out)) insetBlocks.push(out);',
  '  if (insetOk(out)) { insetBlocks.push(out); if (tag === 0) tierFull++; else if (tag === 1) tier6++; else if (tag === 2) tier35++; else tierU++; }');
s = s.replace('console.log(`inset fallbacks:',
  'console.log(`inset tiers: full=${tierFull} 60%=${tier6} 35%=${tier35} uniform=${tierU}`);\nconsole.log(`inset fallbacks:');
fs.writeFileSync(f, s);
console.log('instrumented');
