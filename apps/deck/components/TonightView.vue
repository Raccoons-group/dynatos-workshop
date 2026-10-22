<script setup lang="ts">
// Renders a row per group: the last push, then the working-out checklist, lit where the file has landed.
import type { TonightRow } from "../src/live/tonight";

defineProps<{ rows: TonightRow[] }>();
</script>

<template>
  <div v-if="rows.length" class="rac-tonight">
    <div v-for="row in rows" :key="row.group" class="rac-card rac-tonight-row">
      <span class="rac-wall-name">{{ row.label }}</span>
      <span class="rac-tonight-push">last push {{ row.lastPush }}</span>
      <ul class="rac-threads" aria-label="Working-out">
        <li
          v-for="item in row.items"
          :key="item.name"
          :class="{ 'rac-thread-lit': item.done }"
        >
          {{ item.name }}
        </li>
      </ul>
    </div>
  </div>
  <p v-else class="rac-wall-empty">No group has opened its PR yet.</p>
</template>
