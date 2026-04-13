<script setup lang="ts">
import type { Member } from 'models/finance/index.js';

import useViewPage from 'composables/crud-pages/useViewPage/index.js';

// Props

const props = defineProps<{ scopeName: string }>();

// Composables

const {
  // Auto sort
  m,
} = useViewPage<Member, never>(props.scopeName);
</script>

<template>
  <ExpandableCard
    :avatar-icon="m.photoUrl ? undefined : 'fas fa-user-alt'"
    :avatar-image="m.photoUrl || undefined"
    class="q-mx-auto"
    header-background-color="primary"
    header-dark
    :title="m.fullName"
  >
    <template #side>
      <q-toggle
        v-model="m.isActive"
        checked-icon="fal fa-power-off"
        class="right-toggle"
        color="white"
        disable
        icon-color="primary"
        label="Active"
        left-label
        unchecked-icon="clear"
      />
    </template>
  </ExpandableCard>
</template>
