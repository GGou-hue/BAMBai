import fs from 'fs';
const m = await import('../../vendor/map.js');
const M = m.s ?? m.default ?? m;
const lake = M.LAKE ?? (m.LAKE);
const poly = (lake && lake.poly) || null;
console.log('LAKE keys:', lake ? Object.keys(lake) : null);
if (poly) {
  const xs = poly.map(p => p[0]), zs = poly.map(p => p[1]);
  console.log('LAKE poly pts:', poly.length, 'bbox x', Math.min(...xs).toFixed(0), Math.max(...xs).toFixed(0), 'z', Math.min(...zs).toFixed(0), Math.max(...zs).toFixed(0));
  console.log('nan?', poly.some(p => !Number.isFinite(p[0]) || !Number.isFinite(p[1])));
}
