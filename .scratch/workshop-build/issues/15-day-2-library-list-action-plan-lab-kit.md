# 15: Day 2 library list, action plan and lab kit

**What to build:** During the Day 2 lab, each pair's PR into `main` appears on the deck's library list. During the action plan, each merged row draft fills the grid. Pairs have everything they need to start without a coach.

**Blocked by:** 07, 09

**Status:** done

Spec: [../spec.md](../spec.md)

- [x] The library-list script computes, from the open and merged PRs into `main` that touch the shared skills folder or use the lab template: the name, fix level, what it catches, tools passed (from `TESTS.md`'s ticked columns), and open or merged. It shows no names, publishes through the data branch, and is tested at seam 2.
- [x] The action-plan README template and the row-draft template, as in the Day 2 sketch. The deck's grid fills from merged row drafts through the same publish path.
- [x] The lab handout, the lab PR template with the finished-output checklist, and the `TESTS.md` template.
- [x] The library-list and grid views are tested from fixtures (seam 1).

## Done

22 Oct 2026. Nothing is committed. `pnpm exec turbo run build typecheck test --filter=@workshop/deck --filter=@workshop/scripts` is green: 4 of 4 tasks, with 80 deck tests and 117 script tests.

### The library list

- **The script:** `scripts/library-list.mjs`. Coaches run it during the lab with `node scripts/library-list.mjs --watch 30`.
- **What counts as a lab PR:** an open or merged PR into `main` that touches `.agents/skills/<name>/`, or that uses the lab template. The template is recognised by its `<!-- lab-pr -->` marker or a `## Fix level` heading. Closed PRs and PRs into other bases are left out.
- **What each entry holds:**
  - `name`: the skill folder (a newly added one first), or the PR title for anything else.
  - `kind`: `skill` or `fix`.
  - `fixLevel`: the ticked box in the PR's Fix level section, or failing that the first level word in its first written line. A skill PR without one gets `skill`.
  - `catches`: for a skill, the first line of its description. For anything else, the PR's "What it catches" line.
  - `toolsPassed`: the TESTS.md columns where every "Should fire" row is ✅, with at least 3 rows.
  - `state`, `pr` and `openedAt`.
  - No author and no owner. A test checks this.
- **The order:** by PR number, which is the order the PRs were opened.
- **Which PRs it reads:** by default only PRs opened today, so a coach's Day 1 fix to a skill stays off the screen. `--since <time>` or `--since all` changes that.
- **The GitHub adapter:** `scripts/lib/github.mjs` gained `pullRequests({ base })`, `pullRequestFiles(n)` and `fileAt(path, ref)` (raw contents, `null` on a 404), in both `liveGitHub` and `recordedGitHub`. The existing methods are unchanged. For the token, the CLI takes `GH_TOKEN`, then `GITHUB_TOKEN`, then `gh auth token`, because the repo is private.
- **Caching:** within a `--watch` run, a PR's files and its SKILL.md and TESTS.md are read once per head commit.

### Publishing (both scripts)

- **The shared helper:** `scripts/lib/live-doc.mjs` holds `publishDoc` and `ensureDataCheckout`.
  - It caps strings and validates against the document's schema, so a document that doesn't validate is never written.
  - It writes `<name>.json` at the root of the data checkout and commits with the reporter's `commitAndPush`, which is reused and not edited.
  - It commits only when the content changed, so `updatedAt` is the time of the last change.
  - It pulls before comparing. When nothing changed but a commit made offline is still local, it pushes that commit.
- **The schemas:** `scripts/schemas/library.schema.json` and `scripts/schemas/action-plan.schema.json`.
- **The checkout:** the default is `.live/publish/`, a detached worktree of `live-deck-data` that's created on the first run. It's gitignored through `.live/`, and kept apart from the deck's synced `.live/data/` so the two never share an index.

### The action plan

- **The templates:**
  - `docs/action-plan/README.md` is the sketch's plan template. It adds a comment on how it gets filled and a link to `route.md`.
  - `docs/action-plan/row-template.md` is the row-draft template. Groups copy it to `<thread>.md`.
- **The script:** `scripts/action-plan.mjs` (`node scripts/action-plan.mjs --watch 15`).
  - It fetches `origin/main`, so a merge on GitHub is enough.
  - It reads `route.md`, `context.md`, `skills.md` and `checks.md`: the drafting group (`group-<x>` from the heading), and up to 3 quick-win and 3 longer-step candidates as item and why, skipping the template's placeholders.
  - It also reads the vote's winners from the README grid. It never reads the owner or review columns.
  - It publishes `action-plan.json` the same way as the library list.
- **The route row:** a coach types it as `route.md` in the same shape, or puts only its winners in the README grid.

### The lab kit

- **The handout:** `docs/skill-lab.md`, from the sketch. It adds a "Prove it" step and the PR command, and says that the open-pr skill can open the PR. The open-pr skill already fills a lab PR's body from `lab.md` with `--body-file`.
- **The PR template:** `.github/PULL_REQUEST_TEMPLATE/lab.md`.
  - It has the marker, "What it catches", the Fix level as six tick boxes plus "Why not higher", Proof, Owner, and the full finished-output checklist.
  - The untouched template parses as "no fix level" and "no catch line". A test checks this.
- **The TESTS.md template:** `docs/tests-md-template.md`, with the owner line, the should-fire and should-not-fire tables (three tool columns), and the with/without line. The untouched template passes no tool.

**How GitHub picks between the two PR templates:**

- **The default:** GitHub pre-fills `.github/pull_request_template.md` (ticket 06's template) whenever no template is named. This holds on the compare page and in `gh pr create`.
- **The lab template:** it's used only when named, with `?template=lab.md` on the compare URL (together with `quick_pull=1`) or `gh pr create --template lab.md`. GitHub shows no picker for PR templates.
- **The default branch:** templates are read from the default branch only (`main`), whatever the PR's base. Group PRs on Day 1 therefore also get `main`'s default template.
- **Interactive `gh`:** with two templates, `gh pr create` asks which one to use when it runs interactively without `--body`. The open-pr skill always passes `--body-file`, so it isn't affected.

### The deck views

- **The view models:** `apps/deck/src/live/library.ts` (`libraryList`, `toolsOf`) and `apps/deck/src/live/plan.ts` (`planGrid`, `withWinner`). They're pure. The plugin only checks that `docs.*` parses, so they drop anything that isn't the expected shape rather than throw.
- **The library list view:**
  - Each row shows `#pr`, the name, the fix level, what it catches, and the tool chips in a fixed order (Claude Code, Codex, Copilot, then any extra tool), lit where the tool passed. A fix shows "no trigger tests".
  - The open or merged badge reuses `.rac-status`, `.rac-pr-*` and `.rac-threads`.
- **The action-plan grid:**
  - It always shows four rows, with "waiting for the draft" until a row is filled.
  - After the vote, the winners stay bright and the other candidates fade.
  - A winner typed a little differently still marks its candidate. One that matches none is shown as typed.
  - A `draftedBy` that isn't `group-<x>` (a person's name, say) is dropped.
- **The components:** `LibraryList.vue` and `LibraryListView.vue`, and `ActionPlanGrid.vue` and `ActionPlanGridView.vue`. Strings render only through `{{ }}`.
- **Styles:** `apps/deck/styles/day2.css`, plus one import line in `styles/index.ts`.
- **Slides:** ticket 16 places `<LibraryList />` and `<ActionPlanGrid />`.
- **Checked by eye:** I rendered both views from the fixtures in Chrome, off the deck. They hold 5 lab PRs and the four plan rows within the 1000 × 562 canvas.

### Tests

- **Seam 2:**
  - `scripts/test/library-list.test.mjs` (17 tests) runs against recorded GitHub data and a throwaway bare remote. It covers:
    - the filtering and order
    - every field
    - no names
    - the cache
    - both templates' parsing
    - publishing, commit-only-on-change, and pushing a commit made offline
    - the live adapter's new methods against GitHub-shaped REST responses, including pagination and the raw 404
  - `scripts/test/action-plan.test.mjs` (9 tests) runs against a throwaway repo with a bare remote. A row PR merged on the remote reaches the grid through `refreshPlan`. It also covers the grid's order, the placeholders, capping at 3, the winners without owners, and no commit on an unchanged main.
- **Seam 1:**
  - `apps/deck/test/day2.test.ts` covers the view models and checks the fixtures against both schemas.
  - `apps/deck/test/Day2Views.test.ts` checks that hostile strings render as text, plus the lit tools, the states, the winners, the waiting rows and the empty states.
- **The fixtures:** `scripts/test/fixtures/day2/library.json` and `action-plan.json` are shared. The script tests assert that the scripts produce exactly these, and the deck tests read the same files.
- **The spoiler rule:** the fixtures and templates use generic tooling topics only. A grep of every new file for the coach notes' planted terms is clean.

### Open

- **Not run against the real repo.** This machine has no `gh` and no git credentials, and the repo is private. Run both scripts with `--no-push` in the dry run.
- **No pnpm aliases** in the root `package.json` (for example `day2:library` and `day2:plan`). It's a shared file, so I left it alone.
- **The agenda's run-sheet** should start `library-list --watch` at 10:00 and `action-plan --watch` at 11:37, next to `pnpm live:sync`.
