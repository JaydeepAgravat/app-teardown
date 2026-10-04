# Notes for AI coding agents

This repository is The App Teardown Handbook: a website that teaches how to work out a mobile app's design from its behavior, plus a command line tool that lets an agent do it on an emulator or simulator.

## To tear down an app

When asked to tear down, reverse engineer or analyze the design of a mobile app, run:

```bash
node bin/teardown.mjs start <app id> --print
```

It checks the device and prints the playbook with the app filled in. Follow the playbook exactly. Its rules on read-only use, accounts, payments and people's content are not optional.

## To plan and build an app or a feature

When asked to plan or build a new app, to build an app in the space of an existing one, or to add a feature to a codebase, run one of:

```bash
node bin/plan.mjs new "<the idea>" --print
node bin/plan.mjs rebuild <store link> [--competitors] --print
node bin/plan.mjs feature "<the feature>" --repo <path> --print
```

Each prints a playbook. Follow it exactly: ask the user every open decision as a question with options and trade-offs, taken from the handbook's chapters, before writing the plan.

## To work on the handbook itself

- `STYLE.md` holds the writing rules, the fixed lists and the file format. Read it before editing a chapter.
- A chapter is `src/content/docs/<part>/<number>-<slug>.mdx` with its probes, signals and worksheet fields in `src/data/chapters/<number>.yaml`.
- Check a chapter with `node scripts/check-chapter.mjs <number>`.
- Build with `npm run build`.
