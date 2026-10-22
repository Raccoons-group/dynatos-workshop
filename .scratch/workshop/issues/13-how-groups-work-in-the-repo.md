# How groups work in the repo

Type: grilling (HITL)
Status: resolved
Blocked by: 07, 08

## Question

How do three groups work on the same case in this one repo without getting in each other's way, while still triggering the reporter skill on every PR? The options are a base branch per group, a case folder per group, or forks.

Also decide where each group's working-out lives, and what a group PR has to contain.

## Context from research

[Coding agents in GitHub Actions](07-coding-agents-in-github-actions.md):

- A `pull_request` workflow doesn't run at all while the PR has a merge conflict, so the setup must avoid merges into a shared base on Day 1.
- The reporter skill loads from the PR's **base** branch, so group base branches must already contain it.
- Fork PRs get no secrets on `pull_request`.

[Pocock and Lauren Tan workflows](04-pocock-and-lauren-tan-workflows.md): parallel agent sessions in one shared checkout break git state, so every participant needs their own clone or worktree.

## Answer

Full plan, with the branch diagram, the cut steps, the `docs/agents/` values, Day 1 in git terms, the PR template addition and the failure modes: [assets/group-branches.md](../assets/group-branches.md). Grilled with Matthias in two rounds (Q1–Q10), 21–22 Oct 2026.

- **Each group gets its own base branch and one long-lived PR into it** (Q1).
  - Coaches cut `group-a/main`, `group-b/main` and `group-c/main` from one stripped starting point, tagged `case-start`.
  - The bases never meet, so no group's work can cause a merge conflict for another, and the reporter keeps running.
  - Each base differs from `case-start` only in `docs/agents/`, which names its group, base, work branch and working-out folder.
  - Forks are out: fork PRs get no secrets. A case folder per group is out: the groups would share the root lockfile, workspace config, AGENTS.md and `.agents/skills/`, so the first merge would cause conflicts for the others, and their agents could read each other's work.
- **Coach notes are never committed** (Q2).
  - Before the first push, the case brief's "Coach only" sections and ticket 08's "What's planted" bullet move to a gitignored `.scratch/workshop/coach/coach-notes.md`, leaving a one-line pointer in each.
  - Sander gets a copy outside git.
  - They're committed to `main` after the Day 2 retrospective, as the reveal.
  - The reason: `main` is on GitHub, the opener invites people to browse the map, and history keeps whatever is pushed.
- **The cut removes `.scratch/workshop/` and `apps/deck`** and puts a root README about the case in their place (Q3). `.scratch/workshop/` includes the workshop glossary once ticket 16 moves it. The deck is noise to the agent and will hold coach material.
- **The working-out lives in `work/group-<x>/`** (Q4), with ticket 16's layout: `spec.md`, `issues/` (one file per ticket), `review.md`, `how-we-worked.md`, the test-first or test-after choice, and any prototype or research notes. `case/AGENTS.md`, `case/GLOSSARY.md` and group-written skills (`.agents/skills/<name>/`) stay outside it.
- **The group opens its draft PR within 30 minutes of the kickoff** with `open-pr`, holding a stub `case/AGENTS.md` (Q5). A coach checks that three cards are on the deck.
- **Branch names** (Q6):
  - The base is `group-<x>/main`, and the work branch is `group-<x>/group-orders`.
  - Git won't allow a branch `group-a` next to `group-a/…`, so the base needs the `/main` suffix.
  - Coaches create only the bases. `open-pr` creates the work branch from `docs/agents/`.
- **The group merges its own PR at the end of Day 1,** after the review block and with CI green, using a merge commit (Q7).
  - No code-owner approval is required. CODEOWNERS only requests coaches as reviewers.
  - A closed PR triggers no run, so the last card stays up.
- **Protect `group-*/main` if the plan allows it** (Q8): no direct pushes, no force-pushes, no deletion, coaches on the bypass list, and no required reviews. A private org repo on GitHub Free has neither branch protection nor rulesets, so there it's a kickoff rule plus the 30-minute check.
- **The PR template gains a "Done by the end of Day 1" checklist and "Part of #<epic>"** below ticket 16's review fields (Q9). `open-pr` ticks the boxes, and the reporter reads the files, not the boxes. GitHub only reads PR templates from the default branch, so the template lives on `main` and the cut carries it onto the bases.
- **Consequences, agreed** (Q10):
  - The bases never merge into `main`. A merge would delete the deck and `.scratch/workshop/` there, so takeaways reach `main` through a coach PR.
  - The reporter is frozen at the cut. A hotfix is one commit to coach-owned paths, cherry-picked onto all three bases by a script, and it applies from each group's next push.
  - Groups clone with `git clone -b group-<x>/main`.
  - All eleven participants need write access.
- **Defaults I picked, not asked:**
  - Allow merge commits only and don't auto-delete head branches, so each base keeps the group's commits for the retrospective.
  - Tag the stripped starting point `case-start`, so the retrospective can read `case-start..group-<x>/main`.
- **Glossary:** added **Coach notes** to [GLOSSARY.md](../GLOSSARY.md).

**Affects**

- [Create the GitHub repo and add the agent key](02-create-the-github-repo-and-add-the-agent-key.md):
  - **Before the first push**, move the coach notes into the gitignored file and check that `git grep` (outside `case/`) finds none of them.
  - The visibility and plan decide whether the group bases can be protected. On a private repo that needs Team or Pro.
  - All eleven participants need write access.
  - Settings: merge commits only, no auto-deleting head branches, and the `spec-reviewed` label.
- [What the reporter sees and what the retrospective says](14-what-the-reporter-sees-and-what-the-retrospective-says.md):
  - Confirmed: one PR per group, `group-<x>/…` branches, the working-out in `work/group-<x>/`, and an early draft PR.
  - New: the base is `group-<x>/main`, so the group can also be read from the base ref. The PR is merged at the end of Day 1, which ends the runs.
  - **The reporter skill and its schema sit on the group bases, where the groups' agents can read them, so they must not name the planted names or rules.** Anything that needs the coach notes belongs in the retrospective, which runs locally from `main`.
  - The retrospective reads `case-start..group-<x>/main`.
- [Live-deck pipeline spike](15-live-deck-pipeline-spike.md):
  - Spike on a cut base: a PR from `group-x/…` into `group-x/main`, the reporter loading from the base tip, and the hotfix cherry-pick script.
  - Check that `pnpm install --frozen-lockfile` passes without `apps/deck`.
  - Optional guard: fail with "retarget to `group-<x>/main`" when a PR's base doesn't match its head's group.
- [Starter skill library and AGENTS.md template](16-starter-skill-library-and-agents-md-template.md):
  - **`open-pr` opens the draft PR within 30 minutes of the kickoff, before slice 1**, which amends 16's Q13. It always passes `--base` from `docs/agents/`, and it ticks the Day 1 checklist.
  - `docs/agents/` on each base holds the values in the asset's table.
  - The PR template gains the checklist.
  - CODEOWNERS stays advisory.
  - Group skills reach `main` only through a coach PR.
- [Agenda with timings and owners](17-agenda-with-timings-and-owners.md):
  - The setup round includes the clone command and `gh auth status`.
  - The coach check comes 30 minutes after the kickoff.
  - The merge comes after the review block and before the stand-up.
- [Case brief](08-case-brief-a-neutral-brownfield-app-with-a-foggy-epic.md): its spoiler note ("stripped from the branches groups work on") is superseded. The coach notes are never committed, and that move is a step in ticket 02.

**Feeds the fog (nothing graduates)**

- *Rehearsal and fallbacks*: the dry run runs the cut script for real and checks:
  - CI is green on each base
  - protection rejects a direct push
  - `open-pr` opens an early draft against the right base
  - a hotfix cherry-pick reaches an open PR
- *Setup round as the first live-deck feed*: each group's draft PR now lights up the deck within 30 minutes of the kickoff, which may be enough of a first visible act.
