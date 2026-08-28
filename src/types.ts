export type WeightUnit = 'kg' | 'lb';

export interface SetEntry {
  id: string;
  exercise: string;
  weight: number;
  unit: WeightUnit;
  reps: number;
  rpe: number | null;
  markers: string[];
  note: string;
  performedAt: string;
  sessionId: string;
}

export interface AppSettings {
  defaultUnit: WeightUnit;
  activeSessionId?: string;
  activeSessionDate?: string;
}

export interface ExportBundle {
  schema: 'set-context-log/v1';
  exportedAt: string;
  sets: SetEntry[];
  settings: AppSettings;
}

export interface StorageResult {
  mode: 'indexeddb' | 'localStorage';
  warning?: string;
}
