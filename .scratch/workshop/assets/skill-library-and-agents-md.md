# Skill library, AGENTS.md template and review kit: sketch

> Sketch for [Starter skill library and AGENTS.md template](../issues/16-starter-skill-library-and-agents-md-template.md). Matthias agreed all of it on 20 Oct 2026, over three grilling rounds (Q1–Q21 in the ticket's Answer). It's a plan, not the build: the skills, files and script are built from it.
>
> No spoilers. The case's planted names and rules stay in the [case brief](case-brief.md). Examples here use placeholders.
>
> "The working-out folder" means the group's folder that [How groups work in the repo](../issues/13-how-groups-work-in-the-repo.md) decides. The sketch for [What the reporter sees](../issues/14-what-the-reporter-sees-and-what-the-retrospective-says.md) assumes `work/<group>/`.

## 1. The Day 1 library

We fork Pocock's skills at tag v1.3.1 (4 Oct 2026) into `.agents/skills/` with minimal edits and MIT attribution, and add three skills of our own. Groups call skills by name. "Building block" means the agent calls it from another skill.

| Skill | Source | Called by | Role on Day 1 |
| - | - | - | - |
| `read-issue` | new (stands in for the colleague's `read-jira-ticket`) | group | Reads the epic issue and its comments. Tries `gh issue view <n> --comments` first, then the agent's own GitHub tool, then asks the group to paste it. Reads it whole, separates facts from open questions, makes the decisions explicit, and hands off to grilling |
| `grill-with-docs` | v1.3.1 | group | **The default start**: `grilling` plus `domain-modeling`. Leaves `case/GLOSSARY.md` behind |
| `grilling` | v1.3.1 | building block | Interview in rounds, each question with a recommended answer |
| `domain-modeling` | v1.3.1 | building block | Glossary and ADRs. `docs/agents/domain.md` points it at `case/` |
| `wayfinder` | v1.3.1 | group (optional) | The multi-session map. Coaches demo it on this workshop's own map. A group that picks it keeps the map to about 5 tickets and hands off to `to-spec` before the spec review checkpoint |
| `prototype` | v1.3.1 | building block (wayfinder) | Throwaway code that answers one question; it lives in the working-out folder |
| `research` | v1.3.1 | building block (wayfinder) | Primary-source notes on one question; they live in the working-out folder |
| `to-spec` | v1.3.1 | group | A spec file with the test seams agreed |
| `to-tickets` | v1.3.1 | group | Vertical slices with blocking edges, **one file per ticket**, each with a `Status:` line |
| `implement` | v1.3.1 | group | Builds one ticket. It asks "test-first or test-after?" and writes the answer into the working-out. A slice is done only when its acceptance examples are automated tests at the agreed seam. Characterization tests come first when it touches an existing rule. Then it runs `code-review` and commits |
| `tdd` | v1.3.1 | building block | Red-green at agreed seams. Recommended, not required |
| `code-review` | v1.3.1 | group / building block | Two axes (Standards, Spec). It appends each round to `review.md` in the working-out: one section per round, headed Act on / Consider / Noted / Dismissed. It stops after round 3 |
| `open-pr` | new, wrapping v1.3.1 `pr` (credit: Humanlayer "show-me") | group | Runs `pnpm skills:link`, then commits the working-out and pushes. It opens a **draft PR early** (after the first commit of slice 1) and updates it on later pushes. The body follows the PR template, with `pr`'s summary, evidence and merge-danger shape. Without `gh`, it prints the compare URL |
| `how-we-worked` | new; what it writes is ticket 14's call | group | Drafts the how-we-worked note before every push. Runs `pnpm skills:link` first |
| `setup-matt-pocock-skills` | v1.3.1 | nobody on Day 1 | Already configured here. It ships because the other skills name it as their fallback, and Dynatos needs it to point the library at Jira |

**Not in the library:**
- `implement-spec`: it builds the whole spec through subagents, which works against "ship slice 1".
- `codebase-design`: used on its own, it burns tokens.
- `diagnosing-bugs`: the case has no planted bug.
- `retro`: Day 2.
- `ask-matt`, `triage`.
- The `reporter` and `retrospective` skills: Claude-only coach tools in `.claude/skills/` (tickets 07 and 14).

**Names.** We keep Pocock's names. Section 9 deals with participants who already have his skills installed.

## 2. Layout

The layout from ticket 06, plus this ticket's decisions.

```text
AGENTS.md                      # ours: how agents work in this repo (section 4)
REVIEW.md                      # what a reviewer, human or agent, checks (section 6)
docs/agents/issue-tracker.md   # local-markdown tracker in the working-out folder
docs/agents/domain.md          # single context: case/GLOSSARY.md + case/docs/adr/
docs/agents-md-template.md     # the AGENTS.md template (section 5), also a takeaway
.agents/skills/<name>/         # canonical, committed; LICENSE + attribution in .agents/skills/README.md
.claude/skills/<name>          # generated links, gitignored
.claude/skills/reporter/       # real folder, committed (ticket 07)
scripts/link-skills.mjs        # `postinstall` and `pnpm skills:link`
.github/pull_request_template.md
.github/CODEOWNERS
case/                          # no AGENTS.md, GLOSSARY.md or ADRs: groups write them
```

- No `CLAUDE.md`, no `.github/copilot-instructions.md`, and no root glossary on group branches.
- At build time the workshop's own glossary moves from the root `CONTEXT.md` to `.scratch/workshop/GLOSSARY.md`.
- Everyone starts their agent at the repo root.
- **What `link-skills.mjs` does:**
  - It links every `.agents/skills/<name>` into `.claude/skills/<name>`.
  - It **adopts** strays. A real folder in `.claude/skills/` other than `reporter` (Claude's own "make a skill" flow writes there) is moved to `.agents/skills/` and linked back. That way the gitignore never swallows a group's skill.
  - It's idempotent, and safe to run before every push.
- **Skills a group writes** go in `.agents/skills/<name>/` on the group's branch. The reporter finds them as new folders under `.agents/skills/` in the PR diff.

## 3. Porting rules for the forks

1. **Name other skills in prose.** Write "use the `grilling` skill", never "Call the Skill tool" or `/grilling`.
2. **Make sub-agents optional.** Write "if your agent can run a sub-agent, …; otherwise do it inline, one after the other". This applies to `grilling`, `research`, `code-review` and `wayfinder`.
3. **No `ready-for-agent` label.** Status is a `Status:` line in the ticket file.
4. **Keep the frontmatter portable.** User-invoked skills keep `disable-model-invocation: true` and their `agents/openai.yaml` with `allow_implicit_invocation: false`. Leave out every other extension field.
5. **No throwaway branches.** Wayfinder's research notes and prototypes go into the working-out folder. One computer means one checkout, so the agent never switches branch mid-afternoon.
6. **One glossary name: `GLOSSARY.md`.** For several contexts, use `GLOSSARY-MAP.md`.
7. **Attribution.** Each forked skill gets a short header line: "Adapted from mattpocock/skills v1.3.1 (MIT)".

## 4. Root `AGENTS.md`: sketch

This is our file, and it's the worked example of the template in section 5.

```markdown
# Forkful workshop repo

A small food delivery app (`case/`) that groups extend during the workshop, plus the workshop's
own deck (`apps/deck`). Start your agent at the repo root.

## Commands
- `pnpm install`: also links the shared skills for Claude Code
- `pnpm dev`: runs the API and the web app
- `pnpm test`: runs both test suites (CI runs the same on every PR)

## Working on the case
Before you change anything in `case/`, read `case/AGENTS.md` and `case/GLOSSARY.md`.
If they don't exist yet, writing them is part of your job: start from `docs/agents-md-template.md`.

## Agent skills
Shared skills live in `.agents/skills/<name>/SKILL.md`. Create new ones there, never in
`.claude/skills`, `.github/skills` or another tool's folder, then run `pnpm skills:link` so
Claude Code sees them. `name` = folder name: lowercase, digits, single hyphens.
Invoke: `/name` in Claude Code, Copilot and Cursor; `$name` (pick it from the popup) in Codex.

### Issue tracker
Local markdown, see `docs/agents/issue-tracker.md`.

### Domain docs
One context, the case: see `docs/agents/domain.md`.

## Rules
- Never create a `CLAUDE.md` and never run `/init`. Improve this file or `case/AGENTS.md` instead.
- Open PRs with the `open-pr` skill. Reviews follow `REVIEW.md`.

Owner: the coaches. Reviewed: before Day 1.
```

## 5. The AGENTS.md template: what groups copy into `case/AGENTS.md`

It's a short skeleton at `docs/agents-md-template.md`, kept as a takeaway. The guidance lines are comments that groups replace or delete. The cap is about 50 lines. The "Language" and "Rules" prompts nudge on purpose: they're good practice anywhere, and the group still has to find the drift itself.

```markdown
<!-- Only what an agent can't work out from the code in a minute. Delete any heading you can't fill. -->
# <app name>

<!-- One line: what this app is, and for whom. -->

## Commands
<!-- Exact commands: run, test everything, run one test, typecheck or lint. -->

## Where things are
<!-- Only the non-obvious pointers: "ordering rules live in …", "the seed data is in …". -->

## Language
<!-- One line: "Use the terms in GLOSSARY.md. Where the code says X, the domain says Y." -->

## Rules the code doesn't tell you
<!-- Invariants and business rules, each with where it's enforced. Mark the ones no test covers yet. -->

## How we test
<!-- Which seams we test at, where the tests live, what a good test looks like here. -->

## Mistakes the agent made twice
<!-- Add a line only after the second time. Better still, turn it into a check and link the check. -->

| Rule | Enforced by |
| - | - |
<!-- Each rule above that a test, type or CI check enforces. A rule with no enforcer is a candidate for one. -->

Owner: <name>. Next review: <date>.
```

## 6. `REVIEW.md`: sketch

```markdown
# Reviewing a PR here

Every PR is reviewed on two axes. Keep them separate.
- **Spec**: does it do what the spec and the ticket's acceptance examples say? Is anything missing or added?
- **Standards**: does it follow `case/AGENTS.md`, use the glossary's names, and test at the agreed seam?
  Are the tests real? A tautological test or one coupled to the implementation counts as a finding.

**AI review.** Run the `code-review` skill. It appends each review round to `review.md` in your
working-out: one section per round, with the findings under Act on, Consider, Noted, and Dismissed (each with a reason).
After round 3, stop: whatever is still open goes to a human.

**What a human always reads:** schema changes and migrations, anything about money (fees, minimums),
deletes, and changes to `.github/`, `.agents/` or `AGENTS.md`.
```

## 7. PR template: sketch

Ticket 13 adds what a group PR must contain (the working-out, the branch). This sketch covers the review fields.

```markdown
## What and why
<!-- Smallest visual that shows the change. Link the spec and the ticket(s). -->

## How it's tested
<!-- Evidence: the test names, red then green, a screenshot. Which acceptance examples are now tests? -->

## How to revert
<!-- One line. -->

## Merge danger
<!-- One-way or two-way door? Blast radius? -->

## Review
- AI review rounds: <n> of 3 (details in `review.md`)
- Tool(s) used: <Claude Code / Codex / Copilot / …>
```

## 8. `CODEOWNERS`: sketch

The coaches own the shared harness. Nobody owns `case/`. It only bites if the group base branches require code-owner review, which is ticket 13's call. Otherwise it just auto-requests a coach.

```text
/.github/      @<matthias> @<sander>
/.agents/      @<matthias> @<sander>
/.claude/      @<matthias> @<sander>
/scripts/      @<matthias> @<sander>
/AGENTS.md     @<matthias> @<sander>
/REVIEW.md     @<matthias> @<sander>
```

On group branches, `/.agents/` will also hold the group's own skills. If code-owner review is required there, a coach review on a new group skill comes with it, which is fine.

## 9. Setup round and dry run

**Setup round** (per group computer and per participant tool):

- `gh` is installed and signed in on each group's computer (`read-issue` and `open-pr` need it; each has a fallback).
- Claude Code is at least 2.1.277 (so it reads AGENTS.md natively), and no `CLAUDE.md` sits in a parent folder.
- Anyone who installed Pocock's skills with `npx skills -g` into `~/.claude/skills` moves them aside for two days: in Claude Code a personal copy beats the repo's. Plugin installs are fine, because they're namespaced.
- Codex users pick skills from the `$` popup. Typing `$name` selects nothing when two skills share a name.
- Anyone on Visual Studio or Rider Copilot Chat switches to Copilot CLI or VS Code. Those two IDEs ignore AGENTS.md.

**Dry run** (adds to the portability checklist from ticket 06):

- Does Claude Code pick up a link that `pnpm skills:link` creates mid-session, or does it need a restart?
- Does the adopt step work when Claude creates a skill in `.claude/skills/`?
- Is each library skill listed exactly once in each tool, and does `read-issue` work with and without `gh`?

**Reporter job** (ticket 15): install with `pnpm install --ignore-scripts`, so a group's skill is never linked into `.claude/skills` in CI.

## 10. Open question for Dynatos

- Who uses Visual Studio or Rider with Copilot Chat? Ask it in this week's mail ([Client proposal](../map.md) fog).
