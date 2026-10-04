# Teardown playbook for an AI coding agent

You are going to work out how a mobile app is designed by running experiments on it in an emulator or simulator, the way a normal user could. You do not decompile the app, read its traffic, or use any inspection tool.

- **App to tear down:** `{{APP_ID}}`
- **Write everything to:** `{{DIR}}/`

The method, the probes and the vocabulary come from this repository, The App Teardown Handbook. Follow them. Do not invent probes or outcomes.

## Rules

1. **Read-only by default.** Do not post, like, follow, message, edit, delete, buy, book or change account settings. Skip any probe that needs one of these, unless the person who started you said in plain words that writes are allowed.
2. **Never create an account, enter a password or a payment detail, or accept terms on the person's behalf.** If the app is signed out and a probe needs a session, stop and ask.
3. **Restore what you change.** If you turn on airplane mode or change the text size, turn it back before you finish, and also if you stop early.
4. **Record what you saw, not what you expect.** Choose an outcome only when the screen showed it. If no outcome matches, or the probe could not be run properly, do not record it. List it as skipped with the reason.
5. **Keep people's content out of the evidence.** Save a screenshot as evidence only when it shows no user content, such as a splash, placeholders, an error or a settings screen. Otherwise describe what you saw in the note.
6. **Use the confidence words exactly.** Observed, Inferred and Speculative are attached to each outcome in the probe data. Do not upgrade them.

## Tools

Everything goes through one command. Run it from the repository root.

| Command | What it does |
|---|---|
| `node bin/teardown.mjs doctor {{APP_ID}}` | Checks the device and that the app is installed |
| `node bin/teardown.mjs probes --summary` | Lists every probe, and whether one emulator can run it |
| `node bin/teardown.mjs probes --id P7.2` | One probe in full: steps, what to watch, outcomes with numbers |
| `node bin/teardown.mjs probes --chapter 7 --runnable` | The runnable probes of one chapter, in full |
| `node bin/teardown.mjs device <action>` | Drives the device. Actions are listed in the next section |
| `node bin/teardown.mjs record {{DIR}} P7.2 1 --note "what you saw" --evidence evidence/file.png` | Records the outcome you saw, by its number |
| `node bin/teardown.mjs field {{DIR}} <field id> <value>` | Sets a worksheet field by hand, or `name`, `app`, `version`, `device`, `date` |
| `node bin/teardown.mjs report {{DIR}}` | Writes `report.md` from what was recorded |

### Device actions

`info`, `installed <app>`, `version <app>`, `launch <app>`, `cold-start <app>` (force-quits, then times the launch), `force-quit <app>`, `process-death <app>` (ends the background process the way the system does, keeping saved state), `home`, `back`, `airplane on|off`, `open-url <url> [app]`, `tap <x> <y>`, `tap-text <words>`, `long-press <x> <y>`, `swipe <x1> <y1> <x2> <y2> [ms]`, `scroll-down [n]`, `scroll-up [n]`, `type <text>`, `texts` (every readable label on screen with tap coordinates), `screenshot <file>`, `storage <app>` (app size, user data and cache from device settings), `permissions <app>`, `font-scale [value]`, `wait <seconds>`.

`texts` is the cheapest way to see the screen. Take a screenshot when layout or images matter, such as placeholders, and look at it.

On an iOS simulator only `launch`, `force-quit`, `open-url`, `screenshot` and `wait` work through this command. Use your own simulator control tool for taps. The simulator has no airplane mode, so skip network probes there or ask the person to cut the computer's network.

## Procedure

1. **Check.** Run `doctor`. Record `name`, `app`, `version`, `device` and `date` with `field`.
2. **Read the method once.** `src/content/docs/part-1-method/5-from-signal-to-inference.mdx` explains how an outcome becomes a claim.
3. **List what you can run.** `probes --summary` marks each probe `runnable` or `manual`, with the reason. The marking is a heuristic from the probe's wording, so read a probe's steps before running it and skip it if it needs something you do not have.
4. **Run the first-pass probes** of Chapter 4 that are runnable. Their readings name the chapters that matter for this app.
5. **Go chapter by chapter.** Start with Chapters 7, 8, 11, 12, 13 and 15, then the chapters the first pass pointed to. For each runnable probe:
   1. Read it with `probes --id`.
   2. Do its steps with `device` actions. Wait for screens to settle.
   3. Look at the result with `texts`, or a screenshot.
   4. Pick the outcome that matches what you saw, and `record` it with a note that states the facts: what you did, what appeared, and any numbers.
   5. If you could not run it properly, or no outcome matches, skip it and keep the reason.
6. **Group probes that share a setup.** Several probes need airplane mode. Visit the screens you need while online, then run them together, then turn airplane mode off.
7. **Write the report.** Run `report`. Then add, at the end of `{{DIR}}/report.md`:
   - **The design, as read from outside:** a short summary by concern, each claim with its confidence word.
   - **The backend this implies:** what must exist on the backend for the client behavior you saw.
   - **Open questions:** designs you could not tell apart, with the probe that would settle each.
   - **Skipped probes:** each with its reason.
8. **Leave the device as you found it.** Airplane mode off, text size restored, app on its home screen.

## When you finish

Tell the person:

- How many probes you ran and how many you skipped.
- The five most informative findings, each in one sentence with its confidence word.
- That `{{DIR}}/teardown.json` can be loaded into the site's worksheet page with **Import a .json teardown**, so they can read every chapter with the outcomes already selected.
- If the app is open source, offer to check each conclusion against the source and report which were confirmed, which were wrong, and which the code cannot answer.
