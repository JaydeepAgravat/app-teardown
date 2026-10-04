# Habit tracker: an app planned and built with the three commands

A small habit tracker with no account and no backend. It exists to show what the handbook's build commands produce. Every design decision in it was put to an engineer as a question with trade-offs, and the plans are kept beside the code.

| Step | Command | What it produced |
|---|---|---|
| 1 | `npm run new-app -- "A tiny habit tracker..."` | [plans/1-new-app](plans/1-new-app/): brief, decisions, a plan in 3 phases, progress. Then the app itself |
| 2 | `npm run rebuild-app -- <store link> --competitors` | [plans/2-rebuild-app](plans/2-rebuild-app/): research on an existing habit tracker and its competitors, with sources, and a ranked list of opportunities |
| 3 | `node bin/plan.mjs feature "A streak that forgives one missed day" --repo examples/habit-tracker` | [plans/3-feature](plans/3-feature/): notes on the codebase, 3 decisions, a one-phase plan. Then the change in `src/days.ts` |

## Run it

```bash
npm install
```

```bash
npm test
```

```bash
npx expo run:ios
```

Use `npx expo run:android` for Android. The app has been run on an iPhone simulator only.

## What to read

- `src/days.ts`: the local day and the streak, including the rule that forgives one miss per 7 days.
- `src/store.ts`: the SQLite schema, the migration runner and every write.
- `src/backup.ts`: the export file and its validation.
- `App.tsx`: the one screen.

## Limits

See the "Not verified" lists in each plan's `progress.md`. The research in step 2 could not read the store's own reviews and says so.
