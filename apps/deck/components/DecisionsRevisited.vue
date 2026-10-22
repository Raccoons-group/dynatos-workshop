<script setup lang="ts">
// The decision grid revisited: the final calls, and the rework a call caused. From retrospective.json on the data branch.
import { computed } from "vue";

import { useLive } from "../composables/useLive";
import { decisionsRevisited } from "../src/live/retro";
import DecisionsRevisitedView from "./DecisionsRevisitedView.vue";

const live = useLive();
const grid = computed(() => decisionsRevisited(live.value?.docs.retrospective));
</script>

<template>
  <DecisionsRevisitedView :grid="grid" />
</template>
