# Storyline B: concept by concept (rough outline)

Prototype for [Storyline B: concept by concept](../issues/11-storyline-b-concept-by-concept.md). It's a throwaway outline to react to, in the same format as [Storyline A](storyline-a.md), so [Choose the storyline](../issues/12-choose-the-storyline.md) can put the two side by side.

**Revised 22 Oct after Matthias's reaction.**

- **A general opener.** The opener and the talk now open on AI-assisted development in general. The skills deck's own opening ("the real gap is expertise, not intelligence" and the failure modes) now opens the skills concept, and its wayfinder pages move to the specs concept. The meta opener still shows how this workshop was built, but in plain words rather than wayfinder's mechanics.
- **The outline follows the tickets resolved since the first draft**: the case brief (Forkful, one computer per group, no stakeholder), how groups work in the repo, the reporter's live views and retrospective outline, and the skill library.
- **Slide numbers from the kickoff to the stand-up are unchanged** (54–73), so the B column in the [reporter sketch](reporter-and-retrospective.md) still points at the right slides.

**Source keys.** § is a section of a note and # is a numbered item within that section.

- **AP**: [research/anthropic-playbook-and-skills.md](../research/anthropic-playbook-and-skills.md)
- **PT**: [research/pocock-and-tan.md](../research/pocock-and-tan.md)
- **PL**: [research/practitioner-landscape-and-evidence.md](../research/practitioner-landscape-and-evidence.md)
- **SP**: [research/skill-portability.md](../research/skill-portability.md)
- **GA**: [research/agents-in-github-actions.md](../research/agents-in-github-actions.md)
- **CD pN**: page N of the colleague's skills deck (kept local, not in the repo)
- **ticket NN**: a resolved ticket in [issues/](../issues/)
- **map**: [map.md](../map.md)

**Min** is whole minutes of room time, and a demo or exercise row carries its full duration. **Live-deck hook** is `—` when the slide is static.

---

## 1. Throughline

1. Writing code got cheap. Deciding, verifying and reviewing still run at human speed, and AI amplifies whatever a team already does, good or bad (AP §4 #1; PL §4 #1, #4).
2. So the team's work moves into the harness around the agent: six layers (context, skills, specs, checks, review, team habits). Each layer is either a guide that steers the agent or a sensor that catches it (PL §1, Böckeler).
3. Each layer gets one idea, one short demo and one exhibit from this workshop's own repo. The afternoon builds the layers into Forkful, and Day 2 makes them the team's own.

---

## 2. Outline per agenda block

### Opener

General on purpose: what changed, why we're here, and how this workshop was built. Slide 7 is the only slide specific to B.

| # | Slide title | One-line intent | Min | Source | Live-deck hook |
|---|---|---|---|---|---|
| 1 | Raccoons × Dynatos: AI-assisted development | Title slide: the two coaches, and the day and a half in one line | 1 | — | Footer shows "last update from GitHub: hh:mm", so the room sees the deck is live |
| 2 | Why we're here | Lift the whole team a level together, not crown the fastest individual. Sceptics are welcome as the safety net | 2 | PL §1 (Majors), §6 #8 | — |
| 3 | Show us your setup | Setup round: your tool, your IDE, and one thing you trust an agent with and one you don't. Then clone your group's branch and check `gh auth status` | 15 | map Notes; ticket 13; ticket 16 | — |
| 4 | Agents are here | Two-thirds of developers who use AI now use coding agents, most of them daily. The question isn't whether, it's how a team works with them | 2 | PL §3.3 (Stack Overflow 2026) | — |
| 5 | This workshop was built the way we'll teach | The repo you're about to open PRs on holds the whole plan, made with agents: what we knew on Monday, the decisions we made, what we left out on purpose | 3 | map.md | Renders `map.md`: decisions so far, what's still open |
| 6 | The trail in the repo | One decision, its research note, and the PR that built from it. Agents wrote; we decided and reviewed. The commits are the audit trail | 2 | AP §1, §4 #2 | The repo's PR list, pulled live from GitHub |
| 7 | Six layers, one exhibit each | B's table of contents: context, skills, specs, checks, review, team. Each has an exhibit from this repo | 1 | PL §1 (harness) | Six layer cards, empty: "they fill in from your PRs this afternoon" |
| 8 | Today and tomorrow | The agenda: where the case, the spec review checkpoint and the stand-up fall | 1 | ticket 17 (open) | — |

### Talk + live demo (≈90 min)

Six concepts, each a short talk plus at most one live demo, five demos in all. The demos run on this repo or on a sibling story in Forkful, never on the groups' epic.

| # | Slide title | One-line intent | Min | Source | Live-deck hook |
|---|---|---|---|---|---|
| | **Why a harness** | | | | |
| 9 | Code is no longer the bottleneck | Building got fast. Deciding, verifying and reviewing still run at human speed | 2 | AP §4 #1, §1 | — |
| 10 | AI is an amplifier | Throughput goes up and stability goes down. The speed fades and the complexity stays. Whatever your team already does gets louder | 2 | PL §4 #1, #4 | — |
| 11 | A capable new hire who forgets everything | The agent knows a lot in general and nothing about your team. Whatever it needs from you has to be in the repo | 2 | PT §2.2 (Pocock and Tan agree) | — |
| 12 | Guides and sensors | Guides steer before the agent acts: context, skills, specs. Sensors catch it afterwards: checks, review. The team keeps the harness alive. Humans fix the harness, not the output | 2 | PL §1 (Böckeler, Morris) | The six layer cards, tagged guide, sensor or team |
| | **1 · Context** | | | | |
| 13 | Day one for a new hire | AGENTS.md is the one page the agent reads every session. What would you tell a new colleague first? | 2 | PT §2.2; AP §2 Stage 3 (CLAUDE.md) | Layer card 1 highlighted |
| 14 | More context isn't better | Committed config came with half the complexity growth. Bloated context files cost over 20% more for no gain, and 74% of committed config is never touched again. So keep it short, non-inferable and owned | 2 | PL §4 #5, §5 (team harmonisation) | — |
| 15 | Demo (live): `/init` vs what we kept | Run `/init` on this repo, then put the result next to our hand-cut root AGENTS.md and the 50-line skeleton you'll fill this afternoon | 4 | PL §6 #3; PT §1.4; ticket 16 (AGENTS.md skeleton) | Exhibit: this repo's AGENTS.md |
| 16 | One file, every tool | One root AGENTS.md and no CLAUDE.md. Each tool's `/init` writes its own file, so improve AGENTS.md instead. Visual Studio and JetBrains Copilot ignore it | 2 | SP §1c, §3 gotchas 1, 2, 6 | — |
| 17 | Shared language | A glossary of the domain's words, one word per concept, in the code and in conversation. Exhibit: our own glossary. You'll write `case/GLOSSARY.md`, and the grill writes most of it | 2 | CD p9; PT §1.3 (domain-modeling); ticket 16 | Exhibit: this repo's glossary |
| | **2 · Skills (the skills deck)** | | | | |
| 18 | The real gap is expertise, not intelligence | The skills chapter's anchor: the model is smart, and skills carry your team's expertise to it | 2 | CD p2 | Layer card 2 highlighted |
| 19 | Failure modes | It built the wrong thing, it's too verbose, it left a ball of mud. Grilling, shared language, deep modules and tests answer them, and each of those is a skill | 1 | CD p3; PT §1.1 | — |
| 20 | A skill is a folder, not a prompt | The anatomy of a SKILL.md, with the `review-feature` example. `name` equals the folder name, and the description says *when* to fire | 2 | CD p5; AP §3.1, §4 #10 | — |
| 21 | Progressive disclosure | Name and description are always loaded, the body loads when the skill triggers, resources load on demand | 1 | CD p4; AP §3.2 | — |
| 22 | How a skill fires | By name (`/name`, or `$name` in Codex) or through its description. AGENTS.md holds conventions; SKILL.md holds procedures | 1 | CD p6; SP §1a | — |
| 23 | Demo (live): a one-sentence skill, two tools | Write `in-your-own-words` in `.agents/skills`, then run it on a Forkful story in Claude Code and in Codex or Copilot | 4 | PT §2.3, §4 #2; SP §2 | — |
| 24 | From my toolkit to your library | The everyday toolkit next to the workshop library: `read-issue`, `grill-with-docs`, `to-spec`, `to-tickets`, `implement` with `tdd`, `code-review`, `open-pr`, plus `how-we-worked` | 2 | CD p10; ticket 16 | Exhibit: this repo's `.agents/skills` |
| 25 | A skill is an advisory control | A skill makes mistakes rare; only a check makes them near-impossible. That's layer 4 | 1 | AP §4 #6, §6 #4 | — |
| 26 | One skill, every tool | Use the six spec fields only. `.agents/skills` is canonical, with generated links for Claude Code. Name skills in plain text | 1 | SP §2, §3 gotchas 14–15 | — |
| | **3 · Specs** | | | | |
| 27 | Decide before an agent builds | The spec is where the group decides, and it's reviewed before any agent builds | 1 | AP §2 Stage 2; ticket 08 | Layer card 3 highlighted |
| 28 | Read the whole ticket | Read all of it, separate facts from questions, and make decisions explicit. `read-issue` pulls the issue in | 2 | CD p8; ticket 16 | — |
| 29 | Grilling in rounds | Numbered questions, each with a recommended answer. Facts are the agent's job; decisions are yours. Turn the effort setting down | 2 | PT §1.3 (grilling), §4 #1, §6 #8 | — |
| 30 | Demo (live): grill with docs | `grill-with-docs` on a sibling story in Forkful. A coach plays product, since the case has no stakeholder, and the glossary grows as we answer | 5 | PT §4 #1; ticket 08 | — |
| 31 | Which approach should I use? | A clear task: just build it. One conversation's worth: grill. Fog across several sessions: wayfinder | 1 | CD p24; AP §5 (conflict 5) | — |
| 32 | Fog bigger than one session | Wayfinder, the skill behind this morning's map: start foggy, use four ticket types, let the map grow. It's optional for groups; keep it to about five tickets | 3 | CD p18–21; PT §1.3 (wayfinder); ticket 16 | — |
| 33 | From spec to vertical slices | One user outcome, a full path through the layers, demoable on its own. The acceptance examples and the test seam are agreed in the spec | 2 | CD p12; PT §4 #3, §6 #6 | — |
| 34 | Two schools | Pocock plans up front (grill, spec, tickets). Tan treats code as the spec (prototypes, small verifiable PRs). They agree that agents forget, on slices, and on designing it twice | 2 | PT §2.5, §5 | — |
| | **4 · Checks** | | | | |
| 35 | Rules that must hold | A rule in a doc fails silently. Make it a type, a lint rule, a test or a CI step | 1 | PT §5 #13; PL §2 #4 | Layer card 4 highlighted |
| 36 | Give the agent a feedback loop | One command that exits non-zero, listed in AGENTS.md with an example of healthy output. "First run the tests." "Verified" is part of "done" | 2 | AP §2 Stage 4; PL §5 (test automation) | — |
| 37 | Fix the harness, not the output | A mistake made twice becomes a check whose error names the fix. Tan's ladder: architecture → types → lint or CI → test → docs last | 2 | PT §2.3 (`/correct`); PL §2 #2; AP §4 #12 | — |
| 38 | Demo (live): a check the agent can't ignore | This repo's CI guard (no CLAUDE.md, skill name equals folder): break it on purpose and watch the agent hit the check and correct itself | 4 | SP §2 (CI guard); PL §1 (Huntley) | — |
| 39 | Portable vs tool-specific | CI and branch protection work for every tool. Hooks, `/verify` and Stop hooks are "what this looks like in Claude Code" | 1 | AP §6 #6 | — |
| 40 | Exhibit: an agent in our CI | The reporter reads every group PR, read-only, and outputs JSON. It observes and never coaches. A separate job with no key publishes it to the deck | 2 | GA §2.1; ticket 14 | A demo card on the wall |
| | **5 · Verification and review** | | | | |
| 41 | The job is proving it works | Verification, not typing, is the bottleneck. At Anthropic, verification skills moved output quality more than any other kind | 1 | PL §2 #1; AP §4 #8; PT §5 #10 | Layer card 5 highlighted |
| 42 | Verification closes the feedback loop | Change, verify (tests plus the real workflow), feed back, repeat. Verify behaviour at the seams | 2 | CD p13–14 | — |
| 43 | Deep modules and seams | A small interface with deep behaviour. The seam the spec agreed on is where the acceptance examples become tests | 1 | CD p15; PT §6 #6 | — |
| 44 | Demo (live): red-green at the agreed seam | One failing .NET test at the sibling story's seam, then make it pass. Show a tautological test next to a real one | 4 | PT §4 #4 | — |
| 45 | Test-first or test-after | Tests as sensors are undisputed; TDD as an agent ritual is contested. Characterize an existing rule before you touch it. Record your choice in the working-out | 2 | PL §4 #10, §6 #1; ticket 16 | — |
| 46 | Green tests ≠ mergeable | About half of agent PRs that pass the tests wouldn't be merged. Review moves; it doesn't disappear | 2 | PL §4 #3, #9 | — |
| 47 | The review kit | REVIEW.md. A PR template with what and why, how it's tested, how to revert, and the merge danger. Review by another group's tool, at most three rounds, in `review.md`. A human always approves | 2 | PL §5; AP §2 Stage 5; ticket 16 | — |
| 48 | Make verification repeatable with a skill | Write down the correction you keep making, phrase it in plain English, make it a skill, run it on a fresh task, then chain it | 1 | CD p16; AP §3.6 | — |
| | **6 · Team** | | | | |
| 49 | The harness is a team asset | Curated shared instructions are at Adopt; everyone prompting from scratch is the anti-pattern. Every layer gets an owner and a review date | 2 | PL §1 (Radar), §5 (RAMP) | Layer card 6 highlighted |
| 50 | Rebuild the friction you removed | Agents let people change code without talking to each other. Spec reviews, stand-ups and walkthroughs matter more now, not less | 2 | PL §5 (Ronacher) | — |
| 51 | Keep learning while you delegate | Juniors scored 17% lower on mastery, except those who kept asking why. At the one computer, let the least experienced person drive and explain the diff | 2 | PL §4 #8, §6 #5; ticket 08 | — |
| 52 | Measure the team, not the volume | You can't feel your own productivity. Tomorrow we look at team signals, not lines or tokens | 2 | PL §4 #2; ticket 14 | — |
| 53 | Six layers, one afternoon. Questions? | Recap: one guide or sensor per layer, and this afternoon you add each one to Forkful. `/grilling` mode: enabled | 2 | CD p27 | The six layer cards, still empty |

### Case kickoff

| # | Slide title | One-line intent | Min | Source | Live-deck hook |
|---|---|---|---|---|---|
| 54 | Your epic | Group orders for the office lunch, as a GitHub issue in Forkful | 3 | ticket 08 | — |
| 55 | Forkful today | What's there: a .NET 10 API and a React 19 app, about 2,000 lines, what already works, and the tests that exist | 2 | ticket 08 | — |
| 56 | What's missing on purpose | No `case/AGENTS.md`, no glossary, thin tests. You add the layers | 2 | ticket 08 | Six empty layer cards per group |
| 57 | Putting the layers in order | Read, explore, specify, build and verify, then PR. The library's skills for each step | 2 | CD p7; ticket 16 | — |
| 58 | What's fixed, what's yours | **Fixed:** a draft PR within 30 minutes, the checkpoint before you build, review by another group's tool (at most three rounds), how-we-worked before every push, and the merge before the stand-up. **Yours:** how you explore (grill, wayfinder with about five tickets, or prototype first), how big the spec is, how you slice, test-first or test-after, who drives, and every product decision | 3 | tickets 08, 13, 14, 16 | — |
| 59 | Done tonight, layer by layer | Context: `case/AGENTS.md` and a glossary. Skills: the ones you used, and any you wrote. Specs: a reviewed spec and slice tickets. Checks: slice 1 green in CI. Review: a reviewed, merged PR. Team: the working-out with a how-we-worked note. Nobody finishes the epic | 2 | ticket 08 (done); ticket 13 | Each layer on a group's card turns green as its artifact appears |
| 60 | How you work together | One computer per group, and who decides is up to you. Now and then, let the least experienced person drive and explain the diff | 2 | ticket 08; PL §6 #5 | — |
| 61 | House rules | Start the agent at the repo root. Improve AGENTS.md instead of running `/init`. Name skills in plain text. Turn the effort setting down for grilling. One tool per group, ideally a different one per group | 2 | SP §3 gotcha 2; PT §6 #8; ticket 14 | — |
| 62 | The deck reads your PR | The reporter observes and never coaches. Run how-we-worked before every push. Coaches keep a log about groups. Tomorrow's retrospective is a draft, and you'll correct it | 1 | ticket 14 (what the kickoff has to say) | — |
| 63 | Groups, go | `open-pr` opens your draft PR within 30 minutes and puts your group on the wall | 1 | ticket 13 | Group cards appear on the wall as the draft PRs open |

### Day 1 PM interludes

Minutes here are slide time only. The coaches' time at each group's table isn't counted.

| # | Slide title | One-line intent | Min | Source | Live-deck hook |
|---|---|---|---|---|---|
| | **Spec review checkpoint** | | | | |
| 64 | Spec review checkpoint | **Fixed.** A coach walks through the spec with the group: does it match the epic, are the acceptance examples there, is the seam agreed, is out of scope named, could someone who wasn't there build from it? Then the coach adds `spec-reviewed` | 3 | AP §4 #5; PT §3.3, §6 #6; ticket 14 | The wall: the group's layer 3 card turns green |
| 65 | Same fog, three readings | A plenary look at the epic's seven open points and how each group decided them | 3 | ticket 14 (decision grid) | Live: the seven-point decision grid for the three groups |
| | **Review block** | | | | |
| 66 | The bottleneck moved here | Why review gets its own block, and a reminder of the review kit (slide 47) | 2 | PL §6 #2 | — |
| 67 | Swap tools | Another group's tool reviews your PR on standards and spec, at most three rounds, into `review.md` with four buckets. Whoever prompted the change is a reviewer too | 3 | PT §4 #6; ticket 16 (review kit) | — |
| 68 | The highest-value minute | Read the diff and predict what could still fail | 1 | PL §6 #5 (Osmani) | — |
| 69 | What the reviewers found | Findings by bucket for each group. A finding that repeats goes on the list for Day 2. Then each group merges before the stand-up | 3 | ticket 14; ticket 13 (merge) | Live: "What the reviewers found" |
| | **End-of-day stand-up** | | | | |
| 70 | Six layers per group | The morning's layer cards, now filled from each group's PR | 2 | ticket 14 | The layer cards, filled |
| 71 | Stand-up | Three minutes per group: which layer helped most, and one thing the agent got wrong twice | 9 | PL §5 (rebuild the friction) | Live: the stand-up card for each group |
| 72 | Tonight | Run how-we-worked and push. A coach synthesises the retrospective overnight | 1 | ticket 14; GA §5 | Live: "Tonight", with a checklist for the working-out |
| 73 | Bring one task tomorrow | Each participant notes one repetitive task from their real job, as input for the skill lab | 2 | map (Not yet specified: Day 2 skill lab) | — |

### Day 2 retrospective

Ticket 14's outline, with its middle sections recut as the six layers.

| # | Slide title | One-line intent | Min | Source | Live-deck hook |
|---|---|---|---|---|---|
| 74 | How this was made | What the overnight synthesis read, and how sure it is | 2 | ticket 14 | The retrospective view loads |
| 75 | Three routes | One swimlane per group: where each group's hours went | 5 | ticket 14 | Live: swimlanes from the overnight synthesis |
| 76 | Is this you? | Each group confirms or corrects the claim about itself that the synthesis is least sure of | 5 | ticket 14 | Live |
| 77 | Team signals, not volume | Time from intent to spec, spec rework, first-pass CI, review rounds, and drift between plan and diff. Groups in fixed columns, no totals | 7 | ticket 14; AP §6 #1; PL §4 #2 | Live |
| 78 | Layers 1–2: context and skills | What each group put in AGENTS.md and its glossary, and which skills fired or got written | 4 | ticket 14 | Live, one column per group |
| 79 | Layer 3: same fog, three readings, revisited | The final decision grid, and which checkpoint calls caused rework later | 5 | ticket 14; AP §2 Stage 2 | Live |
| 80 | Layers 4–5: checks and review | Tests before or after the code, the checks added, and the review finding that mattered most | 4 | ticket 14 | Live, one column per group |
| 81 | Layer 6: team | Who steered at the one computer, with each group's own words next to its timeline and no contrast drawn | 3 | ticket 14 | Live |
| 82 | Where the agent went wrong | Each mistake placed in the layer where it started: missing context, a gap in the spec, a missing check, or something review missed | 5 | ticket 14 | Live |
| 83 | Hand-off: wrong twice | The shortlist of repeated mistakes, each tagged with the layer where a fix could live | 2 | ticket 14 | Live: the shortlist |

### Day 2 skill lab

| # | Slide title | One-line intent | Min | Source | Live-deck hook |
|---|---|---|---|---|---|
| 84 | Put your expertise in the repo | The input: the retrospective's shortlist and the tasks you brought, such as porting `read-issue` to Jira. Back to slide 18 | 2 | ticket 14; ticket 16; CD p2 | The shortlist |
| 85 | Which layer does it belong in? | An AGENTS.md line, a skill, a check, or nothing. Take the highest rung that works, and prove the fix fails on the real mistake | 3 | PT §4 #8, §2.3; AP §4 #6 | — |
| 86 | Verification skills first | They had the biggest measured effect. For example: build and test wrappers, UI checks against a mock, migration rules | 2 | AP §6 #2, §3.6; CD p16 | — |
| 87 | Writing a skill that fires | The description says when to fire. Use only the six portable fields, and grow the gotchas from real failures | 3 | AP §3.3; SP §3 (gotchas 12–15) | — |
| 88 | Lab | Cross-tool pairs each build one skill, check or AGENTS.md change for their real work | 40 | map Notes (takeaways); PT §3.3 | — |
| 89 | Test it like code | Three prompts that should fire it, three that shouldn't, and one with/without comparison, in a fresh session and in a second tool | 10 | AP §3.5, §6 #5 | — |
| 90 | Ship it to the library | A PR into `.agents/skills`, with the CI guard on name and folder, and a named owner | 3 | SP §2; ticket 16 | Each library PR appears on the deck |
| 91 | Show and tell | Two minutes per pair: what it catches, and proof that it works | 12 | — | Live: the library list |

### Day 2 action plan

| # | Slide title | One-line intent | Min | Source | Live-deck hook |
|---|---|---|---|---|---|
| 92 | What you take home | The skill library, the AGENTS.md template, the reporter skill, and the action plan we're about to write | 2 | map Notes | The live library list |
| 93 | Expect a dip first | A J-curve comes before the gains, and adoption spreads through people | 3 | PL §3.2 (DORA ROI), §3.3 (Microsoft) | — |
| 94 | Six layers × your team | The plan is a grid: one quick win, one longer step and one owner for each layer | 2 | map (Not yet specified: action plan format) | The grid, prefilled from the retrospective's hand-off |
| 95 | Fill the grid | Groups take two layers each and propose the quick win and the longer step | 15 | PL §6 | The grid fills as it's committed |
| 96 | Our AI stance | What's allowed, what's expected, which tools, disclosure, and a human always approves | 3 | PL §5 (DORA capability #1, Ghostty) | — |
| 97 | Measure it | Pick two or three team signals to watch for a month. No leaderboards | 2 | PL §5; ticket 14 | — |
| 98 | An on-ramp for everyone | Start by redoing your own commits with an agent. Uneven adoption is a feedback-loop problem, not a people problem | 2 | PL §1 (Hashimoto, Majors) | — |
| 99 | Owners and dates | Vote, give each item an owner and a review date, and commit the plan as a file | 5 | PL §5 (owner, cadence) | The committed plan appears |
| 100 | One last round | `/grilling` mode: enabled. Thanks | 1 | CD p27 | — |

---

## 3. Totals per block

| Block | Slides | Min | Of which live demo or exercise |
|---|---|---|---|
| Opener | 8 | 27 | 15 (setup round; 12 min without it) |
| Talk + live demo | 45 | 90 | 21 live demo |
| Case kickoff | 10 | 20 | — |
| Day 1 PM interludes | 10 | 29 | 9 (stand-up). Slide time only |
| Day 2 retrospective | 10 | 42 | — |
| Day 2 skill lab | 8 | 75 | 62 (lab, testing, show and tell) |
| Day 2 action plan | 9 | 35 | 15 (exercise) |
| **Total** | **100** | **318** | |

Inside the talk, the minutes split as: why a harness 8, context 12, skills 15, specs 18, checks 12, verification and review 15, team and close 10.

---

## 4. Strengths and weaknesses

**Strengths**

1. **The structure is the takeaway.** Each layer maps to something Dynatos keeps: the AGENTS.md template, the skill library, a spec and its checklist, CI checks, the review kit, and the action plan, whose grid is the same six rows. After the workshop the deck still works as a reference.
2. **One frame from the first morning to the last slide.** The six layer cards appear empty in the opener, fill from the group PRs in the afternoon, and give the retrospective and the action plan their rows. "Where the agent went wrong" lands each mistake in a layer, and the skill lab fixes it in a layer.
3. **Room for the evidence and the debates, tool-agnostic by design.** Each concept carries its own evidence and disagreement (does AGENTS.md help, is TDD worth it, who reads every line), plus a "portable vs what it looks like in Claude Code" split. Review gets its own concept. The five demos are short and independent, so one failing doesn't sink the rest.

**Weaknesses**

1. **No end-to-end story before the hands-on.** The morning never shows one feature going from foggy issue to PR. The order of steps only arrives at the kickoff (slide 57), so groups may know the parts but not the sequence, and lose time in their first hour.
2. **The skills deck is split across chapters.** The skills chapter keeps p2–6 and p10 together, but p8, p12, p18–21 and p24 sit in specs, p9 in context and p13–16 in verification. "The same skills content" holds slide by slide, not as one chapter its author can present.
3. **Theory-heavy, and late on the biggest lever.** That's 90 minutes of six concepts, with five demos to switch between, before anyone touches the case. Verification, the strongest lever in the research, arrives around minute 65. Checks and CI feel abstract before participants have felt the pain they solve.

## Assumptions in this draft (to react to)

- **How the colleague's deck is used:**
  - p2–3 open the skills chapter, not the talk.
  - p4–6 and p10 complete the skills chapter, and p27 closes the talk and Day 2.
  - p8, p12, p18–21 and p24 go in specs: the wayfinder pages explain this morning's map there, so the opener doesn't have to.
  - p9 goes in context, p13–16 in verification, and p7 in the kickoff.
  - Unused: p1, p11 (their larger-ticket flow), p22–23 (`implement-spec` isn't in the Day 1 library, ticket 16), and p25–26.
- **The demos avoid the groups' epic.** Context and checks demo on this repo. Skills, specs and verification use a sibling story in Forkful, picked with the coach notes in hand so it gives nothing away.
- **A coach plays product in the live grill**, since the case has no stakeholder (ticket 08).
- **The fixed gates and "yours" list (slide 58) are the same as Storyline A's.** They come from tickets 08, 13, 14 and 16, not from the storyline.
