<script setup lang="ts">
// Three routes: a swimlane per group over the afternoon. From retrospective.json on the data branch.
import { computed } from "vue";

import { useLive } from "../composables/useLive";
import { routeLanes } from "../src/live/retro";
import RetroRoutesView from "./RetroRoutesView.vue";

const live = useLive();
const routes = computed(() => routeLanes(live.value?.docs.retrospective));
</script>

<template>
  <RetroRoutesView :routes="routes" />
</template>
