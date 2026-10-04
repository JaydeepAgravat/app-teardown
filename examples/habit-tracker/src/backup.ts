// The export file. It is a full backup: importing it rebuilds the local store.
export const BACKUP_VERSION = 1;

export type HabitRow = { id: string; name: string; position: number; created_at: string };
export type CompletionRow = { habit_id: string; day: string };
export type Backup = { version: number; exportedAt: string; habits: HabitRow[]; completions: CompletionRow[] };

const DAY = /^\d{4}-\d{2}-\d{2}$/;
const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null;

export const serializeBackup = (habits: HabitRow[], completions: CompletionRow[], now: Date = new Date()): string =>
  JSON.stringify({ version: BACKUP_VERSION, exportedAt: now.toISOString(), habits, completions } satisfies Backup, null, 2);

// Validates the whole file before anything is written. Throws with a message for the user.
export const parseBackup = (text: string): Backup => {
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error('This file is not valid JSON.');
  }
  if (!isRecord(data) || !Array.isArray(data.habits) || !Array.isArray(data.completions)) {
    throw new Error('This file is not a habit tracker backup.');
  }
  if (typeof data.version !== 'number' || data.version > BACKUP_VERSION) {
    throw new Error('This backup was made by a newer version of the app.');
  }

  const ids = new Set<string>();
  const habits = data.habits.map((habit: unknown, index: number): HabitRow => {
    if (!isRecord(habit) || typeof habit.id !== 'string' || !habit.id || typeof habit.name !== 'string' || !habit.name.trim()) {
      throw new Error(`Habit ${index + 1} in this file is damaged.`);
    }
    if (ids.has(habit.id)) throw new Error(`Habit ${index + 1} in this file is a duplicate.`);
    ids.add(habit.id);
    return {
      id: habit.id,
      name: habit.name,
      position: typeof habit.position === 'number' ? habit.position : index,
      created_at: typeof habit.created_at === 'string' ? habit.created_at : new Date(0).toISOString(),
    };
  });

  const seen = new Set<string>();
  const completions: CompletionRow[] = [];
  data.completions.forEach((row: unknown, index: number) => {
    if (!isRecord(row) || typeof row.habit_id !== 'string' || typeof row.day !== 'string' || !DAY.test(row.day)) {
      throw new Error(`Entry ${index + 1} in this file is damaged.`);
    }
    if (!ids.has(row.habit_id)) throw new Error(`Entry ${index + 1} in this file belongs to no habit.`);
    const key = `${row.habit_id} ${row.day}`;
    if (seen.has(key)) return;
    seen.add(key);
    completions.push({ habit_id: row.habit_id, day: row.day });
  });

  return { version: data.version, exportedAt: typeof data.exportedAt === 'string' ? data.exportedAt : '', habits, completions };
};
