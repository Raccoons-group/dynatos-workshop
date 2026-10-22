<script setup lang="ts">
// The repo's PR list, as the sync script last fetched it from GitHub (slide 6).
import { computed } from "vue";

import { useLive } from "../composables/useLive";
import { lastUpdate, prRows } from "../src/live/prs";

const live = useLive();
const rows = computed(() => prRows(live.value?.meta ?? null));
const updated = computed(() => lastUpdate(live.value?.meta ?? null));
</script>

<template>
  <div class="rac-exhibit rac-prs">
    <p class="rac-exhibit-label">Pull requests · {{ updated }}</p>
    <ol v-if="rows.length">
      <li v-for="pr in rows" :key="pr.number">
        <span class="rac-pr-number">#{{ pr.number }}</span>
        <span class="rac-pr-title">{{ pr.title }}</span>
        <span class="rac-pr-base">{{ pr.base }}</span>
        <span class="rac-status" :class="`rac-pr-${pr.state}`">{{
          pr.state
        }}</span>
      </li>
    </ol>
    <p v-else class="rac-none">
      No PRs yet. Run <code>pnpm live:sync</code> to fetch them.
    </p>
  </div>
</template>
