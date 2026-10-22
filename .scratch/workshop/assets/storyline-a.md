# Storyline A: one feature through the lifecycle (rough outline)

Prototype for [Storyline A: one feature through the lifecycle](../issues/10-storyline-a-one-feature-through-the-lifecycle.md). It's a throwaway outline to react to, in the same format as [Storyline B](storyline-b.md), so [Choose the storyline](../issues/12-choose-the-storyline.md) can put the two side by side.

**Revised 22 Oct after Matthias's reaction.**

- **Context, skills and checks each get one home.** Each is taught once, completely, in a chapter placed where the feature first needs it, and is no longer scattered across stages. Learn sends every lesson back into one of the three.
- **The groups get freedom.** A few gates are fixed, and everything between them is marked **Your call**. The demo takes one route and names the alternatives at each fork.
- **The outline follows the tickets resolved since the first draft**: the case brief (Forkful, one computer per group, no stakeholder), how groups work in the repo, the reporter's live views and retrospective outline, and the skill library.

**Source keys.** § is a section of a note and # is a numbered item within that section.

- **AP**: [research/anthropic-playbook-and-skills.md](../research/anthropic-playbook-and-skills.md)
- **PT**: [research/pocock-and-tan.md](../research/pocock-and-tan.md)
- **PL**: [research/practitioner-landscape-and-evidence.md](../research/practitioner-landscape-and-evidence.md)
- **SP**: [research/skill-portability.md](../research/skill-portability.md)
- **GA**: [research/agents-in-github-actions.md](../research/agents-in-github-actions.md)
- **CD pN**: page N of the colleague's skills deck (kept local, not in the repo)
- **ticket NN**: a resolved ticket in [issues/](../issues/)
- **map**: [map.md](../map.md)

## 1. Throughline

1. We follow one small Forkful story from a foggy ticket to a merged PR, and then back into the harness, in one sitting.
2. The feature passes eight stations and carries a harness of three threads: context, skills and checks. Each thread is taught once, where the feature first needs it, and every lesson at the end goes back into one of them.
3. A few gates are fixed, and the route between them is each group's call. The wall and the Day 2 retrospective compare the three routes on the same ribbon.

## 2. Slides per agenda block

### Opener

| # | Slide title | One-line intent | Min | Source | Live-deck hook |
|---|---|---|---|---|---|
| 1 | One feature, start to finish | Title slide. Promise the day's shape: we walk one feature through the whole loop, then you take your own route | 1 | map Destination | — |
| 2 | Show us your setup | Setup round: your tool, your IDE, and one thing you trust an agent with and one you don't. Then clone your group's branch and check `gh auth status` | 15 | map Notes; ticket 13; ticket 16 (setup checks) | — (each group's draft PR lights up the wall after the kickoff instead; ticket 13) |
| 3 | This workshop was built the way we'll teach it | Show the map's Destination: a foggy brief became a buildable spec through decision tickets | 2 | map.md; PT §1.3 (wayfinder) | — |
| 4 | Start with a foggy idea | Show what we knew on Monday, and how we went looking for the decisions that matter | 1 | CD p18 | — |
| 5 | Four ticket types | Grilling, research, prototype and task, each shown with one of our own tickets | 2 | CD p19; map.md | — |
| 6 | How the map grows | Decisions so far and the research notes. Two storylines were prototyped in parallel and one was chosen | 3 | CD p20–21; map.md | — |
| 7 | …and the PRs | Agents opened the PRs and humans reviewed them. The commit history is the audit trail | 2 | AP §1 (artifact chain as audit trail) | The repo's PR list, pulled live from GitHub |
| 8 | Wayfinder is one way in | It's for fog bigger than one session. It's in your library if you want it; keep the map to about five tickets | 1 | CD p24; ticket 16 (wayfinder optional) | — |
| 9 | The next day and a half | The agenda, drawn on the ribbon | 1 | ticket 17 (open) | — |

### Talk + live demo (≈90 min)

| # | Slide title | One-line intent | Min | Source | Live-deck hook |
|---|---|---|---|---|---|
| | **Why follow one feature** | | | | |
| 10 | Code is no longer the bottleneck | Building got fast. Deciding, reviewing and shipping still run at human speed | 2 | AP §4 #1, §1 | — |
| 11 | AI is an amplifier | Throughput goes up and stability goes down. The speed fades and the complexity stays | 2 | PL §4 #1, #4 | — |
| 12 | The gap is expertise, not intelligence | The agent is a capable new hire who forgets everything. It fails in four ways: it builds the wrong thing, it's too verbose, it leaves a ball of mud, it doesn't work | 1 | CD p2–3; PT §1.1, §2.2 | — |
| 13 | A loop, and a harness that travels with it | The two-row ribbon. The top row is the eight stations the feature passes, each committing an artifact. The bottom row is the three threads it carries the whole way (context, skills, checks), each taught once, where the feature first needs it | 3 | AP §4 #2–3, §5; PL §1 (guides and sensors) | The two-row ribbon. Its top row becomes each group's phase on the wall this afternoon |
| 14 | Fixed gates, your route | Only a few gates are fixed: the spec is reviewed before an agent builds, a slice goes green in CI, and the PR is reviewed. Everything between them is the group's call | 2 | AP §1 (humans at the gates); tickets 08, 16 | The ribbon with the fixed gates marked |
| 15 | Two schools, same stations | Pocock settles everything up front. Tan goes deep first and lets the code be the spec. Today's demo takes Pocock's route and names Tan's at every fork | 2 | PT §2.5, §5 | — |
| 16 | Meet the feature | A sibling story in Forkful, shown as a GitHub issue, that we follow for the next hour. It isn't your epic | 1 | ticket 08 | — |
| | **Thread · Context (taught once)** | | | | |
| 17 | Day one for a new hire | The agent starts every session knowing nothing about Forkful. AGENTS.md is the one page it always reads | 2 | PT §2.2; AP §2 Stage 3 (CLAUDE.md) | — |
| 18 | More context isn't better | Committed config came with half the complexity growth. Bloated context files cost over 20% more for no gain, and 74% of committed config is never touched again. So keep it short, non-inferable and owned | 2 | PL §4 #5, §5 (team harmonisation) | — |
| 19 | Exhibit: the template you'll fill | The 50-line skeleton: commands, where things are, language, rules the code doesn't tell you, how we test, mistakes made twice, and a rule → enforced-by table | 2 | ticket 16 (AGENTS.md template) | — |
| 20 | One file, every tool | One root AGENTS.md and no CLAUDE.md. Each tool's `/init` writes its own file, so improve AGENTS.md instead | 1 | SP TL;DR, §3 gotcha 2 | — |
| 21 | Shared language | A glossary of the domain's words, one word per concept, in the code and in conversation. The grill writes it | 1 | CD p9; PT §1.3 (domain-modeling) | — |
| | **Stage 1 · Foggy ticket** | | | | |
| 22 | Read the whole ticket | Read all of it, separate facts from questions, and make decisions explicit. `read-issue` pulls the issue in | 2 | CD p8; ticket 16 (read-issue) | — |
| 23 | Demo (live): say it back | A one-sentence skill has the agent restate the ticket in its own words, so a misreading costs one message instead of one wrong build | 3 | PT §2.3, §4 #2 | — |
| | **Thread · Skills (taught once: the skills deck)** | | | | |
| 24 | A skill is a folder, not a prompt | The anatomy of a SKILL.md, shown on the one-sentence skill we just ran | 2 | CD p5; AP §3.1, §4 #10 | — |
| 25 | Progressive disclosure | Name and description are always loaded, the body loads when the skill triggers, resources load on demand | 1 | CD p4; AP §3.2 | — |
| 26 | How a skill fires | By name or through its description. AGENTS.md holds conventions; SKILL.md holds procedures | 2 | CD p6; AP §3.3 | — |
| 27 | One skill, every tool | Skills live in `.agents/skills`, linked for Claude Code. Tools invoke them differently (`/name` or `$name`), so we name skills in plain text | 1 | SP TL;DR | — |
| 28 | A toolkit for each station | The everyday toolkit laid onto the ribbon: `read-issue`, `grill-with-docs`, `to-spec`, `to-tickets`, `implement` with `tdd`, `code-review`, `open-pr`, `how-we-worked` | 2 | CD p10; ticket 16 | — |
| 29 | A skill is an advisory control | A skill makes mistakes rare; only a check makes them near-impossible. That's the third thread | 1 | AP §4 #6 | — |
| | **Stage 2 · Explore** | | | | |
| 30 | Which approach for which job? | **Your call.** A clear task: just build it. One conversation's worth: grill. Fog across several sessions: wayfinder | 1 | CD p24; AP §5 (conflict 5); PT §1.4 | — |
| 31 | Demo (live): grill with docs | Rounds of numbered questions, each with a recommended answer. A coach plays product, and the glossary grows as we answer | 6 | PT §4 #1 | — |
| 32 | Don't debate, prototype | **Your call.** This is where Tan forks: when grilling can't settle a question (how it should look or feel), build 2–3 throwaway variants behind one switch | 2 | PT §4 #5, §2.3 | — |
| | **Stage 3 · Spec** | | | | |
| 33 | Demo (prepared): conversation → spec | The spec only records what the grill decided, including the acceptance examples and the seam they'll be proved at | 2 | PT §1.3 (to-spec), §6.6 | — |
| 34 | Right-size the spec | **Your call.** A heavy template turned a small bug into 16 acceptance criteria. On brownfield code, describe the change. Tan skips the spec and lets the code be the spec | 1 | PL §3.1, §5 (specs); PT §2.3 | — |
| 35 | The checkpoint | **Fixed.** Before any agent builds, someone who wasn't in the conversation checks that the spec can be built from | 1 | AP §4 #5; PL §5 (review upstream) | — |
| | **Stage 4 · Slices** | | | | |
| 36 | Tickets as vertical slices | Each ticket is one user outcome, a full path through the layers, and demoable on its own | 2 | CD p12; PT §1.4 (tracer bullets) | — |
| 37 | Demo (live): slice the spec | Test each proposed ticket with "could you demo this?", then compare with a naive per-layer split | 4 | PT §4 #3 | — |
| 38 | Or: plan slices with a proof | **Your call.** The playbook has no ticket step. Its unit is a plan with files, order, risks and proof | 1 | AP §2 Stage 3, §6 #7 | — |
| | **Thread · Checks (taught once): build, verify, review** | | | | |
| 39 | Verification closes the loop | The agent runs the checks itself: one command that fails with a non-zero exit, and "first run the tests" | 2 | CD p13; AP §2 Stage 4; PL §5 (test automation) | — |
| 40 | Verify behaviour at the seams | A small interface with deep behaviour. The seam the spec agreed on is where the acceptance examples become tests | 2 | CD p14–15; PT §6.6 | — |
| 41 | Demo (live): red-green at the agreed seam | Write one failing .NET test at the agreed seam and make it pass. Then rename an internal method and show that nothing breaks | 6 | PT §4 #4 | — |
| 42 | Test-first or test-after | **Your call.** Tests as sensors are undisputed; TDD as an agent ritual is contested. When you touch an existing rule, characterize it first. Record your choice | 2 | PL §4 #10, §6 #1; ticket 16 (tests) | — |
| 43 | Green tests ≠ mergeable | About half of agent PRs that pass the tests wouldn't be merged. Review is where the time goes now | 2 | PL §4 #3, §3.2 (DORA verification tax) | — |
| 44 | Review moves, it doesn't disappear | The agent verifies first, an AI review follows, and human approval is tiered by risk. At most three rounds. An agent's approval never counts as a person's | 2 | PL §4 #9; AP §5 (extensions) | — |
| 45 | Demo (live): a second tool reviews | A different tool reviews the PR on two axes, standards and spec, and sorts its findings into act on, consider, noted and dismissed | 4 | PT §4 #6 | — |
| 46 | Make verification repeatable | Turn the check you keep doing by hand into a skill: run it yourself, then embed it in another skill, then chain it, then run it on every PR | 1 | CD p16; AP §3.6 | — |
| 47 | The agent stops at the gate | CI and branch protection enforce what skills only advise. The agent never goes past the production gate | 1 | AP §4 #13, §6 #4 | — |
| | **Stage 7 · Ship** | | | | |
| 48 | A PR body with evidence | The smallest visual that shows the change, before/after proof and a merge-danger call, with the working-out committed alongside: spec, tickets, review rounds, how-we-worked note | 2 | PT §4 #7; AP §5; ticket 14 | — |
| 49 | Demo (live): push and watch | `open-pr` pushes. The reporter runs read-only in CI after the tests, and the card updates minutes later | 3 | GA §2.1, §2.4; ticket 14 | **First live update:** the demo PR's card on the wall |
| | **Stage 8 · Learn: back into the harness** | | | | |
| 50 | Mistake twice → which thread? | Fix the system, not the output, at the highest rung that works: architecture → types → a lint or CI check → a test → an AGENTS.md line, last. A repeated procedure becomes a skill. Every lesson lands in one of the three threads | 2 | PT §2.3 (`/correct`), §4 #8; PL §2 #2; AP §4 #12 | The bottom row of the ribbon lights up |
| 51 | Demo (live): from retro to a check | Take one repeated mistake from the demo session and make it impossible next time | 4 | PT §4 #8 | — |
| 52 | The loop, once more | The two-row ribbon with every artifact from the demo linked. Done means the lesson is in the harness | 1 | AP §4 #2 | The demo feature's card, with every station ticked |
| 53 | Your turn | The same stations on your epic, by your own route | 1 | — | — |

A natural break falls after slide 38, about 55 minutes in, so the checks thread starts fresh. The agenda ticket decides.

### Case kickoff

| # | Slide title | One-line intent | Min | Source | Live-deck hook |
|---|---|---|---|---|---|
| 54 | Your epic | Group orders for the office lunch, as a GitHub issue, in the Forkful app you just watched | 3 | ticket 08 | — |
| 55 | What "done" means tonight | `case/AGENTS.md` and a glossary, a spec that passed review, slice tickets, slice 1 green in CI, and the working-out. Nobody finishes the epic | 2 | ticket 08 (done); ticket 13 | — |
| 56 | What's fixed, what's yours | **Fixed:** a draft PR within 30 minutes, the checkpoint before you build, review by another group's tool (at most three rounds), how-we-worked before every push, and the merge before the stand-up. **Yours:** how you explore (grill, wayfinder with about five tickets, or prototype first), how big the spec is, how you slice, test-first or test-after, who drives, and every product decision | 4 | tickets 08, 13, 14, 16 | The ribbon with the fixed gates. The wall shows where each group is |
| 57 | How you work together | One computer per group, and who decides is up to you. Now and then, let the least experienced person drive and explain the diff | 2 | ticket 08; PL §6 #5 | — |
| 58 | House rules | Start the agent at the repo root. Improve AGENTS.md instead of running `/init`. Name skills in plain text. Lower the effort setting for grilling. One tool per group, ideally a different one per group | 2 | SP §3 gotcha 2; PT §6.8; ticket 14 (steer tools) | — |
| 59 | Groups, go | `open-pr` opens your draft PR within 30 minutes and puts your group on the wall | 2 | ticket 13 | Group cards appear on the wall as the draft PRs open |

### Day 1 PM interludes

| # | Slide title | One-line intent | Min | Source | Live-deck hook |
|---|---|---|---|---|---|
| | **Spec review checkpoint** | | | | |
| 60 | Spec review checkpoint | **Fixed.** A coach walks through the spec with the group: does it match the epic, are the acceptance examples there, is the seam agreed, is out of scope named, could someone who wasn't there build from it? Then the coach adds `spec-reviewed` | 3 | AP §4 #5; PT §3.3, §6.6; ticket 14 | The wall: the group's phase moves on |
| 61 | Same fog, three readings | A plenary look at the epic's seven open points and how each group decided them | 3 | ticket 14 (decision grid) | Live: the seven-point decision grid for the three groups |
| | **Review block** | | | | |
| 62 | Review block: swap tools | Another group's tool reviews your PR on standards and spec. At most three rounds. Whoever prompted the change is a reviewer too | 3 | PT §4 #6; ticket 16 (review kit) | — |
| 63 | What the reviewers found | Findings by bucket for each group, then each group merges before the stand-up | 3 | ticket 14; ticket 13 (merge) | Live: "What the reviewers found" |
| | **End-of-day stand-up** | | | | |
| 64 | Stand-up | Three minutes per group: the route you took, what worked, and one thing the agent got wrong twice | 10 | PL §5 (rebuild the friction) | Live: the stand-up card for each group |
| 65 | Tonight | Run how-we-worked and push. A coach synthesises the retrospective overnight | 1 | ticket 14; GA §5 | Live: "Tonight", with a checklist for the working-out |

Minutes here are slide time only. The coaches' time at each group's table isn't counted.

### Day 2 retrospective

Ticket 14's outline, drawn on A's two-row ribbon.

| # | Slide title | One-line intent | Min | Source | Live-deck hook |
|---|---|---|---|---|---|
| 66 | How this was made | What the overnight synthesis read, and how sure it is | 2 | ticket 14 | The retrospective view loads |
| 67 | How fast did it feel? | A show of hands before any data, then the perception gap, made once and in general | 3 | PL §4 #2; ticket 14 | — |
| 68 | Three routes | One swimlane per group across the eight stations: where each group forked and where its time went | 6 | ticket 14 | Live: swimlanes from the overnight synthesis |
| 69 | Is this you? | Each group confirms or corrects the claim about itself that the synthesis is least sure of | 5 | ticket 14 | Live |
| 70 | Same fog, three readings, revisited | Which decisions made at the checkpoint caused rework later | 5 | ticket 14; AP §2 Stage 2 | Live |
| 71 | Team signals, not volume | Time from intent to spec, spec rework, first-pass CI, review rounds, and drift between plan and diff. Groups in fixed columns, no totals | 6 | ticket 14; AP §6 #1; PL §3.2 | Live |
| 72 | How each group drove its agent | Read along the three threads: the context each group wrote, the skills it used or wrote, the checks it added | 5 | ticket 14 | Live |
| 73 | Where the agent went wrong | Each mistake placed on the station where it started | 5 | ticket 14 | Live |
| 74 | Hand-off: wrong twice | The shortlist of repeated mistakes, each tagged with the thread where a fix could live | 3 | ticket 14 | Live: the shortlist |

### Day 2 skill lab

| # | Slide title | One-line intent | Min | Source | Live-deck hook |
|---|---|---|---|---|---|
| 75 | Back into the harness | The retrospective's shortlist, tagged context, skill or check, plus your own repetitive tasks, such as porting `read-issue` to Jira | 3 | ticket 14; ticket 16 | The shortlist |
| 76 | Pick the rung | The highest fix that works: architecture → types → check → test → an AGENTS.md line. A repeated procedure becomes a skill. Prove the fix fails on the real mistake | 3 | PT §4 #8, §2.3 | — |
| 77 | Verification skills first | They had the biggest measured effect. For example: build and test wrappers, UI checks, migration rules | 2 | AP §6 #2; CD p16 | — |
| 78 | Writing a skill that fires | The description says when to fire. Use only the six portable fields and grow the gotchas from real failures | 3 | AP §3.3; SP §3 (gotchas 12–15) | — |
| 79 | Test it like code | Three prompts that should fire it, three that shouldn't, and one with/without comparison, in a fresh session and in a second tool | 2 | AP §3.5, §6 #5 | — |
| 80 | Lab | Cross-tool pairs build one skill, check or AGENTS.md change and open a PR into the shared library | 45 | map Notes (takeaways) | Each library PR appears on the deck |
| 81 | Show and tell | Two minutes per pair: what it catches, and proof that it works | 12 | — | Live: the library list |

### Day 2 action plan

| # | Slide title | One-line intent | Min | Source | Live-deck hook |
|---|---|---|---|---|---|
| 82 | What you take home | The skill library, the AGENTS.md template, the reporter skill, and the action plan we're about to write | 2 | map Notes | The live library list |
| 83 | Expect a dip first | Expect a J-curve before the gains. Adoption spreads through people, so start by redoing your own commits with an agent | 3 | PL §3.2 (DORA ROI), §1 (Hashimoto), §3.3 (Microsoft) | — |
| 84 | Your harness, your route | The plan uses the two-row ribbon: one row per thread (context, skills, checks), plus the stations where your team's route should change, such as a spec review before agents build | 2 | AP §1 (adoption order) | — |
| 85 | Quick wins and longer steps | For each row: one quick win, one longer step and one owner, committed as a file | 20 | map (Not yet specified: action plan format) | The action plan fills in as it's committed |
| 86 | Measure it | Pick 2–3 team signals to watch, and write a short AI stance | 3 | PL §5 (team harmonisation) | — |
| 87 | The loop closes | Back to the map: the workshop's own next intent, and thanks | 2 | AP §4 #2; map.md | — |

## 3. Totals per block

| Block | Slides | Min | Of which live demo or exercise |
|---|---|---|---|
| Opener | 9 | 28 | 15 (setup round; 13 min without it) |
| Talk + live demo | 44 | 90 | 30 live demo, plus 2 prepared |
| Case kickoff | 6 | 15 | — |
| Day 1 PM interludes | 6 | 23 | 10 (stand-up). Slide time only |
| Day 2 retrospective | 9 | 40 | — |
| Day 2 skill lab | 7 | 70 | 57 (lab plus show and tell) |
| Day 2 action plan | 6 | 32 | 20 (exercise) |
| **Total** | **87** | **298** | |

Inside the talk, the minutes split as: why 13, context 8, ticket 5, skills 9, explore 9, spec 4, slices 7, checks 22, ship 5, learn and close 8.

## 4. Strengths and weaknesses

**Strengths**

1. **One concrete thread from start to finish.** Participants see one feature go all the way round on the codebase they'll use that afternoon, so the kickoff can stay short. The two-row ribbon is the talk's spine, the wall's phase tracker and the retrospective's frame.
2. **Each cross-cutting idea has one home.** Context, skills and checks are each taught once, completely, where the feature first needs them, and the skills deck stays one chapter. Learn sends every lesson back into one of the three threads, and the same three rows carry the skill lab and the action plan.
3. **The freedom is built in.** Only a few gates are fixed, and every fork is marked "Your call" with the alternative named. The groups' routes will really differ, which gives the retrospective's "three routes" something to compare.

**Weaknesses**

1. **Still demo-heavy and chained.** Seven live segments (30 min) run on one feature. If the grill runs long or CI is slow, every later segment slips. Each station needs a fallback state on a branch and a full rehearsal, and 44 slides in 90 minutes leaves no slack.
2. **The walk stops three times for a thread chapter.** The checks chapter takes 22 minutes in the middle, so there's less end-to-end momentum than in the first draft. A participant may lose the feature for a while.
3. **The demo still takes one route.** Naming the forks helps, but groups may copy what they saw. The demo story also has to avoid anything the groups should discover in Forkful themselves, which narrows the choice.

## Assumptions in this draft (to react to)

- **How the colleague's deck is used:**
  - p2–3 go in "Why follow one feature".
  - The wayfinder pages (p18–21) go in the opener, and p24 goes in Stage 2.
  - p8 goes in Stage 1 and p12 in Stage 4.
  - p9 goes in the context thread.
  - **p4–6 and p10 form the skills thread as one contiguous chapter.**
  - p13–16 go in the checks thread.
  - Unused: p1, p7 and p11 (their flow overview, which the ribbon replaces), p22–23 (`implement-spec` isn't in the Day 1 library, ticket 16), and p25–27.
- **The demo story is a sibling story in Forkful**, for example a note to the kitchen on an order. It should be picked with the coach notes in hand so it gives nothing away.
- **A coach plays product in the live grill.** The case has no stakeholder (ticket 08).
- **The fixed gates come from tickets 08, 13, 14 and 16.** Everything else on the ribbon is marked "Your call".
