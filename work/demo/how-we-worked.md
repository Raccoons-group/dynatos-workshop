# How we worked

## 2026-10-23 15:52 · Claude Code · Opus 5.5

From reading issue #2 to the first push of the work branch.

### Observed by the agent

- Skills used: read-issue, say-it-back (already on the base branch), grilling, domain-modeling, open-pr, how-we-worked
- Corrected by the group: nothing. The group agreed to every restatement and recommendation as proposed.
- Got wrong: the first `gh issue view 2 --comments` printed nothing, so the agent fetched the issue again with `--json`.
- Got wrong: the say-it-back link in `.claude/skills` pointed to a path that didn't exist. The agent recreated it with the link script.
- Setup: `pnpm` didn't run, because mise had no version set for it, so the link script ran with `node`.
- Tests: none yet. No code has changed.

### Said by the group

- **How did you split the work at the keyboard?** The designer did everything.
- **What's one thing you'd keep?** (skipped)
