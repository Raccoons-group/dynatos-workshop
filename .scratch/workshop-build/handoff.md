# Build handoff

**Status (22 Oct 2026):** all 18 build tickets are built. Fourteen are done. Four (03, 08, 10, 17) are built and tested locally, and wait only on the steps below that need your accounts: the key, the push, the real cut, the rehearsal. Ticket 06 is marked done, but one criterion is still open: its trigger runs haven't happened (step 2). Nothing is committed yet.

Tests:
- 138 in `scripts/`
- the deck's suites
- Forkful's 3 API tests and 1 web test

They're all green, along with the typecheck, the deck's build, the PDF export, the skills guard and the leak check.

The cut has run end to end on a snapshot of today's working tree (`--fast`, into a throwaway remote, 74 s):
- `case-start` was cut with Forkful's README at the root and only the participant scripts
- the four bases were checked, each with its own keys
- `say-it-back` is on the demo base only
- the leak check found nothing

The one stray, the deck's `.claude/launch.json`, is now on the coach-only list.

## In order

1. **Check, then commit and push `main`.** Run `node scripts/leak-check.mjs` and `pnpm skills:check` first. The coach notes and the leak check's term list (`.scratch/workshop/coach/leak-terms.txt`, new) stay gitignored. Share both with Sander outside git.
2. **Sign the `claude` CLI in.** `claude auth status` says it's signed out. Ticket 06's trigger runs (the `TESTS.md` files in `read-issue`, `open-pr`, `how-we-worked` and `tdd`) haven't run yet for that reason, and `pnpm report:local` and `pnpm retro` need it too. Run each `TESTS.md` in Claude Code and in a second tool.
3. **GitHub, as you:**
   - repo settings: merge commits only, no auto-deleting head branches
   - labels: `spec-reviewed`, `epic` and `demo`
   - a spend-capped key from a dedicated Console workspace, as the secret `ANTHROPIC_API_KEY`
   - the participants as collaborators
4. **The data branch, once:** `node scripts/publish-live-data.mjs --init`.
5. **The issues:** file the epic (label `epic`) and the demo's "Show allergens on the menu" (label `demo`), and note both numbers.
6. **The cut:**
   1. `node scripts/cut.mjs --epic <n> --demo-issue <m> --dry-run`. It runs the full install and tests on every base, so add `--fast` for a quicker first look.
   2. Then run it again without `--dry-run`.
   3. Check that CI is green on each base.
7. **The reporter's first run (ticket 08):**
   1. Open a PR from `group-a/try` into `group-a/main` and watch for the card. `pnpm live:sync` then `pnpm dev` puts it on the deck.
   2. Confirm three things only a real run shows:
      - GitHub accepts `concurrency.queue: max`
      - `/reporter` loads from the base
      - Claude Code accepts the schema
   3. Measure push → card for a review push (target about 5 min) and for a push including CI (about 8 min), a `labeled` event, the cost per run, and three PRs at once.
   4. Set `--max-turns` and `--max-budget-usd` in both `reporter.yml` and `report-local.mjs` from those numbers.
   5. Pin the actions to commit SHAs.
8. **The hotfix (ticket 10):** commit a harmless change under `scripts/`, run `node scripts/hotfix.mjs --commit <sha>`, and check that an open PR picks it up on its next push. A workflow change needs a `gh` login with the `workflow` scope.
9. **The demo rehearsal (ticket 17):**
   1. Do three full dry runs, restarting from every tag, and make the tags from the final one.
   2. Leak-check them (`node scripts/leak-check.mjs` on each tag's checkout), then push them.
   3. Run `pnpm demo:reset <tag>` across at least three tags and watch the card follow.
   4. Record each live segment.
10. **The presenter's laptop:** run `pnpm live:sync` and `pnpm --filter @workshop/deck dev` (port 3030), check the deck offline, and export the PDF with `pnpm --filter @workshop/deck export`.

## The dry-run checklist (from the spec)

- **Cross-tool:**
  - Is each skill listed once per tool?
  - Do Windows junctions work without admin rights?
  - Do the VS Code Claude harness and Claude Code mid-session pick up linked skills?
  - Does the adopt step work?
  - Does `read-issue` work with and without `gh`?
  - Do skills named in prose trigger in Codex and Copilot? See step 2.
- **The agenda's risks:**
  - time the opening round
  - explore plus spec in about 75 minutes, and the checkpoint queue at 14:05
  - the review swap in 25 minutes
  - the 16:30 → 16:35 latency
- **Ask Dynatos:** who uses Visual Studio or Rider with Copilot Chat, and which OS each participant runs.

## On the day

| When | Command |
| - | - |
| All day | `pnpm live:sync` (keeps `.live/` current) and `pnpm --filter @workshop/deck dev` |
| CI or wifi down | `pnpm report:local --pr <n>`: the same card from your laptop. It shows offline and pushes later. |
| Demo overran | `pnpm demo:reset demo/04-sliced` (any fallback tag) |
| Overnight | `pnpm retro`, review `.live/data/retrospective.json` by hand, then `pnpm retro --publish` by 08:30. The coaches' log goes in `.scratch/workshop/coach/coach-log.md`. |
| Day 2 lab and plan | `node scripts/library-list.mjs --watch 30` and `node scripts/action-plan.mjs --watch 15` |
| After Day 2 | Delete the key in the Console, and commit the coach notes as the reveal |

## Worth knowing

- **Deck page numbers run one ahead of the outline** from the setup check (after slide 7) on. Every slide's notes start with its outline number, its time and its minutes.
- **The cut removes everything in `scripts/coach-only.txt`.** A new coach-only script goes on that list. The cut runs the bases' tests, so a script left behind that imports a removed one would show up there.
- **The leak check found and fixed two things in `.scratch/` on `main`:**
  - the case brief named the service that holds the ordering rules (a real hint; it's still in the pushed history)
  - a research note's wording matched a term by accident
- **Something to decide:** the observation fixtures in `scripts/test/fixtures/` show one plausible set of calls on the epic's open points. They give away no planted item, and they survive the cut. Groups could read them as a hint of what's expected. Neutralise them if you'd rather not take that risk.
- **The dev deck can serve a stale module** after a root layer file changes (`global-top.vue`). Delete `apps/deck/node_modules/.vite` and restart.
