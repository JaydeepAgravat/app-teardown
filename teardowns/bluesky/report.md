# Teardown: Bluesky

- **app:** xyz.blueskyweb.app
- **version:** 1.133.0
- **device:** Android 15 emulator, sdk_gphone64_arm64
- **date:** 2026-10-04

## 4. Probes

- **Stored data on the device:** grows with use

### Probe results

- **P4.1 Footprint survey:** Stored data is modest and grows as you browse. A cache filled by visits. Chapter 11 covers what it holds and when it is discarded. (Inferred)
  - Seen: Device settings showed 130 MB app, 6.3 MB user data and 10.2 MB cache at the start. After about 20 minutes of browsing: 7.2 MB user data and 29.5 MB cache. Almost all growth was in the area the system counts as cache.

## 7. Launch and startup

- **First-screen strategy:** skeleton placeholders
- **Cold start against return:** cold clearly slower
- **Cold start with no network:** shell with error
- **Session check at startup:** local then lazy
- **Landing rule:** always home

### Probe results

- **P7.1 Cold against warm:** The cold launch is clearly slower, and the return is instant. A cold start with visible initialization or a fetch, and a resume that does no work. P7.2 shows what the cold start waits for. (Observed)
  - Seen: Three cold starts drew a first frame after 1.1, 3.0 and 2.9 seconds. A return to the running app took 0.6 seconds.
- **P7.2 First-screen strategy:** The layout appears with placeholders, then fills in. Skeleton placeholders. The first frame does not wait, and the content does. (Observed)
  - Seen: A splash with the logo, a blank frame, then the home layout with gray placeholder rows, then posts. The first placeholder frame came about 7 seconds after launch on this emulator.
  - Evidence: evidence/p7-2-start-5.png
- **P7.3 Launch in airplane mode:** The app's layout, with an error or empty sections. Startup decisions are local. Content is not stored across launches. (Inferred)
  - Seen: Airplane mode, force-quit, relaunch. The app opened signed in and drew the home layout with placeholder rows. No posts, no error and no offline message appeared in 30 seconds.
  - Evidence: evidence/p7-3-offline-launch.png
- **P7.4 Where it lands:** Home in both cases. The app landed on its home screen after both cold starts. Either it does not persist the last screen, or it restores it only under a condition you did not meet, such as an account type, a platform or a time limit. (Inferred)
  - Seen: Force-quit from the Explore tab reopened on Home. A system-style process death from a post thread also reopened on Home. The next-day case was not waited for.

## 8. Navigation, deep links and screen state

- **Tab histories:** independent histories
- **Restored after process death:** none
- **Link while signed in:** opens the item
- **Back stack after a link:** synthesized back stack
- **Link into a running app:** presented over current place

### Probe results

- **P8.1 Tab histories:** The same screen at the same scroll position, with no reload. Each tab has its own stack, and its screens stay alive while another tab is shown. (Inferred)
  - Seen: Deep in the Home feed, a switch to the Search tab and back, an opened post and back, and 20 seconds in the background each returned to the same posts at the same pixel positions.
- **P8.3 Long absence in the middle of a task:** A splash, then the app's home screen. Navigation state was in memory only, or the app restores it only under a condition, such as a time limit, an account type or a platform. A shorter absence that still shows a splash tests the time limit. The other conditions cannot be ruled out from one account on one device. (Speculative)
  - Seen: A post thread was open. The tool sent the app to the background and ended its process the way the system does under memory pressure, which keeps the system's saved state. On reopening, the app cold-started and showed the Home feed, not the thread. The wait was simulated, not real.
- **P8.5 Link while signed in:** The app opens on the item. A router maps the link to a route and can reach the screen from a cold start. (Observed)
  - Seen: With the app closed, a link to the bsky.app profile cold-started the app directly on that profile.
- **P8.6 Back after a link:** A parent screen inside the app. A synthesized back stack. The router built the screens that would normally sit under the target. (Inferred)
  - Seen: Back from the profile reached by link led to the Home feed inside the app, not out of the app.
- **P8.7 Link into a running app:** You return to the screen you were on. The router presents the target over the existing navigation state and keeps the user's place. (Observed)
  - Seen: With the app open on the Home feed, a link to the bsky.app profile was opened from outside. The profile was pushed on top of the feed in the running app, and back returned to the feed.

## 9. State and UI data flow

- **Failed refresh over content:** content kept silently

### Probe results

- **P9.5 Failed refresh:** The content stays, and nothing reports the failure. Content and activity are separate, and the error is discarded. You cannot tell from this whether a store stands behind the screen. (Speculative)
  - Seen: Offline, a pull to refresh on the loaded feed left the posts in place. No error, banner or retry control was on screen 2, 8 and 22 seconds later. A message shown briefly between those samples would have been missed.

## 11. Local storage, caching and prefetching

- **Cache tiers:** memory only
- **Clear-cache control:** cache only
- **Detail screen data source:** seeded from list

### Probe results

- **P11.1 Memory or disk:** Content appears before the force-quit and not after. The data was held in a memory cache only. Nothing for this screen is written to disk. (Inferred)
  - Seen: Offline, the feed and an opened thread were still shown while the app stayed alive. After a force-quit and an offline relaunch the feed was placeholders only.
- **P11.5 Clear cache:** The figure drops, you stay signed in, and settings and downloads are intact. Cached data is stored apart from data that cannot be recreated. Screens reload from the backend. (Inferred)
  - Seen: Settings, About has a Clear image cache control. Using it dropped the system's cache figure from 29.5 MB to 7.2 MB. User data stayed at 7.2 MB and the account stayed signed in.
- **P11.6 Unvisited detail:** Only what the list row showed appears, and the rest fails to load. Seeding. The detail screen starts from the list item or from a shared entity cache. No detail request was made ahead. (Inferred)
  - Seen: Offline, a post never opened showed its full thread header at once, with its image, exact time and counts, and no error. Everything shown is data the feed row already carried. The post had no replies, so a failed reply fetch would not be visible.

## 12. Offline and sync

- **Offline read scope:** visited

### Probe results

- **P12.1 Offline read:** Visited screens appear, unvisited ones do not. Level 1 or above, with a cache filled by visits. (Inferred)
  - Seen: Visited screens showed their content offline while the process lived. Tabs never opened (Explore, Notifications) drew their layout with placeholders. Nothing survived a force-quit, so this is Level 1 within one run of the app and Level 0 across launches.
  - Evidence: evidence/p12-1-notifications-offline.png

## 13. Network transport and resilience

- **Recovery when the network returns:** automatic

### Probe results

- **P13.2 Recovery:** The content loads by itself. The client listens for connectivity changes, or a retry with backoff was still running. The delay before it loads hints at which. (Inferred)
  - Seen: With the feed stuck on placeholders, airplane mode was turned off and the app was not touched. Posts appeared between 6 and 12 seconds later.

## 15. Lists, feeds and pagination

- **Ranking stability on refresh:** new items each time

### Probe results

- **P15.5 Refresh a ranked feed twice:** Mostly different items each time. Each refresh builds a new feed and holds back what was already shown. The backend records what you have seen. (Inferred)
  - Seen: Three pulls to refresh on the Discover feed, about 7 seconds apart. The leading posts were from different accounts after the second and the third pull.

## 32. UI technology: native, cross-platform and web

- **Text selection:** none
- **System text size:** all screens scale

### Probe results

- **P32.1 Long-press text:** Nothing selects anywhere. No conclusion. Selection is off by default in most toolkits, and a careful web page disables it. (Observed)
  - Seen: A long press on post text in the feed and on the Discover tab label produced no selection handles and no copy menu. Thread and profile screens were not tried.
- **P32.2 Raise the system text size:** Every screen grows. The system setting reaches every screen. Consistent with the platform's own controls throughout, or with a toolkit that forwards the setting. (Speculative)
  - Seen: System text size raised from 1.0 to 1.5 while the app was open. The Discover tab label grew from 192 by 60 to 290 by 78 pixels at once, with no relaunch, and rows moved down to fit. Only the Home screen was measured. The growth was about 1.3 times, which suggests the app caps scaling.

## 38. Modularity, SDKs and team scale

- **Licenses screen:** not found

### Probe results

- **P38.1 Read the licenses screen:** No such screen can be found. No conclusion. The notices may be on a website or in a place you did not find. (Observed)
  - Seen: No open-source licenses screen was found under Settings, About, which lists Terms of Service, Privacy Policy, Status Page, System log, Clear image cache, Send error report and the version. Other settings pages were not searched.
