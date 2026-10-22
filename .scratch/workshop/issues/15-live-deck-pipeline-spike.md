# Live-deck pipeline spike

Type: prototype (HITL)
Status: resolved
Blocked by: 01, 02, 07, 09

## Question

Does the end-to-end path work? A PR on the GitHub repo triggers a GitHub Action, which runs a stub reporter skill, which writes structured data, which the deck then shows, all without a coach touching anything.

Spike it with a dummy PR and a stub skill. Measure the latency from PR to slide, and confirm the local fallback works (a coach runs the same skill on their own machine).

## Answer

**Folded into the build as its first ticket** (22 Oct, Matthias). The spike is mostly building the pipeline anyway, and it waits on the agent key from [Create the GitHub repo and add the agent key](02-create-the-github-repo-and-add-the-agent-key.md). Its acceptance carries what earlier tickets asked of it:

- **[Agenda](17-agenda-with-timings-and-owners.md) latency budgets** (the pipeline clock in [assets/agenda.md](../assets/agenda.md)):
  - about 5 minutes from push to card for the 16:30 review push; if slower, the push deadline moves to 16:25
  - about 8 minutes including CI for the demo's push (slides 61 → 65)
  - the demo's draft PR and label visible before 10:38
  - Day 2 library PRs and the committed action plan also show on the deck
- **[How groups work in the repo](13-how-groups-work-in-the-repo.md):** spike on a cut base (a PR from `group-x/…` into `group-x/main`), with the reporter loading from the base tip. Include the hotfix cherry-pick script, and check `pnpm install --frozen-lockfile` passes without `apps/deck`.
- **[What the reporter sees](14-what-the-reporter-sees-and-what-the-retrospective-says.md):** wait for the case's tests, and merge `facts` with `judgements` in the publish job.
- **The local fallback works:** a coach runs the same skill and the same scripts.
