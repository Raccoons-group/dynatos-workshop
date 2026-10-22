<script setup lang="ts">
// How each group drove its agent, side by side and never contrasted. From retrospective.json on the data branch.
import { computed } from "vue";

import { useLive } from "../composables/useLive";
import { drivingColumns } from "../src/live/retro";
import HowGroupsDroveView from "./HowGroupsDroveView.vue";

const live = useLive();
const columns = computed(() => drivingColumns(live.value?.docs.retrospective));
</script>

<template>
  <HowGroupsDroveView :columns="columns" />
</template>
