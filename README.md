# Forkful

Needs Node 22, pnpm and the .NET 10 SDK. Run every command from the repo root.

## Run

```bash
pnpm install
pnpm dev
```

- Web app: http://localhost:5173
- API: http://localhost:5080, with its OpenAPI document at http://localhost:5080/openapi/v1.json

## Test

```bash
pnpm test
```

One suite at a time:

```bash
dotnet test case/api/Forkful.slnx
pnpm --filter @forkful/web test
```
