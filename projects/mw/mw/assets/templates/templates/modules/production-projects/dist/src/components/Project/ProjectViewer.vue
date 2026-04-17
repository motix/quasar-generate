<script setup lang="ts">
import { useProjectViewPage } from 'composables/production/project/useProjectEditPage.js';
import useMultiViews from 'composables/useMultiViews.js';

import ItemsViewerCards from './cards/ItemsViewerCards.vue';
import ProjectViewerMain from './ProjectViewerMain.vue';
import ItemsViewerTable from './table/ItemsViewerTable.vue';

// Props

const props = defineProps<{ scopeName: string }>();

// Composables

const { isTableView, isCardsView } = useMultiViews();

const {
  // Auto sort
  addItem,
  m,
  readonlyMode,
} = useProjectViewPage(props.scopeName);
</script>

<template>
  <div class="q-gutter-y-lg">
    <ProjectViewerMain :scope-name="scopeName" />

    <FadeTransition>
      <template v-if="m.items.length === 0">
        <div v-if="!readonlyMode" key="empty" class="text-center">
          <q-btn color="primary" label="Add Item" @click="addItem" />
        </div>
      </template>

      <ItemsViewerTable v-else-if="isTableView" key="tableView" :scope-name="scopeName" />

      <ItemsViewerCards v-else-if="isCardsView" key="cardsView" :scope-name="scopeName" />
    </FadeTransition>
  </div>
</template>
