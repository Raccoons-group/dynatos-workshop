import { execFileSync } from "node:child_process";

// Runs git in `dir` and returns stdout without the trailing newline.
export function git(dir, args, { encoding = "utf8", env } = {}) {
  const out = execFileSync("git", args, {
    cwd: dir,
    encoding,
    maxBuffer: 64 * 1024 * 1024,
    stdio: ["ignore", "pipe", "pipe"],
    env: env ? { ...process.env, ...env } : process.env,
  });
  return encoding === "buffer" ? out : out.replace(/\n$/, "");
}

export function gitOk(dir, args) {
  try {
    git(dir, args);
    return true;
  } catch {
    return false;
  }
}
