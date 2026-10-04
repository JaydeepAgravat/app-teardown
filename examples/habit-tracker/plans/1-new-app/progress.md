# Progress

Project: this folder, `examples/habit-tracker` (Expo SDK 57, React Native 0.86, TypeScript).

## Phases 1 to 3: built together, at the user's request

- `src/days.ts`: the local calendar day, day arithmetic and the streak.
- `src/backup.ts`: the export file format, with full validation on import.
- `src/store.ts`: the SQLite schema, the migration runner and every read and write.
- `App.tsx`: the one screen. Add, tap to toggle, long press to rename or delete, export and import.
- `src/logic.test.ts`: 6 unit tests for the streak, the dates and the backup round trip.

## Changes from the plan

- The app has one screen, so it uses no router.
- Reads the whole completion table on each load. Fine at this size. A query per habit is the next step if history grows large.

## Verified

- Unit tests: 6 of 6 pass (`npm test`).
- Type check: clean (`npm run typecheck`).
- Project doctor: 21 of 21 checks pass.
- Android bundle: builds (`expo export`).


## Verified on an iPhone 17 simulator (release build)

| Check | Probe | Result |
|---|---|---|
| Tap a habit, force-quit at once, relaunch | P54.4, P8.4 | The tap was still there: done, streak 1 day |
| Add two habits, force-quit, relaunch | P8.4 | Both still there |
| Streak with past days in the database | | 3 days with today done, 2 days with today not done, a gap ends the run |
| Rename through the long-press menu | | Saved and shown |
| Delete with confirm | | Habit and its done days removed from the database |
| Export, delete a habit, import the file, force-quit, relaunch | P54.6 | Same habits and streaks as before the delete (`after-import.png`) |

## Not verified

- Android: only the bundle was built. The app was not run on an Android device.
- P7.3 (airplane mode): the simulator has none. The app has no network client, so nothing should change.
- P37.1 (large text), P37.8 (time zone change), P9.6 (rotation): not run.
- An import of a damaged file on the device. The rejection paths are covered by unit tests only.
- An upgrade from one schema version to the next. There is only one version so far.

## Known gaps

- Keyboard input through the test tool dropped characters, so the first test habit is named "Read 1Walk". That is the tool, not the app.
- No reordering, no reminders, no editing of past days. All three were left out by decision.
