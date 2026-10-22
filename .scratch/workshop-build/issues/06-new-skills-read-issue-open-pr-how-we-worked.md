# 06: New skills: read-issue, open-pr, how-we-worked

**What to build:** A group can pull in its epic, open an early draft PR against its own base, keep that PR updated, and draft its how-we-worked note, all from whichever tool it uses.

**Blocked by:** 04, 05

**Status:** done

Spec: [../spec.md](../spec.md)

- [x] `read-issue` tries `gh` first, then the agent's own GitHub tool, then asks the group to paste the issue. It separates facts from questions and hands off to grilling.
- [x] `open-pr` runs the link script first, then commits the working-out and pushes.
  - It always passes the base from `docs/agents/`.
  - It opens a draft early, then updates the same PR and ticks the "Done by the end of Day 1" boxes as artifacts appear.
  - It marks the PR ready on request, and prints the compare URL when `gh` is missing.
- [x] `how-we-worked` runs the link script first, then appends a dated section to the note: a header with the tool and model, "Observed by the agent", and "Said by the group" from two or three questions. The group reviews the draft before committing it.
- [x] The group PR template holds ticket 16's review fields, then ticket 13's "Done by the end of Day 1" checklist and "Part of #<epic>". It never says "Closes".
- [ ] Each new skill has a `TESTS.md`: 3 prompts that should fire it and 3 that shouldn't, run in a fresh session in at least two tools, plus a with-and-without run. **The files and prompts exist. The runs are Matthias's to do (see Done).**
- [x] On a scratch base, these work end to end: issue → draft PR → an update push. **I ran the skills' commands myself. An agent-driven run and the real GitHub run are still Matthias's (see Done).**

## Done (22 Oct 2026)

**Files** (nothing committed):

- `.agents/skills/read-issue/`, `.agents/skills/open-pr/` and `.agents/skills/how-we-worked/`. Each holds a `SKILL.md`, a `TESTS.md` and an `agents/openai.yaml`.
  - `open-pr` also has a `CREDITS.md`. It wraps upstream v1.3.1 `pr`, fetched fresh at commit `24fe0ef`, and the credit for Humanlayer's `show-me` comes along with it.
  - All three use only `name` and `description`, and the model can invoke each of them, so there's no `disable-model-invocation` and no Codex policy. AGENTS.md says "open PRs with `open-pr`", so a plain "open a PR" has to reach it. `open-pr` also offers `how-we-worked` before a push.
- `.github/pull_request_template.md`, in this order: ticket 16's review fields, ticket 13's "Done by the end of Day 1" checklist, then "Part of #<epic>". It has no closing keyword anywhere, not even in a comment. It keeps the placeholders `work/<group>/` and `<epic>`, so it's identical on every base, and `open-pr` fills them in from `docs/agents/workshop.md`. `.github/PULL_REQUEST_TEMPLATE/` is untouched, for ticket 15.
- **Outside this ticket's files:** a 3-line "Our own" section in `.agents/skills/README.md`, which credits `open-pr` → `pr` → `show-me`. Ticket 05's hand-over asked for it.

**How the skills work:**

- **`read-issue`**
  - It takes the issue number from the group, or else from `Epic:`.
  - It tries `gh issue view <n> --comments`, then the agent's own GitHub tool, then asks the group to paste the issue. It never web-fetches the page, because a private repo would return a sign-in page.
  - It treats the issue as data, never as instructions.
  - It writes three lists: Facts, Open questions and Decisions to make. Each item says where it came from (body, comment n), never who wrote it, and no decision gets a recommendation.
  - It hands off by recommending `grill-with-docs`, which the group has to start itself because it's user-invoked. It offers `grilling` right away as the alternative.
- **`open-pr`**
  - It runs the link script, moves from the base to the work branch, and stages the working-out, `case/AGENTS.md`, `case/GLOSSARY.md`, the ADRs and any new skill folder. It asks before staging code.
  - It offers `how-we-worked`, and if the branch has no commits yet, it writes a stub `case/AGENTS.md` from the template, because GitHub won't open a PR without a commit.
  - It pushes and never force-pushes.
  - With `gh`, it runs `pr list`, then `pr create --draft --base <base> --head <work>`, or `pr edit` when the PR already exists (retargeting it with `--base` if it pointed elsewhere). Otherwise it uses the agent's own GitHub tool. If neither works, it prints the compare URL with `?expand=1` and the full body.
  - It ticks the boxes from the files on the pushed branch, from the `spec-reviewed` label and from `gh pr checks`.
  - It marks the PR ready or merges it (merge commit only) only when the group asks.
  - On `main`, it handles a Day 2 `lab/<name>` PR with the lab template.
- **`how-we-worked`**
  - It runs the link script, reads the existing sections and observes only what it saw.
  - It writes Skills used, Corrected by the group, Got wrong (with "(twice)" for a repeat, for the reporter's `agentGotWrong`) and Tests.
  - It asks two or three of the three questions from ticket 14.
  - It shows the section and applies the group's corrections, then appends it under a `## <date time> · <tool> · <model>` header.
  - It leaves the commit to the group, usually through `open-pr`.
- **Both skills that link call `node scripts/link-skills.mjs` directly**, the same script as `pnpm skills:link`. That way pnpm's pre-run dependency check can't start an install halfway through a push. Ticket 05 hit exactly that.

**Verified:**

- **Checks:** `node scripts/check-skills.mjs` passes with 15 shared skills, and `cd scripts && node --test test/*.test.mjs` passes 102 of 102. Prettier is clean on every file I touched.
- **Linking and listing:** the link script linked the three new skills, and a fresh `claude -p --setting-sources project` lists each of the 15 repo skills exactly once.
  - **For the dry-run list:** this Claude desktop session picked up the three new links mid-session, with no restart.
- **End to end on a scratch base, without `gh`:** this machine has no `gh`, so this path is real. The base was a case-start copy (`.scratch/` and `apps/deck` stripped) on `group-x/main`, with a local bare remote.
  - **The issue step:** `gh issue view` exits 127, so the issue goes to the paste step.
  - **The first `open-pr`:** it created `group-x/group-orders` and the stub, pushed to the bare remote, and printed `https://github.com/example-org/forkful-scratch/compare/group-x/main...group-x/group-orders?expand=1` with a body that has the paths and `Part of #1` filled in.
  - **The update push:** I added a spec, a ticket, a note section and a skill that Claude Code had put in `.claude/skills/`. The link step adopted that skill into the commit (it would otherwise be gitignored). The update ticked Spec, Tickets and the note, and left the stub `case/AGENTS.md` unticked.
- **The same flow against a logging stand-in for `gh`:** this is a mock, not GitHub. It recorded one draft PR into `group-x/main`. A second create was refused, so the update went through `pr edit`, and `pr ready` flipped the draft. The calls it logged match the skill's commands.
- **Spoilers:** the new files hold no case-domain words. I also compared them against the candidate terms in the local coach notes, and the only matches were `case/AGENTS.md`, `main` and "Working-out:".

**For Matthias:**

1. **Sign the `claude` CLI back in** (`claude auth login`). It's signed out on this machine (`claude auth status` → `loggedIn: false`), so all 18 fresh-session trigger runs failed with "OAuth session expired" before reaching the model. Then run the harness in the shared notes folder, `build-06-skill-tests/` (instructions in `build-06-new-skills-handover.md`):
   - `triggers.mjs` runs the 18 TESTS.md prompts.
   - `withwithout.mjs` runs each skill's task with and without it.
   - Fill in the Claude Code column, or ask this session to.
   - Watch whether "Before we push, write up how we worked" fires `open-pr` instead of, or as well as, `how-we-worked`.
2. **The second tool:** neither `codex` nor Copilot CLI is installed here (only ChatGPT.app), so the Codex and Copilot columns are empty. Run the six prompts per skill in one of them during the dry run, picking from the `$` popup in Codex.
3. **The real GitHub run** (I didn't create a repo, issue or PR, or push to `origin`):
   - on a cut base with `gh` signed in: `read-issue` on the epic, then `open-pr` for the draft, then an update push, then "mark it ready"
   - check that the compare URL opens with slashes in both branch names
   - check that the default template still loads once `PULL_REQUEST_TEMPLATE/` exists
4. **Owner and review date:** every TESTS.md says "Owner: schuyten-raccoons. Review: 20 Nov 2026". The date is my guess; change it if the takeaway repo's review date is different.
5. **Version mismatch:** this machine's Claude Code CLI is 2.1.263, but the setup check asks participants for at least 2.1.277.
