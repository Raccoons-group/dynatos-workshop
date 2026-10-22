---
kicker: Welcome
---

# Why we're here

Lift the whole team a level, together. Not crown the fastest individual.

- Sceptics are welcome: you're the safety net.
- Eleven of you, three tools, one case, and a day and a half.

<!--
09:01 · 2 min · outline 2.
-->

---
kicker: Opening round
---

# Show us how you work today

Two minutes each:

- Your tool, and your IDE
- Your experience with AI so far
- How you work with agents today: one recent example
- One thing you trust an agent with, and one you don't

<!--
09:03–09:25 · 22 min · outline 3.

Eleven people, two minutes each. The coaches log it: the overnight retrospective reads the log, and Day 2's closing round mirrors this one.
-->

---
kicker: Welcome
---

# Agents are here

Two-thirds of developers who use AI now use coding agents, most of them daily.

The question isn't whether. It's how a team works with them.

<!--
09:25 · 2 min · outline 4. Source: research/practitioner-landscape-and-evidence.md §3.3.
-->

---
layout: data
kicker: This repo
---

# Built the way we'll teach

<MapExhibit />

<!--
09:27 · 3 min · outline 5.

The repo you're about to open PRs on holds the whole plan, made with agents: what we knew on Monday, the decisions we made, and what we left out on purpose. This is .scratch/workshop/map.md, read live.
-->

---
layout: data
kicker: This repo
---

# The trail in the repo

<PullRequests />

<!--
09:30 · 2 min · outline 6.

One decision, its research note, and the PR that built from it. Agents wrote; we decided and reviewed. The commits are the audit trail. The list is pulled from GitHub by `pnpm live:sync`.
-->

---
layout: data
kicker: The agenda
---

# The next day and a half

<Ribbon mode="agenda" />

<!--
09:32 · 1 min · outline 7.

The agenda on the ribbon: Part 1 walks the demo from read to slice, then your morning (explore and specify), lunch, Part 2 walks build to learn, then your afternoon (slice to ship). Day 2 is learn: the retrospective, a skill lab and your plan.
-->

---
kicker: Setup check
---

# Sit at your group's table

On your group's computer:

- `git clone -b group-<x>/main` this repo, then `pnpm install`
- `gh auth status`: signed in, with write access
- `pnpm setup:check`: every line passes, or tells you the fix
- Stuck? Put a hand up, and a coach comes to you

<!--
09:33–09:40 · 7 min · not in the outline (the agenda's setup check). From here on, the deck's page numbers run one ahead of the outline: the notes carry the outline number.

Both coaches walk the tables. Fix any stragglers now, not at 11:10.
-->

---
kicker: Why follow one feature
---

# Code is no longer the bottleneck

Building got fast.

Deciding, reviewing and shipping still run at human speed.

<!--
09:40 · 2 min · outline 8. Part 1 starts. Source: Anthropic's AI-native SDLC playbook (research/anthropic-playbook-and-skills.md §4 #1).
-->

---
kicker: Why follow one feature
---

# AI is an amplifier

Throughput goes up, and stability goes down. The speed fades; the complexity stays.

Whatever your team already does gets louder.

<!--
09:42 · 2 min · outline 9. Source: research/practitioner-landscape-and-evidence.md §4 #1, #4.
-->

---
kicker: Why follow one feature
---

# A capable new hire who forgets everything

The agent knows a lot in general, and nothing about your team.

Whatever it needs from you has to be in the repo.

<!--
09:44 · 1 min · outline 10.
-->

---
layout: data
kicker: The frame for both days
---

# A loop, and a harness that travels with it

<Ribbon mode="artifacts" />

<!--
09:45 · 3 min · outline 11.

The top row is the eight stations the feature passes, each committing an artifact. The bottom row is the three threads it carries the whole way: context and skills steer the agent, checks catch it. Each thread is taught once, where the feature first needs it.

The top row becomes each group's phase on the wall this afternoon.
-->

---
layout: data
kicker: The frame for both days
---

# Fixed gates, your route

<Ribbon mode="gates" />

<div class="rac-below">

‖ is the checkpoint: the spec is reviewed before any agent builds. Everything between the gates is your call.

</div>

<!--
09:48 · 2 min · outline 12.

Only a few gates are fixed: a draft PR early, the spec reviewed before an agent builds, a slice green in CI, the PR reviewed by another tool. Everything between them is the group's call.
-->

---
kicker: Why follow one feature
---

# Two schools, same stations

- **Pocock** settles everything up front: grill, spec, tickets, then build.
- **Tan** goes deep first, and lets the code be the spec.

The demo takes Pocock's route, and names Tan's at every fork.

<!--
09:50 · 1 min · outline 13. Source: research/pocock-and-tan.md §2.5, §5.
-->

---
kicker: Why follow one feature
---

# Meet the feature

> **Show allergens on the menu.** Customers keep phoning restaurants to ask what's in a dish. We want Forkful to show allergens on the menu.

A sibling story in Forkful. We take it to a reviewed spec before the kickoff, and to a merged PR after lunch.

It isn't your epic.

<!--
09:51 · 1 min · outline 14.

Show the real issue on GitHub (label `demo`): five things came up, and the product team didn't all agree. That's the fog we'll grill.
-->

---
kicker: Thread · Context
---

# Day one for a new hire

The agent starts every session knowing nothing about Forkful.

`AGENTS.md` is the one page it always reads.

<!--
09:52 · 2 min · outline 15. Context is taught once, here, before the ticket is read.
-->

---
kicker: Thread · Context
---

# More context isn't better

Keep it short, non-inferable and owned.

- Committed agent config came with half of the complexity growth.
- Bloated context files cost over 20% more, for no gain.
- 74% of committed config is never touched again.

<!--
09:54 · 2 min · outline 16. Sources: research/practitioner-landscape-and-evidence.md §4 #5, §5.
-->

---
layout: data
kicker: Thread · Context
---

# Our AGENTS.md, and the template you'll fill

<div class="rac-exhibit-pair">
  <FileExhibit path="AGENTS.md" :lines="26" />
  <FileExhibit path="docs/agents-md-template.md" :lines="26" />
</div>

<!--
09:56 · 2 min · outline 17. Both files are read live from this repo.

Left: this repo's hand-cut root AGENTS.md. Right: the skeleton you'll fill for Forkful: commands, where things are, language, rules the code doesn't tell you, how we test, mistakes made twice, and a rule → enforced-by table.
-->

---
kicker: Thread · Context
---

# One file, every tool

One root `AGENTS.md`. No `CLAUDE.md`.

- Each tool's `/init` writes its own file: improve `AGENTS.md` instead.
- Visual Studio and JetBrains Copilot ignore `AGENTS.md`. Use Copilot CLI or VS Code.
- This repo's CI fails a PR that adds a `CLAUDE.md`.

<!--
09:58 · 1 min · outline 18. Source: research/skill-portability.md §1c, §3 gotchas 1, 2, 6.
-->

---
layout: data
kicker: Thread · Context
---

# Shared language

<GlossaryExhibit />

<!--
09:59 · 1 min · outline 19.

A glossary of the domain's words: one word per concept, in the code and in conversation. This is ours, for the workshop itself, read live. You'll write case/GLOSSARY.md for Forkful, and the grill writes most of it.
-->

---
kicker: Station 1 · Read
---

# Read the whole ticket

Read all of it. Separate facts from questions. Make the decisions explicit.

`read-issue` pulls the issue in, from whichever tool you use.

<!--
10:00 · 2 min · outline 20.
-->

---
layout: demo
kicker: Station 1 · Read
fallback: demo/main
---

# Demo: say it back

A one-sentence skill has the agent restate the ticket in its own words.

A misreading then costs one message, not one wrong build.

```
/read-issue <the demo issue>
/say-it-back
```

<!--
10:02 · 3 min · outline 21 · Part 1 lead · Claude Code, on a local `demo/allergens` cut from `demo/main`. Nothing is pushed before 36.

Shown: the issue pulled into the terminal, then the restatement: what's asked, what's decided, the five open points. Confirm it, or correct one thing.

Expected: the restatement saved to work/demo/read.md and committed locally.
Fallback: demo/01-read, or the recording.
-->

---
kicker: Thread · Skills
---

# The real gap is expertise, not intelligence

The model is smart.

Skills carry your team's expertise to it.

<!--
10:05 · 1 min · outline 22. The skills deck, p2.
-->

---
layout: title-cards
---

# Failure modes

1. It builds the wrong thing **grilling**
2. It's too verbose **shared language**
3. It leaves a ball of mud **deep modules**
4. It doesn't work **tests**

<!--
10:06 · 1 min · outline 23. The skills deck, p3. Each answer is a skill.
-->

---
layout: title-cards
---

# Progressive disclosure

1. **Name and description** always loaded
2. **The body** loads when the skill fires
3. **Resources** load on demand

<!--
10:07 · 1 min · outline 24. The skills deck, p4.
-->

---
kicker: Thread · Skills
---

# A skill is a folder, not a prompt

`name` equals the folder name. The description says *when* to fire.

```markdown
.agents/skills/say-it-back/SKILL.md
---
name: say-it-back
description: Use when starting on an issue, before planning or changing anything.
---

Before you act on an issue, restate it in your own words in at most five lines
(what is asked, what is already decided, what is still open), wait for the
user's yes, and save the agreed restatement to the working-out folder as read.md.
```

<!--
10:08 · 2 min · outline 25. The skills deck, p5. The one-sentence skill we just ran, taken apart. Invite groups to write their own today.
-->

---
kicker: Thread · Skills
---

# How a skill fires

- **By name:** `/name`, or `$name` in Codex
- **By its description,** when the task matches it

`AGENTS.md` holds conventions. `SKILL.md` holds procedures.

<!--
10:10 · 1 min · outline 26. The skills deck, p6.
-->

---
layout: data
kicker: Thread · Skills
---

# A toolkit for each station

<SkillsExhibit />

<!--
10:11 · 2 min · outline 27. The skills deck, p10, laid onto the ribbon; read live from .agents/skills. A dimmed name isn't in the library yet.

read-issue, grill-with-docs, to-spec, to-tickets, implement with tdd, code-review, open-pr, how-we-worked.
-->

---
kicker: Thread · Skills
---

# One skill, every tool

`.agents/skills` is canonical, with generated links for Claude Code.

- Only the six portable frontmatter fields
- Name skills in plain text
- CI checks that a skill's name is its folder's name

<!--
10:13 · 1 min · outline 28. Source: research/skill-portability.md §2, §3 gotchas 14–15. `pnpm install` makes the links.
-->

---
kicker: Thread · Skills
---

# A skill is an advisory control

A skill makes mistakes rare. Only a check makes them near-impossible.

That's the third thread, after lunch.

<!--
10:14 · 1 min · outline 29.
-->

---
kicker: Station 2 · Explore
call: yours
---

# Which approach for which job? {.rac-q}

- **A clear task:** just build it.
- **One conversation's worth of fog:** grill.
- **Fog across several sessions:** wayfinder.

<!--
10:15 · 1 min · outline 30. The skills deck, p24.
-->

---
layout: data
kicker: Station 2 · Explore
---

# Fog bigger than one session

<MapExhibit />

<!--
10:16 · 3 min · outline 31. The map from slide 5 again. The skills deck, p18–21.

Wayfinder, the skill behind this morning's map: start foggy, use four ticket types, and let the map grow. It's optional for groups: keep it to about five tickets.
-->

---
layout: demo
kicker: Station 2 · Explore
fallback: demo/01-read
---

# Demo: grill with docs

Rounds of numbered questions, each with a recommended answer.

A coach plays product. The glossary grows as we answer.

```
/grill-with-docs
```

<!--
10:19 · 5 min · outline 32 · Part 1 lead, with the checkpoint coach as product · Claude Code, the same session.

Before: lower the effort setting for grilling (house rule, slide 45).
Product answers from the product card, and hands one question back: "What would you recommend?"

Expected: the six decisions on the card, and case/GLOSSARY.md holding Allergen and Allergen info. Commit locally.
Fallback: demo/02-explored.
-->

---
call: yours
kicker: Station 2 · Explore
---

# Don't debate, prototype

When grilling can't settle a question, build two or three throwaway variants behind one switch.

This is where Tan forks.

<!--
10:24 · 1 min · outline 33. Source: research/pocock-and-tan.md §4 #5, §2.3.
-->

---
layout: demo
kicker: Station 3 · Specify
fallback: demo/03-specified
---

# Demo: from conversation to spec

The spec only records what the grill decided:

- the acceptance examples
- the seam they'll be proved at
- what's out of scope

<!--
10:25 · 2 min · outline 34 · prepared, no agent.

Typed: git checkout demo/03-specified -- work/demo/spec.md
Show the spec next to the product card: each decision is a line.
-->

---
call: yours
kicker: Station 3 · Specify
---

# Right-size the spec

A heavy template turned a small bug into 16 acceptance criteria.

- On brownfield code, describe the change.
- Tan skips the spec, and lets the code be the spec.

<!--
10:27 · 1 min · outline 35. Sources: research/practitioner-landscape-and-evidence.md §3.1, §5; research/pocock-and-tan.md §2.3.
-->

---
layout: demo
kicker: Station 3 · Specify
call: fixed
fallback: demo/03-specified
---

# Demo: open the draft PR

`open-pr` opens the demo's draft PR, with the spec in its working-out. You'll do this within 30 minutes.

The deck reads the PR. It observes; it never coaches.

<DemoCard />

<!--
10:28 · 2 min · outline 36 · Part 1 lead · Claude Code.

Typed: /how-we-worked first, shown in full once (observed by the agent, then two or three one-line answers). Then /open-pr.

Expected: a draft PR into demo/main, "Part of #<demo issue>". The card appears here by 39 (about 10:34), at the latest by 10:38.
Fallback: pnpm demo:reset demo/03-specified opens the draft PR and adds the label.
-->

---
layout: demo
kicker: The checkpoint
call: fixed
fallback: demo/03-specified
---

# The checkpoint

Before any agent builds, someone who wasn't in the conversation checks that the spec can be built from.

Live: the other coach reviews the demo's spec in one minute, and adds `spec-reviewed`.

<DemoCard />

<!--
10:30 · 2 min · outline 37 · the checkpoint coach, on their own laptop and GitHub account.

Check aloud against slide 48's five questions, then add the label. Refresh the PR so the room sees who added it.

Expected: the labeled event runs the reporter, and the card passes the gate by 10:38. If it doesn't trigger, re-run the reporter by hand (workflow_dispatch).
Fallback: pnpm demo:reset demo/03-specified.
-->

---
kicker: Station 4 · Slice
---

# Tickets as vertical slices

Each ticket is one user outcome:

- a full path through the layers
- demoable on its own

<!--
10:32 · 2 min · outline 38. The skills deck, p12.
-->

---
layout: demo
kicker: Station 4 · Slice
fallback: demo/03-specified
---

# Demo: slice the spec

Ask of every proposed ticket: could you demo this?

Then compare with the naive split, layer by layer:

`data → API → UI → filter`

<DemoCard />

<!--
10:34 · 3 min · outline 39 · Part 1 lead · Claude Code, the same session.

Typed: /to-tickets. "Could you demo ticket 1 of the naive split?" No.

Expected: three tickets in work/demo/issues/, committed locally, not pushed. The card is already at Slice because of the label.
Fallback: demo/04-sliced, which Part 2 starts from anyway.
-->

---
call: yours
kicker: Station 4 · Slice
---

# Or: plan slices with a proof

The playbook has no ticket step. Its unit is a plan:

- the files
- the order
- the risks
- the proof

<!--
10:37 · 1 min · outline 40. Source: research/anthropic-playbook-and-skills.md §2 Stage 3, §6 #7. Part 1 ends at 10:38; break until 10:55.
-->

---
kicker: Case kickoff
---

# Your epic

**Group orders for the office lunch.**

A GitHub issue, in the Forkful app you just watched. Pull it in with `read-issue`.

<!--
10:55 · 3 min · outline 41. Show the epic on GitHub. Read it; don't add to it.
-->

---
layout: demo
kicker: Case kickoff
---

# What "done" means tonight

- `case/AGENTS.md` and `case/GLOSSARY.md`
- A spec that passed the checkpoint
- Slice tickets
- Slice 1 green in CI
- The working-out, committed with your PR

Nobody finishes the epic.

<EmptyCard />

<!--
10:58 · 2 min · outline 42. Your card on the wall starts empty: the threads light up as each artifact lands.
-->

---
layout: data
kicker: Case kickoff
---

# What's fixed, what's yours

<Ribbon mode="gates" />

<div class="rac-below">

**Yours:** how you explore (grill, wayfinder with about five tickets, or prototype first), how big the spec is, how you slice, test-first or test-after, who drives, and every product decision.

</div>

<!--
11:00 · 4 min · outline 43.

Fixed: a draft PR within 30 minutes, the checkpoint before you build, review by another group's tool (at most three rounds), how-we-worked before every push, and the merge before the stand-up.
-->

---
kicker: Case kickoff
---

# How you work together

One computer per group. Who decides is up to you.

Now and then, let the least experienced person drive, and explain the diff.

<!--
11:04 · 2 min · outline 44.
-->

---
kicker: Case kickoff
---

# House rules

- Start the agent at the repo root.
- Improve `AGENTS.md`; don't run `/init`.
- Name skills in plain text.
- Lower the effort setting for grilling.
- One tool per group, ideally a different one per group.

<!--
11:06 · 2 min · outline 45.
-->

---
kicker: Case kickoff
---

# The deck reads your PR

- The reporter observes. It never coaches.
- Run how-we-worked before every push.
- We coaches keep a log too.
- Tomorrow's retrospective is a draft, and you'll correct it.

<!--
11:08 · 1 min · outline 46.
-->

---
layout: data
kicker: Draft PR by 11:40 · explore and specify · call a coach for the checkpoint
---

# Groups, go

<Wall />

<!--
11:09 · 1 min · outline 47. "Groups, go" at 11:10.

open-pr opens your draft PR within 30 minutes and puts your group on the wall. Before lunch: explore and specify, and call the checkpoint coach when you're ready.

Leave the wall projected through the morning.
-->

---
kicker: The checkpoint
call: fixed
---

# Spec review checkpoint

At your table, when you're ready:

1. Does the spec match the epic?
2. Are the acceptance examples there?
3. Is the seam agreed?
4. Is out of scope named?
5. Could someone who wasn't there build from it?

Then the coach adds `spec-reviewed`.

<!--
11:40 · 3 min · outline 48 · the checkpoint coach, after the Part 1 lead's card check. Checkpoints from about 12:00, 15 minutes each, in the order groups are ready. The group's card passes the gate within minutes.
-->

---
layout: data
kicker: After lunch
---

# Same fog, three readings

<SameFog />

<!--
13:25 · 5 min · outline 49.

The epic's seven open points, and how each group has decided them so far. Groups not through the checkpoint show what they have.
-->

---
layout: demo
kicker: Part 2
---

# Where we left the feature

Spec reviewed, slices planned. Now we build.

<DemoCard />

<!--
13:30 · 1 min · outline 50. The Part 2 lead reset the demo to demo/04-sliced before 13:20, so the card is at Slice.
-->

---
kicker: Thread · Checks
---

# Verification closes the loop

The agent runs the checks itself:

- one command that fails with a non-zero exit
- "first, run the tests"

<!--
13:31 · 2 min · outline 51. The skills deck, p13.
-->

---
kicker: Thread · Checks
---

# Verify behaviour at the seams

A small interface, with deep behaviour behind it.

The seam the spec agreed on is where the acceptance examples become tests.

<!--
13:33 · 2 min · outline 52. The skills deck, p14–15.
-->

---
layout: demo
kicker: Station 5 · Build
fallback: demo/04-sliced
---

# Demo: red-green at the agreed seam

One failing .NET test at the agreed seam. Then make it pass.

And next to it, a test that can never fail.

```
/implement   (ticket 1, test-first)
```

<DemoCard />

<!--
13:35 · 5 min · outline 53 · Part 2 lead · Claude Code.

With tdd, one failing test at the menu endpoint: a dish with no declared allergens comes back as unknown, not as an empty list. Show it failing for the right reason, then passing.
Then 30 seconds of the prepared tautological test: "this one can never fail". Never committed.
Then: git reset --hard demo/05-built, "the rest of slice 1, built the same way in rehearsal".

At the end: the other coach starts $code-review in Codex while you present 54–56.
Fallback: jump to demo/05-built.
-->

---
call: yours
kicker: Thread · Checks
---

# Test-first or test-after

Tests as sensors are undisputed. TDD as an agent ritual is contested.

- When you touch an existing rule, characterize it first.
- Record your choice.

<!--
13:40 · 2 min · outline 54. Sources: research/practitioner-landscape-and-evidence.md §4 #10, §6 #1.
-->

---
kicker: Thread · Checks
---

# Green tests ≠ mergeable

About half of agent PRs that pass the tests wouldn't be merged.

Review is where the time goes now.

<!--
13:42 · 2 min · outline 55. Source: research/practitioner-landscape-and-evidence.md §4 #3, §3.2.
-->

---
kicker: Station 6 · Review
---

# Review moves, it doesn't disappear

- The agent verifies first.
- An AI review follows: at most three rounds.
- Human approval is tiered by risk.
- An agent's approval never counts as a person's.

<!--
13:44 · 2 min · outline 56.
-->

---
layout: demo
kicker: Station 6 · Review
call: fixed
fallback: demo/05-built
---

# Demo: a second tool reviews

A different tool reviews the PR on two axes: standards and spec.

Its findings go into `review.md`: act on, consider, noted, dismissed.

<DemoCard />

<!--
13:46 · 4 min · outline 57 · the other coach · Codex CLI, the run started at about 13:40.

Walk through one finding per bucket. Then: git reset --hard demo/06-reviewed, "the act-on fixes, made in rehearsal".
If the run isn't finished: show the round-1 review.md in demo/06-reviewed, from the same skill in the same tool.
Fallback: demo/06-reviewed.
-->

---
layout: title-cards
---

# Make verification repeatable

1. Run the check yourself
2. Embed it in another skill
3. Chain it
4. Run it on every PR

<!--
13:50 · 1 min · outline 58. The skills deck, p16. Turn the check you keep doing by hand into a skill.
-->

---
layout: data
kicker: Thread · Checks
---

# Checks in our CI

<div class="rac-exhibit-pair">
<FileExhibit path=".github/workflows/guard.yml" :lines="26" />
<div class="rac-exhibit rac-exhibit-text">

- **The guard** fails a PR with a `CLAUDE.md`, or a skill whose name isn't its folder's.
- **The reporter** reads every group PR, read-only, after the tests.
- CI enforces what a skill only advises.
- The agent never goes past the production gate.

</div>
</div>

<!--
13:51 · 1 min · outline 59. The guard is read live from this repo.
-->

---
kicker: Station 7 · Ship
---

# A PR body with evidence

- The smallest visual that shows the change
- Before and after, as proof
- A merge-danger call
- The working-out alongside: spec, tickets, review rounds, the how-we-worked note

<!--
13:52 · 2 min · outline 60.
-->

---
layout: demo
kicker: Station 7 · Ship
call: fixed
fallback: demo/06-reviewed
---

# Demo: push and watch

`open-pr` marks the PR ready.

The reporter runs read-only in CI, after the tests, and the card updates minutes later.

<DemoCard />

<!--
13:54 · 3 min · outline 61 · Part 2 lead · Claude Code.

Typed: /how-we-worked (one-line answers), then /open-pr. The body: the Menu page screenshot, the seam tests' names as proof, and the merge danger called low.

Expected: the card at Ship, slice 1 green, by slide 65 (about 14:03).
Fallback: pnpm demo:reset demo/07-shipped.
-->

---
layout: data
kicker: Station 8 · Learn
---

# Mistake twice: which thread? {.rac-q}

<Ribbon mode="threads" />

<div class="rac-below">

Fix the system, not the output, at the highest rung that works: architecture → types → a lint or CI check → a test → an `AGENTS.md` line, last. A repeated procedure becomes a skill.

</div>

<!--
13:57 · 2 min · outline 62. Every lesson lands in one of the three threads.
-->

---
layout: demo
kicker: Station 8 · Learn
fallback: demo/07-shipped
---

# Demo: from retro to a check

Take one repeated mistake from the demo, and make it impossible next time.

The agent twice wrote "no data" as an empty list.

<DemoCard />

<!--
13:59 · 3 min · outline 63 · Part 2 lead · Claude Code.

Show work/demo/how-we-worked.md at the rehearsal's line; say it came from rehearsal.
Typed: "Make it impossible to write unknown as none: allergen info is either unknown or declared, with no default."
Expected: compiler errors at every place that assumed empty means none. Types are the highest rung that works.
Then: demo/08-learned, shown locally, not pushed on stage.
-->

---
kicker: Station 8 · Learn
---

# Measure the team, not the volume

You can't feel your own productivity.

Tomorrow we look at team signals, not lines or tokens.

<!--
14:02 · 1 min · outline 64.
-->

---
layout: demo
kicker: The loop, once more
---

# Done means the lesson is in a thread

- **Read:** `read.md`
- **Explore:** the glossary
- **Specify:** `spec.md`, and the checkpoint
- **Slice:** `issues/`
- **Build:** code and tests
- **Review:** `review.md`
- **Ship:** the PR, with evidence
- **Learn:** a type that makes the mistake impossible

<DemoCard />

<!--
14:03 · 1 min · outline 65. The card at Ship, slice 1 green. The context light is off: "that one is yours this afternoon". We merge once it's green (the Part 1 lead, after the talk).
-->

---
layout: data
kicker: Slice and build by your own route · review block 16:00 · stand-up 16:45
---

# Back to your groups

<Wall />

<!--
14:04 · 1 min · outline 66. Leave the wall projected all afternoon.
-->

---
kicker: Review block
---

# The bottleneck moved here

Agents let people change code without talking to each other.

So the friction has to be rebuilt on purpose. That's why review gets its own block.

<!--
16:00 · 2 min · outline 67.
-->

---
kicker: Review block
call: fixed
---

# Swap tools

- Another group's tool reviews your PR, on standards and spec.
- At most three rounds, into `review.md`, in four buckets.
- Whoever prompted the change is a reviewer too.
- Push by 16:30.

<!--
16:02 · 3 min · outline 68. Reviews run 16:05–16:30.
-->

---
layout: data
kicker: Review block · then mark ready and merge by 16:45
---

# What the reviewers found

<div class="rac-stack">
  <ReviewersFound />
  <Tonight />
</div>

<!--
16:35 · 3 min · outline 69.

Findings by bucket for each group. A finding that repeats goes on the list for Day 2. Then the checklist: push what's missing, mark the PR ready, and merge with CI green by 16:45. The merge is the day's last push.
-->

---
layout: data
kicker: Stand-up · three minutes per group
---

# Stand-up

<v-switch>
  <template #0><StandupCard group="group-a" /></template>
  <template #1><StandupCard group="group-b" /></template>
  <template #2><StandupCard group="group-c" /></template>
</v-switch>

<!--
16:45 · 10 min · outline 70. Click to the next group.

Three minutes each, on your own ribbon: the route you took, what worked, and one thing the agent got wrong twice.
-->

---
kicker: Before you go
---

# Bring one task tomorrow

Note one repetitive task from your real job, on the card.

It's your input for tomorrow's skill lab.

<!--
16:55 · 2 min · outline 71. Hand out the cards.
-->

---
kicker: Before you go
---

# What happens tonight

Your merge was the day's last push.

Overnight, a coach drafts the retrospective from your PRs, your working-out and our log.

Tomorrow at 09:00 you check it. It's a draft, and you'll correct it.

<!--
16:57 · 1 min · outline 72. End of Day 1 at 17:00.
-->
