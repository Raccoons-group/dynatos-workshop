// "Same fog, three readings": the epic's seven open points down the side, one column per group, so the plenary
// after lunch compares how each group decided them. Pure functions, so the view stays a template.

import { groupLabel, hhmm } from "./format";
import {
  DECISIONS,
  type Call,
  type DecisionKey,
  type Observation,
} from "./types";
import { groupsOf } from "./wall";

export type AcceptanceExample = { example: string; inTest: boolean };

export type FogColumn = {
  group: string;
  label: string;
  // When a coach added `spec-reviewed`, as hh:mm, or null before the checkpoint.
  specReviewed: string | null;
  examples: AcceptanceExample[];
};

export type FogRow = {
  key: DecisionKey;
  title: string;
  cells: { group: string; call: Call; line: string }[];
};

export type FogGrid = { columns: FogColumn[]; rows: FogRow[] };

// An example counts as "in a test" only when the test it names is one the scripts found in the diff, so a test
// name the model made up never shows as covered.
export function examplesOf(o: Observation): AcceptanceExample[] {
  return o.judgements.acceptanceExamples.map(({ example, test }) => ({
    example,
    inTest: test !== null && o.facts.testsAdded.includes(test),
  }));
}

export function fogGrid(observations: Observation[]): FogGrid {
  const groups = groupsOf(observations);
  return {
    columns: groups.map((o) => ({
      group: o.group,
      label: groupLabel(o.group),
      specReviewed: o.facts.specReviewedAt
        ? hhmm(o.facts.specReviewedAt)
        : null,
      examples: examplesOf(o),
    })),
    rows: DECISIONS.map(([key, title]) => ({
      key,
      title,
      cells: groups.map((o) => ({
        group: o.group,
        call: o.judgements.decisions[key].call,
        line: o.judgements.decisions[key].line,
      })),
    })),
  };
}
