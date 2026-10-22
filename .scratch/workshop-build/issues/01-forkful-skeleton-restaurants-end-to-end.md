# 01: Forkful skeleton: restaurants, end to end

**What to build:** A participant runs one command and sees Forkful's restaurant list, with the cuisine filter and the open/closed badge, served by the .NET API from seeded SQLite. One command runs both test suites, and CI runs them on every PR into `main`, `group-*/main` and `demo/main`.

**Blocked by:** None (can start immediately). The build machine needs the .NET 10 SDK.

**Status:** done

Spec: [../spec.md](../spec.md)

- [x] The API is .NET 10 with ASP.NET Core controllers and EF Core on a SQLite file. It's seeded on startup and serves an OpenAPI document.
- [x] The restaurants endpoint has a cuisine filter and an open/closed state. Entity and table names follow the coach notes.
- [x] The web app is React 19 with Vite, TypeScript, React Router and plain `fetch`. Its Restaurants page renders from the API.
- [x] The API is wrapped as a workspace package, so turbo's `build` and `test` cover both stacks. `pnpm dev` starts both apps and `pnpm test` runs both suites.
- [x] Two tests exist: one API happy-path test through `WebApplicationFactory` (listing restaurants returns the seed data), and the Vitest and Testing Library smoke test (the restaurant list from a mocked API).
- [x] A CI workflow runs both suites on PRs into `main`, `group-*/main` and `demo/main`, and on pushes to `main`. (`.github/workflows/tests.yml`; it runs `pnpm install --frozen-lockfile` and `pnpm test`, both green locally. Its first GitHub run is the next push.)
- [x] There's no agent context under the case (no AGENTS.md, glossary or ADRs), and no committed test covers a business rule.
