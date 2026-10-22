# Skill and AGENTS.md portability across tools

Research for [issue 06](../issues/06-skill-and-agents-md-portability-across-tools.md). Researched 2026-10-20. I used primary sources only: vendor docs (code.claude.com, learn.chatgpt.com, docs.github.com, code.visualstudio.com, learn.microsoft.com, opencode.ai, cursor.com), changelogs, and vendor source on GitHub. `developers.openai.com/codex/*` now 308-redirects to `learn.chatgpt.com/docs/*`, so the Codex links below point there. Every table cell carries a source tag; the tags resolve in [Sources](#sources). Anything I couldn't confirm in a primary source is marked **unverified**. Two points I tested locally are marked **tested** (macOS, see [Local tests](#local-tests)).

**Versions checked on 2026-10-20**

| Tool | Version (release date) | Source |
| - | - | - |
| Claude Code | 2.1.304 (2026-10-19). Native AGENTS.md reading needs ≥ 2.1.277 (2026-09-18) | [npm][npm-cc], [CC-changelog] |
| OpenAI Codex CLI (+ IDE extension, same config layers) | 0.163.0 (2026-10-15). `.agents/skills` since Feb 2026 (PR #10317, #10437) | [npm][npm-cx], [CX-changelog] |
| GitHub Copilot CLI | 1.0.100 (2026-10-19) | [npm][npm-gh] |
| VS Code + Copilot | docs dated 2026-10-14 | [VSC-skills] |
| Visual Studio 2026 (bonus, .NET team) | skills need ≥ 18.5 | [VS-skills] |
| OpenCode | 1.19.3 (2026-10-16); docs updated 2026-10-19 | [npm][npm-oc], [OC-skills] |
| Cursor | docs undated (skills page cites Cursor 2.4) | [CUR-skills] |

---

## TL;DR

- **Every tool in scope now supports the Agent Skills `SKILL.md` format and reads `AGENTS.md`.** That includes Claude Code, which has read `AGENTS.md` natively since v2.1.277, but only when there is no `CLAUDE.md` anywhere in or above the working directory ([CC-memory]). So the one context file is a root `AGENTS.md`, and the repo must **not** contain a `CLAUDE.md` or a `.github/copilot-instructions.md`.
- **No single skills folder is read by all tools.** `.agents/skills/` is read by Codex, Copilot (CLI, VS Code, cloud agent), OpenCode and Cursor. It is **not** read by Claude Code, which reads only `.claude/skills/` ([CC-skills]). `.claude/skills/` is read by everyone except Codex ([CX-skills]). So one location plus a link is unavoidable.
- **Recommendation:** keep the canonical skills in `.agents/skills/<name>/SKILL.md` (the vendor-neutral path), and give Claude Code per-skill links in `.claude/skills/<name>`. A small Node script creates them at `postinstall`: symlinks on macOS and Linux, junctions on Windows. The links are gitignored. That avoids Windows checking committed symlinks out as text files ([GIT-config], [GFW-symlinks], [CC-memory]).
- **Write frontmatter to the strict spec subset:** `name` = folder name, `^[a-z0-9]+(-[a-z0-9]+)*$`, ≤ 64 chars, plus a `description` of ≤ 1024 chars. Extension fields (`disable-model-invocation`, `allowed-tools`, `context`, `paths`, `$ARGUMENTS`, `` !`cmd` ``) are honoured unevenly or not at all. VS Code fails *silently* on a bad name ([VSC-skills]).
- **Invocation differs per tool, so teach "ask for the skill by name".** Claude Code, Copilot and Cursor use `/name`. Codex uses `$name` or the `/skills` picker ([CX-skills]). OpenCode loads skills through its `skill` tool and exposes `/name` only with `metadata: opencode/slash: "true"` ([OC-skills]). All of them also auto-load skills from the `description`.

---

## 1. Compatibility table

### 1a. Skills: support, discovery paths, invocation

| Tool | Agent Skills `SKILL.md`? | Project paths | User paths | How a skill is invoked |
| - | - | - | - | - |
| **Claude Code** | Yes, "follow the Agent Skills open standard" [CC-skills] | `.claude/skills/<name>/`, searched from cwd up to repo root; nested `<subdir>/.claude/skills/` load when Claude works in that subdir; `--add-dir` dirs. **Not** `.agents/skills` [CC-skills] (and `.agents/` is "Not read" for instructions [CC-memory]) | `~/.claude/skills/`; managed `.claude/skills` in the managed-settings dir; plugins as `/plugin:name` [CC-skills] | `/name` (with args), or automatic when the request matches `description` [CC-skills] |
| **Codex CLI + IDE extension** | Yes, built on "the open agent skills standard" [CX-skills] | `.agents/skills/` in every directory from cwd up to repo root [CX-skills]. Legacy `.codex/skills/` "will be deprecated soon" [CX-PR10317]; it isn't in the current docs. **Not** `.claude/skills` [CX-skills] | `$HOME/.agents/skills`; admin `/etc/codex/skills`; bundled system skills [CX-skills]. Legacy `~/.codex/skills` kept "for now" [CX-PR10437] | `$name` mention or the `/skills` picker (CLI and IDE extension); implicit by `description` unless `agents/openai.yaml` sets `policy.allow_implicit_invocation: false` [CX-skills]. CLI and IDE "share the same configuration layers" [CX-config] |
| **Copilot CLI** | Yes [GH-about-skills] | Priority order: `.github/skills/`, `.agents/skills/`, `.claude/skills/`, parent `.github/skills/`. "first found wins for duplicate names" [GH-cli-ref] | `~/.copilot/skills/`, `~/.agents/skills/`, plugins, `COPILOT_SKILLS_DIRS` [GH-cli-ref]. Not `~/.claude/skills` [GH-cli-skills] | `/name`, or automatic by `description` [GH-cli-ref], [GH-cli-skills]; `/skills list\|info\|reload` |
| **Copilot in VS Code (agent mode)** | Yes; `chat.useAgentSkills` defaults to `true` [VSC-settings] | `.github/skills/`, `.claude/skills/`, `.agents/skills/` [VSC-skills]; parent repo only with `chat.useCustomizationsInParentRepositories` (default `false`) [VSC-settings] | `~/.copilot/skills/`, `~/.claude/skills/`, `~/.agents/skills/` [VSC-skills] | `/name`, or automatic by `description` [VSC-skills] |
| **Copilot cloud agent (coding agent)** | Yes [GH-cloud-skills] | `.github/skills/`, `.claude/skills/`, `.agents/skills/` [GH-cloud-skills] | n/a (runs on GitHub) | Automatic: "Copilot will decide when to use your skills based on your prompt and the skill's description" [GH-cloud-skills]. Forcing a skill by naming it in the issue is **unverified** |
| *Visual Studio 2026 ≥ 18.5 (bonus)* | Yes, "following the agentskills.io specification" [VS-skills] | `.github/skills/`, `.claude/skills/`, `.agents/skills/` [VS-skills] | `~/.copilot/skills/`, `~/.claude/skills/`, `~/.agents/skills/` [VS-skills] | Automatic in agent mode [VS-skills] |
| **OpenCode** | Yes [OC-skills] | `.opencode/skills/`, `.claude/skills/`, `.agents/skills/`, walking up from cwd to the git worktree [OC-skills] | `~/.config/opencode/skills/`, `~/.claude/skills/`, `~/.agents/skills/` [OC-skills] | Model calls the `skill` tool from `<available_skills>`; `/name` only with `metadata: opencode/slash: "true"` [OC-skills] |
| **Cursor** | Yes [CUR-skills] | `.agents/skills/`, `.cursor/skills/`, plus "for compatibility" `.claude/skills/`, `.codex/skills/`; also nested anywhere in the repo, scoped to that subtree [CUR-skills] | `~/.agents/skills/`, `~/.cursor/skills/`, `~/.claude/skills/`, `~/.codex/skills/` [CUR-skills] | `/` menu (attaches to one message), or automatic by relevance [CUR-skills], [CUR-cli] |

### 1b. Frontmatter fields honoured

Spec fields ([SPEC]): `name` (required, ≤ 64, lowercase alnum and single hyphens, must equal the folder name), `description` (required, ≤ 1024), `license`, `compatibility` (≤ 500), `metadata` (string → string map), and `allowed-tools` (experimental, space-separated).

| Tool | Honoured | Notes |
| - | - | - |
| **Claude Code** | `name` (optional, defaults to dir), `description`, `when_to_use`, `argument-hint`, `arguments`, `disable-model-invocation`, `user-invocable`, `allowed-tools`, `disallowed-tools`, `model`, `effort`, `context: fork`, `agent`, `background`, `hooks`, `paths`, `shell` [CC-skills] | Accepts `license`, `compatibility` and `metadata` "but doesn't act on them". Unknown fields are ignored without error. `description` + `when_to_use` are truncated at 1,536 chars in the listing [CC-skills] |
| **Codex** | `name` (≤ 64, defaults to dir name), `description` (required, non-empty), `metadata.short-description` [CX-parser]. Plus optional `agents/openai.yaml`: `interface.*`, `policy.allow_implicit_invocation`, `dependencies.tools` [CX-skills] | The parser struct has only those three fields, so the rest are ignored (my reading of [CX-parser]). There's no description-length check in the current parser. Whitespace is collapsed to a single line [CX-parser] |
| **Copilot CLI** | `name` (required, ≤ 64; also allows `_ . :` and spaces), `description` (required, ≤ 1024), `argument-hint`, `allowed-tools` (comma list or YAML array, `"*"` = all), `user-invocable`, `disable-model-invocation` [GH-cli-ref]; `license` [GH-cli-skills] | Its name rules are looser than the spec, so stick to the spec |
| **Copilot in VS Code** | `name` (required, lowercase/digits/hyphens, ≤ 64, must match folder: "Invalid names cause silent load failure"), `description` (≤ 1024), `argument-hint`, `user-invocable`, `disable-model-invocation`, `context: fork` (experimental) [VSC-skills] | `license`, `compatibility`, `metadata` and `allowed-tools` aren't documented. The 1.107 notes said `allowed-tools` isn't supported (**unverified**, search summary only) |
| **Copilot cloud agent** | `name` ("lowercase, using hyphens for spaces"), `description`, `license`, `allowed-tools` [GH-cloud-skills] | The docs warn against pre-approving `shell`/`bash` [GH-cloud-skills] |
| **OpenCode** | `name` (regex `^[a-z0-9]+(-[a-z0-9]+)*$`, = dir), `description` (1–1024), `license`, `compatibility`, `metadata` incl. `opencode/slash`, `opencode/autoinvoke` [OC-skills] | "Put OpenCode-specific behavior in `metadata` instead of adding custom top-level fields" [OC-skills] |
| **Cursor** | `name` (lowercase/digits/hyphens, = folder), `description`, `paths`, `disable-model-invocation`, `icon`, `color`, `metadata` [CUR-skills] | `license` and `compatibility` aren't documented |

### 1c. Project context files

| Tool | `AGENTS.md` | `CLAUDE.md` | `.github/copilot-instructions.md` | Nested files below cwd |
| - | - | - | - | - |
| **Claude Code** | Yes, since v2.1.277, **only if** no `CLAUDE.md`, `.claude/CLAUDE.md` or `CLAUDE.local.md` exists in cwd or any parent. Reads every `AGENTS.md` and `.claude/AGENTS.md` from cwd upward at start. Expands `@path` imports [CC-memory] | Yes: the primary file, from cwd and every parent; also `.claude/CLAUDE.md`, `CLAUDE.local.md`, `~/.claude/CLAUDE.md` [CC-memory] | No (not listed) [CC-memory] | Lazy: a subdir's `CLAUDE.md`/`AGENTS.md` loads when Claude reads a file there [CC-memory] |
| **Codex CLI + IDE** | Yes: `AGENTS.override.md` → `AGENTS.md` → fallback names, at most one per dir, from project root (`.git`) **down to cwd**. Default `project_doc_max_bytes` is 32 KiB; built once per session [CX-agents], [CX-agentsrs] | Only if you add it to `project_doc_fallback_filenames` in `~/.codex/config.toml`, and even then `AGENTS.md` in the same dir wins [CX-agents], [CX-agentsrs] | No | **No**: "Codex stops searching once it reaches your current directory" [CX-agents] |
| **Copilot CLI** | Yes, in git root and cwd; **all sources merged**; `@path` imports supported [GH-cli-ref] | Yes, also loaded at the same time (git root and cwd) [GH-cli-ref] | Yes (git root and cwd) [GH-cli-ref] | No (only git root and cwd) [GH-cli-ref] |
| **Copilot in VS Code** | Yes, root `AGENTS.md`; `chat.useAgentsMdFile` defaults to `true` [VSC-settings], [VSC-instr] | Yes in the Local and Claude harnesses; `chat.useClaudeMdFile` defaults to `true` [VSC-settings], [VSC-instr]. GitHub's matrix lists only `AGENTS.md` for VS Code chat [GH-instr-support] (the two docs disagree) | Yes, `useInstructionFiles` defaults to `true` [VSC-settings] | Only with `chat.useNestedAgentsMdFiles` (default `false`, experimental) [VSC-settings] |
| **Copilot cloud agent** | Yes; "the nearest `AGENTS.md` file in the directory tree will take precedence" [GH-repo-instr], [GH-instr-support] | Yes, as an alternative: "a single `CLAUDE.md` or `GEMINI.md` file stored in the root" [GH-repo-instr] | Yes [GH-instr-support] | Yes (nearest wins) [GH-repo-instr] |
| *Visual Studio 2026 (bonus)* | **No** [GH-instr-support]; not mentioned in [VS-instr] | No [GH-instr-support] | Yes, but only after ticking a box in Tools > Options [VS-instr] | n/a |
| **OpenCode** | Yes, walking up from cwd; `~/.config/opencode/AGENTS.md` globally [OC-rules] | Fallback only: "if you have both `AGENTS.md` and `CLAUDE.md`, only `AGENTS.md` is used" [OC-rules] | No (only via the `instructions` config) [OC-rules] | Not documented; use `instructions` globs [OC-rules] |
| **Cursor** | Yes, root and nested; nested combine with parents, the more specific wins [CUR-rules] | Editor: not documented (**unverified**). Cursor CLI "reads `AGENTS.md` and `CLAUDE.md` at the project root" [CUR-cli] | No (not documented) | Yes [CUR-rules] |

---

## 2. Recommended repo layout

One set of skills, one context file, and no tool-specific duplicates in git:

```text
dynatos-workshop/
├── AGENTS.md                          # THE context file. No CLAUDE.md, no .github/copilot-instructions.md
├── apps/api/AGENTS.md                 # optional detail; auto-loaded only by Claude Code, Cursor, Copilot cloud agent
├── apps/web/AGENTS.md                 #   → root AGENTS.md must also point at them in plain text (see below)
├── .agents/skills/                    # CANONICAL shared skills, committed
│   ├── grilling/SKILL.md
│   ├── to-spec/SKILL.md
│   └── …
├── .claude/skills/
│   ├── reporter/                      # coach-owned, Claude-only CI skill, committed as a real dir (per ticket 07)
│   ├── grilling  -> ../../.agents/skills/grilling     # generated link, gitignored
│   └── to-spec   -> ../../.agents/skills/to-spec      # generated link, gitignored
├── scripts/link-skills.mjs            # creates/repairs the per-skill links; idempotent
├── package.json                       # "postinstall": "node scripts/link-skills.mjs", "skills:link": same
└── .gitignore                         # /.claude/skills/*   !/.claude/skills/reporter/   CLAUDE.local.md
```

**Why this shape**

- **`.agents/skills/` as the canonical location.** Codex, Copilot (CLI, VS Code, cloud agent, Visual Studio), OpenCode and Cursor read it directly ([CX-skills], [GH-cli-ref], [VSC-skills], [GH-cloud-skills], [VS-skills], [OC-skills], [CUR-skills]). It's the path OpenAI introduced precisely so that skills could be shared "across agents" without symlinks or duplication ([CX-PR10317]). Only Claude Code needs help.
- **Per-skill links rather than one `.claude/skills` → `.agents/skills` directory link.** Claude Code documents per-skill links explicitly: "a `<skill-name>` entry … can be a symlink to a directory elsewhere … loads the skill once even if several locations point at the same target" ([CC-skills]). They also leave room for the Claude-only `reporter` skill as a real folder, which ticket 07 needs, since `claude-code-action` loads `.claude/skills/reporter` from the base branch. A whole-directory link also works in Claude Code 2.1.263 on macOS (**tested**), but it isn't documented and it would block Claude-only skills. Use it only if no Claude-only skill lives in `.claude/skills`.
- **Generated, not committed.** On Windows, Git checks committed symlinks out "as small plain files that contain the link text" when `core.symlinks` is false, and `git clone` probes and sets that itself ([GIT-config]). Creating real symlinks needs admin/UAC or Developer Mode ([GFW-symlinks]). Anthropic's own docs say Windows teams should use an import rather than a committed symlink ([CC-memory]). A Node script needs no Git configuration. It makes a relative symlink on macOS/Linux and a `junction` on Windows. Whether junctions really need no privilege is **unverified** here, so test it in the dry run. Node is already present for the React app.
- **`AGENTS.md` only; no `CLAUDE.md`, ever.** Claude Code reads `AGENTS.md` natively from v2.1.277 when no `CLAUDE.md` exists ([CC-memory]). Copilot CLI merges `CLAUDE.md`, `AGENTS.md` and `copilot-instructions.md` all at once ([GH-cli-ref]). VS Code reads `CLAUDE.md` by default ([VSC-settings]), and the Cursor CLI reads both ([CUR-cli]). So the classic `CLAUDE.md` containing `@AGENTS.md` bridge would load the same text twice in Copilot CLI, which expands `@` imports. **Fallback** for a participant stuck on Claude Code < 2.1.277: `claude update`, or a *gitignored* `CLAUDE.local.md` containing only `@AGENTS.md`. Claude Code honours that file ([CC-memory]), and Copilot CLI, Cursor CLI and OpenCode don't list it ([GH-cli-ref], [CUR-cli], [OC-rules]).
- **No `.github/copilot-instructions.md`.** Copilot CLI, VS Code and the cloud agent all read `AGENTS.md` ([GH-instr-support], [VSC-settings]). Add a one-line pointer file ("Read `AGENTS.md` at the repo root first.") only if a participant insists on Visual Studio or JetBrains Copilot Chat. Those two don't read `AGENTS.md` ([GH-instr-support]).

**What the root `AGENTS.md` should say about skills** (so every tool's agent writes skills to the right place):

```markdown
## Skills
Shared skills live in `.agents/skills/<name>/SKILL.md`. Create new skills there, never in
`.claude/skills`, `.github/skills`, `.cursor/skills` or `.opencode/skills`.
`name` must equal the folder name: lowercase letters, digits and single hyphens, ≤ 64 chars.
Invoke: `/name` in Claude Code, Copilot and Cursor; `$name` in Codex; in OpenCode ask for it by name.
Per-app conventions: read `apps/api/AGENTS.md` before working in `apps/api`, and `apps/web/AGENTS.md` for `apps/web`.
```

**Portable `SKILL.md` frontmatter template**

```yaml
---
name: to-spec                 # = folder name; ^[a-z0-9]+(-[a-z0-9]+)*$; ≤ 64
description: "Turns the current conversation into a spec file. Use when the user says spec, PRD or 'write it up'."  # ≤ 1024; triggers first; quote it if it contains ': '
metadata:
  opencode/slash: "true"      # optional: makes /to-spec work in OpenCode; other tools ignore it
---
```

For a skill that must **never** auto-trigger (for example the reporter), set all three per-tool switches. Claude Code, Copilot and Cursor read `disable-model-invocation: true` ([CC-skills], [VSC-skills], [GH-cli-ref], [CUR-skills]). OpenCode reads `metadata: { opencode/autoinvoke: "false" }` ([OC-skills]). Codex reads an `agents/openai.yaml` with `policy: { allow_implicit_invocation: false }` ([CX-skills]).

**Link script sketch** (untested; it goes in ticket 01/16):

```js
// scripts/link-skills.mjs: expose .agents/skills/* to Claude Code as .claude/skills/<name>
import fs from 'node:fs'; import path from 'node:path'; import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const src = path.join(root, '.agents', 'skills'), dst = path.join(root, '.claude', 'skills');
fs.mkdirSync(dst, { recursive: true });
for (const name of fs.readdirSync(src)) {
  if (!fs.existsSync(path.join(src, name, 'SKILL.md'))) continue;
  const link = path.join(dst, name);
  try { const st = fs.lstatSync(link);
        if (!st.isSymbolicLink()) { console.warn(`.claude/skills/${name} is a real folder; move it to .agents/skills/ if it is shared`); continue; }
        fs.unlinkSync(link); } catch {}
  if (process.platform === 'win32') fs.symlinkSync(path.join(src, name), link, 'junction');
  else fs.symlinkSync(path.join('..', '..', '.agents', 'skills', name), link, 'dir');
}
// optional: remove links whose target no longer exists
```

**CI guard (cheap, recommended):** fail the build if a `CLAUDE.md` or `.claude/CLAUDE.md` is committed, if a `SKILL.md` exists outside `.agents/skills/` (except the `.claude/skills/` allowlist), or if `skills-ref validate` fails ([SPEC] names this reference validator).

---

## 3. Gotchas

**Context files**

1. **Claude Code's `AGENTS.md` switch-off conditions.** Any `CLAUDE.md`, `.claude/CLAUDE.md` or `CLAUDE.local.md` in the working directory *or any parent directory* makes Claude read those instead of `AGENTS.md` ([CC-memory]). A participant who clones the repo under a folder with a stray `CLAUDE.md` silently loses `AGENTS.md`. The first session after upgrading from ≤ 2.1.276 may also skip it ([CC-memory]). Check: an interactive session prints `no CLAUDE.md found; AGENTS.md loaded: …` ([CC-memory]).
2. **`/init` commands write tool-specific files.** Claude Code's `/init` generates a `CLAUDE.md` ([CC-commands]), which then switches `AGENTS.md` off for Claude Code and gets loaded by Copilot CLI, VS Code and Cursor CLI. Copilot CLI's `/init` writes `.github/copilot-instructions.md` ([GH-cli-ref]). Visual Studio's `/generateInstructions` does the same ([VS-instr]). Tell groups to improve `AGENTS.md` instead. Since creating docs and agent context is part of the case, this is worth saying out loud at kickoff.
3. **Nested `AGENTS.md` support is uneven.** It loads automatically in Claude Code (lazily), Cursor and the Copilot cloud agent. It doesn't in Codex (only root → cwd), Copilot CLI (git root and cwd only), VS Code (off by default) or OpenCode (not documented) ([CC-memory], [CUR-rules], [GH-repo-instr], [CX-agents], [GH-cli-ref], [VSC-settings], [OC-rules]). Keep must-follow rules in the root file, and point at per-app files in plain text.
4. **Don't use `@path` imports in `AGENTS.md`.** Claude Code and Copilot CLI expand them ([CC-memory], [GH-cli-ref]). Codex documents no import syntax ([CX-agents]), so it would see a literal `@…` line. Use ordinary Markdown links.
5. **Codex size and freshness.** Codex concatenates `AGENTS.md` files up to 32 KiB by default, and builds the chain once per session, so restart after edits ([CX-agents]). Claude recommends < 200 lines per file ([CC-memory]). Keep the root file short.
6. **Visual Studio and JetBrains Copilot Chat don't read `AGENTS.md`** ([GH-instr-support]). Visual Studio 2026 ≥ 18.5 does read skills ([VS-skills]). For the workshop, steer .NET people who live in Visual Studio or Rider to Copilot in VS Code or Copilot CLI.
7. **The VS Code Claude harness** is on by default (`github.copilot.chat.claudeAgent.enabled`) ([VSC-settings], [VSC-harness]). It likely follows Claude-style discovery (`.claude/skills`, `CLAUDE.md`), but whether it reads `AGENTS.md` or `.agents/skills` is **unverified**. The generated `.claude/skills` links cover the skills side either way.

**Skills: locations and duplicates**

8. **Every tool's "create a skill" flow writes to its own folder.** Claude writes to `.claude/skills`. `copilot skill add --project` writes to `.github/skills` ([GH-cli-ref]). The VS Code and Visual Studio docs tell you to use `.github/skills` ([VS-skills]). Cursor and OpenCode prefer `.cursor/skills` and `.opencode/skills` (**unverified** which one their creators pick). On Day 2 this scatters the skill library unless `AGENTS.md` and the CI guard steer it. With the gitignore above, a skill Claude creates as a *real* folder in `.claude/skills/` would also be **silently left out of commits**. The link script warns about such folders.
9. **Claude Code may refuse to write through a link.** You may see "Refusing to write into symlinked directory" or "it is a symbolic link. Write to the link's target path instead" ([CC-errors]). That's harmless. Claude retries on the real path in `.agents/skills`, which is where we want the file anyway.
10. **Duplicate listings.** Copilot, OpenCode and Cursor read *both* `.agents/skills` and `.claude/skills`, so the links make each shared skill visible twice.
    - Copilot CLI: "first found wins", with `.agents` ahead of `.claude` ([GH-cli-ref]).
    - OpenCode 1.14.33: one entry plus a `duplicate skill name` WARN in the logs (**tested**).
    - VS Code and Cursor: **unverified**, so check in the dry run.
    - Escape hatches: Copilot CLI `ignoredSkillsLocations` ([GH-cli-ref]); OpenCode `OPENCODE_DISABLE_CLAUDE_CODE_SKILLS=1` ([OC-rules]); VS Code `chat.agentSkillsLocations` (deprecated, Local harness only) ([VSC-settings]). The other fallback is to run the link script only for Claude Code users (`pnpm skills:link`) instead of at `postinstall`.
11. **Codex's `.codex/skills` is legacy.** Codex moved to `.agents/skills` and is deprecating `.codex/skills` ([CX-PR10317], [CX-PR10437]). Cursor still scans `.codex/skills` ([CUR-skills]). Don't use it.

**Frontmatter and body**

12. **Name rules.** Spec, VS Code, OpenCode and Cursor require lowercase/digits/hyphens equal to the folder name ([SPEC], [VSC-skills], [OC-skills], [CUR-skills]). VS Code fails silently on a mismatch ([VSC-skills]). Copilot CLI also accepts `_ . :` and spaces ([GH-cli-ref]), and Claude Code compares names case-insensitively ([CC-skills]). So a sloppy name can work in one tool and vanish in another. Validate with `skills-ref`.
13. **Description budget.** The spec limit is 1024 chars ([SPEC]). Claude Code truncates at 1,536 per skill and drops descriptions of rarely used skills when the listing exceeds ~1% of context ([CC-skills]). Codex caps the list at 2% of context (8,000 chars if unknown) and shortens descriptions first ([CX-skills]). Front-load the trigger words, and don't rely on the Claude-only `when_to_use`.
14. **Extension fields don't travel.**
    - `allowed-tools` uses different tool vocabularies: Claude writes `Bash(git:*)` in a space-separated string ([CC-skills]), Copilot writes `shell` in a comma list or array ([GH-cli-ref]), and Codex ignores the field ([CX-parser]).
    - `context: fork` exists only in Claude and VS Code (experimental) ([CC-skills], [VSC-skills]).
    - `paths` exists only in Claude and Cursor ([CC-skills], [CUR-skills]).
    - Leave all of these out of shared skills.
15. **Body syntax that only Claude expands.** `$ARGUMENTS`/`$1` substitution and `` !`cmd` `` shell injection are Claude Code features ([CC-skills]); other tools pass them through as literal text. Inside skills, refer to other skills in prose ("use the `grilling` skill"), not as `/grilling`, because Codex uses `$grilling`.
16. **Scripts in skills.** The team is partly on Windows, so write helper scripts in Node rather than bash, and use `/` separators. VS Code advises "Use Unix-style `/` path separators to keep skills portable across operating systems" ([VSC-skills]).

**File system**

17. **Windows symlinks.** Covered above: a committed symlink becomes a text file unless `core.symlinks=true` *and* the user can create symlinks (Developer Mode, or admin with UAC) ([GIT-config], [GFW-symlinks]). Symlinks also need NTFS, and Windows must know whether the target is a file or a directory ([GFW-symlinks]). Cloning inside WSL avoids all of this.
18. **Case sensitivity.** The skill file must be exactly `SKILL.md` ([SPEC], [GH-cli-skills]), and Codex looks for exactly `AGENTS.md` ([CX-agentsrs]). macOS and Windows default to case-insensitive file systems (Git sets `core.ignoreCase` at clone) ([GIT-config]). So `Skill.md`, `agents.md` or a `Grilling/` folder can work on a laptop but fail on the Linux runner used by the Copilot cloud agent and CI. Do case-only renames with `git mv`.
19. **Line endings (precaution).** Claude Code fixed `!` blocks failing on CRLF files only recently ([CC-changelog], v2.1.290, 2026-10-05). A `.gitattributes` with `*.md text eol=lf` keeps `SKILL.md` and `AGENTS.md` LF everywhere. That every tool needs this is **unverified**; it's a cheap precaution.

---

## Local tests

Both tests ran on macOS on 2026-10-20 in a scratch folder with `.agents/skills/portability-probe/SKILL.md`. Neither was run on Windows.

- **OpenCode 1.14.33** (`opencode debug skill`) listed the probe **once** for each of three setups: a whole-dir symlink `.claude/skills → ../.agents/skills`, a per-skill symlink, and a real copy. In the per-skill and copy runs it logged `WARN … name=portability-probe … duplicate skill name`.
- **Claude Code 2.1.263** with a whole-dir symlink `.claude/skills → ../.agents/skills`: the debug log showed `Loaded 50 unique skills (… project: 1 …)`, so the skill was discovered through the directory link. The API call itself failed on an expired login, so invocation wasn't exercised.

## Unverified / open

- Whether VS Code and Cursor list a skill once or twice when it is visible through both `.agents/skills` and `.claude/skills`.
- Whether Node `junction` links need no Developer Mode or admin on the participants' managed Windows laptops, and whether Claude Code on Windows follows them for skills.
- Whether the VS Code Claude harness reads `AGENTS.md` or `.agents/skills`.
- Whether the Cursor editor (as opposed to the Cursor CLI) reads `CLAUDE.md`.
- Whether `metadata.opencode/slash` applies to OpenCode 1.x or only to "OpenCode v2" (the docs page carries a v2 banner).
- Whether the Copilot cloud agent can be forced to use a skill by naming it in the issue text.
- Codex IDE extension: covered by "share the same configuration layers" ([CX-config]) and the skills page ([CX-skills]), but `AGENTS.md` behaviour isn't separately documented for the IDE.

All of the above should be one checklist in the dry run ([map: Rehearsal and fallbacks](../map.md)). In each tool, open the repo and run the skill list (`/skills`, `$` picker, `/skills list`, `/` menu, `opencode debug skill`). Confirm each workshop skill appears once and that `AGENTS.md` is loaded.

---

## Sources

Agent Skills spec
- SPEC: https://agentskills.io/specification

Claude Code
- CC-skills: https://code.claude.com/docs/en/skills
- CC-memory: https://code.claude.com/docs/en/memory (sections "AGENTS.md", "Share one file with other coding tools")
- CC-commands: https://code.claude.com/docs/en/commands
- CC-errors: https://code.claude.com/docs/en/errors#refusing-after-a-symlink-changed
- CC-changelog: https://github.com/anthropics/claude-code/blob/main/CHANGELOG.md (2.1.277 "Added AGENTS.md support…", 2.1.281, 2.1.290)
- npm-cc: https://www.npmjs.com/package/@anthropic-ai/claude-code

OpenAI Codex
- CX-skills: https://learn.chatgpt.com/docs/build-skills (redirect target of https://developers.openai.com/codex/skills)
- CX-agents: https://learn.chatgpt.com/docs/agent-configuration/agents-md (redirect target of https://developers.openai.com/codex/guides/agents-md)
- CX-config: https://learn.chatgpt.com/docs/config-file/config-basic
- CX-changelog: https://learn.chatgpt.com/docs/changelog
- CX-parser: https://github.com/openai/codex/blob/main/codex-rs/skills/src/parser.rs
- CX-agentsrs: https://github.com/openai/codex/blob/main/codex-rs/core/src/agents_md.rs
- CX-PR10317: https://github.com/openai/codex/pull/10317 ("Support loading skills from .agents/skills", merged 2026-02-01)
- CX-PR10437: https://github.com/openai/codex/pull/10437 ("Read personal skills from .agents/skills", merged 2026-02-03)
- npm-cx: https://www.npmjs.com/package/@openai/codex

GitHub Copilot
- GH-about-skills: https://docs.github.com/en/copilot/concepts/agents/about-agent-skills
- GH-cli-skills: https://docs.github.com/en/copilot/how-tos/copilot-cli/customize-copilot/add-skills
- GH-cli-ref: https://docs.github.com/en/copilot/reference/copilot-cli-reference/cli-command-reference (sections "Custom instructions locations", "Skills reference")
- GH-cloud-skills: https://docs.github.com/en/copilot/how-tos/copilot-on-github/customize-copilot/customize-cloud-agent/add-skills
- GH-repo-instr: https://docs.github.com/en/copilot/how-tos/configure-custom-instructions/add-repository-instructions
- GH-instr-support: https://docs.github.com/en/copilot/reference/custom-instructions-support
- npm-gh: https://www.npmjs.com/package/@github/copilot

VS Code / Visual Studio
- VSC-skills: https://code.visualstudio.com/docs/agent-customization/agent-skills
- VSC-instr: https://code.visualstudio.com/docs/copilot/customization/custom-instructions
- VSC-settings: https://code.visualstudio.com/docs/agents/reference/ai-settings
- VSC-harness: https://code.visualstudio.com/docs/agents/run/agent-harnesses
- VS-skills: https://learn.microsoft.com/en-us/visualstudio/ide/copilot-agent-skills?view=visualstudio
- VS-instr: https://learn.microsoft.com/en-us/visualstudio/ide/copilot-chat-context?view=visualstudio

OpenCode
- OC-skills: https://opencode.ai/docs/skills
- OC-rules: https://opencode.ai/docs/rules
- npm-oc: https://www.npmjs.com/package/opencode-ai

Cursor
- CUR-skills: https://cursor.com/docs/context/skills
- CUR-rules: https://cursor.com/docs/context/rules
- CUR-cli: https://cursor.com/docs/cli/using

Git / Windows
- GIT-config: https://git-scm.com/docs/git-config (`core.symlinks`, `core.ignoreCase`)
- GFW-symlinks: https://gitforwindows.org/symbolic-links

[SPEC]: https://agentskills.io/specification
[CC-skills]: https://code.claude.com/docs/en/skills
[CC-memory]: https://code.claude.com/docs/en/memory
[CC-commands]: https://code.claude.com/docs/en/commands
[CC-errors]: https://code.claude.com/docs/en/errors#refusing-after-a-symlink-changed
[CC-changelog]: https://github.com/anthropics/claude-code/blob/main/CHANGELOG.md
[npm-cc]: https://www.npmjs.com/package/@anthropic-ai/claude-code
[CX-skills]: https://learn.chatgpt.com/docs/build-skills
[CX-agents]: https://learn.chatgpt.com/docs/agent-configuration/agents-md
[CX-config]: https://learn.chatgpt.com/docs/config-file/config-basic
[CX-changelog]: https://learn.chatgpt.com/docs/changelog
[CX-parser]: https://github.com/openai/codex/blob/main/codex-rs/skills/src/parser.rs
[CX-agentsrs]: https://github.com/openai/codex/blob/main/codex-rs/core/src/agents_md.rs
[CX-PR10317]: https://github.com/openai/codex/pull/10317
[CX-PR10437]: https://github.com/openai/codex/pull/10437
[npm-cx]: https://www.npmjs.com/package/@openai/codex
[GH-about-skills]: https://docs.github.com/en/copilot/concepts/agents/about-agent-skills
[GH-cli-skills]: https://docs.github.com/en/copilot/how-tos/copilot-cli/customize-copilot/add-skills
[GH-cli-ref]: https://docs.github.com/en/copilot/reference/copilot-cli-reference/cli-command-reference
[GH-cloud-skills]: https://docs.github.com/en/copilot/how-tos/copilot-on-github/customize-copilot/customize-cloud-agent/add-skills
[GH-repo-instr]: https://docs.github.com/en/copilot/how-tos/configure-custom-instructions/add-repository-instructions
[GH-instr-support]: https://docs.github.com/en/copilot/reference/custom-instructions-support
[npm-gh]: https://www.npmjs.com/package/@github/copilot
[VSC-skills]: https://code.visualstudio.com/docs/agent-customization/agent-skills
[VSC-instr]: https://code.visualstudio.com/docs/copilot/customization/custom-instructions
[VSC-settings]: https://code.visualstudio.com/docs/agents/reference/ai-settings
[VSC-harness]: https://code.visualstudio.com/docs/agents/run/agent-harnesses
[VS-skills]: https://learn.microsoft.com/en-us/visualstudio/ide/copilot-agent-skills?view=visualstudio
[VS-instr]: https://learn.microsoft.com/en-us/visualstudio/ide/copilot-chat-context?view=visualstudio
[OC-skills]: https://opencode.ai/docs/skills
[OC-rules]: https://opencode.ai/docs/rules
[npm-oc]: https://www.npmjs.com/package/opencode-ai
[CUR-skills]: https://cursor.com/docs/context/skills
[CUR-rules]: https://cursor.com/docs/context/rules
[CUR-cli]: https://cursor.com/docs/cli/using
[GIT-config]: https://git-scm.com/docs/git-config
[GFW-symlinks]: https://gitforwindows.org/symbolic-links
