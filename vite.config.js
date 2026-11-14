import { defineConfig } from 'vite';
import { readFileSync, existsSync, statSync } from 'node:fs';
import { join, extname, normalize, resolve } from 'node:path';

// Serves the recovered game asset folders straight from disk (no copying).
// The vendored engine resolves asset paths against the document base, exactly
// like the original site: /models /textures /audio /fonts /brand /basis.
//   /models/**        -> ./assets/**      (recovered GLBs)
//   /textures|audio|fonts|brand/** -> same-named dir
//   /basis/**         -> ./vendor/basis/**  (KTX2 basis transcoder)

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
  '.ktx2': 'image/ktx2',
  '.webp': 'image/webp',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.webm': 'video/webm',
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
  '.wasm': 'application/wasm',
  '.txt': 'text/plain',
};

function serveAssets() {
  return {
    name: 'serve-recovered-assets',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const url = (req.url || '').split('?')[0];
        const top = url.replace(/^\//, '').split('/')[0];
        const root = MAPS.find(([t]) => t === top);
        if (!root) return next();
        const rel = normalize(decodeURIComponent(url)).replace(/^([\\/])(?=[^/])/, '');
        const file = resolve(process.cwd(), root[1], rel.slice(root[0].length + 1));
        if (!file.startsWith(resolve(process.cwd())) || !existsSync(file) || !statSync(file).isFile()) {
          res.statusCode = 404;
          return res.end('not found');
        }
        res.setHeader('Content-Type', MIME[extname(file).toLowerCase()] || 'application/octet-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.end(readFileSync(file));
      });
    },
  };
}

export default defineConfig({
  plugins: [serveAssets()],
  server: { port: 5173 },
  preview: { port: 5173 },
  build: { target: 'es2022', chunkSizeWarningLimit: 1500 },
});
