# Choose the storyline

Type: grilling (HITL)
Status: resolved
Blocked by: 10, 11

## Question

Storyline A, Storyline B, or a merge of the two? Put both outlines side by side and decide which one carries the workshop, including where the case kickoff and the hands-on blocks cut into it.

## Assets

- [Final outline: one feature through the lifecycle, merged](../assets/storyline-final.md): 96 slides, with the ribbon, the demo chain, and the live views mapped to slide numbers

## Answer

Final outline: [assets/storyline-final.md](../assets/storyline-final.md). Grilled with Matthias on 22 Oct 2026 in three rounds (Q1–Q7), starting from a side-by-side of [Storyline A](../assets/storyline-a.md) and [Storyline B](../assets/storyline-b.md).

- **A merge on A's spine** (Q1). The talk follows one Forkful sibling story from a foggy ticket to a merged PR, on A's ribbon.
  - Why: the hands-on afternoon depends on the groups' first hour. A's risks fall on the coaches (rehearsal and fallback tags). B's main risk falls on the participants, who would start without knowing the sequence.
  - B's best pieces don't depend on its spine, so they're ported:
    - the general opener and the exhibits from this repo
    - "the deck reads your PR", "rebuild the friction", "measure the team" and "bring one task tomorrow"
    - "our AI stance", "owners and dates", and the action plan's grid shape
- **The talk is split at the checks cut** (Q2).
  - Part 1 (58 min: read → slice) comes before the kickoff.
  - Groups explore and specify until lunch, and each group's checkpoint happens when it's ready.
  - After lunch come the "Same fog, three readings" plenary and Part 2 (35 min: checks, ship, learn), and then groups build.
  - Why: verification is taught just before groups build, groups start about 45 minutes earlier, and the POs get grilling and the spec as hands-on work in the morning.
  - **This amends the map's settled day shape** ("talk about 1.5h, then the case kickoff").
  - The talk is 93 minutes, 3 over A's 90. 30 of them are live demo, 15 in each part.
- **One frame: the ribbon, everywhere** (Q3).
  - **Wall:** a mini ribbon per group. The top row is the group's phase, and the bottom row lights each thread as its artifacts land.
  - **Retrospective:** each mistake is placed on the station where it started, and its fix is tagged with the thread where it can live.
  - **Action plan:** the ribbon as a grid.
    - A route row (the gates and stations the team adopts), plus context, skills and checks rows. Each row gets a quick win, a longer step and an owner.
    - Each group takes one thread row, and the route row is filled together.
- **The opener is general** (Q4), applying the correction Matthias made to B.
  - B's slides 1–6, then A's agenda drawn on the ribbon.
  - The wayfinder pages (CD p18–21, p24) become a 3-minute aside at the Explore fork.
  - CD p2–3 open the skills thread, so p2–6 and p10 run as one chapter, in page order.
- **The demo survives being chained and split** (Q5).
  - Every station has a fallback tag, and Part 2 picks up from `demo/04-sliced`.
  - The demo passes every fixed gate the groups pass:
    - Its draft PR opens right after the spec, so the first live update moves into the morning (slide 36).
    - The other coach does its checkpoint live (slide 37).
    - Slice 1 goes green in CI, and a second tool reviews it.
- **Stations and phases** (Q6).
  - There are eight stations: read, explore, specify, slice, build, review, ship, learn.
  - A phase is the station a group is at: explore, specify, slice, build, review or ship.
  - "Spec reviewed" is no longer a phase. It's the gate between specify and slice.
- **"Fixed gate" is a glossary term** (Q7). It covers the six things every group does on Day 1, whatever its route. The checkpoint is one of them and is never called "the gate".
- **Defaults Matthias accepted without a separate question:**
  - B's "the deck reads your PR" joins the kickoff.
  - "Bring one task tomorrow" comes before "Tonight".
  - B's exhibits become one aside per thread.
  - "Rebuild the friction" opens the review block.
  - "Measure the team" closes Part 2.
  - The station names, the tag names, and the mapping of live views to slides are also mine.
- **Glossary:** in [GLOSSARY.md](../GLOSSARY.md), added **Ribbon**, **Station**, **Thread** and **Fixed gate**, and redefined **Phase**. The spec review checkpoint's avoid-list now says "the gate".

**Affects**

- [Agenda with timings and owners](17-agenda-with-timings-and-owners.md):
  - **Day 1 order:**
    1. Opener with the setup round (26 min, 15 of them the setup)
    2. Part 1 (58)
    3. Kickoff (15)
    4. Group work: explore and specify, with each checkpoint when the group is ready. The 30-minute draft-PR check falls here.
    5. Lunch
    6. "Same fog, three readings" plenary (3)
    7. Part 2 (35)
    8. Group work: slice and build
    9. Review block (8 min of slides plus the review itself), then the merge
    10. Stand-up (10), "Bring one task tomorrow" (2) and "Tonight" (1)
  - **Day 2 blocks:** retrospective 40, skill lab 70, action plan 32, plus breaks.
  - **Breaks:** where the morning break falls is the agenda's call. Part 1 at 58 minutes doesn't need one inside it.
  - **Owners:**
    - who presents each part and who drives each demo segment
    - who plays product in the live grill (slide 32)
    - who does the demo's checkpoint (slide 37). It must be the coach who isn't demoing.
  - If the agenda needs the talk at exactly 90 minutes, show slide 37 prepared instead of live.
  - Dynatos's schedule should show the talk in two parts.
- [What the reporter sees and what the retrospective says](14-what-the-reporter-sees-and-what-the-retrospective-says.md). These are build-time changes; 14's decisions stand.
  - **Phase values become** Explore, Specify, Slice, Build, Review and Ship.
    - In the phase rules, the `spec-reviewed` label now maps to Slice (it was "Spec reviewed").
    - "PR ready" is renamed Ship.
    - `specReviewedAt` stays and draws the gate on the card.
  - **The wall card is a mini ribbon.** Its bottom row lights each thread from facts that already exist:
    - context: `artifacts.agentsMd` past the stub, and `artifacts.glossary`
    - skills: `skillsWritten`, or a skill used according to the judgements
    - checks: `testsAdded` and `firstGreenAt`
  - **Slide numbers:** §6 of the final outline replaces the Storyline A and B columns in the reporter sketch's §3. The A column there used A's first-draft numbers.
  - **Retrospective:** sections 7 and 8 use stations and threads, and section 6 reads along the threads.
- [Live-deck pipeline spike](15-live-deck-pipeline-spike.md):
  - **The demo needs its own PR that the reporter reads:** a demo base, cut like a group's, and a fourth card on the wall. The exact shape is in [Live demo script](18-live-demo-script.md).
  - **The demo card updates during the talk:** the draft PR (slide 36) makes the card appear, and the label (slide 37) moves it past the gate. Check whether a `labeled` event triggers the reporter, or whether the demo has to push after the label. Measure the latency against those two slides.

**Fog**

- **Graduated:** "Live demo content" became [Live demo script](18-live-demo-script.md).
- **Feeds the fog (nothing else graduates):**
  - *Setup round as the first live-deck feed.* The first live act is now the demo's draft PR on slide 36, and the groups' cards follow within 30 minutes of the kickoff. The agenda may be able to close this patch.
  - *Day 2 skill lab.* Slide 71 asks everyone to bring one repetitive task. Together with the retrospective's shortlist, that's the lab's input.
  - *Action plan format.* The grid shape is set, and slide 95 commits the plan as a file. Where that file lives and how the plan is followed up are still open.
  - *Rehearsal and fallbacks.* The dry run rehearses the demo chain from every fallback tag, not just from the start.
