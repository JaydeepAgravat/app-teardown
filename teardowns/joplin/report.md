# Teardown: Joplin

- **app:** net.cozic.joplin
- **version:** 3.7.11
- **device:** Android 15 emulator, sdk_gphone64_arm64
- **date:** 2026-10-04

## 3. The universal app model

- **Local store:** present
- **Media delivery:** absent

### Probe results

- **P3.1 Offline tour:** Everything works and nothing mentions the network. Either the app has no backend, or it writes to a local replica and syncs later. P3.2 separates the two. (Speculative)
  - Seen: After a force-quit and an offline launch, visited and unvisited notes opened, and creating, editing, ticking and deleting all worked. Nothing mentioned the network. The Configuration screen shows a synchronization target set to None, so no backend is in use on this device.
- **P3.4 Text before media:** The app shows no remote media. No media delivery was seen. Either all images ship inside the app or are stored on the device, or remote media exists only in a state you did not reach, such as with sync turned on. (Observed)
  - Seen: The only images seen were those embedded in the built-in welcome notes. They appeared in airplane mode after a cold start, in a note never opened before, in the same frame as the text. No screen showed remote media. A weak connection was not used, since nothing was being fetched.

## 4. Probes

- **Stored data on the device:** grows with use
- **Launch in airplane mode:** content shown and writes accepted
- **After a force-quit:** start screen and draft kept

### Probe results

- **P4.1 Footprint survey:** Stored data is modest and grows as you browse. Either a cache filled by visits, or data the app writes as you use it, such as items you create and logs. Growth in the cache figure while you only browse points to the first. Growth in user data while you create points to the second. Chapter 11 covers what a cache holds and when it is discarded. (Inferred)
  - Seen: Device settings at the start: app 178 MB, user data 4.89 MB, cache 1.34 MB. After about seventy minutes of use, in which six small test notes were created and one export was run: user data 14.34 MB, cache 1.56 MB. After the test notes were moved to the trash and the app was restarted: user data 10.15 MB. The growth was in user data, not in the cache area, and it came while writing and exporting, not while browsing. Data and battery figures were not read.
- **P4.2 Launch in airplane mode:** Earlier content appears, and the change is accepted. An optimistic update on top of stored content. Chapter 12 settles whether an outbox stands behind it. (Inferred)
  - Seen: See P7.3 for the offline launch and P12.2 for the offline changes. The app never said it was offline.
- **P4.3 Force-quit and reopen:** The start screen opens, and the text is still in its field. Drafts are written to the local store as you type. Navigation is not restored after a quit by the user. Read Chapters 8 and 9. (Inferred)
  - Seen: From the editor of a test note, two screens below the note list, with text typed into the note body and no save control used, the app was force-quit a second or more after typing. It reopened on the note list, and the text was in the note when it was opened again. The list was too short to test scroll position.

## 7. Launch and startup

- **Cold start against return:** cold clearly slower
- **Cold start with no network:** cached content
- **Session check at startup:** local then lazy
- **Landing rule:** always home
- **Launch from a notification:** home only

### Probe results

- **P7.1 Cold against warm:** The cold launch is clearly slower, and the return is instant. A cold start with visible initialization or a fetch, and a resume that does no work. P7.2 shows what the cold start waits for. (Observed)
  - Seen: Three cold starts: the system reported a first frame after about 0.5 seconds, a splash with the logo was on screen at 0.5 seconds, a blank frame at 0.9 seconds, the note list layout with the text There are currently no notes at about 1.3 seconds, and the real note list at about 1.5 seconds. A return to the running app showed the note list in about 0.6 seconds with no splash.
- **P7.3 Launch in airplane mode:** The normal first screen, with content. Session, config and content are all read from the device. No startup step blocks on the network. (Inferred)
  - Seen: Airplane mode, force-quit, relaunch. The same sequence as online: splash, a blank frame, the list layout with the text There are currently no notes, then the note list of the last selected notebook with all its notes. Nothing on screen mentioned the network. The app has no account and no sign-in.
  - Evidence: evidence/offline-launch.png
- **P7.4 Where it lands:** Home in both cases. The app landed on its home screen after both cold starts. Either it does not persist the last screen, or it restores it only under a condition you did not meet, such as an account type, a platform or a time limit. (Inferred)
  - Seen: The note list after a force-quit from the note editor, and the note list after a system-style process death from the note editor. In both cases the list was the one for the notebook selected before, not All notes. The next-day case was not waited for.
- **P7.5 Launch from a notification:** The app opens on its home screen and stays there. The launch target is lost on a cold start. Repeat with the app in the background to see whether routing works with a live process. (Observed)
  - Seen: A to-do alarm's notification was used, on two test to-dos. With the app's process ended, tapping the notification cold-started the app on its note list, and it was still there eight and eleven seconds later. With the app alive in the background, tapping the same notification opened the to-do itself.

## 8. Navigation, deep links and screen state

- **Unfinished input:** held by the screen
- **Restored after process death:** none
- **Survives a force-quit:** nothing survives
- **Link while signed in:** opens the item
- **Back stack after a link:** synthesized back stack
- **Link into a running app:** replaces current place

### Probe results

- **P8.2 Half a form:** The text survives the app switch only. The input belongs to the screen and lives as long as the screen does. (Inferred)
  - Seen: The New Notebook form has a title field and a save control. A title typed and not saved was still in the field after 20 seconds in another app. Back left the form with no prompt about discarding. On opening the form again the field was empty.
- **P8.3 Long absence in the middle of a task:** A splash, then the app's home screen. Navigation state was in memory only, or the app restores it only under a condition, such as a time limit, an account type or a platform. A shorter absence that still shows a splash tests the time limit. The other conditions cannot be ruled out from one account on one device. (Speculative)
  - Seen: With a test note open in the editor, the process was ended the way the system does it, keeping saved state. The app cold-started on the note list of the notebook that had been selected, not in the note. The text typed before leaving was saved in the note. The wait was simulated, not real.
- **P8.4 Force-quit and reopen:** The home screen, and the text is gone. Neither navigation state nor input is stored durably by the app. (Inferred)
  - Seen: With a title typed into the New Notebook form and not saved, the app was force-quit. It reopened on the note list, and the form was empty when opened again. The note list was the one for the notebook selected before the quit, so the selected notebook is kept. Text typed into a note is a different case: it is saved as the note itself, see P48.1.
- **P8.5 Link while signed in:** The app opens on the item. A router maps the link to a route and can reach the screen from a cold start. (Observed)
  - Seen: The note's menu has Copy external link. The link has a custom scheme of the app's own, not a web address. With the app force-quit, opening the link cold-started the app directly on that note.
- **P8.6 Back after a link:** A parent screen inside the app. Either a synthesized back stack, where the router built the screens that would normally sit under the target, or the target was pushed over the app's ordinary start screen. If the screen you reach is the item's own parent, the stack was built for it. If it is whatever the app would have opened on anyway, it was not. (Inferred)
  - Seen: Back from the note reached by link led to a note list inside the app. It was the list of the notebook that had been selected before the quit, which was a different notebook from the one the note is in. A second back left the app.
- **P8.7 Link into a running app:** You reach a parent of the item, and your earlier place is gone. The router does not keep your place. Either it replaces the navigation state with a stack built for the target, or it closes the screen you were on and pushes the target. The screen that back leads to separates them. The item's own parent means a built stack. A screen from your earlier path means a pop and a push. (Inferred)
  - Seen: With the app two levels into its settings, the link was opened from outside. The note appeared with no splash. Back led to the note list of the last selected notebook. The settings screens were gone, and the list was not the note's own notebook.

## 9. State and UI data flow

- **List after a change on the detail screen:** already updated
- **Other surfaces after a change:** all agree
- **Rotation or resize:** kept without reload

### Probe results

- **P9.1 Change and go back:** The row shows the change in both runs. The list and the detail screen read one copy, or the list was told about the change inside the client. A shared store or change events. (Inferred)
  - Seen: Online, a note's title was changed in the editor and the list row showed the new title on going back. In airplane mode, another note's title was changed and its row also showed the new title on going back. No loading indicator and no flicker in either run.
- **P9.2 Every surface:** Every surface shows the change at once. One copy of the item on the client, observed by every screen. A shared store, in memory or on disk. (Inferred)
  - Seen: A test note appears in three places: the All notes list, its notebook's list and the search results. With all three visited, its title was changed in the editor opened from the search results. On going back, the search results row showed the new title at once. The All notes list and the notebook list showed it as soon as each was reached. No surface has a refresh control and none was needed.
- **P9.6 Rotate or resize mid-task:** Everything is kept and nothing reloads. Either screen state is held outside the visual tree and survives it being rebuilt, or the app handles the change itself and nothing is rebuilt. The two look the same from outside. (Inferred)
  - Seen: The app rotates. A title typed into the New Notebook form and not saved was still in the field after rotating to landscape and back. A welcome note scrolled partway down stayed at the same passage after rotating and rotating back, to within a line or two, and did not visibly reload. No filter or expanded section was available to test.

## 10. API shape

- **Where display text is built:** some fixed after refresh

### Probe results

- **P10.10 Language switch:** Some labels stay in the old language after a refresh. That text is stored content, or the backend formats it from a language held in the account and not from the request. (Speculative)
  - Seen: The app has its own language setting. It was changed from English to French in airplane mode. Settings labels, the sidebar entries, the header controls and the empty-list text changed at once. The built-in Trash label and one accessibility label stayed in English until the app was restarted, then changed. The welcome notebook's name and the welcome notes' titles and bodies stayed in English after the restart. They are notes stored on the device. There is no refresh control.
  - Evidence: evidence/french.png

## 11. Local storage, caching and prefetching

- **Cache tiers:** memory and disk
- **Clear-cache control:** none
- **Detail screen data source:** on device before open

### Probe results

- **P11.1 Memory or disk:** Content appears on both offline visits. The screen's data is in a disk cache or a local store. It survived process death. (Inferred)
  - Seen: In airplane mode, note lists and note bodies, including an image in a welcome note, were shown both while the app stayed alive and after a force-quit and relaunch.
- **P11.5 Clear cache:** There is no such control. No evidence either way. Many apps with well-separated caches do not expose them. (Observed)
  - Seen: The settings have no storage screen and no clear-cache control. The Tools section has a list of note attachments with sizes and a delete control for each, and a control to rebuild the search index.
- **P11.6 Unvisited detail:** Content the list row did not show appears, such as full text or a large image. Either the detail was prefetched, or the list response already carried the full items. Both mean the data was on the device before you asked. (Inferred)
  - Seen: In airplane mode after a cold start, a welcome note never opened before showed its full body and an embedded image. The list row shows only the title.

## 12. Offline and sync

- **Offline read scope:** all synced
- **Pending mutations survive force-quit:** yes

### Probe results

- **P12.1 Offline read:** Unvisited screens also appear. The app loads data ahead of need, which points to a local replica. (Inferred)
  - Seen: In airplane mode after a force-quit, the note lists and the test notes opened as before. A built-in welcome note that had never been opened on this device, in any session, opened with its full text and an image. Nothing said the app was offline.
  - Evidence: evidence/offline-unvisited.png
- **P12.2 Offline write:** The change shows at once. An optimistic update. Whether an outbox stands behind it is settled by P12.3. (Observed)
  - Seen: In airplane mode: a new note was created, a note was renamed, a to-do was ticked and a note was deleted. Each change showed at once in the note list. No pending mark, no dimming and no offline message appeared. The ticked to-do is drawn dimmed, which is how the app draws any completed to-do.
  - Evidence: evidence/offline-writes.png
- **P12.3 Kill while pending:** The changes are still there. The local change is stored durably. Level 2 or above. Either an outbox holds the pending mutations, or the local store is itself the source of truth and the sync engine compares it with the backend later. A local-first app is built the second way and has no outbox. (Inferred)
  - Seen: After the offline create, rename, tick and delete, the app was force-quit and reopened, still in airplane mode. The new note was there with its body, the rename and the tick were kept, and the deleted note was still gone from the list.

## 21. Security and trust

- **Screenshot of a sensitive screen:** allowed
- **App switcher card:** content visible

### Probe results

- **P21.2 Screenshot of a sensitive screen:** The screenshot shows the screen and the app does not react. No capture control on this screen. The team did not class it as sensitive, or accepts the exposure. (Observed)
  - Seen: The app has no screen marked as sensitive, so the note list was used. The device's screenshot control captured it in full, and the saved image showed the list. The app showed no notice. The screenshot was deleted afterwards.
- **P21.3 App switcher:** The card shows the screen's content. No cover. The operating system's picture of the app includes the sensitive data. (Observed)
  - Seen: With the note list on screen, the app switcher card showed the list's content in full. Returning asked for no unlock. The app's optional biometric lock was off.

## 22. Privacy, permissions and consent

- **When denied:** silent failure
- **Photo access:** system picker
- **Data export:** immediate file

### Probe results

- **P22.2 Deny on first request:** The feature shows a blank or broken screen, or nothing happens. The denied state is not handled in a way the user can see. Either the code assumed a grant, or it has a branch that is silent or that did not show. (Inferred)
  - Seen: Three permissions were refused. Camera: Take photo brought the system prompt, and after a refusal the prompt came straight back. After the second refusal the app showed a black camera screen with a spinner and a back control, and no explanation. Notifications: saving a to-do alarm brought the prompt, and after a refusal the alarm dialog stayed open with no message. Location: the app showed its own question first, then the system prompt, and after a refusal the note was saved as normal without a position, and the prompt returned once on the next save. The rest of the app worked throughout.
  - Evidence: evidence/camera-denied.png
- **P22.6 Limited photo access:** A picker opens with no permission prompt. A system picker. The app receives only the items you choose and holds no access to the library. (Inferred)
  - Seen: Attach file opened the system's document picker with no permission prompt. No file was chosen, since the device's files are not test data, so the second attachment step was not run.
- **P22.9 Data export path:** A file is available at once. The export reads from one store, or the data set is small. (Inferred)
  - Seen: Import and Export in the settings has Export all notes as JEX. Within six seconds the system share sheet opened with one file, jex-export.jex, ready to send. The sheet was dismissed and nothing was shared. The file's content was not inspected.

## 23. Background work and notifications

- **Notification categories:** single switch
- **Notification actions:** none
- **Scheduled notifications:** fires offline

### Probe results

- **P23.1 Notification categories:** One system switch and nothing else. All notifications are treated as one kind. The backend has no per-category preference record. (Inferred)
  - Seen: The device's notification settings for the app list one category, Alarm Notify, with one switch. The app's own settings have no notification preferences. No second device was used.
- **P23.5 Act from the notification:** The notification has no actions. The app declares no action set for this notification type. (Observed)
  - Seen: The alarm notification, expanded in the notification list, showed a title and no buttons or reply field. Tapping it opened the app.
- **P23.8 Scheduled notification, offline:** It appears on time while offline. A local notification. The app handed the request to the operating system and no backend is involved in firing it. (Inferred)
  - Seen: A test to-do was given an alarm for 22:30, set at 22:25. The app went to the background and airplane mode was turned on. The notification, titled with the to-do's name, was in the notification list by 22:33, with airplane mode still on. It was not there at 22:31, so it fired between one and three minutes late.

## 27. Ads, attribution and growth

- **Ads present:** none
- **Invitation mechanism:** none

### Probe results

- **P27.1 Ad inventory:** No ads anywhere. The app does not earn from attention, or ads are removed for your account. Skip to the attribution and growth probes. (Observed)
  - Seen: No ad, sponsored label or promotion on any screen during the whole run. The More information screen has a Make a donation link. The store listing was not read.
- **P27.7 Invitation screen:** No invitation feature. Growth does not depend on users inviting each other. (Observed)
  - Seen: No screen invites friends or asks for contacts. The app requests no contacts permission.

## 28. Search and discovery

- **Where the search runs:** on-device index
- **Offline search scope:** all synced data
- **Misspelling tolerance:** exact only
- **Filters and counts:** no filters

### Probe results

- **P28.1 Search in airplane mode:** Results include items never opened on this device. An on-device index over a local replica that is synced ahead of need. (Inferred)
  - Seen: In airplane mode, a search for a word from the body of a test note found that note. A search for the word Evernote found a built-in welcome note that had never been opened on this device. Results appeared as the query was typed.
- **P28.4 Misspelling:** Nothing is found. Exact or prefix matching. Typical of a local filter or a simple on-device index. (Inferred)
  - Seen: Evernote found one note. Evrenote, with two letters swapped, found nothing. Evernte, with one letter missing, found nothing. The prefix Evern found the note. No notice about a changed query appeared.
- **P28.6 Filter counts:** There are no filters. The surface offers a query only. (Observed)
  - Seen: The search screen has one text field and a clear control. No filter controls and no counts.

## 32. UI technology: native, cross-platform and web

- **Text selection:** any text selectable
- **System text size:** all screens scale
- **Screen in airplane mode:** web content works offline

### Probe results

- **P32.1 Long-press text:** Labels or headings select, or a link menu or preview opens. Web defaults are showing through. The screen is embedded web content. (Inferred)
  - Seen: In the note viewer, a long press on a heading inside the note selected it, and a long press on body text selected a word, both with selection handles and a menu of Copy, Share, Select all and Web search. A long press on a link in the note did nothing visible. On the note list, the screen header and the settings screens, a long press on a label selected nothing.
  - Evidence: evidence/longpress-heading.png
- **P32.2 Raise the system text size:** Every screen grows. The system setting reaches every screen. Consistent with the platform's own controls throughout, or with a toolkit that forwards the setting. (Speculative)
  - Seen: System text size raised from 1.0 to 1.5. The note list, the settings screens, the note viewer and the note editor all showed larger text. While the app stayed running, rows kept their old height and the larger text was cut off. After a force-quit and reopen the layouts fitted the larger text.
  - Evidence: evidence/large-text.png
- **P32.5 Each screen in airplane mode:** A screen that showed web signals in P32.1 draws completely. Web content bundled in the app or kept in a cache. (Inferred)
  - Seen: After a force-quit and an offline launch, the note list, search, the settings sections and the status screen all drew their layout and content. The note viewer, which showed web signals in P32.1, drew a never-opened note completely, with its image. Three links on the More information screen leave the app for the device browser and were not followed.

## 34. Observability

- **Diagnostics or usage setting:** none found
- **Report prompt on screenshot or shake:** no

### Probe results

- **P34.1 Diagnostics setting:** No such control. Either nothing optional is collected, or collection is not offered as a choice in this region. The absence of a control does not show the absence of a pipeline. (Speculative)
  - Seen: Every settings section was read: General, Appearance, Synchronization, Editor, Plugins, Markdown, Note, Note History, Tools, Import and Export, More information. None has a control for diagnostics, crash reports, analytics or usage data. Tools has a log viewer and Import and Export has an Export debug report control, both of which the user starts.
- **P34.5 Report trigger:** Nothing happens. No screenshot trigger. Reports start only from the form. (Observed)
  - Seen: A system screenshot was taken on the note list. After several seconds the app had shown no prompt to report a problem or share the image.

## 35. Performance and resource budgets

- **Low-power mode:** no change

### Probe results

- **P35.7 Low-power mode:** No difference. The app does not respond to the power state, and has little background work for the system to withhold. (Inferred)
  - Seen: With the device's battery saver on, the app was force-quit and reopened. The note list appeared as before, a welcome note never opened before opened at once with its text, and the app showed no message about the mode. The app has no autoplay. Changes in animation could not be judged from still captures.

## 36. Constrained devices and networks

- **In-app data controls:** one switch

### Probe results

- **P36.3 In-app data controls:** A single data-saver switch or one quality setting. One flag feeds the policy. An in-app data saver exists and is coarse. (Observed)
  - Seen: The only control on data use is one switch in the synchronization settings, Synchronize only over WiFi connection. There is also a setting to shrink large images before attaching them. No media quality, autoplay or data-usage screen.

## 37. Accessibility and global reach

- **Text scaling:** grows and breaks
- **Text after a language switch:** nothing changes
- **Right-to-left layout:** partial
- **Timestamps after a time zone change:** shifts after refresh

### Probe results

- **P37.1 Large text:** Text grows, and some of it is clipped, overlapped or truncated. System text styles on fixed-height layouts. The same screens are likely to break under long translations. (Observed)
  - Seen: System text size at 1.5. Text grew on every screen. Straight after the change, with the app still running, the header title, list rows and settings rows kept their old height and their text was cut off top and bottom, and settings labels were cut short. After a restart the layouts fitted, except for two labels cut short with an ellipsis: the language name on the General screen and one settings description. Only the 1.5 step was tried.
  - Evidence: evidence/large-text-settings.png
- **P37.5 Switch the language:** Nothing changes. The app does not ship that language and fell back to its default, or it has its own language setting that overrides the device. (Observed)
  - Seen: In airplane mode, the system's per-app language for this app was set to French, and the app was force-quit and reopened. Every label stayed in English. The app has its own language setting, which was on English. The device-wide language was not changed. Changing the app's own setting to French did change the labels at once and offline, see P10.10.
- **P37.6 Right-to-left:** Text aligns right, and some layout, icons or animations do not mirror. Hard-coded directions remain. The screens that fail are usually older, or custom drawn. (Observed)
  - Seen: Two runs. First, the app's own language setting was switched to Persian: labels turned Persian and nothing mirrored, not even text alignment. Second, the app's own setting was put back to English and the system's per-app language for this app was set to Persian: the note list, header, sidebar and add button all mirrored and text aligned right, while the labels stayed English. The back arrow moved to the right side and still pointed left. So layout direction follows the device's language and not the app's own setting, and one directional icon does not flip.
  - Evidence: evidence/rtl-settings.png
  - Evidence: evidence/rtl-device.png
- **P37.8 Change the time zone:** Past timestamps shift only after a refresh. One of three designs. The backend sends formatted times using the zone the client reports, the client caches formatted strings, or the client formats at display time with a zone that its runtime read at launch. If a restart of the app was the refresh that worked, the third is the likely one. (Inferred)
  - Seen: A test note's properties showed Created 04/10/2026 22:12 and Updated 23:01. The device zone was moved 9.5 hours west with automatic zone off. Back in the app, the same panel still showed 22:12 and 23:01, also after closing and reopening the note. After a force-quit and relaunch it showed 12:42 and 13:31, a shift of exactly the zone difference. The app has no refresh control, so the restart stood in for the refresh. There was no future event to check. The alarm time was not rechecked.

## 48. Notes, documents and collaboration

- **When an edit is committed to the local store:** saved after a pause
- **Text after a force-quit while typing:** last moments lost

### Probe results

- **P48.1 Kill while typing:** The last words or the last sentence are missing. Edits are held in memory and committed to the local store on a timer or after a pause in typing. The gap you lost is the length of that timer. (Inferred)
  - Seen: In airplane mode, three short sentences (Dd. Ee. Ff.) were typed into a test note and the app was force-quit straight after the last keystroke, without leaving the editor. On reopening, the note ended in Dd. Ee with the last sentence and one full stop missing. In an earlier run with about half a second between the last keystroke and the quit, all three sentences were there. No recovery notice appeared. Online runs gave the same pattern: text survived a quit one second after typing, and was lost on an immediate quit.
  - Evidence: evidence/kill-while-typing-offline.png

## 54. Apps with no backend

- **Account:** optional app account
- **Write interrupted by a force-quit:** written as you go

### Probe results

- **P54.1 Read the listing and the settings:** An account of the app's own is offered and can be skipped. The app works as a no-backend app until you sign in, and has a backend for those who do. Probe it signed out here, and signed in with Chapter 12. (Inferred)
  - Seen: The app asked for no account and every feature worked without one. Its settings have a Synchronization section whose target is set to None. The other choices are the maker's own cloud and server, three third-party storage services, a file system folder and two open protocols. The settings also have an export and import control and no diagnostics control. Permissions requested: notifications, location, camera, microphone, media and storage. The store page was not read.
  - Evidence: evidence/sync-targets.png
- **P54.4 Kill during a write:** Everything you entered is there. Changes are committed to the local store as they are made, or within moments of each one. Repeat with a force-quit straight after the last keystroke. Anything lost then is the length of the save delay. (Inferred)
  - Seen: A new test note was given a title and three short sentences of body, with no save control used. Force-quit one second or more after the last keystroke: the title and all the body text were there on reopening, on three runs with waits of 1, 2 and 4 seconds. Force-quit with no wait after the last keystroke, on two runs: the note and its title were there, and the body text typed in the final second was missing. The note always opened without an error.
  - Evidence: evidence/kill-while-typing.png

## 55. The app that fits no archetype

- **Shape of the app:** one dominant feature

### Probe results

- **P55.1 Feature inventory:** One feature dominates, and the rest are settings and account screens. The app has one feature worth a teardown. If an archetype fits it, use that chapter. If none does, route the feature by its concerns. (Observed)
  - Seen: One feature: notes and to-dos kept in notebooks, with tags, search, attachments and alarms. Everything else is settings. The data is the user's own and no one else sees it on this device.

## The design, as read from outside

- **Local store.** All notes, notebooks and attachments are on the device and readable after a cold start with no network. Inferred.
- **Writes.** Create, edit, tick and delete are applied to the local store at once, with no pending state. Observed. They survive a force-quit. Inferred.
- **Save timing.** Text typed into a note is committed after a short delay, under a second. A force-quit inside that delay loses the last words. Inferred.
- **Search.** An index on the device covers notes never opened, with exact or prefix matching. Inferred.
- **Navigation.** A cold start always opens the note list, with the last selected notebook. The open note is not restored. Inferred.
- **Links.** A link with the app's own scheme opens a note from a cold start. Observed. The screen under it is the app's ordinary start screen. Observed.
- **Notifications.** To-do alarms are local notifications in one category, with no actions. Inferred.
- **UI.** The note viewer is web content shipped in the app. Inferred. The rest does not behave like web content. Text follows the system size. Layout direction follows the device language, not the app's own language setting. Observed.
- **Backend.** None in use on this device. The settings offer ten synchronization choices, set to None. Observed.

## The backend this implies

None for this configuration. Every behavior seen is explained by a local store, an on-device search index and local notifications. With a sync target set, a file store or the maker's own server would hold copies of the items. That path was not exercised.

## Open questions

- How sync resolves conflicts between two devices. Settled by P12.5 to P12.7 with a sync target and a second device.
- What a first sync on a new device downloads, and when attachments arrive. Settled by P12.10 and P48.8.
- Why a tap on an alarm notification from a cold start lands on the note list and not on the to-do. Seen twice, not explained.
- What the 9 MB of growth in user data during the run consisted of. Device settings give one figure only.

## Skipped probes

390 probes were not recorded.

| Reason | Probes | Count |
|---|---|---|
| Needs a second device, a second account or a helper | P3.3, P7.7, P7.8, P8.9, P8.10, P21.1, P21.8, P22.1, P22.4, P22.7, P23.3, P23.4, P23.6, P23.7, P23.9, P23.10, P24.1, P24.5, P24.6, P24.10, P25.2, P25.3, P25.5, P25.7, P25.8, P27.6, P27.10, P28.2, P28.5, P28.7, P28.8, P32.7, P33.3, P33.4, P33.8, P33.9, P35.1, P35.4, P36.4, P36.8, P37.9, P54.8, P55.3, P55.4 | 44 |
| Needs hours or days of waiting | P4.4, P11.4, P22.3, P27.8, P27.9, P33.1, P34.6, P34.7, P35.2, P35.3, P35.6, P37.7, P38.6, P54.2, P54.3 | 15 |
| Needs a sync target or a second device on the same data. No sync target was set, and setting one up was not allowed | P4.5, P4.6, P9.3, P9.4, P9.7, P9.8, P9.9, P11.2, P11.3, P11.7, P11.9, P12.4, P12.5, P12.6, P12.7, P12.8, P12.9, P12.10, P12.11, P48.2, P48.3, P48.4, P48.5, P48.6, P48.7, P48.8, P54.5, P54.6, P54.7 | 29 |
| Needs a reinstall, an old version or an update | P7.10, P32.4, P38.8 | 3 |
| Needs real hardware, movement or a weak connection | P8.8, P24.2, P24.8, P25.6, P27.3, P28.3, P32.3, P32.6, P33.6, P33.7, P34.8, P35.8, P36.5, P36.7, P38.5 | 15 |
| Needs the store listing, other platforms or peer apps. The store was not opened, since it shows the device owner's account | P21.9, P22.10, P32.9, P33.2, P34.2, P36.1, P36.2, P36.9, P37.10, P38.2, P38.7, P38.9 | 12 |
| Needs a purchase or a payment | P37.3, P38.3 | 2 |

| Chapter | Why it does not apply to this app on this device | Probes | Count |
|---|---|---|---|
| 10 | No backend API in use: no sync target is set, so no screen is fetched | P10.1 to P10.9 | 9 |
| 13 | No network screens: with no sync target the app makes no request a user can watch | P13.1, P13.2, P13.3, P13.4, P13.5, P13.6, P13.8, P13.9 | 8 |
| 14 | No real-time feature | P14.1 to P14.10 | 10 |
| 15 | No paged or ranked feed, and the note list was too short to show paging | P15.1 to P15.10 | 10 |
| 16 | No remote images | P16.1 to P16.10 | 10 |
| 17 | No audio or video streaming | P17.1 to P17.10 | 10 |
| 18 | No upload or download without a sync target | P18.1 to P18.10 | 10 |
| 19 | No calls or live streams | P19.1 to P19.10 | 10 |
| 20 | No account, session or sign-in | P20.1 to P20.10 | 10 |
| 26 | No purchases or paywall | P26.1 to P26.9 | 9 |
| 29 | The only smart feature is voice typing, which needs a model download and speech | P29.1 to P29.9 | 9 |
| 30 | No account to compare variants on, and no second install | P30.1 to P30.8 | 8 |
| 31 | No backend-composed screen | P31.1 to P31.9 | 9 |
| 39 | Not a messaging app | P39.1 to P39.9 | 9 |
| 40 | Not a social feed | P40.1 to P40.8 | 8 |
| 41 | Not a short-video app | P41.1 to P41.8 | 8 |
| 42 | Not a music or podcast app | P42.1 to P42.7 | 7 |
| 43 | Not a shopping app | P43.1 to P43.7 | 7 |
| 44 | Not a ride-hailing app | P44.1 to P44.8 | 8 |
| 45 | Not a booking app | P45.1 to P45.8 | 8 |
| 46 | Not a banking app | P46.1 to P46.8 | 8 |
| 47 | Not a maps app | P47.1 to P47.8 | 8 |
| 49 | Not a meetings app | P49.1 to P49.8 | 8 |
| 50 | Not an assistant app | P50.1 to P50.8 | 8 |
| 51 | Not a fitness app | P51.1 to P51.8 | 8 |
| 52 | Not a game | P52.1 to P52.8 | 8 |
| 53 | Not a super app | P53.1 to P53.8 | 8 |

| Probe | Reason |
|---|---|
| P3.2 | No sync target is set, and setting one up was not allowed |
| P7.2 | Run, no outcome matched: after the splash the list layout showed the empty-list text for a frame, then the notes. That is neither a held splash nor placeholders |
| P7.6 | A device restart was avoided, to keep the emulator session |
| P7.9 | No update was pending |
| P8.1 | The app has no tabs |
| P9.5 | No refresh control anywhere in the app |
| P11.8, P21.6 | No account, so no sign-out |
| P13.7 | Nothing to adapt: no remote media and no fetching |
| P21.4 | No account-level sensitive action |
| P21.5 | No one-time codes |
| P21.7 | Run, no outcome matched: the only form with a rule disables its save control for an empty title and shows no message. A duplicate notebook name was accepted |
| P22.5, P24.3 | Would store a device position in a note |
| P22.8 | No account exists to delete |
| P23.2 | Needs the microphone or a long export to produce long-running work |
| P24.4 | Run, no outcome matched: location is optional metadata on a note. With it denied the note saves without a position and nothing else changes |
| P24.7 | Needs thirty minutes of hardware use and hours of waiting |
| P24.9 | Needs a camera pointed at a real document |
| P25.1 | The app has no home-screen widget |
| P25.4 | Not run as written: a share was sent to the app with a device command and not through the share sheet. It opened the app on a new note |
| P27.2, P27.4, P27.5 | No ads to look for |
| P28.9 | The search box has no voice input |
| P32.8 | The note viewer has no sign-in or website parts to test a seam with |
| P33.5 | Installed the same day at the current version, so no newer version existed |
| P34.3 | The first launch on this device was not observed |
| P34.4 | No feedback form in the app |
| P35.5 | Needs a list of more than a hundred items with images |
| P36.6 | Run, no outcome matched: there is a list of attachments with sizes and a delete control each, which is neither a storage screen by kind nor a single clear control |
| P37.2 | Needs a person working the screen reader by gesture |
| P37.4 | Motion cannot be judged from still captures |
| P38.1 | Could not finish: the licences entry opens the device browser, which wanted its own terms accepted first |
| P38.4 | One area only, so nothing to compare |
| P55.2 | One feature only, covered by the Chapter 12 probes |
| P55.5 | One feature only, covered by P9.2 |
