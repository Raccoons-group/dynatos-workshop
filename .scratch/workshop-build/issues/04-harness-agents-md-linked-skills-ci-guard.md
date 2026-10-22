# 04: Harness: one AGENTS.md, linked skills, CI guard

**What to build:** Every participant's tool reads the same root AGENTS.md. `pnpm install` makes the shared skills visible to Claude Code, and CI rejects anything that would break the cross-tool rules.

**Blocked by:** None (can start immediately).

**Status:** done

Spec: [../spec.md](../spec.md)

- [x] A root AGENTS.md following ticket 16's sketch, with an owner and a review date. There's no `CLAUDE.md` and no Copilot instructions file anywhere.
- [x] `docs/agents/` holds the tracker config (local markdown in the group's working-out folder, the spec as one file, tickets as one file each with a `Status:` line), the domain config (one context, the case), and the per-base keys (group, base, work branch, working-out, epic) with placeholders on `main`.
- [x] REVIEW.md, CODEOWNERS (coaches on the harness paths, advisory) and the AGENTS.md template of about 50 lines.
- [x] The link script links each shared skill folder into Claude Code's skills folder (symlinks, or junctions on Windows), and those links are gitignored. It adopts any real folder there other than `reporter` and `retrospective` by moving it into the shared folder and linking it back. It's idempotent, and it runs at `postinstall` and as `pnpm skills:link`.
- [x] The CI guard and its workflow fail on a `CLAUDE.md` or Copilot instructions file, a skill whose `name` isn't its folder name or isn't lowercase with single hyphens, a description over 1,024 characters, or a non-portable frontmatter field.
- [x] The link script and the guard are tested against temporary folders (seam 2).
- [x] The workshop glossary moves from the root `CONTEXT.md` to `GLOSSARY.md` in `.scratch/workshop/`, and the links to it are updated.

## Done (22 Oct 2026)

- **Files:** root `AGENTS.md`, `REVIEW.md`, `docs/agents/` (`workshop.md` holds the per-base keys as `Key: value` lines the scripts can parse; `issue-tracker.md`; `domain.md`), `docs/agents-md-template.md`, `.github/CODEOWNERS` (Sander's handle still a TODO), `.agents/skills/README.md`.
- **Scripts:** `link-skills.mjs` and `check-skills.mjs` are plain Node with no dependencies. They're tested in the new `@workshop/scripts` workspace package (`node --test`, 20 tests), which `pnpm test` runs through turbo.
- **Root scripts:** `postinstall` and `skills:link` link the skills; `skills:check` runs the guard. The `Guard` workflow runs the same check on every PR and on pushes to `main`. It hasn't run on GitHub yet, because nothing has been pushed since.
- **Verified locally:**
  - a frozen install
  - links gitignored, while `.claude/skills/reporter/` stays committable
  - stale links pruned
  - the guard fails on a `CLAUDE.md`
- **Portable frontmatter:** `name`, `description`, `license`, `compatibility`, `metadata` and `disable-model-invocation`. `allowed-tools` is rejected, following the porting rules.
- **Glossary:** the workshop glossary now lives at `.scratch/workshop/GLOSSARY.md`. The old links in tickets and assets pointed one level too shallow; they're fixed.
