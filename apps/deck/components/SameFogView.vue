<script setup lang="ts">
// Renders the decision grid: a row per open point, a column per group. Strings go through {{ }} only.
import type { FogGrid } from "../src/live/fog";

defineProps<{ grid: FogGrid }>();
</script>

<template>
  <div
    v-if="grid.columns.length"
    class="rac-fog"
    :style="{ '--rac-cols': grid.columns.length }"
  >
    <span />
    <header
      v-for="column in grid.columns"
      :key="column.group"
      class="rac-fog-head"
    >
      <span class="rac-fog-name">{{ column.label }}</span>
      <span class="rac-gate" :class="{ 'rac-gate-passed': column.specReviewed }"
        >‖
        {{
          column.specReviewed
            ? `spec reviewed ${column.specReviewed}`
            : "spec not reviewed"
        }}</span
      >
    </header>

    <template v-for="row in grid.rows" :key="row.key">
      <span class="rac-fog-point">{{ row.title }}</span>
      <div
        v-for="cell in row.cells"
        :key="cell.group"
        class="rac-fog-cell"
        :class="`rac-call-${cell.call}`"
      >
        <span class="rac-call">{{ cell.call }}</span>
        <span class="rac-fog-line">{{ cell.line }}</span>
      </div>
    </template>

    <span class="rac-fog-point">Acceptance examples</span>
    <ul v-for="column in grid.columns" :key="column.group" class="rac-examples">
      <li
        v-for="(example, i) in column.examples"
        :key="i"
        :class="{ 'rac-example-tested': example.inTest }"
      >
        {{ example.example }}
      </li>
      <li v-if="!column.examples.length" class="rac-none">none yet</li>
    </ul>
  </div>
  <p v-else class="rac-wall-empty">
    The grid fills as each group pushes its spec.
  </p>
</template>
