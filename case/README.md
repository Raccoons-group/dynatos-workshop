# Case

The app every group works on during the workshop will live here.

Planned shape:

- `case/web`: the React frontend. It joins the pnpm workspace automatically.
- `case/api`: the .NET backend. A thin `package.json` wraps `dotnet build` and `dotnet test`, so `pnpm turbo run build test` covers both stacks. Turbo caches `bin/` and `obj/` as outputs.
