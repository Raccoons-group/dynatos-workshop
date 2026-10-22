// @vitest-environment happy-dom
import { mount } from "@vue/test-utils";
import { expect, test } from "vitest";

import WallView from "../components/WallView.vue";
import { wallCards } from "../src/live/wall";
import { fixture } from "./fixtures";

const hostile = () => {
  const o = fixture("group-c");
  o.judgements.now = '<img src=x onerror="alert(1)"> **bold**';
  o.judgements.notable = "[click](javascript:alert(1))";
  return o;
};

test("strings from a PR render as literal text, never as markup", () => {
  const wrapper = mount(WallView, {
    props: {
      cards: wallCards([hostile()], { now: new Date("2026-10-27T13:45:00Z") }),
    },
  });

  expect(wrapper.find("img").exists()).toBe(false);
  expect(wrapper.find("a").exists()).toBe(false);
  expect(wrapper.find("strong").exists()).toBe(false);
  expect(wrapper.find(".rac-wall-now").text()).toBe(
    '<img src=x onerror="alert(1)"> **bold**',
  );
  expect(wrapper.find(".rac-wall-notable").text()).toBe(
    "[click](javascript:alert(1))",
  );
});

test("shows the ribbon, the gate and the lit threads", () => {
  const wrapper = mount(WallView, {
    props: {
      cards: wallCards([fixture("group-late")], {
        now: new Date("2026-10-27T15:35:00Z"),
      }),
    },
  });

  expect(wrapper.find(".rac-station-current").text()).toBe("Review");
  expect(wrapper.find(".rac-gate").classes()).toContain("rac-gate-passed");
  expect(wrapper.findAll(".rac-thread-lit").map((li) => li.text())).toEqual([
    "context",
    "skills",
    "checks",
  ]);
  expect(wrapper.text()).toContain("first green 15:48");
});

test("an empty wall says what will fill it", () => {
  expect(mount(WallView, { props: { cards: [] } }).text()).toContain(
    "fills as each group opens its draft PR",
  );
});
