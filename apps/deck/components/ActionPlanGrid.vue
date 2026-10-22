<script setup lang="ts">
// The action-plan grid, live during Day 2's action plan: each merged row draft, then the vote's winners.
import { computed } from "vue";

import { useLive } from "../composables/useLive";
import { planGrid } from "../src/live/plan";
import ActionPlanGridView from "./ActionPlanGridView.vue";

const live = useLive();
const grid = computed(() => planGrid(live.value?.docs["action-plan"]));
</script>

<template>
  <ActionPlanGridView :grid="grid" />
</template>
