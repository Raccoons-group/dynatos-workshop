# Storyline A: one feature through the lifecycle

Type: prototype (HITL)
Status: resolved
Blocked by: 03, 04, 05

## Question

Outline the deck as one feature's journey through the AI-native lifecycle:

1. Foggy ticket
2. Explore and grill
3. Spec
4. Vertical-slice tickets
5. Implement with tests
6. Review and verify
7. Ship
8. Learn

Include the meta opener, and use the colleague's skills deck as the skills chapter.

Give each slide a title and a one-line intent, grouped by agenda block, with time estimates. Use the same format as Storyline B so the two can be compared directly.

## Assets

- [Rough outline: one feature through the lifecycle](../assets/storyline-a.md), the prototype to react to

## Answer

Outline: [assets/storyline-a.md](../assets/storyline-a.md). Reviewed with Matthias on 20 and 22 Oct 2026. He agreed it is a fair representation of Storyline A. Choosing between A and B is left to [Choose the storyline](12-choose-the-storyline.md).

- **The spine is one Forkful sibling story, followed from a foggy ticket to a merged PR and back into the harness.** It runs on a two-row ribbon:
  - the top row holds the eight stations the feature passes, each committing an artifact;
  - the bottom row holds three threads the feature carries throughout: context, skills and checks.
- **Each thread is taught once, where the feature first needs it.** This was Matthias's correction to the first draft, which spread these ideas across the stages.
  - Context comes before the ticket is read.
  - Skills come right after the first skill runs. The colleague's deck pages 4–6 and 10 stay together as one chapter.
  - Checks come as one 22-minute chapter covering build, verify and review.
  - Learn sends every lesson back into one of the three threads. The Day 2 retrospective, skill lab and action plan reuse the same rows.
- **Freedom for the groups (Matthias's second correction).**
  - Only a few gates are fixed: a draft PR within 30 minutes, the spec review checkpoint before any agent builds, slice 1 green in CI, review by another group's tool (at most 3 rounds), and the merge before the stand-up.
  - Every other fork is marked "Your call", with the alternative named.
  - The demo takes Pocock's route and names Tan's at each fork.
- **Size.**
  - 87 slides and about 298 minutes over the seven blocks.
  - The talk is exactly 90 minutes, of which 30 are live demo across seven segments, plus 2 prepared.
  - A natural break falls after slide 38, about 55 minutes in.
- **Strengths:**
  - one end-to-end story on the real codebase;
  - each cross-cutting idea has one home;
  - built-in freedom gives the retrospective's "three routes" something to compare.
- **Weaknesses:**
  - seven live demo segments chained on one feature;
  - the walk pauses three times for a thread chapter;
  - groups may copy the demo's route;
  - the demo story must give nothing away about what groups should discover.
- **Aligned with resolved tickets:**
  - [Case brief](08-case-brief-a-neutral-brownfield-app-with-a-foggy-epic.md): one computer per group, and a coach plays product.
  - [How groups work in the repo](13-how-groups-work-in-the-repo.md): the gates and the merge.
  - [What the reporter sees and what the retrospective says](14-what-the-reporter-sees-and-what-the-retrospective-says.md): the Day 1 live views and the Day 2 retrospective outline.
  - [Starter skill library and AGENTS.md template](16-starter-skill-library-and-agents-md-template.md): the skill names, wayfinder as an option, and test-first or test-after.

**For downstream tickets**

- [Choose the storyline](12-choose-the-storyline.md):
  - B's draft predates tickets 08, 13, 14 and 16. Where it still says "one checkout per person", a PO answering product questions, or team signals on Day 1, compare like for like.
  - The openers differ only slightly: B has "six layers", A has "wayfinder is one way in".
- **"Live demo content" fog:** if A is chosen, the demo story must be picked with the coach notes in hand.

**Fog.** Nothing graduates.
