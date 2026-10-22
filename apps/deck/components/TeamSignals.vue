<script setup lang="ts">
// "Team signals, not volume", on Day 2: the signals script's numbers from retrospective.json.
import { computed } from "vue";

import { useLive } from "../composables/useLive";
import { signalsGrid } from "../src/live/signals";
import TeamSignalsView from "./TeamSignalsView.vue";

const live = useLive();
const grid = computed(() => signalsGrid(live.value?.docs.retrospective));
</script>

<template>
  <TeamSignalsView :grid="grid" />
</template>
