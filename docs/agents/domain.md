# Domain docs

How skills should read this repo's domain documentation before exploring the code. There is one context: the case.

## Before exploring, read these

- **`case/GLOSSARY.md`**: the case's domain language.
- **`case/docs/adr/`**: the decisions that touch the area you're about to work in.

If either doesn't exist, **carry on without it**. Don't flag that it's missing and don't suggest creating it up front. The `domain-modeling` skill (reached through `grill-with-docs`) creates them as soon as terms or decisions are actually settled.

## File structure

```
case/
├── AGENTS.md          ← written by your group
├── GLOSSARY.md        ← written by your group, mostly by the grill
├── docs/adr/
│   └── 0001-<decision>.md
├── api/
└── web/
```

## Use the glossary's vocabulary

When your output names a domain concept (in a ticket title, a spec, a test name), use the term `case/GLOSSARY.md` defines. Don't drift to a synonym the glossary lists under _Avoid_.

If the concept you need isn't in the glossary yet, either you're inventing language the team doesn't use (reconsider), or there's a real gap (note it for `domain-modeling`).

## Flag ADR conflicts

If your output contradicts an existing ADR, say so explicitly rather than quietly overriding it:

> _Contradicts ADR-0002 (…), but worth reopening because…_
