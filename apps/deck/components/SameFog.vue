<script setup lang="ts">
// "Same fog, three readings", live: how each group has called the epic's seven open points so far.
import { computed } from "vue";

import { useLive } from "../composables/useLive";
import { fogGrid } from "../src/live/fog";
import SameFogView from "./SameFogView.vue";

const live = useLive();
const grid = computed(() => fogGrid(Object.values(live.value?.groups ?? {})));
</script>

<template>
  <SameFogView :grid="grid" />
</template>
