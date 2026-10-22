import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, test } from "vitest";

import {
  decisionsRevisited,
  drivingColumns,
  howThisWasMade,
  isThisYouCards,
  mistakesOnStations,
  routeLanes,
  shortlistByThread,
} from "../src/live/retro";
import type { Retrospective } from "../src/live/retrospective";
import { DECISIONS } from "../src/live/types";
import { FIXTURES_DIR } from "./fixtures";

// The same file the scripts' tests write and validate: scripts/test/fixtures/retrospective.json.
const retrospective = (): Retrospective =>
  JSON.parse(
    readFileSync(join(FIXTURES_DIR, "..", "retrospective.json"), "utf8"),
  ) as Retrospective;

// The demo slipped into every section, and the groups reversed: no view may show the one or follow the other.
function withDemo(): Retrospective {
  const doc = retrospective();
  const demo = <T extends { group: string }>(items: T[]) =>
    [...items, { ...items[0]!, group: "demo" }].reverse();
  doc.routes = demo(doc.routes);
  doc.isThisYou = demo(doc.isThisYou);
  doc.decisions = demo(doc.decisions);
  doc.driving = demo(doc.driving);
  doc.mistakes = demo(doc.mistakes);
  doc.shortlist = doc.shortlist.map((s) => ({
    ...s,
    groups: [...s.groups, "demo"],
  }));
  return doc;
}

// A view shows where a claim comes from, never its quote, which can name a person. So every quote gets a marker
// that must never reach a view.
const QUOTE = "QUOTE-NOT-SHOWN";
function withMarkedQuotes(doc: Retrospective): Retrospective {
  return JSON.parse(
    JSON.stringify(doc).replace(/"quote":"[^"]*"/g, `"quote":"${QUOTE}"`),
  ) as Retrospective;
}

describe("every retrospective view", () => {
  const views = () => {
    const doc = withMarkedQuotes(withDemo());
    return {
      made: howThisWasMade(doc),
      routes: routeLanes(doc),
      isThisYou: isThisYouCards(doc),
      decisions: decisionsRevisited(doc),
      driving: drivingColumns(doc),
      mistakes: mistakesOnStations(doc),
      shortlist: shortlistByThread(doc),
    };
  };

  test("keeps the groups in fixed order and leaves the demo out", () => {
    const v = views();
    const fixed = (groups: string[]) =>
      expect(groups).toEqual([...groups].sort());

    fixed(v.routes!.lanes.map((l) => l.group));
    fixed(v.isThisYou.map((c) => c.group));
    fixed(v.decisions!.columns.map((c) => c.group));
    fixed(v.driving.map((c) => c.group));
    expect(JSON.stringify(v)).not.toMatch(/"demo"|Demo/);
  });

  test("never shows a quote, only where a claim comes from", () => {
    const shown = JSON.stringify(views());
    expect(JSON.stringify(withMarkedQuotes(retrospective()))).toContain(QUOTE);
    expect(shown).not.toContain(QUOTE);
    expect(shown).toContain("work/group-a/spec.md");
  });

  test("shows nothing until there's a retrospective", () => {
    for (const doc of [undefined, null, {}, { schemaVersion: 2 }]) {
      expect(howThisWasMade(doc)).toBeNull();
      expect(routeLanes(doc)).toBeNull();
      expect(isThisYouCards(doc)).toEqual([]);
      expect(shortlistByThread(doc)).toEqual([]);
    }
  });
});

test("how this was made: the sources, the status, and the claims by confidence, counted from the file", () => {
  const made = howThisWasMade(retrospective())!;

  expect(made.status).toBe("a draft the coaches are still reviewing");
  expect(made.sources.map((s) => s.kind)).toContain("The coaches' log");
  const counted = made.claims.reduce((sum, c) => sum + c.count, 0);
  expect(counted).toBe(
    (
      JSON.stringify({ ...retrospective(), signals: null }).match(
        /"confidence":/g,
      ) ?? []
    ).length,
  );
});

test("routes: segments placed along the afternoon, with the checkpoint's label", () => {
  const routes = routeLanes(retrospective())!;
  const a = routes.lanes.find((l) => l.group === "group-a")!;

  expect(a.segments.map((s) => s.station)).toEqual([
    "Explore",
    "Specify",
    "Build",
  ]);
  // 11:10 is the left edge and 16:45 the right one.
  expect(a.segments[0]!.left).toBe(0);
  expect(a.segments[2]!.left + a.segments[2]!.width).toBeCloseTo(100);
  expect(routes.ticks[0]).toEqual({ label: "12:00", left: expect.any(Number) });
  expect(routes.lunch.width).toBeGreaterThan(0);
});

test("is this you: one claim per group, the least certain one", () => {
  const doc = retrospective();
  doc.isThisYou.push({
    ...doc.isThisYou[0]!,
    claim: "A surer claim",
    confidence: "high",
  });

  const cards = isThisYouCards(doc);

  expect(cards.map((c) => c.group)).toEqual(["group-a", "group-b"]);
  expect(cards[0]!.claim).not.toBe("A surer claim");
  expect(cards[1]!.correction).toBe("We forgot it, it wasn't on purpose");
});

test("the decision grid revisited: seven rows, and the rework a call caused", () => {
  const grid = decisionsRevisited(retrospective())!;

  expect(grid.rows.map((r) => r.key)).toEqual(DECISIONS.map(([k]) => k));
  const deadline = grid.rows.find((r) => r.key === "deadline")!;
  expect(deadline.cells[0]!.rework).toMatch(/after the checkpoint/);
});

test("mistakes sit on the station where they started, and the shortlist by thread", () => {
  const stations = mistakesOnStations(retrospective());
  const build = stations.find((s) => s.station === "Build")!;

  expect(stations.map((s) => s.station)).toEqual([
    "Explore",
    "Specify",
    "Slice",
    "Build",
    "Review",
    "Ship",
  ]);
  expect(build.mistakes.map((m) => m.repeated)).toContain(true);
  expect(shortlistByThread(retrospective()).map((c) => c.thread)).toEqual([
    "context",
    "skills",
    "checks",
  ]);
});
