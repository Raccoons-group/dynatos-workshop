# Map: Dynatos AI-assisted development workshop

Status: wayfinder:map

## Destination

**Cleared on 22 Oct 2026.** Every ticket is resolved and the fog is empty; handed to `/to-spec`.

A buildable spec for the Dynatos 1.5-day workshop: the agenda with timings and owners, the deck storyline per block, the case brief, the live-deck design (pipeline plus what the reporter skill writes), and the takeaways. Ready to hand to `/to-spec` → `/to-tickets` → build in this turborepo. Target: map cleared by Wed 21 Oct 2026, workshop built by Fri 23 Oct 2026.

## Notes

**Domain.** A hands-on workshop on AI-assisted development for the Dynatos (Routty) dev team. Day 1 is a full day and Day 2 a half day, in 's-Hertogenbosch. Eleven participants, developers plus two product owners, spread over the Netherlands, Slovakia, Poland and Norway, so everything is in English. Their stack is a .NET backend with a React frontend. Matthias and Sander present and coach. Three groups of three or four, mixed by experience and product. Vocabulary lives in [CONTEXT.md](../../CONTEXT.md).

**Inputs.** These stay local to Matthias and are deliberately kept out of the repo:

- Intake notes: `~/Downloads/Intake_dynatos.pdf`
- The colleague's deck, the base for the skills chapter: `~/Downloads/AI skills in practice · Jira, Wayfinder and implementation.pdf`
- Anthropic, _The AI-native SDLC playbook_: https://claude.com/resources/articles/the-ai-native-sdlc-playbook

**Participants will see this repo.** They open PRs here, and the opener shows this map. Keep internal intake notes and opinions about people out of it.

**Settled while charting**

- Participants bring their own tool (Claude Code, Codex, Copilot). Everything we hand out (skills, AGENTS.md, conventions) must work across tools. We demo with whatever we like.
- Participant licences and tokens are Dynatos's concern. The agent behind the live deck runs on a Raccoons key.
- Repos live on GitHub. The case lives in this turborepo.
- The case has a neutral domain and stays simple: an existing .NET + React app with one foggy epic, the same for every group. Test automation and creating docs and agent context are part of what groups do.
- Groups commit their working-out with every PR.
- The live deck is hybrid. The reporter skill runs in CI on each group PR for updates during Day 1. A coach runs the heavier retrospective synthesis overnight. Running the reporter locally is also the fallback if CI or the wifi fails.
- The deck is a web app in this turborepo, in the Raccoons house style (dark; colours and fonts from the `raccoons-brand:raccoons-deck` skill), with slides in a format agents can edit.
- Day shape:
  - Day 1 morning: setup round, talk with live demo (about 1.5h), case kickoff.
  - Day 1 afternoon: group work in phases, with a spec review checkpoint before agents build. The live deck updates as PRs land, and the day ends with a short stand-up per group.
  - Overnight: retrospective synthesis.
  - Day 2: retrospective walkthrough comparing how the groups worked, a skill lab on the team's own repetitive tasks, and the action plan.
- The opener shows that this workshop was built with the workflow we teach: this map, the specs, the tickets and the PRs.
- Takeaways: a shared skill library (cross-tool, including the Day 2 skills), an AGENTS.md template, the action plan, and the reporter skill.
- Two storylines are prototyped in parallel, one following the lifecycle and one going concept by concept, before we pick one.

**Pace.** Everything should be finished this week, so keep tickets small and run frontier tickets in parallel sessions. Dynatos expects the agenda and the case outline this week, so the case brief, storyline choice and agenda tickets come first.

**Skills.**

- Grilling tickets: `grilling` + `domain-modeling`.
- Prototype tickets: `prototype`.
- Research tickets: `research`, with findings in `.scratch/workshop/research/`.
- Brand: `raccoons-brand:raccoons-deck`.

Plan, don't do. The two task tickets (repo scaffold, GitHub repo and key) are the only execution on this map.

## Decisions so far

<!-- one line per resolved ticket: [title](issues/NN-slug.md): gist -->
- [Create the GitHub repo and add the agent key](issues/02-create-the-github-repo-and-add-the-agent-key.md): private repo on Matthias's personal account (GitHub Free, so no branch protection), `main` pushed; the key, settings, labels and collaborators move to the build handoff.
- [Live-deck pipeline spike](issues/15-live-deck-pipeline-spike.md): folded into the build as its first ticket, carrying the agenda's latency budgets and the checks from tickets 13 and 14; waits on the agent key.
- [Wider practitioner landscape and evidence](issues/05-wider-practitioner-landscape-and-evidence.md): consensus is verification, fixing the harness and shared repo guidance; the evidence says AI amplifies and the bottleneck moves to review; TDD-in-the-loop is contested; keep AGENTS.md short; measure team signals, not volume.
- [Skill and AGENTS.md portability across tools](issues/06-skill-and-agents-md-portability-across-tools.md): all tools read SKILL.md and AGENTS.md; skills canonical in `.agents/skills/` with generated links into `.claude/skills/`; one root AGENTS.md and no CLAUDE.md; name skills in plain text; Visual Studio/JetBrains Copilot ignore AGENTS.md.
- [Pocock and Lauren Tan workflows](issues/04-pocock-and-lauren-tan-workflows.md): Pocock plans up front (grill → spec → tickets → implement/tdd → review → PR), Tan goes depth-first with code as the spec, a useful contrast; groups use `/grill-with-docs`, not wayfinder; one checkout per participant; skills v1.3 renamed CONTEXT.md to GLOSSARY.md.
- [Coding agents in GitHub Actions](issues/07-coding-agents-in-github-actions.md): `claude-code-action` on `pull_request` runs `/reporter` read-only and outputs JSON; a separate publish job commits per-group files to a `live-deck-data` branch that the deck syncs; PRs with merge conflicts don't trigger; use a dedicated, spend-capped key.
- [Scaffold the turborepo skeleton](issues/01-scaffold-the-turborepo-skeleton.md): pnpm + turbo with `apps/deck` placeholder, shared tsconfig, `case/` slot (React in the workspace, .NET wrapped by a thin package.json); TS pinned to 6.0; .NET SDK not installed locally yet.
- [Anthropic's AI-native SDLC playbook and skills guidance](issues/03-anthropic-ai-native-sdlc-playbook-and-skills-guidance.md): six-stage loop where each stage commits an artifact (intent → spec → plan → diff → PR); no tickets step, plan slices instead; verification is the biggest lever; skills are advisory controls, so CI enforces.
- [Case brief: a neutral brownfield app with a foggy epic](issues/08-case-brief-a-neutral-brownfield-app-with-a-foggy-epic.md): Forkful, a small .NET 10 + React food delivery app, with the epic "group orders for the office lunch"; groups add the missing AGENTS.md, glossary and tests; done means at least one slice green in CI; each group works on one computer and makes its own decisions.
- [What the reporter sees and what the retrospective says](issues/14-what-the-reporter-sees-and-what-the-retrospective-says.md): the reporter observes and never coaches; scripts count and the agent judges, with evidence; Day 1 live views show state (wall, decision grid, review, stand-up, tonight) and team signals wait for Day 2; a `how-we-worked` skill drafts the note and there are no transcripts; the retrospective re-reads the raw history overnight, and groups correct its least-sure claims.
- [Starter skill library and AGENTS.md template](issues/16-starter-skill-library-and-agents-md-template.md): fork Pocock v1.3.1 with plain names: read-issue → grill-with-docs (default) → to-spec → to-tickets → implement/tdd → code-review → open-pr, plus how-we-worked; wayfinder optional with its dependents; GLOSSARY.md, with groups writing `case/GLOSSARY.md`; local tracker, one file per ticket; a 50-line AGENTS.md skeleton; review rounds capped at 3 in `review.md`; group skills in `.agents/skills/`; Visual Studio/Rider is an open question for Dynatos.
- [Deck framework: Slidev vs React/Vite + MDX](issues/09-deck-framework-slidev-vs-react-vite-mdx.md): Slidev, for its built-in presenter mode, notes and PDF/PPTX export; live data is one Vite plugin that pushes `live-deck-data` changes and keeps the last good file; strings render as text; brand CSS is framework-neutral; keep TS on 6.0 (Slidev depends on it); self-host Inter Tight for offline.
- [How groups work in the repo](issues/13-how-groups-work-in-the-repo.md): a base branch per group (`group-<x>/main`, cut from a stripped `case-start`) with one long-lived PR from `group-<x>/group-orders`, drafted within 30 minutes and merged at the end of Day 1; coach notes are never committed, and the cut removes `.scratch/workshop/` and `apps/deck`; the working-out is in `work/group-<x>/`; the PR template gains a Day 1 checklist; protect the bases if the plan allows.
- [Storyline A: one feature through the lifecycle](issues/10-storyline-a-one-feature-through-the-lifecycle.md): one Forkful sibling story on a two-row ribbon (eight stations, plus three threads: context, skills, checks); each thread is taught once where the feature first needs it, and the skills deck stays one chapter; a few fixed gates, everything else "your call"; 87 slides, a 90-min talk with 30 min of live demo; the risk is a chained demo.
- [Storyline B: concept by concept](issues/11-storyline-b-concept-by-concept.md): six harness layers (context, skills, specs, checks, verification and review, team), each with one idea, one short demo and one exhibit from this repo; a general opener, with the skills deck's p2–3 opening the skills chapter and its wayfinder pages in specs; six layer cards run from the opener through the retrospective to the action-plan grid; 100 slides, a 90-min talk with five independent demos (21 min); the risk is no end-to-end story before the hands-on.
- [Choose the storyline](issues/12-choose-the-storyline.md): a merge on A's spine (one Forkful sibling story on the ribbon) with B's general opener, exhibits and team slides; the talk splits at the checks cut, 58 min before the kickoff and 35 after lunch, which amends the day shape in Notes; the ribbon frames the wall, the retrospective and the action-plan grid; the demo passes every fixed gate, with a fallback tag per station; 96 slides.
- [Agenda with timings and owners](issues/17-agenda-with-timings-and-owners.md): Day 1 09:00–17:00 in one room, opening with the participants' own setup, experience and workflows; Part 1 09:40, kickoff 10:55, lunch 12:40, Part 2 13:30, review block 16:00, and the merge as the last push; overnight synthesis 17:30, reviewed by 08:30; Day 2 09:00–12:30 with a 60-min lab and a closing round; coaches divide the blocks, with three fixed pairings; the client-facing version settles the client proposal.
- [Live demo script](issues/18-live-demo-script.md): the sibling story is "Show allergens on the menu", with a product card so the live grill reaches the same decisions every time; Claude Code throughout, with Codex reviewing on 57; Part 2 goes tag to tag from `demo/04-sliced`; three pushes, with the merge off stage once green; a fourth base `demo/main`, with its card only on talk slides, never on the wall; `demo-reset.sh` restores the PR state a tag can't hold.
- [Day 2: skill lab and action plan follow-up](issues/19-day-2-skill-lab-and-action-plan-follow-up.md): tasks come on a card at 17:00; self-chosen pairs of two or three with at least two tools, proving on Forkful only; a finished skill has trigger tests in both tools and a fix level; lab PRs go from `main` into `main`; the plan is `docs/action-plan/` with a plan owner the room chooses; no return session, one follow-up mail, and a clean takeaway repo transferred within a week.

## Not yet specified

Nothing left in the fog.

## Out of scope

- **Pre-workshop survey.** There's no time to get it out before the workshop.
- **Participant licences and tokens.** Dynatos arranges these.
- **Working on Dynatos's own codebases.** The case is our own neutral repo, which keeps customer data and the running ISO audits out of play.
- **Route33 (Cronos).** Raised in the intake, but evaluating a specific vendor platform isn't what this workshop is for.
- **Rehearsal and fallbacks.** The dry run happens after the build, beyond this map's destination (a buildable spec); moved out on 22 Oct. Its checklist goes into the build handoff instead: the cross-tool unknowns from [Skill and AGENTS.md portability across tools](issues/06-skill-and-agents-md-portability-across-tools.md), the dry-run checks of the cut script from [How groups work in the repo](issues/13-how-groups-work-in-the-repo.md), and the risks for the dry run in [the agenda](assets/agenda.md).
