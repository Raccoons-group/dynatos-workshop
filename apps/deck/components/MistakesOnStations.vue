<script setup lang="ts">
// Where the agent went wrong: each mistake on the station where it started. From retrospective.json on the data branch.
import { computed } from "vue";

import { useLive } from "../composables/useLive";
import { mistakesOnStations } from "../src/live/retro";
import MistakesOnStationsView from "./MistakesOnStationsView.vue";

const live = useLive();
const stations = computed(() =>
  mistakesOnStations(live.value?.docs.retrospective),
);
</script>

<template>
  <MistakesOnStationsView :stations="stations" />
</template>
