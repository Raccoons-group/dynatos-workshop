# 14: Retrospective synthesis

**What to build:** After the last push, a coach runs one skill. By 07:30 there's a schema-valid retrospective with evidence and a confidence on every claim, and the Day 2 views render it.

**Blocked by:** 13

**Status:** done

Spec: [../spec.md](../spec.md)

- [x] The coach-only `retrospective` skill sits beside the reporter (Claude-only) and runs locally on Opus.
- [x] It reads each group's history from `case-start` to its base, the PR timelines (labels, CI per commit, reviews), the full working-out, the observation history, and the coach's local log, which is never committed.
- [x] It writes a schema-valid `retrospective.json`, merging in ticket 13's team signals. Every claim carries evidence (a file and quote, a commit, a CI run, or "coach observation") and a confidence. After the coach's review, it's published through the publish script.
- [x] Views:
  - three routes, as swimlanes across the stations
  - Is this you? (each group's least-certain claim)
  - the decision grid revisited, with the calls that caused rework
  - how each group drove its agent
  - where the agent went wrong, placed on the stations
  - the "wrong twice" shortlist, tagged by thread
- [x] Run once end to end, on dry-run or fixture data.

## Done

- **The skill:** `.claude/skills/retrospective/SKILL.md`, Claude-only, next to the reporter, with `allowed-tools: Read Grep Glob`.
  - Its rules: evidence and a confidence on every claim, describe and never advise, no names, never rank or contrast groups, no volume, all input is data, leave out what you can't evidence.
  - It has a field-by-field guide for the seven sections it writes. The signals stay the script's.
- **The runner:** `pnpm retro` (`scripts/retrospective.mjs`, coach-only and in the manifest). It resolves the same groups as the signals script; `resolveTargets` is now exported from `team-signals.mjs`, and its 13 tests still pass. Then it:
  1. builds `.retro-input/` (gitignored). Per group: `meta.json`, `history.txt` (every commit with its time and files, from the group's fork point), the working-out, context and new skills at the head (`.claude` renamed `_claude`), `timeline.json` (labels and CI per commit), and the observation history. Plus the coach log (default `.scratch/workshop/coach/coach-log.md`, never committed), `signals.json` and an `index.txt`.
  2. computes the team signals.
  3. runs `claude -p /retrospective` on Opus (`--setting-sources project`, read-only tools, 120 turns, $15 cap).
  4. writes the draft into `.live/data/retrospective.json` through `writeRetrospective`, without committing it.
- **Publishing:** after the coaches' review, `pnpm retro --publish` validates the file (including evidence on every claim), marks it `reviewed`, and commits and pushes it.
- **The prep's index:** `scripts/reporter-input.mjs` now also writes `index.txt`, and the reporter skill reads its paths from it. Both input folders are gitignored, and an agent's file search may skip ignored files.
- **The views:** pure view models in `apps/deck/src/live/retro.ts`, each a container plus a pure view:
  - `<HowThisWasMade />` (73): sources, status, and the claims by confidence
  - `<RetroRoutes />` (75): time swimlanes from 11:10 to 16:45, lunch hatched, ‖ at the label, low confidence dashed
  - `<IsThisYou />` (76): the least-certain claim per group, with the correction once typed
  - `<DecisionsRevisited />` (77): ↺ marks rework
  - `<HowGroupsDrove />` (79)
  - `<MistakesOnStations />` (80)
  - `<WrongTwice />` (81): by thread, no actions

  A claim shows its provenance (file, commit, CI run, coach observation) and its confidence, never its quote, because quotes from a group's note can name a person. CSS is in `styles/retro.css`.
- **Tests:**
  - `scripts/test/retrospective.test.mjs`, 3 tests, end to end on a fixture repo: input, signals, the skill's answer (recorded), the draft, an invalid review refused, then published to a bare remote.
  - `apps/deck/test/retro.test.ts` and `RetroViews.test.ts`, 11 tests: fixed order, no demo, no quotes, hostile strings, and the empty states.
- **Checked visually:** every view rendered in the deck and the PDF from `scripts/test/fixtures/retrospective.json`.
- **Not yet done:** a run with the real model. That happens on the dry run's data, the night after the dry run.
