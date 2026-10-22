# What the reporter sees and what the retrospective says

Type: grilling (HITL)
Status: resolved
Blocked by: 08

## Question

What does the reporter skill extract from a group's PR and working-out? Candidates: the phase the group has reached, the skills and specs used, tests added, decisions made, the tool used.

How does that appear on the live slides during Day 1? And what structure does the Day 2 retrospective take, so that it compares how the groups worked and not only what they built?

## Context from research

- [Wider practitioner landscape and evidence](05-wider-practitioner-landscape-and-evidence.md): measure team-level signals, not volume or feelings. Perception is off by about 40 points, and throughput metrics are marked Caution. Show first-pass acceptance, review rounds and rework.
- [Anthropic's playbook](03-anthropic-ai-native-sdlc-playbook-and-skills-guidance.md) metrics can be computed from git: time from intent to spec, spec rework, first-pass CI, drift between plan and diff.

## Answer

Full sketch, with the field list, the live views and the retrospective outline: [assets/reporter-and-retrospective.md](../assets/reporter-and-retrospective.md). Grilled with Matthias on 20 Oct 2026.

- **The reporter observes and never coaches.** It describes one group at a time and never advises. It's about groups, never people, with no ranking and no volume (lines, tokens, commits).
- **Scripts count, the agent reads.**
  - The prep script puts every number and timestamp into the observation's `facts`, without the model: phase, draft, the `spec-reviewed` label time, CI for this commit, first green, artifact timestamps, skills written, areas touched, tests added, review counts and last push.
  - The reporter skill fills `judgements`, each with a file and a quote as evidence: `now`, `notable`, the seven-point decision grid, acceptance examples matched to tests, slices, the review headline, and what the agent got wrong.
  - The model never writes a number. Where a slide shows a count, the deck counts a list.
- **The observation works for either storyline** (artifacts, decisions, slices, tests, review), so ticket 12 can map it onto the ribbon or the six layers.
- **Phase is derived by the script**, from the artifacts, a `spec-reviewed` label a coach adds at the checkpoint, and the PR's draft state.
- **The reporter waits for the case's tests**, so every observation shows the CI result for the commit it describes.
- **The live views on Day 1 show state, never team signals:**
  - a wall projected all afternoon
  - "Same fog, three readings" (the epic's seven points × three groups) at the checkpoint
  - "What the reviewers found" in the review block
  - the stand-up card
  - "Tonight" with a working-out checklist
- **A `how-we-worked` skill drafts the note, and there are no transcripts.**
  - It runs before every push and before a session is closed or cleared. Each run appends a section with a header for the tool and model.
  - Each section has two parts: "Observed by the agent", and "Said by the group" (from two or three short questions the skill asks).
  - The group checks and corrects it before committing.
- **The tool is declared, not inferred.** Commit trailers don't identify Codex and are unreliable for VS Code Copilot. Findings are in the shared notes folder as `14-transcript-export-findings.md`.
- **The retrospective reads the raw sources.**
  - It reads every group branch's git history, the PR timeline (labels, CI, reviews), the full working-out, the observation history as an index, and the coaches' local logs (never committed, marked "coach observation").
  - A coach runs it overnight on Opus and writes `retrospective.json`. Every claim has evidence and a confidence, and a coach reviews it before 09:00.
- **The retrospective outline (about 40 minutes):**
  1. How this was made
  2. Three routes (a swimlane per group)
  3. Is this you? Each group confirms or corrects the claim about itself the synthesis is least sure of
  4. Same fog, three readings, plus which calls caused rework
  5. Team signals, not volume: time from intent to spec (kickoff → label, the same start for everyone), spec rework, first-pass CI, review rounds, and drift between plan and diff, with groups in fixed columns and no totals
  6. How each group drove its agent
  7. Where the agent went wrong, placed where each mistake started
  8. Hand-off to the skill lab: the "wrong twice" shortlist, tagged with where a fix could live, and no suggested actions
- **Tool differences are anecdotes (n = 3).** At the kickoff, gently steer groups towards different tools. No group-by-group contrast between a group's note and its behaviour: the perception gap is made once, in general.
- **Glossary:** added Observation, Team signal, How-we-worked note and Phase to [GLOSSARY.md](../GLOSSARY.md).

**Depends on**

- [How groups work in the repo](13-how-groups-work-in-the-repo.md) (still open). The sketch assumes:
  - one `group-<x>/…` branch and **one PR per group**, opened as a draft within 30 minutes and pushed at least at every phase change
  - the working-out in `work/<group>/` (`spec.md`, `tickets.md`, `review.md`, `how-we-worked.md`, `skills/`)
  - `case/AGENTS.md` and the glossary in `case/`

  Other paths only change the prep script.
- [Starter skill library and AGENTS.md template](16-starter-skill-library-and-agents-md-template.md) (still open):
  - the `how-we-worked` skill
  - a review skill that writes `review.md` with one section per round and the four buckets as headings
  - where skills that groups write live
- [Live-deck pipeline spike](15-live-deck-pipeline-spike.md): wait for tests (`needs: test` or `workflow_run`), measure the latency with that wait, and merge `facts` with `judgements` in the publish job.
- [Deck framework](09-deck-framework-slidev-vs-react-vite-mdx.md): render tables and grids from JSON, with strings as text only.
- [Choose the storyline](12-choose-the-storyline.md): slide numbers and the frame.
- [Agenda](17-agenda-with-timings-and-owners.md): times for the draft PR, the checkpoint label, the last push, the overnight run and the coach review.

**Fog.** Nothing graduates, but two items move:

- "Rehearsal and fallbacks": the retrospective no longer depends on the live pipeline having worked.
- "Day 2 skill lab": the retrospective's "wrong twice" shortlist is one ready input for collecting the team's tasks.
