<script setup lang="ts">
import type { MemberLite } from 'models/<%= prompts.tasksNamespace %>/index.js';

const { icon, size = undefined } = defineProps<{
  members: MemberLite[];
  icon?: boolean;
  size?: string;
}>();
</script>

<template>
  <template v-for="(member, index) in members" :key="member.id">
    <ObjectLink
      color="primary"
      :icon="icon ? 'fal fa-user' : undefined"
      :label="member.fullName"
      :size="size"
      :to="`/team/member/${member.id}`"
    />
    <template v-if="index < members.length - 1">, </template>
  </template>
</template>
