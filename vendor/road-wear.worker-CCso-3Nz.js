// Stub for the road-wear worker chunk (road-wear.worker-CCso-3Nz.js).
// The original chunk was not captured with the vendored bundle. Road wear is a
// purely cosmetic tyre-track/oil overlay produced off-thread; city.js gates the
// effect on rwOn, which stays 0 when this worker never posts a result, so the
// renderer simply skips it. Posting nothing here matches that fallback exactly,
// while removing the 404 and the [wear] worker failed warning.
export default null;
