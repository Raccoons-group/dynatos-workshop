import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { after, test } from "node:test";

import { leakCheck, readTerms } from "../leak-check.mjs";
import { commit, initRepo, tempDir } from "./helpers/repo.mjs";

// A test term list: made-up words, never the real ones.
const TERMS = ["Zorblax", "fizz.Now", "€99"];
const dirs = [];
after(() =>
  dirs.forEach((dir) => fs.rmSync(dir, { recursive: true, force: true })),
);

function repo(files) {
  const dir = tempDir("leak-");
  dirs.push(dir);
  initRepo(dir);
  commit(dir, files, { at: "2026-10-22T10:00:00+02:00" });
  return dir;
}

test("finds a term in any committed file outside the case's source, with file and line", () => {
  const dir = repo({
    "README.md": "# Hello\n\nThe Zorblax table.\n",
    "docs/notes.md": "Use fizz.Now here\n",
    "scripts/x.mjs": "// costs €99\n",
  });

  assert.deepEqual(leakCheck({ dir, terms: TERMS }), [
    { file: "README.md", line: 3, term: "Zorblax" },
    { file: "docs/notes.md", line: 1, term: "fizz.Now" },
    { file: "scripts/x.mjs", line: 1, term: "€99" },
  ]);
});

test("the case's source may name what's planted; its Markdown may not", () => {
  const dir = repo({
    "case/api/Zorblax.cs": "class Zorblax {}\n",
    "case/README.md": "Ask about the Zorblax.\n",
  });

  assert.deepEqual(
    leakCheck({ dir, terms: TERMS }).map((hit) => hit.file),
    ["case/README.md"],
  );
});

test("whole words only, case-sensitive", () => {
  const dir = repo({ "a.md": "Zorblaxes, zorblax and preZorblax are fine.\n" });

  assert.deepEqual(leakCheck({ dir, terms: TERMS }), []);
});

test("new files are checked before they're committed; ignored files never", () => {
  const dir = repo({ ".gitignore": "secret/\n", "a.md": "fine\n" });
  fs.mkdirSync(path.join(dir, "secret"));
  fs.writeFileSync(path.join(dir, "secret", "notes.md"), "Zorblax\n");
  fs.writeFileSync(path.join(dir, "new.md"), "Zorblax\n");

  assert.deepEqual(
    leakCheck({ dir, terms: TERMS }).map((hit) => hit.file),
    ["new.md"],
  );
});

test("the term list skips comments and blank lines, and must exist", () => {
  const dir = tempDir("terms-");
  dirs.push(dir);
  const file = path.join(dir, "terms.txt");
  fs.writeFileSync(file, "# planted\nZorblax\n\n  €99  # price\n");

  assert.deepEqual(readTerms(file), ["Zorblax", "€99"]);
  assert.throws(() => readTerms(path.join(dir, "missing.txt")), /No term list/);
});
