<script setup lang="ts">
// Renders the grid: the four rows down the side, the quick wins and the longer steps across. After the vote the
// winners stay bright and the rest fade. Strings go through {{ }} only.
import type { PlanGrid } from "../src/live/plan";

defineProps<{ grid: PlanGrid }>();
</script>

<template>
  <div class="rac-plan" :class="{ 'rac-plan-voted': grid.voted }">
    <p class="rac-exhibit-label">
      Action plan{{ grid.updated ? ` · ${grid.updated}` : "" }}
    </p>
    <div class="rac-plan-grid">
      <span />
      <span class="rac-plan-head">Quick win · within 2 weeks</span>
      <span class="rac-plan-head">Longer step · within 3 months</span>
      <template v-for="row in grid.rows" :key="row.thread">
        <div class="rac-plan-row">
          <span class="rac-plan-label">{{ row.label }}</span>
          <span v-if="row.draftedBy" class="rac-plan-by">{{
            row.draftedBy
          }}</span>
        </div>
        <template v-if="row.filled">
          <ul
            v-for="(cell, c) in [row.quickWins, row.longerSteps]"
            :key="c"
            class="rac-plan-cell"
          >
            <li
              v-for="(candidate, i) in cell"
              :key="i"
              :class="{ 'rac-plan-chosen': candidate.chosen }"
            >
              <span class="rac-plan-item">{{ candidate.item }}</span>
              <span v-if="candidate.why" class="rac-plan-why">{{
                candidate.why
              }}</span>
            </li>
          </ul>
        </template>
        <p v-else class="rac-plan-waiting">waiting for the draft</p>
      </template>
    </div>
  </div>
</template>
