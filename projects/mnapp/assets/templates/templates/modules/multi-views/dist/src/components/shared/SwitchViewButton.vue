<script setup lang="ts">
import { Dark } from 'quasar';

import useMultiViews from 'composables/useMultiViews.js';

// Composables

const { isTableView, switchViewAndScroll } = useMultiViews();
</script>

<template>
  <q-btn
    :color="Dark.isActive ? 'grey-9' : 'grey-3'"
    :icon="`fal fa-${isTableView ? 'address-card' : 'table'}`"
    round
    text-color="primary"
    @click="switchViewAndScroll"
  >
    <TopTooltip>
      {{ isTableView ? 'Switch to Cards View' : 'Switch to Table View' }}
    </TopTooltip>
  </q-btn>
</template>
