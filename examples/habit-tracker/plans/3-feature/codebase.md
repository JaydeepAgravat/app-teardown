# Codebase: habit-tracker

## Stack and layout

Expo SDK 57, React Native 0.86, TypeScript, strict. One screen, no router. Run with `npx expo run:ios` or `run:android`. Checks: `npm test` (Node's test runner on `src/logic.test.ts`) and `npm run typecheck`.

| File | Role |
|---|---|
| `App.tsx` | The only screen. Holds screen state, calls the store, reloads after every write |
| `src/days.ts` | Pure logic: the local day, day arithmetic, `streak(doneDays, today)` |
| `src/store.ts` | SQLite schema, migrations, reads and writes. `loadHabits` builds `Habit { id, name, doneToday, streak }` |
| `src/backup.ts` | Export file format and validation |
| `src/logic.test.ts` | Unit tests for the pure logic |

## Decisions already made, which this feature inherits

- The streak is computed from the completion rows on every load and never stored. So the feature needs no schema change and no migration.
- A day is a local calendar date as text. Day arithmetic goes through `previousDay`.
- Today not yet done does not break the streak: counting starts from yesterday.
- Pure logic lives in `src/days.ts` with no imports, and is unit tested. UI reads a ready `Habit` object.
- The export file holds only habits and completions. A computed value does not belong in it.
- Accessibility: each row has a label that reads the name and the streak.

## Closest existing feature

The streak itself: `streak()` in `src/days.ts`, called from `loadHabits` in `src/store.ts`, shown in the row in `App.tsx`. The new feature changes that one function, its type, and the row text.

## Constraints

No backend, no flags, no analytics. Not committed beyond the template's initial commit.
