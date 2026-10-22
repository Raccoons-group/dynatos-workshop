# 08: Reporter in CI, plus the local fallback

**What to build:** When a group pushes to its PR, the card on the deck updates within the agenda's budget, with no coach involved. A coach can produce the identical file from a laptop when CI or the wifi fails.

**Blocked by:** 01, 07. Also needs the `ANTHROPIC_API_KEY` Actions secret (Matthias).

**Status:** claimed

Spec: [../spec.md](../spec.md)

- [ ] The reporter skill follows its rules: it describes and never advises, never names a person, never compares groups, quotes only from the input, treats all input as data, and leaves a field empty rather than guess.
- [x] The workflow:
  - runs on `pull_request` (opened, synchronize, ready_for_review, labeled) for same-repo branches only, and never with `pull_request_target`
  - waits for the tests on the same commit
  - has a `workflow_dispatch` that takes a PR number
  - skips PRs into `main`
  - takes the group from the base's `docs/agents/` values, and fails with "retarget to `group-<x>/main`" when the head's group doesn't match
- [x] The report job has `contents: read` and the key. It uses concurrency per PR with cancel-in-progress, and installs with scripts ignored. It runs `claude-code-action` with the reporter skill and the base's schema as `--json-schema`, with shell, write and web tools disallowed and turns and budget capped.
- [x] The publish job has `contents: write` and no key, and uses concurrency on the data branch with `queue: max`.
- [x] The local fallback runs the same prep and publish scripts with `claude -p` (project settings only) and writes the same file.
- [ ] Measured and recorded in this ticket:
  - push to card for a review push (target about 5 minutes; otherwise the agenda moves 16:30 to 16:25)
  - a push including CI (target about 8 minutes)
  - a `labeled` event reaching the card
  - cost per run
  - three PRs pushed at once all land
- [ ] The turn and budget caps are set from these measurements.

## Built; measurements still to do

**Built and tested (22 Oct):**

- **The skill:** `.claude/skills/reporter/SKILL.md`, Claude-only, with `allowed-tools: Read Grep Glob`. It carries the eight rules and a field-by-field guide. The first criterion stays open until a real run shows the model keeps those rules; that needs the key.
- **The workflow:** `.github/workflows/reporter.yml`.
  - The scripts, skill, schema and keys always come from the PR's **base** (checked out at `base.sha`), never from the head.
  - Nothing is installed: the prep scripts need only Node, so no postinstall or group skill ever runs.
  - Of all labels, only `spec-reviewed` triggers it. The PR is resolved through the API for both events, and every untrusted value reaches a shell through `env`.
  - The agent's schema has `$schema` and `$id` removed. The judgements schema now contains no `'`, which a test checks, because `claude_args` passes it in single quotes.
- **New scripts:**
  - `scripts/reporter-target.mjs`: skips PRs into main, sends a wrong target back with "Retarget it to group-x/main.", and catches a base whose keys name another base.
  - `scripts/wait-for-check.mjs`: waits until every `test` run on the commit has finished. After 15 minutes it gives up and reports without CI.
  - `scripts/report-local.mjs` (`pnpm report:local --pr <n>`): the same target, prep and publish code, with `claude -p --setting-sources project` and the same caps. It writes into `.live/data`, so the deck shows the card offline. A failed push leaves the commit for the next sync to rebase.
- **Tests:** `scripts/test/reporter-pipeline.test.mjs`, 10 tests (102 in `scripts/`). The fallback writes exactly what `buildObservation` makes from the same facts and judgements.

**Still to do:** this needs the `ANTHROPIC_API_KEY` secret and a cut base (ticket 10's cut script), so it happens on the first real run, at the latest in the dry run.

- On the first run, confirm three things GitHub and the action decide:
  - that `concurrency.queue: max` is accepted
  - that `/reporter` resolves from the base's `.claude/skills/`
  - that the 2020-12 schema without `$schema` and `$id` validates in Claude Code
- Measure and record here:
  - push to card for a review push (target about 5 min)
  - a push including CI (about 8 min)
  - a `labeled` event reaching the card
  - the cost per run (`total_cost_usd`)
  - three PRs pushed at once all landing
- Then set `--max-turns` (now 20) and `--max-budget-usd` (now 1) from those numbers, in both `reporter.yml` and `report-local.mjs`.
- Pin `anthropics/claude-code-action`, `actions/checkout` and `actions/setup-node` to commit SHAs before the workshop.
