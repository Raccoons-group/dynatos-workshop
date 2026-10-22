# Forkful workshop repo

A small food delivery app (`case/`) that groups extend during the workshop. Start your agent at the repo root.

On `main` only, `apps/deck` (the workshop's slide deck) and `.scratch/` (the coaches' planning) also exist. They belong to the coaches, so leave them alone.

## Commands

- `pnpm install`: installs everything and links the shared skills for Claude Code
- `pnpm setup:check`: checks your machine for the workshop, with a fix for each problem
- `pnpm dev`: runs the API and the web app
- `pnpm test`: runs every test suite (CI runs the same on every PR)
- `pnpm skills:link`: links the shared skills again after you add one
- `pnpm skills:check`: the cross-tool checks CI runs on skills and agent files

## Working on the case

Before you change anything in `case/`, read `case/AGENTS.md` and `case/GLOSSARY.md`.
If they don't exist yet, writing them is part of your job: start from `docs/agents-md-template.md`.

## Agent skills

Shared skills live in `.agents/skills/<name>/SKILL.md`. Create new ones there, never in `.claude/skills`, `.github/skills` or another tool's folder, then run `pnpm skills:link` so Claude Code sees them.

- `name` is the folder name: lowercase letters and digits, joined by single hyphens.
- Use only these frontmatter fields: `name`, `description`, `license`, `compatibility`, `metadata` and `disable-model-invocation`.
- Write the description as when to use the skill ("Use when …").

Invoke a skill by name: `/name` in Claude Code, Copilot and Cursor, and `$name` in Codex (pick it from the popup).

### Issue tracker

Local markdown in your group's working-out folder. See `docs/agents/issue-tracker.md`. Your group, branches and folder are in `docs/agents/workshop.md`.

### Domain docs

One context: the case. See `docs/agents/domain.md`.

## Rules

- Never create a `CLAUDE.md` and never run `/init`. Improve this file or `case/AGENTS.md` instead. CI fails on a `CLAUDE.md`.
- Open PRs with the `open-pr` skill, always into your group's base branch. Reviews follow `REVIEW.md`.

Owner: the coaches. Reviewed: before Day 1.
