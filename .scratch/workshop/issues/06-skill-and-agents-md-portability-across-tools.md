# Skill and AGENTS.md portability across tools

Type: research (AFK)
Status: resolved
Blocked by: none

## Question

Participants bring Claude Code, OpenAI Codex, or GitHub Copilot (VS Code agent mode and the coding agent). Include OpenCode and Cursor if it's cheap. For each tool:

- Does it support the Agent Skills `SKILL.md` format?
- Which paths does it discover skills from?
- How is a skill invoked?
- Does it read `AGENTS.md`, `CLAUDE.md` or `.github/copilot-instructions.md`?

Output: a compatibility table, plus a recommended repo layout so that one set of skills and one context file work for every participant's tool.

## Answer

Full note with the compatibility table, a link-script sketch and 19 gotchas: [research/skill-portability.md](../research/skill-portability.md). Versions checked 2026-10-20: Claude Code 2.1.304, Codex 0.163.0, Copilot CLI 1.0.100, VS Code docs of 2026-10-14, OpenCode 1.19.3.

- **Every tool in scope supports `SKILL.md` and reads `AGENTS.md`.** Claude Code reads `AGENTS.md` natively since v2.1.277, but only when there is no `CLAUDE.md` in the working directory or any parent. So there is **one root `AGENTS.md` and no `CLAUDE.md` or `copilot-instructions.md`**. Copilot CLI loads all three at once and would double up.
- **No single skills folder works for every tool.** `.agents/skills` is read by Codex, Copilot (CLI, VS Code, cloud agent, Visual Studio 18.5+), OpenCode and Cursor, but not Claude Code. `.claude/skills` is read by everyone except Codex.
- **Recommended layout:** skills are canonical in `.agents/skills/<name>/SKILL.md`. Claude Code gets gitignored per-skill links in `.claude/skills/` from a Node `postinstall` script (symlinks on macOS/Linux, junctions on Windows). The Claude-only `reporter` skill is committed directly in `.claude/skills/`.
- **Invocation differs per tool.** Claude Code, Copilot and Cursor use `/name`, Codex uses `$name`, OpenCode uses its skill tool. So materials name skills in plain text. Every tool also auto-triggers on the `description`.
- **Frontmatter sticks to the strict spec.** `name` equals the folder name; `description` is at most 1024 characters. VS Code silently drops a skill with a bad name. `allowed-tools`, `context`, `paths`, `$ARGUMENTS` and `` !`cmd` `` are not portable.
- **Gotchas that matter here:**
  - Each tool's `/init` writes its own file (CLAUDE.md, `.github/…`).
  - Nested `AGENTS.md` files only load in some tools.
  - Names are case-sensitive on Linux CI.
  - **Visual Studio and JetBrains Copilot Chat ignore `AGENTS.md`.** That's relevant for a .NET team.
- **Unverified, check in the dry run:** duplicate listing in VS Code and Cursor; Windows junctions without admin rights; whether the VS Code Claude harness reads `AGENTS.md` and `.agents/skills`; whether Cursor reads `CLAUDE.md`.
