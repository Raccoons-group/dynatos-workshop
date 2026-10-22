# 10: Cut script, leak check, hotfix and demo base

**What to build:** One coach command turns `main` into a clean `case-start` and four bases (three groups and the demo), each proven installable, green, fully harnessed and free of coach notes. A reporter fix reaches every base with one more command.

**Blocked by:** 04, 06, 08

**Status:** claimed

Spec: [../spec.md](../spec.md)

- [x] The leak-check script reads its term list from the gitignored coach notes at runtime. It fails and lists file and line for any hit in committed files outside the case's source code. It's tested with a test term list.
- [x] The cut script:
  - builds and tags `case-start` from `main`: all of `.scratch/`, `apps/deck` and the coach-only scripts removed, the case README as the root README, and a refreshed lockfile
  - cuts `group-a/main`, `group-b/main`, `group-c/main` and `demo/main`, each with its own `docs/agents/` values. `demo/main` also carries the `say-it-back` skill
  - checks each base: frozen install and both suites green, the reporter skill, workflows and PR template present, and the leak check clean
  - has a dry-run mode against a local remote
- [x] The hotfix script cherry-picks one commit that touches only coach-owned paths onto every base.
- [x] Tested on a fixture repo (seam 2).
- [ ] On the real remote:
  - a PR from `group-x/…` into `group-x/main` produces a card
  - a hotfix reaches an open PR from its next push
  - a frozen install passes without the deck

## Built; the real cut still to run

**Built and tested (22 Oct):**

- **The leak check:** `scripts/leak-check.mjs`.
  - It reads its terms at runtime from the gitignored `.scratch/workshop/coach/leak-terms.txt`, a curated list kept next to the coach notes. Ordinary domain words from the public epic stay out of it, or every file would hit.
  - It checks tracked and new (not-ignored) files. In `case/` it skips only source, so the case's Markdown is checked too.
  - Its first run on `main` found two hits in `.scratch/`, both fixed:
    - the case brief named the service that holds the ordering rules (a real hint, now removed; it's still in the pushed history)
    - a research note matched one term by accident, in ordinary prose (a false positive, rephrased)
- **The cut:** `scripts/cut.mjs`.
  - It works in a throwaway clone of committed `main` and removes everything in `scripts/coach-only.txt`, the manifest of coach-only paths. Sessions 13 and 15 added their Day 2 and overnight files to it.
  - It moves `case/README.md` to the root, drops root scripts that call removed files, refreshes the lockfile, and tags `case-start`.
  - It cuts the four bases with their `docs/agents/` values (`--epic`, `--demo-issue`); `demo/main` also gets `say-it-back`.
  - Each base is checked for the required files, no forbidden ones, the right keys, a clean leak check, then a frozen install plus `pnpm test`. `--fast` runs those last two on `case-start` only.
  - It refuses to overwrite a remote that already has the tag or a base unless you pass `--force`. `--dry-run` pushes to a fresh local bare repo.
- **The hotfix:** `scripts/hotfix.mjs --commit <sha>`. It takes only coach-owned paths (`.claude/skills/reporter/`, `.github/`, `scripts/`), and refuses coach-only files. It cherry-picks with `-x` onto all four bases, leak-checks, and pushes as a fast-forward only. `--dry-run` applies everything without pushing.
- **Tests:** 15 on fixture repos with a made-up term list (132 in `scripts/` now).

**Still to do:**

- A real dry run of the cut (`node scripts/cut.mjs --epic <n> --demo-issue <n> --dry-run`) once everything is committed to `main`, since the cut reads committed `main`. That run is the real lockfile refresh, frozen install and test suites without the deck.
- **On the real remote** (needs the key, so Matthias):
  1. File the epic and the demo issue.
  2. Run the cut for real.
  3. Open a PR from `group-a/…` into `group-a/main` and watch for the card.
  4. Push a hotfix and check that the open PR picks it up on its next push.
- A hotfix that changes `.github/workflows/` needs a `gh` login with the `workflow` scope.
