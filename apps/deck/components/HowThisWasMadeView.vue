<script setup lang="ts">
// Renders what the synthesis read and how sure it is, claim by claim.
import type { HowMade } from "../src/live/retro";

defineProps<{ made: HowMade | null }>();
</script>

<template>
  <div v-if="made" class="rac-retro rac-made">
    <section>
      <p class="rac-exhibit-label">What it read overnight</p>
      <ul class="rac-made-sources">
        <li v-for="s in made.sources" :key="s.kind">
          <strong>{{ s.kind }}</strong> {{ s.note }}
        </li>
      </ul>
    </section>
    <section>
      <p class="rac-exhibit-label">How sure it is</p>
      <ul class="rac-made-claims">
        <li
          v-for="c in made.claims"
          :key="c.confidence"
          :class="`rac-sure-${c.confidence}`"
        >
          <span class="rac-bucket-count">{{ c.count }}</span>
          <span class="rac-bucket-name">{{ c.confidence }}</span>
        </li>
      </ul>
      <p class="rac-made-rule">
        Every claim has its evidence. It's {{ made.status }}, and you correct
        it.
      </p>
    </section>
  </div>
  <p v-else class="rac-wall-empty">
    The retrospective appears here once the coaches publish it.
  </p>
</template>
