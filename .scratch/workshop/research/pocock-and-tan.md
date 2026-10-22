# Matt Pocock and Lauren Tan: workflows, skills and teaching formats

Research for [issue 04](../issues/04-pocock-and-lauren-tan-workflows.md), done on 2026-10-20. I used primary sources: Pocock's `mattpocock/skills` repo, his AI Hero site and YouTube channel, and Lauren Tan's `pstack` plugin, its guide, and her own posts on X. Every claim links its source. Anything that rests on a secondary write-up is marked **(secondary)**, and anything I could not check is marked **(unverified)**. The source list with dates is at the bottom.

**About the wording.** Everything here is in my own words. Section 5 gives slide lines as attributed paraphrases plus one verbatim line. Check the source before you put any of them on a slide as a direct quote.

**About versions.** Both skill sets change weekly. The Pocock repo was at v1.3.1 (tagged 2026-10-04), with its last commit on 2026-10-19. pstack was at plugin version 0.15.29, with commits up to 2026-10-20. Re-check both the week of the workshop.

---

## TL;DR

- **Pocock teaches a pipeline of small composable skills, and the human makes the decisions.** The main flow is `/grill-with-docs` (or `/grill-me`), then `/to-spec`, then `/to-tickets`, then `/implement`, which drives `/tdd` and `/code-review`, and finally `/retro`. `/wayfinder` is a side on-ramp for foggy work that is too big for one session, and it hands off to `/to-spec`. It never builds anything itself. ([ask-matt](https://github.com/mattpocock/skills/blob/main/skills/engineering/ask-matt/SKILL.md), [to-spec docs](https://www.aihero.dev/skills-to-spec))
- **Lauren Tan is "poteto"**: React Compiler core team, formerly Meta, and the author of `pstack`. She built pstack while working at Cursor, and her GitHub now lists xAI. Pocock interviewed her on a livestream on 2026-10-02. Her thesis is "depth before parallelism": earn trust in one agent through verification, then fan out. ([GitHub](https://github.com/poteto), [pstack README](https://github.com/cursor/plugins/tree/main/pstack), [livestream](https://www.youtube.com/watch?v=MN9dGgmLyso))
- **They disagree on planning.** Pocock front-loads alignment: grilling, then a spec, then tickets with blocking edges. Tan ships no planning skill. She treats code as the most precise spec, and she has the agent settle open questions with prototypes instead of asking you. They agree on almost everything else:
  - Agents are amnesiac new hires.
  - Build in vertical slices and tracer bullets.
  - Test behaviour, not implementation.
  - Design it twice.
  - Turn repeated mistakes into checks rather than more prose.
  - Keep AGENTS.md small.
- **Formats.** Pocock teaches through a free repo, with a docs page for every skill, plus a newsletter, raw "watch me build" videos, livestream interviews, two-week async cohorts and a self-paced crash course. Tan teaches through the plugin itself: a ten-page guide of realistic prompts and pitfalls, an in-tool help router, X articles and a recorded talk. I found no course or workshop that she runs.
- **The strongest live material** is grilling with recommended answers, the demo test for vertical tickets (could you show something working once this ticket lands?), red-green at an agreed test seam, and prototypes behind a switcher instead of a debate. Two more come from the setup itself: cross-tool adversarial review (the participants' mixed tools give model diversity for free) and the `/retro` → `/correct` loop that turns a repeated mistake into a check. The last one fits the Day 2 skill lab.

---

## 0. Who is who (identity check)

**Matt Pocock.** He is the author of [`mattpocock/skills`](https://github.com/mattpocock/skills) (MIT) and runs [AI Hero](https://www.aihero.dev). His newsletter has about 60,000 developers, by the README's own count ([README](https://github.com/mattpocock/skills/blob/main/README.md)).

**Lauren Tan = "poteto".** Several first-party sources confirm this:

- Pocock's livestream description names his guest as Lauren Tan (poteto) ([YouTube, 2026-10-02](https://www.youtube.com/watch?v=MN9dGgmLyso)).
- pstack's `plugin.json` names the author as Lauren Tan ([plugin.json](https://github.com/cursor/plugins/blob/main/pstack/.cursor-plugin/plugin.json)).
- Her GitHub bio says she is a software engineer at xai-org and on the React Compiler core team ([github.com/poteto](https://github.com/poteto)).
- The pstack README says she has worked at Meta, Netflix and Cursor, and helps build React Compiler ([README](https://github.com/cursor/plugins/tree/main/pstack)).
- Her X article says she joined Cursor at the end of March 2026, having come from Meta, where Claude Code was taking off ([How I Use Cursor, X, 2026-05-25](https://x.com/poteto/article/2058975157503570132)).
- She also maintains the long-running `hiring-without-whiteboards` list ([github.com/poteto](https://github.com/poteto)).

**Employer: unclear, so leave it off the slides.** The README still says she ships "at Cursor". Her GitHub says xAI. Pocock's livestream title says "at SpaceX". Cursor's own pricing page now sells plans through X Subscription Corp and links "SpaceXSI" terms ([cursor.com pricing](https://cursor.com/pricing)), which fits Cursor now sitting in the SpaceX/xAI group. I did not find a primary statement that settles this. A safe slide line is: "React Compiler core team; built pstack while at Cursor".

---

## 1. Pocock's workflow end to end

### 1.1 The problem he frames it with

The README is organised around four failure modes, each paired with a classic book and a skill ([README](https://github.com/mattpocock/skills/blob/main/README.md)):

| # | Failure mode | His fix | Skills |
|---|---|---|---|
| 1 | The agent didn't do what I wanted (misalignment) | A grilling session before every change | `/grill-me`, `/grill-with-docs` |
| 2 | The agent is too verbose | A shared language, written to a glossary and ADRs | `/grill-with-docs`, `/domain-modeling` |
| 3 | The code doesn't work | Feedback loops: types, browser access, a red-green test loop, disciplined debugging | `/tdd`, `/diagnosing-bugs` |
| 4 | We built a ball of mud | Care about design every day: deep modules, test seams agreed up front | `/to-spec`, `/improve-codebase-architecture`, `/codebase-design` |

He positions this against frameworks that own the whole process (GSD, BMAD, Spec-Kit). His skills are meant to be small, composable and forkable instead ([README](https://github.com/mattpocock/skills/blob/main/README.md)).

### 1.2 The main flow, in order

From the router skill [`ask-matt`](https://github.com/mattpocock/skills/blob/main/skills/engineering/ask-matt/SKILL.md) and the [to-spec docs page](https://www.aihero.dev/skills-to-spec):

```
/setup-matt-pocock-skills            (once per repo: issue tracker, triage labels, where docs live)
        │
/grill-with-docs   (or /grill-me when there is no repo)      ← start here for any change
        │   └─ detour: question needs a runnable answer? /handoff → /prototype → /handoff back
        │
  multi-session build?
   ├─ no  → /implement right here, in the same context window
   └─ yes → /to-spec → /to-tickets → /implement per ticket (/clear between)
                                    └─ or /implement-spec (parallel subagents, one integration branch)
        │
  /implement drives /tdd at agreed seams, then /code-review, then commits
        │
  /pr shapes the PR body (model-invoked)
        │
  /retro: improve the agent's environment, not the code
```

**On-ramps that merge onto this flow** ([ask-matt](https://github.com/mattpocock/skills/blob/main/skills/engineering/ask-matt/SKILL.md)):

- `/wayfinder` is for a huge, foggy effort that one session cannot hold. When its map clears, it merges at `/to-spec`.
- `/triage` is for incoming issues that someone else wrote. Don't run it on tickets that `/to-tickets` produced.
- `/diagnosing-bugs` is for hard bugs. It refuses to theorise until it has one command that goes red on the bug.

**Context hygiene is part of the method** ([ask-matt](https://github.com/mattpocock/skills/blob/main/skills/engineering/ask-matt/SKILL.md)):

- Keep grilling, spec and tickets in one unbroken context window, so that each step builds on the same thinking.
- Start each `/implement` fresh.
- Stay inside the "smart zone", which he puts at about 150k tokens on frontier models. In [another post](https://www.aihero.dev/things-people-get-wrong-with-grill-me-and-grill-with-docs) he names roughly 120k as the start of the "dumb zone", so the two numbers differ.
- At a phase boundary, he gives five options, in order: continue, `/clear`, `/handoff`, subagent, `/compact`.

**This is his older "7 phases" made concrete.** In March 2026 he described seven phases ([My 7 Phases Of AI Development, updated 2026-03-16](https://www.aihero.dev/my-7-phases-of-ai-development)):

1. Idea, refined by grilling
2. Research (optional)
3. Prototype
4. PRD
5. Kanban board of tickets with blocking edges
6. Execution, at the time through Ralph loops
7. QA

His AI Hero docs pages still carry `phase-4`, `phase-5` and `phase-6` tags on `to-spec`, `to-tickets` and `tdd` ([to-spec](https://www.aihero.dev/skills-to-spec), [to-tickets](https://www.aihero.dev/skills-to-tickets), [tdd](https://www.aihero.dev/skills-tdd)).

### 1.3 The role of each skill

**User-invoked** skills run only when a human types them. They orchestrate, and they never call another user-invoked skill. **Model-invoked** skills hold reusable discipline, and the agent may reach for them itself ([README](https://github.com/mattpocock/skills/blob/main/README.md)).

| Skill (old name) | Invoked by | Role | Its key rule | Known failure modes, from his own docs |
|---|---|---|---|---|
| `setup-matt-pocock-skills` | user | One-time repo config: tracker (GitHub, GitLab, local `.scratch/` markdown or other), triage labels, domain-doc layout. Writes an `## Agent skills` block into the existing CLAUDE.md or AGENTS.md ([SKILL.md](https://github.com/mattpocock/skills/blob/main/skills/engineering/setup-matt-pocock-skills/SKILL.md)) | Never creates AGENTS.md when CLAUDE.md exists, or the other way round | (none listed) |
| `grilling` | model | The interview primitive behind grill-me, grill-with-docs, triage, wayfinder and improve-codebase-architecture ([SKILL.md](https://github.com/mattpocock/skills/blob/main/skills/productivity/grilling/SKILL.md)) | Map a design tree. Each round, ask every question whose prerequisites are settled, numbered, each with a recommended answer worded so that "yes" accepts it. Looking up facts is the agent's job, via subagents. Decisions belong to the human. Don't act until the human confirms shared understanding | Rounds replaced one-question-at-a-time in v1.2: 13 questions now land in about 3 rounds ([CHANGELOG](https://github.com/mattpocock/skills/blob/main/CHANGELOG.md)) |
| `grill-me` | user | A one-line wrapper that calls `grilling`, stateless ([SKILL.md](https://github.com/mattpocock/skills/blob/main/skills/productivity/grill-me/SKILL.md)). Use it where there is no repo (product owners, plans, writing) | It is his most popular skill. The original was a few sentences long ([post, 2026-03-23](https://www.aihero.dev/my-grill-me-skill-has-gone-viral)) | Users answer high-fidelity questions that need a prototype; the scope is too big; users stay passive; a weak model is used ([9 things, 2026-05-25](https://www.aihero.dev/things-people-get-wrong-with-grill-me-and-grill-with-docs)) |
| `grill-with-docs` | user | `grilling` + `domain-modeling`: the same interview, but it leaves `GLOSSARY.md` and ADRs behind ([SKILL.md](https://github.com/mattpocock/skills/blob/main/skills/engineering/grill-with-docs/SKILL.md)) | The default first step whenever you are in a repo ([ask-matt](https://github.com/mattpocock/skills/blob/main/skills/engineering/ask-matt/SKILL.md)) | Models often load `grilling` and skip `domain-modeling`. If the glossary is unchanged afterwards, that is what happened ([domain-modeling docs](https://www.aihero.dev/skills-domain-modeling)) |
| `domain-modeling` | model | Challenges terms against the glossary, sharpens vague words, tests them on edge-case scenarios, and checks claims against the code. It updates `GLOSSARY.md` inline and offers an ADR only when a decision is hard to reverse, surprising, and the result of a real trade-off ([SKILL.md](https://github.com/mattpocock/skills/blob/main/skills/engineering/domain-modeling/SKILL.md)) | The glossary holds terms only, never implementation detail | The glossary bloats into a spec. His docs say **skip the glossary on a one-day build** ([docs](https://www.aihero.dev/skills-domain-modeling)) |
| `wayfinder` (was `decision-mapping`) | user | Charts a foggy, multi-session effort as one map issue (`wayfinder:map`) with child **decision tickets**. Ticket types are grilling (HITL), prototype (HITL), research (AFK) and task. The map has four sections: Destination, Decisions so far, Not yet specified (the "fog of war"), and Out of scope ([SKILL.md](https://github.com/mattpocock/skills/blob/main/skills/engineering/wayfinder/SKILL.md)) | Plan, don't do. One ticket per session; research tickets are the exception. The map is an index, not a store. It hands off to `/to-spec` | Agents write product code inside the map. Sprawling maps fall into a waterfall: one user charted 27 tickets, and by ticket 13 the rest no longer made sense. The grilling is exhausting. Running parallel grilling tickets asks repeat questions. His advice: scope a map to one epic and prototype aggressively ([docs](https://www.aihero.dev/skills-wayfinder)) |
| `prototype` | model | Throwaway code to answer one design question: a single HTML file for logic or state, or several UI variants behind one route ([README](https://github.com/mattpocock/skills/blob/main/README.md)). Kept on a `prototype/<name>` branch as a primary source ([ask-matt](https://github.com/mattpocock/skills/blob/main/skills/engineering/ask-matt/SKILL.md)) | Use it for "high-fidelity" questions that grilling cannot settle ([9 things](https://www.aihero.dev/things-people-get-wrong-with-grill-me-and-grill-with-docs)) | (none listed) |
| `to-spec` (was `to-prd`) | user | Turns the current conversation into a spec issue. It does **no interview**; it synthesises what was already decided. First it sketches the **test seams** (prefer existing ones, as high up as possible, ideally one) and checks them with you. Template sections: Problem, Solution, a long list of user stories, Implementation decisions, Testing decisions, Out of scope ([SKILL.md](https://github.com/mattpocock/skills/blob/main/skills/engineering/to-spec/SKILL.md)) | No file paths or code snippets, except decision-rich prototype snippets | It labels the spec `ready-for-agent`, so AFK agents that poll that label try to build the whole spec. User stories fit refactors poorly. A large spec read back from the tracker gets truncated, so don't clear between `/to-spec` and `/to-tickets` ([docs](https://www.aihero.dev/skills-to-spec)) |
| `to-tickets` (was `to-issues` + `to-plan`) | user | Breaks a spec, plan or conversation into **tracer-bullet vertical slices**, each with **blocking edges**. It does prefactoring first, then quizzes you on granularity and edges before it publishes anything. Local tracker: one file per ticket at `.scratch/<feature>/issues/NN-slug.md`. Real tracker: native blocking links and sub-issues ([SKILL.md](https://github.com/mattpocock/skills/blob/main/skills/engineering/to-tickets/SKILL.md)) | Every ticket is demoable on its own and sized for one fresh context window. Wide refactors are the exception: they use expand, migrate, contract | Over-decomposition (twelve tickets for a three-line change) is the most-reported problem. Horizontal per-layer tickets: one team's 26-ticket layered stack needed about 20 agent runs per closed ticket. Acceptance criteria can pass before any work is done ([docs](https://www.aihero.dev/skills-to-tickets)) |
| `implement` | user | Builds one ticket or spec: it drives `/tdd` at pre-agreed seams, typechecks often, runs the full suite once, runs `/code-review`, then commits to the **current branch** ([SKILL.md](https://github.com/mattpocock/skills/blob/main/skills/engineering/implement/SKILL.md)) | Never reopens the plan | It does not close tickets or tick acceptance criteria. It creates no branch or PR. Parallel `/implement` sessions in **one checkout** corrupt each other's git state. `/code-review` can't see uncommitted work ([docs](https://www.aihero.dev/skills-implement)) |
| `implement-spec` (new in v1.3) | user | Builds a whole spec. It reads the tickets as a task graph, runs implementer subagents in their own worktrees across the ready frontier, merges onto one integration branch, then runs `/code-review` ([SKILL.md](https://github.com/mattpocock/skills/blob/main/skills/engineering/implement-spec/SKILL.md)) | He calls it the "agent loop". He recommends a deterministic script loop such as [Sandcastle](https://github.com/mattpocock/sandcastle) for most people ([v1.3 post](https://www.aihero.dev/skills-changelog-v13-implement-spec-pr-retro-and-glossary-md)) | The result is one big branch, and collisions move to merge time ([v1.3 post](https://www.aihero.dev/skills-changelog-v13-implement-spec-pr-retro-and-glossary-md)) |
| `tdd` | model | Rules for red-green in vertical slices: test through public interfaces, and **only at seams confirmed with the user**. Anti-patterns: implementation-coupled tests, tautological tests, horizontal slicing ([SKILL.md](https://github.com/mattpocock/skills/blob/main/skills/engineering/tdd/SKILL.md)) | Refactoring left the loop in June 2026 and moved to `code-review` ([docs](https://www.aihero.dev/skills-tdd)) | Users don't know which seam to pick. The agent writes code before the test anyway. Browser tests written first stall the loop. It can produce tautological tests for glue code ([docs](https://www.aihero.dev/skills-tdd)) |
| `codebase-design` | model | Vocabulary for deep modules: module, interface, depth, seam, adapter, leverage, locality. Includes the deletion test, the rule that one adapter is a hypothetical seam and two make it real, and a "design it twice" step with parallel subagents ([SKILL.md](https://github.com/mattpocock/skills/blob/main/skills/engineering/codebase-design/SKILL.md)) | It is a reference, not a process | Invoked alone, the agent invents a process and burns tokens. "Design it twice" assumes Claude Code's Agent tool, so it ports poorly to Codex ([docs](https://www.aihero.dev/skills-codebase-design)) |
| `code-review` | model | Two-axis review of the diff since a fixed point: Standards (repo standards plus a Fowler smell baseline) and Spec (does it implement the issue?). The two axes run in parallel subagents ([README](https://github.com/mattpocock/skills/blob/main/README.md)) | The reviewer, not the implementer, enforces coding standards ([retro](https://github.com/mattpocock/skills/blob/main/skills/engineering/retro/SKILL.md)) | (see the implement row) |
| `pr` (new in v1.3) | model | Shape of a PR body: a summary as the smallest visual that shows the change, before/after evidence, and a "merge danger" call (one-way or two-way door, plus blast radius) ([v1.3 post](https://www.aihero.dev/skills-changelog-v13-implement-spec-pr-retro-and-glossary-md)) | Evidence makes the agent run the extra test | (none listed) |
| `retro` (new in v1.3) | user | After a session, suggests changes to the agent's **environment**, not the code: navigation pointers, automated checks, coding standards, AGENTS.md health, tool economy, no-ops, information access ([SKILL.md](https://github.com/mattpocock/skills/blob/main/skills/engineering/retro/SKILL.md)) | Mechanical mistakes get a deterministic check. Judgement calls go into `CODING_STANDARDS.md`. Keep AGENTS.md to navigation pointers | He says not to automate it, because that produces false positives ([v1.3 post](https://www.aihero.dev/skills-changelog-v13-implement-spec-pr-retro-and-glossary-md)) |
| `ask-matt` | user | A router: tells you which skill or flow fits ([SKILL.md](https://github.com/mattpocock/skills/blob/main/skills/engineering/ask-matt/SKILL.md)) | Must read a skill's SKILL.md before it claims what the skill does | (none listed) |
| `to-questionnaire` | user | Turns a decision you can't make alone into a questionnaire for the one person who can. It grills you about what you are sending, not about the subject ([README](https://github.com/mattpocock/skills/blob/main/README.md)) | | Relevant for groups that need a product owner's answer |

**Renames worth knowing** ([CHANGELOG](https://github.com/mattpocock/skills/blob/main/CHANGELOG.md), [tags](https://github.com/mattpocock/skills/tags)):

- **v1.0 (2026-06-17):**
  - `diagnose` became `diagnosing-bugs`.
  - `write-a-skill` became `writing-great-skills`.
  - `codebase-design` and `domain-modeling` arrived.
- **v1.1 (2026-07-08):**
  - `to-prd` became `to-spec`.
  - `to-issues` and `to-plan` merged into `to-tickets`.
  - `decision-mapping` became `wayfinder` and graduated to the engineering bucket.
- **v1.2 (2026-08-05):**
  - `writing-great-skills` became `writing-for-agents`.
  - Grilling moved to asking in rounds.
- **v1.3 (2026-10-04):**
  - `CONTEXT.md` became `GLOSSARY.md`.
  - `implement-spec`, `pr` and `retro` arrived.
  - `resolving-merge-conflicts` was removed.

### 1.4 Supporting ideas he keeps repeating

- **Tracer bullets.** Agents "outrun their headlights" by building whole layers before testing the critical path. The fix is to force a thin end-to-end slice first ([Tracer Bullets, 2026-01-22](https://www.aihero.dev/tracer-bullets)).
- **Vertical TDD.** Writing all the tests first means testing imagined behaviour. Work one test, then one implementation ([TDD post, 2026-02-10](https://www.aihero.dev/skill-test-driven-development-claude-code)).
- **Deep, grey-box modules.**
  - You own the interface and the agent owns the implementation, with tests to keep it honest.
  - The codebase influences the agent's output more than the prompt or AGENTS.md does.
  - Source: [How To Make Codebases AI Agents Love, 2026-02-26](https://www.aihero.dev/how-to-make-codebases-ai-agents-love).
- **Keep CLAUDE.md or AGENTS.md almost empty.**
  - Never run `/init`.
  - Only include what is both undiscoverable and globally relevant.
  - Put steering into skills.
  - Source: [Never Run Claude /init, 2026-02-24](https://www.aihero.dev/never-run-claude-init).
- **Writing skills.** Agent docs need sharp context pointers (descriptions), progressive disclosure, clear completion criteria and "leading words". Hunt down no-ops sentence by sentence ([writing-for-agents](https://github.com/mattpocock/skills/blob/main/skills/productivity/writing-for-agents/SKILL.md)). He also posted a short called "Your skills are WAY TOO LONG" ([YouTube short, 2026-10-13](https://www.youtube.com/shorts/y81cjELJMI0)).
- **When not to grill.** One-shot small changes, grill medium ones, and use wayfinder for large ones ([YouTube short "When should you NOT use /grill-me?", 2026-10-16](https://www.youtube.com/shorts/k2zgcTDq4aQ), per its description).
- **Model choice.** Use a big model for grilling, because grilling leans on the model's parametric knowledge. A smaller model can implement, because implementation relies mostly on context ([9 things](https://www.aihero.dev/things-people-get-wrong-with-grill-me-and-grill-with-docs)).

### 1.5 Cross-tool fit (matters for the bring-your-own-tool rule)

The README gives install paths for all three tools participants bring ([README](https://github.com/mattpocock/skills/blob/main/README.md)):

- **Claude Code:** an official plugin.
- **Codex:** a plugin marketplace.
- **GitHub Copilot:** the CLI plugin marketplace, plus "Install Plugin From Source" in VS Code.
- **Others** (Gemini, Cursor, OpenCode and more): `npx skills`.

User-invoked skills set `disable-model-invocation: true`, and for Codex they also ship `agents/openai.yaml` with implicit invocation off ([CLAUDE.md](https://github.com/mattpocock/skills/blob/main/CLAUDE.md)). Some parts still assume Claude Code. One example is `codebase-design`'s parallel "design it twice" step ([docs](https://www.aihero.dev/skills-codebase-design)).

---

## 2. Lauren Tan's ideas

### 2.1 What she has published (all 2026)

| Date | What | Link |
|---|---|---|
| 2026-05-25 | X article "How I Use Cursor". It open-sources pstack and explains her thesis | https://x.com/poteto/article/2058975157503570132 |
| ongoing (commits to 2026-10-20) | `pstack` plugin: README, `/poteto-mode`, 23 playbooks, 24 principle skills, about 30 workflow skills (32 listed in the README), 2 subagents, a 10-page guide. MIT licence | https://github.com/cursor/plugins/tree/main/pstack |
| 2026-08-19 | X post: she shipped 1,000 PRs the month before through cloud agents, pstack and bot "routines" feeding her "outer loop" | https://x.com/poteto/status/2090141955695198633 |
| 2026-09-21 | X post with a 38-minute talk video, "how I shipped 2,500 PRs last month". It was originally meant for Cursor Compile London | https://x.com/poteto/status/2102050467505430555 |
| 2026-10-02 | Livestream with Matt Pocock, about 66 minutes: "LIVE: Poteto (creator of pstack) on shipping 1,000's of PR's a month at SpaceX" | https://www.youtube.com/watch?v=MN9dGgmLyso |

I could not watch the two videos or get transcripts for them. Their titles, dates and lengths are verified. What she says in them is **(unverified)** except where a secondary summary is cited.

Her PR counts are self-reported, and they are inconsistent. The September post says 2,500, while a summary of the talk says she cited about 2,000 ([redreamality, secondary](https://redreamality.com/blog/lauren-tan-poteto-trust-before-parallel/)). Don't put the numbers on a slide as fact.

### 2.2 Her core thesis

- **Depth before parallelism.** Running many agents you don't yet trust only produces slop faster and wastes tokens. Earn trust in one agent first, by giving it rigor and verification, and then parallelize ([X article](https://x.com/poteto/article/2058975157503570132)). The pstack tagline is the verbatim line in section 5 ([README](https://github.com/cursor/plugins/tree/main/pstack)).
- **Verification is the bottleneck.** Agents write code fast, but proving it correct is the hard part. A verification-capable agent is the precondition for any "software factory" ([X article](https://x.com/poteto/article/2058975157503570132), [guide: verify and ship](https://github.com/cursor/plugins/blob/main/pstack/docs/guide/06-verify-and-ship.md)).
- **Agents are new hires with permanent amnesia.** They are capable but forgetful. Onboard them with rules, skills, tools and memory, and turn every observed failure mode into a skill. She draws on her time as an engineering manager here ([X article](https://x.com/poteto/article/2058975157503570132)). Pocock uses the same metaphor ([Codebases post](https://www.aihero.dev/how-to-make-codebases-ai-agents-love)).
- **Smaller diffs, not more lines of code.** The goal is maximum impact with the least code. The "laziness protocol" biases towards deletion and the smallest change ([README](https://github.com/cursor/plugins/tree/main/pstack), [principle](https://github.com/cursor/plugins/blob/main/pstack/skills/principle-laziness-protocol/SKILL.md)).

### 2.3 How pstack works

- **One front door.** You type `/poteto-mode` plus a goal. It matches one of 23 playbooks and copies that playbook's steps verbatim into the todo list. It then calls the other skills as the steps need them, and names the principles that shaped each decision ([poteto-mode](https://github.com/cursor/plugins/blob/main/pstack/skills/poteto-mode/SKILL.md)). The playbooks include Investigation, Bug fix, Feature, Refactoring, Prototype, Eval, Babysit, Shipping, Autonomous run and Multi-phase plan.
- **A prompt is a goal plus a check.** A good prompt carries up to five parts ([guide 02](https://github.com/cursor/plugins/blob/main/pstack/docs/guide/02-poteto-mode.md)):
  - the goal
  - a done-check that can pass or fail
  - the proof you want to see
  - what you already know
  - real constraints, such as "repro first"

  Two things to leave out: the "how", and your own theory of the cause, because a stated guess narrows the agent's search. Never list skills in the prompt; the playbook sequences them.
- **Restate first.** For a noisy report, the first step is for the agent to restate the issue in its own words, so a misreading costs one message instead of one wrong fix. `/in-your-own-words` is that skill: a single sentence long ([guide 02](https://github.com/cursor/plugins/blob/main/pstack/docs/guide/02-poteto-mode.md), [skill](https://github.com/cursor/plugins/blob/main/pstack/skills/in-your-own-words/SKILL.md)).
- **Sharpen the prompt, not the scope.** `/sharpen` asks four things before rewriting your prompt ([skill](https://github.com/cursor/plugins/blob/main/pstack/skills/sharpen/SKILL.md)):
  - What would a top professional do here that you didn't ask for?
  - What raw material would they start from?
  - Which methods would they use?
  - What outside check would show the result is right?

  It leaves your own choices open.
- **No planning skill, on purpose.** She doesn't believe in planning, and treats code as the most precise spec. When she wants a plan, she asks for it only after the design has settled through prototypes. The plan is then small, verifiable PRs, each with its own proof ([README](https://github.com/cursor/plugins/tree/main/pstack), [guide 04](https://github.com/cursor/plugins/blob/main/pstack/docs/guide/04-design.md)).
- **Plan through code.** Never take the first design:
  - `/architect` grounds itself, then has competing sketches made of types, signatures and the caller's usage, and synthesises them. It requires at least two structurally different candidates.
  - `/arena` runs N parallel attempts at the same brief. A cross-model judge scores them, and the coordinator grafts the best parts of the losers into the chosen base.
  - The Prototype playbook builds throwaway variants behind one switcher and picks from screenshots or timings.
  - Sources: [architect](https://github.com/cursor/plugins/blob/main/pstack/skills/architect/SKILL.md), [arena](https://github.com/cursor/plugins/blob/main/pstack/skills/arena/SKILL.md), [prototype playbook](https://github.com/cursor/plugins/blob/main/pstack/skills/poteto-mode/playbooks/prototype.md).
- **Don't ask the human what a run can answer.** If a fork can be settled by running something (behaviour, timing, layout, performance), the agent prototypes it instead of asking. Questions are kept for genuine product or preference calls. For reversible work the agent proceeds and presents the result. It pauses only for irreversible actions: force-pushes, deploys, deleting data, customer messages ([poteto-mode](https://github.com/cursor/plugins/blob/main/pstack/skills/poteto-mode/SKILL.md), [never-block-on-the-human](https://github.com/cursor/plugins/blob/main/pstack/skills/principle-never-block-on-the-human/SKILL.md)).
- **Multi-model adversarial review.**
  - `/interrogate` sends the same diff to reviewers on different model families.
  - A finding raised independently by two models is the strongest signal.
  - Findings are sorted into four buckets: Act on, Consider, Noted, Dismissed. Each dismissal gets a reason.
  - It changes nothing automatically.
  - Don't point it at a plan with no code: reviewers then invent risks.
  - Sources: [interrogate](https://github.com/cursor/plugins/blob/main/pstack/skills/interrogate/SKILL.md), [guide 04](https://github.com/cursor/plugins/blob/main/pstack/docs/guide/04-design.md).
- **Prove it works.**
  - Verify against the real artifact, never a proxy, a self-report or "it compiles".
  - Script the check, so a reviewer can rerun it.
  - Every claim in the agent's reply carries its evidence or is labelled measured, inferred or guess.
  - `/create-verification-skill` writes a project-local skill that drives your app. It is built on a "feature map".
  - Sources: [prove-it-works](https://github.com/cursor/plugins/blob/main/pstack/skills/principle-prove-it-works/SKILL.md), [poteto-mode](https://github.com/cursor/plugins/blob/main/pstack/skills/poteto-mode/SKILL.md), [guide 06](https://github.com/cursor/plugins/blob/main/pstack/docs/guide/06-verify-and-ship.md).
- **A narrow TDD.** Her `/tdd` is for bug fixes that have a cheap local test path: a failing test first, then the fix. Skip it when the test path is expensive or unclear, because she prefers no new test over a bad one ([tdd](https://github.com/cursor/plugins/blob/main/pstack/skills/tdd/SKILL.md)). This is a sharp contrast with Pocock's feature-level, seam-agreed TDD. Her principle "test behavior, not implementation" matches his ([README principles table](https://github.com/cursor/plugins/tree/main/pstack)).
- **Encode lessons in structure.** `/correct` mines past commits, reverts and review comments for mistake classes; a class counts once it has happened twice. It fixes each class at the highest level that works ([correct](https://github.com/cursor/plugins/blob/main/pstack/skills/correct/SKILL.md), [guide 09](https://github.com/cursor/plugins/blob/main/pstack/docs/guide/09-make-it-yours.md)):
  1. architecture
  2. types
  3. a lint or CI check whose error message names the fix
  4. a test
  5. docs, last

  It proves each check fails on a real past mistake. It also keeps a table in the agent instruction file that pairs each rule with whatever enforces it. Human review is deliberately not on that list.
- **Earn trust before you loop.** Four conditions come before any autonomous loop ([guide 07](https://github.com/cursor/plugins/blob/main/pstack/docs/guide/07-overnight.md)):
  - You have done the task once by hand, or watched an agent do it.
  - The agent has your tools and signals.
  - Every stage proves its own work.
  - You have turned repeated failures into checks.

  Her "overnight contract" has four parts: the goal, the finish condition, the permissions, and an escape hatch. The run keeps a decision log you audit in the morning.
- **Make it yours.**
  - `/automate-me` mines your transcripts and drafts your own `<name>-mode` skill.
  - `/reflect` turns the lessons from one session into skill edits.
  - Skill changes are evaluated blind before they ship.
  - Start small: add a skill or a check only when the same failure shows up twice.
  - Sources: [guide 09](https://github.com/cursor/plugins/blob/main/pstack/docs/guide/09-make-it-yours.md), [reflect](https://github.com/cursor/plugins/blob/main/pstack/skills/reflect/SKILL.md).
- **Talk themes (secondary).** A summary of her September talk says she:
  - frames throughput as coming from trust;
  - ranks corrections from architecture down to human review;
  - designs the repo so the shortest path for an agent is also the correct one.

  ([redreamality, secondary](https://redreamality.com/blog/lauren-tan-poteto-trust-before-parallel/)). This is consistent with `/correct`'s framing, which tells the agent to assume every contributor copies the nearest example and takes the shortest path that compiles ([correct](https://github.com/cursor/plugins/blob/main/pstack/skills/correct/SKILL.md)).

### 2.4 Portability caveat

pstack is Cursor-first:

- Its defaults put Grok on code and Opus on judgment and prose ([poteto-mode](https://github.com/cursor/plugins/blob/main/pstack/skills/poteto-mode/SKILL.md)).
- Several steps depend on Cursor-only features, such as Bugbot, automations and cloud subagents.
- Claude Code installs a generated copy (added 2026-10-16) that skips the Cursor-only steps ([README](https://github.com/cursor/plugins/tree/main/pstack), [commits](https://github.com/cursor/plugins/commits/main/pstack)).
- For Codex and Copilot there is only a third-party port, [`michael-denyer/pstack-claude`](https://github.com/michael-denyer/pstack-claude). I have not evaluated it **(unverified)**.

The *small* skills are trivially portable as plain SKILL.md files: `/in-your-own-words`, `/sharpen`, `/correct`, and the principle skills.

### 2.5 Where Pocock and Tan agree and disagree

| Topic | Pocock | Tan |
|---|---|---|
| Upfront alignment | Grill before every change; the spec records decisions ([README](https://github.com/mattpocock/skills/blob/main/README.md)) | No planning skill; code is the most precise spec; prototype to answer questions ([README](https://github.com/cursor/plugins/tree/main/pstack)) |
| What to ask the human | Facts are the agent's job; every decision goes to the human, and the agent waits ([grilling](https://github.com/mattpocock/skills/blob/main/skills/productivity/grilling/SKILL.md)) | Facts and anything a run can answer are the agent's job. Only product and preference calls go to the human. Don't block on reversible work ([poteto-mode](https://github.com/cursor/plugins/blob/main/pstack/skills/poteto-mode/SKILL.md)) |
| Work breakdown | Tickets as tracer-bullet vertical slices with blocking edges ([to-tickets](https://github.com/mattpocock/skills/blob/main/skills/engineering/to-tickets/SKILL.md)) | Small verifiable units and stacked PRs, each ending in proof ([sequence-verifiable-units](https://github.com/cursor/plugins/tree/main/pstack)) |
| Tests | Red-green for features at seams agreed in the spec ([tdd](https://github.com/mattpocock/skills/blob/main/skills/engineering/tdd/SKILL.md)) | TDD for bug fixes with a cheap path; otherwise prove it on the real artifact ([tdd](https://github.com/cursor/plugins/blob/main/pstack/skills/tdd/SKILL.md)) |
| Design | Deep modules; design it twice ([codebase-design](https://github.com/mattpocock/skills/blob/main/skills/engineering/codebase-design/SKILL.md)) | Design it twice through `/architect` and `/arena`; prefer the deeper interface ([architect](https://github.com/cursor/plugins/blob/main/pstack/skills/architect/SKILL.md)) |
| Review | Two axes (Standards and Spec) in separate subagents ([README](https://github.com/mattpocock/skills/blob/main/README.md)) | Adversarial review across model families ([interrogate](https://github.com/cursor/plugins/blob/main/pstack/skills/interrogate/SKILL.md)) |
| Learning loop | `/retro`: mechanical issues become checks; AGENTS.md shrinks ([retro](https://github.com/mattpocock/skills/blob/main/skills/engineering/retro/SKILL.md)) | `/correct` and `/reflect`: the highest-level fix wins; docs come last ([correct](https://github.com/cursor/plugins/blob/main/pstack/skills/correct/SKILL.md)) |
| Autonomy | A deterministic loop (Sandcastle) or the `/implement-spec` agent loop; `/retro` stays human-in-the-loop ([v1.3 post](https://www.aihero.dev/skills-changelog-v13-implement-spec-pr-retro-and-glossary-md)) | Full autopilot playbooks and cloud agents running overnight, but only after the loop has earned trust ([guide 07](https://github.com/cursor/plugins/blob/main/pstack/docs/guide/07-overnight.md)) |
| Router skill | `/ask-matt` | `/poteto-help` |
| Ownership | Fork it; no new skills accepted upstream ([SCOPE](https://github.com/mattpocock/skills/blob/main/SCOPE.md)) | Fork it, or generate your own mode with `/automate-me` ([README](https://github.com/cursor/plugins/tree/main/pstack)) |

---

## 3. How they teach

### 3.1 Matt Pocock

- **A free repo, with docs as part of it.** Every promoted skill has a docs page at `aihero.dev/skills-<name>`. Each page has the same four sections, as the repo's CLAUDE.md requires ([CLAUDE.md](https://github.com/mattpocock/skills/blob/main/CLAUDE.md)):
  - What it does
  - When to reach for it
  - Common questions
  - It's working if

  The "Common questions" sections are mined from real user issues and are refreshingly candid about failures; see the wayfinder and to-tickets pages. The "It's working if" checklists are ready-made coach checkpoints ([wayfinder docs](https://www.aihero.dev/skills-wayfinder)).
- **A changelog as teaching.** Each release gets a post and a chaptered video that explain why something changed ([v1.3 post, 2026-10-05](https://www.aihero.dev/skills-changelog-v13-implement-spec-pr-retro-and-glossary-md), [v1.3 video, 2026-10-05](https://www.youtube.com/watch?v=BsJGo1wFTvQ)).
- **Raw, unscripted builds.** A full feature build on his own app (course-video-manager, more than 1,200 commits): grilling, then PRD, then issues, then AFK Ralph loops, then QA. He calls it a raw look at how he actually works ([post and video, 2026-03-20](https://www.aihero.dev/real-world-feature-build-with-claude-code)).
- **Livestream interviews** with practitioners: Uncle Bob ([2026-08-19](https://www.youtube.com/watch?v=zcLPGC-tvgk)) and poteto ([2026-10-02](https://www.youtube.com/watch?v=MN9dGgmLyso)). He also posts many shorts: twelve between 2026-10-08 and 2026-10-16 ([channel feed](https://www.youtube.com/feeds/videos.xml?channel_id=UCswG6FSbgZjbWtdf_hMLaow)).
- **Two-week async cohorts.** Claude Code for Real Engineers started 2026-03-30. AI Coding for Real Engineers started 2026-06-01 ([cohort 1](https://www.aihero.dev/cohorts/claude-code-for-real-engineers-2026-04), [cohort 2](https://www.aihero.dev/cohorts/ai-coding-for-real-engineers-m0k0w)).
  - **Format:**
    - A pre-course on Claude Code basics.
    - Each Monday, a week of lessons and coding exercises in a sandbox, with a course repo.
    - Six live office hours over three days, staggered across time zones, with recordings and transcripts.
    - A Discord.
  - **Order:**
    1. LLM constraints and subagents, before touching the tool.
    2. The explore/build/clear loop and the smart zone.
    3. Steering with AGENTS.md, skills and progressive disclosure.
    4. Planning with PRDs, multi-phase plans and tracer bullets.
    5. Feedback loops: green CI, TDD, a custom quality-bar skill, pre-commit hooks.
    6. Ralph, first human-in-the-loop, then AFK in a sandbox pulling from GitHub issues.
    7. When to bring humans back: research, prototyping, architecture.

    Sources: [teaser, 2026-03-11](https://www.aihero.dev/my-claude-code-cohort-a-teaser), [cohort 2](https://www.aihero.dev/cohorts/ai-coding-for-real-engineers-m0k0w).
  - He teaches in Claude Code, but says the principles transfer to Copilot, Cursor and other tools ([cohort FAQ](https://www.aihero.dev/cohorts/ai-coding-for-real-engineers-m0k0w)).
- **AI Coding Crash Course** (self-paced, updated 2026-08-18) ([page](https://www.aihero.dev/workshops/ai-coding-crash-course)):
  - About 60 lessons in 6 sections.
  - Each lesson has a video, a written guide with prompts to try, and a quiz.
  - Topics:
    - the smart and dumb zones
    - context management
    - compaction versus handoff
    - grilling
    - codebase exploration
    - AGENTS.md
    - skills
    - progressive disclosure
    - specs
    - decomposition into session-sized chunks
    - handoffs
    - subagents
  - It offers team licensing. The full section list is not public.
- **His pedagogy, in skill form.** `/teach` captures his teaching method ([teach](https://github.com/mattpocock/skills/blob/main/skills/productivity/teach/SKILL.md)):
  - a mission document;
  - short lessons, each with one tangible win, in the learner's zone of proximal development;
  - retrieval practice, spacing and interleaving;
  - each lesson points to the best primary source.

  His exercise format of problem, solution and explainer lives in `scaffold-exercises`, in the frozen `misc/` bucket ([misc README](https://github.com/mattpocock/skills/blob/main/skills/misc/README.md)).

### 3.2 Lauren Tan

- **The plugin is the curriculum.** A ten-page guide is meant to be read in order the first time ([guide](https://github.com/cursor/plugins/blob/main/pstack/docs/guide/README.md)):
  1. setup
  2. routing
  3. understand the code
  4. design
  5. build and clean
  6. verify and ship
  7. overnight runs
  8. principles
  9. make it yours
  10. recipes and pitfalls

  Each page is built from copyable, informal prompts, a mermaid diagram, an illustration, and one "Pitfall" box. The guide closes by saying habits come from use, not reading, and tells you to run one real task ([guide 10](https://github.com/cursor/plugins/blob/main/pstack/docs/guide/10-recipes-and-pitfalls.md)).
- **In-tool help.** `/poteto-help` answers a "which skill?" question and hands you a prompt to send, but it doesn't start the work ([guide](https://github.com/cursor/plugins/blob/main/pstack/docs/guide/README.md)).
- **Principle names as steering vocabulary.** The 24 principles have short names, such as "prove it works" or "laziness protocol". You redirect a drifting agent with a one-line prompt that names one ([guide 10](https://github.com/cursor/plugins/blob/main/pstack/docs/guide/10-recipes-and-pitfalls.md)). This is the same idea as Pocock's "leading words" ([writing-for-agents](https://github.com/mattpocock/skills/blob/main/skills/productivity/writing-for-agents/SKILL.md)).
- **Long-form writing and talks on X.** These are the 2026-05-25 article, the 2026-08-19 post, and the 2026-09-21 talk ([links in 2.1](#21-what-she-has-published-all-2026)).
- **Not found.** I found no course, cohort or hands-on workshop run by Tan. Her teaching is documentation-led and talk-led **(searched, nothing found)**.

### 3.3 What to borrow for a 1.5-day workshop

- **From Pocock: a skill per phase, each with its own success check.** His "It's working if" lists make natural coach checkpoints, including at the spec review checkpoint. ([to-spec docs](https://www.aihero.dev/skills-to-spec), [to-tickets docs](https://www.aihero.dev/skills-to-tickets))
- **From Pocock: honest failure-mode stories.** Teach the known ways each skill fails up front, the way his "Common questions" sections do. Examples: wayfinder writes code; to-tickets slices horizontally; implement doesn't close tickets.
- **From Pocock: the cohort order.** Constraints and context first, then steering, then planning, then feedback loops, then autonomy. Day 1's talk can follow that order.
- **From Tan: one front door and a prompt shape.** Goal, done-check, proof, what you know, constraints. Show it once and put it on a card.
- **From Tan: start small in the Day 2 skill lab.** Write a skill or a check only for a failure that happened twice, and prove that the check fails on the real past mistake ([guide 09](https://github.com/cursor/plugins/blob/main/pstack/docs/guide/09-make-it-yours.md), [correct](https://github.com/cursor/plugins/blob/main/pstack/skills/correct/SKILL.md)).

---

## 4. Ideas strong enough for a live demo or hands-on exercise

Ranked by fit with the case: a foggy epic, then spec, then tickets, then tests, then a PR, done by mixed-tool groups that include product owners.

1. **Grilling in rounds, with recommended answers (exercise, about 45 minutes per group).**
   - **What:** each group runs `/grill-me`, or `/grilling` plus `/domain-modeling`, on the case epic. The product owner answers the product questions.
   - **Why:**
     - It is Pocock's most popular skill, a few lines long, and works in every tool ([README](https://github.com/mattpocock/skills/blob/main/README.md), [grill-me](https://github.com/mattpocock/skills/blob/main/skills/productivity/grill-me/SKILL.md)).
     - The round format makes visible what is decided and what is still open ([grilling](https://github.com/mattpocock/skills/blob/main/skills/productivity/grilling/SKILL.md)).
     - Pocock says sessions often run about 45 minutes ([post](https://www.aihero.dev/my-grill-me-skill-has-gone-viral)), so budget for that.
   - **Teach alongside it:**
     - Low-fidelity versus high-fidelity questions: send the UI questions to a prototype.
     - Steer actively rather than passively.
     - Use a big model for grilling ([9 things](https://www.aihero.dev/things-people-get-wrong-with-grill-me-and-grill-with-docs)).
2. **"Skills can be one line" (a 3-minute live demo to open the skills chapter).**
   - **What:** run Tan's `/in-your-own-words`, which is one sentence ([skill](https://github.com/cursor/plugins/blob/main/pstack/skills/in-your-own-words/SKILL.md)), and then `/sharpen` on the epic prompt ([skill](https://github.com/cursor/plugins/blob/main/pstack/skills/sharpen/SKILL.md)).
   - **Why:**
     - It shows the anatomy of a SKILL.md with almost no text.
     - It catches misreadings before any code exists.
     - It is ideal for product owners.
   - **Hands-on variant:** every participant writes a one-sentence skill in the first hour.
3. **Vertical versus horizontal tickets (live demo and group checkpoint).**
   - **What:** run `/to-tickets` on a group's spec. At the quiz step, apply the demo test to each ticket: could you show working behaviour once it lands? Optionally contrast this with a plain "split this into tasks" prompt, which tends to produce one ticket per layer.
   - **Why:**
     - It is the rule people break most often.
     - The cost is concrete: about 20 agent runs per closed ticket when work is sliced by layer.
     - The blocking edges show the frontier, which groups of 3–4 can split between them.
     - Sources: [to-tickets docs](https://www.aihero.dev/skills-to-tickets), [to-tickets](https://github.com/mattpocock/skills/blob/main/skills/engineering/to-tickets/SKILL.md).
4. **Red-green at an agreed seam (live demo in .NET, then hands-on).**
   - **What:** in `/to-spec`, agree one test seam, for example an API endpoint or an application service. Then show `/tdd` stopping to name the seam, writing one failing test, and making it pass.
   - **What to show alongside it:**
     - a tautological test next to a real one;
     - renaming an internal method, which breaks nothing.
   - **Contrast with Tan:** for glue code she would rather add no test than a bad one.
   - **Why:** tests are part of the case brief. Pocock names good TDD as his most reliable lever on agent output quality, and both authors share the behaviour-not-implementation rule.
   - **Sources:** [tdd](https://github.com/mattpocock/skills/blob/main/skills/engineering/tdd/SKILL.md), [5 skills](https://www.aihero.dev/5-agent-skills-i-use-every-day), [Tan tdd](https://github.com/cursor/plugins/blob/main/pstack/skills/tdd/SKILL.md).
5. **Prototype instead of debate (a 10-minute live demo on the React side).**
   - **What:** take one UI question from the epic. Ask the agent for 2–3 variants behind one switcher, in a scratch folder, with screenshots.
   - **Why:**
     - Grilling cannot settle how a UI should feel. A prototype can.
     - Both authors push it hard: Pocock's wayfinder docs favour aggressive prototyping over planning, and Tan has a principle skill for building competing prototypes before committing.
     - It is visual, and fast enough for a demo.
   - **Sources:** [prototype playbook](https://github.com/cursor/plugins/blob/main/pstack/skills/poteto-mode/playbooks/prototype.md), [wayfinder docs](https://www.aihero.dev/skills-wayfinder), [9 things](https://www.aihero.dev/things-people-get-wrong-with-grill-me-and-grill-with-docs).
6. **Cross-tool adversarial review (hands-on, about 20 minutes, at the PR stage).**
   - **What:** before merge, review each group's PR with a different participant's tool, for example a Codex user reviewing a Claude Code PR. Use Pocock's two axes (Standards and Spec, against the group's spec) and Tan's triage buckets (Act on, Consider, Noted, Dismissed).
   - **Why:**
     - Tan's core claim is that a finding raised by two different models is the strongest signal. A bring-your-own-tool room gives model diversity for free.
     - It turns the mixed tools from a nuisance into a feature.
   - **Sources:** [interrogate](https://github.com/cursor/plugins/blob/main/pstack/skills/interrogate/SKILL.md), [Pocock README](https://github.com/mattpocock/skills/blob/main/README.md).
7. **A PR body with evidence (exercise).**
   - **What:** each group's PR follows the `/pr` shape: a smallest-visual summary, before/after evidence such as a red-then-green test or a screenshot, and a merge-danger call (one-way or two-way door, plus blast radius).
   - **Why:**
     - It matches the evidence-first ideas in both sets (Tan's prove-it-works principle, Pocock's before/after evidence).
     - It gives the live-deck reporter skill structured input to read.
   - **Sources:** [v1.3 post](https://www.aihero.dev/skills-changelog-v13-implement-spec-pr-retro-and-glossary-md), [prove-it-works](https://github.com/cursor/plugins/blob/main/pstack/skills/principle-prove-it-works/SKILL.md).
8. **From retro to a check (Day 2 skill lab).**
   - **What:** run `/retro` on a Day 1 session. Pick a mistake the agent made twice. Fix it at the highest level that works, using Tan's ladder:
     1. architecture
     2. types
     3. a lint or CI check whose error names the fix
     4. a test
     5. an AGENTS.md line, last

     Prove the check fails on the real past mistake.
   - **Why:**
     - The authors converge here almost word for word.
     - It produces a takeaway (a check or skill in the shared library) that outlives the workshop.
     - It teaches that AGENTS.md should shrink, not grow.
   - **Sources:** [retro](https://github.com/mattpocock/skills/blob/main/skills/engineering/retro/SKILL.md), [correct](https://github.com/cursor/plugins/blob/main/pstack/skills/correct/SKILL.md), [guide 09](https://github.com/cursor/plugins/blob/main/pstack/docs/guide/09-make-it-yours.md).

**Demo only, not a group exercise: wayfinder on this workshop's own map.**

- It explains the fog of war, decision tickets and the frontier, using an artifact the participants can see.
- Groups should not run wayfinder on a one-day epic. Pocock calls it the heaviest flow and for multi-session work only, and says to use grill-with-docs for anything that fits one session. He also warns about exhausting grilling and about agents building inside the map ([wayfinder docs](https://www.aihero.dev/skills-wayfinder), [ask-matt](https://github.com/mattpocock/skills/blob/main/skills/engineering/ask-matt/SKILL.md)).

---

## 5. Slide lines (attributed paraphrases plus one verbatim line)

**Verbatim (the one direct quote):**

> "if you want to go fast, go deep first." Lauren Tan, pstack README / "How I Use Cursor" (2026-05-25). https://github.com/cursor/plugins/tree/main/pstack

**Paraphrases.** Check the linked source before putting any of these in quotation marks.

| # | Line (paraphrase) | Who | Source |
|---|---|---|---|
| 1 | Grill before every change: align with the agent before it writes a line. | Pocock | https://github.com/mattpocock/skills/blob/main/README.md |
| 2 | A skill can be three sentences. The right words at the right moment beat length. | Pocock | https://www.aihero.dev/5-agent-skills-i-use-every-day |
| 3 | The spec is where you're going. The tickets are how you get there. | Pocock | https://www.aihero.dev/5-agent-skills-i-use-every-day |
| 4 | Writing all the tests up front tests what you imagine, not what the code does. | Pocock | https://www.aihero.dev/skill-test-driven-development-claude-code |
| 5 | Put a garbage codebase in front of an agent and you get garbage back. | Pocock | https://www.aihero.dev/5-agent-skills-i-use-every-day |
| 6 | Code is cheap to write now. Reading it is still expensive. | Pocock | https://www.aihero.dev/skills-changelog-v13-implement-spec-pr-retro-and-glossary-md |
| 7 | Spot a mistake, run a retro, and make that mistake impossible next time. | Pocock | https://www.aihero.dev/skills-changelog-v13-implement-spec-pr-retro-and-glossary-md |
| 8 | Agents are capable new hires who forget everything. They are very teachable. | Tan | https://x.com/poteto/article/2058975157503570132 |
| 9 | Fanning out agents you don't trust only speeds up the slop. | Tan | https://x.com/poteto/article/2058975157503570132 |
| 10 | Verification, not code generation, is the bottleneck. | Tan | https://x.com/poteto/article/2058975157503570132 |
| 11 | No planning skill by design: working code is the most precise specification. | Tan | https://github.com/cursor/plugins/tree/main/pstack |
| 12 | Hand the agent an outcome plus a test for "done", in plain words. | Tan | https://github.com/cursor/plugins/blob/main/pstack/docs/guide/README.md |
| 13 | A rule in a doc fails silently. Make it a type, a lint or a test instead. | Tan | https://github.com/cursor/plugins/blob/main/pstack/skills/correct/SKILL.md |

Lines 1–7 against 8–13 make a good "two schools" slide. Lines 7 and 13 make a good "they agree" slide.

---

## 6. Things that should change the workshop design

1. **`CONTEXT.md` versus `GLOSSARY.md`.**
   - **What changed:** Pocock's v1.3 (2026-10-04) renamed the domain-doc convention to `GLOSSARY.md`, and the skills now look only for the new name. A team that updates its skills before renaming the file gets a new, empty `GLOSSARY.md` next to the old one ([v1.3 post](https://www.aihero.dev/skills-changelog-v13-implement-spec-pr-retro-and-glossary-md)).
   - **Where we stand:**
     - This workshop repo uses `CONTEXT.md` (see `map.md` and `CONTEXT.md`).
     - The locally installed skill copies in `~/.agents/skills` are pre-v1.3: `domain-modeling` still references `CONTEXT.md`, and `implement-spec`, `pr` and `retro` are missing.
     - Participants who install fresh will get v1.3+.
   - **Action:** pin a version or rename, and say which in the setup round.
2. **Wayfinder doesn't fit group work on a 1.5-day case.** Pocock's own docs reserve it for multi-session efforts and admit it is exhausting. For the case epic, groups should use grill-with-docs then to-spec then to-tickets, and coaches demo wayfinder on the meta-map ([wayfinder docs](https://www.aihero.dev/skills-wayfinder)). His domain-modeling docs even say to skip the glossary on a one-day build ([docs](https://www.aihero.dev/skills-domain-modeling)). Decide whether the case's glossary step is worth its time.
3. **Parallel agents in one checkout break.**
   - Pocock's docs relay a field report of misplaced amends, lost stashes and commits on the wrong branch when several `/implement` sessions shared one checkout ([implement docs](https://www.aihero.dev/skills-implement)). Tan lists "parallel agents in one worktree" as a pitfall ([guide 10](https://github.com/cursor/plugins/blob/main/pstack/docs/guide/10-recipes-and-pitfalls.md)).
   - **Action:** with 3–4 people per group, give each person their own clone or worktree and branch per ticket.
4. **`/implement` commits to the current branch, opens no PR and doesn't close tickets** ([implement docs](https://www.aihero.dev/skills-implement)). The case ends in a PR, so the groups need an explicit branch-and-PR step, for example `/pr` or a line in the shared AGENTS.md template.
5. **The `ready-for-agent` label is a trap for CI agents.** `/to-spec` puts `ready-for-agent` on the spec itself, and AFK agents that poll that label try to build the whole spec ([to-spec docs](https://www.aihero.dev/skills-to-spec)). This matters for ticket 07 (coding agents in GitHub Actions) and the reporter pipeline.
6. **Test seams belong in the spec.** `/tdd` refuses to test at a seam nobody agreed, and the friction users report most is "which seam?" ([tdd docs](https://www.aihero.dev/skills-tdd)). Put "test seams agreed" on the spec review checkpoint checklist.
7. **Show both schools, not one gospel.**
   - Tan, a credible practitioner whom Pocock invited onto his channel, openly rejects upfront planning. Showing the contrast is more honest than a single method, and it supports the "make it yours" message of both authors and of the Day 2 skill lab.
   - Her full pstack is Cursor-first, and no participant brings Cursor. Port only her small skills and principles, and don't hand out pstack itself.
8. **Effort and verbosity.** Grilling with long questions is the top complaint about wayfinder. Pocock suggests a lower reasoning effort and a plain-language instruction ([wayfinder docs](https://www.aihero.dev/skills-wayfinder), ["Your effort level is STILL TOO HIGH", 2026-10-13](https://www.youtube.com/shorts/JgEsphDAXnY)). Warn participants before the grilling block.

---

## Unverified or open

- **The two videos.** I could not get transcripts of the Pocock–Tan livestream or Tan's September talk. Any claim about what was said in them is unverified. The redreamality summary is secondary.
- **Tan's PR counts.** They are self-reported and inconsistent (1,000 in July, about 2,000 or 2,500 in August).
- **Tan's current employer.** It is ambiguous between Cursor, xAI and SpaceX; see section 0.
- **The Crash Course.** Its exact section list is not public.
- **The third-party pstack port** for Codex and Copilot has not been evaluated.

---

## Sources

**Matt Pocock: repo** (fetched 2026-10-20; v1.3.1 tagged 2026-10-04; last commit 2026-10-19):

- README: https://github.com/mattpocock/skills/blob/main/README.md
- CHANGELOG: https://github.com/mattpocock/skills/blob/main/CHANGELOG.md
- Tags: https://github.com/mattpocock/skills/tags
- SCOPE: https://github.com/mattpocock/skills/blob/main/SCOPE.md
- CLAUDE.md: https://github.com/mattpocock/skills/blob/main/CLAUDE.md
- Skills: [ask-matt](https://github.com/mattpocock/skills/blob/main/skills/engineering/ask-matt/SKILL.md), [grilling](https://github.com/mattpocock/skills/blob/main/skills/productivity/grilling/SKILL.md), [grill-me](https://github.com/mattpocock/skills/blob/main/skills/productivity/grill-me/SKILL.md), [grill-with-docs](https://github.com/mattpocock/skills/blob/main/skills/engineering/grill-with-docs/SKILL.md), [domain-modeling](https://github.com/mattpocock/skills/blob/main/skills/engineering/domain-modeling/SKILL.md), [wayfinder](https://github.com/mattpocock/skills/blob/main/skills/engineering/wayfinder/SKILL.md), [to-spec](https://github.com/mattpocock/skills/blob/main/skills/engineering/to-spec/SKILL.md), [to-tickets](https://github.com/mattpocock/skills/blob/main/skills/engineering/to-tickets/SKILL.md), [implement](https://github.com/mattpocock/skills/blob/main/skills/engineering/implement/SKILL.md), [implement-spec](https://github.com/mattpocock/skills/blob/main/skills/engineering/implement-spec/SKILL.md), [tdd](https://github.com/mattpocock/skills/blob/main/skills/engineering/tdd/SKILL.md), [codebase-design](https://github.com/mattpocock/skills/blob/main/skills/engineering/codebase-design/SKILL.md), [retro](https://github.com/mattpocock/skills/blob/main/skills/engineering/retro/SKILL.md), [setup-matt-pocock-skills](https://github.com/mattpocock/skills/blob/main/skills/engineering/setup-matt-pocock-skills/SKILL.md), [writing-for-agents](https://github.com/mattpocock/skills/blob/main/skills/productivity/writing-for-agents/SKILL.md), [teach](https://github.com/mattpocock/skills/blob/main/skills/productivity/teach/SKILL.md), [misc README](https://github.com/mattpocock/skills/blob/main/skills/misc/README.md)

**Matt Pocock: AI Hero.** Dates are the page's `updatedAt`; publication dates are not exposed.

| Date | Page |
|---|---|
| 2026-01-22 | [Tracer Bullets](https://www.aihero.dev/tracer-bullets) |
| 2026-02-10 | [My Skill Makes Claude Code GREAT At TDD](https://www.aihero.dev/skill-test-driven-development-claude-code) |
| 2026-02-24 | [Never Run Claude /init](https://www.aihero.dev/never-run-claude-init) |
| 2026-02-26 | [How To Make Codebases AI Agents Love](https://www.aihero.dev/how-to-make-codebases-ai-agents-love) |
| 2026-03-11 | [My Claude Code Cohort - A Teaser](https://www.aihero.dev/my-claude-code-cohort-a-teaser) |
| 2026-03-16 | [My 7 Phases Of AI Development](https://www.aihero.dev/my-7-phases-of-ai-development) |
| 2026-03-16 | [5 Agent Skills I Use Every Day](https://www.aihero.dev/5-agent-skills-i-use-every-day) |
| 2026-03-20 | [Real-world feature build with Claude Code](https://www.aihero.dev/real-world-feature-build-with-claude-code) |
| 2026-03-23 | [My 'Grill Me' Skill Went Viral](https://www.aihero.dev/my-grill-me-skill-has-gone-viral) |
| 2026-03-27 | [Claude Code for Real Engineers cohort](https://www.aihero.dev/cohorts/claude-code-for-real-engineers-2026-04) (started 2026-03-30) |
| 2026-05-25 | [9 Things People Get Wrong With /grill-me and /grill-with-docs](https://www.aihero.dev/things-people-get-wrong-with-grill-me-and-grill-with-docs) |
| 2026-06-12 | [AI Coding for Real Engineers cohort](https://www.aihero.dev/cohorts/ai-coding-for-real-engineers-m0k0w) (started 2026-06-01) |
| 2026-08-18 | [AI Coding Crash Course](https://www.aihero.dev/workshops/ai-coding-crash-course) |
| 2026-08-24 | Skill docs pages: [wayfinder](https://www.aihero.dev/skills-wayfinder), [to-spec](https://www.aihero.dev/skills-to-spec), [to-tickets](https://www.aihero.dev/skills-to-tickets), [implement](https://www.aihero.dev/skills-implement), [tdd](https://www.aihero.dev/skills-tdd), [domain-modeling](https://www.aihero.dev/skills-domain-modeling), [codebase-design](https://www.aihero.dev/skills-codebase-design) |
| 2026-10-05 | [v1.3: /implement-spec, /pr, /retro, and GLOSSARY.md](https://www.aihero.dev/skills-changelog-v13-implement-spec-pr-retro-and-glossary-md) |

**Matt Pocock: YouTube:**

| Date | Video |
|---|---|
| 2026-08-19 | [LIVE: Uncle Bob on Software Fundamentals in the Age of AI](https://www.youtube.com/watch?v=zcLPGC-tvgk) |
| 2026-10-02 | [LIVE: Poteto (creator of pstack) on shipping 1,000's of PR's a month at SpaceX](https://www.youtube.com/watch?v=MN9dGgmLyso) (66 min) |
| 2026-10-05 | [New Skills! v1.3 brings /pr, /implement-spec, and /retro](https://www.youtube.com/watch?v=BsJGo1wFTvQ) |
| 2026-10-13 | Shorts: [Your skills are WAY TOO LONG](https://www.youtube.com/shorts/y81cjELJMI0), [Your effort level is STILL TOO HIGH](https://www.youtube.com/shorts/JgEsphDAXnY) |
| 2026-10-16 | Short: [When should you NOT use /grill-me?](https://www.youtube.com/shorts/k2zgcTDq4aQ) |

The channel feed is at https://www.youtube.com/feeds/videos.xml?channel_id=UCswG6FSbgZjbWtdf_hMLaow.

**Lauren Tan:**

- GitHub profile: https://github.com/poteto
- pstack (fetched 2026-10-20, v0.15.29):
  - README: https://github.com/cursor/plugins/tree/main/pstack
  - plugin.json: https://github.com/cursor/plugins/blob/main/pstack/.cursor-plugin/plugin.json
  - commits: https://github.com/cursor/plugins/commits/main/pstack
- pstack skills: [poteto-mode](https://github.com/cursor/plugins/blob/main/pstack/skills/poteto-mode/SKILL.md), [feature playbook](https://github.com/cursor/plugins/blob/main/pstack/skills/poteto-mode/playbooks/feature.md), [prototype playbook](https://github.com/cursor/plugins/blob/main/pstack/skills/poteto-mode/playbooks/prototype.md), [in-your-own-words](https://github.com/cursor/plugins/blob/main/pstack/skills/in-your-own-words/SKILL.md), [sharpen](https://github.com/cursor/plugins/blob/main/pstack/skills/sharpen/SKILL.md), [architect](https://github.com/cursor/plugins/blob/main/pstack/skills/architect/SKILL.md), [arena](https://github.com/cursor/plugins/blob/main/pstack/skills/arena/SKILL.md), [interrogate](https://github.com/cursor/plugins/blob/main/pstack/skills/interrogate/SKILL.md), [tdd](https://github.com/cursor/plugins/blob/main/pstack/skills/tdd/SKILL.md), [correct](https://github.com/cursor/plugins/blob/main/pstack/skills/correct/SKILL.md), [reflect](https://github.com/cursor/plugins/blob/main/pstack/skills/reflect/SKILL.md), [prove-it-works](https://github.com/cursor/plugins/blob/main/pstack/skills/principle-prove-it-works/SKILL.md), [never-block-on-the-human](https://github.com/cursor/plugins/blob/main/pstack/skills/principle-never-block-on-the-human/SKILL.md), [laziness-protocol](https://github.com/cursor/plugins/blob/main/pstack/skills/principle-laziness-protocol/SKILL.md)
- pstack guide: [index](https://github.com/cursor/plugins/blob/main/pstack/docs/guide/README.md), [02 routing](https://github.com/cursor/plugins/blob/main/pstack/docs/guide/02-poteto-mode.md), [04 design](https://github.com/cursor/plugins/blob/main/pstack/docs/guide/04-design.md), [06 verify](https://github.com/cursor/plugins/blob/main/pstack/docs/guide/06-verify-and-ship.md), [07 overnight](https://github.com/cursor/plugins/blob/main/pstack/docs/guide/07-overnight.md), [09 make it yours](https://github.com/cursor/plugins/blob/main/pstack/docs/guide/09-make-it-yours.md), [10 recipes and pitfalls](https://github.com/cursor/plugins/blob/main/pstack/docs/guide/10-recipes-and-pitfalls.md)
- X posts:

  | Date | Post |
  |---|---|
  | 2026-05-25 | [How I Use Cursor](https://x.com/poteto/article/2058975157503570132) (read through the fxtwitter API because x.com is paywalled to fetchers) |
  | 2026-08-19 | [1,000 PRs post](https://x.com/poteto/status/2090141955695198633) |
  | 2026-09-21 | [talk video post](https://x.com/poteto/status/2102050467505430555) |

**Secondary (used only where marked):**

- redreamality, "Trust First, Then Parallel" (a summary of the 2026-09-21 talk): https://redreamality.com/blog/lauren-tan-poteto-trust-before-parallel/
- Cursor pricing page (for the employer context): https://cursor.com/pricing
