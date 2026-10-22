<script setup lang="ts">
// PROTOTYPE (ticket 09). Strings from the JSON only ever go through {{ }}, never v-html.
import { computed } from 'vue'
import { DECISIONS, examplesInTests, groupLabel, hhmm, hhmmss } from '../../shared/live-deck'
import { useLiveDeckData } from '../composables/useLiveDeckData'

const live = useLiveDeckData()
const groups = computed(() => Object.values(live.value?.groups ?? {}))
</script>

<template>
  <template v-if="live">
    <span class="rac-read">groups/*.json · read {{ hhmmss(live.readAt) }}</span>
    <div class="rac-grid" :style="{ '--rac-cols': Math.max(groups.length, 1) }">
      <span />
      <div v-for="o in groups" :key="o.group" class="rac-card rac-group">
        <div class="rac-group-name">
          {{ groupLabel(o.group) }}
          <span class="rac-ci" :class="`rac-ci-${o.facts.ci.result}`">CI {{ o.facts.ci.result }}</span>
        </div>
        <div class="rac-group-meta">
          {{ o.facts.phase }}<template v-if="o.facts.specReviewedAt"> · reviewed {{ hhmm(o.facts.specReviewedAt) }}</template><br />
          {{ o.judgements.acceptanceExamples.length }} examples · {{ examplesInTests(o) }} in tests · updated {{ hhmm(o.facts.lastPushAt) }}
        </div>
      </div>
      <template v-for="[key, label] in DECISIONS" :key="key">
        <span class="rac-rowlabel">{{ label }}</span>
        <div
          v-for="o in groups"
          :key="`${o.group}:${o.judgements.decisions[key].call}:${o.judgements.decisions[key].line}`"
          class="rac-card rac-cell"
        >
          <span class="rac-chip" :class="`rac-chip-${o.judgements.decisions[key].call}`">{{ o.judgements.decisions[key].call }}</span>
          <span class="rac-line" :class="{ 'rac-line-empty': !o.judgements.decisions[key].line }">{{ o.judgements.decisions[key].line || '—' }}</span>
        </div>
      </template>
    </div>
  </template>
</template>
