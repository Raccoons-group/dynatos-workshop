<script setup lang="ts">
// How this was made: what the overnight synthesis read, and how sure it is. From retrospective.json on the data branch.
import { computed } from "vue";

import { useLive } from "../composables/useLive";
import { howThisWasMade } from "../src/live/retro";
import HowThisWasMadeView from "./HowThisWasMadeView.vue";

const live = useLive();
const made = computed(() => howThisWasMade(live.value?.docs.retrospective));
</script>

<template>
  <HowThisWasMadeView :made="made" />
</template>
