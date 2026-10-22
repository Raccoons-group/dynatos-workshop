# 07: Observation contract and the prep and publish scripts

**What to build:** From a group's branch and its base, the scripts compute every fact about the group's PR and publish a validated observation to the data branch, without any model involved.

**Blocked by:** 04

**Status:** done

Spec: [../spec.md](../spec.md)

- [x] A JSON Schema for the observation (the shape in the spec) sits with the reporter skill and is the single source of truth.
- [x] Given a base, a head and a group, the prep script builds the reporter input:
  - the diff and diffstat against the base, with lockfiles excluded and the output truncated
  - the working-out, `case/AGENTS.md` and the glossary, copied as files, with nested `.claude/` folders renamed
  - `facts`, every field computed with the spec's phase rules (the tickets folder; group skills detected as new folders under the shared skills folder)
- [x] The publish script merges `facts`, `judgements` and the envelope, validates the result against the schema, caps string lengths, and writes `groups/<group>.json` plus a history snapshot to the orphan `live-deck-data` branch. A rebase-retry loop handles concurrent writers.
- [x] GitHub API calls go through one adapter, and tests use recorded responses.
- [x] Tests run both scripts on throwaway fixture repos (seam 2), including two concurrent publishes against a bare remote.
- [x] The fixture observations (the deck prototype's three groups, already neutralised) validate against the schema.

## Done (22 Oct 2026)

- **Schemas** live in `.claude/skills/reporter/`:
  - `judgements.schema.json` is self-contained. It's what CI passes to `--json-schema`.
  - `observation.schema.json` holds the envelope and facts, and pulls the judgements in through a `$ref`.
  - Following the deck prototype's fixtures, `now` and `notable` are plain strings with no evidence. Everything else carries `evidence`.
- **No dependencies.** `scripts/lib/schema.mjs` is a small validator plus a string-capper for the subset the schemas use. The scripts package stays free of npm dependencies, so the reporter job installs nothing extra.
- **`scripts/reporter-input.mjs`** (the prep step) takes `--base --head --pr [--out] [--offline] [--ci-result --ci-at] [--ci-check test]`.
  - The group and working-out come from the base's `docs/agents/workshop.md`.
  - The CI facts read check runs named `test` by default, so **the tests workflow's job must be named `test`** (ticket 01), or pass `--ci-check`.
  - Test detection: xUnit `[Fact]` and `[Theory]` methods in `.cs` files, and Vitest `it()` and `test()` in `*.test.*`, `*.spec.*` and `__tests__/` files. API test files are recognised by a `*.Tests/` folder or a `*Tests.cs` name.
- **`scripts/publish-live-data.mjs`** (the publish step) takes `--group --pr --sha --facts --judgements --data-dir [--no-push]`, and `--init` creates the orphan `live-deck-data` branch on the remote once. Snapshot names are in UTC.
- **`scripts/lib/github.mjs`** is the only GitHub access, via `fetch` and `GH_TOKEN`. Tests use `recordedGitHub`.
- **`scripts/lib/workshop-keys.mjs`** also holds `targetMismatch`, the "retarget to `group-<x>/main`" check ticket 08 needs.
- **The `review.md` contract** is pinned in `REVIEW.md`: `## Round n`, then `### Act on`, `### Consider`, `### Noted` and `### Dismissed`, with one `- ` bullet per finding. The ticket 05 session was told.
- **Fixtures** are in `scripts/test/fixtures/observations/`: the prototype's three groups plus a late-afternoon `group-late`. **`scripts/` survives the cut onto the group branches**, so their strings were rewritten to carry no hint of the planted items. Keep it that way.
- **Tests:** 27 (schema, keys, prep on a fixture repo with recorded GitHub, publish against a bare remote including a two-publisher race). All green.
- **Risk for 08:** structured outputs may not accept `maxLength` or `maxItems`. If the action rejects the schema, strip those keywords before passing it. The publish step caps strings anyway.
