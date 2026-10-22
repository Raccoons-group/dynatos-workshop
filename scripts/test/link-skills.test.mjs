import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, test } from "node:test";

import { linkSkills } from "../link-skills.mjs";

let root;

beforeEach(() => {
  root = fs.mkdtempSync(path.join(os.tmpdir(), "link-skills-"));
});

afterEach(() => {
  fs.rmSync(root, { recursive: true, force: true });
});

function addSkill(dir, name) {
  fs.mkdirSync(path.join(root, dir, name), { recursive: true });
  fs.writeFileSync(
    path.join(root, dir, name, "SKILL.md"),
    `---\nname: ${name}\ndescription: Use when testing.\n---\n`,
  );
}

const claudePath = (name) => path.join(root, ".claude", "skills", name);
const sharedPath = (name) => path.join(root, ".agents", "skills", name);
const isLinkTo = (name) =>
  fs.lstatSync(claudePath(name)).isSymbolicLink() &&
  fs.realpathSync(claudePath(name)) === fs.realpathSync(sharedPath(name));

test("links every shared skill into Claude Code's folder", () => {
  addSkill(".agents/skills", "grilling");
  addSkill(".agents/skills", "to-spec");

  const result = linkSkills({ root });

  assert.deepEqual(result.linked, ["grilling", "to-spec"]);
  assert.ok(isLinkTo("grilling"));
  assert.ok(isLinkTo("to-spec"));
  assert.ok(fs.existsSync(path.join(claudePath("grilling"), "SKILL.md")));
});

test("running it again changes nothing", () => {
  addSkill(".agents/skills", "grilling");
  linkSkills({ root });

  const second = linkSkills({ root });

  assert.deepEqual(second, {
    adopted: [],
    linked: [],
    pruned: [],
    skipped: [],
  });
  assert.ok(isLinkTo("grilling"));
});

test("adopts a skill Claude Code created in its own folder", () => {
  addSkill(".claude/skills", "check-migrations");

  const result = linkSkills({ root });

  assert.deepEqual(result.adopted, ["check-migrations"]);
  assert.ok(
    fs.existsSync(path.join(sharedPath("check-migrations"), "SKILL.md")),
  );
  assert.ok(isLinkTo("check-migrations"));
});

test("leaves the Claude-only coach skills where they are", () => {
  addSkill(".claude/skills", "reporter");
  addSkill(".claude/skills", "retrospective");

  const result = linkSkills({ root });

  assert.deepEqual(result.adopted, []);
  assert.ok(!fs.existsSync(sharedPath("reporter")));
  assert.ok(!fs.lstatSync(claudePath("reporter")).isSymbolicLink());
  assert.ok(!fs.lstatSync(claudePath("retrospective")).isSymbolicLink());
});

test("never overwrites when a real folder and a shared skill share a name", () => {
  addSkill(".agents/skills", "grilling");
  addSkill(".claude/skills", "grilling");
  fs.writeFileSync(path.join(claudePath("grilling"), "notes.md"), "keep me");

  const result = linkSkills({ root });

  assert.deepEqual(result.skipped, ["grilling"]);
  assert.equal(
    fs.readFileSync(path.join(claudePath("grilling"), "notes.md"), "utf8"),
    "keep me",
  );
  assert.ok(fs.existsSync(path.join(sharedPath("grilling"), "SKILL.md")));
});

test("removes links to skills that no longer exist", () => {
  addSkill(".agents/skills", "old-skill");
  linkSkills({ root });
  fs.rmSync(sharedPath("old-skill"), { recursive: true });

  const result = linkSkills({ root });

  assert.deepEqual(result.pruned, ["old-skill"]);
  assert.equal(fs.existsSync(claudePath("old-skill")), false);
});

test("works on a repo with no skills yet", () => {
  const result = linkSkills({ root });

  assert.deepEqual(result, {
    adopted: [],
    linked: [],
    pruned: [],
    skipped: [],
  });
  assert.ok(fs.existsSync(path.join(root, ".claude", "skills")));
});
