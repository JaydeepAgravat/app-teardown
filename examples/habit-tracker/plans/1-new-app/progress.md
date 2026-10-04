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

## Second round of checks

A probe found a real bug here. At the largest text size on the iPhone simulator (P37.1), the title collapsed to one letter per line and the habits were pushed off screen. The fix: the header and the add row now scroll with the list, and button and title text stop growing at 1.4 times while habit text grows to 2 times.

| Check | Probe | iPhone 17 simulator | Android 11 emulator |
|---|---|---|---|
| Tap, force-quit at once, relaunch | P54.4 | Tap survived | Tap survived |
| Launch in airplane mode | P7.3 | Not possible on the simulator | Full content, no difference |
| Tap in airplane mode, force-quit, relaunch | P54.4 | Not possible | Tap survived |
| Process killed in the background, reopen | P8.4 | Not run | Same content |
| Cold start, to first frame | P7.1 | Not timed | 176, 177 and 188 ms |
| Largest text size | P37.1 | Failed, then fixed and passed | Passed at 2.0 (`android-large-text.png`) |
| Device moved to a zone where it is already tomorrow | P37.8 | Done days kept their dates | Done days kept their dates, and came back as done today when the zone was restored |
| Update the app with data in place | P7.9 | Data kept across four rebuilds | Data kept across a reinstall |
| Rotation | P9.6 | Not applicable: the app is locked to portrait | Same |

One more finding from Android: the build declared the internet permission by default, although the app has no network client. An outside observer would count that against the "no backend" claim (P54.1). It is now removed in `app.json`, and the installed app declares no internet permission.

## Not verified

- Export and import on Android. The share sheet and file picker were driven on the iPhone simulator only.
- A screen reader reading the rows. The labels are set and were read from the accessibility tree on Android, not heard.
- An import of a damaged file on a device. The rejection paths are covered by unit tests only.
- An upgrade from one schema version to the next. There is only one version so far.
- A real device of either kind.

## Known gaps

- Keyboard input through the test tool dropped characters, so the first test habit is named "Read 1Walk". That is the tool, not the app.
- No reordering, no reminders, no editing of past days. All three were left out by decision.
