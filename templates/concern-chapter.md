# Template: a Part II concern chapter

The reference example is `src/content/docs/part-2-concerns/12-offline-and-sync.mdx` with `src/data/chapters/12.yaml`. Replace `N` with the chapter number.

```text
---
title: N. Title
description: The chapter's question restated as a statement.
sidebar:
  order: N
---

import Probe from '../../../components/Probe.astro';
import Signals from '../../../components/Signals.astro';
import TeardownBar from '../../../components/TeardownBar.astro';
import WorksheetForm from '../../../components/WorksheetForm.astro';

> **The question.** One sentence. The question this chapter lets the reader answer about any app.

## N.1 Why this concern exists

Which of the seven constraints create the problem. Two to four paragraphs.

## N.2 The design space

The workable designs, from simplest to most capable. For each: what it is, what it costs,
and when a team chooses it. End with a comparison table.

## N.3 Anatomy

The components involved and how data moves between them. One structure diagram.
Pseudocode for any logic that prose leaves ambiguous.

(Add further numbered sections here when the concern has distinct sub-problems.)

## N.x Probes

One or two sentences on which probes to run first, then:

<TeardownBar />

### PN.1 Short name

<Probe id="PN.1" />

(One heading and one component per probe, ordered from cheapest to most effort.)

## N.x Signal-to-design table

<Signals chapter={N} />

## N.x The backend this implies

What must exist on the backend for each client design to work.

## N.x Failure modes and what they reveal

Bugs and odd behaviors a user may notice, and the design each one exposes.

## N.x Worksheet entries

One sentence, then:

<TeardownBar />

<WorksheetForm chapters={[N]} />

## N.x Summary

Five to eight bullet points. No new material.
```

The probes, the signal table and the worksheet fields are written in `src/data/chapters/N.yaml`, not in the chapter text.
