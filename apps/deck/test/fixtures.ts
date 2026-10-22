// The observation fixtures the scripts are tested with: the same files, so deck and pipeline agree on the shape.
import { readdirSync, readFileSync } from "node:fs";

import type { Observation } from "../src/live/types";

// Set by vitest.config.ts: scripts/test/fixtures/observations/.
export const FIXTURES_DIR = process.env.OBSERVATION_FIXTURES!;

export function fixture(name: string): Observation {
  return JSON.parse(
    readFileSync(`${FIXTURES_DIR}${name}.json`, "utf8"),
  ) as Observation;
}

export function allFixtures(): Observation[] {
  return readdirSync(FIXTURES_DIR)
    .filter((file) => file.endsWith(".json"))
    .map((file) => fixture(file.replace(/\.json$/, "")));
}
