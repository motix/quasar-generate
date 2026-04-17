<script setup lang="ts">
import useMultiViews from 'composables/useMultiViews.js';

import ItemsViewerCardsWrapper from 'components/Project/cards/ItemsViewerCardsWrapper.vue';
import ProjectViewerCardsCollections from 'components/Project/cards/ProjectViewerCardsCollections.vue';
import ProjectViewerMain from 'components/Project/ProjectViewerMain.vue';
import ItemsViewerTableWrapper from 'components/Project/table/ItemsViewerTableWrapper.vue';
import ProjectViewerTableCollections from 'components/Project/table/ProjectViewerTableCollections.vue';

// Props

defineProps<{ scopeName: string }>();

// Composables

const { isTableView, isCardsView } = useMultiViews();
</script>

<template>
  <div class="q-gutter-y-lg">
    <ProjectViewerMain :scope-name="scopeName" />

    <FadeTransition>
      <div v-if="isTableView" key="tableView">
        <q-list class="rounded-list">
          <!-- Items -->

          <ItemsViewerTableWrapper :scope-name="scopeName" />

          <ProjectViewerTableCollections :scope-name="scopeName" />
        </q-list>
      </div>

      <div v-else-if="isCardsView" key="cardsView" class="q-gutter-y-lg">
        <!-- Items -->

        <ItemsViewerCardsWrapper :scope-name="scopeName" />

        <ProjectViewerCardsCollections :scope-name="scopeName" />
      </div>
    </FadeTransition>
  </div>
</template>
