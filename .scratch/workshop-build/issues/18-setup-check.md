# 18: Setup check

**What to build:** Before 09:33, each participant runs one command, sees exactly what's missing on their machine, and gets a hint for how to fix each item.

**Blocked by:** 04

**Status:** done

Spec: [../spec.md](../spec.md)

- [x] It reports Node, pnpm, the .NET SDK, `gh` sign-in and write access, the current branch against `docs/agents/`, any `CLAUDE.md` in a parent folder, and the Claude Code version (at least 2.1.277) when it's installed.
- [x] It warns about Pocock skills installed globally (they shadow the repo's in Claude Code) and about Visual Studio or Rider Copilot Chat (use Copilot CLI or VS Code instead).
- [x] Output is a clear pass or fail per line, with a fix hint.

## Done (22 Oct 2026)

- **Command:** `pnpm setup:check` runs `scripts/setup-check.mjs`, plain Node with no dependencies. It exits 1 on any failure; warnings don't fail it. Root `AGENTS.md` and `README.md` list it under Commands.
- **Lines, in order:**
  - Node 22+
  - pnpm, whose major must match `packageManager`
  - a .NET 10 SDK
  - `gh` signed in, then write access (`viewerPermission` admin, maintain or write)
  - the branch against `Base branch` and `Work branch`; on `main`, where Group is none, it warns instead
  - a `CLAUDE.md` in the repo or any folder above it
  - Claude Code 2.1.277+, skipped when `claude` isn't installed
  - a warning for skills in `~/.claude/skills` that share a name with one in `.agents/skills`
  - an always-on line steering Visual Studio and Rider Copilot Chat users to Copilot CLI or VS Code
- **Seam:** every command goes through one injectable `run`. The 17 tests in `scripts/test/setup-check.test.mjs` fake tool versions and auth states with it, and use temp folders for the repo, a folder above it, and the home folder. The keys come from the shared `parseWorkshopKeys` in `scripts/lib/workshop-keys.mjs`.
- **Windows:** commands run through a shell, so the `.cmd` shims for pnpm, gh and claude start. Exit code 9009 counts as not installed. This is untested on a Windows machine, so try it at the rehearsal.
- **Verified on Matthias's Mac:**
  - Node, pnpm and .NET 10 pass.
  - It fails on the missing `gh` and on Claude Code 2.1.263.
  - It warns about the branch (`main`) and about 12 shadowed skills: every forked skill also sits in `~/.claude/skills`.
