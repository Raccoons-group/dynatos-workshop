// The retrospective document: one retrospective.json for all groups at the root of the live-deck-data branch.
// scripts/team-signals.mjs writes its `signals`; the retrospective skill writes the other sections. Each writer
// replaces only its own sections, so either can run first, and a second signals run never loses the synthesis.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { capStrings, loadSchema, validate } from "./schema.mjs";

export const RETROSPECTIVE_FILE = "retrospective.json";
export const RETROSPECTIVE_SCHEMA = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  "..",
  ".claude",
  "skills",
  "retrospective",
  "retrospective.schema.json",
);

export function emptyRetrospective(updatedAt) {
  return {
    schemaVersion: 1,
    status: "signals",
    updatedAt,
    sources: [],
    routes: [],
    isThisYou: [],
    decisions: [],
    signals: null,
    driving: [],
    mistakes: [],
    shortlist: [],
  };
}

// Schema errors, plus every claim without evidence: the validator has no minItems, so this says "at least one".
export function checkRetrospective(
  doc,
  { schemaFile = RETROSPECTIVE_SCHEMA } = {},
) {
  const errors = validate(loadSchema(schemaFile), doc);
  const walk = (value, at) => {
    if (Array.isArray(value)) {
      value.forEach((item, i) => walk(item, `${at}/${i}`));
    } else if (value && typeof value === "object") {
      if (
        "confidence" in value &&
        !(Array.isArray(value.evidence) && value.evidence.length > 0)
      )
        errors.push(`${at || "/"}: a claim needs at least one evidence item`);
      for (const [key, child] of Object.entries(value))
        walk(child, `${at}/${key}`);
    }
  };
  walk(doc, "");
  return errors;
}

// Merges `update` into the data branch's retrospective.json (or a new, empty one), caps strings to the schema,
// and writes it only when it's valid. Returns the file's path relative to the data folder.
export function writeRetrospective({
  dataDir,
  update,
  updatedAt = new Date().toISOString(),
  schemaFile = RETROSPECTIVE_SCHEMA,
}) {
  const file = path.join(dataDir, RETROSPECTIVE_FILE);
  let current = emptyRetrospective(updatedAt);
  if (fs.existsSync(file)) {
    try {
      current = JSON.parse(fs.readFileSync(file, "utf8"));
    } catch {
      throw new Error(
        `${RETROSPECTIVE_FILE} on the data branch doesn't parse. Fix it by hand first: it may hold the synthesis.`,
      );
    }
  }
  const doc = capStrings(loadSchema(schemaFile), {
    ...current,
    ...update,
    updatedAt,
  });
  const errors = checkRetrospective(doc, { schemaFile });
  if (errors.length) {
    const error = new Error(
      `The retrospective doesn't match the schema:\n${errors.map((e) => `  ${e}`).join("\n")}`,
    );
    error.errors = errors;
    throw error;
  }
  fs.writeFileSync(file, JSON.stringify(doc, null, 2) + "\n");
  return RETROSPECTIVE_FILE;
}
