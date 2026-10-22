<script setup lang="ts">
// Renders the wall: one card per group, side by side.
import type { WallCard } from "../src/live/wall";
import WallCardView from "./WallCardView.vue";

defineProps<{ cards: WallCard[] }>();
</script>

<template>
  <div
    v-if="cards.length"
    class="rac-wall"
    :style="{ '--rac-cols': cards.length }"
  >
    <WallCardView v-for="card in cards" :key="card.group" :card="card" />
  </div>
  <p v-else class="rac-wall-empty">
    The wall fills as each group opens its draft PR.
  </p>
</template>
