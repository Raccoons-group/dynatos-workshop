import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, expect, test } from "vitest";

import { createLiveReader } from "../src/live/plugin";
import { fixture } from "./fixtures";

let dir: string;
const write = (file: string, content: string) => {
  mkdirSync(join(dir, file, ".."), { recursive: true });
  writeFileSync(join(dir, file), content);
};
const json = (value: unknown) => JSON.stringify(value, null, 2);

beforeEach(() => {
  dir = mkdtempSync(join(tmpdir(), "live-"));
});
afterEach(() => {
  rmSync(dir, { recursive: true, force: true });
});

test("reads every group, the other data files and the sync's meta", () => {
  write("data/groups/group-a.json", json(fixture("group-a")));
  write("data/groups/group-b.json", json(fixture("group-b")));
  write("data/retrospective.json", json({ sections: [] }));
  write(
    "meta.json",
    json({
      lastFetchAt: "2026-10-27T13:41:00Z",
      lastFetchError: null,
      prs: [],
    }),
  );

  const snapshot = createLiveReader(dir).snapshot();

  expect(Object.keys(snapshot.groups)).toEqual(["group-a", "group-b"]);
  expect(snapshot.docs).toEqual({ retrospective: { sections: [] } });
  expect(snapshot.meta?.lastFetchAt).toBe("2026-10-27T13:41:00Z");
  expect(snapshot.rejected).toEqual([]);
});

test("a file caught mid-write keeps that group's last good observation", () => {
  const reader = createLiveReader(dir);
  write("data/groups/group-a.json", json(fixture("group-a")));
  reader.snapshot();

  const whole = json({ ...fixture("group-a"), sha: "aaaaaaa" });
  write("data/groups/group-a.json", whole.slice(0, whole.length / 2));
  const torn = reader.snapshot();

  expect(torn.groups["group-a"]?.sha).toBe("4f1c2e9");
  expect(torn.rejected).toEqual(["groups/group-a.json"]);

  write("data/groups/group-a.json", whole);
  expect(reader.snapshot().groups["group-a"]?.sha).toBe("aaaaaaa");
});

test("an observation that breaks the schema is ignored, never shown", () => {
  const reader = createLiveReader(dir);
  const broken = { ...fixture("group-c"), facts: { phase: "Partying" } };
  write("data/groups/group-c.json", json(broken));

  const snapshot = reader.snapshot();

  expect(snapshot.groups).toEqual({});
  expect(snapshot.rejected).toEqual(["groups/group-c.json"]);
});

test("works before the first sync: no data, no meta", () => {
  expect(createLiveReader(dir).snapshot()).toMatchObject({
    groups: {},
    docs: {},
    meta: null,
    rejected: [],
  });
});
