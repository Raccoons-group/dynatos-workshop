<script setup lang="ts">
// "Tonight": each group's last push and working-out checklist, live until the merge.
import { computed } from "vue";

import { useLive } from "../composables/useLive";
import { tonightRows } from "../src/live/tonight";
import TonightView from "./TonightView.vue";

const live = useLive();
const rows = computed(() =>
  tonightRows(Object.values(live.value?.groups ?? {})),
);
</script>

<template>
  <TonightView :rows="rows" />
</template>
