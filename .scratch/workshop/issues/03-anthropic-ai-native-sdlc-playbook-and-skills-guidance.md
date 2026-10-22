# Anthropic's AI-native SDLC playbook and skills guidance

Type: research (AFK)
Status: resolved
Blocked by: none

## Question

What does Anthropic's _The AI-native SDLC playbook_ (https://claude.com/resources/articles/the-ai-native-sdlc-playbook) actually prescribe: its phases, roles, practices, claims and metrics? And what does Anthropic's own documentation say about Agent Skills: structure, progressive disclosure, authoring best practice, and verification loops?

Output: a digest with framings worth quoting and models that would work on a slide, each one cited, ready for the two storyline prototypes.

## Answer

Full digest with sources: [research/anthropic-playbook-and-skills.md](../research/anthropic-playbook-and-skills.md)

- **The playbook is a six-stage loop: Plan → Design → Build → Test → Deploy → Maintain.** Each stage commits a Markdown artifact the next stage reads: `intent.md` → `spec.md` → `plan.md` → diff → PR/review → incident → new intent. Humans review at the gates; they don't kick off each stage.
- **It has no "tickets" step.** The Build unit is a committed `plan.md` (files, order, risks, proof), split into parallel tasks along file boundaries. Tickets are best presented as plan slices, each with a Proof section.
- **It interviews twice:** the PO about the problem (intent, spec), the engineer about the implementation (plan). That gives the two Dynatos POs a concrete role at the spec review checkpoint.
- **Verification is the strongest lever.** It runs throughout Build, followed by a fresh-context verifier before the PR. Cap agent review at about three rounds; an agent's approval never replaces a human's.
- **Skills:** progressive disclosure, and a description that says *when* to fire. The portable core is six frontmatter fields, with `name` matching the folder. A skill is "a control, though an advisory one", so rules that must hold need CI or a hook behind them. Ship trigger tests with skills.
- **Ideas for the reporter skill:** the playbook's own metrics can be computed from git (time from intent to spec, spec rework after the first plan, first-pass CI, drift between plan and diff, review rounds). That gives a ready-made way to compare groups.
- **Many features worth demoing only exist in Claude Code and depend on version** (`/verify`, `/goal`, hooks, skill evals). The portable layer is SKILL.md + AGENTS.md + CI.
