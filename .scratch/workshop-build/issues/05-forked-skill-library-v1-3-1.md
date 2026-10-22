# 05: Forked skill library (v1.3.1)

**What to build:** Groups have Pocock's skills, ported to work in Claude Code, Codex and Copilot alike, in the shared skills folder.

**Blocked by:** 04

**Status:** done

Spec: [../spec.md](../spec.md)

- [x] `grill-with-docs`, `grilling`, `domain-modeling`, `wayfinder`, `prototype`, `research`, `to-spec`, `to-tickets`, `implement`, `tdd`, `code-review` and `setup-matt-pocock-skills` are copied from `mattpocock/skills` at tag v1.3.1. Each has a one-line attribution header, and the shared folder has the MIT licence and an attribution README.
- [x] Porting rules applied:
  - other skills are named in prose
  - sub-agents are optional, with an inline fallback
  - no `ready-for-agent` label
  - only the portable frontmatter fields (user-invoked skills keep `disable-model-invocation` and the Codex policy file)
  - prototypes and research go into the working-out folder, with no throwaway branches
  - the glossary file is `GLOSSARY.md` everywhere
- [x] `implement` asks "test-first or test-after?" and records the answer. A slice counts as done only when its acceptance examples are tests at the agreed seam, with characterization tests first when it touches an existing rule.
- [x] `code-review` appends each round to `review.md` under Act on, Consider, Noted and Dismissed, and stops after round 3.
- [x] `implement-spec`, `codebase-design`, `diagnosing-bugs`, `retro`, `ask-matt` and `triage` are absent.
- [x] The CI guard passes, and after linking, each skill is listed once in Claude Code.

## Done (22 Oct 2026)

- **Source:** a fresh clone of `mattpocock/skills` at tag v1.3.1 (commit `24fe0ef`, 4 Oct 2026). The local copies in `~/.claude/skills/` weren't used. Upstream v1.3.1 already says `GLOSSARY.md`, so nothing needed renaming.
- **Files:** the 12 skills in `.agents/skills/`, each with its supporting files and `agents/openai.yaml`. There's an MIT `LICENSE` (Matt Pocock's, verbatim), and a "Forked from mattpocock/skills" section in `.agents/skills/README.md` that lists the skills, the tag and commit, and what we changed. Each `SKILL.md` opens with "_Adapted from mattpocock/skills v1.3.1 (MIT)._"
- **Porting, beyond the rules:**
  - The skills find their config in `docs/agents/`: the tracker and working-out folder in `issue-tracker.md`, the glossary and ADRs in `domain.md`, and the base branch in `workshop.md` (which `code-review` suggests as its fixed point).
  - The prose for sub-agents is "if your agent can run a sub-agent …; otherwise inline, one after the other". It's in `grilling`, `research`, `code-review` and `wayfinder`.
  - Prototypes: a logic prototype lives in the working-out folder. A UI prototype runs in the app while it's judged, then its variants move into the working-out folder.
  - `implement` records the answer as a `Tests: test-first` or `Tests: test-after` line under the ticket's `Status:` line. It recommends an earlier ticket's answer but still asks. Then it ticks each acceptance example with the name of the test that proves it. It commits, runs `code-review` since the commit the ticket started from, fixes the Act on findings, and sets `Status: done`.
  - `to-spec` now lists the acceptance examples next to the agreed seams (user story 12), and `to-tickets` turns them into each ticket's checkboxes. A new ticket gets `Status: open`.
  - `code-review` writes the shape in `REVIEW.md`, which the reporter's `reviewFromMarkdown` in `scripts/reporter-input.mjs` reads. Each round is a bare `## Round <n>` heading, then a plain line with the date, tool, model and fixed point. The four bucket headings follow, all four every round, and an empty one stays empty. Each finding is one top-level `- ` bullet labelled Standards or Spec, and a dismissal carries its reason in its bullet. Run through the parser, the template counts as one round with findings 2/1/0/1. It counts the existing rounds first and refuses a fourth. It never posts on the PR. Its standards sources now include `REVIEW.md`, every `AGENTS.md` and the glossary.
  - `tdd` no longer calls `codebase-design`. `setup-matt-pocock-skills` drops the triage-label section and `triage-labels.md`, and the seeds' PR-triage flags. It also never creates a `CLAUDE.md`: it edits `AGENTS.md`, or creates one.
  - All files are formatted with Prettier. The `code-review` description quotes 'review since X' in single quotes, because Prettier's re-quoting would otherwise show up as `repo''s` in the guard's parser.
- **Verified:**
  - `pnpm skills:check` passes (12 shared skills).
  - `pnpm skills:link` linked all 12, linked 0 when run again, and the links are gitignored.
  - Claude Code 2.1.263 lists each of the 12 exactly once in its init event's `skills` and `slash_commands`. That holds with project settings only, and with user and project settings together.
  - A grep finds no `/name` skill calls, "Skill tool", `CONTEXT`, `ready-for-agent` or left-out skill names, and no throwaway branches.
- **For the coaches (not changed here):**
  - **Personal copies.** This machine's `~/.claude/skills/` has older Pocock copies under the same 12 names. §9 of the skill library sketch says a personal copy beats the repo's in Claude Code. On a coach machine, that means `/implement` in the demo would run the old skill and never ask "test-first or test-after?". Move them aside before the dry run.
  - **Review rounds.** `implement` runs `code-review` after each ticket, as the library table says. Each run is a round, so a group that builds two slices has used two of its three rounds before the review block. Its first round also creates `review.md`, which turns the wall's phase to Reviewing while the group is still building. Either accept that, or have `implement` skip its own review once rounds are running low. That's a decision for 07/08 and the agenda.
  - **Docs.** `docs/agents/issue-tracker.md` doesn't mention the new `Tests:` line yet. It's outside this ticket's files.
