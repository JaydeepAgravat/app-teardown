# Progress

## Phase 1: done

- `src/days.ts`: `streak()` returns `{ count, forgiven }` and bridges a single miss, at most one per 7 days.
- `src/store.ts`: `Habit` carries `forgiven`.
- `App.tsx`: the row shows "1 miss forgiven" under the streak, and the accessibility label reads it.
- `src/logic.test.ts`: 4 streak tests, including both sides of the 7-day boundary.

## Verified

- Unit tests: 9 of 9 pass. Type check: clean.
- iPhone 17 simulator, release build: a habit done on Sep 30, Oct 2, 3 and 4 shows "4 days, 1 miss forgiven". A habit done on Sep 30, Oct 2 and 3, with today pending, shows "3 days, 1 miss forgiven" (`forgiven.png`).

## Not verified

- Android. Large text with the second line on the row. A screen reader reading the new label.
- The force-quit probe was not repeated after this change. The write path was not touched.
