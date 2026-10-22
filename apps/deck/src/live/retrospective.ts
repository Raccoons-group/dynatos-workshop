// The shape of retrospective.json, which the deck reads as `snapshot.docs.retrospective`. It mirrors
// .claude/skills/retrospective/retrospective.schema.json, which is the source of truth: the signals script and the
// retrospective skill validate against it before they write.

import type { Call, DecisionKey } from "./types";
import type { Station } from "./wall";

export type Confidence = "high" | "medium" | "low";
export type RetroEvidence =
  | { kind: "file"; file: string; quote: string }
  | { kind: "commit"; sha: string }
  | {
      kind: "ci";
      sha: string;
      check: string;
      result: "pass" | "fail";
      at: string;
    }
  | { kind: "coach-observation" };
// Every claim carries at least one evidence item and a confidence.
export type Claim = { evidence: RetroEvidence[]; confidence: Confidence };
export type TextClaim = Claim & { text: string };

export type TicketRef = { ticket: string; title: string };
export type CiRun = { sha: string; at: string; result: "pass" | "fail" };

export type GroupSignals = {
  group: string;
  pr: number | null;
  from: string;
  head: string;
  timeToSpec: { labelledAt: string | null; minutes: number | null };
  specRework: { changes: { sha: string; at: string }[] };
  // A null ticket: the group's Status lines never moved, so the runs aren't split per slice.
  firstPassCi: {
    slices: { ticket: string | null; title: string | null; runs: CiRun[] }[];
  };
  reviewRounds: { rounds: number; file: string | null };
  drift: {
    planned: TicketRef[];
    shipped: TicketRef[];
    added: TicketRef[];
    dropped: TicketRef[];
    outsidePlan: string[];
  };
};

export type TeamSignals = {
  computedAt: string;
  timeZone: string;
  kickoff: string;
  lunch: { from: string; to: string };
  ciCheck: string;
  groups: GroupSignals[];
};

export type Retrospective = {
  schemaVersion: 1;
  status: "signals" | "draft" | "reviewed";
  updatedAt: string;
  sources: {
    kind: "git" | "pr-timeline" | "working-out" | "observations" | "coach-log";
    note: string;
  }[];
  routes: {
    group: string;
    segments: (Claim & {
      station: Station;
      from: string;
      to: string | null;
    })[];
  }[];
  isThisYou: (Claim & {
    group: string;
    claim: string;
    correction: string | null;
  })[];
  decisions: {
    group: string;
    calls: Record<
      DecisionKey,
      Claim & { call: Call; line: string; rework: string | null }
    >;
  }[];
  signals: TeamSignals | null;
  driving: {
    group: string;
    tool: string;
    tests: Claim & { order: "before" | "after" | "mixed" | "unknown" };
    corrections: TextClaim[];
    skillsFired: (Claim & { skill: string })[];
    steering: TextClaim | null;
    saidByTheGroup: TextClaim[];
    anecdotes: TextClaim[];
  }[];
  mistakes: (Claim & {
    group: string;
    text: string;
    station: Station;
    origin: "context" | "spec" | "check" | "review";
    repeated: boolean;
  })[];
  shortlist: (Claim & {
    item: string;
    groups: string[];
    thread: "context" | "skills" | "checks";
  })[];
};
