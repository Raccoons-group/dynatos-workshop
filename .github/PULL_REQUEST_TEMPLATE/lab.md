<!-- lab-pr -->
<!-- The Day 2 lab PR, into main from lab/<name>. The deck's library list reads "What it catches" and "Fix level", so keep those headings. -->

## What it catches

<one line: the mistake or the procedure, and where it came from (a shortlist item or a card)>

## Fix level

<!-- Tick one. For a mistake, the highest level that works. For a repeated procedure, a skill. -->

- [ ] Architecture: the mistake can't be made at all
- [ ] Types: the compiler rejects it
- [ ] A check (lint or CI): it fails, with an error that names the fix
- [ ] A test: it catches it after the fact
- [ ] An AGENTS.md line: last, because a rule in a doc fails silently
- [ ] Procedure → skill

Why not higher: <one line>

## Proof

<!-- A skill: the trigger results per tool (see TESTS.md) and the with/without run. A check or test: the output failing on the real mistake, then passing on the fix. -->

## Owner

<username>, review by <date>. For a skill, the same line is at the top of its TESTS.md.

## Finished-output checklist

**Every output**

- [ ] A PR into `main` from `lab/<name>`, with the **Proof** section filled in
- [ ] **Fix level** ticked, plus why not higher. Or procedure → skill
- [ ] **Owner** and **review date**, at the top of `TESTS.md` (for a check, in this PR's Owner section)
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

- [ ] It goes into `docs/agents-md-template.md` (a prompt or an example), not into the root `AGENTS.md`
- [ ] This PR says why no higher level works
