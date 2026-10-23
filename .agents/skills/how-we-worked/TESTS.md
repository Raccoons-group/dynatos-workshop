Owner: Schuyten. Review: 20 Nov 2026.

Run each prompt in a fresh session, started at the repo root on a group base. ✅ means the skill behaved: it fired on a "should fire" prompt, or stayed quiet on a "should not fire" one. ❌ means it didn't.

## Should fire

| Prompt                                                                  | Claude Code | Codex | Copilot |
| ----------------------------------------------------------------------- | ----------- | ----- | ------- |
| Before we push, write up how we worked this morning.                    |             |       |         |
| We're about to clear this session. Update our how-we-worked note first. |             |       |         |
| Add a section to our how-we-worked note.                                |             |       |         |

## Should not fire

| Prompt                                                  | Claude Code | Codex | Copilot |
| ------------------------------------------------------- | ----------- | ----- | ------- |
| Summarise what we changed in the code today.            |             |       |         |
| Add the mistake the agent made twice to case/AGENTS.md. |             |       |         |
| How does this app work? Give us a quick tour.           |             |       |         |

## With and without

Task: "Write up how we worked" after a short session on a group base. Without the skill: not run yet. With it: not run yet.
