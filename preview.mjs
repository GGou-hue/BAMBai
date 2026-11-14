// BAMBai static preview server — replicates vite.config.js serve-recovered-assets mapping.
// Usage: node preview.mjs [port]   (default 8485)
// Serves the recovered game asset folders straight from disk, exactly like the
// original site: /models /textures /audio /fonts /brand /basis (no copying).
import http from 'node:http';
import { createReadStream, existsSync, statSync } from 'node:fs';
import { join, normalize, resolve, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(fileURLToPath(new URL('.', import.meta.url)));

const MAPS = [
  ['models', 'assets'],
  ['textures', 'textures'],
  ['audio', 'audio'],
  ['fonts', 'fonts'],
  ['brand', 'brand'],
  ['art', 'art'],
  ['basis', 'vendor/basis'],
  ['vendor', 'vendor'],
];

const MIME = {
  '.glb': 'model/gltf-binary',
  '.gltf': 'model/gltf+json',
  '.bin': 'application/octet-stream',
  '.ktx2': 'image/ktx2',
  '.webp': 'image/webp',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.webm': 'video/webm',
  '.mp4': 'video/mp4',
  '.mp3': 'audio/mpeg',
  '.ogg': 'audio/ogg',
  '.opus': 'audio/ogg',
  '.m4a': 'audio/mp4',
  '.wav': 'audio/wav',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.json': 'application/json',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.mjs': 'text/javascript',
  '.wasm': 'application/wasm',
  '.txt': 'text/plain',
  '.ico': 'image/x-icon',
  '.html': 'text/html; charset=utf-8',
};

const server = http.createServer((req, res) => {
  let urlPath;
  try { urlPath = decodeURIComponent((req.url || '/').split('?')[0].split('#')[0]); }
  catch { res.writeHead(400); return res.end('bad request'); }
  if (urlPath === '/' || urlPath === '') urlPath = '/index.html';
  const rel = normalize(urlPath).replace(/^([\\/])+/, '');
  const top = rel.split(/[\\/]/)[0];
  const mapping = MAPS.find(([t]) => t === top);
  const file = mapping
    ? resolve(ROOT, mapping[1], rel.slice(top.length + 1))
    : resolve(ROOT, rel);
  if (!file.startsWith(ROOT)) { res.writeHead(403); return res.end('forbidden'); }
  if (!existsSync(file) || !statSync(file).isFile()) { res.writeHead(404); return res.end('not found'); }
  res.writeHead(200, {
    'Content-Type': MIME[extname(file).toLowerCase()] || 'application/octet-stream',
    'Content-Length': statSync(file).size,
    'Cache-Control': 'no-cache',
  });
  if (req.method === 'HEAD') return res.end();
  createReadStream(file).pipe(res);
});

const port = Number(process.argv[2] || process.env.PORT || 8485);
server.listen(port, '::', () => {
  console.log(`[preview] BAMBai serving at http://127.0.0.1:${port}/`);
});
