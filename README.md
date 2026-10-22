# Dynatos workshop

A 1.5-day hands-on workshop on AI-assisted development, by Raccoons for the Dynatos team. This repo holds the slide deck, the case the groups work on, and the plan we used to build both.

## Layout

| Path                | What                                                                   |
| ------------------- | ---------------------------------------------------------------------- |
| `apps/deck`         | The live deck: a web slide deck that updates from the groups' PRs      |
| `case/`             | The case every group works on (.NET backend, React frontend)           |
| `packages/tsconfig` | Shared TypeScript config                                               |
| `CONTEXT.md`        | The words we use for the workshop                                      |
| `.scratch/workshop` | How this workshop was planned: the map, its tickets and research notes |

## Requirements

- Node 22+
- pnpm, via `corepack enable`
- .NET SDK, for the case

## Commands

```bash
pnpm install
pnpm build
pnpm dev
pnpm test
pnpm format
```
