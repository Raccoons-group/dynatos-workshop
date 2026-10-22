---
name: code-review
description: "Review the changes since a fixed point (commit, branch, tag, or merge-base) along two axes: Standards (does the code follow this repo's documented coding standards?) and Spec (does the code match what the originating issue/spec asked for?). Reviews both axes separately, in parallel sub-agents where the tool can, and appends them as one round to review.md under Act on, Consider, Noted and Dismissed, stopping after round 3. Use when the user wants to review a branch, a PR, work-in-progress changes, or asks to 'review since X'."
---

_Adapted from mattpocock/skills v1.3.1 (MIT)._

Two-axis review of the diff between `HEAD` and a fixed point the user supplies:

- **Standards**: does the code conform to this repo's documented coding standards?
- **Spec**: does the code faithfully implement the originating issue / spec?

The two axes are reviewed separately so they don't pollute each other's context: as **parallel sub-agents** if your agent can run them, otherwise inline, one after the other. This skill then sorts their findings into one **round** in `review.md`. A change gets at most three rounds.

The issue tracker should have been provided to you. If `docs/agents/issue-tracker.md` is missing, tell the user to run the `setup-matt-pocock-skills` skill.

## Process

### 1. Count the rounds

`review.md` lives in the working-out folder (`docs/agents/issue-tracker.md` says where; if there is none, next to the spec). Count its `## Round` sections.

If there are already three, don't review. Tell the user the AI review stops after round 3, and whatever is still open goes to a human reviewer (see `REVIEW.md`, if it exists). Otherwise this review is the next round.

### 2. Pin the fixed point

Whatever the user said is the fixed point (a commit SHA, branch name, tag, `main`, `HEAD~5`, etc.). If they didn't specify one, suggest the base branch named in `docs/agents/workshop.md` (if it exists) and ask.

Capture the diff command once: `git diff <fixed-point>...HEAD` (three-dot, so the comparison is against the merge-base). Also note the list of commits via `git log <fixed-point>..HEAD --oneline`.

Before going further, confirm the fixed point resolves (`git rev-parse <fixed-point>`) and the diff is non-empty. A bad ref or empty diff should fail here, not inside two reviews.

### 3. Identify the spec source

Look for the originating spec, in this order:

1. Issue references in the commit messages (`#123`, `Closes #45`, GitLab `!67`, etc.), fetched via the workflow in `docs/agents/issue-tracker.md`.
2. A path the user passed as an argument.
3. The spec and tickets in the working-out folder, or a spec file under `docs/`, `specs/`, or `.scratch/` matching the branch name or feature.
4. If nothing is found, ask the user where the spec is. If they say there isn't one, the **Spec** review will skip and report "no spec available".

### 4. Identify the standards sources

Anything in the repo that documents how code should be written or reviewed: `REVIEW.md`, every `AGENTS.md` between the repo root and the changed files, the glossary (`GLOSSARY.md`, where `docs/agents/domain.md` says), `CODING_STANDARDS.md` or `CONTRIBUTING.md`.

On top of whatever the repo documents, the Standards axis always carries the **smell baseline** below: a fixed set of Fowler code smells (_Refactoring_, ch.3) that applies even when a repo documents nothing. Two rules bind it:

- **The repo overrides.** A documented repo standard always wins; where it endorses something the baseline would flag, suppress the smell.
- **Always a judgement call.** Each smell is a labelled heuristic ("possible Feature Envy"), never a hard violation. Like any standard here, skip anything tooling already enforces.

Each smell reads _what it is_ → _how to fix_; match it against the diff:

- **Mysterious Name**: a function, variable, or type whose name doesn't reveal what it does or holds. → rename it; if no honest name comes, the design's murky.
- **Duplicated Code**: the same logic shape appears in more than one hunk or file in the change. → extract the shared shape, call it from both.
- **Feature Envy**: a method that reaches into another object's data more than its own. → move the method onto the data it envies.
- **Data Clumps**: the same few fields or params keep travelling together (a type wanting to be born). → bundle them into one type, pass that.
- **Primitive Obsession**: a primitive or string standing in for a domain concept that deserves its own type. → give the concept its own small type.
- **Repeated Switches**: the same `switch`/`if`-cascade on the same type recurs across the change. → replace with polymorphism, or one map both sites share.
- **Shotgun Surgery**: one logical change forces scattered edits across many files in the diff. → gather what changes together into one module.
- **Divergent Change**: one file or module is edited for several unrelated reasons. → split so each module changes for one reason.
- **Speculative Generality**: abstraction, parameters, or hooks added for needs the spec doesn't have. → delete it; inline back until a real need shows.
- **Message Chains**: long `a.b().c().d()` navigation the caller shouldn't depend on. → hide the walk behind one method on the first object.
- **Middle Man**: a class or function that mostly just delegates onward. → cut it, call the real target direct.
- **Refused Bequest**: a subclass or implementer that ignores or overrides most of what it inherits. → drop the inheritance, use composition.

### 5. Run both reviews

If your agent can run sub-agents, spawn one per axis, in parallel, with the prompts below. Otherwise work through both briefs inline, one after the other: finish the Standards review and write down its findings before you read the spec, so the spec doesn't colour it.

**Standards review prompt** should include:

- The full diff command and commit list.
- The list of standards-source files you found in step 4, **plus the smell baseline from step 4** pasted in full (a sub-agent has no other access to it).
- The brief: "Report, per file/hunk where relevant, (a) every place the diff violates a documented standard: cite the standard (file + the rule); and (b) any baseline smell you spot: name it and quote the hunk. Distinguish hard violations from judgement calls: documented-standard breaches can be hard, but baseline smells are always judgement calls, and a documented repo standard overrides the baseline. Skip anything tooling enforces. Under 400 words."

**Spec review prompt** should include:

- The diff command and commit list.
- The path or fetched contents of the spec.
- The brief: "Report: (a) requirements the spec asked for that are missing or partial; (b) behaviour in the diff that wasn't asked for (scope creep); (c) requirements that look implemented but where the implementation looks wrong. Quote the spec line for each finding. Under 400 words."

If the spec is missing, skip the Spec review and note this in the round.

### 6. Write the round

Check each finding against the code, then sort it into one of four buckets:

- **Act on**: a breach of a documented standard, a requirement that's missing, partial or wrong, or a test that can't fail. Fix it before merging.
- **Consider**: a judgement call worth weighing, such as a baseline smell. The user decides.
- **Noted**: true, but not for this change: out of scope, or a follow-up. No action now.
- **Dismissed**: a finding you checked and rejected, always with the reason (a repo standard overrides the baseline, or the code turns out to be right).

Keep the axes visible: label each finding **Standards** or **Spec**, and don't merge or rerank findings across axes (see _Why two axes_).

Append the round to `review.md`, creating the file if it doesn't exist. Never rewrite an earlier round. Other tools count rounds and findings from this file, so keep exactly this shape:

- One `## Round <n>` heading per round, and nothing else on that heading line. The date, your tool and model, and the fixed point go on a plain line under it.
- The four buckets as `### Act on`, `### Consider`, `### Noted` and `### Dismissed`, in that order, all four every round. Leave an empty bucket empty, with only its heading.
- One top-level `- ` bullet per finding. Detail goes on the same line or in sub-bullets, which aren't counted as findings. A dismissal carries its reason in its own bullet.

```markdown
## Round <n>

Reviewed <date> with <tool and model>, since <fixed point>.

### Act on

- **Spec:** <finding> (spec: "<quoted line>")
- **Standards:** <finding> (<file>: <the rule, or "possible <smell>">)

### Consider

- **Standards:** <finding> (<file>: possible <smell>)

### Noted

### Dismissed

- **Standards:** <finding>. Dismissed: <reason>.
```

Show the user the round, and end with a one-line summary: total findings per axis, and the worst issue _within each axis_ (if any). Don't pick a single winner across axes: that's the reranking the separation exists to prevent. After round 3, say that it was the last AI round and whatever is still open goes to a human.

The review lives in `review.md` only. Don't post review comments or a review on the pull request.

## Why two axes

A change can pass one axis and fail the other:

- Code that follows every standard but implements the wrong thing → **Standards pass, Spec fail.**
- Code that does exactly what the issue asked but breaks the project's conventions → **Spec pass, Standards fail.**

Reporting them separately stops one axis from masking the other.
