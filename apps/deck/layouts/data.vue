<script setup lang="ts">
// Title top-left, and a live view or exhibit filling the content band below it.
defineProps<{ kicker?: string }>();
</script>

<template>
  <div class="slidev-layout rac-slide rac-data">
    <p v-if="kicker" class="rac-kicker">{{ kicker }}</p>
    <slot />
    <RacFrame />
  </div>
</template>
