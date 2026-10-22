---
layout: data
kicker: Day 2 · the retrospective
---

# How this was made

<HowThisWasMade />

<!--
09:00 · 2 min · outline 73. The retrospective view must load before the doors open (08:30 check).

Overnight, the retrospective lead ran the synthesis on everything you pushed, the PR timelines, the deck's observations and our log. Every claim has its evidence. It's a draft: you correct it.
-->

---
kicker: Day 2 · the retrospective
---

# How fast did it feel? {.rac-q}

Hands up first: how much faster were you yesterday, with your agent?

Experienced developers were 19% slower with early-2025 AI tools, and believed they had been 20% faster.

You can't feel your own productivity.

<!--
09:02 · 3 min · outline 74. The show of hands comes before any data; reveal the second paragraph after it. Said once, in general, never about this room. Source: METR's 2025 RCT, research/practitioner-landscape-and-evidence.md §4 #2.
-->

---
layout: data
kicker: Day 2 · the retrospective
---

# Three routes

<RetroRoutes />

<!--
09:05 · 6 min · outline 75.

One lane per group across the afternoon: where each group forked, and where its time went. ‖ is when the checkpoint coach added spec-reviewed. A dashed block is one the synthesis is less sure of. Routes, not a race.
-->

---
layout: data
kicker: Day 2 · the retrospective
---

# Is this you? {.rac-q}

<IsThisYou />

<!--
09:11 · 5 min · outline 76.

Each group gets the claim about itself the synthesis is least sure of. Yes or no? Type a correction into .live/data/retrospective.json (isThisYou → correction) and save: the slide updates. Publish the corrected file afterwards with pnpm retro --publish.
-->

---
layout: data
kicker: Day 2 · the retrospective
---

# Same fog, three readings, revisited

<DecisionsRevisited />

<!--
09:16 · 5 min · outline 77. The final decision grid. ↺ marks a call that caused rework after the checkpoint: a spec change after the label, slices replanned.
-->

---
layout: data
kicker: Day 2 · the retrospective
---

# Team signals, not volume

<TeamSignals />

<!--
09:21 · 6 min · outline 78.

Time from intent to spec, spec rework, first-pass CI, review rounds, and drift between plan and diff. Groups in fixed columns, no totals, no colour scale. Computed by a script from git and GitHub, never by the model.
-->

---
layout: data
kicker: Day 2 · the retrospective
---

# How each group drove its agent

<HowGroupsDrove />

<!--
09:27 · 5 min · outline 79. Read along the threads: the context each group wrote, the skills that ran, the checks it added. Who steered at the one computer, in the group's own words. Side by side, never contrasted; tool differences are anecdotes (n = 3).
-->

---
layout: data
kicker: Day 2 · the retrospective
---

# Where the agent went wrong

<MistakesOnStations />

<!--
09:32 · 5 min · outline 80. Each mistake on the station where it started, with its origin: missing context, a gap in the spec, a missing check, or something review missed. "twice" marks a repeat.
-->

---
layout: data
kicker: Day 2 · the retrospective
---

# Hand-off: wrong twice

<WrongTwice />

<!--
09:37 · 3 min · outline 81. What went wrong twice, across groups, by the thread where a fix could live. No suggested actions: the pairs choose the fix in the lab. 5 min of slack until 09:45.
-->

---
kicker: Day 2 · the skill lab
---

# Back into a thread

Your input: the shortlist, tagged context, skill or check, and the task you brought yesterday.

- Pairs of two or three, with at least two different tools. Mix your Day 1 groups.
- Take the first task that fits: a "wrong twice" item that matches your card, a verification task from a card, or any card you can prove on Forkful in 60 minutes.
- A coach confirms the task before you build.

<!--
09:45 · 3 min · outline 82. Back to slide 22: the gap is expertise. The cards are on the table, sorted by thread overnight. Coaches sort, never assign. Pairs form at about 09:58.
-->

---
kicker: Day 2 · the skill lab
---

# Pick the rung

For a mistake, the highest fix that works, and say why not higher:

1. Architecture: the mistake can't be made
2. Types: the compiler rejects it
3. A check: lint or CI fails, naming the fix
4. A test: it catches it after the fact
5. An `AGENTS.md` line: last, because a rule in a doc fails silently

A repeated procedure becomes a skill. Prove the fix fails on the real mistake.

<!--
09:48 · 3 min · outline 83. The demo did this on slide 63: types, not a test.
-->

---
kicker: Day 2 · the skill lab
---

# Verification skills first

They had the biggest measured effect on output quality.

- Build and test wrappers
- UI checks
- Migration rules

<!--
09:51 · 2 min · outline 84. Source: research/anthropic-playbook-and-skills.md §6 #2.
-->

---
kicker: Day 2 · the skill lab
---

# Writing a skill that fires

The description says *when* to fire.

- Only the six portable frontmatter fields
- Grow the gotchas from real failures, not from guesses

<!--
09:53 · 3 min · outline 85. The handout is docs/skill-lab.md; the TESTS.md template is docs/tests-md-template.md.
-->

---
layout: title-cards
---

# Test it like code

1. Three prompts that **should** fire it
2. Three that **shouldn't**
3. One run **with and without** the skill
4. In a fresh session, **in a second tool**

<!--
09:56 · 2 min · outline 86. The pair's two tools are the second tool. Record it in TESTS.md: the library list reads its ticked columns.
-->

---
layout: data
kicker: Lab · 10:00–11:00 · open your PR into main by 10:50
---

# Lab

<LibraryList />

<!--
10:00 · 60 min · outline 87. Coaches run node scripts/library-list.mjs --watch 30.

Timebox: 10:00 pair, task, coach confirms · 10:10 build · 10:35 prove it in both tools · 10:50 gh pr create --base main --template lab.md · 11:00 stop: unfinished goes into the plan. Each PR appears here as it opens. In the 11:00 break, coaches merge what clears the bar.
-->

---
layout: data
kicker: Show and tell · two minutes per pair
---

# Show and tell

<LibraryList />

<!--
11:15 · 15 min · outline 88. No live runs: open each pair's PR at its Proof section. What it catches, the fix level and why not higher, the trigger result in both tools. In the order the PRs were opened. Last 5 minutes: "Where did the two tools disagree?"
-->

---
kicker: Day 2 · the action plan
---

# What you take home

- The skill library: what you merged this morning, in every tool
- The `AGENTS.md` template
- The reporter skill
- The action plan we're about to write

<!--
11:30 · 2 min · outline 89. Within a week: the takeaway repo, transferred to you, and one follow-up mail.
-->

---
kicker: Day 2 · the action plan
---

# Expect a dip first

Expect a J-curve before the gains: a temporary drop, and more failed changes, before it pays off.

Adoption spreads through people. Start by redoing your own commits with an agent.

<!--
11:32 · 3 min · outline 90. Source: DORA's ROI report, research/practitioner-landscape-and-evidence.md §3.2.
-->

---
layout: data
kicker: A route row and three thread rows · a quick win and a longer step each, with an owner
---

# Your harness, your route

<ActionPlanGrid />

<!--
11:35 · 2 min · outline 91. The ribbon as a grid. Each Day 1 group takes one thread row (a coin decides a clash); the route row is filled together. Prefilled from the retrospective's hand-off.
-->

---
layout: data
kicker: Each group drafts its row with its agent, in docs/action-plan/<thread>.md, as a PR into main
---

# Fill the grid

<ActionPlanGrid />

<!--
11:37 · 25 min · outline 92. A coach runs node scripts/action-plan.mjs --watch 15 and merges each row PR as it lands, so the grid fills live. Another coach types the route row with the room. If a group's agent stalls, type its row into the file directly.
-->

---
kicker: Day 2 · the action plan
---

# Our AI stance

- What's allowed?
- What's expected?
- Which tools?
- How do we disclose it?
- A human always approves.

<!--
12:02 · 3 min · outline 93. Type the room's first answers into the plan's section 2.
-->

---
kicker: Day 2 · the action plan
---

# Measure it

Pick two or three team signals to watch for a month.

No leaderboards.

<!--
12:05 · 2 min · outline 94. Typed into the plan the same way.
-->

---
layout: data
kicker: Vote · an owner and a review date for each winner · commit the plan
---

# Owners and dates

<ActionPlanGrid />

<!--
12:07 · 7 min · outline 95. Dot vote on each row's candidates; each winner gets an owner and a review date, the rest go to Parked. The room chooses the plan owner. Commit the plan at about 12:10: the winners stay bright here.
-->

---
kicker: Day 2
---

# The loop closes

We started from a map with a foggy destination. Its next intent: the takeaway repo within a week, and one follow-up mail.

Thank you.

<!--
12:14 · 1 min · outline 96. Back to slide 5's map.
-->

---
kicker: Closing round
---

# What changes on Monday? {.rac-q}

One sentence each: what changes in how you work, starting Monday.

<!--
12:15–12:30 · 15 min · the closing round, after outline 96. It mirrors the opening round. Then lunch together.
-->
