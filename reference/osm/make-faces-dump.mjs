// Diagnostic: dump ALL faces from the road graph (no filters) to faces-all.json
import fs from 'fs';
let src = fs.readFileSync('reference/osm/osm2map-stage23.mjs', 'utf8');
src = src.replace('const blocks = [], faceDebug = []; const dropStats={border:0,size:0,covered:0};', 'const blocks = [], faceDebug = []; const dropStats={border:0,size:0,covered:0}; const faceDump=[];');
src = src.replace(/if \(touchesBorder\) \{ dropStats\.border\+\+; continue; \}/, 'if (touchesBorder) { dropStats.border++; }');
src = src.replace(/if \(A < 250 \|\| A > 200000\) \{ dropStats\.size\+\+; if \(A > dropStats\.sizeMaxA\) dropStats\.sizeMaxA = Math\.round\(A\); continue; \}/, 'if (A < 250 || A > 200000) { dropStats.size++; }');
src = src.replace(/if \(covered\) \{ dropStats\.covered\+\+; continue; \}/, 'if (covered) { dropStats.covered++; }');
src = src.replace('blocks.push(poly);', 'faceDump.push(poly);');
src += `\n;fs.writeFileSync('reference/osm/mumbai/faces-all.json', JSON.stringify(faceDump.map(p => ({ A: Math.round(Math.abs(area2(p))), poly: p.map(q => [+q[0].toFixed(1), +q[1].toFixed(1)]) }))));\n`;
fs.writeFileSync('reference/osm/tmp-faces.mjs', src);
