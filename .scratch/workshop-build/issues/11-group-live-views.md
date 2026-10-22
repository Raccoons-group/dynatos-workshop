# 11: Group live views

**What to build:** At each Day 1 moment, coaches can show the right view of all three groups, and the demo card appears only where the talk needs it.

**Blocked by:** 09

**Status:** done

Spec: [../spec.md](../spec.md)

- [x] View models and Vue components for:
  - Same fog, three readings: the epic's seven points × three groups, with each group's call and one line, the `spec-reviewed` marker, and the acceptance examples
  - What the reviewers found: per group, the rounds, the findings per bucket, the headline finding, and CI
  - The stand-up card: the phase reached, the slices and their status, the acceptance examples and which are in tests, the first green CI, skills written, and what the agent got wrong
  - Tonight: the last push and the working-out checklist
  - The demo card: on talk slides only
- [x] Tested from the fixtures (seam 1): no names, rankings, totals or volume counts, counts come from lists, and strings render as text.

## Done

- **View models:** pure TypeScript in `apps/deck/src/live/`.
  - `fog.ts`: `fogGrid`, plus `examplesOf`, shared with the stand-up card.
  - `reviews.ts`: `reviewCards`, with buckets in REVIEW.md's order.
  - `standup.ts`: `standupCard(observations, group)`.
  - `tonight.ts`: `tonightRows`.
  - `wall.ts` gained `groupsOf` (drops the demo and keeps a fixed group order, so nothing ranks), `wallCard` and `demoCard`.
- **Components:** one tag each. `<SameFog />`, `<ReviewersFound />`, `<StandupCard group="group-a" />`, `<Tonight />` and `<DemoCard />`, each a container over a pure `…View.vue`. The wall's single card is now `WallCardView.vue`, shared with the demo card. CSS is in `styles/group-views.css`.
- **Rules the tests check:**
  - An acceptance example counts as "in a test" only when its test name is in `facts.testsAdded`, so a test name the model made up never shows as covered.
  - The AGENTS.md item in Tonight needs the file to have changed since the stub.
  - "x of y" counts are computed from the lists on the same card.
  - No view carries evidence (the test asserts no evidence file or quote reaches any view), so no names.
  - Bucket counts come from the scripts and are never summed.
- **Tests:** 21 new (38 in the deck). Two deliberate bugs, a made-up test name counting as covered and `v-html` in the grid, each failed a test.
- **Checked in the browser** with seeded `.live/` data. All six views fit the 1000 px canvas.
- **Placeholder slides:** `slides.md` has one per view, for ticket 12 to place for real.
- **Prettier:** it broke Slidev's per-slide frontmatter, so `.prettierignore` now skips `apps/deck/**/*.md`.
