<script setup lang="ts">
// Renders the team signals: a row per signal, a fixed column per group. Every cell is styled alike, with no
// colour scale and no totals. Strings go through {{ }} only.
import type { SignalsGrid } from "../src/live/signals";

defineProps<{ grid: SignalsGrid }>();
</script>

<template>
  <div
    v-if="grid.columns.length"
    class="rac-signals"
    :style="{ '--rac-cols': grid.columns.length }"
  >
    <span />
    <header
      v-for="column in grid.columns"
      :key="column.group"
      class="rac-signals-head"
    >
      {{ column.label }}
    </header>

    <template v-for="row in grid.rows" :key="row.key">
      <div class="rac-signal">
        <span class="rac-signal-title">{{ row.title }}</span>
        <span class="rac-signal-definition">{{ row.definition }}</span>
      </div>
      <div v-for="cell in row.cells" :key="cell.group" class="rac-signal-cell">
        <span v-if="cell.value" class="rac-signal-value">{{ cell.value }}</span>
        <span
          v-for="(line, i) in cell.lines"
          :key="i"
          class="rac-signal-line"
          >{{ line }}</span
        >
      </div>
    </template>
  </div>
  <p v-else class="rac-wall-empty">
    The team signals arrive overnight, after the last push.
  </p>
</template>
