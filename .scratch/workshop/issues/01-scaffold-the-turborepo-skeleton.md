# Scaffold the turborepo skeleton

Type: task (AFK)
Status: resolved
Blocked by: none

## Question

Prototypes need a place to live. Set up the minimal monorepo:

- `git init`
- Turborepo with pnpm workspaces
- An `apps/deck` placeholder that doesn't commit to a framework yet (Deck framework: Slidev vs React/Vite + MDX decides that)
- An empty slot for the case app
- Shared TypeScript and formatting config, `.gitignore`, a README stub

The case is .NET + React, so note how a .NET project will sit next to the JS workspace graph (a turbo task wrapping `dotnet`, or outside turbo entirely) without deciding the case itself.

Done when `pnpm turbo run build` succeeds on the empty workspace. Record the layout and the commands.

## Answer

Scaffolded, git initialised on `main`, nothing committed yet. `pnpm turbo run build` succeeds, and a second run is a full cache hit. Typecheck and `prettier --check` pass.

**Layout**

- `package.json`: root scripts (`build`, `dev`, `test`, `typecheck` through turbo; `format`, `format:check` through prettier). Pins `pnpm@12.11.2`, Node ≥ 22.
- `pnpm-workspace.yaml`: `apps/*`, `packages/*`, `case/*`.
- `turbo.json`: `build` (outputs `dist/**`), `typecheck`, `test`, `dev` (persistent, uncached).
- `apps/deck` (`@workshop/deck`): placeholder that compiles one empty TS file. The deck framework ticket replaces it.
- `packages/tsconfig` (`@workshop/tsconfig`): shared `base.json` (strict, ESNext/Bundler, ES2023).
- `case/`: empty slot with a README.
- `.gitignore` covers Node, turbo, .NET (`bin/`, `obj/`, `.vs/`) and Playwright output. `.prettierignore` skips `.scratch/`, so formatting never touches the tracker files other sessions are editing.

**Choices worth knowing**

- **TypeScript is pinned to `~6.0.3`, not 7.0.** 7.0 is the native rewrite. 6.0 is the safer bet for tooling that hooks into the compiler, such as the Vite/Vue/Slidev ecosystem. The deck framework ticket can revisit this.
- **.NET next to the JS graph:** the case goes in `case/web` (React, a regular workspace package) and `case/api` (.NET). `case/api` gets a thin `package.json` whose `build`/`test` scripts wrap `dotnet build`/`dotnet test`, with `bin/**` and `obj/**` as turbo outputs. That way one `pnpm turbo run build test` covers both stacks. Only the slot exists so far; the case ticket decides the rest.

**Facts later tickets depend on**

- **The .NET SDK is not installed on Matthias's machine** (`dotnet` not found). The case prototype and the build will need it.
- Toolchain here: Node 22.23.2, pnpm 12.11.2, turbo 2.11.9, prettier 3.9.10.
