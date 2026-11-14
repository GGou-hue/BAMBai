// Validate the spliced Mumbai map module in Node: import, build layout, dump stats.
import fs from 'fs';
import * as M from '../../reference/osm/mumbai/map-mumbai.js';

const built = M.t; // `$` (the built layout) is exported as `t`
const keys = Object.keys(built);
console.log('keys:', keys.join(','));
console.log('id:', built.id, '| name:', built.name);
console.log('nodes:', built.ROADS?.nodes?.length, 'edges:', built.ROADS?.edges?.length);
console.log('blocks:', built.blocks?.length, 'parks:', built.parks?.length, 'LAKE poly pts:', built.LAKE?.poly?.length);
console.log('footprints:', built.footprints?.list?.length, 'landmarks:', built.landmarks?.length);
console.log('PLACES keys:', Object.keys(built.PLACES ?? {}).length);
console.log('BOUNDS:', JSON.stringify(built.BOUNDS));
console.log('districts:', JSON.stringify(built.districts?.map(d => d.kind)));
fs.writeFileSync('reference/osm/mumbai/dump-mumbai.json', JSON.stringify({
  id: built.id, nodes: built.ROADS?.nodes?.length, edges: built.ROADS?.edges?.length,
  bounds: built.BOUNDS, places: built.PLACES,
}, null, 1));
console.log('OK');
