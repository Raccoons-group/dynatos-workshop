# Skill lab

Day 2, 10:00–11:00. In pairs, turn one task from your cards into a skill or a check that works in both partners' tools, prove it on Forkful, and open a PR into `main`. The coaches merge what clears the bar in the 11:00 break, and it joins the library you take home.

## Before you start (08:30)

Clone `main` on your own laptop, whatever your role:

```sh
git clone <repo-url> dynatos-lab && cd dynatos-lab
pnpm install        # links the skills for Claude Code; Codex and Copilot read .agents/skills/ directly
```

## Form a pair (09:58, 5 minutes)

- Two or three people, around the cards on the table.
- **One rule:** at least two different tools in the pair. Your skill has to fire in both.
- **One nudge:** mix your Day 1 groups.

## Pick a task (by 10:10)

Take the first that fits:

1. A "wrong twice" item from the retrospective that matches one of your cards.
2. A **verification** task from a card: a build or test wrapper, a UI check, a migration rule.
3. Any card task you can **prove on Forkful in 60 minutes**.

Before you build, a coach confirms it's provable on Forkful in 60 minutes. A card that needs your own systems (Jira, deploys, your repos) isn't lost: it goes into the action plan's skills or checks row, with you as its owner.

## Fix it as high as you can

For a **mistake**, pick the highest fix level that works, and say why not higher:

1. **Architecture:** the mistake can't be made at all.
2. **Types:** the compiler rejects it.
3. **A check** (lint or CI): it fails, with an error that names the fix.
4. **A test:** it catches it after the fact.
5. **An AGENTS.md line:** last, because a rule in a doc fails silently.

For a repeated **procedure**, the answer is a skill. If the procedure has a step that can pass or fail, the skill runs a check.

## Build it

```sh
git switch -c lab/<name>                 # from main
# a skill:  .agents/skills/<name>/SKILL.md, plus TESTS.md from docs/tests-md-template.md, then: pnpm skills:link
# a check:  the rule in case/ (or .github/ for CI), plus the real mistake recreated in a scratch commit
git push -u origin lab/<name>
# your partner: git fetch && git switch lab/<name>   (then pnpm skills:link if on Claude Code)
```

- Create skills in `.agents/skills/<name>/`, never in a tool's own folder. `name` is the folder name: lowercase letters and digits, joined by single hyphens. Write the description as when to use it ("Use when …"), trigger words first.
- The real mistakes are in the groups' histories: `git fetch origin group-<x>/main`, then `git log` and `git show <sha>`. Recreate the mistake on your branch, show the check failing, and then drop that commit.

## Prove it

- **A skill:** fill in `TESTS.md`. Run 3 prompts that should fire it and 3 that shouldn't, each in a **fresh session**, in **both** partners' tools, and tick the results. Then run one task with and without the skill, and write down what changed.
- **A check or a test:** paste its output failing on the real mistake, then passing on the fix.

## Suggested timebox

| From  |                                                                                                     |
| ----- | --------------------------------------------------------------------------------------------------- |
| 10:00 | Pair, task, coach confirms                                                                          |
| 10:10 | Build                                                                                               |
| 10:35 | Prove it: trigger tests in both tools and the with/without run, or the check failing on the mistake |
| 10:50 | Open the PR                                                                                         |
| 11:00 | Stop. Unfinished is fine: it goes into the plan                                                     |

## Open the PR (10:50)

Ask your agent to open it with the open-pr skill, or open it yourself:

```sh
gh pr create --base main --template lab.md --title "<a short name for it>"
```

Without `gh`, open `https://github.com/<owner>/<repo>/compare/main...lab/<name>?quick_pull=1&template=lab.md`. The lab template holds the finished-output checklist: tick it as you go. Keep its "What it catches" and "Fix level" headings, because the deck's library list reads them. The list names a skill by its folder, and anything else by the PR's title.

**The bar for the merge:** the checklist complete, and CI green (the case's tests and the CI guard). A PR that isn't finished by 11:00 stays open and goes into the plan's "Lab PRs to finish".

## Show and tell (11:15)

The screen shows the library list. Your coach opens your PR at its Proof section, and you have 2 minutes:

- what it catches
- the fix level, and why not higher
- the trigger result in both tools, for example "3/3 in Claude Code, 1/3 in Copilot until we rewrote the description"
