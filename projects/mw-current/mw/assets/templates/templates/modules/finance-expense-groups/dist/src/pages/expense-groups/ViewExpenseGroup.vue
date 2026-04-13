<script setup lang="ts">
import { computed, onUnmounted, watch } from 'vue';

import type { ExpenseGroup, ExpenseGroupVm } from 'models/finance/index.js';

import { useExpenseGroupsStore } from 'stores/finance/ExpenseGroups.js';

import useViewPage from 'composables/crud-pages/useViewPage/index.js';
import useFirebaseAuth from 'composables/useFirebaseAuth.js';

import ExpenseGroupEditor from 'components/ExpenseGroup/ExpenseGroupEditor.vue';
import ExpenseGroupViewer from 'components/ExpenseGroup/ExpenseGroupViewer.vue';

// Constants

const SCOPE_NAME = 'expense-groups-view-page';

// Private

const isActive = computed(() => $p.model.value?.isActive);

// Composables

const store = useExpenseGroupsStore();

const { hasRole } = useFirebaseAuth();

const $p = useViewPage<ExpenseGroup, ExpenseGroupVm>(SCOPE_NAME, true);

// Private Executions

// useReturnUrl
$p.backUrl.value = '../expense-groups';

// usePageFeatures
$p.hasDeleting.value = hasRole('manager');

// usePageData
$p.modelGetter.value = (docKey) => store.doc(docKey);
$p.viewModelGetter.value = (docKey) => store.docVm(docKey);
$p.updateModel.value = (payload) => store.updateDoc(payload);
$p.deleteModel.value = (payload) => store.deleteDoc(payload);

// usePageTitle
$p.modelNameField.value = 'name';

// usePageData - loadModel
void $p
  .loadModel((payload) => store.loadRealtimeDoc(payload))
  .then(() => {
    $p.ready.value = true;
  });

// Lifecycle Hooks

onUnmounted(() => {
  $p.releaseModel.value && $p.releaseModel.value();
});

// Watch

watch($p.editMode, () => {
  $p.hasMultiViews.value = false;
});

$p.watchViewer(isActive);
</script>

<template>
  <QPagePadding padding>
    <ViewPage :scope-name="SCOPE_NAME">
      <template #viewer>
        <ExpenseGroupViewer :scope-name="SCOPE_NAME" />
      </template>
      <template #editor>
        <ExpenseGroupEditor :scope-name="SCOPE_NAME" />
      </template>
    </ViewPage>
  </QPagePadding>
</template>
