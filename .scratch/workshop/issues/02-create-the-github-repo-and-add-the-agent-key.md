# Create the GitHub repo and add the agent key

Type: task (HITL)
Status: claimed
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
2. Say "commit" and Claude makes the first commit on `main`.
3. **Owner, visibility and plan.** A private org repo on GitHub Free has neither branch protection nor rulesets, so the group bases can only be protected on Team or Pro. Without that, it's a kickoff rule plus the 30-minute check.
4. **Create the repo and push `main`.** Optionally run `brew install gh` and `gh auth login` (you sign in yourself), and Claude can then create the repo and do steps 5 and 7.
5. **Repo settings:** allow merge commits only, don't auto-delete head branches, and create the labels `spec-reviewed` and `epic`.
6. **Agent key.**
   - Create a dedicated Anthropic Console workspace with a spend limit, and a key in it.
   - Add the key as the Actions secret `ANTHROPIC_API_KEY` (`gh secret set ANTHROPIC_API_KEY`; you paste it, so Claude never sees it).
   - Delete the key after the workshop.
7. **Write access for all eleven participants** before Day 1: ask Dynatos for their GitHub usernames.
8. Record the repo URL, visibility, plan, secret name and admins here, then resolve.
