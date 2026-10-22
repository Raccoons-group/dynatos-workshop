---
name: implement
description: "Implement a piece of work based on a spec or set of tickets."
disable-model-invocation: true
---

_Adapted from mattpocock/skills v1.3.1 (MIT)._

Implement the work described by the user in the spec or tickets, one ticket at a time. `docs/agents/issue-tracker.md` says where they live.

## Before you write code

1. Read the ticket and the spec. Note the ticket's acceptance examples and the seam the spec agreed to test them at. If either is missing, stop and ask the user: there's nothing yet to prove the slice against.
2. Claim the ticket: set its `Status:` line to `claimed`.
3. Ask the user: **"Test-first or test-after?"** It's their call. Test-first with the `tdd` skill is recommended, not required. Record the answer in the ticket file as a `Tests:` line under its `Status:` line: `Tests: test-first` or `Tests: test-after`. If an earlier ticket already has a `Tests:` line, recommend that answer, but still ask.
4. If the slice touches a rule the code already has, write characterization tests first: tests at the agreed seam that pin down what the code does today, green before you change anything. They show which behaviour your change alters on purpose and which by accident.

## Build

- **Test-first:** use the `tdd` skill at the agreed seam, one acceptance example per red → green cycle.
- **Test-after:** build the slice, then write each acceptance example as a test at the agreed seam. Watch each one fail once (break the code or the expected value on purpose, then put it back), so you know it can.

Either way, run typechecking regularly, single test files regularly, and the full test suite once at the end.

## Done means proven

A slice is done only when every one of its acceptance examples is an automated test at the agreed seam, and the full suite is green. A test that can't fail, or one that reaches past the seam into internals, doesn't count. Tick each acceptance example in the ticket and add the name of the test that proves it.

Then:

1. Commit your work to the current branch. Never switch branches.
2. Review the work with the `code-review` skill, since the commit you started the ticket from, with the ticket as its spec. Fix what it puts under Act on, and commit again.
3. Set the ticket's `Status:` line to `done`, and commit.
