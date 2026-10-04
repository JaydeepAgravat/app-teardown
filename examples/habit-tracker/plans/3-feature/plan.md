# Plan: a streak that forgives one missed day

## Summary

`streak()` returns the count of done days in the current run and the number of misses it bridged. A miss is bridged when it is a single day, the day before it was done, and the last bridged miss is at least 7 days later. The row shows the count and, when it applies, a note.

## Design

No new component, no schema change, no migration. Three files change:

- `src/days.ts`: `streak()` returns `{ count, forgiven }`.
- `src/store.ts`: `Habit` gains `forgiven`.
- `App.tsx`: the row shows the note and the accessibility label reads it.

## One phase

- **Goal.** A habit done on 5 of the last 6 days, with one miss in the middle, shows "5 days" and "1 miss forgiven" instead of a reset.
- **Work.** The rule, its unit tests, the type, the row.
- **Left out.** A setting to turn it off. Skip days. A strength score.
- **Verified by.** Unit tests for: one miss bridged, two misses in a row not bridged, a second miss inside 7 days not bridged, a second miss 7 days apart bridged, today pending. Type check. On the simulator: P54.4 again (the tap still survives a force-quit), and the row for a history with one miss.
- **Risk.** An off-by-one at the 7-day window. Covered by the boundary tests.
