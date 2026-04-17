<script setup lang="ts">
import type { Supplier, SupplierVm } from 'models/finance/index.js';

import useViewPage from 'composables/crud-pages/useViewPage/index.js';

// Props

const props = defineProps<{ scopeName: string }>();

// Composables

const {
  // Auto sort
  freezed,
  m,
} = useViewPage<Supplier, SupplierVm>(props.scopeName);
</script>

<template>
  <ExpandableCard
    avatar-color="primary"
    avatar-icon="fal fa-building"
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
        :disable="freezed"
        label="Active"
        left-label
        unchecked-icon="clear"
      />
    </template>
  </ExpandableCard>
</template>
