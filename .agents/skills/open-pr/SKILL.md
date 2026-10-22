---
name: open-pr
description: "Use when opening, updating, pushing to or marking ready the group's pull request, or when the group says push: links the skills, commits the working-out, pushes the work branch and opens a draft PR against the base branch in docs/agents/workshop.md (never main), then keeps that same PR's body and its Day 1 checklist up to date."
---

_Adapted from mattpocock/skills v1.3.1 (MIT): wraps `pr`, whose summary shapes come from Humanlayer's `show-me` (see [CREDITS.md](CREDITS.md))._

Each group has one PR all day: from its work branch into its own base. Open it as a **draft early**, within 30 minutes of the kickoff, when it holds nothing but a stub `case/AGENTS.md`. Then run this skill on every push: it updates the same PR, never a new one. The live deck reads the PR, so a push without the working-out in it is a push the deck can't see.

## 1. Read the keys

Read `docs/agents/workshop.md`:

- `Base branch:` is where the PR goes, for example `group-a/main`. Always pass it. Never let a tool default to `main`.
- `Work branch:` is the PR's branch, for example `group-a/group-orders`.
- `Working-out:` is the group's folder, for example `work/group-a/`.
- `Epic:` is the issue the PR is part of, for example `#3`.

If `Group:` is `none`, you're not on a group base: see _On `main`_ at the end.

## 2. Link the skills

Run the link script: `node scripts/link-skills.mjs` (the same as `pnpm skills:link`). If it adopted a skill from `.claude/skills/` into `.agents/skills/`, say so: that folder goes into this commit. If it says it left two folders alone, tell the group to merge them by hand before pushing.

## 3. Get onto the work branch

Check `git branch --show-current`.

- **On the base branch:** move to the work branch, taking any uncommitted changes along. `git switch <work branch>` if it exists, locally or on `origin`; otherwise `git switch -c <work branch>`.
- **On the work branch:** carry on.
- **On any other branch:** stop and ask. Don't switch with uncommitted work.

Never commit on the base branch or on `main`.

## 4. Commit

Show `git status`, then stage:

- the working-out folder, whole
- `case/AGENTS.md`, `case/GLOSSARY.md` and `case/docs/adr/`
- any new skill folder in `.agents/skills/`

Other uncommitted changes, such as code and tests, may belong to a slice that isn't finished. List them and ask whether they go in this push. Never stage a `.env` file or anything that looks like a secret, and never `git add -A` blind.

Before you commit:

- **The how-we-worked note.** If it has no section since the last push, offer to run the `how-we-worked` skill first, so the note goes up in this push. The very first push can skip it.
- **The first PR needs a commit.** GitHub won't open a PR with no changes. If the work branch has nothing beyond the base, write a stub `case/AGENTS.md` from `docs/agents-md-template.md`, with the app's name filled in, and tell the group.

The commit message is one line saying what's in it, like "Add the spec and the first three tickets". Never write "Closes", "Fixes" or "Resolves" with an issue number.

## 5. Push

`git push -u origin <work branch>`. If the push is rejected, show the error and stop. Never force-push.

## 6. Open or update the PR

Write the body (step 7) to a temporary file outside the repo, then use the first of these that works.

**With `gh`** (`gh auth status` succeeds):

1. Look for the PR: `gh pr list --head <work branch> --state open --json number,url,isDraft,baseRefName`.
2. **None:** `gh pr create --draft --base <base branch> --head <work branch> --title "<title>" --body-file <file>`. The title says what the group is building, in the glossary's words. Keep it after that.
3. **One:** `gh pr edit <number> --body-file <file>`. If its base isn't the base branch, also pass `--base <base branch>` and tell the group it pointed elsewhere.

Never open a second PR, and never close one.

**With your own GitHub tool**, if `gh` doesn't work and your agent has one that can open and edit PRs: do the same with it, as a draft, with the same base, head, title and body.

**Otherwise, print the compare URL.** The push has already reached GitHub, and an open PR picks up its commits by itself. Take the owner and repo from `git remote get-url origin`, which looks like `git@github.com:<owner>/<repo>.git` or `https://github.com/<owner>/<repo>.git`.

- **No PR yet:** print `https://github.com/<owner>/<repo>/compare/<base branch>...<work branch>?expand=1` and the full body. Tell the group to paste the body over the template, then pick **Create draft pull request** from the arrow on the green button.
- **A PR is open:** print the full body and tell the group to paste it over the PR's description (**Edit** on its first comment). If you don't know the PR's link, it's at `https://github.com/<owner>/<repo>/pulls?q=is:pr+head:<work branch>`.

## 7. Write the body

The first time, start from `.github/pull_request_template.md`. After that, start from the PR's current body (`gh pr view <number> --json body`, or ask the group to paste it), so whatever the group wrote stays.

Skip preambles and keep the prose brief. Use the words in `case/GLOSSARY.md`, if it exists.

- **What and why:** the smallest visual that makes the change clear (see _Visuals_ below), next to a line or two on why. Link the spec and the tickets by path. While the PR holds only a stub, one line is enough: "Opened early; it grows with every push."
- **How it's tested:** a before and an after. A test that failed and now passes, or the test run's output, is good evidence. A screenshot of a visual change is better. List the acceptance examples that are now tests: the tickets tick them. Before there are tests, say "No tests yet."
- **How to revert:** one line. The PR is merged with a merge commit, so that's usually `git revert -m 1 <merge commit>`.
- **Merge danger:** the door and the blast radius. A two-way door can be walked back; a one-way door can't, such as a schema change, a migration, or a delete. The blast radius is one word, then a line on what could break. Name anything `REVIEW.md` says a human always reads.
- **Review:** count the `## Round` headings in `review.md` in the working-out (0 if it doesn't exist). For "Tools used", list each tool named in the how-we-worked note's section headers, plus the tool you're running in.

Replace `work/<group>/` with the working-out folder, and `<epic>` with the `Epic:` number. Delete a guidance comment once its section is filled.

The last line stays "Part of #<epic>". Never write "Closes", "Fixes" or "Resolves": every group shares the epic, and it stays open.

### Visuals

Pick one; at most two. Keep only the calls, files, components and states that make the point.

- **Pseudocode** for logic or a rule.
- **A call tree** for runtime control flow.
- **A component tree** for UI structure, with the state that matters.
- **A shallow file tree** for where things live, or for a broad refactor.
- **Mermaid** for interaction or data flow between parts.
- **A `diff` sketch** when the shape already exists and the point is what changes:

```diff
 on(save)
-  write content
+  if content is unchanged
+    return the cached result
+  write content
```

## 8. Tick the Day 1 boxes

Check each artifact on the work branch as pushed, and tick its box in "Done by the end of Day 1". Untick a box whose artifact has gone.

| Box                | Tick it when                                                                                                                                                                                                                                    |
| ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `case/AGENTS.md`   | it has grown past the stub: at least one heading holds the group's own words, not just the template's comments                                                                                                                                  |
| `case/GLOSSARY.md` | it exists and defines at least one term                                                                                                                                                                                                         |
| Spec               | `spec.md` exists in the working-out                                                                                                                                                                                                             |
| Spec reviewed      | the PR has the `spec-reviewed` label (`gh pr view <number> --json labels`). Without `gh`, only when the group says a coach has added it                                                                                                         |
| Tickets            | the working-out's `issues/` folder holds at least one ticket                                                                                                                                                                                    |
| Slice 1 shipped    | ticket `01` says `Status: done`, and the checks on the PR's latest commit have passed (`gh pr checks <number>`). If they're still running, leave the box and say the next run will tick it. Without `gh`, only when the group has seen CI green |
| How-we-worked note | `how-we-worked.md` in the working-out has at least one section                                                                                                                                                                                  |

The boxes are for people. The deck reads the files, never the boxes.

## 9. Ready, and merging

- **Mark the PR ready only when the group asks.** First run `gh pr checks <number>`; if a check is red or still running, say so and ask before going on. Then run `gh pr ready <number>`. Without `gh`, tell the group to click **Ready for review** at the bottom of the PR.
- **Merge only when the group asks**, once the PR is ready and CI is green: `gh pr merge <number> --merge`. Always a merge commit, never squash or rebase, and keep the branch.

## On `main`

On `main`, `Group:` is `none` and the base is `main`: that's the Day 2 lab, not a group PR.

- Work on a `lab/<name>` branch, never on `main` itself. If you're on `main`, ask for the name.
- Skip the working-out, the Day 1 boxes and the epic line.
- Fill the body from `.github/PULL_REQUEST_TEMPLATE/lab.md` if it exists, otherwise from the default template's review fields. The compare URL gets `&template=lab.md`.
