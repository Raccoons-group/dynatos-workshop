# 17: Demo reset

**What to build:** When a demo segment overruns or fails, the presenter restarts it from any fallback tag in one command, and GitHub's state follows the tag.

**Blocked by:** 08, 10

**Status:** claimed

Spec: [../spec.md](../spec.md)

- [x] `demo-reset <tag>` (coach-only, on `main` only):
  - hard-resets the demo work branch to the tag and force-pushes it
  - opens the PR into `demo/main` if it's missing
  - sets draft or ready, and adds or removes `spec-reviewed`, as the demo script's tag table says
  - never closes the PR
- [ ] It's checked on a rehearsal PR across at least three tags, and the card follows each reset.

## Built; the rehearsal check still to do

- **`pnpm demo:reset <tag>`** (`scripts/demo-reset.mjs`) is coach-only and listed in `scripts/coach-only.txt`.
  - It fetches the `demo/*` tags and force-pushes the tag's commit to `demo/allergens`.
  - It hard-resets whichever worktree on this laptop has `demo/allergens` checked out. A separate demo clone needs `git fetch && git reset --hard origin/demo/allergens`.
  - It opens the PR into `demo/main` if it's missing, as a draft, with "Part of" the demo issue from `demo/main`'s `docs/agents/`. Then it sets draft or ready and adds or removes `spec-reviewed` from the tag table.
  - It never closes the PR. A tag from before the PR (01, 02) can't take the PR away, so it puts it back to a draft without the label.
- **Tests:** 6, against a bare remote with `gh` recorded.
- **Docs updated:** the speaker notes on slides 36, 37 and 61 and `.scratch/workshop/assets/demo-script.md` now say `pnpm demo:reset` instead of the planned `scripts/demo-reset.sh`.
- **Still to do:** check it on a rehearsal PR across at least three tags, with the card following each reset. That needs the key, the cut, and the rehearsal's tags.
