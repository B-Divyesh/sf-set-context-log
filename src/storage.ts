import type { AppSettings, ExportBundle, SetEntry, StorageResult } from './types';

const REAL_DB_NAME = 'set-context-log';
const DEMO_DB_NAME = 'demo:set-context-log';
const DB_VERSION = 1;
const SETS_STORE = 'sets';
const SETTINGS_STORE = 'settings';
let fallbackSetsKey = 'scl_sets_v1';
let fallbackSettingsKey = 'scl_settings_v1';

let db: IDBDatabase | null = null;
let fallback = false;

function requestResult<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error('Browser storage request failed.'));
  });
}

function transactionDone(transaction: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error ?? new Error('Browser storage transaction failed.'));
    transaction.onabort = () => reject(transaction.error ?? new Error('Browser storage transaction was cancelled.'));
  });
}

export async function openStorage(demo = false): Promise<StorageResult> {
  const databaseName = demo ? DEMO_DB_NAME : REAL_DB_NAME;
  fallbackSetsKey = demo ? 'demo:scl_sets_v1' : 'scl_sets_v1';
  fallbackSettingsKey = demo ? 'demo:scl_settings_v1' : 'scl_settings_v1';
  if (!('indexedDB' in window)) {
    fallback = true;
    return { mode: 'localStorage', warning: 'Private database storage is unavailable. Using this browser’s simpler local storage instead.' };
  }
  try {
    const request = indexedDB.open(databaseName, DB_VERSION);
    request.onupgradeneeded = () => {
      const opened = request.result;
      if (!opened.objectStoreNames.contains(SETS_STORE)) opened.createObjectStore(SETS_STORE, { keyPath: 'id' });
      if (!opened.objectStoreNames.contains(SETTINGS_STORE)) opened.createObjectStore(SETTINGS_STORE);
    };
    db = await requestResult(request);
    db.onversionchange = () => db?.close();
    return { mode: 'indexeddb' };
  } catch {
    fallback = true;
    return { mode: 'localStorage', warning: 'IndexedDB could not open. Your sets will use local storage on this device.' };
  }
}

function localSets(): SetEntry[] {
  try { return JSON.parse(localStorage.getItem(fallbackSetsKey) || '[]') as SetEntry[]; } catch { return []; }
}

function saveLocalSets(sets: SetEntry[]): void {
  localStorage.setItem(fallbackSetsKey, JSON.stringify(sets));
}

export async function getSets(): Promise<SetEntry[]> {
  if (fallback || !db) return localSets().sort((a, b) => b.performedAt.localeCompare(a.performedAt));
  const result = await requestResult(db.transaction(SETS_STORE).objectStore(SETS_STORE).getAll()) as SetEntry[];
  return result.sort((a, b) => b.performedAt.localeCompare(a.performedAt));
}

export async function putSet(entry: SetEntry): Promise<void> {
  if (fallback || !db) {
    const entries = localSets().filter((set) => set.id !== entry.id);
    entries.push(entry);
    saveLocalSets(entries);
    return;
  }
  const transaction = db.transaction(SETS_STORE, 'readwrite');
  transaction.objectStore(SETS_STORE).put(entry);
  await transactionDone(transaction);
}

export async function deleteSet(id: string): Promise<void> {
  if (fallback || !db) {
    saveLocalSets(localSets().filter((entry) => entry.id !== id));
    return;
  }
  const transaction = db.transaction(SETS_STORE, 'readwrite');
  transaction.objectStore(SETS_STORE).delete(id);
  await transactionDone(transaction);
}

export async function getSettings(): Promise<AppSettings> {
  if (fallback || !db) {
    try { return JSON.parse(localStorage.getItem(fallbackSettingsKey) || '{"defaultUnit":"kg"}') as AppSettings; }
    catch { return { defaultUnit: 'kg' }; }
  }
  return (await requestResult(db.transaction(SETTINGS_STORE).objectStore(SETTINGS_STORE).get('app')) as AppSettings | undefined) ?? { defaultUnit: 'kg' };
}

export async function putSettings(settings: AppSettings): Promise<void> {
  if (fallback || !db) {
    localStorage.setItem(fallbackSettingsKey, JSON.stringify(settings));
    return;
  }
  const transaction = db.transaction(SETTINGS_STORE, 'readwrite');
  transaction.objectStore(SETTINGS_STORE).put(settings, 'app');
  await transactionDone(transaction);
}

export async function importBundle(bundle: ExportBundle): Promise<number> {
  const existing = new Set((await getSets()).map((entry) => entry.id));
  const additions = bundle.sets.filter((entry) => !existing.has(entry.id));
  if (fallback || !db) {
    saveLocalSets([...localSets(), ...additions]);
  } else {
    const transaction = db.transaction(SETS_STORE, 'readwrite');
    const store = transaction.objectStore(SETS_STORE);
    additions.forEach((entry) => store.put(entry));
    await transactionDone(transaction);
  }
  await putSettings(bundle.settings);
  return additions.length;
}

export async function clearAll(): Promise<void> {
  if (fallback || !db) {
    localStorage.removeItem(fallbackSetsKey);
    localStorage.removeItem(fallbackSettingsKey);
    return;
  }
  const transaction = db.transaction([SETS_STORE, SETTINGS_STORE], 'readwrite');
  transaction.objectStore(SETS_STORE).clear();
  transaction.objectStore(SETTINGS_STORE).clear();
  await transactionDone(transaction);
}
