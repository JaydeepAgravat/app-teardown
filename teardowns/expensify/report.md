# Teardown: Expensify

- **app:** org.me.mobiexpensifyg
- **version:** 9.4.99-2
- **device:** Android 15 emulator, sdk_gphone64_arm64
- **date:** 2026-10-04

## 3. The universal app model

- **Local store:** present
- **Network client:** present
- **Sync engine:** unclear

### Probe results

- **P3.1 Offline tour:** The action is accepted with a pending indicator. A local store and a queue of unsent changes. Whether a sync engine drains it is settled in Chapter 12. (Inferred)
  - Seen: Offline, stored screens opened and a sent message was accepted and drawn dimmed until the network returned.

## 4. Probes

- **Stored data on the device:** grows with use
- **Launch in airplane mode:** content shown and writes accepted
- **After a force-quit:** start screen and draft kept

### Probe results

- **P4.1 Footprint survey:** Stored data is modest and grows as you browse. A cache filled by visits. Chapter 11 covers what it holds and when it is discarded. (Inferred)
  - Seen: Device settings showed 3.7 MB user data and 1.4 MB cache at the start. After the run: 6.2 MB user data and 0.9 MB cache. The growth was in user data, not in the area the system counts as cache.
- **P4.2 Launch in airplane mode:** Earlier content appears, and the change is accepted. An optimistic update on top of stored content. Chapter 12 settles whether an outbox stands behind it. (Inferred)
  - Seen: See P7.3 for the offline launch and P12.2 for the accepted offline message.
- **P4.3 Force-quit and reopen:** The start screen opens, and the text is still in its field. Drafts are written to the local store as you type. Navigation is not restored after a quit by the user. Read Chapters 8 and 9. (Inferred)
  - Seen: Same run as P8.4: start screen, draft kept.

## 7. Launch and startup

- **First-screen strategy:** cached content first
- **Cold start against return:** cold clearly slower
- **Cold start with no network:** cached content
- **Session check at startup:** local then lazy
- **Landing rule:** always home

### Probe results

- **P7.1 Cold against warm:** The cold launch is clearly slower, and the return is instant. A cold start with visible initialization or a fetch, and a resume that does no work. P7.2 shows what the cold start waits for. (Observed)
  - Seen: Cold starts drew a first frame after 1.5 to 2.7 seconds, and that frame was a splash that stayed until about 12 seconds after launch on this emulator. A return to the running app took 1.7 seconds.
- **P7.2 First-screen strategy:** The splash stays until a complete screen appears. Either a blocking fetch or local startup work behind a splash. P7.3 separates them. If the same splash ends in real content in airplane mode, the wait is local and the content was stored. If it ends in an error or never ends, the wait is the network. (Speculative)
  - Seen: A splash with the logo stayed until the complete Home screen appeared. No placeholder frame was captured. The same happened in airplane mode, see P7.3.
  - Evidence: evidence/splash.png
- **P7.3 Launch in airplane mode:** The normal first screen, with content. Session, config and content are all read from the device. No startup step blocks on the network. (Inferred)
  - Seen: Airplane mode, force-quit, relaunch. After the same splash as online, the full Home screen appeared with the greeting, the to-do section and a past expense, plus a line saying: You appear to be offline.
- **P7.4 Where it lands:** Home in both cases. The app landed on its home screen after both cold starts. Either it does not persist the last screen, or it restores it only under a condition you did not meet, such as an account type, a platform or a time limit. (Inferred)
  - Seen: Home after a force-quit from a chat, and Home after a system-style process death from a chat. The next-day case was not waited for.

## 8. Navigation, deep links and screen state

- **Unfinished input:** draft kept apart from the screen
- **Restored after process death:** none
- **Survives a force-quit:** draft survives
- **Link while signed in:** opens the item
- **Back stack after a link:** synthesized back stack
- **Link into a running app:** replaces current place

### Probe results

- **P8.2 Half a form:** The text survives both. A draft is stored apart from the screen, keyed by the thing it belongs to. P8.4 shows whether it is stored durably. (Inferred)
  - Seen: An unsent draft typed in the self-chat composer was still there after switching to the device home screen and back, and after a force-quit and relaunch.
- **P8.3 Long absence in the middle of a task:** A splash, then the app's home screen. Navigation state was in memory only, or the app restores it only under a condition, such as a time limit, an account type or a platform. A shorter absence that still shows a splash tests the time limit. The other conditions cannot be ruled out from one account on one device. (Speculative)
  - Seen: With the self-chat open, the process was ended the way the system does it, keeping saved state. The app cold-started on its Home tab, not in the chat. The wait was simulated, not real.
- **P8.4 Force-quit and reopen:** The home screen, and the text is there when you reach the form. A draft in the local store. Navigation state is not persisted by the app. (Inferred)
  - Seen: After a force-quit with a draft in the composer, the app reopened on its Home tab. The draft was in the composer when the chat was opened again.
- **P8.5 Link while signed in:** The app opens on the item. A router maps the link to a route and can reach the screen from a cold start. (Observed)
  - Seen: With the app closed, a link to the About settings page cold-started the app on that page.
- **P8.6 Back after a link:** A parent screen inside the app. A synthesized back stack. The router built the screens that would normally sit under the target. (Inferred)
  - Seen: Back from the page reached by link led to the Account tab inside the app, which is the page's parent.
- **P8.7 Link into a running app:** You reach a parent of the item, and your earlier place is gone. The router replaces the navigation state with a stack built for the target. (Inferred)
  - Seen: With the app on the Inbox tab, a link to the About settings page was opened from outside. The app showed About. Back led to the Account tab, the parent of About, and not to the Inbox.

## 9. State and UI data flow

- **List after a change on the detail screen:** already updated

### Probe results

- **P9.1 Change and go back:** The row shows the change in both runs. The list and the detail screen read one copy, or the list was told about the change inside the client. A shared store or change events. (Inferred)
  - Seen: A message sent online appeared as the preview on the chat's Inbox row on going back. A message sent offline did the same, while still pending.

## 11. Local storage, caching and prefetching

- **Cache tiers:** memory and disk
- **Detail screen data source:** on device before open

### Probe results

- **P11.1 Memory or disk:** Content appears on both offline visits. The screen's data is in a disk cache or a local store. It survived process death. (Inferred)
  - Seen: Offline, chats and their history were shown both while the app stayed alive and after a force-quit and relaunch.
- **P11.6 Unvisited detail:** Content the list row did not show appears, such as full text or a large image. Either the detail was prefetched, or the list response already carried the full items. Both mean the data was on the device before you asked. (Inferred)
  - Seen: Offline, the self-chat opened from the Inbox with its full earlier history, far more than the one-line preview on the Inbox row.

## 12. Offline and sync

- **Offline read scope:** all synced
- **Pending mutations survive force-quit:** yes
- **Outbox drain trigger:** app

### Probe results

- **P12.1 Offline read:** Unvisited screens also appear. The app loads data ahead of need, which points to a local replica. (Inferred)
  - Seen: After an offline cold start, the Inbox listed both chats with previews, and the self-chat opened with its history from 2025. Neither had been opened in this run of the app.
- **P12.2 Offline write:** The change shows at once. An optimistic update. Whether an outbox stands behind it is settled by P12.3. (Observed)
  - Seen: Offline, a test message sent in the self-chat appeared in the conversation at once, drawn dimmed. The other messages stayed at full brightness. The line You appear to be offline stayed under the composer.
- **P12.3 Kill while pending:** The changes are still there. The outbox and the local change are stored durably. Level 2 or above. (Inferred)
  - Seen: With the test message still pending, the app was force-quit and reopened in airplane mode. The message was still in the self-chat, still dimmed, and the Inbox row for the chat showed it as the preview.
- **P12.4 Reconnect:** Changes send from any screen. A sync engine at app level drains the outbox. (Inferred)
  - Seen: With the app on the Home tab and the self-chat closed, airplane mode was turned off for 25 seconds and then on again. On reopening the chat offline, the message was at full brightness and its time had changed from 9:41 PM to 9:42 PM. Older history that had been placeholders was also filled in.

## 13. Network transport and resilience

- **Recovery when the network returns:** automatic

### Probe results

- **P13.2 Recovery:** The content loads by itself. The client listens for connectivity changes, or a retry with backoff was still running. The delay before it loads hints at which. (Inferred)
  - Seen: After each return of the network, with the app untouched, the offline line disappeared, pending messages were sent, a pending deletion was applied and missing chat history filled in.

## 32. UI technology: native, cross-platform and web

- **Text selection:** none
- **System text size:** none scale

### Probe results

- **P32.1 Long-press text:** Nothing selects anywhere. No conclusion. Selection is off by default in most toolkits, and a careful web page disables it. (Observed)
  - Seen: A long press on a chat message opened the app's own action list, with Copy message and Copy link. No selection handles appeared. Other screens were not tried.
- **P32.2 Raise the system text size:** No screen grows. The app uses fixed font sizes. This is a choice available in every family, so it identifies none. (Observed)
  - Seen: System text size raised from 1.0 to 1.5. Labels on the Account tab kept exactly the same pixel bounds. One screen was measured. Each change of text size also returned the app to its Home tab.
