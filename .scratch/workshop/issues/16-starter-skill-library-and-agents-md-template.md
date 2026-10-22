# Starter skill library and AGENTS.md template

Type: grilling (HITL)
Status: resolved
Blocked by: 04, 06, 08

## Question

Which skills ship in the repo for groups to use on Day 1? Candidates, adapted from Pocock's set and the colleague's toolkit: grilling, to-spec, to-tickets, tdd, code-review, and a GitHub-issue reader standing in for the Jira one. In which cross-tool layout?

What goes in the AGENTS.md template, and how does it fit with what the case leaves out on purpose, so that groups still create their own docs and context?

## Context from research

[Pocock and Lauren Tan workflows](04-pocock-and-lauren-tan-workflows.md):

- Groups should start from `/grill-with-docs`. `/wayfinder` is too heavy for a one-afternoon build; demo it on our own map only.
- `/implement` commits to the current branch and opens no PR, so the library needs an explicit branch-and-PR step.
- `/to-spec` labels the spec itself `ready-for-agent`. Watch that no CI agent tries to build a whole spec from that label.
- **Skills v1.3 renamed `CONTEXT.md` to `GLOSSARY.md`**, and fresh installs only look for the new name. Either pin a skills version or rename this repo's glossary.
- Present Tan's approach as a contrasting school and port her one-line principles. Don't hand out `pstack`; it's Cursor-first.

[Skill and AGENTS.md portability across tools](06-skill-and-agents-md-portability-across-tools.md):

- Recommended layout: skills canonical in `.agents/skills/`, plus gitignored per-skill links in `.claude/skills/` made by a `postinstall` script, and one root `AGENTS.md` with **no** `CLAUDE.md`. The Claude-only reporter skill lives directly in `.claude/skills/`.
- Refer to skills by name in plain text: `/name` and `$name` differ per tool.
- Visual Studio and JetBrains Copilot Chat ignore `AGENTS.md`. Check what IDEs Dynatos uses.

[Wider practitioner landscape and evidence](05-wider-practitioner-landscape-and-evidence.md):

- Keep the AGENTS.md template short: only what the agent can't infer, with an owner and a review cadence. 74% of committed agent-config files are never touched again.
- Present TDD as one option, not dogma. Pocock's "red-green at agreed seams" fits what nobody disputes: humans write acceptance examples, characterization tests come first on brownfield code, and the test author is separate from the implementer.
- Cheap review kit: REVIEW.md, a PR template with "how tested / how to revert", an AI reviewer pass on every PR (capped at about three rounds), CODEOWNERS on risky paths.

## Answer

Grilled with Matthias on 20 Oct 2026 in three rounds (Q1–Q21). Full sketch, with the library table, layout, porting rules, root AGENTS.md, template, REVIEW.md, PR template, CODEOWNERS and setup checks: [assets/skill-library-and-agents-md.md](../assets/skill-library-and-agents-md.md).

- **We fork Pocock's skills at v1.3.1 into `.agents/skills/`, with minimal edits and MIT attribution** (Q1). The local copies match v1.3.1 apart from the glossary rename, so the fork is small. We keep Pocock's names (Q10).
- **The Day 1 library** (Q2, Q18):
  - The main path: `read-issue` → `grill-with-docs` (the default start, with `grilling` and `domain-modeling`) → `to-spec` → `to-tickets` → `implement` (with `tdd`) → `code-review` → `open-pr`, plus `how-we-worked`.
  - `wayfinder` ships with the skills it depends on: `prototype`, `research` and `setup-matt-pocock-skills`.
  - New skills: `read-issue`, `open-pr` (which wraps v1.3.1 `pr`) and `how-we-worked`.
  - Left out: `implement-spec`, `codebase-design`, `diagnosing-bugs`, `retro`, `ask-matt`, `triage`.
- **Wayfinder is an option, not the default** (Q9). Kickoff recommends grill-with-docs. A group that picks wayfinder keeps the map to about 5 tickets and hands off to `to-spec` before the spec review checkpoint. **This amends** [Pocock and Lauren Tan workflows](04-pocock-and-lauren-tan-workflows.md)' "groups use grill-with-docs, not wayfinder".
- **Porting rules** (Q11):
  - Name other skills in prose.
  - Sub-agents are optional, with an inline fallback.
  - No `ready-for-agent` label.
  - Keep `disable-model-invocation` and `openai.yaml`, nothing else.
  - **No throwaway branches**: prototypes and research notes go into the working-out folder.
  - `GLOSSARY.md` everywhere.
  - A one-line attribution header in each forked skill.
- **Glossary filename** (Q3):
  - The skills use `GLOSSARY.md`, and groups write `case/GLOSSARY.md`.
  - At build time the workshop's own glossary moves from the root `CONTEXT.md` to `.scratch/workshop/GLOSSARY.md`, so group branches carry no glossary until the group writes one. That also avoids the clash on "participant".
- **Tracker** (Q4, Q21). It's local markdown, configured in `docs/agents/issue-tracker.md` and pointing at the group's working-out folder. The spec is one file, and the tickets are **one file per ticket** with a `Status:` line each, as upstream.
- **Nested `case/AGENTS.md`** (Q5). Everyone starts their agent at the repo root. Our root AGENTS.md says to read `case/AGENTS.md` and `case/GLOSSARY.md` before changing `case/`.
- **The AGENTS.md template** (Q6, Q15) is a skeleton at `docs/agents-md-template.md`, about 50 lines:
  - Headings: Commands, Where things are, Language, Rules the code doesn't tell you, How we test, Mistakes the agent made twice, and a rule→enforced-by table.
  - It ends with an owner and a review date.
  - The prompts nudge on purpose.
  - Our root AGENTS.md is the worked example.
- **Skills a group writes** (Q20) go in `.agents/skills/<name>/` on its branch. The rule is "create there, then run `pnpm skills:link`". `link-skills.mjs` adopts any real folder Claude creates in `.claude/skills/`, moving it to `.agents/skills/` and linking it back. `open-pr` and `how-we-worked` both run the link script first.
- **Tests** (Q14). A slice is done when its acceptance examples are automated tests at the agreed seam. Test-first through `tdd` is recommended, not required. Characterization tests come first when a slice touches an existing rule. `implement` asks "test-first or test-after?" and records the answer in the working-out.
- **The review kit** (Q8, Q16, Q19):
  - `REVIEW.md` sets the two axes and lists what a human always reads.
  - `code-review` runs in the group's own tool and appends each review round to `review.md` in the working-out (one section per round, headed Act on / Consider / Noted / Dismissed), stopping after round 3.
  - In the review block, another group's tool reviews the PR.
  - No CI reviewer: the Raccoons key stays with the reporter.
  - The PR template asks for what and why, how it's tested, how to revert, merge danger, review rounds and the tools used.
  - In CODEOWNERS the coaches own `.github/`, `.agents/`, `.claude/`, `scripts/`, `AGENTS.md` and `REVIEW.md`, and nobody owns `case/`.
- **`read-issue`** (Q12) uses `gh issue view --comments`. If that fails, it uses the agent's own GitHub tool, and failing that, it asks the group to paste the issue. There's no Jira variant on Day 1.
- **`open-pr`** (Q13) opens a draft PR early, after the first commit of slice 1, and updates it on every later push.
- **Visual Studio and JetBrains** (Q7). We don't know which IDEs Dynatos uses. This is an **open question for Dynatos**: "Who uses Visual Studio or Rider with Copilot Chat?" The setup instructions steer those people to Copilot CLI or VS Code. There's no `copilot-instructions.md` pointer.
- **Glossary.** Added **Skill library** and **Review round** to [GLOSSARY.md](../GLOSSARY.md) (Q17).

**Affects**

- [How groups work in the repo](13-how-groups-work-in-the-repo.md):
  - If `.scratch/` is stripped from group branches, strip only `.scratch/workshop/`. Or put the working-out folder outside `.scratch/`, since the groups' tracker writes there. Strip the moved workshop glossary along with it.
  - One checkout means no branch switching, so prototypes and research notes go into the working-out folder.
  - The working-out holds: a spec file, a tickets folder (one file per ticket), `review.md`, the how-we-worked note, and the test-first/test-after choice.
  - Group skills live in `.agents/skills/`, not in the working-out.
  - The PR template carries 13's required contents on top of the review fields.
  - `open-pr` reads the branch and base from `docs/agents/`, so 13's naming goes there.
  - CODEOWNERS only bites if the group base branches require code-owner review.
- [What the reporter sees and what the retrospective says](14-what-the-reporter-sees-and-what-the-retrospective-says.md):
  - The reporter should read **a tickets folder, not `tickets.md`**.
  - It should find **group skills as new folders under `.agents/skills/`, not in `work/<group>/skills/`**.
  - `review.md` matches 14's Q11 as agreed.
  - The test-first/test-after choice is in the working-out, so the retrospective can compare it.
  - The draft PR opens early, which matches 14's Q15.
- [Live-deck pipeline spike](15-live-deck-pipeline-spike.md): the reporter job installs with `pnpm install --ignore-scripts`, so a group's skill is never linked into `.claude/skills` in CI.
- [Agenda with timings and owners](17-agenda-with-timings-and-owners.md): the setup round gains the checks in the asset's §9. These are `gh` signed in, Claude Code ≥ 2.1.277, `npx`-installed Pocock copies moved aside, and Codex users picking from the `$` popup.

**Feeds the fog (nothing graduates yet)**

- *Day 2 skill lab:* porting `read-issue` to Jira is a candidate, since Dynatos works in Jira.
- *Client proposal:* the IDE question above.
- *Rehearsal and fallbacks:* the dry-run checks in the asset's §9: whether Claude Code picks up a new link mid-session, the adopt step, each skill listed once per tool, and `read-issue` without `gh`.

**Unverified:** whether Claude Code hot-loads a newly linked skill without a restart, and whether the cross-tool prose ("use the `grilling` skill") triggers reliably in Codex and Copilot. Both belong to the dry run.
