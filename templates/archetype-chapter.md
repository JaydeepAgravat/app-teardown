# Template: a Part III archetype chapter

An archetype chapter is a complete worked teardown that applies Part II. Replace `N` with the chapter number.

```text
---
title: N. Archetype name
description: One sentence that defines this app type by what it must do for its user.
sidebar:
  order: N
---

import Probe from '../../../components/Probe.astro';
import Signals from '../../../components/Signals.astro';
import TeardownBar from '../../../components/TeardownBar.astro';
import WorksheetForm from '../../../components/WorksheetForm.astro';

> **The archetype.** One sentence.

## N.1 What defines this archetype

The core user promise, and the two to four concerns that dominate the design.
Name the variants of the archetype that differ in a meaningful way.

## N.2 Requirements read from the product

What the app must do, and the qualities it must have, stated as a user experiences them.
No design yet.

## N.3 Running the probes

The probes from Part II that matter most for this archetype, in the order to run them,
with the outcomes typical of the archetype. Link to each probe's chapter.
Add probes specific to the archetype here, with <TeardownBar /> and <Probe id="PN.1" />.

## N.4 The design, concern by concern

One subsection per dominant concern. Each links to its Part II chapter and states which
design from that chapter's design space this archetype usually takes, and why.

## N.5 End-to-end architecture

One structure diagram of the client and the backend it implies.
One sequence diagram of the archetype's most important flow.

## N.6 Variants and how to tell them apart

Where real products in this archetype differ, and which probe separates the variants.
<Signals chapter={N} />

## N.7 What changes with scale

Which parts of the design are the same for a small app and a very large one,
and which parts change.

## N.8 Completed worksheet

<TeardownBar />
<WorksheetForm chapters={[N]} />
Then a table of the typical values for the archetype.

## N.9 As an interview question

How this archetype is usually asked in a system design interview, which requirements to
clarify first, which two or three concerns to go deep on, and the trade-offs an
interviewer expects to hear. Half a page.

## N.10 Summary

Five to eight bullet points. No new material.
```
