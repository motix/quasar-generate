<script setup lang="ts">
import { onMounted, ref } from 'vue';

import type { Member } from 'models/membership/index.js';

import { findMemberByUid } from 'services/admin/team.js';

// Props

const props = defineProps<{ uid: string }>();

// Emit

const emit = defineEmits<{
  loaded: [];
}>();

// Data

const memberLoading = ref(true);
const member = ref<Member | null>(null);

// Lifecycle Hooks

onMounted(async () => {
  member.value = (await findMemberByUid(props.uid)) || null;
  memberLoading.value = false;

  setTimeout(() => {
    emit('loaded');
  }, 2500);
});
</script>

<template>
  <FadeTransition>
    <q-spinner v-if="memberLoading" color="primary" size="2em" :thickness="2" />
    <ObjectLink
      v-else-if="member"
      color="primary"
      :label="member.fullName"
      :to="`/team/member/${member.id}`"
    >
      <template #icon>
        <q-avatar class="q-mr-sm" size="md">
          <q-img :src="member.photoUrl" />
        </q-avatar>
      </template>
    </ObjectLink>
    <div v-else class="q-py-xs text-muted">Member unavailable</div>
  </FadeTransition>
</template>
