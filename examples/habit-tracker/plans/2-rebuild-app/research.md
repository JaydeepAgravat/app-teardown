# Research: Loop Habit Tracker and its space

Done on 2026-10-04 with web search and page fetches. Read this section first: it says what the research does and does not cover.

## What was read

| Source | What it gave | Limit |
|---|---|---|
| [Google Play listing](https://play.google.com/store/apps/details?id=org.isoron.uhabits) | Nothing | The page came back truncated. **No Play Store reviews were read.** Rating, rating count and downloads are not recorded here |
| [F-Droid listing](https://f-droid.org/en/packages/org.isoron.uhabits/) | Version, license, permissions | No reviews on this store |
| [The app's public issue tracker](https://github.com/iSoron/uhabits/issues?q=is%3Aissue+is%3Aopen+sort%3Areactions-%2B1-desc) | The 15 open issues with the most reactions | Issue reporters are engaged users, not typical ones |
| [AlternativeTo](https://alternativeto.net/software/uhabits/about/) | 6 user comments, 12 ratings | Small sample, mostly positive |
| [A comparison article](https://2sync.com/blog/best-habit-tracker-apps) | Platforms, prices and stated cons of five apps | One author's view. The publisher sells a related product |

No App Store link was given, and the app has no iOS version. No forum threads were reached. Treat the counts that follow as "what came up in about 20 issues and 6 comments", not as market data.

## 1. The app

- **Name:** Loop Habit Tracker. Package `org.isoron.uhabits`.
- **Latest version:** 2.3.1, released 2025-08-21 (F-Droid).
- **Price:** free, no ads, no purchases (comparison article).
- **License:** GPL 3.0. The source is public.
- **Platforms:** Android only.
- **Permissions (F-Droid):** notifications, start at device startup, exact alarms, vibration. No network permission is listed.
- **Claim:** helps you create and keep habits, with a habit strength score, flexible schedules, reminders and widgets.

## 2. Complaints, by theme

| Theme | How often | Evidence | Chapter |
|---|---|---|---|
| Not on other platforms | The two most reacted issues: 30 and 23 reactions | [#486](https://github.com/iSoron/uhabits/issues/486) "Make Loop Habit Tracker a multiplatform application". [#487](https://github.com/iSoron/uhabits/issues/487) asks for an iOS version. AlternativeTo: "runs on Android, but unfortunately not iPhone, Mac, or web" | 32 |
| No sync across devices | 13 reactions, and named as a con in the article | [#702](https://github.com/iSoron/uhabits/issues/702) "Allow app to sync data across devices" | 12, 54 |
| Reminders are unreliable or annoying | 2 issues, 10 reactions | [#1573](https://github.com/iSoron/uhabits/issues/1573): a notification asks even when the habit is already entered. [#1808](https://github.com/iSoron/uhabits/issues/1808) "Reminder not shown when device was off or app force-closed at due time" | 23 |
| Backup export fails | 6 reactions | [#1854](https://github.com/iSoron/uhabits/issues/1854) "Failed to export full backup" | 54 |
| Score and statistics wrong in edge cases | 4 issues | [#1991](https://github.com/iSoron/uhabits/issues/1991), [#1695](https://github.com/iSoron/uhabits/issues/1695) "Skips impact the score for non-everyday habits", [#1829](https://github.com/iSoron/uhabits/issues/1829), [#1508](https://github.com/iSoron/uhabits/issues/1508) | 9 |
| Widget layout on some devices | 7 reactions | [#2167](https://github.com/iSoron/uhabits/issues/2167) | 25 |
| Crash on an extreme date | 1 issue | [#2229](https://github.com/iSoron/uhabits/issues/2229) "The app crashes when try to scroll to 1969" | 37 |

Causes are not claimed here. Each row is Observed as a report. Why it happens is Speculative until the app is torn down or its source is read.

A web search also returned complaints about lag, crashes and wrong values from a review site. Those pages are about a different app with a similar name, so they are left out.

## 3. What users praise

From AlternativeTo (4.8 of 5 from 12 ratings):

- Simplicity: "Simple, direct and intuitive."
- Widgets: "Widgets are extremely helpful, and there are plenty of them!"
- Flexible schedules: "x days per x days/weeks/months/years."
- The comparison article praises the habit strength score because it does not punish one missed day the way a plain streak does.

A new app must not do worse on: speed and simplicity, no account, no ads, and a score that forgives a miss.

## 4. Competitors

From the comparison article. Prices as stated there.

| App | Platforms | Price | Stated cons |
|---|---|---|---|
| Loop Habit Tracker | Android | Free | Android only, no sync, no social features |
| Habitica | Web, iOS, Android | Free, optional subscription | Game layer is not for everyone, can overwhelm |
| Streaks | Apple devices | One-time purchase | Apple only, 24-habit limit |
| HabitNow | Android | Free, one-time unlock | Android only, free tier capped at 7 habits |
| Habitify | iOS, Android, Mac, web | Free for 3 habits, then subscription | Free plan stops at 3 habits, insights are paywalled |

| Complaint | Loop | Habitica | Streaks | HabitNow | Habitify |
|---|---|---|---|---|---|
| One platform only | yes | no | yes | yes | no |
| No sync | yes | no | not stated | not stated | no |
| Habit limit or paywall | no | no | yes | yes | yes |
| Too complex | no | yes | no | not stated | not stated |

The gap this shows: no app in the table is at once free, simple, on both phone platforms, and without a habit limit.

## 5. Audience

The sources say little. Issue reporters are technical Android users who care about open source and privacy. Regions and devices are unknown.

## 6. Opportunities, ranked

| # | Opportunity | Why it ranks here | Size |
|---|---|---|---|
| 1 | Both phone platforms from one codebase | The most reacted requests. Already true of the first version | Done |
| 2 | A backup that always works and can be checked | A failed export is the worst failure when the device holds the only copy | Small: already built, add a "verify this file" check |
| 3 | Reminders that do not nag: none if the habit is already done, and still fire after a force-quit | Two separate issues, and reminders are what bring a user back | Medium |
| 4 | A streak that forgives one miss | The most praised idea in the existing app | Small |
| 5 | Skip days that do not break or inflate the streak | A repeated source of score bugs | Small |
| 6 | Sync across devices | Wanted, and the largest piece of work by far | Large |
| 7 | Widgets | Much praised in the existing app, and a new one has none | Medium, per platform |
