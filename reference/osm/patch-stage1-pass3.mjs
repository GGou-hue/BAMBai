// insert planarize step 3 into osm2map-stage1.mjs (idempotent)
import fs from 'fs';

const f = 'reference/osm/osm2map-stage1.mjs';
let s = fs.readFileSync(f, 'utf8');
if (s.includes('planarize step 3')) { console.log('already inserted'); process.exit(0); }

const anchor = '  edges.length = 0; edges.push(...edges3);\n  console.log(`planarize: ${splits} edge splits at crossings`);\n}\n';
if (!s.includes(anchor)) { console.log('ANCHOR NOT FOUND'); process.exit(1); }

const pass = `
// --- planarize step 3: resolve endpoint-adjacent defects left by step 2 ---
// (near-duplicate nodes created by splits/snaps never went through the early merge;
//  endpoints lying on another edge's interior were excluded from step 2 by design)
{
  const nodeKey3 = new Map();
  nodes.forEach((p, i) => nodeKey3.set(p[0].toFixed(1) + ',' + p[1].toFixed(1), i));
  let merged3 = 0, snapped3 = 0;
  // (1) union near-duplicate nodes (<= 2.0 u apart), average positions
  {
    const R2 = 2.0, parent = nodes.map((_, i) => i);
    const find = i => { while (parent[i] !== i) { parent[i] = parent[parent[i]]; i = parent[i]; } return i; };
    const g = new Map();
    nodes.forEach((p, i) => {
      const cx = Math.floor(p[0] / R2), cz = Math.floor(p[1] / R2);
      for (let dx = -1; dx <= 1; dx++) for (let dz = -1; dz <= 1; dz++) {
        const k = (cx + dx) + ',' + (cz + dz);
        if (!g.has(k)) g.set(k, []);
        g.get(k).push(i);
      }
    });
    const done = new Set();
    for (const list of g.values()) {
      for (let ii = 0; ii < list.length; ii++) for (let jj = ii + 1; jj < list.length; jj++) {
        const i = find(list[ii]), j = find(list[jj]);
        if (i === j) continue;
        const pk = i < j ? i + '_' + j : j + '_' + i;
        if (done.has(pk)) continue; done.add(pk);
        if (Math.hypot(nodes[i][0] - nodes[j][0], nodes[i][1] - nodes[j][1]) > R2) continue;
        parent[j] = i; merged3++;
      }
    }
    const groups = new Map();
    for (let i = 0; i < nodes.length; i++) {
      const r = find(i);
      if (r === i) continue;
      if (!groups.has(r)) groups.set(r, []);
      groups.get(r).push(i);
    }
    const newPos = nodes.map(p => p.slice());
    for (const [r, list] of groups) {
      let sx = nodes[r][0], sz = nodes[r][1];
      for (const i of list) { sx += nodes[i][0]; sz += nodes[i][1]; }
      newPos[r] = [+(sx / (list.length + 1)).toFixed(1), +(sz / (list.length + 1)).toFixed(1)];
    }
    nodes.length = 0; nodes.push(...newPos);
    const seenE = new Set(); const edges5 = [];
    for (const e of edges) {
      e[0] = find(e[0]); e[1] = find(e[1]);
      if (e[0] === e[1]) continue;
      const k = e[0] < e[1] ? e[0] + '_' + e[1] : e[1] + '_' + e[0];
      if (seenE.has(k)) continue; seenE.add(k);
      edges5.push(e);
    }
    edges.length = 0; edges.push(...edges5);
  }
  // (2) snap endpoints onto edge interiors (<= 2.2 u) and split the target edge
  {
    const CELL3 = 48;
    const grid = new Map();
    edges.forEach((e, ei) => {
      const [x1, z1] = nodes[e[0]], [x2, z2] = nodes[e[1]];
      const n = Math.max(1, Math.ceil(Math.max(Math.abs(x2 - x1), Math.abs(z2 - z1)) / CELL3));
      for (let i = 0; i <= n; i++) {
        const k = Math.floor((x1 + (x2 - x1) * i / n) / CELL3) + ',' + Math.floor((z1 + (z2 - z1) * i / n) / CELL3);
        if (!grid.has(k)) grid.set(k, []);
        if (!grid.get(k).includes(ei)) grid.get(k).push(ei);
      }
    });
    const cuts = new Map(); const moved = new Map();
    for (let ni = 0; ni < nodes.length; ni++) {
      const [nx, nz] = nodes[ni];
      const cx = Math.floor(nx / CELL3), cz = Math.floor(nz / CELL3);
      const seen = new Set();
      for (let dx = -1; dx <= 1; dx++) for (let dz = -1; dz <= 1; dz++) {
        const list = grid.get((cx + dx) + ',' + (cz + dz)); if (!list) continue;
        for (const ei of list) {
          const e = edges[ei];
          if (e[0] === ni || e[1] === ni) continue;
          const ek = e[0] + '_' + e[1];
          if (seen.has(ek)) continue; seen.add(ek);
          const [x1, z1] = nodes[e[0]], [x2, z2] = nodes[e[1]];
          const dx2 = x2 - x1, dz2 = z2 - z1, L22 = dx2 * dx2 + dz2 * dz2 || 1;
          const t = ((nx - x1) * dx2 + (nz - z1) * dz2) / L22;
          if (t < 0.03 || t > 0.97) continue;
          const px = x1 + dx2 * t, pz = z1 + dz2 * t;
          if (Math.hypot(px - nx, pz - nz) > 2.2) continue;
          if (!cuts.has(ek)) cuts.set(ek, []);
          cuts.get(ek).push({ t, pt: [px, pz] });
          moved.set(ni, [px, pz]);
          snapped3++;
        }
      }
    }
    if (cuts.size) {
      const nodeFor = p => {
        const k = p[0].toFixed(1) + ',' + p[1].toFixed(1);
        if (nodeKey3.has(k)) return nodeKey3.get(k);
        const idx = nodes.length; nodes.push([+p[0].toFixed(1), +p[1].toFixed(1)]); nodeKey3.set(k, idx);
        return idx;
      };
      const out = [];
      for (const e of edges) {
        const cs = cuts.get(e[0] + '_' + e[1]);
        if (!cs) { out.push(e); continue; }
        cs.sort((p, q) => p.t - q.t);
        let from = e[0];
        for (const c of cs) {
          const idx = nodeFor(c.pt);
          if (idx !== from) out.push([from, idx, e[2], e[3], e[4], e[5], e[6]]);
          from = idx;
        }
        if (from !== e[1]) out.push([from, e[1], e[2], e[3], e[4], e[5], e[6]]);
      }
      for (const [ni, pt] of moved) { nodes[ni][0] = pt[0]; nodes[ni][1] = pt[1]; }
      edges.length = 0; edges.push(...out);
    }
  }
  // (3) re-run the crossing splitter (interior x interior, same tolerances as step 2)
  {
    const CELL2 = 48;
    const egrid = new Map();
    edges.forEach((e, ei) => {
      const [x1, z1] = nodes[e[0]], [x2, z2] = nodes[e[1]];
      const n = Math.max(1, Math.ceil(Math.max(Math.abs(x2 - x1), Math.abs(z2 - z1)) / CELL2));
      for (let i = 0; i <= n; i++) {
        const k = Math.floor((x1 + (x2 - x1) * i / n) / CELL2) + ',' + Math.floor((z1 + (z2 - z1) * i / n) / CELL2);
        if (!egrid.has(k)) egrid.set(k, []);
        if (!egrid.get(k).includes(ei)) egrid.get(k).push(ei);
      }
    });
    const segInt = (p1, p2, p3, p4) => {
      const d1x = p2[0] - p1[0], d1z = p2[1] - p1[1], d2x = p4[0] - p3[0], d2z = p4[1] - p3[1];
      const den = d1x * d2z - d1z * d2x;
      if (Math.abs(den) < 1e-9) return null;
      const t = ((p3[0] - p1[0]) * d2z - (p3[1] - p1[1]) * d2x) / den;
      const u = ((p3[0] - p1[0]) * d1z - (p3[1] - p1[1]) * d1x) / den;
      if (t < 0.02 || t > 0.98 || u < 0.02 || u > 0.98) return null;
      return [p1[0] + t * d1x, p1[1] + t * d1z, t, u];
    };
    const cuts = edges.map(() => []);
    const tested = new Set();
    for (const list of egrid.values()) {
      for (let ii = 0; ii < list.length; ii++) for (let jj = ii + 1; jj < list.length; jj++) {
        const i = list[ii], j = list[jj];
        const pk = i < j ? i + '_' + j : j + '_' + i;
        if (tested.has(pk)) continue; tested.add(pk);
        const ei = edges[i], ej = edges[j];
        if (ei[0] === ej[0] || ei[0] === ej.b || ei[1] === ej[0] || ei[1] === ej[1]) continue;
        const p = segInt(nodes[ei[0]], nodes[ei[1]], nodes[ej[0]], nodes[ej[1]]);
        if (!p) continue;
        const L1 = Math.hypot(nodes[ei[1]][0] - nodes[ei[0]][0], nodes[ei[1]][1] - nodes[ei[0]][1]) || 1;
        const L2 = Math.hypot(nodes[ej[1]][0] - nodes[ej[0]][0], nodes[ej[1]][1] - nodes[ej[0]][1]) || 1;
        const t1 = ((p[0] - nodes[ei[0]][0]) * (nodes[ei[1]][0] - nodes[ei[0]][0]) + (p[1] - nodes[ei[0]][1]) * (nodes[ei[1]][1] - nodes[ei[0]][1])) / (L1 * L1);
        const t2 = ((p[0] - nodes[ej[0]][0]) * (nodes[ej[1]][0] - nodes[ej[0]][0]) + (p[1] - nodes[ej[0]][1]) * (nodes[ej[1]][1] - nodes[ej[0]][1])) / (L2 * L2);
        cuts[i].push({ t: t1, pt: [p[0], p[1]] }); cuts[j].push({ t: t2, pt: [p[0], p[1]] });
      }
    }
    let sp = 0;
    const out = [];
    for (let ei = 0; ei < edges.length; ei++) {
      const e = edges[ei];
      if (!cuts[ei].length) { out.push(e); continue; }
      cuts[ei].sort((p, q) => p.t - q.t);
      let from = e[0];
      for (const c of cuts[ei]) {
        const k = c.pt[0].toFixed(1) + ',' + c.pt[1].toFixed(1);
        let idx = nodeKey3.get(k);
        if (idx === undefined) { idx = nodes.length; nodes.push([+c.pt[0].toFixed(1), +c.pt[1].toFixed(1)]); nodeKey3.set(k, idx); }
        if (idx !== from) { out.push([from, idx, e[2], e[3], e[4], e[5], e[6]]); from = idx; sp++; }
      }
      if (from !== e[1]) out.push([from, e[1], e[2], e[3], e[4], e[5], e[6]]);
    }
    edges.length = 0; edges.push(...out);
    console.log(\`planarize-3: merged \${merged3} near-dup nodes, snapped \${snapped3} endpoints, \${sp} re-splits\`);
  }
}
`;
s = s.replace(anchor, anchor + pass);
fs.writeFileSync(f, s);
console.log('inserted', pass.length, 'chars');
