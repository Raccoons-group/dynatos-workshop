#!/usr/bin/env node
// The participant's setup check (`pnpm setup:check`), run before the 09:33 setup round. One line per item, pass
// or fail, and a fix hint under every problem:
// - Node 22+, pnpm (the major in `packageManager`) and the .NET 10 SDK;
// - `gh` signed in, with write access to this repo;
// - the current branch against `Base branch` and `Work branch` in docs/agents/workshop.md;
// - a CLAUDE.md in the repo or a folder above it, which makes Claude Code ignore AGENTS.md;
// - Claude Code 2.1.277+, the first version that reads AGENTS.md, when `claude` is installed.
// It warns, without failing, about skills in ~/.claude/skills that shadow the repo's in Claude Code, and points
// Visual Studio and Rider users of Copilot Chat, which ignores AGENTS.md, to Copilot CLI or VS Code.

import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { parseWorkshopKeys } from "./lib/workshop-keys.mjs";

export const MIN_NODE = 22;
export const DOTNET_MAJOR = 10;
export const MIN_CLAUDE = "2.1.277";
const WRITE_PERMISSIONS = new Set(["ADMIN", "MAINTAIN", "WRITE"]);

const isWindows = process.platform === "win32";

// The one place commands run, so the tests can fake every tool. Never throws; `found` is false when the
// command isn't installed.
export function runCommand(command, args, { cwd } = {}) {
  const options = { cwd, encoding: "utf8", timeout: 20_000 };
  // pnpm, gh and claude are .cmd shims on Windows, which only start through a shell.
  const result = isWindows
    ? spawnSync([command, ...args].join(" "), { ...options, shell: true })
    : spawnSync(command, args, options);
  // cmd.exe exits with 9009 when it can't find the command.
  const found =
    result.error?.code !== "ENOENT" && !(isWindows && result.status === 9009);
  return {
    found,
    ok: found && result.status === 0,
    stdout: (result.stdout ?? "").trim(),
    stderr: (result.stderr ?? "").trim(),
  };
}

const pass = (check, label) => ({ check, status: "pass", label });
const fail = (check, label, hint) => ({ check, status: "fail", label, hint });
const warn = (check, label, hint) => ({ check, status: "warn", label, hint });

function versionIn(text) {
  return /(\d+)\.(\d+)\.(\d+)/.exec(text)?.slice(1).map(Number) ?? null;
}

function atLeast(version, min) {
  for (let i = 0; i < 3; i++)
    if (version[i] !== min[i]) return version[i] > min[i];
  return true;
}

const firstLine = (text) => text.split(/\r?\n/)[0];

function folders(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();
}

function checkNode(run) {
  const version = versionIn(run("node", ["--version"]).stdout);
  if (version?.[0] >= MIN_NODE)
    return pass("node", `Node ${version.join(".")}`);
  return fail(
    "node",
    version
      ? `Node ${version.join(".")}: needs ${MIN_NODE} or later`
      : "Node: not found",
    `Install Node ${MIN_NODE} or later from https://nodejs.org, then open a new terminal.`,
  );
}

function checkPnpm(run, root) {
  const manifest = path.join(root, "package.json");
  const packageManager = fs.existsSync(manifest)
    ? JSON.parse(fs.readFileSync(manifest, "utf8")).packageManager
    : undefined;
  const wanted = /^pnpm@(\d+)/.exec(packageManager ?? "")?.[1];
  const version = versionIn(run("pnpm", ["--version"], { cwd: root }).stdout);
  const hint =
    "Run `corepack enable` (on Node 25 or later, `npm install -g corepack` first), then open a new terminal.";

  if (!version) return fail("pnpm", "pnpm: not found", hint);
  if (wanted && version[0] !== Number(wanted))
    return fail(
      "pnpm",
      `pnpm ${version.join(".")}: this repo uses pnpm ${wanted}`,
      hint,
    );
  return pass("pnpm", `pnpm ${version.join(".")}`);
}

function checkDotnet(run) {
  const dotnet = run("dotnet", ["--list-sdks"]);
  const hint = `Install the .NET ${DOTNET_MAJOR} SDK from https://dotnet.microsoft.com/download/dotnet/${DOTNET_MAJOR}.0, then open a new terminal.`;
  if (!dotnet.found) return fail("dotnet", ".NET SDK: dotnet not found", hint);

  // One SDK per line, oldest first: `10.0.100 [/usr/local/share/dotnet/sdk]`.
  const sdks = dotnet.stdout
    .split(/\r?\n/)
    .map((line) => line.trim().split(/\s+/)[0])
    .filter(Boolean);
  const match = sdks.findLast((sdk) => parseInt(sdk, 10) === DOTNET_MAJOR);
  if (match) return pass("dotnet", `.NET SDK ${match}`);
  return fail(
    "dotnet",
    sdks.length
      ? `.NET SDK: found ${sdks.join(", ")}, needs ${DOTNET_MAJOR}`
      : ".NET SDK: none installed",
    hint,
  );
}

function checkGitHub(run, root) {
  const auth = run("gh", ["auth", "status"], { cwd: root });
  if (!auth.found)
    return [
      fail(
        "gh",
        "GitHub CLI: not installed",
        "Install it from https://cli.github.com, then run `gh auth login`.",
      ),
    ];
  if (!auth.ok)
    return [
      fail(
        "gh",
        "GitHub CLI: not signed in",
        "Run `gh auth login` and sign in with the GitHub account the coaches added to the repo.",
      ),
    ];

  const account = /\b(?:account|as) (\S+)/.exec(
    `${auth.stdout}\n${auth.stderr}`,
  )?.[1];
  const signedIn = pass(
    "gh",
    account ? `GitHub CLI signed in as ${account}` : "GitHub CLI signed in",
  );
  const askCoach =
    "Ask a coach to give your GitHub account write access to the repo, then run this again.";

  const view = run(
    "gh",
    ["repo", "view", "--json", "nameWithOwner,viewerPermission"],
    { cwd: root },
  );
  if (!view.ok)
    return [
      signedIn,
      fail(
        "access",
        `Write access: can't open this repo on GitHub (${firstLine(view.stderr) || "no details"})`,
        askCoach,
      ),
    ];
  const { nameWithOwner, viewerPermission } = JSON.parse(view.stdout);
  if (WRITE_PERMISSIONS.has(viewerPermission))
    return [signedIn, pass("access", `Write access to ${nameWithOwner}`)];
  return [
    signedIn,
    fail(
      "access",
      `Write access to ${nameWithOwner}: you have ${String(viewerPermission).toLowerCase()} access`,
      askCoach,
    ),
  ];
}

function checkBranch(run, root) {
  const file = path.join(root, "docs", "agents", "workshop.md");
  const clone = "`git clone -b group-<x>/main <repo url>`";
  if (!fs.existsSync(file))
    return fail(
      "branch",
      "Branch: docs/agents/workshop.md is missing",
      `Clone your group's base branch: ${clone}.`,
    );

  const {
    group,
    baseBranch: base,
    workBranch: work,
  } = parseWorkshopKeys(fs.readFileSync(file, "utf8"));
  const current = run("git", ["branch", "--show-current"], {
    cwd: root,
  }).stdout;
  const switchTo = work
    ? `Run \`git switch ${base}\`, or \`git switch ${work}\` once your group has made it.`
    : `Run \`git switch ${base}\`.`;

  if (!group)
    return warn(
      "branch",
      `Branch ${current || "(detached)"}: not a group's branch`,
      `Fine for coaches. Participants clone their group's base branch instead: ${clone}.`,
    );
  if (!current)
    return fail("branch", "Branch: not on a branch (detached HEAD)", switchTo);
  if (current === base)
    return pass("branch", `Branch ${current}, your group's base branch`);
  if (current === work)
    return pass("branch", `Branch ${current}, your group's work branch`);
  return fail(
    "branch",
    `Branch ${current}: docs/agents/workshop.md expects ${work ? `${base} or ${work}` : base}`,
    switchTo,
  );
}

// Claude Code reads every CLAUDE.md from its folder up to the filesystem root, and ignores AGENTS.md when it
// finds one.
function checkClaudeMd(root) {
  const found = [];
  for (let dir = root; ; dir = path.dirname(dir)) {
    try {
      for (const name of fs.readdirSync(dir))
        if (name.toLowerCase() === "claude.md")
          found.push(path.join(dir, name));
    } catch {
      // An unreadable folder can't hold a CLAUDE.md that Claude Code reads either.
    }
    if (path.dirname(dir) === dir) break;
  }
  if (!found.length)
    return pass("claude-md", "No CLAUDE.md in the repo or a folder above it");
  return fail(
    "claude-md",
    `CLAUDE.md found: ${found.join(", ")}`,
    "Claude Code ignores AGENTS.md while it sees a CLAUDE.md. Rename or move it for the workshop (for example to CLAUDE.md.off).",
  );
}

function checkClaudeCode(run) {
  const claude = run("claude", ["--version"]);
  if (!claude.found)
    return {
      check: "claude-code",
      status: "skip",
      label: "Claude Code: not installed, skipped",
    };
  const version = versionIn(claude.stdout);
  if (version && atLeast(version, versionIn(MIN_CLAUDE)))
    return pass("claude-code", `Claude Code ${version.join(".")}`);
  return fail(
    "claude-code",
    `Claude Code ${version ? version.join(".") : "(version unknown)"}: needs ${MIN_CLAUDE} or later to read AGENTS.md`,
    "Run `claude update`, then start a new session.",
  );
}

// Claude Code prefers a personal skill over a project skill with the same name, so a global copy of a Pocock
// skill hides the workshop's fork.
function checkShadowedSkills(root, home) {
  const shared = path.join(root, ".agents", "skills");
  const personal = path.join(home, ".claude", "skills");
  const shadowed = folders(shared).filter((name) => {
    const own = path.join(personal, name);
    if (!fs.existsSync(own)) return false;
    return fs.realpathSync(own) !== fs.realpathSync(path.join(shared, name));
  });
  if (!shadowed.length)
    return pass("skills", "No skill in ~/.claude/skills shadows the repo's");
  return warn(
    "skills",
    `${shadowed.length} skill${shadowed.length === 1 ? "" : "s"} in ~/.claude/skills shadow${shadowed.length === 1 ? "s" : ""} the repo's in Claude Code: ${shadowed.join(", ")}`,
    "Claude Code runs your global copy, not the workshop's. Move them out of ~/.claude/skills for the workshop (for example to ~/.claude/skills-off/).",
  );
}

export function setupCheck({ root, home = os.homedir(), run = runCommand }) {
  return [
    checkNode(run),
    checkPnpm(run, root),
    checkDotnet(run),
    ...checkGitHub(run, root),
    checkBranch(run, root),
    checkClaudeMd(root),
    checkClaudeCode(run),
    checkShadowedSkills(root, home),
    {
      check: "copilot",
      status: "info",
      label:
        "Visual Studio or Rider with Copilot Chat? It doesn't read AGENTS.md: use Copilot CLI or VS Code for the workshop.",
    },
  ];
}

const MARKS = { pass: "✓", fail: "✗", warn: "!", skip: "–", info: "i" };

export function formatReport(results) {
  const lines = results.flatMap(({ status, label, hint }) =>
    hint
      ? [`${MARKS[status]} ${label}`, `    fix: ${hint}`]
      : [`${MARKS[status]} ${label}`],
  );
  const failed = results.filter((result) => result.status === "fail").length;
  const warned = results.filter((result) => result.status === "warn").length;
  const warnings = warned
    ? ` ${warned} warning${warned === 1 ? "" : "s"} to read.`
    : "";
  lines.push(
    "",
    failed
      ? `${failed} to fix.${warnings} Stuck on a fix? Ask a coach.`
      : `Ready for the workshop.${warnings}`,
  );
  return lines.join("\n");
}

if (
  process.argv[1] &&
  fileURLToPath(import.meta.url) === path.resolve(process.argv[1])
) {
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
  const results = setupCheck({ root });
  console.log(formatReport(results));
  if (results.some((result) => result.status === "fail")) process.exitCode = 1;
}
