<script setup lang="ts">
import type { Customer } from 'models/production/index.js';

import useViewPage from 'composables/crud-pages/useViewPage/index.js';

// Props

const props = defineProps<{ scopeName: string }>();

// Composables

const { m } = useViewPage<Customer, never>(props.scopeName);
</script>

<template>
  <ExpandableCard
    avatar-color="primary"
    avatar-icon="fal fa-user-crown"
    :caption="m.code"
    class="q-mx-auto"
    :title="m.name"
  >
    <template #side>
      <q-toggle
        v-model="m.isActive"
        checked-icon="fal fa-power-off"
        class="right-toggle"
        color="primary"
        disable
        label="Active"
        left-label
        unchecked-icon="clear"
      />
    </template>
  </ExpandableCard>
</template>
