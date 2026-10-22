# Dynatos workshop

A 1.5-day hands-on workshop on AI-assisted development, by Raccoons for the Dynatos team. This repo holds the slide deck, the case the groups work on, and the plan we used to build both.

## Layout

| Path                | What                                                                                          |
| ------------------- | --------------------------------------------------------------------------------------------- |
| `apps/deck`         | The live deck: a web slide deck that updates from the groups' PRs                             |
| `case/`             | The case every group works on (.NET backend, React frontend)                                  |
| `AGENTS.md`         | How agents work in this repo; every tool reads it                                             |
| `REVIEW.md`         | What a reviewer, human or agent, checks                                                       |
| `.agents/skills`    | The shared skill library, linked into `.claude/skills` for Claude Code                        |
| `docs/`             | The issue tracker and domain config for agents, and the AGENTS.md template                    |
| `scripts/`          | The link script, the cross-tool CI guard, and their tests                                     |
| `packages/tsconfig` | Shared TypeScript config                                                                      |
| `.scratch/workshop` | How this workshop was planned: the map, its tickets, research notes and the workshop glossary |

## Requirements

- Node 22+
- pnpm, via `corepack enable`
- .NET SDK, for the case

## Commands

```bash
pnpm install        # also links the shared skills for Claude Code
pnpm setup:check    # checks your machine for the workshop, with a fix for each problem
pnpm build
pnpm dev
pnpm test
pnpm skills:check
pnpm format
```
