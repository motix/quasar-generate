<script setup lang="ts">
import useMultiViews from 'composables/useMultiViews.js';

import SwitchViewButton from 'components/shared/SwitchViewButton.vue';

// Composables

const { isTableView, isCardsView } = useMultiViews();
</script>

<template>
  <q-page padding>
    <SwitchViewButton />

    <q-card v-if="isTableView">
      <q-card-section>
        Table View
        <div style="padding-bottom: 2000px"></div>
      </q-card-section>
    </q-card>

    <q-card v-if="isCardsView">
      <q-card-section>
        Cards View
        <div style="padding-bottom: 2000px"></div>
      </q-card-section>
    </q-card>

    <SwitchViewButton />
  </q-page>
</template>
