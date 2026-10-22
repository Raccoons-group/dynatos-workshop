# Coding agents in GitHub Actions: running the reporter skill on group PRs

Research for [issue 07](../issues/07-coding-agents-in-github-actions.md). Researched 2026-10-20. I used primary sources only: vendor READMEs and `action.yml` files on GitHub, code.claude.com, platform.claude.com, learn.chatgpt.com (the Codex docs; `developers.openai.com/codex/*` now redirects there), docs.github.com, the GitHub Agentic Workflows docs on github.github.com, and vercel.com. Every claim links its source. The full source list is at the bottom.

**About the numbers.** No vendor publishes typical latency for these runners. Rows marked *estimate* are my own arithmetic from the published prices and a guessed run shape. They are not sourced facts. The [live-deck pipeline spike (#15)](../issues/15-live-deck-pipeline-spike.md) should measure them.

**Versions checked on 2026-10-20**

| Component | Version | Source |
| - | - | - |
| `anthropics/claude-code-action` | v1.0.254 (2026-10-19), major tag `v1` | [releases](https://github.com/anthropics/claude-code-action/releases) |
| Claude Code CLI (`@anthropic-ai/claude-code`) | 2.1.304 (2026-10-19) | [releases](https://github.com/anthropics/claude-code/releases), [npm](https://www.npmjs.com/package/@anthropic-ai/claude-code) |
| Claude Agent SDK, TypeScript | 0.3.304 (2026-10-19) | [releases](https://github.com/anthropics/claude-agent-sdk-typescript/releases) |
| `openai/codex-action` | v1.13 (2026-10-05), major tag `v1` | [releases](https://github.com/openai/codex-action/releases) |
| Codex CLI (`@openai/codex`) | 0.163.0 (2026-10-15) | [releases](https://github.com/openai/codex/releases), [npm](https://www.npmjs.com/package/@openai/codex) |
| GitHub Copilot CLI (`@github/copilot`) | 1.0.100 | [npm](https://www.npmjs.com/package/@github/copilot) |
| GitHub Agentic Workflows (`gh-aw`) | v0.92.6 (2026-10-20), public preview | [releases](https://github.com/github/gh-aw/releases), [GitHub Docs](https://docs.github.com/en/copilot/concepts/agents/about-github-agentic-workflows) |
| Models | `claude-sonnet-5-5`, `claude-haiku-5-5`, `claude-opus-5-5` | [models overview](https://platform.claude.com/docs/en/about-claude/models/overview) |

---

## TL;DR

- **Use `anthropics/claude-code-action@v1` in automation mode on `pull_request`, and use the same skill through `claude -p` on a laptop as the fallback.** The action runs a repo skill when you pass `/skill-name` as the `prompt` after `actions/checkout` ([Claude Code docs](https://code.claude.com/docs/en/github-actions#run-a-skill)). With `--json-schema` it returns validated JSON as the `structured_output` step output ([usage.md](https://github.com/anthropics/claude-code-action/blob/main/docs/usage.md#structured-outputs)). On pull requests it restores `.claude/` and `CLAUDE.md` from the base branch before Claude starts, so a group's PR can't swap out the reporter skill ([security.md](https://github.com/anthropics/claude-code-action/blob/main/docs/security.md#which-files-come-from-the-base-branch-on-pull-requests)).
- **Codex and Copilot don't fit this job.** `openai/codex-action` needs an OpenAI (or Azure OpenAI) key, and we only have an Anthropic key ([README](https://github.com/openai/codex-action#codex-github-action)). Copilot cloud-agent automations can fire on "PR opened/synchronized" and they load repo skills. But they need a Copilot plan and a private or internal repo, they are private to the user who creates them, they aren't versioned in git, and they write back as branches and PRs whose workflows need human approval ([automations](https://docs.github.com/en/copilot/concepts/agents/cloud-agent/about-automations), [risks](https://docs.github.com/en/copilot/concepts/agents/cloud-agent/risks-and-mitigations)).
- **Separate the agent from the write.** The agent job holds the API key, `contents: read` and no shell or write tools, and it only emits JSON. A second, deterministic job with `contents: write` and no API key commits that JSON. Both the Codex docs and GitHub Agentic Workflows ("safe outputs") recommend this pattern ([Codex non-interactive](https://learn.chatgpt.com/docs/non-interactive-mode), [gh-aw](https://docs.github.com/en/copilot/concepts/agents/about-github-agentic-workflows#security-guardrails)).
- **Write to a dedicated data branch, never to the groups' PR branches.** Use one file per group, and serialise writers with `concurrency: { group: live-deck-data, queue: max }`. Without `queue: max`, GitHub cancels all but one pending run in a concurrency group, which would silently drop updates when three groups push at once ([concurrency docs](https://docs.github.com/en/actions/how-tos/write-workflows/choose-when-workflows-run/control-workflow-concurrency)). Pushes made with `GITHUB_TOKEN` don't trigger new workflow runs, so there's no feedback loop ([trigger docs](https://docs.github.com/en/actions/how-tos/write-workflows/choose-when-workflows-run/trigger-a-workflow)).
- **Watch two hard limits.** First, a `pull_request` workflow does not run at all while the PR has a merge conflict ([events docs](https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows#pull_request)). Three groups changing the same case app will hit this unless ticket 13 keeps their bases apart. Second, anyone with write access can read every repo secret ([secure use](https://docs.github.com/en/actions/reference/security/secure-use#use-secrets-for-sensitive-information)). Treat the Anthropic key as visible to all eleven participants: use a dedicated, spend-limited workspace key or workload identity federation.

---

## 1. Comparison table

| | **`anthropics/claude-code-action@v1`** | **Claude Code headless (`claude -p`) / Agent SDK in a `run:` step** | **`openai/codex-action@v1`** | **GitHub Copilot cloud agent (formerly "coding agent") + automations** |
| - | - | - | - | - |
| **What it is** | A composite action that installs Bun and Claude Code, then runs Claude Code through the Agent SDK ([action.yml](https://github.com/anthropics/claude-code-action/blob/main/action.yml), [docs](https://code.claude.com/docs/en/github-actions)) | The CLI or SDK you install and call yourself ([headless docs](https://code.claude.com/docs/en/headless)) | Installs the Codex CLI and runs `codex exec` behind a Responses API proxy ([README](https://github.com/openai/codex-action)) | GitHub-hosted agent sessions on an Actions-powered environment ([about](https://docs.github.com/en/copilot/concepts/agents/coding-agent/about-coding-agent), [environment](https://docs.github.com/en/copilot/how-tos/copilot-on-github/customize-copilot/customize-cloud-agent/customize-the-agent-environment)) |
| **Triggers** | Any event. A `prompt` input selects automation mode, which runs with no `@claude` mention. Docs include a `pull_request` (`opened, synchronize, ready_for_review, reopened`) example that runs a skill ([docs](https://code.claude.com/docs/en/github-actions#interactive-and-automation-modes)) | Any event; it's a plain shell step | Any event. The docs' examples use `pull_request` ([GitHub Action docs](https://learn.chatgpt.com/docs/github-action)) | Automation triggers: a schedule, issue created, **PR opened**, **PR synchronized**, with optional search and changed-file filters. Ad hoc runs start from `@copilot` or the agents panel ([automations](https://docs.github.com/en/copilot/concepts/agents/cloud-agent/about-automations#triggers), [about](https://docs.github.com/en/copilot/concepts/agents/coding-agent/about-coding-agent)) |
| **Same-repo branch PRs** | Work. The triggering user needs write access, and bot actors are rejected unless you list them in `allowed_bots` ([docs](https://code.claude.com/docs/en/github-actions#who-can-trigger-runs)) | Work. There's no built-in actor check, so you add `if:` conditions yourself | Work. The action has a built-in write-access check, with `allow-users` and `allow-bot-users` to widen it ([security.md](https://github.com/openai/codex-action/blob/main/docs/security.md)) | Work. Automations ignore events from users without write access by default ([automations](https://docs.github.com/en/copilot/concepts/agents/cloud-agent/about-automations#security-and-safety)) |
| **Fork PRs** | On `pull_request`, secrets are withheld from fork PRs, so it can't authenticate ([docs](https://code.claude.com/docs/en/github-actions#run-a-skill), [events](https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows#workflows-in-forked-repositories)). `pull_request_target` gets the secrets. Its docs say never to check out the PR head at the workspace root before the action, and the actor check still blocks non-writers ([security.md](https://github.com/anthropics/claude-code-action/blob/main/docs/security.md#using-this-action-with-pull_request_target-or-workflow_run)) | The same GitHub rules apply ([events](https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows#workflows-in-forked-repositories)), but you get none of the action's protections (see the security notes) | The same GitHub rules apply. The docs list PR bodies, commit messages and `AGENTS.md` from PR content as untrusted input ([security.md](https://github.com/openai/codex-action/blob/main/docs/security.md#defending-against-untrusted-input)) | Not configurable as a workflow trigger. Non-writer events are ignored by default ([automations](https://docs.github.com/en/copilot/concepts/agents/cloud-agent/about-automations#security-and-safety)) |
| **Secrets** | `ANTHROPIC_API_KEY`, a `CLAUDE_CODE_OAUTH_TOKEN`, or workload identity federation (no static key) ([docs](https://code.claude.com/docs/en/github-actions#manual-setup), [setup.md](https://github.com/anthropics/claude-code-action/blob/main/docs/setup.md#workload-identity-federation)) | `ANTHROPIC_API_KEY` in the step env. Bare mode never reads OAuth credentials ([headless](https://code.claude.com/docs/en/headless#start-faster-with-bare-mode)) | `OPENAI_API_KEY` or `AZURE_OPENAI_API_KEY` ([README](https://github.com/openai/codex-action)). **We don't have one** | No API key. Needs a Copilot Pro, Pro+, Max, Business or Enterprise plan. Usage is billed to the user who created the automation ([automations](https://docs.github.com/en/copilot/concepts/agents/cloud-agent/about-automations#availability-and-permissions)) |
| **Workflow permissions** | `id-token: write` for the default Claude GitHub App auth, or pass `github_token` to skip the app ([FAQ](https://github.com/anthropics/claude-code-action/blob/main/docs/faq.md#why-am-i-getting-oidc-authentication-errors)). Plus whatever `contents`, `pull-requests` and `issues` scopes the job needs ([docs](https://code.claude.com/docs/en/github-actions#run-a-skill)) | Whatever you grant `GITHUB_TOKEN` | `contents: read` in the agent job, with writes in a separate job ([README example](https://github.com/openai/codex-action#example-create-your-own-pull-request-bot)) | Configured in the UI by picking tools. The repo must be private or internal ([automations](https://docs.github.com/en/copilot/concepts/agents/cloud-agent/about-automations#tools-and-actions)) |
| **How it writes results back** | Results go to the run log by default. It posts PR comments only when the prompt asks and it has a posting tool ([docs](https://code.claude.com/docs/en/github-actions#interactive-and-automation-modes)). It can push commits to an open PR's branch ([FAQ](https://github.com/anthropics/claude-code-action/blob/main/docs/faq.md#why-did-claude-create-a-new-branch-when-commenting-on-a-closed-pr)). **`structured_output`** is a step output when `--json-schema` is set ([usage.md](https://github.com/anthropics/claude-code-action/blob/main/docs/usage.md#structured-outputs)). Other outputs: `execution_file`, `branch_name`, `session_id` ([action.yml](https://github.com/anthropics/claude-code-action/blob/main/action.yml)) | stdout. `--output-format json --json-schema` puts the data in `.structured_output` and includes `total_cost_usd` ([headless](https://code.claude.com/docs/en/headless#get-structured-output)). Later steps do any commit, comment or upload | `final-message` output, an `output-file`, and `--output-schema` for JSON ([README](https://github.com/openai/codex-action#outputs), [GitHub Action docs](https://learn.chatgpt.com/docs/github-action#capture-outputs)). Docs show posting comments from a separate job | Pushes to its own `copilot/` branch or the PR branch, opens PRs, sets labels, depending on the selected tools ([risks](https://docs.github.com/en/copilot/concepts/agents/cloud-agent/risks-and-mitigations), [automations](https://docs.github.com/en/copilot/concepts/agents/cloud-agent/about-automations#tools-and-actions)). Actions workflows on its PRs wait for human approval ([automations](https://docs.github.com/en/copilot/concepts/agents/cloud-agent/about-automations#security-and-safety)) |
| **Loads repo skills?** | **Yes.** `.claude/skills/<name>/SKILL.md`, invoked with `prompt: /name` after checkout ([docs](https://code.claude.com/docs/en/github-actions#run-a-skill)). On PRs, `.claude/`, `CLAUDE.md` and `.mcp.json` come from the **base** branch, and the PR's versions are kept under `.claude-pr/` ([security.md](https://github.com/anthropics/claude-code-action/blob/main/docs/security.md#which-files-come-from-the-base-branch-on-pull-requests)) | **Yes**, unless you pass `--bare`, which skips skill discovery except in `--add-dir` folders ([headless](https://code.claude.com/docs/en/headless#start-faster-with-bare-mode)). Include `/skill-name` in the prompt ([headless](https://code.claude.com/docs/en/headless#create-a-commit)). The SDK loads skills through `settingSources` with `'project'` ([SDK skills](https://code.claude.com/docs/en/agent-sdk/skills)) | Yes, from `.agents/skills` in each directory between the cwd and the repo root, invoked as `$skill-name` or implicitly ([Codex skills](https://learn.chatgpt.com/docs/build-skills#where-codex-loads-local-skills)). `.claude/skills` is **not** among the listed locations | Yes: `.github/skills`, `.claude/skills` or `.agents/skills` ([add skills](https://docs.github.com/en/copilot/how-tos/copilot-on-github/customize-copilot/customize-cloud-agent/add-skills)). Automations inherit the repo's skills and instructions ([automations](https://docs.github.com/en/copilot/concepts/agents/cloud-agent/about-automations#configuration-inherited-from-the-repository)) |
| **Typical latency per run** | *Estimate*: about 1.5–4 minutes from push to data on the branch (breakdown in §2.4). The action installs Bun 1.3.14 and Claude Code on every run, which adds setup time ([action.yml](https://github.com/anthropics/claude-code-action/blob/main/action.yml)) | *Estimate*: a little faster than the action (one `npm i -g`, no Bun) | *Estimate*: similar to the action | Not published. Sessions are capped at 59 minutes ([about](https://docs.github.com/en/copilot/concepts/agents/coding-agent/about-coding-agent#agentic-work)) |
| **Cost per run** | API tokens plus Actions minutes ([docs](https://code.claude.com/docs/en/github-actions#manage-costs)). *Estimate* for the reporter: about $0.10–0.50 on Sonnet 5.5, a few cents on Haiku 5.5 (§2.5) | The same tokens. `--max-budget-usd` caps spend and `total_cost_usd` reports it ([CLI reference](https://code.claude.com/docs/en/cli-reference), [headless](https://code.claude.com/docs/en/headless#pipe-data-through-claude)) | OpenAI API pricing ([Codex pricing](https://learn.chatgpt.com/docs/pricing)) plus Actions minutes | GitHub AI Credits (1 credit = $0.01) plus Actions minutes, billed to the automation's creator ([automations](https://docs.github.com/en/copilot/concepts/agents/cloud-agent/about-automations#billing), [Copilot billing](https://docs.github.com/en/billing/concepts/product-billing/github-copilot-billing)) |
| **Failure modes** | Non-writer or bot actor → the run fails ([docs](https://code.claude.com/docs/en/github-actions#who-can-trigger-runs)). Bash is off by default ([FAQ](https://github.com/anthropics/claude-code-action/blob/main/docs/faq.md#why-doesnt-claude-execute-my-bash-commands)). PR clones are shallow at `--depth=20` ([FAQ](https://github.com/anthropics/claude-code-action/blob/main/docs/faq.md#why-are-my-commits-shallowmissing-history)). The structured-output failures in §2.6 also apply | `-p` starts in Manual mode on 2.1.302+, so unapproved tool calls are denied ([headless](https://code.claude.com/docs/en/headless#auto-approve-tools)). Repo hooks, `.mcp.json` and skill `allowed-tools` all run without a trust prompt ([permissions](https://code.claude.com/docs/en/permissions#what-runs-before-you-trust-a-folder)) | `drop-sudo` is irreversible for the job, so the action must be the last step that needs sudo ([README](https://github.com/openai/codex-action#safety-strategy)). Windows needs `safety-strategy: unsafe` | Blocked by incompatible rulesets. One branch and one PR per task. Workflows on its PRs need approval ([about](https://docs.github.com/en/copilot/concepts/agents/coding-agent/about-coding-agent#repository-compatibility), [risks](https://docs.github.com/en/copilot/concepts/agents/cloud-agent/risks-and-mitigations)) |
| **Fit for the live deck** | **Best fit**: Raccoons key, repo skill, JSON out, base-branch config | **Best for the local fallback**, and a leaner CI variant if we replicate the protections | No (no OpenAI key, and we'd need `.agents/skills`) | No (needs a Copilot plan, isn't versioned, and writes back as PRs) |

### Also considered (not in the brief)

- **Copilot CLI inside a workflow (`copilot -p`).** It authenticates with `GITHUB_TOKEN` plus `copilot-requests: write` and bills the organisation's Copilot plan. GitHub warns that running it directly in steps "gives it broad access to your workflow environment" and that fork-triggered workflows are particularly at risk ([use Copilot CLI in Actions](https://docs.github.com/en/copilot/how-tos/copilot-cli/use-copilot-cli-in-actions)). It still needs a Copilot plan.
- **GitHub Agentic Workflows (`gh-aw`, public preview).** You write Markdown workflows that compile to `.lock.yml`. The agent runs read-only, and writes happen only through declared "safe outputs" in a separate job ([GitHub Docs](https://docs.github.com/en/copilot/concepts/agents/about-github-agentic-workflows), [safe outputs](https://github.github.com/gh-aw/reference/safe-outputs/)). It supports `engine: claude` with `ANTHROPIC_API_KEY` or Anthropic workload identity federation ([engines](https://github.github.com/gh-aw/reference/engines/)). It even has an `upload-asset` safe output that writes to an orphan branch ([safe outputs](https://github.github.com/gh-aw/reference/safe-outputs/)). The architecture matches what I recommend below. It adds a compile step and a preview-stage tool four days before the workshop, so I'd copy the pattern by hand rather than adopt the tool.

---

## 2. Recommended pipeline for the live deck

### 2.1 Shape

```
group pushes to its PR branch
  └─► workflow "live-deck-reporter" (on: pull_request, same-repo branches only)
        job report   [contents: read, ANTHROPIC_API_KEY]   concurrency: per PR, cancel-in-progress
          1. checkout (merge ref), build .reporter-input/ (diff, diffstat, working-out paths)
          2. claude-code-action  prompt: /reporter …   --json-schema <schema from BASE>
          3. output: structured_output (JSON string, < 1 MB)
        job publish  [contents: write, NO API key]          concurrency: live-deck-data, queue: max
          4. checkout branch live-deck-data
          5. write groups/<group>.json (+ history/<group>/<ts>-<pr>.json), commit, push with retry
deck (presenter laptop) ◄── sync loop: fetch live-deck-data every ~10 s ◄── origin/live-deck-data
```

### 2.2 Where the structured data lives

**An orphan branch `live-deck-data`**, created once by a coach. It holds:

- `groups/<group>.json`: the latest report per group, overwritten on each run. One file per group means concurrent writers never touch the same file, so a `git pull --rebase` retry always succeeds.
- `history/<group>/<UTC-timestamp>-<pr>.json`: append-only snapshots. The overnight retrospective reads these.
- The schema lives with the skill, in `.claude/skills/reporter/schema.json` on `main`. CI reads it from the **base** commit and passes it to `--json-schema`. The deck imports the same file to validate what it renders, so there's one source of truth.

Why not the other write-back targets:

| Option | Verdict | Reason |
| - | - | - |
| Commit to the group's PR branch | ✗ | It races with the group's own pushes (they'd hit non-fast-forward rejections mid-exercise) and pollutes their diff. With an App or PAT token it would also re-trigger the workflow. `GITHUB_TOKEN` pushes don't trigger runs ([trigger docs](https://docs.github.com/en/actions/how-tos/write-workflows/choose-when-workflows-run/trigger-a-workflow)), but the race remains |
| Commit to `main` | ✗ | It makes every open group PR out of date. A `pull_request` workflow doesn't run while the PR has a merge conflict ([events docs](https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows#pull_request)) |
| Contents API `PUT` per file | ~ | Works per file, but GitHub says concurrent create/update and delete calls conflict and must be serialised ([contents API](https://docs.github.com/en/rest/repos/contents)). You'd need the same serialisation anyway, with less visibility than a git log |
| Sticky PR comment | Complement | No races, and the group sees feedback in its PR. The deck would have to poll the comments API per PR. Worth adding as a human-readable echo (needs `pull-requests: write`) |
| Workflow artifact | Complement | Use it for audit and debug (the full transcript or `execution_file`). It's poor for live display because a download needs API auth and an unzip |
| Pages or Vercel redeploy | Only for remote viewers | It adds a build per update. Pages sites from private repos are public unless you have Enterprise Cloud ([Pages visibility](https://docs.github.com/en/pages/getting-started-with-github-pages/changing-the-visibility-of-your-github-pages-site)). Private-repo Pages needs a paid plan ([what is Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages)). Vercel deploy hooks allow 60 triggers per hour per project ([Vercel](https://vercel.com/docs/deploy-hooks)) |
| `repository_dispatch` | Glue only | Use it if a hosted deck must redeploy. `GITHUB_TOKEN` *can* trigger `repository_dispatch` and `workflow_dispatch` ([trigger docs](https://docs.github.com/en/actions/how-tos/write-workflows/choose-when-workflows-run/trigger-a-workflow)), and the target workflow must be on the default branch ([events docs](https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows#repository_dispatch)) |

### 2.3 How the deck picks it up

The deck runs on the presenter's laptop as the turborepo dev server, since the workshop is in one room. A small `live:sync` script keeps a local worktree of `live-deck-data` fresh, roughly `git -C .live-data pull --ff-only` every 10 s. The deck then watches or polls `.live-data/groups/*.json`. That fits ticket 09's test of "renders data from a JSON file and updates when that file changes". This keeps:

- **Tokens out of the browser.** For a private repo, polling GitHub directly from the page would need a token in client code.
- **Rate limits a non-issue.** If you poll the REST API instead (for example from a remote viewer), use authenticated conditional requests with `If-None-Match`. A `304` doesn't count against the 5,000/h limit ([best practices](https://docs.github.com/en/rest/using-the-rest-api/best-practices-for-using-the-rest-api#use-conditional-requests)). Unauthenticated access is only 60/h and public data only ([rate limits](https://docs.github.com/en/rest/using-the-rest-api/rate-limits-for-the-rest-api)).
- **The fallback identical.** A coach running the reporter locally writes the same file path (§5), so the deck can't tell the difference.

If participants should also see the deck on their own laptops, add a third job that builds and deploys to Pages with `actions/deploy-pages` (`pages: write`, `id-token: write`) ([custom Pages workflows](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)). A custom Actions workflow isn't subject to the 10-builds-per-hour soft limit ([Pages limits](https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits)).

### 2.4 Latency budget (*estimate*, to be measured in #15)

| Stage | Estimate | Notes |
| - | - | - |
| PR event → runner picks up `report` | 5–30 s | GitHub-hosted queueing |
| Checkout + prep | 5–15 s | `fetch-depth: 0` on a small repo |
| Action setup (Bun, deps, Claude Code install) | 20–45 s | Every run installs Bun 1.3.14 and Claude Code ([action.yml](https://github.com/anthropics/claude-code-action/blob/main/action.yml)) |
| Agent run (`/reporter`, Sonnet 5.5, 5–15 turns) | 30–120 s | Bounded by `--max-turns`. Haiku 5.5 is the "fastest" tier ([models](https://platform.claude.com/docs/en/about-claude/models/overview)) |
| `publish` job (new runner, checkout, push) | 15–40 s | Serialised; queues if two groups land together |
| Deck sync interval | 0–10 s | |
| **Total** | **~1.5–4 min** | Inside the "within a few minutes" goal, but measure it |

### 2.5 Cost (*estimate*)

Prices from [platform pricing](https://platform.claude.com/docs/en/about-claude/pricing), per million tokens: Sonnet 5.5 costs $2 input, $10 output, $2.50 for a 5-minute cache write and $0.10 for a cache hit. Haiku 5.5 costs $0.10 input and $0.50 output (prompts up to 100k tokens). Opus 5.5 costs $4 input and $20 output. Models from 4.7 onward use a tokenizer that produces about 30% more tokens for the same text (same page).

Assumed reporter run: about 40k uncached input, 40k cache writes, 300k cache reads across turns, and 5k output. That works out to about $0.08 + $0.10 + $0.03 + $0.05 ≈ **$0.25 on Sonnet 5.5** (range $0.10–0.50), or about **$0.02 on Haiku 5.5**. For Day 1 at roughly 3 groups × 8–10 pushes, that's about 25–30 runs, or **≈ $3–15** on Sonnet. Cap each run with `--max-budget-usd 1` and read real spend from `total_cost_usd` in local runs ([headless](https://code.claude.com/docs/en/headless#pipe-data-through-claude)). Actions minutes are free on a public repo and come out of the plan's quota on a private one (2,000 min/month on GitHub Free for organisations) ([Actions billing](https://docs.github.com/en/billing/concepts/product-billing/github-actions)).

### 2.6 Failure modes and concurrency (3 groups pushing at once)

| Failure | What happens | Mitigation |
| - | - | - |
| Rapid pushes on one PR | Several runs analyse stale commits | `report` uses `concurrency: reporter-pr-<n>` with `cancel-in-progress: true`, so only the latest push is analysed ([concurrency](https://docs.github.com/en/actions/how-tos/write-workflows/choose-when-workflows-run/control-workflow-concurrency)) |
| Three groups finish together | Pushes to the data branch race (non-fast-forward) | `publish` uses `concurrency: live-deck-data` with **`queue: max`** (up to 100 pending, FIFO). Under the default `queue: single`, pending runs are **cancelled** ([concurrency](https://docs.github.com/en/actions/how-tos/write-workflows/choose-when-workflows-run/control-workflow-concurrency)). Also keep one file per group and a `pull --rebase` retry loop. `queue: max` can't be combined with `cancel-in-progress: true` (same page) |
| PR has a merge conflict with its base | The `pull_request` workflow **doesn't run at all** ([events docs](https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows#pull_request)) | Ticket 13: don't merge group PRs into a shared base during Day 1, or give each group its own base branch. Fallback: run locally |
| Group works from a fork | No secrets, read-only `GITHUB_TOKEN` ([events docs](https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows#workflows-in-forked-repositories)) | Give participants write access and same-repo branches (ticket 02). Gate the job with `if: head.repo == github.repository` |
| Actor without write access, or a bot | The action stops before Claude runs ([docs](https://code.claude.com/docs/en/github-actions#who-can-trigger-runs)) | Write access for all eleven (ticket 02) |
| No valid JSON | Result subtype `error_max_structured_output_retries`, or `success` with no `structured_output` ([structured outputs](https://code.claude.com/docs/en/agent-sdk/structured-outputs)) | `publish` runs only `if: needs.report.outputs.data != ''`. The deck keeps the last good file and shows a "stale since" marker |
| Turn or budget cap hit | `--max-turns` exits with an error. `--max-budget-usd` stops the run, and spend can overshoot the cap ([CLI reference](https://code.claude.com/docs/en/cli-reference)) | Size the caps in the spike. Keep the skill focused |
| Spend limit reached | The API returns 400 "…workspace API usage limits" ([rate limits](https://platform.claude.com/docs/en/api/rate-limits)) | Set the workspace limit with headroom. Fallback: run locally with the coach's credentials |
| Huge diff (lockfiles, generated code) | Token blow-up | Prep step excludes lockfiles and truncates. The skill reads `diffstat` first |
| Job output too large | Outputs are capped at 1 MB per job ([workflow syntax](https://docs.github.com/en/actions/reference/workflows-and-actions/workflow-syntax)) | Keep the schema small, or pass the data as an artifact |
| GitHub, Actions or wifi down | Nothing updates | §5 local fallback |

---

## 3. Minimal workflow sketch

`.github/workflows/live-deck-reporter.yml` on `main`. It's a sketch for spike #15, so not run yet. Pin actions to full commit SHAs before the workshop ([secure use](https://docs.github.com/en/actions/reference/security/secure-use#using-third-party-actions)).

```yaml
name: live-deck-reporter
on:
  pull_request:
    types: [opened, synchronize, reopened, ready_for_review]

permissions: {}                       # deny by default; jobs opt in

jobs:
  report:
    # Same-repo group branches only. Fork PRs get no secrets anyway.
    if: >-
      github.event.pull_request.head.repo.full_name == github.repository &&
      startsWith(github.head_ref, 'group-')
    runs-on: ubuntu-latest
    timeout-minutes: 10
    permissions:
      contents: read
      pull-requests: read
    concurrency:
      group: reporter-pr-${{ github.event.pull_request.number }}
      cancel-in-progress: true
    outputs:
      data: ${{ steps.reporter.outputs.structured_output }}
      group: ${{ steps.prep.outputs.group }}
    steps:
      - uses: actions/checkout@v6
        with:
          fetch-depth: 0
          persist-credentials: false

      - id: prep                       # untrusted values only via env (script-injection guard)
        env:
          BASE_SHA: ${{ github.event.pull_request.base.sha }}
          HEAD_SHA: ${{ github.event.pull_request.head.sha }}
          HEAD_REF: ${{ github.head_ref }}
        run: |
          group="$(printf '%s' "${HEAD_REF%%/*}" | tr -cd 'a-z0-9-')"
          case "$group" in group-a|group-b|group-c) ;; *) echo "unknown group '$group'"; exit 1;; esac
          echo "group=$group" >> "$GITHUB_OUTPUT"
          # Same logic as scripts/reporter-input.sh, which the local fallback uses
          mkdir -p .reporter-input
          git diff --stat "$BASE_SHA...$HEAD_SHA" > .reporter-input/diffstat.txt
          git diff "$BASE_SHA...$HEAD_SHA" -- . ':(exclude)**/*lock*' | head -c 300000 > .reporter-input/diff.patch
          # The group's working-out, read as plain files (path per ticket 13)
          git archive "$HEAD_SHA" "work/$group" | tar -x -C .reporter-input || true
          # Rename nested .claude/ dirs so group-written skills are read as data, not loaded as skills
          find .reporter-input -depth -type d -name .claude -exec sh -c 'mv "$1" "$(dirname "$1")/_claude"' _ {} \;
          # Schema from BASE, so a PR can't change what the reporter must emit
          echo "schema=$(git show "$BASE_SHA:.claude/skills/reporter/schema.json" | jq -c .)" >> "$GITHUB_OUTPUT"

      - id: reporter
        uses: anthropics/claude-code-action@v1          # pin: v1.0.254 SHA
        with:
          anthropic_api_key: ${{ secrets.ANTHROPIC_API_KEY }}   # or the anthropic_federation_* inputs (no static key)
          github_token: ${{ github.token }}                     # skip the Claude GitHub App; Claude posts nothing
          prompt: /reporter group=${{ steps.prep.outputs.group }} pr=${{ github.event.pull_request.number }} input=.reporter-input
          claude_args: |
            --model claude-sonnet-5-5
            --max-turns 15
            --max-budget-usd 1
            --disallowedTools "Bash,Edit,Write,WebFetch,WebSearch"
            --json-schema '${{ steps.prep.outputs.schema }}'

  publish:
    needs: report
    if: needs.report.outputs.data != ''
    runs-on: ubuntu-latest
    timeout-minutes: 5
    permissions:
      contents: write                  # no Anthropic key in this job
    concurrency:
      group: live-deck-data
      queue: max                       # never cancel a pending write
    steps:
      - uses: actions/checkout@v6
        with:
          ref: live-deck-data          # orphan branch, created once by a coach
      - env:
          DATA: ${{ needs.report.outputs.data }}
          GROUP: ${{ needs.report.outputs.group }}
          PR: ${{ github.event.pull_request.number }}
          SHA: ${{ github.event.pull_request.head.sha }}
        run: |
          ts="$(date -u +%Y%m%dT%H%M%SZ)"
          mkdir -p groups "history/$GROUP"
          printf '%s' "$DATA" \
            | jq --arg g "$GROUP" --argjson pr "$PR" --arg sha "$SHA" --arg ts "$ts" \
                 '. + {group:$g, pr:$pr, sha:$sha, reportedAt:$ts}' > "groups/$GROUP.json"
          cp "groups/$GROUP.json" "history/$GROUP/$ts-$PR.json"
          git config user.name  "github-actions[bot]"
          git config user.email "41898282+github-actions[bot]@users.noreply.github.com"
          git add -A && git commit -qm "live: $GROUP #$PR @ ${SHA:0:7}" || exit 0
          for i in 1 2 3 4 5; do
            git push -q origin HEAD:live-deck-data && exit 0
            git pull -q --rebase origin live-deck-data; sleep $((i * 2))
          done
          exit 1
```

Notes on the sketch:

- **Skill source.** On PR events the action restores `.claude/` from the base branch ([security.md](https://github.com/anthropics/claude-code-action/blob/main/docs/security.md#which-files-come-from-the-base-branch-on-pull-requests)). So `/reporter` is always `main`'s version, or the version on whatever base a group targets. Skill changes take effect only once they're merged into that base. If ticket 13 picks per-group base branches, the coaches must merge skill updates into each of them.
- **Tools.** Read, Grep and Glob are enough because the prep step pre-computes the diff and copies the working-out into `.reporter-input/`. In automation mode a plain prompt gets no shell or GitHub API access unless you grant it. A skill prompt, though, gets whatever its `allowed-tools` frontmatter grants ([docs](https://code.claude.com/docs/en/github-actions#run-on-a-schedule)), so keep the reporter's `allowed-tools` to `Read Grep Glob`. A bare tool name in `--disallowedTools` removes that tool from Claude's context entirely ([CLI reference](https://code.claude.com/docs/en/cli-reference)), so that line is the hard stop.
- **`github_token` vs the Claude GitHub App.** Passing `github_token` avoids installing the app, whose permission set covers more than the action uses ([docs](https://code.claude.com/docs/en/github-actions#github-app-permissions), [FAQ](https://github.com/anthropics/claude-code-action/blob/main/docs/faq.md#why-am-i-getting-oidc-authentication-errors)).
- **Re-runs.** Use "Re-run jobs" on the run page, or add `workflow_dispatch` with a PR-number input for a coach-triggered refresh.
- **Optional echo.** A third job with `pull-requests: write` can post or update a sticky comment from the same JSON so the group sees what the deck shows.
- **Headless variant of the `reporter` step.** Swap in `npm i -g @anthropic-ai/claude-code@2.1.304`, then run `claude -p "/reporter …" --output-format json --json-schema "$SCHEMA" … | jq -c .structured_output`, with `ANTHROPIC_API_KEY` set only on that step ([headless](https://code.claude.com/docs/en/headless#get-structured-output)). You then have to recreate what the action does for you: check out the **base** commit at the workspace root and put PR files in a neutral input folder. A `-p` run executes the repo's hooks, `env` block, `apiKeyHelper` and `.mcp.json` servers without any trust prompt ([permissions](https://code.claude.com/docs/en/permissions#what-runs-before-you-trust-a-folder)). It also has no actor check.

---

## 4. Security notes

1. **Use `pull_request`, not `pull_request_target`.** Same-repo branch PRs get secrets under `pull_request`. Fork PRs don't, and their `GITHUB_TOKEN` is read-only ([events docs](https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows#workflows-in-forked-repositories)). `pull_request_target` runs with base-repo secrets, and GitHub warns against it whenever PR code gets checked out or used ([events docs](https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows#pull_request_target), [secure use](https://docs.github.com/en/actions/reference/security/secure-use#mitigating-the-risks-of-untrusted-code-checkout)). We don't need forks, so we don't need it.
2. **Every participant can reach the key.** "Any user with write access to your repository has read access to all secrets configured in your repository" ([secure use](https://docs.github.com/en/actions/reference/security/secure-use#use-secrets-for-sensitive-information)). A `pull_request` run uses the PR's merge ref (`GITHUB_REF = refs/pull/N/merge`) ([events docs](https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows#pull_request)), so a PR can edit the workflow it runs. So:
   - Create a **dedicated Claude Console workspace and key** for the workshop, with a workspace **spend limit**. Requests over the limit fail with a 400 ([rate limits](https://platform.claude.com/docs/en/api/rate-limits)).
   - Delete the key in the Console afterwards. Deleting the GitHub secret alone leaves the key valid ([docs](https://code.claude.com/docs/en/github-actions#uninstall)).
   - Or use **workload identity federation**, which exchanges the GitHub OIDC token for a short-lived Anthropic token, with a federation rule matched to this repo's OIDC subject ([setup.md](https://github.com/anthropics/claude-code-action/blob/main/docs/setup.md#workload-identity-federation)). This needs Anthropic org admin rights. It removes the static key but not a PR's ability to run the federated job.
3. **Least privilege per job.** `permissions: {}` at the top. The agent job gets `contents: read` and the key. The publish job gets `contents: write` and no key. GitHub recommends read-only as the default token permission ([secure use](https://docs.github.com/en/actions/reference/security/secure-use#use-secrets-for-sensitive-information)). Both Codex's docs and GitHub Agentic Workflows describe the same split ([Codex](https://learn.chatgpt.com/docs/non-interactive-mode), [gh-aw](https://docs.github.com/en/copilot/concepts/agents/about-github-agentic-workflows#security-guardrails)).
4. **Prompt injection from PR content.** PR bodies, commit messages, instruction files and committed docs are all untrusted input ([codex-action security](https://github.com/openai/codex-action/blob/main/docs/security.md#defending-against-untrusted-input)).
   - The action strips HTML comments, invisible characters, image alt text and hidden attributes from GitHub content, but new bypasses may appear ([security.md](https://github.com/anthropics/claude-code-action/blob/main/docs/security.md)). Files Claude reads from the checkout are not sanitised.
   - The skill should frame the working-out as *data to describe, not instructions*.
   - Keep the blast radius at "wrong JSON": no shell, no writes, no web tools, and a strict schema. In the publish step, validate fields and cap string lengths.
   - The deck renders strings as text, never as HTML or MDX.
5. **Groups commit skills as part of their working-out.** Skills in a nested `<subdir>/.claude/skills/` load into the session once Claude reads files in that subdirectory ([skills](https://code.claude.com/docs/en/skills#discovery-from-parent-and-nested-directories)). A skill's `allowed-tools` isn't gated by workspace trust in `-p` runs ([skills](https://code.claude.com/docs/en/skills#pre-approve-tools-for-a-skill)). The action restores only root-level `.claude/` from base ([security.md](https://github.com/anthropics/claude-code-action/blob/main/docs/security.md#which-files-come-from-the-base-branch-on-pull-requests)). So the prep step copies the working-out into `.reporter-input/` and renames nested `.claude/` folders to `_claude/`, which means group skills are read as files and never loaded. `--disallowedTools` keeps things harmless if one gets invoked anyway.
6. **Script injection.** Never interpolate `${{ github.head_ref }}`, titles or bodies into `run:` directly. Pass them through `env:` and quote them ([secure use](https://docs.github.com/en/actions/reference/security/secure-use#good-practices-for-mitigating-script-injection-attacks), [codex-action security](https://github.com/openai/codex-action/blob/main/docs/security.md#avoid-shell-injection-in-workflow-steps)).
7. **No feedback loops.** Data pushes made with `GITHUB_TOKEN` create no workflow runs ([trigger docs](https://docs.github.com/en/actions/how-tos/write-workflows/choose-when-workflows-run/trigger-a-workflow)). Don't swap in a PAT or App token for the publish job.
8. **Logs.** Keep `show_full_output` off. It can expose secrets, and debug mode turns it on automatically ([security.md](https://github.com/anthropics/claude-code-action/blob/main/docs/security.md)). If the repo goes public, run logs are public too (same page).

---

## 5. Local fallback: the coach runs the same skill

The same `.claude/skills/reporter/` and schema, run with `claude -p` from a clean checkout of `main` on the coach's laptop. The PR is never checked out: its diff and working-out are extracted into `.reporter-input/` exactly as in CI. So the skill and schema are always `main`'s, and no PR-supplied hook or settings file is in the working tree.

```bash
# once: worktree of the data branch next to the deck
git worktree add .live-data live-deck-data

# per PR (N = PR number, G = group), from an up-to-date main
git fetch origin main "pull/$N/head"
scripts/reporter-input.sh "$(git merge-base origin/main FETCH_HEAD)" FETCH_HEAD "$G"   # same prep as CI
claude -p "/reporter group=$G pr=$N input=.reporter-input" \
  --setting-sources project \
  --model claude-sonnet-5-5 --max-turns 15 --max-budget-usd 1 \
  --disallowedTools "Bash,Edit,Write,WebFetch,WebSearch" \
  --output-format json \
  --json-schema "$(jq -c . .claude/skills/reporter/schema.json)" \
  | jq '.structured_output' > ".live-data/groups/$G.json"

# online again: publish exactly as CI does
scripts/publish-live-data.sh "$G" "$N"       # commit + push to live-deck-data with retry
```

- **Parity.** Move the CI `prep` and `publish` shell into `scripts/reporter-input.sh` and `scripts/publish-live-data.sh`, so CI and laptop run the same code. Only the agent invocation differs: the action in CI, `claude -p` locally. Both expand `/reporter` from `.claude/skills` ([headless](https://code.claude.com/docs/en/headless#create-a-commit), [docs](https://code.claude.com/docs/en/github-actions#run-a-skill)).
- **Offline.** If the wifi is down, the deck reads `.live-data/groups/*.json` directly, so a local run updates the slide with no network after the model call. The model call itself still needs internet.
- **`--setting-sources project`** keeps project skills and drops the coach's personal settings and hooks. That makes the run reproducible ([CLI reference](https://code.claude.com/docs/en/cli-reference), [SDK skills note](https://code.claude.com/docs/en/agent-sdk/skills)).
- **Don't use `--bare`.** It skips skill discovery ([headless](https://code.claude.com/docs/en/headless#start-faster-with-bare-mode)).
- **Credentials.** Locally, use the coach's own login or a key. Bare mode would require `ANTHROPIC_API_KEY` ([headless](https://code.claude.com/docs/en/headless#start-faster-with-bare-mode)), and we aren't using it.
- **Overnight retrospective.** The same mechanics with a heavier skill (for example `/retrospective`) and model (`claude-opus-5-5`, [models](https://platform.claude.com/docs/en/about-claude/models/overview)). It reads `.live-data/history/**` plus every group's working-out and writes `retrospective.json` to the data branch for the Day 2 slides. Run it locally so it isn't bound by CI timeouts or the per-run budget cap.

---

## 6. Open points for downstream tickets

- **#13 (how groups work).** Merge conflicts stop `pull_request` runs, which argues for no shared-base merges on Day 1 or for per-group base branches. Branch naming like `group-a/...` lets the workflow derive the group. If groups get their own bases, skill updates must be merged into each one.
- **#02 (repo and key).** Use a dedicated workspace key with a spend limit, or set up workload identity federation. Public vs private changes both the Actions-minutes billing ([Actions billing](https://docs.github.com/en/billing/concepts/product-billing/github-actions)) and whether logs are public.
- **#09 (deck framework).** It must re-render when a local JSON file changes. The schema is shared with the skill.
- **#06 (portability).** The reporter is coach-owned and runs on Claude, so `.claude/skills/reporter` is fine. Copilot also reads `.claude/skills`, but Codex documents only `.agents/skills` for repo skills ([Copilot](https://docs.github.com/en/copilot/how-tos/copilot-on-github/customize-copilot/customize-cloud-agent/add-skills), [Codex](https://learn.chatgpt.com/docs/build-skills#where-codex-loads-local-skills)).
- **#15 (spike).** Measure the §2.4 latency and §2.5 cost, test three simultaneous PRs against `queue: max`, and test a forced merge conflict.

## Gaps and caveats

- No vendor publishes typical latency for the action, headless runs, Codex or Copilot sessions. §2.4 is an estimate.
- Cost per run is derived from list prices and an assumed token profile, not observed.
- I didn't verify whether a `--json-schema` value containing single quotes survives `claude_args` parsing. Keep the schema free of `'`, or test it in the spike.
- I didn't verify GitHub's exact OIDC subject format for `pull_request` events when scoping a federation rule. Check it when setting up workload identity federation.
- Codex and Copilot were assessed on docs only, not run.

## Sources

Anthropic / Claude
- Claude Code GitHub Actions docs: https://code.claude.com/docs/en/github-actions
- claude-code-action `action.yml`: https://github.com/anthropics/claude-code-action/blob/main/action.yml
- claude-code-action usage.md: https://github.com/anthropics/claude-code-action/blob/main/docs/usage.md
- claude-code-action security.md: https://github.com/anthropics/claude-code-action/blob/main/docs/security.md
- claude-code-action faq.md: https://github.com/anthropics/claude-code-action/blob/main/docs/faq.md
- claude-code-action setup.md (workload identity federation): https://github.com/anthropics/claude-code-action/blob/main/docs/setup.md
- claude-code-action releases: https://github.com/anthropics/claude-code-action/releases
- Claude Code releases: https://github.com/anthropics/claude-code/releases
- Claude Agent SDK (TS) releases: https://github.com/anthropics/claude-agent-sdk-typescript/releases
- Run Claude Code programmatically (headless): https://code.claude.com/docs/en/headless
- CLI reference: https://code.claude.com/docs/en/cli-reference
- Skills: https://code.claude.com/docs/en/skills
- Agent SDK skills: https://code.claude.com/docs/en/agent-sdk/skills
- Agent SDK structured outputs: https://code.claude.com/docs/en/agent-sdk/structured-outputs
- Permissions (what runs before you trust a folder): https://code.claude.com/docs/en/permissions
- Costs: https://code.claude.com/docs/en/costs
- API pricing: https://platform.claude.com/docs/en/about-claude/pricing
- Models overview: https://platform.claude.com/docs/en/about-claude/models/overview
- API rate and spend limits: https://platform.claude.com/docs/en/api/rate-limits

OpenAI / Codex
- codex-action README: https://github.com/openai/codex-action
- codex-action security.md: https://github.com/openai/codex-action/blob/main/docs/security.md
- codex-action `action.yml`: https://github.com/openai/codex-action/blob/main/action.yml
- codex-action releases: https://github.com/openai/codex-action/releases
- Codex GitHub Action docs: https://learn.chatgpt.com/docs/github-action (redirected from developers.openai.com/codex/github-action)
- Codex non-interactive mode: https://learn.chatgpt.com/docs/non-interactive-mode
- Codex skills: https://learn.chatgpt.com/docs/build-skills
- Codex pricing: https://learn.chatgpt.com/docs/pricing
- Codex CLI releases: https://github.com/openai/codex/releases

GitHub
- About Copilot cloud agent: https://docs.github.com/en/copilot/concepts/agents/coding-agent/about-coding-agent
- Copilot automations: https://docs.github.com/en/copilot/concepts/agents/cloud-agent/about-automations
- Copilot cloud agent risks and mitigations: https://docs.github.com/en/copilot/concepts/agents/cloud-agent/risks-and-mitigations
- Adding agent skills for Copilot: https://docs.github.com/en/copilot/how-tos/copilot-on-github/customize-copilot/customize-cloud-agent/add-skills
- Customize the cloud agent environment: https://docs.github.com/en/copilot/how-tos/copilot-on-github/customize-copilot/customize-cloud-agent/customize-the-agent-environment
- Copilot billing: https://docs.github.com/en/billing/concepts/product-billing/github-copilot-billing
- Copilot CLI in Actions with GITHUB_TOKEN: https://docs.github.com/en/copilot/how-tos/copilot-cli/use-copilot-cli-in-actions
- Automating with Copilot CLI and Actions: https://docs.github.com/en/copilot/how-tos/copilot-cli/automate-copilot-cli/automate-with-actions
- GitHub Agentic Workflows: https://docs.github.com/en/copilot/concepts/agents/about-github-agentic-workflows
- gh-aw engines: https://github.github.com/gh-aw/reference/engines/
- gh-aw safe outputs: https://github.github.com/gh-aw/reference/safe-outputs/
- gh-aw releases: https://github.com/github/gh-aw/releases
- Events that trigger workflows: https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows
- Triggering a workflow (GITHUB_TOKEN rule): https://docs.github.com/en/actions/how-tos/write-workflows/choose-when-workflows-run/trigger-a-workflow
- Control concurrency (`queue: max`): https://docs.github.com/en/actions/how-tos/write-workflows/choose-when-workflows-run/control-workflow-concurrency
- Workflow syntax (output limits): https://docs.github.com/en/actions/reference/workflows-and-actions/workflow-syntax
- Secure use reference: https://docs.github.com/en/actions/reference/security/secure-use
- REST contents API: https://docs.github.com/en/rest/repos/contents
- REST best practices (conditional requests): https://docs.github.com/en/rest/using-the-rest-api/best-practices-for-using-the-rest-api
- REST rate limits: https://docs.github.com/en/rest/using-the-rest-api/rate-limits-for-the-rest-api
- Actions billing: https://docs.github.com/en/billing/concepts/product-billing/github-actions
- What is GitHub Pages: https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages
- Pages visibility: https://docs.github.com/en/pages/getting-started-with-github-pages/changing-the-visibility-of-your-github-pages-site
- Pages custom workflows: https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages
- Pages limits: https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits

Other
- Vercel deploy hooks: https://vercel.com/docs/deploy-hooks
- npm: https://www.npmjs.com/package/@anthropic-ai/claude-code, https://www.npmjs.com/package/@openai/codex, https://www.npmjs.com/package/@github/copilot
