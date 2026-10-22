import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, test } from "node:test";

import { checkSkills, parseFrontmatter } from "../check-skills.mjs";

let root;

beforeEach(() => {
  root = fs.mkdtempSync(path.join(os.tmpdir(), "check-skills-"));
  execFileSync("git", ["init", "-q"], { cwd: root });
});

afterEach(() => {
  fs.rmSync(root, { recursive: true, force: true });
});

function write(file, content) {
  fs.mkdirSync(path.dirname(path.join(root, file)), { recursive: true });
  fs.writeFileSync(path.join(root, file), content);
}

function skill(folder, frontmatter) {
  write(
    `.agents/skills/${folder}/SKILL.md`,
    `---\n${frontmatter}\n---\n\nBody.\n`,
  );
}

const errorsFor = () => checkSkills({ root }).errors;

test("passes a portable skill", () => {
  skill(
    "to-spec",
    "name: to-spec\ndescription: Use when turning a decided conversation into a spec.",
  );
  write("AGENTS.md", "# Repo\n");

  assert.deepEqual(errorsFor(), []);
});

test("allows the portable fields, including disable-model-invocation", () => {
  skill(
    "open-pr",
    "name: open-pr\ndescription: Use when opening a pull request.\nlicense: MIT\ncompatibility: any agent\nmetadata:\n  owner: coaches\ndisable-model-invocation: true",
  );

  assert.deepEqual(errorsFor(), []);
});

test("fails on a CLAUDE.md anywhere in the repo", () => {
  write("case/CLAUDE.md", "# Instructions\n");

  assert.match(errorsFor().join("\n"), /case\/CLAUDE\.md: no CLAUDE\.md/);
});

test("ignores a CLAUDE.md that git ignores", () => {
  write(".gitignore", "node_modules/\n");
  write("node_modules/some-package/CLAUDE.md", "# Not ours\n");

  assert.deepEqual(errorsFor(), []);
});

test("fails on a Copilot instructions file", () => {
  write(".github/copilot-instructions.md", "# Copilot\n");

  assert.match(errorsFor().join("\n"), /no Copilot instructions file/);
});

test("fails when the name isn't the folder name", () => {
  skill("grill-with-docs", "name: grill\ndescription: Use when grilling.");

  assert.match(
    errorsFor().join("\n"),
    /name "grill" must equal the folder name "grill-with-docs"/,
  );
});

test("fails on a folder name that isn't lowercase with single hyphens", () => {
  skill(
    "Check--Fees",
    "name: Check--Fees\ndescription: Use when checking fees.",
  );

  assert.match(
    errorsFor().join("\n"),
    /lowercase letters and digits joined by single hyphens/,
  );
});

test("fails when the name or description is missing", () => {
  skill("no-name", "description: Use when testing.");
  skill("no-description", "name: no-description");

  const errors = errorsFor().join("\n");
  assert.match(errors, /no-name\/SKILL\.md: name is missing/);
  assert.match(errors, /no-description\/SKILL\.md: description is missing/);
});

test("fails on a description over 1,024 characters", () => {
  skill("too-long", `name: too-long\ndescription: ${"x".repeat(1025)}`);

  assert.match(errorsFor().join("\n"), /description is 1025 characters/);
});

test("fails on a field that isn't portable", () => {
  skill(
    "tdd",
    "name: tdd\ndescription: Use when writing tests first.\nallowed-tools: Bash(dotnet:*)\ncontext: fork",
  );

  assert.match(errorsFor().join("\n"), /allowed-tools, context isn't portable/);
});

test("fails on a skill folder without SKILL.md", () => {
  write(".agents/skills/empty/README.md", "# Nothing here\n");

  assert.match(errorsFor().join("\n"), /\.agents\/skills\/empty: no SKILL\.md/);
});

test("ignores files at the top of the shared skills folder", () => {
  write(".agents/skills/README.md", "# Shared skills\n");

  assert.deepEqual(errorsFor(), []);
});

test("reads folded and quoted descriptions", () => {
  assert.equal(
    parseFrontmatter(
      "---\nname: a\ndescription: >\n  Use when one\n  and two.\n---\n",
    ).values.description,
    "Use when one and two.",
  );
  assert.equal(
    parseFrontmatter('---\nname: a\ndescription: "Use when: quoted."\n---\n')
      .values.description,
    "Use when: quoted.",
  );
});
