<script setup lang="ts">
// Renders one review card per group: rounds, findings per bucket, the headline finding and CI.
import type { ReviewCard } from "../src/live/reviews";

defineProps<{ cards: ReviewCard[] }>();
</script>

<template>
  <div
    v-if="cards.length"
    class="rac-wall"
    :style="{ '--rac-cols': cards.length }"
  >
    <article
      v-for="card in cards"
      :key="card.group"
      class="rac-card rac-review-card"
    >
      <header class="rac-wall-head">
        <span class="rac-wall-name">{{ card.label }}</span>
        <span class="rac-ci" :class="`rac-ci-${card.ci}`">
          {{ card.ci === "none" ? "no CI yet" : `CI ${card.ci}` }}
        </span>
      </header>
      <p class="rac-review-rounds">{{ card.rounds }}</p>
      <ul v-if="card.buckets.length" class="rac-buckets">
        <li v-for="bucket in card.buckets" :key="bucket.name">
          <span class="rac-bucket-count">{{ bucket.count }}</span>
          <span class="rac-bucket-name">{{ bucket.name }}</span>
        </li>
      </ul>
      <p v-if="card.headline" class="rac-wall-now">{{ card.headline }}</p>
    </article>
  </div>
  <p v-else class="rac-wall-empty">No group has opened its PR yet.</p>
</template>
