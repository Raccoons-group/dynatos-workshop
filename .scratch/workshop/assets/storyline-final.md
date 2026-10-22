# Storyline: one feature through the lifecycle, merged (final outline)

The outline chosen in [Choose the storyline](../issues/12-choose-the-storyline.md). It's [Storyline A](storyline-a.md)'s spine with the strongest pieces of [Storyline B](storyline-b.md), and the talk is split around the case kickoff. It uses the same format as A and B, so each row can be traced back to them.

**What was decided (Q1–Q7, 22 Oct 2026, with Matthias):**

- **A's spine carries the talk.** One Forkful sibling story goes from a foggy ticket to a merged PR. B's best pieces are ported in: the general opener, the exhibits from this repo, the kickoff's "the deck reads your PR", the team slides and the action plan grid.
- **The talk is split at the checks cut.** Part 1 (58 min) runs up to the slices. Then come the kickoff, the groups' own exploring and specifying, and lunch. Part 2 (35 min) teaches checks, ship and learn just before groups build.
- **One frame, the ribbon, from slide 11 to the last slide.**
  - The wall's cards are mini ribbons.
  - The retrospective places each mistake on a station and tags its fix with a thread.
  - The action plan is the ribbon drawn as a grid.
- **The opener is general**, as Matthias corrected B's. The wayfinder pages move to the Explore fork, and the skills deck's p2–3 open the skills thread.
- **The demo passes every fixed gate the groups pass**, and every station has a fallback tag.
- **One vocabulary.** A station is one of the ribbon's eight stops, and a phase is the station a group is at. The spec review checkpoint is a gate between Specify and Slice, not a phase.

**Source keys.** § is a section of a note and # is a numbered item within that section.

- **AP**: [research/anthropic-playbook-and-skills.md](../research/anthropic-playbook-and-skills.md)
- **PT**: [research/pocock-and-tan.md](../research/pocock-and-tan.md)
- **PL**: [research/practitioner-landscape-and-evidence.md](../research/practitioner-landscape-and-evidence.md)
- **SP**: [research/skill-portability.md](../research/skill-portability.md)
- **GA**: [research/agents-in-github-actions.md](../research/agents-in-github-actions.md)
- **CD pN**: page N of the colleague's skills deck (kept local, not in the repo)
- **ticket NN**: a resolved ticket in [issues/](../issues/)
- **map**: [map.md](../map.md)
- **A nn / B nn**: the slide this row comes from in [storyline-a.md](storyline-a.md) or [storyline-b.md](storyline-b.md)

**Min** is whole minutes of room time, and a demo or exercise row carries its full duration. **Live-deck hook** is `—` when the slide is static.

## 1. Throughline

1. Writing code got cheap. Deciding, verifying and reviewing still run at human speed, and AI amplifies whatever a team already does.
2. So we follow one small Forkful story along the ribbon:
   - The top row is eight stations: read, explore, specify, slice, build, review, ship, learn. Each one commits an artifact.
   - The bottom row is the three threads the feature carries throughout: context, skills and checks. Each thread is taught once, where the feature first needs it, and every lesson goes back into one of them.
3. A few gates are fixed, and the route between them is each group's call. The demo walks the first four stations before the kickoff, and the last four just before groups build.
4. The wall, the retrospective and the action plan all use the same ribbon. On Day 2 the three groups' routes are compared on it, and the team's own harness is planned on it.

## 2. The ribbon

| | Read | Explore | Specify | ‖ | Slice | Build | Review | Ship | Learn |
|---|---|---|---|---|---|---|---|---|---|
| **Artifact** | the issue, said back | the grill and glossary | `spec.md` | checkpoint | `issues/` | code and tests | `review.md` | the PR with evidence | a new check, skill or AGENTS.md line |
| **Phase on the wall** | — | Explore | Specify | gate: `spec-reviewed` | Slice | Build | Review | Ship | — |
| **Taught in** | Part 1 | Part 1 | Part 1 | Part 1 | Part 1 | Part 2 | Part 2 | Part 2 | Part 2 |

**Threads (the bottom row):**

- **Context** is taught before the ticket is read.
- **Skills** are taught right after the first skill runs.
- **Checks** are taught in Part 2, covering build, verify and review.

**Fixed gates (from tickets 08, 13, 14 and 16):**

- a draft PR within 30 minutes
- the spec review checkpoint before any agent builds
- slice 1 green in CI
- review by another group's tool, at most 3 rounds
- how-we-worked before every push
- the merge before the stand-up

Everything else is marked **Your call**, with the alternative named.

## 3. Slides per agenda block

### Opener

General on purpose: what changed, why we're here, and how this workshop was built (B 1–6). Slide 7 draws the agenda on the ribbon (A 9).

| # | Slide title | One-line intent | Min | Source | Live-deck hook |
|---|---|---|---|---|---|
| 1 | Raccoons × Dynatos: AI-assisted development | Title slide: the two coaches, and the day and a half in one line | 1 | B 1 | Footer shows "last update from GitHub: hh:mm", so the room sees the deck is live |
| 2 | Why we're here | Lift the whole team a level together, not crown the fastest individual. Sceptics are welcome as the safety net | 2 | B 2; PL §1 (Majors), §6 #8 | — |
| 3 | Show us your setup | Setup round: your tool, your IDE, and one thing you trust an agent with and one you don't. Then clone your group's branch, check `gh auth status`, and run the setup checks | 15 | A 2 / B 3; map Notes; tickets 13, 16 (§9 setup checks) | — |
| 4 | Agents are here | Two-thirds of developers who use AI now use coding agents, most of them daily. The question isn't whether, it's how a team works with them | 2 | B 4; PL §3.3 | — |
| 5 | This workshop was built the way we'll teach | The repo you're about to open PRs on holds the whole plan, made with agents: what we knew on Monday, the decisions we made, what we left out on purpose | 3 | B 5; map.md | Renders `map.md`: decisions so far, what's still open |
| 6 | The trail in the repo | One decision, its research note, and the PR that built from it. Agents wrote; we decided and reviewed. The commits are the audit trail | 2 | B 6; AP §1, §4 #2 | The repo's PR list, pulled live from GitHub |
| 7 | The next day and a half | The agenda drawn on the ribbon: Part 1, the kickoff, your morning, lunch, Part 2, your afternoon, and Day 2 | 1 | A 9; ticket 17 | — |

### Talk, Part 1 (≈58 min): read → slice

| # | Slide title | One-line intent | Min | Source | Live-deck hook |
|---|---|---|---|---|---|
| | **Why follow one feature** | | | | |
| 8 | Code is no longer the bottleneck | Building got fast. Deciding, reviewing and shipping still run at human speed | 2 | A 10; AP §4 #1, §1 | — |
| 9 | AI is an amplifier | Throughput goes up and stability goes down. The speed fades and the complexity stays. Whatever your team already does gets louder | 2 | A 11 / B 10; PL §4 #1, #4 | — |
| 10 | A capable new hire who forgets everything | The agent knows a lot in general and nothing about your team. Whatever it needs from you has to be in the repo | 1 | B 11; PT §2.2 | — |
| 11 | A loop, and a harness that travels with it | The ribbon. The top row is the eight stations the feature passes, each committing an artifact. The bottom row is the three threads it carries the whole way: context and skills steer the agent, checks catch it. Each thread is taught once, where the feature first needs it | 3 | A 13; AP §4 #2–3, §5; PL §1 (guides and sensors) | The ribbon. Its top row becomes each group's phase on the wall |
| 12 | Fixed gates, your route | Only a few gates are fixed: a draft PR early, the spec reviewed before an agent builds, a slice green in CI, the PR reviewed by another tool. Everything between them is the group's call | 2 | A 14; AP §1; tickets 08, 13, 16 | The ribbon with the fixed gates marked |
| 13 | Two schools, same stations | Pocock settles everything up front. Tan goes deep first and lets the code be the spec. The demo takes Pocock's route and names Tan's at every fork | 1 | A 15; PT §2.5, §5 | — |
| 14 | Meet the feature | A sibling story in Forkful, shown as a GitHub issue. We take it to a reviewed spec before the kickoff, and to a merged PR after lunch. It isn't your epic | 1 | A 16; ticket 08 | — |
| | **Thread · Context (taught once)** | | | | |
| 15 | Day one for a new hire | The agent starts every session knowing nothing about Forkful. AGENTS.md is the one page it always reads | 2 | A 17; PT §2.2; AP §2 Stage 3 | — |
| 16 | More context isn't better | Committed config came with half the complexity growth. Bloated context files cost over 20% more for no gain, and 74% of committed config is never touched again. So keep it short, non-inferable and owned | 2 | A 18; PL §4 #5, §5 | — |
| 17 | Exhibit: our AGENTS.md, and the template you'll fill | This repo's hand-cut root AGENTS.md next to the 50-line skeleton: commands, where things are, language, rules the code doesn't tell you, how we test, mistakes made twice, and a rule → enforced-by table | 2 | A 19 + B 15; ticket 16 | Exhibit: this repo's AGENTS.md |
| 18 | One file, every tool | One root AGENTS.md and no CLAUDE.md. Each tool's `/init` writes its own file, so improve AGENTS.md instead. Visual Studio and JetBrains Copilot ignore it | 1 | A 20 / B 16; SP §1c, §3 gotchas 1, 2, 6 | — |
| 19 | Shared language | A glossary of the domain's words, one word per concept, in the code and in conversation. You'll write `case/GLOSSARY.md`, and the grill writes most of it | 1 | A 21 / B 17; CD p9; PT §1.3; ticket 16 | Exhibit: this repo's glossary |
| | **Station 1 · Read** | | | | |
| 20 | Read the whole ticket | Read all of it, separate facts from questions, and make decisions explicit. `read-issue` pulls the issue in | 2 | A 22; CD p8; ticket 16 | — |
| 21 | Demo (live): say it back | A one-sentence skill has the agent restate the ticket in its own words, so a misreading costs one message instead of one wrong build | 3 | A 23; PT §2.3, §4 #2 | — |
| | **Thread · Skills (taught once: the skills deck, p2–6 and p10 in order)** | | | | |
| 22 | The real gap is expertise, not intelligence | The model is smart; skills carry your team's expertise to it | 1 | B 18; CD p2 | — |
| 23 | Failure modes | It builds the wrong thing, it's too verbose, it leaves a ball of mud, it doesn't work. Grilling, shared language, deep modules and tests answer them, and each of those is a skill | 1 | B 19; CD p3; PT §1.1 | — |
| 24 | Progressive disclosure | Name and description are always loaded, the body loads when the skill triggers, resources load on demand | 1 | A 25; CD p4; AP §3.2 | — |
| 25 | A skill is a folder, not a prompt | The anatomy of a SKILL.md, shown on the one-sentence skill we just ran. `name` equals the folder name, and the description says *when* to fire | 2 | A 24; CD p5; AP §3.1, §4 #10 | — |
| 26 | How a skill fires | By name (`/name`, or `$name` in Codex) or through its description. AGENTS.md holds conventions; SKILL.md holds procedures | 1 | A 26; CD p6; AP §3.3 | — |
| 27 | A toolkit for each station | The everyday toolkit laid onto the ribbon: `read-issue`, `grill-with-docs`, `to-spec`, `to-tickets`, `implement` with `tdd`, `code-review`, `open-pr`, `how-we-worked` | 2 | A 28 + B 24; CD p10; ticket 16 | Exhibit: this repo's `.agents/skills` |
| 28 | One skill, every tool | `.agents/skills` is canonical, with generated links for Claude Code. Use only the six portable fields, and name skills in plain text | 1 | A 27 / B 26; SP §2, §3 gotchas 14–15 | — |
| 29 | A skill is an advisory control | A skill makes mistakes rare; only a check makes them near-impossible. That's the third thread, after lunch | 1 | A 29; AP §4 #6 | — |
| | **Station 2 · Explore** | | | | |
| 30 | Which approach for which job? | **Your call.** A clear task: just build it. One conversation's worth: grill. Fog across several sessions: wayfinder | 1 | A 30; CD p24; AP §5 (conflict 5); PT §1.4 | — |
| 31 | Fog bigger than one session | Wayfinder, the skill behind this morning's map: start foggy, use four ticket types, let the map grow. It's optional for groups; keep it to about five tickets | 3 | B 32 (A 4–8, compressed); CD p18–21; PT §1.3; ticket 16 | The rendered `map.md` from slide 5 |
| 32 | Demo (live): grill with docs | Rounds of numbered questions, each with a recommended answer. A coach plays product, and the glossary grows as we answer | 5 | A 31 / B 30; PT §4 #1; ticket 08 | — |
| 33 | Don't debate, prototype | **Your call.** This is where Tan forks: when grilling can't settle a question, build two or three throwaway variants behind one switch | 1 | A 32; PT §4 #5, §2.3 | — |
| | **Station 3 · Specify, then the checkpoint** | | | | |
| 34 | Demo (prepared): conversation → spec | The spec only records what the grill decided, including the acceptance examples and the seam they'll be proved at | 2 | A 33; PT §1.3, §6.6 | — |
| 35 | Right-size the spec | **Your call.** A heavy template turned a small bug into 16 acceptance criteria. On brownfield code, describe the change. Tan skips the spec and lets the code be the spec | 1 | A 34; PL §3.1, §5; PT §2.3 | — |
| 36 | Demo (live): open the draft PR | **Fixed.** `open-pr` opens the demo's draft PR with the spec in its working-out. You'll do this within 30 minutes. The deck reads the PR; it observes and never coaches | 2 | ticket 13 (draft PR); GA §2.1; ticket 14 | **First live update:** the demo card appears on the wall a few minutes later, at Specify |
| 37 | The checkpoint | **Fixed.** Before any agent builds, someone who wasn't in the conversation checks that the spec can be built from. Live: the other coach reviews the demo spec in one minute and adds `spec-reviewed` | 2 | A 35; AP §4 #5; PL §5 | The demo card passes the gate |
| | **Station 4 · Slice** | | | | |
| 38 | Tickets as vertical slices | Each ticket is one user outcome, a full path through the layers, and demoable on its own | 2 | A 36; CD p12; PT §1.4 | — |
| 39 | Demo (live): slice the spec | Test each proposed ticket with "could you demo this?", then compare with a naive per-layer split | 3 | A 37; PT §4 #3 | The demo card moves to Slice |
| 40 | Or: plan slices with a proof | **Your call.** The playbook has no ticket step. Its unit is a plan with files, order, risks and proof | 1 | A 38; AP §2 Stage 3, §6 #7 | — |

### Case kickoff

| # | Slide title | One-line intent | Min | Source | Live-deck hook |
|---|---|---|---|---|---|
| 41 | Your epic | Group orders for the office lunch, as a GitHub issue, in the Forkful app you just watched | 3 | A 54; ticket 08 | — |
| 42 | What "done" means tonight | `case/AGENTS.md` and a glossary, a spec that passed review, slice tickets, slice 1 green in CI, and the working-out. Nobody finishes the epic | 2 | A 55; tickets 08, 13 | An empty mini ribbon: the threads light up as each artifact lands |
| 43 | What's fixed, what's yours | **Fixed:** a draft PR within 30 minutes, the checkpoint before you build, review by another group's tool (at most three rounds), how-we-worked before every push, and the merge before the stand-up. **Yours:** how you explore (grill, wayfinder with about five tickets, or prototype first), how big the spec is, how you slice, test-first or test-after, who drives, and every product decision | 4 | A 56; tickets 08, 13, 14, 16 | The ribbon with the fixed gates |
| 44 | How you work together | One computer per group, and who decides is up to you. Now and then, let the least experienced person drive and explain the diff | 2 | A 57; ticket 08; PL §6 #5 | — |
| 45 | House rules | Start the agent at the repo root. Improve AGENTS.md instead of running `/init`. Name skills in plain text. Lower the effort setting for grilling. One tool per group, ideally a different one per group | 2 | A 58; SP §3 gotcha 2; PT §6.8; ticket 14 | — |
| 46 | The deck reads your PR | The reporter observes and never coaches. Run how-we-worked before every push. Coaches keep a log about groups. Tomorrow's retrospective is a draft, and you'll correct it | 1 | B 62; ticket 14 (what the kickoff has to say) | — |
| 47 | Groups, go | `open-pr` opens your draft PR within 30 minutes and puts your group on the wall. Before lunch: explore and specify, and call a coach for the checkpoint when you're ready | 1 | A 59; ticket 13 | Group cards appear on the wall as the draft PRs open |

### Day 1 midday

Slide time only. The coaches' time at each group's table isn't counted.

| # | Slide title | One-line intent | Min | Source | Live-deck hook |
|---|---|---|---|---|---|
| 48 | Spec review checkpoint | **Fixed.** At the group's table, when it's ready: does the spec match the epic, are the acceptance examples there, is the seam agreed, is out of scope named, could someone who wasn't there build from it? Then the coach adds `spec-reviewed` | 3 | A 60; AP §4 #5; PT §3.3, §6.6; ticket 14 | The wall: the group's card passes the gate |
| 49 | Same fog, three readings | After lunch, in plenary: the epic's seven open points and how each group decided them | 3 | A 61; ticket 14 (decision grid) | Live: the seven-point decision grid for the three groups |

### Talk, Part 2 (≈35 min): build → learn

| # | Slide title | One-line intent | Min | Source | Live-deck hook |
|---|---|---|---|---|---|
| 50 | Where we left the feature | The demo's ribbon, picked up from its tag: spec reviewed, slices planned. Now we build | 1 | — | The demo card, at Slice |
| | **Thread · Checks (taught once): build, verify, review** | | | | |
| 51 | Verification closes the loop | The agent runs the checks itself: one command that fails with a non-zero exit, and "first run the tests" | 2 | A 39; CD p13; AP §2 Stage 4; PL §5 | — |
| 52 | Verify behaviour at the seams | A small interface with deep behaviour. The seam the spec agreed on is where the acceptance examples become tests | 2 | A 40; CD p14–15; PT §6.6 | — |
| 53 | Demo (live): red-green at the agreed seam | Write one failing .NET test at the agreed seam and make it pass. Show a tautological test next to the real one | 5 | A 41 + B 44; PT §4 #4 | The demo card moves to Build |
| 54 | Test-first or test-after | **Your call.** Tests as sensors are undisputed; TDD as an agent ritual is contested. When you touch an existing rule, characterize it first. Record your choice | 2 | A 42; PL §4 #10, §6 #1; ticket 16 | — |
| 55 | Green tests ≠ mergeable | About half of agent PRs that pass the tests wouldn't be merged. Review is where the time goes now | 2 | A 43; PL §4 #3, §3.2 | — |
| 56 | Review moves, it doesn't disappear | The agent verifies first, an AI review follows, and human approval is tiered by risk. At most three rounds. An agent's approval never counts as a person's | 2 | A 44; PL §4 #9; AP §5 | — |
| 57 | Demo (live): a second tool reviews | **Fixed.** A different tool reviews the PR on two axes, standards and spec, and sorts its findings into act on, consider, noted and dismissed | 4 | A 45; PT §4 #6 | The demo card moves to Review |
| 58 | Make verification repeatable | Turn the check you keep doing by hand into a skill: run it yourself, then embed it in another skill, then chain it, then run it on every PR | 1 | A 46; CD p16; AP §3.6 | — |
| 59 | Exhibit: checks in our CI | This repo's CI guard (no CLAUDE.md, skill name equals folder), and the reporter reading every PR read-only. CI and branch protection enforce what skills only advise. The agent never goes past the production gate | 1 | A 47 + B 38, 40; SP §2; GA §2.1; AP §4 #13, §6 #4 | — |
| | **Station 7 · Ship** | | | | |
| 60 | A PR body with evidence | The smallest visual that shows the change, before/after proof and a merge-danger call, with the working-out committed alongside: spec, tickets, review rounds, how-we-worked note | 2 | A 48; PT §4 #7; AP §5; ticket 14 | — |
| 61 | Demo (live): push and watch | `open-pr` marks the PR ready. The reporter runs read-only in CI after the tests, and the card updates minutes later | 3 | A 49; GA §2.1, §2.4; ticket 14 | The demo card: slice 1 green, at Ship |
| | **Station 8 · Learn: back into a thread** | | | | |
| 62 | Mistake twice → which thread? | Fix the system, not the output, at the highest rung that works: architecture → types → a lint or CI check → a test → an AGENTS.md line, last. A repeated procedure becomes a skill. Every lesson lands in one of the three threads | 2 | A 50; PT §2.3, §4 #8; PL §2 #2; AP §4 #12 | The bottom row of the ribbon lights up |
| 63 | Demo (live): from retro to a check | Take one repeated mistake from the demo and make it impossible next time | 3 | A 51; PT §4 #8 | — |
| 64 | Measure the team, not the volume | You can't feel your own productivity. Tomorrow we look at team signals, not lines or tokens | 1 | B 52; PL §4 #2; ticket 14 | — |
| 65 | The loop, once more | The ribbon with every artifact from the demo linked. Done means the lesson is in a thread | 1 | A 52; AP §4 #2 | The demo card, with every station ticked |
| 66 | Back to your groups | Slice and build your epic by your own route. The review block and the stand-up are fixed in the agenda | 1 | A 53 | The wall |

### Day 1 PM interludes

Slide time only.

| # | Slide title | One-line intent | Min | Source | Live-deck hook |
|---|---|---|---|---|---|
| | **Review block** | | | | |
| 67 | The bottleneck moved here | Agents let people change code without talking to each other, so the friction has to be rebuilt on purpose. That's why review gets its own block | 2 | B 50 + B 66; PL §5 (Ronacher), §6 #2 | — |
| 68 | Swap tools | **Fixed.** Another group's tool reviews your PR on standards and spec, at most three rounds, into `review.md` with four buckets. Whoever prompted the change is a reviewer too | 3 | A 62 / B 67; PT §4 #6; ticket 16 | — |
| 69 | What the reviewers found | Findings by bucket for each group. A finding that repeats goes on the list for Day 2. Then each group merges before the stand-up | 3 | A 63 / B 69; tickets 13, 14 | Live: "What the reviewers found" |
| | **End-of-day stand-up** | | | | |
| 70 | Stand-up | Three minutes per group, on its own mini ribbon: the route you took, what worked, and one thing the agent got wrong twice | 10 | A 64; PL §5 | Live: the stand-up card for each group |
| 71 | Bring one task tomorrow | Each participant notes one repetitive task from their real job, as input for the skill lab | 2 | B 73; map (Not yet specified: Day 2 skill lab) | — |
| 72 | Tonight | Run how-we-worked and push. A coach synthesises the retrospective overnight | 1 | A 65; ticket 14; GA §5 | Live: "Tonight", with a checklist for the working-out |

### Day 2 retrospective

Ticket 14's outline, drawn on the ribbon: each mistake is placed on a station, and each fix is tagged with a thread.

| # | Slide title | One-line intent | Min | Source | Live-deck hook |
|---|---|---|---|---|---|
| 73 | How this was made | What the overnight synthesis read, and how sure it is | 2 | A 66; ticket 14 §1 | The retrospective view loads |
| 74 | How fast did it feel? | A show of hands before any data, then the perception gap, made once and in general | 3 | A 67; PL §4 #2; ticket 14 | — |
| 75 | Three routes | One swimlane per group across the stations, with the checkpoint gate: where each group forked and where its time went | 6 | A 68; ticket 14 §2 | Live: swimlanes from the overnight synthesis |
| 76 | Is this you? | Each group confirms or corrects the claim about itself that the synthesis is least sure of | 5 | A 69; ticket 14 §3 | Live |
| 77 | Same fog, three readings, revisited | The final decision grid, and which calls made at the checkpoint caused rework later | 5 | A 70; ticket 14 §4; AP §2 Stage 2 | Live |
| 78 | Team signals, not volume | Time from intent to spec, spec rework, first-pass CI, review rounds, and drift between plan and diff. Groups in fixed columns, no totals | 6 | A 71; ticket 14 §5; AP §6 #1; PL §3.2 | Live |
| 79 | How each group drove its agent | Read along the three threads: the context each group wrote, the skills it used or wrote, the checks it added. Who steered at the one computer, in the group's own words | 5 | A 72; ticket 14 §6 | Live |
| 80 | Where the agent went wrong | Each mistake placed on the station where it started | 5 | A 73; ticket 14 §7 | Live |
| 81 | Hand-off: wrong twice | The shortlist of repeated mistakes, each tagged with the thread where a fix could live | 3 | A 74; ticket 14 §8 | Live: the shortlist |

### Day 2 skill lab

| # | Slide title | One-line intent | Min | Source | Live-deck hook |
|---|---|---|---|---|---|
| 82 | Back into a thread | The input: the retrospective's shortlist, tagged context, skill or check, plus the task each of you brought (slide 71), such as porting `read-issue` to Jira. Back to slide 22 | 3 | A 75 + B 84; tickets 14, 16; CD p2 | The shortlist |
| 83 | Pick the rung | The highest fix that works: architecture → types → check → test → an AGENTS.md line. A repeated procedure becomes a skill. Prove the fix fails on the real mistake | 3 | A 76; PT §4 #8, §2.3 | — |
| 84 | Verification skills first | They had the biggest measured effect. For example: build and test wrappers, UI checks, migration rules | 2 | A 77; AP §6 #2; CD p16 | — |
| 85 | Writing a skill that fires | The description says when to fire. Use only the six portable fields and grow the gotchas from real failures | 3 | A 78; AP §3.3; SP §3 (gotchas 12–15) | — |
| 86 | Test it like code | Three prompts that should fire it, three that shouldn't, and one with/without comparison, in a fresh session and in a second tool | 2 | A 79; AP §3.5, §6 #5 | — |
| 87 | Lab | Cross-tool pairs build one skill, check or AGENTS.md change for their real work, and open a PR into the shared library with the CI guard and a named owner | 45 | A 80 + B 90; map Notes (takeaways); SP §2 | Each library PR appears on the deck |
| 88 | Show and tell | Two minutes per pair: what it catches, and proof that it works | 12 | A 81 | Live: the library list |

### Day 2 action plan

The plan is the ribbon as a grid. The **route** row holds the gates and stations the team adopts, such as a spec review before agents build. Then come the **context**, **skills** and **checks** rows. Each row gets one quick win, one longer step and one owner.

| # | Slide title | One-line intent | Min | Source | Live-deck hook |
|---|---|---|---|---|---|
| 89 | What you take home | The skill library, the AGENTS.md template, the reporter skill, and the action plan we're about to write | 2 | A 82; map Notes | The live library list |
| 90 | Expect a dip first | Expect a J-curve before the gains. Adoption spreads through people, so start by redoing your own commits with an agent | 3 | A 83 + B 98; PL §3.2, §1 (Hashimoto), §3.3 | — |
| 91 | Your harness, your route | The grid: a route row plus the three thread rows, each with a quick win, a longer step and an owner | 2 | A 84 + B 94; AP §1 | The grid, prefilled from the retrospective's hand-off |
| 92 | Fill the grid | Each group takes one thread row. The route row is filled together | 15 | A 85 + B 95; PL §6 | The grid fills as it's committed |
| 93 | Our AI stance | What's allowed, what's expected, which tools, disclosure, and a human always approves | 3 | B 96; PL §5 (DORA capability #1, Ghostty) | — |
| 94 | Measure it | Pick two or three team signals to watch for a month. No leaderboards | 2 | A 86 / B 97; PL §5; ticket 14 | — |
| 95 | Owners and dates | Vote, give each item an owner and a review date, and commit the plan as a file | 4 | B 99; PL §5 | The committed plan appears |
| 96 | The loop closes | Back to the map: the workshop's own next intent, and thanks | 1 | A 87 + B 100; AP §4 #2; map.md; CD p27 | — |

## 4. Totals per block

| Block | Slides | Min | Of which live demo or exercise |
|---|---|---|---|
| Opener | 7 | 26 | 15 (setup round; 11 min without it) |
| Talk, Part 1 | 33 | 58 | 15 live demo, plus 2 prepared |
| Case kickoff | 7 | 15 | — |
| Day 1 midday | 2 | 6 | Slide time only |
| Talk, Part 2 | 17 | 35 | 15 live demo |
| Day 1 PM interludes | 6 | 21 | 10 (stand-up). Slide time only |
| Day 2 retrospective | 9 | 40 | — |
| Day 2 skill lab | 7 | 70 | 57 (lab plus show and tell) |
| Day 2 action plan | 8 | 32 | 19 (grid, owners and dates) |
| **Total** | **96** | **303** | |

**The talk is 93 minutes**: 58 before the kickoff and 35 after lunch, with 30 of them live demo.

- Inside Part 1, the minutes split as: why 12, context 8, read 5, skills 10, explore 10, specify and the checkpoint 7, slice 6.
- Part 2 splits as: pick-up 1, checks 21, ship 5, learn and close 8.
- It's 3 minutes over A's 90. The extra comes from the live draft PR and checkpoint (slides 36–37) and the wayfinder aside (slide 31).
- If it has to be 90, the checkpoint can be shown prepared rather than live.

## 5. The demo chain

- **Fallback tags.** Each station ends on a tag, so any segment can start from a known state if the one before overruns:
  - `demo/01-read`, `demo/02-explored`, `demo/03-specified` (draft PR open, `spec-reviewed` set), `demo/04-sliced`
  - Part 2 starts from `demo/04-sliced`.
  - `demo/05-built`, `demo/06-reviewed`, `demo/07-shipped`, `demo/08-learned`
- **The demo passes every fixed gate**, the same as the groups:
  - a draft PR (slide 36)
  - the checkpoint by the other coach (37)
  - slice 1 green in CI (61)
  - review by a second tool (57)
- **Two chains.** Part 1 has 15 live minutes (slides 21, 32, 36, 37, 39) plus the prepared spec (34). Part 2 has 15 (53, 57, 61, 63).
- **Still open, in [Live demo script](../issues/18-live-demo-script.md):**
  - the demo story itself
  - which tool runs each segment
  - who drives
  - what each tag holds, including the GitHub state a tag can't hold
  - the demo's base branch and its card on the wall

## 6. Live views → slides

This replaces the Storyline A and B columns in [reporter-and-retrospective.md](reporter-and-retrospective.md) §3. The A column there used A's first-draft numbers.

| View | Slides | On the ribbon |
|---|---|---|
| **Wall** | The demo card from 36. Group cards from 47, projected through all group work | One mini ribbon per group (plus the demo card). The top row shows the phase (Explore · Specify · gate · Slice · Build · Review · Ship). The bottom row lights each thread as its artifacts land: context when `case/AGENTS.md` has grown past the stub and the glossary exists; skills when a skill has been used or written; checks when tests are added and CI goes green. The CI badge, `now` and the latest `notable` stay as in ticket 14 |
| **Same fog, three readings** | 49, after lunch. The coach's checklist is on 48 | — |
| **What the reviewers found** | 69 | — |
| **Stand-up card** | 70 | The group's mini ribbon, enlarged |
| **Tonight** | 72 | — |
| **Retrospective** | 73–81 | Swimlanes across the stations (75). Mistakes placed on stations (80). Fixes tagged with threads (81) |
| **Library list** | 87–89 | — |
| **Action plan grid** | 91–92, 95 | The route row plus the three thread rows |

## 7. What came from where

- **From A:**
  - the spine, the ribbon and its threads, and the fixed gates with every other fork marked "Your call"
  - the demo chain
  - the kickoff, the interludes, the retrospective and the skill lab
- **From B:**
  - the general opener (1–6) and "a capable new hire"
  - the skills deck's p2–3 opening the skills thread
  - the wayfinder aside at the Explore fork
  - the exhibits from this repo (17, 19, 27, 59) and the tautological test
  - "the deck reads your PR", "rebuild the friction", "measure the team" and "bring one task tomorrow"
  - "our AI stance", "owners and dates", and the action plan's grid shape
  - the wall's thread lights, in place of B's layer cards
- **Dropped from B:**
  - the six layers and their cards, and "guides and sensors" as a slide of its own (now one line on slide 11)
  - "putting the layers in order" (CD p7), "Forkful today" and "what's missing on purpose"
  - "the highest-value minute" and "portable vs tool-specific"
- **Dropped from A:** the wayfinder mechanics in the opener (A 4–8), now compressed into slide 31.

## Assumptions in this outline (to react to)

- **How the colleague's deck is used:**
  - p2–6 and p10 are the skills thread, in page order (slides 22–27).
  - p8 is on 20, p9 on 19, p12 on 38, p13–16 on 51, 52 and 58, p18–21 and p24 on 30–31, and p27 on 96.
  - Unused: p1, p7, p11, p22–23 (`implement-spec` isn't in the Day 1 library) and p25–26.
- **The demo story is a sibling story in Forkful**, picked with the coach notes in hand so it gives nothing away. That's in [Live demo script](../issues/18-live-demo-script.md).
- **A coach plays product in the live grill**, since the case has no stakeholder (ticket 08).
- **Groups may not all be through the checkpoint by lunch.** The plenary on slide 49 shows the grid as it stands.
