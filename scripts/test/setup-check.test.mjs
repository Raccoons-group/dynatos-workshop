import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, test } from "node:test";

import { formatReport, setupCheck } from "../setup-check.mjs";

// outer/repo is the repo and outer/home the participant's home folder, so a CLAUDE.md can sit above the repo.
let outer;
let root;
let home;

beforeEach(() => {
  outer = fs.mkdtempSync(path.join(os.tmpdir(), "setup-check-"));
  root = path.join(outer, "repo");
  home = path.join(outer, "home");
  write(
    root,
    "package.json",
    JSON.stringify({ packageManager: "pnpm@12.11.2" }),
  );
  write(root, "docs/agents/workshop.md", workshopFile("a"));
  write(root, ".agents/skills/grilling/SKILL.md", "---\nname: grilling\n---\n");
  fs.mkdirSync(path.join(home, ".claude", "skills"), { recursive: true });
});

afterEach(() => {
  fs.rmSync(outer, { recursive: true, force: true });
});

function write(base, file, content) {
  fs.mkdirSync(path.dirname(path.join(base, file)), { recursive: true });
  fs.writeFileSync(path.join(base, file), content);
}

function workshopFile(group) {
  const value = (text) => (group ? text : "none");
  return [
    "# This branch in the workshop",
    "",
    "The `open-pr` skill, the issue tracker and the live deck's reporter read these values.",
    "",
    `Group: ${value(group)}`,
    `Base branch: ${group ? `group-${group}/main` : "main"}`,
    `Work branch: ${value(`group-${group}/group-orders`)}`,
    `Working-out: ${value(`work/group-${group}`)}`,
    "Epic: none",
    "",
  ].join("\n");
}

// A machine that's ready for the workshop. Each test changes one command; null means it isn't installed.
const READY = {
  "node --version": { stdout: "v22.12.0" },
  "pnpm --version": { stdout: "12.11.2" },
  "dotnet --list-sdks": {
    stdout:
      "9.0.300 [/usr/local/share/dotnet/sdk]\n10.0.100 [/usr/local/share/dotnet/sdk]",
  },
  "gh auth status": {
    stdout: "github.com\n  ✓ Logged in to github.com account ada (keyring)",
  },
  "gh repo view --json nameWithOwner,viewerPermission": {
    stdout: JSON.stringify({
      nameWithOwner: "raccoons/dynatos-workshop",
      viewerPermission: "WRITE",
    }),
  },
  "git branch --show-current": { stdout: "group-a/main" },
  "claude --version": { stdout: "2.1.277 (Claude Code)" },
};

function fakeRun(changes) {
  const replies = { ...READY, ...changes };
  return (command, args) => {
    const reply = replies[[command, ...args].join(" ")];
    if (!reply) return { found: false, ok: false, stdout: "", stderr: "" };
    return {
      found: true,
      ok: reply.ok ?? true,
      stdout: reply.stdout ?? "",
      stderr: reply.stderr ?? "",
    };
  };
}

const check = (changes = {}) =>
  setupCheck({ root, home, run: fakeRun(changes) });
const result = (results, name) => results.find((r) => r.check === name);
const statusOf = (name, changes) => result(check(changes), name)?.status;

test("passes a machine that's ready for the workshop", () => {
  const results = check();

  for (const { check: name, status } of results) {
    assert.equal(status, name === "copilot" ? "info" : "pass", name);
  }
  assert.deepEqual(
    results.map((r) => r.check),
    [
      "node",
      "pnpm",
      "dotnet",
      "gh",
      "access",
      "branch",
      "claude-md",
      "claude-code",
      "skills",
      "copilot",
    ],
  );
});

test("every failure and warning comes with a fix hint", () => {
  write(outer, "CLAUDE.md", "# mine\n");
  write(home, ".claude/skills/grilling/SKILL.md", "---\nname: grilling\n---\n");
  const results = check({
    "node --version": { stdout: "v20.11.0" },
    "pnpm --version": null,
    "dotnet --list-sdks": null,
    "gh auth status": null,
    "git branch --show-current": { stdout: "my-experiment" },
    "claude --version": { stdout: "2.1.263 (Claude Code)" },
  });

  const problems = results.filter((r) => r.status !== "pass");
  assert.ok(problems.length >= 7);
  for (const { check: name, status, hint } of problems) {
    if (status === "fail" || status === "warn")
      assert.ok(hint, `${name} has no hint`);
  }
});

test("fails Node older than 22", () => {
  assert.equal(
    statusOf("node", { "node --version": { stdout: "v20.11.0" } }),
    "fail",
  );
  assert.equal(
    statusOf("node", { "node --version": { stdout: "v24.1.0" } }),
    "pass",
  );
});

test("fails a missing pnpm, or a major other than the repo's", () => {
  const missing = result(check({ "pnpm --version": null }), "pnpm");
  assert.equal(missing.status, "fail");
  assert.match(missing.hint, /corepack enable/);
  assert.equal(
    statusOf("pnpm", { "pnpm --version": { stdout: "9.15.0" } }),
    "fail",
  );
});

test("needs a .NET 10 SDK", () => {
  const missing = result(check({ "dotnet --list-sdks": null }), "dotnet");
  assert.equal(missing.status, "fail");
  assert.match(missing.hint, /dotnet\.microsoft\.com/);

  const onlyNine = { stdout: "8.0.400 [/sdk]\n9.0.300 [/sdk]" };
  assert.equal(statusOf("dotnet", { "dotnet --list-sdks": onlyNine }), "fail");
  const runtimeOnly = { stdout: "" };
  assert.equal(
    statusOf("dotnet", { "dotnet --list-sdks": runtimeOnly }),
    "fail",
  );
});

test("fails when gh is missing or signed out, and skips the access check", () => {
  for (const reply of [
    null,
    { ok: false, stderr: "You are not logged into any GitHub hosts." },
  ]) {
    const results = check({ "gh auth status": reply });
    assert.equal(result(results, "gh").status, "fail");
    assert.match(result(results, "gh").hint, /gh auth login/);
    assert.equal(result(results, "access"), undefined);
  }
});

test("fails without write access to the repo", () => {
  const view = "gh repo view --json nameWithOwner,viewerPermission";
  const readOnly = {
    stdout: JSON.stringify({
      nameWithOwner: "raccoons/dynatos-workshop",
      viewerPermission: "READ",
    }),
  };
  const noRepo = {
    ok: false,
    stderr:
      "GraphQL: Could not resolve to a Repository with the name 'raccoons/dynatos-workshop'.",
  };

  for (const reply of [readOnly, noRepo]) {
    const results = check({ [view]: reply });
    assert.equal(result(results, "gh").status, "pass");
    assert.equal(result(results, "access").status, "fail");
    assert.match(result(results, "access").hint, /coach/);
  }
});

test("passes on the group's base or work branch, and fails elsewhere", () => {
  const on = (branch) => ({ "git branch --show-current": { stdout: branch } });
  assert.equal(statusOf("branch", on("group-a/main")), "pass");
  assert.equal(statusOf("branch", on("group-a/group-orders")), "pass");

  const elsewhere = result(check(on("group-b/main")), "branch");
  assert.equal(elsewhere.status, "fail");
  assert.match(elsewhere.hint, /git switch group-a\/main/);
  assert.equal(statusOf("branch", on("")), "fail");
});

test("warns on main, where docs/agents names no group", () => {
  write(root, "docs/agents/workshop.md", workshopFile(null));
  const main = result(
    check({ "git branch --show-current": { stdout: "main" } }),
    "branch",
  );
  assert.equal(main.status, "warn");
  assert.match(main.hint, /git clone -b group-<x>\/main/);
});

test("fails when docs/agents/workshop.md is missing", () => {
  fs.rmSync(path.join(root, "docs"), { recursive: true });
  assert.equal(statusOf("branch"), "fail");
});

test("fails on a CLAUDE.md in a folder above the repo", () => {
  write(outer, "CLAUDE.md", "# mine\n");

  const found = result(check(), "claude-md");

  assert.equal(found.status, "fail");
  assert.ok(found.label.includes(path.join(outer, "CLAUDE.md")));
});

test("fails on a stray CLAUDE.md in the repo itself", () => {
  write(root, "claude.md", "# from /init\n");
  assert.equal(statusOf("claude-md"), "fail");
});

test("checks Claude Code's version only when it's installed", () => {
  assert.equal(statusOf("claude-code", { "claude --version": null }), "skip");
  const old = result(
    check({ "claude --version": { stdout: "2.1.263 (Claude Code)" } }),
    "claude-code",
  );
  assert.equal(old.status, "fail");
  assert.match(old.hint, /claude update/);
  assert.equal(
    statusOf("claude-code", {
      "claude --version": { stdout: "2.2.0 (Claude Code)" },
    }),
    "pass",
  );
});

test("warns, without failing, about a global skill that shadows the repo's", () => {
  write(home, ".claude/skills/grilling/SKILL.md", "---\nname: grilling\n---\n");
  write(home, ".claude/skills/archify/SKILL.md", "---\nname: archify\n---\n");

  const skills = result(check(), "skills");

  assert.equal(skills.status, "warn");
  assert.ok(skills.label.endsWith(": grilling"));
  assert.ok(check().every((r) => r.status !== "fail"));
});

test("doesn't warn about a global skill the repo doesn't ship", () => {
  write(home, ".claude/skills/archify/SKILL.md", "---\nname: archify\n---\n");
  assert.equal(statusOf("skills"), "pass");
});

test("always points Visual Studio and Rider users to Copilot CLI or VS Code", () => {
  const copilot = result(check(), "copilot");
  assert.match(copilot.label, /Copilot CLI/);
  assert.match(copilot.label, /VS Code/);
});

test("prints one line per item, with the fix under each problem", () => {
  const report = formatReport(check({ "dotnet --list-sdks": null }));
  const lines = report.split("\n");

  const dotnet = lines.findIndex((line) => line.startsWith("✗ .NET SDK"));
  assert.ok(dotnet >= 0);
  assert.match(lines[dotnet + 1], /^ {4}fix: /);
  assert.ok(lines.some((line) => line.startsWith("✓ Node")));
  assert.match(lines.at(-1), /^1 to fix\./);
});
