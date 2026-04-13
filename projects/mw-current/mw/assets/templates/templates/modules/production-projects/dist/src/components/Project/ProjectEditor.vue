<script setup lang="ts">
import { useTemplateRef } from 'vue';

import useProjectEditPage from 'composables/production/project/useProjectEditPage.js';
import useMultiViews from 'composables/useMultiViews.js';

import ItemsEditorCards from './cards/ItemsEditorCards.vue';
import ProjectEditorMain from './ProjectEditorMain.vue';
import ItemsEditorTable from './table/ItemsEditorTable.vue';

// Private

async function validateProjectEditor() {
  !projectEditorMainRef.value &&
    (() => {
      throw new Error('projectEditorMainRef not specified');
    })();

  const validations = [projectEditorMainRef.value.validate()];

  if (!$p.isNewPage($p)) {
    validations.push($p.validateItemsEditor());
  }

  const results = await Promise.all(validations);

  return !results.includes(false);
}

// Props

const props = defineProps<{ scopeName: string }>();

// Composables

const { isTableView, isCardsView } = useMultiViews();

const $p = useProjectEditPage(props.scopeName);
const {
  // Auto sort
  vm,
} = $p;

// Data

const projectEditorMainRef = useTemplateRef('projectEditorMain');

// Private Executions

$p.useCustomValidation(validateProjectEditor);
</script>

<template>
  <div class="q-gutter-y-lg">
    <ProjectEditorMain
      ref="projectEditorMain"
      :new-page="$p.isNewPage($p)"
      :scope-name="scopeName"
    />

    <FadeTransition v-if="!$p.isNewPage($p)">
      <div v-if="vm.items.length === 0" key="empty" class="text-center">
        <q-btn color="primary" label="Add Item" @click="$p.addItem" />
      </div>

      <ItemsEditorTable v-else-if="isTableView" key="tableView" :scope-name="scopeName" />

      <ItemsEditorCards v-else-if="isCardsView" key="cardsView" :scope-name="scopeName" />
    </FadeTransition>
  </div>
</template>
