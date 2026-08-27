import { describe, expect, it } from 'vitest';
import { markerRate, parseImport, previousSessionSets, setsToCsv, validateSetDraft } from '../src/domain';
import type { SetEntry } from '../src/types';

function set(overrides: Partial<SetEntry> = {}): SetEntry {
  return {
    id: crypto.randomUUID(),
    exercise: 'Back squat',
    weight: 100,
    unit: 'kg',
    reps: 5,
    rpe: 8,
    markers: ['Form'],
    note: 'Depth held',
    performedAt: '2026-08-20T10:00:00.000Z',
    sessionId: '2026-08-20',
    ...overrides,
  };
}

describe('set validation', () => {
  it('accepts a zero-weight bodyweight set and half-step RPE', () => {
    expect(validateSetDraft({ exercise: 'Pull-up', weight: 0, reps: 8, rpe: 8.5 })).toBeNull();
  });

  it('explains invalid reps and RPE', () => {
    expect(validateSetDraft({ exercise: 'Squat', weight: 90, reps: 2.5, rpe: 8 })).toMatch(/whole-number/);
    expect(validateSetDraft({ exercise: 'Squat', weight: 90, reps: 5, rpe: 8.2 })).toMatch(/half-point/);
  });
});

describe('prior set recall', () => {
  it('returns only the most recent earlier session in set order', () => {
    const entries = [
      set({ id: 'today', sessionId: '2026-08-27', performedAt: '2026-08-27T09:00:00.000Z' }),
      set({ id: 'old', sessionId: '2026-08-12', performedAt: '2026-08-12T09:00:00.000Z' }),
      set({ id: 'latest-2', sessionId: '2026-08-25', performedAt: '2026-08-25T09:10:00.000Z', reps: 4 }),
      set({ id: 'latest-1', sessionId: '2026-08-25', performedAt: '2026-08-25T09:00:00.000Z', reps: 5 }),
      set({ exercise: 'Bench press', sessionId: '2026-08-26', performedAt: '2026-08-26T09:00:00.000Z' }),
    ];
    expect(previousSessionSets(entries, ' back   squat ', '2026-08-27').map((entry) => entry.id)).toEqual(['latest-1', 'latest-2']);
  });
});

describe('portable data', () => {
  it('quotes commas and quotes in CSV without converting units', () => {
    const csv = setsToCsv([set({ unit: 'lb', note: 'Slow, "clean"' })]);
    expect(csv).toContain(',lb,');
    expect(csv).toContain('"Slow, ""clean"""');
  });

  it('rejects unrelated JSON backups', () => {
    expect(() => parseImport('{"sets":[]}')).toThrow(/not a Set Context Log/);
  });

  it('calculates context inclusion', () => {
    expect(markerRate([set(), set({ markers: [], note: '' })])).toBe(50);
  });
});
