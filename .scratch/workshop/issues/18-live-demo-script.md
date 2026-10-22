# Live demo script

Type: grilling (HITL)
Status: resolved
Blocked by: 12

## Question

What exactly does the talk's live demo do? [Choose the storyline](12-choose-the-storyline.md) fixed its shape:

- one Forkful sibling story along the ribbon, in two chains:
  - Part 1: slides 21, 32, 34 (prepared), 36, 37 and 39
  - Part 2: slides 53, 57, 61 and 63
- every fixed gate passed, the same as the groups
- a fallback tag per station

Still open:

- **The story.** Which sibling story does the demo follow? It must give nothing away about what the groups should discover in Forkful. Pick it with the coach notes in hand, and keep their names and rules out of this repo.
- **The tools.** Which tool runs each segment? Does a second tool appear anywhere besides the review on slide 57?
- **The people.** Who drives each segment, and who plays product in the grill? The checkpoint on slide 37 goes to the coach who isn't demoing.
- **The tags.** What does each fallback tag hold (`demo/01-read` … `demo/08-learned`)? How is the GitHub state a tag can't hold restored when a segment restarts: the draft PR, the `spec-reviewed` label, CI runs and review comments?
- **The PR and its card.** Where does the demo's PR live (a demo base, cut like a group's)? Where does its card sit on the wall next to the three groups' cards in the afternoon?

## Context

- [storyline-final.md](../assets/storyline-final.md) §5 (the demo chain) and §6 (live views to slides)
- [Storyline A](10-storyline-a-one-feature-through-the-lifecycle.md): weaknesses 1 and 3 (the chained demo, and a story that must give nothing away)
- [How groups work in the repo](13-how-groups-work-in-the-repo.md): how a base is cut from `case-start`
- [What the reporter sees and what the retrospective says](14-what-the-reporter-sees-and-what-the-retrospective-says.md): the reporter waits for the case's tests
- [Live-deck pipeline spike](15-live-deck-pipeline-spike.md): the demo card's latency and the `labeled` event. If the spike has already run, lean on it for the PR question.

## Assets

- [Live demo script: allergens on the menu](../assets/demo-script.md): the story, the product card, the station-by-station script with clock times, the fallback tags and the reset script, the demo's base, and the checklist for before Day 1

## Answer

Script: [assets/demo-script.md](../assets/demo-script.md). Grilled with Matthias on 22 Oct 2026 in three rounds (Q1–Q21), with the coach notes in hand. Ticket 17 resolved during round 1, and its pairing rule and clock are built in.

- **The story is "Show allergens on the menu"** (Q1, Q11, Q12). It's filed as a GitHub issue with the label `demo`.
  - It only touches dishes, the menu endpoint and the Menu page. The fog is real, with decisions for the two POs to watch, a sharp edge case for the test, and an agent mistake that repeats reliably.
  - The other candidates were rejected after checking them against the coach notes.
  - The checkpoint coach plays product from a **product card**, so the live grill reaches the same decisions as the prepared spec and the tags. The headline decision is "unknown is not none", and one question is handed back to show the recommended answer.
- **Keeping the demo clean** (Q2):
  - Forkful's build keeps the story's path free of everything in the coach notes.
  - The demo never writes Forkful's context: `case/AGENTS.md` stays a stub, and the glossary holds only the story's two terms.
  - Every tag is grepped before it's pushed, and every prompt is scoped and rehearsed.
- **Tools** (Q4): Claude Code everywhere. The second tool appears only on 57, where Codex CLI runs the same `code-review` skill as `$code-review`. Switch to Copilot CLI if Dynatos's answer on tools points there.
- **People** (Q5′, with 17's pairing rule):
  - Part 1: the Part 1 lead drives, and the checkpoint coach plays product (32) and does the checkpoint (37).
  - Part 2: the Part 2 lead drives 53, 61 and 63, and the other coach runs the review on 57.
  - There's one demo laptop with both CLIs.
- **Tag to tag** (Q13, Q14):
  - Part 1 runs live, except that the spec on 34 is prepared.
  - Part 2 always starts each segment from the previous station's fallback tag, and the driver says so out loud. That's 04 → 05 → 06, then 61 ships and 63 learns.
  - The review on 57 is started at the end of 53 and runs while 54–56 are presented.
- **Pushes, the label and the merge** (Q8′, Q19):
  - There are three pushes, each preceded by how-we-worked: 36 (the draft PR), 61 (ship), and the learn commit right after the talk.
  - The label on 37 moves the card past the gate through a `labeled` trigger.
  - The merge happens off stage once CI is green.
  - The hooks on 53 and 57 drop.
- **The fallback tags** (Q9, Q20) form one linear chain from the final rehearsal. `scripts/demo-reset.sh <tag>` restores the GitHub state a tag can't hold:
  - it force-pushes
  - it sets the draft or ready state and the label
  - it never closes the PR

  There are no GitHub review comments to restore, because the review lives in `review.md`.
- **The demo's PR** (Q6, Q7′):
  - It goes from `demo/allergens` into a fourth base, `demo/main`, cut like a group's.
  - Its card appears **only on talk slides**, never on the wall, and the demo is left out of every group view and Day 2.
- **The slices, the test and the lesson** (Q15, Q17–Q19):
  - `say-it-back` saves `work/demo/read.md`, and it lives on the demo base only.
  - There are three vertical tickets, with the naive split prepared on the slide.
  - Red-green at the menu endpoint: "unknown, not an empty list". The tautological test next to it is prepared and never committed.
  - On 63, the repeated mistake goes to the types rung.
- **When a segment can't run live** (Q10): a recording of each segment, a phone hotspot, and a coach's own subscription.
- **Glossary:** in [GLOSSARY.md](../GLOSSARY.md), **Wall** now says the demo card appears only on the talk's slides (Q7′), and **Fallback tag** is new (Q16).

**Affects**

- [Agenda with timings and owners](17-agenda-with-timings-and-owners.md). 17's decisions stand. These are edits to `agenda.md`:
  - **Part 2 pairing:** the Part 2 lead drives 53, 61 and 63. The other coach starts the review at about 13:40 and walks through it on 57.
  - **Lunch:** the Part 2 lead runs `demo-reset.sh demo/04-sliced` before 13:20.
  - **14:05–14:20:** the Part 1 lead pushes `demo/08-learned` and merges once it's green, off stage, because the checkpoint coach is at the overflow checkpoints.
  - **The live-deck column:**
    - The 11:40 row shows three group cards and no demo card.
    - In the Part 2 row, "moves to Build (53), Review (57)" drops. The card stays at Slice from the lunch reset until 61's push lands by 65.
    - In Part 1, the card reaches Slice through the label on 37, not through 39's tickets.
- [Live-deck pipeline spike](15-live-deck-pipeline-spike.md):
  - **The demo PR** goes from `demo/allergens` into `demo/main`, with group `demo` read from `docs/agents/`. The same script cuts it, and the optional retarget guard has to accept it. The spike can use the demo base for its dummy PR.
  - **Triggers:** add `labeled` (only `spec-reviewed` matters), which the groups' checkpoints need too. Add a `workflow_dispatch` to re-run the reporter for one PR by hand.
  - **Force-pushes:** `demo-reset.sh` force-pushes. A `synchronize` run has to follow, and the deck has to accept a card that moves back, because the latest observation wins.
  - **Budgets**, with the agenda's pipeline clock:
    - the draft PR at 10:28 shows by 10:34, and at the latest by 10:38
    - the label at 10:30 shows by 10:38
    - the lunch reset shows before 13:30
    - 61's push at about 13:55 shows by 14:03
  - **The deck** shows the demo card only on its talk slides (36, 37, 39, 50, 61, 65). The wall, the decision grid, "What the reviewers found", the stand-up card and "Tonight" filter out `demo`.
  - **Before Day 1,** clear the demo's file on `live-deck-data`.
- [What the reporter sees and what the retrospective says](14-what-the-reporter-sees-and-what-the-retrospective-says.md):
  - The reporter reads the demo PR like a group's.
  - The retrospective and the team signals leave `demo` out.
  - The demo card's context light stays off by design.
- [Choose the storyline](12-choose-the-storyline.md)'s final outline, for the deck build:
  - **Content:** 14 shows the demo issue, 25 dissects `say-it-back`, 39 carries the prepared naive split, and 53 the prepared tautological test.
  - **Hooks:** the ones on 53 and 57 drop. 50 shows the card at Slice. 65 says "context is yours this afternoon" and "we merge once it's green".
  - **Tags:** each demo slide shows its starting tag in a corner.
- [Case brief](08-case-brief-a-neutral-brownfield-app-with-a-foggy-epic.md), for whoever builds Forkful:
  - Keep the dish entity, the menu endpoint and the Menu page free of everything the coach notes plant.
  - Dishes start without allergen info.
  - The menu endpoint keeps its `WebApplicationFactory` test, so there's a seam to extend.
- [How groups work in the repo](13-how-groups-work-in-the-repo.md) and [Create the GitHub repo and add the agent key](02-create-the-github-repo-and-add-the-agent-key.md):
  - The cut script also makes `demo/main`, with the `docs/agents/` values in the asset and `.agents/skills/say-it-back/`.
  - Create the `demo` label.
  - The coach-notes grep covers the demo tags.

**Fog**

- **Nothing graduates.**
- **Feeds the fog:** *Rehearsal and fallbacks* gains three full dry runs, each restarting from every tag, a recording per live segment, a phone hotspot, warm builds, and closing the rehearsal PRs and clearing the demo's live data before Day 1. With tickets 17 and 18 resolved, this patch may now be sharp enough to ticket.
