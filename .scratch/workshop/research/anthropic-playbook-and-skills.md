# Anthropic's AI-native SDLC playbook and Agent Skills guidance

Research for [issue 03](../issues/03-anthropic-ai-native-sdlc-playbook-and-skills-guidance.md). Researched 2026-10-20 against first-party Anthropic sources only (claude.com, claude.dev, anthropic.com, platform.claude.com and code.claude.com docs, github.com/anthropics, and agentskills.io, the open standard Anthropic published). Every claim cites its URL. The source list with publication dates is at the bottom.

**About the wording.** Everything here is summarised in my own words. Section 4 gives slide framings as attributed paraphrases plus one verbatim line. Check the source before you put any of them on a slide as a direct quote.

---

## TL;DR

- **The playbook is a loop of six stages, each joined to the next by a committed Markdown artifact:** `intent.md` → `spec.md` → `plan.md` → diff + tests → PR + review findings → incident record → a new `intent.md`. The chain of commits doubles as the audit trail. Humans review at the gates; they no longer start each stage. ([playbook](https://claude.com/resources/articles/the-ai-native-sdlc-playbook))
- **Each stage contains "plays".** Every play lists its prerequisites, steps, governance, and a leading and a lagging metric, and most of those metrics can be read straight from git, PR or CI data. The playbook itself makes no measured outcome claims. Its numbers are targets, such as "weeks to hours" for intent capture or "minutes" to first review. The hard numbers come from companion Anthropic articles and are vendor-internal. ([playbook](https://claude.com/resources/articles/the-ai-native-sdlc-playbook))
- **Skills are institutional knowledge as version-controlled folders, loaded through progressive disclosure.** The three levels are about 100 tokens of metadata always loaded, a SKILL.md body under 5k tokens or 500 lines loaded when the skill triggers, and resources and scripts loaded only when needed. The `description` decides when a skill fires, so it has to state trigger conditions. ([overview](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/overview), [best practices](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices))
- **Anthropic calls a skill an advisory control.** A rule that must always hold needs a hook or a CI or review check behind it. Skills need their own evals: trigger tests (should and should not fire), and a comparison of the same task with and without the skill. ([playbook](https://claude.com/resources/articles/the-ai-native-sdlc-playbook), [Claude Code skills docs](https://code.claude.com/docs/en/skills), [skill-creator post](https://claude.com/resources/articles/improving-skill-creator-test-measure-and-refine-agent-skills))
- **Verification is the strongest lever.** Inside Anthropic, verification skills had the largest measurable effect on output quality ([How we use skills](https://claude.dev/blog/lessons-from-building-claude-code-how-we-use-skills/)). The recommended path is to turn your manual checks into skills, then move each one from standalone to embedded to chained to running on every PR ([verification loops](https://claude.com/resources/articles/building-verification-loops-in-claude-code-with-skills)).

---

## 1. The playbook's model in a few lines

Source: Louis Claxton, *The AI-native SDLC playbook*, claude.com, **21 Aug 2026**, about a 40-minute read, with a PDF version. https://claude.com/resources/articles/the-ai-native-sdlc-playbook

- **Problem.** Agents have collapsed the build stage. Plan, review/test and deploy still run at human speed, so they become the bottleneck. Line-by-line human review no longer scales with agent output, and governance by weekly or monthly committee gets more expensive. The playbook's own example is security teams sized for human output.
- **Model.** The AI-native SDLC (also called "agentic SDLC" or "AI SDLC") keeps the old control objectives but enforces them in new ways. The process is a loop rather than a line, with AI embedded at every stage.
- **The connecting thread.** Each stage ends by committing an artifact to version control, and the next stage starts by reading it. Before Build the artifacts are `.md` files, because a product owner and an agent can both read and act on them. From Build onward the artifact is code and its records. The chain of commits is the audit trail: who asked for what, what the agent produced, and who approved it.
- **Triggers.**
  - An accepted `intent.md` triggers the requirements and design pass.
  - An approved `spec.md` triggers plan mode.
  - A merged PR triggers the pipeline.
  - A breached production control band writes the next `intent.md`.
- **Maturity path.** Run each step by hand first. Later, each accepted artifact fires the next gate automatically, and humans review what the agent flagged.
- **Humans.** Humans stay accountable for every decision that needs judgment. Their attention moves to the artifacts at the gates.
- **Adoption order.** Plays can be adopted in any order, but the dependency graph has five entry points that need nothing first:
  - Capture intent (Plan)
  - CLAUDE.md (Build)
  - Feedback loop (Test)
  - Hooks (Deploy)
  - Plan mode (Build)

  The rest build on those. CLAUDE.md leads to Skills, Subagents and Evals. Feedback loop leads to Evals. Skills and Capture intent lead to Requirements & design. Evals lead to PR review, then CI/CD, then Closing the loop. Hooks lead to CI/CD. This comes from the playbook's "start anywhere" figure.

## 2. Phase by phase

All rows below come from the [playbook](https://claude.com/resources/articles/the-ai-native-sdlc-playbook).

| Stage | Committed artifact | Who | Core practice |
|---|---|---|---|
| 1 Plan | `intent.md` (proto-spec) | Originator writes; PO reviews and accepts; platform team sets up the intent home | Brainstorm with Claude in plain words; Claude asks analyst questions |
| 2 Design | `spec.md` (next to `intent.md`) | PO reviews but doesn't write; policy owners resolve flagged concerns; tech lead for high risk | One session turns intent into requirements + design, constrained by org skills |
| 3 Build | `plan.md`, `CLAUDE.md`, skills, hooks, `.claude/agents/` | Engineer owns the plan; tech lead/architect for high risk | Plan mode first, then implement; parallel worktrees; subagents |
| 4 Test | Test output, eval suite | Engineer sets up the loop; platform engineer owns evals | Agent verifies its own work; config is regression-tested |
| 5 Deploy | PR + review findings, `REVIEW.md`, hook config | Tech lead writes `REVIEW.md`; code owner approves; release manager authorises prod | Layered AI review; hooks as approval gates; the agent stops at the production gate |
| 6 Maintain | Incident record, new `intent.md` | Service owner / on-call triage; security lead | Deterministic detection invokes Claude; findings re-enter as `intent.md` |

### Stage 1, Plan: capture as `intent.md`

- **How it works.**
  - The originator describes the problem in their own words.
  - Claude asks the questions an analyst would: scope, users, constraints, success.
  - Claude writes `intent.md` from an org template. The template can itself be a skill, written by a technical person and signed off by a lead.
  - The originator corrects it and commits it. The PO accepts it or closes it.
- **Template sections.** Problem, proposed outcome, affected users and systems, constraints, open questions.
- **For non-engineers.** Use claude.ai or Cowork with a GitHub connector, so they never touch git.
- **Where intent lives.** An `intent/` folder in the product repo is the simplest home. A separate repo only pays off across many repos.
- **Metrics.**
  - Leading: time from first conversation to committed `intent.md`. The target is to go from weeks to hours.
  - Lagging: the share of intents accepted into Design, and the number of `intent.md` edits made after the first `spec.md`.

### Stage 2, Design: requirements and design in one session

- **How it works.**
  - Claude turns the accepted `intent.md` into `spec.md`, applying the organisation's skills for brand, security, compliance and UX.
  - Claude flags concerns, especially where policies contradict each other.
  - The PO resolves each flagged concern with its policy owner before engineering sees the spec.
  - The PO checks whether the spec solves the stated problem and whether the open questions are answered or carried forward.
  - A human always decides whether the spec moves to build.
- **Maturity ladder.** Prompt by hand, then an organisation-level slash command, then a non-interactive job that fires when `intent.md` merges and commits `spec.md` as a PR. For front-end work, a mock in Claude Design (beta) can come first.
- **Governance.** Policy is applied while the spec is written, rather than discovered in a review weeks later. The prompt and the skill versions used are logged.
- **Metrics.**
  - Leading: time between the `intent.md` commit and the `spec.md` commit.
  - Lagging: `spec.md` commits dated after the first `plan.md` commit, which measures requirements rework.

### Stage 3, Build

The Build stage has six parts.

**Plan mode as the default start.**
- **How it works.**
  - The engineer gives Claude `intent.md` and `spec.md` in plan mode. Claude can read the code but can't edit files.
  - Claude interviews the engineer and produces a plan naming the files that change, the order of work, and the tests that prove it.
  - The engineer interrogates the plan: what could break, which step is riskiest, which options were rejected.
  - Iterate until someone who never saw the conversation could implement from the plan alone.
  - Commit the approved plan as `plan.md`. Implementation is then often a single pass.
  - If the implementation departs from the plan, update `plan.md` in the same commit. A hook can enforce this.
- **`plan.md` sections.** Files that change, order of work, risks, proof.
- **Metrics.** First-pass merge rate, plan-to-merge time, rework cycles, and whether the merged diff still matches `plan.md`.

**Auto mode.**
- Once the guardrails have matured, auto-accept becomes the default for routine work. The guardrails are a tuned CLAUDE.md, policy skills, blocking hooks and runnable tests.
- Routine work here means a tight spec, a small blast radius and code the tests already cover.
- Human review shifts from watching each edit to reviewing artifacts after longer autonomous runs.

**Legacy systems sidebar.** Jira, a requirements tool or Figma may already hold the record. For each artifact, pick one source of truth. There are three configurations:
- The repo is the source of truth.
- The legacy system is the source of truth, and Claude writes back to it through MCP.
- The minimum bar is linkage: the `.md` files carry the record ID, and the legacy record carries the commit SHA.

**CLAUDE.md.**
- **How it works.**
  - Run `/init`, then cut it down to what a new joiner needs on day one: commands, conventions, architecture, and the things Claude gets wrong.
  - Keep it under a page, because the whole file is read every session.
  - Check it into git and review changes like code.
  - Rule of thumb: when Claude makes the same mistake twice, add the correction.
- **Metrics.** Repeated mistakes, and time to first merged PR for new joiners.

**Skills as institutional knowledge.**
- **When to write one.** Write a skill for institutional knowledge that has to be applied consistently. Don't write one for what belongs in CLAUDE.md or a prompt.
- **How it works.**
  - Pick one policy that is enforced inconsistently today and has a named owner.
  - Write it as `.claude/skills/<name>/SKILL.md`, or ship it in a plugin.
  - Test that it triggers by phrasing the task several ways.
  - The policy owner signs off changes. Engineers get the new version in their next session.
- **Governance.** A skill is advisory. Back it with a hook, or with a review pass that re-checks the policy at the PR.
- **Metrics.**
  - Leading: time from policy approval to skill merge.
  - Lagging: PR findings citing the policy, which should trend to zero. If they don't, the skill isn't triggering or has drifted from the policy.

**Hooks as build-time guardrails.**
- Block edits to protected paths, run the formatter and linter after each edit, and keep secrets out of diffs.
- Keep these hooks fast and scoped. Heavy checks belong at commit or PR time.
- Hooks that ask a human for approval belong at Deploy gates. In Build they would put a person on the critical path of every parallel session.

**Parallel sessions and subagents.**
- Each session runs in its own git worktree, for example `claude --worktree feature-auth`. Split the work along the plan's independent file sets. Tasks that share files run in one session, one after another.
- Start with two or three sessions. The ceiling is how many streams one person can review properly.
- Repeated jobs become subagents in `.claude/agents/`, for example a simplifier, a verifier, or a researcher that reports without flooding the main context. In the playbook's example, the verifier runs the app and reports without fixing anything.
- **Metrics.** Concurrent sessions per engineer while review quality holds, time spent steering versus waiting, and merged changes per engineer read alongside the rework rate.

### Stage 4, Test

**Give Claude a feedback loop.**
- **How it works.**
  - Wrap the checks in one command that exits non-zero on failure.
  - List each command in CLAUDE.md with an example of healthy output.
  - State quantifiable targets, such as specific tests passing, a screenshot matching the mock, or an endpoint returning 200.
  - For bugs: have Claude reproduce the bug as a failing test, confirm why it fails, and commit the test. Then fix the code without editing the test.
  - For UI: screenshot and compare against the mock. Two or three rounds is normal.
  - Make "verified" part of "done", and have Claude paste the output.
  - Protect the loop itself with a hook that blocks test edits during fix tasks, or reject test changes in review.
- **Feedback loop vs verifier.** The feedback loop runs throughout the task. The verifier subagent is a separate final check in a fresh context.
- **Metrics.** First-pass CI success rate, review time per PR, change failure rate.

**Continuous evals in CI.**
- **How it works.**
  - Collect 20–50 real tasks with accepted outcomes, each written as a prompt plus the checks that define acceptable.
  - Run them non-interactively (`claude -p`) on a schedule and on every change to CLAUDE.md, skills or hooks.
  - Gate configuration changes on the pass rate.
  - Every production incident becomes a permanent eval.
- **Metrics.** Eval pass rate over time, time from incident to eval, and regressions caught in CI versus in production.

### Stage 5, Deploy

**AI in the PR review loop.**
- **How it works.**
  - Claude reviews every PR, either through the managed Code Review service or `claude-code-action` in your own CI.
  - The tech lead writes `REVIEW.md` with the review passes (bugs, security, and compliance against `spec.md`, `plan.md` and design principles), what counts as Important versus a nit, a cap on nits, and what to skip.
  - Findings never approve or block a PR on their own. A code owner still approves through branch protection.
  - Tagging `@claude` on a comment makes Claude push the fix. For PRs Claude opened, it can "babysit" the PR until it is green.
  - A finding that appears for the second time goes into CLAUDE.md.
  - The tech lead tunes the setup monthly.
- **Governance.** Separation of duties holds, because the agent that wrote the code can't approve it.
- **Metrics.** Time to first review (the target is minutes), comments resolved without a human touching the branch, and defects caught before merge versus escaped.

**Hooks as approval gates.**
- A hook can allow, ask or block.
- Team hooks go in `.claude/settings.json`. Non-negotiable hooks go in managed settings that engineers can't switch off.
- A block should explain itself and show the route to approval.
- The playbook includes a worked example of managed settings for a regulated enterprise: deny rules, sandbox, credential stripping, managed-only hooks, MCP and marketplaces, and a minimum client version.

**CI/CD integration.**
- **How it works.**
  - Start with read-only judgment jobs: triage a failed build, summarise flaky tests, draft changelogs.
  - Add write steps only behind the existing gates. Everything the agent writes arrives as a PR, and it has no route to main.
  - Run agent jobs sandboxed with short-lived tokens.
  - Expose deploy, status and rollback through MCP, scoped per environment.
  - Tier autonomy by environment: deploy freely in dev, staging sits in between, and a release manager authorises production.
  - Make rollback the most rehearsed path.
- **Principle.** The agent does everything up to the production gate and nothing past it.
- **Metrics.** Failures triaged without paging anyone, and the DORA metrics.

### Stage 6, Maintain

- **Closing the loop.**
  - A deterministic script with rolling-baseline bands watches a metric. Detection uses no model.
  - At 1σ it logs. At 2σ it invokes Claude read-only to diagnose. At 3σ Claude may open a PR or trigger a pre-approved runbook.
  - Claude writes its findings as `intent.md`, which re-enters the loop.
  - When the fix ships, add an eval.
- **Recurring scans.** Claude Security runs scheduled scans on Claude Mythos 5. It is in public beta on Enterprise. Findings go through the same PR gate or become `intent.md`. It adds to static analysis rather than replacing it.
- **Claude Tag (public beta, Slack).** Claude acts as an on-call first responder. Small fixes arrive as PRs, larger ones become `intent.md`, and the channel is the audit trail.

### Claims and numbers

- **The playbook itself contains no measured results.** Its figures are targets or illustrations. ([playbook](https://claude.com/resources/articles/the-ai-native-sdlc-playbook))
- **Anthropic-internal numbers from companion articles.** Treat these as vendor claims.
  - **Jason Clinton (Deputy CISO), 21 Jul 2026** ([source](https://claude.com/resources/articles/how-anthropic-secures-its-ai-native-software-development-lifecycle)):
    - Claude authors about 80% of the code merged at Anthropic.
    - Engineers ship 8× the code per quarter they did in 2021–2025.
    - More than half of all code is merged by the internal Claude Tag.
    - The share of PRs with substantive review comments rose from 16% to 54%.
    - About a third of the bugs behind past claude.ai incidents would have been caught by today's automated review.
  - **Osmani, Westlee Lunt and Wang, 15 Oct 2026 on claude.dev (listed as 16 Oct on claude.com)** ([source](https://claude.dev/blog/solving-code-review-at-anthropic/)):
    - Claude writes about 90% of Claude Code's own code.
    - Changes landing per day in the monorepo went from about 2,500 to 30,000+ between May and September.
    - Merged PRs to Claude Code more than doubled from June to September, while the revert share fell by more than 40%.
    - Boris Cherny estimates that giving Claude a way to verify its work makes the result two to three times better.
    - One PR went through 50+ rounds of agent review and fixes overnight, and about 59% of repeat findings were pre-existing code.
    - Re-review is now capped at three rounds.
  - **Skill-creator description tuning, 3 Mar 2026:** triggering improved on 5 of 6 public document skills. ([source](https://claude.com/resources/articles/improving-skill-creator-test-measure-and-refine-agent-skills))

---

## 3. Agent Skills guidance

### 3.1 Structure

- **What a skill is.** A folder with a `SKILL.md`: YAML frontmatter plus Markdown instructions, with optional `scripts/`, `references/` and `assets/`. Anthropic stresses that a skill is a folder, not just a Markdown file. ([spec](https://agentskills.io/specification), [How we use skills](https://claude.dev/blog/lessons-from-building-claude-code-how-we-use-skills/))
- **Open standard.** Agent Skills became an open standard for cross-platform use on 18 Dec 2025 ([engineering post update](https://www.anthropic.com/engineering/equipping-agents-for-the-real-world-with-agent-skills)). Claude Code skills follow it and add extensions of their own ([CC skills docs](https://code.claude.com/docs/en/skills)).
- **Fields in the spec.**
  - `name` (required): 1–64 characters, lowercase, digits and single hyphens, and it must match the folder name.
  - `description` (required): up to 1,024 characters, covering both what the skill does and when to use it.
  - Optional: `license`, `compatibility` (up to 500 characters), `metadata`, and `allowed-tools` (experimental).

  Source: [spec](https://agentskills.io/specification).
- **Claude Code-only fields.** These include:
  - `when_to_use`
  - `disable-model-invocation`
  - `user-invocable`
  - `context: fork` and `agent`
  - `hooks`
  - `paths`
  - `model` and `effort`
  - `arguments`
  - dynamic context injection

  Outside Claude Code (claude.ai uploads, the Skills API, `package_skill.py`), only the six spec fields are accepted, and any other key is a hard error. **For a skill library that has to work in several tools, stick to the six spec fields.** ([CC skills docs](https://code.claude.com/docs/en/skills))
- **Two kinds of content.** Reference content is knowledge applied inline, such as conventions. Task content is a step-by-step action, such as deploy or commit. Side-effecting tasks should set `disable-model-invocation: true` so Claude can't decide to deploy on its own. ([CC skills docs](https://code.claude.com/docs/en/skills))
- **When to make a skill.** When you keep pasting the same instructions or checklist, or when a section of CLAUDE.md has turned into a procedure rather than a fact. ([CC skills docs](https://code.claude.com/docs/en/skills))

### 3.2 Progressive disclosure

- **Level 1, metadata.** Name and description, about 100 tokens per skill, always in the system prompt.
- **Level 2, instructions.** The SKILL.md body, under 5k tokens, loaded when the skill triggers.
- **Level 3+, resources.** Loaded only when read. Scripts are executed rather than loaded, so only their output costs tokens.

Because nothing beyond level 2 costs anything until it's used, bundled content is effectively unbounded. ([overview](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/overview), [engineering post](https://www.anthropic.com/engineering/equipping-agents-for-the-real-world-with-agent-skills))

- **Authoring rules** ([best practices](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices)):
  - Keep the SKILL.md body under 500 lines.
  - Link reference files directly from SKILL.md, one level deep, because Claude may only partly read files nested deeper.
  - Give any reference file over 100 lines a table of contents.
  - Organise by domain, for example `reference/finance.md` and `reference/sales.md`.
  - Say explicitly whether Claude should run a script or read it.
- **Claude Code specifics** ([CC skills docs](https://code.claude.com/docs/en/skills)):
  - Once invoked, a skill stays in context and the file isn't re-read, so write it as standing instructions.
  - After compaction only the first 5k tokens of each skill are re-attached, within a shared 25k budget, so put the important rules at the top.
  - The skill listing is capped at about 1% of the context window. Descriptions of rarely used skills get dropped first, and each description plus `when_to_use` is truncated at 1,536 characters.

### 3.3 Authoring best practice (consolidated)

**Content.**
- Assume Claude is already smart. Only add what it doesn't know, and check whether each paragraph earns its tokens. ([best practices](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices))
- Don't state the obvious. Spend the words on what pushes Claude off its defaults. ([How we use skills](https://claude.dev/blog/lessons-from-building-claude-code-how-we-use-skills/))
- The Gotchas section is the highest-signal part of a skill. Grow it from real failures. ([How we use skills](https://claude.dev/blog/lessons-from-building-claude-code-how-we-use-skills/))

**Freedom.**
- Match freedom to fragility. Use prose for open-field tasks and an exact script for narrow-bridge tasks such as migrations. ([best practices](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices))
- Don't railroad: state the goal and the constraints, not every step. ([How we use skills](https://claude.dev/blog/lessons-from-building-claude-code-how-we-use-skills/))
- Explain why things matter. Treat all-caps ALWAYS or NEVER as a yellow flag. ([skill-creator SKILL.md](https://github.com/anthropics/skills/blob/main/skills/skill-creator/SKILL.md))

**Descriptions.**
- Write the description for the model, as trigger conditions rather than a summary. ([How we use skills](https://claude.dev/blog/lessons-from-building-claude-code-how-we-use-skills/))
- Write it in the third person, with key terms and contexts. ([best practices](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices))
- Make it a little "pushy", because Claude tends to under-trigger skills. ([skill-creator SKILL.md](https://github.com/anthropics/skills/blob/main/skills/skill-creator/SKILL.md))
- Simple one-step requests may not trigger a skill at all, because Claude only consults skills for work it can't easily do alone. ([skill-creator SKILL.md](https://github.com/anthropics/skills/blob/main/skills/skill-creator/SKILL.md))

**Scripts and folders.**
- Bundle scripts so Claude spends its turns composing rather than rebuilding boilerplate. Scripts should handle their own errors instead of leaving that to Claude, and should have no "voodoo constants". ([How we use skills](https://claude.dev/blog/lessons-from-building-claude-code-how-we-use-skills/), [best practices](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices))
- Use the folder for more than instructions:
  - a `config.json` for setup, where Claude asks the user when it's missing
  - an append-only log as memory
  - on-demand hooks that only apply while the skill is active, such as `/careful` or `/freeze`

  ([How we use skills](https://claude.dev/blog/lessons-from-building-claude-code-how-we-use-skills/))

**Hygiene.** ([best practices](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices))
- Keep terminology consistent.
- Give one default plus an escape hatch rather than a menu of options.
- Leave out time-sensitive information, or put it in an "old patterns" section.
- Use forward slashes in paths.
- Use fully qualified `Server:tool` names for MCP tools.
- Consider gerund names, such as `processing-pdfs`.

**Workflows.**
- Add copyable checklists, and the "plan → validate → execute" pattern with a machine-checkable intermediate file for batch or destructive operations. ([best practices](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices))

### 3.4 Kinds of skills

- **Nine internal categories at Anthropic.**
  - Library and API reference
  - Product verification
  - Data fetching and analysis
  - Business process and team automation
  - Code scaffolding and templates
  - Code quality and review
  - CI/CD and deployment
  - Runbooks
  - Infrastructure operations

  The best skills fit cleanly into one category, and skills that straddle several confuse the agent. ([How we use skills](https://claude.dev/blog/lessons-from-building-claude-code-how-we-use-skills/))
- **Capability-uplift vs encoded-preference skills.** Capability-uplift skills teach the model something it can't do reliably, and they may become unnecessary as models improve. Evals tell you when that has happened. Encoded-preference skills sequence steps Claude can already do in your team's way. They last longer, but they're only worth as much as their fidelity to your real process. ([skill-creator post](https://claude.com/resources/articles/improving-skill-creator-test-measure-and-refine-agent-skills)) The workshop's workflow skills (ticket → grill → spec → …) are **encoded-preference** skills.
- **Skills vs other building blocks.** ([Skills explained](https://claude.com/resources/articles/skills-explained), [playbook](https://claude.com/resources/articles/the-ai-native-sdlc-playbook))
  - Skills hold procedural know-how.
  - CLAUDE.md holds always-on facts.
  - MCP provides connectivity.
  - Subagents provide isolated execution with restricted tools.
  - Hooks are deterministic enforcement.

### 3.5 Evaluating skills

- **Evaluation-driven development** ([best practices](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices)):
  1. Run Claude on real tasks *without* the skill and note the gaps.
  2. Write three or more eval scenarios.
  3. Measure a baseline.
  4. Write the minimum instructions needed to pass.
  5. Iterate.
- **Claude A / Claude B.** One Claude instance helps write the skill, and a fresh instance uses it on real tasks. You watch what happens and bring the observations back. ([best practices](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices))
- **Seeing a skill trigger proves nothing about its output.** Measure triggering and output quality separately. Run each test prompt in a **fresh session** with the skill on and with it off. ([CC skills docs](https://code.claude.com/docs/en/skills))
- **Three test areas** ([Complete Guide PDF](https://resources.anthropic.com/hubfs/The-Complete-Guide-to-Building-Skill-for-Claude.pdf), Jan 2026):
  - Triggering, with should and should-not prompts. The aspirational target is firing on about 90% of 10–20 relevant queries.
  - Functional correctness.
  - Comparison against the baseline.
- **Tooling.**
  - The `skill-creator` plugin runs isolated subagents per case, grades, benchmarks with versus without the skill, runs blind A/B comparisons, and tunes descriptions. ([CC skills docs](https://code.claude.com/docs/en/skills), [skill-creator post](https://claude.com/resources/articles/improving-skill-creator-test-measure-and-refine-agent-skills))
  - `claude plugin eval` gives a CI-gateable pass threshold for plugin skills.
  - `/skill-doctor` reports context cost and usage per skill.

  These three are Claude Code-only. ([CC skills docs](https://code.claude.com/docs/en/skills))
- **Measuring use.** Anthropic logs skill usage through a PreToolUse hook to find under-triggering skills. ([How we use skills](https://claude.dev/blog/lessons-from-building-claude-code-how-we-use-skills/))

### 3.6 Verification loops with skills

Source: Delba de Oliveira, *Building verification loops in Claude Code with skills*, **22 Jul 2026**. https://claude.com/resources/articles/building-verification-loops-in-claude-code-with-skills

- **Definition.** The agent checks its own work with tests, linters or custom checks, and fixes what fails before it moves on. Packaged as a skill, the same checks run in every session instead of depending on someone's memory.
- **Built-in options.** `/verify` (build, run and observe the app), the toolchain (list your exact commands in CLAUDE.md), Code Review plus `@claude`, GitHub Actions running a verification skill, spec-validation skills (check each change against a Markdown spec in the repo), and rubric graders in Managed Agents.
- **Writing one.**
  1. Write down the corrections you keep making.
  2. Write the check in plain English, the way you'd brief a new teammate.
  3. Hand it to `/skill-creator`, or drop a `SKILL.md` into `.claude/skills/`.
  4. Invoke it on a fresh task to confirm it runs.

  Deterministic project rules count too, such as rejecting a migration that drops a column without a backfill.
- **Where the check runs.**
  - **Standalone:** you invoke it yourself. Suits cross-cutting checks such as a security scan or an accessibility audit. Once you're running it after every change, you've outgrown this level.
  - **Embedded:** a line appended to the skill that produces the work. This only works on skills you can edit.
  - **Chained:** one skill invokes another at its end. Anthropic's Claude Code team runs `/code-review` → `/simplify` → `/verify` → `/design` (UI changes only). Chaining is also how you add verification to a skill you can't edit, by wrapping it. It turns a habit into a contract, but costs more tokens.
  - **On every PR:** the same chain runs as a team gate. Hold off on this while the chain is still changing.
- **Claude Code extras** ([CC skills docs](https://code.claude.com/docs/en/skills), [best practices](https://code.claude.com/docs/en/best-practices)):
  - `/run-skill-generator` and `/verify` record a per-project `verify` skill.
  - A project skill named `verify` or `simplify` is automatically run before each commit (v2.1.286+).
  - Ways to gate when Claude may stop, from lightest to strongest: ask in the prompt, set a `/goal` condition, block the stop with a Stop hook, or have a fresh-context verifier subagent check the result.
  - Ask for **evidence**, not assertions.
  - Tell adversarial reviewers to flag only correctness or requirement gaps, otherwise they push toward over-engineering.
- **Impact.** Verification skills had the largest measurable effect on Claude's output internally. Anthropic says it can be worth an engineer spending a week making them excellent. Suggested techniques include recording video of what was tested and asserting on state at each step. ([How we use skills](https://claude.dev/blog/lessons-from-building-claude-code-how-we-use-skills/))

### 3.7 Distribution, governance and security

- **Distribution.** Check skills into `.claude/skills/` when the team is small and works in few repos. Move to a plugin marketplace as you scale, because every checked-in skill adds listing context. At Anthropic, skills start in a sandbox folder and are promoted by PR once they get traction, with no central committee. ([How we use skills](https://claude.dev/blog/lessons-from-building-claude-code-how-we-use-skills/))
- **Governance.** The policy owner signs off skill changes. Skill changes are gated by evals in CI. Invocations are logged. ([playbook](https://claude.com/resources/articles/the-ai-native-sdlc-playbook))
- **Security.** Only use skills from trusted sources, and audit their scripts and any external fetches, since a skill can direct tools and run code. ([overview](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/overview), [engineering post](https://www.anthropic.com/engineering/equipping-agents-for-the-real-world-with-agent-skills))

---

## 4. Slide framings

These are attributed paraphrases, apart from #6, which is verbatim. Each is under 25 words.

1. **Code is no longer the bottleneck.** The bottleneck moved to the human-speed stages on either side of build. (Section title and thesis of the [playbook](https://claude.com/resources/articles/the-ai-native-sdlc-playbook), Claxton, Aug 2026)
2. **A loop, not a line:** every stage commits an artifact the next stage reads, and the commits are the audit trail. ([playbook](https://claude.com/resources/articles/the-ai-native-sdlc-playbook))
3. **intent.md → spec.md → plan.md → diff → PR → incident → intent.md.** (Artifact chain from the [playbook](https://claude.com/resources/articles/the-ai-native-sdlc-playbook))
4. **First by hand, then a slash command, then fired automatically by the previous artifact's merge.** ([playbook](https://claude.com/resources/articles/the-ai-native-sdlc-playbook), Design stage)
5. **A plan is done when an engineer who never saw the conversation could implement from it.** ([playbook](https://claude.com/resources/articles/the-ai-native-sdlc-playbook), plan mode play)
6. **"A skill is a control, though an advisory one."** The skill makes violations rare, and a hook makes them near-impossible. (Verbatim, then paraphrase; [playbook](https://claude.com/resources/articles/the-ai-native-sdlc-playbook))
7. **Without a check Claude can run, you are the verification loop.** ([Claude Code best practices](https://code.claude.com/docs/en/best-practices))
8. **Verification skills moved output quality more than any other kind of skill at Anthropic.** (Thariq Shihipar, [How we use skills](https://claude.dev/blog/lessons-from-building-claude-code-how-we-use-skills/), Jun 2026)
9. **From habit to contract:** a check you always remember to run becomes a step the skill always runs for you. (Delba de Oliveira, [verification loops](https://claude.com/resources/articles/building-verification-loops-in-claude-code-with-skills), Jul 2026)
10. **A skill is a folder, not a prompt.** Its description says *when to fire*, not what it is. ([How we use skills](https://claude.dev/blog/lessons-from-building-claude-code-how-we-use-skills/))
11. **Writing a skill is writing an onboarding guide for a new hire.** ([Equipping agents](https://www.anthropic.com/engineering/equipping-agents-for-the-real-world-with-agent-skills), Oct 2025)
12. **Mistake twice → CLAUDE.md. Review finding twice → CLAUDE.md. Incident → eval.** (Composite of the [playbook](https://claude.com/resources/articles/the-ai-native-sdlc-playbook) rules)
13. **The agent works up to the production gate and never past it.** ([playbook](https://claude.com/resources/articles/the-ai-native-sdlc-playbook), Deploy)
14. **Stop asking whether a human read the code. Ask which check, human or automated, should catch what could go wrong.** ([How the Claude Code team does code review](https://claude.dev/blog/solving-code-review-at-anthropic/), Oct 2026)

---

## 5. Against the workshop workflow: read ticket → explore/grill → spec → tickets → implement → verify/review → PR

### Mapping

| Workshop step | Playbook / docs counterpart | Fit |
|---|---|---|
| Read ticket | Plan: `intent.md` drafted with Claude, accepted by the PO | Good. The foggy epic is the intent. |
| Explore / grill | Plan: Claude asks analyst questions. Docs: [Let Claude interview you → SPEC.md, then a fresh session](https://code.claude.com/docs/en/best-practices) | Good. Grilling is endorsed practice. |
| Spec | Design: `spec.md` from intent + policy skills, concerns flagged; **the PO reviews it and doesn't write it** | Good. Gives the two POs a defined role. |
| Tickets | **No equivalent.** The playbook uses `plan.md` (files, order, risks, proof) and splits work into worktrees by file independence | Conflict / reframe |
| Implement | Build: plan mode → accept → often a single pass; auto mode once the guardrails mature; 2–3 parallel worktrees | Good |
| Verify / review | Test: a feedback loop **inside** implement; a fresh-context verifier; review against `spec.md` and `plan.md` | Partial. Verification isn't one step at the end. |
| PR | Deploy: layered AI review with `REVIEW.md`, `@claude` fix loop, human code-owner approval | Good |
| (missing) | Maintain: findings and incidents → new `intent.md`; lessons → CLAUDE.md, REVIEW.md, skills, evals | Extension |

### Where it conflicts or needs reframing

1. **Tickets.** The playbook lists backlog entries, user stories, story points and refinement meetings as the *traditional* path. Its Build unit is a committed `plan.md`, cut into independent worktree tasks ([playbook](https://claude.com/resources/articles/the-ai-native-sdlc-playbook)). The legacy sidebar still allows Jira or GitHub issues as the source of truth if you pick one per artifact. **Suggestion:** keep tickets, but frame them as plan slices that each carry the `plan.md` sections: files, order, risks, **proof**. Split them along file boundaries so groups can work in parallel worktrees.
2. **Two interviews, not one.** The playbook interviews twice. The first is about the *problem*, run by the originator or PO with Claude while writing intent and spec. The second is about the *implementation*, run by the engineer in plan mode on each change: what could break, the riskiest step, the rejected alternatives. The workshop's single "grill" should either cover both or appear twice.
3. **Verification belongs inside implement.** The feedback loop runs throughout implementation, and the verifier and review are a separate fresh-context check at the end ([playbook](https://claude.com/resources/articles/the-ai-native-sdlc-playbook), [code review](https://claude.dev/blog/solving-code-review-at-anthropic/): review is continuous, like spellcheck). Draw verify as a loop around implement, plus a gate before the PR.
4. **Skills alone won't enforce anything.** The playbook says rules that must hold need hooks or CI. Hooks are Claude Code-specific, though, and the workshop is cross-tool. **The portable deterministic layer is CI plus branch protection.** Check this with issue 06.
5. **Don't over-ceremony small changes.** If you can describe the diff in one sentence, skip the plan ([best practices](https://code.claude.com/docs/en/best-practices)). The full read→grill→spec→tickets flow is meant for the epic, not for every ticket.
6. **Authoring advice disagrees on tone.**
   - The platform docs suggest firmer wording such as "MUST" when Claude misses a rule ([best practices](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices)).
   - The skill-creator skill calls all-caps MUSTs a yellow flag and says to explain the reason instead ([skill-creator](https://github.com/anthropics/skills/blob/main/skills/skill-creator/SKILL.md)).
   - The Claude Code team warns against railroading ([How we use skills](https://claude.dev/blog/lessons-from-building-claude-code-how-we-use-skills/)).

   A reconciled rule for the starter library: be precise in triggers, explain why in the body, and keep hard constraints for fragile steps.

### What it adds (extensions)

- **Commit the working-out.** The workshop already plans "groups commit their working-out with every PR", which is exactly the playbook's artifact-chain and audit-trail model. Make the files explicit: `intent.md`, `spec.md`, `plan.md` per group, plus a REVIEW.md. ([playbook](https://claude.com/resources/articles/the-ai-native-sdlc-playbook))
- **Feedback arrows back into config:**
  - Repeat mistakes go into AGENTS.md / CLAUDE.md.
  - Repeat review findings go into REVIEW.md or a skill.
  - Incidents become evals.

  ([playbook](https://claude.com/resources/articles/the-ai-native-sdlc-playbook), [code review](https://claude.dev/blog/solving-code-review-at-anthropic/))
- **Review convergence.** An agent author and an agent reviewer can loop forever. Cap review at about three rounds and re-review only the new diff after the first passes. Flag the whole class of bug, and don't repeat findings. ([code review](https://claude.dev/blog/solving-code-review-at-anthropic/))
- **Human accountability rules.** The person who prompted the change counts as a required reviewer, and an agent's approval never replaces a human's. ([code review](https://claude.dev/blog/solving-code-review-at-anthropic/))
- **Evals for the skill library itself.** Any change to skills or AGENTS.md should be regression-tested with trigger tests and a with/without baseline. ([playbook](https://claude.com/resources/articles/the-ai-native-sdlc-playbook), [CC skills docs](https://code.claude.com/docs/en/skills))

---

## 6. What could change the workshop design

1. **The reporter can compute the playbook's own metrics from git.** Most of the playbook's leading and lagging indicators come from git, PR and CI data:
   - intent→spec time
   - `spec.md` commits after the first `plan.md` (requirements rework)
   - first-pass CI success
   - plan-to-merge time
   - whether the merged diff matches `plan.md`
   - review rounds to pass

   The live deck could show these per group with no extra instrumentation, and the overnight retrospective could compare groups on them. ([playbook](https://claude.com/resources/articles/the-ai-native-sdlc-playbook))
2. **Lead the skills chapter, and the Day 2 skill lab, with verification skills.** Anthropic found these had the biggest measurable impact. A .NET + React team has obvious candidates: `dotnet test`/build and lint wrappers, Playwright checks of the UI against a mock, and migration rules. Use the verification article's recipe as the lab script: take the manual follow-up you repeated most this week → plain English → skill → run on a fresh task → chain. ([How we use skills](https://claude.dev/blog/lessons-from-building-claude-code-how-we-use-skills/), [verification loops](https://claude.com/resources/articles/building-verification-loops-in-claude-code-with-skills))
3. **The playbook gives the two POs a concrete role.** They own `intent.md` and review `spec.md`, but don't write it, and they resolve the flagged concerns. They can do this in claude.ai or Cowork, without git. That fits the spec review checkpoint already planned before agents build. ([playbook](https://claude.com/resources/articles/the-ai-native-sdlc-playbook))
4. **Teach skills as an advisory control.** Every must-hold rule in the starter library should name its deterministic backstop: a CI check, branch protection, or a Claude Code hook where available. This is also where cross-tool differences show up. ([playbook](https://claude.com/resources/articles/the-ai-native-sdlc-playbook))
5. **Ship the skill library with tests.** For each skill, include three should-trigger prompts, three should-not-trigger prompts, and one with/without comparison. That makes "test a skill" a concrete Day 2 exercise and keeps the takeaway library maintainable. ([CC skills docs](https://code.claude.com/docs/en/skills), [Complete Guide PDF](https://resources.anthropic.com/hubfs/The-Complete-Guide-to-Building-Skill-for-Claude.pdf))
6. **Several attractive features are Claude Code-only and version-gated.**
   - `/verify` and `/run-skill-generator`
   - auto pre-commit `verify`/`simplify` (v2.1.286+)
   - `/goal`, Stop hooks, `context: fork`, `skill-creator` evals, `/skill-doctor`
   - plan mode and worktrees in the exact form the playbook describes

   Demo them as "what this looks like in Claude Code", not as the baseline. The portable core is the six-field SKILL.md, AGENTS.md/CLAUDE.md content, and CI. ([CC skills docs](https://code.claude.com/docs/en/skills))
7. **Present "tickets" as plan slices with a Proof section.** Each slice cut along file boundaries is one worktree, and groups start with two or three parallel sessions, because review capacity is the ceiling. ([playbook](https://claude.com/resources/articles/the-ai-native-sdlc-playbook))

---

## Gaps and caveats

- **"Building great agent skills".** I found no Anthropic page with this title on claude.com, claude.dev, anthropic.com or the docs. The nearest first-party sources are the [Skill authoring best practices](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices) doc, [Lessons from building Claude Code: How we use skills](https://claude.dev/blog/lessons-from-building-claude-code-how-we-use-skills/) and [The Complete Guide to Building Skills for Claude](https://resources.anthropic.com/hubfs/The-Complete-Guide-to-Building-Skill-for-Claude.pdf). All three are used above.
- **The playbook PDF** was not read. The HTML article was read in full, including the adoption-order and bottleneck figures. The page says the PDF has the same content.
- **The code review article's date** shows 15 Oct 2026 on claude.dev and 16 Oct 2026 in claude.com's related-articles list.
- **Docs pages** (platform.claude.com, code.claude.com) carry no publication date. They were fetched on 2026-10-20 and may change. Claude Code version numbers are quoted from those docs.
- **The "How we use skills" URL.** `claude.com/blog/...` redirects with a 308 to `claude.dev/blog/...`. claude.dev is linked as "Developer blog" in claude.com's footer, so it's treated as first-party.
- **All adoption and productivity figures** are Anthropic's own internal numbers, not independent evidence. Issue 05 covers the wider evidence.

## Sources

| Source | Author | Date | URL |
|---|---|---|---|
| The AI-native SDLC playbook | Louis Claxton | 21 Aug 2026 | https://claude.com/resources/articles/the-ai-native-sdlc-playbook |
| Building verification loops in Claude Code with skills | Delba de Oliveira | 22 Jul 2026 | https://claude.com/resources/articles/building-verification-loops-in-claude-code-with-skills |
| How Anthropic secures its AI-native SDLC | Jason Clinton | 21 Jul 2026 | https://claude.com/resources/articles/how-anthropic-secures-its-ai-native-software-development-lifecycle |
| Lessons from building Claude Code: How we use skills | Thariq Shihipar | 3 Jun 2026 | https://claude.dev/blog/lessons-from-building-claude-code-how-we-use-skills/ |
| How the Claude Code team does code review | Addy Osmani, Morgan Westlee Lunt, Qing Wang | 15 Oct 2026 | https://claude.dev/blog/solving-code-review-at-anthropic/ |
| Improving skill-creator: Test, measure, and refine Agent Skills | Anthropic | 3 Mar 2026 | https://claude.com/resources/articles/improving-skill-creator-test-measure-and-refine-agent-skills |
| Skills explained | Anthropic | 5 Mar 2026 | https://claude.com/resources/articles/skills-explained |
| A complete guide to building skills for Claude (+ PDF) | Anthropic | 29 Jan 2026 | https://claude.com/resources/articles/complete-guide-to-building-skills-for-claude · https://resources.anthropic.com/hubfs/The-Complete-Guide-to-Building-Skill-for-Claude.pdf |
| Equipping agents for the real world with Agent Skills | Barry Zhang, Keith Lazuka, Mahesh Murag | 16 Oct 2025 (open-standard update 18 Dec 2025) | https://www.anthropic.com/engineering/equipping-agents-for-the-real-world-with-agent-skills |
| Agent Skills overview (docs) | Anthropic | undated, fetched 2026-10-20 | https://platform.claude.com/docs/en/agents-and-tools/agent-skills/overview |
| Skill authoring best practices (docs) | Anthropic | undated, fetched 2026-10-20 | https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices |
| Extend Claude with skills (Claude Code docs) | Anthropic | undated, fetched 2026-10-20 | https://code.claude.com/docs/en/skills |
| Best practices for Claude Code (docs) | Anthropic | undated, fetched 2026-10-20 | https://code.claude.com/docs/en/best-practices |
| Agent Skills specification | agentskills.io (open standard published by Anthropic) | undated, fetched 2026-10-20 | https://agentskills.io/specification |
| skill-creator SKILL.md | anthropics/skills | main branch, fetched 2026-10-20 | https://github.com/anthropics/skills/blob/main/skills/skill-creator/SKILL.md |
