# 09: Slidev deck: brand, offline, live data, the wall

**What to build:** On the presenter's laptop, the deck runs offline in the Raccoons style, and the wall redraws within seconds whenever a group's observation changes on the data branch.

**Blocked by:** 07

**Status:** done

Spec: [../spec.md](../spec.md)

- [x] Slidev replaces the deck placeholder. TypeScript stays on `~6.0`, `vite` is a direct dev dependency, and the deck builds through turbo.
- [x] The Raccoons brand is plain shared CSS: titles get the bold full stop, and an ordered list becomes 2 × 2 cards. Inter Tight is self-hosted with no font provider, so the deck makes no external requests (checked with the network off).
- [x] The sync script keeps a local worktree of `live-deck-data` fresh (a fetch about every 10 s). It also writes a small JSON with the repo's PR list and the time of the last fetch.
- [x] The live-data plugin serves that folder and pushes each change over Vite's websocket after a short settle delay. A file that doesn't parse keeps that group's last good observation.
- [x] The wall's view model and Vue component show one mini ribbon per group: the phase along the top, and the context, skills and checks lights along the bottom (rules in the spec). Each card also shows the CI badge, `now`, the latest `notable`, and "updated hh:mm" or "stale since". The demo is excluded, and counts come from lists.
- [x] View-model tests run from the fixtures (seam 1). A component test checks that hostile strings (`<img onerror>`, markdown, a `javascript:` link) render as literal text.

## Context from 07

- The schema is `.claude/skills/reporter/observation.schema.json`. Validate with `scripts/lib/schema.mjs` (`loadSchema`, `validate`), which has no dependencies.
- Fixtures are in `scripts/test/fixtures/observations/`: groups a, b and c early in the day, plus `group-late` (reviewing, with slices, tests and two review rounds). `group-c`'s `now` holds HTML and markdown, for the hostile-string test.
- `now` and `notable` are plain strings. Counts the deck shows must come from lists (`testsAdded`, `skillsWritten`, `slices`). `review.findings` are counts computed by a script, never by the model.

## Done

- The deck is `apps/deck` (Slidev 53, Vue 3.5, Vite 8). `pnpm --filter @workshop/deck dev` serves it on port 3030, and `.claude/launch.json` has the same command as `deck` for the desktop app's browser pane. Turbo runs `build`, `typecheck` (vue-tsc) and `test` (Vitest).
- Brand: `styles/raccoons.css`. The `title-cards` layout turns an ordered list into 2 × 2 cards. Inter Tight comes from `@fontsource-variable`, fonts use `provider: none`, and the favicon is local. In the browser pane, all 250 resources came from localhost. The only URLs left in `dist/` are SVG namespaces and links inside error messages.
- Sync: `pnpm live:sync` (`scripts/live-sync.mjs`) fetches every 10 s into a detached worktree at `.live/data`. It writes `.live/meta.json` as `{lastFetchAt, lastFetchError, prs}`, with the PR list from `gh pr list`. Offline, it keeps the data and the last PR list. Observations published locally are rebased, not dropped. **This script is coach-only, so ticket 10 must strip it from the bases.**
- Plugin: `src/live/plugin.ts` serves `/__live-deck-data` and pushes `live-deck-data` over Vite's websocket after 150 ms. Set `LIVE_DIR` to point it at another folder. Checked in the browser: an edited `now` redrew in about a second, and a broken group file kept that group's last good card.
- The wall's view model is `src/live/wall.ts`, with components `Wall.vue` (container) and `WallView.vue` (pure). Tests: 17 in the deck (fixtures from `scripts/test/fixtures/observations/`, including the hostile-string test) and 4 for the sync against a bare remote.
