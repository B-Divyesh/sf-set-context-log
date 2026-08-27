import type { ExportBundle, SetEntry, WeightUnit } from './types';

export const MARKERS = ['Clean', 'Grip', 'Pause', 'Tempo', 'Form', 'Easy'] as const;

export function normalizeExercise(value: string): string {
  return value.trim().replace(/\s+/g, ' ');
}

export function localDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function validateSetDraft(input: {
  exercise: string;
  weight: number;
  reps: number;
  rpe: number | null;
}): string | null {
  if (!normalizeExercise(input.exercise)) return 'Enter an exercise name.';
  if (!Number.isFinite(input.weight) || input.weight < 0 || input.weight > 5000) return 'Enter a weight from 0 to 5,000.';
  if (!Number.isInteger(input.reps) || input.reps < 1 || input.reps > 999) return 'Enter whole-number reps from 1 to 999.';
  if (input.rpe !== null && (!Number.isFinite(input.rpe) || input.rpe < 1 || input.rpe > 10 || input.rpe * 2 % 1 !== 0)) {
    return 'RPE must be from 1 to 10 in half-point steps.';
  }
  return null;
}

export function previousSessionSets(entries: SetEntry[], exercise: string, currentSessionId: string): SetEntry[] {
  const target = normalizeExercise(exercise).toLocaleLowerCase();
  const matching = entries
    .filter((entry) => entry.exercise.toLocaleLowerCase() === target && entry.sessionId !== currentSessionId)
    .sort((a, b) => b.performedAt.localeCompare(a.performedAt));
  const priorSession = matching[0]?.sessionId;
  return priorSession ? matching.filter((entry) => entry.sessionId === priorSession).reverse() : [];
}

export function formatContext(entry: SetEntry): string {
  const pieces = [...entry.markers];
  if (entry.note) pieces.push(entry.note);
  return pieces.join(' · ') || 'No context marked';
}

export function markerRate(entries: SetEntry[]): number {
  if (entries.length === 0) return 0;
  const marked = entries.filter((entry) => entry.markers.length > 0 || entry.note.length > 0).length;
  return Math.round((marked / entries.length) * 100);
}

export function isSetEntry(value: unknown): value is SetEntry {
  if (!value || typeof value !== 'object') return false;
  const entry = value as Partial<SetEntry>;
  return typeof entry.id === 'string'
    && typeof entry.exercise === 'string'
    && typeof entry.weight === 'number'
    && (entry.unit === 'kg' || entry.unit === 'lb')
    && typeof entry.reps === 'number'
    && (entry.rpe === null || typeof entry.rpe === 'number')
    && Array.isArray(entry.markers)
    && entry.markers.every((marker) => typeof marker === 'string')
    && typeof entry.note === 'string'
    && typeof entry.performedAt === 'string'
    && typeof entry.sessionId === 'string'
    && !validateSetDraft({ exercise: entry.exercise, weight: entry.weight, reps: entry.reps, rpe: entry.rpe });
}

export function parseImport(text: string): ExportBundle {
  let value: unknown;
  try {
    value = JSON.parse(text);
  } catch {
    throw new Error('That file is not valid JSON. Choose a Set Context Log backup.');
  }
  if (!value || typeof value !== 'object') throw new Error('That backup has no readable data.');
  const bundle = value as Partial<ExportBundle>;
  if (bundle.schema !== 'set-context-log/v1' || !Array.isArray(bundle.sets) || !bundle.sets.every(isSetEntry)) {
    throw new Error('That file is not a Set Context Log v1 backup.');
  }
  const defaultUnit: WeightUnit = bundle.settings?.defaultUnit === 'lb' ? 'lb' : 'kg';
  return { schema: 'set-context-log/v1', exportedAt: bundle.exportedAt || new Date().toISOString(), sets: bundle.sets, settings: { defaultUnit } };
}

function csvCell(value: string | number): string {
  const stringValue = String(value);
  return /[",\n]/.test(stringValue) ? `"${stringValue.replaceAll('"', '""')}"` : stringValue;
}

export function setsToCsv(entries: SetEntry[]): string {
  const rows: (string | number)[][] = [
    ['performed_at', 'session_id', 'exercise', 'weight', 'unit', 'reps', 'rpe', 'markers', 'note'],
    ...entries.map((entry) => [
      entry.performedAt,
      entry.sessionId,
      entry.exercise,
      entry.weight,
      entry.unit,
      entry.reps,
      entry.rpe ?? '',
      entry.markers.join('|'),
      entry.note,
    ]),
  ];
  return `\uFEFF${rows.map((row) => row.map(csvCell).join(',')).join('\r\n')}\r\n`;
}
