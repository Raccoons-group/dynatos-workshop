<script setup lang="ts">
// The talk's everyday slide: the title top-left, then its text in one column. Frontmatter adds a kicker (the
// station or thread the slide belongs to) and a "Fixed" or "Your call" badge for the forks on the ribbon.
defineProps<{ kicker?: string; call?: "fixed" | "yours" }>();
</script>

<template>
  <div class="slidev-layout rac-slide rac-default">
    <p v-if="kicker" class="rac-kicker">{{ kicker }}</p>
    <span v-if="call" class="rac-call-badge" :class="`rac-call-badge-${call}`">
      {{ call === "fixed" ? "Fixed" : "Your call" }}
    </span>
    <slot />
    <RacFrame />
  </div>
</template>
