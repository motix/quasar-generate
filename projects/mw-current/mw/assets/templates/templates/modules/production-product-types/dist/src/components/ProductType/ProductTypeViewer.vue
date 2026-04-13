<script setup lang="ts">
import type { ProductType, ProductTypeVm } from 'models/production/index.js';

import useViewPage from 'composables/crud-pages/useViewPage/index.js';

// Props

const props = defineProps<{ scopeName: string }>();

// Composables

const {
  // Auto sort
  freezed,
  m,
} = useViewPage<ProductType<never>, ProductTypeVm>(props.scopeName);
</script>

<template>
  <ExpandableCard
    avatar-color="primary"
    avatar-icon="fal fa-cards-blank"
    :caption="'#' + m.position"
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
