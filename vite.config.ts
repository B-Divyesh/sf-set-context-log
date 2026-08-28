import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { defineConfig, type Plugin } from 'vite';

function productionRouteFallback(): Plugin {
  return {
    name: 'production-route-fallback',
    configurePreviewServer(server) {
      server.middlewares.use((request, response, next) => {
        const pathname = new URL(request.url ?? '/', 'http://local.test').pathname;
        const knownDocuments = new Set(['/', '/demo', '/demo/', '/privacy', '/privacy/', '/terms', '/terms/', '/404', '/404/']);
        const asksForHtml = request.headers.accept?.includes('text/html');
        if (asksForHtml && !knownDocuments.has(pathname) && !pathname.split('/').at(-1)?.includes('.')) {
          response.statusCode = 404;
          response.setHeader('Content-Type', 'text/html; charset=utf-8');
          response.end(readFileSync(resolve('dist/404/index.html')));
          return;
        }
        next();
      });
    },
  };
}

export default defineConfig({
  plugins: [productionRouteFallback()],
  build: {
    target: 'es2022',
    cssCodeSplit: false,
    sourcemap: true,
  },
  server: {
    host: '127.0.0.1',
  },
});
