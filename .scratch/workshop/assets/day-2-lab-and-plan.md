# Day 2: skill lab and action plan

> Sketch for [Day 2: skill lab and action plan follow-up](../issues/19-day-2-skill-lab-and-action-plan-follow-up.md). Matthias agreed it on 22 Oct 2026, over three grilling rounds (Q1–Q23 in the ticket's Answer). It's a plan, not the build: the slides, the handout, the templates and the scripts are built from it.
>
> Slide numbers refer to the [final outline](storyline-final.md), and times to the [agenda](agenda.md).
>
> No spoilers. Examples use placeholders. The coach notes are committed to `main` only after the retrospective, as ticket 13 decided.

## 1. At a glance

| Time | Block | What happens |
| - | - | - |
| 17:00 (Day 1) | Slide 71 | Everyone writes **one card** and hands it to a coach |
| overnight | Coaches | Sort the cards by thread, next to the retrospective's "wrong twice" shortlist |
| 08:30 | Doors | Everyone clones `main` on their own laptop |
| 09:45–10:00 | Lab intro (82–86) | Slide 82 shows the card table and the pairing rules. Pairs form at about 09:58 |
| 10:00–11:00 | Lab | Pairs pick a task (a coach confirms it), build it, prove it in two tools, and open a PR into `main` |
| 11:00–11:15 | Break | Coaches review the lab PRs and merge the ones that clear the bar |
| 11:15–11:30 | Show and tell (88) | Two minutes per pair, then "Where did the two tools disagree?" |
| 11:30–12:15 | Action plan (89–96) | Groups' agents draft their thread row in PRs, and a coach writes the rest on screen. The vote, owners and dates. Committed at about 12:10. The room chooses the plan owner |
| within a week | Raccoons | The takeaway repo is built and transferred, and one follow-up mail goes out. No return session |

## 2. Before the lab

**Slide 71, "Bring one task tomorrow" (Q2).** The card stays off the repo, because it's about your real job. It has four lines:

```text
Task:            <the repetitive thing you do>
How often:       <daily / weekly / every PR / …>
What goes wrong: <where it costs time, or what the agent gets wrong>
My tool:         <Claude Code / Codex / Copilot …>
```

**Overnight (Q21).** Next to the synthesis run, a coach sorts the eleven cards into context, skills and checks, and puts each "wrong twice" item from the shortlist next to the cards it matches. Coaches **sort, never assign**: nobody gets a partner or a task from us.

**Day 2 doors, 08:30 (Q5, Q23).** Everyone, POs included, sets up a clone of `main` on their own laptop:

```sh
git clone <repo-url> dynatos-lab && cd dynatos-lab
pnpm install        # links the skills for Claude Code; Codex and Copilot read .agents/skills/ directly
```

POs need git, plus Node 22 and pnpm if they use Claude Code (a new line in the client mail's "Before you arrive"). The Day 1 clones on `group-<x>/main` stay as they are.

## 3. Lab handout (sketch)

One page, handed out at 09:45 and repeated in the repo as `docs/skill-lab.md`.

### Form a pair (09:58, 5 minutes)

- Two or three people, around the cards on the table.
- **One rule:** at least two different tools in the pair. Your skill has to fire in both.
- **One nudge:** mix your Day 1 groups.

### Pick a task (by 10:10)

Take the first that fits:

1. A "wrong twice" item from the retrospective that matches one of your cards.
2. A **verification** task from a card: a build or test wrapper, a UI check, a migration rule.
3. Any card task you can **prove on Forkful in 60 minutes**.

Before you build, a coach confirms "provable on Forkful in 60 minutes". A card that needs Dynatos systems (Jira, deploys, your own repos) isn't lost: it goes into the action plan's skills or checks row, with you as owner.

### Fix it as high as you can (slide 83)

For a **mistake**, pick the highest fix level that works, and say why not higher:

1. **Architecture**: the mistake can't be made at all.
2. **Types**: the compiler rejects it.
3. **A check** (lint or CI): it fails, with an error that names the fix.
4. **A test**: it catches it after the fact.
5. **An AGENTS.md line**: last, because a rule in a doc fails silently.

For a repeated **procedure**, the answer is a skill. If the procedure has a step that can pass or fail, the skill runs a check.

### Build it

```sh
git switch -c lab/<name>                 # from main
# a skill:  .agents/skills/<name>/SKILL.md and TESTS.md, then: pnpm skills:link
# a check:  the rule in case/ (or .github/ for CI), plus the real mistake recreated in a scratch commit
git push -u origin lab/<name>
# your partner: git fetch && git switch lab/<name>   (then pnpm skills:link if on Claude Code)
```

- Create skills in `.agents/skills/<name>/`, never in a tool's own folder. `name` = folder name: lowercase, digits, single hyphens.
- The real mistakes are in the groups' histories: `git fetch origin group-<x>/main`, then `git log` / `git show <sha>`. Recreate the mistake on your branch, show the check failing, and then drop that commit.

### Suggested timebox

| From | |
| - | - |
| 10:00 | Pair, task, coach confirms |
| 10:10 | Build |
| 10:35 | Prove it: trigger tests in both tools and the with/without run, or the check failing on the mistake |
| 10:50 | Open the PR: `gh pr create --base main --template lab.md`. Without `gh`, use the compare URL |
| 11:00 | Stop. Unfinished is fine: it goes into the plan |

## 4. The finished-output checklist (Q4, Q12, Q20)

This goes into the lab PR template (`.github/PULL_REQUEST_TEMPLATE/lab.md`) as ticks.

**Every output**

- [ ] A PR into `main` from `lab/<name>`, with a **Proof** section
- [ ] **Fix level:** `architecture / types / check / test / AGENTS.md`, plus why not higher. Or `procedure → skill`
- [ ] **Owner** and **review date**, at the top of `TESTS.md` (for a check, in the PR body)
- [ ] CI is green: the case's tests and the CI guard

**A skill, additionally**

- [ ] It's in `.agents/skills/<name>/`, with only the portable frontmatter fields, and `name` matches the folder
- [ ] The description reads as trigger conditions ("Use when …"), with the trigger words first
- [ ] A **Gotchas** section, grown from the real failure
- [ ] `TESTS.md`: 3 prompts that should fire it and 3 that shouldn't, each run in a **fresh session** in **both** partners' tools, with the results ticked
- [ ] One with/without run of the same task, and what changed

**A check or test, additionally**

- [ ] Shown **failing on the real mistake** (output pasted in Proof) and passing on the fix
- [ ] Its error message names the fix

**An AGENTS.md line, additionally**

- [ ] It goes into `docs/agents-md-template.md` (a prompt or an example), not into our root `AGENTS.md`
- [ ] The PR says why no higher level works

### `TESTS.md` (sketch)

```markdown
Owner: <GitHub username>. Review: <date>.

## Should fire
| Prompt | Claude Code | Codex | Copilot |
| - | - | - | - |
| <a real request that needs this skill> | ✅ | ✅ | |
| … (3 rows) | | | |

## Should not fire
| Prompt | Claude Code | Codex | Copilot |
| - | - | - | - |
| <a near miss: similar words, different job> | ✅ | ❌ fired | |
| … (3 rows) | | | |

## With and without
Task: <one task>. Without the skill: <what happened>. With it: <what changed>.
```

The owner lives here, not in `.github/CODEOWNERS`. If five PRs each appended a line to that one file, every merge after the first would conflict. The takeaway repo's CODEOWNERS is built from these lines (section 9).

### Lab PR body (sketch)

```markdown
## What it catches
<one line: the mistake or the procedure, and where it came from (shortlist item or card)>

## Fix level
<architecture / types / check / test / AGENTS.md, and why not higher> or <procedure → skill>

## Proof
<trigger results per tool (see TESTS.md), the with/without run, or the failing-then-passing check output>

## Owner
<username>, review by <date>
```

## 5. Into the library (Q5, Q13)

- **Route:** `lab/<name>` from `main` → a PR into `main`. Ticket 13's rule becomes "`main` never receives **Day 1** group work". Lab branches start from `main`, so their diffs are clean.
- **The bar:** the checklist in section 4 complete, and CI green.
- **Who merges, when:** in the 11:00 break, each coach reviews the PRs of the pairs they coached and merges what clears the bar, so show and tell shows "merged" on the library list.
- **Unfinished PRs** stay open and go into the plan's "Lab PRs to finish". If one is merged before the takeaway repo is built (within a week), it goes into that repo. If not, its owner reopens it there.

## 6. Show and tell, 11:15–11:30 (Q14)

- **The screen:** the live library list. For each pair, a coach opens its PR at the Proof section. **No live runs.**
- **Each pair, 2 minutes:**
  - what it catches
  - the fix level, and why not higher
  - the trigger result in both tools, for example "3/3 in Claude Code, 1/3 in Copilot until we rewrote the description"
- **The order** is the order the PRs were opened.
- **The last 5 minutes:** one question for the room, "Where did the two tools disagree?" It's the cross-tool lesson, said once.

## 7. The library list on the deck (Q15)

The live view on slides 87–89, computed **by a script, without the model**, from the open and merged PRs into `main` that touch `.agents/skills/` or carry the lab template.

| Field | From |
| - | - |
| Name | The folder under `.agents/skills/`, or the PR title for a check |
| Fix level | The PR's "Fix level" line |
| What it catches | The first line of the description, or the PR's "What it catches" |
| Tools passed | The ticked columns in `TESTS.md` (all three "should fire" rows ✅ in that tool) |
| State | Open or merged |

- **No names** on screen, following the reporter's "groups, never people" rule. The owner is in the file.
- The reporter workflow **skips PRs into `main`**, so a lab PR or an action-plan PR never becomes a card on the wall.

## 8. The action plan, 11:30–12:15 (Q6, Q7, Q8, Q17)

### Running order

| Time | Slide | What |
| - | - | - |
| 11:30 | 89–91 | What you take home, expect a dip first, the grid. Groups choose their thread row (a coin decides a clash) |
| 11:37 | 92 | **25 min.** Each Day 1 group drafts its row with its own agent, in `docs/action-plan/<thread>.md`, and opens a PR into `main`. A coach merges each one as it lands, so the grid fills in live. A coach writes the route row on the shared screen with the room |
| 12:02 | 93 | The AI stance: a coach types the room's first answers to the five questions into the plan |
| 12:05 | 94 | The two or three signals to watch for a month, typed the same way |
| 12:07 | 95 | **7 min.** Dot vote on each row's candidates. Each winner gets an owner and a review date, and the rest go to "Parked". The room chooses the **plan owner**. A coach commits the plan at about 12:10 |
| 12:14 | 96 | The loop closes |

**Fallback:** if a group's agent stalls, the coach types that row into the file directly.

### Where it lives

```text
docs/action-plan/
  README.md      # the plan (below), the only file anyone needs to read
  context.md     # drafts, one per thread row, from the groups' PRs
  skills.md
  checks.md
```

It moves unchanged into the takeaway repo. The deck reads it through the same publish path as the library list (ticket 15).

### Row draft: `docs/action-plan/<thread>.md` (sketch)

```markdown
# <Context / Skills / Checks> row, drafted by group <x>

## Quick win candidates (done within 2 weeks)
- <item>: <why, pointing at a shortlist item, a card or a lab PR>
- … (up to 3)

## Longer step candidates (done within 3 months)
- <item>: <why>
- … (up to 3)
```

### The plan: `docs/action-plan/README.md` (template)

```markdown
# Action plan: AI-assisted development at Dynatos

Committed <date>, at the end of the Raccoons workshop.
Plan owner: <name>. First review: <date, about 4 weeks out>.

## 1. The grid
| Row | Quick win (≤ 2 weeks) | Owner | Review | Longer step (≤ 3 months) | Owner | Review |
| - | - | - | - | - | - | - |
| Route: the gates and stations we keep | | | | | | |
| Context | | | | | | |
| Skills | | | | | | |
| Checks | | | | | | |

Drafts: [context](context.md) · [skills](skills.md) · [checks](checks.md)

## 2. Our AI stance (outline)
- What's allowed:
- What's expected:
- Which tools:
- Disclosure:
- A human always approves:

Writing the full stance is a route-row item.

## 3. Signals we watch for a month
| Signal | How we read it (git / GitHub) | Who looks |
| - | - | - |
<!-- two or three, team-level, never volume, no leaderboards -->

## 4. Lab PRs to finish
| PR | Owner | Done when |
| - | - | - |

## 5. Parked
- <item>: lost the vote in <row>

## 6. Open questions
- Who uses Visual Studio or Rider with Copilot Chat, and what we do about it
- Port `read-issue` to our Jira (or it's already in the skills row)

## 7. Reviews
First review: <date>, convened by the plan owner, 45 minutes: what moved, what the signals say, what we drop.
```

The order is the point. Anyone who opens the file in three weeks can see what's late.

## 9. After the workshop (Q9, Q10, Q16, Q18, Q19)

**No return session** (Q9). The follow-up is finite and in writing.

**The takeaway repo**, built by a coach and transferred to Dynatos's GitHub org within a week:

| In it | From |
| - | - |
| `.agents/skills/`: the forked Day 1 library and every merged lab skill | `main` |
| `scripts/link-skills.mjs`, with its `postinstall` | `main` |
| `AGENTS.md` (rewritten for an empty repo), `docs/agents-md-template.md`, `REVIEW.md`, the PR template | `main` |
| `.claude/skills/reporter/` | `main` |
| `docs/action-plan/` | `main` |
| `recipes/<name>.md`: each merged check that only exists on Forkful, with the PR's description and diff, ready to port | the lab PRs |
| `.github/CODEOWNERS`, with one line per lab skill | the `Owner:` lines in `TESTS.md` |

Not in it: the case, the deck, `.scratch/`, the coach notes and the group branches. **The workshop repo** stays with Raccoons, read-only for participants for 3 months, then archived.

**The follow-up mail**, within a week, from the Raccoons contact (whoever led the retrospective) to the plan owner and all participants:

- the takeaway repo (transferred)
- the deck as a PDF, including the retrospective
- the action plan
- an offer to answer questions by mail until the plan's first review date

**The first review is the team's own.** The plan owner convenes it at about 4 weeks, which matches slide 94's "watch for a month".

**Jira** (Q19). We don't ask Dynatos for a sandbox project. The Jira port of `read-issue` goes straight into the skills row, with whoever wrote the card as its owner.

## 10. Defaults set without a separate question

These are mine, to react to:

- **Pairs form at 09:58.** The intro slides take 13 of the intro's 15 minutes, so forming pairs runs across the 10:00 boundary, and the lab's first 10 minutes cover pairing, picking the task and the coach's confirmation.
- **The lab timebox** in section 3.
- **Templates:** the lab PR template (`lab.md`, via `gh pr create --template`) and `docs/skill-lab.md` as the handout's repo copy.
- **Show and tell order:** the order the PRs were opened.
- **Grid:** groups choose their own thread row, with a coin for a clash. Row drafts hold up to 3 candidates per cell, and slide 95's vote picks among them.
- **Plan horizons:** a quick win is done within 2 weeks and a longer step within 3 months. The first review is a 45-minute meeting.
