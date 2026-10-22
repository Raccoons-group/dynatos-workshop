# Issue tracker: local markdown in your working-out folder

Specs and tickets for your group's work live as markdown files in the working-out folder named in `docs/agents/workshop.md` (for example `work/group-a/`). The epic is the only GitHub issue, and the `read-issue` skill reads it. Everything you plan from it lives in files.

## Conventions

- The spec is `<working-out>/spec.md`.
- Tickets are one file per ticket, `<working-out>/issues/NN-<slug>.md`, numbered from `01`. Never put several tickets in one file.
- Each ticket has a `Status:` line near the top: `open`, `claimed` or `done`.
- Blocking is a `Blocked by: NN, NN` line near the top. A ticket is unblocked when every ticket it lists is `done`.
- Comments and conversation go at the bottom of the file, under a `## Comments` heading.
- Prototypes and research notes go into the working-out folder too, never onto another branch. Your group works in one checkout.

## When a skill says "publish to the issue tracker"

Create a file in the working-out folder, and create the folder if it's missing.

## When a skill says "fetch the relevant ticket"

Read the file at the path, or with the number, the user gives you.

## Wayfinding operations

Used by the `wayfinder` skill. In the workshop, keep the map to about five tickets, and hand off to `to-spec` before the spec review checkpoint.

- **Map:** `<working-out>/map.md`.
- **Child ticket:** `<working-out>/issues/NN-<slug>.md`, with a `Type:` line (`research`, `prototype`, `grilling` or `task`) and a `Status:` line.
- **Blocking:** a `Blocked by: NN, NN` line, as above.
- **Frontier:** the tickets that are `open` and unblocked. The lowest number wins.
- **Claim:** set `Status: claimed` and save, before any other work.
- **Resolve:** append the answer under an `## Answer` heading, set `Status: done`, then add a one-line pointer (the gist and a link) to the map's "Decisions so far".
