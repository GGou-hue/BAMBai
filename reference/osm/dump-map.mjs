// Import the original map.js in Node and dump its layout — baseline sanity check.
import * as M from '../../_source/map.js';
import fs from 'fs';
const $ = M.t; // exported as `t` (city.js imports `t as Ee`)
console.log('id:', $.id, 'name:', $.name);
console.log('keys:', Object.keys($).join(','));
console.log('nodes:', $.ROADS.nodes.length, 'edges:', $.ROADS.edges.length);
console.log('blocks:', $.blocks.length, 'landmarks:', $.landmarks.length, 'footprints:', $.footprints.list.length);
console.log('bounds:', JSON.stringify($.BOUNDS));
const out = { id: $.id, name: $.name };
// full dump for diffing against reference/city.json
fs.writeFileSync('reference/osm/dump-baseline.json', JSON.stringify($));
console.log('dumped reference/osm/dump-baseline.json');
