import { fileURLToPath } from "node:url";

import { describe, expect, test } from "vitest";

import { loadSchema, validate } from "../../../scripts/lib/schema.mjs";
import { libraryList, toolsOf } from "../src/live/library";
import { planGrid } from "../src/live/plan";
import { libraryFixture, planFixture } from "./day2-fixtures";

const schema = (name: string) =>
  loadSchema(
    fileURLToPath(
      new URL(`../../../scripts/schemas/${name}.schema.json`, import.meta.url),
    ),
  );

describe("the library list", () => {
  test("the fixture matches the schema the script validates against", () => {
    expect(validate(schema("library"), libraryFixture())).toEqual([]);
  });

  test("a row per lab PR, in the order the PRs were opened", () => {
    const doc = libraryFixture();
    doc.entries.reverse();
    const { rows, updated } = libraryList(doc);

    expect(
      rows.map((row) => [row.pr, row.name, row.fixLevel, row.state]),
    ).toEqual([
      [41, "run-both-suites", "Skill", "merged"],
      [42, "Lockfile guard", "Check", "open"],
      [43, "explain-test-failure", "Skill", "open"],
      [44, "code-review", "Skill", "merged"],
      [
        47,
        "Test project names in the AGENTS.md template",
        "AGENTS.md line",
        "merged",
      ],
    ]);
    expect(updated).toBe("updated 10:55");
  });

  test("a skill shows every tool in a fixed order, lit where it passed; a fix shows none", () => {
    const { rows } = libraryList(libraryFixture());

    expect(rows[0]!.tools).toEqual([
      { name: "Claude Code", passed: true },
      { name: "Codex", passed: false },
      { name: "Copilot", passed: true },
    ]);
    expect(rows[1]!.tools).toBeNull();
  });

  test("a pair's extra tool comes after the workshop's three", () => {
    expect(toolsOf(["Cursor", "Codex"]).map((t) => [t.name, t.passed])).toEqual(
      [
        ["Claude Code", false],
        ["Codex", true],
        ["Copilot", false],
        ["Cursor", true],
      ],
    );
  });

  test("a PR that doesn't say its fix level shows a dash", () => {
    const doc = libraryFixture();
    doc.entries[1]!.fixLevel = null;

    expect(libraryList(doc).rows[1]!.fixLevel).toBe("—");
  });

  test("a missing or malformed file draws nothing, and a malformed entry is left out", () => {
    for (const doc of [undefined, null, "", { entries: "x" }, { entries: [] }])
      expect(libraryList(doc)).toEqual({ rows: [], updated: "" });

    const doc = libraryFixture() as unknown as { entries: unknown[] };
    doc.entries.push(
      { pr: 50, name: "half-written" },
      { ...libraryFixture().entries[0], pr: 51, fixLevel: "rung" },
      { ...libraryFixture().entries[0], pr: 52, state: "closed" },
    );
    expect(libraryList(doc).rows.map((row) => row.pr)).toEqual([
      41, 42, 43, 44, 47,
    ]);
  });
});

describe("the action-plan grid", () => {
  test("the fixture matches the schema the script validates against", () => {
    expect(validate(schema("action-plan"), planFixture())).toEqual([]);
  });

  test("always the four rows, in order, with the group that drafted each", () => {
    const { rows } = planGrid(planFixture());

    expect(rows.map((row) => [row.label, row.draftedBy, row.filled])).toEqual([
      ["Route", null, true],
      ["Context", "Group A", true],
      ["Skills", "Group B", true],
      ["Checks", null, false],
    ]);
  });

  test("candidates as drafted, up to three per cell", () => {
    const skills = planGrid(planFixture()).rows[2]!;

    expect(skills.quickWins.map((c) => c.item)).toEqual([
      "Finish the lab's open skill PRs",
      "Port read-issue to our tracker",
      "A release-notes skill",
    ]);
    expect(skills.longerSteps).toEqual([
      {
        item: "A build skill per repo",
        why: "every card about builds",
        chosen: false,
      },
    ]);
  });

  test("before the vote nothing is chosen", () => {
    const doc = planFixture();
    for (const row of doc.rows)
      row.chosen = { quickWin: null, longerStep: null };
    const grid = planGrid(doc);

    expect(grid.voted).toBe(false);
    expect(grid.rows[0]!.filled).toBe(false);
  });

  test("after the vote the winners are marked, and a winner without a draft still shows", () => {
    const grid = planGrid(planFixture());

    expect(grid.voted).toBe(true);
    expect(grid.rows[1]!.quickWins.map((c) => c.chosen)).toEqual([true, false]);
    expect(grid.rows[0]!.quickWins).toEqual([
      { item: "Spec review before any code", why: "", chosen: true },
    ]);
  });

  test("a winner typed a little differently marks its candidate, without a duplicate", () => {
    const doc = planFixture();
    doc.rows[1]!.chosen.quickWin = "a short AGENTS.md per service.";
    const context = planGrid(doc).rows[1]!;

    expect(context.quickWins.map((c) => [c.item, c.chosen])).toEqual([
      ["A short AGENTS.md per service", true],
      ["A glossary page in each repo", false],
    ]);
  });

  test("never shows a person: a heading that names one isn't a group", () => {
    const doc = planFixture();
    doc.rows[1]!.draftedBy = "Alex";

    expect(planGrid(doc).rows[1]!.draftedBy).toBeNull();
  });

  test("a missing or malformed file draws four empty rows", () => {
    for (const doc of [
      undefined,
      null,
      { rows: "x" },
      { rows: [{ thread: "other" }] },
    ]) {
      const grid = planGrid(doc);
      expect(grid.rows.map((row) => row.filled)).toEqual([
        false,
        false,
        false,
        false,
      ]);
      expect(grid.voted).toBe(false);
    }
    const doc = planFixture() as unknown as {
      rows: { quickWins: unknown[] }[];
    };
    doc.rows[2]!.quickWins.push({ item: 3 }, "loose text");

    expect(planGrid(doc).rows[2]!.quickWins).toHaveLength(3);
  });

  test("updated at, in the workshop's time", () => {
    expect(planGrid(planFixture()).updated).toBe("updated 12:10");
  });
});
