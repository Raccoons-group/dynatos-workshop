# Create the GitHub repo and add the agent key

Type: task (HITL)
Status: resolved
Blocked by: 01

## Question

The live-deck pipeline spike needs a real GitHub repo with a secret it can use. This is a checklist for Matthias, because the org rights and the key are his and `gh` isn't installed on this machine:

1. Pick the GitHub owner (a Raccoons org?) and the visibility. Private until the workshop?
2. Create the repo and push the scaffold.
3. Add a Raccoons Anthropic API key as an Actions secret, and record the secret's name.
4. Confirm that eleven participants can get write access (individual collaborators or an org team) in time for Day 1.

Record the repo URL, the visibility, the secret name, and who has admin.

## Context from research

[Coding agents in GitHub Actions](07-coding-agents-in-github-actions.md): anyone with write access can read the repo's secrets. Use a dedicated Anthropic Console workspace key with a spend limit and delete it after the workshop, or use workload identity federation.

## Progress (22 Oct 2026)

**Done, no human needed**

- **The coach notes are out of the repo.**
  - The case brief's two "Coach only" sections and ticket 08's "What's planted" bullet now live in `.scratch/workshop/coach/coach-notes.md`, which is gitignored. One-line pointers are left in their place.
  - Four hints in the brief's shared sections (settled so far, why this epic, what makes it foggy, the stretch goal) and two strings in the deck prototype's fake data went too: they gave away details of what's planted.
- **Check from [How groups work in the repo](13-how-groups-work-in-the-repo.md): passed.**
  - Searched the 84 files that would be committed, outside `case/`. None of the planted names or rules appear. The only hit is "vendor telemetry" in a research note, a false positive.
  - The glossary's "Coach notes" entry names the categories (drifted names, rules only in code) but nothing specific. Left as is.
- Nothing is committed yet, so git history has never held a coach note.

**Checklist for Matthias** (now includes what [How groups work in the repo](13-how-groups-work-in-the-repo.md) added)

1. Share `.scratch/workshop/coach/coach-notes.md` with Sander outside git.
2. ~~Say "commit" and Claude makes the first commit on `main`.~~ Done: `2948514` on `main` (22 Oct), spoiler check re-run clean just before.
3. ~~**Owner, visibility and plan.**~~ Decided 22 Oct: Matthias's personal account, private, **GitHub Free**. So there's no branch protection: the group bases rely on the kickoff rule plus the 30-minute check ([How groups work in the repo](13-how-groups-work-in-the-repo.md)).
4. ~~**Create the repo and push `main`.**~~ Done 22 Oct: Matthias created it and pushed `main` at `5d36e1a`, after it was switched to private (unauthenticated API returns 404).
5. **Repo settings:** allow merge commits only, don't auto-delete head branches, and create the labels `spec-reviewed` and `epic`.
6. **Agent key.** Matthias creates it later; the pipeline spike waits on it.
   - Create a dedicated Anthropic Console workspace with a spend limit, and a key in it.
   - Add the key as the Actions secret `ANTHROPIC_API_KEY` (`gh secret set ANTHROPIC_API_KEY`; you paste it, so Claude never sees it).
   - Delete the key after the workshop.
7. **Write access for all eleven participants** before Day 1: ask Dynatos for their GitHub usernames.
8. Record the repo URL, visibility, plan, secret name and admins here, then resolve.

**Repo (22 Oct 2026)**

- URL: https://github.com/schuyten-raccoons/ai-assisted-dev-workshop (a personal account, not an org).
- **Visibility: private**, decided by Matthias. It was created public, but the plan names the client, its team and its running audits, so nothing gets pushed until it's private.
- Consequence for [How groups work in the repo](13-how-groups-work-in-the-repo.md): a private repo on a personal account has no branch protection on GitHub Free, only on Pro. Without Pro, the group bases rely on the kickoff rule plus the 30-minute check. Participants are added as individual collaborators, because personal accounts have no teams.

## Answer

Partly done. The rest moves to the build handoff (22 Oct, Matthias), because none of it is a decision.

- **Repo:** https://github.com/schuyten-raccoons/ai-assisted-dev-workshop, on Matthias's personal account. Private, GitHub Free, so no branch protection. `main` pushed at `5d36e1a`. Admin: Matthias.
- **Secret name:** `ANTHROPIC_API_KEY`. The key doesn't exist yet.
- **Carried into the build handoff:**
  - Matthias creates a spend-capped key in a dedicated Console workspace and adds it as the secret.
  - Repo settings: merge commits only, no auto-deleting head branches, labels `spec-reviewed` and `epic`.
  - The eleven participants become collaborators, from Dynatos's participant list.
  - Share the coach notes with Sander outside git.
