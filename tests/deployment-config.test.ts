import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { expect, test } from 'vitest';

const config = JSON.parse(readFileSync(resolve('public/staticwebapp.config.json'), 'utf8')) as {
  globalHeaders: Record<string, string>;
  routes: Array<{ route: string; headers: Record<string, string> }>;
};
const headersFor = (route: string) => config.routes.find((entry) => entry.route === route)?.headers;

test('ships the required Azure response policies', () => {
  expect(config.globalHeaders['Cache-Control']).toBe('public, max-age=0, must-revalidate');
  expect(config.globalHeaders['Content-Security-Policy']).toContain("default-src 'self'");
  expect(config.globalHeaders['Content-Security-Policy']).toContain('https://api.sociobot.in');
  expect(config.globalHeaders['Permissions-Policy']).toContain('camera=()');
  expect(config.globalHeaders['X-Frame-Options']).toBe('DENY');
  expect(headersFor('/assets/*')?.['Cache-Control']).toBe('public, max-age=31536000, immutable');
  expect(headersFor('/manifest.webmanifest')?.['Content-Type']).toBe('application/manifest+json');
  expect(headersFor('/sw.js')?.['Cache-Control']).toBe('public, max-age=0, must-revalidate');
});
