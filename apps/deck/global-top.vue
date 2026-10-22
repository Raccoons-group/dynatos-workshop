<script setup lang="ts">
// On every slide: when the deck last heard from GitHub, so the room can see the deck is live.
import { computed } from "vue";

import { useLive } from "./composables/useLive";
import { lastUpdate } from "./src/live/prs";

const live = useLive();
const text = computed(() => lastUpdate(live.value?.meta ?? null));
</script>

<template>
  <p class="rac-updated">{{ text }}</p>
</template>
