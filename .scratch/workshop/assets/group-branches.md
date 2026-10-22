# Group branches: how three groups share one repo

> Plan for [How groups work in the repo](../issues/13-how-groups-work-in-the-repo.md). Agreed with Matthias on 21–22 Oct 2026. Nothing here exists yet: no branches, workflows or templates have been made.

## At a glance

```
main                        coaches only: deck, map, everything. Never receives group work.
 └─ case-start (tag)        main minus .scratch/workshop/ and apps/deck, with a root README about the case
     ├─ group-a/main  ◄──── one PR all day from group-a/group-orders
     ├─ group-b/main  ◄──── one PR all day from group-b/group-orders
     └─ group-c/main  ◄──── one PR all day from group-c/group-orders
```

- Each group has its **own base** (`group-<x>/main`) and **one long-lived PR** into it. The bases never meet, so no group's work can cause a conflict for another, and the `pull_request` workflow keeps running.
- A base differs from `case-start` only in `docs/agents/`, which names its group, base, work branch and working-out folder.
- Every base carries the reporter skill and the workflows, because the action loads `.claude/` from the **tip of the PR's base branch**.
- Forks were ruled out because fork PRs get no secrets. A case folder per group was ruled out because the groups would share the root lockfile, the workspace config, AGENTS.md and `.agents/skills/`, so the first merge would cause conflicts for the others. Their agents could also read the other groups' work.

## Coach notes are never committed

The only coach notes in the repo today are the "Coach only" sections of [the case brief](case-brief.md) and the "What's planted" bullet in [Case brief ticket 08](../issues/08-case-brief-a-neutral-brownfield-app-with-a-foggy-epic.md)'s answer. `main` is visible on GitHub, the opener invites people to browse the map, and git history keeps whatever is pushed. So, **before the first push** (ticket 02):

1. Move both into `.scratch/workshop/coach/coach-notes.md` and gitignore `.scratch/workshop/coach/`. Leave a one-line pointer in the brief and in ticket 08.
2. Check: `git grep` over everything except `case/` finds none of the planted names or rules.
3. Share the file with Sander outside git. Sessions in this folder can read it. A session in a fresh worktree can't.
4. After the Day 2 retrospective, commit the coach notes to `main` as the reveal and drop the gitignore line.

## The cut (before Day 1, once the reporter is final)

Script it, for example `scripts/cut-group-bases.sh`, so the dry run and the real cut are identical.

1. From an up-to-date `main`: remove `.scratch/workshop/`, which by then holds the workshop glossary (ticket 16), and `apps/deck`. Replace the root README with one about the case, then refresh the lockfile so `pnpm install --frozen-lockfile` passes without the deck. Commit and tag the result `case-start`.
2. For each of `a`, `b` and `c`: branch `group-<x>/main` from `case-start`, write that group's `docs/agents/` values (table below), commit, push.
3. Check each base: `pnpm install --frozen-lockfile && pnpm test` is green, the reporter skill and workflows are there, the PR template is there, and `git grep` finds no coach notes.
4. Protect `group-*/main` **if the plan allows it**: no direct pushes (PR required), no force-pushes, no deletion, no required reviews, and coaches on the bypass list. A private org repo on GitHub Free has neither branch protection nor rulesets, so there it's a kickoff rule plus the 30-minute check.
5. Repo settings: allow **merge commits only**, so each base keeps the group's commits for the retrospective, and **don't auto-delete head branches**.
6. Create the `spec-reviewed` label (ticket 14).

**What `docs/agents/` says on each base**

| Key         | Group A                    | Group B                    | Group C                    |
| ----------- | -------------------------- | -------------------------- | -------------------------- |
| Group       | `group-a`                  | `group-b`                  | `group-c`                  |
| Base branch | `group-a/main`             | `group-b/main`             | `group-c/main`             |
| Work branch | `group-a/group-orders`     | `group-b/group-orders`     | `group-c/group-orders`     |
| Working-out | `work/group-a/`            | `work/group-b/`            | `work/group-c/`            |
| Epic        | `#<n>`, written "Part of #<n>", never "Closes" | same | same |

`open-pr` reads the base and the work branch from here, and the tracker (`docs/agents/issue-tracker.md`) points at the working-out folder.

## Day 1 in git terms

| When | Who | What |
| ---- | --- | ---- |
| Setup round | Each group, at its one computer | `git clone -b group-<x>/main <url>`, `pnpm install`, `gh auth status`. The person signed in must have write access. |
| Within 30 minutes of the kickoff | The group, with `open-pr` | Create `group-<x>/group-orders`, commit a stub `case/AGENTS.md`, push, and open a **draft** PR into `group-<x>/main`. A coach checks that three cards are on the deck. |
| All afternoon | The group | Push at least at every phase change, with the working-out updated in the same push. |
| Spec review checkpoint | A coach | Reviews the spec in the PR and adds the `spec-reviewed` label. |
| After the review block, with CI green | The group | Marks the PR ready and merges it into `group-<x>/main` with a merge commit. A closed PR triggers no run, so the last card stays up. |
| Overnight | A coach | Runs the retrospective locally from `main`. It reads each `group-*/main` history (`case-start..group-<x>/main`), the PR timelines, `live-deck-data` and the coach notes. |

## The working-out folder

`work/group-<x>/` on the group's branch, with the layout from ticket 16:

- `spec.md`
- `issues/NN-<slug>.md`, one file per ticket, each with a `Status:` line
- `review.md`, one section per review round
- `how-we-worked.md`
- the test-first or test-after choice, wherever `implement` records it
- any prototype or research notes (no throwaway branches: one checkout)

These stay outside it: `case/AGENTS.md` and `case/GLOSSARY.md`, and skills the group writes, which go in `.agents/skills/<name>/`.

## What ticket 13 adds to the PR template

The template lives on `main`, where GitHub reads it, and the cut carries it onto the bases. It goes below ticket 16's review fields:

```markdown
## Done by the end of Day 1

- [ ] `case/AGENTS.md`
- [ ] `case/GLOSSARY.md`
- [ ] Spec in `work/<group>/spec.md`
- [ ] Spec reviewed (a coach adds `spec-reviewed`)
- [ ] Tickets in `work/<group>/issues/`
- [ ] Slice 1 shipped, with its tests green in CI
- [ ] How-we-worked note

Part of #<epic>
```

`open-pr` ticks the boxes as the artifacts appear. The reporter trusts the files, never the boxes.

## Day 1 hotfixes

The reporter is frozen at the cut. If it needs a fix:

1. Make one commit on `main` that touches only coach-owned paths (`.claude/skills/reporter/`, `.github/`, `scripts/`).
2. A coach script cherry-picks it onto each `group-*/main`. Coaches are on the protection bypass list. Groups don't touch these paths, so it can't conflict.
3. The fix applies from each group's next push. The skill comes from the base tip, and the workflow comes from the PR's merge ref.

## After the workshop

- **The group bases never merge into `main`.** They've deleted the deck and `.scratch/workshop/`, so a merge would delete those from `main` too. A group's skill or AGENTS.md that becomes a takeaway reaches `main` through a coach's own PR.
- The coach notes are committed to `main` after the retrospective (above).

## Failure modes

| What goes wrong | What happens | Guard |
| --------------- | ------------ | ----- |
| The agent commits on `group-<x>/main` and pushes | No PR, so the reporter stays silent | Protection rejects the push. Without it, the 30-minute coach check catches it |
| The PR targets `main` (the `gh pr create` default) | The diff includes deleting the deck and `.scratch/workshop/` | `open-pr` passes `--base` from `docs/agents/`. Cheap extra (spike): the workflow fails with "retarget to `group-<x>/main`" when the base doesn't match the head's group |
| The group clones `main` by mistake | Deck code and the map are noise to the agent, but there are no coach notes | The clone command in the setup round |
| A group edits a coach-owned path | CODEOWNERS requests a coach review, which is advisory and blocks nothing | — |
| Someone without write access pushes | The reporter refuses to run | Write access for all eleven (ticket 02) |
