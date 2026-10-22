# Dynatos workshop

A 1.5-day hands-on workshop on AI-assisted development for the Dynatos (Routty) development team, run by Raccoons. This glossary fixes the words we use for the workshop itself; the case app keeps its own language.

## Language

### People

**Participant**:
One of the eleven Dynatos team members taking part, developers and product owners alike.
_Avoid_: attendee, student, trainee

**Coach**:
A Raccoons person who presents and helps groups during the workshop.
_Avoid_: trainer, facilitator, teacher

**Lead**:
The coach who runs one block of the agenda.
_Avoid_: owner (an action-plan item has an owner), presenter

**Group**:
Three or four participants working together on the case.
_Avoid_: team (that is the whole Dynatos dev team), squad

**Pair**:
Two or three participants, with at least two different tools between them, who build one skill, check or AGENTS.md change together in the Day 2 skill lab.
_Avoid_: group (that is Day 1), buddy, partner

**Plan owner**:
The participant who keeps the action plan alive after Day 2 and convenes its reviews. Each item in the plan has its own owner as well.
_Avoid_: sponsor, champion, lead (a lead is a coach)

### The workshop

**Day 1**:
The full first day: talk, live demo and group work on the case.

**Day 2**:
The half second day: retrospective, skill lab and action plan.

**Storyline**:
The order and throughline of the talk and the deck.
_Avoid_: narrative, flow

**Ribbon**:
The storyline's two-row picture of the work: the stations a feature passes along the top, and the threads it carries underneath. The talk, the wall, the retrospective and the action plan are all drawn on it.
_Avoid_: lifecycle diagram, roadmap

**Station**:
One of the eight stops along the top of the ribbon: read, explore, specify, slice, build, review, ship, learn. Each one commits an artifact.
_Avoid_: stage, step

**Thread**:
One of the three things a feature carries past every station, along the bottom of the ribbon: context, skills and checks. Each is taught once, and every lesson goes back into one of them.
_Avoid_: layer, pillar

**Case**:
The single assignment every group works on: a small, neutral, existing app with one foggy epic to deliver.
_Avoid_: challenge, exercise, assignment, hackathon project

**Coach notes**:
What the case deliberately hides from participants: the names that drifted, the rules that live only in code, and the coaches' idea of a first cut. Kept from participants until after the Day 2 retrospective.
_Avoid_: spoilers, answer key, answer card

**Spec review checkpoint**:
The moment on Day 1 where a coach reviews each group's spec before the group lets an agent build. One of the fixed gates.
_Avoid_: the gate, demo

**Fixed gate**:
One of the few things every group does on Day 1, whatever its route: a draft pull request within 30 minutes, the spec review checkpoint, slice 1 green in CI, review by another group's tool, the how-we-worked note before every push, and the merge before the stand-up. Everything between them is the group's call.
_Avoid_: milestone, requirement, rule

**Fallback tag**:
A git tag holding the demo's state at the end of a station, so any demo segment can start from a known state.
_Avoid_: checkpoint (that is the spec review), snapshot, save point

**Working-out**:
The non-code artifacts a group commits alongside its code: spec, ticket breakdown, skills written, and a short note on how the group worked.
_Avoid_: notes, docs, artefacts

**How-we-worked note**:
The part of a group's working-out that records how the group worked: what the agent observed in its sessions and what the group says, drafted by a skill and checked by the group.
_Avoid_: journal, log, retro notes

**Phase**:
The station a group is at during its Day 1 group work: explore, specify, slice, build, review or ship. Passing the spec review checkpoint moves a group from specify to slice; it is not a phase of its own.
_Avoid_: step, status

**Skill library**:
The cross-tool skills in the repo that groups use on Day 1 and that Dynatos keeps, extended with the skills written on Day 2.
_Avoid_: toolkit, skill pack, starter kit

**Review round**:
One pass of the AI reviewer over a group's pull request, plus the fixes that follow. A pull request gets at most three.
_Avoid_: iteration, review cycle

**Fix level**:
Where the fix for a mistake the agent made twice lives, from strongest to weakest: architecture, types, a check, a test, an AGENTS.md line. The highest level that works wins. A repeated procedure becomes a skill instead.
_Avoid_: rung, tier, severity

### The live deck

**Live deck**:
The web slide deck that changes during the workshop as agents read the groups' pull requests.
_Avoid_: dynamic slides, dashboard

**Wall**:
The live view projected during Day 1's group work: one mini ribbon per group, showing each group's phase and which threads have lit up. The demo's card appears only on the talk's slides, never on the wall.
_Avoid_: dashboard, board, leaderboard

**Reporter skill**:
The skill that reads a group's pull request and working-out and writes what it finds into the live deck.
_Avoid_: bot, CI agent

**Observation**:
What the reporter skill records about one group's pull request at one push: facts counted by a script, and judgements that each point to their evidence.
_Avoid_: report, snapshot, status, scorecard

**Team signal**:
A measure of how a group worked, computed from git and GitHub history, such as time from intent to spec, spec rework, first-pass CI, review rounds, or drift between plan and diff. Never a measure of volume.
_Avoid_: metric, KPI, score

**Retrospective**:
The Day 2 part of the live deck, synthesised from every group's working-out, comparing how the groups worked.
_Avoid_: lessons learned, recap

### After the workshop

**Takeaway**:
Something Dynatos keeps and uses after Day 2.
_Avoid_: deliverable, output

**Takeaway repo**:
The repository Dynatos receives and owns after Day 2. It holds the takeaways, but not the case or the deck.
_Avoid_: workshop repo (that one stays with Raccoons), starter repo, template repo

**Action plan**:
The Day 2 list of quick wins and longer-term steps the team commits to.
