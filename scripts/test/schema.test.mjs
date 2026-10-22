import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

import { DEFAULT_SCHEMA } from "../publish-live-data.mjs";
import { capStrings, loadSchema, validate } from "../lib/schema.mjs";

const fixtures = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "fixtures",
  "observations",
);
const schema = loadSchema(DEFAULT_SCHEMA);
const fixture = (name) =>
  JSON.parse(fs.readFileSync(path.join(fixtures, name), "utf8"));

for (const name of fs
  .readdirSync(fixtures)
  .filter((file) => file.endsWith(".json"))) {
  test(`fixture ${name} matches the observation schema`, () => {
    assert.deepEqual(validate(schema, fixture(name)), []);
  });
}

test("reports a missing field, a wrong enum and an extra property", () => {
  const observation = fixture("group-late.json");
  delete observation.facts.lastPushAt;
  observation.facts.phase = "Testing";
  observation.judgements.score = 9;

  const errors = validate(schema, observation);

  assert.ok(errors.includes("/facts/lastPushAt: is required"));
  assert.ok(errors.some((e) => e.startsWith("/facts/phase: must be one of")));
  assert.ok(errors.includes("/judgements/score: isn't allowed"));
});

test("rejects a CI result that is neither null nor a result", () => {
  const observation = fixture("group-a.json");
  observation.facts.ci = { result: "green", at: "2026-10-27T14:41:02+01:00" };

  assert.ok(
    validate(schema, observation).includes(
      "/facts/ci: must match exactly one allowed shape",
    ),
  );
});

test("flags a string over its length", () => {
  const observation = fixture("group-a.json");
  observation.judgements.now = "x".repeat(101);

  assert.deepEqual(validate(schema, observation), [
    "/judgements/now: longer than 100 characters",
  ]);
});

test("caps over-long strings to the schema, including inside $refs and arrays", () => {
  const observation = fixture("group-late.json");
  observation.judgements.now = "x".repeat(300);
  observation.judgements.decisions.join.evidence = [
    { file: "work/group-late/spec.md", quote: "q".repeat(500) },
  ];

  const capped = capStrings(schema, observation);

  assert.equal([...capped.judgements.now].length, 100);
  assert.ok(capped.judgements.now.endsWith("…"));
  assert.equal(
    [...capped.judgements.decisions.join.evidence[0].quote].length,
    140,
  );
  assert.deepEqual(validate(schema, capped), []);
  assert.equal(
    observation.judgements.now.length,
    300,
    "the input isn't changed",
  );
});
