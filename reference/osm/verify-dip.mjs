// run the engine's ae() dip builder on stage1 data with the new toniqueDip spec
import fs from 'fs';
const src = fs.readFileSync('vendor/map.js', 'utf8');
// extract ae: starts at 'function ae(e,t,n,r){' and ends at the matching close brace
const start = src.indexOf('function ae(e,t,n,r){');
let depth = 0, end = start;
for (let i = src.indexOf('{', start); i < src.length; i++) {
  if (src[i] === '{') depth++;
  else if (src[i] === '}') { depth--; if (depth === 0) { end = i + 1; break; } }
}
const aeSrc = src.slice(start, end);
// ae needs helpers: ee (smoothstep), E (dip profile), D (dip query), re (point-in-poly), ie — extract the cluster
const clStart = src.indexOf('E=(e,t)=>');
// walk back to the start of the helper cluster (ee= definition precedes E)
const eeStart = src.lastIndexOf('ee=', clStart);
if (eeStart < 0) { console.log('ee helper not found'); process.exit(1); }
const reEnd = src.indexOf('ie=(e,t,n,r,i,a)=>{');
const ieEnd2 = src.indexOf('};', reEnd);
// raw slice: comma-chained assignments become implicit globals in the non-strict Function body
const cluster = src.slice(eeStart, ieEnd2 + 1) + ';';
const ae = new Function(cluster + '\nreturn ' + aeSrc)();

const d = JSON.parse(fs.readFileSync('reference/osm/mumbai/stage1.json', 'utf8'));
const nodes = d.nodes, edges = d.edges, names = d.names;
const spec = { id: 'toniqueDip', road: 'Harbour Heights service road', main: 'N Sawant Road', depth: 1.8, upAt: 'N Sawant Road', topW: 3 };
const eObj = edges.map(e => ({ a: e[0], b: e[1], width: e[4], name: names[e[3]] }));
const plan = ae(spec, nodes, eObj, []);
if (!plan) { console.log('PLAN NULL — dip did not build'); process.exit(0); }
console.log('plan keys:', Object.keys(plan).join(','));
console.log('pts:', plan.plan ? plan.plan.pts.length : plan.pts?.length);
const P = plan.plan || plan;
console.log('hw:', P.hw, 'D:', P.D, 'sa:', P.sa?.toFixed?.(1), 'sb:', P.sb?.toFixed?.(1), 'bankW:', P.bankW?.toFixed?.(1), 'mouths:', P.mouths?.length, 'sliver:', P.sliver);
if (P.pts) {
  const xs = P.pts.map(p => p.x), zs = P.pts.map(p => p.z);
  console.log('pts bbox x:', Math.min(...xs).toFixed(0), '..', Math.max(...xs).toFixed(0),
    ' z:', Math.min(...zs).toFixed(0), '..', Math.max(...zs).toFixed(0));
}
if (plan.blocks) console.log('plan.blocks:', plan.blocks.length);
