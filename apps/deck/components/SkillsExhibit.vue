<script setup lang="ts">
// This repo's `.agents/skills` laid onto the ribbon (slide 27). A station's skill lights once its folder exists,
// so the slide catches up with the library by itself.
import { repoFolder } from "../src/exhibits/files";
import { skillsExhibit } from "../src/exhibits/parse";

const skills = skillsExhibit(repoFolder(".agents/skills/"));
</script>

<template>
  <div class="rac-exhibit rac-skills">
    <p class="rac-exhibit-label">.agents/skills, station by station</p>
    <ol class="rac-skills-toolkit">
      <li v-for="s in skills.toolkit" :key="s.station">
        <span class="rac-stop-name">{{ s.station }}</span>
        <span
          v-for="skill in s.skills"
          :key="skill.name"
          class="rac-skill"
          :class="{ 'rac-skill-present': skill.present }"
          >{{ skill.name }}</span
        >
      </li>
    </ol>
    <p class="rac-exhibit-label">And the rest of the folder</p>
    <ul class="rac-skills-others">
      <li v-for="s in skills.others" :key="s.name">
        <span class="rac-skill rac-skill-present">{{ s.name }}</span>
        <span class="rac-skill-description">{{ s.description }}</span>
      </li>
    </ul>
  </div>
</template>
