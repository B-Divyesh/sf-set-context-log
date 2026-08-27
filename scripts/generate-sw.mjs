import { createHash } from 'node:crypto';
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join, relative, sep } from 'node:path';

const root = new URL('../dist/', import.meta.url);

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(entries.map(async (entry) => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? walk(path) : [path];
  }));
  return files.flat();
}

const paths = (await walk(root.pathname))
  .filter((path) => !path.endsWith('.map') && !path.endsWith('sw.js'))
  .map((path) => `/${relative(root.pathname, path).split(sep).join('/')}`)
  .sort();
const index = await readFile(new URL('../dist/index.html', import.meta.url));
const version = createHash('sha256').update(index).update(paths.join('|')).digest('hex').slice(0, 12);
const shell = ['/', ...paths];

const serviceWorker = `const VERSION = ${JSON.stringify(version)};
const SHELL_CACHE = 'scl-shell-' + VERSION;
const RUNTIME_CACHE = 'scl-runtime-' + VERSION;
const SHELL = ${JSON.stringify(shell)};

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(SHELL_CACHE);
    await cache.addAll(SHELL);
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    const upgrading = keys.some((key) => key.startsWith('scl-shell-') && key !== SHELL_CACHE);
    await Promise.all(keys.filter((key) => key.startsWith('scl-') && ![SHELL_CACHE, RUNTIME_CACHE].includes(key)).map((key) => caches.delete(key)));
    await self.clients.claim();
    if (upgrading) {
      const clients = await self.clients.matchAll({ type: 'window' });
      clients.forEach((client) => client.postMessage({ type: 'UPDATE_AVAILABLE' }));
    }
  })());
});

self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);

  if (url.hostname.endsWith('sociobot.in') && url.pathname.includes('/api/')) {
    event.respondWith(fetch(request).catch(() => new Response(JSON.stringify({ valid: false, reason: 'offline' }), { status: 503, headers: { 'Content-Type': 'application/json' } })));
    return;
  }

  if (request.mode === 'navigate') {
    event.respondWith((async () => {
      try {
        const response = await fetch(request);
        if (response.ok && url.origin === self.location.origin) (await caches.open(RUNTIME_CACHE)).put(request, response.clone());
        return response;
      } catch {
        return (await caches.match(request)) || (await caches.match('/index.html')) || (await caches.match('/offline.html'));
      }
    })());
    return;
  }

  if (url.origin === self.location.origin) {
    event.respondWith((async () => {
      const cached = await caches.match(request);
      if (cached) return cached;
      const response = await fetch(request);
      if (response.ok) (await caches.open(RUNTIME_CACHE)).put(request, response.clone());
      return response;
    })());
  }
});
`;

await writeFile(new URL('../dist/sw.js', import.meta.url), serviceWorker);
console.log(`Generated sw.js (${version}) with ${shell.length} precached files.`);
