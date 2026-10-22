<script setup lang="ts">
// A group's mini ribbon before anything has landed (slide 42): every station ahead, every thread dark.
import { stationsOf, type WallCard } from "../src/live/wall";
import WallCardView from "./WallCardView.vue";

const card: WallCard = {
  group: "your-group",
  label: "Your group",
  stations: stationsOf("Exploring").map((s) => ({ ...s, state: "todo" })),
  gatePassed: false,
  threads: { context: false, skills: false, checks: false },
  ci: "none",
  now: "Context lights when case/AGENTS.md and the glossary land",
  notable:
    "Skills light when you write or run one. Checks light when tests land and CI is green.",
  firstGreen: null,
  fresh: { stale: false, text: "" },
};
</script>

<template>
  <div class="rac-demo">
    <WallCardView :card="card" />
  </div>
</template>
