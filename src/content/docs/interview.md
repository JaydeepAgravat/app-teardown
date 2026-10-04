---
title: Appendix E. The method in a design interview
description: How to run the teardown method forwards, under a time limit, when you are asked to design a mobile app.
---

A teardown reads a design from behavior. A design interview asks for the reverse: you are given a product and must produce the design. The reasoning is the same and only the direction changes. The constraints still leave a small design space for each problem, and you still choose a design in it and say what it costs.

This appendix shows how to use the handbook's parts in that direction, in about 45 minutes.

## What the interviewer is looking for

An interviewer for a mobile system design question usually wants four things:

- You find out what the product must do before you draw anything.
- You know which problems are hard on a mobile client, and you spend your time there.
- You name more than one workable design for each hard problem, choose one, and give the cost.
- You know what your client design requires from the backend.

Every concern chapter in Part II is organized the same way: a design space, the cost of each design, and the backend each one implies. That is the material you need.

## A time plan

| Minutes | Step | Handbook material |
|---|---|---|
| 0 to 5 | Requirements | The archetype's "Requirements read from the product" section |
| 5 to 10 | Constraints and scope | The seven constraints of [Chapter 2](/part-1-method/2-the-mobile-constraint-set/) |
| 10 to 15 | The overall shape | The universal app model of [Chapter 3](/part-1-method/3-the-universal-app-model/) |
| 15 to 35 | Two or three deep dives | The design space of the dominant concern chapters |
| 35 to 42 | Failure modes and trade-offs | Each chapter's "Failure modes and what they reveal" |
| 42 to 45 | Summary and what you would do next | Your open questions |

### Step 1. Requirements

State the product's promise in one sentence, as the user experiences it. Each archetype chapter opens with one. For messaging it is that a message, once sent, arrives exactly once, in order, on every device of the recipient.

Then ask which features are in scope. A design belongs to a feature and not to an app ([Chapter 5](/part-1-method/5-from-signal-to-inference/)), so a short feature list gives you a short list of designs to produce. Three features designed well beat ten listed.

Ask about scale only as far as it changes the client: how many items are in a list, how large the media is, how many devices one user has.

### Step 2. Constraints and scope

Walk the seven constraints aloud and say which ones dominate this product. This takes one minute and shows that you know the terrain.

- A messaging app is dominated by the unreliable network and process death.
- A banking app is dominated by the untrusted client and slow release.
- A navigation app is dominated by limited resources and platform rules.

The dominant constraints tell you which concern chapters to draw on.

### Step 3. The overall shape

Draw the client and the backend as two zones, with the components from the universal app model that this product needs. Leave out the ones it does not need, and say so. An app with no offline writes has no outbox. An app with no live updates has no async delivery.

Keep this diagram to about ten boxes. Its job is to give the deep dives a place to attach.

### Step 4. Deep dives

Pick the two or three concerns that carry the product's promise. For each one, do what a concern chapter does:

1. Name the design space, from simplest to most capable.
2. Choose a design for each feature, and say why the simpler one is not enough and the more capable one is not worth its cost.
3. Show the mechanism: the data that moves, in what order, and what is stored where.
4. State what the backend must provide.

For example, for offline behavior, name the five offline levels of [Chapter 12](/part-2-concerns/12-offline-and-sync/), assign a level to each feature, and then describe the outbox, the idempotency key and the conflict rule for the features at Level 2 or above.

Use the handbook's vocabulary for precision. "Stale-while-revalidate", "cursor paging" and "upload, then attach" each name a complete design in a few words.

### Step 5. Failure modes and trade-offs

Describe what the user sees when things go wrong: a lost response, a rejected mutation, a conflict between two devices, an old app version. A design you can describe only when it works is half a design.

State each trade-off as a pair. Prefetching spends data to save time. A local replica spends complexity to gain offline use. Server-driven UI spends interactivity to gain release speed.

### Step 6. Summary

Close with what you chose, what you left out on purpose, and what you would measure after release.

## Confidence words, forwards

In a teardown you mark each claim Observed, Inferred or Speculative. In an interview the matching habit is to separate three kinds of statement:

- **Requirement.** The interviewer said it, or agreed to it.
- **Decision.** You chose it, and you gave the reason.
- **Assumption.** You could not ask, or chose not to, so you state it and move on.

Saying "I am assuming a user has at most a few devices" out loud costs five seconds and prevents a wrong design from going unnoticed.

## From prompt to chapter

| If you are asked to design | Start from | Go deep on |
|---|---|---|
| A chat or messaging app | [Chapter 39](/part-3-archetypes/39-messaging/) | Chapters 12, 14 and 18 |
| A news feed or a stories feature | [Chapter 40](/part-3-archetypes/40-social-feed-and-stories/) | Chapters 15, 16 and 11 |
| A video or short-video app | [Chapter 41](/part-3-archetypes/41-video-and-short-video-streaming/) | Chapters 17, 15 and 11 |
| A music or podcast player | [Chapter 42](/part-3-archetypes/42-audio-streaming-and-podcasts/) | Chapters 17, 23 and 18 |
| A shopping app | [Chapter 43](/part-3-archetypes/43-marketplace-and-e-commerce/) | Chapters 28, 26 and 15 |
| A ride-hailing or delivery app | [Chapter 44](/part-3-archetypes/44-on-demand-services-rides-and-delivery/) | Chapters 24, 14 and 13 |
| A ticket or hotel booking app | [Chapter 45](/part-3-archetypes/45-booking-and-reservations/) | Chapters 26, 12 and 14 |
| A banking or payments app | [Chapter 46](/part-3-archetypes/46-banking-payments-and-fintech/) | Chapters 20, 21 and 26 |
| A maps or navigation app | [Chapter 47](/part-3-archetypes/47-maps-and-navigation/) | Chapters 24, 11 and 35 |
| A notes app or a shared document editor | [Chapter 48](/part-3-archetypes/48-notes-documents-and-collaboration/) | Chapters 12 and 14 |
| A video calling app | [Chapter 49](/part-3-archetypes/49-meetings-and-calling/) | Chapters 19, 23 and 13 |
| An assistant you talk to | [Chapter 50](/part-3-archetypes/50-ai-assistants/) | Chapters 14, 29 and 12 |
| A fitness tracker | [Chapter 51](/part-3-archetypes/51-health-fitness-and-connected-devices/) | Chapters 24, 23 and 12 |
| A mobile game | [Chapter 52](/part-3-archetypes/52-games/) | Chapters 35, 21 and 30 |
| An app that hosts many services | [Chapter 53](/part-3-archetypes/53-super-apps-and-mini-programs/) | Chapters 38, 31 and 30 |
| A library, such as an image loader or a file downloader | [Chapter 38](/part-2-concerns/38-modularity-sdks-and-team-scale/) | Chapters 16, 18 and 11 |
| Something that fits none of these | [Chapter 55](/part-3-archetypes/55-the-app-that-fits-no-archetype/) | The first-pass probes of Chapter 4, run in your head |

Each archetype chapter ends with a section on how that app type is asked as an interview question.

## Common mistakes

- **Starting with the backend.** A mobile design interview is about the client. Reach the backend through what the client needs from it.
- **Naming a technology in place of a design.** A product name does not say what happens when a response is lost. Describe the mechanism first, and name a technology only if asked.
- **One design for the whole app.** State the design per feature. A payment screen and a message list in the same app sit at opposite ends of the offline levels.
- **No costs.** Every design in this handbook has a cost. A choice presented with no cost reads as a choice not understood.
- **Ignoring old versions.** A shipped version cannot be recalled. Say how your API change reaches users on last year's version.
- **Skipping the unhappy path.** Say what the user sees when the request fails, the app is killed, or two devices disagree.

## Practicing

The fastest practice is a real teardown. Take an app you use, run the first-pass probes of [Chapter 4](/part-1-method/4-probes/), and fill in a [worksheet](/worksheet/). Then close the handbook and design the same app from a blank page. Where your design differs from what you observed, one of the two is wrong, and finding out which teaches more than any list of questions.
