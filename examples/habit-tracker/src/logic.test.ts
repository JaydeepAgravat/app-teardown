import assert from 'node:assert/strict';
import { test } from 'node:test';

import { parseBackup, serializeBackup } from './backup.ts';
import { isDay, localDay, previousDay, streak } from './days.ts';

test('localDay uses the local calendar date', () => {
  assert.equal(localDay(new Date(2026, 9, 4, 23, 59)), '2026-10-04');
  assert.equal(localDay(new Date(2026, 0, 1, 0, 0)), '2026-01-01');
});

test('previousDay crosses months, years and leap days', () => {
  assert.equal(previousDay('2026-10-01'), '2026-09-30');
  assert.equal(previousDay('2026-01-01'), '2025-12-31');
  assert.equal(previousDay('2024-03-01'), '2024-02-29');
});

test('isDay rejects impossible dates', () => {
  assert.ok(isDay('2024-02-29'));
  assert.ok(!isDay('2026-02-30'));
  assert.ok(!isDay('2026-2-3'));
});

const days = (...offsets: number[]) => {
  // Offsets are days before 2026-10-20: 0 is today, 1 is yesterday.
  const set = new Set<string>();
  for (const offset of offsets) set.add(new Date(Date.UTC(2026, 9, 20 - offset)).toISOString().slice(0, 10));
  return set;
};
const today = '2026-10-20';

test('streak without misses', () => {
  assert.deepEqual(streak(new Set(), today), { count: 0, forgiven: 0 });
  assert.deepEqual(streak(days(0), today), { count: 1, forgiven: 0 });
  assert.deepEqual(streak(days(0, 1, 2), today), { count: 3, forgiven: 0 });
  // Today not done yet: yesterday's run still counts.
  assert.deepEqual(streak(days(1, 2), today), { count: 2, forgiven: 0 });
});

test('streak bridges a single missed day and does not count it', () => {
  assert.deepEqual(streak(days(0, 1, 3, 4, 5), today), { count: 5, forgiven: 1 });
  // Yesterday missed, today still pending: the run before it is kept.
  assert.deepEqual(streak(days(2, 3), today), { count: 2, forgiven: 1 });
});

test('streak does not bridge two missed days in a row', () => {
  assert.deepEqual(streak(days(0, 3, 4), today), { count: 1, forgiven: 0 });
  assert.deepEqual(streak(days(3, 4), today), { count: 0, forgiven: 0 });
});

test('streak forgives at most one miss per 7 days', () => {
  // Misses at offsets 2 and 8 are 6 days apart: the second is not bridged.
  assert.deepEqual(streak(days(0, 1, 3, 4, 5, 6, 7, 9, 10), today), { count: 7, forgiven: 1 });
  // Misses at offsets 2 and 9 are 7 days apart: both are bridged.
  assert.deepEqual(streak(days(0, 1, 3, 4, 5, 6, 7, 8, 10, 11), today), { count: 10, forgiven: 2 });
});

test('backup round trip', () => {
  const habits = [{ id: 'a', name: 'Read', position: 0, created_at: '2026-10-01T00:00:00.000Z' }];
  const completions = [{ habit_id: 'a', day: '2026-10-03' }, { habit_id: 'a', day: '2026-10-04' }];
  const parsed = parseBackup(serializeBackup(habits, completions));
  assert.deepEqual(parsed.habits, habits);
  assert.deepEqual(parsed.completions, completions);
});

test('backup rejects damaged files', () => {
  assert.throws(() => parseBackup('not json'), /not valid JSON/);
  assert.throws(() => parseBackup('{"habits":[]}'), /not a habit tracker backup/);
  assert.throws(() => parseBackup('{"version":99,"habits":[],"completions":[]}'), /newer version/);
  assert.throws(() => parseBackup('{"version":1,"habits":[{"id":"a","name":" "}],"completions":[]}'), /Habit 1/);
  assert.throws(() => parseBackup('{"version":1,"habits":[],"completions":[{"habit_id":"x","day":"2026-10-04"}]}'), /belongs to no habit/);
  assert.throws(() => parseBackup('{"version":1,"habits":[{"id":"a","name":"A"}],"completions":[{"habit_id":"a","day":"yesterday"}]}'), /Entry 1/);
});
