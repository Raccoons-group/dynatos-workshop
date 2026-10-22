# Shared skills

Every tool reads skills from this folder except Claude Code. Claude Code gets a link to each skill in `.claude/skills/`, made by `pnpm install` and `pnpm skills:link`.

- One folder per skill, holding a `SKILL.md`.
- `name` is the folder name: lowercase letters and digits, joined by single hyphens, at most 64 characters.
- `description` says when to use the skill ("Use when …"), in at most 1,024 characters.
- Use only the portable frontmatter fields: `name`, `description`, `license`, `compatibility`, `metadata` and `disable-model-invocation`.
- Name other skills in prose ("use the `grilling` skill"), never as `/grilling` or `$grilling`: each tool invokes skills differently.

CI checks these rules with `pnpm skills:check`.

## Forked from mattpocock/skills

Twelve of these skills are adapted from [mattpocock/skills](https://github.com/mattpocock/skills) at tag [v1.3.1](https://github.com/mattpocock/skills/tree/v1.3.1) (commit `24fe0ef`, 4 Oct 2026), copyright (c) 2026 Matt Pocock, under the MIT licence in [LICENSE](LICENSE). Each one says so in its first line:

`grill-with-docs`, `grilling`, `domain-modeling`, `wayfinder`, `prototype`, `research`, `to-spec`, `to-tickets`, `implement`, `tdd`, `code-review` and `setup-matt-pocock-skills`.

What we changed, so they work the same in Claude Code, Codex and Copilot:

- Other skills are named in prose, never as a tool call or a `/name`.
- Sub-agents are optional: each skill that uses them says what to do inline when your tool can't run one.
- No `ready-for-agent` label. A ticket's state is a `Status:` line.
- Only portable frontmatter. The skills you invoke yourself keep `disable-model-invocation: true` and an `agents/openai.yaml` with `allow_implicit_invocation: false`, which Codex reads.
- No throwaway branches: prototypes and research notes go into the working-out folder.
- The glossary is `GLOSSARY.md` everywhere, and the skills read `docs/agents/` to find it, the tracker and the working-out folder.
- `implement` asks "test-first or test-after?", records the answer, and counts a slice done only when its acceptance examples are tests at the agreed seam, with characterization tests first on an existing rule. `to-spec` and `to-tickets` carry those acceptance examples.
- `code-review` appends each round to `review.md` under Act on, Consider, Noted and Dismissed, and stops after round 3.
- `tdd` and `setup-matt-pocock-skills` no longer point at skills we left out: `codebase-design` and `triage`.

## Our own

`read-issue`, `open-pr` and `how-we-worked` are new, each with a `TESTS.md`. `open-pr` wraps v1.3.1's `pr` skill under the same licence. Its [CREDITS.md](open-pr/CREDITS.md) also credits Humanlayer's `show-me`, where the summary visuals come from.
