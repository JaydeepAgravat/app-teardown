# Decisions

Every row was chosen by the user from options with trade-offs, unless marked as an assumption.

| Decision | Chosen | Why | Rejected | Chapter |
|---|---|---|---|---|
| Archetype variant | Personal data on the device | No account, no backend, the local store is the only copy | Pure tool, platform sync | 54 |
| Stack | Expo React Native | One codebase, fastest to build | Native Android, native iOS | 32 |
| What "never lose history" covers | Force-quit, app updates, plus export and import | A JSON export is a full backup without building sync | Force-quit and updates only, sync across devices | 54 |
| Reminders | None in the first version | No permission prompt, smallest build | One daily reminder, one per habit | 23 |
| Nearest existing app | None, generic design | Fastest | Web search for similar apps | 1 |
| Local store | SQLite database | One transaction per tap, versioned migrations | One JSON blob in key-value storage, a JSON file | 11, 54 |
| Streak data | One row per habit per day, streak computed | History is the truth, the streak cannot drift | Stored counter, rows plus cached counter | 9 |
| Day boundary | Local calendar date at the moment of the tap, stored as text (`2026-10-04`) | A done day stays done after travel | Timestamp converted when shown | 2, 37 |
| Mistakes | Tap again undoes today, delete asks to confirm | Small and predictable | Editing past days, archive on delete | 9 |
| Export format | JSON, round trip (assumption) | Open format, the user can leave with their data | Own format, export only | 54 |
| Third parties | None: no ads, analytics or crash reporting (assumption) | Matches "no backend", zero network use | | 27, 34 |
| Monetization | Free (assumption) | Test build | | 26 |

## Chapters skipped

- 10, 13, 14, 20: no network client, no backend, no account.
- 12: no sync. The second-device path is export and import only.
- 15 to 19: a short list with no media.
- 21, 22: no secrets and no permissions requested.
- 24 to 31, 33, 36, 38: no hardware, surfaces, payments, ads, search, remote config or SDKs in this version.
