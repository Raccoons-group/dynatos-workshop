# Coding agents in GitHub Actions

Type: research (AFK)
Status: resolved
Blocked by: none

## Question

How can a coding agent run a repo skill on pull-request events in GitHub Actions? Options include `anthropics/claude-code-action`, Claude Code headless in a workflow, `openai/codex-action`, and the GitHub Copilot coding agent. For each:

- Triggers, for PRs from branches and from forks
- Permissions and secrets
- How it writes results back (commit to a branch, PR comment, artifact)
- Typical latency and cost per run
- Failure modes

Output: a recommendation for the live-deck pipeline, with a minimal workflow sketch.

## Answer

Full note with sources, comparison table and a workflow sketch: [research/agents-in-github-actions.md](../research/agents-in-github-actions.md). Versions checked 2026-10-20.

- **Use `anthropics/claude-code-action@v1` on `pull_request`.** Run with `prompt: /reporter` and `--json-schema`; the validated JSON comes back as a step output. On PR events the action loads `.claude/` and `CLAUDE.md` from the **base** branch, so a group's PR can't swap out the reporter skill.
- **Codex and Copilot don't fit.** `codex-action` needs an OpenAI or Azure key. Copilot automations need a Copilot plan, aren't versioned in git, and write back as PRs that wait for approval.
- **Recommended pipeline:**
  1. A read-only `report` job holds the key, builds the input from the diff and the working-out, and outputs JSON only (no shell, no write tools).
  2. A `publish` job with no key and `concurrency` `queue: max` commits `groups/<group>.json` and a history snapshot to an orphan `live-deck-data` branch, never to the groups' branches.
  3. The deck on the presenter laptop syncs that branch about every 10 s and re-renders on change.
  4. Local fallback: a coach runs the same skill with `claude -p` through the same prep and publish scripts.
- **Two hard limits.** A `pull_request` workflow doesn't run while the PR has a merge conflict. Anyone with write access can read the repo's secrets, so use a dedicated key with a spend limit and delete it afterwards.
- **Latency and cost are estimates, not sourced figures:** roughly 1.5–4 minutes from push to deck, and about $0.25 per run on Sonnet (cents on Haiku), so $3–15 for Day 1. The pipeline spike measures both.
- Outside the brief: GitHub Agentic Workflows (`gh-aw`, public preview) does the same read-only-agent pattern. The recommendation is to copy the pattern by hand this week rather than adopt the tool.
