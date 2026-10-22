# Reviewing a PR here

Every PR is reviewed on two axes. Keep them separate.

- **Spec:** does it do what the spec and the ticket's acceptance examples say? Is anything missing, or added that nobody asked for?
- **Standards:** does it follow `case/AGENTS.md`, use the glossary's names, and test at the agreed seam?
  Are the tests real? A tautological test, or one coupled to the implementation, counts as a finding.

**AI review.** Run the `code-review` skill. It appends each review round to `review.md` in your working-out folder: one section per round, with the findings under Act on, Consider, Noted and Dismissed (each dismissal with a reason). After round 3, stop: whatever is still open goes to a human.

The live deck counts rounds and findings from `review.md`, so keep this shape:

```markdown
## Round 1

### Act on

- One finding per bullet

### Consider

### Noted

### Dismissed

- The finding, and why it's dismissed
```

**What a human always reads:** schema changes and migrations, anything about money (fees, minimums), deletes, and changes to `.github/`, `.agents/` or `AGENTS.md`.

An agent's approval never counts as a person's.
