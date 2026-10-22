import { describe, expect, test } from "vitest";

import { fogGrid } from "../src/live/fog";
import { reviewCards } from "../src/live/reviews";
import { standupCard } from "../src/live/standup";
import { tonightRows } from "../src/live/tonight";
import { DECISIONS, type Observation } from "../src/live/types";
import { demoCard } from "../src/live/wall";
import { allFixtures, fixture } from "./fixtures";

const asDemo = (o: Observation): Observation => ({ ...o, group: "demo" });
const day1 = () => [
  fixture("group-c"),
  asDemo(fixture("group-late")),
  fixture("group-a"),
  fixture("group-b"),
];

// Every evidence quote and file in the fixtures. A view never shows evidence, and evidence is where a person's
// name would turn up.
const evidenceStrings = allFixtures().flatMap((o) =>
  [
    ...Object.values(o.judgements.decisions).flatMap((d) => d.evidence),
    ...o.judgements.acceptanceExamples.flatMap((e) => e.evidence),
    ...o.judgements.slices.flatMap((s) => s.evidence),
    ...o.judgements.agentGotWrong.flatMap((w) => w.evidence),
  ].flatMap((e) => [e.file, e.quote]),
);

describe("every Day 1 group view", () => {
  const views = {
    fog: fogGrid(day1()),
    reviews: reviewCards(day1()),
    tonight: tonightRows(day1()),
  };

  test("lists the groups in fixed order, with the demo left out", () => {
    expect(views.fog.columns.map((c) => c.group)).toEqual([
      "group-a",
      "group-b",
      "group-c",
    ]);
    expect(views.reviews.map((c) => c.group)).toEqual([
      "group-a",
      "group-b",
      "group-c",
    ]);
    expect(views.tonight.map((r) => r.group)).toEqual([
      "group-a",
      "group-b",
      "group-c",
    ]);
    expect(standupCard(day1(), "demo")).toBeNull();
  });

  test("shows no evidence, so no names", () => {
    const shown = JSON.stringify([
      views,
      standupCard([fixture("group-late")], "group-late"),
    ]);
    for (const s of evidenceStrings) expect(shown).not.toContain(s);
  });
});

describe("Same fog, three readings", () => {
  test("the seven open points in the epic's order, each with every group's call and line", () => {
    const grid = fogGrid(day1());

    expect(grid.rows.map((r) => r.title)).toEqual(DECISIONS.map(([, t]) => t));
    expect(grid.rows.find((r) => r.key === "deadline")!.cells).toEqual([
      expect.objectContaining({ group: "group-a", call: "in" }),
      expect.objectContaining({ group: "group-b", call: "open" }),
      expect.objectContaining({ group: "group-c", call: "open" }),
    ]);
  });

  test("marks the checkpoint and the examples a found test covers", () => {
    const [a, b, c] = fogGrid(day1()).columns;

    expect(a!.specReviewed).toBe("14:35");
    expect(b!.specReviewed).toBeNull();
    expect(b!.examples.map((e) => e.inTest)).toEqual([true, false]);
    expect(c!.examples).toEqual([]);
  });

  test("an example naming a test the scripts didn't find doesn't count as covered", () => {
    const o = fixture("group-b");
    o.judgements.acceptanceExamples[1]!.test = "A_test_nobody_wrote";

    const [column] = fogGrid([o]).columns;

    expect(column!.examples.map((e) => e.inTest)).toEqual([true, false]);
  });
});

describe("What the reviewers found", () => {
  test("rounds, findings per bucket in REVIEW.md's order, the headline and CI, and no total", () => {
    const [card] = reviewCards([fixture("group-late")]);

    expect(card).toEqual({
      group: "group-late",
      label: "Group LATE",
      rounds: "2 rounds",
      buckets: [
        { name: "Act on", count: 3 },
        { name: "Consider", count: 2 },
        { name: "Noted", count: 1 },
        { name: "Dismissed", count: 1 },
      ],
      headline: "Two acceptance examples still have no test",
      ci: "pass",
    });
  });

  test("before a first round: no buckets at all", () => {
    const [card] = reviewCards([fixture("group-c")]);

    expect(card!.rounds).toBe("not reviewed yet");
    expect(card!.buckets).toEqual([]);
    expect(card!.ci).toBe("fail");
  });
});

describe("the stand-up card", () => {
  test("the phase, slices, examples, first green, skills and what the agent got wrong", () => {
    const card = standupCard([fixture("group-late")], "group-late")!;

    expect(card.phase).toBe("Reviewing");
    expect(card.stations.find((s) => s.state === "current")?.name).toBe(
      "Review",
    );
    expect(card.slices.map((s) => s.status)).toEqual([
      "shipped",
      "building",
      "planned",
    ]);
    expect(card.shipped).toBe("1 of 3 shipped");
    expect(card.covered).toBe("2 of 3 in tests");
    expect(card.firstGreen).toBe("15:48");
    expect(card.skillsWritten).toEqual(["check-group-deadline"]);
    expect(card.agentGotWrong).toEqual([
      { item: "Assumed colleagues need an account to join", twice: true },
    ]);
  });

  test("counts follow the lists", () => {
    const o = fixture("group-late");
    o.judgements.slices.push({
      name: "A fourth slice",
      hasProof: true,
      status: "shipped",
      evidence: [],
    });

    expect(standupCard([o], "group-late")!.shipped).toBe("2 of 4 shipped");
  });

  test("early in the day it says what isn't there yet", () => {
    const card = standupCard(day1(), "group-c")!;

    expect(card.shipped).toBe("none yet");
    expect(card.covered).toBe("none yet");
    expect(card.firstGreen).toBeNull();
  });

  test("a group without a PR has no card", () => {
    expect(standupCard(day1(), "group-d")).toBeNull();
  });
});

describe("Tonight", () => {
  test("the last push and which working-out files have landed", () => {
    const [a, b] = tonightRows(day1());

    expect(a!.lastPush).toBe("14:40");
    expect(Object.fromEntries(a!.items.map((i) => [i.name, i.done]))).toEqual({
      "AGENTS.md": true,
      Glossary: true,
      Spec: true,
      Tickets: false,
      Review: false,
      "How-we-worked": true,
    });
    // Only the stub open-pr committed: not done yet.
    expect(b!.items.find((i) => i.name === "AGENTS.md")!.done).toBe(false);
  });
});

describe("the demo card", () => {
  test("only the demo's observation, as a mini ribbon", () => {
    const card = demoCard(day1(), {
      now: new Date("2026-10-27T16:35:00+01:00"),
    });

    expect(card!.group).toBe("demo");
    expect(card!.label).toBe("Demo");
    expect(card!.firstGreen).toBe("15:48");
  });

  test("nothing until the demo's draft PR is observed", () => {
    expect(demoCard([fixture("group-a")])).toBeNull();
  });
});
