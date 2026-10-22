import { describe, expect, test } from "vitest";

import { stationsOf, threadsOf, wallCards } from "../src/live/wall";
import { allFixtures, fixture } from "./fixtures";

const at = (time: string) => new Date(`2026-10-27T${time}:00+01:00`);

describe("wall cards", () => {
  test("one card per group, in group order, with the demo left out", () => {
    const demo = { ...fixture("group-b"), group: "demo" };
    const cards = wallCards([fixture("group-c"), demo, fixture("group-a")], {
      now: at("14:45"),
    });

    expect(cards.map((card) => card.group)).toEqual(["group-a", "group-c"]);
    expect(cards.map((card) => card.label)).toEqual(["Group A", "Group C"]);
  });

  test("a group past the checkpoint: Specify current, gate passed, context lit", () => {
    const [card] = wallCards([fixture("group-a")], { now: at("14:45") });

    expect(card!.stations.map((s) => s.state)).toEqual([
      "done",
      "current",
      "todo",
      "todo",
      "todo",
      "todo",
    ]);
    expect(card!.gatePassed).toBe(true);
    expect(card!.threads).toEqual({
      context: true,
      skills: false,
      checks: false,
    });
    expect(card!.ci).toBe("pass");
    expect(card!.firstGreen).toBeNull();
    expect(card!.fresh).toEqual({ stale: false, text: "updated 14:40" });
  });

  test("a group in review: Review current, every thread lit, first green shown", () => {
    const [card] = wallCards([fixture("group-late")], { now: at("16:35") });

    expect(card!.stations.find((s) => s.state === "current")?.name).toBe(
      "Review",
    );
    expect(card!.threads).toEqual({
      context: true,
      skills: true,
      checks: true,
    });
    expect(card!.firstGreen).toBe("15:48");
  });

  test("a group that hasn't pushed for a while goes stale", () => {
    const [card] = wallCards([fixture("group-a")], {
      now: at("15:30"),
      staleAfterMinutes: 40,
    });

    expect(card!.fresh).toEqual({ stale: true, text: "stale since 14:40" });
  });

  test("times are local to the workshop, whatever the laptop's zone", () => {
    const o = fixture("group-a");
    o.facts.lastPushAt = "2026-10-27T13:40:30Z";

    expect(wallCards([o], { now: at("14:45") })[0]!.fresh.text).toBe(
      "updated 14:40",
    );
  });

  test("every fixture renders a card without throwing", () => {
    expect(wallCards(allFixtures(), { now: at("16:35") })).toHaveLength(4);
  });
});

describe("threads", () => {
  test("context stays dark while AGENTS.md is only the stub", () => {
    const o = fixture("group-a");
    o.facts.artifacts.agentsMd.lastChangedAt =
      o.facts.artifacts.agentsMd.firstSeenAt;

    expect(threadsOf(o).context).toBe(false);
  });

  test("checks need tests and a green CI", () => {
    const o = fixture("group-late");
    o.facts.ci = { result: "fail", at: "2026-10-27T16:31:10+01:00" };

    expect(threadsOf(o).checks).toBe(false);
  });

  test("a group that built before its checkpoint shows Build with the gate open", () => {
    const o = fixture("group-b");
    o.facts.phase = "Building";
    o.facts.specReviewedAt = null;
    const [card] = wallCards([o], { now: at("14:45") });

    expect(card!.stations.find((s) => s.state === "current")?.name).toBe(
      "Build",
    );
    expect(card!.gatePassed).toBe(false);
  });
});

test("PR ready puts the group at Ship", () => {
  expect(stationsOf("PR ready").at(-1)).toEqual({
    name: "Ship",
    state: "current",
  });
});
