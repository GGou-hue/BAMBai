// BAMBai service worker (upgrade L3, 2026-10-12): makes a return visit load from the browser's own storage instead of the network.
// Hand-written, no library. Rules, safest first:
//  - The page itself (navigations, index.html) always goes to the network first; the cached copy is only an offline fallback.
//  - Hashed build files (/assets/*: the name changes when the content does) are cache-first.
//  - Big media with plain names (models, textures, audio, art...) are cache-first ONLY while their content hash in
//    sw-manifest.json (written by the build, vite.config.ts) still matches; a changed file is fetched fresh and replaces the old copy.
//  - Anything else, any non-GET, any cross-origin or Range request (streamed music) passes straight through, untouched.
//  - Kill switch: a manifest with "kill": true (or opening the game with ?nosw=1) unregisters this worker and empties its cache.
const CACHE = 'nu-media-v1';
const MEDIA = /^\/(models|textures|audio|vo|art|music|basis|fonts|brand)\//;
const HASHED = /^\/assets\//;
let manifest = null; // { version, files: { "/models/chars/arjun.glb": "a1b2c3d4", ... } }
let loadingManifest = null;

async function getManifest(fresh) {
  if (manifest && !fresh) return manifest;
  if (loadingManifest && !fresh) return loadingManifest;
  loadingManifest = fetch(new URL('sw-manifest.json', self.registration.scope), { cache: 'no-cache' })
    .then((r) => (r.ok ? r.json() : null))
    .then(async (m) => {
      if (m?.kill) { await caches.delete(CACHE); await self.registration.unregister(); manifest = null; return null; }
      if (m?.files) manifest = m;
      return manifest;
    })
    .catch(() => manifest)
    .finally(() => { loadingManifest = null; });
  return loadingManifest;
}

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil((async () => {
  await self.clients.claim();
  const m = await getManifest(true);
  if (!m) return;
  // Drop copies of files that changed or no longer ship (their key carries the old hash).
  const c = await caches.open(CACHE);
  for (const req of await c.keys()) {
    const u = new URL(req.url), path = scopePath(u), h = u.searchParams.get('_h');
    if (HASHED.test(path)) continue;
    if (!h || m.files[path] !== h) await c.delete(req);
  }
})()));

/** The URL path relative to where the game lives (it may be served from a sub-folder). */
function scopePath(u) {
  const base = new URL(self.registration.scope).pathname;
  return '/' + u.pathname.slice(base.length).replace(/^\//, '');
}

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET' || req.headers.has('range')) return;
  const u = new URL(req.url);
  if (u.origin !== self.location.origin || u.pathname.includes('/ingest/')) return; // analytics proxy (functions/ingest): never cached, never touched
  if (u.searchParams.has('nosw')) { e.respondWith((async () => { await caches.delete(CACHE); await self.registration.unregister(); return fetch(req); })()); return; }
  const path = scopePath(u);
  if (req.mode === 'navigate' || path === '/' || path === '/index.html') { e.respondWith(networkFirst(req)); return; }
  if (HASHED.test(path)) { e.respondWith(cacheFirst(req, req.url)); return; }
  if (MEDIA.test(path)) { e.respondWith(media(req, path)); return; }
});

async function networkFirst(req) {
  const c = await caches.open(CACHE);
  try {
    const r = await fetch(req);
    if (r.ok) c.put('/__page', r.clone()).catch(() => {});
    getManifest(true); // a new page may come with a new build: re-read the hashes
    return r;
  } catch (err) {
    const hit = await c.match('/__page');
    if (hit) return hit;
    throw err;
  }
}

async function cacheFirst(req, key) {
  const c = await caches.open(CACHE);
  const hit = await c.match(key);
  if (hit) return hit;
  const r = await fetch(req);
  if (r.ok && r.status === 200 && !(await quotaLow())) c.put(key, r.clone()).catch(() => {});
  return r;
}

async function media(req, path, mode = 'no-cache') {
  const m = await getManifest(false);
  const h = m?.files[path];
  if (!h) return fetch(req); // not in this build's list (or no manifest): plain network, nothing stored
  const key = new URL(req.url); key.search = ''; key.searchParams.set('_h', h);
  return cacheFirst(new Request(req.url, { cache: mode, credentials: 'same-origin' }), key.toString());
}

// First visit: the page loaded before this worker took over, so the page sends the list of files it fetched (game/sw-register.ts) and
// they are copied in from the browser's HTTP cache ('force-cache': this session just downloaded them, so no network).
self.addEventListener('message', (e) => {
  if (e.data?.type !== 'warm' || !Array.isArray(e.data.urls)) return;
  e.waitUntil((async () => {
    for (const url of e.data.urls.slice(0, 2000)) {
      try {
        const u = new URL(url), path = scopePath(u);
        if (u.origin !== self.location.origin || !MEDIA.test(path) || (await quotaLow())) continue;
        await media(new Request(url), path, 'force-cache');
      } catch { /* one bad file never stops the rest */ }
    }
  })());
});

let quotaCheck = 0, low = false;
async function quotaLow() {
  if (Date.now() - quotaCheck < 30000) return low;
  quotaCheck = Date.now();
  try { const { quota = 0, usage = 0 } = await navigator.storage.estimate(); low = quota - usage < 200 * 1048576; } catch { low = false; }
  return low;
}
