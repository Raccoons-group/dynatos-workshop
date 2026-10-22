# Case brief: a neutral brownfield app with a foggy epic

Type: prototype (HITL)
Status: resolved
Blocked by: none

## Question

What is the case? Draft a rough brief to react to:

- A neutral, simple domain.
- The existing .NET API + React app the groups start from: its size, what already works, and which tests already exist.
- The foggy epic, written as the text of a GitHub issue.
- What is deliberately missing, so groups have to create docs and agent context (AGENTS.md, CONTEXT.md) and build test automation.
- What "done" looks like for a group by the end of Day 1.

Keep it small enough that three or four people can get from issue to spec to tickets to a PR in one afternoon.

## Prototype

Draft brief to react to: [assets/case-brief.md](../assets/case-brief.md).

## Answer

Full brief: [assets/case-brief.md](../assets/case-brief.md)

- **Forkful, a small food delivery app for one city.** Customers browse restaurants, fill a basket, place an order and follow its status. Restaurants accept orders and move them along in a kitchen view. An "Acting as" switcher stands in for a login, and there are no payments.
- **The epic is group orders for the office lunch**, written as a GitHub issue from the product team: how colleagues join, a deadline, who can edit what, and how the minimum order and the delivery fee work for a group. Several restaurants in one order and splitting the bill are the scope traps.
- **The starting app is about 2,000 lines:** .NET 10 controllers with EF Core on SQLite, React 19 with Vite, and one command to run it. There are three happy-path API tests (xUnit with `WebApplicationFactory`) and one Vitest smoke test. Nothing covers the business rules, and there's no end-to-end setup.
- **What's deliberately missing:** there's no `case/AGENTS.md`, glossary or ADRs, and the README only has commands. What's planted is in the coach notes (`.scratch/workshop/coach/coach-notes.md`). There's no planted bug.
- **Done by the end of Day 1:** a group-written `case/AGENTS.md` and glossary, a spec that passed review, vertical-slice tickets, at least slice 1 (start a group order, join with a code, see the combined basket) with tests green in CI, and the working-out. Nobody finishes the epic.
- **Each group works on one computer together and makes its own product decisions.** There's no stakeholder and no answer card. This overrides "one clone or worktree per participant" from [Pocock and Lauren Tan workflows](04-pocock-and-lauren-tan-workflows.md), which matters for [How groups work in the repo](13-how-groups-work-in-the-repo.md).
- **Spoilers:** the brief's coach-only sections stay in `.scratch/` while we build, and they're stripped from the branches groups work on. Ticket 13 decides how.
- **Still open, for the build:** controllers or minimal APIs, whether participants run Windows, and loading the nested `case/AGENTS.md` (ticket 16).

