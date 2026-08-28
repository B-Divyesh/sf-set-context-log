import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { expect, test, type Download, type Page } from '@playwright/test';

async function openApp(page: Page, path: '/' | '/?demo=1'): Promise<void> {
  await page.goto(path);
  await expect(page.locator('#set-form')).toHaveAttribute('data-ready', 'true');
}

async function logSet(page: Page, values: { exercise: string; weight?: string; unit?: 'kg' | 'lb'; reps?: string; effort?: string; note?: string; markers?: string[] }): Promise<void> {
  await page.getByLabel(/Exercise/).fill(values.exercise);
  await page.getByLabel(/Weight \(required\)/).fill(values.weight ?? '100');
  if (values.unit) await page.getByLabel('Weight unit').selectOption(values.unit);
  await page.getByLabel(/Reps \(required\)/).fill(values.reps ?? '5');
  if (values.effort) await page.getByLabel(/Effort/).fill(values.effort);
  if (values.note) await page.getByLabel(/Set context/).fill(values.note);
  for (const marker of values.markers ?? []) await page.locator(`label:has(input[name="marker"][value="${marker}"]) span`).click();
  await page.getByRole('button', { name: 'Log this set' }).click();
  await expect(page.locator('#session-list').getByText(values.exercise, { exact: true })).toBeVisible();
}

async function textFromDownload(download: Download): Promise<string> {
  const stream = await download.createReadStream();
  const chunks: Buffer[] = [];
  for await (const chunk of stream) chunks.push(Buffer.from(chunk));
  return Buffer.concat(chunks).toString('utf8');
}

async function exportedJson(page: Page): Promise<{ schema: string; sets: Array<Record<string, unknown>> }> {
  const pending = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export JSON' }).click();
  return JSON.parse(await textFromDownload(await pending)) as { schema: string; sets: Array<Record<string, unknown>> };
}

test('@claim:demo-isolation seeds, resets, and leaves real records untouched', async ({ page }) => {
  await openApp(page, '/');
  await logSet(page, { exercise: 'Real baseline', weight: '80' });
  await openApp(page, '/?demo=1');
  await expect(page).toHaveTitle('Demo — Set Context Log');
  await expect(page.getByText('Demo — sample data, nothing is saved')).toBeVisible();
  await expect(page.getByText('Real baseline')).toHaveCount(0);
  await expect(page.locator('.history-table tbody tr')).toHaveCount(6);
  await logSet(page, { exercise: 'Demo-only row', weight: '40' });
  await page.getByRole('button', { name: 'Reset demo' }).click();
  await expect(page.getByText('Demo-only row')).toHaveCount(0);
  const names = await page.evaluate(async () => (await indexedDB.databases()).map((item) => item.name));
  expect(names).toContain('set-context-log');
  expect(names).toContain('demo:set-context-log');
  await page.getByRole('link', { name: 'Start for real' }).click();
  await expect(page).toHaveURL(/\/$/);
  await expect(page.locator('#session-list').getByText('Real baseline')).toBeVisible();
  await expect(page.getByText('Demo-only row')).toHaveCount(0);
});

test('@claim:set-fields records all set fields and six markers', async ({ page }) => {
  await openApp(page, '/?demo=1');
  const markers = ['Clean', 'Grip', 'Pause', 'Tempo', 'Form', 'Easy'];
  await logSet(page, { exercise: 'Front squat', weight: '87.5', unit: 'lb', reps: '4', effort: '8.5', note: 'Brace held on every rep', markers });
  const bundle = await exportedJson(page);
  const saved = bundle.sets.find((entry) => entry.exercise === 'Front squat');
  expect(saved).toMatchObject({ weight: 87.5, unit: 'lb', reps: 4, rpe: 8.5, note: 'Brace held on every rep', markers });
});

test('@claim:last-session-recall shows numbers, markers, and note before entry', async ({ page }) => {
  await openApp(page, '/?demo=1');
  const recall = page.locator('#recall-card');
  await expect(recall).toBeVisible();
  await expect(recall.getByRole('heading', { name: 'Last-session context: Back squat' })).toBeVisible();
  await expect(recall.getByText('100 kg × 5 @ 8', { exact: true })).toBeVisible();
  await expect(recall.getByText(/Pause/)).toBeVisible();
  await expect(recall.getByText('Two-second pause')).toBeVisible();
});

test('@claim:local-storage persists locally and erases through settings', async ({ page, browser }) => {
  const origins = new Set<string>();
  page.on('request', (request) => origins.add(new URL(request.url()).origin));
  await openApp(page, '/?demo=1');
  await logSet(page, { exercise: 'Local-only set', note: 'Kept in demo storage' });
  await page.reload();
  await expect(page.locator('#session-list').getByText('Local-only set')).toBeVisible();
  await page.getByRole('button', { name: 'Change settings' }).click();
  await page.getByRole('button', { name: 'Erase all local data' }).click();
  await page.getByRole('button', { name: 'Erase all data' }).click();
  await expect(page.getByText('Local-only set')).toHaveCount(0);
  expect([...origins]).toEqual(['http://127.0.0.1:4173']);
  const names = await page.evaluate(async () => (await indexedDB.databases()).map((item) => item.name));
  expect(names).toEqual(['demo:set-context-log']);
  const fallbackContext = await browser.newContext();
  await fallbackContext.addInitScript(() => { delete (window as Window & { indexedDB?: IDBFactory }).indexedDB; });
  const fallbackPage = await fallbackContext.newPage();
  await fallbackPage.goto('/?demo=1');
  const fallbackKeys = await fallbackPage.evaluate(() => Object.keys(localStorage));
  expect(fallbackKeys).toContain('demo:scl_sets_v1');
  expect(fallbackKeys).not.toContain('scl_sets_v1');
  await fallbackContext.close();
});

test('@claim:json-export downloads the complete seeded backup', async ({ page }) => {
  await openApp(page, '/?demo=1');
  const bundle = await exportedJson(page);
  expect(bundle.schema).toBe('set-context-log/v1');
  expect(bundle.sets).toHaveLength(6);
  expect(new Set(bundle.sets.map((entry) => entry.id)).size).toBe(6);
});

test('@claim:csv-export includes every row and escapes set context', async ({ page }) => {
  await openApp(page, '/?demo=1');
  await logSet(page, { exercise: 'Row, test', unit: 'lb', markers: ['Grip'], note: 'Slow, "clean"' });
  const pending = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export CSV' }).click();
  const csv = await textFromDownload(await pending);
  expect(csv).toContain('performed_at,session_id,exercise,weight,unit,reps,rpe,markers,note');
  expect(csv).toContain('"Row, test",100,lb,5,,Grip,"Slow, ""clean"""');
  expect(csv.trim().split('\n')).toHaveLength(8);
});

test('@claim:json-import-merge keeps a duplicate and adds a new ID', async ({ page }) => {
  await openApp(page, '/');
  const base = { schema: 'set-context-log/v1', exportedAt: '2026-08-28T08:00:00.000Z', settings: { defaultUnit: 'kg' } };
  const first = { id: 'stable', exercise: 'Bench press', weight: 100, unit: 'kg', reps: 5, rpe: 8, markers: ['Pause'], note: 'Original', performedAt: '2026-08-28T08:00:00.000Z', sessionId: 'session-a' };
  await page.locator('#import-json').setInputFiles({ name: 'first.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify({ ...base, sets: [first] })) });
  const added = { ...first, id: 'added', exercise: 'Deadlift', weight: 140 };
  await page.locator('#import-json').setInputFiles({ name: 'merge.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify({ ...base, sets: [{ ...first, weight: 999, note: 'Changed' }, added] })) });
  const bundle = await exportedJson(page);
  expect(bundle.sets).toHaveLength(2);
  expect(bundle.sets.find((entry) => entry.id === 'stable')).toMatchObject({ weight: 100, note: 'Original' });
  expect(bundle.sets.find((entry) => entry.id === 'added')).toMatchObject({ exercise: 'Deadlift', weight: 140 });
});

test('@claim:unit-preservation keeps saved units when the default changes', async ({ page }) => {
  await openApp(page, '/');
  await logSet(page, { exercise: 'Press', weight: '50', unit: 'kg' });
  await page.getByRole('button', { name: 'Change settings' }).click();
  await page.getByLabel('Default unit for new sets').selectOption('lb');
  await page.getByRole('button', { name: 'Save settings' }).click();
  await expect(page.getByLabel('Weight unit')).toHaveValue('lb');
  const bundle = await exportedJson(page);
  expect(bundle.sets.find((entry) => entry.exercise === 'Press')?.unit).toBe('kg');
});

test('@claim:session-history groups all seeded sets into sessions', async ({ page }) => {
  await openApp(page, '/?demo=1');
  await expect(page.locator('.history-day')).toHaveCount(4);
  await expect(page.locator('.history-table tbody tr')).toHaveCount(6);
  await expect(page.locator('.history-day h3').filter({ hasText: '2 sets' })).toHaveCount(2);
});

test('@claim:same-day-sessions recalls a finished session on the same date', async ({ page }) => {
  await openApp(page, '/');
  await logSet(page, { exercise: 'Back squat', weight: '90', note: 'Morning session' });
  await page.getByRole('button', { name: 'Finish session' }).click();
  await expect(page.locator('#session-list li')).toHaveCount(0);
  await expect(page.locator('#recall-card').getByText('Morning session')).toBeVisible();
  await logSet(page, { exercise: 'Back squat', weight: '92.5', note: 'Evening session' });
  await expect(page.locator('.history-day')).toHaveCount(2);
});

test('@claim:offline-reload keeps the demo usable without a network', async ({ page, context }) => {
  await openApp(page, '/?demo=1');
  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.reload();
  await context.setOffline(true);
  await page.reload();
  await expect(page.getByText('Demo — sample data, nothing is saved')).toBeVisible();
  await expect(page.getByRole('status').filter({ hasText: 'Offline' })).toBeVisible();
  await logSet(page, { exercise: 'Offline press', weight: '42.5' });
  await page.reload();
  await expect(page.locator('#session-list').getByText('Offline press')).toBeVisible();
});

test('@claim:anonymous-runtime loads no account or third-party runtime', async ({ page }) => {
  const requests: string[] = [];
  page.on('request', (request) => requests.push(request.url()));
  await openApp(page, '/?demo=1');
  await page.waitForLoadState('networkidle');
  const resources = await page.evaluate(() => performance.getEntriesByType('resource').map((entry) => entry.name));
  expect([...requests, ...resources].every((value) => new URL(value).origin === 'http://127.0.0.1:4173')).toBe(true);
  await expect(page.locator('input[type="password"], input[type="email"]')).toHaveCount(0);
  await expect(page.getByText(/sign in|log in|analytics|sync/i)).toHaveCount(0);
  await expect(page.getByRole('button', { name: /generate|plan workout/i })).toHaveCount(0);
});

test('@claim:free-use exposes the complete product without purchase UI', async ({ page }) => {
  await openApp(page, '/');
  for (const name of ['Log this set', 'Export JSON', 'Export CSV', 'Change settings', 'Erase all local data']) {
    if (name === 'Erase all local data') {
      await page.getByRole('button', { name: 'Change settings' }).click();
      await expect(page.getByRole('button', { name })).toBeEnabled();
      await page.getByRole('button', { name: 'Close settings' }).click();
    } else await expect(page.getByRole('button', { name })).toBeEnabled();
  }
  await expect(page.getByText(/buy|purchase|license|checkout|\$9/i)).toHaveCount(0);
});

test('@claim:build-output emits the app, demo document, and versioned worker', async () => {
  expect(readFileSync(resolve('dist/index.html'), 'utf8')).toContain('<title>Set Context Log — log what changed each set</title>');
  expect(readFileSync(resolve('dist/demo/index.html'), 'utf8')).toContain('<title>Demo — Set Context Log</title>');
  expect(readFileSync(resolve('dist/sw.js'), 'utf8')).toMatch(/const VERSION = "[a-f0-9]{12}"/);
});

test('@claim:deployment-policy applies static headers and a real 404', async ({ page }) => {
  const config = JSON.parse(readFileSync(resolve('public/staticwebapp.config.json'), 'utf8')) as Record<string, any>;
  expect(config.routes.find((route: any) => route.route === '/assets/*').headers['Cache-Control']).toContain('immutable');
  expect(config.mimeTypes['.webmanifest']).toBe('application/manifest+json');
  expect(config.globalHeaders['Content-Security-Policy']).toContain("default-src 'self'");
  expect(config.globalHeaders['Permissions-Policy']).toContain('camera=()');
  expect(config.responseOverrides['404']).toEqual({ rewrite: '/404/index.html', statusCode: 404 });
  const response = await page.goto('/definitely-not-a-real-route');
  expect(response?.status()).toBe(404);
  await expect(page).toHaveTitle('Page not found — Set Context Log');
});

test('@claim:site-routes gives each document complete structure and metadata', async ({ page }) => {
  const routes = [
    ['/', 'Set Context Log — log what changed each set', 'https://set-context-log.sociobot.in/'],
    ['/demo', 'Demo — Set Context Log', 'https://set-context-log.sociobot.in/demo'],
    ['/privacy/', 'Privacy — Set Context Log', 'https://set-context-log.sociobot.in/privacy/'],
    ['/terms/', 'Terms — Set Context Log', 'https://set-context-log.sociobot.in/terms/'],
  ];
  for (const [route, title, canonical] of routes) {
    const response = await page.goto(route);
    expect(response?.status()).toBe(200);
    await expect(page).toHaveTitle(title);
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.locator('main')).toHaveCount(1);
    await expect(page.locator('header')).toHaveCount(1);
    await expect(page.locator('footer')).toHaveCount(1);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', canonical);
    await expect(page.locator('meta[property="og:image"]')).toHaveAttribute('content', /og-image\.png$/);
    await expect(page.locator('footer').getByRole('link', { name: 'Privacy', exact: true })).toHaveCount(1);
    await expect(page.locator('footer').getByRole('link', { name: 'Terms', exact: true })).toHaveCount(1);
    if (route === '/privacy/' || route === '/terms/') await expect(page.locator('h1')).toBeFocused();
  }
});

test('@claim:art-provenance verifies the original and derived image records', async () => {
  const source = readFileSync(resolve('assets/src/panel-memory.png'));
  const optimized = readFileSync(resolve('public/assets/panel-memory-c9dfb7b9.webp'));
  const share = readFileSync(resolve('public/og-image.png'));
  const design = readFileSync(resolve('.factory/design.md'), 'utf8');
  const sha = (value: Buffer) => createHash('sha256').update(value).digest('hex');
  expect(sha(source)).toBe('ce7c71989782fb614916672e9bf7bf47dca815f547e3876335dbe47dc97d6019');
  expect(sha(optimized)).toBe('c9dfb7b9e51933b2d92ada8d8c925f7baa6c85caa197fb63b0905c31f95374fd');
  expect(readFileSync(resolve('assets/src/panel-memory.prompt.json'), 'utf8')).toContain('no readable or pseudo-readable text');
  expect(design).toContain('original AI-generated asset commissioned for this product');
  expect(share.readUInt32BE(16)).toBe(1200);
  expect(share.readUInt32BE(20)).toBe(630);
});
