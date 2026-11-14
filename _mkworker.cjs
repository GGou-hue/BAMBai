// Create a stub for the never-captured road-wear worker chunk.
// The real worker only paints cosmetic road-wear (tyre tracks/oil) into a texture;
// vendor/city.js already degrades gracefully when it fails (rwOn stays 0 and the
// shader skips the effect). Shipping the missing file as a no-op removes the 404
// and the `[wear] worker failed` warning from the console while keeping behaviour
// identical to the current fallback.
const fs = require('fs');
const body = `// Stub for the road-wear worker chunk (road-wear.worker-CCso-3Nz.js).
// The original chunk was not captured with the vendored bundle. Road wear is a
// purely cosmetic tyre-track/oil overlay produced off-thread; city.js gates the
// effect on rwOn, which stays 0 when this worker never posts a result, so the
// renderer simply skips it. Posting nothing here matches that fallback exactly,
// while removing the 404 and the [wear] worker failed warning.
export default null;
`;
fs.writeFileSync('vendor/road-wear.worker-CCso-3Nz.js', body);
console.log('wrote vendor/road-wear.worker-CCso-3Nz.js', fs.statSync('vendor/road-wear.worker-CCso-3Nz.js').size, 'bytes');
