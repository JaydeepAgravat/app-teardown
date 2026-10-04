import { randomUUID } from 'expo-crypto';
import type { SQLiteDatabase } from 'expo-sqlite';

import type { Backup, CompletionRow, HabitRow } from './backup';
import { type Day, streak } from './days';

export type Habit = { id: string; name: string; doneToday: boolean; streak: number; forgiven: number };

// One step per shipped version. Steps are never removed, because a user may update
// from any version and the local store is the only copy of their history.
const migrations: string[] = [
  `CREATE TABLE habit (id TEXT PRIMARY KEY NOT NULL, name TEXT NOT NULL, position INTEGER NOT NULL, created_at TEXT NOT NULL);
   CREATE TABLE completion (habit_id TEXT NOT NULL, day TEXT NOT NULL, PRIMARY KEY (habit_id, day));`,
];

export async function migrate(db: SQLiteDatabase): Promise<void> {
  await db.execAsync('PRAGMA journal_mode = WAL');
  const row = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
  let version = row?.user_version ?? 0;
  if (version > migrations.length) throw new Error('This data was written by a newer version of the app.');
  while (version < migrations.length) {
    const step = version;
    // A crash between steps resumes at the next one.
    await db.withExclusiveTransactionAsync(async (txn) => {
      await txn.execAsync(migrations[step]);
      await txn.execAsync(`PRAGMA user_version = ${step + 1}`);
    });
    version++;
  }
}

export async function loadHabits(db: SQLiteDatabase, today: Day): Promise<Habit[]> {
  const habits = await db.getAllAsync<HabitRow>('SELECT * FROM habit ORDER BY position, created_at');
  const completions = await db.getAllAsync<CompletionRow>('SELECT habit_id, day FROM completion');
  const days = new Map<string, Set<Day>>();
  for (const { habit_id, day } of completions) {
    if (!days.has(habit_id)) days.set(habit_id, new Set());
    days.get(habit_id)!.add(day);
  }
  return habits.map(({ id, name }) => {
    const done = days.get(id) ?? new Set<Day>();
    const { count, forgiven } = streak(done, today);
    return { id, name, doneToday: done.has(today), streak: count, forgiven };
  });
}

export async function addHabit(db: SQLiteDatabase, name: string): Promise<void> {
  await db.runAsync(
    'INSERT INTO habit (id, name, position, created_at) VALUES (?, ?, (SELECT COALESCE(MAX(position), -1) + 1 FROM habit), ?)',
    randomUUID(),
    name.trim(),
    new Date().toISOString(),
  );
}

export async function renameHabit(db: SQLiteDatabase, id: string, name: string): Promise<void> {
  await db.runAsync('UPDATE habit SET name = ? WHERE id = ?', name.trim(), id);
}

export async function deleteHabit(db: SQLiteDatabase, id: string): Promise<void> {
  await db.withExclusiveTransactionAsync(async (txn) => {
    await txn.runAsync('DELETE FROM completion WHERE habit_id = ?', id);
    await txn.runAsync('DELETE FROM habit WHERE id = ?', id);
  });
}

export async function setDone(db: SQLiteDatabase, id: string, day: Day, done: boolean): Promise<void> {
  if (done) await db.runAsync('INSERT OR IGNORE INTO completion (habit_id, day) VALUES (?, ?)', id, day);
  else await db.runAsync('DELETE FROM completion WHERE habit_id = ? AND day = ?', id, day);
}

export async function exportRows(db: SQLiteDatabase): Promise<{ habits: HabitRow[]; completions: CompletionRow[] }> {
  return {
    habits: await db.getAllAsync<HabitRow>('SELECT * FROM habit ORDER BY position, created_at'),
    completions: await db.getAllAsync<CompletionRow>('SELECT habit_id, day FROM completion ORDER BY habit_id, day'),
  };
}

// Replaces everything in one transaction. A failure part of the way leaves the old data in place.
export async function replaceAll(db: SQLiteDatabase, backup: Backup): Promise<void> {
  await db.withExclusiveTransactionAsync(async (txn) => {
    await txn.execAsync('DELETE FROM completion; DELETE FROM habit;');
    for (const habit of backup.habits) {
      await txn.runAsync('INSERT INTO habit (id, name, position, created_at) VALUES (?, ?, ?, ?)', habit.id, habit.name, habit.position, habit.created_at);
    }
    for (const row of backup.completions) {
      await txn.runAsync('INSERT INTO completion (habit_id, day) VALUES (?, ?)', row.habit_id, row.day);
    }
  });
}
