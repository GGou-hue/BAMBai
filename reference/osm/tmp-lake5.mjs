import fs from 'fs';
const m = await import('../../vendor/map.js');
console.log('module keys:', Object.keys(m).length, Object.keys(m).slice(0, 20));
const M = m.s ?? m.default ?? m;
console.log('M keys sample:', M && typeof M === 'object' ? Object.keys(M).slice(0, 40) : typeof M);
