Owner: Schuyten. Review: 20 Nov 2026.

Run each prompt in a fresh session, started at the repo root on a group base. ✅ means the skill behaved: it fired on a "should fire" prompt, or stayed quiet on a "should not fire" one. ❌ means it didn't.

## Should fire

| Prompt                                                  | Claude Code | Codex | Copilot |
| ------------------------------------------------------- | ----------- | ----- | ------- |
| Open our draft PR.                                      |             |       |         |
| Push what we have and update the PR.                    |             |       |         |
| The review block is over: mark our PR ready for review. |             |       |         |

## Should not fire

| Prompt                                                   | Claude Code | Codex | Copilot |
| -------------------------------------------------------- | ----------- | ----- | ------- |
| Review the changes on this branch since our base.        |             |       |         |
| Commit the spec with a good message, but don't push yet. |             |       |         |
| Show me the diff between our branch and our base.        |             |       |         |

## With and without

Task: "Open our draft PR" on a fresh group base without `gh`. Without the skill: not run yet. With it: not run yet.
