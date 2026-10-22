Owner: <GitHub username>. Review: <date>.

<!--
The TESTS.md template for a shared skill. Copy it to .agents/skills/<name>/TESTS.md and fill it in.

- Run every prompt in a fresh session (no earlier chat), in both partners' tools.
- Tick a cell ✅ when the tool did the right thing: it fired for "Should fire", it stayed quiet for "Should not fire".
  Otherwise write ❌ and what happened, for example "❌ fired" or "❌ used grilling instead". Leave a cell empty when
  you didn't run it in that tool.
- The library list on the deck counts a tool as passed when every "Should fire" row is ✅ in its column. Keep the
  headings and the tool columns as they are, and add a column if you also used another tool.
- The owner lives here, not in .github/CODEOWNERS, so lab PRs never conflict on one file.
-->

## Should fire

| Prompt                                  | Claude Code | Codex | Copilot |
| --------------------------------------- | ----------- | ----- | ------- |
| <a real request that needs this skill>  |             |       |         |
| <a second one, in different words>      |             |       |         |
| <a third one, the way a colleague asks> |             |       |         |

## Should not fire

| Prompt                                         | Claude Code | Codex | Copilot |
| ---------------------------------------------- | ----------- | ----- | ------- |
| <a near miss: similar words, different job>    |             |       |         |
| <a second near miss>                           |             |       |         |
| <a third near miss, maybe another skill's job> |             |       |         |

## With and without

Task: <one task>. Without the skill: <what happened>. With it: <what changed>.
