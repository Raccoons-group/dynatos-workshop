# Agenda with timings and owners

Type: grilling (HITL)
Status: resolved
Blocked by: 08, 12

## Question

What is the minute-by-minute agenda for Day 1 (full day) and Day 2 (half day)? It should cover:

- Blocks and timings, including breaks and lunch
- Who leads each block (Matthias or Sander)
- When the spec review checkpoint and the stand-ups happen
- When the reporter skill and the overnight synthesis run

This is the schedule Dynatos receives.

## Context from research

[Wider practitioner landscape and evidence](05-wider-practitioner-landscape-and-evidence.md):

- Every serious source says the constraint moves to review and verification, so give review its own block on Day 1.
- The POs can own the acceptance examples in the spec, which is a concrete role at the spec review checkpoint. [Anthropic's playbook](03-anthropic-ai-native-sdlc-playbook-and-skills-guidance.md) says the same.

## Answer

Full schedule, with the pairings, the overnight run, the pipeline clock, the risks for the dry run, and the version Dynatos receives: [assets/agenda.md](../assets/agenda.md). Grilled with Matthias on 22 Oct 2026 in two rounds (Q1–Q10), starting from a draft built on ticket 12's block lengths and the case brief's afternoon fit.

- **Day windows** (Q1, Q3):
  - Day 1 runs 09:00–17:00, with doors at 08:30.
  - Day 2 runs 09:00–12:30, followed by lunch together and travel home.
  - Everything happens in one room, with three group tables and a shared screen for the wall.
- **The day opens with the participants** (Matthias, when he approved the write-up). Right after the welcome (slides 1–2), each participant gets two minutes on their setup, their experience, and how they work with agents today. The coaches log it.
  - The technical setup moves out of that round. Clone, install and `gh auth status` happen at the group tables from 08:30, and a 7-minute setup check at 09:33 confirms them.
  - The opener grows from 26 to 40 minutes.
- **Day 1 order:**
  - 09:40 Part 1 (58 + 2 slack)
  - 10:40 break
  - 10:55 kickoff, with "Groups, go" at 11:10
  - 11:10–12:40 explore and specify
  - 12:40 lunch
  - 13:25 "Same fog"
  - 13:30 Part 2 (35)
  - 14:05–15:45 slice and build
  - 15:45 break
  - 16:00 review block
  - 16:45 stand-up
  - 17:00 end
- **Breaks sit where pushes land** (Q2), so lunch and the 15:45 break hide the reporter's latency. Lunch is 45 minutes, catered in the room. There's no break inside Part 1.
- **Coaches divide the blocks themselves** (Q4, Q10), so the agenda's Lead column is left for them to fill. Three pairings are fixed:
  - The Part 1 lead drives its demo.
  - The other coach (the checkpoint coach) plays product on slide 32, does the live checkpoint on 37, and then does all three groups' checkpoints.
  - Whoever presents the retrospective runs and reviews the overnight synthesis.
- **Checkpoints** (Q5):
  - One coach does all three, for a consistent bar. They run from about 12:00, 15 minutes each, in the order groups are ready.
  - Overflow goes to 14:05 and 14:20.
  - The draft-PR check is at 11:40 ("Groups, go" + 30), and slide 48 is shown in plenary right after it.
- **The merge is the day's last push** (Q6).
  - Groups push their review by 16:30. At 16:35, slide 69 is shown together with the "Tonight" working-out checklist, so groups can push their gaps before merging with CI green by 16:45.
  - Slide 72 becomes a one-minute "what happens tonight".
- **Overnight** (Q7): the retrospective lead runs the synthesis at 17:30, then reviews and corrects it between 07:30 and 08:30 and publishes it by 08:30.
- **Day 2:**
  - retrospective 45 (40 + 5 slack)
  - skill lab: intro 15, lab 60 (up from 45), break, show and tell 15
  - action plan 45 (the grid gets 25, owners and dates get 7)
  - a new **closing round** at 12:15: what changes in how you work on Monday, mirroring the opening round
- **What Dynatos receives is the whole client proposal** (Q8, Q10):
  - the schedule
  - a three-line case description, without the epic's text
  - "Before you arrive"
  - "What we need from you": a participant list with role, product, GitHub username, OS, and tool and IDE; the Visual Studio/Rider question; licences; the room and wifi; and lunch
  - Coaches are named once, at the top, not per block.
- **Glossary** (Q9): added **Lead** and **Wall** to [GLOSSARY.md](../GLOSSARY.md).

**Affects**

- [Live demo script](18-live-demo-script.md):
  - **The pairing rule:** the Part 1 lead drives Part 1's demo, and the checkpoint coach plays product (32) and does the checkpoint (37). Part 2's drivers are 18's call.
  - **Clock times:**
    - Part 1: 21 at about 10:02, 32 at 10:19, 36 at 10:28, 37 at 10:30 and 39 at 10:34, with 2 minutes of slack before the 10:40 break.
    - Part 2: 53 at 13:35, 57 at 13:46, 61 at 13:54 and 63 at 13:59, with no slack before group work at 14:05.
  - An overrun in Part 2 eats group time, so restart from a tag rather than run long.
- [Live-deck pipeline spike](15-live-deck-pipeline-spike.md): meet the latency budgets in the asset's pipeline clock.
  - The demo's draft PR and label must show before 10:38. If `labeled` doesn't trigger a run, the demo pushes after the label.
  - Push to card in about 8 minutes, including CI, for slides 61 → 65.
  - **Review push to card in about 5 minutes** for 16:30 → 16:35. If it's slower, the push deadline moves to 16:25.
  - On Day 2, library PRs into `main` (10:00–11:00) and the committed action plan (about 12:10) also have to show on the deck.
- [What the reporter sees and what the retrospective says](14-what-the-reporter-sees-and-what-the-retrospective-says.md):
  - **Times:**
    - the draft PR by 11:40
    - labels from about 12:00, with overflow at 14:05
    - the last push is the merge, at about 16:45
    - the overnight run at 17:30
    - the coach review from 07:30 to 08:30, published by 08:30
  - **Time from intent to spec counts working minutes** from 11:10, excluding 12:40–14:05, so a group that waited through lunch for its checkpoint isn't counted as slower.
  - The "Tonight" view is shown at 16:35, before the merge.
  - The opening round's log is a coach-observation input.
- [Choose the storyline](12-choose-the-storyline.md)'s final outline, for the deck build:
  - Slide 3 becomes the opening round (22 min).
  - The clone and `gh` checks split off into a 7-minute setup check after slide 7. The opener goes from 26 to 40 minutes.
  - Slide 48 is shown at 11:40.
  - Slide 72 becomes "what happens tonight", and its checklist moves to 69.
  - Day 2 minutes: retrospective +5, lab 60, grid 25, owners and dates 7.
  - A new closing-round slide comes after 96, for 97 slides in total.
- [How groups work in the repo](13-how-groups-work-in-the-repo.md): the clone, install and `gh auth status` happen at the group tables from 08:30 and are confirmed at 09:33, not in the opening round. The draft PR is due by 11:40 and the merge by 16:45.
- [Create the GitHub repo and add the agent key](02-create-the-github-repo-and-add-the-agent-key.md): the participants' GitHub usernames for write access come from the participant list in the client mail.

**Fog**

- **Graduated:** *Client proposal* is settled by the asset's client-facing version and is cleared from the map.
- **Feeds the fog:**
  - *Setup round as the first live-deck feed.* The opening is now a conversation about setup, experience and workflow, not a PR. The first live act is the demo's draft PR at about 10:28, and the group cards follow by 11:40. This patch can probably close.
  - *Day 2 skill lab.* The lab is 60 minutes in cross-tool pairs. Its inputs are the opening round's log, the task each person brings (slide 71) and the retrospective's shortlist, which may answer "how we collect tasks without a survey".
  - *Action plan format.* It gets 45 minutes, and the plan is committed at about 12:10. The follow-up after the workshop is still open.
  - *Rehearsal and fallbacks.* The asset's risks for the dry run: timing the opening round, explore plus spec in 75 minutes and the checkpoint queue at 14:05, the review swap mechanics in 25 minutes, and the 5-minute latency at 16:30.
