import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const dist = resolve('dist');
const required = (condition, message) => {
  if (!condition) throw new Error(`Deployment configuration check failed: ${message}`);
};
const readJson = (path) => JSON.parse(readFileSync(path, 'utf8'));
const configPath = resolve(dist, 'staticwebapp.config.json');

required(existsSync(resolve(dist, 'index.html')), 'dist/index.html is missing');
required(existsSync(configPath), 'dist/staticwebapp.config.json is missing');

const config = readJson(configPath);
const headers = config.globalHeaders ?? {};
const routes = new Map((config.routes ?? []).map((route) => [route.route, route.headers ?? {}]));

required(headers['Content-Security-Policy']?.includes("default-src 'self'"), 'CSP must restrict the default source to self');
required(headers['Content-Security-Policy']?.includes('https://api.sociobot.in'), 'CSP must permit the production license verifier');
required(headers['Permissions-Policy']?.includes('camera=()'), 'Permissions-Policy must disable unused browser features');
required(headers['X-Frame-Options'] === 'DENY', 'framing must be denied');
required(headers['Cache-Control'] === 'public, max-age=0, must-revalidate', 'documents must revalidate instead of receiving immutable caching');
required(routes.get('/assets/*')['Cache-Control'] === 'public, max-age=31536000, immutable', 'versioned assets must receive immutable caching');
required(config.mimeTypes?.['.webmanifest'] === 'application/manifest+json', 'manifest must have the web manifest MIME type');
required(routes.get('/sw.js')['Cache-Control'] === 'public, max-age=0, must-revalidate', 'service worker must revalidate on every check');

const html = readFileSync(resolve(dist, 'index.html'), 'utf8');
const hero = '/assets/panel-memory-c9dfb7b9.webp';
required(html.includes(hero), 'HTML must reference the content-versioned hero asset');
required(existsSync(resolve(dist, `.${hero}`)), 'content-versioned hero asset is missing');
required(!existsSync(resolve(dist, 'assets/panel-memory.webp')), 'unversioned hero asset must not be deployed with immutable asset caching');
required(readdirSync(resolve(dist, 'assets')).filter((file) => !file.endsWith('.map')).every((file) => /-[A-Za-z0-9_-]{8,}\./.test(file)), 'every immutable /assets file must have a content version in its name');

console.log('Verified Azure Static Web Apps cache, manifest, and response-policy configuration.');
