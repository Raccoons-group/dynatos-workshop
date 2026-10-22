---
name: how-we-worked
description: "Use before a push, before the group closes or clears a session, or when the group asks to write or update its how-we-worked note: appends a dated section with the tool and model, what the agent observed, and what the group says to two or three short questions, after the group has checked the draft."
---

The how-we-worked note is the group's record of how it worked with its agent today. There are no transcripts, so this note is what tomorrow's retrospective and the live deck read. Each run appends one section; the note grows over the day.

Run it before every push, at least at every phase change, and before the group closes or clears a session, because then what this session saw is gone.

## 1. Link the skills

Run the link script: `node scripts/link-skills.mjs` (the same as `pnpm skills:link`). A skill the group made in `.claude/skills/` is then in `.agents/skills/`, where it gets committed and where you'll find it in step 3.

## 2. Find the note

It's `how-we-worked.md` in the working-out folder (`Working-out:` in `docs/agents/workshop.md`, for example `work/group-a/how-we-worked.md`). If it doesn't exist, you'll create it with a `# How we worked` heading.

Read the sections already there. Yours starts where the last one ended; don't repeat what they say.

## 3. Observe

Write only what you saw: this session's conversation, plus what the repo shows since the last section (`git log`, and what changed in the working-out, `case/AGENTS.md`, `case/GLOSSARY.md` and `.agents/skills/`). If this session started late, say what you couldn't see rather than guess.

- **Skills used:** which skills ran in this session, and any skill the group wrote.
- **Corrected by the group:** where the group stopped you, redirected you, or changed what you'd produced. One line each.
- **Got wrong:** what you got wrong, one bullet per mistake. End a bullet with "(twice)" when the same mistake happened a second time.
- **Tests:** before the code, after the code, or none yet, for the work in this stretch.

Describe; don't advise. Write "the group", never a person's name.

## 4. Ask the group

Ask two or three short questions in one message, then wait. Pick from:

- How did you split the work at the keyboard?
- What would you do differently?
- What's one thing you'd keep?

Write the answers down in the group's own words, shortened, without names. "Skip" is an answer: write "(skipped)".

## 5. Let the group check it

Show the whole section and ask: "Anything to correct before I add it?" Make every correction they ask for. The group has the last word on what you observed too.

Only then append it to the note, below the last section. Never change an earlier section.

```markdown
## <YYYY-MM-DD HH:MM> · <tool> · <model>

From <where this stretch started> to <where it ended>.

### Observed by the agent

- Skills used: <skills>
- Corrected by the group: <where, and to what>
- Got wrong: <a mistake>
- Got wrong: <a mistake that happened again> (twice)
- Tests: <before the code / after the code / none yet>

### Said by the group

- **How did you split the work at the keyboard?** <answer>
- **What would you do differently?** <answer>
```

The header names the tool you're running in (Claude Code, Codex, Copilot CLI, Copilot in VS Code, …) and the model you're running on. Say what you know about yourself; if you don't know your model, ask the group to read it from the tool's model picker.

## 6. Leave the commit to the group

The commit is theirs. Don't commit the note here unless they ask. It usually goes up with the next push, through the `open-pr` skill.
