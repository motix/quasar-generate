<script setup lang="ts">
import { onMounted, ref } from 'vue';

import type { UserAccount } from 'models/membership/index.js';

import { findUserAccount } from 'services/admin/accounts.js';

// Props

const props = defineProps<{ uid: string }>();

// Emit

const emit = defineEmits<{
  loaded: [];
}>();

// Data

const userAccountLoading = ref(true);
const userAccount = ref<UserAccount | null>(null);

// Lifecycle Hooks

onMounted(async () => {
  userAccount.value = (await findUserAccount(props.uid)) || null;
  userAccountLoading.value = false;

  setTimeout(() => {
    emit('loaded');
  }, 2500);
});
</script>

<template>
  <FadeTransition>
    <q-spinner v-if="userAccountLoading" color="primary" size="2em" :thickness="2" />
    <ObjectLink
      v-else-if="userAccount"
      color="primary"
      :label="userAccount.displayName || ''"
      :to="`/accounts/${userAccount.uid}`"
    >
      <template #icon>
        <q-avatar class="q-mr-sm" size="md">
          <q-img v-if="userAccount.photoUrl" :src="userAccount.photoUrl" />
          <q-icon v-else color="dark" name="fas fa-user-alt" size="lg" />
        </q-avatar>
      </template>
    </ObjectLink>
    <div v-else class="q-py-xs text-muted">User account unavailable</div>
  </FadeTransition>
</template>
