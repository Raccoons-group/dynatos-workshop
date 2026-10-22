import { readFileSync } from "node:fs";

import { describe, expect, test } from "vitest";

import { repoFile, repoFolder } from "../src/exhibits/files";
import {
  excerpt,
  glossaryExhibit,
  mapExhibit,
  section,
  skillMeta,
  skillsExhibit,
} from "../src/exhibits/parse";
import { lastUpdate, prRows } from "../src/live/prs";
import type { LiveMeta } from "../src/live/types";

const skill = (name: string, description = `What ${name} does.`) =>
  `---\nname: ${name}\ndescription: ${description}\n---\n\nThe body.\n`;

describe("the exhibits read this repo's own files", () => {
  test("every file an exhibit shows is found", () => {
    for (const path of [
      "AGENTS.md",
      "docs/agents-md-template.md",
      ".github/workflows/guard.yml",
      ".scratch/workshop/map.md",
      ".scratch/workshop/GLOSSARY.md",
    ])
      expect(repoFile(path), path).not.toBe("");
    expect(Object.keys(repoFolder(".agents/skills/")).length).toBeGreaterThan(
      5,
    );
  });

  test("the map: one decision per resolved ticket, the fog, and what's out of scope", () => {
    const map = mapExhibit(repoFile(".scratch/workshop/map.md"));
    const raw = readFileSync(
      new URL("../../../.scratch/workshop/map.md", import.meta.url),
      "utf8",
    );

    expect(map.decisions).toHaveLength(
      section(raw, "Decisions so far").filter((l) => l.startsWith("- ")).length,
    );
    expect(map.decisions[0]!.title).not.toMatch(/[[\]()]/);
    expect(map.outOfScope).toContain("Pre-workshop survey");
  });
});

describe("parsing", () => {
  test("a section ends at the next heading of the same level", () => {
    expect(section("# A\n## One\nx\n### Sub\ny\n## Two\nz", "One")).toEqual([
      "x",
      "### Sub",
      "y",
    ]);
    expect(section("## Other\nx", "One")).toEqual([]);
  });

  test("a map's decisions, fog and out of scope, as plain text", () => {
    const map = mapExhibit(
      [
        "## Decisions so far",
        "<!-- one line per ticket -->",
        "- [Pick the `deck` framework](issues/01-x.md): Slidev, for its **notes**",
        "## Not yet specified",
        "- [How groups review](issues/02-y.md)",
        "## Out of scope",
        "- **Route planning.** Not this workshop.",
      ].join("\n"),
    );

    expect(map).toEqual({
      decisions: [
        { title: "Pick the deck framework", gist: "Slidev, for its notes" },
      ],
      open: ["How groups review"],
      outOfScope: ["Route planning"],
    });
  });

  test("a glossary's terms and the words to avoid, capped per section", () => {
    const glossary = glossaryExhibit(
      [
        "### People",
        "**Coach**:",
        "A Raccoons person.",
        "_Avoid_: trainer, lead (a lead runs a block), teacher",
        "**Group**:",
        "Three or four participants.",
        "**Pair**:",
        "Two people.",
      ].join("\n"),
      2,
    );

    expect(glossary.sections).toEqual([
      {
        title: "People",
        terms: [
          { term: "Coach", avoid: ["trainer", "lead", "teacher"] },
          { term: "Group", avoid: [] },
        ],
        more: 1,
      },
    ]);
  });

  test("a skill's name and description from its frontmatter", () => {
    expect(skillMeta(skill("tdd", '"Red, green, refactor."'))).toEqual({
      name: "tdd",
      description: "Red, green, refactor.",
    });
    expect(skillMeta("No frontmatter")).toEqual({ name: "", description: "" });
  });

  test("the toolkit lights a station's skill once its folder exists", () => {
    const skills = skillsExhibit({
      ".agents/skills/to-spec/SKILL.md": skill("to-spec"),
      ".agents/skills/wayfinder/SKILL.md": skill("wayfinder"),
    });

    const specify = skills.toolkit.find((s) => s.station === "Specify")!;
    const read = skills.toolkit.find((s) => s.station === "Read")!;
    expect(specify.skills).toEqual([{ name: "to-spec", present: true }]);
    expect(read.skills).toEqual([{ name: "read-issue", present: false }]);
    expect(skills.others.map((s) => s.name)).toEqual(["wayfinder"]);
  });

  test("a file excerpt says how many lines didn't fit", () => {
    expect(excerpt("a\nb\nc\n", 2)).toEqual({ lines: ["a", "b"], more: 1 });
    expect(excerpt("a\n", 5)).toEqual({ lines: ["a"], more: 0 });
  });
});

describe("the PR list and the footer", () => {
  const meta: LiveMeta = {
    lastFetchAt: "2026-10-27T12:41:00Z",
    lastFetchError: null,
    prs: [
      {
        number: 3,
        title: "Group A",
        state: "OPEN",
        isDraft: true,
        headRefName: "group-a/group-orders",
        baseRefName: "group-a/main",
        updatedAt: "2026-10-27T12:40:00Z",
      },
      {
        number: 7,
        title: "A skill",
        state: "MERGED",
        isDraft: false,
        headRefName: "lab/x",
        baseRefName: "main",
        updatedAt: "2026-10-28T10:00:00Z",
      },
      {
        number: 5,
        title: "Group B",
        state: "OPEN",
        isDraft: false,
        headRefName: "group-b/group-orders",
        baseRefName: "group-b/main",
        updatedAt: "2026-10-27T12:40:00Z",
      },
      {
        number: 1,
        title: "Old",
        state: "CLOSED",
        isDraft: false,
        headRefName: "x",
        baseRefName: "main",
        updatedAt: "2026-10-20T10:00:00Z",
      },
    ],
  };

  test("newest first, with draft, open, merged or closed", () => {
    expect(prRows(meta).map((r) => [r.number, r.state])).toEqual([
      [7, "merged"],
      [5, "open"],
      [3, "draft"],
      [1, "closed"],
    ]);
    expect(prRows(meta, 2)).toHaveLength(2);
    expect(prRows(null)).toEqual([]);
  });

  test("the footer says when the deck last heard from GitHub, in workshop time", () => {
    expect(lastUpdate(meta)).toBe("last update from GitHub 13:41");
    expect(lastUpdate({ ...meta, lastFetchError: "fetch failed" })).toBe(
      "offline · last update from GitHub 13:41",
    );
    expect(lastUpdate(null)).toBe("not synced with GitHub yet");
  });
});
