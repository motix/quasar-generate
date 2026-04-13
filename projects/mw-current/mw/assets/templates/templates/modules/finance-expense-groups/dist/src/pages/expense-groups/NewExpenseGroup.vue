<script setup lang="ts">
import { nextTick } from 'vue';

import type { ExpenseGroupVm } from 'models/finance/index.js';

import { useExpenseGroupsStore } from 'stores/finance/ExpenseGroups.js';

import useNewPage from 'composables/crud-pages/useNewPage/index.js';

import ExpenseGroupEditor from 'components/ExpenseGroup/ExpenseGroupEditor.vue';

// Constants

const SCOPE_NAME = 'expense-groups-new-page';

// Private

function initialModel(): ExpenseGroupVm {
  return {
    isActive: true,
    name: '',
    description: '',
  };
}

// Composables

const store = useExpenseGroupsStore();

const $p = useNewPage<ExpenseGroupVm>(SCOPE_NAME, true);

// Private Executions

// usePageStatus
void nextTick(() => {
  $p.ready.value = true;
});

// usePageData
$p.viewModel.value = initialModel();
$p.createModel.value = (payload) => {
  payload.idField = 'name';
  return store.createDoc(payload);
};

// useEditor
$p.viewUrl.value = './';

// useNavigateToListPage
$p.backUrl.value = '../expense-groups';
</script>

<template>
  <QPagePadding padding>
    <NewPage :scope-name="SCOPE_NAME">
      <ExpenseGroupEditor :scope-name="SCOPE_NAME" />
    </NewPage>
  </QPagePadding>
</template>
