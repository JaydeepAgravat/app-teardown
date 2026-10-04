# Style sheet

Every chapter is written against this file, the glossary in `src/data/glossary.yaml` and the chapter list in `src/data/outline.yaml`. The reference example is Chapter 12: `src/content/docs/part-2-concerns/12-offline-and-sync.mdx` with its data file `src/data/chapters/12.yaml`.

## Reader

An experienced engineer who has shipped production software. The reader knows what an API, a database, a cache and a thread are. Do not explain those. Spend the pages on design reasoning and trade-offs.

## Stance

- **Stack independent.** No platform, framework, language or vendor API names in the main text. Describe the capability, for example "a silent push", "a background task the operating system schedules", "secure hardware-backed storage".
- **Behavior first.** Every design is tied to something a user can observe. A design with no observable signature is still described, and marked as one that cannot be told apart from outside.
- **No inspection tools.** Probes use only what a normal user has: the app, device settings, a second device or account, and time.
- **Honest about limits.** State when two designs look identical from outside.

## Confidence vocabulary

Use these three words with exactly these meanings, capitalized.

| Word | Meaning |
|---|---|
| **Observed** | Seen directly in a probe. A fact about behavior. |
| **Inferred** | The design that best explains the observations, with the alternatives ruled out by a probe. |
| **Speculative** | Consistent with the observations, but at least one other design fits equally well. |

## Real apps

- Designs are described for archetypes ("a messaging app"), not for named products.
- A real app is named only for a fact its maker has published, and the text names the publication. Do not state how a named app works internally on the basis of inference.
- Do not invent sources, quotes or links. When unsure whether a fact was published, leave the app out.
- The one exception is the worked examples under `src/content/docs/examples/`. Each is a real teardown of a named app. It keeps observation and published fact apart: what was seen carries a confidence word, and what is stated about the app's internals cites source code or a statement its maker published.

## Canon

These lists are fixed. Every chapter uses the same names and the same order.

### The seven constraints (Chapter 2)

1. **Unreliable network.** Slow, lossy, absent, and changing between all three.
2. **Process death.** The operating system can end the app's process at any time while it is in the background.
3. **Limited resources.** Battery, memory, storage, mobile data and processing power are all rationed.
4. **Slow release.** A shipped version cannot be recalled. Old versions stay in use for years.
5. **Untrusted client.** The backend cannot trust what the client sends, and anything on the device can be inspected.
6. **Human attention.** One small screen, frequent interruptions, and a response must feel immediate.
7. **Platform rules.** The operating system and the store control background execution, permissions, notifications and payments.

### The universal app model (Chapter 3)

Client components: **UI**, **screen state**, **domain logic**, **data layer**, **local store**, **network client**, **sync engine**, **background workers**, **platform services**.

Backend components: **gateway**, **services**, **backend store**, **change log**, **async delivery**, **media delivery**, **third parties**.

Every app is a subset of this model. A teardown states which components an app has.

### Probe families (Chapter 4)

1. **Network probes.** Airplane mode, a weak connection, a switch between networks.
2. **Lifecycle probes.** Force-quit, a long time in the background, a device restart.
3. **Time probes.** A changed clock, a long absence, an old app version.
4. **Multi-device probes.** A second device, a second account.
5. **Fresh-state probes.** A fresh install, cleared data, sign out and sign in.
6. **Resource probes.** Low storage, low-power mode, data-saver mode.
7. **Permission probes.** Deny, grant later, revoke.
8. **Passive observation.** Storage used, data used, battery used, app size, notifications received, settings screens, store listing.

### The inference chain (Chapter 5)

Signal, then candidate designs, then a discriminating probe, then a claim with a confidence word.

### Offline levels (Chapter 12)

Level 0 online only, Level 1 cached reads, Level 2 queued writes, Level 3 local replica, Level 4 concurrent editing.

## Files and format

The handbook is a website built from this repository.

| What | Where |
|---|---|
| A chapter | `src/content/docs/<part folder>/<number>-<slug>.mdx` |
| A chapter's probes, signals and worksheet fields | `src/data/chapters/<number>.yaml` |
| Glossary | `src/data/glossary.yaml` |
| Chapter list | `src/data/outline.yaml` |

Part folders are `part-1-method`, `part-2-concerns` and `part-3-archetypes`.

### Frontmatter

```text
---
title: 12. Offline and sync
description: One sentence, the chapter's question restated as a statement.
sidebar:
  order: 12
---
```

The title comes from frontmatter. Do not write a level-1 heading in the body.

### MDX rules

- Chapters are MDX. Outside code fences, never write a bare `<` or `{` in prose, because MDX reads them as code. Write "less than", or put the text in backticks.
- Import only the components the chapter uses, directly after the frontmatter, with the path `../../../components/<Name>.astro`.
- Sections are numbered `## 12.3 Title`. Subsections are `### Title` without a number, except probes.

### Components

| Component | Use |
|---|---|
| `<Probe id="P12.3" />` | Renders one probe from the data file, with selectable outcomes. Place it under a heading `### P12.3 Short name`. |
| `<Signals chapter={12} />` | Renders the chapter's signal-to-design table from the data file. |
| `<TeardownBar />` | Shows which teardown the reader is recording to. Place it once before the first probe and once before the worksheet form. |
| `<WorksheetForm chapters={[12]} />` | Renders the chapter's worksheet fields as a form. |

### Data file

```text
chapter: 12
title: Offline and sync
link: /part-2-concerns/12-offline-and-sync/

probes:
  - id: P12.1
    name: Offline read
    caution: Optional. Required when the probe changes a device-wide setting.
    do:
      - One step per item, as an instruction.
    watch: What to look at while doing the steps.
    outcomes:
      - label: What the reader saw, in a few words
        reading: "What it means about the design. One or two sentences."
        confidence: Observed
        fills: { c12-read-scope: none }

signals:
  - { signal: A behavior a user can notice, design: The design it points to, confidence: Inferred }

worksheet:
  - { id: c12-level, label: Offline level, options: [a, b, c] }
  - { id: c12-notes, label: A free-text field }
```

- Probe ids are `P<chapter>.<n>`. Worksheet field ids are `c<chapter>-<name>`.
- Each probe has at least two outcomes. Outcomes are mutually exclusive and are things the reader can see.
- `fills` is optional. It sets worksheet fields when the reader selects that outcome. Its values must be one of the field's `options` when the field has options.
- Quote any YAML value that contains a colon followed by a space, a comma inside `{ }`, or that starts with a quote mark.
- A probe must be safe to run on the reader's own account.

### Cross-references

- To another chapter: always a link, `[Chapter 14](/part-2-concerns/14-real-time-delivery/)`. A chapter's path is `/<part folder>/<number>-<slug>/`, where the slug is the chapter's title in `src/data/outline.yaml` in lowercase, with punctuation removed and spaces as hyphens. For example Chapter 18, "File transfer: uploads and downloads", is `/part-2-concerns/18-file-transfer-uploads-and-downloads/`.
- To a section in the same chapter: `Section 12.4`. Never "above" or "below".
- Figures are captioned in italics under the diagram: `*Figure 12.2. Caption.*`

### Checking a chapter

```bash
node scripts/check-chapter.mjs 12
```

The check must pass before a chapter is done.

## Chapter structure

- Part I chapters follow `templates/method-chapter.md`.
- Part II chapters follow `templates/concern-chapter.md`.
- Part III chapters follow `templates/archetype-chapter.md`.

Target length is 3,000 to 5,000 words of prose, not counting code, diagrams and the data file.

## Pseudocode

- Fenced as `text`. Language neutral.
- `function name(args):` with indentation for blocks. `match` for branching on a result.
- `lowerCamelCase` for functions and variables, `PascalCase` for types.
- `//` for comments. Comments explain why, not what.
- `transaction(store):` marks an atomic block.
- At most about 25 lines per block. Show the idea, not a full implementation.

## Diagrams

- Mermaid, in a `mermaid` code fence inside the chapter.
- Every diagram follows `templates/diagram-kit.md`. The kit fixes one color and one shape for each role (screen, client logic, client storage, backend service, backend storage, async delivery, third party) and three outcome colors (success, failure, waiting). Copy its class block into every flowchart unchanged. Do not add colors.
- `flowchart TB` for structure that spans client and backend, with the client zone on top. `flowchart LR` for a single chain of steps. `sequenceDiagram` for interactions over time, with participants grouped in colored zones.
- At most about 12 nodes. Split a larger diagram in two.
- Node labels use glossary terms. Keep labels free of parentheses, quotes and colons, which break the diagram syntax.
- Each Part II chapter has at least one structure diagram and one sequence or outcome diagram.

## Language

- Second person ("you") for the reader. Present tense. Active voice.
- American spelling.
- Short sentences. One idea per paragraph.
- Use a term exactly as the glossary defines it. Do not use synonyms for glossary terms.
- Tables for comparisons of three or more options. Prose for reasoning.
- No filler, no rhetorical questions, no motivational openers.
- Sentence case for headings.
