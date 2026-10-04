# Decisions

| Decision | Chosen | Why | Rejected | Chapter |
|---|---|---|---|---|
| Where the value lives | Computed on load, never stored | Fixed by the codebase | | 9 |
| Forgiveness rule | A single missed day is bridged when the day before it was done and no other forgiven miss lies within 7 days of it | Forgiving but still honest | Any single miss, a 0 to 100% strength score | 9 |
| Counting | Only done days count | The number stays a true count | Forgiven day counts as a day | 9 |
| Display | A note under the streak: "1 miss forgiven" | The user sees why the streak did not reset | Nothing shown | 37 |
| Today not done yet | Not a miss, as before | Fixed by the codebase | | 9 |
| Export file | Unchanged | A computed value does not belong in a backup | | 54 |
