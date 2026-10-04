---
title: Appendix F. Further reading
description: Free and openly available sources on mobile system design, grouped by the chapters they support.
---

This list holds sources that are free to read. It was compiled on 4 October 2026 and the links were not all re-checked after that date, so some may have moved. Company engineering posts are free to read but are not openly licensed. Posts hosted on membership platforms may sit behind a paywall.

The handbook describes designs for generic app types and names no products. The sources here are different: each is a maker describing its own system, which is the strongest evidence there is (see [Chapter 5](/part-1-method/5-from-signal-to-inference/)).

## The whole subject

- [weeeBox/mobile-system-design](https://github.com/weeeBox/mobile-system-design). A framework for mobile system design interviews, with exercises and deep dives on caching, pagination, image loading, navigation, prefetching and resumable uploads.
- [yogeshpaliyal/awesome-mobile-system-design](https://github.com/yogeshpaliyal/awesome-mobile-system-design). A list of guides, feature designs and app case studies.
- [greatfrontend/awesome-front-end-system-design](https://github.com/greatfrontend/awesome-front-end-system-design). Client-side system design, which overlaps heavily with mobile.
- [donnemartin/system-design-primer](https://github.com/donnemartin/system-design-primer). General system design, for the backend side of a teardown.
- [C4 model](https://c4model.com/). An approach to drawing software architecture at several levels of detail.

## Chapter 10. API shape

- [Slack: How We Design Our APIs](https://slack.engineering/how-we-design-our-apis-at-slack/)
- [Instacart: Building the View Model API, Part 1](https://tech.instacart.com/building-instacarts-view-model-api-part-1-why-view-model-4362f64ffd2a)
- [Airbnb: Moving 10x Faster with GraphQL and Apollo](https://medium.com/airbnb-engineering/how-airbnb-is-moving-10x-faster-at-scale-with-graphql-and-apollo-aa4ec92d69e2)

## Chapter 11. Local storage, caching and prefetching

- [Instagram: Building an Open Source, Carefree Android Disk Cache](https://medium.com/instagram-engineering/building-an-open-source-carefree-android-disk-cache-af57aa9b7c7)
- [Instagram: Background Data Prefetching](https://medium.com/instagram-engineering/improving-performance-with-background-data-prefetching-b191acb39898)

## Chapter 12. Offline and sync

Trello's series is a complete case study of adding offline support to an existing app:

1. [Airplane Mode: Enabling Trello Mobile Offline](https://www.atlassian.com/blog/atlassian-engineering/sync-architecture)
2. [Syncing Changes](https://blog.danlew.net/2017/02/26/syncing-changes/)
3. [Sync Failure Handling](https://blog.danlew.net/2017/02/28/sync-failure-handling/)
4. [The Two ID Problem](https://blog.danlew.net/2017/03/09/the-two-id-problem/)
5. [Offline Attachments](https://blog.danlew.net/2017/03/14/offline-attachments/)
6. [Sync is a Two-Way Street](https://blog.danlew.net/2017/03/21/sync-is-a-two-way-street/)
7. [Displaying Sync State](https://blog.danlew.net/2017/03/30/displaying-sync-state/)

Also:

- [Local-first software (Ink & Switch)](https://www.inkandswitch.com/local-first/). The essay that set out local-first principles.
- [Expensify/App](https://github.com/Expensify/App). A production offline-first app with a documented approach to offline behavior.
- [PowerSync documentation](https://docs.powersync.com). The architecture of a sync engine between backend databases and an on-device database.

## Chapter 13. Network transport and resilience

- [Uber: How the New Driver App Overcomes Network Lag](https://www.uber.com/blog/driver-app-optimistic-mode/)
- [Uber: Failover Handling in Mobile Networking Infrastructure](https://www.uber.com/blog/eng-failover-handling/)
- [Uber: Employing QUIC to Optimize App Performance](https://www.uber.com/blog/employing-quic-protocol/)
- [Snap: QUIC at Snapchat](https://eng.snap.com/quic-at-snap)

## Chapter 14. Real-time delivery

- [Instagram: Making Direct Messages Reliable and Fast](https://medium.com/instagram-engineering/making-direct-messages-reliable-and-fast-a152bdfd697f)

## Chapter 15. Lists, feeds and pagination

- [Slack: Evolving API Pagination](https://slack.engineering/evolving-api-pagination-at-slack/)
- [Everything You Need to Know About API Pagination](https://nordicapis.com/everything-you-need-to-know-about-api-pagination/)

## Chapter 18. File transfer: uploads and downloads

- [Dropbox: Making Camera Uploads for Android Faster and More Reliable](https://dropbox.tech/mobile/making-camera-uploads-for-android-faster-and-more-reliable)

## Chapter 30. Remote config and experiments

- [Netflix: The Experimentation Platform](https://netflixtechblog.com/its-all-a-bout-testing-the-netflix-experimentation-platform-4e1ca458c15)

## Chapter 31. Server-driven UI

- [Airbnb: A Deep Dive into Airbnb's Server-Driven UI System](https://medium.com/airbnb-engineering/a-deep-dive-into-airbnbs-server-driven-ui-system-842244c5f5)
- [DoorDash: Generic, Server-Driven UI Components](https://careersatdoordash.com/blog/improving-development-velocity-with-generic-server-driven-ui-components/)
- [Uber Freight: Lists of Modular, Reusable Components](https://www.uber.com/blog/uber-freight-app-architecture-design/)
- [Mobile Native Foundation: Server-driven UI strategies](https://github.com/MobileNativeFoundation/discussions/discussions/47)

## Chapter 32. UI technology: native, cross-platform and web

- [Dropbox: The (Not So) Hidden Cost of Sharing Code Between iOS and Android](https://dropbox.tech/mobile/the-not-so-hidden-cost-of-sharing-code-between-ios-and-android)

## Chapter 36. Constrained devices and networks

- [Facebook Lite](https://engineering.fb.com/2016/03/09/android/how-we-built-facebook-lite-for-every-android-phone-and-network/)
- [Uber Lite](https://www.uber.com/blog/engineering-uber-lite/)
- [Spotify Lite, One Year Later](https://engineering.atspotify.com/2020/12/how-we-built-it-spotify-lite-one-year-later/)
- [Microsoft Teams: Designing for Emerging Markets](https://medium.com/microsoft-mobile-engineering/microsoft-teams-designing-for-emerging-markets-part-1-network-profile-2daeaa09f313)

## Chapter 38. Modularity, SDKs and team scale

- [Uber: The Journey to Android Monorepo](https://www.uber.com/blog/android-engineering-code-monorepo/)
- [Airbnb: Designing for Productivity in a Large-Scale iOS Application](https://medium.com/airbnb-engineering/designing-for-productivity-in-a-large-scale-ios-application-9376a430a0bf)
- [Mobile Native Foundation: Monorepo discussion](https://github.com/MobileNativeFoundation/discussions/discussions/31)

## Engineering blogs to browse

- [Uber: Mobile Engineering](https://www.uber.com/blog/engineering/mobile/)
- [Dropbox: Mobile](https://dropbox.tech/mobile)
- [Airbnb: Mobile](https://medium.com/airbnb-engineering/tagged/mobile)
- [Cash App: The Code](https://code.cash.app)
- [Mobile Native Foundation discussions](https://github.com/MobileNativeFoundation/discussions/discussions)
