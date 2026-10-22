Owner: schuyten-raccoons. Review: 20 Nov 2026.

Run each prompt in a fresh session, started at the repo root on a group base. ✅ means the skill behaved: it fired on a "should fire" prompt, or stayed quiet on a "should not fire" one. ❌ means it didn't.

## Should fire

| Prompt                                                        | Claude Code | Codex | Copilot |
| ------------------------------------------------------------- | ----------- | ----- | ------- |
| Pull in our epic so we can start.                             |             |       |         |
| Can you read issue #1 and tell us what it actually asks for?  |             |       |         |
| Let's start from the GitHub issue for our epic. What's in it? |             |       |         |

## Should not fire

| Prompt                                                                 | Claude Code | Codex | Copilot |
| ---------------------------------------------------------------------- | ----------- | ----- | ------- |
| Open a new GitHub issue for the bug we just found on the sign-in page. |             |       |         |
| Read case/README.md and tell us how to run the app.                    |             |       |         |
| Grill us on our plan before we write the spec.                         |             |       |         |

## With and without

Task: "Pull in our epic" on a group base without `gh`, then paste the issue when asked. Without the skill: not run yet. With it: not run yet.
