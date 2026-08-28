import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#set-form')).toHaveAttribute('data-ready', 'true');
});

test('logs, persists, recalls, and exports a set', async ({ page }) => {
  await expect(page).toHaveTitle(/Set Context Log/);
  await expect(page.locator('h1')).toHaveCount(1);
  await page.getByLabel(/Exercise/).fill('Back squat');
  await page.getByLabel(/Weight \(required\)/).fill('102.5');
  await page.getByLabel(/Reps \(required\)/).fill('5');
  await page.getByLabel(/Effort/).fill('8.5');
  await page.locator('label:has(input[name="marker"][value="Form"]) span').click();
  await page.getByLabel(/Set context/).fill('Left knee steady');
  await page.getByRole('button', { name: 'Log this set' }).click();
  await expect(page.getByText('102.5 kg × 5 · RPE 8.5')).toBeVisible();
  await page.reload();
  await expect(page.locator('#session-list').getByText('Left knee steady')).toBeVisible();

  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export JSON' }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toMatch(/^set-context-log-.*\.json$/);
});

test('supports keyboard marker selection and set logging', async ({ page }) => {
  await page.getByLabel(/Exercise/).fill('Deadlift');
  await page.getByLabel(/Weight \(required\)/).fill('180');
  await page.getByLabel(/Reps \(required\)/).fill('3');
  const marker = page.locator('input[name="marker"][value="Grip"]');
  await marker.focus();
  await page.keyboard.press('Space');
  await expect(marker).toBeChecked();
  await page.getByRole('button', { name: 'Log this set' }).focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('status').filter({ hasText: 'Deadlift set saved in this browser.' })).toBeVisible();
  await expect(page.locator('#session-list').getByText('Grip')).toBeVisible();
});

test('imports a prior session and opens recall for that exercise', async ({ page }) => {
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
  await page.getByLabel(/Exercise/).fill('Bench press');
  await expect(page.getByText(/Last session: Bench press/)).toBeVisible();
  await expect(page.locator('#recall-card').getByText('Long first pause')).toBeVisible();
  await expect(page.getByLabel('Weight unit')).toHaveValue('lb');
});

test('has no serious accessibility violations at mobile width', async ({ page }) => {
  await page.goto('/?demo=1');
  await expect(page.locator('#set-form')).toHaveAttribute('data-ready', 'true');
  const results = await new AxeBuilder({ page }).analyze();
  const serious = results.violations.filter((violation) => ['serious', 'critical'].includes(violation.impact ?? ''));
  expect(serious).toEqual([]);
});

test('reopens offline after the service worker is ready', async ({ page, context }) => {
  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.reload();
  await context.setOffline(true);
  await page.reload();
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Log what changed');
  await expect(page.getByRole('status').filter({ hasText: 'Offline' })).toBeVisible();
});

test('shows the in-app update message from the service worker', async ({ page }) => {
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
    navigator.serviceWorker.dispatchEvent(new MessageEvent('message', { data: { type: 'UPDATE_AVAILABLE' } }));
  });
  await expect(page.getByText('A fresh version is ready.')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Reload app' })).toBeVisible();
});

test('keeps the 390px layout within the viewport and exposes the primary action', async ({ page }) => {
  await expect(page.getByRole('link', { name: /Try it with sample data/ })).toBeVisible();
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(0);
});

test('moves focus into settings and returns it when closed', async ({ page }) => {
  const trigger = page.getByRole('button', { name: 'Change settings' });
  await trigger.click();
  await expect(page.getByRole('button', { name: 'Close settings' })).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(trigger).toBeFocused();
});
