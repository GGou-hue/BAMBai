import fs from 'fs';
const m = await import('../../vendor/map.js');
const M = m.t; // map object ($ as t)
const lake = M.LAKE;
const poly = lake && lake.poly;
console.log('LAKE:', lake ? Object.keys(lake) : null);
if (poly) {
  const xs = poly.map(p => p[0]), zs = poly.map(p => p[1]);
  console.log('LAKE poly pts:', poly.length, 'bbox x', Math.min(...xs).toFixed(0), Math.max(...xs).toFixed(0), 'z', Math.min(...zs).toFixed(0), Math.max(...zs).toFixed(0));
  console.log('nan?', poly.some(p => !Number.isFinite(p[0]) || !Number.isFinite(p[1])));
  console.log('waterY', lake.waterY);
}
console.log('ROADS?', 'ROADS' in M, M.ROADS ? 'nodes ' + M.ROADS.nodes.length : '');
console.log('blocks?', 'blocks' in M, Array.isArray(M.blocks) ? M.blocks.length : typeof M.blocks);
console.log('BOUNDS', JSON.stringify(M.BOUNDS));
