<script setup lang="ts">
import { onUnmounted } from 'vue';

import { date, uid } from 'quasar';

import { expenseVmDefaultExtendedFields } from 'utils/finance/Expense/ExpenseDefaultExtendedFields';
import ExpenseStatus from 'utils/finance/Expense/ExpenseStatus.js';

import type { ExpenseVm, ProjectVm } from 'models/finance/index.js';

import { useProjectsStore } from 'stores/finance/Projects.js';

import { useExpenseNewPage } from 'composables/finance/expense/useExpenseEditPage.js';
import { projectExpenseEditPageComponentStore } from 'composables/finance/expense/useExpenseEditPage_ProjectExpenses.js';
import { requiredConfigEntries } from 'composables/useConfig.js';

import ExpenseEditor from 'components/Expense/ExpenseEditor.vue';
import ExpenseEditorMain_ProjectExpenses from 'components/Expense/ExpenseEditorMain_ProjectExpenses.vue';

// Constants

const SCOPE_NAME = 'project-expenses-new-page';

// Private

function initialModel(): ExpenseVm {
  $p.parentViewModel.value === null &&
    (() => {
      throw new Error('parentViewModel not specified');
    })();

  class StatusClass extends ExpenseStatus<ExpenseVm> {}

  return StatusClass.newContainer(
    StatusClass,
    {
      id: '_',
      isArchived: false,
      code: '',
      createDate: date.formatDate(new Date(), editDateFormat),
      issueDate: $p.parentViewModel.value.finishDate,
      isCompleted: false,
      isApproved: false,
      isRejected: false,
      isCancelled: false,
      isCapitalWithdrawal: false,
      isExternal: false,
      supplierExtraInfo: '',
      content: '',
      discount: '',
      vatPercent: '',
      vatableAmount: '',
      secondVatPercent: '',
      secondVatableAmount: '',
      vatAdjustment: '',
      notes: '',
      details: [],
      transactions: [],
      listKey: uid(),
      ...expenseVmDefaultExtendedFields(),
    },
    [],
  );
}

// Composables

const store = useProjectsStore();

const { editDateFormat } = requiredConfigEntries('editDateFormat');

const $p = useExpenseNewPage<true, ProjectVm>(SCOPE_NAME, true, true);

// Private Executions

// useEditor
$p.modelFindKeyField.value = 'code';

// useNewChildPage
$p.parentModelFindKeyField.value = 'urlFriendlyName';
$p.parentViewModelGetter.value = (parentDocKey) => store.docVm(parentDocKey);
$p.addChild.value = (child) => $p.pvm.value.expenses.push(child);
$p.updateParentModel.value = async (payload) => {
  await $p.viewModelBeforeCreate(payload);
  await store.updateDoc(payload);
};

$p.loadParentModel((payload) => store.loadRealtimeDoc(payload))
  .then(() => {
    $p.viewModel.value = initialModel();
    $p.viewUrl.value = `/project-expenses/${$p.pvm.value.urlFriendlyName}/`;
    $p.backUrl.value = `/projects/${$p.pvm.value.urlFriendlyName}`;
    $p.ready.value = true;
  })
  .catch(() => {
    throw new Error('[finance-project-expenses] Failed to load parent model');
  });

// Lifecycle Hooks

onUnmounted(() => {
  $p.releaseParentModel.value && $p.releaseParentModel.value();
});
</script>

<template>
  <QPagePadding padding>
    <NewPage :scope-name="SCOPE_NAME">
      <ExpenseEditor
        :expense-editor-main-component="
          projectExpenseEditPageComponentStore.projectExpenseEditorMain ||
          ExpenseEditorMain_ProjectExpenses
        "
        :scope-name="SCOPE_NAME"
      />
    </NewPage>
  </QPagePadding>
</template>
