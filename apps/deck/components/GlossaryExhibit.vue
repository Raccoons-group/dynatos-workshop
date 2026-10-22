<script setup lang="ts">
// This repo's own glossary (slide 19): one word per concept, and the words to avoid for it.
import { repoFile } from "../src/exhibits/files";
import { glossaryExhibit } from "../src/exhibits/parse";

const glossary = glossaryExhibit(repoFile(".scratch/workshop/GLOSSARY.md"));
</script>

<template>
  <div class="rac-exhibit rac-glossary">
    <section v-for="s in glossary.sections" :key="s.title">
      <p class="rac-exhibit-label">{{ s.title }}</p>
      <dl>
        <template v-for="t in s.terms" :key="t.term">
          <dt>{{ t.term }}</dt>
          <dd v-if="t.avoid.length">not {{ t.avoid.join(", ") }}</dd>
        </template>
      </dl>
      <p v-if="s.more" class="rac-file-more">+ {{ s.more }} more</p>
    </section>
  </div>
</template>
