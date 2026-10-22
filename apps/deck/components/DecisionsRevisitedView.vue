<script setup lang="ts">
// Renders the final decision grid: the seven points down the side, a column per group, and under a call the
// rework it caused after the checkpoint.
import type { RevisitedGrid } from "../src/live/retro";

defineProps<{ grid: RevisitedGrid | null }>();
</script>

<template>
  <div
    v-if="grid && grid.columns.length"
    class="rac-fog"
    :style="{ '--rac-cols': grid.columns.length }"
  >
    <span />
    <header v-for="c in grid.columns" :key="c.group" class="rac-fog-head">
      <span class="rac-fog-name">{{ c.label }}</span>
    </header>
    <template v-for="row in grid.rows" :key="row.key">
      <span class="rac-fog-point">{{ row.title }}</span>
      <div
        v-for="cell in row.cells"
        :key="cell.group"
        class="rac-fog-cell rac-revisited-cell"
        :class="`rac-call-${cell.call}`"
      >
        <span class="rac-call">{{ cell.call }}</span>
        <span class="rac-fog-line"
          >{{ cell.line }}
          <span v-if="cell.rework" class="rac-rework"
            >↺ {{ cell.rework }}</span
          ></span
        >
      </div>
    </template>
  </div>
  <p v-else class="rac-wall-empty">
    The final calls appear here once the coaches publish the retrospective.
  </p>
</template>
