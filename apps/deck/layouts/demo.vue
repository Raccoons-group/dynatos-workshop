<script setup lang="ts">
// A demo slide: the everyday slide in a narrower column, leaving the top right for the demo card, and the tag
// this segment restarts from in the bottom corner, so the driver can fall back without looking it up.
defineProps<{ kicker?: string; call?: "fixed" | "yours"; fallback?: string }>();
</script>

<template>
  <div class="slidev-layout rac-slide rac-default rac-demo-slide">
    <p v-if="kicker" class="rac-kicker">{{ kicker }}</p>
    <span v-if="call" class="rac-call-badge" :class="`rac-call-badge-${call}`">
      {{ call === "fixed" ? "Fixed" : "Your call" }}
    </span>
    <slot />
    <span v-if="fallback" class="rac-fallback">starts from {{ fallback }}</span>
    <RacFrame />
  </div>
</template>
