<script setup lang="ts">
// Renders each group's least-certain claim, and the group's correction once the coach has noted it.
import type { IsThisYouCard } from "../src/live/retro";
import ClaimSource from "./ClaimSource.vue";

defineProps<{ cards: IsThisYouCard[] }>();
</script>

<template>
  <div
    v-if="cards.length"
    class="rac-wall"
    :style="{ '--rac-cols': cards.length }"
  >
    <article v-for="c in cards" :key="c.group" class="rac-card rac-retro-card">
      <span class="rac-wall-name">{{ c.label }}</span>
      <p class="rac-wall-now">{{ c.claim }}</p>
      <ClaimSource :of="c" />
      <p v-if="c.correction" class="rac-correction">
        <span class="rac-exhibit-label">You said</span>{{ c.correction }}
      </p>
      <p v-else class="rac-correction rac-none">Yes or no?</p>
    </article>
  </div>
  <p v-else class="rac-wall-empty">
    The claims appear here once the coaches publish the retrospective.
  </p>
</template>
