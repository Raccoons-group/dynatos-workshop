# Agenda: Day 1 and Day 2

Resolves [Agenda with timings and owners](../issues/17-agenda-with-timings-and-owners.md). Agreed with Matthias on 22 Oct 2026. Slide numbers refer to the [final outline](storyline-final.md). The version Dynatos receives is at the end: [Client-facing version](#client-facing-version-send-as-is).

## At a glance

- **Day 1** runs 09:00–17:00, with doors open at 08:30. It all happens in one room, with three group tables and a shared screen the tables can see.
  - The day opens with the participants: their setup, their experience, and how they work with agents today.
  - The talk comes in two parts: Part 1 (58 min) before the kickoff, and Part 2 (35 min) after lunch.
- **Overnight:** the retrospective synthesis.
- **Day 2** runs 09:00–12:30, followed by lunch together and travel home.

## Who leads

Matthias and Sander divide the blocks between them, so the **Lead** column is left for them to fill in. Only these pairings are fixed, and each needs two different coaches:

1. **Part 1 lead:** presents Part 1 and drives its demo. During the morning's group work, this coach does the 11:40 card check and floats.
2. **Checkpoint coach:** the other coach. Plays product in the live grill (slide 32), does the demo's live checkpoint (slide 37), and then does all three groups' checkpoints, so the bar stays the same for every group.
3. **Retrospective lead:** whoever presents the retrospective also runs the overnight synthesis and reviews it in the morning.

## Day 1

| Time | Block | Lead | What participants do | Live deck |
|---|---|---|---|---|
| 08:30–09:00 | Doors, coffee, setup at the group tables | both | On each group's computer: `git clone -b group-<x>/main`, `pnpm install`, `gh auth status`, and the setup checks (sketch §9 of [skill-library-and-agents-md.md](skill-library-and-agents-md.md)) | Title slide. The footer shows "last update from GitHub: hh:mm" |
| 09:00–09:03 | Welcome (1–2) | | | |
| 09:03–09:25 | **Opening round** (3) | | Two minutes each: your tool and IDE, your experience so far, how you work with agents today (a recent example), and one thing you trust an agent with and one you don't. The coaches log it | — |
| 09:25–09:33 | Opener (4–7): agents are here, built the way we teach, the trail, the next day and a half | | | `map.md` rendered (5). The PR list, live (6) |
| 09:33–09:40 | Setup check | both | Sit at your group table. Confirm the clone, `pnpm install`, `gh auth status` and the checks, and fix any stragglers | — |
| 09:40–10:40 | **Talk, Part 1** (8–40): read → slice. 58 min plus 2 slack | Part 1 lead. The checkpoint coach plays product (32, about 10:19) and does the live checkpoint (37, about 10:30) | Watch the demo chain: 21 at about 10:02, 32 at 10:19, 36 at 10:28, 37 at 10:30, 39 at 10:34 | **First live update:** the demo card appears after 36, passes the gate at 37, and moves to Slice at 39 |
| 10:40–10:55 | Break | | | |
| 10:55–11:10 | **Case kickoff** (41–47) | | Your epic, what "done" means tonight, what's fixed and what's yours, house rules. "Groups, go" at 11:10 | An empty mini ribbon (42). The fixed gates (43) |
| 11:10–12:40 | **Group work: explore and specify** | Checkpoint coach, plus the Part 1 lead floating | `read-issue`, grill the epic, `case/AGENTS.md` and `case/GLOSSARY.md`, the spec. `open-pr` opens the draft PR by 11:40. Call the checkpoint coach when the spec is ready | The wall is projected. Group cards appear as the draft PRs open |
| 11:40–11:43 | ↳ Card check, and slide 48 in plenary | The Part 1 lead checks the cards, and the checkpoint coach shows 48 | Pause for 3 minutes: here's what the checkpoint checks | The wall: three group cards and the demo card |
| from about 12:00 | ↳ Spec review checkpoints, 15 min each, at the group's table, in the order groups are ready | Checkpoint coach | Walk the coach through the spec. The coach adds `spec-reviewed` | The group's card passes the gate |
| 12:40–13:25 | Lunch (45 min, catered in the room) | | Push before lunch | The reporter catches up on the morning's pushes |
| 13:25–13:30 | "Same fog, three readings" (49) | | | Live: the seven-point decision grid, as it stands |
| 13:30–14:05 | **Talk, Part 2** (50–66): checks, ship, learn | | Watch the demo chain: 53 at about 13:35, 57 at 13:46, 61 at 13:54, 63 at 13:59 | The demo card moves to Build (53), Review (57), and Ship with slice 1 green (61, landing by 65 at about 14:03) |
| 14:05–15:45 | **Group work: slice and build** | Checkpoint coach first: any checkpoints that missed lunch, at 14:05 and 14:20 | `to-tickets`, then `implement` with `tdd` (or test-after, recorded). Get slice 1 green in CI. Push at every phase change, and run how-we-worked before every push | The wall |
| 15:45–16:00 | Break | | Push before the break | The reporter catches up |
| 16:00–16:45 | **Review block** (67–69), then the merge | | 16:00: slides 67–68. 16:05: another group's tool reviews your PR (at most three rounds, into `review.md`). Fix, run how-we-worked a final time, and **push by 16:30**. 16:35: slide 69 and the working-out checklist. Push any gaps, mark the PR ready, and **merge with CI green by 16:45**. The merge is the day's last push | 16:35: "What the reviewers found", and the "Tonight" checklist for each group |
| 16:45–17:00 | **Stand-up** (70), "Bring one task tomorrow" (71), what happens tonight (72) | | Three minutes per group, on its own mini ribbon. Note one repetitive task from your real job | The stand-up card for each group |
| 17:00 | End of Day 1 | | | |

## Overnight

| Time | What | Who |
|---|---|---|
| about 16:45 | The last push is the merge. A closed PR triggers no run, so each group's card stays at its last observation | The groups |
| 17:30 | The retrospective lead runs the synthesis locally from `main` (Opus). It reads `case-start..group-<x>/main`, the PR timelines, `live-deck-data`, the coach logs (including the opening round) and the coach notes, and writes `retrospective.json` | Retrospective lead |
| 07:30–08:30 | Review and correct every claim, then publish to `live-deck-data` by 08:30 | Retrospective lead |
| 08:30 | Check that the retrospective view loads before the doors open | both |

## Day 2

| Time | Block | Lead | What participants do | Live deck |
|---|---|---|---|---|
| 08:30–09:00 | Doors, coffee | | | The retrospective view is loaded |
| 09:00–09:45 | **Retrospective** (73–81). 40 min plus 5 slack | Retrospective lead | A show of hands before any data (74). Each group confirms or corrects the claim about itself (76) | Swimlanes, the decision grid, team signals, mistakes placed on stations, the "wrong twice" shortlist |
| 09:45–10:00 | **Skill lab** intro (82–86) | | The input: the shortlist, plus the task each of you brought | The shortlist |
| 10:00–11:00 | ↳ Lab, 60 min (up from the outline's 45), with self-paced coffee | both coach the pairs | In cross-tool pairs, build one skill, check or AGENTS.md change for your real work, and open a PR into the shared library | Each library PR appears on the deck |
| 11:00–11:15 | Break | | | |
| 11:15–11:30 | ↳ Show and tell (88) | | Two minutes per pair: what it catches, and proof that it works | Live: the library list |
| 11:30–12:15 | **Action plan** (89–96). 45 min: the grid gets 25 (up from 15), and owners and dates get 7 (up from 4) | | Each group fills one thread row, and the route row is filled together. Vote, give each item an owner and a review date, and commit the plan | The grid fills as it's committed. The committed plan (95) |
| 12:15–12:30 | **Closing round** (new slide after 96) | | One sentence each: what changes in how you work on Monday. It mirrors the opening round | — |
| 12:30 | Lunch together, then travel home | | | |

## Pipeline clock

The times the reporter and the deck have to meet (for [Live-deck pipeline spike](../issues/15-live-deck-pipeline-spike.md)):

| When | Event | Has to show by |
|---|---|---|
| Day 1, about 10:28 | The demo's draft PR (slide 36) | Slide 39 at about 10:34, and at the latest before Part 1 ends at 10:38 |
| about 10:30 | The demo's `spec-reviewed` label (37) | 10:38. If a `labeled` event doesn't trigger the reporter, the demo pushes after the label |
| 11:10–11:40 | The groups' draft PRs | The 11:40 card check |
| from about 12:00 | The groups' `spec-reviewed` labels | Within minutes, so the card passes the gate while the coach is still at the table |
| before 12:40 | The groups' spec pushes | "Same fog" at 13:25. Lunch hides the latency |
| about 13:54 | The demo's push (61). The reporter waits for CI tests | Slide 65 at about 14:03: about 8 minutes, including CI |
| by 16:30 | The groups' review pushes | Slide 69 at 16:35: **about 5 minutes, the tightest budget of the day** |
| about 16:45 | The merges. No run follows | — |
| 17:30 → 08:30 | The overnight synthesis, review and publish | The Day 2 doors at 08:30 |
| Day 2, 10:00–11:00 | Library PRs into `main` | During the lab and the show and tell |
| about 12:10 | The action plan committed | Slide 95 |

## Risks for the dry run

- **The opening round** is eleven people at two minutes each. It needs a visible timer, and the coaches have to cut kindly.
- **Explore plus spec in about 75 minutes.** Expect one or two checkpoints before lunch and the rest at 14:05. A group checked at 14:20 has about 85 minutes left for tickets and build, against the case brief's 90. If the dry run shows two groups queuing at 14:05, decide whether the floating coach takes the second one with the slide 48 checklist.
- **The review swap in 25 minutes:** who runs which tool on whose PR, and who writes `review.md`. Time it.
- **The 16:30 → 16:35 latency.** If the spike measures more than 5 minutes, move the push deadline to 16:25.

---

## Client-facing version (send as-is)

> **AI-assisted development: a hands-on workshop for the Dynatos development team**
>
> 's-Hertogenbosch · one and a half days · in English · coaches: Matthias and Sander (Raccoons)
>
> **What it is.** A hands-on workshop on working with AI coding agents as a team. You work in three mixed groups of developers and product owners, each with your own tool (Claude Code, Codex or GitHub Copilot). Each group takes a deliberately vague epic through to a reviewed, tested pull request. Day 2 looks back at how the groups worked, turns your own repetitive tasks into reusable skills, and ends with the team's action plan.
>
> **The case.** A small, existing .NET and React web app built for this workshop, with one foggy epic that every group gets. No Dynatos code or data is used. Each group decides its own route. A few checkpoints are fixed, and a coach reviews each group's spec before any agent builds.
>
> **Day 1 (full day)**
>
> | Time | |
> |---|---|
> | 08:30 | Doors open, coffee, and setup help at the group tables |
> | 09:00 | Welcome, then a round: your setup, your experience, and how you work with AI agents today |
> | 09:40 | Talk, part 1: from a vague ticket to a reviewed spec, with a live demo |
> | 10:40 | Break |
> | 10:55 | Case kickoff: the app, the epic, how the groups work |
> | 11:10 | Group work: explore the code and the epic, and write the spec. A coach reviews each group's spec |
> | 12:40 | Lunch |
> | 13:25 | How the three groups read the same epic |
> | 13:30 | Talk, part 2: tests, review and shipping, with a live demo |
> | 14:05 | Group work: slice the spec and build the first slice, with tests |
> | 15:45 | Break |
> | 16:00 | Review: another group's tool reviews your pull request, then you merge |
> | 16:45 | Stand-up per group, and a look ahead to Day 2 |
> | 17:00 | End |
>
> Throughout the day, the slides update live from the groups' pull requests. Overnight we prepare a retrospective from what the groups committed: their git history and the notes they write about how they worked. We don't use chat transcripts.
>
> **Day 2 (morning)**
>
> | Time | |
> |---|---|
> | 08:30 | Doors open, coffee |
> | 09:00 | Retrospective: how the three groups worked, and where the agents went wrong |
> | 09:45 | Skill lab: in pairs, turn a repetitive task from your own work into a skill or check |
> | 11:00 | Break |
> | 11:15 | Show and tell |
> | 11:30 | Action plan: quick wins and longer-term steps, each with an owner and a date |
> | 12:15 | Closing round |
> | 12:30 | Lunch together, end |
>
> **What you take home:** a shared skill library that works in Claude Code, Codex and Copilot (including the skills you write on Day 2), an AGENTS.md template, the action plan, and the skill that drives the live slides.
>
> **Before you arrive, on your laptop:**
>
> - git, and a GitHub account
> - the GitHub CLI (`gh`), signed in
> - Node.js 22 or newer, with pnpm
> - the .NET 10 SDK
> - your AI coding tool with an active licence: Claude Code (version 2.1.277 or newer), OpenAI Codex, or GitHub Copilot in VS Code or the Copilot CLI
>
> Product owners only need a GitHub account and their AI tool.
>
> **What we need from you:**
>
> 1. The participant list: name, role, product, GitHub username, operating system, and AI tool and IDE. We use it to mix the groups and to give everyone write access to the workshop repository.
> 2. Who uses Visual Studio or Rider with Copilot Chat? Those IDEs don't read the shared agent instructions, so we'll ask those people to use VS Code or the Copilot CLI for the workshop.
> 3. An active licence for each participant's AI tool.
> 4. One room with three group tables and a screen everyone can see, plus wifi that allows GitHub and the AI tools' services.
> 5. Lunch in the room on Day 1, and lunch together after the close on Day 2.
