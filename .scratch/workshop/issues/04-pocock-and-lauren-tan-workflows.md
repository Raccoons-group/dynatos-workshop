# Pocock and Lauren Tan workflows

Type: research (AFK)
Status: resolved
Blocked by: none

## Question

Which workflows, skills and teaching formats do Matt Pocock and Lauren Tan publicly advocate for AI-assisted development? For Pocock that includes mattpocock/skills, AI Hero, wayfinder, grilling, to-spec, to-tickets and tdd. What do they teach, and in what order? Which of their ideas are strong enough to demonstrate live in a hands-on workshop?

Cite primary sources: their own repos, posts and talks.

## Answer

Full note with dated sources: [research/pocock-and-tan.md](../research/pocock-and-tan.md)

- **Pocock's flow (skills v1.3, 4 Oct 2026):** `/grill-with-docs` (or `/grill-me` outside a repo) → `/to-spec` → `/to-tickets` → `/implement` per ticket. `/implement` drives `/tdd` at the test seams agreed in the spec, then `/code-review`. Then `/pr` and `/retro`. `/wayfinder` is a separate, heavier on-ramp for foggy, multi-session work and stops at decisions. `to-prd` became `to-spec` and `to-issues` became `to-tickets` in v1.1.
- **Lauren Tan ("poteto")**, React Compiler core team, formerly at Meta, built `pstack` while at Cursor. Her thesis is depth before parallelism: get one agent you trust through verification, then fan out.
- **Where they disagree is planning.** Pocock settles everything up front and the human decides. Tan has no planning skill: code is the spec, prototypes answer the questions, and reversible work doesn't wait for the human. That makes a good contrast for the talk.
- **Where they agree:** agents are new hires with no memory, work in vertical slices, test behaviour not implementation, design it twice, turn repeated mistakes into checks, keep AGENTS.md small.
- **Strong live material:** grilling in rounds with a recommended answer; the "could you demo this ticket?" test; red-green at an agreed seam in .NET; prototype variants behind one switch; cross-tool PR review (the mixed tools in the room give model diversity for free); PR bodies that carry evidence; Day 2 lab: turn a `/retro` mistake into a check (Tan's ladder: architecture → types → lint/CI → tests → docs last).
- **Teaching format:** each of Pocock's skill docs ends with an "It's working if" checklist, which works as a ready-made coach checkpoint.
- **Design consequences:**
  - Groups use `/grill-with-docs`, not wayfinder. Wayfinder is demoed on our own map only.
  - One clone or worktree per participant.
  - `/implement` stops at a commit, so groups need an explicit branch-and-PR step.
  - v1.3 renamed `CONTEXT.md` to `GLOSSARY.md`.
  - Port Tan's principles, not `pstack`, which is Cursor-first.
- **Unverified:** what was said in the Pocock × Tan livestream (2 Oct 2026); Tan's self-reported PR counts.
