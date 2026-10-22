#!/usr/bin/env node
// The CI guard for the cross-tool rules (`pnpm skills:check`). Fails when:
// - a CLAUDE.md or a Copilot instructions file exists: one root AGENTS.md is read by every tool, and Claude Code
//   ignores AGENTS.md whenever a CLAUDE.md is present;
// - a shared skill's name isn't its folder name, or isn't lowercase letters and digits with single hyphens;
// - a description is missing or longer than 1,024 characters;
// - a shared skill uses a frontmatter field that isn't portable across tools.

import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const PORTABLE_FIELDS = new Set([
  "name",
  "description",
  "license",
  "compatibility",
  "metadata",
  "disable-model-invocation",
]);
const NAME_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;

// The repo's files as git sees them: tracked plus untracked, minus anything gitignored.
function repoFiles(root) {
  const out = execFileSync(
    "git",
    ["ls-files", "--cached", "--others", "--exclude-standard", "-z"],
    {
      cwd: root,
      encoding: "utf8",
    },
  );
  return out
    .split("\0")
    .filter((file) => file && fs.existsSync(path.join(root, file)));
}

// Top-level keys of a YAML frontmatter block, plus the name and description as strings.
export function parseFrontmatter(text) {
  const lines = text.replace(/\r\n/g, "\n").split("\n");
  if (lines[0] !== "---") return null;
  const end = lines.indexOf("---", 1);
  if (end === -1) return null;

  const keys = [];
  const values = {};
  for (let i = 1; i < end; i++) {
    const match = /^([A-Za-z0-9_-]+):(.*)$/.exec(lines[i]);
    if (!match) continue;
    const [, key, raw] = match;
    keys.push(key);
    let value = raw.trim();
    if (/^[>|][+-]?$/.test(value)) {
      const block = [];
      while (
        i + 1 < end &&
        (lines[i + 1].startsWith(" ") || lines[i + 1] === "")
      )
        block.push(lines[++i].trim());
      value = value.startsWith(">")
        ? block.join(" ").trim()
        : block.join("\n").trim();
    } else if (/^(["']).*\1$/.test(value)) {
      value = value.slice(1, -1);
    }
    values[key] = value;
  }
  return { keys, values };
}

export function checkSkills({ root }) {
  const errors = [];
  const files = repoFiles(root);

  for (const file of files) {
    const base = path.basename(file);
    if (base.toLowerCase() === "claude.md") {
      errors.push(
        `${file}: no CLAUDE.md here. Put agent instructions in AGENTS.md, which every tool reads.`,
      );
    }
    if (
      file.replace(/\\/g, "/").toLowerCase() ===
      ".github/copilot-instructions.md"
    ) {
      errors.push(
        `${file}: no Copilot instructions file. Copilot reads AGENTS.md.`,
      );
    }
  }

  const shared = path.join(root, ".agents", "skills");
  const folders = fs.existsSync(shared)
    ? fs
        .readdirSync(shared, { withFileTypes: true })
        .filter((entry) => entry.isDirectory())
        .map((entry) => entry.name)
    : [];

  for (const folder of folders.sort()) {
    const where = `.agents/skills/${folder}`;
    const skillFile = path.join(shared, folder, "SKILL.md");
    if (!fs.existsSync(skillFile)) {
      errors.push(`${where}: no SKILL.md.`);
      continue;
    }
    const frontmatter = parseFrontmatter(fs.readFileSync(skillFile, "utf8"));
    if (!frontmatter) {
      errors.push(
        `${where}/SKILL.md: needs a frontmatter block between --- lines at the top.`,
      );
      continue;
    }
    const { keys, values } = frontmatter;

    if (!values.name)
      errors.push(`${where}/SKILL.md: name is missing. Set it to "${folder}".`);
    else if (values.name !== folder)
      errors.push(
        `${where}/SKILL.md: name "${values.name}" must equal the folder name "${folder}".`,
      );
    if (!NAME_PATTERN.test(folder) || folder.length > 64) {
      errors.push(
        `${where}: the folder name must be lowercase letters and digits joined by single hyphens, at most 64 characters.`,
      );
    }

    if (!values.description)
      errors.push(
        `${where}/SKILL.md: description is missing. Say when to use the skill.`,
      );
    else if (values.description.length > 1024) {
      errors.push(
        `${where}/SKILL.md: description is ${values.description.length} characters; at most 1,024 work in every tool.`,
      );
    }

    const extra = keys.filter((key) => !PORTABLE_FIELDS.has(key));
    if (extra.length) {
      errors.push(
        `${where}/SKILL.md: ${extra.join(", ")} isn't portable across tools. Use only: ${[...PORTABLE_FIELDS].join(", ")}.`,
      );
    }
  }

  return { errors, skills: folders.length };
}

if (
  process.argv[1] &&
  fileURLToPath(import.meta.url) === path.resolve(process.argv[1])
) {
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
  const { errors, skills } = checkSkills({ root });
  if (errors.length) {
    console.error(errors.map((error) => `✗ ${error}`).join("\n"));
    process.exit(1);
  }
  console.log(
    `✓ ${skills} shared skills, no CLAUDE.md or Copilot instructions file`,
  );
}
