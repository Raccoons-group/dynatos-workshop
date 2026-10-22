<script setup lang="ts">
// The wall, projected through all of Day 1's group work: one mini ribbon per group.
import { computed } from "vue";

import { useLive } from "../composables/useLive";
import { wallCards } from "../src/live/wall";
import WallView from "./WallView.vue";

const live = useLive();
const cards = computed(() =>
  wallCards(Object.values(live.value?.groups ?? {})),
);
</script>

<template>
  <WallView :cards="cards" />
</template>
