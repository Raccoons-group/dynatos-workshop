// The shapes the deck reads. They mirror .claude/skills/reporter/observation.schema.json, which is the source
// of truth: the live-data plugin validates every observation against it before the deck sees it.

export const PHASES = [
  "Exploring",
  "Specifying",
  "Spec reviewed",
  "Slicing",
  "Building",
  "Reviewing",
  "PR ready",
] as const;
export type Phase = (typeof PHASES)[number];

export type Evidence = { file: string; quote: string };
export type Call = "in" | "out" | "open";
export type Decision = { call: Call; line: string; evidence: Evidence[] };
export type Artifact = {
  present: boolean;
  firstSeenAt: string | null;
  lastChangedAt: string | null;
};
export type CiResult = "pass" | "fail" | "cancelled";

// The epic's seven open points, in the order every view shows them.
export const DECISIONS = [
  ["join", "How colleagues join"],
  ["deadline", "The deadline"],
  ["multipleRestaurants", "Several restaurants"],
  ["editRights", "Who changes what"],
  ["splitBill", "Splitting the bill"],
  ["minimumOrderAndFee", "Minimum order and fee"],
  ["kitchenPerPerson", "Kitchen per person"],
] as const;
export type DecisionKey = (typeof DECISIONS)[number][0];

export type Observation = {
  group: string;
  pr: number;
  sha: string;
  reportedAt: string;
  schemaVersion: 1;
  facts: {
    phase: Phase;
    draft: boolean;
    specReviewedAt: string | null;
    ci: { result: CiResult; at: string } | null;
    firstGreenAt: string | null;
    artifacts: Record<
      "agentsMd" | "glossary" | "spec" | "tickets" | "review" | "howWeWorked",
      Artifact
    >;
    skillsWritten: string[];
    areasTouched: Record<
      "api" | "web" | "apiTests" | "webTests" | "agentContext" | "workingOut",
      boolean
    >;
    testsAdded: string[];
    review: {
      rounds: number;
      findings: {
        actOn: number;
        consider: number;
        noted: number;
        dismissed: number;
      };
    };
    lastPushAt: string;
  };
  judgements: {
    now: string;
    notable: string;
    decisions: Record<DecisionKey, Decision>;
    acceptanceExamples: {
      example: string;
      test: string | null;
      evidence: Evidence[];
    }[];
    slices: {
      name: string;
      hasProof: boolean;
      status: "planned" | "building" | "shipped";
      evidence: Evidence[];
    }[];
    reviewHeadline: string | null;
    agentGotWrong: { item: string; twice: boolean; evidence: Evidence[] }[];
  };
};

export type PullRequestSummary = {
  number: number;
  title: string;
  state: string;
  isDraft: boolean;
  headRefName: string;
  baseRefName: string;
  updatedAt: string;
};

// Written by the sync script next to the data branch's checkout.
export type LiveMeta = {
  lastFetchAt: string | null;
  lastFetchError: string | null;
  prs: PullRequestSummary[];
};

export type LiveSnapshot = {
  groups: Record<string, Observation>;
  // Every other JSON file at the top of the data branch (the retrospective, the library list, the plan).
  docs: Record<string, unknown>;
  meta: LiveMeta | null;
  readAt: string;
  // Files the deck is ignoring right now, because they don't parse or don't match the schema.
  rejected: string[];
};
