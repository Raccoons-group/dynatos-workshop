<script setup lang="ts">
// The stand-up card for one group, placed as <StandupCard group="group-a" />.
import { computed } from "vue";

import { useLive } from "../composables/useLive";
import { groupLabel } from "../src/live/format";
import { standupCard } from "../src/live/standup";
import StandupCardView from "./StandupCardView.vue";

const props = defineProps<{ group: string }>();

const live = useLive();
const card = computed(() =>
  standupCard(Object.values(live.value?.groups ?? {}), props.group),
);
</script>

<template>
  <StandupCardView v-if="card" :card="card" />
  <p v-else class="rac-wall-empty">
    {{ groupLabel(group) }} hasn't opened its PR.
  </p>
</template>
