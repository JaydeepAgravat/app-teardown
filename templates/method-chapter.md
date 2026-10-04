# Template: a Part I method chapter

Part I teaches the method that Parts II and III apply. Its chapters are explanations, so they have a freer structure than concern chapters. Replace `N` with the chapter number.

```text
---
title: N. Title
description: The chapter's question restated as a statement.
sidebar:
  order: N
---

> **The question.** One sentence.

## N.1 to N.x Numbered sections

Build the idea step by step. Each section makes one point and gives one concrete example
from an app behavior the reader will recognize.

Use at least one diagram that follows the diagram kit.

Where the chapter introduces one of the fixed lists from the Canon section of STYLE.md,
use the names and the order given there exactly.

## N.x In practice

How the reader uses this chapter's idea during a teardown. Short and concrete.

## N.x Summary

Five to eight bullet points. No new material.
```

A Part I chapter has a data file in `src/data/chapters/` only when it defines probes, signals or worksheet fields. When it does, it uses the same components as a concern chapter.
