<script setup lang="ts">
// The demo's mini ribbon, for the talk slides only: never on the wall or in a group view. It appears a few
// minutes after `open-pr` opens the demo's draft PR, which is the room's first live update.
import { computed } from "vue";

import { useLive } from "../composables/useLive";
import { demoCard } from "../src/live/wall";
import WallCardView from "./WallCardView.vue";

const live = useLive();
const card = computed(() => demoCard(Object.values(live.value?.groups ?? {})));
</script>

<template>
  <div class="rac-demo">
    <WallCardView v-if="card" :card="card" />
    <p v-else class="rac-demo-waiting">
      The demo card appears once its draft PR is open.
    </p>
  </div>
</template>
