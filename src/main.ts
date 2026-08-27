import './style.css';
import { formatContext, localDateKey, markerRate, normalizeExercise, parseImport, previousSessionSets, setsToCsv, validateSetDraft } from './domain';
import { captureReturnedLicense, checkoutUrl, optimisticLicenseState, saveLicense, verifySavedLicense, type LicenseState } from './license';
import { clearAll, deleteSet, getSets, getSettings, importBundle, openStorage, putSet, putSettings } from './storage';
import type { AppSettings, ExportBundle, SetEntry, WeightUnit } from './types';

function byId<T extends HTMLElement>(id: string): T {
  const element = document.getElementById(id);
  if (!element) throw new Error(`Missing #${id}`);
  return element as T;
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[character] ?? character);
}

const form = byId<HTMLFormElement>('set-form');
const exerciseInput = byId<HTMLInputElement>('exercise');
const exerciseList = byId<HTMLDataListElement>('exercise-list');
const weightInput = byId<HTMLInputElement>('weight');
const unitInput = byId<HTMLSelectElement>('unit');
const repsInput = byId<HTMLInputElement>('reps');
const rpeInput = byId<HTMLInputElement>('rpe');
const noteInput = byId<HTMLInputElement>('note');
const noteCount = byId<HTMLElement>('note-count');
const formError = byId<HTMLElement>('form-error');
const recallCard = byId<HTMLElement>('recall-card');
const sessionList = byId<HTMLOListElement>('session-list');
const sessionEmpty = byId<HTMLElement>('session-empty');
const sessionCount = byId<HTMLElement>('session-count');
const historyList = byId<HTMLElement>('history-list');
const historyEmpty = byId<HTMLElement>('history-empty');
const markerRateElement = byId<HTMLElement>('marker-rate');
const historySearch = byId<HTMLInputElement>('history-search');
const historyTools = byId<HTMLElement>('history-tools');
const archiveGate = byId<HTMLElement>('archive-gate');
const toast = byId<HTMLElement>('toast');
const settingsDialog = byId<HTMLDialogElement>('settings-dialog');
const confirmDialog = byId<HTMLDialogElement>('confirm-dialog');
const confirmCopy = byId<HTMLElement>('confirm-copy');
const confirmAction = byId<HTMLButtonElement>('confirm-action');
const defaultUnit = byId<HTMLSelectElement>('default-unit');
const licenseStatus = byId<HTMLElement>('license-status');

const today = localDateKey(new Date());
let entries: SetEntry[] = [];
let settings: AppSettings = { defaultUnit: 'kg' };
let licenseState: LicenseState = optimisticLicenseState();
let pendingConfirmation: (() => Promise<void>) | null = null;
let toastTimer = 0;
let installPrompt: BeforeInstallPromptEvent | null = null;

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

function formatDate(value: Date, options: Intl.DateTimeFormatOptions): string {
  return new Intl.DateTimeFormat(undefined, options).format(value);
}

function entryDate(entry: SetEntry): Date {
  const date = new Date(entry.performedAt);
  return Number.isNaN(date.getTime()) ? new Date() : date;
}

function showToast(message: string): void {
  window.clearTimeout(toastTimer);
  toast.textContent = message;
  toast.hidden = false;
  toastTimer = window.setTimeout(() => { toast.hidden = true; }, 3600);
}

function showError(message: string): void {
  formError.textContent = message;
  formError.hidden = false;
}

function contextMarkup(entry: SetEntry): string {
  if (!entry.markers.length && !entry.note) return '<span>No context marked</span>';
  const markers = entry.markers.length ? `<strong>${escapeHtml(entry.markers.join(' · '))}</strong>` : '';
  const separator = entry.markers.length && entry.note ? ' — ' : '';
  return `${markers}${separator}${escapeHtml(entry.note)}`;
}

function renderExerciseOptions(): void {
  const names = [...new Set(entries.map((entry) => entry.exercise))].sort((a, b) => a.localeCompare(b));
  exerciseList.replaceChildren(...names.map((name) => {
    const option = document.createElement('option');
    option.value = name;
    return option;
  }));
}

function renderRecall(): void {
  const exercise = normalizeExercise(exerciseInput.value);
  if (!exercise) {
    recallCard.hidden = true;
    recallCard.replaceChildren();
    return;
  }
  const prior = previousSessionSets(entries, exercise, today);
  recallCard.hidden = false;
  if (!prior.length) {
    recallCard.innerHTML = `<p class="recall-label">Prior-set recall</p><p class="recall-empty">No earlier session for <strong>${escapeHtml(exercise)}</strong>. Log today’s evidence and it will be ready next time.</p>`;
    return;
  }
  const lastDate = entryDate(prior[0]!);
  recallCard.innerHTML = `
    <p class="recall-label">Prior-set recall · ${escapeHtml(formatDate(lastDate, { month: 'short', day: 'numeric' }))}</p>
    <h3 class="recall-title">Last time: ${escapeHtml(exercise)}</h3>
    <ol class="recall-sets">
      ${prior.map((entry) => `<li><span class="recall-numbers">${entry.weight} ${entry.unit} × ${entry.reps}${entry.rpe ? ` @ ${entry.rpe}` : ''}</span><span class="recall-context">${contextMarkup(entry)}</span></li>`).join('')}
    </ol>`;
}

function renderSession(): void {
  const todayEntries = entries.filter((entry) => entry.sessionId === today).reverse();
  sessionCount.textContent = `${todayEntries.length} ${todayEntries.length === 1 ? 'set' : 'sets'}`;
  sessionEmpty.hidden = todayEntries.length > 0;
  sessionList.innerHTML = todayEntries.map((entry, index) => `
    <li class="set-row" data-id="${escapeHtml(entry.id)}">
      <span class="set-index" aria-label="Set ${index + 1}">${index + 1}</span>
      <span class="set-exercise">${escapeHtml(entry.exercise)}</span>
      <span class="set-numbers">${entry.weight} ${entry.unit} × ${entry.reps}${entry.rpe ? ` · RPE ${entry.rpe}` : ''}</span>
      <span class="set-context">${contextMarkup(entry)}</span>
      <button class="delete-set" type="button" data-delete-id="${escapeHtml(entry.id)}" aria-label="Remove ${escapeHtml(entry.exercise)} set">×</button>
    </li>`).join('');
}

function visibleHistory(): SetEntry[] {
  let result = [...entries];
  if (licenseState !== 'unlocked') {
    const cutoff = new Date();
    cutoff.setHours(0, 0, 0, 0);
    cutoff.setDate(cutoff.getDate() - 13);
    result = result.filter((entry) => entryDate(entry) >= cutoff);
  }
  const query = normalizeExercise(historySearch.value).toLocaleLowerCase();
  if (query && licenseState === 'unlocked') result = result.filter((entry) => entry.exercise.toLocaleLowerCase().includes(query));
  return result;
}

function renderHistory(): void {
  const visible = visibleHistory();
  markerRateElement.textContent = entries.length && licenseState === 'unlocked' ? `${markerRate(entries)}% with context` : '—% with context';
  historyEmpty.hidden = entries.length > 0;
  archiveGate.hidden = licenseState === 'unlocked' || entries.length === 0;
  historyTools.hidden = licenseState !== 'unlocked' || entries.length === 0;

  const groups = new Map<string, SetEntry[]>();
  visible.forEach((entry) => {
    const group = groups.get(entry.sessionId) ?? [];
    group.push(entry);
    groups.set(entry.sessionId, group);
  });
  historyList.innerHTML = [...groups.entries()].map(([sessionId, sets]) => {
    const date = entryDate(sets[0]!);
    const title = formatDate(date, { weekday: 'long', month: 'long', day: 'numeric', year: date.getFullYear() === new Date().getFullYear() ? undefined : 'numeric' });
    return `<article class="history-day">
      <h3>${escapeHtml(title)} <span>${sets.length} ${sets.length === 1 ? 'set' : 'sets'}</span></h3>
      <table class="history-table">
        <thead><tr><th>Exercise</th><th>Set</th><th>Context</th></tr></thead>
        <tbody>${sets.slice().reverse().map((entry) => `<tr><td><strong>${escapeHtml(entry.exercise)}</strong></td><td>${entry.weight} ${entry.unit} × ${entry.reps}${entry.rpe ? ` @ ${entry.rpe}` : ''}</td><td>${contextMarkup(entry)}</td></tr>`).join('')}</tbody>
      </table>
      <span class="visually-hidden">Session key ${escapeHtml(sessionId)}</span>
    </article>`;
  }).join('');
  if (entries.length > 0 && visible.length === 0) historyList.innerHTML = '<p class="archive-empty">No exercises match that search.</p>';
}

function renderLicense(): void {
  const unlocked = licenseState === 'unlocked';
  document.body.classList.toggle('is-pro', unlocked);
  licenseStatus.textContent = ({
    locked: '',
    checking: 'Checking your license…',
    unlocked: 'Full archive is active on this device.',
    invalid: 'This license is no longer active. You can purchase a new license above.',
    offline: 'License check is offline. Reconnect and try again; logging still works.',
  })[licenseState];
  renderHistory();
}

function renderAll(): void {
  document.body.classList.toggle('has-data', entries.length > 0);
  renderExerciseOptions();
  renderRecall();
  renderSession();
  renderHistory();
}

function showConfirmation(copy: string, label: string, action: () => Promise<void>): void {
  confirmCopy.textContent = copy;
  confirmAction.textContent = label;
  pendingConfirmation = action;
  confirmDialog.showModal();
}

async function refreshEntries(): Promise<void> {
  entries = await getSets();
  renderAll();
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  formError.hidden = true;
  const rpeValue = rpeInput.value === '' ? null : Number(rpeInput.value);
  const draft = {
    exercise: exerciseInput.value,
    weight: weightInput.value === '' ? Number.NaN : Number(weightInput.value),
    reps: Number(repsInput.value),
    rpe: rpeValue,
  };
  const error = validateSetDraft(draft);
  if (error) {
    showError(error);
    const firstInvalid = !normalizeExercise(draft.exercise) ? exerciseInput : !Number.isFinite(draft.weight) || draft.weight < 0 ? weightInput : !Number.isInteger(draft.reps) || draft.reps < 1 ? repsInput : rpeInput;
    firstInvalid.focus();
    return;
  }
  const submit = form.querySelector<HTMLButtonElement>('button[type="submit"]')!;
  submit.disabled = true;
  try {
    const entry: SetEntry = {
      id: crypto.randomUUID(),
      exercise: normalizeExercise(draft.exercise),
      weight: draft.weight,
      unit: unitInput.value as WeightUnit,
      reps: draft.reps,
      rpe: draft.rpe,
      markers: [...form.querySelectorAll<HTMLInputElement>('input[name="marker"]:checked')].map((input) => input.value),
      note: noteInput.value.trim(),
      performedAt: new Date().toISOString(),
      sessionId: today,
    };
    await putSet(entry);
    entries.unshift(entry);
    renderAll();
    const rememberedExercise = entry.exercise;
    form.reset();
    exerciseInput.value = rememberedExercise;
    unitInput.value = settings.defaultUnit;
    noteCount.textContent = '0 / 180';
    renderRecall();
    weightInput.focus();
    showToast(`${entry.exercise} set logged on this device.`);
  } catch {
    showError('The set could not be saved. Check this browser’s storage permission and try again.');
  } finally {
    submit.disabled = false;
  }
});

exerciseInput.addEventListener('input', renderRecall);
noteInput.addEventListener('input', () => { noteCount.textContent = `${noteInput.value.length} / 180`; });
historySearch.addEventListener('input', renderHistory);

sessionList.addEventListener('click', (event) => {
  const button = (event.target as Element).closest<HTMLButtonElement>('[data-delete-id]');
  if (!button) return;
  const entry = entries.find((item) => item.id === button.dataset.deleteId);
  if (!entry) return;
  showConfirmation(`Remove the ${entry.exercise} set at ${entry.weight} ${entry.unit} × ${entry.reps}? This cannot be undone.`, 'Remove set', async () => {
    await deleteSet(entry.id);
    entries = entries.filter((item) => item.id !== entry.id);
    renderAll();
    showToast('Set removed.');
  });
});

confirmDialog.addEventListener('close', async () => {
  if (confirmDialog.returnValue !== 'confirm' || !pendingConfirmation) {
    pendingConfirmation = null;
    return;
  }
  const action = pendingConfirmation;
  pendingConfirmation = null;
  try { await action(); } catch { showToast('That action could not be completed. Try again.'); }
});

byId<HTMLButtonElement>('settings-button').addEventListener('click', () => settingsDialog.showModal());
byId<HTMLButtonElement>('save-settings').addEventListener('click', async (event) => {
  event.preventDefault();
  settings.defaultUnit = defaultUnit.value as WeightUnit;
  await putSettings(settings);
  unitInput.value = settings.defaultUnit;
  settingsDialog.close();
  showToast('Default unit saved. History was not converted.');
});
byId<HTMLButtonElement>('erase-button').addEventListener('click', () => {
  settingsDialog.close();
  showConfirmation(`Erase all ${entries.length} locally stored sets and settings from this device? Export first if you need a backup.`, 'Erase all data', async () => {
    await clearAll();
    entries = [];
    settings = { defaultUnit: 'kg' };
    unitInput.value = 'kg';
    defaultUnit.value = 'kg';
    renderAll();
    showToast('All local training data erased.');
  });
});

function download(name: string, content: string, type: string): void {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const link = document.createElement('a');
  link.href = url;
  link.download = name;
  document.body.append(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

byId<HTMLButtonElement>('export-json').addEventListener('click', () => {
  const bundle: ExportBundle = { schema: 'set-context-log/v1', exportedAt: new Date().toISOString(), sets: entries, settings };
  download(`set-context-log-${today}.json`, JSON.stringify(bundle, null, 2), 'application/json');
  showToast(`Exported ${entries.length} sets as JSON.`);
});
byId<HTMLButtonElement>('export-csv').addEventListener('click', () => {
  download(`set-context-log-${today}.csv`, setsToCsv(entries), 'text/csv;charset=utf-8');
  showToast(`Exported ${entries.length} sets as CSV.`);
});
byId<HTMLInputElement>('import-json').addEventListener('change', async (event) => {
  const input = event.currentTarget as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;
  try {
    const bundle = parseImport(await file.text());
    const count = await importBundle(bundle);
    settings = await getSettings();
    defaultUnit.value = settings.defaultUnit;
    unitInput.value = settings.defaultUnit;
    await refreshEntries();
    showToast(count ? `Imported ${count} new ${count === 1 ? 'set' : 'sets'}.` : 'Backup read successfully; all sets were already here.');
  } catch (error) {
    showToast(error instanceof Error ? error.message : 'That backup could not be imported.');
  } finally {
    input.value = '';
  }
});

byId<HTMLAnchorElement>('buy-link').href = checkoutUrl();
const restoreToggle = byId<HTMLButtonElement>('restore-toggle');
const restoreForm = byId<HTMLFormElement>('restore-form');
restoreToggle.addEventListener('click', () => {
  const willOpen = restoreForm.hidden;
  restoreForm.hidden = !willOpen;
  restoreToggle.setAttribute('aria-expanded', String(willOpen));
  if (willOpen) byId<HTMLInputElement>('license-token').focus();
});
restoreForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const token = byId<HTMLInputElement>('license-token').value.trim();
  if (!token) { licenseStatus.textContent = 'Paste the license token from your receipt.'; return; }
  saveLicense(token);
  licenseState = 'checking';
  renderLicense();
  licenseState = await verifySavedLicense(true);
  renderLicense();
});

function updateConnection(): void {
  const status = byId<HTMLElement>('connection-status');
  const online = navigator.onLine;
  status.classList.toggle('offline', !online);
  status.innerHTML = `<span aria-hidden="true">●</span> ${online ? 'Online' : 'Offline · sets still save'}`;
}
window.addEventListener('online', updateConnection);
window.addEventListener('offline', updateConnection);

window.addEventListener('beforeinstallprompt', (event) => {
  event.preventDefault();
  installPrompt = event as BeforeInstallPromptEvent;
  byId<HTMLButtonElement>('install-button').hidden = false;
});
byId<HTMLButtonElement>('install-button').addEventListener('click', async () => {
  if (!installPrompt) return;
  await installPrompt.prompt();
  await installPrompt.userChoice;
  installPrompt = null;
  byId<HTMLButtonElement>('install-button').hidden = true;
});

async function registerServiceWorker(): Promise<void> {
  if (!('serviceWorker' in navigator) || import.meta.env.DEV) return;
  try {
    await navigator.serviceWorker.register('/sw.js');
    navigator.serviceWorker.addEventListener('message', (event) => {
      if (event.data?.type === 'UPDATE_AVAILABLE') byId<HTMLElement>('update-toast').hidden = false;
    });
    byId<HTMLButtonElement>('reload-app').addEventListener('click', () => window.location.reload());
  } catch {
    showToast('Offline setup was unavailable. The app still works while this page stays open.');
  }
}

async function init(): Promise<void> {
  byId<HTMLTimeElement>('session-date').textContent = formatDate(new Date(), { weekday: 'short', month: 'short', day: 'numeric' });
  updateConnection();
  const storage = await openStorage();
  settings = await getSettings();
  defaultUnit.value = settings.defaultUnit;
  unitInput.value = settings.defaultUnit;
  entries = await getSets();
  renderAll();
  if (storage.warning) showToast(storage.warning);

  const returned = captureReturnedLicense();
  licenseState = optimisticLicenseState();
  renderLicense();
  if (returned || localStorage.getItem('sb_license:set-context-log')) {
    if (returned) { licenseState = 'checking'; renderLicense(); }
    licenseState = await verifySavedLicense(returned);
    renderLicense();
  }
  await registerServiceWorker();
}

init().catch(() => {
  showToast('Set Context Log could not open its local storage. Reload the page or check browser storage permissions.');
});
