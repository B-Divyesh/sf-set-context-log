import './style.css';
import { localDateKey, markerRate, normalizeExercise, parseImport, previousSessionSets, setsToCsv, validateSetDraft } from './domain';
import { clearAll, deleteSet, getSets, getSettings, importBundle, openStorage, putSet, putSettings } from './storage';
import type { AppSettings, ExportBundle, SetEntry, WeightUnit } from './types';

function byId<T extends HTMLElement>(id: string): T {
  const element = document.getElementById(id);
  if (!element) throw new Error(`Missing #${id}`);
  return element as T;
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>\"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '\"': '&quot;' })[character] ?? character);
}

const url = new URL(window.location.href);
const isDemo = url.pathname.replace(/\/$/, '') === '/demo' || url.searchParams.get('demo') === '1';
const today = localDateKey(new Date());
const form = byId<HTMLFormElement>('set-form');
const appLoading = byId<HTMLElement>('app-loading');
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
const finishSession = byId<HTMLButtonElement>('finish-session');
const historyList = byId<HTMLElement>('history-list');
const historyEmpty = byId<HTMLElement>('history-empty');
const markerRateElement = byId<HTMLElement>('marker-rate');
const historySearch = byId<HTMLInputElement>('history-search');
const historyTools = byId<HTMLElement>('history-tools');
const toast = byId<HTMLElement>('toast');
const settingsDialog = byId<HTMLDialogElement>('settings-dialog');
const confirmDialog = byId<HTMLDialogElement>('confirm-dialog');
const confirmCopy = byId<HTMLElement>('confirm-copy');
const confirmAction = byId<HTMLButtonElement>('confirm-action');
const defaultUnit = byId<HTMLSelectElement>('default-unit');

let entries: SetEntry[] = [];
let settings: AppSettings = { defaultUnit: 'kg' };
let pendingConfirmation: { action: () => Promise<void>; failure: string } | null = null;
let toastTimer = 0;
let installPrompt: BeforeInstallPromptEvent | null = null;

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

function newSessionId(): string {
  return `${localDateKey(new Date())}:${Date.now()}:${crypto.randomUUID()}`;
}

function activeSessionId(): string {
  const currentDate = localDateKey(new Date());
  if (!settings.activeSessionId || settings.activeSessionDate !== currentDate) {
    settings.activeSessionId = newSessionId();
    settings.activeSessionDate = currentDate;
  }
  return settings.activeSessionId;
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
  return `${markers}${entry.markers.length && entry.note ? ' — ' : ''}${escapeHtml(entry.note)}`;
}

function renderExerciseOptions(): void {
  const names = [...new Set(entries.map((entry) => entry.exercise))].sort((a, b) => a.localeCompare(b));
  exerciseList.replaceChildren(...names.map((name) => Object.assign(document.createElement('option'), { value: name })));
}

function renderRecall(): void {
  const exercise = normalizeExercise(exerciseInput.value);
  if (!exercise) {
    recallCard.hidden = true;
    recallCard.replaceChildren();
    return;
  }
  const prior = previousSessionSets(entries, exercise, activeSessionId());
  recallCard.hidden = false;
  if (!prior.length) {
    recallCard.innerHTML = `<p class="recall-label">Previous-set context</p><p class="recall-empty">No earlier session for <strong>${escapeHtml(exercise)}</strong>. Save this set to review it next session.</p>`;
    return;
  }
  const lastDate = entryDate(prior[0]!);
  recallCard.innerHTML = `<p class="recall-label">Previous-set context · ${escapeHtml(formatDate(lastDate, { month: 'short', day: 'numeric' }))}</p><h3 class="recall-title">Last session: ${escapeHtml(exercise)}</h3><ol class="recall-sets">${prior.map((entry) => `<li><span class="recall-numbers">${entry.weight} ${entry.unit} × ${entry.reps}${entry.rpe ? ` @ ${entry.rpe}` : ''}</span><span class="recall-context">${contextMarkup(entry)}</span></li>`).join('')}</ol>`;
}

function renderSession(): void {
  const current = entries.filter((entry) => entry.sessionId === activeSessionId()).reverse();
  sessionCount.textContent = `${current.length} ${current.length === 1 ? 'set' : 'sets'}`;
  sessionEmpty.hidden = current.length > 0;
  finishSession.hidden = current.length === 0;
  sessionList.innerHTML = current.map((entry, index) => `<li class="set-row" data-id="${escapeHtml(entry.id)}"><span class="set-index" aria-label="Set ${index + 1}">${index + 1}</span><span class="set-exercise">${escapeHtml(entry.exercise)}</span><span class="set-numbers">${entry.weight} ${entry.unit} × ${entry.reps}${entry.rpe ? ` · RPE ${entry.rpe}` : ''}</span><span class="set-context">${contextMarkup(entry)}</span><button class="delete-set" type="button" data-delete-id="${escapeHtml(entry.id)}" aria-label="Remove ${escapeHtml(entry.exercise)} set">×</button></li>`).join('');
}

function renderHistory(): void {
  const query = normalizeExercise(historySearch.value).toLocaleLowerCase();
  const visible = query ? entries.filter((entry) => entry.exercise.toLocaleLowerCase().includes(query)) : entries;
  markerRateElement.textContent = entries.length ? `${markerRate(entries)}% with context` : '—% with context';
  historyEmpty.hidden = entries.length > 0;
  historyTools.hidden = entries.length === 0;
  const groups = new Map<string, SetEntry[]>();
  visible.forEach((entry) => groups.set(entry.sessionId, [...(groups.get(entry.sessionId) ?? []), entry]));
  historyList.innerHTML = [...groups.entries()].map(([sessionId, sets]) => {
    const date = entryDate(sets[sets.length - 1]!);
    const title = formatDate(date, { weekday: 'long', month: 'long', day: 'numeric', year: date.getFullYear() === new Date().getFullYear() ? undefined : 'numeric', hour: 'numeric', minute: '2-digit' });
    return `<article class="history-day"><h3>${escapeHtml(title)} <span>${sets.length} ${sets.length === 1 ? 'set' : 'sets'}</span></h3><table class="history-table"><thead><tr><th>Exercise</th><th>Set</th><th>Set context</th></tr></thead><tbody>${sets.slice().reverse().map((entry) => `<tr><td><strong>${escapeHtml(entry.exercise)}</strong></td><td>${entry.weight} ${entry.unit} × ${entry.reps}${entry.rpe ? ` @ ${entry.rpe}` : ''}</td><td>${contextMarkup(entry)}</td></tr>`).join('')}</tbody></table><span class="visually-hidden">Session ${escapeHtml(sessionId)}</span></article>`;
  }).join('');
  if (entries.length > 0 && visible.length === 0) historyList.innerHTML = '<p class="archive-empty">No saved exercises match that search.</p>';
}

function renderAll(): void {
  document.body.classList.toggle('has-data', entries.length > 0);
  renderExerciseOptions();
  renderRecall();
  renderSession();
  renderHistory();
}

function showConfirmation(copy: string, label: string, failure: string, action: () => Promise<void>): void {
  confirmCopy.textContent = copy;
  confirmAction.textContent = label;
  pendingConfirmation = { action, failure };
  confirmDialog.showModal();
}

async function refreshEntries(): Promise<void> {
  entries = await getSets();
  renderAll();
}

function invalidField(draft: { exercise: string; weight: number; reps: number; rpe: number | null }): HTMLElement {
  if (!normalizeExercise(draft.exercise)) return exerciseInput;
  if (!Number.isFinite(draft.weight) || draft.weight < 0 || draft.weight > 5000) return weightInput;
  if (!Number.isInteger(draft.reps) || draft.reps < 1 || draft.reps > 999) return repsInput;
  return rpeInput;
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  formError.hidden = true;
  const draft = { exercise: exerciseInput.value, weight: weightInput.value === '' ? Number.NaN : Number(weightInput.value), reps: Number(repsInput.value), rpe: rpeInput.value === '' ? null : Number(rpeInput.value) };
  const error = validateSetDraft(draft);
  if (error) { showError(error); invalidField(draft).focus(); return; }
  const submit = form.querySelector<HTMLButtonElement>('button[type="submit"]')!;
  submit.disabled = true;
  try {
    const entry: SetEntry = { id: crypto.randomUUID(), exercise: normalizeExercise(draft.exercise), weight: draft.weight, unit: unitInput.value as WeightUnit, reps: draft.reps, rpe: draft.rpe, markers: [...form.querySelectorAll<HTMLInputElement>('input[name="marker"]:checked')].map((input) => input.value), note: noteInput.value.trim(), performedAt: new Date().toISOString(), sessionId: activeSessionId() };
    await putSet(entry);
    entries.unshift(entry);
    const rememberedExercise = entry.exercise;
    form.reset();
    exerciseInput.value = rememberedExercise;
    unitInput.value = settings.defaultUnit;
    noteCount.textContent = '0 / 180';
    renderAll();
    weightInput.focus();
    showToast(`${entry.exercise} set saved in this browser.`);
  } catch {
    showError('The set could not be saved because browser storage is unavailable. Check site storage permission, then try again.');
  } finally { submit.disabled = false; }
});

exerciseInput.addEventListener('input', renderRecall);
noteInput.addEventListener('input', () => { noteCount.textContent = `${noteInput.value.length} / 180`; });
historySearch.addEventListener('input', renderHistory);

sessionList.addEventListener('click', (event) => {
  const button = (event.target as Element).closest<HTMLButtonElement>('[data-delete-id]');
  const entry = entries.find((item) => item.id === button?.dataset.deleteId);
  if (!button || !entry) return;
  showConfirmation(`Remove the ${entry.exercise} set at ${entry.weight} ${entry.unit} × ${entry.reps}? This cannot be undone.`, 'Remove set', 'The set could not be removed because browser storage is unavailable. Reload while online, then try again.', async () => {
    await deleteSet(entry.id);
    entries = entries.filter((item) => item.id !== entry.id);
    renderAll();
    showToast('Set removed.');
  });
});

confirmDialog.addEventListener('close', async () => {
  if (confirmDialog.returnValue !== 'confirm' || !pendingConfirmation) { pendingConfirmation = null; return; }
  const pending = pendingConfirmation;
  pendingConfirmation = null;
  try { await pending.action(); } catch { showToast(pending.failure); }
});

byId<HTMLButtonElement>('settings-button').addEventListener('click', () => settingsDialog.showModal());
byId<HTMLButtonElement>('save-settings').addEventListener('click', async (event) => {
  event.preventDefault();
  try {
    settings.defaultUnit = defaultUnit.value as WeightUnit;
    await putSettings(settings);
    unitInput.value = settings.defaultUnit;
    settingsDialog.close();
    showToast('Default unit saved. Saved sets were not converted.');
  } catch { showToast('The default unit could not be saved because browser storage is unavailable. Check site storage permission, then try again.'); }
});
byId<HTMLButtonElement>('erase-button').addEventListener('click', () => {
  settingsDialog.close();
  showConfirmation(`Erase all ${entries.length} sets and settings from this ${isDemo ? 'demo' : 'browser'}? Export first if you need a backup.`, 'Erase all data', 'The data could not be erased because browser storage is unavailable. Reload while online, then try again.', async () => {
    await clearAll();
    entries = [];
    settings = { defaultUnit: 'kg', activeSessionId: newSessionId(), activeSessionDate: localDateKey(new Date()) };
    await putSettings(settings);
    unitInput.value = 'kg';
    defaultUnit.value = 'kg';
    renderAll();
    showToast('All local training data erased.');
  });
});

finishSession.addEventListener('click', async () => {
  try {
    settings.activeSessionId = newSessionId();
    settings.activeSessionDate = localDateKey(new Date());
    await putSettings(settings);
    renderAll();
    showToast('Session finished. Start another set when you are ready.');
  } catch { showToast('The session could not be finished because browser storage is unavailable. Check site storage permission, then try again.'); }
});

function download(name: string, content: string, type: string): void {
  const objectUrl = URL.createObjectURL(new Blob([content], { type }));
  const link = Object.assign(document.createElement('a'), { href: objectUrl, download: name });
  document.body.append(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
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
    const count = await importBundle(parseImport(await file.text()));
    settings = await getSettings();
    activeSessionId();
    await putSettings(settings);
    defaultUnit.value = settings.defaultUnit;
    unitInput.value = settings.defaultUnit;
    await refreshEntries();
    showToast(count ? `Imported ${count} new ${count === 1 ? 'set' : 'sets'}.` : 'Backup read successfully; all sets were already here.');
  } catch (error) {
    const message = error instanceof Error && /^(That file|That backup)/.test(error.message)
      ? error.message
      : 'The backup could not be saved because browser storage is unavailable. Check site storage permission, then try again.';
    showToast(message);
  } finally { input.value = ''; }
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
  try {
    await installPrompt.prompt();
    await installPrompt.userChoice;
    installPrompt = null;
    byId<HTMLButtonElement>('install-button').hidden = true;
  } catch { showToast('The app could not be installed. Use your browser menu to try again.'); }
});

function demoSets(): SetEntry[] {
  const at = (daysAgo: number, hour: number, minute: number) => {
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);
    date.setHours(hour, minute, 0, 0);
    return date.toISOString();
  };
  return [
    { id: 'demo-today-1', exercise: 'Back squat', weight: 102.5, unit: 'kg', reps: 5, rpe: 8, markers: ['Clean'], note: 'Depth stayed even', performedAt: at(0, 7, 10), sessionId: `${today}:demo-current` },
    { id: 'demo-squat-2', exercise: 'Back squat', weight: 100, unit: 'kg', reps: 5, rpe: 8.5, markers: ['Form'], note: 'Left knee steady', performedAt: at(3, 18, 18), sessionId: 'demo-session-squat' },
    { id: 'demo-squat-1', exercise: 'Back squat', weight: 100, unit: 'kg', reps: 5, rpe: 8, markers: ['Pause'], note: 'Two-second pause', performedAt: at(3, 18, 12), sessionId: 'demo-session-squat' },
    { id: 'demo-bench-2', exercise: 'Bench press', weight: 72.5, unit: 'kg', reps: 6, rpe: 9, markers: ['Grip'], note: 'Moved grip one finger wider', performedAt: at(6, 7, 22), sessionId: 'demo-session-bench' },
    { id: 'demo-bench-1', exercise: 'Bench press', weight: 70, unit: 'kg', reps: 8, rpe: 8, markers: ['Tempo'], note: 'Slow final rep', performedAt: at(6, 7, 14), sessionId: 'demo-session-bench' },
    { id: 'demo-deadlift-1', exercise: 'Deadlift', weight: 145, unit: 'kg', reps: 3, rpe: 7.5, markers: ['Easy'], note: 'Hook grip held', performedAt: at(10, 17, 40), sessionId: 'demo-session-deadlift' },
  ];
}

async function seedDemo(): Promise<void> {
  const samples = demoSets();
  for (const entry of samples) await putSet(entry);
  settings = { defaultUnit: 'kg', activeSessionId: `${today}:demo-current`, activeSessionDate: today };
  await putSettings(settings);
  entries = await getSets();
  exerciseInput.value = 'Back squat';
  defaultUnit.value = 'kg';
  unitInput.value = 'kg';
  renderAll();
}

async function resetDemo(): Promise<void> {
  await clearAll();
  await seedDemo();
  showToast('Demo reset to the original sample sessions.');
}

async function registerServiceWorker(): Promise<void> {
  if (!('serviceWorker' in navigator) || import.meta.env.DEV) return;
  try {
    await navigator.serviceWorker.register('/sw.js');
    navigator.serviceWorker.addEventListener('message', (event) => { if (event.data?.type === 'UPDATE_AVAILABLE') byId<HTMLElement>('update-toast').hidden = false; });
    byId<HTMLButtonElement>('reload-app').addEventListener('click', () => window.location.reload());
  } catch {
    showToast('Offline setup failed. Keep this page open, then reload while online to try again.');
  }
}

function configureRoute(): void {
  if (!isDemo) return;
  document.body.classList.add('demo-mode');
  byId<HTMLElement>('demo-banner').hidden = false;
  document.title = 'Demo — Set Context Log';
  const canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (canonical) canonical.href = 'https://set-context-log.sociobot.in/demo';
  document.querySelector<HTMLMetaElement>('meta[property="og:title"]')?.setAttribute('content', 'Demo — Set Context Log');
  document.querySelector<HTMLMetaElement>('meta[property="og:url"]')?.setAttribute('content', 'https://set-context-log.sociobot.in/demo');
  document.querySelector<HTMLMetaElement>('meta[name="twitter:title"]')?.setAttribute('content', 'Demo — Set Context Log');
  byId<HTMLElement>('route-status').textContent = 'Demo — Set Context Log';
}

async function init(): Promise<void> {
  configureRoute();
  byId<HTMLTimeElement>('session-date').textContent = formatDate(new Date(), { weekday: 'short', month: 'short', day: 'numeric' });
  updateConnection();
  const storage = await openStorage(isDemo);
  settings = await getSettings();
  entries = await getSets();
  if (isDemo && entries.length === 0) await seedDemo();
  activeSessionId();
  await putSettings(settings);
  defaultUnit.value = settings.defaultUnit;
  unitInput.value = settings.defaultUnit;
  if (isDemo) exerciseInput.value = 'Back squat';
  renderAll();
  if (storage.warning) showToast(storage.warning);
  if (isDemo) {
    byId<HTMLButtonElement>('reset-demo').addEventListener('click', () => { resetDemo().catch(() => showToast('The demo could not be reset because browser storage is unavailable. Reload the demo, then try again.')); });
    byId<HTMLAnchorElement>('leave-demo').addEventListener('click', async (event) => {
      event.preventDefault();
      try { await clearAll(); window.location.assign('/'); }
      catch { showToast('The demo could not be cleared. Reset the demo before starting your real log.'); }
    });
    requestAnimationFrame(() => byId<HTMLHeadingElement>('page-title').focus());
  }
  form.inert = false;
  form.setAttribute('aria-busy', 'false');
  form.dataset.ready = 'true';
  appLoading.hidden = true;
  await registerServiceWorker();
}

init().catch(() => showToast('Set Context Log could not open browser storage. Reload the page or allow site storage.'));
