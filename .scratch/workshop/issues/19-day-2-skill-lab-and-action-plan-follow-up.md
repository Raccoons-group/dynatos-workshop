# Day 2: skill lab and action plan follow-up

Type: grilling (HITL)
Status: resolved
Blocked by: none

## Question

The [agenda](17-agenda-with-timings-and-owners.md) fixed Day 2's frame: a 60-minute skill lab in cross-tool pairs, with a 15-minute intro and 15 minutes of show and tell, then a 45-minute action plan committed at about 12:10. Two things are still open:

1. **The skill lab.** How do pairs choose a task? The candidate inputs are the opening round's log, the task each person brings (slide 71), and the retrospective's "wrong twice" shortlist ([What the reporter sees and what the retrospective says](14-what-the-reporter-sees-and-what-the-retrospective-says.md)). Also decide:
   - what a finished lab skill must contain (trigger tests? a fix placed on Tan's ladder?)
   - how it reaches the shared skill library: library PRs into `main` between 10:00 and 11:00
   - what the show and tell shows
2. **The action plan.** What does the committed plan look like, beyond the grid with owners and dates? And what happens after the workshop: who follows up, when, and is there a return session with Raccoons?

## Assets

- [Day 2: skill lab and action plan](../assets/day-2-lab-and-plan.md): the lab handout sketch, the finished-output checklist, the action-plan template, the follow-up and the takeaway repo

## Answer

Full sketch: [assets/day-2-lab-and-plan.md](../assets/day-2-lab-and-plan.md). Grilled with Matthias on 22 Oct 2026 in three rounds (Q1–Q23).

### The skill lab

- **Forkful is the proving ground** (Q1). Every lab output is proved on the case, never on Dynatos code, which keeps the out-of-scope line intact. Using it on their own repos is an action-plan item.
- **Tasks come in on a card** (Q2), handed to a coach at 17:00 after slide 71. It has four lines: the task, how often, what goes wrong, and my tool. The card stays off the repo.
- **People form their own pairs** (Q3, amended by Q21).
  - A pair is two or three people, formed around the cards, which coaches sort by thread overnight. Coaches sort but never assign.
  - One rule: at least two tools per pair. One nudge: mix the Day 1 groups.
  - The opening round's log is not an input for tasks.
- **How a pair picks its task** (Q22, which replaces Q11):
  - The order is: a matching "wrong twice" item, then a verification task, then any card task provable on Forkful in 60 minutes.
  - The pair decides by 10:10, and a coach confirms the task is provable in time.
  - A card that needs Dynatos systems goes into the plan, with its author as owner.
- **What a finished output contains** (Q4, Q12, Q20):
  - **Every output:** a PR into `main` with a Proof section, a fix level plus why not higher (or "procedure → skill"), an owner and a review date, and CI green, including the CI guard.
  - **A skill:**
    - portable frontmatter, and a description written as trigger conditions
    - a Gotchas section, grown from the real failure
    - a `TESTS.md` with 3 prompts that should fire it and 3 that shouldn't, run in a fresh session in **both** partners' tools (required)
    - one with/without run
  - **A check or test:** it fails on the real mistake, passes on the fix, and its error message names the fix.
  - **An AGENTS.md line:** only if nothing higher works, and it goes into the template.
  - **The owner is written at the top of `TESTS.md`, not in CODEOWNERS.** Five PRs each adding a line to one file would conflict. The takeaway repo's CODEOWNERS is built from these lines.
  - **"Rung" becomes "Fix level"** in everything participants read, and slide 83 becomes "Fix it as high as you can".
- **The route into the library** (Q5, Q13):
  - Everyone, POs included, clones `main` at the 08:30 doors on Day 2.
  - A pair works on `lab/<name>`, cut from `main`, and opens a PR into `main`.
  - Coaches review in the 11:00 break and merge what meets the bar.
  - An unfinished PR goes into the plan's "Lab PRs to finish". If it's merged within a week, it goes into the takeaway repo.
- **POs** (Q23) need git for Day 2, plus Node 22 and pnpm if they use Claude Code.
- **Show and tell** (Q14):
  - The shared screen shows the library list, and a coach opens each PR at its Proof section. No live runs.
  - Each pair gets 2 minutes: what it catches, the fix level, and the trigger results per tool.
  - The last 5 minutes are one question for the room: "Where did the two tools disagree?"
- **The library list on the deck** (Q15) is computed by a script, without the model, and shows no names. The reporter skips PRs into `main`.
- **Checks that only exist on Forkful** (Q16) are copied into `recipes/<name>.md` in the takeaway repo, and porting them is a checks-row item.

### The action plan

- **What the committed plan contains** (Q6) is one README with seven parts:
  1. the grid: the route row and the three thread rows, each with a quick win, a longer step, owners and review dates
  2. an outline of the AI stance, with writing the full stance as a route-row item
  3. two or three signals to watch for a month
  4. lab PRs to finish
  5. parked items
  6. open questions for Dynatos
  7. the first review
- **How the grid gets filled** (Q7):
  - Each Day 1 group drafts its thread row with its own agent, as a PR into `main`. A coach merges each one as it lands, so the grid fills in live.
  - A coach types the route row, the stance, the signals and the vote on the shared screen.
  - The plan is committed at about 12:10. If an agent stalls, the coach types that row.
- **Where it lives** (Q17): `docs/action-plan/` on `main`. It moves unchanged into the takeaway repo.
- **Plan owner** (Q8): chosen by the room at slide 95. The Raccoons contact is whoever led the retrospective.
- **Follow-up** (Q9, Q18):
  - **There's no return session with Raccoons.**
  - One mail goes out within a week. It has the takeaway repo, the deck as a PDF with the retrospective, the plan, and an offer to answer questions by mail until the first review.
  - The first review is the team's own, at about 4 weeks, convened by the plan owner.
- **The takeaway repo** (Q10) is a clean repo: the library, the link script, the templates, the reporter skill, the plan and the recipes. A coach builds it and transfers it to Dynatos within a week. It holds no case, no deck and no coach notes. The workshop repo stays read-only for 3 months, then it's archived.
- **Jira** (Q19): we don't ask Dynatos for a sandbox Jira project. The Jira port of `read-issue` goes into the skills row.

### Defaults Matthias accepted without a separate question

These are listed in the asset's §10:

- Pairs form at 09:58, across the boundary into the lab.
- The lab timebox.
- A lab PR template (`lab.md`, used with `gh pr create --template`), and `docs/skill-lab.md` as the handout's copy in the repo.
- Show and tell goes in the order the PRs were opened. Self-selected pairs leave no order on slide 82.
- Groups choose their own thread row, with a coin for a clash. Each row draft holds up to 3 candidates per cell for slide 95's vote.
- A quick win is done within 2 weeks and a longer step within 3 months. The first review is 45 minutes.

### Glossary

Added **Pair**, **Plan owner**, **Takeaway repo** and **Fix level** to [GLOSSARY.md](../GLOSSARY.md).

### Affects

- [How groups work in the repo](13-how-groups-work-in-the-repo.md):
  - "`main` never receives group work" becomes "never receives **Day 1** group work".
  - Lab branches `lab/<name>` and the action-plan row PRs go into `main`.
  - The coach-notes reveal commit after the retrospective is unaffected.
- [Live-deck pipeline spike](15-live-deck-pipeline-spike.md):
  - **The library list** (asset §7) is a script over the PRs into `main`, with no model.
  - **The reporter workflow skips PRs into `main`.**
  - `docs/action-plan/` reaches the deck through the same publish path. Row PRs merge between 11:37 and 12:02, and the plan is committed at about 12:10.
- [Starter skill library and AGENTS.md template](16-starter-skill-library-and-agents-md-template.md), and the build:
  - **The CI guard must run on PRs into `main`**: no `CLAUDE.md`, `SKILL.md` only in `.agents/skills/`, and `skills-ref validate`. Slide 59 shows it as an exhibit, but 16's layout doesn't list it.
  - Add `.github/PULL_REQUEST_TEMPLATE/lab.md` and `docs/skill-lab.md`. Check that GitHub still uses the default template when that folder exists.
  - `TESTS.md` is a convention for lab skills only. The Day 1 forks don't get one.
  - `main`'s `docs/agents/` should name `main` as the base, so that `open-pr` also works for lab PRs. Otherwise the handout's `gh pr create --base main` stands.
- [Agenda with timings and owners](17-agenda-with-timings-and-owners.md), in `agenda.md`:
  - 17:00: the cards are handed in.
  - Overnight: a coach sorts the cards.
  - 08:30 on Day 2: everyone clones `main` and runs `pnpm install`.
  - 11:00 break: coaches review and merge the lab PRs.
  - The client version's "Before you arrive" gains the PO line: git, plus Node 22 and pnpm if on Claude Code.
- [Choose the storyline](12-choose-the-storyline.md)'s final outline:
  - 71: write a card and hand it in.
  - 82: the card table and the pairing rules.
  - 83: "Fix it as high as you can", with fix level instead of rung.
  - 87: a lab PR into `main` with the checklist. The agenda's 60 minutes replace the outline's 45.
  - 88: the running order in asset §6.
  - 92: the row drafts are PRs.
  - 95: the room chooses the plan owner.
- [What the reporter sees and what the retrospective says](14-what-the-reporter-sees-and-what-the-retrospective-says.md): the "wrong twice" shortlist (slide 81) is laid out next to the cards.
- [Create the GitHub repo and add the agent key](02-create-the-github-repo-and-add-the-agent-key.md):
  - Participants push `lab/*` branches and open PRs into `main`.
  - If `main` is protected, requiring a PR is fine, and the CI guard can be a required check if the plan allows it.

### Fog

Nothing graduates. *Rehearsal and fallbacks* gains:

- timing the 08:30 clone across eleven laptops
- whether a pair can run the two-tool trigger test in about 15 minutes
- whether row PRs merge into the grid within slide 92's window
- the library list's latency
- `gh pr create --template` with the lab template

The return session is ruled out (Q9). It could get a line in the map's Out of scope.
