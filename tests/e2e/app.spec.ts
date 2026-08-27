import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

test('logs, persists, recalls, and exports a set', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/Set Context Log/);
  await expect(page.locator('h1')).toHaveCount(1);
  await page.getByLabel('Exercise').fill('Back squat');
  await page.getByLabel('Weight').fill('102.5');
  await page.getByLabel('Reps').fill('5');
  await page.getByLabel('RPE (optional)').fill('8.5');
  await page.getByText('Form', { exact: true }).click();
  await page.getByLabel('One useful detail (optional)').fill('Left knee steady');
  await page.getByRole('button', { name: 'Log this set' }).click();
  await expect(page.getByText('102.5 kg × 5 · RPE 8.5')).toBeVisible();
  await page.reload();
  await expect(page.getByText('Left knee steady')).toBeVisible();

  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export JSON' }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toMatch(/^set-context-log-.*\.json$/);
});

test('imports a prior session and opens recall for that exercise', async ({ page }) => {
  await page.goto('/');
  const backup = {
    schema: 'set-context-log/v1',
    exportedAt: '2026-08-27T08:00:00.000Z',
    settings: { defaultUnit: 'lb' },
    sets: [{
      id: 'prior-bench-1', exercise: 'Bench press', weight: 185, unit: 'lb', reps: 6, rpe: 8,
      markers: ['Pause'], note: 'Long first pause', performedAt: '2026-08-20T08:00:00.000Z', sessionId: '2026-08-20',
    }],
  };
  await page.locator('#import-json').setInputFiles({ name: 'backup.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(backup)) });
  await page.getByLabel('Exercise').fill('Bench press');
  await expect(page.getByText(/Last time: Bench press/)).toBeVisible();
  await expect(page.getByText('Long first pause')).toBeVisible();
  await expect(page.getByLabel('Weight unit')).toHaveValue('lb');
});

test('has no serious accessibility violations at mobile width', async ({ page }) => {
  await page.goto('/');
  const results = await new AxeBuilder({ page }).analyze();
  const serious = results.violations.filter((violation) => ['serious', 'critical'].includes(violation.impact ?? ''));
  expect(serious).toEqual([]);
});

test('reopens offline after the service worker is ready', async ({ page, context }) => {
  await page.goto('/');
  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.reload();
  await context.setOffline(true);
  await page.reload();
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Remember the set');
  await expect(page.getByRole('status').filter({ hasText: 'Offline' })).toBeVisible();
});
