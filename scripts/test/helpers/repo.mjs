// Throwaway git repos for the script tests.

import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

export function tempDir(prefix) {
  return fs.mkdtempSync(path.join(os.tmpdir(), prefix));
}

export function run(dir, args, env = {}) {
  return execFileSync("git", args, {
    cwd: dir,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
    env: { ...process.env, GIT_CONFIG_NOSYSTEM: "1", ...env },
  }).trim();
}

export function initRepo(dir, branch = "main") {
  run(dir, ["init", "-q", "-b", branch]);
  run(dir, ["config", "user.name", "Test"]);
  run(dir, ["config", "user.email", "test@example.com"]);
  run(dir, ["config", "commit.gpgsign", "false"]);
}

// Writes the files (null deletes one) and commits them at a fixed time, so timestamps are predictable.
export function commit(dir, files, { at, message = "change" }) {
  for (const [file, content] of Object.entries(files)) {
    const full = path.join(dir, file);
    if (content === null) fs.rmSync(full, { force: true });
    else {
      fs.mkdirSync(path.dirname(full), { recursive: true });
      fs.writeFileSync(full, content);
    }
  }
  run(dir, ["add", "-A"]);
  run(dir, ["commit", "-q", "-m", message], {
    GIT_AUTHOR_DATE: at,
    GIT_COMMITTER_DATE: at,
  });
  return run(dir, ["rev-parse", "HEAD"]);
}
