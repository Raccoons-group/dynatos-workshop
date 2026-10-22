# 13: Team signals, end to end

**What to build:** From the groups' git history and PR timelines, a script computes the five team signals overnight. The Day 2 signals view shows them per group, in fixed columns.

**Blocked by:** 07, 09

**Status:** done

Spec: [../spec.md](../spec.md)

- [x] A schema for the whole `retrospective.json`, defined here.
- [x] The script computes the signals per group through the GitHub adapter:
  - time from intent to spec: working minutes from 11:10 to the `spec-reviewed` label, excluding 12:40–14:05
  - spec rework: spec changes after the label
  - first-pass CI: red runs before the first green, per slice
  - review rounds
  - drift between plan and diff: slices planned vs shipped, and files changed outside the plan
- [x] The results are written into `retrospective.json`.
- [x] The signals view shows groups in fixed columns, with no totals and no colour scale.
- [x] Tested at seam 2 (the script on fixture repos) and seam 1 (the view from fixture JSON).

## Done (22 Oct 2026)

- **The schema** is `.claude/skills/retrospective/retrospective.schema.json`, and it covers the whole document, outline sections 1–8:
  - `sources`, `routes` (segments per station), `isThisYou` (with a `correction` field), `decisions` (each call with its `rework`), `signals`, `driving`, `mistakes` (station and origin) and `shortlist` (tagged by thread).
  - There's also a `status` field: `signals`, then `draft`, then `reviewed`.
  - Every claim carries `evidence` and a `confidence` (high, medium or low). Evidence is one of four kinds: `file` with a quote, `commit`, `ci` (sha, check, result, time), or `coach-observation`.
  - The validator has no `minItems`, so `checkRetrospective` in `scripts/lib/retrospective.mjs` adds the "at least one evidence item" rule.
- **`scripts/lib/retrospective.mjs`** is for ticket 14 to reuse.
  - `writeRetrospective({ dataDir, update })` merges one writer's sections into the data branch's file (or into a new, empty one), caps strings, and validates.
  - It refuses to write an invalid file, so the deck keeps the last good one.
- **`scripts/team-signals.mjs`.** Run it with `GH_TOKEN=$(gh auth token) node scripts/team-signals.mjs` (the token falls back to `gh auth token` on its own). Options: `--groups`, `--pr group-a=12`, `--data-dir .live/data`, `--remote origin`, `--offline`, `--ci-check test` and `--no-push`.
  - **Inputs.** It fetches, then for each group reads `<remote>/<group>/main` and its `docs/agents/workshop.md`. The PR number comes from `groups/<group>.json` on the data branch, or from `--pr`. The head is the PR's head commit.
  - **Output.** It writes only `signals` and commits through `commitAndPush`.
  - **Where the history starts.** It starts at the newest commit on the base's first-parent line that the head contains. Unlike `merge-base`, that still works after the group has merged its PR.
- **Decisions the coaches may want to check:**
  - **The label time** is the last time `spec-reviewed` went on, and null if it's off now. That's the same reading as the reporter's `specReviewedAt`. Minutes are counted on the label's own day on the Amsterdam wall clock, rounded down.
  - **Spec rework** counts the commits that touched `spec.md` with a committer time after the label.
  - **First-pass CI attributes each run to a slice by reading the tickets' `Status:` lines.**
    - A run belongs to the ticket that's `claimed` at its commit. If none is, it belongs to the first ticket that wasn't `done` before the commit.
    - Runs count only once that slice has changed code under `case/api` or `case/web`, so the case's already-green tests never count for a slice nobody has started.
    - When no Status line ever moves, all runs go into one entry with a null ticket. The view shows that as "slices not tracked".
    - Cancelled, skipped and neutral runs are ignored. The check name is `test`.
  - **Drift.**
    - "Planned" is the first set of tickets written, and "shipped" is the tickets that are `done` at the head. Tickets that were added or dropped are matched by file name.
    - "Outside the plan" is every changed file, minus the working-out, lockfiles, `case/AGENTS.md`, the glossary, ADRs and new skills, that the final spec and tickets never name.
    - A file counts as named if the plan contains its path. Inside `case/`, its file name or its compound name in words also counts (`GroupOrderPage.test.tsx` matches "group order page").
    - A one-word name (`App.tsx`, `Program.cs`) needs its file name, so "the web app" doesn't count. It's a heuristic, and the files are listed so a coach can check them.
- **The deck.**
  - `src/live/retrospective.ts` holds the types for the whole document, for ticket 14.
  - `src/live/signals.ts` is the view model. It has fixed signal rows and a column per group, sorted, with the demo left out. Every count is taken from a list. It reads a hand-corrected file defensively.
  - `TeamSignals.vue` (the container) and `TeamSignalsView.vue` (pure, `{{ }}` only) render it, styled by `styles/signals.css`. Place it on a slide with `<TeamSignals />`.
  - Rendered from the fixture, the view takes about 400 of the slide's 562 px.
- **Tests.**
  - Seam 2: 13 in `scripts/test/team-signals.test.mjs`. They use throwaway repos with `recordedGitHub`, and cover the merged-PR case, a removed label, untracked Status lines, offline runs, publishing against a bare remote while keeping the synthesis, refusing an invalid file, and the CLI.
  - Seam 1: 11 in `apps/deck/test/signals.test.ts` and `TeamSignalsView.test.ts`. They cover fixed columns, demo exclusion, no totals, hostile strings, no per-cell styling, and the plugin path.
  - Both seams share the fixture `scripts/test/fixtures/retrospective.json`.
  - `turbo run build typecheck test` for the deck and scripts passes, and so do `vue-tsc --noEmit`, the leak check and `skills:check`.
- **Left for others:**
- **Coach-only.** `scripts/coach-only.txt` lists `.claude/skills/retrospective/`, `team-signals.mjs`, `lib/retrospective.mjs`, the test and the fixture, so the cut keeps them off the bases. Nothing that stays on a base imports them.
- **Left for others:**
  - Ticket 14 should copy `signals` unchanged, or re-run the script last. Both writers keep each other's sections.
